import { useState, useMemo } from 'react';
import {
  Search,
  Users,
  FileText,
  ClipboardList,
  Pill,
  TestTube2,
  Eye,
  ChevronDown,
  ChevronUp,
  Activity,
  Calendar,
  Clock,
  Stethoscope,
  AlertTriangle,
  Syringe,
  User,
  Printer,
  Filter,
  Download,
  Heart,
} from 'lucide-react';
import { useProvider } from '../context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { getPatientTenant } from '../data/providerMockData';

/* ─── types ─── */
type TabId = 'patients' | 'orders' | 'notes' | 'prescriptions' | 'documents' | 'immunizations';

interface PatientSummary {
  id: string;
  name: string;
  encounters: number;
  labOrders: number;
  prescriptions: number;
  notes: number;
  immunizations: number;
  lastVisit: string;
  conditions: string[];
}

/* ─── styles ─── */
const S: Record<string, React.CSSProperties> = {
  page: { padding: 24, background: 'var(--color-background)', minHeight: '100%' },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 },
  subtitle: { fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 24 },

  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 },
  statCard: {
    background: 'var(--color-surface)', borderRadius: 12, padding: 18,
    boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)',
  },
  statIcon: { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 20, fontWeight: 700, color: 'var(--color-text)' },
  statLabel: { fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 },

  tabs: { display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--color-border)', paddingBottom: 0, overflowX: 'auto' as const },
  tab: {
    padding: '10px 16px', fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)',
    background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: '2px solid transparent',
    marginBottom: -1, whiteSpace: 'nowrap' as const, display: 'inline-flex', alignItems: 'center', gap: 6,
  },
  tabActive: { color: 'var(--color-primary)', borderBottomColor: 'var(--color-primary)' },

  card: {
    background: 'var(--color-surface)', borderRadius: 12, padding: 24,
    boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)',
  },

  toolbar: { display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' as const, alignItems: 'center' },
  searchWrap: { flex: 1, position: 'relative' as const, minWidth: 220 },
  searchIcon: { position: 'absolute' as const, left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' },
  searchInput: {
    width: '100%', padding: '10px 14px 10px 40px', border: '1px solid var(--color-border)',
    borderRadius: 8, fontSize: 13, background: 'var(--color-surface)', color: 'var(--color-text)',
    boxSizing: 'border-box' as const,
  },
  filterSelect: {
    padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 8,
    background: 'var(--color-surface)', color: 'var(--color-text-muted)', fontSize: 13, cursor: 'pointer',
  },

  th: {
    padding: '10px 14px', textAlign: 'left' as const, fontSize: 11, fontWeight: 600,
    color: 'var(--color-text-muted)', background: 'var(--color-background)',
    borderBottom: '1px solid var(--color-border)', textTransform: 'uppercase' as const, letterSpacing: 0.5,
  },
  td: { padding: '12px 14px', fontSize: 13, color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)' },

  badge: {
    padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
    display: 'inline-flex', alignItems: 'center', gap: 4,
  },

  btnSm: {
    padding: '6px 12px', background: 'transparent', border: '1px solid var(--color-border)',
    borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--color-text-muted)',
    transition: 'all .15s',
  },
  btnPrimary: {
    padding: '6px 12px', background: 'var(--color-primary)', border: 'none',
    borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 4, color: '#fff',
  },

  empty: { textAlign: 'center' as const, padding: 40, color: 'var(--color-text-muted)', fontSize: 13 },

  detail: {
    padding: '12px 16px', background: 'color-mix(in srgb, var(--color-primary) 2%, var(--color-surface))',
    borderBottom: '1px solid var(--color-border)',
  },
  detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, padding: '12px 0' },
  detailLabel: { fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, marginBottom: 3 },
  detailValue: { fontSize: 13, fontWeight: 500, color: 'var(--color-text)' },

  patientCard: {
    borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-surface)',
    overflow: 'hidden', transition: 'box-shadow .15s',
  },
  patientHeader: {
    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', cursor: 'pointer',
    transition: 'background .15s',
  },
  avatar: {
    width: 42, height: 42, borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: 16, color: '#fff',
  },
};

