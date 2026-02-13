/**
 * TeleconsultQueue – Full Teleconsult Queue Management for Provider App
 *
 * Session lifecycle (aligned with Patient App + Doctor App):
 *   [Intake form done BEFORE queue — Consult Now: before "Join Queue"; Consult Later: at booking]
 *   in-queue → doctor-assigned → connecting → in-session → wrap-up → completed
 *
 *   in-queue        – Patient in queue (Patient App: "Waiting for Doctor" + timer)
 *   doctor-assigned – Doctor assigned (Doctor App: patient appears in their queue)
 *   connecting      – Doctor joining (Patient App: "Connecting…" animation)
 *   in-session      – Active video call (both apps: video + controls)
 *   wrap-up         – Call ended (Patient App: "Consultation Ended"; Doctor App: post-call summary)
 *   completed       – Done
 *   no-show / cancelled
 */

import { useState, useMemo, type CSSProperties } from 'react';
import {
  Video, VideoOff, Phone, PhoneOff, Clock, User, UserCheck, Users, Activity,
  Coffee, Stethoscope, Building2, Calendar, CalendarClock, Search, Filter,
  Play, CheckCircle, XCircle, AlertTriangle, ArrowRight, RefreshCw,
  Wifi, WifiOff, Signal, Monitor, Plus, ChevronDown, ChevronUp, Eye,
  Clipboard, Heart, MessageSquare, BarChart3, Timer, Zap, UserPlus,
  Circle, PauseCircle, BellRing, ClipboardCheck, Pill, FileText, Loader, PhoneCall, Link2,
} from 'lucide-react';
import { useProvider } from '../context/ProviderContext';
import { useToast } from '../../context/ToastContext';
import type { TeleconsultSession, TeleconsultDoctor, TeleconsultSessionStatus, DoctorTCStatus } from '../types';

type ActiveTab = 'now' | 'later' | 'doctors' | 'schedule';
type SessionFilter = 'all' | TeleconsultSessionStatus;

// ── Style constants ──
const V = {
  bg: 'var(--color-background, #f8fafc)',
  card: '#ffffff',
  border: '#e2e8f0',
  primary: 'var(--color-primary, #2563eb)',
  primaryLight: 'var(--color-primary-light, #dbeafe)',
  success: '#16a34a',
  successLight: '#dcfce7',
  warn: '#f59e0b',
  warnLight: '#fef3c7',
  danger: '#dc2626',
  dangerLight: '#fee2e2',
  info: '#0ea5e9',
  infoLight: '#e0f2fe',
  purple: '#7c3aed',
  purpleLight: '#ede9fe',
  text: '#1e293b',
  textSec: '#64748b',
  textMuted: '#94a3b8',
  radius: '10px',
  radiusSm: '6px',
  shadow: '0 1px 3px rgba(0,0,0,.08)',
  shadowMd: '0 4px 12px rgba(0,0,0,.1)',
};

const S: Record<string, CSSProperties> = {
  page: { padding: '20px 24px', background: V.bg, minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 22, fontWeight: 700, color: V.text, display: 'flex', alignItems: 'center', gap: 10 },
  subtitle: { fontSize: 13, color: V.textSec, fontWeight: 400 },

  // Stats bar
  statsBar: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 },
  statCard: { background: V.card, border: `1px solid ${V.border}`, borderRadius: V.radius, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: V.shadow },
  statIcon: { width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statVal: { fontSize: 22, fontWeight: 700, color: V.text, lineHeight: 1 },
  statLabel: { fontSize: 11, color: V.textSec, marginTop: 2 },

  // Tabs
  tabsBar: { display: 'flex', gap: 4, marginBottom: 16, background: V.card, borderRadius: V.radius, padding: 4, border: `1px solid ${V.border}` },
  tab: { flex: 1, padding: '10px 16px', borderRadius: V.radiusSm, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all .15s', background: 'transparent', color: V.textSec },
  tabActive: { background: V.primary, color: '#fff', boxShadow: V.shadow },

  // Filters
  filterBar: { display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' as const, alignItems: 'center' },
  searchInput: { flex: 1, minWidth: 200, padding: '8px 12px 8px 34px', borderRadius: V.radiusSm, border: `1px solid ${V.border}`, fontSize: 13, outline: 'none', background: V.card },
  filterSelect: { padding: '8px 12px', borderRadius: V.radiusSm, border: `1px solid ${V.border}`, fontSize: 13, background: V.card, cursor: 'pointer' },

  // Session cards
  sessionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 },
  sessionCard: { background: V.card, border: `1px solid ${V.border}`, borderRadius: V.radius, padding: 16, boxShadow: V.shadow, position: 'relative' as const },
  sessionCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  patientName: { fontSize: 15, fontWeight: 700, color: V.text },
  complaint: { fontSize: 12, color: V.textSec, marginTop: 2 },
  sessionMeta: { display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginTop: 8, marginBottom: 10 },
  metaBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 8px', borderRadius: 20, fontWeight: 500 },
  sessionActions: { display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginTop: 10 },

  // Buttons
  btn: { display: 'inline-flex', alignItems: 'center', gap: 5, border: 'none', borderRadius: V.radiusSm, cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '7px 12px', transition: 'all .15s' },
  btnPrimary: { background: V.primary, color: '#fff' },
  btnSuccess: { background: V.success, color: '#fff' },
  btnDanger: { background: V.danger, color: '#fff' },
  btnWarn: { background: V.warn, color: '#fff' },
  btnOutline: { background: 'transparent', border: `1px solid ${V.border}`, color: V.text },
  btnSm: { padding: '5px 10px', fontSize: 11 },

  // Doctor panel
  doctorGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 },
  doctorCard: { background: V.card, border: `1px solid ${V.border}`, borderRadius: V.radius, padding: 16, boxShadow: V.shadow },
  doctorHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  avatar: { width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#fff' },
  doctorName: { fontSize: 14, fontWeight: 700, color: V.text },
  doctorSpec: { fontSize: 12, color: V.textSec },
  doctorStats: { display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: V.textSec },

  // Status badges
  badge: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 },

  // Schedule table
  scheduleTable: { width: '100%', borderCollapse: 'collapse' as const, fontSize: 13 },
  th: { textAlign: 'left' as const, padding: '10px 12px', borderBottom: `2px solid ${V.border}`, color: V.textSec, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const },
  td: { padding: '10px 12px', borderBottom: `1px solid ${V.border}`, color: V.text },

  // Assign modal
  overlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: V.card, borderRadius: V.radius, padding: 24, width: '100%', maxWidth: 480, maxHeight: '80vh', overflow: 'auto' as const, boxShadow: V.shadowMd },
  modalTitle: { fontSize: 16, fontWeight: 700, color: V.text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
};

