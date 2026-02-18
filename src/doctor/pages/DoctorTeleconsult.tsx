import { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MessageSquare,
  Monitor,
  Clock,
  FileText,
  Send,
  Calendar,
  FileCheck,
  Minimize2,
  Maximize2,
  FileSignature,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Pill,
  ClipboardList,
  CheckCircle2,
  X,
  Plus,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  Building2,
  PauseCircle,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useProvider } from '../../provider/context/ProviderContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../theme/ThemeContext';
import { SoapNotePanel } from '../components/SoapNotePanel';
import './DoctorTeleconsult.css';

type EncounterTab = 'soap' | 'ai' | 'cdss' | 'orders' | 'prescriptions';

interface WaitingPatient {
  id: string;
  patientId: string;
  name: string;
  waitMin: number;
  complaint: string;
  age: number;
  sex: string;
  intake: {
    chiefComplaint: string;
    duration: string;
    history: string;
    allergies: string[];
    currentMeds: string[];
    vitals?: string;
    painScale?: number;
    lastVisit?: string;
    preferredPharmacy?: string;
  };
}

const MOCK_WAITING: WaitingPatient[] = [
  {
    id: 'tc-1', patientId: 'p-tc-1', name: 'Maria Santos', waitMin: 5, complaint: 'Cough & Cold', age: 34, sex: 'F',
    intake: {
      chiefComplaint: 'Persistent dry cough for 2 weeks, worse at night. Occasional runny nose.',
      duration: '14 days',
      history: 'No fever. No chest pain. Mild throat irritation. No recent travel.',
      allergies: ['Penicillin'],
      currentMeds: ['Loratadine 10mg daily'],
      vitals: 'BP 120/78, HR 76, Temp 36.8°C, SpO2 98%',
      painScale: 2,
      lastVisit: '2025-11-15 — Annual checkup, no findings',
      preferredPharmacy: 'Mercury Drug - Makati',
    },
  },
  {
    id: 'tc-2', patientId: 'p-tc-2', name: 'Jose Reyes', waitMin: 12, complaint: 'Follow-up BP', age: 58, sex: 'M',
    intake: {
      chiefComplaint: 'Follow-up on blood pressure management. Occasional dizziness in the morning.',
      duration: 'Ongoing — 3 months since last adjustment',
      history: 'Hypertension Dx 2020. Type 2 DM since 2018. No recent ER visits. Compliant with meds.',
      allergies: ['Sulfa drugs', 'Shellfish'],
      currentMeds: ['Losartan 50mg daily', 'Metformin 500mg BID', 'Aspirin 81mg daily', 'Atorvastatin 20mg nightly'],
      vitals: 'BP 142/88, HR 82, Temp 36.6°C, SpO2 97%',
      painScale: 0,
      lastVisit: '2025-12-20 — BP slightly elevated, increased Losartan from 25mg to 50mg',
      preferredPharmacy: 'Watsons - Quezon City',
    },
  },
  {
    id: 'tc-3', patientId: 'p-tc-3', name: 'Ana Lopez', waitMin: 2, complaint: 'Skin rash', age: 27, sex: 'F',
    intake: {
      chiefComplaint: 'Red, itchy rash on both forearms and chest for 3 days. No blisters.',
      duration: '3 days',
      history: 'Started new laundry detergent last week. No new foods. No fever. No prior history of eczema.',
      allergies: [],
      currentMeds: [],
      vitals: 'BP 110/72, HR 68, Temp 36.5°C, SpO2 99%',
      painScale: 3,
      lastVisit: 'None on file — new patient',
    },
  },
];

const MOCK_INTAKE = {
  chiefComplaint: 'Persistent dry cough for 2 weeks.',
  duration: '14 days.',
  history: 'No fever. No chest pain.',
  allergies: 'Penicillin',
  currentMeds: 'Loratadine 10mg daily',
};

const MOCK_SUMMARY = `Patient presented with persistent dry cough for 2 weeks. No fever or chest pain. Assessment: Acute bronchitis likely viral etiology. Plan: Supportive care, cough suppressants PRN, return if fever develops or symptoms persist >1 week.`;

const MOCK_CHAT = [
  { from: 'patient', text: 'Hello Doctor, I have a dry cough.' },
  { from: 'doctor', text: 'How long have you had it?' },
  { from: 'patient', text: 'About 2 weeks now.' },
];

const MOCK_TRANSCRIPT_LINES = [
  { speaker: 'doctor' as const, text: 'What brings you in today?', ts: '00:05' },
  { speaker: 'patient' as const, text: "I've been having a persistent dry cough for about two weeks now.", ts: '00:12' },
  { speaker: 'doctor' as const, text: 'Any fever, chest pain, or shortness of breath?', ts: '00:24' },
  { speaker: 'patient' as const, text: 'No fever. No chest pain. Sometimes a bit short of breath climbing stairs.', ts: '00:38' },
  { speaker: 'doctor' as const, text: 'Any history of allergies or asthma?', ts: '00:52' },
  { speaker: 'patient' as const, text: 'I have mild seasonal allergies but no asthma.', ts: '01:04' },
  { speaker: 'doctor' as const, text: 'Are you taking any medications currently?', ts: '01:18' },
  { speaker: 'patient' as const, text: 'Just Loratadine for my allergies.', ts: '01:26' },
];

const AI_DELIMITER = '⌁AI⌁';
const AI_SOAP_APPEND = {
  subjective: `\n\n${AI_DELIMITER}\nPatient reports persistent dry cough for 2 weeks. No fever. No chest pain. Mild shortness of breath on exertion. Currently taking Loratadine 10mg daily for seasonal allergies. No asthma history.`,
  objective: `\n\n${AI_DELIMITER}\nVS: BP 120/78, HR 76, RR 16, Temp 36.8°C, SpO2 98%.\nAppearance: Alert, comfortable, no distress via video.\nThroat: Patient reports mild throat irritation.\nLungs: Patient denies wheezing (auscultation not possible via teleconsult).`,
  assessment: `\n\n${AI_DELIMITER}\nAcute bronchitis, likely viral etiology (ICD-10: J20.9).\nDDx: Post-nasal drip, allergic cough, early asthma.`,
  plan: `\n\n${AI_DELIMITER}\n1. Dextromethorphan 15mg PO q6h PRN for cough\n2. Honey and warm fluids for symptom relief\n3. Continue Loratadine for allergy management\n4. Return if fever develops or symptoms persist > 1 week\n5. Consider in-person visit for auscultation if no improvement in 7 days`,
};

const QUICK_ORDERS: { name: string; type: 'Laboratory' | 'Imaging' | 'Cardio' }[] = [
  { name: 'CBC', type: 'Laboratory' },
  { name: 'FBS', type: 'Laboratory' },
  { name: 'Lipid Panel', type: 'Laboratory' },
  { name: 'Urinalysis', type: 'Laboratory' },
  { name: 'CRP', type: 'Laboratory' },
  { name: 'Chest X-Ray', type: 'Imaging' },
  { name: 'ECG', type: 'Cardio' },
  { name: 'Sputum Culture', type: 'Laboratory' },
];

