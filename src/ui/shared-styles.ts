/**
 * Shared Inline Style Presets
 *
 * Reusable style objects for common UI patterns across all three portals.
 * These use CSS variables so they automatically respect theming.
 *
 * Usage:
 *   import { styles } from '../ui/shared-styles';
 *   <div style={styles.card}>...</div>
 *   <div style={{ ...styles.card, ...styles.cardHover }}>...</div>
 */

import type { CSSProperties } from 'react';

/* ── Page Layout ── */
export const pageContainer: CSSProperties = {
  padding: 'var(--space-6) var(--space-5)',
  maxWidth: 'var(--content-max-width)',
  margin: '0 auto',
};

export const pageTitle: CSSProperties = {
  fontSize: 'var(--text-2xl)',
  fontWeight: 800,
  color: 'var(--color-text)',
  letterSpacing: '-0.01em',
  lineHeight: 'var(--leading-tight)',
  margin: 0,
};

export const pageSubtitle: CSSProperties = {
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-muted)',
  marginTop: 'var(--space-1)',
};

export const sectionTitle: CSSProperties = {
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 'var(--space-3)',
};

/* ── Cards ── */
export const card: CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-sm)',
};

export const cardPadded: CSSProperties = {
  ...card,
  padding: 'var(--space-5)',
};

/* ── Buttons ── */
const buttonBase: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-2)',
  fontWeight: 600,
  fontSize: 'var(--text-sm)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-2) var(--space-4)',
  border: 'none',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
  whiteSpace: 'nowrap',
};

export const btnPrimary: CSSProperties = {
  ...buttonBase,
  background: 'var(--color-primary)',
  color: '#ffffff',
};

export const btnSecondary: CSSProperties = {
  ...buttonBase,
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
};

export const btnGhost: CSSProperties = {
  ...buttonBase,
  background: 'transparent',
  color: 'var(--color-text-muted)',
};

export const btnDanger: CSSProperties = {
  ...buttonBase,
  background: 'var(--color-error)',
  color: '#ffffff',
};

export const btnSuccess: CSSProperties = {
  ...buttonBase,
  background: 'var(--color-success)',
  color: '#ffffff',
};

export const btnSmall: CSSProperties = {
  fontSize: 'var(--text-xs)',
  padding: 'var(--space-1) var(--space-3)',
  borderRadius: 'var(--radius-sm)',
};

/* ── Status Badges ── */
type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'purple' | 'muted' | 'primary';

const badgeBase: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  padding: '2px 8px',
  borderRadius: 'var(--radius-full)',
  lineHeight: 'var(--leading-normal)',
  whiteSpace: 'nowrap',
};

const badgeColors: Record<BadgeVariant, { bg: string; fg: string }> = {
  success: { bg: 'var(--color-success-light)', fg: 'var(--color-success-dark)' },
  warning: { bg: 'var(--color-warning-light)', fg: 'var(--color-warning-dark)' },
  error:   { bg: 'var(--color-error-light)',   fg: 'var(--color-error-dark)' },
  info:    { bg: 'var(--color-info-light)',     fg: 'var(--color-info-dark)' },
  purple:  { bg: 'var(--color-purple-light)',   fg: 'var(--color-purple-dark)' },
  muted:   { bg: 'var(--color-gray-100)',       fg: 'var(--color-gray-500)' },
  primary: { bg: 'var(--color-primary-light)',  fg: 'var(--color-primary-dark)' },
};

export function badge(variant: BadgeVariant): CSSProperties {
  const c = badgeColors[variant];
  return { ...badgeBase, background: c.bg, color: c.fg };
}

/* ── Tabs ── */
export const tabBar: CSSProperties = {
  display: 'flex',
  gap: 'var(--space-1)',
  borderBottom: '2px solid var(--color-border)',
  marginBottom: 'var(--space-5)',
  overflowX: 'auto',
};

export function tab(active: boolean): CSSProperties {
  return {
    padding: 'var(--space-2) var(--space-4)',
    fontSize: 'var(--text-sm)',
    fontWeight: active ? 600 : 500,
    color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
    borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
    marginBottom: -2,
    background: 'transparent',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all var(--transition-fast)',
  };
}

