import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  AlertCircle,
  BookOpen,
  Check,
  ChevronRight,
  Feather,
  Globe,
  KeyRound,
  Lock,
  Mail,
  Shield,
  Sparkles,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickDemoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState<any>(null);
  const [demoTab, setDemoTab] = useState<'author' | 'admin'>('author');

  useEffect(() => {
    api
      .getDemoAccounts()
      .then((res) => setDemoAccounts(res))
      .catch((err) => console.warn('Could not load demo accounts:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPassword = 'password123') => {
    setError(null);
    setIsSubmitting(true);
    try {
      await quickDemoLogin(demoEmail, demoPassword);
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0c221f',
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(15, 118, 110, 0.25) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(180, 120, 32, 0.15) 0%, transparent 45%)',
        padding: '32px 20px',
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          maxWidth: '1060px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Left Editorial Branding Panel */}
        <div
          style={{
            backgroundColor: '#092e28',
            backgroundImage: 'linear-gradient(165deg, #092e28 0%, #0d3b34 50%, #051a17 100%)',
            color: '#ffffff',
            padding: '48px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          {/* Subtle decorative book page watermark */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              opacity: 0.04,
              pointerEvents: 'none',
            }}
          >
            <Feather size={220} />
          </div>

          <div>
            {/* Publisher Brand Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 14px rgba(20, 184, 166, 0.35)',
                }}
              >
                <BookOpen size={24} color="#ffffff" />
              </div>
              <div>
                <h1 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em', margin: 0 }}>
                  BookLeaf <span style={{ color: '#5eead4', fontStyle: 'italic' }}>Publishing</span>
                </h1>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Author Studio & Operations Portal
                </p>
              </div>
            </div>

            {/* Platform Proposition */}
            <div style={{ margin: '32px 0 24px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(94, 234, 212, 0.12)',
                  border: '1px solid rgba(94, 234, 212, 0.25)',
                  fontSize: '0.725rem',
                  color: '#5eead4',
                  fontWeight: 600,
                  marginBottom: '16px',
                }}
              >
                <Globe size={13} />
                <span>Empowering 22,000+ Authors Globally</span>
              </div>

              <h2
                className="font-serif"
                style={{
                  fontSize: '1.85rem',
                  fontWeight: 600,
                  lineHeight: 1.3,
                  marginBottom: '16px',
                  color: '#f8fafc',
                }}
              >
                Where authors thrive, and publishing operations connect.
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.65 }}>
                Track real-time royalties with full ledger transparency, monitor production and global distribution, and communicate directly with dedicated editorial specialists.
              </p>
            </div>

            {/* Key Platform Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ marginTop: '2px', padding: '3px', borderRadius: '50%', backgroundColor: 'rgba(94, 234, 212, 0.15)', color: '#5eead4' }}>
                  <TrendingUp size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>80% Transparent Royalty Split</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Quarterly accounting, automatic roll-over, and live sales tracking</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ marginTop: '2px', padding: '3px', borderRadius: '50%', backgroundColor: 'rgba(94, 234, 212, 0.15)', color: '#5eead4' }}>
                  <Shield size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>Dedicated Specialist Desks</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Direct routing to Royalties, ISBN Metadata, and Production leads</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ marginTop: '2px', padding: '3px', borderRadius: '50%', backgroundColor: 'rgba(94, 234, 212, 0.15)', color: '#5eead4' }}>
                  <Sparkles size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>Policy Grounded Support</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Fast responses calibrated with BookLeaf author service standards</div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div
            style={{
              marginTop: '40px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <p className="font-serif" style={{ fontSize: '0.875rem', fontStyle: 'italic', color: '#e2e8f0', margin: '0 0 6px 0' }}>
              "The clarity on royalties and the responsiveness of BookLeaf's editorial team made releasing my second poetry collection a joy."
            </p>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              — Kavita Deshmukh, author of <em>The Nagpur Notebooks</em>
            </span>
          </div>
        </div>

        {/* Right Sign-In Form & Discreet Demo Access */}
        <div
          style={{
            padding: '48px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff',
          }}
        >
          <div>
            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
              <h2 className="font-serif" style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                Sign In
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                Enter your registered credentials to access your portal.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="animate-fade-in"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  marginBottom: '20px',
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    placeholder="e.g. kavita.deshmukh@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '38px', borderRadius: '10px' }}
                    disabled={isSubmitting}
                  />
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                    Password
                  </label>
                  <span style={{ fontSize: '0.75rem', color: '#0f766e', fontWeight: 600, cursor: 'pointer' }}>
                    Forgot password?
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '38px', borderRadius: '10px' }}
                    disabled={isSubmitting}
                  />
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email || !password}
                className="btn-primary"
                style={{
                  marginTop: '6px',
                  padding: '12px',
                  borderRadius: '10px',
                  justifyContent: 'center',
                  fontSize: '0.925rem',
                  fontWeight: 700,
                  letterSpacing: '0.01em',
                }}
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}</span>
                {!isSubmitting && <ChevronRight size={16} />}
              </button>
            </form>
          </div>

          {/* Discreet Quick Persona Switcher for Evaluation */}
          <div
            style={{
              marginTop: '32px',
              paddingTop: '20px',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quick Login
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setDemoTab('author')}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: demoTab === 'author' ? '#0f766e' : '#f1f5f9',
                    color: demoTab === 'author' ? '#ffffff' : '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  Authors
                </button>
                <button
                  type="button"
                  onClick={() => setDemoTab('admin')}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: demoTab === 'admin' ? '#0f766e' : '#f1f5f9',
                    color: demoTab === 'admin' ? '#ffffff' : '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  Operations Staff
                </button>
              </div>
            </div>

            {demoTab === 'author' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('kavita.deshmukh@email.com')}
                  disabled={isSubmitting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: '#faf8f5',
                    border: '1px solid #e7e3da',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.775rem',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0f766e')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e7e3da')}
                >
                  <div>
                    <strong style={{ color: '#0f172a' }}>Kavita Deshmukh</strong>{' '}
                    <span style={{ color: '#64748b' }}>(The Nagpur Notebooks • ₹850 Pending Royalty)</span>
                  </div>
                  <ChevronRight size={13} color="#0f766e" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('priya.sharma@email.com')}
                  disabled={isSubmitting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: '#faf8f5',
                    border: '1px solid #e7e3da',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.775rem',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0f766e')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e7e3da')}
                >
                  <div>
                    <strong style={{ color: '#0f172a' }}>Priya Sharma</strong>{' '}
                    <span style={{ color: '#64748b' }}>(Echoes of the Sahyadri • ₹16,200 Earned)</span>
                  </div>
                  <ChevronRight size={13} color="#0f766e" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@bookleaf.com', 'admin123')}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: '#f0fdfa',
                  border: '1px solid #99f6e4',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#0f766e' }}>BookLeaf Support Operations Lead</div>
                  <div style={{ fontSize: '0.725rem', color: '#64748b' }}>admin@bookleaf.com • Full Queue & Support Access</div>
                </div>
                <Shield size={16} color="#0f766e" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
