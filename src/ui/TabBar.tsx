/**
 * TabBar — Unified tab navigation component
 *
 * Replaces the inline tab implementations across all provider pages.
 */

import type { CSSProperties, ReactNode } from 'react';

interface TabItem<T extends string = string> {
  key: T;
  label: string;
  icon?: ReactNode;
  badge?: number;
}

interface TabBarProps<T extends string = string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (key: T) => void;
  variant?: 'underline' | 'pill';
  size?: 'sm' | 'md';
  style?: CSSProperties;
}

export function TabBar<T extends string = string>({
  tabs,
  active,
  onChange,
  variant = 'underline',
  size = 'md',
  style,
}: TabBarProps<T>) {
  const isUnderline = variant === 'underline';
  const isSm = size === 'sm';

  return (
    <div
      style={{
        display: 'flex',
        gap: isUnderline ? 0 : 'var(--space-1)',
        borderBottom: isUnderline ? '2px solid var(--color-border)' : undefined,
        marginBottom: 'var(--space-5)',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        ...style,
      }}
    >
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: isUnderline
                ? (isSm ? '6px 12px' : 'var(--space-2) var(--space-4)')
                : (isSm ? '5px 10px' : '6px 14px'),
              fontSize: isSm ? 'var(--text-xs)' : 'var(--text-sm)',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
              background: isUnderline
                ? 'transparent'
                : (isActive ? 'var(--color-primary-transparent)' : 'transparent'),
              border: isUnderline
                ? 'none'
                : `1px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderBottom: isUnderline
                ? `2px solid ${isActive ? 'var(--color-primary)' : 'transparent'}`
                : undefined,
              marginBottom: isUnderline ? -2 : 0,
              borderRadius: isUnderline ? 0 : 'var(--radius-md)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)',
            }}
          >
            {t.icon}
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span
                style={{
                  background: 'var(--color-error)',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 5px',
                }}
              >
                {t.badge > 99 ? '99+' : t.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
