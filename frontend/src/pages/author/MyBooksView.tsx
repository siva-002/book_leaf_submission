import React from 'react';
import { Book, AuthorBooksSummary } from '../../types';
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  CheckCircle,
  Clock,
  DollarSign,
  Feather,
  FileText,
  Globe,
  Info,
  Layers,
  MessageSquare,
  Printer,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';

interface MyBooksViewProps {
  books: Book[];
  summary: AuthorBooksSummary | null;
  onRaiseQuery: (bookId: string) => void;
}

// Curated jewel tone color pairs for realistic book covers
const getCoverPalette = (genre: string, index: number) => {
  const palettes = [
    { bg: 'linear-gradient(145deg, #1e3a5f 0%, #0f1d30 100%)', accent: '#93c5fd', border: '#2563eb' }, // Literary Fiction / Poetry
    { bg: 'linear-gradient(145deg, #064e3b 0%, #022c22 100%)', accent: '#6ee7b7', border: '#059669' }, // Nature / Non-Fiction
    { bg: 'linear-gradient(145deg, #701a75 0%, #4a044e 100%)', accent: '#f0abfc', border: '#c026d3' }, // Memoirs / Romance
    { bg: 'linear-gradient(145deg, #78350f 0%, #451a03 100%)', accent: '#fde68a', border: '#d97706' }, // History / Philosophy
    { bg: 'linear-gradient(145deg, #1f2937 0%, #111827 100%)', accent: '#cbd5e1', border: '#4b5563' }, // Crime / Thriller
  ];
  return palettes[index % palettes.length];
};

