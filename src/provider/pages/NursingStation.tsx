import { useState, useMemo } from 'react';
import {
  ClipboardList,
  LayoutGrid,
  CheckSquare,
  Pill,
  FileHeart,
  ArrowRightLeft,
  UserPlus,
  X,
  AlertTriangle,
  Clock,
  Plus,
  Play,
  CheckCircle2,
  Thermometer,
  Heart,
  Activity,
  Wind,
} from 'lucide-react';
import { useProvider } from '../context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';
import { useToast } from '../../context/ToastContext';
import type { TriageRecord, NursingTask, StationType } from '../types';

/* ───────── shared inline styles ───────── */
const S: Record<string, React.CSSProperties> = {
  page: { padding: 24, background: 'var(--color-background)', minHeight: '100%' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  titleWrap: { display: 'flex', flexDirection: 'column', gap: 4 },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--color-text)', margin: 0 },
  subtitle: { fontSize: 14, color: 'var(--color-text-muted)', margin: 0 },
  tabs: { display: 'flex', gap: 4, flexWrap: 'wrap', borderBottom: '1px solid var(--color-border)', marginBottom: 20, paddingBottom: 0 },
  tab: { padding: '12px 16px', fontSize: 14, fontWeight: 600, color: 'var(--color-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -1, borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', gap: 8 },
  tabActive: { color: 'var(--color-primary)', borderBottomColor: 'var(--color-primary)' },
  card: { background: 'var(--color-surface)', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.06)', border: '1px solid var(--color-border)', marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: 600, color: 'var(--color-text)', marginBottom: 16, margin: 0 },
  btn: { padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 },
  btnPrimary: { background: 'var(--color-primary)', color: 'white' },
  btnSuccess: { background: '#10b981', color: 'white' },
  btnWarning: { background: '#f59e0b', color: 'white' },
  btnOutline: { background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)' },
  btnDanger: { background: '#ef4444', color: 'white' },
  badge: { display: 'inline-block', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: { padding: '12px 14px', textAlign: 'left' as const, fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', background: 'var(--color-background)', borderBottom: '1px solid var(--color-border)', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  td: { padding: '14px 14px', fontSize: 14, color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)' },
  overlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: 'var(--color-surface)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' as const, boxShadow: '0 20px 60px rgba(0,0,0,.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  formGroup: { marginBottom: 16 },
  formLabel: { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 },
  formInput: { width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 14, background: 'var(--color-surface)', color: 'var(--color-text)', boxSizing: 'border-box' as const },
  formSelect: { width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 14, background: 'var(--color-surface)', color: 'var(--color-text)', boxSizing: 'border-box' as const },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  formRow3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 },
  queueItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: 'var(--color-surface)', borderRadius: 10, border: '1px solid var(--color-border)', boxShadow: '0 1px 3px rgba(0,0,0,.04)', marginBottom: 10 },
  board: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 },
  boardCol: { background: 'var(--color-background)', borderRadius: 10, padding: 14, minHeight: 120 },
  boardColTitle: { fontSize: 13, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  patientCard: { background: 'var(--color-surface)', borderRadius: 8, padding: 12, marginBottom: 8, border: '1px solid var(--color-border)', boxShadow: '0 1px 3px rgba(0,0,0,.04)' },
  taskCard: { background: 'var(--color-surface)', borderRadius: 10, padding: 16, border: '1px solid var(--color-border)', marginBottom: 10, boxShadow: '0 1px 3px rgba(0,0,0,.04)' },
  taskOverdue: { borderLeft: '3px solid #ef4444', background: '#fef2f2' },
  marRow: { display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr 80px 120px', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--color-border)', alignItems: 'center', fontSize: 14 },
  marHeader: { fontWeight: 600, color: 'var(--color-text-muted)' },
  carePlanCard: { background: 'var(--color-surface)', borderRadius: 10, border: '1px solid var(--color-border)', padding: 20, marginBottom: 14, boxShadow: '0 1px 3px rgba(0,0,0,.04)' },
  handoffNote: { padding: 16, background: 'var(--color-background)', borderRadius: 10, marginBottom: 12, fontSize: 14, color: 'var(--color-text)', lineHeight: 1.6 },
  textArea: { width: '100%', minHeight: 120, padding: 14, borderRadius: 10, border: '1px solid var(--color-border)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' as const, background: 'var(--color-surface)', color: 'var(--color-text)' },
  emptyState: { textAlign: 'center' as const, padding: 40, color: 'var(--color-text-muted)' },
  groupHeader: { fontSize: 13, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, letterSpacing: 0.8, padding: '16px 0 10px' },
  vitalBox: { background: 'var(--color-background)', borderRadius: 10, padding: 14, textAlign: 'center' as const },
  vitalValue: { fontSize: 20, fontWeight: 700, color: 'var(--color-text)' },
  vitalLabel: { fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 },
};

