import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Ticket, TicketCategory, TicketPriority, TicketStatus, TicketMessage } from '../../types';
import { api } from '../../services/api';
import { getSocket } from '../../services/socket';
import { StatusPill, PriorityPill, CategoryPill } from '../../components/StatusBadge';
import { AttachmentPreview } from '../../components/AttachmentPreview';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Check,
  CheckCheck,
  CheckCircle,
  Clock,
  CornerDownLeft,
  Edit3,
  Loader2,
  Lock,
  MessageSquare,
  Paperclip,
  RefreshCw,
  Send,
  Shield,
  Sparkles,
  User,
  X,
  Zap,
} from 'lucide-react';

interface AdminTicketDetailProps {
  ticketId: string;
  onBack: () => void;
  onTicketUpdated: (updatedTicket: Ticket) => void;
}

// Clean deduplication helper
const deduplicateAdminMessages = (msgs: TicketMessage[] = []): TicketMessage[] => {
  const result: TicketMessage[] = [];
  const seenIds = new Set<string>();

  for (const m of msgs) {
    if (seenIds.has(m.id)) continue;
    seenIds.add(m.id);

    const last = result[result.length - 1];
    if (
      last &&
      last.sender_id === m.sender_id &&
      last.message.trim() === m.message.trim() &&
      last.is_internal_note === m.is_internal_note &&
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

const formatMessageTime = (dateStr?: string) => {
  if (!dateStr) return 'Just now';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatMessageDate = (dateStr?: string) => {
  if (!dateStr) return 'Today';
  const d = new Date(dateStr);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const AdminTicketDetail: React.FC<AdminTicketDetailProps> = ({
  ticketId,
  onBack,
  onTicketUpdated,
}) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [aiDraft, setAiDraft] = useState<string>('');
  const [editableDraft, setEditableDraft] = useState<string>('');
  const [internalNote, setInternalNote] = useState<string>('');
  const [chatComposerText, setChatComposerText] = useState<string>('');
  const [composerMode, setComposerMode] = useState<'reply' | 'internal_note'>('reply');

  const [composerAttachmentName, setComposerAttachmentName] = useState<string | null>(null);
  const [composerAttachmentUrl, setComposerAttachmentUrl] = useState<string | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false);
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);
  const [isRegeneratingDraft, setIsRegeneratingDraft] = useState<boolean>(false);
  const [isAutoDrafting, setIsAutoDrafting] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendingLockRef = useRef<boolean>(false);
  const noteLockRef = useRef<boolean>(false);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Message deduplication helper
  const addMessageDeduplicated = useCallback((newMsg: TicketMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === newMsg.id)) return prev;

      const isDuplicateContent = prev.some((m) => {
        if (
          m.sender_id !== newMsg.sender_id ||
          m.message.trim() !== newMsg.message.trim() ||
          m.is_internal_note !== newMsg.is_internal_note
        ) {
          return false;
        }
        const t1 = new Date(m.created_at || Date.now()).getTime();
        const t2 = new Date(newMsg.created_at || Date.now()).getTime();
        return Math.abs(t1 - t2) < 3000;
      });

      if (isDuplicateContent) return prev;
      return [...prev, newMsg];
    });
  }, []);

  const fetchTicketDetails = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminTicketById(ticketId);
      setTicket(res.ticket);
      setMessages(deduplicateAdminMessages(res.ticket.messages || []));
      const draft = res.aiDraft || res.ticket.ai_draft_response || '';
      setAiDraft(draft);
      setEditableDraft(draft);

      // If draft is not yet generated, load it asynchronously in background without blocking page render
      if (!draft) {
        setIsAutoDrafting(true);
        api.regenerateAIDraft(ticketId)
          .then((draftRes) => {
            if (draftRes.draft) {
              setAiDraft(draftRes.draft);
              setEditableDraft((prev) => (prev ? prev : draftRes.draft));
            }
          })
          .catch((err) => {
            console.warn('Async draft generation note:', err);
          })
          .finally(() => {
            setIsAutoDrafting(false);
          });
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching ticket details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId]);

  // Real-time synchronization
  useEffect(() => {
    const socket = getSocket();

    const joinCurrentTicket = () => {
      socket.emit('join:ticket', ticketId);
    };

    joinCurrentTicket();

    const handleNewMessage = (newMsg: TicketMessage) => {
      if (newMsg.ticket_id && newMsg.ticket_id !== ticketId) return;
      addMessageDeduplicated(newMsg);
    };

    const handleInternalNote = (data: { ticketId: string; note: TicketMessage }) => {
      if (data.ticketId === ticketId) {
        addMessageDeduplicated(data.note);
      }
    };

    const handleTicketUpdated = (updated: any) => {
      if (updated.id === ticketId || updated.ticketId === ticketId) {
        setTicket((prev) => (prev ? { ...prev, ...updated } : null));
        onTicketUpdated(updated);
      }
    };

    const handleDraftReady = (data: { ticketId: string; draft: string }) => {
      if (data.ticketId === ticketId) {
        setAiDraft(data.draft);
        setEditableDraft((prev) => (prev ? prev : data.draft));
        setIsAutoDrafting(false);
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('ticket:internal_note', handleInternalNote);
    socket.on('ticket:updated', handleTicketUpdated);
    socket.on('ticket:draft_ready', handleDraftReady);
    socket.on('connect', joinCurrentTicket);

    return () => {
      socket.emit('leave:ticket', ticketId);
      socket.off('message:new', handleNewMessage);
      socket.off('ticket:internal_note', handleInternalNote);
      socket.off('ticket:updated', handleTicketUpdated);
      socket.off('ticket:draft_ready', handleDraftReady);
      socket.off('connect', joinCurrentTicket);
    };
  }, [ticketId, addMessageDeduplicated, onTicketUpdated]);


  const handleUpdateStatus = async (newStatus: TicketStatus) => {
    if (!ticket) return;
    try {
      const res = await api.updateAdminTicket(ticket.id, { status: newStatus });
      setTicket(res.ticket);
      onTicketUpdated(res.ticket);
      showSuccessBanner(`Status updated to ${newStatus}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleOverrideCategory = async (newCategory: TicketCategory) => {
    if (!ticket) return;
    try {
      const res = await api.updateAdminTicket(ticket.id, { category: newCategory });
      setTicket(res.ticket);
      onTicketUpdated(res.ticket);
      showSuccessBanner(`Category overridden to: ${newCategory}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleOverridePriority = async (newPriority: TicketPriority) => {
    if (!ticket) return;
    try {
      const res = await api.updateAdminTicket(ticket.id, { priority: newPriority });
      setTicket(res.ticket);
      onTicketUpdated(res.ticket);
      showSuccessBanner(`Priority overridden to: ${newPriority}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAssignAgent = async (agentName: string) => {
    if (!ticket) return;
    try {
      const res = await api.updateAdminTicket(ticket.id, { assigned_to: agentName });
      setTicket(res.ticket);
      onTicketUpdated(res.ticket);
      showSuccessBanner(`Assigned to ${agentName}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Add internal note
  const handleAddInternalNote = async (noteText: string) => {
    if (noteLockRef.current || isAddingNote || !noteText.trim() || !ticket) return;

    noteLockRef.current = true;
    setIsAddingNote(true);
    const noteContent = noteText.trim();

    try {
      const res = await api.addAdminInternalNote(ticket.id, noteContent);
      addMessageDeduplicated(res.note);
      showSuccessBanner('Internal note saved (hidden from author).');
      setInternalNote('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAddingNote(false);
      noteLockRef.current = false;
    }
  };

  // Send official response with strict synchronous lock
  const handleSendOfficialReply = async (messageText: string, markResolved = false) => {
    if (sendingLockRef.current || isSendingReply || (!messageText.trim() && !composerAttachmentUrl) || !ticket) return;

    sendingLockRef.current = true;
    setIsSendingReply(true);
    const replyContent = messageText.trim();
    const attachName = composerAttachmentName;
    const attachUrl = composerAttachmentUrl;

    try {
      const res = await api.sendAdminOfficialReply(ticket.id, {
        message: replyContent,
        is_ai_drafted: true,
        markResolved,
        attachment_name: attachName || undefined,
        attachment_url: attachUrl || undefined,
      });

      addMessageDeduplicated(res.sentMessage);
      setTicket((prev) => (prev ? { ...prev, status: res.ticketStatus as TicketStatus } : null));
      onTicketUpdated({ ...(ticket as Ticket), status: res.ticketStatus as TicketStatus });
      showSuccessBanner(markResolved ? 'Response sent and ticket marked as Resolved!' : 'Official response sent to author.');
      setChatComposerText('');
      setComposerAttachmentName(null);
      setComposerAttachmentUrl(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSendingReply(false);
      sendingLockRef.current = false;
    }
  };

  const handleChatComposerSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!chatComposerText.trim() && !composerAttachmentUrl) return;

    if (composerMode === 'internal_note') {
      await handleAddInternalNote(chatComposerText);
      setChatComposerText('');
    } else {
      await handleSendOfficialReply(chatComposerText, false);
    }
  };

  const handleRegenerateDraft = async () => {
    if (!ticket) return;
    setIsRegeneratingDraft(true);
    try {
      const res = await api.regenerateAIDraft(ticket.id);
      setAiDraft(res.draft);
      setEditableDraft(res.draft);
      showSuccessBanner('AI draft refreshed with BookLeaf Knowledge Base.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRegeneratingDraft(false);
    }
  };

  const showSuccessBanner = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  if (isLoading || !ticket) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#64748b' }}>
        Loading ticket intelligence studio...
      </div>
    );
  }

  const author = ticket.author;
  const book = ticket.book;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Breadcrumb & Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={onBack}
          className="btn-secondary"
          style={{ padding: '7px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '10px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Ticket Queue</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <StatusPill status={ticket.status} />
          <PriorityPill priority={ticket.priority} overridden={ticket.priority_overridden} />
          <CategoryPill category={ticket.category} overridden={ticket.category_overridden} />
        </div>
      </div>

      {/* Success / Error Banners */}
      {actionSuccess && (
        <div
          className="animate-fade-in"
          style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '12px 18px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
          }}
        >
          <Check size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '12px 18px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* 2-Column Responsive Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(360px, 1fr)', gap: '24px' }}>
        {/* Left Column: Author Intel, Chat Stream & Quick Composer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Ticket Header & Author Context Card */}
          <div
            className="card"
            style={{
              padding: '22px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              borderLeft: '5px solid #0f766e',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f766e', fontFamily: 'var(--font-mono)' }}>
                  {ticket.ticket_number}
                </span>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0', lineHeight: 1.3 }}>
                  {ticket.subject}
                </h1>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={13} />
                <span>Opened {new Date(ticket.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Author Profile Strip */}
            {author && (
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={15} color="#0f766e" />
                    <span>{author.name}</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({author.city || 'India'})</span>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                    {author.email} • {author.phone || 'Phone verified'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#0f766e', fontWeight: 700 }}>
                    {author.books ? `${author.books.length} Catalog Books` : 'Author Account'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    Joined: {author.joined_date || '2023'}
                  </div>
                </div>
              </div>
            )}

            {/* Linked Book Quickstrip */}
            {book ? (
              <div style={{ fontSize: '0.825rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <BookOpen size={16} color="#0f766e" />
                <span>
                  Linked Book: <strong>{book.title}</strong> (ISBN: {book.isbn} • {book.status})
                </span>
                <span style={{ marginLeft: 'auto', color: '#d97706', fontWeight: 700, fontSize: '0.8rem' }}>
                  Pending Royalty: ₹{book.royalty_pending?.toLocaleString()}
                </span>
              </div>
            ) : (
              <div style={{ fontSize: '0.825rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={16} color="#64748b" />
                <span>General / Account Level Support Inquiry</span>
              </div>
            )}

            {/* Author Attached Evidence / Case Document */}
            {ticket.attachment_name && (
              <div style={{ marginTop: '6px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Author Submitted Attachment / Case Evidence:
                </div>
                <AttachmentPreview
                  name={ticket.attachment_name}
                  url={ticket.attachment_url}
                  compact={false}
                />
              </div>
            )}
          </div>

          {/* Conversation Stream & Chat History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Conversation & Operations Activity Log
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                {messages.length} message(s)
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                minHeight: '440px',
                maxHeight: '560px',
                overflowY: 'auto',
                padding: '20px 18px',
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
              }}
            >
              {messages.map((m, index) => {
                const isInternal = m.is_internal_note;
                const isAuthor = m.sender_role === 'author';

                // Check date separator
                const showDateSeparator =
                  index === 0 ||
                  formatMessageDate(m.created_at) !== formatMessageDate(messages[index - 1]?.created_at);

                return (
                  <React.Fragment key={m.id || index}>
                    {showDateSeparator && (
                      <div style={{ display: 'flex', alignItems: 'center', margin: '6px 0', gap: '10px' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                        <span style={{ fontSize: '0.675rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                          {formatMessageDate(m.created_at)}
                        </span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                      </div>
                    )}

                    {/* Internal Team Note */}
                    {isInternal ? (
                      <div
                        className="animate-fade-in"
                        style={{
                          padding: '14px 18px',
                          backgroundColor: '#fffbeb',
                          borderLeft: '4px solid #d97706',
                          borderTop: '1px solid #fde68a',
                          borderRight: '1px solid #fde68a',
                          borderBottom: '1px solid #fde68a',
                          borderRadius: '12px',
                          boxShadow: '0 1px 3px rgba(217, 119, 6, 0.08)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b45309', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                            <Lock size={13} />
                            <span>Internal Staff Note (Hidden from Author)</span>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: '#92400e' }}>
                            {formatMessageTime(m.created_at)}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', lineHeight: 1.5, color: '#78350f', whiteSpace: 'pre-wrap' }}>
                          {m.message}
                        </div>
                      </div>
                    ) : (
                      /* Regular Chat Bubble */
                      <div
                        className="animate-fade-in"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isAuthor ? 'flex-start' : 'flex-end',
                          width: '100%',
                        }}
                      >
                        {/* Header info */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginBottom: '4px',
                            padding: '0 4px',
                            fontSize: '0.725rem',
                            color: '#64748b',
                          }}
                        >
                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: isAuthor ? '#e2e8f0' : '#0f766e',
                              color: isAuthor ? '#475569' : '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                            }}
                          >
                            {isAuthor ? <User size={11} /> : <Shield size={11} />}
                          </div>

                          <span style={{ fontWeight: 700, color: isAuthor ? '#0f172a' : '#0f766e' }}>
                            {m.sender_name}
                          </span>

                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              backgroundColor: isAuthor ? '#f1f5f9' : '#ccfbf1',
                              color: isAuthor ? '#64748b' : '#0f766e',
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {isAuthor ? 'Author' : 'BookLeaf Operations'}
                          </span>

                          <span>•</span>
                          <span>{formatMessageTime(m.created_at)}</span>
                        </div>

                        {/* Message Bubble Body */}
                        <div
                          style={{
                            maxWidth: '85%',
                            padding: '14px 18px',
                            borderRadius: isAuthor ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                            background: isAuthor
                              ? '#ffffff'
                              : 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
                            color: isAuthor ? '#1e293b' : '#ffffff',
                            border: isAuthor ? '1px solid #e2e8f0' : 'none',
                            boxShadow: isAuthor
                              ? '0 1px 4px rgba(0, 0, 0, 0.07)'
                              : '0 3px 8px rgba(15, 118, 110, 0.28)',
                            fontSize: '0.875rem',
                            lineHeight: 1.6,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {m.is_ai_drafted && !isAuthor && (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                color: '#0f766e',
                                backgroundColor: '#f0fdfa',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                border: '1px solid #ccfbf1',
                                marginBottom: '8px',
                              }}
                            >
                              <Sparkles size={10} />
                              <span>AI Grounded & Ops Verified</span>
                            </div>
                          )}

                          <div>{m.message}</div>

                          {/* Message attachment */}
                          {m.attachment_name && (
                            <div style={{ marginTop: '8px' }}>
                              <AttachmentPreview
                                name={m.attachment_name}
                                url={m.attachment_url}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Composer for Chat Stream (Reply / Private Note) */}
            <form
              onSubmit={handleChatComposerSubmit}
              className="card"
              style={{
                padding: '16px',
                backgroundColor: composerMode === 'internal_note' ? '#fffbeb' : '#ffffff',
                border: composerMode === 'internal_note' ? '1px solid #fde68a' : '1px solid #cbd5e1',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Mode Selector Tabs */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setComposerMode('reply')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: composerMode === 'reply' ? '#0f766e' : '#f1f5f9',
                      color: composerMode === 'reply' ? '#ffffff' : '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Send size={12} />
                    <span>Send Official Reply</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setComposerMode('internal_note')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: composerMode === 'internal_note' ? '#d97706' : '#f1f5f9',
                      color: composerMode === 'internal_note' ? '#ffffff' : '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Lock size={12} />
                    <span>Private Internal Note</span>
                  </button>
                </div>

                <span style={{ fontSize: '0.7rem', color: composerMode === 'internal_note' ? '#b45309' : '#64748b' }}>
                  {composerMode === 'internal_note' ? '🔒 Visible only to BookLeaf Staff' : 'Visible to author'}
                </span>
              </div>

              {/* Staged Attachment in Admin Composer */}
              {isUploadingAttachment && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    backgroundColor: '#f0fdfa',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    color: '#0f766e',
                    fontWeight: 600,
                  }}
                >
                  <Loader2 size={14} className="animate-spin" />
                  <span>Uploading attachment...</span>
                </div>
              )}

              {composerAttachmentName && composerAttachmentUrl && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 12px',
                    backgroundColor: '#f0fdfa',
                    border: '1px solid #99f6e4',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Paperclip size={14} color="#0f766e" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f766e' }}>
                      Staged: {composerAttachmentName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setComposerAttachmentName(null);
                      setComposerAttachmentUrl(null);
                    }}
                    className="btn-secondary"
                    style={{ padding: '2px 6px', fontSize: '0.7rem', borderRadius: '4px' }}
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
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
                  disabled={isSendingReply || isAddingNote || isUploadingAttachment}
                  className="btn-secondary"
                  title="Attach file or guidelines"
                  style={{
                    height: '48px',
                    width: '42px',
                    padding: 0,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    backgroundColor: composerAttachmentUrl ? '#ccfbf1' : '#ffffff',
                    borderColor: composerAttachmentUrl ? '#0f766e' : '#cbd5e1',
                    color: '#0f766e',
                  }}
                >
                  <Paperclip size={16} />
                </button>

                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder={
                    composerMode === 'internal_note'
                      ? 'Type internal note for team (e.g. escalated ISBN fix to printer partner)...'
                      : 'Type quick reply to author (or use AI Support on the right)...'
                  }
                  value={chatComposerText}
                  onChange={(e) => setChatComposerText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleChatComposerSubmit();
                    }
                  }}
                  disabled={isSendingReply || isAddingNote}
                  style={{
                    resize: 'none',
                    minHeight: '48px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    fontSize: '0.85rem',
                    flex: 1,
                  }}
                />

                <button
                  type="submit"
                  disabled={(!chatComposerText.trim() && !composerAttachmentUrl) || isSendingReply || isAddingNote || isUploadingAttachment}
                  className="btn-primary"
                  style={{
                    height: '48px',
                    padding: '0 18px',
                    borderRadius: '12px',
                    flexShrink: 0,
                    backgroundColor: composerMode === 'internal_note' ? '#d97706' : '#0f766e',
                  }}
                >
                  <Send size={15} />
                  <span>{isSendingReply || isAddingNote ? 'Saving...' : 'Send'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CornerDownLeft size={11} />
                  Press Enter ↵ to send • Shift + Enter for new line
                </span>
                {editableDraft && (
                  <button
                    type="button"
                    onClick={() => setChatComposerText(editableDraft)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0f766e',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.7rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <Zap size={11} />
                    <span>Paste AI Draft Here</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: AI Support & Ticket Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Controls & Overrides Card */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', borderRadius: '16px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Edit3 size={16} color="#0f766e" />
              <span>Ticket Controls & Overrides</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Lifecycle Status */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Lifecycle Status
                </label>
                <select
                  className="form-select"
                  value={ticket.status}
                  onChange={(e) => handleUpdateStatus(e.target.value as TicketStatus)}
                  style={{ fontSize: '0.8rem', padding: '8px 10px', borderRadius: '8px' }}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Assigned Agent */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Assigned Agent
                </label>
                <select
                  className="form-select"
                  value={ticket.assigned_to || 'unassigned'}
                  onChange={(e) => handleAssignAgent(e.target.value === 'unassigned' ? '' : e.target.value)}
                  style={{ fontSize: '0.8rem', padding: '8px 10px', borderRadius: '8px' }}
                >
                  <option value="unassigned">Unassigned</option>
                  <option value="BookLeaf Support Ops">BookLeaf Support Ops</option>
                  <option value="Production Lead">Production Lead</option>
                  <option value="Accounts / Royalties Lead">Accounts / Royalties Lead</option>
                </select>
              </div>
            </div>

            {/* AI Category Override */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                  Category (AI Classified)
                </label>
                {ticket.category_overridden && (
                  <span style={{ fontSize: '0.65rem', color: '#d97706', fontWeight: 700 }}>Overridden by Admin</span>
                )}
              </div>
              <select
                className="form-select"
                value={ticket.category}
                onChange={(e) => handleOverrideCategory(e.target.value as TicketCategory)}
                style={{ fontSize: '0.8rem', padding: '8px 10px', borderRadius: '8px' }}
              >
                <option value="Royalty & Payments">Royalty & Payments</option>
                <option value="ISBN & Metadata Issues">ISBN & Metadata Issues</option>
                <option value="Printing & Quality">Printing & Quality</option>
                <option value="Distribution & Availability">Distribution & Availability</option>
                <option value="Book Status & Production Updates">Book Status & Production Updates</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>

            {/* AI Priority Override */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                  Priority Score (AI Assessed)
                </label>
                {ticket.priority_overridden && (
                  <span style={{ fontSize: '0.65rem', color: '#d97706', fontWeight: 700 }}>Overridden by Admin</span>
                )}
              </div>
              <select
                className="form-select"
                value={ticket.priority}
                onChange={(e) => handleOverridePriority(e.target.value as TicketPriority)}
                style={{ fontSize: '0.8rem', padding: '8px 10px', borderRadius: '8px' }}
              >
                <option value="Critical">Critical Priority</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
              <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '5px', fontStyle: 'italic' }}>
                AI Assessment: {ticket.ai_reasoning || 'Standard review'}
              </div>
            </div>
          </div>

          {/* AI Support Card */}
          <div
            className="card"
            style={{
              padding: '24px',
              border: '2px solid #0f766e',
              boxShadow: '0 10px 25px -5px rgba(15, 118, 110, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              borderRadius: '16px',
              background: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#0f766e" />
                <span className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0f766e' }}>
                  AI Support Assistant
                </span>
              </div>

              <button
                type="button"
                onClick={handleRegenerateDraft}
                disabled={isRegeneratingDraft}
                className="btn-secondary"
                style={{ padding: '5px 10px', fontSize: '0.75rem', borderRadius: '8px' }}
                title="Regenerate draft using BookLeaf Knowledge Base"
              >
                <RefreshCw size={12} className={isRegeneratingDraft ? 'animate-pulse-subtle' : ''} />
                <span>{isRegeneratingDraft ? 'Generating...' : 'Regenerate Draft'}</span>
              </button>
            </div>

            <div style={{ fontSize: '0.775rem', color: '#334155', backgroundColor: '#f0fdfa', padding: '10px 14px', borderRadius: '10px', border: '1px solid #ccfbf1' }}>
              Prepared using <strong>BookLeaf {ticket.category} Rules</strong>. Review, edit, and approve before sending to author.
            </div>

            {/* Editable Response Textarea */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.775rem', fontWeight: 700, color: '#1e293b' }}>
                  Official Author Response Message
                </label>
                {isAutoDrafting && (
                  <span style={{ fontSize: '0.725rem', color: '#0f766e', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                    <RefreshCw size={11} className="animate-pulse-subtle" />
                    AI is drafting suggested response...
                  </span>
                )}
              </div>
              <textarea
                className="form-textarea"
                rows={10}
                placeholder={isAutoDrafting ? "AI is preparing suggested response based on BookLeaf rules..." : "Type official response..."}
                value={editableDraft}
                onChange={(e) => setEditableDraft(e.target.value)}
                style={{ fontSize: '0.85rem', lineHeight: 1.6, borderRadius: '10px' }}
              />
            </div>

            {/* Action Buttons with Single-Click Locks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleSendOfficialReply(editableDraft, false)}
                disabled={isSendingReply || !editableDraft.trim()}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '11px', borderRadius: '10px' }}
              >
                <Send size={15} />
                <span>{isSendingReply ? 'Dispatching Response...' : 'Dispatch Official Response (In Progress)'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendOfficialReply(editableDraft, true)}
                disabled={isSendingReply || !editableDraft.trim()}
                className="btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '11px',
                  borderRadius: '10px',
                  color: '#059669',
                  borderColor: '#a7f3d0',
                  backgroundColor: '#f0fdf4',
                  fontWeight: 700,
                }}
              >
                <CheckCircle size={15} color="#059669" />
                <span>Send Response & Mark as Resolved</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