/* ─── status helpers ─── */
function statusColor(status: string): { bg: string; color: string } {
  const map: Record<string, { bg: string; color: string }> = {
    // Lab Orders
    Ordered: { bg: 'var(--color-info-light, #dbeafe)', color: 'var(--color-info, #3b82f6)' },
    'Specimen Collected': { bg: '#fef3c7', color: '#d97706' },
    'In Progress': { bg: 'var(--color-warning-light, #fef3c7)', color: 'var(--color-warning, #f59e0b)' },
    Resulted: { bg: 'var(--color-success-light, #d1fae5)', color: 'var(--color-success, #10b981)' },
    Reviewed: { bg: '#d1fae5', color: '#059669' },
    Cancelled: { bg: 'var(--color-error-light, #fee2e2)', color: 'var(--color-error, #ef4444)' },
    // Prescriptions
    Active: { bg: 'var(--color-success-light, #d1fae5)', color: 'var(--color-success, #10b981)' },
    Completed: { bg: 'var(--color-gray-100, #f3f4f6)', color: 'var(--color-text-muted)' },
    'Pending Approval': { bg: 'var(--color-warning-light, #fef3c7)', color: 'var(--color-warning, #f59e0b)' },
    // Notes
    Draft: { bg: '#fef3c7', color: '#d97706' },
    Signed: { bg: 'var(--color-success-light, #d1fae5)', color: 'var(--color-success, #10b981)' },
    Amended: { bg: 'var(--color-info-light, #dbeafe)', color: 'var(--color-info, #3b82f6)' },
    // Appointments
    Upcoming: { bg: 'var(--color-info-light, #dbeafe)', color: 'var(--color-info, #3b82f6)' },
    Confirmed: { bg: 'var(--color-success-light, #d1fae5)', color: 'var(--color-success, #10b981)' },
    // Priority
    Stat: { bg: 'var(--color-error-light, #fee2e2)', color: 'var(--color-error, #ef4444)' },
    Urgent: { bg: 'var(--color-warning-light, #fef3c7)', color: 'var(--color-warning, #f59e0b)' },
    Routine: { bg: 'var(--color-gray-100, #f3f4f6)', color: 'var(--color-text-muted)' },
    // Generic
    Final: { bg: 'var(--color-success-light, #d1fae5)', color: 'var(--color-success, #10b981)' },
    Pending: { bg: 'var(--color-warning-light, #fef3c7)', color: 'var(--color-warning, #f59e0b)' },
  };
  return map[status] ?? { bg: 'var(--color-gray-100, #f3f4f6)', color: 'var(--color-text-muted)' };
}

function StatusBadge({ status }: { status: string }) {
  const c = statusColor(status);
  return <span style={{ ...S.badge, background: c.bg, color: c.color }}>{status}</span>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const c = statusColor(priority);
  return <span style={{ ...S.badge, background: c.bg, color: c.color }}>{priority === 'Stat' && <AlertTriangle size={10} />}{priority}</span>;
}

const avatarColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#6366f1'];
function getAvatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return avatarColors[Math.abs(h) % avatarColors.length];
}
function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

