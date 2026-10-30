import React, { useState, useEffect } from 'react';
import { Ticket, TicketCategory, TicketPriority, TicketStatus } from '../../types';
import { api } from '../../services/api';
import { getSocket } from '../../services/socket';
import { TicketQueueView } from './TicketQueueView';
import { AdminTicketDetail } from './AdminTicketDetail';
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  FileCheck,
  Filter,
  Inbox,
  Layers,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';

import { useNotifications } from '../../context/NotificationContext';

export const AdminDashboard: React.FC = () => {
  const { registerTicketNavigator } = useNotifications();
  const [activeTab, setActiveTab] = useState<'queue' | 'analytics'>('queue');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Register notification ticket navigator
  useEffect(() => {
    const unregister = registerTicketNavigator((ticketId: string) => {
      setSelectedTicketId(ticketId);
      setActiveTab('queue');
    });
    return unregister;
  }, [registerTicketNavigator]);

  // Listen for header logo clicks to return to dashboard queue
  useEffect(() => {
    const handleGoDashboard = () => {
      setSelectedTicketId(null);
      setActiveTab('queue');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('app:go-dashboard', handleGoDashboard);
    return () => window.removeEventListener('app:go-dashboard', handleGoDashboard);
  }, []);

  // Filters: Default to 'active' queue so resolved tickets do not appear in active queue
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchTickets = async () => {
    try {
      const [ticketsRes, analyticsRes] = await Promise.all([
        api.getAdminTickets({
          status: statusFilter,
          category: categoryFilter,
          priority: priorityFilter,
          search: searchTerm,
        }),
        api.getAdminAnalytics(),
      ]);
      setTickets(ticketsRes.tickets || []);
      setAnalytics(analyticsRes.analytics || null);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, categoryFilter, priorityFilter, searchTerm]);

  // Real-time synchronization
  useEffect(() => {
    const socket = getSocket();

    const handleTicketCreated = (data: { ticket: Ticket }) => {
      setTickets((prev) => [data.ticket, ...prev]);
      api.getAdminAnalytics().then((res) => setAnalytics(res.analytics)).catch(() => {});
    };

    const handleTicketUpdated = (updated: any) => {
      setTickets((prev) =>
        prev.map((t) => (t.id === updated.id || t.id === updated.ticketId ? { ...t, ...updated } : t))
      );
      api.getAdminAnalytics().then((res) => setAnalytics(res.analytics)).catch(() => {});
    };

    const handleNewMessage = (newMsg: any) => {
      setTickets((prev) =>
        prev.map((t) => {
          if (t.id === newMsg.ticket_id) {
            const msgs = t.messages || [];
            if (msgs.some((m) => m.id === newMsg.id)) return t;
            return {
              ...t,
              messages: [...msgs, newMsg],
              updated_at: newMsg.created_at || new Date().toISOString(),
            };
          }
          return t;
        })
      );
      api.getAdminAnalytics().then((res) => setAnalytics(res.analytics)).catch(() => {});
    };

    socket.on('ticket:created', handleTicketCreated);
    socket.on('ticket:updated', handleTicketUpdated);
    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('ticket:created', handleTicketCreated);
      socket.off('ticket:updated', handleTicketUpdated);
      socket.off('message:new', handleNewMessage);
    };
  }, []);


  const handleTicketUpdatedInDetail = React.useCallback((updated: Ticket) => {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
    api.getAdminAnalytics().then((res) => setAnalytics(res.analytics)).catch(() => {});
  }, []);

  // Filter handler when clicking top stat cards
  const handleCardClick = (filterType: 'active' | 'open' | 'inprogress' | 'resolved' | 'critical' | 'all') => {
    setActiveTab('queue');
    if (filterType === 'active') {
      setStatusFilter('active');
      setPriorityFilter('all');
    } else if (filterType === 'open') {
      setStatusFilter('Open');
      setPriorityFilter('all');
    } else if (filterType === 'inprogress') {
      setStatusFilter('In Progress');
      setPriorityFilter('all');
    } else if (filterType === 'resolved') {
      setStatusFilter('Resolved');
      setPriorityFilter('all');
    } else if (filterType === 'critical') {
      setPriorityFilter('Critical');
      setStatusFilter('active');
    } else if (filterType === 'all') {
      setStatusFilter('all');
      setPriorityFilter('all');
    }
  };

  // Filter by category directly from Category Insights
  const handleCategorySelect = (cat: string) => {
    setCategoryFilter(cat);
    setActiveTab('queue');
  };

  if (selectedTicketId) {
    return (
      <div style={{ padding: '28px 24px', maxWidth: '1360px', margin: '0 auto' }}>
        <AdminTicketDetail
          ticketId={selectedTicketId}
          onBack={() => setSelectedTicketId(null)}
          onTicketUpdated={handleTicketUpdatedInDetail}
        />
      </div>
    );
  }

  // Active filter checks for card highlight
  const isActiveQueueActive = activeTab === 'queue' && statusFilter === 'active' && priorityFilter === 'all';
  const isOpenActive = activeTab === 'queue' && statusFilter === 'Open' && priorityFilter !== 'Critical';
  const isInProgressActive = activeTab === 'queue' && statusFilter === 'In Progress' && priorityFilter !== 'Critical';
  const isResolvedActive = activeTab === 'queue' && statusFilter === 'Resolved' && priorityFilter !== 'Critical';
  const isCriticalActive = activeTab === 'queue' && priorityFilter === 'Critical';

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Banner */}
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
              BookLeaf Publishing Operations
            </span>
          </div>
          <h1 className="font-serif" style={{ fontSize: '1.85rem', fontWeight: 600, margin: 0, color: '#f8fafc' }}>
            Author Relations & Inquiries Console
          </h1>
        </div>
      </div>

      {/* Interactive Clickable Analytics Stat Cards (Zero-Jitter Stable Layout) */}
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {/* Card 1: Active Queue */}
          <div
            onClick={() => handleCardClick('active')}
            style={{
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: '#ffffff',
              borderRadius: '14px',
              cursor: 'pointer',
              boxSizing: 'border-box',
              userSelect: 'none',
              border: isActiveQueueActive ? '2px solid #0f766e' : '2px solid #e5e0d8',
              boxShadow: isActiveQueueActive ? '0 4px 12px rgba(15, 118, 110, 0.18)' : 'var(--shadow-sm)',
              position: 'relative',
              transform: 'none',
              minHeight: '94px',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '8px',
                right: '10px',
                fontSize: '0.625rem',
                fontWeight: 700,
                color: '#0f766e',
                backgroundColor: '#f0fdfa',
                border: '1px solid #ccfbf1',
                padding: '1px 6px',
                borderRadius: '4px',
                visibility: isActiveQueueActive ? 'visible' : 'hidden',
                pointerEvents: 'none',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Active
            </span>
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#f1f5f9', color: '#475569', flexShrink: 0 }}>
              <Inbox size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.725rem',
                  color: '#64748b',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.2,
                  marginBottom: '4px',
                }}
              >
                Active Queue
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginBottom: '2px' }}>
                {analytics.activeCount ?? (analytics.openCount + analytics.inProgressCount)}
              </div>
              <div style={{ fontSize: '0.675rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Click to view active
              </div>
            </div>
          </div>

          {/* Card 2: Open Tickets */}
          <div
            onClick={() => handleCardClick('open')}
            style={{
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: '#ffffff',
              borderRadius: '14px',
              cursor: 'pointer',
              boxSizing: 'border-box',
              userSelect: 'none',
              border: isOpenActive ? '2px solid #2563eb' : '2px solid #e5e0d8',
              boxShadow: isOpenActive ? '0 4px 12px rgba(37, 99, 235, 0.18)' : 'var(--shadow-sm)',
              position: 'relative',
              transform: 'none',
              minHeight: '94px',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '8px',
                right: '10px',
                fontSize: '0.625rem',
                fontWeight: 700,
                color: '#2563eb',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                padding: '1px 6px',
                borderRadius: '4px',
                visibility: isOpenActive ? 'visible' : 'hidden',
                pointerEvents: 'none',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Active
            </span>
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', flexShrink: 0 }}>
              <Clock size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.725rem',
                  color: '#64748b',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.2,
                  marginBottom: '4px',
                }}
              >
                Unassigned / Open
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1d4ed8', lineHeight: 1.1, marginBottom: '2px' }}>
                {analytics.openCount}
              </div>
              <div style={{ fontSize: '0.675rem', color: '#2563eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Click to view open
              </div>
            </div>
          </div>

          {/* Card 3: In Progress */}
          <div
            onClick={() => handleCardClick('inprogress')}
            style={{
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: '#ffffff',
              borderRadius: '14px',
              cursor: 'pointer',
              boxSizing: 'border-box',
              userSelect: 'none',
              border: isInProgressActive ? '2px solid #b47820' : '2px solid #e5e0d8',
              boxShadow: isInProgressActive ? '0 4px 12px rgba(180, 120, 32, 0.18)' : 'var(--shadow-sm)',
              position: 'relative',
              transform: 'none',
              minHeight: '94px',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '8px',
                right: '10px',
                fontSize: '0.625rem',
                fontWeight: 700,
                color: '#b45309',
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a',
                padding: '1px 6px',
                borderRadius: '4px',
                visibility: isInProgressActive ? 'visible' : 'hidden',
                pointerEvents: 'none',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Active
            </span>
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#fffbeb', color: '#b45309', flexShrink: 0 }}>
              <Clock size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.725rem',
                  color: '#64748b',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.2,
                  marginBottom: '4px',
                }}
              >
                In Progress
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b45309', lineHeight: 1.1, marginBottom: '2px' }}>
                {analytics.inProgressCount}
              </div>
              <div style={{ fontSize: '0.675rem', color: '#b45309', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Click to view ongoing
              </div>
            </div>
          </div>

          {/* Card 4: Resolved */}
          <div
            onClick={() => handleCardClick('resolved')}
            style={{
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: '#ffffff',
              borderRadius: '14px',
              cursor: 'pointer',
              boxSizing: 'border-box',
              userSelect: 'none',
              border: isResolvedActive ? '2px solid #059669' : '2px solid #e5e0d8',
              boxShadow: isResolvedActive ? '0 4px 12px rgba(5, 150, 105, 0.18)' : 'var(--shadow-sm)',
              position: 'relative',
              transform: 'none',
              minHeight: '94px',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '8px',
                right: '10px',
                fontSize: '0.625rem',
                fontWeight: 700,
                color: '#059669',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '1px 6px',
                borderRadius: '4px',
                visibility: isResolvedActive ? 'visible' : 'hidden',
                pointerEvents: 'none',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Active
            </span>
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#059669', flexShrink: 0 }}>
              <CheckCircle2 size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.725rem',
                  color: '#64748b',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.2,
                  marginBottom: '4px',
                }}
              >
                Resolved Cases
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', lineHeight: 1.1, marginBottom: '2px' }}>
                {analytics.resolvedCount}
              </div>
              <div style={{ fontSize: '0.675rem', color: '#059669', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Click to view resolved
              </div>
            </div>
          </div>

          {/* Card 5: Critical Priority Alert */}
          <div
            onClick={() => handleCardClick('critical')}
            style={{
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: isCriticalActive ? '#fef2f2' : analytics.criticalCount > 0 ? '#fef2f2' : '#ffffff',
              border: isCriticalActive ? '2px solid #dc2626' : analytics.criticalCount > 0 ? '2px solid #fecaca' : '2px solid #e5e0d8',
              boxShadow: isCriticalActive ? '0 4px 12px rgba(220, 38, 38, 0.22)' : 'var(--shadow-sm)',
              borderRadius: '14px',
              cursor: 'pointer',
              boxSizing: 'border-box',
              userSelect: 'none',
              position: 'relative',
              transform: 'none',
              minHeight: '94px',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '8px',
                right: '10px',
                fontSize: '0.625rem',
                fontWeight: 700,
                color: '#dc2626',
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                padding: '1px 6px',
                borderRadius: '4px',
                visibility: isCriticalActive ? 'visible' : 'hidden',
                pointerEvents: 'none',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Active
            </span>
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#fee2e2', color: '#dc2626', flexShrink: 0 }}>
              <AlertCircle size={22} className={analytics.criticalCount > 0 ? 'animate-pulse-subtle' : ''} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.725rem',
                  color: '#991b1b',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.2,
                  marginBottom: '4px',
                }}
              >
                Active Critical
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626', lineHeight: 1.1, marginBottom: '2px' }}>
                {analytics.criticalCount}
              </div>
              <div style={{ fontSize: '0.675rem', color: '#dc2626', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {analytics.criticalCount > 0 ? 'Click to view active critical' : 'No critical emergencies'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #e5e0d8',
          paddingBottom: '2px',
        }}
      >
        <button
          onClick={() => setActiveTab('queue')}
          style={{
            padding: '12px 22px',
            fontSize: '0.925rem',
            fontWeight: 700,
            color: activeTab === 'queue' ? '#0f766e' : '#64748b',
            borderBottom: activeTab === 'queue' ? '3px solid #0f766e' : '3px solid transparent',
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
          <Inbox size={16} />
          <span>Author Inquiries & Support Queue</span>
          <span
            style={{
              fontSize: '0.725rem',
              backgroundColor: '#f0fdfa',
              color: '#0f766e',
              padding: '1px 8px',
              borderRadius: '9999px',
              border: '1px solid #ccfbf1',
              fontWeight: 700,
            }}
          >
            {tickets.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            padding: '12px 22px',
            fontSize: '0.925rem',
            fontWeight: 700,
            color: activeTab === 'analytics' ? '#0f766e' : '#64748b',
            borderBottom: activeTab === 'analytics' ? '3px solid #0f766e' : '3px solid transparent',
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
          <BarChart3 size={16} />
          <span>Category Insights</span>
        </button>
      </div>

      {/* Tab Content: Queue */}
      {activeTab === 'queue' && (
        <TicketQueueView
          tickets={tickets}
          onSelectTicket={(ticket) => setSelectedTicketId(ticket.id)}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      )}

      {/* Tab Content: Category Insights (SLA removed as requested) */}
      {activeTab === 'analytics' && analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          {/* Category Breakdown with Click-to-Filter */}
          <div className="card" style={{ padding: '28px', backgroundColor: '#ffffff', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                Inbound Case Distribution by Department
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Click bar to filter queue</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries(analytics.categoryBreakdown || {}).map(([category, count]: [string, any]) => {
                const percentage = analytics.total > 0 ? Math.round((count / analytics.total) * 100) : 0;
                return (
                  <div
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      cursor: 'pointer',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>{category}</span>
                      <span style={{ color: '#0f766e', fontWeight: 700 }}>
                        {count} {count === 1 ? 'case' : 'cases'} ({percentage}%)
                      </span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${percentage}%`,
                          background: 'linear-gradient(90deg, #0f766e 0%, #14b8a6 100%)',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Department Volume & Resolution Summary (Pure Insights, No SLA) */}
          <div className="card" style={{ padding: '28px', backgroundColor: '#ffffff', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                Department Volume & Resolution Summary
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px', lineHeight: 1.5 }}>
                Cumulative workload and distribution metrics across BookLeaf publishing operations desks.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Total Cases Analyzed:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{analytics.total} Inquiries</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Active Case Resolution Rate:</span>
                  <span style={{ fontWeight: 700, color: '#059669' }}>
                    {analytics.total > 0 ? Math.round((analytics.resolvedCount / analytics.total) * 100) : 0}% Resolved
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Primary Inquiry Driver:</span>
                  <span style={{ fontWeight: 700, color: '#0f766e' }}>Royalty & Payout Accounting</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Active Critical Cases:</span>
                  <span style={{ fontWeight: 700, color: analytics.criticalCount > 0 ? '#dc2626' : '#059669' }}>
                    {analytics.criticalCount} {analytics.criticalCount === 1 ? 'case' : 'cases'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Filter Shortcuts */}
            <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '10px', textTransform: 'uppercase' }}>
                Filter by Department:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleCategorySelect('Royalty & Payments')}
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '5px 10px', borderRadius: '6px' }}
                >
                  💰 Royalties Desk
                </button>
                <button
                  type="button"
                  onClick={() => handleCategorySelect('ISBN & Metadata Issues')}
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '5px 10px', borderRadius: '6px' }}
                >
                  🏷️ ISBN Metadata
                </button>
                <button
                  type="button"
                  onClick={() => handleCategorySelect('Printing & Quality')}
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '5px 10px', borderRadius: '6px' }}
                >
                  🖨️ Printing & Proofing
                </button>
                <button
                  type="button"
                  onClick={() => handleCategorySelect('Distribution & Availability')}
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '5px 10px', borderRadius: '6px' }}
                >
                  🚚 Distribution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
