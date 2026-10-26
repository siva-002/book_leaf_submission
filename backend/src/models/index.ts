import { sequelize } from '../config/database';
import { User } from './User';
import { Book } from './Book';
import { Ticket } from './Ticket';
import { TicketMessage } from './TicketMessage';
import { Notification } from './Notification';

// User <-> Book
User.hasMany(Book, { foreignKey: 'author_id', as: 'books' });
Book.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

// User <-> Ticket
User.hasMany(Ticket, { foreignKey: 'author_id', as: 'tickets' });
Ticket.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

// Book <-> Ticket
Book.hasMany(Ticket, { foreignKey: 'book_id', as: 'tickets' });
Ticket.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });

// Ticket <-> TicketMessage
Ticket.hasMany(TicketMessage, { foreignKey: 'ticket_id', as: 'messages' });
TicketMessage.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });

// User <-> Notification
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Ticket <-> Notification
Ticket.hasMany(Notification, { foreignKey: 'ticket_id', as: 'notifications' });
Notification.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });

export { sequelize, User, Book, Ticket, TicketMessage, Notification };

