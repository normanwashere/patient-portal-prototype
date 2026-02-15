/**
 * Modal — Unified modal/dialog component
 *
 * Replaces the dozens of inline modal implementations across portals.
 */

import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: number;
  style?: CSSProperties;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidth = 540,
  style,
}: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 'var(--z-modal)' as unknown as number,
        padding: 'var(--space-4)',
        animation: 'pageFadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          ...style,
        }}
      >
        {/* Header */}
        {title && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-5)',
              borderBottom: '1px solid var(--color-border)',
              flexShrink: 0,
            }}
          >
            <h2
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 700,
                color: 'var(--color-text)',
                margin: 0,
              }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Body */}
        <div
          style={{
            padding: 'var(--space-5)',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--space-2)',
              padding: 'var(--space-4) var(--space-5)',
              borderTop: '1px solid var(--color-border)',
              flexShrink: 0,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
