import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { sequelize } from '../config/database';
import { Ticket, TicketMessage, User, Book, Notification } from '../models';
import { aiService } from '../services/aiService';
import { emitToAdmins, emitToTicket, emitToAuthor } from '../socket/socketHandler';


export const getAllTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, category, priority, search, sortBy, sortOrder } = req.query;

    const whereClause: any = {};

    if (status && status !== 'all') {
      if (status === 'active' || status === 'unresolved') {
        whereClause.status = { [Op.in]: ['Open', 'In Progress'] };
      } else {
        whereClause.status = status;
      }
    }
    if (category && category !== 'all') {
      whereClause.category = category;
    }
    if (priority && priority !== 'all') {
      whereClause.priority = priority;
    }
    if (search) {
      const searchStr = String(search).trim();
      whereClause[Op.or] = [
        { subject: { [Op.like]: `%${searchStr}%` } },
        { ticket_number: { [Op.like]: `%${searchStr}%` } },
        { description: { [Op.like]: `%${searchStr}%` } },
      ];
    }

    // Sorting: Active tickets (Open, In Progress) first by priority, then resolved/closed at bottom
    let order: any[] = [
      [
        sequelize.literal(`CASE 
          WHEN "Ticket"."status" = 'Open' THEN 1 
          WHEN "Ticket"."status" = 'In Progress' THEN 2 
          WHEN "Ticket"."status" = 'Resolved' THEN 3 
          ELSE 4 
        END`),
        'ASC',
      ],
      [
        sequelize.literal(`CASE 
          WHEN "Ticket"."priority" = 'Critical' THEN 1 
          WHEN "Ticket"."priority" = 'High' THEN 2 
          WHEN "Ticket"."priority" = 'Medium' THEN 3 
          ELSE 4 
        END`),
        'ASC',
      ],
      ['created_at', 'ASC'], // Oldest first within same priority
    ];

    if (sortBy) {
      const dir = (String(sortOrder || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC') as 'ASC' | 'DESC';
      order = [[String(sortBy), dir]];
    }

    const tickets = await Ticket.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'phone', 'city'],
        },
        {
          model: Book,
          as: 'book',
          attributes: ['id', 'title', 'isbn', 'status', 'total_copies_sold', 'royalty_pending'],
        },
      ],
      order,
    });

    // Urgency indicators: tickets older than 24 hours that are still Open
    const now = Date.now();
    const enrichedTickets = tickets.map((t) => {
      const ageHours = (now - new Date(t.created_at).getTime()) / (1000 * 3600);
      const isUrgentBacklog = t.status === 'Open' && ageHours > 24;
      return {
        ...t.toJSON(),
        ageHours: Math.round(ageHours),
        isUrgentBacklog,
      };
    });

    res.json({
      success: true,
      count: enrichedTickets.length,
      tickets: enrichedTickets,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching admin ticket queue.',
    });
  }
};

export const getTicketById = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticketId = req.params.ticketId as string;

    const ticket = await Ticket.findByPk(ticketId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'phone', 'city', 'joined_date'],
          include: [
            {
              model: Book,
              as: 'books',
              attributes: ['id', 'title', 'status', 'total_copies_sold', 'total_royalty_earned', 'royalty_pending'],
            },
          ],
        },
        {
          model: Book,
          as: 'book',
        },
        {
          model: TicketMessage,
          as: 'messages', // Admins CAN see internal notes!
        },
      ],
      order: [[{ model: TicketMessage, as: 'messages' }, 'created_at', 'ASC']],
    });

    if (!ticket) {
      res.status(404).json({
        success: false,
        error: 'Ticket not found.',
      });
      return;
    }

    // Return ticket details immediately in milliseconds without blocking the page load
    res.json({
      success: true,
      ticket,
      aiDraft: ticket.ai_draft_response || null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching ticket details.',
    });
  }
};

