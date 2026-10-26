import crypto from 'crypto';
import { Request, Response } from 'express';
import { Book, Ticket, TicketMessage, User, Notification } from '../models';
import { aiService } from '../services/aiService';
import { emitToAdmins, emitToTicket, emitToAuthor } from '../socket/socketHandler';


export const getMyBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const authorId = req.user!.id;
    const books = await Book.findAll({
      where: { author_id: authorId },
      order: [['publication_date', 'DESC NULLS LAST']],
    });

    // Compute aggregated metrics for dashboard summary cards
    const summary = books.reduce(
      (acc, b) => {
        acc.totalBooks += 1;
        acc.totalCopiesSold += b.total_copies_sold || 0;
        acc.totalRoyaltyEarned += b.total_royalty_earned || 0;
        acc.royaltyPaid += b.royalty_paid || 0;
        acc.royaltyPending += b.royalty_pending || 0;
        if (b.status === 'Published & Live') acc.publishedBooks += 1;
        else acc.inProductionBooks += 1;
        return acc;
      },
      {
        totalBooks: 0,
        publishedBooks: 0,
        inProductionBooks: 0,
        totalCopiesSold: 0,
        totalRoyaltyEarned: 0,
        royaltyPaid: 0,
        royaltyPending: 0,
      }
    );

    res.json({
      success: true,
      summary,
      books,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching author books.',
    });
  }
};

export const getMyTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const authorId = req.user!.id;

    const tickets = await Ticket.findAll({
      where: { author_id: authorId },
      include: [
        {
          model: Book,
          as: 'book',
          attributes: ['id', 'title', 'isbn', 'status'],
        },
        {
          model: TicketMessage,
          as: 'messages',
          where: { is_internal_note: false }, // CRITICAL: Authors MUST NOT see internal notes!
          required: false,
        },
      ],
      order: [
        ['created_at', 'DESC'],
        [{ model: TicketMessage, as: 'messages' }, 'created_at', 'ASC'],
      ],
    });

    res.json({
      success: true,
      tickets,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching author tickets.',
    });
  }
};

