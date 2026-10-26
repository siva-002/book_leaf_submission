import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface BookAttributes {
  id: string; // book_id, e.g. BK001
  author_id: string;
  title: string;
  isbn: string;
  genre: string;
  publication_date: string | null;
  status: string; // 'Published & Live' | 'In Production - Cover Design' | 'In Production - Typesetting' etc.
  mrp: number | null;
  author_royalty_per_copy: number | null;
  total_copies_sold: number;
  total_royalty_earned: number;
  royalty_paid: number;
  royalty_pending: number;
  last_royalty_payout_date: string | null;
  print_partner: string | null;
  available_on: string[]; // parsed array or stringified JSON
  created_at?: Date;
  updated_at?: Date;
}

export interface BookCreationAttributes extends Optional<BookAttributes, 'created_at' | 'updated_at'> {}

export class Book extends Model<BookAttributes, BookCreationAttributes> implements BookAttributes {
  declare id: string;
  declare author_id: string;
  declare title: string;
  declare isbn: string;
  declare genre: string;
  declare publication_date: string | null;
  declare status: string;
  declare mrp: number | null;
  declare author_royalty_per_copy: number | null;
  declare total_copies_sold: number;
  declare total_royalty_earned: number;
  declare royalty_paid: number;
  declare royalty_pending: number;
  declare last_royalty_payout_date: string | null;
  declare print_partner: string | null;
  declare available_on: string[];

  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Book.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    author_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isbn: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    genre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    publication_date: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'In Production',
    },
    mrp: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    author_royalty_per_copy: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    total_copies_sold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_royalty_earned: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    royalty_paid: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    royalty_pending: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    last_royalty_payout_date: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    print_partner: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    available_on: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: 'books',
  }
);