/* ═══════════════════════════════════════════════ */
export function Records() {
  const { tenant } = useTheme();
  const {
    clinicalNotes, prescriptions, labOrders, appointments,
    immunizationRecords, triageRecords,
  } = useProvider();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabId>('patients');
  const [globalSearch, setGlobalSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // For patient drill-down
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  /* ── Filter all data by the active tenant ── */
  const tenantId = tenant.id;
  const tNotes = useMemo(() => clinicalNotes.filter(n => getPatientTenant(n.patientId) === tenantId), [clinicalNotes, tenantId]);
  const tOrders = useMemo(() => labOrders.filter(o => getPatientTenant(o.patientId) === tenantId), [labOrders, tenantId]);
  const tRx = useMemo(() => prescriptions.filter(rx => getPatientTenant(rx.patientId) === tenantId), [prescriptions, tenantId]);
  const tImm = useMemo(() => immunizationRecords.filter(i => getPatientTenant(i.patientId) === tenantId), [immunizationRecords, tenantId]);
  const tTriage = useMemo(() => triageRecords.filter(t => getPatientTenant(t.patientId) === tenantId), [triageRecords, tenantId]);

  /* ── Build aggregated patient list ── */
  const patients = useMemo<PatientSummary[]>(() => {
    const map = new Map<string, PatientSummary>();

    const getOrCreate = (id: string, name: string): PatientSummary => {
      if (!map.has(id)) {
        map.set(id, { id, name, encounters: 0, labOrders: 0, prescriptions: 0, notes: 0, immunizations: 0, lastVisit: '', conditions: [] });
      }
      return map.get(id)!;
    };

    for (const n of tNotes) {
      const p = getOrCreate(n.patientId, n.patientName);
      p.notes++;
      p.encounters++;
      if (n.date > p.lastVisit) p.lastVisit = n.date;
      for (const icd of (n.icdCodes ?? [])) {
        if (!p.conditions.includes(icd)) p.conditions.push(icd);
      }
    }
    for (const o of tOrders) {
      const p = getOrCreate(o.patientId, o.patientName);
      p.labOrders++;
      if (o.orderedDate > p.lastVisit) p.lastVisit = o.orderedDate;
    }
    for (const rx of tRx) {
      const p = getOrCreate(rx.patientId, rx.patientName);
      p.prescriptions++;
    }
    for (const imm of tImm) {
      const p = getOrCreate(imm.patientId, imm.patientName);
      p.immunizations++;
    }
    for (const tr of tTriage) {
      const p = getOrCreate(tr.patientId, tr.patientName);
      p.encounters++;
    }

    return Array.from(map.values()).sort((a, b) => b.lastVisit.localeCompare(a.lastVisit));
  }, [tNotes, tOrders, tRx, tImm, tTriage]);

  /* ── Global stats ── */
  const stats = useMemo(() => ({
    totalPatients: patients.length,
    totalOrders: tOrders.length,
    pendingOrders: tOrders.filter(o => o.status === 'Ordered' || o.status === 'In Progress').length,
    totalNotes: tNotes.length,
    totalRx: tRx.length,
    activeRx: tRx.filter(rx => rx.status === 'Active').length,
    totalImm: tImm.length,
    criticalResults: tOrders.filter(o => o.isCritical).length,
  }), [patients, tOrders, tNotes, tRx, tImm]);

  /* ── Filtered data per tab (uses tenant-filtered data) ── */
  const filteredOrders = useMemo(() => {
    return tOrders.filter(o => {
      const matchSearch = !globalSearch
        || o.patientName.toLowerCase().includes(globalSearch.toLowerCase())
        || o.testName.toLowerCase().includes(globalSearch.toLowerCase())
        || o.id.toLowerCase().includes(globalSearch.toLowerCase());
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchType = typeFilter === 'all' || o.testType === typeFilter;
      const matchPatient = !selectedPatientId || o.patientId === selectedPatientId;
      return matchSearch && matchStatus && matchType && matchPatient;
    });
  }, [tOrders, globalSearch, statusFilter, typeFilter, selectedPatientId]);

  const filteredNotes = useMemo(() => {
    return tNotes.filter(n => {
      const matchSearch = !globalSearch
        || n.patientName.toLowerCase().includes(globalSearch.toLowerCase())
        || n.assessment.toLowerCase().includes(globalSearch.toLowerCase())
        || (n.icdCodes ?? []).join(' ').toLowerCase().includes(globalSearch.toLowerCase());
      const matchStatus = statusFilter === 'all' || n.status === statusFilter;
      const matchPatient = !selectedPatientId || n.patientId === selectedPatientId;
      return matchSearch && matchStatus && matchPatient;
    });
  }, [tNotes, globalSearch, statusFilter, selectedPatientId]);

  const filteredRx = useMemo(() => {
    return tRx.filter(rx => {
      const matchSearch = !globalSearch
        || rx.patientName.toLowerCase().includes(globalSearch.toLowerCase())
        || rx.medication.toLowerCase().includes(globalSearch.toLowerCase())
        || rx.id.toLowerCase().includes(globalSearch.toLowerCase());
      const matchStatus = statusFilter === 'all' || rx.status === statusFilter;
      const matchPatient = !selectedPatientId || rx.patientId === selectedPatientId;
      return matchSearch && matchStatus && matchPatient;
    });
  }, [tRx, globalSearch, statusFilter, selectedPatientId]);

  const filteredImm = useMemo(() => {
    return tImm.filter(imm => {
      const matchSearch = !globalSearch
        || imm.patientName.toLowerCase().includes(globalSearch.toLowerCase())
        || imm.vaccine.toLowerCase().includes(globalSearch.toLowerCase());
      const matchPatient = !selectedPatientId || imm.patientId === selectedPatientId;
      return matchSearch && matchPatient;
    });
  }, [tImm, globalSearch, selectedPatientId]);

  const filteredPatients = useMemo(() => {
    if (!globalSearch) return patients;
    const q = globalSearch.toLowerCase();
    return patients.filter(p =>
      p.name.toLowerCase().includes(q)
      || p.conditions.join(' ').toLowerCase().includes(q)
      || p.id.toLowerCase().includes(q)
    );
  }, [patients, globalSearch]);

  /* ── Tab list ── */
  const tabList: { id: TabId; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'patients', label: 'Patients', icon: <Users size={14} />, count: filteredPatients.length },
    { id: 'orders', label: 'Orders', icon: <TestTube2 size={14} />, count: filteredOrders.length },
    { id: 'notes', label: 'Clinical Notes', icon: <ClipboardList size={14} />, count: filteredNotes.length },
    { id: 'prescriptions', label: 'Prescriptions', icon: <Pill size={14} />, count: filteredRx.length },
    { id: 'immunizations', label: 'Immunizations', icon: <Syringe size={14} />, count: filteredImm.length },
  ];

  const handleDrillDown = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveTab('orders');
  };

  const clearPatientFilter = () => {
    setSelectedPatientId(null);
  };

  const selectedPatient = selectedPatientId ? patients.find(p => p.id === selectedPatientId) : null;

  return (
    <div style={S.page}>
      <h1 style={S.title}>Records</h1>
      <p style={S.subtitle}>Search and manage patient records, orders, clinical notes, and prescriptions</p>

      {/* ── Stat Cards ── */}
      <div style={S.statsRow}>
        {[
          { label: 'Total Patients', value: stats.totalPatients, icon: <Users size={18} />, bg: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', iconColor: 'var(--color-primary)' },
          { label: 'Lab/Imaging Orders', value: stats.totalOrders, icon: <TestTube2 size={18} />, bg: 'var(--color-info-light, #dbeafe)', iconColor: 'var(--color-info, #3b82f6)' },
          { label: 'Pending Orders', value: stats.pendingOrders, icon: <Clock size={18} />, bg: 'var(--color-warning-light, #fef3c7)', iconColor: 'var(--color-warning, #f59e0b)' },
          { label: 'Critical Results', value: stats.criticalResults, icon: <AlertTriangle size={18} />, bg: 'var(--color-error-light, #fee2e2)', iconColor: 'var(--color-error, #ef4444)' },
          { label: 'Clinical Notes', value: stats.totalNotes, icon: <ClipboardList size={18} />, bg: 'var(--color-success-light, #d1fae5)', iconColor: 'var(--color-success)' },
          { label: 'Active Rx', value: stats.activeRx, icon: <Pill size={18} />, bg: '#ede9fe', iconColor: '#8b5cf6' },
        ].map((st, i) => (
          <div key={i} style={S.statCard}>
            <div style={{ ...S.statIcon, background: st.bg }}><span style={{ color: st.iconColor }}>{st.icon}</span></div>
            <div style={S.statValue}>{st.value}</div>
            <div style={S.statLabel}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* ── Patient filter banner ── */}
      {selectedPatient && (
        <div style={{
          marginBottom: 16, padding: '10px 16px', borderRadius: 10,
          background: 'color-mix(in srgb, var(--color-primary) 8%, var(--color-surface))',
          border: '1px solid color-mix(in srgb, var(--color-primary) 20%, var(--color-border))',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Filter size={14} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
            Filtered by patient: <span style={{ color: 'var(--color-primary)' }}>{selectedPatient.name}</span>
          </span>
          <button
            style={{ ...S.btnSm, marginLeft: 'auto', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
            onClick={clearPatientFilter}
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* ── Global Search ── */}
      <div style={S.toolbar}>
        <div style={S.searchWrap}>
          <Search size={16} style={S.searchIcon} />
          <input
            style={S.searchInput}
            placeholder="Search across all records — patient, test, diagnosis, medication..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
        </div>
        <button style={S.btnSm} onClick={() => showToast('Export started — CSV will download shortly', 'info')}>
          <Download size={12} /> Export
        </button>
      </div>

      {/* ── Tabs ── */}
      <div style={S.tabs}>
        {tabList.map(tab => (
          <button
            key={tab.id}
            style={{ ...S.tab, ...(activeTab === tab.id ? S.tabActive : {}) }}
            onClick={() => { setActiveTab(tab.id); setStatusFilter('all'); setTypeFilter('all'); setExpandedId(null); }}
          >
            {tab.icon} {tab.label}
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 8, marginLeft: 2,
              background: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-gray-100, #f3f4f6)',
              color: activeTab === tab.id ? '#fff' : 'var(--color-text-muted)',
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ═══ Patients Tab ═══ */}
      {activeTab === 'patients' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredPatients.length === 0 ? (
            <div style={{ ...S.card, ...S.empty }}>No patients found</div>
          ) : (
            filteredPatients.map(p => {
              const expanded = expandedId === p.id;
              // Get all records for this patient
              const pNotes = tNotes.filter(n => n.patientId === p.id);
              const pOrders = tOrders.filter(o => o.patientId === p.id);
              const pRx = tRx.filter(rx => rx.patientId === p.id);
              const pImm = tImm.filter(im => im.patientId === p.id);
              const pTriage = tTriage.filter(tr => tr.patientId === p.id);

              return (
                <div key={p.id} style={S.patientCard}>
                  <div
                    style={S.patientHeader}
                    onClick={() => setExpandedId(expanded ? null : p.id)}
                    onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in srgb, var(--color-primary) 3%, var(--color-surface))'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ ...S.avatar, background: getAvatarColor(p.name) }}>{getInitials(p.name)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>{p.name}</span>
                        {p.conditions.length > 0 && p.conditions.slice(0, 3).map((c, i) => (
                          <span key={i} style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', color: 'var(--color-primary)' }}>{c}</span>
                        ))}
                        {p.conditions.length > 3 && (
                          <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>+{p.conditions.length - 3} more</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 3, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {p.lastVisit && <span><Calendar size={10} style={{ verticalAlign: 'middle', marginRight: 3 }} />Last: {p.lastVisit}</span>}
                        <span>{p.encounters} encounters</span>
                      </div>
                    </div>

                    {/* Quick counts */}
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      {[
                        { icon: <TestTube2 size={11} />, count: p.labOrders, label: 'Orders', color: 'var(--color-info, #3b82f6)' },
                        { icon: <ClipboardList size={11} />, count: p.notes, label: 'Notes', color: 'var(--color-success)' },
                        { icon: <Pill size={11} />, count: p.prescriptions, label: 'Rx', color: '#8b5cf6' },
                        { icon: <Syringe size={11} />, count: p.immunizations, label: 'Imm', color: '#f59e0b' },
                      ].map((q, i) => (
                        <div key={i} style={{ textAlign: 'center', minWidth: 38 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: q.count > 0 ? q.color : 'var(--color-text-muted)' }}>{q.count}</div>
                          <div style={{ fontSize: 9, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>{q.icon}{q.label}</div>
                        </div>
                      ))}
                    </div>

                    <button
                      style={{ ...S.btnPrimary, fontSize: 10, padding: '5px 10px' }}
                      onClick={(e) => { e.stopPropagation(); handleDrillDown(p.id); }}
                    >
                      <Eye size={10} /> View All
                    </button>
                    {expanded ? <ChevronUp size={14} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />}
                  </div>

                  {/* Expanded — quick summary */}
                  {expanded && (
                    <div style={S.detail}>
                      {/* Recent Notes */}
                      {pNotes.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <ClipboardList size={12} /> Recent Clinical Notes
                          </div>
                          {pNotes.slice(0, 2).map(n => (
                            <div key={n.id} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--color-surface)', border: '1px solid var(--color-border)', marginBottom: 6, fontSize: 12 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{n.date}</span>
                                <StatusBadge status={n.status} />
                              </div>
                              <div style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>
                                <strong>Assessment:</strong> {n.assessment.length > 120 ? n.assessment.substring(0, 120) + '…' : n.assessment}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Recent Orders */}
                      {pOrders.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <TestTube2 size={12} /> Recent Orders
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {pOrders.slice(0, 4).map(o => (
                              <div key={o.id} style={{ padding: '6px 10px', borderRadius: 6, background: 'var(--color-surface)', border: '1px solid var(--color-border)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontWeight: 600 }}>{o.testName}</span>
                                <StatusBadge status={o.status} />
                                {o.isCritical && <AlertTriangle size={10} style={{ color: 'var(--color-error)' }} />}
                              </div>
                            ))}
                            {pOrders.length > 4 && <span style={{ fontSize: 11, color: 'var(--color-text-muted)', padding: '6px 0' }}>+{pOrders.length - 4} more</span>}
                          </div>
                        </div>
                      )}

                      {/* Active Prescriptions */}
                      {pRx.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Pill size={12} /> Prescriptions ({pRx.filter(rx => rx.status === 'Active').length} active)
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {pRx.slice(0, 4).map(rx => (
                              <div key={rx.id} style={{ padding: '6px 10px', borderRadius: 6, background: 'var(--color-surface)', border: '1px solid var(--color-border)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontWeight: 600 }}>{rx.medication}</span>
                                <span style={{ color: 'var(--color-text-muted)' }}>{rx.dosage}</span>
                                <StatusBadge status={rx.status} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Immunizations */}
                      {pImm.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Syringe size={12} /> Immunizations
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {pImm.map(im => (
                              <span key={im.id} style={{ padding: '4px 8px', borderRadius: 6, background: '#fef3c7', color: '#92400e', fontSize: 10, fontWeight: 600 }}>
                                {im.vaccine} ({im.doseNumber})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Vitals from triage */}
                      {pTriage.length > 0 && (
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Activity size={12} /> Latest Vitals
                          </div>
                          {(() => {
                            const latest = pTriage[0];
                            return (
                              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 11 }}>
                                <span><strong>BP:</strong> {latest.vitals.bp}</span>
                                <span><strong>HR:</strong> {latest.vitals.hr} bpm</span>
                                <span><strong>Temp:</strong> {latest.vitals.temp}°C</span>
                                <span><strong>SpO₂:</strong> {latest.vitals.spo2}%</span>
                                <span><strong>RR:</strong> {latest.vitals.rr}</span>
                                {latest.vitals.weight && <span><strong>Wt:</strong> {latest.vitals.weight} kg</span>}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══ Orders Tab ═══ */}
      {activeTab === 'orders' && (
        <div style={S.card}>
          <div style={S.toolbar}>
            <select style={S.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              {['Ordered', 'Specimen Collected', 'In Progress', 'Resulted', 'Reviewed', 'Cancelled'].map(st => <option key={st} value={st}>{st}</option>)}
            </select>
            <select style={S.filterSelect} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              {['Laboratory', 'Imaging', 'Cardio', 'Special'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {filteredOrders.length === 0 ? (
            <div style={S.empty}>No orders found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={S.th}>Order ID</th>
                    <th style={S.th}>Patient</th>
                    <th style={S.th}>Test</th>
                    <th style={S.th}>Type</th>
                    <th style={S.th}>Priority</th>
                    <th style={S.th}>Status</th>
                    <th style={S.th}>Ordered</th>
                    <th style={S.th}>Result</th>
                    <th style={{ ...S.th, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(o => {
                    const expanded = expandedId === o.id;
                    return (
                      <>
                        <tr
                          key={o.id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setExpandedId(expanded ? null : o.id)}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'color-mix(in srgb, var(--color-primary) 3%, var(--color-surface))'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                        >
                          <td style={S.td}>
                            <span style={{ fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                              {o.id}
                            </span>
                          </td>
                          <td style={S.td}>
                            <button
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', fontWeight: 600, fontSize: 13, padding: 0, textDecoration: 'underline', textDecorationColor: 'transparent', transition: 'all .15s' }}
                              onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.textDecorationColor = 'var(--color-primary)'; }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text)'; e.currentTarget.style.textDecorationColor = 'transparent'; }}
                              onClick={(e) => { e.stopPropagation(); handleDrillDown(o.patientId); setActiveTab('patients'); setSelectedPatientId(o.patientId); }}
                            >
                              {o.patientName}
                            </button>
                          </td>
                          <td style={S.td}>
                            <span style={{ fontWeight: 600 }}>{o.testName}</span>
                            {o.isCritical && <AlertTriangle size={11} style={{ color: 'var(--color-error)', marginLeft: 4, verticalAlign: 'middle' }} />}
                            {o.isAbnormal && <span style={{ fontSize: 9, fontWeight: 700, color: '#d97706', marginLeft: 4 }}>ABN</span>}
                          </td>
                          <td style={S.td}><span style={{ ...S.badge, background: 'var(--color-background)' }}>{o.testType}</span></td>
                          <td style={S.td}><PriorityBadge priority={o.priority} /></td>
                          <td style={S.td}><StatusBadge status={o.status} /></td>
                          <td style={S.td}><span style={{ fontSize: 12 }}>{o.orderedDate}</span></td>
                          <td style={S.td}>
                            {o.result ? <span style={{ fontSize: 12, fontWeight: 600, color: o.isCritical ? 'var(--color-error)' : o.isAbnormal ? '#d97706' : 'var(--color-text)' }}>{o.result}</span> : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                          </td>
                          <td style={{ ...S.td, textAlign: 'right' }}>
                            <button style={S.btnSm} onClick={(e) => { e.stopPropagation(); showToast(`Printing order ${o.id}`, 'info'); }}>
                              <Printer size={10} /> Print
                            </button>
                          </td>
                        </tr>
                        {expanded && (
                          <tr key={`${o.id}-detail`}>
                            <td colSpan={9} style={{ padding: 0 }}>
                              <div style={S.detail}>
                                <div style={S.detailGrid}>
                                  <div><div style={S.detailLabel}>Ordering Doctor</div><div style={S.detailValue}><Stethoscope size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />{o.doctorName}</div></div>
                                  <div><div style={S.detailLabel}>Ordered Date</div><div style={S.detailValue}>{o.orderedDate}</div></div>
                                  <div><div style={S.detailLabel}>Collected Date</div><div style={S.detailValue}>{o.collectedDate || '—'}</div></div>
                                  <div><div style={S.detailLabel}>Resulted Date</div><div style={S.detailValue}>{o.resultedDate || '—'}</div></div>
                                  <div><div style={S.detailLabel}>Reference Range</div><div style={S.detailValue}>{o.referenceRange || '—'}</div></div>
                                  {o.notes && <div><div style={S.detailLabel}>Notes</div><div style={S.detailValue}>{o.notes}</div></div>}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ marginTop: 14, fontSize: 12, color: 'var(--color-text-muted)' }}>
            Showing {filteredOrders.length} of {tOrders.length} orders
          </div>
        </div>
      )}

      {/* ═══ Clinical Notes Tab ═══ */}
      {activeTab === 'notes' && (
        <div style={S.card}>
          <div style={S.toolbar}>
            <select style={S.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              {['Draft', 'Signed', 'Amended'].map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>

          {filteredNotes.length === 0 ? (
            <div style={S.empty}>No clinical notes found</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredNotes.map(n => {
                const expanded = expandedId === n.id;
                return (
                  <div key={n.id} style={{ borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-surface)', overflow: 'hidden' }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', transition: 'background .15s' }}
                      onClick={() => setExpandedId(expanded ? null : n.id)}
                      onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in srgb, var(--color-primary) 3%, var(--color-surface))'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      {expanded ? <ChevronUp size={12} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} /> : <ChevronDown size={12} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text)' }}>{n.patientName}</span>
                          <StatusBadge status={n.status} />
                          {n.aiGenerated && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#ede9fe', color: '#8b5cf6' }}>AI-Assisted</span>}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                          {n.date} · ICD: {(n.icdCodes ?? []).join(', ') || '—'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button style={S.btnSm} onClick={(e) => { e.stopPropagation(); showToast(`Printing note for ${n.patientName}`, 'info'); }}>
                          <Printer size={10} />
                        </button>
                      </div>
                    </div>

                    {expanded && (
                      <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--color-border)', background: 'color-mix(in srgb, var(--color-primary) 2%, var(--color-surface))' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '14px 0' }}>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 4 }}>Subjective</div>
                            <div style={{ fontSize: 12, color: 'var(--color-text)', lineHeight: 1.5, padding: '8px 12px', borderRadius: 6, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>{n.subjective || '—'}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 4 }}>Objective</div>
                            <div style={{ fontSize: 12, color: 'var(--color-text)', lineHeight: 1.5, padding: '8px 12px', borderRadius: 6, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>{n.objective || '—'}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 4 }}>Assessment</div>
                            <div style={{ fontSize: 12, color: 'var(--color-text)', lineHeight: 1.5, padding: '8px 12px', borderRadius: 6, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>{n.assessment || '—'}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 4 }}>Plan</div>
                            <div style={{ fontSize: 12, color: 'var(--color-text)', lineHeight: 1.5, padding: '8px 12px', borderRadius: 6, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>{n.plan || '—'}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ marginTop: 14, fontSize: 12, color: 'var(--color-text-muted)' }}>
            Showing {filteredNotes.length} of {tNotes.length} clinical notes
          </div>
        </div>
      )}

      {/* ═══ Prescriptions Tab ═══ */}
      {activeTab === 'prescriptions' && (
        <div style={S.card}>
          <div style={S.toolbar}>
            <select style={S.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              {['Active', 'Completed', 'Cancelled', 'Pending Approval'].map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>

          {filteredRx.length === 0 ? (
            <div style={S.empty}>No prescriptions found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={S.th}>Rx ID</th>
                    <th style={S.th}>Patient</th>
                    <th style={S.th}>Medication</th>
                    <th style={S.th}>Dosage</th>
                    <th style={S.th}>Frequency</th>
                    <th style={S.th}>Duration</th>
                    <th style={S.th}>Refills</th>
                    <th style={S.th}>Status</th>
                    <th style={S.th}>Prescribed</th>
                    <th style={{ ...S.th, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRx.map(rx => (
                    <tr key={rx.id}>
                      <td style={S.td}><span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{rx.id}</span></td>
                      <td style={S.td}>
                        <button
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', fontWeight: 600, fontSize: 13, padding: 0, textDecoration: 'underline', textDecorationColor: 'transparent', transition: 'all .15s' }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.textDecorationColor = 'var(--color-primary)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text)'; e.currentTarget.style.textDecorationColor = 'transparent'; }}
                          onClick={() => { setSelectedPatientId(rx.patientId); setActiveTab('patients'); }}
                        >
                          {rx.patientName}
                        </button>
                      </td>
                      <td style={S.td}><span style={{ fontWeight: 600 }}>{rx.medication}</span></td>
                      <td style={S.td}>{rx.dosage}</td>
                      <td style={S.td}>{rx.frequency}</td>
                      <td style={S.td}>{rx.duration}</td>
                      <td style={S.td}>
                        <span style={{
                          fontWeight: 700,
                          color: rx.refillsRemaining === 0 ? 'var(--color-error)' : rx.refillsRemaining <= 1 ? '#d97706' : 'var(--color-text)',
                        }}>
                          {rx.refillsRemaining}
                        </span>
                      </td>
                      <td style={S.td}><StatusBadge status={rx.status} /></td>
                      <td style={S.td}><span style={{ fontSize: 12 }}>{rx.prescribedDate}</span></td>
                      <td style={{ ...S.td, textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button style={S.btnSm} onClick={() => showToast(`Printing Rx ${rx.id}`, 'info')}>
                            <Printer size={10} />
                          </button>
                          <button style={S.btnSm} onClick={() => showToast(`Viewing e-prescription for ${rx.medication}`, 'info')}>
                            <Eye size={10} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ marginTop: 14, fontSize: 12, color: 'var(--color-text-muted)' }}>
            Showing {filteredRx.length} of {tRx.length} prescriptions
          </div>
        </div>
      )}

      {/* ═══ Immunizations Tab ═══ */}
      {activeTab === 'immunizations' && (
        <div style={S.card}>
          {filteredImm.length === 0 ? (
            <div style={S.empty}>No immunization records found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={S.th}>Patient</th>
                    <th style={S.th}>Vaccine</th>
                    <th style={S.th}>Dose</th>
                    <th style={S.th}>Date Given</th>
                    <th style={S.th}>Batch No.</th>
                    <th style={S.th}>Site</th>
                    <th style={S.th}>Administered By</th>
                    <th style={S.th}>Next Due</th>
                    <th style={{ ...S.th, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredImm.map(imm => (
                    <tr key={imm.id}>
                      <td style={S.td}>
                        <button
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', fontWeight: 600, fontSize: 13, padding: 0, textDecoration: 'underline', textDecorationColor: 'transparent', transition: 'all .15s' }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.textDecorationColor = 'var(--color-primary)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text)'; e.currentTarget.style.textDecorationColor = 'transparent'; }}
                          onClick={() => { setSelectedPatientId(imm.patientId); setActiveTab('patients'); }}
                        >
                          {imm.patientName}
                        </button>
                      </td>
                      <td style={S.td}>
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Syringe size={12} style={{ color: 'var(--color-primary)' }} />
                          {imm.vaccine}
                        </span>
                      </td>
                      <td style={S.td}>{imm.doseNumber}</td>
                      <td style={S.td}>{imm.dateGiven}</td>
                      <td style={S.td}><span style={{ fontFamily: 'monospace', fontSize: 11 }}>{imm.batchNumber}</span></td>
                      <td style={S.td}>{imm.site}</td>
                      <td style={S.td}><span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><User size={10} />{imm.administeredBy}</span></td>
                      <td style={S.td}>
                        {imm.nextDueDate ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600, color: 'var(--color-primary)' }}>
                            <Calendar size={10} /> {imm.nextDueDate}
                          </span>
                        ) : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                      </td>
                      <td style={{ ...S.td, textAlign: 'right' }}>
                        <button style={S.btnSm} onClick={() => showToast(`Printing immunization record`, 'info')}>
                          <Printer size={10} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ marginTop: 14, fontSize: 12, color: 'var(--color-text-muted)' }}>
            Showing {filteredImm.length} of {tImm.length} immunization records
          </div>
        </div>
      )}
    </div>
  );
}
