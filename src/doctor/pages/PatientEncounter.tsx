import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  FileSignature,
  Send,
  Pill,
  User,
  AlertTriangle,
  ClipboardList,
  Activity,
  ShieldAlert,
  ShieldCheck,
  Phone,
  ArrowLeft,
  CheckCircle2,
  Save,
  Loader2,
  Copy,
  X,
  Clock,
  Star,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProvider } from '../../provider/context/ProviderContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../theme/ThemeContext';
import type { ClinicalNote, CDSSAlert } from '../../provider/types';
import type { ReactNode } from 'react';
import { SoapNotePanel } from '../components/SoapNotePanel';

type TabKey = 'soap' | 'transcriber' | 'cdss' | 'orders' | 'prescriptions' | 'chart';
type SoapSection = 'S' | 'O' | 'A' | 'P';

const TRANSCRIPT_LINES = [
  { speaker: 'doctor' as const, text: 'What brings you in today?', ts: '00:05' },
  { speaker: 'patient' as const, text: "I've been having chest pains for the past week...", ts: '00:12' },
  { speaker: 'doctor' as const, text: 'Can you describe the pain? Is it sharp or dull?', ts: '00:22' },
  { speaker: 'patient' as const, text: "It's more of a pressure, especially when I climb stairs.", ts: '00:35' },
  { speaker: 'doctor' as const, text: 'Does it radiate anywhere — to your arm, jaw, or back?', ts: '00:48' },
  { speaker: 'patient' as const, text: 'Sometimes I feel it in my left arm, but it goes away after I rest.', ts: '01:02' },
  { speaker: 'doctor' as const, text: 'Any shortness of breath, dizziness, or sweating?', ts: '01:15' },
  { speaker: 'patient' as const, text: 'A little short of breath when climbing stairs. No dizziness or sweating.', ts: '01:28' },
  { speaker: 'doctor' as const, text: 'Are you taking your current medications regularly?', ts: '01:42' },
  { speaker: 'patient' as const, text: 'Yes, I take everything as prescribed. Aspirin, Atorvastatin, and Metoprolol.', ts: '01:55' },
];

// AI-generated content uses a special delimiter (⌁AI⌁) that we detect for subtle styling
const AI_DELIMITER = '⌁AI⌁';
const AI_SOAP_APPEND = {
  subjective: `\n\n${AI_DELIMITER}\nPatient reports chest pressure for 1 week, exertional, resolves with rest. Occasional radiation to left arm. Mild exertional dyspnea. No dizziness or diaphoresis. Medication compliant — Aspirin, Atorvastatin, Metoprolol.`,
  objective: `\n\n${AI_DELIMITER}\nVS: BP 132/82, HR 78, RR 16, Temp 36.6°C, SpO2 97%.\nCardiac: Regular rate and rhythm, S1/S2 normal, no murmurs.\nLungs: Clear to auscultation bilaterally.\nExtremities: No edema, pulses 2+ bilaterally.`,
  assessment: `\n\n${AI_DELIMITER}\nStable angina pectoris (ICD-10: I20.9). Exertional chest pain with classic pattern. Currently on appropriate medical therapy.`,
  plan: `\n\n${AI_DELIMITER}\n1. Continue Aspirin 81mg, Atorvastatin 40mg, Metoprolol 50mg\n2. Order stress ECG to evaluate exercise tolerance\n3. Lipid panel and troponin levels\n4. Nitroglycerin SL 0.4mg PRN for acute episodes\n5. Follow-up in 2 weeks or sooner if symptoms worsen\n6. Patient educated on warning signs requiring ER visit`,
};

const QUICK_ORDERS = ['CBC', 'FBS', 'Lipid Panel', 'Urinalysis', 'Chest X-Ray', 'ECG', 'Ultrasound'];
const FREQUENCY_OPTIONS = ['Once daily', 'Twice daily', 'Three times daily', 'As needed', 'At bedtime', 'With meals'];

