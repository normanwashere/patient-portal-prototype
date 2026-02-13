import { useState, useMemo, useCallback, type CSSProperties } from 'react';
import {
  LayoutList,
  GitBranch,
  Search,
  UserPlus,
  PhoneCall,
  Play,
  CheckCircle,
  Clock,
  Users,
  ArrowRight,
  ChevronRight,
  XCircle,
  SkipForward,
  Plus,
  X,
  Check,
  Circle,
  ArrowDown,
  Layers,
  Stethoscope,
  FlaskConical,
  Pill,
  CreditCard,
} from 'lucide-react';
import { useProvider } from '../context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';
import { useToast } from '../../context/ToastContext';
import type { QueuePatient, StationType, DoctorOrderType } from '../types';
import { LINEAR_STATION_ORDER } from '../types';

/* ═══════════════════════════════════════════════════
   CONSTANTS & TYPES
   ═══════════════════════════════════════════════════ */

// Stations that are hidden when lab fulfillment is disabled
const LAB_STATIONS: StationType[] = ['Lab', 'Imaging'];
const PRE_CONSULT_STATIONS: StationType[] = ['Check-In', 'Triage', 'Consult'];
const POST_ORDER_STATIONS: StationType[] = ['Return-Consult', 'Pharmacy', 'Billing'];

// Section 2 order types — Pharmacy is NOT here (it belongs in Section 3)
const ALL_ORDER_TYPES: { type: DoctorOrderType; label: string; station: StationType }[] = [
  { type: 'Lab-CBC', label: 'Lab CBC', station: 'Lab' },
  { type: 'Lab-Chemistry', label: 'Lab Chemistry', station: 'Lab' },
  { type: 'Lab-Urinalysis', label: 'Lab Urinalysis', station: 'Lab' },
  { type: 'X-Ray', label: 'X-Ray', station: 'Imaging' },
  { type: 'CT-Scan', label: 'CT Scan', station: 'Imaging' },
  { type: 'Ultrasound', label: 'Ultrasound', station: 'Imaging' },
  { type: 'ECG', label: 'ECG', station: 'Imaging' },
];

const PRIORITY_OPTIONS: QueuePatient['priority'][] = ['Normal', 'Senior', 'PWD', 'Emergency'];

// For multi-stream, classify patients into one of 3 sections
type MSSection = 'pre-consult' | 'orders' | 'post-orders' | 'done';

function getPatientSection(p: QueuePatient): MSSection {
  if (p.status === 'COMPLETED' || p.status === 'NO_SHOW' || p.stationType === 'Done') return 'done';
  // At Return-Consult, Pharmacy, or Billing → Section 3
  if (p.stationType === 'Return-Consult' || ((p.stationType === 'Pharmacy' || p.stationType === 'Billing') && p.doctorOrders.every((o) => o.status === 'completed'))) return 'post-orders';
  // Has orders and some are not yet completed → Section 2 (orders)
  if (p.doctorOrders.length > 0 && p.doctorOrders.some((o) => o.status !== 'completed')) return 'orders';
  // Has orders and ALL completed → Section 3 (post-order)
  if (p.doctorOrders.length > 0 && p.doctorOrders.every((o) => o.status === 'completed')) return 'post-orders';
  // No orders: if at Check-In/Triage/Consult → Section 1
  if (PRE_CONSULT_STATIONS.includes(p.stationType)) return 'pre-consult';
  // Fallback for Pharmacy/Billing with no orders
  if (['Pharmacy', 'Billing'].includes(p.stationType)) return 'post-orders';
  return 'pre-consult';
}

/* ═══════════════════════════════════════════════════
   STYLE HELPERS
   ═══════════════════════════════════════════════════ */