const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
  Emergency: { bg: '#fee2e2', color: '#dc2626' },
  Urgent: { bg: '#fef3c7', color: '#d97706' },
  'Semi-Urgent': { bg: '#fef3c7', color: '#d97706' },
  'Non-Urgent': { bg: '#d1fae5', color: '#065f46' },
};

const TASK_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Pending: { bg: '#dbeafe', color: '#2563eb' },
  'In Progress': { bg: '#fef3c7', color: '#d97706' },
  Completed: { bg: '#d1fae5', color: '#065f46' },
  Overdue: { bg: '#fee2e2', color: '#dc2626' },
};

const TASK_PRIORITY_COLORS: Record<string, string> = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#10b981',
};

const MAR_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Administered: { bg: '#d1fae5', color: '#065f46' },
  Pending: { bg: '#fef3c7', color: '#d97706' },
  Held: { bg: '#fee2e2', color: '#dc2626' },
};

const BOARD_STATIONS: StationType[] = ['Check-In', 'Triage', 'Consult', 'Lab', 'Imaging', 'Pharmacy', 'Billing'];

const MOCK_MAR = [
  { time: '08:00', patient: 'Juan Dela Cruz', med: 'Rosuvastatin 20mg', dose: '1 tab', route: 'PO', status: 'Administered' as const },
  { time: '08:15', patient: 'Lourdes Bautista', med: 'Amlodipine 10mg', dose: '1 tab', route: 'PO', status: 'Administered' as const },
  { time: '09:00', patient: 'Sofia Garcia', med: 'Prenatal Vitamins', dose: '1 tab', route: 'PO', status: 'Pending' as const },
  { time: '09:30', patient: 'Anna Santos', med: 'Paracetamol 250mg', dose: '5mL', route: 'PO', status: 'Administered' as const },
  { time: '10:00', patient: 'Miguel Torres', med: 'Ibuprofen 400mg', dose: '1 tab', route: 'PO', status: 'Pending' as const },
  { time: '10:30', patient: 'Roberto Villanueva', med: 'Metformin 850mg', dose: '1 tab', route: 'PO', status: 'Held' as const },
];

const MOCK_CARE_PLANS = [
  { patient: 'Juan Dela Cruz', diagnosis: 'CAD, HTN', goals: ['BP <130/80', 'LDL <100'], interventions: ['Statin therapy', 'Lifestyle counseling', 'Annual lipid panel'], done: 2 },
  { patient: 'Lourdes Bautista', diagnosis: 'DM2, HTN', goals: ['HbA1c <7%', 'BP control'], interventions: ['Metformin', 'Amlodipine', 'Foot exam quarterly'], done: 1 },
  { patient: 'Patricia Gomez', diagnosis: 'ACS rule-out', goals: ['Rule out MI', 'Stable vitals'], interventions: ['ECG', 'Troponin', 'Cardiac monitor'], done: 3 },
];

const MOCK_HANDOFF_NOTES = [
  'Night shift: 2 new admits - Ward 2-A. Juan Dela Cruz stable on telemetry. Patricia Gomez pending troponin results.',
  'Morning handoff: Triage backlog cleared by 08:30. Lab draw queue light. Pharmacy dispensing normal.',
];

