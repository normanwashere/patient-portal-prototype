/**
 * StatCard — Unified stat/KPI card component
 *
 * Replaces the various stat card implementations across portals.
 */

import type { CSSProperties, ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  iconBg?: string;
  iconColor?: string;
  trend?: { value: string; direction: 'up' | 'down' | 'flat' };
  style?: CSSProperties;
}

export function StatCard({
  label,
  value,
  icon,
  iconBg = 'var(--color-primary-light)',
  iconColor = 'var(--color-primary)',
  trend,
  style,
}: StatCardProps) {
  const TrendIcon = trend?.direction === 'up' ? TrendingUp
    : trend?.direction === 'down' ? TrendingDown : Minus;
  const trendColor = trend?.direction === 'up' ? 'var(--color-success)'
    : trend?.direction === 'down' ? 'var(--color-error)' : 'var(--color-gray-400)';

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        padding: 'var(--space-4) var(--space-5)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-4)',
        ...style,
      }}
    >
      {icon && (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: iconBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            fontWeight: 500,
            marginBottom: 'var(--space-1)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            color: 'var(--color-text)',
            lineHeight: 'var(--leading-tight)',
          }}
        >
          {value}
        </div>
        {trend && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              marginTop: 'var(--space-1)',
              fontSize: 'var(--text-xs)',
              color: trendColor,
              fontWeight: 600,
            }}
          >
            <TrendIcon size={12} />
            {trend.value}
          </div>
        )}
      </div>
    </div>
  );
}
