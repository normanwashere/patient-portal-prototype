/**
 * Unified UI Library
 *
 * Shared components, design tokens, and style utilities
 * for all three portals (Patient, Doctor, Provider).
 *
 * Usage:
 *   import { StatusBadge, TabBar, Modal, colors, spacing } from '../ui';
 */

// ── Components ──
export { StatusBadge } from './StatusBadge';
export type { BadgeVariant, BadgeSize } from './StatusBadge';
export { TabBar } from './TabBar';
export { PageHeader } from './PageHeader';
export { Modal } from './Modal';
export { StatCard } from './StatCard';
export { EmptyState } from './EmptyState';

// ── Tokens ──
export {
  colors,
  spacing,
  space,
  radius,
  shadow,
  text,
  fontWeight,
  leading,
  transition,
  zIndex,
  layout,
  breakpoints,
} from './tokens';

// ── Shared Styles ──
export {
  styles,
  badge,
  tab,
  gridAuto,
  avatar,
  dot,
  sx,
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
  tabBar,
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
} from './shared-styles';
