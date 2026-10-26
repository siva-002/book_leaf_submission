import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Notification, NotificationType } from '../types';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  Inbox,
  Lock,
  MessageSquare,
  Sparkles,
  Trash2,
  X,
  ArrowRight,
  Radio,
} from 'lucide-react';

const formatRelativeTime = (dateStr?: string) => {
  if (!dateStr) return 'Just now';
  const now = Date.now();
  const past = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    markAsRead,
    markAllAsRead,
    clearAll,
    openTicket,
    isLoading,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'all' | 'chat_reply' | 'new_request' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellButtonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        bellButtonRef.current &&
        !bellButtonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, setIsOpen]);

  // Filtered notifications
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'chat_reply') return n.type === 'chat_reply';
    if (activeTab === 'new_request') return n.type === 'new_request';
    if (activeTab === 'unread') return !n.is_read;
    return true; // 'all'
  });

  const chatCount = notifications.filter((n) => n.type === 'chat_reply').length;
  const requestCount = notifications.filter((n) => n.type === 'new_request').length;

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.is_read) {
      markAsRead(notif.id);
    }
    if (notif.ticket_id) {
      openTicket(notif.ticket_id);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'chat_reply':
        return <MessageSquare size={16} color="#2dd4bf" />;
      case 'new_request':
        return <Sparkles size={16} color="#fbbf24" />;
      case 'ticket_status':
        return <CheckCircle2 size={16} color="#38bdf8" />;
      case 'internal_note':
        return <Lock size={16} color="#f97316" />;
      default:
        return <Bell size={16} color="#94a3b8" />;
    }
  };

  const getNotificationBadgeColor = (type: NotificationType) => {
    switch (type) {
      case 'chat_reply':
        return { bg: 'rgba(45, 212, 191, 0.12)', text: '#2dd4bf', label: 'Chat Reply' };
      case 'new_request':
        return { bg: 'rgba(251, 191, 36, 0.12)', text: '#fbbf24', label: 'New Request' };
      case 'ticket_status':
        return { bg: 'rgba(56, 189, 248, 0.12)', text: '#38bdf8', label: 'Status Update' };
      case 'internal_note':
        return { bg: 'rgba(249, 115, 22, 0.12)', text: '#f97316', label: 'Internal Note' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.12)', text: '#94a3b8', label: 'Alert' };
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Trigger Button */}
      <button
        ref={bellButtonRef}
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications (Realtime Chat & Requests)"
        aria-label="Notifications"
        style={{
          position: 'relative',
          backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: unreadCount > 0 ? '#5eead4' : '#cbd5e1',
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isOpen ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <Bell size={18} />

        {/* Unread Badge Counter */}
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '0.675rem',
              fontWeight: 700,
              minWidth: '18px',
              height: '18px',
              padding: '0 4px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 2px #092e28, 0 2px 5px rgba(239, 68, 68, 0.5)',
              animation: 'pulse 2s infinite',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Notifications Dropdown Window */}
      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            right: 0,
            width: '440px',
            maxWidth: 'calc(100vw - 32px)',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.4), 0 8px 16px -4px rgba(0, 0, 0, 0.2)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideDownFade 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Bell size={15} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em', color: '#f8fafc' }}>
                  Notifications
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#34d399' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      display: 'inline-block',
                      boxShadow: '0 0 6px #10b981',
                    }}
                  />
                  Live Sync Active
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94a3b8',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontWeight: 600,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#5eead4';
                    e.currentTarget.style.borderColor = '#14b8a6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#94a3b8';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <CheckCheck size={13} />
                  <span>Mark Read</span>
                </button>
              )}

              <button
                onClick={() => setIsOpen(false)}
                title="Close notifications"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div
            style={{
              display: 'flex',
              padding: '6px 14px',
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              gap: '6px',
            }}
          >
            {[
              { id: 'all', label: 'All', count: notifications.length },
              { id: 'chat_reply', label: 'Chats', count: chatCount },
              { id: 'new_request', label: 'Requests', count: requestCount },
              { id: 'unread', label: 'Unread', count: unreadCount },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    flex: 1,
                    backgroundColor: active ? 'rgba(20, 184, 166, 0.2)' : 'transparent',
                    border: active ? '1px solid rgba(20, 184, 166, 0.4)' : '1px solid transparent',
                    color: active ? '#5eead4' : '#94a3b8',
                    padding: '6px 8px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      style={{
                        backgroundColor: active ? '#14b8a6' : 'rgba(255, 255, 255, 0.1)',
                        color: active ? '#042f2e' : '#cbd5e1',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '999px',
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Notification List Container */}
          <div
            style={{
              maxHeight: '420px',
              overflowY: 'auto',
              padding: '8px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {filteredNotifications.length === 0 ? (
              <div
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#64748b',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#475569',
                  }}
                >
                  <Inbox size={22} />
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}>
                  No notifications in this view
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '240px' }}>
                  {activeTab === 'chat_reply'
                    ? 'No chat replies received yet.'
                    : activeTab === 'new_request'
                    ? 'No new request alerts found.'
                    : activeTab === 'unread'
                    ? 'All notifications have been read!'
                    : 'You are all caught up! New chats and requests will arrive here in real time.'}
                </div>
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const badge = getNotificationBadgeColor(n.type);
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    style={{
                      backgroundColor: n.is_read ? 'rgba(255, 255, 255, 0.03)' : 'rgba(20, 184, 166, 0.08)',
                      border: n.is_read
                        ? '1px solid rgba(255, 255, 255, 0.06)'
                        : '1px solid rgba(20, 184, 166, 0.3)',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = n.is_read
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(20, 184, 166, 0.14)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = n.is_read
                        ? 'rgba(255, 255, 255, 0.03)'
                        : 'rgba(20, 184, 166, 0.08)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Top Row: Type Badge + Ticket Number + Timestamp */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: badge.bg,
                            color: badge.text,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {getNotificationIcon(n.type)}
                          <span>{badge.label}</span>
                        </span>

                        {n.ticket_number && (
                          <span
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.08)',
                              color: '#cbd5e1',
                              fontSize: '0.675rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {n.ticket_number}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.675rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={11} />
                          {formatRelativeTime(n.created_at)}
                        </span>
                        {!n.is_read && (
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              backgroundColor: '#14b8a6',
                              display: 'inline-block',
                              boxShadow: '0 0 6px #14b8a6',
                            }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.3 }}>
                      {n.title}
                    </div>

                    {/* Message Preview */}
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#94a3b8',
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {n.message}
                    </div>

                    {/* Action prompt */}
                    <div
                      style={{
                        marginTop: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '4px',
                        fontSize: '0.7rem',
                        color: '#5eead4',
                        fontWeight: 600,
                      }}
                    >
                      <span>Open Ticket</span>
                      <ArrowRight size={11} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          {notifications.length > 0 && (
            <div
              style={{
                padding: '10px 16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: '#64748b',
              }}
            >
              <span>{notifications.length} notification{notifications.length === 1 ? '' : 's'}</span>
              <button
                onClick={clearAll}
                title="Clear all notifications"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                <Trash2 size={12} />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Embedded CSS animations */}
      <style>{`
        @keyframes slideDownFade {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};