export const submitTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const authorId = req.user!.id;
    const authorName = req.user!.name;
    const { book_id, subject, description, attachment_name, attachment_url } = req.body;

    if (!subject || !subject.trim() || !description || !description.trim()) {
      res.status(400).json({
        success: false,
        error: 'Subject and detailed description are required to raise a ticket.',
      });
      return;
    }

    let bookTitle: string | undefined;
    let book = null;
    if (book_id && book_id !== 'general') {
      book = await Book.findOne({ where: { id: book_id, author_id: authorId } });
      if (!book) {
        res.status(400).json({
          success: false,
          error: 'The selected book does not exist or does not belong to your account.',
        });
        return;
      }
      bookTitle = book.title;
    }

    // Step 1: AI Auto-Classification and Priority Scoring
    const aiResult = await aiService.classifyAndPrioritize(subject, description, bookTitle);

    // Generate unique ticket ID using standard UUID v4
    const ticketId = crypto.randomUUID();
    const count = await Ticket.count();
    const ticketNumber = `#${1001 + count}`;

    // Step 2: Create Ticket Record
    const ticket = await Ticket.create({
      id: ticketId,
      ticket_number: ticketNumber,
      author_id: authorId,
      book_id: book ? book.id : null,
      subject: subject.trim(),
      description: description.trim(),
      category: aiResult.category,
      ai_category: aiResult.category,
      category_overridden: false,
      priority: aiResult.priority,
      ai_priority: aiResult.priority,
      priority_overridden: false,
      ai_reasoning: aiResult.reasoning,
      status: 'Open',
      attachment_name: attachment_name || null,
      attachment_url: attachment_url || null,
    });

    // Step 3: Create initial author message
    const initialMessage = await TicketMessage.create({
      id: `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ticket_id: ticket.id,
      sender_id: authorId,
      sender_name: authorName,
      sender_role: 'author',
      message: description.trim(),
      is_internal_note: false,
      attachment_name: attachment_name || null,
      attachment_url: attachment_url || null,
    });

    // Step 4: Real-time broadcast and notification creation
    const ticketPayload = {
      ...ticket.toJSON(),
      author: { id: authorId, name: authorName },
      book: book ? { id: book.id, title: book.title } : null,
    };

    emitToAdmins('ticket:created', {
      ticket: ticketPayload,
      message: initialMessage,
    });

    try {
      // 1. Notify Admins about new request
      const adminNotif = await Notification.create({
        id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user_id: null,
        target_role: 'admin',
        type: 'new_request',
        title: `New Support Request ${ticket.ticket_number}`,
        message: `${authorName} raised a request: "${subject.trim()}" (${ticket.priority} priority, ${ticket.category})`,
        ticket_id: ticket.id,
        ticket_number: ticket.ticket_number,
        sender_id: authorId,
        sender_name: authorName,
        sender_role: 'author',
        is_read: false,
      });
      emitToAdmins('notification:new', adminNotif.toJSON());

      // 2. Notify Author confirming ticket submission
      const authorNotif = await Notification.create({
        id: `NOTIF-${Date.now() + 1}-${Math.floor(Math.random() * 1000)}`,
        user_id: authorId,
        target_role: 'author',
        type: 'new_request',
        title: `Request Submitted ${ticket.ticket_number}`,
        message: `Your request "${subject.trim()}" has been received and routed to our support team.`,
        ticket_id: ticket.id,
        ticket_number: ticket.ticket_number,
        sender_id: 'system',
        sender_name: 'BookLeaf Operations',
        sender_role: 'system',
        is_read: false,
      });
      emitToAuthor(authorId, 'notification:new', authorNotif.toJSON());
    } catch (notifErr) {
      console.error('[Notification] Error creating ticket submission notifications:', notifErr);
    }


    res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully.',
      ticket: {
        ...ticket.toJSON(),
        messages: [initialMessage],
        book: book ? { id: book.id, title: book.title, isbn: book.isbn } : null,
      },
    });

    // Step 5: Asynchronously pre-generate AI draft response in background (non-blocking)
    aiService
      .generateDraftResponse({
        ticket,
        author: { id: authorId, name: authorName, email: req.user!.email },
        book: book ? book.toJSON() : null,
        conversationHistory: [initialMessage.toJSON()],
      })
      .then(async (draftResult) => {
        ticket.ai_draft_response = draftResult.draft;
        await ticket.save();
        emitToAdmins('ticket:draft_ready', { ticketId: ticket.id, draft: draftResult.draft });
      })
      .catch((err) => {
        console.warn('[Background Draft] Non-blocking generation notice:', err?.message || err);
      });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error submitting ticket.',
    });
  }
};

export const replyToTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const authorId = req.user!.id;
    const authorName = req.user!.name;
    const ticketId = req.params.ticketId as string;
    const { message, attachment_name, attachment_url } = req.body;

    if ((!message || !message.trim()) && !attachment_url) {
      res.status(400).json({
        success: false,
        error: 'Reply message or attachment is required.',
      });
      return;
    }

    const ticket = await Ticket.findOne({
      where: { id: ticketId, author_id: authorId },
    });

    if (!ticket) {
      res.status(404).json({
        success: false,
        error: 'Ticket not found or unauthorized access.',
      });
      return;
    }

    const trimmedMessage = (message || '').trim() || (attachment_name ? `Attached: ${attachment_name}` : 'Attachment');

    // Prevent duplicate rapid submissions within 2 seconds
    const recentDuplicate = await TicketMessage.findOne({
      where: {
        ticket_id: ticket.id,
        sender_id: authorId,
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
            message: recentDuplicate.toJSON(),
          });
          return;
        }
      }
    }

    const newMessage = await TicketMessage.create({
      id: `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ticket_id: ticket.id,
      sender_id: authorId,
      sender_name: authorName,
      sender_role: 'author',
      message: trimmedMessage,
      is_internal_note: false,
      attachment_name: attachment_name || null,
      attachment_url: attachment_url || null,
    });

    // If resolved, re-open to In Progress
    if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
      ticket.status = 'In Progress';
      await ticket.save();
    }

    const messageJson = newMessage.toJSON();
    const ticketJson = ticket.toJSON();

    // Create Notification record for Admins
    try {
      const adminNotif = await Notification.create({
        id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user_id: null,
        target_role: 'admin',
        type: 'chat_reply',
        title: `Author Replied on ${ticket.ticket_number}`,
        message: `${authorName}: "${trimmedMessage.slice(0, 120)}"`,
        ticket_id: ticket.id,
        ticket_number: ticket.ticket_number,
        sender_id: authorId,
        sender_name: authorName,
        sender_role: 'author',
        is_read: false,
      });
      emitToAdmins('notification:new', adminNotif.toJSON());
    } catch (notifErr) {
      console.error('[Notification] Error creating reply notification for admins:', notifErr);
    }

    // Real-time broadcast for INSTANT reflection across all connected clients:
    // 1. To ticket room (active chat window for author or admin)
    emitToTicket(ticket.id, 'message:new', messageJson);
    emitToTicket(ticket.id, 'ticket:updated', ticketJson);

    // 2. To admins room (dashboard and queue views sync immediately)
    emitToAdmins('message:new', messageJson);
    emitToAdmins('ticket:updated', ticketJson);

    // 3. To author room (sync all tabs/views for the author)
    emitToAuthor(authorId, 'message:new', messageJson);
    emitToAuthor(authorId, 'ticket:updated', ticketJson);

    res.status(201).json({
      success: true,
      message: messageJson,
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error sending reply.',
    });
  }
};
