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
} from 'lucide-react';
import { useProvider } from '../context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';
import { useToast } from '../../context/ToastContext';
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
  tab: { padding: '12px 20px', fontSize: 14, fontWeight: 600, color: 'var(--color-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -1, borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', gap: 8 },
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
  btnSuccess: { background: '#10b981', color: 'white' },
  btnWarning: { background: '#f59e0b', color: 'white' },
  btnOutline: { background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)' },
  btnDanger: { background: '#ef4444', color: 'white' },
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
  Ordered: { bg: '#dbeafe', color: '#1d4ed8', label: 'Ordered' },
  'Specimen Collected': { bg: '#fef3c7', color: '#92400e', label: 'Collected' },
  'In Progress': { bg: '#e0e7ff', color: '#4338ca', label: 'Processing' },
  Resulted: { bg: '#d1fae5', color: '#065f46', label: 'Resulted' },
  Reviewed: { bg: '#f0fdf4', color: '#166534', label: 'Reviewed' },
  Cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
};

const PRIORITY_CONFIG: Record<string, { bg: string; color: string }> = {
  Stat: { bg: '#fee2e2', color: '#dc2626' },
  Urgent: { bg: '#fef3c7', color: '#d97706' },
  Routine: { bg: '#dbeafe', color: '#2563eb' },
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

  /* ───────── computed ───────── */
  const orderedCount = labOrders.filter(o => o.status === 'Ordered').length;
  const collectedCount = labOrders.filter(o => o.status === 'Specimen Collected').length;
  const processingCount = labOrders.filter(o => o.status === 'In Progress').length;
  const resultedCount = labOrders.filter(o => o.status === 'Resulted').length;
  const reviewedCount = labOrders.filter(o => o.status === 'Reviewed').length;

  const filtered = useMemo(() => {
    if (!search) return labOrders.filter(o => o.status !== 'Cancelled');
    const q = search.toLowerCase();
    return labOrders.filter(o =>
      o.status !== 'Cancelled' &&
      (o.patientName.toLowerCase().includes(q) ||
        o.testName.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.doctorName.toLowerCase().includes(q))
    );
  }, [labOrders, search]);

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
      <div style={S.header}>
        <div style={S.titleWrap}>
          <h1 style={S.title}>Lab & Imaging</h1>
          <p style={S.subtitle}>Order management, result entry, and turnaround analytics</p>
        </div>
        <button style={{ ...S.btn, ...S.btnPrimary }} onClick={() => setShowNewOrder(true)}>
          <Plus size={16} /> New Order
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div style={S.statsRow}>
        {[
          { label: 'Ordered', value: orderedCount, bg: '#dbeafe', color: '#2563eb', icon: <FlaskConical size={20} /> },
          { label: 'Collected', value: collectedCount, bg: '#fef3c7', color: '#d97706', icon: <Beaker size={20} /> },
          { label: 'Processing', value: processingCount, bg: '#e0e7ff', color: '#4338ca', icon: <Activity size={20} /> },
          { label: 'Resulted', value: resultedCount, bg: '#d1fae5', color: '#059669', icon: <Clock size={20} /> },
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
      <div style={S.tabs}>
        {([
          { id: 'orders' as const, label: 'Orders', icon: <FlaskConical size={16} /> },
          { id: 'results' as const, label: 'Results', icon: <FileText size={16} /> },
          { id: 'turnaround' as const, label: 'Turnaround', icon: <BarChart3 size={16} /> },
        ]).map(t => (
          <button key={t.id} style={{ ...S.tab, ...(activeTab === t.id ? S.tabActive : {}) }} onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

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
          </div>

          <div style={S.pipeline}>
            {STATUS_PIPELINE.map(status => {
              const orders = byStatus[status] || [];
              const sc = STATUS_CONFIG[status];
              return (
                <div key={status} style={S.pipelineCol}>
                  <div style={S.pipelineTitle}>
                    <span style={{ ...S.badge, background: sc.bg, color: sc.color }}>{orders.length}</span>
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
                        <span style={{ ...S.badge, background: PRIORITY_CONFIG[o.priority]?.bg, color: PRIORITY_CONFIG[o.priority]?.color, fontSize: 11 }}>
                          {o.priority}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 4 }}>{o.testName} ({o.testType})</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                        {o.id} &middot; Dr. {o.doctorName.replace('Dr. ', '')}
                      </div>
                      {o.isCritical && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#ef4444', fontWeight: 600, marginTop: 6 }}>
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
                        <td style={{ ...S.td, ...(isAbn ? { color: '#ef4444', fontWeight: 600 } : {}) }}>
                          {o.result || '—'}
                        </td>
                        <td style={S.td}>{o.referenceRange || '—'}</td>
                        <td style={S.td}>
                          {isCrit ? (
                            <span style={{ ...S.badge, background: '#fee2e2', color: '#dc2626' }}>
                              <AlertTriangle size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />Critical
                            </span>
                          ) : isAbn ? (
                            <span style={{ ...S.badge, background: '#fef3c7', color: '#d97706' }}>Abnormal</span>
                          ) : (
                            <span style={{ ...S.badge, background: '#d1fae5', color: '#065f46' }}>Normal</span>
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
                          <td style={{ ...S.td, ...(o.isAbnormal ? { color: '#ef4444', fontWeight: 600 } : {}) }}>{o.result || '—'}</td>
                          <td style={S.td}>
                            {o.isCritical ? (
                              <span style={{ ...S.badge, background: '#fee2e2', color: '#dc2626' }}>Critical</span>
                            ) : o.isAbnormal ? (
                              <span style={{ ...S.badge, background: '#fef3c7', color: '#d97706' }}>Abnormal</span>
                            ) : (
                              <span style={{ ...S.badge, background: '#d1fae5', color: '#065f46' }}>Normal</span>
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
              { label: 'On Target', value: `${TAT_DATA.filter(t => t.avgTat <= t.targetTat).length}/${TAT_DATA.length}`, color: '#10b981' },
              { label: 'Delayed', value: `${TAT_DATA.filter(t => t.avgTat > t.targetTat).length}`, color: '#ef4444' },
              { label: 'Samples This Week', value: TAT_DATA.reduce((a, t) => a + t.samplesThisWeek, 0).toString(), color: '#6366f1' },
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
                    <span style={{ fontSize: 13, color: isDelayed ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                      {t.avgTat} min / target {t.targetTat} min
                    </span>
                  </div>
                  <div style={S.progressBar}>
                    <div style={{
                      width: `${Math.min(100, ratio * 100)}%`,
                      height: '100%',
                      background: isDelayed ? '#ef4444' : '#10b981',
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
                        <span style={{
                          ...S.badge,
                          background: isDelayed ? '#fee2e2' : '#d1fae5',
                          color: isDelayed ? '#dc2626' : '#065f46',
                        }}>
                          {isDelayed ? 'Delayed' : 'On Target'}
                        </span>
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
    </div>
  );
}
