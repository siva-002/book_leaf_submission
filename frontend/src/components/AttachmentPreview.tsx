import React, { useState } from 'react';
import { getUploadUrl } from '../config';
import {
  Download,
  ExternalLink,
  Eye,
  FileText,
  Image as ImageIcon,
  Maximize2,
  Paperclip,
  X,
  ZoomIn,
} from 'lucide-react';

interface AttachmentPreviewProps {
  name: string;
  url?: string | null;
  compact?: boolean;
}

const isImageFile = (fileName: string): boolean => {
  const ext = fileName.toLowerCase().split('.').pop() || '';
  return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp'].includes(ext);
};

const isPdfFile = (fileName: string): boolean => {
  const ext = fileName.toLowerCase().split('.').pop() || '';
  return ext === 'pdf';
};

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  name,
  url,
  compact = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Resolve upload URL (absolute or relative)
  const resolvedUrl = getUploadUrl(url);

  const isImg = isImageFile(name) && !imgError && Boolean(resolvedUrl);
  const isPdf = isPdfFile(name);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!resolvedUrl) return;
    const a = document.createElement('a');
    a.href = resolvedUrl;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenNewTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (resolvedUrl) {
      window.open(resolvedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Compact badge rendering (e.g. for small headers)
  if (compact) {
    return (
      <>
        <div
          onClick={() => {
            if (isImg) setIsModalOpen(true);
            else if (resolvedUrl) handleOpenNewTab({ stopPropagation: () => {} } as any);
          }}
          title={resolvedUrl ? `Click to view ${name}` : name}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#ffffff',
            border: '1px solid #ccfbf1',
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#0f766e',
            cursor: resolvedUrl ? 'pointer' : 'default',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'all 0.2s ease',
          }}
        >
          {isImg ? <ImageIcon size={13} color="#0f766e" /> : <FileText size={13} color="#0f766e" />}
          <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </span>
          {resolvedUrl && <Eye size={12} color="#0f766e" style={{ opacity: 0.7 }} />}
        </div>

        {/* Modal for Lightbox */}
        {isModalOpen && resolvedUrl && (
          <ImageLightboxModal
            name={name}
            url={resolvedUrl}
            onClose={() => setIsModalOpen(false)}
            onDownload={handleDownload}
            onNewTab={handleOpenNewTab}
          />
        )}
      </>
    );
  }

  // Standard full preview card
  return (
    <>
      <div
        className="attachment-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#faf8f5',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          maxWidth: '380px',
          margin: '8px 0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        {/* If image, display interactive preview thumbnail */}
        {isImg && resolvedUrl && (
          <div
            onClick={() => setIsModalOpen(true)}
            style={{
              position: 'relative',
              width: '100%',
              height: '180px',
              backgroundColor: '#092e28',
              cursor: 'zoom-in',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={resolvedUrl}
              alt={name}
              onError={() => setImgError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                backgroundColor: 'rgba(9, 46, 40, 0.75)',
                color: '#ffffff',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.7rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backdropFilter: 'blur(4px)',
              }}
            >
              <Maximize2 size={12} />
              <span>Click to Expand</span>
            </div>
          </div>
        )}

        {/* File metadata & Actions bar */}
        <div
          style={{
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            backgroundColor: '#ffffff',
            borderTop: isImg && resolvedUrl ? '1px solid #f1f5f9' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: isImg ? '#ecfdf5' : isPdf ? '#fef2f2' : '#f0fdfa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isImg ? (
                <ImageIcon size={16} color="#059669" />
              ) : isPdf ? (
                <FileText size={16} color="#dc2626" />
              ) : (
                <Paperclip size={16} color="#0f766e" />
              )}
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={name}
              >
                {name}
              </div>
              <div style={{ fontSize: '0.675rem', color: '#64748b' }}>
                {isImg ? 'Image Evidence' : isPdf ? 'PDF Document' : 'Attached File'}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            {resolvedUrl && (
              <>
                {isImg ? (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="btn-secondary"
                    style={{
                      padding: '5px 8px',
                      fontSize: '0.725rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderRadius: '6px',
                    }}
                    title="View preview"
                  >
                    <Eye size={13} />
                    <span>View</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenNewTab}
                    className="btn-secondary"
                    style={{
                      padding: '5px 8px',
                      fontSize: '0.725rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderRadius: '6px',
                    }}
                    title="Open document in new tab"
                  >
                    <ExternalLink size={13} />
                    <span>Open</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDownload}
                  className="btn-secondary"
                  style={{
                    padding: '5px 8px',
                    fontSize: '0.725rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    borderRadius: '6px',
                  }}
                  title="Download file"
                >
                  <Download size={13} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isModalOpen && resolvedUrl && (
        <ImageLightboxModal
          name={name}
          url={resolvedUrl}
          onClose={() => setIsModalOpen(false)}
          onDownload={handleDownload}
          onNewTab={handleOpenNewTab}
        />
      )}
    </>
  );
};

// Lightbox Modal for high-res preview
const ImageLightboxModal: React.FC<{
  name: string;
  url: string;
  onClose: () => void;
  onDownload: (e: React.MouseEvent) => void;
  onNewTab: (e: React.MouseEvent) => void;
}> = ({ name, url, onClose, onDownload, onNewTab }) => {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(9, 46, 40, 0.88)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      {/* Top Header Controls */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '960px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#ffffff',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ImageIcon size={18} color="#5eead4" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{name}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onNewTab}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ExternalLink size={14} />
            <span>Open in Tab</span>
          </button>

          <button
            onClick={onDownload}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Download size={14} />
            <span>Download</span>
          </button>

          <button
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              border: 'none',
              color: '#ffffff',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Image View */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '960px',
          maxHeight: '80vh',
          backgroundColor: '#031411',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <img
          src={url}
          alt={name}
          style={{
            maxWidth: '100%',
            maxHeight: '80vh',
            objectFit: 'contain',
            borderRadius: '16px',
          }}
        />
      </div>
    </div>
  );
};
