/**
 * PageHeader — Unified page title/subtitle component
 *
 * Standardizes the page header pattern across all three portals.
 */

import type { CSSProperties, ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  style?: CSSProperties;
}

export function PageHeader({ title, subtitle, icon, actions, style }: PageHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
        flexWrap: 'wrap',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {icon && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
            }}
          >
            {icon}
          </div>
        )}
        <div>
          <h1
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 800,
              color: 'var(--color-text)',
              letterSpacing: '-0.01em',
              lineHeight: 'var(--leading-tight)',
              margin: 0,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                marginTop: 'var(--space-1)',
                margin: 0,
                marginBlockStart: 'var(--space-1)',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
