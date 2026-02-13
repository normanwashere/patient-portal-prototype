import {
  Users,
  DollarSign,
  Clock,
  UserX,
  BedDouble,
  GitBranch,
  FileCheck,
  UserCog,
  TrendingUp,
  TrendingDown,
  Minus,
  FlaskConical,
  Pill,
  FileSignature,
} from 'lucide-react';
import React from 'react';
import { useProvider } from '../context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';

const KPI_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  users: Users,
  dollar: DollarSign,
  clock: Clock,
  userx: UserX,
  bed: BedDouble,
  flow: GitBranch,
  claims: FileCheck,
  staff: UserCog,
};

const styles: Record<string, React.CSSProperties> = {
  page: { padding: 24, background: 'var(--color-background)', minHeight: '100%' },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--color-text)', marginBottom: 24 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 },
  card: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border)',
    padding: 20,
  },
  kpiIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 'var(--radius)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  kpiValue: { fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 },
  kpiLabel: { fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 },
  kpiChange: { fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--color-text)',
    marginBottom: 16,
    marginTop: 32,
  },
  statRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border)',
    padding: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  statValue: { fontSize: 20, fontWeight: 700, color: 'var(--color-primary)' },
  statLabel: { fontSize: 12, color: 'var(--color-text-muted)' },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid var(--color-border)',
    fontSize: 13,
    gap: 12,
  },
  badge: {
    padding: '2px 8px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
  },
  pendingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 0',
    borderBottom: '1px solid var(--color-border)',
    fontSize: 14,
  },
};

