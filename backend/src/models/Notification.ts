import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type NotificationType = 'chat_reply' | 'new_request' | 'ticket_status' | 'internal_note';
export type NotificationRole = 'admin' | 'author' | 'all';

export interface NotificationAttributes {
  id: string;
  user_id?: string | null; // specific recipient (e.g. author_id or admin_id)
  target_role: NotificationRole; // 'admin' | 'author' | 'all'
  type: NotificationType;
  title: string;
  message: string;
  ticket_id: string;
  ticket_number: string;
  sender_id?: string | null;
  sender_name?: string | null;
  sender_role?: 'admin' | 'author' | 'system';
  is_read: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface NotificationCreationAttributes
  extends Optional<NotificationAttributes, 'created_at' | 'updated_at' | 'is_read'> {}

export class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes {
  declare id: string;
  declare user_id: string | null;
  declare target_role: NotificationRole;
  declare type: NotificationType;
  declare title: string;
  declare message: string;
  declare ticket_id: string;
  declare ticket_number: string;
  declare sender_id: string | null;
  declare sender_name: string | null;
  declare sender_role: 'admin' | 'author' | 'system';
  declare is_read: boolean;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  toJSON(): any {
    const values: any = { ...this.get() };
    values.created_at = values.createdAt || values.created_at;
    values.updated_at = values.updatedAt || values.updated_at;
    return values;
  }
}

Notification.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    target_role: {
      type: DataTypes.ENUM('admin', 'author', 'all'),
      allowNull: false,
      defaultValue: 'all',
    },
    type: {
      type: DataTypes.ENUM('chat_reply', 'new_request', 'ticket_status', 'internal_note'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ticket_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ticket_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sender_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sender_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sender_role: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'system',
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
    underscored: true,
  }
);
