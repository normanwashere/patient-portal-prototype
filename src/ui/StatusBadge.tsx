/**
 * StatusBadge — Unified status/tag badge component
 *
 * Replaces the dozens of inline badge implementations across portals.
 * Uses CSS variables for consistent theming.
 */

import type { CSSProperties, ReactNode } from 'react';

export type BadgeVariant =
  | 'success' | 'warning' | 'error' | 'info'
  | 'purple' | 'pink' | 'cyan' | 'indigo'
  | 'muted' | 'primary';

export type BadgeSize = 'sm' | 'md';

interface StatusBadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
  dot?: boolean;
}

const VARIANT_COLORS: Record<BadgeVariant, { bg: string; fg: string }> = {
  success: { bg: 'var(--color-success-light)', fg: 'var(--color-success-dark)' },
  warning: { bg: 'var(--color-warning-light)', fg: 'var(--color-warning-dark)' },
  error:   { bg: 'var(--color-error-light)',   fg: 'var(--color-error-dark)' },
  info:    { bg: 'var(--color-info-light)',     fg: 'var(--color-info-dark)' },
  purple:  { bg: 'var(--color-purple-light)',   fg: 'var(--color-purple-dark)' },
  pink:    { bg: 'var(--color-pink-light)',     fg: 'var(--color-pink)' },
  cyan:    { bg: 'var(--color-cyan-light)',     fg: 'var(--color-cyan)' },
  indigo:  { bg: 'var(--color-indigo-light)',   fg: 'var(--color-indigo)' },
  muted:   { bg: 'var(--color-gray-100)',       fg: 'var(--color-gray-500)' },
  primary: { bg: 'var(--color-primary-light)',  fg: 'var(--color-primary-dark)' },
};

const SIZE_STYLES: Record<BadgeSize, CSSProperties> = {
  sm: { fontSize: 'var(--text-xs)', padding: '1px 6px', gap: 3 },
  md: { fontSize: 'var(--text-xs)', padding: '2px 8px', gap: 4 },
};

export function StatusBadge({
  variant = 'muted',
  size = 'md',
  icon,
  children,
  style,
  dot,
}: StatusBadgeProps) {
  const colors = VARIANT_COLORS[variant];
  const sizeStyle = SIZE_STYLES[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: sizeStyle.gap,
        fontSize: sizeStyle.fontSize,
        fontWeight: 600,
        padding: sizeStyle.padding,
        borderRadius: 'var(--radius-full)',
        background: colors.bg,
        color: colors.fg,
        lineHeight: 'var(--leading-normal)',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: colors.fg,
            flexShrink: 0,
          }}
        />
      )}
      {icon}
      {children}
    </span>
  );
}
