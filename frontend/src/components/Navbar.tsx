import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, Radio, Shield, User as UserIcon, Feather } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';

export const Navbar: React.FC<{ activeTab?: string; onTabChange?: (tab: string) => void }> = () => {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        backgroundColor: '#092e28',
        color: '#ffffff',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
      }}
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          height: '66px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 3px 8px rgba(20, 184, 166, 0.35)',
            }}
          >
            <BookOpen size={20} />
          </div>
          <div>
            <div className="font-serif" style={{ fontWeight: 600, fontSize: '1.25rem', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              BookLeaf <span style={{ color: '#5eead4', fontStyle: 'italic', fontWeight: 400, fontSize: '1.05rem' }}>Publishing</span>
            </div>
            <div style={{ fontSize: '0.675rem', color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
              {user?.role === 'admin' ? 'Operations & Author Relations Console' : 'Author Studio & Royalties'}
            </div>
          </div>
        </div>

        {/* Right side user info & actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Notification Center */}
              <NotificationCenter />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: user.role === 'admin'
                      ? 'linear-gradient(135deg, #b47820 0%, #d97706 100%)'
                      : 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  }}
                >
                  {user.role === 'admin' ? <Shield size={16} /> : <UserIcon size={16} />}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>{user.name}</div>
                  <div
                    style={{
                      fontSize: '0.675rem',
                      color: user.role === 'admin' ? '#fde68a' : '#5eead4',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {user.role === 'admin' ? 'Publishing Operations' : 'Published Author'}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Log out of account"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.borderColor = '#ef4444';
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#cbd5e1';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
