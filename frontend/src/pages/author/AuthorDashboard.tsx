import React, { useState, useEffect } from 'react';
import { Book, Ticket, AuthorBooksSummary } from '../../types';
import { api } from '../../services/api';
import { getSocket } from '../../services/socket';
import { MyBooksView } from './MyBooksView';
import { SubmitTicketView } from './SubmitTicketView';
import { AuthorTicketDetail } from './AuthorTicketDetail';
import { StatusPill, CategoryPill } from '../../components/StatusBadge';
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Clock,
  Feather,
  Inbox,
  MessageSquare,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const AuthorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { registerTicketNavigator } = useNotifications();
  const [activeTab, setActiveTab] = useState<'books' | 'submit' | 'tickets'>('books');
  const [books, setBooks] = useState<Book[]>([]);
  const [summary, setSummary] = useState<AuthorBooksSummary | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [preselectedBookId, setPreselectedBookId] = useState<string | null>(null);
  const [submissionSuccessTicket, setSubmissionSuccessTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Register notification ticket navigator
  useEffect(() => {
    const unregister = registerTicketNavigator((ticketId: string) => {
      const found = tickets.find((t) => t.id === ticketId);
      if (found) {
        setSelectedTicket(found);
      } else {
        api.getAuthorTickets().then((res) => {
          if (res?.tickets) {
            setTickets(res.tickets);
            const refound = res.tickets.find((t: Ticket) => t.id === ticketId);
            if (refound) setSelectedTicket(refound);
          }
        });
      }
      setSubmissionSuccessTicket(null);
      setActiveTab('tickets');
    });

    return unregister;
  }, [tickets, registerTicketNavigator]);

  // Listen for header logo clicks to return to author dashboard
  useEffect(() => {
    const handleGoDashboard = () => {
      setSelectedTicket(null);
      setSubmissionSuccessTicket(null);
      setActiveTab('books');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('app:go-dashboard', handleGoDashboard);
    return () => window.removeEventListener('app:go-dashboard', handleGoDashboard);
  }, []);

  // Fetch initial books & tickets
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [booksRes, ticketsRes] = await Promise.all([
          api.getAuthorBooks(),
          api.getAuthorTickets(),
        ]);
        setBooks(booksRes.books || []);
        setSummary(booksRes.summary || null);
        setTickets(ticketsRes.tickets || []);
      } catch (err) {
        console.error('Error fetching author data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Real-time synchronization
  useEffect(() => {
    const socket = getSocket();

    const handleTicketUpdated = (updated: any) => {
      setTickets((prev) =>
        prev.map((t) => (t.id === updated.id || t.id === updated.ticketId ? { ...t, ...updated } : t))
      );
      setSelectedTicket((prev) =>
        prev && (prev.id === updated.id || prev.id === updated.ticketId)
          ? { ...prev, ...updated }
          : prev
      );
    };

    const handleNewMessage = (newMsg: any) => {
      setTickets((prev) =>
        prev.map((t) => {
          if (t.id === newMsg.ticket_id) {
            const msgs = t.messages || [];
            if (msgs.some((m) => m.id === newMsg.id)) return t;
            return { ...t, messages: [...msgs, newMsg], updated_at: newMsg.created_at || new Date().toISOString() };
          }
          return t;
        })
      );
      setSelectedTicket((prev) => {
        if (prev && prev.id === newMsg.ticket_id) {
          const msgs = prev.messages || [];
          if (msgs.some((m) => m.id === newMsg.id)) return prev;
          return { ...prev, messages: [...msgs, newMsg], updated_at: newMsg.created_at || new Date().toISOString() };
        }
        return prev;
      });
    };

    socket.on('ticket:updated', handleTicketUpdated);
    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('ticket:updated', handleTicketUpdated);
      socket.off('message:new', handleNewMessage);
    };
  }, []);


  const handleRaiseQueryForBook = (bookId: string) => {
    setPreselectedBookId(bookId);
    setActiveTab('submit');
  };

  const handleTicketSubmitted = (newTicket: Ticket) => {
    setTickets((prev) => [newTicket, ...prev]);
    setSubmissionSuccessTicket(newTicket);
    setActiveTab('tickets');
  };

  const handleTicketUpdatedInDetail = React.useCallback((updated: Ticket) => {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
    setSelectedTicket((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#64748b' }}>
        Loading your Author Studio...
      </div>
    );
  }

  // If a ticket is currently selected, render the dedicated conversation view
  if (selectedTicket) {
    return (
      <div style={{ padding: '28px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <AuthorTicketDetail
          ticket={selectedTicket}
          onBack={() => setSelectedTicket(null)}
          onTicketUpdated={handleTicketUpdatedInDetail}
        />
      </div>
    );
  }

  const openTicketsCount = tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length;

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Personalized Welcome Header */}
      <div
        className="card"
        style={{
          padding: '28px 32px',
          background: 'linear-gradient(135deg, #092e28 0%, #0d3b34 100%)',
          color: '#ffffff',
          borderRadius: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 10px 25px -5px rgba(9, 46, 40, 0.25)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5eead4', fontWeight: 700 }}>
              BookLeaf Author Studio
            </span>
          </div>
          <h1 className="font-serif" style={{ fontSize: '1.85rem', fontWeight: 600, margin: 0, color: '#f8fafc' }}>
            Welcome, {user?.name || 'Author'}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => {
              setPreselectedBookId(null);
              setActiveTab('submit');
            }}
            className="btn-gold"
            style={{ borderRadius: '10px', padding: '10px 18px', fontWeight: 700 }}
          >
            <PlusCircle size={16} />
            <span>Submit New Query</span>
          </button>
        </div>
      </div>

      {/* Submission Success Advisory Banner */}
      {submissionSuccessTicket && (
        <div
          className="card animate-fade-in"
          style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '16px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 4px 14px rgba(22, 101, 52, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#16a34a',
              }}
            >
              <CheckCircle size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.975rem', fontWeight: 800, color: '#14532d' }}>
                  Inquiry Submitted Successfully: Ticket {submissionSuccessTicket.ticket_number}
                </span>
                <span
                  style={{
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {submissionSuccessTicket.category}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#166534', lineHeight: 1.5 }}>
                Your request <strong>"{submissionSuccessTicket.subject}"</strong> has been logged into the publishing queue. Dedicated operations specialists will investigate and reply within 24–48 hours.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setSelectedTicket(submissionSuccessTicket)}
              className="btn-primary"
              style={{
                padding: '9px 18px',
                fontSize: '0.825rem',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
              }}
            >
              <span>Open Ticket Conversation</span>
              <ArrowRight size={14} />
            </button>

            <button
              onClick={() => setSubmissionSuccessTicket(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#15803d',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Dismiss notification"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Editorial Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #e5e0d8',
          paddingBottom: '2px',
        }}
      >
        <button
          onClick={() => setActiveTab('books')}
          style={{
            padding: '12px 22px',
            fontSize: '0.925rem',
            fontWeight: 700,
            color: activeTab === 'books' ? '#0f766e' : '#64748b',
            borderBottom: activeTab === 'books' ? '3px solid #0f766e' : '3px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <BookOpen size={16} />
          <span>My Published Catalog</span>
          <span
            style={{
              fontSize: '0.725rem',
              backgroundColor: activeTab === 'books' ? '#f0fdfa' : '#f1f5f9',
              color: activeTab === 'books' ? '#0f766e' : '#64748b',
              padding: '1px 8px',
              borderRadius: '9999px',
              border: '1px solid',
              borderColor: activeTab === 'books' ? '#ccfbf1' : '#e2e8f0',
            }}
          >
            {books.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          style={{
            padding: '12px 22px',
            fontSize: '0.925rem',
            fontWeight: 700,
            color: activeTab === 'tickets' ? '#0f766e' : '#64748b',
            borderBottom: activeTab === 'tickets' ? '3px solid #0f766e' : '3px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <MessageSquare size={16} />
          <span>Support & Editorial Queries</span>
          <span
            style={{
              fontSize: '0.725rem',
              backgroundColor: openTicketsCount > 0 ? '#ccfbf1' : '#f1f5f9',
              color: openTicketsCount > 0 ? '#0f766e' : '#64748b',
              padding: '1px 8px',
              borderRadius: '9999px',
              fontWeight: 700,
              border: '1px solid',
              borderColor: openTicketsCount > 0 ? '#99f6e4' : '#e2e8f0',
            }}
          >
            {tickets.length}
          </span>
        </button>

        <button
          onClick={() => {
            setPreselectedBookId(null);
            setActiveTab('submit');
          }}
          style={{
            padding: '12px 22px',
            fontSize: '0.925rem',
            fontWeight: 700,
            color: activeTab === 'submit' ? '#0f766e' : '#64748b',
            borderBottom: activeTab === 'submit' ? '3px solid #0f766e' : '3px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <PlusCircle size={16} />
          <span>Submit Support Query</span>
        </button>
      </div>

      {/* Tab 1: Books Catalog */}
      {activeTab === 'books' && (
        <MyBooksView
          books={books}
          summary={summary}
          onRaiseQuery={handleRaiseQueryForBook}
        />
      )}

      {/* Tab 2: Submit Ticket Form */}
      {activeTab === 'submit' && (
        <SubmitTicketView
          books={books}
          preselectedBookId={preselectedBookId}
          onTicketSubmitted={handleTicketSubmitted}
        />
      )}

      {/* Tab 3: Tickets Stream */}
      {activeTab === 'tickets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="font-serif" style={{ fontSize: '1.45rem', fontWeight: 600, color: '#0f172a', margin: '0 0 4px 0' }}>
                Your Author Communications & Queries
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                Every inquiry is tracked end-to-end with guaranteed response timelines and direct communication with BookLeaf operations.
              </p>
            </div>

            <button
              onClick={() => {
                setPreselectedBookId(null);
                setActiveTab('submit');
              }}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <PlusCircle size={14} />
              <span>Raise New Query</span>
            </button>
          </div>

          {tickets.length === 0 ? (
            <div
              className="card"
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e0d8',
                borderRadius: '16px',
              }}
            >
              <Inbox size={42} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <h3 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                No Support Inquiries Raised Yet
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '480px', margin: '0 auto 18px' }}>
                Have questions regarding your ISBN metadata, print partner copies, or quarterly royalty payout? Submit a query and our team will assist you.
              </p>
              <button
                onClick={() => setActiveTab('submit')}
                className="btn-primary"
                style={{ padding: '9px 18px' }}
              >
                <span>Submit Your First Query</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className="card card-hover"
                  style={{
                    padding: '20px 24px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    backgroundColor: '#ffffff',
                    borderLeft: t.status === 'Resolved' ? '4px solid #10b981' : '4px solid #0f766e',
                    borderRadius: '14px',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f766e', fontFamily: 'var(--font-mono)' }}>
                        {t.ticket_number}
                      </span>
                      <StatusPill status={t.status} />
                      <CategoryPill category={t.category} overridden={t.category_overridden} />
                    </div>

                    <h3 className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                      {t.subject}
                    </h3>

                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ color: '#334155' }}>
                        {t.book ? `Book: ${t.book.title}` : 'General Account Query'}
                      </span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        Opened {new Date(t.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span>•</span>
                      <span>{(t.messages || []).length} message(s)</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f766e', fontSize: '0.85rem', fontWeight: 600 }}>
                    <span>Open Conversation</span>
                    <ChevronRight size={18} color="#0f766e" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