const QUICK_RX: { medication: string; dosage: string; frequency: string; duration: string }[] = [
  { medication: 'Dextromethorphan', dosage: '15mg', frequency: 'Every 6 hours PRN', duration: '7 days' },
  { medication: 'Ambroxol', dosage: '30mg', frequency: 'Three times daily', duration: '5 days' },
  { medication: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '14 days' },
  { medication: 'Azithromycin', dosage: '500mg', frequency: 'Once daily', duration: '3 days' },
  { medication: 'Salbutamol Nebule', dosage: '2.5mg', frequency: 'As needed', duration: '7 days' },
];

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

export const DoctorTeleconsult = () => {
  const {
    currentStaff,
    clinicalNotes,
    cdssAlerts,
    dismissAlert,
    prescriptions,
    addPrescription,
    addLabOrder,
    saveDraftNote,
    signNote,
    doctorMode,
    setDoctorMode,
    todayAppointments,
    appointments,
    activeTeleconsultCall,
    setActiveTeleconsultCall,
  } = useProvider();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { tenant } = useTheme();

  const hasCDSS = tenant.features.cdss ?? false;
  const hasAI = tenant.features.aiAssistant ?? false;
  const labsEnabled = tenant.features.visits.clinicLabFulfillmentEnabled;
  const teleconsultNowEnabled = tenant.features.visits.teleconsultNowEnabled;
  const teleconsultLaterEnabled = tenant.features.visits.teleconsultLaterEnabled;

  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024);
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Scheduled teleconsult appointments for this doctor
  const myTeleconsultAppts = appointments
    .filter(a => a.doctor === currentStaff?.name && a.type === 'Teleconsult' && a.status === 'Upcoming')
    .sort((a, b) => {
      const da = new Date(`${a.date} ${a.time}`).getTime();
      const db = new Date(`${b.date} ${b.time}`).getTime();
      return da - db;
    });
  const todayTeleconsultAppts = todayAppointments.filter(a => a.doctor === currentStaff?.name && a.type === 'Teleconsult' && a.status === 'Upcoming');
  const futureTeleconsultAppts = myTeleconsultAppts.filter(a => !todayTeleconsultAppts.some(t => t.id === a.id));

  // Tab for waiting room view: 'now' (live queue) vs 'scheduled'
  const defaultTab = teleconsultNowEnabled ? 'now' as const : 'scheduled' as const;
  const [waitingTab, setWaitingTab] = useState<'now' | 'scheduled'>(defaultTab);

  const [activeCall, setActiveCall] = useState<{ id: string; name: string } | null>(null);
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  const [callEnded, setCallEnded] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [callTimer, setCallTimer] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState(MOCK_CHAT);
  const [chatInput, setChatInput] = useState('');

  // Video minimized + encounter panels
  const [videoMinimized, setVideoMinimized] = useState(false);
  const [encounterTab, setEncounterTab] = useState<EncounterTab>('soap');

  // SOAP state
  const [soapData, setSoapData] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });
  const [soapDirty, setSoapDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [noteSigned, setNoteSigned] = useState(false);

  // AI state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [transcriptLines, setTranscriptLines] = useState<typeof MOCK_TRANSCRIPT_LINES>([]);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Orders state
  const [placedOrders, setPlacedOrders] = useState<Set<string>>(new Set());
  const [orderPending, setOrderPending] = useState<string | null>(null);

  // Prescription state
  const [rxSent, setRxSent] = useState<Set<string>>(new Set());
  const [showQuickRx, setShowQuickRx] = useState(false);

  // Active teleconsult patient data (set when joining a call)
  const [activePatientData, setActivePatientData] = useState<WaitingPatient | null>(null);

  const doctorName = currentStaff?.name ?? 'Doctor';
  const doctorInitials = getInitials(doctorName);
  const firstNote = clinicalNotes[0];
  // Use activePatientData from teleconsult queue, not in-clinic queuePatients
  const teleconsultPatientId = activePatientData?.patientId ?? activeCall?.id ?? null;
  const activeAlerts = cdssAlerts.filter(a => !a.dismissed && a.patientId === teleconsultPatientId);
  const teleconsultPatientName = activePatientData?.name ?? activeCall?.name ?? 'Patient';
  const patientPrescriptions = prescriptions.filter(p =>
    p.patientId === teleconsultPatientId
  ).slice(0, 5);

  // Timer
  useEffect(() => {
    if (!activeCall || callEnded) return;
    const t = setInterval(() => setCallTimer((c) => c + 1), 1000);
    return () => clearInterval(t);
  }, [activeCall, callEnded]);

  // Restore local state from global context when returning to this page with an active call
  useEffect(() => {
    if (activeTeleconsultCall && !activeCall && !callEnded) {
      setActiveCall({ id: activeTeleconsultCall.id, name: activeTeleconsultCall.patientName });
      const pd = MOCK_WAITING.find(p => p.id === activeTeleconsultCall.id) ?? null;
      setActivePatientData(pd);
      // Restore elapsed time from global startedAt
      setCallTimer(Math.floor((Date.now() - activeTeleconsultCall.startedAt) / 1000));
    }
    // Only run on mount / when navigating to this page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recording timer + simulated transcript lines
  useEffect(() => {
    if (!isRecording) return;
    const t = setInterval(() => setRecordSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [isRecording]);

  // Simulate transcript lines appearing
  useEffect(() => {
    if (!isRecording) return;
    const lineIndex = transcriptLines.length;
    if (lineIndex >= MOCK_TRANSCRIPT_LINES.length) return;
    const delay = lineIndex === 0 ? 1500 : 2500 + Math.random() * 2000;
    const timer = setTimeout(() => {
      setTranscriptLines(prev => [...prev, MOCK_TRANSCRIPT_LINES[lineIndex]]);
    }, delay);
    return () => clearTimeout(timer);
  }, [isRecording, transcriptLines.length]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptLines.length]);

  // Load SOAP from notes
  useEffect(() => {
    if (firstNote) {
      setSoapData({
        subjective: firstNote.subjective ?? '',
        objective: firstNote.objective ?? '',
        assessment: firstNote.assessment ?? '',
        plan: firstNote.plan ?? '',
      });
    }
  }, [firstNote?.id]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleJoinCall = (id: string, name: string) => {
    if (doctorMode !== 'teleconsult') setDoctorMode('teleconsult');
    const patientData = MOCK_WAITING.find(p => p.id === id) ?? null;
    setActiveCall({ id, name });
    setActivePatientData(patientData);
    setCallEnded(false);
    setCallTimer(0);
    // Set global state so PiP and encounter card work across pages
    setActiveTeleconsultCall({
      id,
      patientId: patientData?.patientId ?? id,
      patientName: name,
      startedAt: Date.now(),
      chiefComplaint: patientData?.intake.chiefComplaint,
    });
    setVideoMinimized(false);
    setTranscriptLines([]);
    setAiGenerated(false);
    setNoteSigned(false);
    setPlacedOrders(new Set());
    setRxSent(new Set());
    setSoapDirty(false);
    setLastSaved(null);
  };

  const handleEndCall = () => {
    setCallEnded(true);
    setVideoMinimized(false);
    setIsRecording(false);
    // Clear global state so PiP disappears
    setActiveTeleconsultCall(null);
  };

  const handleBackToQueue = () => {
    setActiveCall(null);
    setCallEnded(false);
    setCallTimer(0);
    setChatMessages(MOCK_CHAT);
    setChatInput('');
    setVideoMinimized(false);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { from: 'doctor', text: chatInput.trim() }]);
    setChatInput('');
    // Simulate patient reply after a short delay
    setTimeout(() => {
      const replies = [
        'Yes, Doctor.',
        'Okay, I understand.',
        'Thank you, Doctor.',
        'I will do that.',
        'No, nothing else.',
      ];
      setChatMessages(prev => [...prev, { from: 'patient', text: replies[Math.floor(Math.random() * replies.length)] }]);
    }, 1500 + Math.random() * 2000);
  };

  const handleSaveDraft = () => {
    if (firstNote) {
      saveDraftNote(firstNote.id, soapData);
    }
    setSoapDirty(false);
    setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    showToast('Draft saved', 'success');
  };

  const handleSignNote = () => {
    if (firstNote) {
      signNote(firstNote.id);
      setNoteSigned(true);
      setSoapDirty(false);
      showToast('Note signed successfully', 'success');
    } else {
      showToast('Save draft first before signing', 'info');
    }
  };

  const updateSoap = (field: keyof typeof soapData, value: string) => {
    setSoapData(p => ({ ...p, [field]: value }));
    setSoapDirty(true);
    setNoteSigned(false);
  };

  // AI: stop recording + append generated content to existing SOAP
  const handleGenerateSoap = () => {
    if (isRecording) setIsRecording(false);
    setAiProcessing(true);
    showToast('AI analyzing transcript...', 'info');
    setTimeout(() => {
      setSoapData(prev => ({
        subjective: prev.subjective + AI_SOAP_APPEND.subjective,
        objective: prev.objective + AI_SOAP_APPEND.objective,
        assessment: prev.assessment + AI_SOAP_APPEND.assessment,
        plan: prev.plan + AI_SOAP_APPEND.plan,
      }));
      setSoapDirty(true);
      setAiGenerated(true);
      setAiProcessing(false);
      showToast('AI SOAP content appended to notes', 'success');
      // Auto switch to SOAP tab so user can see the result
      setEncounterTab('soap');
    }, 2000);
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      showToast('Recording stopped', 'info');
    } else {
      setIsRecording(true);
      setRecordSeconds(0);
      setTranscriptLines([]);
      showToast('Recording started — AI listening...', 'info');
    }
  };

  // Orders: place an order into context
  const handlePlaceOrder = (order: typeof QUICK_ORDERS[0]) => {
    if (placedOrders.has(order.name)) return;
    setOrderPending(order.name);
    setTimeout(() => {
      addLabOrder({
        patientId: teleconsultPatientId ?? 'tc-unknown',
        patientName: teleconsultPatientName,
        doctorId: currentStaff?.id ?? 'staff-001',
        doctorName: doctorName,
        testName: order.name,
        testType: order.type,
        priority: 'Routine',
        status: 'Ordered',
        orderedDate: new Date().toISOString(),
      });
      setPlacedOrders(prev => new Set(prev).add(order.name));
      setOrderPending(null);
      showToast(`${order.name} ordered for ${teleconsultPatientName}`, 'success');
    }, 800);
  };

  // Prescriptions: quick prescribe into context
  const handleQuickPrescribe = (rx: typeof QUICK_RX[0]) => {
    if (rxSent.has(rx.medication)) return;
    addPrescription({
      patientId: teleconsultPatientId ?? 'tc-unknown',
      patientName: teleconsultPatientName,
      doctorId: currentStaff?.id ?? 'staff-001',
      doctorName: doctorName,
      medication: rx.medication,
      dosage: rx.dosage,
      frequency: rx.frequency,
      duration: rx.duration,
      quantity: 30,
      refillsRemaining: 0,
      status: 'Active',
      prescribedDate: new Date().toISOString().split('T')[0],
    });
    setRxSent(prev => new Set(prev).add(rx.medication));
    showToast(`${rx.medication} prescribed for ${teleconsultPatientName}`, 'success');
  };

  // ===== WAITING ROOM / SCHEDULED VIEW =====
  if (!activeCall) {
    const longestWait = MOCK_WAITING.reduce((max, p) => Math.max(max, p.waitMin), 0);
    const isInClinicMode = teleconsultNowEnabled && doctorMode === 'in-clinic';
    const hasBothModes = teleconsultNowEnabled && teleconsultLaterEnabled;
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    // Helper: is this appointment happening within the next 15 minutes?
    const isJoinable = (apt: typeof myTeleconsultAppts[0]) => {
      try {
        const aptTime = new Date(`${apt.date} ${apt.time}`).getTime();
        const now = Date.now();
        return aptTime - now <= 15 * 60 * 1000 && aptTime - now > -60 * 60 * 1000; // 15min before to 1hr after
      } catch { return false; }
    };

    // Group future appointments by date
    const groupedFuture: Record<string, typeof myTeleconsultAppts> = {};
    futureTeleconsultAppts.forEach(a => {
      if (!groupedFuture[a.date]) groupedFuture[a.date] = [];
      groupedFuture[a.date].push(a);
    });

    return (
      <div className="tc-page">
        <h2 className="tc-title">Teleconsult</h2>
        <p className="tc-subtitle">
          {waitingTab === 'now' ? 'Patients waiting for teleconsultation' : 'Scheduled video appointments'}
        </p>

        {/* Tab bar — only if both modes are available */}
        {hasBothModes && (
          <div style={{
            display: 'flex', gap: 2, marginBottom: 16, padding: 3, borderRadius: 10,
            background: 'var(--color-background)', border: '1px solid var(--color-border)',
          }}>
            <button
              onClick={() => setWaitingTab('now')}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 700, transition: 'all 0.2s',
                background: waitingTab === 'now' ? 'var(--color-primary)' : 'transparent',
                color: waitingTab === 'now' ? '#fff' : 'var(--color-text-muted)',
              }}
            >
              <Video size={14} />
              Consult Now
              {MOCK_WAITING.length > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 8,
                  background: waitingTab === 'now' ? 'rgba(255,255,255,0.25)' : 'rgba(239,68,68,0.1)',
                  color: waitingTab === 'now' ? '#fff' : 'var(--color-error)',
                }}>
                  {MOCK_WAITING.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setWaitingTab('scheduled')}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 700, transition: 'all 0.2s',
                background: waitingTab === 'scheduled' ? 'var(--color-purple-dark)' : 'transparent',
                color: waitingTab === 'scheduled' ? '#fff' : 'var(--color-text-muted)',
              }}
            >
              <Calendar size={14} />
              Scheduled
              {myTeleconsultAppts.length > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 8,
                  background: waitingTab === 'scheduled' ? 'rgba(255,255,255,0.25)' : 'rgba(124,58,237,0.1)',
                  color: waitingTab === 'scheduled' ? '#fff' : 'var(--color-purple-dark)',
                }}>
                  {myTeleconsultAppts.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* ============ NOW TAB — Live Queue ============ */}
        {waitingTab === 'now' && teleconsultNowEnabled && (
          <>
            {/* In-Clinic mode — teleconsult is paused */}
            {isInClinicMode && (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                padding: '20px 16px', borderRadius: 14, marginBottom: 16,
                background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.12)',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(59,130,246,0.08)',
                }}>
                  <PauseCircle size={28} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-primary)', marginBottom: 4 }}>
                    Teleconsult Queue On Hold
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    You are currently in <strong style={{ color: 'var(--color-primary)' }}>In-Clinic</strong> mode.
                    Switch modes to start taking video visits.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button className="tc-join-btn" style={{ padding: '10px 20px', fontSize: 13, borderRadius: 10 }} onClick={() => setDoctorMode('teleconsult')}>
                    <Video size={14} /> Go Online for Teleconsult
                  </button>
                  <button onClick={() => navigate('/doctor/queue')} style={{ padding: '10px 20px', fontSize: 13, borderRadius: 10, cursor: 'pointer', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Building2 size={14} /> Back to In-Clinic Queue
                  </button>
                </div>
              </div>
            )}

            {/* Queue notification banner */}
            {MOCK_WAITING.length > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px', borderRadius: 12, marginBottom: 16,
                background: longestWait > 10 ? 'rgba(239,68,68,0.06)' : 'rgba(59,130,246,0.06)',
                border: `1px solid ${longestWait > 10 ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)'}`,
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: longestWait > 10 ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)', color: longestWait > 10 ? 'var(--color-error)' : 'var(--color-info)', fontWeight: 800, fontSize: 18 }}>
                  {MOCK_WAITING.length}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: longestWait > 10 ? 'var(--color-error)' : 'var(--color-text)' }}>
                    {MOCK_WAITING.length} patient{MOCK_WAITING.length !== 1 ? 's' : ''} waiting
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    Longest wait: {longestWait}m{longestWait > 10 && <span style={{ color: 'var(--color-error)', fontWeight: 600 }}> — patient may be getting impatient</span>}
                  </div>
                </div>
                <Video size={20} style={{ color: longestWait > 10 ? 'var(--color-error)' : 'var(--color-primary)', animation: 'pulse 2s infinite' }} />
              </div>
            )}

            <div className="tc-waiting-list" style={isInClinicMode ? { opacity: 0.45, pointerEvents: 'none', filter: 'grayscale(0.3)' } : undefined}>
              {MOCK_WAITING.map((p) => {
                const isExpanded = expandedPatient === p.id;
                return (
                  <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    <div className="tc-waiting-card" style={{ borderRadius: isExpanded ? '12px 12px 0 0' : undefined }}>
                      <div className="tc-waiting-avatar">{getInitials(p.name)}</div>
                      <div className="tc-waiting-info">
                        <span className="tc-waiting-name">{p.name}</span>
                        <span className="tc-waiting-complaint">{p.complaint}</span>
                        <span className="tc-waiting-wait">
                          <Clock size={12} /> Waiting {p.waitMin}m · {p.age}{p.sex}
                          {p.waitMin > 10 && <span style={{ color: 'var(--color-error)', fontWeight: 600 }}> ⚠</span>}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                        <button className="tc-join-btn" onClick={() => handleJoinCall(p.id, p.name)}>
                          <Video size={16} /> Join
                        </button>
                        <button onClick={() => setExpandedPatient(isExpanded ? null : p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', fontSize: 11, fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          {isExpanded ? 'Less' : 'Patient Info'}
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div style={{ padding: '14px 16px', borderRadius: '0 0 12px 12px', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderTop: 'none', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 4 }}>Chief Complaint</div>
                          <div style={{ fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.5 }}>{p.intake.chiefComplaint}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>Duration: {p.intake.duration}</div>
                        </div>
                        {p.intake.vitals && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {p.intake.vitals.split(', ').map((v, i) => (
                              <span key={i} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: 'var(--color-surface)', border: '1px solid var(--color-border)', fontWeight: 600, color: 'var(--color-text)' }}>{v}</span>
                            ))}
                            {p.intake.painScale !== undefined && (
                              <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: p.intake.painScale > 5 ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', border: `1px solid ${p.intake.painScale > 5 ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)'}`, fontWeight: 600, color: p.intake.painScale > 5 ? 'var(--color-error)' : 'var(--color-success)' }}>Pain: {p.intake.painScale}/10</span>
                            )}
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 4 }}>History</div>
                          <div style={{ color: 'var(--color-text)', lineHeight: 1.5 }}>{p.intake.history}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 140 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 4 }}>Allergies</div>
                            {p.intake.allergies.length === 0 ? (
                              <span style={{ fontSize: 12, color: 'var(--color-success)' }}>No known allergies</span>
                            ) : (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {p.intake.allergies.map(a => (<span key={a} style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.08)', color: 'var(--color-error)' }}>⚠ {a}</span>))}
                              </div>
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 140 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 4 }}>Current Medications</div>
                            {p.intake.currentMeds.length === 0 ? (
                              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>None reported</span>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {p.intake.currentMeds.map(m => (<span key={m} style={{ fontSize: 12, color: 'var(--color-text)' }}>• {m}</span>))}
                              </div>
                            )}
                          </div>
                        </div>
                        {p.intake.lastVisit && (
                          <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--color-surface)', border: '1px solid var(--color-border)', fontSize: 12, color: 'var(--color-text-muted)' }}>
                            <span style={{ fontWeight: 600 }}>Last Visit:</span> {p.intake.lastVisit}
                          </div>
                        )}
                        {p.intake.preferredPharmacy && (
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}><span style={{ fontWeight: 600 }}>Preferred Pharmacy:</span> {p.intake.preferredPharmacy}</div>
                        )}
                        <button className="tc-join-btn" onClick={() => handleJoinCall(p.id, p.name)} style={{ width: '100%', justifyContent: 'center', padding: '12px', borderRadius: 10, fontSize: 14 }}>
                          <Video size={18} /> Join Call with {p.name.split(' ')[0]}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ============ SCHEDULED TAB — Upcoming Appointments ============ */}
        {waitingTab === 'scheduled' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {myTeleconsultAppts.length === 0 ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                padding: '40px 20px', borderRadius: 14,
                background: 'var(--color-background)', border: '1px dashed var(--color-border)',
                textAlign: 'center',
              }}>
                <Calendar size={36} style={{ color: 'var(--color-text-muted)', opacity: 0.4 }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>No scheduled teleconsults</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', maxWidth: 320 }}>
                  Teleconsult appointments booked by patients will appear here. You can join the call when it's time.
                </div>
              </div>
            ) : (
              <>
                {/* Today's teleconsults */}
                {todayTeleconsultAppts.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={13} /> Today — {todayStr}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {todayTeleconsultAppts.map(apt => {
                        const canJoin = isJoinable(apt);
                        return (
                          <div key={apt.id} style={{
                            display: 'flex', alignItems: 'center', gap: 14,
                            padding: '14px 16px', borderRadius: 12,
                            background: canJoin ? 'rgba(124,58,237,0.04)' : 'var(--color-surface)',
                            border: `1px solid ${canJoin ? 'rgba(124,58,237,0.2)' : 'var(--color-border)'}`,
                            boxShadow: canJoin ? '0 2px 8px rgba(124,58,237,0.08)' : 'var(--shadow-sm)',
                            transition: 'all 0.2s',
                          }}>
                            {/* Time badge */}
                            <div style={{
                              minWidth: 56, textAlign: 'center', padding: '8px 6px', borderRadius: 10,
                              background: canJoin ? 'linear-gradient(135deg, var(--color-purple-dark), var(--color-indigo))' : 'var(--color-background)',
                              border: canJoin ? 'none' : '1px solid var(--color-border)',
                            }}>
                              <div style={{ fontSize: 14, fontWeight: 800, color: canJoin ? '#fff' : 'var(--color-text)', lineHeight: 1 }}>{apt.time.replace(/:00/,'').replace(' ','')}</div>
                              {canJoin && <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>NOW</div>}
                            </div>
                            {/* Patient info */}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', marginBottom: 2 }}>{apt.patientName}</div>
                              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{apt.chiefComplaint}</div>
                              {apt.notes && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4, fontStyle: 'italic', lineHeight: 1.4, opacity: 0.8 }}>{apt.notes}</div>}
                            </div>
                            {/* Action */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                              {canJoin ? (
                                <button className="tc-join-btn" onClick={() => handleJoinCall(apt.id, apt.patientName ?? 'Patient')} style={{ padding: '10px 18px', borderRadius: 10, fontSize: 13 }}>
                                  <Video size={16} /> Join Now
                                </button>
                              ) : (
                                <div style={{
                                  padding: '8px 14px', borderRadius: 8,
                                  background: 'var(--color-background)', border: '1px solid var(--color-border)',
                                  fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)',
                                  display: 'flex', alignItems: 'center', gap: 4,
                                }}>
                                  <Clock size={12} /> {apt.time}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Future dates */}
                {Object.entries(groupedFuture).map(([date, apts]) => (
                  <div key={date}>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={13} /> {date}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {apts.map(apt => (
                        <div key={apt.id} style={{
                          display: 'flex', alignItems: 'center', gap: 14,
                          padding: '14px 16px', borderRadius: 12,
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          boxShadow: 'var(--shadow-sm)',
                        }}>
                          {/* Time badge */}
                          <div style={{
                            minWidth: 56, textAlign: 'center', padding: '8px 6px', borderRadius: 10,
                            background: 'var(--color-background)', border: '1px solid var(--color-border)',
                          }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>{apt.time.replace(/:00/,'').replace(' ','')}</div>
                          </div>
                          {/* Patient info */}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', marginBottom: 2 }}>{apt.patientName}</div>
                            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{apt.chiefComplaint}</div>
                            {apt.notes && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4, fontStyle: 'italic', lineHeight: 1.4, opacity: 0.8 }}>{apt.notes}</div>}
                          </div>
                          {/* Time label */}
                          <div style={{
                            padding: '8px 14px', borderRadius: 8,
                            background: 'var(--color-background)', border: '1px solid var(--color-border)',
                            fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)',
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}>
                            <Clock size={12} /> {apt.time}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Summary footer */}
                <div style={{
                  padding: '12px 16px', borderRadius: 10,
                  background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.1)',
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 12, color: 'var(--color-purple-dark)', fontWeight: 600,
                }}>
                  <Video size={14} />
                  {myTeleconsultAppts.length} upcoming teleconsult{myTeleconsultAppts.length !== 1 ? 's' : ''}
                  {todayTeleconsultAppts.length > 0 && ` · ${todayTeleconsultAppts.length} today`}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // ===== POST-CALL SUMMARY =====
  if (callEnded) {
    return (
      <div className="tc-page">
        <div className="tc-ended-banner">
          <CheckCircle2 size={20} />
          <span>Call ended · {formatTime(callTimer)} · {activeCall.name}</span>
        </div>

        <div className="tc-summary-card">
          <div className="tc-summary-header">
            <Sparkles size={16} /> AI-Generated Visit Summary
          </div>
          <p className="tc-summary-text">{MOCK_SUMMARY}</p>
        </div>

        {soapData.subjective && (
          <div className="tc-summary-card">
            <div className="tc-summary-header">
              <FileSignature size={16} /> SOAP Note
              {aiGenerated && <span className="tc-ai-tag"><Sparkles size={10} /> AI-Assisted</span>}
              {noteSigned && <span className="tc-signed-tag"><Check size={10} /> Signed</span>}
            </div>
            <div className="tc-soap-mini">
              <div><strong>S:</strong> {soapData.subjective.slice(0, 150)}{soapData.subjective.length > 150 ? '...' : ''}</div>
              <div><strong>O:</strong> {soapData.objective.slice(0, 150)}{soapData.objective.length > 150 ? '...' : ''}</div>
              <div><strong>A:</strong> {soapData.assessment.slice(0, 150)}{soapData.assessment.length > 150 ? '...' : ''}</div>
              <div><strong>P:</strong> {soapData.plan.slice(0, 150)}{soapData.plan.length > 150 ? '...' : ''}</div>
            </div>
          </div>
        )}

        {placedOrders.size > 0 && (
          <div className="tc-summary-card">
            <div className="tc-summary-header"><ClipboardList size={16} /> Orders Placed ({placedOrders.size})</div>
            <div className="tc-summary-chips">
              {Array.from(placedOrders).map(o => (
                <span key={o} className="tc-summary-chip tc-summary-chip--order"><Check size={12} /> {o}</span>
              ))}
            </div>
          </div>
        )}

        {rxSent.size > 0 && (
          <div className="tc-summary-card">
            <div className="tc-summary-header"><Pill size={16} /> Prescriptions Sent ({rxSent.size})</div>
            <div className="tc-summary-chips">
              {Array.from(rxSent).map(r => (
                <span key={r} className="tc-summary-chip tc-summary-chip--rx"><Check size={12} /> {r}</span>
              ))}
            </div>
          </div>
        )}

        <div className="tc-post-actions">
          <Link to="/doctor/encounter" state={{ patientId: teleconsultPatientId, patientName: teleconsultPatientName, chiefComplaint: activePatientData?.complaint }} className="tc-action-btn tc-action-btn--primary">
            <FileCheck size={18} /> Review Full Encounter
          </Link>
          <button className="tc-action-btn" onClick={() => { showToast('Summary pushed to patient records', 'success'); navigate('/doctor/encounter', { state: { patientId: teleconsultPatientId, patientName: teleconsultPatientName } }); }}>
            <Send size={18} /> Push to Records
          </button>
          <button className="tc-action-btn" onClick={() => { showToast('Follow-up scheduled', 'success'); navigate('/doctor/schedule'); }}>
            <Calendar size={18} /> Schedule Follow-up
          </button>
          <button className="tc-action-btn" onClick={handleBackToQueue}>
            <RefreshCw size={16} /> Back to Waiting Room
          </button>
        </div>
      </div>
    );
  }

  // ===== BUILD ENCOUNTER TABS =====
  const encTabs: { key: EncounterTab; label: string; badge?: number; icon: React.ReactNode }[] = [
    { key: 'soap', label: 'SOAP', icon: <FileSignature size={14} /> },
    ...(hasAI ? [{ key: 'ai' as EncounterTab, label: 'AI', badge: isRecording ? undefined : undefined, icon: <Sparkles size={14} /> }] : []),
    ...(hasCDSS ? [{ key: 'cdss' as EncounterTab, label: 'CDSS', badge: activeAlerts.length, icon: <ShieldAlert size={14} /> }] : []),
    ...(labsEnabled ? [{ key: 'orders' as EncounterTab, label: 'Orders', badge: placedOrders.size > 0 ? placedOrders.size : undefined, icon: <ClipboardList size={14} /> }] : []),
    { key: 'prescriptions', label: 'Rx', badge: rxSent.size > 0 ? rxSent.size : undefined, icon: <Pill size={14} /> },
  ];

  const showMobileIntake = !isDesktop && !videoMinimized && !chatOpen;

  // Shared encounter panel content used by both desktop and mobile layouts
  const renderEncounterContent = () => (
    <div className="tc-encounter-area">
      {/* Tab bar */}
      <div className="tc-enc-tabs">
        {encTabs.map(tab => (
          <button
            key={tab.key}
            className={`tc-enc-tab ${encounterTab === tab.key ? 'tc-enc-tab--active' : ''} ${tab.key === 'ai' && isRecording ? 'tc-enc-tab--recording' : ''}`}
            onClick={() => setEncounterTab(tab.key)}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.key === 'ai' && isRecording && <span className="tc-enc-tab-rec-dot" />}
            {(tab.badge ?? 0) > 0 && <span className="tc-enc-tab-badge">{tab.badge}</span>}
          </button>
        ))}
      </div>

      {/* =============== SOAP Panel =============== */}
      {encounterTab === 'soap' && (
        <SoapNotePanel
          compact
          soapData={soapData}
          onSoapChange={(field, value) => updateSoap(field, value)}
          status={noteSigned ? 'Signed' : 'Draft'}
          aiAssisted={aiGenerated}
          hasAI={hasAI}
          aiGenerated={aiGenerated}
          aiProcessing={aiProcessing}
          isRecording={isRecording}
          recordingSeconds={recordSeconds}
          transcriptLinesCount={transcriptLines.length}
          onGenerateSoap={handleGenerateSoap}
          onSaveDraft={handleSaveDraft}
          onSignNote={handleSignNote}
          activeAlertsCount={activeAlerts.length}
          lastSaved={lastSaved}
          formatTime={formatTime}
        />
      )}

      {/* =============== AI Transcriber Panel =============== */}
      {encounterTab === 'ai' && hasAI && (
        <div className="tc-enc-panel">
          <div className="tc-enc-panel-header">
            <span className="tc-enc-panel-title"><Sparkles size={14} /> AI Transcriber</span>
            {transcriptLines.length > 0 && (
              <span className="tc-enc-badge-count">{transcriptLines.length} lines</span>
            )}
          </div>
          <button
            className={`tc-record-btn ${isRecording ? 'tc-record-btn--active' : ''}`}
            onClick={toggleRecording}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            <span>{isRecording ? `Recording... ${formatTime(recordSeconds)}` : 'Tap to Start Recording'}</span>
            {isRecording && <span className="tc-record-pulse" />}
          </button>
          <div className="tc-transcript">
            <div className="tc-transcript-title">Live Transcript</div>
            {transcriptLines.length === 0 ? (
              <div className="tc-transcript-empty">
                {isRecording ? 'Listening...' : 'Start recording to see live transcript'}
              </div>
            ) : (
              transcriptLines.map((line, i) => (
                <div key={i} className={`tc-transcript-line ${line.speaker === 'doctor' ? 'tc-transcript-line--doctor' : 'tc-transcript-line--patient'} tc-transcript-line--animate`}>
                  <span className="tc-transcript-ts">{line.ts}</span>
                  <span className="tc-transcript-speaker">{line.speaker === 'doctor' ? 'Dr.' : 'Pt.'}</span>
                  <span>{line.text}</span>
                </div>
              ))
            )}
            <div ref={transcriptEndRef} />
          </div>
          <button
            className="tc-btn tc-btn--ai"
            onClick={handleGenerateSoap}
            disabled={aiProcessing || transcriptLines.length === 0}
          >
            {aiProcessing ? <Loader2 size={14} className="tc-spin" /> : <Sparkles size={14} />}
            {aiProcessing ? 'Analyzing Transcript...' : aiGenerated ? 'Regenerate SOAP from Transcript' : 'Generate SOAP from Transcript'}
          </button>
          {aiGenerated && (
            <div className="tc-ai-success">
              <CheckCircle2 size={16} />
              <span>SOAP note updated — switch to SOAP tab to review</span>
              <button className="tc-ai-success-btn" onClick={() => setEncounterTab('soap')}>View SOAP →</button>
            </div>
          )}
        </div>
      )}

      {/* =============== CDSS Alerts Panel =============== */}
      {encounterTab === 'cdss' && hasCDSS && (
        <div className="tc-enc-panel">
          <div className="tc-enc-panel-header">
            <span className="tc-enc-panel-title"><ShieldAlert size={14} /> CDSS Alerts</span>
            <span className="tc-enc-badge-count">{activeAlerts.length} active</span>
          </div>
          {activeAlerts.length === 0 ? (
            <div className="tc-enc-empty">
              <CheckCircle2 size={32} style={{ color: 'var(--color-success)', marginBottom: 8 }} />
              <span>No active clinical alerts</span>
            </div>
          ) : (
            <div className="tc-cdss-list">
              {activeAlerts.map(alert => (
                <div key={alert.id} className={`tc-cdss-alert tc-cdss-alert--${alert.severity}`}>
                  <div className="tc-cdss-alert-header">
                    <span className={`tc-cdss-severity tc-cdss-severity--${alert.severity}`}>{alert.severity}</span>
                    <span className="tc-cdss-alert-title">{alert.title}</span>
                  </div>
                  <p className="tc-cdss-alert-msg">{alert.message}</p>
                  <div className="tc-cdss-alert-rec">
                    <AlertTriangle size={12} style={{ flexShrink: 0 }} /> {alert.recommendation}
                  </div>
                  <div className="tc-cdss-alert-actions">
                    <button className="tc-btn tc-btn--small tc-btn--secondary" onClick={() => { dismissAlert(alert.id); showToast('Alert dismissed', 'info'); }}>Dismiss</button>
                    <button className="tc-btn tc-btn--small tc-btn--primary" onClick={() => {
                      dismissAlert(alert.id);
                      showToast(`Action taken: ${alert.recommendation}`, 'success');
                      if (alert.recommendation.toLowerCase().includes('order') && labsEnabled) { setEncounterTab('orders'); }
                    }}>Take Action</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =============== Orders Panel =============== */}
      {encounterTab === 'orders' && labsEnabled && (
        <div className="tc-enc-panel">
          <div className="tc-enc-panel-header">
            <span className="tc-enc-panel-title"><ClipboardList size={14} /> Lab & Imaging Orders</span>
            {placedOrders.size > 0 && <span className="tc-enc-badge-count">{placedOrders.size} placed</span>}
          </div>
          <div className="tc-orders-grid">
            {QUICK_ORDERS.map(order => {
              const placed = placedOrders.has(order.name);
              const pending = orderPending === order.name;
              return (
                <button
                  key={order.name}
                  className={`tc-order-chip ${placed ? 'tc-order-chip--placed' : ''} ${pending ? 'tc-order-chip--pending' : ''}`}
                  onClick={() => handlePlaceOrder(order)}
                  disabled={placed || pending}
                >
                  {pending ? <Loader2 size={13} className="tc-spin" /> : placed ? <Check size={13} /> : <Plus size={13} />}
                  <span>{order.name}</span>
                  <span className="tc-order-type">{order.type}</span>
                </button>
              );
            })}
          </div>
          {placedOrders.size > 0 && (
            <div className="tc-order-summary">
              <Check size={14} /> {placedOrders.size} order{placedOrders.size > 1 ? 's' : ''} placed for {activeCall.name}
            </div>
          )}
        </div>
      )}

      {/* =============== Prescriptions Panel =============== */}
      {encounterTab === 'prescriptions' && (
        <div className="tc-enc-panel">
          <div className="tc-enc-panel-header">
            <span className="tc-enc-panel-title"><Pill size={14} /> Prescriptions</span>
            <button className="tc-btn tc-btn--small tc-btn--secondary" onClick={() => setShowQuickRx(!showQuickRx)}>
              <Plus size={13} /> Quick Rx
            </button>
          </div>
          {showQuickRx && (
            <div className="tc-quickrx-panel">
              <div className="tc-quickrx-title">Quick Prescribe</div>
              <div className="tc-quickrx-grid">
                {QUICK_RX.map(rx => {
                  const sent = rxSent.has(rx.medication);
                  return (
                    <button
                      key={rx.medication}
                      className={`tc-quickrx-chip ${sent ? 'tc-quickrx-chip--sent' : ''}`}
                      onClick={() => handleQuickPrescribe(rx)}
                      disabled={sent}
                    >
                      <div className="tc-quickrx-chip-name">{sent ? <Check size={13} /> : <Pill size={13} />} {rx.medication}</div>
                      <div className="tc-quickrx-chip-detail">{rx.dosage} · {rx.frequency}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {patientPrescriptions.length === 0 && rxSent.size === 0 ? (
            <div className="tc-enc-empty">No prescriptions yet</div>
          ) : (
            <div className="tc-rx-list">
              {patientPrescriptions.map(rx => (
                <div key={rx.id} className="tc-rx-item">
                  <div className="tc-rx-info">
                    <span className="tc-rx-name">{rx.medication}</span>
                    <span className="tc-rx-detail">{rx.dosage} · {rx.frequency} · {rx.duration}</span>
                  </div>
                  <span className={`tc-rx-status tc-rx-status--${rx.status.toLowerCase().replace(/\s/g, '-')}`}>{rx.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ===== ACTIVE CALL VIEW =====
  return (
    <div className={`tc-page ${!isDesktop && videoMinimized ? 'tc-page--minimized' : ''}`}>

      {/* ===== DESKTOP: Side-by-side layout ===== */}
      {isDesktop ? (
        <div style={{ display: 'flex', gap: 16, minHeight: 'calc(100vh - 120px)' }}>
          {/* LEFT: Video + Chat + Intake */}
          <div style={{ flex: '0 0 55%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Video */}
            <div className="tc-video-container" style={{ borderRadius: 14, overflow: 'hidden' }}>
              <div className="tc-video-main" style={{ minHeight: 320 }}>
                <div className="tc-remote">
                  <div className="tc-remote-avatar-circle">{getInitials(activeCall.name)}</div>
                  <span className="tc-remote-label">{activeCall.name}</span>
                </div>
                <div className="tc-self-view">{doctorInitials}</div>
                <div className="tc-timer"><Clock size={12} /> {formatTime(callTimer)}</div>
                {isRecording && (
                  <div className="tc-recording-badge"><span className="tc-recording-dot" /> REC</div>
                )}
              </div>
              <div className="tc-controls">
                <button className={`tc-ctrl-btn ${!micOn ? 'tc-ctrl-btn--off' : ''}`} onClick={() => setMicOn(!micOn)} title={micOn ? 'Mute' : 'Unmute'}>
                  {micOn ? <Mic size={18} /> : <MicOff size={18} />}
                </button>
                <button className={`tc-ctrl-btn ${!videoOn ? 'tc-ctrl-btn--off' : ''}`} onClick={() => setVideoOn(!videoOn)} title={videoOn ? 'Camera off' : 'Camera on'}>
                  {videoOn ? <Video size={18} /> : <VideoOff size={18} />}
                </button>
                <button className="tc-ctrl-btn" onClick={() => showToast('Screen sharing toggled', 'info')} title="Share screen">
                  <Monitor size={18} />
                </button>
                <button className={`tc-ctrl-btn ${chatOpen ? 'tc-ctrl-btn--active' : ''}`} onClick={() => setChatOpen(!chatOpen)} title="Chat">
                  <MessageSquare size={18} />
                </button>
                {hasAI && (
                  <button className={`tc-ctrl-btn ${isRecording ? 'tc-ctrl-btn--rec' : ''}`} onClick={isRecording ? handleGenerateSoap : toggleRecording} title={isRecording ? 'Stop & Generate SOAP' : 'Start AI recording'}>
                    {isRecording ? <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--color-error)', display: 'inline-block', animation: 'pulse 1.5s infinite' }} /> : <Sparkles size={18} />}
                  </button>
                )}
                <button className="tc-ctrl-btn tc-ctrl-btn--end" onClick={handleEndCall} title="End call">
                  <PhoneOff size={18} />
                </button>
              </div>
            </div>

            {/* Chat panel (below video on desktop) */}
            {chatOpen && (
              <div className="tc-chat-panel" style={{ position: 'relative', maxHeight: 280 }}>
                <div className="tc-chat-header">
                  <span>Chat with {activeCall.name}</span>
                  <button className="tc-chat-close" onClick={() => setChatOpen(false)}><X size={14} /></button>
                </div>
                <div className="tc-chat-messages">
                  {chatMessages.map((m, i) => (
                    <div key={i} className={`tc-chat-bubble ${m.from === 'doctor' ? 'tc-chat-bubble--doctor' : 'tc-chat-bubble--patient'}`}>{m.text}</div>
                  ))}
                </div>
                <div className="tc-chat-input-row">
                  <input className="tc-chat-input" placeholder="Type message..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendChat()} />
                  <button className="tc-chat-send" onClick={handleSendChat}><Send size={16} /></button>
                </div>
              </div>
            )}

            {/* Patient intake (below video/chat on desktop) */}
            {!chatOpen && activePatientData && (
              <div style={{
                padding: '14px 16px', borderRadius: 12,
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                fontSize: 13, overflowY: 'auto', maxHeight: 260,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={14} /> Patient Intake — {activeCall.name}
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 3 }}>Chief Complaint</div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.5, marginBottom: 4 }}>{activePatientData.intake.chiefComplaint}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Duration: {activePatientData.intake.duration}</div>
                    {activePatientData.intake.vitals && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                        {activePatientData.intake.vitals.split(', ').map((v, i) => (
                          <span key={i} style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: 'var(--color-background)', border: '1px solid var(--color-border)' }}>{v}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 3 }}>Allergies</div>
                    {activePatientData.intake.allergies.length === 0 ? (
                      <span style={{ fontSize: 12, color: 'var(--color-success)' }}>No known allergies</span>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                        {activePatientData.intake.allergies.map(a => (<span key={a} style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.08)', color: 'var(--color-error)' }}>⚠ {a}</span>))}
                      </div>
                    )}
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 3, marginTop: 8 }}>Current Meds</div>
                    {activePatientData.intake.currentMeds.length === 0 ? (
                      <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>None reported</span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {activePatientData.intake.currentMeds.map(m => (<span key={m} style={{ fontSize: 12, color: 'var(--color-text)' }}>• {m}</span>))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Encounter panels — always visible on desktop */}
          <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: 0, minWidth: 0, overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
            {/* Recording bar */}
            {isRecording && (
              <div className="tc-recording-strip">
                <span className="tc-recording-dot" />
                <span>AI Recording · {formatTime(recordSeconds)} · {transcriptLines.length} lines</span>
                <button className="tc-recording-strip-btn" onClick={toggleRecording}>Stop</button>
              </div>
            )}
            {soapDirty && (
              <div className="tc-dirty-strip">
                <AlertCircle size={13} /><span>Unsaved changes</span>
                <button className="tc-dirty-strip-btn" onClick={handleSaveDraft}>Save now</button>
              </div>
            )}
            {renderEncounterContent()}
          </div>
        </div>
      ) : (
        /* ===== MOBILE: Original minimize-to-see-panels layout ===== */
        <>
          {/* VIDEO AREA */}
          <div className={`tc-video-container ${videoMinimized ? 'tc-video-container--mini' : ''}`}>
            <div className="tc-video-main">
              <div className="tc-remote">
                <div className="tc-remote-avatar-circle">{getInitials(activeCall.name)}</div>
                {!videoMinimized && <span className="tc-remote-label">{activeCall.name}</span>}
              </div>
              <div className="tc-self-view">{doctorInitials}</div>
              <div className="tc-timer"><Clock size={12} /> {formatTime(callTimer)}</div>
              {isRecording && (
                <div className="tc-recording-badge"><span className="tc-recording-dot" /> REC</div>
              )}
              <button className="tc-pip-toggle" onClick={() => setVideoMinimized(!videoMinimized)} title={videoMinimized ? 'Maximize video' : 'Minimize video'}>
                {videoMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
            </div>
            <div className={`tc-controls ${videoMinimized ? 'tc-controls--mini' : ''}`}>
              <button className={`tc-ctrl-btn ${!micOn ? 'tc-ctrl-btn--off' : ''}`} onClick={() => setMicOn(!micOn)} title={micOn ? 'Mute' : 'Unmute'}>
                {micOn ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
              <button className={`tc-ctrl-btn ${!videoOn ? 'tc-ctrl-btn--off' : ''}`} onClick={() => setVideoOn(!videoOn)} title={videoOn ? 'Camera off' : 'Camera on'}>
                {videoOn ? <Video size={18} /> : <VideoOff size={18} />}
              </button>
              {!videoMinimized && (
                <>
                  <button className="tc-ctrl-btn" onClick={() => showToast('Screen sharing toggled', 'info')} title="Share screen"><Monitor size={18} /></button>
                  <button className={`tc-ctrl-btn ${chatOpen ? 'tc-ctrl-btn--active' : ''}`} onClick={() => setChatOpen(!chatOpen)} title="Chat"><MessageSquare size={18} /></button>
                </>
              )}
              {hasAI && videoMinimized && (
                <button className={`tc-ctrl-btn ${isRecording ? 'tc-ctrl-btn--rec' : ''}`} onClick={isRecording ? handleGenerateSoap : toggleRecording} title={isRecording ? 'Stop & Generate SOAP' : 'Start AI recording'}>
                  {isRecording ? <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--color-error)', display: 'inline-block', animation: 'pulse 1.5s infinite' }} /> : <Sparkles size={18} />}
                </button>
              )}
              <button className="tc-ctrl-btn tc-ctrl-btn--end" onClick={handleEndCall} title="End call"><PhoneOff size={18} /></button>
            </div>
          </div>

          {/* Mobile: Recording & dirty strips */}
          {videoMinimized && isRecording && (
            <div className="tc-recording-strip">
              <span className="tc-recording-dot" /><span>AI Recording · {formatTime(recordSeconds)} · {transcriptLines.length} lines captured</span>
              <button className="tc-recording-strip-btn" onClick={toggleRecording}>Stop</button>
            </div>
          )}
          {videoMinimized && soapDirty && (
            <div className="tc-dirty-strip"><AlertCircle size={13} /><span>Unsaved changes</span><button className="tc-dirty-strip-btn" onClick={handleSaveDraft}>Save now</button></div>
          )}

          {/* Mobile: Chat panel (full video mode) */}
          {!videoMinimized && chatOpen && (
            <div className="tc-chat-panel">
              <div className="tc-chat-header"><span>Chat with {activeCall.name}</span><button className="tc-chat-close" onClick={() => setChatOpen(false)}><X size={14} /></button></div>
              <div className="tc-chat-messages">
                {chatMessages.map((m, i) => (<div key={i} className={`tc-chat-bubble ${m.from === 'doctor' ? 'tc-chat-bubble--doctor' : 'tc-chat-bubble--patient'}`}>{m.text}</div>))}
              </div>
              <div className="tc-chat-input-row">
                <input className="tc-chat-input" placeholder="Type message..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendChat()} />
                <button className="tc-chat-send" onClick={handleSendChat}><Send size={16} /></button>
              </div>
            </div>
          )}

          {/* Mobile: Intake panel (full video, no chat) */}
          {showMobileIntake && (
            <div className="tc-intake-panel" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              <div className="tc-intake-title"><FileText size={16} /> Patient Intake — {activeCall.name}</div>
              {activePatientData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 3 }}>Chief Complaint</div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.5 }}>{activePatientData.intake.chiefComplaint}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>Duration: {activePatientData.intake.duration}</div>
                  </div>
                  {activePatientData.intake.vitals && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {activePatientData.intake.vitals.split(', ').map((v, i) => (<span key={i} style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>{v}</span>))}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 4 }}>Allergies</div>
                      {activePatientData.intake.allergies.length === 0 ? (<span style={{ fontSize: 12, color: 'var(--color-success)' }}>No known allergies</span>) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{activePatientData.intake.allergies.map(a => (<span key={a} style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.08)', color: 'var(--color-error)' }}>⚠ {a}</span>))}</div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 4 }}>Current Meds</div>
                      {activePatientData.intake.currentMeds.length === 0 ? (<span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>None reported</span>) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{activePatientData.intake.currentMeds.map(m => (<span key={m} style={{ fontSize: 12, color: 'var(--color-text)' }}>• {m}</span>))}</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="tc-intake-body">
                  <p><strong>Chief Complaint:</strong> {MOCK_INTAKE.chiefComplaint}</p>
                  <p><strong>Duration:</strong> {MOCK_INTAKE.duration}</p>
                  <p><strong>History:</strong> {MOCK_INTAKE.history}</p>
                  <p><strong>Allergies:</strong> <span className="tc-allergy-tag">{MOCK_INTAKE.allergies}</span></p>
                  <p><strong>Current Meds:</strong> {MOCK_INTAKE.currentMeds}</p>
                </div>
              )}
              <button className="tc-encounter-hint" onClick={() => setVideoMinimized(true)} style={{ marginTop: 12 }}>
                <Minimize2 size={14} /> Minimize video to open SOAP, AI & CDSS tools
              </button>
            </div>
          )}
        </>
      )}

      {/* ===== ENCOUNTER PANELS ===== */}
      {/* Desktop: rendered inside the right column of the flex layout above */}
      {/* Mobile: rendered here, only when video is minimized */}
      {!isDesktop && videoMinimized && renderEncounterContent()}
    </div>
  );
};
