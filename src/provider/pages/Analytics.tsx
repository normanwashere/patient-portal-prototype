import {
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  BarChart3,
  Activity,
  FileText,
  Search,
  PieChart,
  Heart,
  Building2,
  Users,
  Clock,
  DollarSign,
  Gauge,
  Trophy,
  AlertTriangle,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { useProvider } from '../context/ProviderContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../theme/ThemeContext';

const styles: Record<string, React.CSSProperties> = {
  page: { padding: 24, background: 'var(--color-background)', minHeight: '100%' },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--color-text)', marginBottom: 24 },
  tabs: {
    display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap',
    borderBottom: '1px solid var(--color-border)', paddingBottom: 0,
  },
  tab: {
    padding: '12px 16px', fontSize: 14, fontWeight: 600,
    color: 'var(--color-text-muted)', background: 'none', border: 'none',
    borderBottomWidth: 3, borderBottomStyle: 'solid' as const, borderBottomColor: 'transparent', cursor: 'pointer', marginBottom: -1,
  },
  tabActive: { color: 'var(--color-primary)', borderBottomColor: 'var(--color-primary)' },
  card: {
    background: 'var(--color-surface)', borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', padding: 20, marginBottom: 16,
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 },
  kpiCard: {
    background: 'var(--color-surface)', borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', padding: 20,
  },
  kpiValue: { fontSize: 24, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 },
  kpiLabel: { fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 16 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: 12, borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)', fontWeight: 600 },
  td: { padding: 12, borderBottom: '1px solid var(--color-border)', color: 'var(--color-text)' },
  btn: {
    padding: '8px 16px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
  },
  btnPrimary: { background: 'var(--color-primary)', color: 'white' },
  btnSecondary: { background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' },
  badge: { display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 },
  searchWrap: {
    flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 14px', background: 'var(--color-surface)',
    border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
  },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: 'var(--color-text)' },
};

/* ─── Chart Data ─── */

const patientVolumeData = [
  { day: 'Mon', value: 45 },
  { day: 'Tue', value: 62 },
  { day: 'Wed', value: 58 },
  { day: 'Thu', value: 71 },
  { day: 'Fri', value: 68 },
  { day: 'Sat', value: 34 },
  { day: 'Sun', value: 22 },
];

const revenueData = [
  { month: 'Jan', value: 2.1, label: '₱2.1M' },
  { month: 'Feb', value: 2.4, label: '₱2.4M' },
  { month: 'Mar', value: 2.2, label: '₱2.2M' },
  { month: 'Apr', value: 2.8, label: '₱2.8M' },
  { month: 'May', value: 3.1, label: '₱3.1M' },
  { month: 'Jun', value: 3.4, label: '₱3.4M' },
];

const departmentData = [
  { name: 'Emergency', pct: 89, color: 'var(--color-error)' },
  { name: 'Pharmacy', pct: 81, color: 'var(--color-purple)' },
  { name: 'Outpatient', pct: 72, color: 'var(--color-info)' },
  { name: 'Laboratory', pct: 65, color: 'var(--color-warning)' },
  { name: 'Imaging', pct: 58, color: 'var(--color-cyan)' },
  { name: 'Surgery', pct: 45, color: 'var(--color-success)' },
];

const clinicalOutcomes = [
  { label: 'Patient Satisfaction', value: '4.6 / 5.0', icon: '⭐', color: 'var(--color-warning)', bgColor: 'rgba(245,158,11,0.1)', pct: 92 },
  { label: 'Readmission Rate', value: '3.2%', icon: '🔄', color: 'var(--color-info)', bgColor: 'rgba(59,130,246,0.1)', pct: 3.2, inverse: true },
  { label: 'Avg Length of Stay', value: '2.8 days', icon: '🏥', color: 'var(--color-primary)', bgColor: 'rgba(99,102,241,0.1)', pct: 56 },
  { label: 'Infection Rate', value: '0.4%', icon: '🛡️', color: 'var(--color-success)', bgColor: 'rgba(16,185,129,0.1)', pct: 0.4, inverse: true },
  { label: 'Mortality Rate', value: '0.1%', icon: '📉', color: 'var(--color-success)', bgColor: 'rgba(16,185,129,0.1)', pct: 0.1, inverse: true },
  { label: 'Treatment Success', value: '96.8%', icon: '✅', color: 'var(--color-success)', bgColor: 'rgba(16,185,129,0.1)', pct: 96.8 },
];