export const updateTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticketId = req.params.ticketId as string;
    const { status, category, priority, assigned_to } = req.body;

    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      res.status(404).json({ success: false, error: 'Ticket not found.' });
      return;
    }

    let modified = false;
    const oldStatus = ticket.status;

    if (status && status !== ticket.status) {
      ticket.status = status;
      modified = true;
    }

    if (category && category !== ticket.category) {
      ticket.category = category;
      ticket.category_overridden = true;
      modified = true;
    }

    if (priority && priority !== ticket.priority) {
      ticket.priority = priority;
      ticket.priority_overridden = true;
      modified = true;
    }

    if (assigned_to !== undefined && assigned_to !== ticket.assigned_to) {
      ticket.assigned_to = assigned_to;
      modified = true;
    }

    if (modified) {
      await ticket.save();
      const ticketJson = ticket.toJSON();
      emitToAdmins('ticket:updated', ticketJson);
      emitToAuthor(ticket.author_id, 'ticket:updated', ticketJson);
      emitToTicket(ticket.id, 'ticket:updated', ticketJson);

      // If status changed, generate a notification for the author
      if (status && status !== oldStatus) {
        try {
          const statusNotif = await Notification.create({
            id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            user_id: ticket.author_id,
            target_role: 'author',
            type: 'ticket_status',
            title: `Ticket ${ticket.ticket_number} Updated`,
            message: `Your ticket status is now "${ticket.status}".`,
            ticket_id: ticket.id,
            ticket_number: ticket.ticket_number,
            sender_id: req.user!.id,
            sender_name: req.user!.name,
            sender_role: 'admin',
            is_read: false,
          });
          emitToAuthor(ticket.author_id, 'notification:new', statusNotif.toJSON());
        } catch (notifErr) {
          console.error('[Notification] Error creating status update notification:', notifErr);
        }
      }
    }

    res.json({
      success: true,
      message: 'Ticket updated successfully.',
      ticket,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error updating ticket.',
    });
  }
};

