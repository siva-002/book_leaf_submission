import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type TicketCategory =
  | 'Royalty & Payments'
  | 'ISBN & Metadata Issues'
  | 'Printing & Quality'
  | 'Distribution & Availability'
  | 'Book Status & Production Updates'
  | 'General Inquiry';

export type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface TicketAttributes {
  id: string;
  ticket_number: string;
  author_id: string;
  book_id: string | null;
  subject: string;
  description: string;
  category: TicketCategory;
  ai_category?: TicketCategory | null;
  category_overridden?: boolean;
  priority: TicketPriority;
  ai_priority?: TicketPriority | null;
  priority_overridden?: boolean;
  ai_reasoning?: string | null;
  ai_draft_response?: string | null;
  status: TicketStatus;
  assigned_to?: string | null;
  attachment_name?: string | null;
  attachment_url?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface TicketCreationAttributes extends Optional<TicketAttributes, 'created_at' | 'updated_at'> {}

export class Ticket extends Model<TicketAttributes, TicketCreationAttributes> implements TicketAttributes {
  declare id: string;
  declare ticket_number: string;
  declare author_id: string;
  declare book_id: string | null;
  declare subject: string;
  declare description: string;
  declare category: TicketCategory;
  declare ai_category: TicketCategory | null;
  declare category_overridden: boolean;
  declare priority: TicketPriority;
  declare ai_priority: TicketPriority | null;
  declare priority_overridden: boolean;
  declare ai_reasoning: string | null;
  declare ai_draft_response: string | null;
  declare status: TicketStatus;
  declare assigned_to: string | null;
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

Ticket.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    ticket_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    author_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    book_id: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'books',
        key: 'id',
      },
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'General Inquiry',
    },
    ai_category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category_overridden: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Medium',
    },
    ai_priority: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    priority_overridden: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    ai_reasoning: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ai_draft_response: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Open',
    },
    assigned_to: {
      type: DataTypes.STRING,
      allowNull: true,
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
    tableName: 'tickets',
  }
);