const waitTimeData = [
  { hour: '8 AM', minutes: 12 },
  { hour: '9 AM', minutes: 22 },
  { hour: '10 AM', minutes: 35 },
  { hour: '11 AM', minutes: 28 },
  { hour: '12 PM', minutes: 18 },
  { hour: '1 PM', minutes: 30 },
  { hour: '2 PM', minutes: 38 },
  { hour: '3 PM', minutes: 25 },
  { hour: '4 PM', minutes: 15 },
  { hour: '5 PM', minutes: 10 },
];

/* ─── Helper: bar color by intensity ─── */
const getWaitColor = (minutes: number) => {
  if (minutes >= 35) return '#ef4444';
  if (minutes >= 25) return '#f59e0b';
  if (minutes >= 18) return '#3b82f6';
  return '#10b981';
};

const getDeptBarColor = (pct: number) => {
  if (pct >= 85) return '#ef4444';
  if (pct >= 70) return '#f59e0b';
  if (pct >= 55) return '#3b82f6';
  return '#10b981';
};

type TabId = 'dashboard' | 'queue' | 'activity' | 'charts' | 'clinical';
type ScopeId = 'branch' | 'cluster' | 'overall';

const MAXICARE_CLUSTERS = [
  { id: 'ncr-north', name: 'NCR North', branches: ['Bridgetowne', 'Cubao', 'Fairview', 'Hemady'] },
  { id: 'ncr-south', name: 'NCR South', branches: ['Ayala North Exchange', 'BGC', 'Alabang'] },
  { id: 'ncr-central', name: 'NCR Central', branches: ['Centris', 'VV Soliven'] },
  { id: 'vismin', name: 'Visayas / Mindanao', branches: ['Cebu', 'Iloilo', 'Davao'] },
];

const branchMockStats: Record<string, { patients: number; avgWait: number; revenue: number; utilization: number; status: string }> = {
  'Bridgetowne':         { patients: 74, avgWait: 18, revenue: 285000, utilization: 82, status: 'Active' },
  'Cubao':               { patients: 91, avgWait: 24, revenue: 342000, utilization: 88, status: 'Active' },
  'Fairview':            { patients: 63, avgWait: 15, revenue: 218000, utilization: 71, status: 'Active' },
  'Hemady':              { patients: 47, avgWait: 12, revenue: 176000, utilization: 62, status: 'Active' },
  'Ayala North Exchange': { patients: 86, avgWait: 22, revenue: 410000, utilization: 91, status: 'Active' },
  'BGC':                 { patients: 102, avgWait: 27, revenue: 465000, utilization: 94, status: 'High Load' },
  'Alabang':             { patients: 68, avgWait: 16, revenue: 295000, utilization: 73, status: 'Active' },
  'Centris':             { patients: 55, avgWait: 14, revenue: 198000, utilization: 66, status: 'Active' },
  'VV Soliven':          { patients: 42, avgWait: 11, revenue: 155000, utilization: 58, status: 'Active' },
  'Cebu':                { patients: 78, avgWait: 20, revenue: 310000, utilization: 84, status: 'Active' },
  'Iloilo':              { patients: 38, avgWait: 10, revenue: 142000, utilization: 52, status: 'Active' },
  'Davao':               { patients: 59, avgWait: 17, revenue: 235000, utilization: 76, status: 'Active' },
};

const getUtilColor = (pct: number) => {
  if (pct > 85) return '#ef4444';
  if (pct >= 70) return '#f59e0b';
  return '#10b981';
};

const getUtilLabel = (pct: number) => {
  if (pct > 85) return 'High';
  if (pct >= 70) return 'Moderate';
  return 'Healthy';
};

const formatCurrency = (val: number) => {
  if (val >= 1000000) return `₱${(val / 1000000).toFixed(2)}M`;
  if (val >= 1000) return `₱${(val / 1000).toFixed(0)}K`;
  return `₱${val.toLocaleString()}`;
};

