import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Ticket, TicketMessage } from '../../types';
import { api } from '../../services/api';
import { getSocket } from '../../services/socket';
import { StatusPill, CategoryPill } from '../../components/StatusBadge';
import { AttachmentPreview } from '../../components/AttachmentPreview';
import {
  ArrowLeft,
  BookOpen,
  CheckCheck,
  Clock,
  CornerDownLeft,
  Loader2,
  Paperclip,
  Radio,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  Info,
  RefreshCw,
  X,
} from 'lucide-react';

interface AuthorTicketDetailProps {
  ticket: Ticket;
  onBack: () => void;
  onTicketUpdated: (updatedTicket: Ticket) => void;
}

// Helper to filter out any consecutive duplicates from historical data
const deduplicateInitialMessages = (msgs: TicketMessage[] = []): TicketMessage[] => {
  const result: TicketMessage[] = [];
  const seenIds = new Set<string>();

  for (const m of msgs) {
    if (m.is_internal_note) continue; // Never show internal notes to author
    if (seenIds.has(m.id)) continue;
    seenIds.add(m.id);

    // Also check content/time duplicate with previous message
    const last = result[result.length - 1];
    if (
      last &&
      last.sender_id === m.sender_id &&
      last.message.trim() === m.message.trim() &&
      last.created_at &&
      m.created_at
    ) {
      const diff = Math.abs(new Date(last.created_at).getTime() - new Date(m.created_at).getTime());
      if (diff < 3000) continue;
    }

    result.push(m);
  }
  return result;
};

