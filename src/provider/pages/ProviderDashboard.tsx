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
  HeartPulse,
  Stethoscope,
  Microscope,
  CreditCard,
  Calendar,
  ClipboardList,
  Activity,
  Building2,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProvider } from '../context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';
import type { StaffRole } from '../types';
import './ProviderDashboard.css';

/* ── Icon map ── */
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

/* ── Role metadata ── */
const ROLE_META: Record<StaffRole, { title: string; greeting: string; color: string }> = {
  super_admin: { title: 'Super Admin Dashboard', greeting: 'Full system oversight across branches', color: 'var(--color-primary)' },
  admin: { title: 'Admin Dashboard', greeting: 'System overview and operations', color: 'var(--color-primary)' },
  doctor: { title: 'Clinical Dashboard', greeting: 'Patient care and consultations', color: '#2563eb' },
  nurse: { title: 'Nursing Dashboard', greeting: 'Patient triage and care coordination', color: '#059669' },
  lab_tech: { title: 'Lab Dashboard', greeting: 'Lab orders and specimen processing', color: '#7c3aed' },
  pharmacist: { title: 'Pharmacy Dashboard', greeting: 'Prescriptions and dispensing', color: '#d97706' },
  billing_staff: { title: 'Billing Dashboard', greeting: 'Revenue and claims management', color: '#dc2626' },
  front_desk: { title: 'Front Desk Dashboard', greeting: 'Queue management and scheduling', color: '#0891b2' },
  hr: { title: 'HR Dashboard', greeting: 'Staff management and scheduling', color: '#4f46e5' },
  imaging_tech: { title: 'Imaging Dashboard', greeting: 'Diagnostic imaging and reports', color: '#7c3aed' },
};

/* ── Styles ── */
const s: Record<string, React.CSSProperties> = {
  page: { padding: 24, background: 'var(--color-background)', minHeight: '100%' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 22, fontWeight: 800, color: 'var(--color-text)', margin: 0, lineHeight: 1.2 },
  subtitle: { fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 },
  rolePill: { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 14 },
  card: {
    background: 'var(--color-surface)', borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid var(--color-border)', padding: 18,
  },
  cardClickable: {
    background: 'var(--color-surface)', borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid var(--color-border)', padding: 18,
    cursor: 'pointer', transition: 'all 0.15s ease',
  },
  kpiIconWrap: { width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  kpiValue: { fontSize: 20, fontWeight: 800, color: 'var(--color-text)', marginBottom: 2 },
  kpiLabel: { fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 },
  kpiChange: { fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: 'var(--color-text)', marginBottom: 14, marginTop: 28, display: 'flex', alignItems: 'center', gap: 6 },
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 },
  statCard: {
    background: 'var(--color-surface)', borderRadius: 12, border: '1px solid var(--color-border)',
    padding: 14, display: 'flex', alignItems: 'center', gap: 10,
    cursor: 'pointer', transition: 'all 0.15s ease',
  },
  statValue: { fontSize: 18, fontWeight: 800, color: 'var(--color-primary)' },
  statLabel: { fontSize: 11, color: 'var(--color-text-muted)' },
  listItem: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 0', borderBottom: '1px solid var(--color-border)', fontSize: 13, gap: 10,
    cursor: 'pointer', transition: 'background 0.12s ease', borderRadius: 6,
  },
  badge: { padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 },
  pendingRow: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0',
    borderBottom: '1px solid var(--color-border)', fontSize: 13,
    cursor: 'pointer', transition: 'background 0.12s ease', borderRadius: 6,
  },
  quickAction: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10,
    border: '1px solid var(--color-border)', background: 'var(--color-surface)',
    cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--color-text)',
    transition: 'all 0.15s ease',
  },
};

/* ── KPI label → route mapping ── */
const KPI_ROUTE_MAP: Record<string, string> = {
  'patient volume': '/provider/queue',
  'revenue': '/provider/billing',
  'avg wait time': '/provider/queue',
  'no-show rate': '/provider/scheduling',
  'bed occupancy': '/provider/facility',
  'queue throughput': '/provider/queue',
  'insurance claims': '/provider/billing',
  'staff utilization': '/provider/hr',
};