export const MyBooksView: React.FC<MyBooksViewProps> = ({ books, summary, onRaiseQuery }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Royalty & Distribution Summary Bar */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {/* Total Catalog Titles */}
          <div
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              borderLeft: '4px solid #0f766e',
              background: '#ffffff',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#f0fdfa',
                color: '#0f766e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #ccfbf1',
              }}
            >
              <BookOpen size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Published Catalog
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                {summary.totalBooks} {summary.totalBooks === 1 ? 'Title' : 'Titles'}
              </div>
              <div style={{ fontSize: '0.725rem', color: '#0f766e', fontWeight: 600 }}>
                {summary.publishedBooks} Live in Market • {summary.inProductionBooks} In Production
              </div>
            </div>
          </div>

          {/* Total Global Copies Sold */}
          <div
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              borderLeft: '4px solid #2563eb',
              background: '#ffffff',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #dbeafe',
              }}
            >
              <ShoppingBag size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Copies Sold
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                {summary.totalCopiesSold.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.725rem', color: '#2563eb', fontWeight: 600 }}>
                Across Amazon, Flipkart & BookLeaf Store
              </div>
            </div>
          </div>

          {/* Total Royalty Earned */}
          <div
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              borderLeft: '4px solid #059669',
              background: '#ffffff',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #a7f3d0',
              }}
            >
              <TrendingUp size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Accumulated Royalties
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                ₹{summary.totalRoyaltyEarned.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.725rem', color: '#059669', fontWeight: 600 }}>
                80% Net Author Profit Share
              </div>
            </div>
          </div>

          {/* Pending Settlement */}
          <div
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              borderLeft: '4px solid #b47820',
              background: '#ffffff',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#fef7ed',
                color: '#b47820',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #fed7aa',
              }}
            >
              <Clock size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Pending Settlement
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#b47820', lineHeight: 1.2 }}>
                ₹{summary.royaltyPending.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.725rem', color: '#9a3412', fontWeight: 600 }}>
                {summary.royaltyPending > 0 && summary.royaltyPending < 1000
                  ? 'Accumulating toward ₹1,000 cycle threshold'
                  : `₹${summary.royaltyPaid.toLocaleString()} paid so far`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Royalty Policy Callout Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          padding: '14px 20px',
          backgroundColor: '#faf8f5',
          border: '1px solid #e7e3da',
          borderRadius: '12px',
          fontSize: '0.825rem',
          color: '#475569',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Info size={18} color="#0f766e" />
          <span>
            <strong>BookLeaf Royalty Terms:</strong> Authors receive 80% of net profits on all direct and distributed sales. Settlements are calculated quarterly and dispatched to your bank within 45 days of quarter close for balances of ₹1,000 or above. Sub-threshold balances roll over securely.
          </span>
        </div>
      </div>

      {/* Catalog Title */}
      <div>
        <h2 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', margin: '0 0 4px 0' }}>
          Author Catalog & Distribution Ledger
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
          Manage your published titles, inspect verified ISBN barcodes, and monitor live channel availability.
        </p>
      </div>

      {/* Book Cards with Realistic Book Jackets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {books.map((book, idx) => {
          const isLive = book.status === 'Published & Live';
          const coverStyle = getCoverPalette(book.genre, idx);
          const isUnderThreshold = book.royalty_pending > 0 && book.royalty_pending < 1000;

          return (
            <div
              key={book.id}
              className="card card-hover"
              style={{
                display: 'grid',
                gridTemplateColumns: '170px minmax(0, 1fr) 260px',
                gap: '24px',
                padding: '24px',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                borderRadius: '18px',
              }}
            >
              {/* Realistic Book Jacket Mockup */}
              <div
                className="book-cover-mockup"
                style={{
                  background: coverStyle.bg,
                  minHeight: '230px',
                }}
              >
                <div className="book-spine-line" />
                
                <div>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.75, fontWeight: 700 }}>
                    BookLeaf Editions
                  </div>
                  <h4
                    className="font-serif"
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      lineHeight: 1.25,
                      margin: '12px 0 6px 0',
                      color: '#ffffff',
                    }}
                  >
                    {book.title}
                  </h4>
                  <div style={{ fontSize: '0.7rem', color: coverStyle.accent, fontStyle: 'italic' }}>
                    {book.genre}
                  </div>
                </div>

                <div>
                  <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: '8px' }} />
                  <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', opacity: 0.85 }}>
                    {book.isbn}
                  </div>
                </div>
              </div>

              {/* Center Column: Production, Publishing Details & Channels */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span
                    className={`badge ${isLive ? 'badge-status-resolved' : 'badge-status-inprogress'}`}
                    style={{ fontSize: '0.725rem', padding: '4px 10px' }}
                  >
                    {isLive ? <CheckCircle size={12} /> : <Clock size={12} />}
                    {book.status}
                  </span>

                  <span
                    style={{
                      fontSize: '0.725rem',
                      fontFamily: 'var(--font-mono)',
                      color: '#64748b',
                      backgroundColor: '#f1f5f9',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontWeight: 600,
                    }}
                  >
                    ISBN: {book.isbn}
                  </span>

                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    MRP: <strong style={{ color: '#0f172a' }}>₹{book.mrp || 299}</strong>
                  </span>
                </div>

                <div>
                  <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 600, color: '#0f172a', margin: '0 0 6px 0' }}>
                    {book.title}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                    Genre: <strong>{book.genre}</strong> • Released:{' '}
                    {book.publication_date ? new Date(book.publication_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Proofing Phase'}
                  </div>
                </div>

                {/* Print partner & Distribution tags */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.775rem', color: '#64748b' }}>
                  {book.print_partner && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Printer size={14} color="#0f766e" />
                      <span>Certified Print Partner: <strong>{book.print_partner}</strong> (80 GSM Natural White)</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Globe size={14} color="#0f766e" />
                    <span>
                      Available Channels:{' '}
                      {book.available_on && book.available_on.length > 0 ? (
                        <strong style={{ color: '#0f172a' }}>{book.available_on.join(' • ')}</strong>
                      ) : (
                        <span style={{ color: '#d97706', fontStyle: 'italic' }}>Pending Global Marketplace Ingestion</span>
                      )}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '4px' }}>
                  <button
                    onClick={() => onRaiseQuery(book.id)}
                    className="btn-secondary"
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.8rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      borderRadius: '8px',
                    }}
                  >
                    <MessageSquare size={13} color="#0f766e" />
                    <span>Inquire About This Title</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Financial Performance Ledger Card */}
              <div
                style={{
                  backgroundColor: '#faf8f5',
                  borderRadius: '14px',
                  padding: '18px 20px',
                  border: '1px solid #e7e3da',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Sales & Royalty Ledger
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #ede9e1', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Copies Distributed</span>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{book.total_copies_sold.toLocaleString()}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #ede9e1', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Royalty Per Copy</span>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>₹{book.author_royalty_per_copy || 50}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #ede9e1', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Earned</span>
                  <strong style={{ fontSize: '0.95rem', color: '#059669' }}>₹{book.total_royalty_earned.toLocaleString()}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '2px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#b47820', fontWeight: 600 }}>Pending Payout</span>
                  <strong style={{ fontSize: '1.05rem', color: '#b47820' }}>₹{book.royalty_pending.toLocaleString()}</strong>
                </div>

                {isUnderThreshold && (
                  <div style={{ fontSize: '0.7rem', color: '#9a3412', backgroundColor: '#fef7ed', padding: '6px 8px', borderRadius: '6px', border: '1px solid #fed7aa', lineHeight: 1.4 }}>
                    Safe roll-over: Balance under ₹1,000 threshold will disburse upon reaching payout limit in the quarterly cycle.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