type TabId = 'triage' | 'board' | 'tasks' | 'medication' | 'careplans' | 'handoff';

export const NursingStation = () => {
  const { tenant } = useTheme();
  const { showToast } = useToast();
  const {
    triageRecords,
    nursingTasks,
    queuePatients,
    staff,
    currentStaff,
    addTriageRecord,
    updateNursingTaskStatus,
    addNursingTask,
  } = useProvider();

  const [activeTab, setActiveTab] = useState<TabId>('triage');
  const [showTriageForm, setShowTriageForm] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  // Triage form state
  const [triagePatient, setTriagePatient] = useState('');
  const [triageBP, setTriageBP] = useState('');
  const [triageHR, setTriageHR] = useState('');
  const [triageTemp, setTriageTemp] = useState('');
  const [triageRR, setTriageRR] = useState('');
  const [triageSpO2, setTriageSpO2] = useState('');
  const [triagePain, setTriagePain] = useState('0');
  const [triageComplaint, setTriageComplaint] = useState('');
  const [triagePriority, setTriagePriority] = useState<TriageRecord['priority']>('Non-Urgent');

  // Add task form state
  const [taskPatient, setTaskPatient] = useState('');
  const [taskType, setTaskType] = useState<NursingTask['type']>('Vital Signs');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<NursingTask['priority']>('Medium');
  const [taskDueTime, setTaskDueTime] = useState('');

  /* ───────── computed ───────── */
  const currentNurse = currentStaff?.role === 'nurse'
    ? currentStaff
    : staff.find(s => s.role === 'nurse') ?? staff[0];

  const triageQueue = useMemo(() =>
    queuePatients.filter(p =>
      (p.stationType === 'Triage' || p.stationType === 'Check-In') &&
      (p.status === 'QUEUED' || p.status === 'READY')
    ),
    [queuePatients]
  );

  const tasksByPriority = useMemo(() => ({
    High: nursingTasks.filter(t => t.priority === 'High'),
    Medium: nursingTasks.filter(t => t.priority === 'Medium'),
    Low: nursingTasks.filter(t => t.priority === 'Low'),
  }), [nursingTasks]);

  const activePatients = useMemo(() =>
    queuePatients.filter(p => p.status !== 'COMPLETED' && p.status !== 'NO_SHOW'),
    [queuePatients]
  );

  const boardData = useMemo(() =>
    BOARD_STATIONS.map(station => ({
      station,
      patients: activePatients.filter(p => p.stationType === station),
    })),
    [activePatients]
  );

  const overdueTasks = nursingTasks.filter(t => t.status === 'Overdue' || (t.status === 'Pending' && new Date(t.dueTime) < new Date())).length;
  const completedTasks = nursingTasks.filter(t => t.status === 'Completed').length;

  /* ───────── feature flag tab filtering ───────── */
  const labPharmacyEnabled = tenant.features.visits.clinicLabFulfillmentEnabled;

  const allTabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'triage', label: 'Triage', icon: <ClipboardList size={16} /> },
    { id: 'board', label: 'Board', icon: <LayoutGrid size={16} /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={16} /> },
    { id: 'medication', label: 'Medication', icon: <Pill size={16} /> },
    { id: 'careplans', label: 'Care Plans', icon: <FileHeart size={16} /> },
    { id: 'handoff', label: 'Handoff', icon: <ArrowRightLeft size={16} /> },
  ];

  const tabs = allTabs.filter(t => t.id !== 'medication' || labPharmacyEnabled);
  const effectiveTab = tabs.some(t => t.id === activeTab) ? activeTab : (tabs[0]?.id ?? 'triage');

  /* ───────── handlers ───────── */
  const resetTriageForm = () => {
    setTriagePatient('');
    setTriageBP('');
    setTriageHR('');
    setTriageTemp('');
    setTriageRR('');
    setTriageSpO2('');
    setTriagePain('0');
    setTriageComplaint('');
    setTriagePriority('Non-Urgent');
  };

  const submitTriage = () => {
    if (!triagePatient.trim() || !triageBP.trim() || !triageComplaint.trim()) {
      showToast('Patient, BP, and chief complaint are required', 'error');
      return;
    }
    const record: TriageRecord = {
      id: `triage-${Date.now()}`,
      patientId: `p-${Date.now()}`,
      patientName: triagePatient.trim(),
      nurseId: currentNurse.id,
      date: new Date().toISOString().slice(0, 10),
      bloodPressure: triageBP,
      heartRate: Number(triageHR) || 0,
      temperature: Number(triageTemp) || 0,
      respiratoryRate: Number(triageRR) || 0,
      oxygenSaturation: Number(triageSpO2) || 0,
      painScale: Number(triagePain) || 0,
      chiefComplaint: triageComplaint.trim(),
      priority: triagePriority,
    };
    addTriageRecord(record);
    showToast(`Triage recorded for ${triagePatient}`, 'success');
    setShowTriageForm(false);
    resetTriageForm();
  };

  const submitTask = () => {
    if (!taskPatient.trim() || !taskDesc.trim()) {
      showToast('Patient and description are required', 'error');
      return;
    }
    addNursingTask({
      patientId: `p-${Date.now()}`,
      patientName: taskPatient.trim(),
      nurseId: currentNurse.id,
      type: taskType,
      description: taskDesc.trim(),
      priority: taskPriority,
      status: 'Pending',
      dueTime: taskDueTime || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });
    showToast(`Task added for ${taskPatient}`, 'success');
    setShowAddTask(false);
    setTaskPatient('');
    setTaskType('Vital Signs');
    setTaskDesc('');
    setTaskPriority('Medium');
    setTaskDueTime('');
  };

  const handleTaskAction = (task: NursingTask, action: 'start' | 'complete') => {
    if (action === 'start') {
      updateNursingTaskStatus(task.id, 'In Progress');
      showToast(`Started: ${task.description}`, 'info');
    } else {
      updateNursingTaskStatus(task.id, 'Completed');
      showToast(`Completed: ${task.description}`, 'success');
    }
  };

  return (
    <div style={S.page}>
      {/* ── Header ── */}
      <div style={S.header}>
        <div style={S.titleWrap}>
          <h1 style={S.title}>Nursing Station</h1>
          <p style={S.subtitle}>
            {currentNurse ? `Logged in as ${currentNurse.name}` : 'Nursing Module'}
            {overdueTasks > 0 && (
              <span style={{ marginLeft: 12, color: '#ef4444', fontWeight: 600 }}>
                <AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                {overdueTasks} overdue task{overdueTasks > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={S.tabs}>
        {tabs.map(({ id, label, icon }) => (
          <button
            key={id}
            style={{ ...S.tab, ...(effectiveTab === id ? S.tabActive : {}) }}
            onClick={() => setActiveTab(id)}
          >
            {icon} {label}
            {id === 'tasks' && overdueTasks > 0 && (
              <span style={{ ...S.badge, background: '#fee2e2', color: '#dc2626', padding: '2px 8px', fontSize: 11, marginLeft: 4 }}>{overdueTasks}</span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════════ TRIAGE TAB ═══════════ */}
      {effectiveTab === 'triage' && (
        <>
          {/* Queue */}
          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={S.cardTitle}>Triage Queue ({triageQueue.length})</h2>
              <button style={{ ...S.btn, ...S.btnPrimary }} onClick={() => setShowTriageForm(true)}>
                <UserPlus size={16} /> Start Triage
              </button>
            </div>
            {triageQueue.length === 0 ? (
              <div style={S.emptyState}>
                <ClipboardList size={40} style={{ marginBottom: 12 }} />
                <p>No patients waiting for triage.</p>
              </div>
            ) : (
              triageQueue.map(p => (
                <div key={p.id} style={S.queueItem}>
                  <div>
                    <strong style={{ color: 'var(--color-text)', fontSize: 15 }}>{p.patientName}</strong>
                    <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
                      <Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      {p.chiefComplaint || p.ticketNumber} &middot; {p.waitMinutes} min wait
                    </div>
                  </div>
                  <span style={{ ...S.badge, background: PRIORITY_COLORS[p.priority]?.bg, color: PRIORITY_COLORS[p.priority]?.color }}>
                    {p.priority}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Recent records */}
          <div style={S.card}>
            <h2 style={S.cardTitle}>Recent Triage Records</h2>
            {triageRecords.length === 0 ? (
              <div style={S.emptyState}><p>No triage records.</p></div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>Patient</th>
                      <th style={S.th}>Date</th>
                      <th style={S.th}>BP</th>
                      <th style={S.th}>HR</th>
                      <th style={S.th}>Temp</th>
                      <th style={S.th}>RR</th>
                      <th style={S.th}>SpO2</th>
                      <th style={S.th}>Pain</th>
                      <th style={S.th}>Priority</th>
                      <th style={S.th}>Complaint</th>
                    </tr>
                  </thead>
                  <tbody>
                    {triageRecords.slice(0, 10).map(r => (
                      <tr key={r.id}>
                        <td style={S.td}><span style={{ fontWeight: 600 }}>{r.patientName}</span></td>
                        <td style={S.td}>{r.date}</td>
                        <td style={S.td}>{r.bloodPressure}</td>
                        <td style={S.td}>{r.heartRate}</td>
                        <td style={S.td}>{r.temperature}°C</td>
                        <td style={S.td}>{r.respiratoryRate}</td>
                        <td style={S.td}>{r.oxygenSaturation}%</td>
                        <td style={S.td}>{r.painScale}/10</td>
                        <td style={S.td}>
                          <span style={{ ...S.badge, background: PRIORITY_COLORS[r.priority]?.bg, color: PRIORITY_COLORS[r.priority]?.color }}>
                            {r.priority}
                          </span>
                        </td>
                        <td style={S.td}>{r.chiefComplaint}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══════════ BOARD TAB ═══════════ */}
      {effectiveTab === 'board' && (
        <div style={S.card}>
          <h2 style={S.cardTitle}>Patient Board &mdash; By Station</h2>
          <div style={S.board}>
            {boardData.map(col => (
              <div key={col.station} style={S.boardCol}>
                <div style={S.boardColTitle}>
                  <span style={{ ...S.badge, background: 'var(--color-primary)', color: 'white', padding: '2px 8px', fontSize: 11 }}>{col.patients.length}</span>
                  {col.station}
                </div>
                {col.patients.length === 0 && (
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)', padding: 8 }}>Empty</div>
                )}
                {col.patients.map(p => (
                  <div key={p.id} style={S.patientCard}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>{p.patientName}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                      {p.ticketNumber} &middot; {p.chiefComplaint || '—'}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
                      <span style={{
                        ...S.badge,
                        background: p.priority === 'Emergency' ? '#fee2e2' : p.priority === 'Senior' || p.priority === 'PWD' ? '#fef3c7' : '#dbeafe',
                        color: p.priority === 'Emergency' ? '#dc2626' : p.priority === 'Senior' || p.priority === 'PWD' ? '#d97706' : '#2563eb',
                        fontSize: 11, padding: '2px 8px',
                      }}>
                        {p.priority}
                      </span>
                      <span style={{
                        ...S.badge,
                        background: p.status === 'IN_SESSION' ? '#d1fae5' : p.status === 'READY' ? '#fef3c7' : '#dbeafe',
                        color: p.status === 'IN_SESSION' ? '#065f46' : p.status === 'READY' ? '#d97706' : '#2563eb',
                        fontSize: 11, padding: '2px 8px',
                      }}>
                        {p.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════ TASKS TAB ═══════════ */}
      {effectiveTab === 'tasks' && (
        <>
          {/* Summary bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 20 }}>
            {[
              { label: 'Total', value: nursingTasks.length, color: 'var(--color-primary)' },
              { label: 'Pending', value: nursingTasks.filter(t => t.status === 'Pending').length, color: '#2563eb' },
              { label: 'In Progress', value: nursingTasks.filter(t => t.status === 'In Progress').length, color: '#d97706' },
              { label: 'Completed', value: completedTasks, color: '#059669' },
              { label: 'Overdue', value: overdueTasks, color: '#ef4444' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--color-surface)', borderRadius: 10, padding: 16, textAlign: 'center', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={S.cardTitle}>Nursing Tasks</h2>
              <button style={{ ...S.btn, ...S.btnPrimary }} onClick={() => setShowAddTask(true)}>
                <Plus size={16} /> Add Task
              </button>
            </div>

            {(['High', 'Medium', 'Low'] as const).map(pri => {
              const tasks = tasksByPriority[pri];
              if (tasks.length === 0) return null;
              return (
                <div key={pri}>
                  <div style={S.groupHeader}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: TASK_PRIORITY_COLORS[pri], display: 'inline-block', marginRight: 8 }} />
                    {pri} Priority ({tasks.length})
                  </div>
                  {tasks.map(task => {
                    const isOverdue = task.status === 'Overdue' || (task.status === 'Pending' && new Date(task.dueTime) < new Date());
                    const sc = TASK_STATUS_COLORS[isOverdue ? 'Overdue' : task.status] ?? { bg: '#dbeafe', color: '#2563eb' };
                    return (
                      <div key={task.id} style={{ ...S.taskCard, ...(isOverdue ? S.taskOverdue : {}) }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                              <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text)' }}>{task.patientName}</span>
                              <span style={{ ...S.badge, background: '#e0e7ff', color: '#4338ca', fontSize: 11, padding: '2px 8px' }}>{task.type}</span>
                            </div>
                            <div style={{ fontSize: 14, color: 'var(--color-text)', marginBottom: 6 }}>{task.description}</div>
                            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--color-text-muted)' }}>
                              <span><Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />Due: {new Date(task.dueTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span style={{ ...S.badge, background: sc.bg, color: sc.color, fontSize: 11, padding: '2px 8px' }}>
                                {isOverdue ? 'Overdue' : task.status}
                              </span>
                              {task.completedTime && <span>Completed: {new Date(task.completedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                            </div>
                            {task.notes && <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 6, fontStyle: 'italic' }}>{task.notes}</div>}
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            {(task.status === 'Pending' || isOverdue) && (
                              <button style={{ ...S.btn, ...S.btnWarning, fontSize: 12, padding: '6px 12px' }} onClick={() => handleTaskAction(task, 'start')}>
                                <Play size={14} /> Start
                              </button>
                            )}
                            {task.status === 'In Progress' && (
                              <button style={{ ...S.btn, ...S.btnSuccess, fontSize: 12, padding: '6px 12px' }} onClick={() => handleTaskAction(task, 'complete')}>
                                <CheckCircle2 size={14} /> Complete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ═══════════ MEDICATION TAB ═══════════ */}
      {effectiveTab === 'medication' && (
        <div style={S.card}>
          <h2 style={S.cardTitle}>Medication Administration Record</h2>
          <div>
            <div style={{ ...S.marRow, ...S.marHeader }}>
              <div>Time</div>
              <div>Patient</div>
              <div>Medication</div>
              <div>Dose</div>
              <div>Route</div>
              <div>Status</div>
            </div>
            {MOCK_MAR.map((m, i) => {
              const sc = MAR_STATUS_COLORS[m.status] ?? { bg: 'var(--color-background)', color: 'var(--color-text-muted)' };
              return (
                <div key={i} style={S.marRow}>
                  <div style={{ fontWeight: 600 }}>{m.time}</div>
                  <div>{m.patient}</div>
                  <div>{m.med}</div>
                  <div>{m.dose}</div>
                  <div>{m.route}</div>
                  <span style={{ ...S.badge, background: sc.bg, color: sc.color }}>
                    {m.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════ CARE PLANS TAB ═══════════ */}
      {effectiveTab === 'careplans' && (
        <div style={S.card}>
          <h2 style={S.cardTitle}>Care Plans</h2>
          {MOCK_CARE_PLANS.map(cp => (
            <div key={cp.patient} style={S.carePlanCard}>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text)', marginBottom: 8 }}>{cp.patient}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                <strong>Diagnosis:</strong> {cp.diagnosis}
              </div>
              <div style={{ fontSize: 13, marginBottom: 8, color: 'var(--color-text)' }}>
                <strong>Goals:</strong> {cp.goals.join(', ')}
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text)' }}>
                <strong>Interventions:</strong>
                <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                  {cp.interventions.map((int, idx) => (
                    <li key={idx} style={{ marginBottom: 4, color: idx < cp.done ? '#059669' : 'var(--color-text)' }}>
                      <input type="checkbox" checked={idx < cp.done} readOnly style={{ marginRight: 8 }} />
                      <span style={idx < cp.done ? { textDecoration: 'line-through', opacity: 0.7 } : {}}>{int}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════ HANDOFF TAB ═══════════ */}
      {effectiveTab === 'handoff' && (
        <div style={S.card}>
          <h2 style={S.cardTitle}>Shift Handoff</h2>

          <div style={S.groupHeader}>Previous Shift Notes</div>
          {MOCK_HANDOFF_NOTES.map((note, i) => (
            <div key={i} style={S.handoffNote}>{note}</div>
          ))}

          <div style={S.groupHeader}>Current Shift Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Tasks Done', value: completedTasks },
              { label: 'Triaged', value: triageRecords.length },
              { label: 'In Queue', value: triageQueue.length },
              { label: 'Overdue', value: overdueTasks },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--color-background)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={S.groupHeader}>Notes for Next Shift</div>
          <textarea
            style={S.textArea}
            placeholder="Enter handoff notes for the next shift..."
            defaultValue=""
          />
          <button style={{ ...S.btn, ...S.btnPrimary, marginTop: 12 }} onClick={() => showToast('Handoff notes saved', 'success')}>
            Save Handoff Notes
          </button>
        </div>
      )}

      {/* ═══════════ TRIAGE FORM MODAL ═══════════ */}
      {showTriageForm && (
        <div style={S.overlay} onClick={() => setShowTriageForm(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                <ClipboardList size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                New Triage Assessment
              </h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }} onClick={() => setShowTriageForm(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={S.formGroup}>
              <label style={S.formLabel}>Patient Name *</label>
              <input style={S.formInput} placeholder="Enter patient name" value={triagePatient} onChange={e => setTriagePatient(e.target.value)} />
            </div>

            {/* Vital signs grid */}
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
              Vital Signs
            </div>
            <div style={S.formRow}>
              <div style={S.formGroup}>
                <label style={S.formLabel}>
                  <Heart size={14} style={{ verticalAlign: 'middle', marginRight: 6, color: '#ef4444' }} />
                  Blood Pressure *
                </label>
                <input style={S.formInput} placeholder="e.g. 120/80" value={triageBP} onChange={e => setTriageBP(e.target.value)} />
              </div>
              <div style={S.formGroup}>
                <label style={S.formLabel}>
                  <Activity size={14} style={{ verticalAlign: 'middle', marginRight: 6, color: '#ef4444' }} />
                  Heart Rate (bpm)
                </label>
                <input style={S.formInput} type="number" placeholder="e.g. 78" value={triageHR} onChange={e => setTriageHR(e.target.value)} />
              </div>
            </div>
            <div style={S.formRow3}>
              <div style={S.formGroup}>
                <label style={S.formLabel}>
                  <Thermometer size={14} style={{ verticalAlign: 'middle', marginRight: 6, color: '#f59e0b' }} />
                  Temp (°C)
                </label>
                <input style={S.formInput} type="number" step="0.1" placeholder="e.g. 36.8" value={triageTemp} onChange={e => setTriageTemp(e.target.value)} />
              </div>
              <div style={S.formGroup}>
                <label style={S.formLabel}>
                  <Wind size={14} style={{ verticalAlign: 'middle', marginRight: 6, color: '#2563eb' }} />
                  RR (/min)
                </label>
                <input style={S.formInput} type="number" placeholder="e.g. 18" value={triageRR} onChange={e => setTriageRR(e.target.value)} />
              </div>
              <div style={S.formGroup}>
                <label style={S.formLabel}>SpO2 (%)</label>
                <input style={S.formInput} type="number" placeholder="e.g. 98" value={triageSpO2} onChange={e => setTriageSpO2(e.target.value)} />
              </div>
            </div>

            <div style={S.formRow}>
              <div style={S.formGroup}>
                <label style={S.formLabel}>Pain Scale (0-10)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input type="range" min="0" max="10" value={triagePain} onChange={e => setTriagePain(e.target.value)} style={{ flex: 1 }} />
                  <span style={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: Number(triagePain) >= 7 ? '#ef4444' : Number(triagePain) >= 4 ? '#f59e0b' : '#10b981',
                    width: 30,
                    textAlign: 'center',
                  }}>
                    {triagePain}
                  </span>
                </div>
              </div>
              <div style={S.formGroup}>
                <label style={S.formLabel}>Priority</label>
                <select style={S.formSelect} value={triagePriority} onChange={e => setTriagePriority(e.target.value as TriageRecord['priority'])}>
                  <option value="Non-Urgent">Non-Urgent</option>
                  <option value="Semi-Urgent">Semi-Urgent</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
            </div>

            <div style={S.formGroup}>
              <label style={S.formLabel}>Chief Complaint *</label>
              <textarea
                style={{ ...S.formInput, minHeight: 80, resize: 'vertical' as const }}
                placeholder="Describe the patient's chief complaint..."
                value={triageComplaint}
                onChange={e => setTriageComplaint(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <button style={{ ...S.btn, ...S.btnOutline }} onClick={() => { setShowTriageForm(false); resetTriageForm(); }}>Cancel</button>
              <button style={{ ...S.btn, ...S.btnPrimary }} onClick={submitTriage}>
                <CheckCircle2 size={16} /> Save Triage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ ADD TASK MODAL ═══════════ */}
      {showAddTask && (
        <div style={S.overlay} onClick={() => setShowAddTask(false)}>
          <div style={{ ...S.modal, maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                <Plus size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                New Nursing Task
              </h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }} onClick={() => setShowAddTask(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={S.formGroup}>
              <label style={S.formLabel}>Patient Name *</label>
              <input style={S.formInput} placeholder="Enter patient name" value={taskPatient} onChange={e => setTaskPatient(e.target.value)} />
            </div>
            <div style={S.formRow}>
              <div style={S.formGroup}>
                <label style={S.formLabel}>Task Type</label>
                <select style={S.formSelect} value={taskType} onChange={e => setTaskType(e.target.value as NursingTask['type'])}>
                  <option value="Vital Signs">Vital Signs</option>
                  <option value="Medication">Medication</option>
                  <option value="Wound Care">Wound Care</option>
                  <option value="Assessment">Assessment</option>
                  <option value="Discharge">Discharge</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={S.formGroup}>
                <label style={S.formLabel}>Priority</label>
                <select style={S.formSelect} value={taskPriority} onChange={e => setTaskPriority(e.target.value as NursingTask['priority'])}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
            <div style={S.formGroup}>
              <label style={S.formLabel}>Description *</label>
              <textarea
                style={{ ...S.formInput, minHeight: 80, resize: 'vertical' as const }}
                placeholder="Describe the task..."
                value={taskDesc}
                onChange={e => setTaskDesc(e.target.value)}
              />
            </div>
            <div style={S.formGroup}>
              <label style={S.formLabel}>Due Time</label>
              <input style={S.formInput} type="datetime-local" value={taskDueTime} onChange={e => setTaskDueTime(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <button style={{ ...S.btn, ...S.btnOutline }} onClick={() => setShowAddTask(false)}>Cancel</button>
              <button style={{ ...S.btn, ...S.btnPrimary }} onClick={submitTask}>
                <Plus size={16} /> Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
