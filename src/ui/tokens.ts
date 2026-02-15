/**
 * Unified Design Tokens
 *
 * Typed constants that map to CSS custom properties defined in index.css.
 * Use these in inline styles across all portals for consistency.
 *
 * Usage:
 *   import { colors, spacing, radius, shadow, text } from '../ui/tokens';
 *   style={{ color: colors.textMuted, padding: spacing[4], borderRadius: radius.md }}
 */

/* ── Color Tokens ── */
export const colors = {
  // Branding (theme-aware via CSS vars)
  primary:            'var(--color-primary)',
  primaryDark:        'var(--color-primary-dark)',
  primaryLight:       'var(--color-primary-light)',
  primaryTransparent: 'var(--color-primary-transparent)',
  secondary:          'var(--color-secondary)',
  secondaryDark:      'var(--color-secondary-dark)',
  secondaryLight:     'var(--color-secondary-light)',

  // Surfaces
  background: 'var(--color-background)',
  surface:    'var(--color-surface)',
  border:     'var(--color-border)',

  // Text
  text:      'var(--color-text)',
  textMuted: 'var(--color-text-muted)',

  // Gray Scale
  gray50:  'var(--color-gray-50)',
  gray100: 'var(--color-gray-100)',
  gray200: 'var(--color-gray-200)',
  gray300: 'var(--color-gray-300)',
  gray400: 'var(--color-gray-400)',
  gray500: 'var(--color-gray-500)',
  gray600: 'var(--color-gray-600)',
  gray700: 'var(--color-gray-700)',
  gray800: 'var(--color-gray-800)',
  gray900: 'var(--color-gray-900)',

  // Semantic
  success:      'var(--color-success)',
  successLight: 'var(--color-success-light)',
  successDark:  'var(--color-success-dark)',
  warning:      'var(--color-warning)',
  warningLight: 'var(--color-warning-light)',
  warningDark:  'var(--color-warning-dark)',
  error:        'var(--color-error)',
  errorLight:   'var(--color-error-light)',
  errorDark:    'var(--color-error-dark)',
  info:         'var(--color-info)',
  infoLight:    'var(--color-info-light)',
  infoDark:     'var(--color-info-dark)',

  // Extended
  purple:      'var(--color-purple)',
  purpleLight: 'var(--color-purple-light)',
  purpleDark:  'var(--color-purple-dark)',
  pink:        'var(--color-pink)',
  pinkLight:   'var(--color-pink-light)',
  cyan:        'var(--color-cyan)',
  cyanLight:   'var(--color-cyan-light)',
  indigo:      'var(--color-indigo)',
  indigoLight: 'var(--color-indigo-light)',

  // Common raw values for non-CSS-var contexts (gradients, rgba, etc.)
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const;

/* ── Spacing Tokens ── */
export const spacing = {
  0:  'var(--space-0)',
  1:  'var(--space-1)',
  2:  'var(--space-2)',
  3:  'var(--space-3)',
  4:  'var(--space-4)',
  5:  'var(--space-5)',
  6:  'var(--space-6)',
  8:  'var(--space-8)',
  10: 'var(--space-10)',
  12: 'var(--space-12)',
  16: 'var(--space-16)',
} as const;

/* ── Numeric spacing for gap/padding that needs numbers ── */
export const space = {
  0:  0,
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  8:  32,
  10: 40,
  12: 48,
  16: 64,
} as const;

/* ── Border Radius Tokens ── */
export const radius = {
  xs:   'var(--radius-xs)',
  sm:   'var(--radius-sm)',
  md:   'var(--radius-md)',
  base: 'var(--radius)',
  lg:   'var(--radius-lg)',
  xl:   'var(--radius-xl)',
  full: 'var(--radius-full)',
  circle: '50%',
} as const;

/* ── Shadow Tokens ── */
export const shadow = {
  xs: 'var(--shadow-xs)',
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
  none: 'none',
} as const;

/* ── Typography Tokens ── */
export const text = {
  xs:   'var(--text-xs)',
  sm:   'var(--text-sm)',
  base: 'var(--text-base)',
  md:   'var(--text-md)',
  lg:   'var(--text-lg)',
  xl:   'var(--text-xl)',
  '2xl': 'var(--text-2xl)',
  '3xl': 'var(--text-3xl)',
} as const;

export const fontWeight = {
  normal:   400,
  medium:   500,
  semibold: 600,
  bold:     700,
  extrabold: 800,
} as const;

export const leading = {
  tight:   'var(--leading-tight)',
  normal:  'var(--leading-normal)',
  relaxed: 'var(--leading-relaxed)',
} as const;

/* ── Transition Tokens ── */
export const transition = {
  fast:   'var(--transition-fast)',
  normal: 'var(--transition-normal)',
  smooth: 'var(--transition-smooth)',
} as const;

/* ── Z-Index Tokens ── */
export const zIndex = {
  base:     1,
  dropdown: 50,
  sticky:   100,
  overlay:  200,
  modal:    300,
  toast:    400,
  tooltip:  500,
} as const;

/* ── Layout Tokens ── */
export const layout = {
  headerHeight:     'var(--header-height)',
  sidebarWidth:     'var(--sidebar-width)',
  sidebarCollapsed: 'var(--sidebar-collapsed)',
  bottomNavHeight:  'var(--bottom-nav-height)',
  contentMaxWidth:  'var(--content-max-width)',
} as const;

/* ── Breakpoints (numeric for JS matchMedia) ── */
export const breakpoints = {
  sm:  640,
  md:  768,
  lg:  1024,
  xl:  1280,
} as const;
