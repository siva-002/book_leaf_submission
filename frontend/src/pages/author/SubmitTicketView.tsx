import React, { useState } from 'react';
import { Book } from '../../types';
import { api } from '../../services/api';
import { AttachmentPreview } from '../../components/AttachmentPreview';
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  FileText,
  FileUp,
  HelpCircle,
  Info,
  Loader2,
  Paperclip,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';

interface SubmitTicketViewProps {
  books: Book[];
  preselectedBookId?: string | null;
  onTicketSubmitted: (newTicket: any) => void;
}

export const SubmitTicketView: React.FC<SubmitTicketViewProps> = ({
  books,
  preselectedBookId,
  onTicketSubmitted,
}) => {
  const [selectedBookId, setSelectedBookId] = useState<string>(preselectedBookId || 'general');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTicket, setSuccessTicket] = useState<any | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      setError(null);
      try {
        const uploadRes = await api.uploadFile(file);
        setAttachmentName(uploadRes.file.name);
        setAttachmentUrl(uploadRes.file.url);
      } catch (err: any) {
        setError(err.message || 'Failed to upload attachment. Please check file format and try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemoveAttachment = () => {
    setAttachmentName(null);
    setAttachmentUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError('Please provide both a subject title and a detailed description of your query.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.submitAuthorTicket({
        book_id: selectedBookId === 'general' ? null : selectedBookId,
        subject: subject.trim(),
        description: description.trim(),
        attachment_name: attachmentName || undefined,
        attachment_url: attachmentUrl || undefined,
      });

      setSuccessTicket(res.ticket);
      setSubject('');
      setDescription('');
      setAttachmentName(null);
      setAttachmentUrl(null);
      onTicketSubmitted(res.ticket);
    } catch (err: any) {
      setError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 className="font-serif" style={{ fontSize: '1.65rem', fontWeight: 600, color: '#0f172a', margin: '0 0 6px 0' }}>
          Submit an Author Support Inquiry
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
          Your query will be matched against BookLeaf's publishing knowledge base, prioritized by urgency, and assigned to the relevant department specialist.
        </p>
      </div>

      {/* Success Notification */}
      {successTicket && (
        <div
          className="card animate-fade-in"
          style={{
            backgroundColor: '#f0fdfa',
            border: '2px solid #0f766e',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            borderRadius: '16px',
            padding: '24px 28px',
            boxShadow: '0 4px 16px rgba(15, 118, 110, 0.12)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f766e' }}>
              <CheckCircle size={26} color="#0f766e" />
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#092e28' }}>
                Inquiry {successTicket.ticket_number} Submitted Successfully!
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: '#ccfbf1',
                  color: '#0f766e',
                  padding: '3px 10px',
                  borderRadius: '6px',
                }}
              >
                {successTicket.category}
              </span>
            </div>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
            Your request regarding <strong>"{successTicket.subject}"</strong> has been queued. Our support team assigned this inquiry under <em>{successTicket.category}</em>.
          </div>
          <div style={{ fontSize: '0.8rem', color: '#0f766e', backgroundColor: '#e6fffa', padding: '8px 14px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} />
            <span>Review Note: {successTicket.ai_reasoning || 'Standard review'} • Expected response: 24–48 hours</span>
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            padding: '14px 18px',
            borderRadius: '12px',
            fontSize: '0.875rem',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Inquiry Form */}
      <form
        onSubmit={handleSubmit}
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
          padding: '32px',
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Book Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
            Referenced Title or Service Category
          </label>
          <select
            className="form-select"
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
            style={{ borderRadius: '10px', padding: '11px 14px' }}
          >
            <option value="general">Account & General Query (Bank details, royalties payout, author profile)</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                📖 {b.title} ({b.status}) — ISBN: {b.isbn}
              </option>
            ))}
          </select>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Info size={13} color="#0f766e" />
            <span>Linking a specific book automatically attaches sales, print partner, and inventory records to your query.</span>
          </div>
        </div>

        {/* Subject Line */}
        <div>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
            Inquiry Subject Line
          </label>
          <input
            type="text"
            required
            className="form-input"
            placeholder="e.g. Royalty payout inquiry - pending ₹850 not reflected in quarterly transfer"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{ borderRadius: '10px' }}
          />
        </div>

        {/* Description Body */}
        <div>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
            Detailed Description & Context
          </label>
          <textarea
            required
            className="form-textarea"
            rows={5}
            placeholder="Please detail your question, relevant dates, retail platform links, or specific order IDs so our operations staff can assist immediately..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ borderRadius: '10px', lineHeight: 1.6 }}
          />
        </div>

        {/* Attachment Upload */}
        <div>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
            Supporting Documentation or Photos (Optional)
          </label>

          {isUploading ? (
            <div
              style={{
                border: '2px dashed #0f766e',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                backgroundColor: '#f0fdfa',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Loader2 size={24} color="#0f766e" className="animate-spin" />
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f766e' }}>
                Uploading attachment to BookLeaf portal...
              </div>
            </div>
          ) : attachmentUrl && attachmentName ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f766e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={15} color="#0f766e" />
                  Attachment Uploaded Successfully (Ready to Dispatch)
                </span>
                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  className="btn-secondary"
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    color: '#991b1b',
                    borderColor: '#fecaca',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <X size={13} />
                  <span>Remove</span>
                </button>
              </div>

              {/* Live Preview Card with Zoom / Open / Download */}
              <AttachmentPreview name={attachmentName} url={attachmentUrl} />
            </div>
          ) : (
            <div
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#faf8f5',
                cursor: 'pointer',
                position: 'relative',
                transition: 'border-color 0.2s ease',
              }}
            >
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.txt"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0,
                  cursor: 'pointer',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <FileUp size={24} color="#0f766e" />
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                  Click or drag file to attach (Images, PDF, Documents)
                </div>
                <div style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                  Photos of print defects, bank statements, or retail screenshots up to 15MB
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submission Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
            <ShieldCheck size={16} color="#0f766e" />
            <span>Expected response within 24–48 hours</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !subject.trim() || !description.trim()}
            className="btn-primary"
            style={{
              padding: '12px 28px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.9rem',
              boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)',
            }}
          >
            <Send size={16} />
            <span>{isSubmitting ? 'Submitting Inquiry...' : 'Dispatch Inquiry'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
