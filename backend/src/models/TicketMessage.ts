import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface TicketMessageAttributes {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'author' | 'admin' | 'system';
  message: string;
  is_internal_note: boolean; // Not visible to author if true
  is_ai_drafted?: boolean;
  attachment_name?: string | null;
  attachment_url?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface TicketMessageCreationAttributes
  extends Optional<TicketMessageAttributes, 'created_at' | 'updated_at' | 'is_ai_drafted'> {}

export class TicketMessage
  extends Model<TicketMessageAttributes, TicketMessageCreationAttributes>
  implements TicketMessageAttributes {
  declare id: string;
  declare ticket_id: string;
  declare sender_id: string;
  declare sender_name: string;
  declare sender_role: 'author' | 'admin' | 'system';
  declare message: string;
  declare is_internal_note: boolean;
  declare is_ai_drafted: boolean;
  declare attachment_name: string | null;
  declare attachment_url: string | null;

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

TicketMessage.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    ticket_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'tickets',
        key: 'id',
      },
    },
    sender_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sender_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sender_role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_internal_note: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_ai_drafted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    attachment_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    attachment_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'ticket_messages',
  }
);
