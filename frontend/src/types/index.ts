export type UserRole = 'author' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  city?: string | null;
  joined_date?: string | null;
  books?: Book[];
}

export interface Book {
  id: string;
  author_id: string;
  title: string;
  isbn: string;
  genre: string;
  publication_date: string | null;
  status: string;
  mrp: number | null;
  author_royalty_per_copy: number | null;
  total_copies_sold: number;
  total_royalty_earned: number;
  royalty_paid: number;
  royalty_pending: number;
  last_royalty_payout_date: string | null;
  print_partner: string | null;
  available_on: string[];
  created_at?: string;
  updated_at?: string;
}

export type TicketCategory =
  | 'Royalty & Payments'
  | 'ISBN & Metadata Issues'
  | 'Printing & Quality'
  | 'Distribution & Availability'
  | 'Book Status & Production Updates'
  | 'General Inquiry';

export type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'author' | 'admin' | 'system';
  message: string;
  is_internal_note: boolean;
  is_ai_drafted?: boolean;
  attachment_name?: string | null;
  attachment_url?: string | null;
  created_at?: string;
}

export interface Ticket {
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
  created_at: string;
  updated_at: string;
  author?: User;
  book?: Book | null;
  messages?: TicketMessage[];
  ageHours?: number;
  isUrgentBacklog?: boolean;
}

export interface AuthorBooksSummary {
  totalBooks: number;
  publishedBooks: number;
  inProductionBooks: number;
  totalCopiesSold: number;
  totalRoyaltyEarned: number;
  royaltyPaid: number;
  royaltyPending: number;
}

export interface QueueAnalytics {
  total: number;
  activeCount: number;
  openCount: number;
  inProgressCount: number;
  resolvedCount: number;
  closedCount: number;
  criticalCount: number;
  categoryBreakdown: Record<string, number>;
}

export type NotificationType = 'chat_reply' | 'new_request' | 'ticket_status' | 'internal_note';

export interface Notification {
  id: string;
  user_id?: string | null;
  target_role: 'admin' | 'author' | 'all';
  type: NotificationType;
  title: string;
  message: string;
  ticket_id: string;
  ticket_number: string;
  sender_id?: string | null;
  sender_name?: string | null;
  sender_role?: 'admin' | 'author' | 'system';
  is_read: boolean;
  created_at: string;
  updated_at?: string;
}

