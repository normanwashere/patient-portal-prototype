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
  Save,
  X,
  Plus,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useProvider } from '../../provider/context/ProviderContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../theme/ThemeContext';
import './DoctorTeleconsult.css';

type EncounterTab = 'soap' | 'ai' | 'cdss' | 'orders' | 'prescriptions';

const MOCK_WAITING = [
  { id: 'tc-1', name: 'Maria Santos', waitMin: 5, complaint: 'Cough & Cold', age: 34, sex: 'F' },
  { id: 'tc-2', name: 'Jose Reyes', waitMin: 12, complaint: 'Follow-up BP', age: 58, sex: 'M' },
  { id: 'tc-3', name: 'Ana Lopez', waitMin: 2, complaint: 'Skin rash', age: 27, sex: 'F' },
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

const AI_SOAP_APPEND = {
  subjective: '\n\n--- AI Generated (Teleconsult) ---\nPatient reports persistent dry cough for 2 weeks. No fever. No chest pain. Mild shortness of breath on exertion. Currently taking Loratadine 10mg daily for seasonal allergies. No asthma history.',
  objective: '\n\n--- AI Generated (Teleconsult) ---\nVS: BP 120/78, HR 76, RR 16, Temp 36.8°C, SpO2 98%.\nAppearance: Alert, comfortable, no distress via video.\nThroat: Patient reports mild throat irritation.\nLungs: Patient denies wheezing (auscultation not possible via teleconsult).',
  assessment: '\n\n--- AI Generated (Teleconsult) ---\nAcute bronchitis, likely viral etiology (ICD-10: J20.9).\nDDx: Post-nasal drip, allergic cough, early asthma.',
  plan: '\n\n--- AI Generated (Teleconsult) ---\n1. Dextromethorphan 15mg PO q6h PRN for cough\n2. Honey and warm fluids for symptom relief\n3. Continue Loratadine for allergy management\n4. Return if fever develops or symptoms persist > 1 week\n5. Consider in-person visit for auscultation if no improvement in 7 days',
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
    queuePatients,
  } = useProvider();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { tenant } = useTheme();

  const hasCDSS = tenant.features.cdss ?? false;
  const hasAI = tenant.features.aiAssistant ?? false;
  const labsEnabled = tenant.features.visits.clinicLabFulfillmentEnabled;

  const [activeCall, setActiveCall] = useState<{ id: string; name: string } | null>(null);
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
  const [expandedSoap, setExpandedSoap] = useState<Record<string, boolean>>({ S: true, O: true, A: true, P: true });
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

  const doctorName = currentStaff?.name ?? 'Doctor';
  const doctorInitials = getInitials(doctorName);
  const activeAlerts = cdssAlerts.filter(a => !a.dismissed);
  const firstNote = clinicalNotes[0];
  const currentPatient = queuePatients.find(p => p.status === 'IN_SESSION') ?? queuePatients[0];
  const patientPrescriptions = prescriptions.filter(p =>
    p.patientId === (currentPatient?.patientId ?? 'p1')
  ).slice(0, 5);

  // Timer
  useEffect(() => {
    if (!activeCall || callEnded) return;
    const t = setInterval(() => setCallTimer((c) => c + 1), 1000);
    return () => clearInterval(t);
  }, [activeCall, callEnded]);

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
    setActiveCall({ id, name });
    setCallEnded(false);
    setCallTimer(0);
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

  // AI: append generated content to existing SOAP
  const handleGenerateSoap = () => {
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
        patientId: currentPatient?.patientId ?? 'p1',
        patientName: activeCall?.name ?? 'Patient',
        doctorId: currentStaff?.id ?? 'doc-1',
        doctorName: doctorName,
        testName: order.name,
        testType: order.type,
        priority: 'Routine',
        status: 'Ordered',
        orderedDate: new Date().toISOString(),
      });
      setPlacedOrders(prev => new Set(prev).add(order.name));
      setOrderPending(null);
      showToast(`${order.name} ordered`, 'success');
    }, 800);
  };

  // Prescriptions: quick prescribe into context
  const handleQuickPrescribe = (rx: typeof QUICK_RX[0]) => {
    if (rxSent.has(rx.medication)) return;
    addPrescription({
      patientId: currentPatient?.patientId ?? 'p1',
      patientName: activeCall?.name ?? 'Patient',
      doctorId: currentStaff?.id ?? 'doc-1',
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
    showToast(`${rx.medication} prescribed`, 'success');
  };

  // ===== WAITING ROOM =====
  if (!activeCall) {
    return (
      <div className="tc-page">
        <h2 className="tc-title">Teleconsult</h2>
        <p className="tc-subtitle">Patients waiting for teleconsultation</p>
        <div className="tc-waiting-list">
          {MOCK_WAITING.map((p) => (
            <div key={p.id} className="tc-waiting-card">
              <div className="tc-waiting-avatar">{getInitials(p.name)}</div>
              <div className="tc-waiting-info">
                <span className="tc-waiting-name">{p.name}</span>
                <span className="tc-waiting-complaint">{p.complaint}</span>
                <span className="tc-waiting-wait"><Clock size={12} /> Waiting {p.waitMin}m · {p.age}{p.sex}</span>
              </div>
              <button className="tc-join-btn" onClick={() => handleJoinCall(p.id, p.name)}>
                <Video size={16} /> Join
              </button>
            </div>
          ))}
        </div>
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
          <Link to="/doctor/encounter" className="tc-action-btn tc-action-btn--primary">
            <FileCheck size={18} /> Review Full Encounter
          </Link>
          <button className="tc-action-btn" onClick={() => { showToast('Summary pushed to patient records', 'success'); }}>
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

  // ===== ACTIVE CALL VIEW =====
  return (
    <div className={`tc-page ${videoMinimized ? 'tc-page--minimized' : ''}`}>

      {/* ===== VIDEO AREA ===== */}
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
          <button className="tc-pip-toggle" onClick={() => setVideoMinimized(!videoMinimized)}
            title={videoMinimized ? 'Maximize video' : 'Minimize video'}>
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
              <button className="tc-ctrl-btn" onClick={() => showToast('Screen sharing toggled', 'info')} title="Share screen">
                <Monitor size={18} />
              </button>
              <button className={`tc-ctrl-btn ${chatOpen ? 'tc-ctrl-btn--active' : ''}`} onClick={() => setChatOpen(!chatOpen)} title="Chat">
                <MessageSquare size={18} />
              </button>
            </>
          )}
          {/* Recording toggle right in the control bar for heatmap accessibility */}
          {hasAI && videoMinimized && (
            <button
              className={`tc-ctrl-btn ${isRecording ? 'tc-ctrl-btn--rec' : ''}`}
              onClick={toggleRecording}
              title={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? <MicOff size={18} /> : <Sparkles size={18} />}
            </button>
          )}
          <button className="tc-ctrl-btn tc-ctrl-btn--end" onClick={handleEndCall} title="End call">
            <PhoneOff size={18} />
          </button>
        </div>
      </div>

      {/* ===== RECORDING STATUS BAR (visible across all tabs when minimized) ===== */}
      {videoMinimized && isRecording && (
        <div className="tc-recording-strip">
          <span className="tc-recording-dot" />
          <span>AI Recording · {formatTime(recordSeconds)} · {transcriptLines.length} lines captured</span>
          <button className="tc-recording-strip-btn" onClick={toggleRecording}>Stop</button>
        </div>
      )}

      {/* ===== DIRTY INDICATOR (unsaved changes) ===== */}
      {videoMinimized && soapDirty && (
        <div className="tc-dirty-strip">
          <AlertCircle size={13} />
          <span>Unsaved changes</span>
          <button className="tc-dirty-strip-btn" onClick={handleSaveDraft}>Save now</button>
        </div>
      )}

      {/* ===== CHAT PANEL (full mode) ===== */}
      {!videoMinimized && chatOpen && (
        <div className="tc-chat-panel">
          <div className="tc-chat-header">
            <span>Chat with {activeCall.name}</span>
            <button className="tc-chat-close" onClick={() => setChatOpen(false)}><X size={14} /></button>
          </div>
          <div className="tc-chat-messages">
            {chatMessages.map((m, i) => (
              <div key={i} className={`tc-chat-bubble ${m.from === 'doctor' ? 'tc-chat-bubble--doctor' : 'tc-chat-bubble--patient'}`}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="tc-chat-input-row">
            <input
              className="tc-chat-input"
              placeholder="Type message..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendChat()}
            />
            <button className="tc-chat-send" onClick={handleSendChat}><Send size={16} /></button>
          </div>
        </div>
      )}

      {/* ===== INTAKE PANEL (full mode) ===== */}
      {!videoMinimized && !chatOpen && (
        <div className="tc-intake-panel">
          <div className="tc-intake-title"><FileText size={16} /> Patient Intake</div>
          <div className="tc-intake-body">
            <p><strong>Chief Complaint:</strong> {MOCK_INTAKE.chiefComplaint}</p>
            <p><strong>Duration:</strong> {MOCK_INTAKE.duration}</p>
            <p><strong>History:</strong> {MOCK_INTAKE.history}</p>
            <p><strong>Allergies:</strong> <span className="tc-allergy-tag">{MOCK_INTAKE.allergies}</span></p>
            <p><strong>Current Meds:</strong> {MOCK_INTAKE.currentMeds}</p>
          </div>
          <button className="tc-encounter-hint" onClick={() => setVideoMinimized(true)}>
            <Minimize2 size={14} />
            Minimize video to open SOAP, AI & CDSS tools
          </button>
        </div>
      )}

      {/* ===== ENCOUNTER PANELS (minimized mode) ===== */}
      {videoMinimized && (
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
            <div className="tc-enc-panel">
              <div className="tc-enc-panel-header">
                <span className="tc-enc-panel-title">
                  SOAP Note
                  {aiGenerated && <span className="tc-ai-tag"><Sparkles size={10} /> AI</span>}
                </span>
                <div className="tc-enc-panel-meta">
                  {lastSaved && <span className="tc-saved-time">Saved {lastSaved}</span>}
                  <span className={`tc-enc-panel-badge ${noteSigned ? 'tc-enc-panel-badge--signed' : ''}`}>
                    {noteSigned ? '✓ Signed' : 'Draft'}
                  </span>
                </div>
              </div>

              {(['S', 'O', 'A', 'P'] as const).map((letter) => {
                const labels = { S: 'Subjective', O: 'Objective', A: 'Assessment', P: 'Plan' };
                const fields = { S: 'subjective', O: 'objective', A: 'assessment', P: 'plan' } as const;
                const expanded = expandedSoap[letter];
                const value = soapData[fields[letter]];
                const charCount = value.length;
                const hasAiContent = value.includes('--- AI Generated');
                return (
                  <div key={letter} className={`tc-soap-section ${hasAiContent ? 'tc-soap-section--ai' : ''}`}>
                    <div className="tc-soap-section-header" onClick={() => setExpandedSoap(p => ({ ...p, [letter]: !p[letter] }))}>
                      <span className={`tc-soap-letter tc-soap-letter--${letter.toLowerCase()}`}>{letter}</span>
                      <span className="tc-soap-label">{labels[letter]}</span>
                      {charCount > 0 && <span className="tc-soap-charcount">{charCount}</span>}
                      {hasAiContent && <Sparkles size={12} className="tc-soap-ai-icon" />}
                      {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                    {expanded && (
                      <div className="tc-soap-section-body">
                        <textarea
                          className="tc-soap-textarea"
                          value={value}
                          onChange={(e) => updateSoap(fields[letter], e.target.value)}
                          placeholder={`Enter ${labels[letter].toLowerCase()}...`}
                          rows={value.length > 200 ? 6 : 3}
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="tc-soap-actions">
                {hasAI && !aiGenerated && (
                  <button className="tc-btn tc-btn--ai" onClick={handleGenerateSoap} disabled={aiProcessing}>
                    {aiProcessing ? <Loader2 size={14} className="tc-spin" /> : <Sparkles size={14} />}
                    {aiProcessing ? 'Generating...' : 'Generate from AI'}
                  </button>
                )}
                <button className="tc-btn tc-btn--secondary" onClick={handleSaveDraft}>
                  <Save size={14} /> Save Draft
                </button>
                <button className="tc-btn tc-btn--primary" onClick={handleSignNote} disabled={noteSigned}>
                  <CheckCircle2 size={14} /> {noteSigned ? 'Signed ✓' : 'Sign Note'}
                </button>
              </div>
            </div>
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

              {/* Recording control */}
              <button
                className={`tc-record-btn ${isRecording ? 'tc-record-btn--active' : ''}`}
                onClick={toggleRecording}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                <span>{isRecording ? `Recording... ${formatTime(recordSeconds)}` : 'Tap to Start Recording'}</span>
                {isRecording && <span className="tc-record-pulse" />}
              </button>

              {/* Live transcript */}
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

              {/* Generate SOAP from transcript */}
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
                  <button className="tc-ai-success-btn" onClick={() => setEncounterTab('soap')}>
                    View SOAP →
                  </button>
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
                        <button className="tc-btn tc-btn--small tc-btn--secondary" onClick={() => { dismissAlert(alert.id); showToast('Alert dismissed', 'info'); }}>
                          Dismiss
                        </button>
                        <button className="tc-btn tc-btn--small tc-btn--primary" onClick={() => {
                          dismissAlert(alert.id);
                          showToast(`Action taken: ${alert.recommendation}`, 'success');
                          // If recommendation mentions ordering, switch to orders
                          if (alert.recommendation.toLowerCase().includes('order') && labsEnabled) {
                            setEncounterTab('orders');
                          }
                        }}>
                          Take Action
                        </button>
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
                {placedOrders.size > 0 && (
                  <span className="tc-enc-badge-count">{placedOrders.size} placed</span>
                )}
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

              {/* Quick prescribe panel */}
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
                          <div className="tc-quickrx-chip-name">
                            {sent ? <Check size={13} /> : <Pill size={13} />}
                            {rx.medication}
                          </div>
                          <div className="tc-quickrx-chip-detail">{rx.dosage} · {rx.frequency}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Current prescriptions */}
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
                      <span className={`tc-rx-status tc-rx-status--${rx.status.toLowerCase().replace(/\s/g, '-')}`}>
                        {rx.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
