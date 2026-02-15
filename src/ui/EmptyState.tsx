/**
 * EmptyState — Unified empty/no-data state component
 *
 * Replaces various inline empty state implementations.
 */

import type { CSSProperties, ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  style?: CSSProperties;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  style,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-12) var(--space-6)',
        textAlign: 'center',
        ...style,
      }}
    >
      <div
        style={{
          color: 'var(--color-gray-300)',
          marginBottom: 'var(--space-4)',
        }}
      >
        {icon || <Inbox size={48} />}
      </div>
      <div
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 600,
          color: 'var(--color-text)',
          marginBottom: 'var(--space-2)',
        }}
      >
        {title}
      </div>
      {description && (
        <div
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            maxWidth: 400,
            lineHeight: 'var(--leading-relaxed)',
          }}
        >
          {description}
        </div>
      )}
      {action && (
        <div style={{ marginTop: 'var(--space-5)' }}>
          {action}
        </div>
      )}
    </div>
  );
}