function kpiRoute(label: string): string {
  const lower = label.toLowerCase();
  for (const [key, route] of Object.entries(KPI_ROUTE_MAP)) {
    if (lower.includes(key)) return route;
  }
  return '/provider/analytics';
}

/* ── Audit log module → route mapping ── */
const MODULE_ROUTE_MAP: Record<string, string> = {
  'Clinical Notes': '/provider/queue',
  'Front Desk': '/provider/queue',
  'Triage': '/provider/nursing',
  'Pharmacy': '/provider/pharmacy',
  'Laboratory': '/provider/lab-imaging',
  'Billing': '/provider/billing',
  'Scheduling': '/provider/scheduling',
  'HR': '/provider/hr',
};

/* ── Quick Action Component ── */
const QuickAction: React.FC<{ icon: React.ComponentType<{ size?: number }>; label: string; description: string; to: string }> = ({ icon: Icon, label, description, to }) => {
  const navigate = useNavigate();
  return (
    <div className="pd-quick-action" style={s.quickAction} onClick={() => navigate(to)} role="button" tabIndex={0}>
      <div style={{ ...s.kpiIconWrap, width: 36, height: 36, marginBottom: 0, background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
        <Icon size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 13 }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{description}</div>
      </div>
      <ArrowRight size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
    </div>
  );
};

/* ══════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════ */

export const ProviderDashboard = () => {
  const navigate = useNavigate();
  const {
    currentStaff, dashboardKpis, queueStats, auditLogs, criticalAlerts,
    pendingLabOrders, prescriptions, dismissAlert, labOrders,
  } = useProvider();
  const { tenant } = useTheme();
  const features = tenant.features;
  const role = currentStaff.role;
  const meta = ROLE_META[role] ?? ROLE_META.admin;

  const pendingPrescriptions = prescriptions.filter((p) => p.status === 'Pending Approval');
  const pendingLOAReviews = prescriptions.filter(
    (p) => p.status === 'Pending Approval' && p.notes?.toLowerCase().includes('prior')
  ).length || Math.min(pendingLabOrders.filter((o) => o.priority === 'Urgent').length, 3);

  // Filter KPIs by tenant capabilities
  const filteredKpis = useMemo(() => dashboardKpis.filter((kpi) => {
    const label = kpi.label.toLowerCase();
    if (label.includes('bed') && !features.admissions) return false;
    if (label.includes('insurance') && !features.hmo && !features.loa) return false;
    return true;
  }), [dashboardKpis, features]);

  // Role-specific KPI selection
  const roleKpis = useMemo(() => {
    switch (role) {
      case 'lab_tech':
      case 'imaging_tech':
        return filteredKpis.filter(k => {
          const l = k.label.toLowerCase();
          return l.includes('patient') || l.includes('wait') || l.includes('lab') || l.includes('staff');
        }).slice(0, 4);
      case 'pharmacist':
        return filteredKpis.filter(k => {
          const l = k.label.toLowerCase();
          return l.includes('patient') || l.includes('revenue') || l.includes('staff') || l.includes('wait');
        }).slice(0, 4);
      case 'billing_staff':
        return filteredKpis.filter(k => {
          const l = k.label.toLowerCase();
          return l.includes('revenue') || l.includes('insurance') || l.includes('patient') || l.includes('claim');
        }).slice(0, 4);
      case 'front_desk':
        return filteredKpis.filter(k => {
          const l = k.label.toLowerCase();
          return l.includes('patient') || l.includes('wait') || l.includes('no-show') || l.includes('queue');
        }).slice(0, 4);
      case 'hr':
        return filteredKpis.filter(k => {
          const l = k.label.toLowerCase();
          return l.includes('staff') || l.includes('patient') || l.includes('bed') || l.includes('revenue');
        }).slice(0, 4);
      default:
        return filteredKpis.slice(0, 4);
    }
  }, [role, filteredKpis]);

  const getSeverityBadgeStyle = (severity: string): React.CSSProperties => {
    if (severity === 'contraindicated' || severity === 'major') {
      return { ...s.badge, background: 'var(--color-error-light)', color: 'var(--color-error)' };
    }
    if (severity === 'moderate') {
      return { ...s.badge, background: 'var(--color-warning-light)', color: 'var(--color-warning)' };
    }
    return { ...s.badge, background: 'var(--color-info-light)', color: 'var(--color-info)' };
  };

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 60000;
    if (diff < 60) return `${Math.round(diff)}m ago`;
    if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
    return d.toLocaleDateString();
  };

  /* ── Role-specific quick actions ── */
  const quickActions = useMemo(() => {
    switch (role) {
      case 'doctor':
        return [
          { icon: Users, label: 'Queue', description: 'Manage patient queue', to: '/provider/queue' },
          { icon: Calendar, label: 'Schedule', description: 'View appointments', to: '/provider/scheduling' },
          { icon: HeartPulse, label: 'Nursing', description: 'Nursing station', to: '/provider/nursing' },
          { icon: MessageSquare, label: 'Messages', description: 'Internal comms', to: '/provider/communications' },
        ];
      case 'nurse':
        return [
          { icon: HeartPulse, label: 'Nursing Station', description: 'Vitals, triage, care', to: '/provider/nursing' },
          { icon: Users, label: 'Queue', description: 'Manage patient queue', to: '/provider/queue' },
          { icon: Microscope, label: 'Lab & Imaging', description: 'Order tracking', to: '/provider/lab-imaging' },
          { icon: MessageSquare, label: 'Messages', description: 'Internal comms', to: '/provider/communications' },
        ];
      case 'lab_tech':
      case 'imaging_tech':
        return [
          { icon: Microscope, label: 'Lab & Imaging', description: 'Process orders', to: '/provider/lab-imaging' },
          { icon: MessageSquare, label: 'Messages', description: 'Internal comms', to: '/provider/communications' },
        ];
      case 'pharmacist':
        return [
          { icon: Pill, label: 'Pharmacy', description: 'Dispense medications', to: '/provider/pharmacy' },
          { icon: MessageSquare, label: 'Messages', description: 'Internal comms', to: '/provider/communications' },
        ];
      case 'billing_staff':
        return [
          { icon: CreditCard, label: 'Billing', description: 'Revenue & invoices', to: '/provider/billing' },
          { icon: MessageSquare, label: 'Messages', description: 'Internal comms', to: '/provider/communications' },
          { icon: ClipboardList, label: 'Forms', description: 'Manage forms', to: '/provider/forms' },
        ];
      case 'front_desk':
        return [
          { icon: Users, label: 'Queue', description: 'Manage check-in queue', to: '/provider/queue' },
          { icon: Calendar, label: 'Scheduling', description: 'Book appointments', to: '/provider/scheduling' },
          { icon: MessageSquare, label: 'Messages', description: 'Internal comms', to: '/provider/communications' },
          { icon: ClipboardList, label: 'Forms', description: 'Patient forms', to: '/provider/forms' },
        ];
      case 'hr':
        return [
          { icon: UserCog, label: 'HR & Staff', description: 'Manage personnel', to: '/provider/hr' },
          { icon: Calendar, label: 'Scheduling', description: 'Shift planning', to: '/provider/scheduling' },
          { icon: MessageSquare, label: 'Messages', description: 'Internal comms', to: '/provider/communications' },
          { icon: ClipboardList, label: 'Forms', description: 'HR forms', to: '/provider/forms' },
        ];
      case 'super_admin':
        return [
          { icon: Users, label: 'Queue', description: 'Real-time queue', to: '/provider/queue' },
          { icon: Calendar, label: 'Scheduling', description: 'View schedule', to: '/provider/scheduling' },
          { icon: ShieldCheck, label: 'Users', description: 'User management', to: '/provider/users' },
          { icon: Building2, label: 'Facility', description: 'Facility ops', to: '/provider/facility' },
        ];
      default: // admin
        return [
          { icon: Users, label: 'Queue', description: 'Real-time queue', to: '/provider/queue' },
          { icon: Calendar, label: 'Scheduling', description: 'View schedule', to: '/provider/scheduling' },
          { icon: ShieldCheck, label: 'Users', description: 'User management', to: '/provider/users' },
          { icon: Building2, label: 'Facility', description: 'Facility ops', to: '/provider/facility' },
        ];
    }
  }, [role]);

  /* ── Role-specific summary stats ── */
  const roleSummary = useMemo(() => {
    switch (role) {
      case 'nurse':
        return (
          <>
            <h2 style={s.sectionTitle}><Activity size={16} /> Nursing Summary</h2>
            <div style={s.statRow}>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/nursing')} role="button">
                <HeartPulse size={20} style={{ color: 'var(--color-primary)' }} />
                <div><div style={s.statValue}>12</div><div style={s.statLabel}>Patients Assigned</div></div>
              </div>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/nursing')} role="button">
                <Clock size={20} style={{ color: 'var(--color-warning, #f59e0b)' }} />
                <div><div style={s.statValue}>5</div><div style={s.statLabel}>Vitals Due</div></div>
              </div>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/queue')} role="button">
                <AlertTriangle size={20} style={{ color: 'var(--color-error)' }} />
                <div><div style={s.statValue}>2</div><div style={s.statLabel}>Critical Patients</div></div>
              </div>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/nursing')} role="button">
                <CheckCircle2 size={20} style={{ color: 'var(--color-success)' }} />
                <div><div style={s.statValue}>18</div><div style={s.statLabel}>Tasks Completed</div></div>
              </div>
            </div>
          </>
        );
      case 'lab_tech':
      case 'imaging_tech':
        return (
          <>
            <h2 style={s.sectionTitle}><FlaskConical size={16} /> Lab & Imaging Summary</h2>
            <div style={s.statRow}>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/lab-imaging')} role="button">
                <FlaskConical size={20} style={{ color: 'var(--color-primary)' }} />
                <div><div style={s.statValue}>{pendingLabOrders.length}</div><div style={s.statLabel}>Pending Orders</div></div>
              </div>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/lab-imaging')} role="button">
                <Clock size={20} style={{ color: 'var(--color-warning, #f59e0b)' }} />
                <div><div style={s.statValue}>{labOrders.filter(o => o.priority === 'Stat').length}</div><div style={s.statLabel}>STAT Orders</div></div>
              </div>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/lab-imaging')} role="button">
                <CheckCircle2 size={20} style={{ color: 'var(--color-success)' }} />
                <div><div style={s.statValue}>{labOrders.filter(o => o.status === 'Resulted').length}</div><div style={s.statLabel}>Results Ready</div></div>
              </div>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/lab-imaging')} role="button">
                <Microscope size={20} style={{ color: 'var(--color-text-muted)' }} />
                <div><div style={s.statValue}>{labOrders.filter(o => o.status === 'In Progress').length}</div><div style={s.statLabel}>In Progress</div></div>
              </div>
            </div>
          </>
        );
      case 'pharmacist':
        return (
          <>
            <h2 style={s.sectionTitle}><Pill size={16} /> Pharmacy Summary</h2>
            <div style={s.statRow}>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/pharmacy')} role="button">
                <Pill size={20} style={{ color: 'var(--color-primary)' }} />
                <div><div style={s.statValue}>{pendingPrescriptions.length}</div><div style={s.statLabel}>Pending Approval</div></div>
              </div>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/pharmacy')} role="button">
                <CheckCircle2 size={20} style={{ color: 'var(--color-success)' }} />
                <div><div style={s.statValue}>{prescriptions.filter(p => p.status === 'Active').length}</div><div style={s.statLabel}>Active Prescriptions</div></div>
              </div>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/pharmacy')} role="button">
                <AlertTriangle size={20} style={{ color: 'var(--color-error)' }} />
                <div><div style={s.statValue}>3</div><div style={s.statLabel}>Interaction Alerts</div></div>
              </div>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/pharmacy')} role="button">
                <Clock size={20} style={{ color: 'var(--color-text-muted)' }} />
                <div><div style={s.statValue}>{prescriptions.filter(p => p.status === 'Completed').length}</div><div style={s.statLabel}>Dispensed Today</div></div>
              </div>
            </div>
          </>
        );
      case 'billing_staff':
        return (
          <>
            <h2 style={s.sectionTitle}><CreditCard size={16} /> Billing Summary</h2>
            <div style={s.statRow}>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/billing')} role="button">
                <DollarSign size={20} style={{ color: 'var(--color-success)' }} />
                <div><div style={s.statValue}>₱1.2M</div><div style={s.statLabel}>Revenue Today</div></div>
              </div>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/billing')} role="button">
                <Clock size={20} style={{ color: 'var(--color-warning, #f59e0b)' }} />
                <div><div style={s.statValue}>24</div><div style={s.statLabel}>Pending Invoices</div></div>
              </div>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/billing')} role="button">
                <FileCheck size={20} style={{ color: 'var(--color-primary)' }} />
                <div><div style={s.statValue}>8</div><div style={s.statLabel}>Claims Processing</div></div>
              </div>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/billing')} role="button">
                <CheckCircle2 size={20} style={{ color: 'var(--color-success)' }} />
                <div><div style={s.statValue}>45</div><div style={s.statLabel}>Settled Today</div></div>
              </div>
            </div>
          </>
        );
      case 'front_desk':
        return (
          <>
            <h2 style={s.sectionTitle}><Users size={16} /> Front Desk Summary</h2>
            <div style={s.statRow}>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/queue')} role="button">
                <Users size={20} style={{ color: 'var(--color-primary)' }} />
                <div><div style={s.statValue}>{queueStats.totalInQueue}</div><div style={s.statLabel}>In Queue</div></div>
              </div>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/queue')} role="button">
                <Clock size={20} style={{ color: 'var(--color-warning, #f59e0b)' }} />
                <div><div style={s.statValue}>{queueStats.avgWaitTime} min</div><div style={s.statLabel}>Avg Wait</div></div>
              </div>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/scheduling')} role="button">
                <Calendar size={20} style={{ color: 'var(--color-primary)' }} />
                <div><div style={s.statValue}>28</div><div style={s.statLabel}>Appointments Today</div></div>
              </div>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/queue')} role="button">
                <CheckCircle2 size={20} style={{ color: 'var(--color-success)' }} />
                <div><div style={s.statValue}>{queueStats.completedToday}</div><div style={s.statLabel}>Checked In</div></div>
              </div>
            </div>
          </>
        );
      case 'hr':
        return (
          <>
            <h2 style={s.sectionTitle}><UserCog size={16} /> HR Summary</h2>
            <div style={s.statRow}>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/hr')} role="button">
                <UserCog size={20} style={{ color: 'var(--color-primary)' }} />
                <div><div style={s.statValue}>86</div><div style={s.statLabel}>Total Staff</div></div>
              </div>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/hr')} role="button">
                <CheckCircle2 size={20} style={{ color: 'var(--color-success)' }} />
                <div><div style={s.statValue}>72</div><div style={s.statLabel}>On Duty Today</div></div>
              </div>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/hr')} role="button">
                <Clock size={20} style={{ color: 'var(--color-warning, #f59e0b)' }} />
                <div><div style={s.statValue}>5</div><div style={s.statLabel}>Leave Requests</div></div>
              </div>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/hr')} role="button">
                <AlertTriangle size={20} style={{ color: 'var(--color-error)' }} />
                <div><div style={s.statValue}>2</div><div style={s.statLabel}>Credential Expiring</div></div>
              </div>
            </div>
          </>
        );
      case 'doctor':
        return (
          <>
            <h2 style={s.sectionTitle}><Stethoscope size={16} /> Clinical Summary</h2>
            <div style={s.statRow}>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/queue')} role="button">
                <Users size={20} style={{ color: 'var(--color-primary)' }} />
                <div><div style={s.statValue}>{queueStats.totalInQueue}</div><div style={s.statLabel}>Patients in Queue</div></div>
              </div>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/scheduling')} role="button">
                <Calendar size={20} style={{ color: 'var(--color-primary)' }} />
                <div><div style={s.statValue}>14</div><div style={s.statLabel}>Appointments Today</div></div>
              </div>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/lab-imaging')} role="button">
                <FlaskConical size={20} style={{ color: 'var(--color-warning, #f59e0b)' }} />
                <div><div style={s.statValue}>{pendingLabOrders.length}</div><div style={s.statLabel}>Pending Lab Results</div></div>
              </div>
              <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/records')} role="button">
                <Pill size={20} style={{ color: 'var(--color-text-muted)' }} />
                <div><div style={s.statValue}>{pendingPrescriptions.length}</div><div style={s.statLabel}>Pending Rx</div></div>
              </div>
            </div>
          </>
        );
      case 'super_admin':
        return null; // super_admin uses the full KPI view
      default: // admin
        return null; // admin uses the full KPI view below
    }
  }, [role, queueStats, pendingLabOrders, pendingPrescriptions, labOrders, prescriptions]);

  // Should we show full admin KPIs?
  const showFullKpis = role === 'admin' || role === 'super_admin';
  // Show queue overview for roles that deal with queue
  const showQueue = ['super_admin', 'admin', 'front_desk', 'doctor', 'nurse'].includes(role) && features.queue;
  // Show critical alerts for clinical roles
  const showAlerts = ['super_admin', 'admin', 'doctor', 'nurse'].includes(role) && (features.cdss ?? false);
  // Show pending actions panel
  const showPending = ['super_admin', 'admin', 'doctor', 'nurse', 'pharmacist', 'lab_tech', 'imaging_tech'].includes(role);
  // Show recent activity
  const showActivity = ['super_admin', 'admin', 'hr'].includes(role);

  return (
    <div style={s.page}>
      {/* Header with role context */}
      <div style={s.headerRow}>
        <div>
          <h1 style={s.title}>{meta.title}</h1>
          <p style={s.subtitle}>{meta.greeting} · {currentStaff.name}</p>
        </div>
        <span style={{
          ...s.rolePill,
          background: `color-mix(in srgb, ${meta.color} 12%, white)`,
          color: meta.color,
        }}>
          {currentStaff.role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
        </span>
      </div>

      {/* Quick Actions - role specific */}
      <h2 style={s.sectionTitle}><ArrowRight size={16} /> Quick Actions</h2>
      <div style={{ ...s.grid, marginBottom: 8 }}>
        {quickActions.map((a, i) => (
          <QuickAction key={i} icon={a.icon} label={a.label} description={a.description} to={a.to} />
        ))}
      </div>

      {/* Role-specific summary stats */}
      {roleSummary}

      {/* Admin: Full KPI cards */}
      {showFullKpis && (
        <>
          <h2 style={s.sectionTitle}><Activity size={16} /> Key Performance Indicators</h2>
          <div style={s.grid}>
            {roleKpis.map((kpi, i) => {
              const Icon = KPI_ICONS[kpi.icon] ?? Users;
              const changeColor =
                kpi.trend === 'up' ? 'var(--color-success)' : kpi.trend === 'down' ? 'var(--color-error)' : 'var(--color-text-muted)';
              const ChangeIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus;
              return (
                <div className="pd-kpi-card" key={i} style={s.cardClickable} onClick={() => navigate(kpiRoute(kpi.label))} role="button">
                  <div style={{ ...s.kpiIconWrap, background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                    <Icon size={20} />
                  </div>
                  <div style={s.kpiValue}>{kpi.value}</div>
                  <div style={s.kpiLabel}>{kpi.label}</div>
                  <div style={{ ...s.kpiChange, color: changeColor }}>
                    <ChangeIcon size={14} /> {Math.abs(kpi.change)}% vs last period
                  </div>
                </div>
              );
            })}
          </div>
          {filteredKpis.length > 4 && (
            <div style={{ ...s.grid, marginTop: 14 }}>
              {filteredKpis.slice(4, 8).map((kpi, i) => {
                const Icon = KPI_ICONS[kpi.icon] ?? Users;
                const changeColor =
                  kpi.trend === 'up' ? 'var(--color-success)' : kpi.trend === 'down' ? 'var(--color-error)' : 'var(--color-text-muted)';
                const ChangeIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus;
                return (
                  <div className="pd-kpi-card" key={i} style={s.cardClickable} onClick={() => navigate(kpiRoute(kpi.label))} role="button">
                    <div style={{ ...s.kpiIconWrap, background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                      <Icon size={20} />
                    </div>
                    <div style={s.kpiValue}>{kpi.value}</div>
                    <div style={s.kpiLabel}>{kpi.label}</div>
                    <div style={{ ...s.kpiChange, color: changeColor }}>
                      <ChangeIcon size={14} /> {Math.abs(kpi.change)}% vs last period
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Queue Overview */}
      {showQueue && (
        <>
          <h2 style={s.sectionTitle}><Users size={16} /> Real-Time Queue</h2>
          <div style={s.statRow}>
            <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/queue')} role="button">
              <div><div style={s.statValue}>{queueStats.totalInQueue}</div><div style={s.statLabel}>Total in Queue</div></div>
            </div>
            <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/queue')} role="button">
              <div><div style={s.statValue}>{queueStats.avgWaitTime} min</div><div style={s.statLabel}>Avg Wait Time</div></div>
            </div>
            <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/queue')} role="button">
              <div><div style={s.statValue}>{queueStats.longestWait} min</div><div style={s.statLabel}>Longest Wait</div></div>
            </div>
            <div className="pd-stat-card" style={s.statCard} onClick={() => navigate('/provider/queue')} role="button">
              <div><div style={s.statValue}>{queueStats.completedToday}</div><div style={s.statLabel}>Completed Today</div></div>
            </div>
          </div>
        </>
      )}

      {/* Bottom panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {/* Recent Activity */}
        {showActivity && (
          <div style={s.card}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 14 }}>Recent Activity</h3>
            <div>
              {auditLogs.slice(0, 6).map((log) => (
                <div
                  className="pd-list-item"
                  key={log.id}
                  style={s.listItem}
                  onClick={() => navigate(MODULE_ROUTE_MAP[log.module] ?? '/provider/queue')}
                  role="button"
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'var(--color-text)', fontWeight: 600 }}>{log.action.replace(/_/g, ' ')}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>{log.userName} · {log.module}</div>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Critical Alerts */}
        {showAlerts && (
          <div style={s.card}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 14 }}>
              Critical Alerts ({criticalAlerts.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {criticalAlerts.length === 0 ? (
                <div style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>No active alerts</div>
              ) : (
                criticalAlerts.map((alert) => (
                  <div
                    className="pd-alert-card"
                    key={alert.id}
                    style={{ padding: 10, border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-surface)', cursor: 'pointer', transition: 'all 0.12s ease' }}
                    onClick={() => navigate('/provider/queue')}
                    role="button"
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
                      <span style={getSeverityBadgeStyle(alert.severity)}>{alert.severity}</span>
                      <span style={{ flex: 1, fontWeight: 600, color: 'var(--color-text)', fontSize: 12 }}>{alert.title}</span>
                      <button onClick={(e) => { e.stopPropagation(); dismissAlert(alert.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--color-text-muted)' }}>×</button>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{alert.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Pending Actions */}
        {showPending && (
          <div style={s.card}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 14 }}>Pending Actions</h3>
            {(['lab_tech', 'imaging_tech', 'super_admin', 'admin', 'doctor', 'nurse'].includes(role) && features.visits.clinicLabFulfillmentEnabled) && (
              <div className="pd-pending-row" style={s.pendingRow} onClick={() => navigate('/provider/lab-imaging')} role="button">
                <FlaskConical size={18} style={{ color: 'var(--color-primary)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>Pending Lab Orders</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{pendingLabOrders.length} orders</div>
                </div>
                <span style={{ ...s.badge, background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>{pendingLabOrders.length}</span>
                <ArrowRight size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              </div>
            )}
            {(['pharmacist', 'super_admin', 'admin', 'doctor'].includes(role)) && (
              <div className="pd-pending-row" style={s.pendingRow} onClick={() => navigate(role === 'doctor' ? '/provider/records' : '/provider/pharmacy')} role="button">
                <Pill size={18} style={{ color: 'var(--color-primary)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>Pending Prescriptions</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Awaiting approval</div>
                </div>
                <span style={{ ...s.badge, background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>{pendingPrescriptions.length}</span>
                <ArrowRight size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              </div>
            )}
            {(['super_admin', 'admin', 'doctor'].includes(role) && features.loa) && (
              <div className="pd-pending-row" style={s.pendingRow} onClick={() => navigate('/provider/billing')} role="button">
                <FileSignature size={18} style={{ color: 'var(--color-primary)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>LOA Reviews</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Letters of Authorization</div>
                </div>
                <span style={{ ...s.badge, background: 'var(--color-info-light)', color: 'var(--color-info)' }}>{pendingLOAReviews}</span>
                <ArrowRight size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