export const ProviderDashboard = () => {
  const {
    dashboardKpis,
    queueStats,
    auditLogs,
    criticalAlerts,
    pendingLabOrders,
    prescriptions,
    dismissAlert,
  } = useProvider();
  const { tenant } = useTheme();
  const features = tenant.features;

  const pendingPrescriptions = prescriptions.filter((p) => p.status === 'Pending Approval');
  // Compute LOA review count from prescriptions requiring authorization
  const pendingLOAReviews = prescriptions.filter(
    (p) => p.status === 'Pending Approval' && p.notes?.toLowerCase().includes('prior')
  ).length || Math.min(pendingLabOrders.filter((o) => o.priority === 'Urgent').length, 3);

  // Filter KPIs by tenant capabilities
  const filteredKpis = dashboardKpis.filter((kpi) => {
    const label = kpi.label.toLowerCase();
    // Hide Bed Occupancy if no admissions
    if (label.includes('bed') && !features.admissions) return false;
    // Hide Insurance Claims if no HMO/LOA
    if (label.includes('insurance') && !features.hmo && !features.loa) return false;
    return true;
  });

  const getSeverityBadgeStyle = (severity: string): React.CSSProperties => {
    if (severity === 'contraindicated' || severity === 'major') {
      return { ...styles.badge, background: 'var(--color-error-light)', color: 'var(--color-error)' };
    }
    if (severity === 'moderate') {
      return { ...styles.badge, background: 'var(--color-warning-light)', color: 'var(--color-warning)' };
    }
    return { ...styles.badge, background: 'var(--color-info-light)', color: 'var(--color-info)' };
  };

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 60000;
    if (diff < 60) return `${Math.round(diff)}m ago`;
    if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Admin Dashboard</h1>

      {/* Top row KPI cards - filtered by tenant features */}
      <div style={styles.grid}>
        {filteredKpis.slice(0, 4).map((kpi, i) => {
          const Icon = KPI_ICONS[kpi.icon] ?? Users;
          const changeColor =
            kpi.trend === 'up' ? 'var(--color-success)' : kpi.trend === 'down' ? 'var(--color-error)' : 'var(--color-text-muted)';
          const ChangeIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus;
          return (
            <div key={i} style={styles.card}>
              <div
                style={{
                  ...styles.kpiIconWrap,
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                }}
              >
                <Icon size={22} />
              </div>
              <div style={styles.kpiValue}>{kpi.value}</div>
              <div style={styles.kpiLabel}>{kpi.label}</div>
              <div style={{ ...styles.kpiChange, color: changeColor }}>
                <ChangeIcon size={14} />
                {Math.abs(kpi.change)}% vs last period
              </div>
            </div>
          );
        })}
      </div>

      {/* Second row KPI cards */}
      {filteredKpis.length > 4 && (
      <div style={{ ...styles.grid, marginTop: 16 }}>
        {filteredKpis.slice(4, 8).map((kpi, i) => {
          const Icon = KPI_ICONS[kpi.icon] ?? Users;
          const changeColor =
            kpi.trend === 'up' ? 'var(--color-success)' : kpi.trend === 'down' ? 'var(--color-error)' : 'var(--color-text-muted)';
          const ChangeIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus;
          return (
            <div key={i} style={styles.card}>
              <div
                style={{
                  ...styles.kpiIconWrap,
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                }}
              >
                <Icon size={22} />
              </div>
              <div style={styles.kpiValue}>{kpi.value}</div>
              <div style={styles.kpiLabel}>{kpi.label}</div>
              <div style={{ ...styles.kpiChange, color: changeColor }}>
                <ChangeIcon size={14} />
                {Math.abs(kpi.change)}% vs last period
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Real-Time Queue Overview - only if queue enabled */}
      {features.queue && (
      <>
      <h2 style={styles.sectionTitle}>Real-Time Queue Overview</h2>
      <div style={styles.statRow}>
        <div style={styles.statCard}>
          <div>
            <div style={styles.statValue}>{queueStats.totalInQueue}</div>
            <div style={styles.statLabel}>Total in Queue</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div>
            <div style={styles.statValue}>{queueStats.avgWaitTime} min</div>
            <div style={styles.statLabel}>Avg Wait Time</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div>
            <div style={styles.statValue}>{queueStats.longestWait} min</div>
            <div style={styles.statLabel}>Longest Wait</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div>
            <div style={styles.statValue}>{queueStats.completedToday}</div>
            <div style={styles.statLabel}>Completed Today</div>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Panels: Recent Activity, Critical Alerts, Pending Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {/* Recent Activity */}
        <div style={styles.card}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', marginBottom: 16 }}>
            Recent Activity
          </h3>
          <div>
            {auditLogs.slice(0, 8).map((log) => (
              <div key={log.id} style={styles.listItem}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'var(--color-text)', fontWeight: 600 }}>{log.action.replace(/_/g, ' ')}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{log.userName} · {log.module}</div>
                </div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 11, flexShrink: 0 }}>
                  {formatTimestamp(log.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Alerts (CDSS-gated) */}
        {(features.cdss ?? false) && <div style={styles.card}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', marginBottom: 16 }}>
            Critical Alerts ({criticalAlerts.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {criticalAlerts.length === 0 ? (
              <div style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>No active alerts</div>
            ) : (
              criticalAlerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    padding: 12,
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius)',
                    background: 'var(--color-surface)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                    <span style={getSeverityBadgeStyle(alert.severity)}>{alert.severity}</span>
                    <span style={{ flex: 1, fontWeight: 600, color: 'var(--color-text)', fontSize: 13 }}>
                      {alert.title}
                    </span>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 2,
                        color: 'var(--color-text-muted)',
                      }}
                      aria-label="Dismiss"
                    >
                      ×
                    </button>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>{alert.message}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-info)' }}>{alert.recommendation}</div>
                </div>
              ))
            )}
          </div>
        </div>}

        {/* Pending Actions - feature-gated */}
        <div style={styles.card}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', marginBottom: 16 }}>
            Pending Actions
          </h3>
          {features.visits.clinicLabFulfillmentEnabled && (
          <div style={styles.pendingRow}>
            <FlaskConical size={20} style={{ color: 'var(--color-primary)' }} />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>Pending Lab Orders</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{pendingLabOrders.length} orders</div>
            </div>
            <span style={{ ...styles.badge, background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
              {pendingLabOrders.length}
            </span>
          </div>
          )}
          <div style={styles.pendingRow}>
            <Pill size={20} style={{ color: 'var(--color-primary)' }} />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>Pending Prescriptions</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Awaiting approval</div>
            </div>
            <span style={{ ...styles.badge, background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
              {pendingPrescriptions.length}
            </span>
          </div>
          {features.loa && (
          <div style={styles.pendingRow}>
            <FileSignature size={20} style={{ color: 'var(--color-primary)' }} />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>Pending LOA Reviews</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Letters of Authorization</div>
            </div>
            <span style={{ ...styles.badge, background: 'var(--color-info-light)', color: 'var(--color-info)' }}>
              {pendingLOAReviews}
            </span>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};