export const Analytics = () => {
  const { dashboardKpis, queueStats, auditLogs } = useProvider();
  const { showToast } = useToast();
  const { tenant } = useTheme();
  const isMaxicare = tenant.id === 'maxicare';
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [scope, setScope] = useState<ScopeId>('branch');
  const [activitySearch, setActivitySearch] = useState('');
  const [activityPage, setActivityPage] = useState(0);
  const ACTIVITY_PAGE_SIZE = 15;

  // Cluster-level aggregated data
  const clusterData = useMemo(() => MAXICARE_CLUSTERS.map(cluster => {
    const stats = cluster.branches.map(b => branchMockStats[b]).filter(Boolean);
    const totalPatients = stats.reduce((s, b) => s + b.patients, 0);
    const avgWait = Math.round(stats.reduce((s, b) => s + b.avgWait, 0) / stats.length);
    const totalRevenue = stats.reduce((s, b) => s + b.revenue, 0);
    const avgUtilization = Math.round(stats.reduce((s, b) => s + b.utilization, 0) / stats.length);
    return { ...cluster, totalPatients, avgWait, totalRevenue, avgUtilization };
  }), []);

  // Overall aggregated data
  const overallData = useMemo(() => {
    const allBranches = Object.entries(branchMockStats);
    const totalPatients = allBranches.reduce((s, [, b]) => s + b.patients, 0);
    const avgWait = Math.round(allBranches.reduce((s, [, b]) => s + b.avgWait, 0) / allBranches.length);
    const totalRevenue = allBranches.reduce((s, [, b]) => s + b.revenue, 0);
    const avgUtilization = Math.round(allBranches.reduce((s, [, b]) => s + b.utilization, 0) / allBranches.length);
    const activeBranches = allBranches.length;
    const sorted = [...allBranches].sort((a, b) => b[1].utilization - a[1].utilization);
    const topPerformers = sorted.slice(0, 3);
    const bottomPerformers = sorted.slice(-3).reverse();
    return { totalPatients, avgWait, totalRevenue, avgUtilization, activeBranches, topPerformers, bottomPerformers };
  }, []);

  const getTrendStyle = (trend: 'up' | 'down' | 'stable') => {
    const color = trend === 'up' ? 'var(--color-success)' : trend === 'down' ? 'var(--color-error)' : 'var(--color-text-muted)';
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    return { color, TrendIcon };
  };

  // Queue visual data
  const queueBars = useMemo(() => [
    { label: 'In Queue', value: queueStats.totalInQueue, color: 'var(--color-primary)' },
    { label: 'Avg Wait (min)', value: queueStats.avgWaitTime, color: 'var(--color-warning)' },
    { label: 'Longest Wait (min)', value: queueStats.longestWait, color: 'var(--color-error)' },
    { label: 'Completed Today', value: queueStats.completedToday, color: 'var(--color-success)' },
  ], [queueStats]);

  const maxQueueVal = Math.max(...queueBars.map((b) => b.value), 1);

  // Activity log filtering + pagination
  const filteredActivityLogs = useMemo(() => {
    if (!activitySearch) return auditLogs;
    const q = activitySearch.toLowerCase();
    return auditLogs.filter((a) =>
      a.userName.toLowerCase().includes(q) ||
      a.action.toLowerCase().includes(q) ||
      a.module.toLowerCase().includes(q) ||
      a.details.toLowerCase().includes(q)
    );
  }, [auditLogs, activitySearch]);

  const activityPageCount = Math.max(1, Math.ceil(filteredActivityLogs.length / ACTIVITY_PAGE_SIZE));
  const pagedActivityLogs = filteredActivityLogs.slice(
    activityPage * ACTIVITY_PAGE_SIZE,
    (activityPage + 1) * ACTIVITY_PAGE_SIZE
  );

  const handleExportCSV = () => {
    let csvContent: string;
    let filename: string;

    if (activeTab === 'dashboard') {
      csvContent = [
        'KPI,Value,Change (%),Trend',
        ...dashboardKpis.map((k) => `"${k.label}","${k.value}",${k.change},${k.trend}`),
      ].join('\n');
      filename = 'dashboard-kpis.csv';
    } else if (activeTab === 'queue') {
      csvContent = [
        'Metric,Value',
        `Total In Queue,${queueStats.totalInQueue}`,
        `Avg Wait Time (min),${queueStats.avgWaitTime}`,
        `Longest Wait (min),${queueStats.longestWait}`,
        `Completed Today,${queueStats.completedToday}`,
      ].join('\n');
      filename = 'queue-stats.csv';
    } else if (activeTab === 'charts') {
      csvContent = [
        'Day,Patient Volume',
        ...patientVolumeData.map((d) => `${d.day},${d.value}`),
        '',
        'Month,Revenue',
        ...revenueData.map((d) => `${d.month},${d.label}`),
        '',
        'Department,Utilization (%)',
        ...departmentData.map((d) => `${d.name},${d.pct}`),
      ].join('\n');
      filename = 'charts-data.csv';
    } else if (activeTab === 'clinical') {
      csvContent = [
        'Metric,Value',
        ...clinicalOutcomes.map((o) => `"${o.label}","${o.value}"`),
        '',
        'Hour,Avg Wait (min)',
        ...waitTimeData.map((w) => `${w.hour},${w.minutes}`),
      ].join('\n');
      filename = 'clinical-outcomes.csv';
    } else {
      csvContent = [
        'Timestamp,User,Action,Module,Details,IP Address',
        ...filteredActivityLogs.map((a) =>
          `"${new Date(a.timestamp).toLocaleString()}","${a.userName}","${a.action}","${a.module}","${a.details}","${a.ipAddress}"`
        ),
      ].join('\n');
      filename = 'activity-log.csv';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filename}`, 'success');
  };

  const maxPatientVol = Math.max(...patientVolumeData.map((d) => d.value));
  const maxRevenue = Math.max(...revenueData.map((d) => d.value));
  const maxWait = Math.max(...waitTimeData.map((w) => w.minutes));

  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'charts', label: 'Charts', icon: PieChart },
    { id: 'clinical', label: 'Clinical', icon: Heart },
    { id: 'queue', label: 'Queue Stats', icon: Activity },
    { id: 'activity', label: 'Activity Log', icon: FileText },
  ];

  const scopeOptions: { id: ScopeId; label: string }[] = [
    { id: 'branch', label: 'This Branch' },
    { id: 'cluster', label: 'By Cluster' },
    { id: 'overall', label: 'Overall' },
  ];

  return (
    <div style={styles.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ ...styles.title, marginBottom: 0 }}>Analytics & Reporting</h1>
        <button
          type="button"
          style={{ ...styles.btn, ...styles.btnPrimary }}
          onClick={handleExportCSV}
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Scope Selector — only for Maxicare (multi-branch tenant) */}
      {isMaxicare && (
        <div style={{
          display: 'inline-flex', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)',
          background: 'var(--color-surface)', padding: 3, marginBottom: 20, gap: 2,
        }}>
          {scopeOptions.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setScope(opt.id)}
              style={{
                padding: '8px 18px', fontSize: 13, fontWeight: 600, borderRadius: 'calc(var(--radius) - 2px)',
                border: 'none', cursor: 'pointer', transition: 'all 0.15s ease',
                background: scope === opt.id ? 'var(--color-primary)' : 'transparent',
                color: scope === opt.id ? 'white' : 'var(--color-text-muted)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Branch-level tabs — only visible when scope is "This Branch" */}
      {scope === 'branch' && (
        <div style={styles.tabs}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              style={{ ...styles.tab, ...(activeTab === id ? styles.tabActive : {}) }}
              onClick={() => { setActiveTab(id); setActivityPage(0); }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon size={16} />
                {label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ─── BRANCH-LEVEL TAB CONTENT ─── */}
      {scope === 'branch' && activeTab === 'dashboard' && (
        <>
          <div style={{ ...styles.grid, marginBottom: 24 }}>
            {dashboardKpis.map((kpi, i) => {
              const { color, TrendIcon } = getTrendStyle(kpi.trend);
              return (
                <div key={i} style={styles.kpiCard}>
                  <div style={styles.kpiValue}>{kpi.value}</div>
                  <div style={styles.kpiLabel}>{kpi.label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color, fontSize: 12 }}>
                    <TrendIcon size={16} />
                    {Math.abs(kpi.change)}% vs last period
                  </div>
                </div>
              );
            })}
          </div>
          {dashboardKpis.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
              No KPI data available.
            </div>
          )}
        </>
      )}

      {scope === 'branch' && activeTab === 'charts' && (
        <>
          {/* Patient Volume Chart */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Patient Volume — Last 7 Days</h3>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 12,
                height: 220,
                padding: '0 8px',
              }}
            >
              {patientVolumeData.map((d) => {
                const barH = Math.max((d.value / maxPatientVol) * 180, 4);
                return (
                  <div
                    key={d.day}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'var(--color-text)',
                      }}
                    >
                      {d.value}
                    </span>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: 56,
                        height: barH,
                        borderRadius: '6px 6px 0 0',
                        background: `linear-gradient(180deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 60%, transparent) 100%)`,
                        transition: 'height 0.4s ease',
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
            <div
              style={{
                marginTop: 8,
                borderTop: '1px solid var(--color-border)',
                paddingTop: 10,
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                color: 'var(--color-text-muted)',
              }}
            >
              <span>Total: {patientVolumeData.reduce((s, d) => s + d.value, 0)} patients</span>
              <span>Peak: {maxPatientVol} (Thu)</span>
            </div>
          </div>

          {/* Revenue Trend */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Revenue Trend — 6 Months</h3>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 16,
                height: 240,
                padding: '0 8px',
              }}
            >
              {revenueData.map((d, idx) => {
                const barH = Math.max((d.value / maxRevenue) * 190, 4);
                const prevVal = idx > 0 ? revenueData[idx - 1].value : d.value;
                const growing = d.value >= prevVal;
                return (
                  <div
                    key={d.month}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: growing ? 'var(--color-success)' : 'var(--color-error)',
                      }}
                    >
                      {d.label}
                    </span>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: 64,
                        height: barH,
                        borderRadius: '6px 6px 0 0',
                        background: growing
                          ? 'linear-gradient(180deg, var(--color-success) 0%, rgba(16,185,129,0.3) 100%)'
                          : 'linear-gradient(180deg, var(--color-warning) 0%, rgba(245,158,11,0.3) 100%)',
                        transition: 'height 0.4s ease',
                        position: 'relative',
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {d.month}
                    </span>
                  </div>
                );
              })}
            </div>
            <div
              style={{
                marginTop: 8,
                borderTop: '1px solid var(--color-border)',
                paddingTop: 10,
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                color: 'var(--color-text-muted)',
              }}
            >
              <span>
                Total: ₱{revenueData.reduce((s, d) => s + d.value, 0).toFixed(1)}M
              </span>
              <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                +{(((revenueData[revenueData.length - 1].value - revenueData[0].value) / revenueData[0].value) * 100).toFixed(0)}% growth
              </span>
            </div>
          </div>

          {/* Department Utilization */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Department Utilization</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {departmentData.map((dept) => (
                <div key={dept.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span
                    style={{
                      width: 110,
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      flexShrink: 0,
                    }}
                  >
                    {dept.name}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 28,
                      background: 'var(--color-gray-100)',
                      borderRadius: 'var(--radius)',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: `${dept.pct}%`,
                        height: '100%',
                        borderRadius: 'var(--radius)',
                        background: `linear-gradient(90deg, ${getDeptBarColor(dept.pct)}, ${getDeptBarColor(dept.pct)}dd)`,
                        transition: 'width 0.5s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        paddingRight: 10,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: 'white',
                        }}
                      >
                        {dept.pct}%
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      width: 60,
                      textAlign: 'right',
                      fontSize: 12,
                      fontWeight: 700,
                      color: getDeptBarColor(dept.pct),
                      flexShrink: 0,
                    }}
                  >
                    {dept.pct >= 85
                      ? 'Critical'
                      : dept.pct >= 70
                        ? 'High'
                        : dept.pct >= 55
                          ? 'Normal'
                          : 'Low'}
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 16,
                borderTop: '1px solid var(--color-border)',
                paddingTop: 10,
                fontSize: 12,
                color: 'var(--color-text-muted)',
                display: 'flex',
                gap: 20,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--color-error)', display: 'inline-block' }} />
                Critical (85%+)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--color-warning)', display: 'inline-block' }} />
                High (70–84%)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--color-info)', display: 'inline-block' }} />
                Normal (55–69%)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--color-success)', display: 'inline-block' }} />
                Low (&lt;55%)
              </span>
            </div>
          </div>
        </>
      )}

      {scope === 'branch' && activeTab === 'clinical' && (
        <>
          {/* Clinical Outcomes Dashboard */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={styles.sectionTitle}>Clinical Outcomes Dashboard</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
              }}
            >
              {clinicalOutcomes.map((item) => (
                <div
                  key={item.label}
                  style={{
                    ...styles.kpiCard,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Decorative accent bar */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: item.color,
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 4,
                    }}
                  >
                    <span style={{ fontSize: 28 }}>{item.icon}</span>
                    <span
                      style={{
                        fontSize: 26,
                        fontWeight: 800,
                        color: item.color,
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {item.label}
                  </span>
                  {/* Mini progress bar */}
                  <div
                    style={{
                      width: '100%',
                      height: 6,
                      background: 'var(--color-gray-100)',
                      borderRadius: 99,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${item.inverse ? Math.min(item.pct * 10, 100) : item.pct}%`,
                        height: '100%',
                        borderRadius: 99,
                        background: item.color,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wait Time Analysis */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Wait Time Analysis — By Hour</h3>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 8,
                height: 200,
                padding: '0 4px',
              }}
            >
              {waitTimeData.map((w) => {
                const barH = Math.max((w.minutes / maxWait) * 160, 4);
                const color = getWaitColor(w.minutes);
                return (
                  <div
                    key={w.hour}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color,
                      }}
                    >
                      {w.minutes}m
                    </span>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: 44,
                        height: barH,
                        borderRadius: '5px 5px 0 0',
                        background: `linear-gradient(180deg, ${color} 0%, ${color}55 100%)`,
                        transition: 'height 0.4s ease',
                      }}
                    />
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: 'var(--color-text-muted)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {w.hour}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Heatmap row */}
            <div
              style={{
                marginTop: 16,
                borderTop: '1px solid var(--color-border)',
                paddingTop: 14,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  marginBottom: 8,
                  display: 'block',
                }}
              >
                Wait Time Heatmap
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                {waitTimeData.map((w) => {
                  const intensity = w.minutes / maxWait;
                  const color = getWaitColor(w.minutes);
                  return (
                    <div
                      key={`hm-${w.hour}`}
                      title={`${w.hour}: ${w.minutes} min avg wait`}
                      style={{
                        flex: 1,
                        height: 36,
                        borderRadius: 4,
                        background: color,
                        opacity: 0.3 + intensity * 0.7,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'default',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: 'white',
                        }}
                      >
                        {w.minutes}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 4,
                  fontSize: 10,
                  color: 'var(--color-text-muted)',
                }}
              >
                <span>8 AM</span>
                <span>5 PM</span>
              </div>
            </div>

            {/* Summary stats */}
            <div
              style={{
                marginTop: 14,
                display: 'flex',
                gap: 24,
                fontSize: 12,
                color: 'var(--color-text-muted)',
              }}
            >
              <span>
                Avg Wait:{' '}
                <strong style={{ color: 'var(--color-text)' }}>
                  {(waitTimeData.reduce((s, w) => s + w.minutes, 0) / waitTimeData.length).toFixed(0)} min
                </strong>
              </span>
              <span>
                Peak:{' '}
                <strong style={{ color: 'var(--color-error)' }}>
                  {maxWait} min ({waitTimeData.find((w) => w.minutes === maxWait)?.hour})
                </strong>
              </span>
              <span>
                Lowest:{' '}
                <strong style={{ color: 'var(--color-success)' }}>
                  {Math.min(...waitTimeData.map((w) => w.minutes))} min ({waitTimeData.find((w) => w.minutes === Math.min(...waitTimeData.map((ww) => ww.minutes)))?.hour})
                </strong>
              </span>
            </div>
          </div>
        </>
      )}

      {scope === 'branch' && activeTab === 'queue' && (
        <>
          <div style={{ ...styles.grid, marginBottom: 24 }}>
            {queueBars.map((bar) => (
              <div key={bar.label} style={styles.kpiCard}>
                <div style={{ ...styles.kpiValue, color: bar.color }}>{bar.value}</div>
                <div style={styles.kpiLabel}>{bar.label}</div>
              </div>
            ))}
          </div>

          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Queue Performance</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {queueBars.map((bar) => (
                <div key={bar.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 160, fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>{bar.label}</span>
                  <div
                    style={{
                      flex: 1, height: 28, background: 'var(--color-gray-100)',
                      borderRadius: 'var(--radius)', overflow: 'hidden', position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min((bar.value / maxQueueVal) * 100, 100)}%`,
                        height: '100%', background: bar.color, borderRadius: 'var(--radius)',
                        transition: 'width 0.3s', minWidth: bar.value > 0 ? 4 : 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8,
                      }}
                    >
                      {bar.value > 0 && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{bar.value}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>Efficiency Metrics</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Throughput Rate</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>
                    {queueStats.completedToday > 0
                      ? `${(queueStats.completedToday / 8).toFixed(1)} pts/hr`
                      : '—'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Queue Load</span>
                  <span style={{ fontWeight: 700, color: queueStats.totalInQueue > 20 ? 'var(--color-error)' : 'var(--color-text)' }}>
                    {queueStats.totalInQueue} patients
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Wait Threshold</span>
                  <span style={{
                    fontWeight: 700,
                    color: queueStats.longestWait > 30 ? 'var(--color-error)' : queueStats.longestWait > 15 ? 'var(--color-warning)' : 'var(--color-success)',
                  }}>
                    {queueStats.longestWait > 30 ? 'Critical' : queueStats.longestWait > 15 ? 'Warning' : 'Normal'}
                  </span>
                </div>
              </div>
            </div>
            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Avg Wait</span>
                  <span style={{ fontWeight: 700 }}>{queueStats.avgWaitTime} min</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Longest Wait</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-error)' }}>{queueStats.longestWait} min</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Completed</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>{queueStats.completedToday}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {scope === 'branch' && activeTab === 'activity' && (
        <div style={styles.card}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={styles.searchWrap}>
              <Search size={18} color="var(--color-text-muted)" />
              <input
                type="search"
                placeholder="Search by user, action, module, or details..."
                style={styles.searchInput}
                value={activitySearch}
                onChange={(e) => { setActivitySearch(e.target.value); setActivityPage(0); }}
              />
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Timestamp</th>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Action</th>
                  <th style={styles.th}>Module</th>
                  <th style={styles.th}>Details</th>
                </tr>
              </thead>
              <tbody>
                {pagedActivityLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={styles.td}>
                      {new Date(log.timestamp).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td style={styles.td}>{log.userName}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: 'var(--color-info-light)', color: 'var(--color-info)' }}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={styles.td}>{log.module}</td>
                    <td style={{ ...styles.td, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.details}
                    </td>
                  </tr>
                ))}
                {pagedActivityLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: 'var(--color-text-muted)', padding: 32 }}>
                      No activity entries match the search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {filteredActivityLogs.length} entries · Page {activityPage + 1} of {activityPageCount}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                style={{ ...styles.btn, ...styles.btnSecondary, padding: '6px 14px', fontSize: 12 }}
                disabled={activityPage === 0}
                onClick={() => setActivityPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                style={{ ...styles.btn, ...styles.btnSecondary, padding: '6px 14px', fontSize: 12 }}
                disabled={activityPage >= activityPageCount - 1}
                onClick={() => setActivityPage((p) => Math.min(activityPageCount - 1, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── BY CLUSTER VIEW ─── */}
      {scope === 'cluster' && (
        <>
          {/* Cluster Summary Cards */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={styles.sectionTitle}>Cluster Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {clusterData.map(cluster => (
                <div key={cluster.id} style={{ ...styles.kpiCard, position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                    background: `var(--color-primary)`,
                  }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, paddingTop: 4 }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>{cluster.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                        <Building2 size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        {cluster.branches.length} branches
                      </div>
                    </div>
                    <span style={{
                      ...styles.badge,
                      background: `color-mix(in srgb, ${getUtilColor(cluster.avgUtilization)} 12%, transparent)`,
                      color: getUtilColor(cluster.avgUtilization),
                    }}>
                      {getUtilLabel(cluster.avgUtilization)}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>
                        <Users size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />Patients Today
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>{cluster.totalPatients}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>
                        <Clock size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />Avg Wait
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>{cluster.avgWait} min</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>
                        <DollarSign size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />Revenue
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>{formatCurrency(cluster.totalRevenue)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>
                        <Gauge size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />Utilization
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: getUtilColor(cluster.avgUtilization) }}>{cluster.avgUtilization}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Branch Comparison Table */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Branch Comparison</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Branch</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Patients Today</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Avg Wait</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Revenue</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>Utilization</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MAXICARE_CLUSTERS.map(cluster => (
                    <React.Fragment key={cluster.id}>
                      <tr>
                        <td colSpan={6} style={{
                          padding: '10px 12px', background: 'var(--color-gray-100)', fontWeight: 700,
                          fontSize: 12, color: 'var(--color-primary)', letterSpacing: '0.03em',
                          borderBottom: '1px solid var(--color-border)',
                          textTransform: 'uppercase' as const,
                        }}>
                          {cluster.name}
                        </td>
                      </tr>
                      {cluster.branches.map(branchName => {
                        const data = branchMockStats[branchName];
                        if (!data) return null;
                        const utilColor = getUtilColor(data.utilization);
                        return (
                          <tr key={branchName}>
                            <td style={{ ...styles.td, fontWeight: 600, paddingLeft: 24 }}>{branchName}</td>
                            <td style={{ ...styles.td, textAlign: 'right' }}>{data.patients}</td>
                            <td style={{ ...styles.td, textAlign: 'right' }}>{data.avgWait} min</td>
                            <td style={{ ...styles.td, textAlign: 'right' }}>{formatCurrency(data.revenue)}</td>
                            <td style={{ ...styles.td, textAlign: 'center' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                  width: 60, height: 8, background: 'var(--color-gray-100)', borderRadius: 99, overflow: 'hidden',
                                }}>
                                  <div style={{
                                    width: `${data.utilization}%`, height: '100%', background: utilColor, borderRadius: 99,
                                  }} />
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 700, color: utilColor, minWidth: 36 }}>{data.utilization}%</span>
                              </div>
                            </td>
                            <td style={{ ...styles.td, textAlign: 'center' }}>
                              <span style={{
                                ...styles.badge,
                                background: data.status === 'High Load'
                                  ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                                color: data.status === 'High Load' ? '#ef4444' : '#10b981',
                              }}>
                                {data.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ─── OVERALL VIEW ─── */}
      {scope === 'overall' && (
        <>
          {/* Organization-wide KPI Cards */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={styles.sectionTitle}>Organization Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              {[
                { label: 'Total Patients', value: overallData.totalPatients.toLocaleString(), icon: Users, color: 'var(--color-primary)' },
                { label: 'Avg Wait Time', value: `${overallData.avgWait} min`, icon: Clock, color: 'var(--color-warning)' },
                { label: 'Total Revenue', value: formatCurrency(overallData.totalRevenue), icon: DollarSign, color: 'var(--color-success)' },
                { label: 'Avg Utilization', value: `${overallData.avgUtilization}%`, icon: Gauge, color: getUtilColor(overallData.avgUtilization) },
                { label: 'Active Branches', value: String(overallData.activeBranches), icon: Building2, color: 'var(--color-info)' },
              ].map(kpi => (
                <div key={kpi.label} style={{ ...styles.kpiCard, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `color-mix(in srgb, ${kpi.color} 12%, transparent)`, flexShrink: 0,
                  }}>
                    <kpi.icon size={22} color={kpi.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.1 }}>{kpi.value}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{kpi.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cluster Comparison Bar Chart */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Patient Volume by Cluster</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {(() => {
                const maxVol = Math.max(...clusterData.map(c => c.totalPatients));
                return clusterData.map(cluster => (
                  <div key={cluster.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 150, fontSize: 13, fontWeight: 600, color: 'var(--color-text)', flexShrink: 0 }}>
                      {cluster.name}
                    </span>
                    <div style={{ flex: 1, height: 32, background: 'var(--color-gray-100)', borderRadius: 'var(--radius)', overflow: 'hidden', position: 'relative' }}>
                      <div style={{
                        width: `${(cluster.totalPatients / maxVol) * 100}%`,
                        height: '100%', borderRadius: 'var(--radius)',
                        background: `linear-gradient(90deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 70%, var(--color-secondary)))`,
                        transition: 'width 0.5s ease',
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 10,
                      }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{cluster.totalPatients}</span>
                      </div>
                    </div>
                    <span style={{ width: 70, fontSize: 12, color: 'var(--color-text-muted)', flexShrink: 0, textAlign: 'right' }}>
                      {cluster.branches.length} branches
                    </span>
                  </div>
                ));
              })()}
            </div>
            <div style={{
              marginTop: 14, borderTop: '1px solid var(--color-border)', paddingTop: 10,
              fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between',
            }}>
              <span>Total: {overallData.totalPatients.toLocaleString()} patients across {overallData.activeBranches} branches</span>
              <span>Data as of today</span>
            </div>
          </div>

          {/* Top / Bottom Performers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={styles.card}>
              <h3 style={{ ...styles.sectionTitle, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Trophy size={18} color="var(--color-success)" /> Top Performers
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {overallData.topPerformers.map(([name, data], i) => (
                  <div key={name} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 'var(--radius)',
                    background: i === 0 ? 'rgba(16,185,129,0.06)' : 'transparent',
                    border: i === 0 ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: i === 0 ? 'var(--color-success)' : 'var(--color-gray-100)',
                        color: i === 0 ? 'white' : 'var(--color-text-muted)', fontSize: 12, fontWeight: 700,
                      }}>
                        {i + 1}
                      </span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{name}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                          {data.patients} patients · {formatCurrency(data.revenue)}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: getUtilColor(data.utilization) }}>
                      {data.utilization}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={{ ...styles.sectionTitle, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} color="var(--color-warning)" /> Needs Attention
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {overallData.bottomPerformers.map(([name, data], i) => (
                  <div key={name} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 'var(--radius)',
                    background: i === 0 ? 'rgba(245,158,11,0.06)' : 'transparent',
                    border: i === 0 ? '1px solid rgba(245,158,11,0.2)' : '1px solid transparent',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: i === 0 ? 'var(--color-warning)' : 'var(--color-gray-100)',
                        color: i === 0 ? 'white' : 'var(--color-text-muted)', fontSize: 12, fontWeight: 700,
                      }}>
                        {i + 1}
                      </span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{name}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                          {data.patients} patients · {formatCurrency(data.revenue)}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: getUtilColor(data.utilization) }}>
                      {data.utilization}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