export const addInternalNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminUser = req.user!;
    const ticketId = req.params.ticketId as string;
    const { note } = req.body;

    if (!note || !note.trim()) {
      res.status(400).json({ success: false, error: 'Note content cannot be empty.' });
      return;
    }

    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      res.status(404).json({ success: false, error: 'Ticket not found.' });
      return;
    }

    const internalMessage = await TicketMessage.create({
      id: `NOTE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ticket_id: ticket.id,
      sender_id: adminUser.id,
      sender_name: adminUser.name,
      sender_role: 'admin',
      message: note.trim(),
      is_internal_note: true, // INTERNAL NOTE ONLY
    });

    emitToAdmins('ticket:internal_note', { ticketId: ticket.id, note: internalMessage });

    try {
      const noteNotif = await Notification.create({
        id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user_id: null,
        target_role: 'admin',
        type: 'internal_note',
        title: `Internal Note on ${ticket.ticket_number}`,
        message: `${adminUser.name}: "${note.trim().slice(0, 100)}"`,
        ticket_id: ticket.id,
        ticket_number: ticket.ticket_number,
        sender_id: adminUser.id,
        sender_name: adminUser.name,
        sender_role: 'admin',
        is_read: false,
      });
      emitToAdmins('notification:new', noteNotif.toJSON());
    } catch (notifErr) {
      console.error('[Notification] Error creating note notification:', notifErr);
    }

    res.status(201).json({
      success: true,
      message: 'Internal note saved.',
      note: internalMessage,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error saving internal note.',
    });
  }
};

export const sendOfficialResponse = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminUser = req.user!;
    const ticketId = req.params.ticketId as string;
    const { message, is_ai_drafted, markResolved, attachment_name, attachment_url } = req.body;

    if ((!message || !message.trim()) && !attachment_url) {
      res.status(400).json({ success: false, error: 'Official response message or attachment is required.' });
      return;
    }

    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      res.status(404).json({ success: false, error: 'Ticket not found.' });
      return;
    }

    const trimmedMessage = (message || '').trim() || (attachment_name ? `Attached: ${attachment_name}` : 'Attachment');

    // Prevent duplicate rapid submissions within 2 seconds
    const recentDuplicate = await TicketMessage.findOne({
      where: {
        ticket_id: ticket.id,
        sender_id: adminUser.id,
        message: trimmedMessage,
      },
      order: [['created_at', 'DESC']],
    });

    if (recentDuplicate) {
      const msgTime = (recentDuplicate as any).createdAt || (recentDuplicate as any).created_at;
      if (msgTime) {
        const timeDiff = Date.now() - new Date(msgTime).getTime();
        if (timeDiff < 3000) {
          res.status(200).json({
            success: true,
            message: 'Official response already submitted.',
            sentMessage: recentDuplicate.toJSON(),
            ticketStatus: ticket.status,
          });
          return;
        }
      }
    }

    const officialMessage = await TicketMessage.create({
      id: `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ticket_id: ticket.id,
      sender_id: adminUser.id,
      sender_name: adminUser.name,
      sender_role: 'admin',
      message: trimmedMessage,
      is_internal_note: false, // Visible to author!
      is_ai_drafted: Boolean(is_ai_drafted),
      attachment_name: attachment_name || null,
      attachment_url: attachment_url || null,
    });

    // Update ticket status
    ticket.status = markResolved ? 'Resolved' : 'In Progress';
    if (!ticket.assigned_to) {
      ticket.assigned_to = adminUser.name;
    }
    await ticket.save();

    const messageJson = officialMessage.toJSON();
    const ticketJson = ticket.toJSON();

    // Create Notification record for author
    let notifJson = null;
    try {
      const notification = await Notification.create({
        id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user_id: ticket.author_id,
        target_role: 'author',
        type: 'chat_reply',
        title: `Reply from Operations on ${ticket.ticket_number}`,
        message: `${adminUser.name}: "${trimmedMessage.slice(0, 120)}"`,
        ticket_id: ticket.id,
        ticket_number: ticket.ticket_number,
        sender_id: adminUser.id,
        sender_name: adminUser.name,
        sender_role: 'admin',
        is_read: false,
      });
      notifJson = notification.toJSON();
    } catch (notifErr) {
      console.error('[Notification] Error creating reply notification:', notifErr);
    }

    // Real-time broadcast for INSTANT reflection without reload:
    // 1. To ticket room (active chat window for author or admin)
    emitToTicket(ticket.id, 'message:new', messageJson);
    emitToTicket(ticket.id, 'ticket:updated', ticketJson);

    // 2. To author room (so author receives message & notification immediately wherever they are)
    emitToAuthor(ticket.author_id, 'message:new', messageJson);
    emitToAuthor(ticket.author_id, 'ticket:updated', ticketJson);
    if (notifJson) {
      emitToAuthor(ticket.author_id, 'notification:new', notifJson);
    }

    // 3. To admins room (so all admin dashboards & queue sync in real time)
    emitToAdmins('message:new', messageJson);
    emitToAdmins('ticket:updated', ticketJson);


    res.status(201).json({
      success: true,
      message: 'Official response sent to author successfully.',
      sentMessage: messageJson,
      ticketStatus: ticket.status,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error sending official response.',
    });
  }
};

export const getQueueAnalytics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const tickets = await Ticket.findAll();

    const total = tickets.length;
    const openCount = tickets.filter((t) => t.status === 'Open').length;
    const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
    const activeCount = openCount + inProgressCount;
    // Strictly count Resolved cases so count matches the Resolved filter 1-to-1
    const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;
    const closedCount = tickets.filter((t) => t.status === 'Closed').length;
    // Critical count strictly measures active / unresolved critical issues needing operational intervention
    const criticalCount = tickets.filter(
      (t) => t.priority === 'Critical' && t.status !== 'Resolved' && t.status !== 'Closed'
    ).length;

    const categoryBreakdown: Record<string, number> = {};
    for (const t of tickets) {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + 1;
    }

    res.json({
      success: true,
      analytics: {
        total,
        activeCount,
        openCount,
        inProgressCount,
        resolvedCount,
        closedCount,
        criticalCount,
        categoryBreakdown,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching analytics.',
    });
  }
};
