import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { sequelize, User, Book, Ticket, TicketMessage, Notification } from '../models';


interface RawBook {
  book_id: string;
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
}

interface RawAuthor {
  author_id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  joined_date: string;
  books: RawBook[];
}

interface RawData {
  authors: RawAuthor[];
}

export const seedDatabase = async (force = false): Promise<void> => {
  await sequelize.sync({ force });

  const existingAuthorsCount = await User.count();
  if (existingAuthorsCount > 0 && !force) {
    console.log('[Seed] Database already seeded. Skipping initial seeding.');
    return;
  }

  console.log('[Seed] Starting database seeding from bookleaf_sample_data.json...');

  // Locate backend/data/bookleaf_sample_data.json
  let sampleDataPath = path.resolve(__dirname, '../../data/bookleaf_sample_data.json');
  if (!fs.existsSync(sampleDataPath)) {
    sampleDataPath = path.resolve(process.cwd(), 'data/bookleaf_sample_data.json');
  }

  if (!fs.existsSync(sampleDataPath)) {
    throw new Error(`Sample data file not found at: ${sampleDataPath}`);
  }

  const fileData = fs.readFileSync(sampleDataPath, 'utf-8');
  const parsedData: RawData = JSON.parse(fileData);

  const defaultAuthorPassword = await bcrypt.hash('password123', 10);
  const defaultAdminPassword = await bcrypt.hash('admin123', 10);

  // 1. Create Admin Account
  await User.create({
    id: 'ADMIN001',
    name: 'BookLeaf Support Ops',
    email: 'admin@bookleaf.com',
    password: defaultAdminPassword,
    role: 'admin',
    phone: '+91-11-4000-0000',
    city: 'Delhi',
    joined_date: '2022-01-01',
  });

  // 2. Create Authors & Books
  for (const authorData of parsedData.authors) {
    await User.create({
      id: authorData.author_id,
      name: authorData.name,
      email: authorData.email,
      password: defaultAuthorPassword,
      role: 'author',
      phone: authorData.phone,
      city: authorData.city,
      joined_date: authorData.joined_date,
    });

    for (const b of authorData.books) {
      await Book.create({
        id: b.book_id,
        author_id: authorData.author_id,
        title: b.title,
        isbn: b.isbn,
        genre: b.genre,
        publication_date: b.publication_date,
        status: b.status,
        mrp: b.mrp,
        author_royalty_per_copy: b.author_royalty_per_copy,
        total_copies_sold: b.total_copies_sold,
        total_royalty_earned: b.total_royalty_earned,
        royalty_paid: b.royalty_paid,
        royalty_pending: b.royalty_pending,
        last_royalty_payout_date: b.last_royalty_payout_date,
        print_partner: b.print_partner,
        available_on: b.available_on,
      });
    }
  }

  // 3. Seed Realistic Demonstration Tickets
  const initialTickets = [
    {
      id: 'TKT-1001',
      ticket_number: '#1001',
      author_id: 'AUTH009', // Kavita Deshmukh
      book_id: 'BK016', // The Nagpur Notebooks (Pending ₹850 < ₹1000 threshold)
      subject: 'Royalty payout inquiry - pending ₹850 not credited',
      description:
        'I noticed that my book "The Nagpur Notebooks" has ₹850 in pending royalties, but my bank account has not received any transfer yet. Could you clarify when this will be credited?',
      category: 'Royalty & Payments' as const,
      ai_category: 'Royalty & Payments' as const,
      category_overridden: false,
      priority: 'Medium' as const,
      ai_priority: 'Medium' as const,
      priority_overridden: false,
      ai_reasoning: 'Standard royalty status inquiry. Pending amount ₹850 is under ₹1,000 threshold and rolls over to next quarter.',
      status: 'Open' as const,
      created_at: new Date(Date.now() - 36 * 3600 * 1000), // 36 hours ago
    },
    {
      id: 'TKT-1002',
      ticket_number: '#1002',
      author_id: 'AUTH002', // Rohit Kapoor
      book_id: 'BK004', // Startup Sutra
      subject: 'URGENT: ISBN on Amazon does not match physical book barcode',
      description:
        'A reader pointed out that the Amazon listing shows a different ISBN than what is printed on the physical copy of Startup Sutra. This is causing confusion with reader reviews and sales tracking. Please resolve this immediately!',
      category: 'ISBN & Metadata Issues' as const,
      ai_category: 'ISBN & Metadata Issues' as const,
      category_overridden: false,
      priority: 'Critical' as const,
      ai_priority: 'Critical' as const,
      priority_overridden: false,
      ai_reasoning: 'Severe catalog metadata discrepancy. Escalated to Critical priority with 48h resolution target.',
      status: 'In Progress' as const,
      assigned_to: 'BookLeaf Support Ops',
      created_at: new Date(Date.now() - 48 * 3600 * 1000), // 48 hours ago
    },
    {
      id: 'TKT-1003',
      ticket_number: '#1003',
      author_id: 'AUTH007', // Sneha Kulkarni
      book_id: 'BK013', // Midnight in Mysore (In Production - Cover Design)
      subject: 'Status of Midnight in Mysore cover design stage',
      description:
        'Hello team, my third book "Midnight in Mysore" has been listed as "In Production - Cover Design" for a few weeks now. Could you please share the current estimated timeline or any sample concepts?',
      category: 'Book Status & Production Updates' as const,
      ai_category: 'Book Status & Production Updates' as const,
      category_overridden: false,
      priority: 'Medium' as const,
      ai_priority: 'Medium' as const,
      priority_overridden: false,
      ai_reasoning: 'Author inquiring about publishing milestone progress. Stage: Cover Design.',
      status: 'Open' as const,
      created_at: new Date(Date.now() - 12 * 3600 * 1000),
    },
    {
      id: 'TKT-1004',
      ticket_number: '#1004',
      author_id: 'AUTH004', // Vikram Joshi
      book_id: 'BK007', // The Last Monsoon
      subject: 'Book showing as "Currently Unavailable" on Amazon India',
      description:
        'My poetry collection "The Last Monsoon" is showing as Currently Unavailable on Amazon India today. Friends trying to buy it cannot place orders. Please check what is wrong.',
      category: 'Distribution & Availability' as const,
      ai_category: 'Distribution & Availability' as const,
      category_overridden: false,
      priority: 'High' as const,
      ai_priority: 'High' as const,
      priority_overridden: false,
      ai_reasoning: 'Platform availability issue. Typically a stock sync delay resolvable within 24–48 hours.',
      status: 'In Progress' as const,
      assigned_to: 'BookLeaf Support Ops',
      created_at: new Date(Date.now() - 18 * 3600 * 1000),
    },
    {
      id: 'TKT-1005',
      ticket_number: '#1005',
      author_id: 'AUTH001', // Priya Sharma
      book_id: null, // General Account Query
      subject: 'Updating registered bank details and author bio',
      description:
        'I recently changed my primary bank account. Could you please guide me on how to update my account number for future royalty settlements? Also, can I update my author bio across Amazon and Flipkart?',
      category: 'General Inquiry' as const,
      ai_category: 'General Inquiry' as const,
      category_overridden: false,
      priority: 'Low' as const,
      ai_priority: 'Low' as const,
      priority_overridden: false,
      ai_reasoning: 'Routine account maintenance and metadata update inquiry.',
      status: 'Resolved' as const,
      assigned_to: 'BookLeaf Support Ops',
      created_at: new Date(Date.now() - 72 * 3600 * 1000),
    },
  ];

  for (const t of initialTickets) {
    await Ticket.create(t);
  }

  // Seed sample messages for TKT-1002 (ISBN issue)
  await TicketMessage.create({
    id: 'MSG-001',
    ticket_id: 'TKT-1002',
    sender_id: 'AUTH002',
    sender_name: 'Rohit Kapoor',
    sender_role: 'author',
    message: 'A reader pointed out that the Amazon listing shows a different ISBN than what is printed on the physical copy of Startup Sutra. This is causing confusion with reader reviews and sales tracking. Please resolve this immediately!',
    is_internal_note: false,
  });

  await TicketMessage.create({
    id: 'MSG-002',
    ticket_id: 'TKT-1002',
    sender_id: 'ADMIN001',
    sender_name: 'BookLeaf Support Ops',
    sender_role: 'admin',
    message: 'Checked internal catalog: BookLeaf ISBN is 978-93-5XXXX-04-2. Amazon vendor portal seems to have merged an old ISBN draft during inventory upload. Contacting Amazon vendor support.',
    is_internal_note: true, // INTERNAL NOTE
  });

  await TicketMessage.create({
    id: 'MSG-003',
    ticket_id: 'TKT-1002',
    sender_id: 'ADMIN001',
    sender_name: 'BookLeaf Support Ops',
    sender_role: 'admin',
    message: `Dear Rohit Kapoor,\n\nThank you for alerting us to this issue immediately. We treat any ISBN discrepancy as a critical priority.\n\nEvery book published through BookLeaf receives a unique ISBN under our publisher imprint. We have confirmed the correct ISBN (978-93-5XXXX-04-2) and escalated the listing correction directly to our cataloging and vendor central team. We have requested an emergency re-sync on Amazon India and expect this to reflect within 24 to 48 hours.\n\nWe will actively track this and inform you as soon as the correct barcode is verified live.\n\nWarm regards,\nBookLeaf Author Support Team`,
    is_internal_note: false,
    is_ai_drafted: true,
  });

  console.log(`[Seed] Seeded successfully!`);
  console.log(`[Seed] 1 Admin created: admin@bookleaf.com (password: admin123)`);
  console.log(`[Seed] ${parsedData.authors.length} Authors created with password: password123`);
  console.log(`[Seed] 18 Books & 5 Demonstration Tickets populated.`);
};
