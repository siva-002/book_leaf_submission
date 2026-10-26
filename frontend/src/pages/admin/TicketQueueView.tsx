import React from 'react';
import { Ticket, TicketCategory, TicketPriority, TicketStatus } from '../../types';
import { StatusPill, PriorityPill, CategoryPill } from '../../components/StatusBadge';
import {
  AlertCircle,
  Clock,
  Filter,
  Search,
  User,
  ChevronRight,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface TicketQueueViewProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  priorityFilter: string;
  setPriorityFilter: (p: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const TicketQueueView: React.FC<TicketQueueViewProps> = ({
  tickets,
  onSelectTicket,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  priorityFilter,
  setPriorityFilter,
  searchTerm,
  setSearchTerm,
}) => {
  const quickFilters = [
    { label: 'All Inquiries', cat: 'all', prio: 'all', status: 'all' },
    { label: '🚨 Active Critical', cat: 'all', prio: 'Critical', status: 'active' },
    { label: '💰 Royalty & Settlements', cat: 'Royalty & Payments', prio: 'all', status: 'all' },
    { label: '🏷️ ISBN & Barcodes', cat: 'ISBN & Metadata Issues', prio: 'all', status: 'all' },
    { label: '🖨️ Printing & Proofing', cat: 'Printing & Quality', prio: 'all', status: 'all' },
    { label: '🚚 Channel Distribution', cat: 'Distribution & Availability', prio: 'all', status: 'all' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Search & Select Filter Card */}
      <div
        className="card"
        style={{
          padding: '20px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', gridColumn: 'span 2' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '40px', borderRadius: '10px' }}
            placeholder="Search by ticket #, author name, book title, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ borderRadius: '10px' }}
          >
            <option value="all">Lifecycle: All Statuses</option>
            <option value="active">Status: Active / Unresolved (Open & In Progress)</option>
            <option value="Open">Status: Open (Unassigned)</option>
            <option value="In Progress">Status: In Progress</option>
            <option value="Resolved">Status: Resolved</option>
            <option value="Closed">Status: Closed / Cancelled</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select
            className="form-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ borderRadius: '10px' }}
          >
            <option value="all">Priority: All Tiers</option>
            <option value="Critical">Critical Priority</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ borderRadius: '10px' }}
          >
            <option value="all">Category: All Topics</option>
            <option value="Royalty & Payments">Royalty & Payments</option>
            <option value="ISBN & Metadata Issues">ISBN & Metadata Issues</option>
            <option value="Printing & Quality">Printing & Quality</option>
            <option value="Distribution & Availability">Distribution & Availability</option>
            <option value="Book Status & Production Updates">Book Status & Production Updates</option>
            <option value="General Inquiry">General Inquiry</option>
          </select>
        </div>
      </div>

      {/* Quick Category Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Quick Filter:
        </span>
        {quickFilters.map((q) => {
          const isActive =
            categoryFilter === q.cat &&
            priorityFilter === q.prio &&
            (q.status ? statusFilter === q.status : true);
          return (
            <button
              key={q.label}
              type="button"
              onClick={() => {
                setCategoryFilter(q.cat);
                setPriorityFilter(q.prio);
                if (q.status) {
                  setStatusFilter(q.status);
                }
              }}
              style={{
                padding: '5px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: isActive ? '#0f766e' : '#e2e8f0',
                backgroundColor: isActive ? '#f0fdfa' : '#ffffff',
                color: isActive ? '#0f766e' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {q.label}
            </button>
          );
        })}
      </div>

      {/* Ticket List Stream */}
      {tickets.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '48px',
            textAlign: 'center',
            color: '#64748b',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
          }}
        >
          <Filter size={36} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
          <h3 className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
            No tickets match your active filters
          </h3>
          <p style={{ fontSize: '0.85rem', margin: '0 0 16px' }}>Try resetting category or search criteria.</p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('all');
              setCategoryFilter('all');
              setPriorityFilter('all');
              setSearchTerm('');
            }}
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tickets.map((t) => {
            const isResolved = t.status === 'Resolved' || t.status === 'Closed';
            const isUnresolvedCritical = t.priority === 'Critical' && !isResolved;
            const isBacklogUrgent = t.isUrgentBacklog && !isResolved;

            return (
              <div
                key={t.id}
                onClick={() => onSelectTicket(t)}
                className="card card-hover"
                style={{
                  padding: '18px 24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '20px',
                  backgroundColor: isResolved ? '#fafafa' : '#ffffff',
                  borderLeft: isResolved
                    ? '4px solid #10b981' // Calming green for resolved tickets
                    : isUnresolvedCritical
                    ? '4px solid #ef4444' // Red alert border only for active critical
                    : isBacklogUrgent
                    ? '4px solid #f59e0b'
                    : '4px solid #0f766e',
                  borderRadius: '14px',
                  opacity: isResolved ? 0.92 : 1,
                }}
              >
                {/* Left: Metadata, Identifiers & Subject */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f766e', fontFamily: 'var(--font-mono)' }}>
                      {t.ticket_number}
                    </span>

                    <StatusPill status={t.status} />
                    <PriorityPill priority={t.priority} overridden={t.priority_overridden} />
                    <CategoryPill category={t.category} overridden={t.category_overridden} />

                    {isBacklogUrgent && (
                      <span
                        className="badge"
                        style={{ backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', fontSize: '0.7rem' }}
                        title="Unresolved for over 24 hours"
                      >
                        <AlertCircle size={11} />
                        Pending &gt;24h
                      </span>
                    )}

                    {t.ai_draft_response && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '0.675rem',
                          fontWeight: 700,
                          color: '#0f766e',
                          backgroundColor: '#f0fdfa',
                          padding: '1px 7px',
                          borderRadius: '4px',
                          border: '1px solid #ccfbf1',
                        }}
                      >
                        <Sparkles size={10} />
                        Policy Draft Ready
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>
                    {t.subject}
                  </h3>

                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#1e293b', fontWeight: 600 }}>
                      <User size={13} color="#0f766e" />
                      {t.author?.name || 'Author'} ({t.author?.city || 'India'})
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569' }}>
                      <BookOpen size={12} />
                      {t.book ? t.book.title : 'General Account / Payout Query'}
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      Received {new Date(t.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} ({t.ageHours || 0}h ago)
                    </span>
                    {t.assigned_to && (
                      <>
                        <span>•</span>
                        <span style={{ color: '#0f766e', fontWeight: 600 }}>Lead: {t.assigned_to}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Review & Respond Action Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button
                    className="btn-primary"
                    style={{ padding: '9px 16px', fontSize: '0.825rem', borderRadius: '10px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTicket(t);
                    }}
                  >
                    <span>Open Case</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