// ── Status config — aligned with Patient + Doctor App lifecycle ──
// Note: Intake is done BEFORE entering the queue (Consult Now: before "Join Queue"; Consult Later: at booking)
const SESSION_STATUS_CONFIG: Record<TeleconsultSessionStatus, {
  label: string; bg: string; color: string; icon: typeof Clock;
  patientSees: string; doctorSees: string;
}> = {
  'in-queue':         { label: 'In Queue',         bg: V.warnLight,    color: V.warn,      icon: Clock,       patientSees: '"Waiting for Doctor" + timer',     doctorSees: 'Patient in waiting list' },
  'doctor-assigned':  { label: 'Doctor Assigned',  bg: V.purpleLight,  color: V.purple,    icon: UserCheck,   patientSees: 'Still "Waiting for Doctor"',       doctorSees: 'Patient highlighted in queue' },
  'connecting':       { label: 'Connecting',       bg: '#fdf4ff',      color: '#a855f7',   icon: Loader,      patientSees: '"Connecting…" animation',          doctorSees: 'Joining call' },
  'in-session':       { label: 'In Session',       bg: '#dcfce7',      color: V.success,   icon: Video,       patientSees: 'Active video call with doctor',    doctorSees: 'Video call + SOAP / AI / Orders' },
  'wrap-up':          { label: 'Wrap-Up',          bg: V.primaryLight, color: V.primary,   icon: FileText,    patientSees: '"Consultation Ended" screen',      doctorSees: 'Post-call summary — completing notes' },
  'completed':        { label: 'Completed',        bg: '#f0fdf4',      color: '#15803d',   icon: CheckCircle, patientSees: '"Back to Visits" / "Go Home"',     doctorSees: 'Back to waiting room' },
  'no-show':          { label: 'No Show',          bg: V.dangerLight,  color: V.danger,    icon: XCircle,     patientSees: 'Did not connect',                  doctorSees: 'Patient marked absent' },
  'cancelled':        { label: 'Cancelled',        bg: '#f1f5f9',      color: V.textMuted, icon: XCircle,     patientSees: 'Consultation cancelled',           doctorSees: 'Session removed from queue' },
};

const DOCTOR_STATUS_CONFIG: Record<DoctorTCStatus, { label: string; bg: string; color: string; icon: typeof User }> = {
  'available':      { label: 'Available',      bg: V.successLight, color: V.success, icon: UserCheck },
  'in-session':     { label: 'In Session',     bg: '#dcfce7',      color: V.success, icon: Video },
  'on-break':       { label: 'On Break',       bg: V.warnLight,    color: V.warn,    icon: Coffee },
  'clinic-consult': { label: 'Clinic Consult', bg: V.infoLight,    color: V.info,    icon: Stethoscope },
  'rounds':         { label: 'Rounds',         bg: V.purpleLight,  color: V.purple,  icon: Building2 },
  'offline':        { label: 'Offline',        bg: '#f1f5f9',      color: V.textMuted, icon: UserCheck },
  'scheduled':      { label: 'Scheduled',      bg: V.primaryLight, color: V.primary, icon: CalendarClock },
};

// ── Helpers ──
function StatusBadge({ status, config }: { status: string; config: { label: string; bg: string; color: string; icon: typeof Clock } }) {
  const Icon = config.icon;
  return (
    <span style={{ ...S.badge, background: config.bg, color: config.color }}>
      <Icon size={12} /> {config.label}
    </span>
  );
}

function ConnectionBadge({ online, quality }: { online: boolean; quality?: string }) {
  if (!online) return <span style={{ ...S.metaBadge, background: '#f1f5f9', color: V.textMuted }}><WifiOff size={11} /> Offline</span>;
  const q = quality || 'good';
  const colors = q === 'good' ? { bg: V.successLight, c: V.success } : q === 'fair' ? { bg: V.warnLight, c: V.warn } : { bg: V.dangerLight, c: V.danger };
  return <span style={{ ...S.metaBadge, background: colors.bg, color: colors.c }}><Signal size={11} /> {q.charAt(0).toUpperCase() + q.slice(1)}</span>;
}