/* ── Tables ── */
export const table: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 'var(--text-sm)',
};

export const th: CSSProperties = {
  textAlign: 'left',
  padding: 'var(--space-3) var(--space-4)',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderBottom: '1px solid var(--color-border)',
  background: 'var(--color-gray-50)',
  whiteSpace: 'nowrap',
};

export const td: CSSProperties = {
  padding: 'var(--space-3) var(--space-4)',
  borderBottom: '1px solid var(--color-border)',
  color: 'var(--color-text)',
  verticalAlign: 'middle',
};

/* ── Modal Overlay ── */
export const modalOverlay: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 'var(--z-modal)' as unknown as number,
  padding: 'var(--space-4)',
};

export const modalContent: CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-xl)',
  width: '100%',
  maxWidth: 540,
  maxHeight: '90vh',
  overflow: 'auto',
};

export const modalHeader: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 'var(--space-5)',
  borderBottom: '1px solid var(--color-border)',
};

export const modalBody: CSSProperties = {
  padding: 'var(--space-5)',
};

export const modalFooter: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 'var(--space-2)',
  padding: 'var(--space-4) var(--space-5)',
  borderTop: '1px solid var(--color-border)',
};

/* ── Form Elements ── */
export const input: CSSProperties = {
  width: '100%',
  padding: 'var(--space-2) var(--space-3)',
  fontSize: 'var(--text-base)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text)',
  background: 'var(--color-surface)',
  outline: 'none',
  transition: 'border-color var(--transition-fast)',
  fontFamily: 'inherit',
};

export const label: CSSProperties = {
  fontSize: 'var(--text-sm)',
  fontWeight: 600,
  color: 'var(--color-text)',
  marginBottom: 'var(--space-1)',
  display: 'block',
};

export const select: CSSProperties = {
  ...input,
  appearance: 'none',
  cursor: 'pointer',
};

/* ── Empty State ── */
export const emptyState: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--space-12) var(--space-6)',
  textAlign: 'center',
  color: 'var(--color-text-muted)',
};

/* ── Stat Card ── */
export const statCard: CSSProperties = {
  ...card,
  padding: 'var(--space-4) var(--space-5)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-1)',
};

export const statValue: CSSProperties = {
  fontSize: 'var(--text-2xl)',
  fontWeight: 700,
  color: 'var(--color-text)',
  lineHeight: 'var(--leading-tight)',
};

export const statLabel: CSSProperties = {
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-muted)',
  fontWeight: 500,
};

/* ── Toolbar / Filter Bar ── */
export const toolbar: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-3)',
  flexWrap: 'wrap',
  marginBottom: 'var(--space-4)',
};

export const searchInput: CSSProperties = {
  ...input,
  paddingLeft: 'var(--space-10)',
  maxWidth: 280,
};

/* ── Grid Helpers ── */
export const gridAuto = (minWidth = 280): CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
  gap: 'var(--space-4)',
});

/* ── Avatar ── */
export function avatar(size = 36): CSSProperties {
  return {
    width: size,
    height: size,
    borderRadius: '50%',
    objectFit: 'cover',
    flexShrink: 0,
  };
}

/* ── Dot Indicator ── */
export function dot(color = 'var(--color-success)', size = 8): CSSProperties {
  return {
    width: size,
    height: size,
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
  };
}

/* ── Convenience: combine styles ── */
export function sx(...styles: (CSSProperties | false | undefined | null)[]): CSSProperties {
  return Object.assign({}, ...styles.filter(Boolean));
}

/* ── Export all as namespace ── */
export const styles = {
  pageContainer,
  pageTitle,
  pageSubtitle,
  sectionTitle,
  card,
  cardPadded,
  btnPrimary,
  btnSecondary,
  btnGhost,
  btnDanger,
  btnSuccess,
  btnSmall,
  badge,
  tabBar,
  tab,
  table,
  th,
  td,
  modalOverlay,
  modalContent,
  modalHeader,
  modalBody,
  modalFooter,
  input,
  label,
  select,
  emptyState,
  statCard,
  statValue,
  statLabel,
  toolbar,
  searchInput,
  gridAuto,
  avatar,
  dot,
  sx,
} as const;