const styles: Record<string, React.CSSProperties> = {
  root: { display: 'flex', flexDirection: 'column', gap: 20, minHeight: '100%', maxWidth: 960, margin: '0 auto', width: '100%' },
  header: {
    background: 'var(--color-surface, white)',
    borderRadius: 'var(--radius-lg, 14px)',
    padding: '18px 20px',
    boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.08))',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 },
  patientName: { fontSize: 20, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.3 },
  patientMeta: { fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 },
  badge: {
    fontSize: 12,
    fontWeight: 600,
    padding: '6px 12px',
    borderRadius: 12,
    background: 'rgba(16, 185, 129, 0.1)',
    color: 'var(--color-success)',
  },
  allergyBadge: {
    fontSize: 12,
    padding: '4px 10px',
    borderRadius: 6,
    background: 'rgba(239, 68, 68, 0.12)',
    color: 'var(--color-error)',
    fontWeight: 600,
  },
  tabsRow: {
    display: 'flex',
    overflowX: 'auto',
    gap: 4,
    background: 'var(--color-surface)',
    borderRadius: 12,
    padding: 5,
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border, #e2e8f0)',
  },
  tab: {
    padding: '10px 16px',
    border: 'none',
    background: 'transparent',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.15s',
  },
  tabActive: {
    background: 'var(--color-primary)',
    color: 'white',
  },
  panel: {
    background: 'var(--color-surface)',
    borderRadius: 14,
    padding: '20px',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border, #e2e8f0)',
    flex: 1,
  },
  soapCard: {
    background: 'var(--color-surface)',
    borderRadius: 12,
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border, #e2e8f0)',
    overflow: 'hidden',
    marginBottom: 14,
  },
  soapCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    background: 'var(--color-background)',
    borderBottom: '1px solid var(--color-border)',
    cursor: 'pointer',
  },
  soapLetterS: { width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', background: 'var(--color-info)' },
  soapLetterO: { width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', background: 'var(--color-success)' },
  soapLetterA: { width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', background: 'var(--color-warning)' },
  soapLetterP: { width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', background: 'var(--color-purple)' },
  aiBadge: {
    fontSize: 9,
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: 4,
    background: 'linear-gradient(135deg, var(--color-purple), var(--color-indigo))',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: 3,
  },
  textarea: {
    width: '100%',
    minHeight: 100,
    border: '1px solid var(--color-border)',
    borderRadius: 10,
    padding: '12px 14px',
    fontSize: 14,
    fontFamily: 'inherit',
    lineHeight: 1.6,
    color: 'var(--color-text)',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  icdChip: {
    padding: '4px 10px',
    borderRadius: 6,
    background: 'rgba(139, 92, 246, 0.08)',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-purple)',
  },
  recordBtn: {
    width: '100%',
    padding: '24px',
    border: '2px dashed var(--color-border)',
    borderRadius: 12,
    background: 'var(--color-background)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-text)',
    transition: 'all 0.2s',
  },
  recordBtnActive: {
    borderColor: 'var(--color-error)',
    background: 'rgba(239, 68, 68, 0.06)',
    color: 'var(--color-error)',
  },
  severityBadgeContra: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' as const, background: '#7f1d1d', color: 'white' },
  severityBadgeMajor: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' as const, background: 'var(--color-error-dark)', color: 'white' },
  severityBadgeModerate: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' as const, background: '#ea580c', color: 'white' },
  severityBadgeMinor: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' as const, background: '#ca8a04', color: 'white' },
  severityBadgeInfo: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' as const, background: 'var(--color-info-dark)', color: 'white' },
  severityBadgeDefault: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' as const, background: '#6b7280', color: 'white' },
  actionBar: {
    display: 'flex',
    gap: 12,
    padding: '18px 0',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    flex: 1,
    minWidth: 120,
    padding: '14px 18px',
    borderRadius: 12,
    border: 'none',
    background: 'var(--color-primary)',
    color: 'white',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnSecondary: {
    padding: '14px 18px',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
};

export const PatientEncounter = () => {
  const {
    clinicalNotes,
    signNote,
    saveDraftNote,
    cdssAlerts,
    dismissAlert,
    labOrders,
    prescriptions,
    approvePrescription,
    addPrescription,
    updateLabOrderStatus,
    queuePatients,
    completePatient,
    pharmacyItems,
    currentStaff,
    addCdssAlert,
    addLabOrder,
  } = useProvider();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { tenant } = useTheme();
  const hasCDSS = tenant.features.cdss ?? false;
  const hasAI = tenant.features.aiAssistant ?? false;
  const labsEnabled = tenant.features.visits.clinicLabFulfillmentEnabled;
  const loaEnabled = tenant.features.loa;

  const [activeTab, setActiveTab] = useState<TabKey>('soap');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [soapForm, setSoapForm] = useState<Partial<ClinicalNote>>({});
  const [encounterElapsed, setEncounterElapsed] = useState(0);

  // AI transcriber state
  const [transcriptLines, setTranscriptLines] = useState<typeof TRANSCRIPT_LINES>([]);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Sign note / CDSS confirmation state
  const [showCdssConfirm, setShowCdssConfirm] = useState(false);
  const [signAction, setSignAction] = useState<'sign' | 'signAndClose' | null>(null);
  const [showSignedNote, setShowSignedNote] = useState(false);
  const [signedNoteSnapshot, setSignedNoteSnapshot] = useState<Partial<ClinicalNote> | null>(null);
  const [signedTimestamp, setSignedTimestamp] = useState('');
  const [encounterClosed, setEncounterClosed] = useState(false);

  // Prescription form state
  const [rxSearch, setRxSearch] = useState('');
  const [rxShowDropdown, setRxShowDropdown] = useState(false);
  const [rxSelectedMed, setRxSelectedMed] = useState<{ name: string; genericName: string; category: string; stockStatus: string } | null>(null);
  const [rxDosage, setRxDosage] = useState('');
  const [rxFrequency, setRxFrequency] = useState('');
  const [rxDuration, setRxDuration] = useState('');
  const [rxQuantity, setRxQuantity] = useState('');
  const [rxNotes, setRxNotes] = useState('');
  const rxSearchRef = useRef<HTMLDivElement>(null);

  const currentPatient = queuePatients.find((p) => p.status === 'IN_SESSION') ?? queuePatients[0];
  const patientId = currentPatient?.patientId ?? 'p1';
  const patientNotes = clinicalNotes.filter((n) => n.patientId === patientId);
  const firstNote = patientNotes[0];
  const activeAlerts = cdssAlerts.filter((a) => !a.dismissed);
  const patientLabOrders = labOrders.filter((o) => o.patientId === patientId);
  const patientPrescriptions = prescriptions.filter((p) => p.patientId === patientId).slice(0, 3);
  const pendingOrders = patientLabOrders.filter(
    (o) => o.status === 'Ordered' || o.status === 'Specimen Collected' || o.status === 'In Progress'
  );
  const completedOrders = patientLabOrders.filter(
    (o) => o.status === 'Resulted' || o.status === 'Reviewed'
  );

  useEffect(() => {
    const note = firstNote ?? clinicalNotes[0];
    if (note) {
      setSoapForm({
        subjective: note.subjective,
        objective: note.objective,
        assessment: note.assessment,
        plan: note.plan,
        icdCodes: note.icdCodes ?? [],
        status: note.status,
        aiGenerated: note.aiGenerated,
      });
    } else {
      setSoapForm({
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
        icdCodes: [],
        status: 'Draft',
        aiGenerated: false,
      });
    }
  }, [firstNote?.id, clinicalNotes]);

  useEffect(() => {
    if (!isRecording) return;
    const t = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [isRecording]);

  // Simulate transcript lines appearing one-by-one while recording
  useEffect(() => {
    if (!isRecording) return;
    const lineIndex = transcriptLines.length;
    if (lineIndex >= TRANSCRIPT_LINES.length) return;
    const delay = lineIndex === 0 ? 1200 : 2000 + Math.random() * 2500;
    const timer = setTimeout(() => {
      setTranscriptLines(prev => [...prev, TRANSCRIPT_LINES[lineIndex]]);
    }, delay);
    return () => clearTimeout(timer);
  }, [isRecording, transcriptLines.length]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptLines.length]);

  // Close rx dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rxSearchRef.current && !rxSearchRef.current.contains(e.target as Node)) {
        setRxShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Encounter timer — counts up while patient is in session
  useEffect(() => {
    if (!currentPatient || encounterClosed) return;
    const t = setInterval(() => setEncounterElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [currentPatient, encounterClosed]);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`;
  };

  const updateSoapField = (field: keyof ClinicalNote, value: string | string[]) => {
    setSoapForm((prev) => ({ ...prev, [field]: value }));
  };

  // Strip AI delimiters from SOAP content for the signed note
  const stripAiDelimiters = useCallback((text: string) => {
    return text.replace(new RegExp(`\\n?\\n?${AI_DELIMITER}\\n?`, 'g'), '\n\n');
  }, []);

  const performSign = useCallback((action: 'sign' | 'signAndClose') => {
    if (!firstNote) {
      showToast('No note to sign. Save draft first.', 'info');
      return;
    }
    // Create a snapshot of the note for display (strip AI delimiters)
    const snapshot: Partial<ClinicalNote> = {
      subjective: stripAiDelimiters(soapForm.subjective || ''),
      objective: stripAiDelimiters(soapForm.objective || ''),
      assessment: stripAiDelimiters(soapForm.assessment || ''),
      plan: stripAiDelimiters(soapForm.plan || ''),
      icdCodes: soapForm.icdCodes,
      aiGenerated: soapForm.aiGenerated,
    };
    // Save the draft with cleaned content first, then sign
    saveDraftNote(firstNote.id, {
      subjective: stripAiDelimiters(soapForm.subjective || ''),
      objective: stripAiDelimiters(soapForm.objective || ''),
      assessment: stripAiDelimiters(soapForm.assessment || ''),
      plan: stripAiDelimiters(soapForm.plan || ''),
    });
    signNote(firstNote.id);
    setSignedNoteSnapshot(snapshot);
    setSignedTimestamp(new Date().toLocaleString());

    if (action === 'signAndClose') {
      if (currentPatient) completePatient(currentPatient.patientId);
      showToast('Note signed — encounter closed', 'success');
      setEncounterClosed(true);
      setShowSignedNote(true);
    } else {
      showToast('Note signed successfully', 'success');
      setShowSignedNote(true);
    }
    // Also stop recording if it's still going
    if (isRecording) setIsRecording(false);
  }, [firstNote, soapForm, signNote, saveDraftNote, currentPatient, completePatient, showToast, isRecording, stripAiDelimiters]);

  const handleSignNote = () => {
    if (!firstNote) {
      showToast('No note to sign. Save draft first.', 'info');
      return;
    }
    // Check for unreviewed CDSS alerts
    if (activeAlerts.length > 0) {
      setSignAction('sign');
      setShowCdssConfirm(true);
      return;
    }
    performSign('sign');
  };

  const handleQuickOrder = (name: string) => {
    // Actually create the lab order
    const isImaging = ['X-Ray', 'Ultrasound', 'ECG'].some(t => name.includes(t));
    addLabOrder({
      patientId: currentPatient?.patientId ?? 'p1',
      patientName: currentPatient?.patientName ?? 'Patient',
      doctorId: currentStaff?.id ?? 'staff-001',
      doctorName: currentStaff?.name ?? 'Doctor',
      testName: name,
      testType: isImaging ? 'Imaging' : 'Laboratory',
      status: 'Ordered',
      orderedDate: new Date().toISOString().slice(0, 10),
      priority: 'Routine',
    });
    showToast(`Order placed: ${name}`, 'success');

    // CDSS: trigger contextual alerts based on what was ordered
    if (hasCDSS) {
      const nameLower = name.toLowerCase();
      // Imaging with contrast → Metformin interaction warning
      if (nameLower.includes('x-ray') || nameLower.includes('ultrasound')) {
        const patientMeds = prescriptions.filter(p => p.patientId === patientId);
        const onMetformin = patientMeds.some(p => p.medication.toLowerCase().includes('metformin'));
        if (onMetformin) {
          addCdssAlert({
            type: 'drug_interaction',
            severity: 'major',
            title: 'Contrast-Drug Interaction Risk',
            message: `Patient is on Metformin. ${name} may involve contrast dye.`,
            recommendation: 'Hold Metformin 48h before/after contrast imaging. Verify renal function (eGFR).',
            orderId: name,
            dismissed: false,
            actioned: false,
            createdAt: new Date().toISOString(),
          });
          showToast('CDSS Alert: Drug-imaging interaction detected', 'info');
        }
      }
      // Duplicate order detection
      const existingOrder = patientLabOrders.find(
        o => o.testName === name && (o.status === 'Ordered' || o.status === 'In Progress')
      );
      if (existingOrder) {
        addCdssAlert({
          type: 'duplicate_order',
          severity: 'moderate',
          title: 'Possible Duplicate Order',
          message: `"${name}" already ordered for this patient (status: ${existingOrder.status}).`,
          recommendation: 'Review existing order before proceeding. Cancel duplicate if not needed.',
          orderId: existingOrder.id,
          dismissed: false,
          actioned: false,
          createdAt: new Date().toISOString(),
        });
        showToast('CDSS Alert: Duplicate order detected', 'info');
      }
    }
  };

  const getSeverityBadgeStyle = (severity: string): React.CSSProperties => {
    const key = severity === 'contraindicated' ? 'Contra' : severity === 'major' ? 'Major' : severity === 'moderate' ? 'Moderate' : severity === 'minor' ? 'Minor' : severity === 'info' ? 'Info' : 'Default';
    return (styles as Record<string, React.CSSProperties>)[`severityBadge${key}`] ?? styles.severityBadgeDefault;
  };

  const getSeverityStyle = (severity: string) => {
    const map: Record<string, string> = {
      contraindicated: '#7f1d1d',
      major: 'var(--color-error-dark)',
      moderate: '#ea580c',
      minor: '#ca8a04',
      info: 'var(--color-info-dark)',
    };
    return map[severity] ?? '#6b7280';
  };

  const formatTime = (sec: number) =>
    `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

  const groupAlertsByCategory = (alerts: CDSSAlert[]) => {
    const groups: Record<string, CDSSAlert[]> = {};
    const labels: Record<string, string> = {
      drug_interaction: 'Drug Interactions',
      drug_allergy: 'Allergies',
      dosage_range: 'Dosage',
      guideline: 'Guidelines',
      preventive_care: 'Preventive Care',
      duplicate_order: 'Duplicate Orders',
      critical_value: 'Critical Values',
      formulary: 'Formulary',
    };
    alerts.forEach((a) => {
      const cat = labels[a.type] ?? 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(a);
    });
    return groups;
  };

  const handleSignAndClose = () => {
    if (!firstNote) {
      showToast('No note to sign. Save draft first.', 'info');
      return;
    }
    // Check for unreviewed CDSS alerts
    if (activeAlerts.length > 0) {
      setSignAction('signAndClose');
      setShowCdssConfirm(true);
      return;
    }
    performSign('signAndClose');
  };

  const handleSaveDraft = () => {
    if (firstNote) {
      saveDraftNote(firstNote.id, {
        subjective: soapForm.subjective ?? '',
        objective: soapForm.objective ?? '',
        assessment: soapForm.assessment ?? '',
        plan: soapForm.plan ?? '',
      });
      showToast('Draft saved', 'success');
    } else {
      showToast('Draft saved locally', 'info');
    }
  };

  const handleReferPatient = () => {
    showToast(`Referral initiated for ${currentPatient?.patientName ?? 'patient'}`, 'success');
  };

  if (!currentPatient) {
    return (
      <div style={{ ...styles.root, alignItems: 'center', justifyContent: 'center', padding: 60 }}>
        <Activity size={48} style={{ color: 'var(--color-border)', marginBottom: 12 }} />
        <h3 style={{ fontWeight: 600, marginBottom: 4 }}>No active encounter</h3>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 20 }}>
          Start a consult from the Queue to begin documenting.
        </p>
        <button
          onClick={() => navigate('/doctor/queue')}
          style={{
            ...styles.btnPrimary,
            padding: '12px 24px',
            display: 'inline-flex',
          }}
        >
          <ArrowLeft size={16} /> Go to Queue
        </button>
      </div>
    );
  }

  // Resolve effective tab early (before tabList JSX is built)
  const effectiveTab: TabKey = activeTab === 'orders' && !labsEnabled ? 'soap' : activeTab;

  const tabs: { key: TabKey; label: string; icon: ReactNode }[] = [
    { key: 'soap', label: 'SOAP Notes', icon: <FileSignature size={14} /> },
    ...(hasAI ? [{ key: 'transcriber' as TabKey, label: 'AI Transcriber', icon: <Mic size={14} /> }] : []),
    ...(hasCDSS ? [{ key: 'cdss' as TabKey, label: 'CDSS Alerts', icon: <AlertTriangle size={14} /> }] : []),
    ...(labsEnabled ? [{ key: 'orders' as TabKey, label: 'Orders', icon: <ClipboardList size={14} /> }] : []),
    { key: 'prescriptions', label: 'Prescriptions', icon: <Pill size={14} /> },
    { key: 'chart', label: 'Patient Chart', icon: <User size={14} /> },
  ];

  const tabList = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Recording indicator strip — visible across all tabs */}
      {isRecording && effectiveTab !== 'transcriber' && (
        <button
          onClick={() => setActiveTab('transcriber')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 14px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            width: '100%',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--color-error)',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-error)', animation: 'pulse 1.5s infinite' }} />
          Recording in progress — {formatTime(recordingSeconds)} · {transcriptLines.length} lines captured
          <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 500, textDecoration: 'underline' }}>View</span>
        </button>
      )}
      {/* AI processing strip */}
      {aiProcessing && effectiveTab !== 'transcriber' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 14px',
            background: 'rgba(var(--color-primary-rgb, 59, 130, 246), 0.06)',
            border: '1px solid rgba(var(--color-primary-rgb, 59, 130, 246), 0.15)',
            borderRadius: '8px 8px 0 0',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--color-primary)',
          }}
        >
          <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
          AI generating SOAP notes from transcript...
        </div>
      )}
      <div style={styles.tabsRow}>
        {tabs.map((t) => (
          <button
            key={t.key}
            style={{ ...styles.tab, ...(effectiveTab === t.key ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(t.key)}
          >
            {t.icon}
            {t.label}
            {t.key === 'cdss' && activeAlerts.length > 0 && (
              <span
                style={{
                  background: 'var(--color-error)',
                  color: 'white',
                  borderRadius: 8,
                  padding: '1px 5px',
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                {activeAlerts.length}
              </span>
            )}
            {t.key === 'transcriber' && isRecording && (
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--color-error)',
                  animation: 'pulse 1.5s infinite',
                }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const handleViewSignedCopy = () => {
    if (!signedNoteSnapshot) {
      setSignedNoteSnapshot({
        subjective: stripAiDelimiters(soapForm.subjective || ''),
        objective: stripAiDelimiters(soapForm.objective || ''),
        assessment: stripAiDelimiters(soapForm.assessment || ''),
        plan: stripAiDelimiters(soapForm.plan || ''),
        icdCodes: soapForm.icdCodes,
        aiGenerated: soapForm.aiGenerated,
      });
      setSignedTimestamp(new Date().toLocaleString());
    }
    setShowSignedNote(true);
  };

  const renderSoapPanel = () => (
    <SoapNotePanel
      compact={false}
      soapData={{
        subjective: soapForm.subjective ?? '',
        objective: soapForm.objective ?? '',
        assessment: soapForm.assessment ?? '',
        plan: soapForm.plan ?? '',
      }}
      onSoapChange={(field, value) => updateSoapField(field, value)}
      status={soapForm.status ?? 'Draft'}
      icdCodes={soapForm.icdCodes}
      aiAssisted={soapForm.aiGenerated}
      hasAI={hasAI}
      aiGenerated={aiGenerated}
      aiProcessing={aiProcessing}
      isRecording={isRecording}
      recordingSeconds={recordingSeconds}
      transcriptLinesCount={transcriptLines.length}
      onGenerateSoap={handleGenerateSoap}
      onSaveDraft={handleSaveDraft}
      onSignNote={handleSignNote}
      onViewSignedCopy={handleViewSignedCopy}
      activeAlertsCount={activeAlerts.length}
      formatTime={formatTime}
    />
  );

  const handleGenerateSoap = () => {
    if (transcriptLines.length === 0) {
      showToast('Record a conversation first to generate SOAP notes', 'info');
      return;
    }
    // Stop recording when generating SOAP
    if (isRecording) {
      setIsRecording(false);
    }
    setAiProcessing(true);
    // Simulate AI processing time
    setTimeout(() => {
      setSoapForm((prev) => ({
        ...prev,
        subjective: (prev.subjective || '') + AI_SOAP_APPEND.subjective,
        objective: (prev.objective || '') + AI_SOAP_APPEND.objective,
        assessment: (prev.assessment || '') + AI_SOAP_APPEND.assessment,
        plan: (prev.plan || '') + AI_SOAP_APPEND.plan,
        aiGenerated: true,
      }));
      setAiProcessing(false);
      setAiGenerated(true);
      showToast('AI generated SOAP notes appended from transcript', 'success');
    }, 3000);
  };

  const handleStartRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
      setTranscriptLines([]);
      setAiGenerated(false);
    }
  };

  const renderTranscriberPanel = () => (
    <div style={styles.panel}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Recording control */}
        <button
          style={{
            ...styles.recordBtn,
            ...(isRecording ? styles.recordBtnActive : {}),
          }}
          onClick={handleStartRecording}
        >
          {isRecording ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: 'var(--color-error)',
                    animation: 'pulse 1.5s infinite',
                  }}
                />
                <MicOff size={32} />
              </div>
              <span>Recording... {formatTime(recordingSeconds)}</span>
              <span style={{ fontSize: 12, fontWeight: 400 }}>Tap to stop recording</span>
            </>
          ) : (
            <>
              <Mic size={32} style={{ color: 'var(--color-text-muted)' }} />
              <span>{transcriptLines.length > 0 ? 'Restart Recording' : 'Start Recording'}</span>
              <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-text-muted)' }}>
                AI transcribes the conversation in real-time
              </span>
            </>
          )}
        </button>

        {/* Live transcript feed */}
        <div
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            padding: 14,
            background: 'var(--color-background)',
            minHeight: 180,
            maxHeight: 350,
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>
              Live Transcript
              {isRecording && (
                <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--color-error)', fontWeight: 500 }}>
                  ● LIVE
                </span>
              )}
            </div>
            {transcriptLines.length > 0 && (
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                {transcriptLines.length} / {TRANSCRIPT_LINES.length} lines
              </span>
            )}
          </div>

          {transcriptLines.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--color-text-muted)' }}>
              <Mic size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
              <div style={{ fontSize: 13 }}>
                {isRecording
                  ? 'Listening... transcript will appear here'
                  : 'Start recording to capture the conversation'}
              </div>
            </div>
          ) : (
            transcriptLines.map((line, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 10,
                  fontSize: 13,
                  display: 'flex',
                  gap: 8,
                  alignItems: 'flex-start',
                  animation: 'fadeInUp 0.3s ease',
                  padding: '6px 8px',
                  borderRadius: 6,
                  background: i === transcriptLines.length - 1 ? 'rgba(var(--color-primary-rgb, 59, 130, 246), 0.04)' : 'transparent',
                }}
              >
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)', minWidth: 36, paddingTop: 2 }}>
                  {line.ts}
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    minWidth: 54,
                    fontSize: 11,
                    color: line.speaker === 'doctor' ? 'var(--color-primary)' : '#0891b2',
                    paddingTop: 1,
                  }}
                >
                  {line.speaker === 'doctor' ? 'Dr.' : 'Pt.'}
                </span>
                <span style={{ flex: 1, lineHeight: 1.4 }}>{line.text}</span>
              </div>
            ))
          )}

          {/* Typing indicator */}
          {isRecording && transcriptLines.length < TRANSCRIPT_LINES.length && transcriptLines.length > 0 && (
            <div style={{ display: 'flex', gap: 4, padding: '8px', alignItems: 'center' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-text-muted)', animation: 'pulse 1s infinite', animationDelay: '0ms' }} />
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-text-muted)', animation: 'pulse 1s infinite', animationDelay: '200ms' }} />
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-text-muted)', animation: 'pulse 1s infinite', animationDelay: '400ms' }} />
            </div>
          )}
          <div ref={transcriptEndRef} />
        </div>

        {/* AI Processing indicator */}
        {aiProcessing && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              borderRadius: 8,
              background: 'rgba(var(--color-primary-rgb, 59, 130, 246), 0.06)',
              border: '1px solid rgba(var(--color-primary-rgb, 59, 130, 246), 0.15)',
            }}
          >
            <Loader2 size={18} style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>AI Processing Transcript</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Analyzing conversation and generating structured SOAP notes...</div>
            </div>
          </div>
        )}

        {/* Success banner */}
        {aiGenerated && !aiProcessing && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-success)' }}>
                SOAP notes generated
              </span>
            </div>
            <button
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
              onClick={() => setActiveTab('soap')}
            >
              View SOAP
            </button>
          </div>
        )}

        {/* Generate button */}
        <button
          style={{
            ...styles.btnPrimary,
            width: '100%',
            opacity: transcriptLines.length === 0 || aiProcessing ? 0.5 : 1,
            pointerEvents: transcriptLines.length === 0 || aiProcessing ? 'none' : 'auto',
          }}
          onClick={handleGenerateSoap}
          disabled={transcriptLines.length === 0 || aiProcessing}
        >
          {aiProcessing ? (
            <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</>
          ) : (
            <><Sparkles size={16} /> Generate SOAP Note</>
          )}
        </button>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center' }}>
          AI will analyze the transcript and append structured notes to your SOAP sections
        </div>
      </div>
    </div>
  );

  const renderCdssPanel = () => (
    <div style={styles.panel}>
      {activeAlerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
          <ShieldCheck size={40} style={{ color: 'var(--color-success)', marginBottom: 12 }} />
          <div style={{ fontWeight: 600, marginBottom: 4 }}>No active alerts</div>
          <div style={{ fontSize: 13 }}>All clinical checks passed{!loaEnabled && ' (formulary/LOA not configured for this facility)'}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(groupAlertsByCategory(activeAlerts)).map(([cat, alerts]) => (
            <div key={cat}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                {cat}
              </div>
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    padding: 14,
                    borderRadius: 8,
                    background: 'var(--color-surface)',
                    borderLeft: `4px solid ${getSeverityStyle(alert.severity)}`,
                    marginBottom: 8,
                    boxShadow: 'var(--shadow-sm)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Badge + Title row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{ ...getSeverityBadgeStyle(alert.severity), whiteSpace: 'nowrap', flexShrink: 0 }}>{alert.severity}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, minWidth: 0 }}>{alert.title}</span>
                  </div>
                  {/* Message */}
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                    {alert.message}
                  </div>
                  {/* Recommendation */}
                  <div
                    style={{
                      fontSize: 12,
                      padding: '8px 10px',
                      background: 'var(--color-background)',
                      borderRadius: 6,
                      lineHeight: 1.5,
                      marginBottom: 10,
                    }}
                  >
                    {alert.recommendation}
                  </div>
                  {/* Action buttons — always below content */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      style={{ ...styles.btnSecondary, padding: '8px 14px', flex: 'none', fontSize: 13 }}
                      onClick={() => {
                        dismissAlert(alert.id);
                        showToast('Alert dismissed', 'info');
                      }}
                    >
                      Dismiss
                    </button>
                    <button
                      style={{ ...styles.btnPrimary, padding: '8px 14px', flex: 'none', minWidth: 0, fontSize: 13 }}
                      onClick={() => {
                        dismissAlert(alert.id);
                        showToast(`Action taken: ${alert.recommendation}`, 'success');
                      }}
                    >
                      Take Action
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderOrdersPanel = () => (
    <div style={styles.panel}>
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Order Lab/Imaging</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {QUICK_ORDERS.map((name) => (
            <button
              key={name}
              style={styles.btnSecondary}
              onClick={() => handleQuickOrder(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Pending Orders</h4>
        {pendingOrders.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No pending orders</div>
        ) : (
          pendingOrders.map((o) => (
            <div
              key={o.id}
              style={{
                padding: 12,
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                marginBottom: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontWeight: 600 }}>{o.testName}</span>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 8 }}>
                  {o.status}
                </span>
              </div>
              <button
                style={{ ...styles.btnSecondary, padding: '6px 10px', fontSize: 12 }}
                onClick={() => updateLabOrderStatus(o.id, 'Cancelled')}
              >
                Cancel
              </button>
            </div>
          ))
        )}
      </div>
      <div>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Results</h4>
        {completedOrders.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No results yet</div>
        ) : (
          completedOrders.map((o) => (
            <div
              key={o.id}
              style={{
                padding: 12,
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                marginBottom: 8,
                borderLeft: o.isCritical ? '4px solid var(--color-error)' : undefined,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{o.testName}</div>
              <div style={{ fontSize: 13 }}>{o.result}</div>
              {o.referenceRange && (
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  Ref: {o.referenceRange}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const rxFilteredMeds = rxSearch.length >= 1
    ? pharmacyItems.filter(
        (m) =>
          m.name.toLowerCase().includes(rxSearch.toLowerCase()) ||
          m.genericName.toLowerCase().includes(rxSearch.toLowerCase()) ||
          m.category.toLowerCase().includes(rxSearch.toLowerCase())
      )
    : [];

  const handleSelectMed = (item: typeof pharmacyItems[0]) => {
    setRxSelectedMed({ name: item.name, genericName: item.genericName, category: item.category, stockStatus: item.status });
    setRxSearch(item.name);
    setRxShowDropdown(false);
    // Auto-fill dosage from the item name if it contains a dosage pattern
    const dosageMatch = item.name.match(/(\d+\s*(?:mg|mcg|ml|U\/mL|tab|cap))/i);
    if (dosageMatch) setRxDosage(dosageMatch[1]);
  };

  const handleClearRxForm = () => {
    setRxSearch('');
    setRxSelectedMed(null);
    setRxDosage('');
    setRxFrequency('');
    setRxDuration('');
    setRxQuantity('');
    setRxNotes('');
  };

  const handleSubmitRx = () => {
    if (!rxSelectedMed) {
      showToast('Select a medication from the search results', 'info');
      return;
    }
    if (!rxDosage || !rxFrequency) {
      showToast('Dosage and frequency are required', 'info');
      return;
    }
    const medName = rxSelectedMed.name;
    const medNameLower = medName.toLowerCase();

    addPrescription({
      patientId: currentPatient?.patientId ?? 'p1',
      patientName: currentPatient?.patientName ?? 'Patient',
      doctorId: currentStaff?.id ?? 'staff-001',
      doctorName: currentStaff?.name ?? 'Doctor',
      medication: medName,
      dosage: rxDosage,
      frequency: rxFrequency,
      duration: rxDuration || '30 days',
      quantity: parseInt(rxQuantity) || 30,
      refillsRemaining: 0,
      status: 'Active',
      prescribedDate: new Date().toISOString().slice(0, 10),
      notes: rxNotes || undefined,
    });
    showToast(`${medName} prescribed for ${currentPatient?.patientName ?? 'patient'} — sent to pharmacy`, 'success');

    // CDSS: trigger contextual alerts for the newly prescribed medication
    if (hasCDSS) {
      const now = new Date().toISOString();
      const patientAllergies = ['penicillin', 'sulfa']; // from patient chart
      const existingMeds = patientPrescriptions.map(p => p.medication.toLowerCase());

      // Allergy cross-reactivity check
      const allergyKeywords: Record<string, string[]> = {
        penicillin: ['amoxicillin', 'ampicillin', 'penicillin', 'augmentin', 'piperacillin'],
        sulfa: ['sulfamethoxazole', 'sulfasalazine', 'bactrim', 'cotrimoxazole'],
      };
      for (const allergy of patientAllergies) {
        const crossReactive = allergyKeywords[allergy] ?? [];
        if (crossReactive.some(k => medNameLower.includes(k))) {
          addCdssAlert({
            type: 'drug_allergy',
            severity: 'contraindicated',
            title: 'Allergy Cross-Reactivity',
            message: `${medName} is cross-reactive with patient's ${allergy} allergy.`,
            recommendation: `Do NOT administer. Consider alternative medication class.`,
            dismissed: false,
            actioned: false,
            createdAt: now,
          });
          showToast('CDSS ALERT: Allergy cross-reactivity detected!', 'info');
        }
      }

      // Common drug-drug interaction checks
      const interactions: Record<string, { with: string[]; msg: string; rec: string }> = {
        warfarin: { with: ['aspirin', 'ibuprofen', 'naproxen', 'clopidogrel'], msg: 'Increased bleeding risk', rec: 'Monitor INR closely. Consider gastroprotection.' },
        metformin: { with: ['contrast'], msg: 'Lactic acidosis risk with contrast dye', rec: 'Hold Metformin 48h before/after contrast.' },
        tramadol: { with: ['alprazolam', 'diazepam', 'lorazepam'], msg: 'CNS/respiratory depression risk', rec: 'Avoid combination. If necessary, use lowest doses and monitor closely.' },
        amlodipine: { with: ['simvastatin'], msg: 'Increased statin toxicity risk', rec: 'Limit simvastatin to 20mg/day when combined with Amlodipine.' },
      };
      for (const [drug, rule] of Object.entries(interactions)) {
        if (medNameLower.includes(drug)) {
          const conflicting = existingMeds.filter(m => rule.with.some(w => m.includes(w)));
          if (conflicting.length > 0) {
            addCdssAlert({
              type: 'drug_interaction',
              severity: 'major',
              title: 'Drug-Drug Interaction',
              message: `${medName} + ${conflicting.join(', ')}: ${rule.msg}.`,
              recommendation: rule.rec,
              dismissed: false,
              actioned: false,
              createdAt: now,
            });
            showToast('CDSS Alert: Drug interaction detected', 'info');
          }
        }
        // Check reverse too — if existing meds contain the key drug
        if (rule.with.some(w => medNameLower.includes(w)) && existingMeds.some(m => m.includes(drug))) {
          addCdssAlert({
            type: 'drug_interaction',
            severity: 'major',
            title: 'Drug-Drug Interaction',
            message: `${medName} interacts with patient's existing ${drug} prescription: ${rule.msg}.`,
            recommendation: rule.rec,
            dismissed: false,
            actioned: false,
            createdAt: now,
          });
          showToast('CDSS Alert: Drug interaction detected', 'info');
        }
      }

      // Dosage range check for elderly/sensitive populations
      const dosageNum = parseFloat(rxDosage);
      if (medNameLower.includes('amlodipine') && dosageNum >= 10) {
        addCdssAlert({
          type: 'dosage_range',
          severity: 'moderate',
          title: 'High Dose Alert',
          message: `${medName} ${rxDosage} — maximum recommended starting dose is 5mg for patients with hepatic impairment or elderly.`,
          recommendation: 'Consider starting at 5mg and titrating up based on response.',
          dismissed: false,
          actioned: false,
          createdAt: now,
        });
      }

      // Controlled substance warning
      if (rxSelectedMed.stockStatus && pharmacyItems.find(p => p.name === medName)?.isControlled) {
        addCdssAlert({
          type: 'guideline',
          severity: 'moderate',
          title: 'Controlled Substance Prescribed',
          message: `${medName} is a controlled medication. Prescription requires additional documentation.`,
          recommendation: 'Ensure proper DEA/PRC documentation. Check PDMP for existing controlled substance prescriptions.',
          dismissed: false,
          actioned: false,
          createdAt: now,
        });
      }
    }

    handleClearRxForm();
  };

  const renderPrescriptionsPanel = () => (
    <div style={styles.panel}>
      <div
        style={{
          padding: '14px 16px',
          background: 'rgba(245, 158, 11, 0.1)',
          borderRadius: 10,
          marginBottom: 24,
          fontSize: 14,
          color: '#92400e',
          lineHeight: 1.5,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
        }}
      >
        <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>Drug interaction warning: Metformin + contrast dye. Hold Metformin 48h before/after imaging.</span>
      </div>

      {/* Active prescriptions */}
      <div style={{ marginBottom: 28 }}>
        <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
          Active Prescriptions ({patientPrescriptions.length})
        </h4>
        {patientPrescriptions.length === 0 ? (
          <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>None</div>
        ) : (
          patientPrescriptions.map((rx) => (
            <div
              key={rx.id}
              style={{
                padding: '14px 16px',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{rx.medication} {rx.dosage}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 3 }}>
                  {rx.frequency} · {rx.duration} · Qty: {rx.quantity}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  {rx.prescribedDate} · {rx.status}
                  {rx.notes && <> · {rx.notes}</>}
                </div>
              </div>
              {rx.status === 'Pending Approval' && (
                <button
                  style={{ ...styles.btnPrimary, padding: '10px 20px', flexShrink: 0, borderRadius: 10, fontSize: 14 }}
                  onClick={() => approvePrescription(rx.id)}
                >
                  Approve
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* New prescription form */}
      <div>
        <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>New Prescription</h4>

        {/* Favorite / frequent prescriptions */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star size={12} /> Frequent Prescriptions
          </div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            {[
              { name: 'Amlodipine 5mg', dose: '5mg', freq: 'Once daily' },
              { name: 'Metformin 500mg', dose: '500mg', freq: 'Twice daily' },
              { name: 'Losartan 50mg', dose: '50mg', freq: 'Once daily' },
              { name: 'Atorvastatin 20mg', dose: '20mg', freq: 'Once daily' },
              { name: 'Aspirin 81mg', dose: '81mg', freq: 'Once daily' },
              { name: 'Metoprolol 50mg', dose: '50mg', freq: 'Once daily' },
            ].map((fav) => (
              <button
                key={fav.name}
                onClick={() => {
                  const found = pharmacyItems.find(m => m.name.toLowerCase().includes(fav.name.split(' ')[0].toLowerCase()));
                  if (found) {
                    handleSelectMed(found);
                    setRxDosage(fav.dose);
                    setRxFrequency(fav.freq);
                  } else {
                    setRxSearch(fav.name);
                    setRxDosage(fav.dose);
                    setRxFrequency(fav.freq);
                  }
                }}
                style={{
                  padding: '6px 12px', borderRadius: 8, border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)', cursor: 'pointer', whiteSpace: 'nowrap',
                  fontSize: 12, fontWeight: 600, color: 'var(--color-text)',
                  display: 'flex', alignItems: 'center', gap: 4,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget).style.borderColor = 'var(--color-primary)'; (e.currentTarget).style.color = 'var(--color-primary)'; }}
                onMouseLeave={e => { (e.currentTarget).style.borderColor = 'var(--color-border)'; (e.currentTarget).style.color = 'var(--color-text)'; }}
              >
                <Pill size={11} /> {fav.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Medication search with autocomplete */}
          <div ref={rxSearchRef} style={{ position: 'relative' }}>
            <input
              style={{ ...styles.textarea, minHeight: 40, width: '100%', boxSizing: 'border-box' }}
              placeholder="Search medication (name, generic, or category)..."
              value={rxSearch}
              onChange={(e) => {
                setRxSearch(e.target.value);
                setRxShowDropdown(true);
                if (rxSelectedMed && e.target.value !== rxSelectedMed.name) {
                  setRxSelectedMed(null);
                }
              }}
              onFocus={() => { if (rxSearch.length >= 1) setRxShowDropdown(true); }}
            />
            {rxSelectedMed && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 6,
                  fontSize: 11,
                  color: 'var(--color-text-muted)',
                }}
              >
                <CheckCircle2 size={12} style={{ color: 'var(--color-success)' }} />
                {rxSelectedMed.genericName} · {rxSelectedMed.category}
                {rxSelectedMed.stockStatus !== 'In Stock' && (
                  <span style={{ color: 'var(--color-error)', fontWeight: 600 }}>
                    · {rxSelectedMed.stockStatus}
                  </span>
                )}
              </div>
            )}
            {/* Dropdown results */}
            {rxShowDropdown && rxSearch.length >= 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 50,
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  maxHeight: 240,
                  overflowY: 'auto',
                  marginTop: 4,
                }}
              >
                {rxFilteredMeds.length === 0 ? (
                  <div style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    No medications matching "{rxSearch}"
                  </div>
                ) : (
                  rxFilteredMeds.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectMed(item)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        padding: '10px 14px',
                        border: 'none',
                        borderBottom: '1px solid var(--color-border)',
                        background: 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        gap: 2,
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-background)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background:
                              item.status === 'In Stock'
                                ? 'rgba(16, 185, 129, 0.1)'
                                : item.status === 'Low Stock'
                                ? 'rgba(245, 158, 11, 0.1)'
                                : 'rgba(239, 68, 68, 0.1)',
                            color:
                              item.status === 'In Stock'
                                ? 'var(--color-success)'
                                : item.status === 'Low Stock'
                                ? 'var(--color-warning-dark)'
                                : 'var(--color-error)',
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        {item.genericName} · {item.category}
                        {item.isControlled && (
                          <span style={{ color: 'var(--color-error)', fontWeight: 600 }}> · Controlled</span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Dosage and frequency */}
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              style={{ ...styles.textarea, minHeight: 46, flex: 1 }}
              placeholder="Dosage (e.g. 20mg)"
              value={rxDosage}
              onChange={(e) => setRxDosage(e.target.value)}
            />
            <select
              style={{ ...styles.textarea, minHeight: 46, flex: 1 }}
              value={rxFrequency}
              onChange={(e) => setRxFrequency(e.target.value)}
            >
              <option value="">Frequency</option>
              {FREQUENCY_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Duration and quantity */}
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              style={{ ...styles.textarea, flex: 1, minHeight: 46 }}
              placeholder="Duration (e.g. 30 days)"
              value={rxDuration}
              onChange={(e) => setRxDuration(e.target.value)}
            />
            <input
              style={{ ...styles.textarea, flex: 1, minHeight: 46 }}
              placeholder="Quantity"
              type="number"
              value={rxQuantity}
              onChange={(e) => setRxQuantity(e.target.value)}
            />
          </div>

          {/* Notes */}
          <textarea
            style={{ ...styles.textarea, minHeight: 80, resize: 'vertical' }}
            placeholder="Notes (optional) — e.g. Take with food, avoid alcohol..."
            value={rxNotes}
            onChange={(e) => setRxNotes(e.target.value)}
          />

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <button
              style={{
                ...styles.btnPrimary,
                flex: 1,
                padding: '14px 16px',
                borderRadius: 12,
                fontSize: 15,
                opacity: !rxSelectedMed || !rxDosage || !rxFrequency ? 0.5 : 1,
              }}
              onClick={handleSubmitRx}
            >
              <Send size={16} /> e-Prescribe
            </button>
            {(rxSearch || rxDosage || rxFrequency || rxDuration || rxQuantity || rxNotes) && (
              <button
                style={{ ...styles.btnSecondary, padding: '14px 16px', borderRadius: 12, fontSize: 14 }}
                onClick={handleClearRxForm}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderChartPanel = () => (
    <div style={styles.panel}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Demographics</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 14 }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Name</span>
            <span style={{ fontWeight: 600 }}>{currentPatient.patientName}</span>
            <span style={{ color: 'var(--color-text-muted)' }}>DOB</span>
            <span>Jan 15, 1980</span>
            <span style={{ color: 'var(--color-text-muted)' }}>Gender</span>
            <span>Male</span>
            <span style={{ color: 'var(--color-text-muted)' }}>Blood Type</span>
            <span>O+</span>
            <span style={{ color: 'var(--color-text-muted)' }}>Contact</span>
            <span>0917-123-4567</span>
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Allergies</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['Penicillin', 'Sulfa'].map((a) => (
              <span key={a} style={styles.allergyBadge}>
                {a}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Active Medications</h4>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.8 }}>
            {['Rosuvastatin 20mg', 'Clopidogrel 75mg', 'Losartan 50mg'].map((m) => (
              <li key={m} style={{ marginBottom: 4 }}>{m}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Recent Visits</h4>
          {patientNotes.slice(0, 3).map((n) => (
            <div
              key={n.id}
              style={{
                padding: 12,
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>{n.date}</span>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{n.status}</span>
              </div>
              <div style={{ fontSize: 13 }}>{n.assessment}</div>
            </div>
          ))}
          {patientNotes.length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No recent visits</div>
          )}
        </div>
        {(tenant.features.hmo || tenant.features.philHealth) && (
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Insurance</h4>
            <div style={{ fontSize: 13 }}>
              {tenant.features.philHealth && <div>PhilHealth: 14-1234567890-1</div>}
              {tenant.features.hmo && <div style={{ color: 'var(--color-text-muted)' }}>HMO: Maxicare Prima</div>}
            </div>
          </div>
        )}
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Immunization Status</h4>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            Flu 2025 · COVID-19 (3 doses) · Pneumococcal up to date
          </div>
        </div>
      </div>
    </div>
  );

  const contentByTab: Record<TabKey, () => ReactNode> = {
    soap: renderSoapPanel,
    transcriber: renderTranscriberPanel,
    cdss: renderCdssPanel,
    orders: renderOrdersPanel,
    prescriptions: renderPrescriptionsPanel,
    chart: renderChartPanel,
  };

  const actionBar = (
    <div style={styles.actionBar}>
      <button style={styles.btnPrimary} onClick={handleSignAndClose}>
        <FileSignature size={16} /> Sign & Close
      </button>
      <button style={styles.btnSecondary} onClick={handleSaveDraft}>
        <Save size={16} /> Save Draft
      </button>
      <button style={styles.btnSecondary} onClick={handleReferPatient}>
        <Phone size={16} /> Refer Patient
      </button>
      {labsEnabled && (
        <button style={styles.btnSecondary} onClick={() => setActiveTab('orders')}>
          <ClipboardList size={16} /> Order Labs
        </button>
      )}
      <button style={styles.btnSecondary} onClick={() => setActiveTab('prescriptions')}>
        <Pill size={16} /> e-Prescribe
      </button>
    </div>
  );

  return (
    <div style={styles.root}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      {/* Patient Header Bar */}
      <div style={styles.header}>
        <div style={styles.headerRow}>
          <div>
            <div style={styles.patientName}>{currentPatient.patientName}</div>
            <div style={styles.patientMeta}>
              ID: {currentPatient.patientId} · 45 yrs · Male · {patientPrescriptions.length} active meds
              {tenant.features.philHealth && ' · PhilHealth Active'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={styles.badge}>In Session</span>
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 8,
              background: encounterElapsed > 1200 ? 'rgba(239,68,68,0.08)' : 'var(--color-background)',
              color: encounterElapsed > 1200 ? 'var(--color-error)' : 'var(--color-text-muted)',
              fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Clock size={12} /> {formatElapsed(encounterElapsed)}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <span style={styles.allergyBadge}>Penicillin</span>
          <span style={styles.allergyBadge}>Sulfa</span>
          {tenant.features.philHealth && (
            <span
              style={{
                ...styles.allergyBadge,
                background: 'rgba(59, 130, 246, 0.12)',
                color: 'var(--color-info)',
              }}
            >
              PhilHealth
            </span>
          )}
        </div>
      </div>

      {/* Layout: mobile = tabbed, desktop = multi-column */}
      {isDesktop ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 24,
            flex: 1,
            alignItems: 'start',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {tabList}
            {contentByTab[effectiveTab]()}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              position: 'sticky',
              top: 24,
            }}
          >
            {hasCDSS && effectiveTab !== 'cdss' && activeAlerts.length > 0 && (
              <div style={styles.panel}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                  Alerts ({activeAlerts.length})
                </div>
                {activeAlerts.slice(0, 2).map((a) => (
                  <div
                    key={a.id}
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 8,
                      borderLeft: `3px solid ${getSeverityStyle(a.severity)}`,
                      background: 'var(--color-background)',
                      fontSize: 13,
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{a.title}</div>
                    <div style={{ color: 'var(--color-text-muted)', marginTop: 3 }}>{a.message}</div>
                    <button
                      style={{ marginTop: 8, fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}
                      onClick={() => dismissAlert(a.id)}
                    >
                      Dismiss
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div style={styles.panel}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Quick Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button style={styles.btnPrimary} onClick={handleSignAndClose}>
                  <CheckCircle2 size={16} /> Sign & Close
                </button>
                <button style={styles.btnSecondary} onClick={handleSaveDraft}>
                  <Save size={16} /> Save Draft
                </button>
                <button style={styles.btnSecondary} onClick={handleReferPatient}>
                  <Phone size={16} /> Refer Patient
                </button>
                {labsEnabled && (
                  <button style={styles.btnSecondary} onClick={() => setActiveTab('orders')}>
                    <ClipboardList size={16} /> Order Labs
                  </button>
                )}
                <button style={styles.btnSecondary} onClick={() => setActiveTab('prescriptions')}>
                  <Pill size={16} /> e-Prescribe
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {tabList}
          <div style={{ flex: 1 }}>{contentByTab[effectiveTab]()}</div>
          {actionBar}
        </>
      )}

      {/* ═══ CDSS Warning Confirmation Modal ═══ */}
      {showCdssConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
          onClick={() => setShowCdssConfirm(false)}
        >
          <div
            style={{
              background: 'var(--color-surface)', borderRadius: 16, maxWidth: 480, width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              animation: 'fadeInUp 0.2s ease',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(245, 158, 11, 0.08)',
              borderBottom: '1px solid rgba(245, 158, 11, 0.15)',
            }}>
              <AlertTriangle size={22} style={{ color: 'var(--color-warning-dark)', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#92400e' }}>
                  Unreviewed CDSS Alerts
                </div>
                <div style={{ fontSize: 13, color: '#b45309', marginTop: 2 }}>
                  {activeAlerts.length} alert{activeAlerts.length !== 1 ? 's' : ''} require{activeAlerts.length === 1 ? 's' : ''} your attention
                </div>
              </div>
              <button
                onClick={() => setShowCdssConfirm(false)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>

            {/* Alert summary */}
            <div style={{ padding: '16px 20px', maxHeight: 220, overflowY: 'auto' }}>
              {activeAlerts.map((a) => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 12px', borderRadius: 8, marginBottom: 6,
                  borderLeft: `3px solid ${getSeverityStyle(a.severity)}`,
                  background: 'var(--color-background)',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ ...getSeverityBadgeStyle(a.severity), whiteSpace: 'nowrap' }}>{a.severity}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{a.title}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 3 }}>{a.message}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                style={{
                  ...styles.btnSecondary, flex: 1, justifyContent: 'center',
                  minWidth: 140,
                }}
                onClick={() => {
                  setShowCdssConfirm(false);
                  setActiveTab('cdss');
                }}
              >
                <AlertTriangle size={14} /> Review Alerts
              </button>
              <button
                style={{
                  ...styles.btnPrimary, flex: 1, justifyContent: 'center',
                  background: 'var(--color-warning-dark)', minWidth: 140,
                }}
                onClick={() => {
                  setShowCdssConfirm(false);
                  if (signAction) performSign(signAction);
                  setSignAction(null);
                }}
              >
                <FileSignature size={14} /> Sign Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Signed Note View Modal ═══ */}
      {showSignedNote && signedNoteSnapshot && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
          onClick={() => setShowSignedNote(false)}
        >
          <div
            style={{
              background: 'var(--color-surface)', borderRadius: 16, maxWidth: 600, width: '100%',
              maxHeight: '85vh', display: 'flex', flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              animation: 'fadeInUp 0.2s ease',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid var(--color-border)', flexShrink: 0,
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />
                  Signed Clinical Note
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {currentPatient?.patientName} · {signedTimestamp}
                  {signedNoteSnapshot.aiGenerated && (
                    <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: 'rgba(139,92,246,0.1)', color: 'var(--color-purple-dark)' }}>
                      AI-Assisted
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  style={{ ...styles.btnSecondary, padding: '8px 12px', fontSize: 12 }}
                  onClick={() => {
                    const text = `SOAP Note — ${currentPatient?.patientName}\nSigned: ${signedTimestamp}\n\n` +
                      `SUBJECTIVE:\n${signedNoteSnapshot.subjective?.trim()}\n\n` +
                      `OBJECTIVE:\n${signedNoteSnapshot.objective?.trim()}\n\n` +
                      `ASSESSMENT:\n${signedNoteSnapshot.assessment?.trim()}\n\n` +
                      `PLAN:\n${signedNoteSnapshot.plan?.trim()}` +
                      (signedNoteSnapshot.icdCodes?.length ? `\n\nICD-10: ${signedNoteSnapshot.icdCodes.join(', ')}` : '');
                    navigator.clipboard.writeText(text);
                    showToast('Signed note copied to clipboard', 'success');
                  }}
                >
                  <Copy size={14} /> Copy
                </button>
                <button
                  onClick={() => setShowSignedNote(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  <X size={18} style={{ color: 'var(--color-text-muted)' }} />
                </button>
              </div>
            </div>

            {/* Note body */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {/* CDSS alerts that were active at signing time */}
              {activeAlerts.length > 0 && (
                <div style={{
                  padding: '10px 14px', borderRadius: 8, marginBottom: 16,
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  fontSize: 12, color: '#92400e',
                }}>
                  <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={14} /> Note: {activeAlerts.length} CDSS alert{activeAlerts.length !== 1 ? 's were' : ' was'} active at signing
                  </div>
                  {activeAlerts.map((a) => (
                    <div key={a.id} style={{ marginTop: 4, paddingLeft: 20 }}>
                      • <strong>{a.severity.toUpperCase()}</strong>: {a.title}
                    </div>
                  ))}
                </div>
              )}

              {(['S', 'O', 'A', 'P'] as SoapSection[]).map((letter) => {
                const labels = { S: 'Subjective', O: 'Objective', A: 'Assessment', P: 'Plan' };
                const fields = { S: 'subjective', O: 'objective', A: 'assessment', P: 'plan' } as const;
                const content = signedNoteSnapshot[fields[letter]] as string || '';
                return (
                  <div key={letter} style={{ marginBottom: 18 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
                    }}>
                      <span style={{
                        ...(styles[`soapLetter${letter}` as keyof typeof styles] as React.CSSProperties),
                        width: 22, height: 22, fontSize: 11,
                      }}>
                        {letter}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text)' }}>
                        {labels[letter]}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 13, lineHeight: 1.7, color: 'var(--color-text)',
                      whiteSpace: 'pre-wrap', padding: '10px 14px',
                      background: 'var(--color-background)', borderRadius: 8,
                      border: '1px solid var(--color-border)',
                    }}>
                      {content.trim() || '(empty)'}
                    </div>
                  </div>
                );
              })}

              {(signedNoteSnapshot.icdCodes?.length ?? 0) > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>ICD-10 Codes</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {signedNoteSnapshot.icdCodes!.map((code) => (
                      <span key={code} style={styles.icdChip}>{code}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{
                textAlign: 'center', padding: 12, borderRadius: 8,
                background: 'rgba(16, 185, 129, 0.06)',
                border: '1px solid rgba(16, 185, 129, 0.15)',
                color: 'var(--color-success)', fontSize: 12, fontWeight: 600,
              }}>
                Electronically signed by {currentStaff?.name ?? 'Provider'} · {signedTimestamp}
              </div>

              {/* Return to dashboard if encounter was closed */}
              {encounterClosed && (
                <button
                  style={{
                    ...styles.btnPrimary, width: '100%', marginTop: 16,
                    justifyContent: 'center', borderRadius: 12,
                  }}
                  onClick={() => navigate('/doctor')}
                >
                  <ArrowLeft size={16} /> Return to Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
