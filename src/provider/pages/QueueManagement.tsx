import React, { useState, useMemo, useCallback, type CSSProperties } from 'react';
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
  Monitor,
  DoorOpen,
  Coffee,
  ExternalLink,
  Tv,
  HeartPulse,
} from 'lucide-react';
import { useProvider } from '../context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { getPatientTenant } from '../data/providerMockData';
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
    case 'Emergency': return { background: 'var(--color-error-light)', color: 'var(--color-error-dark)', border: '1px solid #fca5a5' };
    case 'Senior': return { background: '#eff6ff', color: 'var(--color-info-dark)', border: '1px solid #93c5fd' };
    case 'PWD': return { background: '#f0fdf4', color: 'var(--color-success-dark)', border: '1px solid #86efac' };
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
  card: { background: 'var(--color-background)', borderRadius: 8, border: '1px solid var(--color-border)', padding: 0, display: 'flex', flexDirection: 'column', gap: 0, transition: 'box-shadow .15s', overflow: 'hidden' as const },
  cardInner: { padding: '8px 10px 6px', display: 'flex', flexDirection: 'column' as const, gap: 4 },
  cardRow: { display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' as const },
  ticket: { fontWeight: 800, fontSize: 13, color: 'var(--color-primary)', fontFamily: 'monospace', letterSpacing: 0.5 },
  name: { fontWeight: 600, fontSize: 12, color: 'var(--color-text)', flex: 1, overflow: 'hidden' as const, textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  priBadge: { fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 8, whiteSpace: 'nowrap' as const },
  wait: { fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2, fontFamily: 'monospace' },
  complaint: { fontSize: 10, color: 'var(--color-text-muted)', overflow: 'hidden' as const, textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  status: { fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 8 },
  actions: { display: 'flex', gap: 3, flexWrap: 'wrap' as const, padding: '5px 10px 8px', borderTop: '1px solid var(--color-border)', background: 'color-mix(in srgb, var(--color-primary) 2%, var(--color-background))' },

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

  /* ── Consultation Room Sub-Lanes ── */
  roomGroup: { display: 'flex', flexDirection: 'column' as const, gap: 0 },
  roomGroupHeader: { padding: '10px 14px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky' as const, top: 0, background: 'var(--color-surface)', zIndex: 2, borderRadius: 'var(--radius) var(--radius) 0 0' },
  roomGroupTitle: { fontWeight: 700, fontSize: 13, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 6 },
  roomSubLane: { borderTop: '1px solid var(--color-border)', padding: 0, display: 'flex', flexDirection: 'column' as const, gap: 0 },
  roomSubHeader: { padding: '8px 10px', background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-surface))', borderBottom: '1px solid var(--color-border)' },
  roomLabel: { fontSize: 12, fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 5 },
  roomDoctor: { fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 },
  roomSpecialty: { fontSize: 8, fontWeight: 600, padding: '1px 5px', borderRadius: 4, background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', color: 'var(--color-primary)', whiteSpace: 'nowrap' as const },
  roomBadge: { fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 8, background: 'var(--color-primary)', color: '#fff' },
  roomStatusBadge: { fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 6, display: 'inline-flex' as const, alignItems: 'center', gap: 2 },
  roomCardBody: { padding: '6px 8px', display: 'flex', flexDirection: 'column' as const, gap: 6 },
  unassignedSection: { borderTop: '1px dashed var(--color-border)', padding: '8px 10px' },
  unassignedLabel: { fontSize: 11, fontWeight: 600, color: 'var(--color-warning)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 },

};

/* ═══════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════ */

export const QueueManagement = () => {
  const { tenant } = useTheme();
  const { showToast } = useToast();
  const {
    queuePatients, queueMode, consultRooms,
    toggleQueueMode, checkInPatient, transferPatient,
    addDoctorOrders, startOrder, completeOrder, completeCurrentOrder,
    callNextPatient, startPatient, completePatient,
    markNoShow, skipPatient, deferOrder,
  } = useProvider();

  const labEnabled = tenant.features.visits.clinicLabFulfillmentEnabled;
  const tenantId = tenant.id;

  // ── Tenant-filtered data ──
  const tenantQueuePatients = useMemo(
    () => queuePatients.filter(p => getPatientTenant(p.patientId) === tenantId),
    [queuePatients, tenantId],
  );
  const tenantConsultRooms = useMemo(
    () => consultRooms.filter(r => !r.tenantId || r.tenantId === tenantId),
    [consultRooms, tenantId],
  );

  // ── Tenant-aware queue stats (replaces global queueStats for display) ──
  const tenantQueueStats = useMemo(() => {
    const active = tenantQueuePatients.filter(p => p.status === 'QUEUED' || p.status === 'READY' || p.status === 'IN_SESSION');
    const waitTimes = active.map(p => p.waitMinutes).filter(n => n >= 0);
    return {
      totalInQueue: active.length,
      avgWaitTime: waitTimes.length > 0 ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : 0,
      longestWait: waitTimes.length > 0 ? Math.max(...waitTimes) : 0,
      completedToday: tenantQueuePatients.filter(p => p.status === 'COMPLETED').length,
    };
  }, [tenantQueuePatients]);

  // ── Local state ──
  type ViewMode = 'queue' | 'monitor';
  const [viewMode, setViewMode] = useState<ViewMode>('queue');
  const [search, setSearch] = useState('');
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [ciName, setCiName] = useState('');
  const [ciComplaint, setCiComplaint] = useState('');
  const [ciPriority, setCiPriority] = useState<QueuePatient['priority']>('Normal');
  const [addOrdersFor, setAddOrdersFor] = useState<string | null>(null);
  // Room assignment modal — opened when advancing from Triage/Check-In to Consult
  const [assignRoomFor, setAssignRoomFor] = useState<{ patientId: string; patientName: string; fromStation: StationType } | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<DoctorOrderType[]>([]);


  // ── Derived data ──
  const visibleStations: StationType[] = useMemo(
    () => LINEAR_STATION_ORDER.filter((st) => labEnabled || !LAB_STATIONS.includes(st)),
    [labEnabled],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return tenantQueuePatients;
    const q = search.toLowerCase();
    return tenantQueuePatients.filter((p) => p.patientName.toLowerCase().includes(q) || p.ticketNumber.toLowerCase().includes(q));
  }, [tenantQueuePatients, search]);

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
    if (!next) {
      completePatient(patientId);
      showToast('Patient completed', 'success');
      return;
    }
    // If advancing TO Consult → open room assignment modal
    if (next === 'Consult') {
      const patient = tenantQueuePatients.find(p => p.id === patientId);
      setAssignRoomFor({ patientId, patientName: patient?.patientName ?? '', fromStation: currentStation });
      return;
    }
    transferPatient(patientId, next);
    showToast(`Moved to ${next}`, 'success');
  };

  const handleAssignRoom = (roomId: string) => {
    if (!assignRoomFor) return;
    const room = tenantConsultRooms.find(r => r.id === roomId);
    if (!room) return;
    transferPatient(assignRoomFor.patientId, 'Consult', {
      consultRoomId: room.id,
      consultRoomName: room.name,
      assignedDoctor: room.doctorName,
    });
    showToast(`Assigned to ${room.name} — ${room.doctorName}`, 'success');
    setAssignRoomFor(null);
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

  const PatientCard = ({ p, showAdvance, section, isReturn }: { p: QueuePatient; showAdvance?: boolean; section?: MSSection; isReturn?: boolean }) => {
    // Determine what kind of IN_SESSION actions to show
    const hasActiveOrders = p.doctorOrders.length > 0 && p.doctorOrders.some((o) => o.status !== 'completed');
    const hasCompletedOrders = p.doctorOrders.length > 0 && p.doctorOrders.every((o) => o.status === 'completed');
    const currentOrder = p.currentOrderIndex >= 0 ? p.doctorOrders[p.currentOrderIndex] : null;
    const isAtConsult = p.stationType === 'Consult';
    const isAtReturnConsult = p.stationType === 'Return-Consult';
    const isAtOrderStation = p.stationType === 'Lab' || p.stationType === 'Imaging';
    const isLinear = queueMode === 'LINEAR';

    // Status-aware left border
    const borderLeft = p.status === 'IN_SESSION' ? '3px solid var(--color-success)'
      : p.status === 'READY' ? '3px solid var(--color-primary)'
      : p.status === 'COMPLETED' ? '3px solid #a3a3a3'
      : '3px solid transparent';

    // Status label
    const statusLabel = p.status === 'IN_SESSION' ? 'In Session'
      : p.status === 'READY' ? 'Ready'
      : p.status === 'QUEUED' ? 'Queued'
      : p.status === 'COMPLETED' ? 'Done'
      : p.status;

    const statusColor = p.status === 'IN_SESSION' ? { bg: 'color-mix(in srgb, var(--color-success) 12%, transparent)', fg: 'var(--color-success)' }
      : p.status === 'READY' ? { bg: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', fg: 'var(--color-primary)' }
      : p.status === 'COMPLETED' ? { bg: '#f3f4f6', fg: '#6b7280' }
      : { bg: 'var(--color-gray-100, #f3f4f6)', fg: 'var(--color-text-muted)' };

    return (
      <div style={{ ...S.card, borderLeft }}>
        <div style={S.cardInner}>
          {/* Row 1: Ticket + Name + Priority */}
          <div style={S.cardRow}>
            <span style={S.ticket}>{p.ticketNumber}</span>
            <span style={S.name}>{p.patientName}</span>
            {isReturn && (
              <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 5, background: '#7c3aed', color: '#ede9fe', whiteSpace: 'nowrap' }}>
                RET
              </span>
            )}
            {p.priority !== 'Normal' && (
              <span style={{ ...S.priBadge, ...priorityColor(p.priority) }}>{p.priority}</span>
            )}
          </div>

          {/* Row 2: Status + Wait + Complaint */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 6, background: statusColor.bg, color: statusColor.fg, whiteSpace: 'nowrap' as const }}>
              {statusLabel}
            </span>
            <span style={{ ...S.wait, color: waitColor(p.waitMinutes) }}>
              <Clock size={9} /> +{p.waitMinutes}m
            </span>
            {p.chiefComplaint && (
              <span style={S.complaint} title={p.chiefComplaint}>— {p.chiefComplaint}</span>
            )}
          </div>

          {/* Row 3 (optional): Assigned doctor / nurse */}
          {(p.assignedDoctor || p.assignedNurse) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: 'var(--color-text-muted)' }}>
              {p.assignedDoctor && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Stethoscope size={8} style={{ flexShrink: 0 }} /> {p.assignedDoctor}
                </span>
              )}
              {p.assignedDoctor && p.assignedNurse && <span style={{ opacity: 0.4 }}>·</span>}
              {p.assignedNurse && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <HeartPulse size={8} style={{ flexShrink: 0 }} /> {p.assignedNurse}
                </span>
              )}
            </div>
          )}

          {/* Order chips — when at order station */}
          {isAtOrderStation && currentOrder && isLinear && (
            <div style={S.orderChipRow}>
              {p.doctorOrders.map((o) => {
                const bg = o.status === 'completed' ? '#dcfce7' : o.status === 'in-progress' || o.status === 'queued' ? 'var(--color-info-light)' : '#f3f4f6';
                const fg = o.status === 'completed' ? 'var(--color-success-dark)' : o.status === 'in-progress' || o.status === 'queued' ? 'var(--color-info-dark)' : '#6b7280';
                return (
                  <span key={o.id} style={{ ...S.orderChip, background: bg, color: fg, fontWeight: o.id === currentOrder.id ? 700 : 500 }}>
                    {o.status === 'completed' ? <Check size={9} /> : o.status === 'pending' ? <Circle size={9} /> : <Play size={9} />}
                    {o.label}
                  </span>
                );
              })}
            </div>
          )}

          {/* Completed order chips for return-consult / post-order patients */}
          {(isAtReturnConsult || section === 'post-orders') && hasCompletedOrders && (
            <div style={S.orderChipRow}>
              {p.doctorOrders.map((o) => (
                <span key={o.id} style={{ ...S.orderChip, background: '#dcfce7', color: 'var(--color-success-dark)' }}>
                  <Check size={9} /> {o.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions bar — visually separated */}
        {p.status !== 'NO_SHOW' && (
          <div style={S.actions}>
            {/* QUEUED: Call / Skip / No-Show */}
            {p.status === 'QUEUED' && (
              <>
                <button style={{ ...S.btn, ...S.btnPrimary, ...S.btnSm }} onClick={() => handleCall(p.stationType)}>
                  <PhoneCall size={10} /> Call
                </button>
                <button style={{ ...S.btn, ...S.btnGhost, ...S.btnSm }} onClick={() => handleSkip(p.id)}>
                  <SkipForward size={10} /> Skip
                </button>
                <button style={{ ...S.btn, ...S.btnGhost, ...S.btnSm, color: 'var(--color-error)' }} onClick={() => handleNoShow(p.id)}>
                  <XCircle size={10} />
                </button>
              </>
            )}

            {/* READY: Start */}
            {p.status === 'READY' && (
              <button style={{ ...S.btn, ...S.btnPrimary, ...S.btnSm }} onClick={() => handleStart(p.id)}>
                <Play size={10} /> Start
              </button>
            )}

            {/* IN_SESSION actions — context-dependent */}
            {p.status === 'IN_SESSION' && (
              <>
                {isAtConsult && !hasActiveOrders && !hasCompletedOrders && (
                  <>
                    <button style={{ ...S.btn, ...S.btnOutline, ...S.btnSm }}
                      onClick={() => { setAddOrdersFor(p.id); setSelectedOrders([]); }}>
                      <Plus size={10} /> Orders
                    </button>
                    {showAdvance && (
                      <button style={{ ...S.btn, ...S.btnSuccess, ...S.btnSm }}
                        onClick={() => handleAdvance(p.id, p.stationType)}>
                        <ArrowRight size={10} /> {isLinear ? 'Return' : nextStation(p.stationType)}
                      </button>
                    )}
                  </>
                )}

                {isAtOrderStation && hasActiveOrders && isLinear && (
                  <button style={{ ...S.btn, ...S.btnSuccess, ...S.btnSm }}
                    onClick={() => { completeCurrentOrder(p.id); showToast('Order completed', 'success'); }}>
                    <CheckCircle size={10} /> Complete
                  </button>
                )}

                {isAtReturnConsult && (
                  <>
                    <button style={{ ...S.btn, ...S.btnPrimary, ...S.btnSm }}
                      onClick={() => { transferPatient(p.id, 'Pharmacy'); showToast('Sent to Pharmacy', 'success'); }}>
                      <Pill size={10} /> Pharmacy
                    </button>
                    <button style={{ ...S.btn, ...S.btnOutline, ...S.btnSm }}
                      onClick={() => { transferPatient(p.id, 'Billing'); showToast('Sent to Billing', 'success'); }}>
                      <CreditCard size={10} /> Billing
                    </button>
                  </>
                )}

                {showAdvance && !isAtConsult && !isAtOrderStation && !isAtReturnConsult && (
                  nextStation(p.stationType) === 'Consult' ? (
                    <button style={{ ...S.btn, ...S.btnSuccess, ...S.btnSm }}
                      onClick={() => handleAdvance(p.id, p.stationType)}>
                      <DoorOpen size={10} /> Assign Room
                    </button>
                  ) : (
                    <button style={{ ...S.btn, ...S.btnSuccess, ...S.btnSm }}
                      onClick={() => handleAdvance(p.id, p.stationType)}>
                      {nextStation(p.stationType) ? (
                        <><ArrowRight size={10} /> {nextStation(p.stationType)}</>
                      ) : (
                        <><CheckCircle size={10} /> Complete</>
                      )}
                    </button>
                  )
                )}
              </>
            )}

            {/* COMPLETED */}
            {p.status === 'COMPLETED' && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--color-success)', fontWeight: 600 }}>
                <Check size={11} /> Done
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════
  //  MONITOR DISPLAY — Room/Station Picker + Open in New Tab
  //  Each room/station gets its own dedicated monitor display
  // ═══════════════════════════════════════════════════

  const openMonitor = (stationKey: string) => {
    const url = `/provider/queue/monitor/${encodeURIComponent(stationKey)}?tenant=${encodeURIComponent(tenantId)}`;
    window.open(url, `qm-${stationKey}`, 'noopener');
  };

  const renderMonitorDisplay = () => {
    // Count patients per station for preview
    const activePatients = tenantQueuePatients.filter(
      p => p.status !== 'COMPLETED' && p.status !== 'NO_SHOW' && p.stationType !== 'Done'
    );
    const countByStation = (st: StationType) => activePatients.filter(p => p.stationType === st).length;
    const countByRoom = (roomId: string, st: StationType) => activePatients.filter(p => p.stationType === st && p.consultRoomId === roomId).length;
    const attendingByStation = (st: StationType) => activePatients.filter(p => p.stationType === st && p.status === 'IN_SESSION').length;
    const attendingByRoom = (roomId: string, st: StationType) => activePatients.filter(p => p.stationType === st && p.consultRoomId === roomId && p.status === 'IN_SESSION').length;

    // Build display cards
    type MonitorCard = { key: string; icon: React.ReactNode; label: string; sublabel: string; count: number; attending: number; status?: string; doctorName?: string; specialty?: string };
    const cards: MonitorCard[] = [];

    // Non-consult stations
    const stationList: { st: StationType; icon: React.ReactNode }[] = [
      { st: 'Check-In', icon: <UserPlus size={20} /> },
      { st: 'Triage', icon: <Stethoscope size={20} /> },
    ];
    for (const { st, icon } of stationList) {
      cards.push({ key: st, icon, label: st, sublabel: '', count: countByStation(st), attending: attendingByStation(st) });
    }

    // Consult rooms — Consult + Return-Consult share the same physical room & doctor
    for (const room of tenantConsultRooms) {
      const consultCount = countByRoom(room.id, 'Consult');
      const returnCount = room.handlesReturn ? countByRoom(room.id, 'Return-Consult') : 0;
      const consultAttending = attendingByRoom(room.id, 'Consult');
      const returnAttending = room.handlesReturn ? attendingByRoom(room.id, 'Return-Consult') : 0;
      cards.push({
        key: room.id,
        icon: <DoorOpen size={20} />,
        label: room.name,
        sublabel: `${room.doctorName} • ${room.specialty}`,
        doctorName: room.doctorName,
        specialty: room.specialty,
        count: consultCount + returnCount,
        attending: consultAttending + returnAttending,
        status: room.status,
      });
    }

    // Lab / Imaging / Pharmacy / Billing
    const postStations: { st: StationType; icon: React.ReactNode }[] = [
      { st: 'Lab', icon: <FlaskConical size={20} /> },
      { st: 'Imaging', icon: <Layers size={20} /> },
      { st: 'Pharmacy', icon: <Pill size={20} /> },
      { st: 'Billing', icon: <CreditCard size={20} /> },
    ];
    for (const { st, icon } of postStations) {
      if (!labEnabled && LAB_STATIONS.includes(st)) continue;
      cards.push({ key: st, icon, label: st, sublabel: '', count: countByStation(st), attending: attendingByStation(st) });
    }

    return (
      <div>
        {/* Explanation */}
        <div style={{ marginBottom: 20, padding: '16px 20px', background: 'var(--color-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Tv size={20} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>Station Displays</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5, margin: 0 }}>
            Each station and consultation room has its own dedicated display. Click <strong>"Open Display"</strong> to launch
            the queue monitor in a new tab — drag it to a connected monitor to display at the station.
            The display shows ticket numbers only (no patient names) and updates in real-time.
          </p>
        </div>

        {/* Grid of monitor cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {cards.map(card => {
            const isOnBreak = card.status === 'On Break';
            const isClosed = card.status === 'Closed';
            return (
              <div key={card.key} style={{
                background: 'var(--color-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)',
                padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12,
                opacity: isClosed ? 0.5 : 1,
              }}>
                {/* Card header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isOnBreak ? '#fef3c7' : isClosed ? '#fee2e2' : 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                    color: isOnBreak ? '#92400e' : isClosed ? '#991b1b' : 'var(--color-primary)',
                  }}>
                    {card.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {card.label}
                      {isOnBreak && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 8, background: '#fef3c7', color: '#92400e' }}><Coffee size={9} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />Break</span>}
                      {isClosed && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 8, background: '#fee2e2', color: '#991b1b' }}>Closed</span>}
                    </div>
                    {card.sublabel && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                        <Stethoscope size={11} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text)' }}>{card.doctorName ?? card.sublabel}</span>
                        {card.specialty && <span style={S.roomSpecialty}>{card.specialty}</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {card.attending > 0 && (
                    <div style={{ flex: 1, padding: '8px 12px', background: 'color-mix(in srgb, var(--color-success) 10%, var(--color-background))', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-success)', fontFamily: 'monospace' }}>{card.attending}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Attending</div>
                    </div>
                  )}
                  <div style={{ flex: 1, padding: '8px 12px', background: 'var(--color-background)', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', fontFamily: 'monospace' }}>{card.count - card.attending}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>In Queue</div>
                  </div>
                  <div style={{ flex: 1, padding: '8px 12px', background: 'var(--color-background)', borderRadius: 8, textAlign: 'center', borderLeft: '2px solid var(--color-border)' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{card.count}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total</div>
                  </div>
                </div>

                {/* Open button */}
                <button
                  onClick={() => openMonitor(card.key)}
                  disabled={isClosed}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '10px 16px', borderRadius: 8, border: 'none', cursor: isClosed ? 'not-allowed' : 'pointer',
                    background: isClosed ? 'var(--color-gray-100, #e5e7eb)' : '#1e293b', color: isClosed ? '#9ca3af' : '#e2e8f0',
                    fontWeight: 700, fontSize: 13, transition: 'all .15s',
                  }}
                >
                  <ExternalLink size={14} /> Open Display
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════
  //  LINEAR MODE: Swim Lane Kanban
  //  Complete → auto-advance to next lane
  // ═══════════════════════════════════════════════════

  /**
   * Render a Consult or Return-Consult station as room sub-lanes.
   * Ghost cards show patients from the OTHER queue type (same room) so
   * staff can see the real queue depth the doctor faces in each room.
   */
  const renderRoomLane = (station: 'Consult' | 'Return-Consult', patients: QueuePatient[]) => {
    const active = patients.filter((p) => p.status !== 'COMPLETED' && p.status !== 'NO_SHOW');
    const isReturn = station === 'Return-Consult';
    const applicableRooms = tenantConsultRooms.filter(r => isReturn ? r.handlesReturn : true);

    // The "other" queue that shares the same room
    const otherStation: StationType = isReturn ? 'Consult' : 'Return-Consult';
    const otherPatients = (byStation.get(otherStation) ?? []).filter(p => p.status !== 'COMPLETED' && p.status !== 'NO_SHOW');

    // Group patients by room
    const byRoom = new Map<string, QueuePatient[]>();
    const otherByRoom = new Map<string, QueuePatient[]>();
    const unassigned: QueuePatient[] = [];
    for (const p of active) {
      if (p.consultRoomId) {
        if (!byRoom.has(p.consultRoomId)) byRoom.set(p.consultRoomId, []);
        byRoom.get(p.consultRoomId)!.push(p);
      } else {
        unassigned.push(p);
      }
    }
    for (const p of otherPatients) {
      if (p.consultRoomId) {
        if (!otherByRoom.has(p.consultRoomId)) otherByRoom.set(p.consultRoomId, []);
        otherByRoom.get(p.consultRoomId)!.push(p);
      }
    }

    const grpAttending = active.filter(p => p.status === 'IN_SESSION').length;
    const grpQueued = active.length - grpAttending;

    return (
      <div style={{ ...S.lane, minWidth: 260, maxWidth: 320, flex: '0 0 280px' }}>
        <div style={S.roomGroupHeader}>
          <span style={S.roomGroupTitle}>
            {stationIcon(station)} {isReturn ? 'Return Consult' : 'Consultation'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {grpAttending > 0 && (
              <span style={{ ...S.laneBadge, background: 'var(--color-success)', color: '#fff', fontSize: 10 }} title={`${grpAttending} attending`}>
                {grpAttending} <Play size={8} style={{ display: 'inline', verticalAlign: 'middle' }} />
              </span>
            )}
            <span style={{ ...S.laneBadge, background: 'var(--color-primary)', color: '#fff' }}>
              {grpQueued}
            </span>
          </div>
        </div>
        <div style={{ overflowY: 'auto' as const, flex: 1, maxHeight: 'calc(100vh - 320px)' }}>
          {applicableRooms.map((room) => {
            const roomPatients = byRoom.get(room.id) ?? [];
            const ghostPatients = otherByRoom.get(room.id) ?? [];
            const rmAttending = roomPatients.filter(p => p.status === 'IN_SESSION').length;
            const rmQueued = roomPatients.length - rmAttending;
            const isOnBreak = room.status === 'On Break';
            const isClosed = room.status === 'Closed';
            const roomEmpty = roomPatients.length === 0 && ghostPatients.length === 0;
            return (
              <div key={room.id} style={S.roomSubLane}>
                {/* Room header card */}
                <div style={S.roomSubHeader}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' as const }}>
                        <DoorOpen size={13} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                        <span style={S.roomLabel}>{room.name}</span>
                        {isOnBreak && <span style={{ ...S.roomStatusBadge, background: '#fef3c7', color: '#92400e' }}><Coffee size={8} /> Break</span>}
                        {isClosed && <span style={{ ...S.roomStatusBadge, background: '#fee2e2', color: '#991b1b' }}>Closed</span>}
                      </div>
                      <div style={S.roomDoctor}>
                        <Stethoscope size={9} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.doctorName}</span>
                        <span style={S.roomSpecialty}>{room.specialty}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 8 }}>
                      {ghostPatients.length > 0 && (
                        <span style={{
                          fontSize: 8, fontWeight: 700, padding: '2px 5px', borderRadius: 5,
                          background: isReturn ? 'rgba(124,58,237,0.12)' : 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                          color: isReturn ? '#7c3aed' : 'var(--color-primary)',
                          border: `1px dashed ${isReturn ? '#7c3aed' : 'var(--color-primary)'}`,
                          lineHeight: 1, whiteSpace: 'nowrap' as const,
                        }}>
                          +{ghostPatients.length} {isReturn ? 'con' : 'ret'}
                        </span>
                      )}
                      {rmAttending > 0 && (
                        <span style={{ ...S.roomBadge, background: 'var(--color-success)', fontSize: 9, padding: '1px 6px' }} title={`${rmAttending} attending`}>
                          {rmAttending}<Play size={7} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 1 }} />
                        </span>
                      )}
                      <span style={{ ...S.roomBadge, fontSize: 9, padding: '1px 6px' }}>{rmQueued}</span>
                    </div>
                  </div>
                </div>

                {/* Room body — patients */}
                <div style={S.roomCardBody}>
                  {/* Ghost cards */}
                  {ghostPatients.map((p) => (
                    <div key={`ghost-${p.id}`} style={{
                      opacity: 0.35, pointerEvents: 'none', padding: '4px 8px',
                      borderRadius: 6, border: '1px dashed var(--color-border)', background: 'var(--color-surface)',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <span style={{ ...S.ticket, fontSize: 10 }}>{p.ticketNumber}</span>
                      <span style={{ fontSize: 10, color: 'var(--color-text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.patientName}</span>
                      <span style={{ fontSize: 7, fontWeight: 700, padding: '1px 4px', borderRadius: 4,
                        background: isReturn ? 'var(--color-primary-light)' : '#7c3aed',
                        color: isReturn ? 'var(--color-primary)' : '#ede9fe',
                      }}>
                        {isReturn ? 'CON' : 'RET'}
                      </span>
                    </div>
                  ))}

                  {/* Actual patients */}
                  {roomEmpty ? (
                    <div style={{ ...S.empty, padding: 8, fontSize: 10 }}>{isOnBreak ? 'On break' : isClosed ? 'Closed' : 'No patients'}</div>
                  ) : (
                    roomPatients.map((p) => <PatientCard key={p.id} p={p} showAdvance />)
                  )}
                </div>
              </div>
            );
          })}
          {unassigned.length > 0 && (
            <div style={S.unassignedSection}>
              <div style={S.unassignedLabel}>
                <Clock size={11} /> Unassigned ({unassigned.length})
              </div>
              {unassigned.map((p) => <PatientCard key={p.id} p={p} showAdvance />)}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLinear = () => (
    <div style={S.kanban}>
      {visibleStations.map((station, i) => {
        const patients = byStation.get(station) ?? [];
        const isDone = station === 'Done';
        const active = isDone ? patients : patients.filter((p) => p.status !== 'COMPLETED' && p.status !== 'NO_SHOW');

        // Use room-based rendering for Consult and Return-Consult
        if (station === 'Consult' || station === 'Return-Consult') {
          return (
            <div key={station} style={{ display: 'flex', alignItems: 'flex-start' }}>
              {renderRoomLane(station, patients)}
              {i < visibleStations.length - 1 && (
                <div style={S.arrow}><ChevronRight size={18} /></div>
              )}
            </div>
          );
        }

        const stAttending = active.filter(p => p.status === 'IN_SESSION').length;
        const stQueued = active.length - stAttending;

        return (
          <div key={station} style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={S.lane}>
              <div style={S.laneHeader}>
                <span style={S.laneTitle}>
                  {stationIcon(station)} {station}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {stAttending > 0 && (
                    <span style={{ ...S.laneBadge, background: 'var(--color-success)', color: '#fff', fontSize: 10 }} title={`${stAttending} attending`}>
                      {stAttending} <Play size={8} style={{ display: 'inline', verticalAlign: 'middle' }} />
                    </span>
                  )}
                  <span style={{ ...S.laneBadge, background: isDone ? 'var(--color-success)' : 'var(--color-primary)', color: '#fff' }}>
                    {stQueued}
                  </span>
                </div>
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

  /**
   * Multi-stream: Render Consult or Return-Consult as 1 lane PER ROOM (not grouped).
   * Each room gets its own independent lane with ghost cards from the other queue.
   * Returns a fragment with multiple lanes — the caller handles arrows.
   */
  const renderRoomLanes = (station: 'Consult' | 'Return-Consult', patients: QueuePatient[], section: MSSection) => {
    const isReturn = station === 'Return-Consult';
    const applicableRooms = tenantConsultRooms.filter(r => isReturn ? r.handlesReturn : true);
    const otherStation: StationType = isReturn ? 'Consult' : 'Return-Consult';
    const otherPatients = (byStation.get(otherStation) ?? []).filter(p => p.status !== 'COMPLETED' && p.status !== 'NO_SHOW');

    const byRoom = new Map<string, QueuePatient[]>();
    const otherByRoom = new Map<string, QueuePatient[]>();
    const unassigned: QueuePatient[] = [];
    for (const p of patients) {
      if (p.consultRoomId) {
        if (!byRoom.has(p.consultRoomId)) byRoom.set(p.consultRoomId, []);
        byRoom.get(p.consultRoomId)!.push(p);
      } else {
        unassigned.push(p);
      }
    }
    for (const p of otherPatients) {
      if (p.consultRoomId) {
        if (!otherByRoom.has(p.consultRoomId)) otherByRoom.set(p.consultRoomId, []);
        otherByRoom.get(p.consultRoomId)!.push(p);
      }
    }

    return (
      <>
        {applicableRooms.map((room, ri) => {
          const rp = byRoom.get(room.id) ?? [];
          const ghostPts = otherByRoom.get(room.id) ?? [];
          const isOnBreak = room.status === 'On Break';
          const isClosed = room.status === 'Closed';
          const msRmAttending = rp.filter(p => p.status === 'IN_SESSION').length;
          const msRmQueued = rp.length - msRmAttending;

          return (
            <div key={room.id} style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ ...S.lane, minWidth: 180, maxWidth: 220, flex: '0 0 200px' }}>
                {/* Room header */}
                <div style={{
                  padding: '8px 10px', borderBottom: '1px solid var(--color-border)',
                  position: 'sticky' as const, top: 0, zIndex: 2,
                  borderRadius: 'var(--radius) var(--radius) 0 0',
                  background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-surface))',
                }}>
                  {/* Row 1: Room name + count badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <DoorOpen size={12} style={{ flexShrink: 0, color: 'var(--color-primary)' }} />
                    <span style={{ fontWeight: 700, fontSize: 11, color: 'var(--color-text)', whiteSpace: 'nowrap', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{room.name}</span>
                    {isOnBreak && <span style={{ ...S.roomStatusBadge, background: '#fef3c7', color: '#92400e', fontSize: 8, padding: '1px 4px' }}><Coffee size={7} /></span>}
                    {isClosed && <span style={{ ...S.roomStatusBadge, background: '#fee2e2', color: '#991b1b', fontSize: 8, padding: '1px 4px' }}>Off</span>}
                    {ghostPts.length > 0 && (
                      <span style={{
                        fontSize: 8, fontWeight: 700, padding: '1px 4px', borderRadius: 4,
                        background: isReturn ? 'rgba(124,58,237,0.12)' : 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                        color: isReturn ? '#7c3aed' : 'var(--color-primary)',
                        border: `1px dashed ${isReturn ? '#7c3aed' : 'var(--color-primary)'}`,
                        lineHeight: 1, whiteSpace: 'nowrap' as const,
                      }}>
                        +{ghostPts.length}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                      {msRmAttending > 0 && (
                        <span style={{ ...S.roomBadge, background: 'var(--color-success)', fontSize: 9, padding: '1px 5px' }}>
                          {msRmAttending}<Play size={6} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 1 }} />
                        </span>
                      )}
                      <span style={{ ...S.roomBadge, fontSize: 9, padding: '1px 5px' }}>{msRmQueued}</span>
                    </span>
                  </div>
                  {/* Row 2: Doctor + specialty */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
                    <Stethoscope size={8} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                    <span style={{ fontSize: 9, fontWeight: 500, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.doctorName}</span>
                    <span style={{ ...S.roomSpecialty, fontSize: 7, padding: '0px 4px' }}>{room.specialty}</span>
                  </div>
                </div>
                <div style={S.laneBody}>
                  {/* Ghost cards from the other queue sharing this room */}
                  {ghostPts.map((p) => (
                    <div key={`ghost-${p.id}`} style={{
                      ...S.card, opacity: 0.35, pointerEvents: 'none', padding: '4px 8px',
                      borderStyle: 'dashed', background: 'var(--color-surface)', gap: 2,
                    }}>
                      <div style={{ ...S.cardRow, gap: 4 }}>
                        <span style={{ ...S.ticket, fontSize: 10 }}>{p.ticketNumber}</span>
                        <span style={{ ...S.name, fontSize: 10, color: 'var(--color-text-muted)' }}>{p.patientName}</span>
                        <span style={{ fontSize: 7, fontWeight: 700, padding: '1px 4px', borderRadius: 3,
                          background: isReturn ? 'var(--color-primary-light)' : '#7c3aed',
                          color: isReturn ? 'var(--color-primary)' : '#ede9fe',
                        }}>
                          {isReturn ? 'CONSULT' : 'RETURN'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {rp.length === 0 && ghostPts.length === 0 ? (
                    <div style={S.empty}>{isOnBreak ? 'On break' : isClosed ? 'Closed' : 'Empty'}</div>
                  ) : rp.map((p) => <PatientCard key={p.id} p={p} showAdvance section={section} />)}
                </div>
              </div>
              {/* Divider between rooms — but not after the last room */}
              {ri < applicableRooms.length - 1 && (
                <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--color-border)', margin: '0 2px', opacity: 0.5 }} />
              )}
            </div>
          );
        })}
        {unassigned.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ ...S.lane, minWidth: 160, maxWidth: 200, flex: '0 0 180px' }}>
              <div style={S.laneHeader}>
                <span style={S.laneTitle}><Clock size={12} /> Unassigned</span>
                <span style={{ ...S.laneBadge, background: 'var(--color-warning)', color: '#fff' }}>{unassigned.length}</span>
              </div>
              <div style={S.laneBody}>
                {unassigned.map((p) => <PatientCard key={p.id} p={p} showAdvance section={section} />)}
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // Mini swim lane for Section 1 or 3
  const renderMiniLanes = (stations: StationType[], patients: QueuePatient[], section: MSSection) => {
    const grouped = new Map<StationType, QueuePatient[]>();
    for (const st of stations) grouped.set(st, []);
    for (const p of patients) {
      const st = stations.includes(p.stationType) ? p.stationType : stations[0];
      grouped.get(st)?.push(p);
    }
    return (
      <div style={S.miniLanes}>
        {stations.map((station, i) => {
          const stPatients = grouped.get(station) ?? [];

          // Consult / Return-Consult: 1 lane per room
          if (station === 'Consult' || station === 'Return-Consult') {
            return (
              <React.Fragment key={station}>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  {renderRoomLanes(station, stPatients, section)}
                </div>
                {i < stations.length - 1 && <div style={S.arrow}><ChevronRight size={16} /></div>}
              </React.Fragment>
            );
          }

          const msStAtt = stPatients.filter(p => p.status === 'IN_SESSION').length;
          const msStQ = stPatients.length - msStAtt;

          return (
            <div key={station} style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ ...S.lane, minWidth: 180, maxWidth: 240, flex: '0 0 200px' }}>
                <div style={S.laneHeader}>
                  <span style={S.laneTitle}>{stationIcon(station)} {station}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {msStAtt > 0 && (
                      <span style={{ ...S.laneBadge, background: 'var(--color-success)', color: '#fff', fontSize: 10 }} title={`${msStAtt} attending`}>
                        {msStAtt} <Play size={7} style={{ display: 'inline', verticalAlign: 'middle' }} />
                      </span>
                    )}
                    <span style={{ ...S.laneBadge, background: 'var(--color-primary)', color: '#fff' }}>{msStQ}</span>
                  </div>
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
                              background: ord.status === 'in-progress' ? 'var(--color-info-light)' : ord.status === 'queued' ? '#fef9c3' : '#e5e7eb',
                              color: ord.status === 'in-progress' ? 'var(--color-info-dark)' : ord.status === 'queued' ? '#a16207' : '#6b7280',
                            }}>
                              {ord.status === 'in-progress' ? 'In Progress' : ord.status === 'queued' ? 'Waiting' : ord.status}
                            </span>
                            <span style={{ ...S.wait, color: waitColor(p.waitMinutes) }}>
                              <Clock size={10} /> +{p.waitMinutes}m
                            </span>
                          </div>
                          {/* All orders for this patient shown as chips */}
                          <div style={S.orderChipRow}>
                            {p.doctorOrders.map((o) => {
                              const isThis = o.id === ord.id;
                              const bg = o.status === 'completed' ? '#dcfce7' : o.status === 'in-progress' ? 'var(--color-info-light)' : isThis ? '#fef9c3' : '#f3f4f6';
                              const fg = o.status === 'completed' ? 'var(--color-success-dark)' : o.status === 'in-progress' ? 'var(--color-info-dark)' : isThis ? '#a16207' : '#6b7280';
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
                            {(ord.status === 'queued' || ord.status === 'in-progress') && (
                              <button
                                style={{ ...S.btn, ...S.btnGhost, ...S.btnSm }}
                                title="Move to bottom of queue — patient is at another station"
                                onClick={() => { deferOrder(p.id, ord.id); showToast(`${p.ticketNumber} deferred`, 'info'); }}
                              >
                                <ArrowDown size={11} /> Defer
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
              <span key={p.id} style={{ fontSize: 11, padding: '4px 10px', background: '#dcfce7', color: 'var(--color-success-dark)', borderRadius: 10, fontWeight: 600 }}>
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
            onClick={() => { setViewMode('queue'); if (queueMode !== 'LINEAR') toggleQueueMode(); }}
            style={{ ...S.modeBtn, background: viewMode === 'queue' && queueMode === 'LINEAR' ? 'var(--color-primary)' : 'transparent', color: viewMode === 'queue' && queueMode === 'LINEAR' ? '#fff' : 'var(--color-text-muted)' }}
          >
            <LayoutList size={14} /> Swim Lane
          </button>
          <button
            onClick={() => { setViewMode('queue'); if (queueMode !== 'MULTI_STREAM') toggleQueueMode(); }}
            style={{ ...S.modeBtn, background: viewMode === 'queue' && queueMode === 'MULTI_STREAM' ? 'var(--color-primary)' : 'transparent', color: viewMode === 'queue' && queueMode === 'MULTI_STREAM' ? '#fff' : 'var(--color-text-muted)' }}
          >
            <GitBranch size={14} /> Multi-Stream
          </button>
          <button
            onClick={() => setViewMode('monitor')}
            style={{ ...S.modeBtn, background: viewMode === 'monitor' ? '#1e293b' : 'transparent', color: viewMode === 'monitor' ? '#fff' : 'var(--color-text-muted)' }}
          >
            <Tv size={14} /> Station Displays
          </button>
        </div>
      </div>

      {viewMode === 'monitor' ? (
        /* ── Monitor Display View ── */
        renderMonitorDisplay()
      ) : (
        /* ── Management View ── */
        <>
          {/* Stats */}
          <div style={S.statsRow}>
            <div style={S.statCard}>
              <span style={S.statLabel}>In Queue</span>
              <span style={S.statValue}>{tenantQueueStats.totalInQueue}</span>
            </div>
            <div style={S.statCard}>
              <span style={S.statLabel}>Avg Wait</span>
              <span style={S.statValue}>{tenantQueueStats.avgWaitTime}m</span>
            </div>
            <div style={S.statCard}>
              <span style={S.statLabel}>Longest Wait</span>
              <span style={{ ...S.statValue, color: tenantQueueStats.longestWait > 20 ? 'var(--color-error)' : 'var(--color-text)' }}>
                {tenantQueueStats.longestWait}m
              </span>
            </div>
            <div style={S.statCard}>
              <span style={S.statLabel}>Completed</span>
              <span style={{ ...S.statValue, color: 'var(--color-success)' }}>{tenantQueueStats.completedToday}</span>
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
        </>
      )}

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

      {/* Assign to Consultation Room Modal */}
      {assignRoomFor && (
        <div style={S.modalOverlay} onClick={() => setAssignRoomFor(null)}>
          <div style={{ ...S.modal, maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={S.modalTitle}>Assign to Consultation Room</span>
              <button style={{ ...S.btn, ...S.btnGhost }} onClick={() => setAssignRoomFor(null)}><X size={16} /></button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 16 }}>
              Select a consultation room for <strong>{assignRoomFor.patientName}</strong>. The patient will be queued at the selected room.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {tenantConsultRooms.map((room) => {
                const consultPts = tenantQueuePatients.filter(
                  p => p.stationType === 'Consult' && p.consultRoomId === room.id && p.status !== 'COMPLETED' && p.status !== 'NO_SHOW'
                );
                const returnPts = tenantQueuePatients.filter(
                  p => p.stationType === 'Return-Consult' && p.consultRoomId === room.id && p.status !== 'COMPLETED' && p.status !== 'NO_SHOW'
                );
                const isOnBreak = room.status === 'On Break';
                const isClosed = room.status === 'Closed';
                const consultAttending = consultPts.filter(p => p.status === 'IN_SESSION').length;
                const consultWaiting = consultPts.filter(p => p.status === 'QUEUED' || p.status === 'READY').length;
                const returnAttending = returnPts.filter(p => p.status === 'IN_SESSION').length;
                const returnWaiting = returnPts.filter(p => p.status === 'QUEUED' || p.status === 'READY').length;
                const totalAttending = consultAttending + returnAttending;
                const totalWaiting = consultWaiting + returnWaiting;
                const totalAll = totalAttending + totalWaiting;

                return (
                  <button
                    key={room.id}
                    disabled={isClosed}
                    onClick={() => handleAssignRoom(room.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                      borderRadius: 10, border: '1px solid var(--color-border)', cursor: isClosed ? 'not-allowed' : 'pointer',
                      background: isClosed ? 'var(--color-gray-100, #f3f4f6)' : 'var(--color-background)',
                      transition: 'all .15s', textAlign: 'left', width: '100%',
                      opacity: isClosed ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => { if (!isClosed) e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'color-mix(in srgb, var(--color-primary) 5%, var(--color-background))'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = isClosed ? 'var(--color-gray-100, #f3f4f6)' : 'var(--color-background)'; }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      background: isOnBreak ? '#fef3c7' : 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                      color: isOnBreak ? '#92400e' : 'var(--color-primary)',
                    }}>
                      <DoorOpen size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {room.name}
                        {isOnBreak && <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 6, background: '#fef3c7', color: '#92400e' }}><Coffee size={8} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />Break</span>}
                        {isClosed && <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 6, background: '#fee2e2', color: '#991b1b' }}>Closed</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                        <Stethoscope size={11} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text)' }}>{room.doctorName}</span>
                        <span style={S.roomSpecialty}>{room.specialty}</span>
                      </div>
                      {/* Breakdown: Consult + Return-Consult */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 5 }}>
                        <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 5, background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }}>
                          Consult: {consultAttending > 0 ? `${consultAttending} in session` : ''}{consultAttending > 0 && consultWaiting > 0 ? ' · ' : ''}{consultWaiting > 0 ? `${consultWaiting} queued` : ''}{consultAttending === 0 && consultWaiting === 0 ? 'none' : ''}
                        </span>
                        {room.handlesReturn && (
                          <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 5, background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }}>
                            Return: {returnAttending > 0 ? `${returnAttending} in session` : ''}{returnAttending > 0 && returnWaiting > 0 ? ' · ' : ''}{returnWaiting > 0 ? `${returnWaiting} queued` : ''}{returnAttending === 0 && returnWaiting === 0 ? 'none' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0, alignItems: 'flex-end' }}>
                      {totalAttending > 0 && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: 'color-mix(in srgb, var(--color-success) 15%, var(--color-background))', color: 'var(--color-success)' }}>
                          {totalAttending} attending
                        </span>
                      )}
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: totalWaiting > 3 ? 'color-mix(in srgb, var(--color-warning) 15%, var(--color-background))' : 'var(--color-gray-100, #f3f4f6)', color: totalWaiting > 3 ? 'var(--color-warning)' : 'var(--color-text-muted)' }}>
                        {totalWaiting} waiting
                      </span>
                      {totalAll > 0 && (
                        <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--color-text-muted)' }}>
                          {totalAll} total
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button style={{ ...S.btn, ...S.btnGhost }} onClick={() => setAssignRoomFor(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
