import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Notification } from '../models';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { type, unreadOnly } = req.query;

    let roleWhere: any;
    if (user.role === 'admin') {
      roleWhere = {
        [Op.or]: [
          { target_role: 'admin' },
          { target_role: 'all' },
          { user_id: user.id },
        ],
      };
    } else {
      roleWhere = {
        [Op.or]: [
          { user_id: user.id },
          { target_role: 'all' },
        ],
      };
    }

    const whereClause: any = {
      ...roleWhere,
    };

    if (type && type !== 'all') {
      whereClause.type = type;
    }

    if (unreadOnly === 'true') {
      whereClause.is_read = false;
    }

    const notifications = await Notification.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: 60,
    });

    // Compute unread count for the user
    const unreadCount = await Notification.count({
      where: {
        ...roleWhere,
        is_read: false,
      },
    });

    res.json({
      success: true,
      notifications: notifications.map((n) => n.toJSON()),
      unreadCount,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching notifications.',
    });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const notifId = req.params.id as string;

    const notif = await Notification.findByPk(notifId);
    if (!notif) {
      res.status(404).json({ success: false, error: 'Notification not found.' });
      return;
    }

    // Permission check
    if (user.role !== 'admin' && notif.user_id && notif.user_id !== user.id) {
      res.status(403).json({ success: false, error: 'Unauthorized to update this notification.' });
      return;
    }

    notif.is_read = true;
    await notif.save();

    res.json({
      success: true,
      message: 'Notification marked as read.',
      notification: notif.toJSON(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error marking notification as read.',
    });
  }
};

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;

    let roleWhere: any;
    if (user.role === 'admin') {
      roleWhere = {
        [Op.or]: [
          { target_role: 'admin' },
          { target_role: 'all' },
          { user_id: user.id },
        ],
      };
    } else {
      roleWhere = {
        [Op.or]: [
          { user_id: user.id },
          { target_role: 'all' },
        ],
      };
    }

    await Notification.update(
      { is_read: true },
      {
        where: {
          ...roleWhere,
          is_read: false,
        },
      }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error updating notifications.',
    });
  }
};

export const clearNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;

    let roleWhere: any;
    if (user.role === 'admin') {
      roleWhere = {
        [Op.or]: [
          { target_role: 'admin' },
          { target_role: 'all' },
          { user_id: user.id },
        ],
      };
    } else {
      roleWhere = {
        [Op.or]: [
          { user_id: user.id },
          { target_role: 'all' },
        ],
      };
    }

    await Notification.destroy({
      where: roleWhere,
    });

    res.json({
      success: true,
      message: 'Notifications cleared.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error clearing notifications.',
    });
  }
};