// ── Main Component ──
export const TeleconsultQueue = () => {
  const {
    tcSessions, tcDoctors, tcStats,
    addTcSession, updateTcSessionStatus, assignTcDoctor, startTcSession, endTcSession,
    markTcNoShow, cancelTcSession, updateTcDoctorStatus, checkInTcDoctor,
  } = useProvider();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>('now');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SessionFilter>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [assignModalSession, setAssignModalSession] = useState<string | null>(null);
  const [addSessionOpen, setAddSessionOpen] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  // New session form
  const [newPatientName, setNewPatientName] = useState('');
  const [newComplaint, setNewComplaint] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('General Practice');
  const [newType, setNewType] = useState<'now' | 'later'>('now');
  const [newPriority, setNewPriority] = useState<'Normal' | 'Urgent' | 'Follow-Up'>('Normal');
  const [newScheduledTime, setNewScheduledTime] = useState('');

  // Doctor status change
  const [doctorStatusModal, setDoctorStatusModal] = useState<string | null>(null);
  const [newDoctorStatus, setNewDoctorStatus] = useState<DoctorTCStatus>('available');
  const [newDoctorActivity, setNewDoctorActivity] = useState('');

  // Notify / message doctor
  const [notifyDoctorModal, setNotifyDoctorModal] = useState<string | null>(null);
  const [notifyMessage, setNotifyMessage] = useState('');
  const [notifyType, setNotifyType] = useState<'sms' | 'in-app' | 'page'>('in-app');
  const [notifyHistory, setNotifyHistory] = useState<{ doctorId: string; message: string; type: string; time: string }[]>([]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    let sessions = tcSessions.filter((s) => {
      if (activeTab === 'now') return s.type === 'now';
      if (activeTab === 'later') return s.type === 'later';
      return true;
    });
    if (statusFilter !== 'all') sessions = sessions.filter((s) => s.status === statusFilter);
    if (specialtyFilter !== 'all') sessions = sessions.filter((s) => s.specialty === specialtyFilter);
    if (search) {
      const q = search.toLowerCase();
      sessions = sessions.filter((s) =>
        s.patientName.toLowerCase().includes(q) ||
        s.chiefComplaint.toLowerCase().includes(q) ||
        (s.assignedDoctorName || '').toLowerCase().includes(q)
      );
    }
    // Sort: urgent first, then by wait time descending
    return sessions.sort((a, b) => {
      if (a.priority === 'Urgent' && b.priority !== 'Urgent') return -1;
      if (b.priority === 'Urgent' && a.priority !== 'Urgent') return 1;
      return b.waitMinutes - a.waitMinutes;
    });
  }, [tcSessions, activeTab, statusFilter, specialtyFilter, search]);

  const specialties = useMemo(() => [...new Set(tcSessions.map((s) => s.specialty))], [tcSessions]);

  // ── Tab-aware session stats (aligned with Patient + Doctor App lifecycle) ──
  // Intake is pre-queue, so not counted here
  const viewStats = useMemo(() => {
    const isSessionTab = activeTab === 'now' || activeTab === 'later';
    const pool = isSessionTab ? tcSessions.filter((s) => s.type === activeTab) : tcSessions;
    const inQueue = pool.filter((s) => s.status === 'in-queue');
    const doctorAssigned = pool.filter((s) => s.status === 'doctor-assigned');
    const connecting = pool.filter((s) => s.status === 'connecting');
    const inSession = pool.filter((s) => s.status === 'in-session');
    const wrapUp = pool.filter((s) => s.status === 'wrap-up');
    const completed = pool.filter((s) => s.status === 'completed');
    const noShow = pool.filter((s) => s.status === 'no-show');
    const preSession = [...inQueue, ...doctorAssigned, ...connecting];
    const waitTimes = preSession.map((s) => s.waitMinutes);
    return {
      inQueue: inQueue.length,
      doctorAssigned: doctorAssigned.length,
      connecting: connecting.length,
      inSession: inSession.length,
      wrapUp: wrapUp.length,
      completed: completed.length,
      noShow: noShow.length,
      avgWait: waitTimes.length > 0 ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : 0,
    };
  }, [tcSessions, activeTab]);

  // Available doctors for assignment
  const availableDoctors = useMemo(() =>
    tcDoctors.filter((d) => d.checkedIn && (d.status === 'available')),
  [tcDoctors]);

  // Scheduled doctors (for schedule tab)
  const scheduledDoctors = useMemo(() =>
    [...tcDoctors].sort((a, b) => a.shiftStart.localeCompare(b.shiftStart)),
  [tcDoctors]);

  // ── Handlers ──
  const handleAddSession = () => {
    if (!newPatientName.trim() || !newComplaint.trim()) return;
    addTcSession({
      patientId: `p-tc-${Date.now()}`,
      patientName: newPatientName.trim(),
      type: newType,
      status: 'in-queue',
      specialty: newSpecialty,
      chiefComplaint: newComplaint.trim(),
      scheduledTime: newType === 'later' ? newScheduledTime : undefined,
      queuedAt: new Date().toISOString(),
      waitMinutes: 0,
      priority: newPriority,
      intakeCompleted: true,
      patientOnline: true,
      connectionQuality: 'good',
    });
    showToast(`${newPatientName} added to ${newType === 'now' ? 'Consult Now' : 'Consult Later'} queue`, 'success');
    setNewPatientName(''); setNewComplaint(''); setAddSessionOpen(false);
  };

  const handleAssign = (doctorId: string) => {
    if (!assignModalSession) return;
    assignTcDoctor(assignModalSession, doctorId);
    const doc = tcDoctors.find((d) => d.id === doctorId);
    showToast(`Assigned ${doc?.name || 'doctor'} to session`, 'success');
    setAssignModalSession(null);
  };

  const handleStartSession = (sessionId: string) => {
    startTcSession(sessionId);
    showToast('Teleconsult session started', 'success');
  };

  const handleEndSession = (sessionId: string) => {
    endTcSession(sessionId);
    showToast('Session completed', 'success');
  };

  const handleNoShow = (sessionId: string) => {
    markTcNoShow(sessionId);
    showToast('Marked as no-show', 'info');
  };

  const handleCancel = (sessionId: string) => {
    cancelTcSession(sessionId);
    showToast('Session cancelled', 'info');
  };

  const handleDoctorStatusChange = () => {
    if (!doctorStatusModal) return;
    updateTcDoctorStatus(doctorStatusModal, newDoctorStatus, newDoctorActivity || undefined);
    showToast('Doctor status updated', 'success');
    setDoctorStatusModal(null);
  };

  const handleCheckIn = (doctorId: string) => {
    checkInTcDoctor(doctorId);
    showToast('Doctor checked in', 'success');
  };

  // Stat card click: set filter (session stats stay on current tab, doctor stats switch to doctors tab)
  const handleStatClick = (statKey: string) => {
    const ensureSessionTab = () => { if (activeTab !== 'now' && activeTab !== 'later') setActiveTab('now'); };
    switch (statKey) {
      case 'in-queue':         ensureSessionTab(); setStatusFilter('in-queue'); break;
      case 'doctor-assigned':  ensureSessionTab(); setStatusFilter('doctor-assigned'); break;
      case 'connecting':       ensureSessionTab(); setStatusFilter('connecting'); break;
      case 'in-session':       ensureSessionTab(); setStatusFilter('in-session'); break;
      case 'wrap-up':          ensureSessionTab(); setStatusFilter('wrap-up'); break;
      case 'completed':        ensureSessionTab(); setStatusFilter('completed'); break;
      case 'no-show':          ensureSessionTab(); setStatusFilter('no-show'); break;
      case 'avg-wait':         ensureSessionTab(); setStatusFilter('all'); break;
      case 'drs-available':
      case 'drs-in-session':
      case 'drs-unavailable':  setActiveTab('doctors'); break;
    }
  };

  // Notify / reach out to doctor
  const handleNotifyDoctor = () => {
    if (!notifyDoctorModal || !notifyMessage.trim()) return;
    const doc = tcDoctors.find((d) => d.id === notifyDoctorModal);
    const entry = {
      doctorId: notifyDoctorModal,
      message: notifyMessage.trim(),
      type: notifyType,
      time: new Date().toISOString(),
    };
    setNotifyHistory((prev) => [entry, ...prev]);
    const typeLabel = notifyType === 'sms' ? 'SMS' : notifyType === 'page' ? 'Page' : 'In-App';
    showToast(`${typeLabel} notification sent to ${doc?.name || 'doctor'}`, 'success');
    setNotifyMessage('');
    setNotifyDoctorModal(null);
  };

  // Notify all available doctors (broadcast)
  const handleBroadcastNotify = (message: string, type: 'sms' | 'in-app' | 'page') => {
    const checkedInDocs = tcDoctors.filter((d) => d.checkedIn);
    const entries = checkedInDocs.map((d) => ({
      doctorId: d.id,
      message,
      type,
      time: new Date().toISOString(),
    }));
    setNotifyHistory((prev) => [...entries, ...prev]);
    const typeLabel = type === 'sms' ? 'SMS' : type === 'page' ? 'Page' : 'In-App';
    showToast(`${typeLabel} broadcast sent to ${checkedInDocs.length} doctor(s)`, 'success');
  };

  // ── Render: Stats Bar ──
  // Session stats are tab-aware (viewStats), doctor stats are always global (tcStats)
  const renderStats = () => (
    <div style={S.statsBar}>
      {[
        { icon: Clock, val: viewStats.inQueue, label: 'In Queue', bg: V.warnLight, color: V.warn, key: 'in-queue' },
        { icon: UserCheck, val: viewStats.doctorAssigned, label: 'Dr Assigned', bg: V.purpleLight, color: V.purple, key: 'doctor-assigned' },
        { icon: Loader, val: viewStats.connecting, label: 'Connecting', bg: '#fdf4ff', color: '#a855f7', key: 'connecting' },
        { icon: Video, val: viewStats.inSession, label: 'In Session', bg: V.successLight, color: V.success, key: 'in-session' },
        { icon: FileText, val: viewStats.wrapUp, label: 'Wrap-Up', bg: V.primaryLight, color: V.primary, key: 'wrap-up' },
        { icon: CheckCircle, val: viewStats.completed, label: 'Completed', bg: '#f0fdf4', color: '#15803d', key: 'completed' },
        { icon: Timer, val: `${viewStats.avgWait}m`, label: 'Avg Wait', bg: '#f0f9ff', color: V.info, key: 'avg-wait' },
        { icon: UserCheck, val: tcStats.doctorsAvailable, label: 'Drs Available', bg: V.successLight, color: V.success, key: 'drs-available' },
        { icon: Activity, val: tcStats.doctorsInSession, label: 'Drs In Session', bg: '#ede9fe', color: V.purple, key: 'drs-in-session' },
      ].map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.key}
            style={{ ...S.statCard, cursor: 'pointer', transition: 'all .15s' }}
            onClick={() => handleStatClick(s.key)}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = V.shadowMd; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = V.shadow; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
            title={`Click to view ${s.label.toLowerCase()}`}
          >
            <div style={{ ...S.statIcon, background: s.bg }}>
              <Icon size={18} color={s.color} />
            </div>
            <div>
              <div style={S.statVal}>{s.val}</div>
              <div style={{ ...S.statLabel, display: 'flex', alignItems: 'center', gap: 3 }}>
                {s.label} <ArrowRight size={9} style={{ opacity: 0.5 }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── Render: Session Card — shows patient/doctor visibility per status ──
  const renderSessionCard = (session: TeleconsultSession) => {
    const cfg = SESSION_STATUS_CONFIG[session.status];
    const isExpanded = expandedSession === session.id;
    const isActive = !['completed', 'no-show', 'cancelled'].includes(session.status);

    return (
      <div key={session.id} style={{
        ...S.sessionCard,
        borderLeft: `4px solid ${cfg.color}`,
        opacity: isActive ? 1 : 0.7,
      }}>
        {/* Header */}
        <div style={S.sessionCardHeader}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={S.patientName}>{session.patientName}</div>
              {session.priority === 'Urgent' && (
                <span style={{ ...S.badge, background: V.dangerLight, color: V.danger }}>
                  <AlertTriangle size={11} /> Urgent
                </span>
              )}
              {session.priority === 'Follow-Up' && (
                <span style={{ ...S.badge, background: V.infoLight, color: V.info }}>
                  <RefreshCw size={11} /> Follow-Up
                </span>
              )}
            </div>
            <div style={S.complaint}>{session.chiefComplaint}</div>
          </div>
          <StatusBadge status={session.status} config={cfg} />
        </div>

        {/* Patient / Doctor visibility — shows what each app displays at this stage */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 8, fontSize: 11,
        }}>
          <div style={{ flex: 1, padding: '5px 8px', borderRadius: V.radiusSm, background: '#f0f9ff', border: '1px solid #bae6fd' }}>
            <span style={{ fontWeight: 600, color: V.info }}>Patient App:</span>{' '}
            <span style={{ color: V.text }}>{cfg.patientSees}</span>
          </div>
          <div style={{ flex: 1, padding: '5px 8px', borderRadius: V.radiusSm, background: '#fdf4ff', border: '1px solid #e9d5ff' }}>
            <span style={{ fontWeight: 600, color: '#a855f7' }}>Doctor App:</span>{' '}
            <span style={{ color: V.text }}>{cfg.doctorSees}</span>
          </div>
        </div>

        {/* Meta */}
        <div style={S.sessionMeta}>
          <span style={{ ...S.metaBadge, background: V.primaryLight, color: V.primary }}>
            <Stethoscope size={11} /> {session.specialty}
          </span>
          <span style={{ ...S.metaBadge, background: V.warnLight, color: V.warn }}>
            <Clock size={11} /> {session.waitMinutes}min wait
          </span>
          <ConnectionBadge online={session.patientOnline} quality={session.connectionQuality} />
          {session.type === 'later' && session.scheduledTime && (
            <span style={{ ...S.metaBadge, background: V.purpleLight, color: V.purple }}>
              <Calendar size={11} /> {new Date(session.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Assigned doctor */}
        {session.assignedDoctorName && (
          <div style={{ fontSize: 12, color: V.textSec, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
            <User size={12} /> <strong>{session.assignedDoctorName}</strong>
            {session.sessionStartedAt && (
              <span style={{ marginLeft: 8, color: V.success, fontSize: 11 }}>
                Started {new Date(session.sessionStartedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        )}

        {/* Expand toggle */}
        {isActive && (
          <button
            style={{ ...S.btn, ...S.btnOutline, ...S.btnSm, width: '100%', justifyContent: 'center', marginTop: 6, marginBottom: 4 }}
            onClick={() => setExpandedSession(isExpanded ? null : session.id)}
          >
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {isExpanded ? 'Less' : 'Details & Actions'}
          </button>
        )}

        {/* Expanded Actions — follow Patient+Doctor lifecycle */}
        {isExpanded && isActive && (
          <div style={S.sessionActions}>
            {/* ① In Queue → patient waiting for doctor (intake already done); provider assigns a doctor */}
            {session.status === 'in-queue' && (
              <>
                {!session.assignedDoctorId ? (
                  <button style={{ ...S.btn, ...S.btnPrimary, ...S.btnSm }}
                    onClick={() => setAssignModalSession(session.id)}>
                    <UserPlus size={12} /> Assign Doctor
                  </button>
                ) : (
                  <button style={{ ...S.btn, ...S.btnSuccess, ...S.btnSm }}
                    onClick={() => updateTcSessionStatus(session.id, 'doctor-assigned')}>
                    <UserCheck size={12} /> Confirm Assignment
                  </button>
                )}
                <button style={{ ...S.btn, ...S.btnDanger, ...S.btnSm }}
                  onClick={() => handleNoShow(session.id)}>
                  <XCircle size={12} /> No Show
                </button>
                <button style={{ ...S.btn, ...S.btnOutline, ...S.btnSm }}
                  onClick={() => handleCancel(session.id)}>
                  <XCircle size={12} /> Cancel
                </button>
              </>
            )}

            {/* ③ Doctor Assigned → doctor sees patient in queue; provider initiates connection */}
            {session.status === 'doctor-assigned' && (
              <>
                <button style={{ ...S.btn, ...S.btnPrimary, ...S.btnSm }}
                  onClick={() => updateTcSessionStatus(session.id, 'connecting')}>
                  <PhoneCall size={12} /> Initiate Connection
                </button>
                {/* Allow re-assignment */}
                <button style={{ ...S.btn, ...S.btnOutline, ...S.btnSm }}
                  onClick={() => setAssignModalSession(session.id)}>
                  <UserPlus size={12} /> Reassign Doctor
                </button>
                <button style={{ ...S.btn, ...S.btnDanger, ...S.btnSm }}
                  onClick={() => handleCancel(session.id)}>
                  <XCircle size={12} /> Cancel
                </button>
              </>
            )}

            {/* ④ Connecting → doctor joining call, patient sees "Connecting…"; provider starts the session */}
            {session.status === 'connecting' && (
              <>
                <button style={{ ...S.btn, ...S.btnSuccess, ...S.btnSm }}
                  onClick={() => handleStartSession(session.id)}>
                  <Video size={12} /> Start Session
                </button>
                <button style={{ ...S.btn, ...S.btnOutline, ...S.btnSm }}
                  onClick={() => updateTcSessionStatus(session.id, 'doctor-assigned')}>
                  <ArrowRight size={12} /> Back to Assigned
                </button>
              </>
            )}

            {/* ⑤ In Session → active video call; provider can trigger wrap-up or end */}
            {session.status === 'in-session' && (
              <>
                <button style={{ ...S.btn, ...S.btnWarn, ...S.btnSm }}
                  onClick={() => updateTcSessionStatus(session.id, 'wrap-up')}>
                  <FileText size={12} /> End Call → Wrap-Up
                </button>
                <button style={{ ...S.btn, ...S.btnSuccess, ...S.btnSm }}
                  onClick={() => handleEndSession(session.id)}>
                  <CheckCircle size={12} /> End & Complete
                </button>
              </>
            )}

            {/* ⑥ Wrap-Up → doctor completing post-call notes; provider marks complete */}
            {session.status === 'wrap-up' && (
              <button style={{ ...S.btn, ...S.btnSuccess, ...S.btnSm }}
                onClick={() => handleEndSession(session.id)}>
                <CheckCircle size={12} /> Complete & Close
              </button>
            )}
          </div>
        )}

        {/* Session ended info */}
        {session.sessionEndedAt && (
          <div style={{ fontSize: 11, color: V.textMuted, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle size={10} /> Ended {new Date(session.sessionEndedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    );
  };

  // ── Render: Doctor Card ──
  const renderDoctorCard = (doc: TeleconsultDoctor) => {
    const cfg = DOCTOR_STATUS_CONFIG[doc.status];
    const initials = doc.name.split(' ').filter((_, i, a) => i === 0 || i === a.length - 1).map((w) => w[0]).join('');
    const avatarColors = ['#2563eb', '#7c3aed', '#0ea5e9', '#16a34a', '#dc2626', '#f59e0b', '#ec4899', '#06b6d4'];
    const avatarBg = avatarColors[doc.id.charCodeAt(doc.id.length - 1) % avatarColors.length];
    const shiftStartTime = new Date(doc.shiftStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const shiftEndTime = new Date(doc.shiftEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <div key={doc.id} style={{
        ...S.doctorCard,
        borderLeft: `4px solid ${cfg.color}`,
        opacity: doc.checkedIn ? 1 : 0.6,
      }}>
        <div style={S.doctorHeader}>
          <div style={{ ...S.avatar, background: avatarBg }}>{initials}</div>
          <div style={{ flex: 1 }}>
            <div style={S.doctorName}>{doc.name}</div>
            <div style={S.doctorSpec}>{doc.specialty}</div>
          </div>
          <StatusBadge status={doc.status} config={cfg} />
        </div>

        {/* Shift info */}
        <div style={{ fontSize: 12, color: V.textSec, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Clock size={12} /> Shift: {shiftStartTime} – {shiftEndTime}
          {doc.breakStart && doc.breakEnd && (
            <span style={{ color: V.warn, marginLeft: 8 }}>
              <Coffee size={11} /> Break: {new Date(doc.breakStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(doc.breakEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Current activity */}
        {doc.currentActivity && (
          <div style={{ fontSize: 12, color: V.primary, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
            <Activity size={12} /> {doc.currentActivity}
          </div>
        )}

        {/* Stats */}
        <div style={S.doctorStats}>
          <span><CheckCircle size={12} /> {doc.sessionsCompleted} completed</span>
          <span><Timer size={12} /> ~{doc.avgSessionMinutes}min avg</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {!doc.checkedIn && (
            <button style={{ ...S.btn, ...S.btnSuccess, ...S.btnSm }}
              onClick={() => handleCheckIn(doc.id)}>
              <ClipboardCheck size={12} /> Check In
            </button>
          )}
          {doc.checkedIn && (
            <button style={{ ...S.btn, ...S.btnOutline, ...S.btnSm }}
              onClick={() => { setDoctorStatusModal(doc.id); setNewDoctorStatus(doc.status); setNewDoctorActivity(doc.currentActivity || ''); }}>
              <RefreshCw size={12} /> Change Status
            </button>
          )}
          {doc.status === 'on-break' && doc.checkedIn && (
            <button style={{ ...S.btn, ...S.btnSuccess, ...S.btnSm }}
              onClick={() => { updateTcDoctorStatus(doc.id, 'available', undefined); showToast(`${doc.name} is now available`, 'success'); }}>
              <Play size={12} /> End Break
            </button>
          )}
          {(doc.status === 'clinic-consult' || doc.status === 'rounds') && doc.checkedIn && (
            <button style={{ ...S.btn, ...S.btnPrimary, ...S.btnSm }}
              onClick={() => { updateTcDoctorStatus(doc.id, 'available', undefined); showToast(`${doc.name} returned to teleconsult`, 'success'); }}>
              <Video size={12} /> Return to TC
            </button>
          )}
          {/* Notify / Reach out */}
          <button style={{ ...S.btn, ...S.btnSm, background: V.infoLight, color: V.info, border: `1px solid ${V.info}22` }}
            onClick={() => { setNotifyDoctorModal(doc.id); setNotifyMessage(''); setNotifyType('in-app'); }}>
            <BellRing size={12} /> Notify
          </button>
          <button style={{ ...S.btn, ...S.btnSm, background: V.purpleLight, color: V.purple, border: `1px solid ${V.purple}22` }}
            onClick={() => { setNotifyDoctorModal(doc.id); setNotifyMessage(''); setNotifyType('sms'); }}>
            <MessageSquare size={12} /> Message
          </button>
        </div>

        {/* Recent notifications for this doctor */}
        {notifyHistory.filter((n) => n.doctorId === doc.id).length > 0 && (
          <div style={{ marginTop: 8, padding: '6px 8px', background: '#f8fafc', borderRadius: V.radiusSm, border: `1px solid ${V.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: V.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>Recent Notifications</div>
            {notifyHistory.filter((n) => n.doctorId === doc.id).slice(0, 2).map((n, i) => (
              <div key={i} style={{ fontSize: 11, color: V.textSec, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                {n.type === 'sms' ? <Phone size={10} /> : n.type === 'page' ? <BellRing size={10} /> : <MessageSquare size={10} />}
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</span>
                <span style={{ color: V.textMuted, fontSize: 10, flexShrink: 0 }}>{new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── Render: Schedule View ──
  const renderScheduleView = () => {
    const todayDocs = scheduledDoctors.filter((d) => {
      const docDate = d.scheduledDate;
      const today = new Date().toISOString().slice(0, 10);
      return docDate === today;
    });
    const futureDocs = scheduledDoctors.filter((d) => {
      const today = new Date().toISOString().slice(0, 10);
      return d.scheduledDate > today;
    });

    const renderTable = (docs: TeleconsultDoctor[], title: string) => (
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: V.text, marginBottom: 10 }}>{title} ({docs.length})</h3>
        {docs.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: V.textMuted, fontSize: 13 }}>No doctors scheduled</div>
        ) : (
          <div style={{ background: V.card, borderRadius: V.radius, border: `1px solid ${V.border}`, overflow: 'hidden' }}>
            <table style={S.scheduleTable}>
              <thead>
                <tr>
                  <th style={S.th}>Doctor</th>
                  <th style={S.th}>Specialty</th>
                  <th style={S.th}>Shift</th>
                  <th style={S.th}>Break</th>
                  <th style={S.th}>Status</th>
                  <th style={S.th}>Completed</th>
                  <th style={S.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => {
                  const cfg = DOCTOR_STATUS_CONFIG[doc.status];
                  return (
                    <tr key={doc.id}>
                      <td style={S.td}>
                        <strong>{doc.name}</strong>
                      </td>
                      <td style={S.td}>{doc.specialty}</td>
                      <td style={S.td}>
                        {new Date(doc.shiftStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                        {new Date(doc.shiftEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={S.td}>
                        {doc.breakStart && doc.breakEnd ? (
                          `${new Date(doc.breakStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${new Date(doc.breakEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        ) : '—'}
                      </td>
                      <td style={S.td}>
                        <StatusBadge status={doc.status} config={cfg} />
                      </td>
                      <td style={S.td}>{doc.sessionsCompleted}</td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {!doc.checkedIn ? (
                            <button style={{ ...S.btn, ...S.btnSuccess, ...S.btnSm }}
                              onClick={() => handleCheckIn(doc.id)}>
                              <ClipboardCheck size={11} /> Check In
                            </button>
                          ) : (
                            <button style={{ ...S.btn, ...S.btnOutline, ...S.btnSm }}
                              onClick={() => { setDoctorStatusModal(doc.id); setNewDoctorStatus(doc.status); setNewDoctorActivity(doc.currentActivity || ''); }}>
                              <RefreshCw size={11} /> Status
                            </button>
                          )}
                          <button style={{ ...S.btn, ...S.btnSm, background: V.infoLight, color: V.info, border: 'none' }}
                            onClick={() => { setNotifyDoctorModal(doc.id); setNotifyMessage(''); setNotifyType('in-app'); }}>
                            <BellRing size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );

    return (
      <div>
        {renderTable(todayDocs, "Today's Schedule")}
        {renderTable(futureDocs, 'Upcoming Schedule')}
      </div>
    );
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div>
          <div style={S.title}>
            <Video size={22} /> Teleconsult Queue Management
          </div>
          <div style={S.subtitle}>Monitor and manage teleconsult sessions — Consult Now & Consult Later</div>

          {/* Lifecycle flow — visual indicator (intake is pre-queue) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 8, flexWrap: 'wrap' }}>
            {/* Pre-queue step shown dimmed */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 3,
              padding: '2px 8px', borderRadius: 12,
              background: '#f1f5f9', color: V.textMuted,
              fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap',
            }}>
              <Clipboard size={10} /> Intake (pre-queue)
            </div>
            <ArrowRight size={10} style={{ color: V.textMuted, margin: '0 2px', flexShrink: 0 }} />
            {/* Active queue lifecycle */}
            {([
              { s: 'in-queue', l: 'In Queue' },
              { s: 'doctor-assigned', l: 'Dr Assigned' },
              { s: 'connecting', l: 'Connecting' },
              { s: 'in-session', l: 'In Session' },
              { s: 'wrap-up', l: 'Wrap-Up' },
              { s: 'completed', l: 'Completed' },
            ] as const).map((step, i) => {
              const c = SESSION_STATUS_CONFIG[step.s];
              const Icon = c.icon;
              return (
                <div key={step.s} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 3,
                    padding: '2px 8px', borderRadius: 12,
                    background: c.bg, color: c.color,
                    fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap',
                  }}>
                    <Icon size={10} /> {step.l}
                  </div>
                  {i < 5 && <ArrowRight size={10} style={{ color: V.textMuted, margin: '0 2px', flexShrink: 0 }} />}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...S.btn, background: V.infoLight, color: V.info, border: `1px solid ${V.info}33` }}
            onClick={() => {
              const msg = 'Patients are waiting for teleconsult. Please check your queue.';
              handleBroadcastNotify(msg, 'in-app');
            }}>
            <BellRing size={14} /> Broadcast All Doctors
          </button>
          <button style={{ ...S.btn, ...S.btnPrimary }} onClick={() => setAddSessionOpen(true)}>
            <Plus size={14} /> New Session
          </button>
        </div>
      </div>

      {/* Stats */}
      {renderStats()}

      {/* Tabs */}
      <div style={S.tabsBar}>
        {([
          { key: 'now' as ActiveTab, label: 'Consult Now', icon: Zap, count: tcStats.nowQueueLength },
          { key: 'later' as ActiveTab, label: 'Consult Later', icon: CalendarClock, count: tcStats.laterQueueLength },
          { key: 'doctors' as ActiveTab, label: 'Doctor Monitor', icon: Stethoscope, count: tcDoctors.filter((d) => d.checkedIn).length },
          { key: 'schedule' as ActiveTab, label: 'Schedule', icon: Calendar, count: tcDoctors.length },
        ]).map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key}
              style={{ ...S.tab, ...(activeTab === t.key ? S.tabActive : {}) }}
              onClick={() => { setActiveTab(t.key); setStatusFilter('all'); setSpecialtyFilter('all'); setSearch(''); }}>
              <Icon size={14} /> {t.label}
              <span style={{
                background: activeTab === t.key ? 'rgba(255,255,255,.25)' : V.border,
                padding: '2px 7px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                marginLeft: 2,
              }}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {/* Filter bar (for session tabs) */}
      {(activeTab === 'now' || activeTab === 'later') && (
        <div style={S.filterBar}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: V.textMuted }} />
            <input
              style={S.searchInput}
              placeholder="Search patient, complaint, doctor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select style={S.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as SessionFilter)}>
            <option value="all">All Status</option>
            <option value="in-queue">In Queue</option>
            <option value="doctor-assigned">Doctor Assigned</option>
            <option value="connecting">Connecting</option>
            <option value="in-session">In Session</option>
            <option value="wrap-up">Wrap-Up</option>
            <option value="completed">Completed</option>
            <option value="no-show">No Show</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select style={S.filterSelect} value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)}>
            <option value="all">All Specialties</option>
            {specialties.map((sp) => <option key={sp} value={sp}>{sp}</option>)}
          </select>
        </div>
      )}

      {/* Content */}
      {(activeTab === 'now' || activeTab === 'later') && (
        <>
          {filteredSessions.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: V.textMuted }}>
              <Video size={32} style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 14 }}>No sessions found</div>
            </div>
          ) : (
            <div style={S.sessionGrid}>
              {filteredSessions.map(renderSessionCard)}
            </div>
          )}
        </>
      )}

      {activeTab === 'doctors' && (
        <div style={S.doctorGrid}>
          {tcDoctors.map(renderDoctorCard)}
        </div>
      )}

      {activeTab === 'schedule' && renderScheduleView()}

      {/* ── Assign Doctor Modal ── */}
      {assignModalSession && (
        <div style={S.overlay} onClick={() => setAssignModalSession(null)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalTitle}>
              <UserPlus size={18} /> Assign Doctor
            </div>
            <p style={{ fontSize: 13, color: V.textSec, marginBottom: 16 }}>
              Select an available doctor for this teleconsult session.
            </p>
            {availableDoctors.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: V.textMuted, fontSize: 13 }}>
                No doctors currently available. Check the Doctor Monitor tab.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {availableDoctors.map((doc) => (
                  <button key={doc.id}
                    style={{
                      ...S.btn, background: V.card, border: `1px solid ${V.border}`, borderRadius: V.radiusSm,
                      padding: '12px 14px', justifyContent: 'space-between', width: '100%',
                    }}
                    onClick={() => handleAssign(doc.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <UserCheck size={16} color={V.success} />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, color: V.text }}>{doc.name}</div>
                        <div style={{ fontSize: 11, color: V.textSec }}>{doc.specialty} · {doc.sessionsCompleted} sessions today</div>
                      </div>
                    </div>
                    <ArrowRight size={14} color={V.textMuted} />
                  </button>
                ))}
              </div>
            )}
            <button style={{ ...S.btn, ...S.btnOutline, marginTop: 16, width: '100%', justifyContent: 'center' }}
              onClick={() => setAssignModalSession(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Add Session Modal ── */}
      {addSessionOpen && (
        <div style={S.overlay} onClick={() => setAddSessionOpen(false)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalTitle}>
              <Plus size={18} /> New Teleconsult Session
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: V.textSec, display: 'block', marginBottom: 4 }}>Type</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['now', 'later'] as const).map((t) => (
                    <button key={t}
                      style={{ ...S.btn, flex: 1, justifyContent: 'center', ...(newType === t ? S.btnPrimary : S.btnOutline) }}
                      onClick={() => setNewType(t)}>
                      {t === 'now' ? <Zap size={13} /> : <CalendarClock size={13} />}
                      {t === 'now' ? 'Consult Now' : 'Consult Later'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: V.textSec, display: 'block', marginBottom: 4 }}>Patient Name *</label>
                <input style={{ ...S.searchInput, paddingLeft: 12, width: '100%', boxSizing: 'border-box' }}
                  value={newPatientName} onChange={(e) => setNewPatientName(e.target.value)} placeholder="Full name" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: V.textSec, display: 'block', marginBottom: 4 }}>Chief Complaint *</label>
                <input style={{ ...S.searchInput, paddingLeft: 12, width: '100%', boxSizing: 'border-box' }}
                  value={newComplaint} onChange={(e) => setNewComplaint(e.target.value)} placeholder="Reason for consult" />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: V.textSec, display: 'block', marginBottom: 4 }}>Specialty</label>
                  <select style={{ ...S.filterSelect, width: '100%' }} value={newSpecialty} onChange={(e) => setNewSpecialty(e.target.value)}>
                    {['General Practice', 'Internal Medicine', 'Pediatrics', 'Dermatology', 'Cardiology', 'OB-GYN', 'Psychiatry'].map((sp) =>
                      <option key={sp} value={sp}>{sp}</option>
                    )}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: V.textSec, display: 'block', marginBottom: 4 }}>Priority</label>
                  <select style={{ ...S.filterSelect, width: '100%' }} value={newPriority} onChange={(e) => setNewPriority(e.target.value as typeof newPriority)}>
                    {['Normal', 'Urgent', 'Follow-Up'].map((p) =>
                      <option key={p} value={p}>{p}</option>
                    )}
                  </select>
                </div>
              </div>
              {newType === 'later' && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: V.textSec, display: 'block', marginBottom: 4 }}>Scheduled Time</label>
                  <input type="datetime-local" style={{ ...S.searchInput, paddingLeft: 12, width: '100%', boxSizing: 'border-box' }}
                    value={newScheduledTime} onChange={(e) => setNewScheduledTime(e.target.value)} />
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button style={{ ...S.btn, ...S.btnPrimary, flex: 1, justifyContent: 'center' }}
                  onClick={handleAddSession} disabled={!newPatientName.trim() || !newComplaint.trim()}>
                  <Plus size={14} /> Add to Queue
                </button>
                <button style={{ ...S.btn, ...S.btnOutline, flex: 1, justifyContent: 'center' }}
                  onClick={() => setAddSessionOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Doctor Status Modal ── */}
      {doctorStatusModal && (
        <div style={S.overlay} onClick={() => setDoctorStatusModal(null)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalTitle}>
              <RefreshCw size={18} /> Change Doctor Status
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: V.textSec, display: 'block', marginBottom: 4 }}>Doctor: {tcDoctors.find((d) => d.id === doctorStatusModal)?.name}</label>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: V.textSec, display: 'block', marginBottom: 4 }}>New Status</label>
                <select style={{ ...S.filterSelect, width: '100%' }} value={newDoctorStatus}
                  onChange={(e) => setNewDoctorStatus(e.target.value as DoctorTCStatus)}>
                  <option value="available">Available</option>
                  <option value="on-break">On Break</option>
                  <option value="clinic-consult">Clinic Consult</option>
                  <option value="rounds">Rounds</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: V.textSec, display: 'block', marginBottom: 4 }}>Activity Note (optional)</label>
                <input style={{ ...S.searchInput, paddingLeft: 12, width: '100%', boxSizing: 'border-box' }}
                  value={newDoctorActivity} onChange={(e) => setNewDoctorActivity(e.target.value)}
                  placeholder="e.g. Lunch break, Ward rounds Floor 3" />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ ...S.btn, ...S.btnPrimary, flex: 1, justifyContent: 'center' }}
                  onClick={handleDoctorStatusChange}>
                  <CheckCircle size={14} /> Update
                </button>
                <button style={{ ...S.btn, ...S.btnOutline, flex: 1, justifyContent: 'center' }}
                  onClick={() => setDoctorStatusModal(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Notify / Reach Out to Doctor Modal ── */}
      {notifyDoctorModal && (() => {
        const targetDoc = tcDoctors.find((d) => d.id === notifyDoctorModal);
        const docHistory = notifyHistory.filter((n) => n.doctorId === notifyDoctorModal);
        return (
          <div style={S.overlay} onClick={() => setNotifyDoctorModal(null)}>
            <div style={S.modal} onClick={(e) => e.stopPropagation()}>
              <div style={S.modalTitle}>
                <BellRing size={18} /> Notify Doctor
              </div>

              {/* Doctor info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#f8fafc', borderRadius: V.radiusSm, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: V.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
                  {targetDoc?.name.split(' ').filter((_, i, a) => i === 0 || i === a.length - 1).map((w) => w[0]).join('')}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: V.text, fontSize: 14 }}>{targetDoc?.name}</div>
                  <div style={{ fontSize: 12, color: V.textSec }}>{targetDoc?.specialty} — {DOCTOR_STATUS_CONFIG[targetDoc?.status || 'offline'].label}</div>
                </div>
              </div>

              {/* Quick message templates */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: V.textSec, display: 'block', marginBottom: 6 }}>Quick Messages</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {[
                    'Patient is waiting for your teleconsult.',
                    'Urgent patient needs immediate attention.',
                    'Please return to teleconsult queue when available.',
                    'Your next scheduled patient is online and ready.',
                    'Break is over — patients are waiting.',
                    'Please check in for your teleconsult shift.',
                  ].map((tmpl) => (
                    <button key={tmpl}
                      style={{
                        ...S.btn, ...S.btnSm,
                        background: notifyMessage === tmpl ? V.primaryLight : '#f8fafc',
                        color: notifyMessage === tmpl ? V.primary : V.textSec,
                        border: `1px solid ${notifyMessage === tmpl ? V.primary + '44' : V.border}`,
                        fontSize: 11,
                      }}
                      onClick={() => setNotifyMessage(tmpl)}>
                      {tmpl.length > 45 ? tmpl.slice(0, 45) + '...' : tmpl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom message */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: V.textSec, display: 'block', marginBottom: 4 }}>Message</label>
                <textarea
                  style={{ ...S.searchInput, paddingLeft: 12, width: '100%', boxSizing: 'border-box', minHeight: 60, resize: 'vertical', fontFamily: 'inherit' }}
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                  placeholder="Type a custom message..."
                />
              </div>

              {/* Notification channel */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: V.textSec, display: 'block', marginBottom: 6 }}>Send Via</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {([
                    { key: 'in-app' as const, label: 'In-App', icon: MessageSquare, desc: 'Push notification' },
                    { key: 'sms' as const, label: 'SMS', icon: Phone, desc: 'Text message' },
                    { key: 'page' as const, label: 'Page', icon: BellRing, desc: 'Urgent page/beep' },
                  ]).map((ch) => {
                    const ChIcon = ch.icon;
                    const isActive = notifyType === ch.key;
                    return (
                      <button key={ch.key}
                        style={{
                          ...S.btn, flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          padding: '10px 8px', borderRadius: V.radiusSm,
                          background: isActive ? V.primaryLight : '#f8fafc',
                          color: isActive ? V.primary : V.textSec,
                          border: `2px solid ${isActive ? V.primary : V.border}`,
                        }}
                        onClick={() => setNotifyType(ch.key)}>
                        <ChIcon size={16} />
                        <span style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>{ch.label}</span>
                        <span style={{ fontSize: 10, opacity: 0.7 }}>{ch.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Send buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ ...S.btn, ...S.btnPrimary, flex: 1, justifyContent: 'center' }}
                  onClick={handleNotifyDoctor}
                  disabled={!notifyMessage.trim()}>
                  <BellRing size={14} /> Send Notification
                </button>
                <button style={{ ...S.btn, ...S.btnOutline, justifyContent: 'center' }}
                  onClick={() => setNotifyDoctorModal(null)}>
                  Cancel
                </button>
              </div>

              {/* Notification history for this doctor */}
              {docHistory.length > 0 && (
                <div style={{ marginTop: 16, borderTop: `1px solid ${V.border}`, paddingTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: V.textSec, marginBottom: 8 }}>Sent Notifications</div>
                  <div style={{ maxHeight: 120, overflow: 'auto' }}>
                    {docHistory.map((n, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: `1px solid ${V.border}22`, fontSize: 12 }}>
                        <span style={{
                          ...S.badge,
                          background: n.type === 'page' ? V.dangerLight : n.type === 'sms' ? V.purpleLight : V.infoLight,
                          color: n.type === 'page' ? V.danger : n.type === 'sms' ? V.purple : V.info,
                          fontSize: 10, padding: '2px 6px',
                        }}>
                          {n.type === 'sms' ? 'SMS' : n.type === 'page' ? 'PAGE' : 'APP'}
                        </span>
                        <span style={{ flex: 1, color: V.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</span>
                        <span style={{ color: V.textMuted, fontSize: 10, flexShrink: 0 }}>
                          {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