const priorityColor = (p: string): CSSProperties => {
  switch (p) {
    case 'Emergency': return { background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' };
    case 'Senior': return { background: '#eff6ff', color: '#2563eb', border: '1px solid #93c5fd' };
    case 'PWD': return { background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac' };
    default: return { background: 'var(--color-gray-100, #f3f4f6)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' };
  }
};

const waitColor = (mins: number) =>
  mins < 10 ? 'var(--color-success)' : mins <= 20 ? 'var(--color-warning)' : 'var(--color-error)';

const stationIcon = (st: StationType | string) => {
  switch (st) {
    case 'Check-In': return <UserPlus size={14} />;
    case 'Triage': return <Stethoscope size={14} />;
    case 'Consult': return <Stethoscope size={14} />;
    case 'Return-Consult': return <ArrowRight size={14} />;
    case 'Lab': return <FlaskConical size={14} />;
    case 'Imaging': return <Layers size={14} />;
    case 'Pharmacy': return <Pill size={14} />;
    case 'Billing': return <CreditCard size={14} />;
    default: return <CheckCircle size={14} />;
  }
};

/* ═══════════════════════════════════════════════════
   INLINE STYLES
   ═══════════════════════════════════════════════════ */

const S: Record<string, CSSProperties> = {
  page: { padding: 24, background: 'var(--color-background)', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 8 },

  // Stats bar
  statsRow: { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 },
  statCard: { flex: '1 1 140px', background: 'var(--color-surface)', borderRadius: 'var(--radius)', padding: '14px 16px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 4 },
  statLabel: { fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px' },
  statValue: { fontSize: 22, fontWeight: 800, color: 'var(--color-text)' },

  // Controls row
  controls: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 },
  searchWrap: { display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '6px 10px', flex: '1 1 200px', maxWidth: 300 },
  searchInput: { border: 'none', background: 'none', outline: 'none', fontSize: 13, color: 'var(--color-text)', width: '100%' },

  // Buttons
  btn: { display: 'inline-flex', alignItems: 'center', gap: 5, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12, transition: 'all .15s', whiteSpace: 'nowrap' as const },
  btnPrimary: { background: 'var(--color-primary)', color: '#fff', padding: '7px 14px' },
  btnSuccess: { background: 'var(--color-success)', color: '#fff', padding: '7px 14px' },
  btnDanger: { background: 'var(--color-error)', color: '#fff', padding: '7px 14px' },
  btnOutline: { background: 'none', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', padding: '6px 12px' },
  btnGhost: { background: 'none', color: 'var(--color-text-muted)', padding: '6px 10px' },
  btnSm: { padding: '4px 8px', fontSize: 11 },
  modeToggle: { display: 'flex', background: 'var(--color-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', overflow: 'hidden' },
  modeBtn: { padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: 5, transition: 'all .15s' },

  // KANBAN (LINEAR)
  kanban: { display: 'flex', gap: 0, overflowX: 'auto' as const, paddingBottom: 16 },
  lane: { minWidth: 200, maxWidth: 260, flex: '0 0 220px', background: 'var(--color-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 280px)' },
  laneHeader: { padding: '12px 14px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky' as const, top: 0, background: 'var(--color-surface)', zIndex: 2, borderRadius: 'var(--radius) var(--radius) 0 0' },
  laneTitle: { fontWeight: 700, fontSize: 13, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 6 },
  laneBadge: { fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, minWidth: 22, textAlign: 'center' as const },
  laneBody: { padding: 8, display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' as const, flex: 1 },
  arrow: { display: 'flex', alignItems: 'center', padding: '0 2px', color: 'var(--color-text-muted)', flexShrink: 0 },

  // Patient card (shared)
  card: { background: 'var(--color-background)', borderRadius: 8, border: '1px solid var(--color-border)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6, transition: 'box-shadow .15s' },
  cardRow: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' as const },
  ticket: { fontWeight: 800, fontSize: 12, color: 'var(--color-primary)', fontFamily: 'monospace' },
  name: { fontWeight: 600, fontSize: 13, color: 'var(--color-text)', flex: 1 },
  priBadge: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap' as const },
  wait: { fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 },
  complaint: { fontSize: 11, color: 'var(--color-text-muted)', flex: 1 },
  status: { fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 8 },
  actions: { display: 'flex', gap: 4, flexWrap: 'wrap' as const, marginTop: 2 },

  // MULTI-STREAM 3-section layout
  msContainer: { display: 'flex', flexDirection: 'column', gap: 24 },
  msSection: { background: 'var(--color-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', overflow: 'hidden' },
  msSectionHeader: { padding: '14px 18px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-background)' },
  msSectionTitle: { fontWeight: 700, fontSize: 15, color: 'var(--color-text)' },
  msSectionBadge: { fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 10, background: 'var(--color-primary)', color: '#fff' },
  msSectionBody: { padding: 16 },

  // Section 1 & 3: mini swim lanes (horizontal)
  miniLanes: { display: 'flex', gap: 0, overflowX: 'auto' as const },

  // Section 2: parallel order rooms
  orderRooms: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 },
  orderRoom: { background: 'var(--color-background)', borderRadius: 8, border: '1px solid var(--color-border)', overflow: 'hidden' },
  orderRoomHeader: { padding: '10px 14px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: 13 },
  orderRoomBody: { padding: 8, display: 'flex', flexDirection: 'column', gap: 6 },

  // Order chip on patient card
  orderChipRow: { display: 'flex', gap: 4, flexWrap: 'wrap' as const },
  orderChip: { fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 3 },

  // Patient card in order room (compact)
  orderPatientCard: { background: 'var(--color-surface)', borderRadius: 6, border: '1px solid var(--color-border)', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 },

  // Check-in form
  formRow: { display: 'flex', gap: 10, padding: 16, background: 'var(--color-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--color-primary)', flexWrap: 'wrap' as const, alignItems: 'flex-end', marginBottom: 16 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 160px' },
  label: { fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)' },
  input: { padding: '8px 10px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: 13, outline: 'none', background: 'var(--color-background)', color: 'var(--color-text)' },

  // Add orders modal
  modalOverlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,.35)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: 'var(--color-surface)', borderRadius: 12, padding: 24, maxWidth: 480, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,.2)' },
  modalTitle: { fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 16 },
  chipGrid: { display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 20 },
  selectChip: { padding: '8px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)', transition: 'all .15s' },
  selectChipActive: { background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' },

  // Transition arrow between sections
  sectionArrow: { display: 'flex', justifyContent: 'center', padding: '4px 0', color: 'var(--color-text-muted)' },

  empty: { color: 'var(--color-text-muted)', fontSize: 12, textAlign: 'center' as const, padding: 20 },
};

/* ═══════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════ */

export const QueueManagement = () => {
  const { tenant } = useTheme();
  const { showToast } = useToast();
  const {
    queuePatients, queueStats, queueMode,
    toggleQueueMode, checkInPatient, transferPatient,
    addDoctorOrders, startOrder, completeOrder, completeCurrentOrder,
    callNextPatient, startPatient, completePatient,
    markNoShow, skipPatient,
  } = useProvider();

  const labEnabled = tenant.features.visits.clinicLabFulfillmentEnabled;

  // ── Local state ──
  const [search, setSearch] = useState('');
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [ciName, setCiName] = useState('');
  const [ciComplaint, setCiComplaint] = useState('');
  const [ciPriority, setCiPriority] = useState<QueuePatient['priority']>('Normal');
  const [addOrdersFor, setAddOrdersFor] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<DoctorOrderType[]>([]);

  // ── Derived data ──
  const visibleStations: StationType[] = useMemo(
    () => LINEAR_STATION_ORDER.filter((st) => labEnabled || !LAB_STATIONS.includes(st)),
    [labEnabled],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return queuePatients;
    const q = search.toLowerCase();
    return queuePatients.filter((p) => p.patientName.toLowerCase().includes(q) || p.ticketNumber.toLowerCase().includes(q));
  }, [queuePatients, search]);

  // LINEAR: group by station
  const byStation = useMemo(() => {
    const m = new Map<StationType, QueuePatient[]>();
    for (const st of visibleStations) m.set(st, []);
    for (const p of filtered) {
      const list = m.get(p.stationType);
      if (list) list.push(p);
    }
    return m;
  }, [filtered, visibleStations]);

  // MULTI_STREAM: group by section
  const msSections = useMemo(() => {
    const pre: QueuePatient[] = [];
    const orders: QueuePatient[] = [];
    const post: QueuePatient[] = [];
    const done: QueuePatient[] = [];
    for (const p of filtered) {
      const sec = getPatientSection(p);
      if (sec === 'pre-consult') pre.push(p);
      else if (sec === 'orders') orders.push(p);
      else if (sec === 'post-orders') post.push(p);
      else done.push(p);
    }
    return { pre, orders, post, done };
  }, [filtered]);

  // For Section 2: group patients by ORDER TYPE (each order type = its own column)
  // A patient can appear in multiple columns simultaneously
  const orderColumnMap = useMemo(() => {
    const cols = new Map<DoctorOrderType, { label: string; station: StationType; patients: { patient: QueuePatient; order: QueuePatient['doctorOrders'][0] }[] }>();
    for (const p of msSections.orders) {
      for (const ord of p.doctorOrders) {
        if (ord.status === 'completed') continue; // Skip completed orders
        if (ord.type === 'Pharmacy' || ord.type === 'Return-Consult') continue; // These belong in Section 3
        const key = ord.type;
        if (!cols.has(key)) cols.set(key, { label: ord.label, station: ord.targetStation, patients: [] });
        cols.get(key)!.patients.push({ patient: p, order: ord });
      }
    }
    return cols;
  }, [msSections.orders]);

  // ── Actions ──
  const handleCheckIn = () => {
    if (!ciName.trim()) return;
    checkInPatient(ciName.trim(), ciComplaint.trim(), ciPriority);
    showToast(`${ciName.trim()} checked in`, 'success');
    setCiName(''); setCiComplaint(''); setCiPriority('Normal'); setShowCheckIn(false);
  };

  const nextStation = useCallback((current: StationType): StationType | null => {
    const idx = visibleStations.indexOf(current);
    if (idx < 0 || idx >= visibleStations.length - 1) return null;
    return visibleStations[idx + 1];
  }, [visibleStations]);

  const handleAdvance = (patientId: string, currentStation: StationType) => {
    const next = nextStation(currentStation);
    if (next) {
      transferPatient(patientId, next);
      showToast(`Moved to ${next}`, 'success');
    } else {
      completePatient(patientId);
      showToast('Patient completed', 'success');
    }
  };

  const handleCall = (station: StationType) => {
    callNextPatient(station);
    showToast('Patient called', 'info');
  };

  const handleStart = (id: string) => {
    startPatient(id);
    showToast('Session started', 'info');
  };

  const handleNoShow = (id: string) => {
    markNoShow(id);
    showToast('Marked no-show', 'error');
  };

  const handleSkip = (id: string) => {
    skipPatient(id);
    showToast('Skipped to end', 'info');
  };

  const handleStartOrder = (patientId: string, orderId: string) => {
    startOrder(patientId, orderId);
    showToast('Order started', 'info');
  };

  const handleCompleteOrder = (patientId: string, orderId: string) => {
    completeOrder(patientId, orderId);
    showToast('Order completed', 'success');
  };

  const handleAddOrders = () => {
    if (!addOrdersFor || selectedOrders.length === 0) return;
    addDoctorOrders(addOrdersFor, selectedOrders);
    showToast(`${selectedOrders.length} order(s) added`, 'success');
    setAddOrdersFor(null); setSelectedOrders([]);
  };

  const toggleOrderSelect = (t: DoctorOrderType) =>
    setSelectedOrders((prev) => prev.includes(t) ? prev.filter((o) => o !== t) : [...prev, t]);

  // ═══════════════════════════════════════════════════
  //  SHARED: Patient Card
  // ═══════════════════════════════════════════════════

  const PatientCard = ({ p, showAdvance, section }: { p: QueuePatient; showAdvance?: boolean; section?: MSSection }) => {
    // Determine what kind of IN_SESSION actions to show
    const hasActiveOrders = p.doctorOrders.length > 0 && p.doctorOrders.some((o) => o.status !== 'completed');
    const hasCompletedOrders = p.doctorOrders.length > 0 && p.doctorOrders.every((o) => o.status === 'completed');
    const currentOrder = p.currentOrderIndex >= 0 ? p.doctorOrders[p.currentOrderIndex] : null;
    const isAtConsult = p.stationType === 'Consult';
    const isAtReturnConsult = p.stationType === 'Return-Consult';
    const isAtOrderStation = p.stationType === 'Lab' || p.stationType === 'Imaging';
    const isLinear = queueMode === 'LINEAR';

    return (
      <div style={S.card}>
        <div style={S.cardRow}>
          <span style={S.ticket}>{p.ticketNumber}</span>
          <span style={S.name}>{p.patientName}</span>
          <span style={{ ...S.priBadge, ...priorityColor(p.priority) }}>{p.priority}</span>
        </div>
        <div style={S.cardRow}>
          <span style={{ ...S.wait, color: waitColor(p.waitMinutes) }}>
            <Clock size={11} /> {p.waitMinutes}m
          </span>
          {p.chiefComplaint && <span style={S.complaint}>— {p.chiefComplaint}</span>}
        </div>

        {/* Show current order info when patient is at an order station */}
        {isAtOrderStation && currentOrder && isLinear && (
          <div style={S.orderChipRow}>
            {p.doctorOrders.map((o) => {
              const bg = o.status === 'completed' ? '#dcfce7' : o.status === 'in-progress' || o.status === 'queued' ? '#dbeafe' : '#f3f4f6';
              const fg = o.status === 'completed' ? '#16a34a' : o.status === 'in-progress' || o.status === 'queued' ? '#2563eb' : '#6b7280';
              return (
                <span key={o.id} style={{ ...S.orderChip, background: bg, color: fg, fontWeight: o.id === currentOrder.id ? 700 : 500 }}>
                  {o.status === 'completed' ? <Check size={9} /> : o.status === 'pending' ? <Circle size={9} /> : <Play size={9} />}
                  {o.label}
                </span>
              );
            })}
          </div>
        )}

        {/* Show completed order chips for post-order patients */}
        {(isAtReturnConsult || section === 'post-orders') && hasCompletedOrders && (
          <div style={S.orderChipRow}>
            {p.doctorOrders.map((o) => (
              <span key={o.id} style={{ ...S.orderChip, background: '#dcfce7', color: '#16a34a' }}>
                <Check size={10} /> {o.label}
              </span>
            ))}
          </div>
        )}

        <div style={S.actions}>
          {/* QUEUED: Call / Skip / No-Show */}
          {p.status === 'QUEUED' && (
            <>
              <button style={{ ...S.btn, ...S.btnPrimary, ...S.btnSm }} onClick={() => handleCall(p.stationType)}>
                <PhoneCall size={11} /> Call
              </button>
              <button style={{ ...S.btn, ...S.btnGhost, ...S.btnSm }} onClick={() => handleSkip(p.id)}>
                <SkipForward size={11} /> Skip
              </button>
              <button style={{ ...S.btn, ...S.btnGhost, ...S.btnSm, color: 'var(--color-error)' }} onClick={() => handleNoShow(p.id)}>
                <XCircle size={11} /> No-Show
              </button>
            </>
          )}

          {/* READY: Start */}
          {p.status === 'READY' && (
            <button style={{ ...S.btn, ...S.btnPrimary, ...S.btnSm }} onClick={() => handleStart(p.id)}>
              <Play size={11} /> Start
            </button>
          )}

          {/* IN_SESSION actions — context-dependent */}
          {p.status === 'IN_SESSION' && (
            <>
              {/* At Consult (initial) with no orders yet → "Add Orders" + "Next →" (skip orders) */}
              {isAtConsult && !hasActiveOrders && !hasCompletedOrders && (
                <>
                  <button style={{ ...S.btn, ...S.btnOutline, ...S.btnSm }}
                    onClick={() => { setAddOrdersFor(p.id); setSelectedOrders([]); }}>
                    <Plus size={11} /> Add Orders
                  </button>
                  {showAdvance && (
                    <button style={{ ...S.btn, ...S.btnSuccess, ...S.btnSm }}
                      onClick={() => handleAdvance(p.id, p.stationType)}>
                      <ArrowRight size={11} /> Next: {isLinear ? 'Return-Consult' : nextStation(p.stationType)}
                    </button>
                  )}
                </>
              )}

              {/* At an order station (Lab/Imaging) → "Complete Order" to advance sequentially */}
              {isAtOrderStation && hasActiveOrders && isLinear && (
                <button style={{ ...S.btn, ...S.btnSuccess, ...S.btnSm }}
                  onClick={() => { completeCurrentOrder(p.id); showToast('Order completed', 'success'); }}>
                  <CheckCircle size={11} /> Complete Order
                </button>
              )}

              {/* At Return-Consult → doctor chooses: Pharmacy or Billing */}
              {isAtReturnConsult && (
                <>
                  <button style={{ ...S.btn, ...S.btnPrimary, ...S.btnSm }}
                    onClick={() => { transferPatient(p.id, 'Pharmacy'); showToast('Sent to Pharmacy', 'success'); }}>
                    <Pill size={11} /> → Pharmacy
                  </button>
                  <button style={{ ...S.btn, ...S.btnOutline, ...S.btnSm }}
                    onClick={() => { transferPatient(p.id, 'Billing'); showToast('Sent to Billing', 'success'); }}>
                    <CreditCard size={11} /> → Billing
                  </button>
                </>
              )}

              {/* Normal advance for other stations (Check-In, Triage, Pharmacy, Billing) */}
              {showAdvance && !isAtConsult && !isAtOrderStation && !isAtReturnConsult && (
                <button style={{ ...S.btn, ...S.btnSuccess, ...S.btnSm }}
                  onClick={() => handleAdvance(p.id, p.stationType)}>
                  {nextStation(p.stationType) ? (
                    <><ArrowRight size={11} /> Next: {nextStation(p.stationType)}</>
                  ) : (
                    <><CheckCircle size={11} /> Complete</>
                  )}
                </button>
              )}
            </>
          )}

          {/* COMPLETED */}
          {p.status === 'COMPLETED' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--color-success)', fontWeight: 600 }}>
              <Check size={12} /> Done
            </span>
          )}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════
  //  LINEAR MODE: Swim Lane Kanban
  //  Complete → auto-advance to next lane
  // ═══════════════════════════════════════════════════

  const renderLinear = () => (
    <div style={S.kanban}>
      {visibleStations.map((station, i) => {
        const patients = byStation.get(station) ?? [];
        const isDone = station === 'Done';
        const active = isDone ? patients : patients.filter((p) => p.status !== 'COMPLETED' && p.status !== 'NO_SHOW');
        return (
          <div key={station} style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={S.lane}>
              <div style={S.laneHeader}>
                <span style={S.laneTitle}>
                  {stationIcon(station)} {station === 'Return-Consult' ? 'Return Consult' : station}
                </span>
                <span style={{ ...S.laneBadge, background: isDone ? 'var(--color-success)' : 'var(--color-primary)', color: '#fff' }}>
                  {active.length}
                </span>
              </div>
              <div style={S.laneBody}>
                {active.length === 0 ? (
                  <div style={S.empty}>No patients</div>
                ) : (
                  active.map((p) => <PatientCard key={p.id} p={p} showAdvance />)
                )}
              </div>
            </div>
            {i < visibleStations.length - 1 && (
              <div style={S.arrow}><ChevronRight size={18} /></div>
            )}
          </div>
        );
      })}
    </div>
  );

  // ═══════════════════════════════════════════════════
  //  MULTI_STREAM MODE: 3 Sections
  //  1. Pre-Consult (Check-In → Triage → Consult)
  //  2. Doctor Orders (parallel rooms)
  //  3. Post-Orders (Return Consult → Pharmacy → Billing)
  // ═══════════════════════════════════════════════════

  // Mini swim lane for Section 1 or 3
  const renderMiniLanes = (stations: StationType[], patients: QueuePatient[], section: MSSection) => {
    const grouped = new Map<StationType, QueuePatient[]>();
    for (const st of stations) grouped.set(st, []);
    for (const p of patients) {
      // For post-orders: map stationType correctly
      const st = stations.includes(p.stationType) ? p.stationType : stations[0];
      grouped.get(st)?.push(p);
    }
    return (
      <div style={S.miniLanes}>
        {stations.map((station, i) => {
          const stPatients = grouped.get(station) ?? [];
          return (
            <div key={station} style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ ...S.lane, minWidth: 180, maxWidth: 240, flex: '0 0 200px' }}>
                <div style={S.laneHeader}>
                  <span style={S.laneTitle}>{stationIcon(station)} {station === 'Return-Consult' ? 'Return Consult' : station}</span>
                  <span style={{ ...S.laneBadge, background: 'var(--color-primary)', color: '#fff' }}>{stPatients.length}</span>
                </div>
                <div style={S.laneBody}>
                  {stPatients.length === 0 ? (
                    <div style={S.empty}>Empty</div>
                  ) : (
                    stPatients.map((p) => <PatientCard key={p.id} p={p} showAdvance section={section} />)
                  )}
                </div>
              </div>
              {i < stations.length - 1 && <div style={S.arrow}><ChevronRight size={16} /></div>}
            </div>
          );
        })}
      </div>
    );
  };

  // Section 2: Each order TYPE gets its own column — not grouped by station
  const renderOrderColumns = () => {
    const colKeys = Array.from(orderColumnMap.keys());
    if (colKeys.length === 0 && msSections.orders.length === 0) {
      return <div style={S.empty}>No patients with active orders</div>;
    }

    // Sort columns by a fixed order for consistency
    const typeOrder: DoctorOrderType[] = ['Lab-CBC', 'Lab-Chemistry', 'Lab-Urinalysis', 'X-Ray', 'CT-Scan', 'Ultrasound', 'ECG'];
    colKeys.sort((a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b));

    return (
      <div>
        {msSections.orders.length > 0 && (
          <div style={{ marginBottom: 12, fontSize: 12, color: 'var(--color-text-muted)' }}>
            <strong>{msSections.orders.length}</strong> patient(s) with active orders across <strong>{colKeys.length}</strong> order column(s) — patients appear in every column they have a pending order for
          </div>
        )}

        <div style={{ display: 'flex', gap: 0, overflowX: 'auto' as const, paddingBottom: 8 }}>
          {colKeys.map((key, i) => {
            const col = orderColumnMap.get(key)!;
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{ ...S.orderRoom, minWidth: 220, maxWidth: 280, flex: '0 0 240px' }}>
                  <div style={S.orderRoomHeader}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text)' }}>
                      {stationIcon(col.station)} {col.label}
                    </span>
                    <span style={{ ...S.laneBadge, background: 'var(--color-primary)', color: '#fff' }}>
                      {col.patients.length}
                    </span>
                  </div>
                  <div style={S.orderRoomBody}>
                    {col.patients.length === 0 ? (
                      <div style={S.empty}>No patients</div>
                    ) : (
                      col.patients.map(({ patient: p, order: ord }) => (
                        <div key={`${p.id}-${ord.id}`} style={S.orderPatientCard}>
                          <div style={S.cardRow}>
                            <span style={S.ticket}>{p.ticketNumber}</span>
                            <span style={{ ...S.name, fontSize: 12 }}>{p.patientName}</span>
                            <span style={{ ...S.priBadge, ...priorityColor(p.priority), fontSize: 9 }}>{p.priority}</span>
                          </div>
                          <div style={S.cardRow}>
                            <span style={{
                              ...S.status,
                              background: ord.status === 'in-progress' ? '#dbeafe' : ord.status === 'queued' ? '#fef9c3' : '#e5e7eb',
                              color: ord.status === 'in-progress' ? '#2563eb' : ord.status === 'queued' ? '#a16207' : '#6b7280',
                            }}>
                              {ord.status === 'in-progress' ? 'In Progress' : ord.status === 'queued' ? 'Waiting' : ord.status}
                            </span>
                            <span style={{ ...S.wait, color: waitColor(p.waitMinutes) }}>
                              <Clock size={10} /> {p.waitMinutes}m
                            </span>
                          </div>
                          {/* All orders for this patient shown as chips */}
                          <div style={S.orderChipRow}>
                            {p.doctorOrders.map((o) => {
                              const isThis = o.id === ord.id;
                              const bg = o.status === 'completed' ? '#dcfce7' : o.status === 'in-progress' ? '#dbeafe' : isThis ? '#fef9c3' : '#f3f4f6';
                              const fg = o.status === 'completed' ? '#16a34a' : o.status === 'in-progress' ? '#2563eb' : isThis ? '#a16207' : '#6b7280';
                              return (
                                <span key={o.id} style={{ ...S.orderChip, background: bg, color: fg, fontWeight: isThis ? 700 : 500 }}>
                                  {o.status === 'completed' ? <Check size={9} /> : o.status === 'in-progress' ? <Play size={9} /> : <Circle size={9} />}
                                  {o.label}
                                </span>
                              );
                            })}
                          </div>
                          <div style={S.actions}>
                            {ord.status === 'queued' && (
                              <button style={{ ...S.btn, ...S.btnPrimary, ...S.btnSm }} onClick={() => handleStartOrder(p.id, ord.id)}>
                                <Play size={11} /> Start
                              </button>
                            )}
                            {ord.status === 'in-progress' && (
                              <button style={{ ...S.btn, ...S.btnSuccess, ...S.btnSm }} onClick={() => handleCompleteOrder(p.id, ord.id)}>
                                <CheckCircle size={11} /> Complete
                              </button>
                            )}
                            <button style={{ ...S.btn, ...S.btnOutline, ...S.btnSm }} onClick={() => { setAddOrdersFor(p.id); setSelectedOrders([]); }}>
                              <Plus size={11} /> Add
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                {i < colKeys.length - 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 2px', color: 'var(--color-text-muted)', opacity: 0.4 }}>
                    <span style={{ fontSize: 10, writingMode: 'vertical-rl' as const }}>║</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMultiStream = () => (
    <div style={S.msContainer}>
      {/* SECTION 1: Pre-Consult */}
      <div style={S.msSection}>
        <div style={S.msSectionHeader}>
          <UserPlus size={18} style={{ color: 'var(--color-primary)' }} />
          <span style={S.msSectionTitle}>Section 1 — Pre-Consult</span>
          <span style={S.msSectionBadge}>{msSections.pre.length}</span>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
            Check-In → Triage → Consult
          </span>
        </div>
        <div style={S.msSectionBody}>
          {msSections.pre.length === 0 ? (
            <div style={S.empty}>No patients in pre-consult</div>
          ) : (
            renderMiniLanes(PRE_CONSULT_STATIONS, msSections.pre, 'pre-consult')
          )}
        </div>
      </div>

      <div style={S.sectionArrow}><ArrowDown size={24} /></div>

      {/* SECTION 2: Doctor Orders (parallel) */}
      <div style={{ ...S.msSection, borderColor: 'var(--color-primary)' }}>
        <div style={{ ...S.msSectionHeader, background: 'color-mix(in srgb, var(--color-primary) 8%, var(--color-background))' }}>
          <FlaskConical size={18} style={{ color: 'var(--color-primary)' }} />
          <span style={S.msSectionTitle}>Section 2 — Doctor Orders</span>
          <span style={S.msSectionBadge}>{msSections.orders.length}</span>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
            Each order type has its own column — patients can be in multiple columns at once
          </span>
        </div>
        <div style={S.msSectionBody}>
          {renderOrderColumns()}
        </div>
      </div>

      <div style={S.sectionArrow}><ArrowDown size={24} /></div>

      {/* SECTION 3: Post-Orders */}
      <div style={S.msSection}>
        <div style={S.msSectionHeader}>
          <Pill size={18} style={{ color: 'var(--color-primary)' }} />
          <span style={S.msSectionTitle}>Section 3 — Post-Order</span>
          <span style={S.msSectionBadge}>{msSections.post.length}</span>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
            Return Consult → Pharmacy → Billing
          </span>
        </div>
        <div style={S.msSectionBody}>
          {msSections.post.length === 0 ? (
            <div style={S.empty}>No patients in post-order — patients advance here when all orders are completed</div>
          ) : (
            renderMiniLanes(POST_ORDER_STATIONS, msSections.post, 'post-orders')
          )}
        </div>
      </div>

      {/* Done summary */}
      {msSections.done.length > 0 && (
        <div style={{ padding: 12, background: 'var(--color-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-success)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle size={16} /> Completed Today: {msSections.done.length}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {msSections.done.map((p) => (
              <span key={p.id} style={{ fontSize: 11, padding: '4px 10px', background: '#dcfce7', color: '#16a34a', borderRadius: 10, fontWeight: 600 }}>
                {p.ticketNumber} {p.patientName}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════
  //  MAIN RENDER
  // ═══════════════════════════════════════════════════

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.title}>
          <Users size={22} /> Queue Management
        </div>
        <div style={S.modeToggle}>
          <button
            onClick={() => queueMode !== 'LINEAR' && toggleQueueMode()}
            style={{ ...S.modeBtn, background: queueMode === 'LINEAR' ? 'var(--color-primary)' : 'transparent', color: queueMode === 'LINEAR' ? '#fff' : 'var(--color-text-muted)' }}
          >
            <LayoutList size={14} /> Swim Lane
          </button>
          <button
            onClick={() => queueMode !== 'MULTI_STREAM' && toggleQueueMode()}
            style={{ ...S.modeBtn, background: queueMode === 'MULTI_STREAM' ? 'var(--color-primary)' : 'transparent', color: queueMode === 'MULTI_STREAM' ? '#fff' : 'var(--color-text-muted)' }}
          >
            <GitBranch size={14} /> Multi-Stream
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={S.statsRow}>
        <div style={S.statCard}>
          <span style={S.statLabel}>In Queue</span>
          <span style={S.statValue}>{queueStats.totalInQueue}</span>
        </div>
        <div style={S.statCard}>
          <span style={S.statLabel}>Avg Wait</span>
          <span style={S.statValue}>{queueStats.avgWaitTime}m</span>
        </div>
        <div style={S.statCard}>
          <span style={S.statLabel}>Longest Wait</span>
          <span style={{ ...S.statValue, color: queueStats.longestWait > 20 ? 'var(--color-error)' : 'var(--color-text)' }}>
            {queueStats.longestWait}m
          </span>
        </div>
        <div style={S.statCard}>
          <span style={S.statLabel}>Completed</span>
          <span style={{ ...S.statValue, color: 'var(--color-success)' }}>{queueStats.completedToday}</span>
        </div>
      </div>

      {/* Controls */}
      <div style={S.controls}>
        <div style={S.searchWrap}>
          <Search size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <input style={S.searchInput} placeholder="Search patient or ticket..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button style={{ ...S.btn, ...S.btnPrimary }} onClick={() => setShowCheckIn(!showCheckIn)}>
          {showCheckIn ? <X size={14} /> : <UserPlus size={14} />}
          {showCheckIn ? 'Cancel' : 'Check In Patient'}
        </button>
      </div>

      {/* Check-in form */}
      {showCheckIn && (
        <div style={S.formRow}>
          <div style={S.fieldGroup}>
            <label style={S.label}>Patient Name</label>
            <input style={S.input} value={ciName} onChange={(e) => setCiName(e.target.value)} placeholder="Full name" />
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>Chief Complaint</label>
            <input style={S.input} value={ciComplaint} onChange={(e) => setCiComplaint(e.target.value)} placeholder="Reason for visit" />
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>Priority</label>
            <select style={S.input} value={ciPriority} onChange={(e) => setCiPriority(e.target.value as QueuePatient['priority'])}>
              {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button style={{ ...S.btn, ...S.btnSuccess }} onClick={handleCheckIn}>
            <CheckCircle size={14} /> Check In
          </button>
        </div>
      )}

      {/* Mode-specific view */}
      {queueMode === 'LINEAR' ? renderLinear() : renderMultiStream()}

      {/* Add Orders Modal */}
      {addOrdersFor && (
        <div style={S.modalOverlay} onClick={() => setAddOrdersFor(null)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={S.modalTitle}>Add Doctor Orders</span>
              <button style={{ ...S.btn, ...S.btnGhost }} onClick={() => setAddOrdersFor(null)}><X size={16} /></button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 16 }}>
              Select exams / tests to order. All orders will be queued <strong>in parallel</strong> — the patient will appear in every room simultaneously.
            </p>
            <div style={S.chipGrid}>
              {ALL_ORDER_TYPES.map(({ type, label, station }) => (
                <button
                  key={type}
                  onClick={() => toggleOrderSelect(type)}
                  style={{
                    ...S.selectChip,
                    ...(selectedOrders.includes(type) ? S.selectChipActive : {}),
                  }}
                >
                  {stationIcon(station)} {label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button style={{ ...S.btn, ...S.btnGhost }} onClick={() => setAddOrdersFor(null)}>Cancel</button>
              <button style={{ ...S.btn, ...S.btnPrimary }} onClick={handleAddOrders} disabled={selectedOrders.length === 0}>
                <Plus size={14} /> Add {selectedOrders.length} Order(s)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
