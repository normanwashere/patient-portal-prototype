import { useState, useMemo } from 'react';
import {
  FlaskConical,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ChevronRight,
  Search,
  FileText,
  BarChart3,
  X,
  Beaker,
  Building2,
  ExternalLink,
  Upload,
  Wifi,
  WifiOff,
  Loader2,
  Link,
} from 'lucide-react';
import { useProvider } from '../context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge, TabBar, PageHeader } from '../../ui';
import type { BadgeVariant } from '../../ui';
import type { LabOrder } from '../types';

/* ───────── shared inline styles ───────── */
const S: Record<string, React.CSSProperties> = {
  page: { padding: 24, background: 'var(--color-background)', minHeight: '100%' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  titleWrap: { display: 'flex', flexDirection: 'column', gap: 4 },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--color-text)', margin: 0 },
  subtitle: { fontSize: 14, color: 'var(--color-text-muted)', margin: 0 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 },
  statCard: { background: 'var(--color-surface)', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.06)', border: '1px solid var(--color-border)' },
  statIcon: { width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 22, fontWeight: 700, color: 'var(--color-text)' },
  statLabel: { fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 },
  tabs: { display: 'flex', gap: 4, borderBottom: '1px solid var(--color-border)', marginBottom: 20, paddingBottom: 0 },
  tab: { padding: '12px 20px', fontSize: 14, fontWeight: 600, color: 'var(--color-text-muted)', background: 'transparent', borderWidth: 0, borderStyle: 'none' as const, borderBottomWidth: 2, borderBottomStyle: 'solid' as const, borderBottomColor: 'transparent', cursor: 'pointer', marginBottom: -1, borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', gap: 8 },
  tabActive: { color: 'var(--color-primary)', borderBottomColor: 'var(--color-primary)' },
  card: { background: 'var(--color-surface)', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.06)', border: '1px solid var(--color-border)', marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: 600, color: 'var(--color-text)', marginBottom: 16, margin: 0 },
  toolbar: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' },
  searchWrap: { position: 'relative' as const, flex: 1, minWidth: 200 },
  searchIcon: { position: 'absolute' as const, left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' },
  searchInput: { width: '100%', padding: '10px 14px 10px 38px', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 14, background: 'var(--color-surface)', color: 'var(--color-text)', boxSizing: 'border-box' as const },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: { padding: '12px 14px', textAlign: 'left' as const, fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', background: 'var(--color-background)', borderBottom: '1px solid var(--color-border)', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  td: { padding: '14px 14px', fontSize: 14, color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)' },
  btn: { padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 },
  btnPrimary: { background: 'var(--color-primary)', color: 'white' },
  btnSuccess: { background: 'var(--color-success)', color: 'white' },
  btnWarning: { background: 'var(--color-warning)', color: 'white' },
  btnOutline: { background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)' },
  btnDanger: { background: 'var(--color-error)', color: 'white' },
  badge: { display: 'inline-block', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 },
  formGroup: { marginBottom: 16 },
  formLabel: { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 },
  formInput: { width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 14, background: 'var(--color-surface)', color: 'var(--color-text)', boxSizing: 'border-box' as const },
  formSelect: { width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 14, background: 'var(--color-surface)', color: 'var(--color-text)', boxSizing: 'border-box' as const },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  overlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: 'var(--color-surface)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' as const, boxShadow: '0 20px 60px rgba(0,0,0,.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  groupHeader: { fontSize: 13, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, letterSpacing: 0.8, padding: '12px 0 8px', marginTop: 16 },
  pipeline: { display: 'flex', gap: 20, flexWrap: 'wrap' as const },
  pipelineCol: { flex: 1, minWidth: 200, background: 'var(--color-background)', borderRadius: 10, padding: 14 },
  pipelineTitle: { fontSize: 13, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 },
  pipelineCard: { background: 'var(--color-surface)', borderRadius: 8, padding: 14, border: '1px solid var(--color-border)', marginBottom: 10, boxShadow: '0 1px 3px rgba(0,0,0,.04)' },
  inlineForm: { background: 'var(--color-background)', borderRadius: 8, padding: 16, marginTop: 10, border: '1px solid var(--color-border)' },
  progressBar: { height: 8, borderRadius: 4, background: 'var(--color-border)', overflow: 'hidden' },
};

const STATUS_PIPELINE: LabOrder['status'][] = ['Ordered', 'Specimen Collected', 'In Progress', 'Resulted', 'Reviewed'];

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  Ordered: { bg: 'var(--color-info-light)', color: '#1d4ed8', label: 'Ordered' },
  'Specimen Collected': { bg: 'var(--color-warning-light)', color: '#92400e', label: 'Collected' },
  'In Progress': { bg: 'var(--color-indigo-light)', color: 'var(--color-indigo)', label: 'Processing' },
  Resulted: { bg: 'var(--color-success-light)', color: '#065f46', label: 'Resulted' },
  Reviewed: { bg: '#f0fdf4', color: '#166534', label: 'Reviewed' },
  Cancelled: { bg: 'var(--color-error-light)', color: '#991b1b', label: 'Cancelled' },
};

const LAB_STATUS_VARIANT: Record<string, BadgeVariant> = {
  Ordered: 'info',
  'Specimen Collected': 'warning',
  'In Progress': 'indigo',
  Resulted: 'success',
  Reviewed: 'success',
  Cancelled: 'error',
};

const PRIORITY_VARIANT: Record<string, BadgeVariant> = {
  Stat: 'error',
  Urgent: 'warning',
  Routine: 'info',
};

const NEXT_STATUS: Record<string, LabOrder['status']> = {
  Ordered: 'Specimen Collected',
  'Specimen Collected': 'In Progress',
  'In Progress': 'Resulted',
  Resulted: 'Reviewed',
};

const NEXT_ACTION_LABEL: Record<string, string> = {
  Ordered: 'Collect Specimen',
  'Specimen Collected': 'Start Processing',
  'In Progress': 'Enter Results',
  Resulted: 'Mark Reviewed',
};

const TAT_DATA = [
  { testType: 'CBC', avgTat: 45, targetTat: 60, samplesThisWeek: 42 },
  { testType: 'FBS', avgTat: 55, targetTat: 60, samplesThisWeek: 38 },
  { testType: 'HbA1c', avgTat: 90, targetTat: 75, samplesThisWeek: 15 },
  { testType: 'Urinalysis', avgTat: 35, targetTat: 45, samplesThisWeek: 28 },
  { testType: 'Lipid Panel', avgTat: 62, targetTat: 60, samplesThisWeek: 21 },
  { testType: 'X-Ray', avgTat: 25, targetTat: 30, samplesThisWeek: 55 },
  { testType: 'CT Scan', avgTat: 48, targetTat: 45, samplesThisWeek: 8 },
  { testType: 'Ultrasound', avgTat: 40, targetTat: 45, samplesThisWeek: 18 },
];

export function LabImaging() {
  const { tenant } = useTheme();
  const { showToast } = useToast();
  const { labOrders, updateLabOrderStatus, addLabOrder, currentStaff } = useProvider();

  const labEnabled = tenant.features.visits.clinicLabFulfillmentEnabled;

  const [activeTab, setActiveTab] = useState<'orders' | 'results' | 'turnaround'>('orders');
  const [search, setSearch] = useState('');
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [resultFormId, setResultFormId] = useState<string | null>(null);
  const [resultValue, setResultValue] = useState('');
  const [resultRange, setResultRange] = useState('');
  const [resultAbnormal, setResultAbnormal] = useState(false);

  // New order form state
  const [newPatientName, setNewPatientName] = useState('');
  const [newTestName, setNewTestName] = useState('');
  const [newTestType, setNewTestType] = useState<LabOrder['testType']>('Laboratory');
  const [newPriority, setNewPriority] = useState<LabOrder['priority']>('Routine');
  const [newNotes, setNewNotes] = useState('');

  // External filter
  const [showExternalOnly, setShowExternalOnly] = useState(false);

  // External order modal state
  const [showExtOrderModal, setShowExtOrderModal] = useState(false);
  const [extPatientName, setExtPatientName] = useState('');
  const [extTestName, setExtTestName] = useState('');
  const [extTestType, setExtTestType] = useState<LabOrder['testType']>('Laboratory');
  const [extFacility, setExtFacility] = useState('Hi-Precision Diagnostics');
  const [extPartnerFee, setExtPartnerFee] = useState('');
  const [extOrderRef, setExtOrderRef] = useState('');
  const [extStatus, setExtStatus] = useState<'Ordered' | 'In Progress' | 'Resulted'>('Ordered');

  // OCR upload state (inside external order modal)
  const [ocrFileName, setOcrFileName] = useState<string | null>(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrComplete, setOcrComplete] = useState(false);

  // Connect API modal state
  const [showConnectApiModal, setShowConnectApiModal] = useState(false);
  const [apiProvider, setApiProvider] = useState('hi-precision');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [autoSyncResults, setAutoSyncResults] = useState(false);
  const [syncInterval, setSyncInterval] = useState('realtime');
  const [connectionStatus, setConnectionStatus] = useState<'not_connected' | 'testing' | 'connected'>('not_connected');

  /* ───────── computed ───────── */
  const orderedCount = labOrders.filter(o => o.status === 'Ordered').length;
  const collectedCount = labOrders.filter(o => o.status === 'Specimen Collected').length;
  const processingCount = labOrders.filter(o => o.status === 'In Progress').length;
  const resultedCount = labOrders.filter(o => o.status === 'Resulted').length;
  const reviewedCount = labOrders.filter(o => o.status === 'Reviewed').length;
  const externalCount = labOrders.filter(o => o.isExternal).length;

  const filtered = useMemo(() => {
    let list = labOrders.filter(o => o.status !== 'Cancelled');
    if (showExternalOnly) list = list.filter(o => o.isExternal);
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(o =>
      o.patientName.toLowerCase().includes(q) ||
      o.testName.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      o.doctorName.toLowerCase().includes(q)
    );
  }, [labOrders, search, showExternalOnly]);

  const byStatus = useMemo(() => {
    const map: Record<string, LabOrder[]> = {};
    for (const s of STATUS_PIPELINE) map[s] = [];
    for (const o of filtered) {
      if (map[o.status]) map[o.status].push(o);
    }
    return map;
  }, [filtered]);

  const reviewedOrders = useMemo(() =>
    labOrders.filter(o => o.status === 'Reviewed'),
    [labOrders]
  );

  /* ───────── handlers ───────── */
  const advanceOrder = (order: LabOrder) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;

    if (order.status === 'In Progress') {
      // Open inline results form instead of immediately advancing
      setResultFormId(order.id);
      setResultValue('');
      setResultRange('');
      setResultAbnormal(false);
      return;
    }

    updateLabOrderStatus(order.id, next);
    showToast(`${order.testName} → ${next}`, 'success');
  };

  const submitResults = (orderId: string) => {
    updateLabOrderStatus(orderId, 'Resulted');
    showToast('Results entered successfully', 'success');
    setResultFormId(null);
  };

  const submitNewOrder = () => {
    if (!newPatientName.trim() || !newTestName.trim()) {
      showToast('Patient name and test name are required', 'error');
      return;
    }
    addLabOrder({
      patientId: `p-${Date.now()}`,
      patientName: newPatientName.trim(),
      doctorId: currentStaff.id,
      doctorName: currentStaff.name,
      testName: newTestName.trim(),
      testType: newTestType,
      priority: newPriority,
      status: 'Ordered',
      orderedDate: new Date().toISOString().slice(0, 10),
      notes: newNotes || undefined,
    });
    showToast(`Lab order created: ${newTestName}`, 'success');
    setShowNewOrder(false);
    setNewPatientName('');
    setNewTestName('');
    setNewTestType('Laboratory');
    setNewPriority('Routine');
    setNewNotes('');
  };

  const submitExtOrder = () => {
    if (!extPatientName.trim() || !extTestName.trim()) {
      showToast('Patient name and test name are required', 'error');
      return;
    }
    addLabOrder({
      patientId: `p-ext-${Date.now()}`,
      patientName: extPatientName.trim(),
      doctorId: currentStaff.id,
      doctorName: currentStaff.name,
      testName: extTestName.trim(),
      testType: extTestType,
      priority: 'Routine',
      status: extStatus,
      orderedDate: new Date().toISOString().slice(0, 10),
      isExternal: true,
      externalFacility: extFacility,
      externalPartnerFee: extPartnerFee ? parseFloat(extPartnerFee) : undefined,
      externalOrderRef: extOrderRef || undefined,
    });
    showToast(`External order recorded: ${extTestName}`, 'success');
    setShowExtOrderModal(false);
    setExtPatientName('');
    setExtTestName('');
    setExtTestType('Laboratory');
    setExtFacility('Hi-Precision Diagnostics');
    setExtPartnerFee('');
    setExtOrderRef('');
    setExtStatus('Ordered');
  };

  /* ───────── gate on feature flag ───────── */
  if (!labEnabled) {
    return (
      <div style={S.page}>
        <div style={{ ...S.card, textAlign: 'center', padding: 60 }}>
          <FlaskConical size={48} style={{ color: 'var(--color-text-muted)', marginBottom: 16 }} />
          <h2 style={{ color: 'var(--color-text)', marginBottom: 8 }}>Lab & Imaging Not Enabled</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            This facility does not have clinic lab fulfillment enabled. Contact admin to activate.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      {/* ── Header ── */}
      <PageHeader
        title="Lab & Imaging"
        subtitle="Order management, result entry, and turnaround analytics"
        actions={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button style={{ ...S.btn, ...S.btnOutline, borderColor: '#6366f1', color: '#6366f1' }} onClick={() => setShowConnectApiModal(true)}>
              <Link size={16} /> Connect External API
            </button>
            <button style={{ ...S.btn, background: '#6366f1', color: 'white' }} onClick={() => setShowExtOrderModal(true)}>
              <Building2 size={16} /> Record External Order
            </button>
            <button style={{ ...S.btn, ...S.btnPrimary }} onClick={() => setShowNewOrder(true)}>
              <Plus size={16} /> New Order
            </button>
          </div>
        }
      />

      {/* ── Stats Row ── */}
      <div style={S.statsRow}>
        {[
          { label: 'Ordered', value: orderedCount, bg: 'var(--color-info-light)', color: 'var(--color-info-dark)', icon: <FlaskConical size={20} /> },
          { label: 'Collected', value: collectedCount, bg: 'var(--color-warning-light)', color: 'var(--color-warning-dark)', icon: <Beaker size={20} /> },
          { label: 'Processing', value: processingCount, bg: 'var(--color-indigo-light)', color: 'var(--color-indigo)', icon: <Activity size={20} /> },
          { label: 'Resulted', value: resultedCount, bg: 'var(--color-success-light)', color: 'var(--color-success-dark)', icon: <Clock size={20} /> },
          { label: 'Reviewed', value: reviewedCount, bg: '#f0fdf4', color: '#166534', icon: <CheckCircle2 size={20} /> },
        ].map(s => (
          <div key={s.label} style={S.statCard}>
            <div style={{ ...S.statIcon, background: s.bg }}>
              <span style={{ color: s.color }}>{s.icon}</span>
            </div>
            <div style={S.statValue}>{s.value}</div>
            <div style={S.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <TabBar
        tabs={[
          { key: 'orders' as const, label: 'Orders', icon: <FlaskConical size={16} /> },
          { key: 'results' as const, label: 'Results', icon: <FileText size={16} /> },
          { key: 'turnaround' as const, label: 'Turnaround', icon: <BarChart3 size={16} /> },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {/* ═══════════ ORDERS TAB ═══════════ */}
      {activeTab === 'orders' && (
        <>
          <div style={S.toolbar}>
            <div style={S.searchWrap}>
              <Search size={16} style={S.searchIcon} />
              <input
                style={S.searchInput}
                placeholder="Search by patient, test, order ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button
              style={{
                ...S.btn,
                ...(showExternalOnly
                  ? { background: '#6366f1', color: 'white' }
                  : { ...S.btnOutline }),
              }}
              onClick={() => setShowExternalOnly(v => !v)}
            >
              <ExternalLink size={14} /> External ({externalCount})
            </button>
          </div>

          <div style={S.pipeline}>
            {STATUS_PIPELINE.map(status => {
              const orders = byStatus[status] || [];
              const sc = STATUS_CONFIG[status];
              return (
                <div key={status} style={S.pipelineCol}>
                  <div style={S.pipelineTitle}>
                    <StatusBadge variant={LAB_STATUS_VARIANT[status] ?? 'muted'} size="sm">{orders.length}</StatusBadge>
                    {sc.label}
                  </div>
                  {orders.length === 0 && (
                    <div style={{ fontSize: 13, color: 'var(--color-text-muted)', padding: 10 }}>No orders</div>
                  )}
                  {orders.map(o => (
                    <div
                      key={o.id}
                      style={{
                        ...S.pipelineCard,
                        ...(o.isCritical ? { borderLeft: '3px solid #ef4444' } : {}),
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>{o.patientName}</div>
                        <StatusBadge variant={PRIORITY_VARIANT[o.priority] ?? 'muted'} size="sm">{o.priority}</StatusBadge>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 4 }}>{o.testName} ({o.testType})</div>
                      {o.isExternal && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe' }}>
                            <Building2 size={11} /> External – {o.externalFacility}
                          </span>
                          {o.externalPartnerFee != null && (
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#6366f1' }}>₱{o.externalPartnerFee.toLocaleString()}</span>
                          )}
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                        {o.id} &middot; Dr. {o.doctorName.replace('Dr. ', '')}
                        {o.isExternal && o.externalOrderRef && (
                          <span> &middot; Ref: {o.externalOrderRef}</span>
                        )}
                      </div>
                      {o.isCritical && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-error)', fontWeight: 600, marginTop: 6 }}>
                          <AlertTriangle size={14} /> Critical
                        </div>
                      )}

                      {/* Action button */}
                      {NEXT_ACTION_LABEL[o.status] && (
                        <button
                          style={{ ...S.btn, ...S.btnPrimary, marginTop: 10, width: '100%', justifyContent: 'center', fontSize: 12, padding: '6px 12px' }}
                          onClick={() => advanceOrder(o)}
                        >
                          {NEXT_ACTION_LABEL[o.status]} <ChevronRight size={14} />
                        </button>
                      )}

                      {/* Inline result entry form */}
                      {resultFormId === o.id && (
                        <div style={S.inlineForm}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text)', marginBottom: 10 }}>Enter Results</div>
                          <div style={S.formGroup}>
                            <label style={S.formLabel}>Result Value</label>
                            <input style={S.formInput} placeholder="e.g. Hgb 14.2, Hct 42%..." value={resultValue} onChange={e => setResultValue(e.target.value)} />
                          </div>
                          <div style={S.formGroup}>
                            <label style={S.formLabel}>Reference Range</label>
                            <input style={S.formInput} placeholder="e.g. 13-17 g/dL" value={resultRange} onChange={e => setResultRange(e.target.value)} />
                          </div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text)', marginBottom: 12, cursor: 'pointer' }}>
                            <input type="checkbox" checked={resultAbnormal} onChange={e => setResultAbnormal(e.target.checked)} />
                            Flag as abnormal
                          </label>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button style={{ ...S.btn, ...S.btnSuccess, flex: 1, justifyContent: 'center' }} onClick={() => submitResults(o.id)}>
                              <CheckCircle2 size={14} /> Submit
                            </button>
                            <button style={{ ...S.btn, ...S.btnOutline }} onClick={() => setResultFormId(null)}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ═══════════ RESULTS TAB ═══════════ */}
      {activeTab === 'results' && (
        <div style={S.card}>
          <h2 style={S.cardTitle}>Reviewed Results</h2>
          {reviewedOrders.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', padding: 16 }}>No reviewed results yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>Order ID</th>
                    <th style={S.th}>Patient</th>
                    <th style={S.th}>Test</th>
                    <th style={S.th}>Type</th>
                    <th style={S.th}>Result</th>
                    <th style={S.th}>Ref. Range</th>
                    <th style={S.th}>Flag</th>
                    <th style={S.th}>Resulted</th>
                    <th style={S.th}>Doctor</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewedOrders.map(o => {
                    const isAbn = o.isAbnormal;
                    const isCrit = o.isCritical;
                    return (
                      <tr key={o.id} style={isCrit ? { background: '#fef2f2' } : isAbn ? { background: '#fffbeb' } : undefined}>
                        <td style={S.td}><span style={{ fontWeight: 600 }}>{o.id}</span></td>
                        <td style={S.td}>{o.patientName}</td>
                        <td style={S.td}>{o.testName}</td>
                        <td style={S.td}>{o.testType}</td>
                        <td style={{ ...S.td, ...(isAbn ? { color: 'var(--color-error)', fontWeight: 600 } : {}) }}>
                          {o.result || '—'}
                        </td>
                        <td style={S.td}>{o.referenceRange || '—'}</td>
                        <td style={S.td}>
                          {isCrit ? (
                            <StatusBadge variant="error" icon={<AlertTriangle size={12} />}>Critical</StatusBadge>
                          ) : isAbn ? (
                            <StatusBadge variant="warning">Abnormal</StatusBadge>
                          ) : (
                            <StatusBadge variant="success">Normal</StatusBadge>
                          )}
                        </td>
                        <td style={S.td}>{o.resultedDate || '—'}</td>
                        <td style={S.td}>{o.doctorName}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Also show resulted but not yet reviewed */}
          {(() => {
            const resultedNotReviewed = labOrders.filter(o => o.status === 'Resulted');
            if (resultedNotReviewed.length === 0) return null;
            return (
              <>
                <div style={S.groupHeader}>Awaiting Review ({resultedNotReviewed.length})</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        <th style={S.th}>Order ID</th>
                        <th style={S.th}>Patient</th>
                        <th style={S.th}>Test</th>
                        <th style={S.th}>Result</th>
                        <th style={S.th}>Flag</th>
                        <th style={S.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultedNotReviewed.map(o => (
                        <tr key={o.id} style={o.isCritical ? { background: '#fef2f2' } : o.isAbnormal ? { background: '#fffbeb' } : undefined}>
                          <td style={S.td}><span style={{ fontWeight: 600 }}>{o.id}</span></td>
                          <td style={S.td}>{o.patientName}</td>
                          <td style={S.td}>{o.testName}</td>
                          <td style={{ ...S.td, ...(o.isAbnormal ? { color: 'var(--color-error)', fontWeight: 600 } : {}) }}>{o.result || '—'}</td>
                          <td style={S.td}>
                            {o.isCritical ? (
                              <StatusBadge variant="error">Critical</StatusBadge>
                            ) : o.isAbnormal ? (
                              <StatusBadge variant="warning">Abnormal</StatusBadge>
                            ) : (
                              <StatusBadge variant="success">Normal</StatusBadge>
                            )}
                          </td>
                          <td style={S.td}>
                            <button
                              style={{ ...S.btn, ...S.btnSuccess, fontSize: 12, padding: '6px 12px' }}
                              onClick={() => {
                                updateLabOrderStatus(o.id, 'Reviewed');
                                showToast(`${o.testName} marked as reviewed`, 'success');
                              }}
                            >
                              <CheckCircle2 size={14} /> Mark Reviewed
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ═══════════ TURNAROUND TAB ═══════════ */}
      {activeTab === 'turnaround' && (
        <div style={S.card}>
          <h2 style={S.cardTitle}>Turnaround Time Analytics</h2>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Avg TAT (All)', value: `${Math.round(TAT_DATA.reduce((a, t) => a + t.avgTat, 0) / TAT_DATA.length)} min`, color: 'var(--color-primary)' },
              { label: 'On Target', value: `${TAT_DATA.filter(t => t.avgTat <= t.targetTat).length}/${TAT_DATA.length}`, color: 'var(--color-success)' },
              { label: 'Delayed', value: `${TAT_DATA.filter(t => t.avgTat > t.targetTat).length}`, color: 'var(--color-error)' },
              { label: 'Samples This Week', value: TAT_DATA.reduce((a, t) => a + t.samplesThisWeek, 0).toString(), color: 'var(--color-indigo)' },
            ].map(c => (
              <div key={c.label} style={{ background: 'var(--color-background)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: c.color }}>{c.value}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>{c.label}</div>
              </div>
            ))}
          </div>

          {/* Bar visualization */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
            {TAT_DATA.map(t => {
              const ratio = t.avgTat / t.targetTat;
              const isDelayed = ratio > 1;
              return (
                <div key={t.testType}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{t.testType}</span>
                    <span style={{ fontSize: 13, color: isDelayed ? 'var(--color-error)' : 'var(--color-success)', fontWeight: 600 }}>
                      {t.avgTat} min / target {t.targetTat} min
                    </span>
                  </div>
                  <div style={S.progressBar}>
                    <div style={{
                      width: `${Math.min(100, ratio * 100)}%`,
                      height: '100%',
                      background: isDelayed ? 'var(--color-error)' : 'var(--color-success)',
                      borderRadius: 4,
                      transition: 'width .3s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Test Type</th>
                  <th style={S.th}>Avg TAT (min)</th>
                  <th style={S.th}>Target (min)</th>
                  <th style={S.th}>Samples / Week</th>
                  <th style={S.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {TAT_DATA.map(t => {
                  const isDelayed = t.avgTat > t.targetTat;
                  return (
                    <tr key={t.testType}>
                      <td style={S.td}><span style={{ fontWeight: 600 }}>{t.testType}</span></td>
                      <td style={S.td}>{t.avgTat}</td>
                      <td style={S.td}>{t.targetTat}</td>
                      <td style={S.td}>{t.samplesThisWeek}</td>
                      <td style={S.td}>
                        <StatusBadge variant={isDelayed ? 'error' : 'success'}>
                          {isDelayed ? 'Delayed' : 'On Target'}
                        </StatusBadge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════ NEW ORDER MODAL ═══════════ */}
      {showNewOrder && (
        <div style={S.overlay} onClick={() => setShowNewOrder(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>New Lab / Imaging Order</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }} onClick={() => setShowNewOrder(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={S.formGroup}>
              <label style={S.formLabel}>Patient Name *</label>
              <input style={S.formInput} placeholder="Enter patient name" value={newPatientName} onChange={e => setNewPatientName(e.target.value)} />
            </div>
            <div style={S.formGroup}>
              <label style={S.formLabel}>Test Name *</label>
              <input style={S.formInput} placeholder="e.g. CBC, Chest X-Ray, HbA1c..." value={newTestName} onChange={e => setNewTestName(e.target.value)} />
            </div>
            <div style={S.formRow}>
              <div style={S.formGroup}>
                <label style={S.formLabel}>Test Type</label>
                <select style={S.formSelect} value={newTestType} onChange={e => setNewTestType(e.target.value as LabOrder['testType'])}>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Imaging">Imaging</option>
                  <option value="Cardio">Cardio</option>
                  <option value="Special">Special</option>
                </select>
              </div>
              <div style={S.formGroup}>
                <label style={S.formLabel}>Priority</label>
                <select style={S.formSelect} value={newPriority} onChange={e => setNewPriority(e.target.value as LabOrder['priority'])}>
                  <option value="Routine">Routine</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Stat">Stat</option>
                </select>
              </div>
            </div>
            <div style={S.formGroup}>
              <label style={S.formLabel}>Notes</label>
              <textarea
                style={{ ...S.formInput, minHeight: 80, resize: 'vertical' as const }}
                placeholder="Optional notes or instructions"
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <button style={{ ...S.btn, ...S.btnOutline }} onClick={() => setShowNewOrder(false)}>Cancel</button>
              <button style={{ ...S.btn, ...S.btnPrimary }} onClick={submitNewOrder}>
                <Plus size={16} /> Create Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ EXTERNAL ORDER MODAL ═══════════ */}
      {showExtOrderModal && (
        <div style={S.overlay} onClick={() => setShowExtOrderModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={20} style={{ color: '#6366f1' }} /> Record External Order
              </h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }} onClick={() => setShowExtOrderModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={S.formGroup}>
              <label style={S.formLabel}>Patient Name *</label>
              <input style={S.formInput} placeholder="Enter patient name" value={extPatientName} onChange={e => setExtPatientName(e.target.value)} />
            </div>
            <div style={S.formGroup}>
              <label style={S.formLabel}>Test Name *</label>
              <input style={S.formInput} placeholder="e.g. MRI - Brain, Holter Monitor..." value={extTestName} onChange={e => setExtTestName(e.target.value)} />
            </div>
            <div style={S.formRow}>
              <div style={S.formGroup}>
                <label style={S.formLabel}>Test Type</label>
                <select style={S.formSelect} value={extTestType} onChange={e => setExtTestType(e.target.value as LabOrder['testType'])}>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Imaging">Imaging</option>
                  <option value="Cardio">Cardio</option>
                  <option value="Special">Special</option>
                </select>
              </div>
              <div style={S.formGroup}>
                <label style={S.formLabel}>Status</label>
                <select style={S.formSelect} value={extStatus} onChange={e => setExtStatus(e.target.value as 'Ordered' | 'In Progress' | 'Resulted')}>
                  <option value="Ordered">Ordered</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resulted">Resulted</option>
                </select>
              </div>
            </div>
            <div style={S.formGroup}>
              <label style={S.formLabel}>External Facility</label>
              <select style={S.formSelect} value={extFacility} onChange={e => setExtFacility(e.target.value)}>
                <option value="Hi-Precision Diagnostics">Hi-Precision Diagnostics</option>
                <option value="Philippine Heart Center">Philippine Heart Center</option>
                <option value="St. Lukes Medical Center">St. Lukes Medical Center</option>
                <option value="Quest Diagnostics Philippines">Quest Diagnostics Philippines</option>
              </select>
            </div>
            <div style={S.formRow}>
              <div style={S.formGroup}>
                <label style={S.formLabel}>Partner Fee (₱)</label>
                <input style={S.formInput} type="number" placeholder="e.g. 8500" value={extPartnerFee} onChange={e => setExtPartnerFee(e.target.value)} />
              </div>
              <div style={S.formGroup}>
                <label style={S.formLabel}>External Reference</label>
                <input style={S.formInput} placeholder="e.g. HP-2026-08841" value={extOrderRef} onChange={e => setExtOrderRef(e.target.value)} />
              </div>
            </div>
            {/* ── OCR Upload Section ── */}
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--color-border)' }}>
              <label style={{ ...S.formLabel, fontSize: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Upload size={16} style={{ color: '#6366f1' }} /> Upload Result (OCR)
              </label>
              <div
                style={{
                  border: '2px dashed var(--color-border)',
                  borderRadius: 10,
                  padding: 24,
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'var(--color-background)',
                  transition: 'border-color .2s',
                }}
                onClick={() => document.getElementById('ocr-file-input')?.click()}
              >
                <Upload size={28} style={{ color: 'var(--color-text-muted)', marginBottom: 8 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>
                  Upload external lab result (PDF or image)
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  OCR will automatically extract values from the uploaded document
                </div>
                <input
                  id="ocr-file-input"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setOcrFileName(file.name);
                    setOcrProcessing(true);
                    setOcrComplete(false);
                    setTimeout(() => {
                      setOcrProcessing(false);
                      setOcrComplete(true);
                    }, 2000);
                  }}
                />
              </div>

              {/* OCR Processing State */}
              {ocrProcessing && (
                <div style={{
                  marginTop: 12,
                  padding: 14,
                  background: 'var(--color-background)',
                  borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <Loader2 size={18} style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: 13, color: 'var(--color-text)' }}>Analyzing document with OCR...</span>
                  <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {/* OCR Complete State */}
              {ocrComplete && !ocrProcessing && (
                <div style={{
                  marginTop: 12,
                  padding: 16,
                  background: 'var(--color-background)',
                  borderRadius: 8,
                  border: '1px solid var(--color-border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
                      Extracted Data — {ocrFileName}
                    </span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: 'var(--color-success-light)',
                      color: '#065f46',
                    }}>
                      OCR extraction complete ✓
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { label: 'Document Type', value: 'Laboratory Result Report' },
                      { label: 'Facility', value: extFacility },
                      { label: 'Date', value: 'Feb 10, 2026' },
                      { label: 'Tests Found', value: 'CBC, Lipid Panel, FBS' },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', fontSize: 13 }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-muted)', minWidth: 120 }}>{item.label}:</span>
                        <span style={{ color: 'var(--color-text)' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
              <button style={{ ...S.btn, ...S.btnOutline }} onClick={() => { setShowExtOrderModal(false); setOcrFileName(null); setOcrProcessing(false); setOcrComplete(false); }}>Cancel</button>
              <button style={{ ...S.btn, background: '#6366f1', color: 'white' }} onClick={submitExtOrder}>
                <Building2 size={16} /> Record Order
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ═══════════ CONNECT API MODAL ═══════════ */}
      {showConnectApiModal && (
        <div style={S.overlay} onClick={() => setShowConnectApiModal(false)}>
          <div style={{ ...S.modal, maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link size={20} style={{ color: '#6366f1' }} /> Connect External Lab Partner API
              </h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }} onClick={() => setShowConnectApiModal(false)}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 20px', lineHeight: 1.5 }}>
              Integrate with external laboratory partners to automatically sync orders, results, and billing data.
            </p>

            {/* Provider Selection */}
            <div style={S.formGroup}>
              <label style={S.formLabel}>Select Provider</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { id: 'hi-precision', name: 'Hi-Precision Diagnostics', desc: 'National reference laboratory network' },
                  { id: 'phc', name: 'Philippine Heart Center', desc: 'Specialized cardiac diagnostics' },
                  { id: 'st-lukes', name: 'St. Lukes Medical Center', desc: 'Multi-specialty hospital network' },
                  { id: 'quest', name: 'Quest Diagnostics Philippines', desc: 'International diagnostics provider' },
                ].map(p => (
                  <label
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 8,
                      border: apiProvider === p.id ? '2px solid #6366f1' : '1px solid var(--color-border)',
                      background: apiProvider === p.id ? '#eef2ff' : 'var(--color-surface)',
                      cursor: 'pointer',
                      transition: 'all .15s',
                    }}
                  >
                    <input
                      type="radio"
                      name="api-provider"
                      value={p.id}
                      checked={apiProvider === p.id}
                      onChange={() => setApiProvider(p.id)}
                      style={{ accentColor: '#6366f1' }}
                    />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{p.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Connection Settings */}
            <div style={{ ...S.groupHeader, marginTop: 20 }}>Connection Settings</div>

            <div style={S.formGroup}>
              <label style={S.formLabel}>API Endpoint URL</label>
              <input
                style={S.formInput}
                placeholder="https://api.partner.com/v1/lab"
                value={apiEndpoint}
                onChange={e => setApiEndpoint(e.target.value)}
              />
            </div>

            <div style={S.formGroup}>
              <label style={S.formLabel}>API Key</label>
              <input
                style={S.formInput}
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--color-text)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={autoSyncResults}
                  onChange={e => setAutoSyncResults(e.target.checked)}
                  style={{ accentColor: '#6366f1' }}
                />
                Auto-sync results
              </label>
            </div>

            <div style={S.formGroup}>
              <label style={S.formLabel}>Sync Interval</label>
              <select
                style={S.formSelect}
                value={syncInterval}
                onChange={e => setSyncInterval(e.target.value)}
              >
                <option value="realtime">Real-time</option>
                <option value="hourly">Every hour</option>
                <option value="6hours">Every 6 hours</option>
                <option value="daily">Daily</option>
              </select>
            </div>

            {/* Connection Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 8,
              background: connectionStatus === 'connected' ? 'var(--color-success-light)' : 'var(--color-background)',
              border: '1px solid var(--color-border)',
              marginBottom: 20,
            }}>
              {connectionStatus === 'connected' ? (
                <Wifi size={16} style={{ color: '#065f46' }} />
              ) : connectionStatus === 'testing' ? (
                <Loader2 size={16} style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
              ) : (
                <WifiOff size={16} style={{ color: 'var(--color-text-muted)' }} />
              )}
              <span style={{
                fontSize: 13,
                fontWeight: 600,
                color: connectionStatus === 'connected' ? '#065f46' : connectionStatus === 'testing' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              }}>
                {connectionStatus === 'connected' ? 'Connected ✓' : connectionStatus === 'testing' ? 'Testing connection...' : 'Not Connected'}
              </span>
              {connectionStatus === 'testing' && (
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                style={{ ...S.btn, ...S.btnOutline }}
                onClick={() => {
                  setConnectionStatus('testing');
                  setTimeout(() => {
                    setConnectionStatus('connected');
                    showToast('Connection successful ✓', 'success');
                    setTimeout(() => {
                      // keep connected state visible
                    }, 3000);
                  }, 1500);
                }}
              >
                <Wifi size={14} /> Test Connection
              </button>
              <button
                style={{ ...S.btn, background: '#6366f1', color: 'white' }}
                onClick={() => {
                  showToast('API configuration saved', 'success');
                  setShowConnectApiModal(false);
                }}
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
