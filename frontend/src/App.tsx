import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { AuthorDashboard } from './pages/author/AuthorDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { getSocket } from './services/socket';
import { Bell, Check, MessageSquare, Sparkles, X, ArrowRight } from 'lucide-react';
import { Notification } from './types';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { openTicket, markAsRead } = useNotifications();
  const [toast, setToast] = useState<{
    id?: string;
    ticketId?: string;
    title: string;
    message: string;
    type: 'chat' | 'request' | 'status' | 'info';
  } | null>(null);

  // Global socket notification listener for high-priority toasts
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    const handleNewNotification = (notif: Notification) => {
      // Don't show toast if sender is the current user
      if (notif.sender_id === user.id) return;

      const toastType =
        notif.type === 'chat_reply'
          ? 'chat'
          : notif.type === 'new_request'
          ? 'request'
          : 'status';

      setToast({
        id: notif.id,
        ticketId: notif.ticket_id,
        title: notif.title,
        message: notif.message,
        type: toastType,
      });

      const timer = setTimeout(() => {
        setToast((current) => (current?.id === notif.id ? null : current));
      }, 7000);

      return () => clearTimeout(timer);
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [user]);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid rgba(20, 184, 166, 0.2)',
            borderTopColor: '#14b8a6',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Loading BookLeaf Publishing Portal...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleToastClick = () => {
    if (toast) {
      if (toast.id) markAsRead(toast.id);
      if (toast.ticketId) openTicket(toast.ticketId);
      setToast(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <Navbar onGoDashboard={() => window.dispatchEvent(new CustomEvent('app:go-dashboard'))} />

      {/* Interactive Real-Time Toast Alert */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '14px 18px',
            borderRadius: '14px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            maxWidth: '420px',
            cursor: toast.ticketId ? 'pointer' : 'default',
            animation: 'slideUpBounce 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            borderLeft:
              toast.type === 'chat'
                ? '4px solid #14b8a6'
                : toast.type === 'request'
                ? '4px solid #f59e0b'
                : '4px solid #38bdf8',
          }}
          onClick={handleToastClick}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor:
                toast.type === 'chat'
                  ? 'rgba(20, 184, 166, 0.15)'
                  : toast.type === 'request'
                  ? 'rgba(245, 158, 11, 0.15)'
                  : 'rgba(56, 189, 248, 0.15)',
              color:
                toast.type === 'chat'
                  ? '#2dd4bf'
                  : toast.type === 'request'
                  ? '#fbbf24'
                  : '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {toast.type === 'chat' ? (
              <MessageSquare size={17} />
            ) : toast.type === 'request' ? (
              <Sparkles size={17} />
            ) : (
              <Bell size={17} />
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.3 }}>
              {toast.title}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
                lineHeight: 1.4,
                marginTop: '3px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {toast.message}
            </div>
            {toast.ticketId && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.7rem',
                  color: '#5eead4',
                  fontWeight: 600,
                  marginTop: '6px',
                }}
              >
                <span>Click to view ticket</span>
                <ArrowRight size={11} />
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setToast(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              padding: '2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Main Interface Content */}
      <main style={{ flex: 1 }}>
        {user.role === 'admin' ? <AdminDashboard /> : <AuthorDashboard />}
      </main>

      <style>{`
        @keyframes slideUpBounce {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
