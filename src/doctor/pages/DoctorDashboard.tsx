import { useState, useEffect, useCallback, useRef } from 'react';
import {
  PhoneCall,
  Clock,
  Users,
  FlaskConical,
  Pill,
  FileSignature,
  AlertTriangle,
  Stethoscope,
  Calendar,
  Video,
  ClipboardList,
  Syringe,
  FileCheck,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Play,
  Mic,
  MicOff,
  Radio,
  Wifi,
  Activity,
  AudioWaveform,
  ToggleLeft,
  ToggleRight,
  MessageSquare,
  FileText,
  Zap,
  Loader2,
  X,
  Send,
  Bot,
  User,
  Building2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProvider } from '../../provider/context/ProviderContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../theme/ThemeContext';
import { isDoctorModuleAllowed } from '../../provider/roleAccess';
import './DoctorDashboard.css';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

interface DashTile {
  id: string;
  label: string;
  icon: React.FC<{ size?: number }>;
  color: string;       // icon bg tint
  iconColor: string;   // icon color
  route: string;
  badge?: number;
  visible: boolean;
  description?: string;
  inactive?: boolean;  // visually dimmed — the "other" mode
}

export const DoctorDashboard = () => {
  const {
    currentStaff, queuePatients, queueStats, todayAppointments,
    labOrders, prescriptions, clinicalNotes, criticalAlerts,
    callNextPatient, startPatient, doctorMode, activeTeleconsultCall,
    providerLoaRequests,
  } = useProvider();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { tenant } = useTheme();

  const hasCDSS = tenant.features.cdss ?? false;
  const hasAI = tenant.features.aiAssistant ?? false;
  const labsEnabled = tenant.features.visits.clinicLabFulfillmentEnabled;
  const queueEnabled = tenant.features.queue;
  const teleconsultEnabled = tenant.features.visits.teleconsultEnabled;
  const teleconsultNowEnabled = tenant.features.visits.teleconsultNowEnabled;
  const loaEnabled = tenant.features.loa;
  // Only show mode toggle when live teleconsult queue is available
  const hasLiveQueue = teleconsultNowEnabled;
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [handsFreeMode, setHandsFreeMode] = useState(false);
  const [aiCollapsed, setAiCollapsed] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [commandHistory, setCommandHistory] = useState<{ cmd: string; response: string; time: string; status: 'success' | 'info' }[]>([]);
  const [commandCount, setCommandCount] = useState(47);
  const [soapCount, setSoapCount] = useState(12);
  const aiScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Active teleconsult timer
  const [tcElapsed, setTcElapsed] = useState(0);
  useEffect(() => {
    if (!activeTeleconsultCall) { setTcElapsed(0); return; }
    const tick = () => setTcElapsed(Math.floor((Date.now() - activeTeleconsultCall.startedAt) / 1000));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [activeTeleconsultCall]);

  const formatCallTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // ---- Data ----
  const myQueue = queuePatients.filter(
    p => (p.stationType === 'Consult' || p.stationType === 'Return-Consult') && (p.assignedDoctor === currentStaff?.name || !p.assignedDoctor)
  );
  const firstQueued = myQueue.find(p => p.status === 'QUEUED');
  const firstReady = myQueue.find(p => p.status === 'READY');
  const inSession = myQueue.find(p => p.status === 'IN_SESSION');

  const myAppts = todayAppointments.filter(a => a.doctor === currentStaff?.name);
  const labCount = labOrders.filter(o => o.status === 'Resulted' && o.doctorName === currentStaff?.name).length;
  const rxCount = prescriptions.filter(p => p.status === 'Pending Approval' && p.doctorName === currentStaff?.name).length;
  const noteCount = clinicalNotes.filter(n => n.status === 'Draft' && n.doctorId === currentStaff?.id).length;
  const alertCount = hasCDSS ? criticalAlerts.filter(a => !a.dismissed).length : 0;
  const queueCount = queueEnabled ? myQueue.filter(p => p.status === 'QUEUED' || p.status === 'READY').length : 0;
  const loaPendingCount = providerLoaRequests.filter(r => r.status === 'Pending').length;

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  // --- Patient flow handlers (distinct per state) ---
  const handleCallPatient = () => {
    if (!firstQueued) return;
    callNextPatient('Consult');
    showToast(`Calling ${firstQueued.patientName} to consult room`, 'success');
  };

  const handleStartConsult = () => {
    if (!firstReady) return;
    startPatient(firstReady.patientId);
    showToast(`Starting consult with ${firstReady.patientName}`, 'success');
    navigate('/doctor/encounter');
  };

  // AI command responses — context-aware using live dashboard data
  const inSessionName = inSession ? inSession.patientName : null;
  const inSessionCC = inSession ? inSession.chiefComplaint : null;
  const draftNotes = clinicalNotes.filter(n => n.status === 'Draft' && n.doctorId === currentStaff?.id);
  const pendingRxList = prescriptions.filter(p => p.status === 'Pending Approval' && p.doctorName === currentStaff?.name);

  const aiResponses: Record<string, { response: string; action?: () => void; status: 'success' | 'info' }> = {
    'start encounter': {
      response: inSession
        ? `Resuming encounter with ${inSessionName}. Chief complaint: ${inSessionCC ?? 'N/A'}. SOAP note template and AI transcriber ready.`
        : firstReady
          ? `Starting encounter with ${firstReady.patientName} (${firstReady.ticketNumber}). Chief complaint: ${firstReady.chiefComplaint ?? 'N/A'}. Navigating to encounter page...`
          : 'No patient ready for encounter. Call the next patient from the queue first.',
      action: inSession || firstReady ? () => navigate('/doctor/encounter', { state: inSession ? { patientId: inSession.patientId, patientName: inSession.patientName, chiefComplaint: inSession.chiefComplaint, ticketNumber: inSession.ticketNumber } : { patientId: firstReady!.patientId, patientName: firstReady!.patientName, chiefComplaint: firstReady!.chiefComplaint, ticketNumber: firstReady!.ticketNumber } }) : undefined,
      status: 'success',
    },
    'order cbc': { response: 'Lab order created: Complete Blood Count (CBC) + Basic Metabolic Panel (BMP). Sent to Lab queue. Estimated turnaround: 2 hours.', status: 'success' },
    'prescribe metformin': { response: 'Prescription drafted: Metformin 500mg BID with meals. CDSS check passed — no drug interactions detected. Awaiting your signature.', status: 'success' },
    'show allergies': {
      response: inSession
        ? `Retrieving allergies for ${inSessionName}... Loaded from patient chart. Navigate to encounter for full details.`
        : 'No patient currently in session. Start an encounter first to view patient allergies.',
      status: 'info',
    },
    'generate soap': { response: 'SOAP note generated from today\'s encounter transcript.\n\nS: Patient reports persistent fatigue and increased thirst for 2 weeks.\nO: BP 130/85, HR 78, Temp 36.8°C. BMI 28.4.\nA: Type 2 Diabetes Mellitus — suboptimal glycemic control.\nP: Increase Metformin to 1000mg BID. Repeat HbA1c in 3 months. Refer to dietitian.', action: () => setSoapCount(c => c + 1), status: 'success' },
    'check vitals': { response: 'Latest vitals for current patient:\n• BP: 130/85 mmHg\n• HR: 78 bpm\n• Temp: 36.8°C\n• SpO2: 98%\n• RR: 16/min\n• Weight: 82 kg\nAll within acceptable range.', status: 'info' },
    'next patient': { response: `Calling next patient from queue. ${firstQueued ? firstQueued.patientName + ' (Ticket ' + firstQueued.ticketNumber + ') — ' + (firstQueued.chiefComplaint ?? 'General consultation') : 'No patients waiting in queue.'} `, action: firstQueued ? handleCallPatient : undefined, status: 'success' },
    'show schedule': { response: `Today's remaining appointments: ${myAppts.length} scheduled.\n${myAppts.slice(0, 3).map(a => `• ${a.time} — ${a.specialty} (${a.type})`).join('\n') || 'No appointments remaining.'}`, action: () => navigate('/doctor/schedule'), status: 'info' },
    'lab results': { response: `Pending lab reviews: ${labCount} results awaiting sign-off. ${labCount > 0 ? 'Highest priority: CBC with critical low hemoglobin flagged.' : 'All results reviewed.'}`, action: () => navigate('/doctor/results'), status: labCount > 0 ? 'success' : 'info' },
    'summarize today': {
      response: `Today's summary (${todayStr}):\n• Queue: ${queueCount} patients waiting, ${inSession ? '1 in session (' + inSessionName + ')' : 'none in session'}\n• Appointments: ${myAppts.length} scheduled\n• Pending labs: ${labCount} results to review\n• Pending Rx: ${pendingRxList.length} prescriptions awaiting approval\n• Draft notes: ${draftNotes.length} unsigned\n• CDSS alerts: ${alertCount} active${alertCount > 0 ? ' — review recommended' : ''}`,
      status: 'info',
    },
    'cdss alert': {
      response: alertCount > 0
        ? `${alertCount} active CDSS alert${alertCount > 1 ? 's' : ''} requiring review:\n${criticalAlerts.filter(a => !a.dismissed).slice(0, 3).map(a => `• [${a.severity.toUpperCase()}] ${a.title}: ${a.message.substring(0, 80)}...`).join('\n')}\nOpening CDSS overview for full details.`
        : 'No active CDSS alerts. All clinical decision support checks have been reviewed.',
      action: alertCount > 0 ? () => navigate('/doctor/cdss') : undefined,
      status: alertCount > 0 ? 'success' : 'info',
    },
    'check loa': {
      response: loaEnabled
        ? 'Opening LOA review dashboard. You can review, approve, or deny pending Letter of Authorization requests.'
        : 'LOA feature is not enabled for the current tenant.',
      action: loaEnabled ? () => navigate('/doctor/loa') : undefined,
      status: 'info',
    },
    'draft note': {
      response: draftNotes.length > 0
        ? `You have ${draftNotes.length} unsigned draft note${draftNotes.length > 1 ? 's' : ''}:\n${draftNotes.slice(0, 3).map(n => `• ${n.patientName} — ${n.date}`).join('\n')}\nNavigate to encounter to review and sign.`
        : 'No unsigned draft notes. All clinical notes are signed and finalized.',
      status: draftNotes.length > 0 ? 'success' : 'info',
    },
    'pending prescription': {
      response: pendingRxList.length > 0
        ? `${pendingRxList.length} prescription${pendingRxList.length > 1 ? 's' : ''} awaiting approval:\n${pendingRxList.slice(0, 3).map(p => `• ${p.patientName}: ${p.medication} ${p.dosage}`).join('\n')}`
        : 'No pending prescriptions. All prescriptions are approved.',
      status: pendingRxList.length > 0 ? 'success' : 'info',
    },
  };

  const processCommand = useCallback((input: string) => {
    const lower = input.toLowerCase().trim();
    setAiProcessing(true);
    setCommandCount(c => c + 1);

    // Find matching response
    let matched = false;
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    setTimeout(() => {
      for (const [key, val] of Object.entries(aiResponses)) {
        if (lower.includes(key)) {
          setCommandHistory(prev => [...prev, { cmd: input, response: val.response, time: now, status: val.status }]);
          if (val.action) val.action();
          matched = true;
          break;
        }
      }
      if (!matched) {
        setCommandHistory(prev => [...prev, {
          cmd: input,
          response: `Processing: "${input}"\nCommand acknowledged. I've noted this in the clinical workflow. You can refine this command or try: "order labs", "prescribe medication", "generate SOAP note", "check vitals", "show schedule".`,
          time: now,
          status: 'info',
        }]);
      }
      setAiProcessing(false);
      setAiInput('');
      setTimeout(() => aiScrollRef.current?.scrollTo({ top: aiScrollRef.current.scrollHeight, behavior: 'smooth' }), 100);
    }, 800 + Math.random() * 600); // Simulate processing time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labCount, myAppts, firstQueued, inSession, alertCount, queueCount]);

  const handleAiSubmit = () => {
    if (!aiInput.trim() || aiProcessing) return;
    processCommand(aiInput);
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      if (aiInput.trim()) processCommand(aiInput);
    } else {
      setIsListening(true);
      showToast('Listening... speak your command', 'info');
      // Simulate voice input after a delay
      setTimeout(() => {
        const voiceCommands = ['Summarize today', 'Start encounter', 'Next patient', 'Check CDSS alerts', 'Lab results', 'Pending prescriptions'];
        const randomCmd = voiceCommands[Math.floor(Math.random() * voiceCommands.length)];
        setAiInput(randomCmd);
        setTimeout(() => {
          setIsListening(false);
          processCommand(randomCmd);
        }, 1200);
      }, 1500);
    }
  };

  // ===== Tile Definitions (feature-flag gated) =====
  const isClinicMode = doctorMode === 'in-clinic';
  const isTeleMode = doctorMode === 'teleconsult';

  const tiles: DashTile[] = [
    {
      id: 'queue',
      label: 'In-Clinic Queue',
      icon: Users,
      color: isClinicMode ? 'rgba(59, 130, 246, 0.12)' : 'rgba(100,116,139,0.04)',
      iconColor: isClinicMode ? 'var(--color-info)' : 'var(--color-gray-400)',
      route: '/doctor/queue',
      badge: queueCount,
      visible: queueEnabled,
      description: isTeleMode ? 'On Hold' : (queueCount > 0 ? `${queueCount} waiting` : 'No patients'),
      inactive: isTeleMode,
    },
    {
      id: 'teleconsult',
      label: teleconsultNowEnabled ? 'Teleconsult Queue' : 'Teleconsult',
      icon: Video,
      color: teleconsultNowEnabled
        ? (isTeleMode ? 'rgba(139, 92, 246, 0.12)' : 'rgba(100,116,139,0.04)')
        : 'rgba(139, 92, 246, 0.06)',
      iconColor: teleconsultNowEnabled
        ? (isTeleMode ? 'var(--color-purple-dark)' : 'var(--color-gray-400)')
        : 'var(--color-purple-dark)',
      route: '/doctor/teleconsult',
      badge: teleconsultNowEnabled ? 3 : 0,
      visible: teleconsultEnabled,
      description: teleconsultNowEnabled
        ? (isClinicMode ? 'On Hold · 3 waiting' : '3 patients waiting')
        : 'Schedule only',
      inactive: teleconsultNowEnabled && isClinicMode,
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: Calendar,
      color: 'var(--color-primary-light)',
      iconColor: 'var(--color-primary)',
      route: '/doctor/schedule',
      badge: myAppts.length,
      visible: true,
      description: `${myAppts.length} today`,
    },
    {
      id: 'encounter',
      label: 'Encounter',
      icon: Stethoscope,
      color: 'rgba(139, 92, 246, 0.1)',
      iconColor: 'var(--color-purple)',
      route: '/doctor/encounter',
      badge: inSession ? 1 : 0,
      visible: true,
      description: inSession ? 'In session' : 'No active',
    },
    {
      id: 'results',
      label: 'Lab Results',
      icon: FlaskConical,
      color: 'rgba(6, 182, 212, 0.1)',
      iconColor: 'var(--color-cyan)',
      route: '/doctor/results',
      badge: labCount,
      visible: labsEnabled,
      description: labCount > 0 ? `${labCount} pending` : 'All reviewed',
    },
    {
      id: 'prescriptions',
      label: 'Prescriptions',
      icon: Pill,
      color: 'rgba(245, 158, 11, 0.1)',
      iconColor: 'var(--color-warning)',
      route: '/doctor/prescriptions',
      badge: rxCount,
      visible: true,
      description: rxCount > 0 ? `${rxCount} refills` : 'Up to date',
    },
    {
      id: 'cdss',
      label: 'CDSS Alerts',
      icon: ShieldAlert,
      color: 'rgba(239, 68, 68, 0.08)',
      iconColor: 'var(--color-error)',
      route: '/doctor/cdss',
      badge: alertCount,
      visible: hasCDSS,
      description: alertCount > 0 ? `${alertCount} active` : 'All clear',
    },
    {
      id: 'notes',
      label: 'Unsigned Notes',
      icon: FileSignature,
      color: 'rgba(234, 88, 12, 0.1)',
      iconColor: '#ea580c',
      route: '/doctor/encounter',
      badge: noteCount,
      visible: true,
      description: noteCount > 0 ? `${noteCount} draft${noteCount > 1 ? 's' : ''} to sign` : 'All signed',
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: ClipboardList,
      color: 'rgba(100, 116, 139, 0.1)',
      iconColor: 'var(--color-gray-500)',
      route: '/doctor/tasks',
      badge: labCount + rxCount + noteCount,
      visible: true,
      description: [
        labCount > 0 ? `${labCount} lab${labCount > 1 ? 's' : ''}` : '',
        rxCount > 0 ? `${rxCount} Rx` : '',
        noteCount > 0 ? `${noteCount} note${noteCount > 1 ? 's' : ''}` : '',
      ].filter(Boolean).join(' · ') || 'All clear',
    },
    {
      id: 'immunizations',
      label: 'Immunizations',
      icon: Syringe,
      color: 'rgba(16, 185, 129, 0.1)',
      iconColor: 'var(--color-success)',
      route: '/doctor/immunizations',
      badge: 0,
      visible: true,
      description: 'Records',
    },
    {
      id: 'loa',
      label: 'LOA Review',
      icon: FileCheck,
      color: 'rgba(245, 158, 11, 0.08)',
      iconColor: 'var(--color-warning-dark)',
      route: '/doctor/loa',
      badge: loaPendingCount,
      visible: false,
      description: loaPendingCount > 0 ? `${loaPendingCount} pending review` : 'No pending',
    },
  ];

  // Map tile IDs to the module key used by role access
  const TILE_MODULE_MAP: Record<string, string> = {
    queue: 'queue',
    schedule: 'schedule',
    encounter: 'encounter',
    results: 'results',
    prescriptions: 'prescriptions',
    cdss: 'cdss',
    notes: 'encounter',     // Clinical notes are part of encounter
    teleconsult: 'teleconsult',
    tasks: 'tasks',
    immunizations: 'immunizations',
    loa: 'loa',
    'care-plans': 'care-plans',
    messages: 'messages',
  };

  const currentRole = currentStaff?.role ?? 'doctor';
  const visibleTiles = tiles.filter(t => {
    if (!t.visible) return false;
    // Also check role-based module access
    const moduleKey = TILE_MODULE_MAP[t.id] ?? t.id;
    return isDoctorModuleAllowed(currentRole, moduleKey);
  });

  // ===== RENDER =====
  return (
    <div className="doc-today">
      {/* ===== Header ===== */}
      <header className="doc-today-header">
        <div>
          <h1 className="doc-today-greeting">
            {getGreeting()}, {currentRole === 'doctor' ? 'Dr.' : ''} {currentStaff?.name?.replace(/^Dr\.\s*/i, '').split(' ')[0] ?? 'Doctor'}
          </h1>
          <div className="doc-today-date">
            {todayStr}
            {currentStaff?.specialty && <span className="doc-today-specialty">{currentStaff.specialty}</span>}
          </div>
        </div>
      </header>

      {/* Quick stats row — matches queue page stat chips */}
      <div className="doc-stats-bar">
        <div className="doc-stat-chip">
          <div className="doc-stat-value" style={{ color: 'var(--color-success)' }}>{queueStats.completedToday}</div>
          <div className="doc-label-sm">Seen today</div>
        </div>
        <div className="doc-stat-chip">
          <div className="doc-stat-value">{queueStats.avgWaitTime || 8} min</div>
          <div className="doc-label-sm">Avg wait</div>
        </div>
        {queueEnabled && (
          <div className="doc-stat-chip">
            <div className="doc-stat-value" style={{ color: 'var(--color-warning)' }}>{queueStats.totalInQueue}</div>
            <div className="doc-label-sm">In my queue</div>
          </div>
        )}
      </div>

      {/* ===== Active Mode Indicator (only when live teleconsult NOW is available) ===== */}
      {hasLiveQueue && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', borderRadius: 10, marginBottom: 2,
          background: doctorMode === 'teleconsult' ? 'rgba(124,58,237,0.05)' : 'rgba(59,130,246,0.04)',
          border: `1px solid ${doctorMode === 'teleconsult' ? 'rgba(124,58,237,0.12)' : 'rgba(59,130,246,0.1)'}`,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: doctorMode === 'teleconsult' ? 'var(--color-purple-dark)' : 'var(--color-primary)',
            boxShadow: `0 0 6px ${doctorMode === 'teleconsult' ? 'rgba(124,58,237,0.5)' : 'rgba(59,130,246,0.4)'}`,
            animation: 'pulse 2s infinite',
          }} />
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: doctorMode === 'teleconsult' ? 'var(--color-purple-dark)' : 'var(--color-primary)' }}>
            {doctorMode === 'teleconsult' ? (
              <>
                <Video size={13} style={{ marginRight: 5, verticalAlign: 'text-bottom' }} />
                Teleconsult Mode — In-clinic queue on hold
              </>
            ) : (
              <>
                <Building2 size={13} style={{ marginRight: 5, verticalAlign: 'text-bottom' }} />
                In-Clinic Mode — Teleconsult queue on hold
              </>
            )}
          </span>
          <button
            onClick={() => navigate(doctorMode === 'teleconsult' ? '/doctor/teleconsult' : '/doctor/queue')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, color: doctorMode === 'teleconsult' ? 'var(--color-purple-dark)' : 'var(--color-primary)',
              textDecoration: 'underline', padding: 0,
            }}
          >
            {doctorMode === 'teleconsult' ? 'View teleconsult →' : 'View queue →'}
          </button>
        </div>
      )}

      {/* ===== Active Teleconsult Encounter Card ===== */}
      {activeTeleconsultCall && (
        <div
          onClick={() => navigate('/doctor/teleconsult')}
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: isDesktop ? '14px 20px' : '12px 14px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(99,102,241,0.04))',
            border: '1.5px solid rgba(124,58,237,0.2)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: 2,
            boxShadow: '0 2px 8px rgba(124,58,237,0.08)',
          }}
        >
          {/* Pulsing video indicator */}
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--color-purple-dark), var(--color-indigo))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', flexShrink: 0,
          }}>
            <Video size={20} style={{ color: '#fff' }} />
            <span style={{
              position: 'absolute', top: -2, right: -2,
              width: 10, height: 10, borderRadius: '50%',
              background: '#4ade80',
              border: '2px solid var(--color-surface)',
              animation: 'pulse 2s infinite',
            }} />
          </div>

          {/* Call info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-purple-dark)', marginBottom: 2 }}>
              Active Teleconsult — {activeTeleconsultCall.patientName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-text-muted)' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                background: 'rgba(74,222,128,0.1)', color: 'var(--color-success-dark)',
                padding: '2px 8px', borderRadius: 6, fontWeight: 700, fontSize: 11,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-success-dark)', animation: 'pulse 2s infinite' }} />
                LIVE
              </span>
              <Clock size={11} /> {formatCallTime(tcElapsed)}
              {activeTeleconsultCall.chiefComplaint && (
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  · {activeTeleconsultCall.chiefComplaint}
                </span>
              )}
            </div>
          </div>

          {/* Return button */}
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/doctor/teleconsult'); }}
            style={{
              padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, var(--color-purple-dark), var(--color-indigo))', color: '#fff',
              fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5,
              boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
              flexShrink: 0,
            }}
          >
            <Video size={14} /> Return to Call
          </button>
        </div>
      )}

      {/* ===== AI & Voice Assistant Section — hidden for now ===== */}
      {false && <section style={{
        background: aiEnabled
          ? 'linear-gradient(135deg, var(--color-gray-900) 0%, var(--color-gray-800) 60%, var(--color-gray-900) 100%)'
          : 'linear-gradient(135deg, var(--color-gray-800) 0%, var(--color-gray-700) 60%, var(--color-gray-800) 100%)',
        borderRadius: 16,
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${!aiEnabled ? 'rgba(148,163,184,0.15)' : isListening ? 'rgba(34, 197, 94, 0.5)' : 'rgba(99, 102, 241, 0.25)'}`,
        boxShadow: !aiEnabled ? '0 2px 12px rgba(0,0,0,0.08)' : isListening ? '0 4px 24px rgba(34, 197, 94, 0.2)' : '0 4px 24px rgba(99, 102, 241, 0.12)',
        transition: 'all 0.3s ease',
        opacity: aiEnabled ? 1 : 0.85,
      }}>
        {/* Decorative background glow */}
        {aiEnabled && <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />}

        {/* Collapsible Header */}
        <button
          onClick={() => {
            if (!aiEnabled) return;
            setAiCollapsed(!aiCollapsed);
          }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
            padding: aiCollapsed ? '16px 18px' : (isDesktop ? '24px 28px 0' : '16px 18px'),
            background: 'none', border: 'none', color: '#fff', cursor: aiEnabled ? 'pointer' : 'default',
            ...(aiCollapsed ? { paddingBottom: 16 } : {}),
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: !aiEnabled ? 'rgba(148,163,184,0.15)' : isListening ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, var(--color-indigo), var(--color-purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              transition: 'background 0.3s',
              animation: aiEnabled && isListening ? 'pulse 1.5s infinite' : 'none',
            }}>
              {!aiEnabled ? <AudioWaveform size={22} color="#64748b" /> : isListening ? <Mic size={22} color="#fff" /> : <AudioWaveform size={22} color="#fff" />}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: isDesktop ? 17 : 15, fontWeight: 700, letterSpacing: '-0.01em', color: aiEnabled ? '#fff' : 'var(--color-gray-400)' }}>AI Clinical Assistant</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                {aiEnabled ? (
                  <>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: isListening ? '#22c55e' : 'var(--color-indigo)', display: 'inline-block', animation: 'pulse 2s infinite', boxShadow: `0 0 6px ${isListening ? 'rgba(34,197,94,0.6)' : 'rgba(99,102,241,0.5)'}` }} />
                    <span style={{ fontSize: 12, color: 'var(--color-gray-400)' }}>{isListening ? 'Listening...' : aiProcessing ? 'Processing...' : 'Ready'} · {commandCount} commands today</span>
                  </>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--color-gray-500)' }}>Tap toggle to activate AI assistant</span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* ON/OFF Master toggle */}
            <span
              onClick={(e) => {
                e.stopPropagation();
                const next = !aiEnabled;
                setAiEnabled(next);
                if (next) { setAiCollapsed(false); } else { setAiCollapsed(true); setIsListening(false); setHandsFreeMode(false); }
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: aiEnabled ? 'rgba(99, 102, 241, 0.2)' : 'rgba(148, 163, 184, 0.12)',
                border: `1px solid ${aiEnabled ? 'rgba(99, 102, 241, 0.35)' : 'rgba(148, 163, 184, 0.2)'}`,
                borderRadius: 10, padding: '6px 12px', cursor: 'pointer',
                color: aiEnabled ? '#818cf8' : 'var(--color-gray-500)', fontSize: 12, fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >
              {aiEnabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              {aiEnabled ? 'ON' : 'OFF'}
            </span>
            {aiEnabled && (aiCollapsed ? <ChevronDown size={18} style={{ color: 'var(--color-gray-400)' }} /> : <ChevronUp size={18} style={{ color: 'var(--color-gray-400)' }} />)}
          </div>
        </button>

        {/* Collapsible Body — only when AI is enabled and expanded */}
        {aiEnabled && !aiCollapsed && (
          <div style={{ padding: isDesktop ? '16px 28px 24px' : '12px 18px 18px' }}>

            {/* Hands-Free Mode Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span
                onClick={() => setHandsFreeMode(!handsFreeMode)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: handsFreeMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(148, 163, 184, 0.1)',
                  border: `1px solid ${handsFreeMode ? 'rgba(34, 197, 94, 0.3)' : 'rgba(148, 163, 184, 0.15)'}`,
                  borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                  color: handsFreeMode ? '#4ade80' : 'var(--color-gray-400)', fontSize: 12, fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                {handsFreeMode ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                Hands-Free Mode
              </span>
              {handsFreeMode && (
                <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 500 }}>
                  Voice commands active — speak to interact
                </span>
              )}
            </div>

            {/* Quick Command Chips (clickable) */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              {[
                { cmd: 'Start encounter', icon: Stethoscope },
                { cmd: 'Summarize today', icon: Zap },
                { cmd: 'Next patient', icon: Users },
                { cmd: 'Show schedule', icon: Calendar },
                { cmd: 'Check CDSS alerts', icon: ShieldAlert },
                { cmd: 'Lab results', icon: FlaskConical },
                { cmd: 'Draft notes', icon: FileCheck },
                { cmd: 'Pending prescriptions', icon: Pill },
                { cmd: 'Generate SOAP note', icon: FileText },
                { cmd: 'Check vitals', icon: Activity },
              ].map(({ cmd, icon: CmdIcon }) => (
                <button key={cmd} onClick={() => processCommand(cmd)} disabled={aiProcessing} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255, 255, 255, 0.05)', borderRadius: 8, padding: '7px 12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)', cursor: aiProcessing ? 'wait' : 'pointer',
                  color: 'var(--color-gray-300)', fontSize: 12, fontWeight: 500, transition: 'all 0.15s',
                  opacity: aiProcessing ? 0.5 : 1,
                }}>
                  <CmdIcon size={12} style={{ color: '#818cf8' }} />
                  {cmd}
                </button>
              ))}
            </div>

            {/* Command History / Transcript */}
            {commandHistory.length > 0 && (
              <div ref={aiScrollRef} style={{
                maxHeight: 220, overflowY: 'auto', marginBottom: 14,
                background: 'rgba(0, 0, 0, 0.3)', borderRadius: 10, padding: 12,
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                {commandHistory.map((entry, i) => (
                  <div key={i}>
                    {/* User command */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <User size={12} style={{ color: '#818cf8' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-gray-200)' }}>{entry.cmd}</div>
                        <div style={{ fontSize: 10, color: 'var(--color-gray-600)' }}>{entry.time}</div>
                      </div>
                    </div>
                    {/* AI response */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, paddingLeft: 4 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: entry.status === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <Bot size={12} style={{ color: entry.status === 'success' ? '#22c55e' : 'var(--color-cyan)' }} />
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-gray-400)', lineHeight: 1.5, whiteSpace: 'pre-wrap', flex: 1 }}>
                        {entry.response}
                      </div>
                    </div>
                  </div>
                ))}
                {aiProcessing && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 4 }}>
                    <Loader2 size={14} style={{ color: '#818cf8', animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: 12, color: 'var(--color-gray-500)', fontStyle: 'italic' }}>Processing command...</span>
                  </div>
                )}
              </div>
            )}

            {/* Input Bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255, 255, 255, 0.06)', borderRadius: 12,
              padding: '4px 4px 4px 14px',
              border: `1px solid ${isListening ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
              transition: 'border-color 0.2s',
            }}>
              <input
                type="text"
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAiSubmit()}
                placeholder={isListening ? 'Listening... speak now' : 'Type a command or click mic to speak...'}
                disabled={aiProcessing}
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: 'var(--color-gray-200)', fontSize: 13, padding: '8px 0',
                  fontFamily: 'inherit',
                }}
              />
              {aiInput && !aiProcessing && (
                <button onClick={() => setAiInput('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
                  <X size={14} style={{ color: 'var(--color-gray-500)' }} />
                </button>
              )}
              <button onClick={toggleListening} style={{
                width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: isListening ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', animation: isListening ? 'pulse 1.5s infinite' : 'none',
              }}>
                {isListening ? <MicOff size={16} color="#fff" /> : <Mic size={16} style={{ color: 'var(--color-gray-400)' }} />}
              </button>
              <button onClick={handleAiSubmit} disabled={!aiInput.trim() || aiProcessing} style={{
                width: 36, height: 36, borderRadius: 10, border: 'none', cursor: aiInput.trim() && !aiProcessing ? 'pointer' : 'default',
                background: aiInput.trim() && !aiProcessing ? 'linear-gradient(135deg, var(--color-indigo), var(--color-purple))' : 'rgba(255,255,255,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
              }}>
                {aiProcessing ? <Loader2 size={16} style={{ color: '#818cf8', animation: 'spin 1s linear infinite' }} /> : <Send size={16} style={{ color: aiInput.trim() ? '#fff' : 'var(--color-gray-600)' }} />}
              </button>
            </div>

            {/* Stats Row */}
            <div style={{
              display: 'flex', gap: isDesktop ? 24 : 12, flexWrap: 'wrap',
              padding: '12px 14px', marginTop: 14,
              background: 'rgba(255, 255, 255, 0.04)', borderRadius: 10,
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 120 }}>
                <MessageSquare size={14} style={{ color: 'var(--color-indigo)' }} />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-200)' }}>{commandCount}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-gray-500)' }}>Commands today</div>
                </div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 120 }}>
                <FileText size={14} style={{ color: 'var(--color-purple)' }} />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-200)' }}>{soapCount}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-gray-500)' }}>AI SOAP notes</div>
                </div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 120 }}>
                <Zap size={14} style={{ color: '#22c55e' }} />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-200)' }}>98.4%</div>
                  <div style={{ fontSize: 10, color: 'var(--color-gray-500)' }}>Accuracy</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>}

      {/* ===== In-clinic patient cards (hidden when in teleconsult mode) ===== */}
      {doctorMode === 'in-clinic' && (
        <>
          {/* Step 3: IN_SESSION — Continue encounter */}
          {inSession && (
            <div className="doc-active-patient" onClick={() => navigate('/doctor/encounter')}>
              <div className="doc-active-patient-pulse" />
              <div className="doc-active-patient-info">
                <span className="doc-active-patient-label">In Session</span>
                <span className="doc-active-patient-name">{inSession.patientName}</span>
                <span className="doc-active-patient-meta">
                  <Clock size={12} /> {inSession.waitMinutes}m
                  {inSession.chiefComplaint && <> · {inSession.chiefComplaint}</>}
                </span>
              </div>
              <button className="doc-active-patient-btn" onClick={(e) => { e.stopPropagation(); navigate('/doctor/encounter'); }}>
                <Play size={16} /> Continue
              </button>
            </div>
          )}

          {/* Step 2: READY — Start consult */}
          {!inSession && firstReady && (
            <div className="doc-next-patient doc-next-patient--ready">
              <div className="doc-next-patient-info">
                <span className="doc-next-patient-label doc-next-patient-label--ready">Patient Ready</span>
                <span className="doc-next-patient-name">{firstReady.patientName}</span>
                <span className="doc-next-patient-meta">
                  {firstReady.ticketNumber} · {firstReady.waitMinutes}m wait
                  {firstReady.chiefComplaint && <> · {firstReady.chiefComplaint}</>}
                </span>
              </div>
              <button className="doc-next-patient-btn doc-next-patient-btn--start" onClick={handleStartConsult}>
                <Stethoscope size={16} /> Start Consult
              </button>
            </div>
          )}

          {/* Step 1: QUEUED — Call patient */}
          {!inSession && !firstReady && firstQueued && (
            <div className="doc-next-patient">
              <div className="doc-next-patient-info">
                <span className="doc-next-patient-label">Next in Queue</span>
                <span className="doc-next-patient-name">{firstQueued.patientName}</span>
                <span className="doc-next-patient-meta">
                  {firstQueued.ticketNumber} · {firstQueued.waitMinutes}m wait
                  {firstQueued.priority !== 'Normal' && <span className="doc-next-priority">{firstQueued.priority}</span>}
                </span>
              </div>
              <button className="doc-next-patient-btn" onClick={handleCallPatient}>
                <PhoneCall size={16} /> Call Patient
              </button>
            </div>
          )}
        </>
      )}

      {/* ===== Tile Grid ===== */}
      <section className="doc-tiles-section">
        <div className="doc-tiles-grid">
          {visibleTiles.map((tile) => {
            const Icon = tile.icon;
            const dimmed = !!tile.inactive;
            const handleTileClick = () => {
              if (tile.id === 'notes' && draftNotes.length > 0) {
                const dn = draftNotes[0];
                navigate('/doctor/encounter', { state: { patientId: dn.patientId, patientName: dn.patientName } });
              } else {
                navigate(tile.route);
              }
            };
            return (
              <button
                key={tile.id}
                className={`doc-tile ${(tile.badge ?? 0) > 0 ? 'doc-tile--has-badge' : ''} ${dimmed ? 'doc-tile--inactive' : ''}`}
                onClick={handleTileClick}
              >
                <div className="doc-tile-icon" style={{ background: tile.color }}>
                  <span style={{ color: tile.iconColor }}><Icon size={22} /></span>
                  {(tile.badge ?? 0) > 0 && (
                    <span className={`doc-tile-badge ${dimmed ? 'doc-tile-badge--muted' : ''}`}>{tile.badge}</span>
                  )}
                </div>
                <span className="doc-tile-label">{tile.label}</span>
                <span className="doc-tile-desc">{tile.description}</span>
                {dimmed && <span className="doc-tile-paused">PAUSED</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* ===== Today's Schedule (compact) ===== */}
      <section className="doc-today-schedule">
        <div className="doc-today-section-header">
          <span className="doc-today-section-title">Today's Schedule</span>
          <button className="doc-today-section-link" onClick={() => navigate('/doctor/schedule')}>
            View all <ChevronRight size={14} />
          </button>
        </div>
        {myAppts.length === 0 ? (
          <div className="doc-today-empty">No appointments scheduled for today</div>
        ) : (
          <div className="doc-today-schedule-list">
            {myAppts.slice(0, isDesktop ? 6 : 4).map(apt => (
              <div key={apt.id} className="doc-today-schedule-item" onClick={() => navigate('/doctor/schedule')}>
                <span className="doc-today-schedule-time">{apt.time}</span>
                <div className="doc-today-schedule-info">
                  <span className="doc-today-schedule-name">{apt.specialty}</span>
                  <span className="doc-today-schedule-type">
                    {apt.type === 'Teleconsult' ? '📹 Tele' : '🏥 In-Person'}
                  </span>
                </div>
                <span className={`doc-today-schedule-status doc-today-schedule-status--${(apt.status ?? 'confirmed').toLowerCase().replace(/\s/g, '-')}`}>
                  {apt.status ?? 'Confirmed'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== CDSS Alerts Banner (if any critical) ===== */}
      {hasCDSS && alertCount > 0 && (
        <section className="doc-today-alerts">
          <div className="doc-today-section-header">
            <span className="doc-today-section-title">
              <AlertTriangle size={16} style={{ color: 'var(--color-error)', marginRight: 6 }} />
              Clinical Alerts
            </span>
            <button className="doc-today-section-link" onClick={() => navigate('/doctor/encounter')}>
              Review <ChevronRight size={14} />
            </button>
          </div>
          <div className="doc-today-alert-strip">
            {criticalAlerts.filter(a => !a.dismissed).slice(0, 2).map(alert => (
              <div key={alert.id} className="doc-today-alert-chip">
                <AlertTriangle size={14} />
                <span>{alert.title}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== Interoperability Status Card ===== */}
      <section style={{
        background: 'var(--color-surface, #fff)',
        borderRadius: 14,
        border: '1px solid var(--color-border, #e2e8f0)',
        padding: isDesktop ? '20px 24px' : '16px 18px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(6, 182, 212, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Radio size={18} style={{ color: 'var(--color-cyan)' }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text, #1e293b)' }}>Interoperability Status</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary, #64748b)', marginTop: 1 }}>Last sync: 2 min ago</div>
            </div>
          </div>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--color-cyan)',
            background: 'rgba(6, 182, 212, 0.08)',
            padding: '4px 10px',
            borderRadius: 8,
          }}>
            All Systems Online
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr',
          gap: 10,
          marginBottom: 14,
        }}>
          {/* FHIR R4 API */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(16, 185, 129, 0.04)',
            borderRadius: 10,
            padding: '12px 14px',
            border: '1px solid rgba(16, 185, 129, 0.12)',
          }}>
            <Activity size={18} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text, #1e293b)' }}>FHIR R4 API</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary, #64748b)' }}>HL7 FHIR Release 4</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#22c55e',
                display: 'inline-block',
                boxShadow: '0 0 6px rgba(34, 197, 94, 0.5)',
              }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#22c55e' }}>Connected</span>
            </div>
          </div>

          {/* HL7 v2 Engine */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(16, 185, 129, 0.04)',
            borderRadius: 10,
            padding: '12px 14px',
            border: '1px solid rgba(16, 185, 129, 0.12)',
          }}>
            <Wifi size={18} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text, #1e293b)' }}>HL7 v2 Engine</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary, #64748b)' }}>Message processing</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#22c55e',
                display: 'inline-block',
                boxShadow: '0 0 6px rgba(34, 197, 94, 0.5)',
              }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#22c55e' }}>Active</span>
            </div>
          </div>
        </div>

        {/* Transaction stats */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isDesktop ? 32 : 16,
          padding: '10px 0 2px',
          borderTop: '1px solid var(--color-border, #e5e7eb)',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={14} style={{ color: 'var(--color-indigo)' }} />
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary, #64748b)' }}>
              Today: <strong style={{ color: 'var(--color-text, #1e293b)' }}>1,247</strong> FHIR transactions
            </span>
          </div>
          <span style={{ color: 'var(--color-border, #d1d5db)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Radio size={14} style={{ color: 'var(--color-purple)' }} />
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary, #64748b)' }}>
              <strong style={{ color: 'var(--color-text, #1e293b)' }}>892</strong> HL7 messages
            </span>
          </div>
        </div>
      </section>

      {/* ===== AI Features Promo (if enabled) ===== */}
      {hasAI && !inSession && (
        <div className="doc-ai-promo" onClick={() => navigate('/doctor/encounter')}>
          <Sparkles size={20} className="doc-ai-promo-icon" />
          <div className="doc-ai-promo-text">
            <span className="doc-ai-promo-title">AI Transcriber Ready</span>
            <span className="doc-ai-promo-desc">Auto-generate SOAP notes during consultations</span>
          </div>
          <ChevronRight size={18} className="doc-ai-promo-chevron" />
        </div>
      )}
    </div>
  );
};