// Helper for human-readable message timestamps
const formatMessageTime = (dateStr?: string) => {
  if (!dateStr) return 'Just now';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Helper for date separators
const formatMessageDate = (dateStr?: string) => {
  if (!dateStr) return 'Today';
  const d = new Date(dateStr);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return 'Today';
  }
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const AuthorTicketDetail: React.FC<AuthorTicketDetailProps> = ({
  ticket: initialTicket,
  onBack,
  onTicketUpdated,
}) => {
  const [ticket, setTicket] = useState<Ticket>(initialTicket);
  const [messages, setMessages] = useState<TicketMessage[]>(() =>
    deduplicateInitialMessages(initialTicket.messages || [])
  );
  const [replyText, setReplyText] = useState('');
  const [composerAttachmentName, setComposerAttachmentName] = useState<string | null>(null);
  const [composerAttachmentUrl, setComposerAttachmentUrl] = useState<string | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimisticSendingMessage, setOptimisticSendingMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendingLockRef = useRef<boolean>(false);

  const handleComposerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingAttachment(true);
      setError(null);
      try {
        const uploadRes = await api.uploadFile(file);
        setComposerAttachmentName(uploadRes.file.name);
        setComposerAttachmentUrl(uploadRes.file.url);
      } catch (err: any) {
        setError(err.message || 'Failed to upload attachment.');
      } finally {
        setIsUploadingAttachment(false);
      }
    }
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, optimisticSendingMessage]);

  // Keep internal ticket & messages in sync when parent initialTicket changes
  useEffect(() => {
    setTicket(initialTicket);
    if (initialTicket.messages && initialTicket.messages.length > 0) {
      setMessages(deduplicateInitialMessages(initialTicket.messages));
    }
  }, [initialTicket]);

  // Fetch freshest ticket data on mount so no replies are missed
  const fetchFreshTicket = useCallback(async () => {
    try {
      const res = await api.getAuthorTickets();
      if (res && res.tickets) {
        const found = res.tickets.find((t: Ticket) => t.id === ticket.id);
        if (found) {
          setTicket(found);
          if (found.messages) {
            setMessages(deduplicateInitialMessages(found.messages));
          }
          onTicketUpdated(found);
        }
      }
    } catch (err) {
      console.warn('[AuthorTicketDetail] Could not refresh ticket:', err);
    }
  }, [ticket.id, onTicketUpdated]);

  useEffect(() => {
    fetchFreshTicket();
  }, [fetchFreshTicket]);

  // Robust client-side message deduplication
  const addMessageDeduplicated = useCallback((newMsg: TicketMessage) => {
    if (newMsg.is_internal_note) return; // Authors must never receive internal notes

    setMessages((prev) => {
      // 1. Check if message ID already exists
      if (prev.some((m) => m.id === newMsg.id)) {
        return prev;
      }

      // 2. Check if identical message text from same sender within 3 seconds
      const isDuplicate = prev.some((m) => {
        if (m.sender_id !== newMsg.sender_id || m.message.trim() !== newMsg.message.trim()) {
          return false;
        }
        const t1 = new Date(m.created_at || Date.now()).getTime();
        const t2 = new Date(newMsg.created_at || Date.now()).getTime();
        return Math.abs(t1 - t2) < 3000;
      });

      if (isDuplicate) {
        return prev;
      }

      const next = [...prev, newMsg];
      return next;
    });
  }, []);

  // Real-time synchronization via Socket.io
  useEffect(() => {
    const socket = getSocket();

    const joinCurrentTicket = () => {
      socket.emit('join:ticket', ticket.id);
    };

    joinCurrentTicket();

    const handleNewMessage = (newMsg: TicketMessage) => {
      if (newMsg.ticket_id && newMsg.ticket_id !== ticket.id) return;
      // Clear any pending optimistic bubble
      setOptimisticSendingMessage(null);
      addMessageDeduplicated(newMsg);
      setTicket((prev) => {
        const next = { ...prev, updated_at: newMsg.created_at || new Date().toISOString() };
        onTicketUpdated(next);
        return next;
      });
    };

    const handleTicketUpdated = (updated: any) => {
      if (updated.id === ticket.id || updated.ticketId === ticket.id) {
        setTicket((prev) => {
          const next = { ...prev, ...(updated.id ? updated : { status: updated.status }) };
          onTicketUpdated(next);
          return next;
        });
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('ticket:updated', handleTicketUpdated);
    socket.on('connect', joinCurrentTicket);

    return () => {
      socket.emit('leave:ticket', ticket.id);
      socket.off('message:new', handleNewMessage);
      socket.off('ticket:updated', handleTicketUpdated);
      socket.off('connect', joinCurrentTicket);
    };
  }, [ticket.id, addMessageDeduplicated, onTicketUpdated]);


  // Handle message submission with strict synchronous lock
  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Critical single-click lock: reject if already locked, sending, or empty
    if (sendingLockRef.current || isSending || (!replyText.trim() && !composerAttachmentUrl)) {
      return;
    }

    const trimmed = replyText.trim();
    const attachName = composerAttachmentName;
    const attachUrl = composerAttachmentUrl;

    sendingLockRef.current = true;
    setIsSending(true);
    setError(null);
    setOptimisticSendingMessage(trimmed || (attachName ? `Attached: ${attachName}` : 'Sending attachment...'));
    setReplyText('');
    setComposerAttachmentName(null);
    setComposerAttachmentUrl(null);

    try {
      const res = await api.replyAuthorTicket(
        ticket.id,
        trimmed,
        attachName || undefined,
        attachUrl || undefined
      );
      setOptimisticSendingMessage(null);
      if (res && res.message) {
        addMessageDeduplicated(res.message);
      }
    } catch (err: any) {
      setOptimisticSendingMessage(null);
      setError(err.message || 'Failed to send message. Please try again.');
      setReplyText(trimmed); // Restore content on error
      setComposerAttachmentName(attachName);
      setComposerAttachmentUrl(attachUrl);
    } finally {
      setIsSending(false);
      sendingLockRef.current = false;
      // Re-focus textarea
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSendReply();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Top Header Navigation & Status Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={onBack}
          className="btn-secondary"
          style={{
            padding: '7px 14px',
            fontSize: '0.85rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            borderRadius: '10px',
          }}
        >
          <ArrowLeft size={15} />
          <span>Back to My Tickets</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <StatusPill status={ticket.status} />
          <CategoryPill category={ticket.category} overridden={ticket.category_overridden} />
        </div>
      </div>

      {/* Ticket Context Header Card */}
      <div
        className="card"
        style={{
          padding: '22px 26px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)',
          borderLeft: '5px solid #0f766e',
          boxShadow: '0 4px 12px rgba(15, 118, 110, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: '#0f766e',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: '#ccfbf1',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                {ticket.ticket_number}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>•</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                {ticket.category}
              </span>
            </div>

            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>
              {ticket.subject}
            </h1>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} color="#64748b" />
            <span>Created {new Date(ticket.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Linked Book & Attachment Details Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '0.825rem',
            color: '#334155',
            paddingTop: '10px',
            borderTop: '1px solid rgba(15, 118, 110, 0.12)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={16} color="#0f766e" />
            <span>
              {ticket.book ? (
                <>
                  Referenced Book: <strong style={{ color: '#0f172a' }}>{ticket.book.title}</strong>{' '}
                  <span
                    style={{
                      fontSize: '0.725rem',
                      backgroundColor: '#e2e8f0',
                      color: '#334155',
                      padding: '1px 7px',
                      borderRadius: '9999px',
                      marginLeft: '4px',
                      fontWeight: 600,
                    }}
                  >
                    {ticket.book.status}
                  </span>
                </>
              ) : (
                <span style={{ color: '#64748b' }}>Account & General Portal Query</span>
              )}
            </span>
          </div>

          {ticket.attachment_name && (
            <AttachmentPreview
              name={ticket.attachment_name}
              url={ticket.attachment_url}
              compact={true}
            />
          )}
        </div>

        {/* If author submitted an attachment on ticket creation, show prominent preview card */}
        {ticket.attachment_name && (
          <div style={{ marginTop: '8px', paddingTop: '10px', borderTop: '1px solid rgba(15, 118, 110, 0.1)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
              Attached Case Evidence / Document:
            </div>
            <AttachmentPreview
              name={ticket.attachment_name}
              url={ticket.attachment_url}
              compact={false}
            />
          </div>
        )}
      </div>

      {/* Modern Conversational Chat Canvas */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f8fafc',
          borderRadius: '20px',
          padding: '24px 20px',
          minHeight: '480px',
          maxHeight: '620px',
          overflowY: 'auto',
          gap: '18px',
          border: '1px solid #e2e8f0',
          position: 'relative',
        }}
      >
        {/* Chat Security & SLA Banner */}
        <div style={{ textAlign: 'center', margin: '4px 0 8px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.725rem',
              color: '#475569',
              backgroundColor: '#e2e8f0',
              padding: '4px 14px',
              borderRadius: '9999px',
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={14} color="#0f766e" />
            <span>BookLeaf Priority Author Communication • Verified Operations Channel</span>
          </div>
        </div>

        {/* Messages List */}
        {messages.map((msg, index) => {
          const isAuthor = msg.sender_role === 'author';
          const isAiDrafted = msg.is_ai_drafted;

          // Check if we should render a date separator
          const showDateSeparator =
            index === 0 ||
            formatMessageDate(msg.created_at) !== formatMessageDate(messages[index - 1]?.created_at);

          return (
            <React.Fragment key={msg.id || index}>
              {showDateSeparator && (
                <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0', gap: '12px' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {formatMessageDate(msg.created_at)}
                  </span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                </div>
              )}

              <div
                className="animate-fade-in"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isAuthor ? 'flex-end' : 'flex-start',
                  width: '100%',
                }}
              >
                {/* Sender Identity & Time Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '5px',
                    padding: '0 6px',
                    fontSize: '0.725rem',
                    color: '#64748b',
                  }}
                >
                  {!isAuthor ? (
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#0f766e',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                      }}
                    >
                      BL
                    </div>
                  ) : null}

                  <span style={{ fontWeight: 700, color: isAuthor ? '#0f766e' : '#0f172a' }}>
                    {isAuthor ? 'You (Author)' : msg.sender_name || 'BookLeaf Support Ops'}
                  </span>

                  {!isAuthor && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundColor: '#ccfbf1',
                        color: '#0f766e',
                        padding: '1px 7px',
                        borderRadius: '4px',
                      }}
                    >
                      Support Team
                    </span>
                  )}

                  <span>•</span>
                  <span>{formatMessageTime(msg.created_at)}</span>
                </div>

                {/* Message Bubble */}
                <div
                  style={{
                    maxWidth: '82%',
                    padding: '14px 18px',
                    borderRadius: isAuthor ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    background: isAuthor
                      ? 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)'
                      : '#ffffff',
                    color: isAuthor ? '#ffffff' : '#1e293b',
                    boxShadow: isAuthor
                      ? '0 3px 8px rgba(15, 118, 110, 0.28)'
                      : '0 2px 6px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
                    border: isAuthor ? 'none' : '1px solid #e2e8f0',
                    fontSize: '0.9rem',
                    lineHeight: 1.65,
                    whiteSpace: 'pre-wrap',
                    position: 'relative',
                    wordBreak: 'break-word',
                  }}
                >
                  {/* AI Grounded verification badge if applicable */}
                  {!isAuthor && isAiDrafted && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: '#0f766e',
                        backgroundColor: '#f0fdfa',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid #ccfbf1',
                        marginBottom: '10px',
                      }}
                    >
                      <Sparkles size={12} />
                      <span>BookLeaf Policy Grounded & Ops Specialist Verified</span>
                    </div>
                  )}

                  <div>{msg.message}</div>

                  {/* Attachment attached to this message */}
                  {msg.attachment_name && (
                    <div style={{ marginTop: '8px' }}>
                      <AttachmentPreview
                        name={msg.attachment_name}
                        url={msg.attachment_url}
                      />
                    </div>
                  )}
                  {isAuthor && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '3px',
                        marginTop: '6px',
                        fontSize: '0.675rem',
                        opacity: 0.85,
                      }}
                    >
                      <span>{formatMessageTime(msg.created_at)}</span>
                      <CheckCheck size={14} color="#5eead4" />
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* Optimistic Message Bubble while sending */}
        {optimisticSendingMessage && (
          <div
            className="animate-fade-in"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              width: '100%',
              opacity: 0.85,
            }}
          >
            <div style={{ fontSize: '0.725rem', color: '#0f766e', fontWeight: 700, marginBottom: '4px' }}>
              Sending...
            </div>
            <div
              style={{
                maxWidth: '82%',
                padding: '14px 18px',
                borderRadius: '20px 20px 4px 20px',
                background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                color: '#ffffff',
                boxShadow: '0 3px 8px rgba(15, 118, 110, 0.2)',
                fontSize: '0.9rem',
                lineHeight: 1.65,
                whiteSpace: 'pre-wrap',
              }}
            >
              <div>{optimisticSendingMessage}</div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '0.675rem' }}>
                <Clock size={12} />
                <span>Sending to operations...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Ticket Status Advisory Banner (if Resolved) */}
      {ticket.status === 'Resolved' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#fef3c7',
            border: '1px solid #fde68a',
            color: '#92400e',
            padding: '10px 16px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}
        >
          <Info size={16} />
          <span>
            This inquiry was marked as <strong>Resolved</strong>. If you still have questions, sending a reply below will automatically re-open it to <strong>In Progress</strong> with our team.
          </span>
        </div>
      )}

      {/* Modern Floating Chat Reply Composer */}
      {ticket.status !== 'Closed' ? (
        <form
          onSubmit={handleSendReply}
          className="card"
          style={{
            padding: '16px 20px',
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            border: '1px solid #cbd5e1',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {error && (
            <div
              style={{
                color: '#dc2626',
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          {/* Staged Attachment in Composer */}
          {isUploadingAttachment && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: '#f0fdfa',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#0f766e',
                fontWeight: 600,
              }}
            >
              <Loader2 size={16} className="animate-spin" />
              <span>Uploading attachment...</span>
            </div>
          )}

          {composerAttachmentName && composerAttachmentUrl && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px',
                backgroundColor: '#f0fdfa',
                border: '1px solid #99f6e4',
                borderRadius: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Paperclip size={15} color="#0f766e" />
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f766e' }}>
                  Staged to send: {composerAttachmentName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setComposerAttachmentName(null);
                  setComposerAttachmentUrl(null);
                }}
                className="btn-secondary"
                style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: '6px' }}
              >
                <X size={13} />
                <span>Remove</span>
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleComposerFileChange}
              accept="image/*,.pdf,.doc,.docx,.txt"
              style={{ display: 'none' }}
            />

            {/* Paperclip attachment button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending || isUploadingAttachment}
              className="btn-secondary"
              title="Attach screenshot or document"
              style={{
                height: '52px',
                width: '46px',
                padding: 0,
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                backgroundColor: composerAttachmentUrl ? '#ccfbf1' : '#ffffff',
                borderColor: composerAttachmentUrl ? '#0f766e' : '#cbd5e1',
                color: '#0f766e',
              }}
            >
              <Paperclip size={18} />
            </button>

            <textarea
              ref={textareaRef}
              className="form-textarea"
              rows={2}
              placeholder="Type your reply to BookLeaf support... (Press Enter to send, Shift+Enter for new line)"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              style={{
                resize: 'none',
                minHeight: '52px',
                maxHeight: '140px',
                borderRadius: '14px',
                padding: '12px 16px',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                border: '1px solid #cbd5e1',
                flex: 1,
              }}
            />

            <button
              type="submit"
              className="btn-primary"
              disabled={isSending || isUploadingAttachment || (!replyText.trim() && !composerAttachmentUrl)}
              style={{
                height: '52px',
                padding: '0 24px',
                borderRadius: '14px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
                boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)',
              }}
            >
              <Send size={16} />
              <span>{isSending ? 'Sending...' : 'Send'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.725rem', color: '#94a3b8', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CornerDownLeft size={12} />
              Press <strong>Enter ↵</strong> to send • <strong>Shift + Enter</strong> for line break
            </span>
            <span>⚡ Support response guaranteed within 24–48 hours</span>
          </div>
        </form>
      ) : (
        <div
          className="card"
          style={{
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#f1f5f9',
            color: '#64748b',
            fontSize: '0.875rem',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
          }}
        >
          This ticket is marked as <strong>Closed</strong>. Need further assistance on another inquiry? Please submit a new query from your author dashboard.
        </div>
      )}
    </div>
  );
};
