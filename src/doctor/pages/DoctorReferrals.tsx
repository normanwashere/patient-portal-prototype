import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Send,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertTriangle,
  User,
  Building2,
  FileText,
  Activity,
  Search,
  Filter,
  ChevronRight,
  ExternalLink,
  X,
} from 'lucide-react';
import { useProvider } from '../../provider/context/ProviderContext';
import type { PatientReferral, ReferralStatus, ReferralUrgency } from '../../provider/types';

/* ══════════════════════════════════════════════
   MOCK DATA — used as fallback when context
   does not yet expose `referrals`
   ══════════════════════════════════════════════ */

const MOCK_REFERRALS: PatientReferral[] = [
  {
    id: 'ref-001',
    patientId: 'p-001',
    patientName: 'Juan dela Cruz',
    referringDoctorId: 'staff-001',
    referringDoctorName: 'Dr. Ricardo Santos',
    referringSpecialty: 'Cardiology',
    referredToSpecialty: 'Nephrology',
    referredToDoctorId: 'staff-003',
    referredToDoctorName: 'Dr. Albert Go',
    referredToFacility: 'Metro General Hospital',
    type: 'Internal',
    urgency: 'Urgent',
    status: 'Pending',
    reason: 'Elevated creatinine with persistent proteinuria despite ACE-inhibitor therapy',
    clinicalSummary: 'Patient is a 62-year-old male with long-standing hypertension and type 2 diabetes. Recent labs show creatinine 1.8 mg/dL (baseline 1.2) with urine ACR 320 mg/g. Currently on Losartan 100mg daily, Amlodipine 10mg, and Metformin 1g BID. BP at last visit 142/88.',
    diagnosis: 'Chronic Kidney Disease Stage 3a',
    icdCode: 'N18.31',
    attachedLabOrderIds: ['lab-001', 'lab-002'],
    attachedNoteIds: ['note-001'],
    createdAt: '2026-02-14T09:30:00Z',
    tenantId: 'metroGeneral',
  },
  {
    id: 'ref-002',
    patientId: 'p-002',
    patientName: 'Maria Santos',
    referringDoctorId: 'staff-001',
    referringDoctorName: 'Dr. Ricardo Santos',
    referringSpecialty: 'Cardiology',
    referredToSpecialty: 'Endocrinology',
    referredToDoctorName: 'Dr. Lilian Chua',
    referredToFacility: 'St. Luke\'s Medical Center - BGC',
    type: 'External',
    urgency: 'Routine',
    status: 'Accepted',
    reason: 'Poorly controlled Type 2 DM with HbA1c 9.2% despite triple oral therapy',
    clinicalSummary: 'Patient is a 55-year-old female, BMI 32. Current regimen: Metformin 1g BID, Gliclazide MR 120mg, Empagliflozin 25mg. FBS ranges 180-220. HbA1c 9.2% (up from 8.1% six months ago). No retinopathy on last fundoscopy. Pedal pulses intact.',
    diagnosis: 'Type 2 Diabetes Mellitus, uncontrolled',
    icdCode: 'E11.65',
    attachedLabOrderIds: ['lab-003'],
    createdAt: '2026-02-10T14:00:00Z',
    acceptedAt: '2026-02-11T10:00:00Z',
    responseNotes: 'Will see patient next week. Please send latest lipid panel as well.',
    tenantId: 'metroGeneral',
  },
  {
    id: 'ref-003',
    patientId: 'p-003',
    patientName: 'Roberto Cruz',
    referringDoctorId: 'staff-001',
    referringDoctorName: 'Dr. Ricardo Santos',
    referringSpecialty: 'Cardiology',
    referredToSpecialty: 'Pulmonology',
    referredToDoctorId: 'staff-002',
    referredToDoctorName: 'Dr. Maria Clara Reyes',
    referredToFacility: 'Metro General Hospital',
    type: 'Internal',
    urgency: 'Emergent',
    status: 'Scheduled',
    reason: 'Acute exacerbation of COPD with worsening dyspnea at rest',
    clinicalSummary: 'Patient is a 70-year-old male, ex-smoker (40 pack-years). Presents with increasing dyspnea over 3 days. SpO2 88% on room air. CXR shows hyperinflation. On salbutamol and ipratropium nebs. Started on IV steroids and antibiotics in ED.',
    diagnosis: 'Acute exacerbation of COPD',
    icdCode: 'J44.1',
    attachedLabOrderIds: ['lab-004'],
    attachedNoteIds: ['note-002', 'note-003'],
    createdAt: '2026-02-13T08:00:00Z',
    acceptedAt: '2026-02-13T08:30:00Z',
    scheduledDate: '2026-02-16T10:00:00Z',
    tenantId: 'metroGeneral',
  },
  {
    id: 'ref-004',
    patientId: 'p-004',
    patientName: 'Elena Villareal',
    referringDoctorId: 'staff-001',
    referringDoctorName: 'Dr. Ricardo Santos',
    referringSpecialty: 'Cardiology',
    referredToSpecialty: 'Orthopedics',
    referredToDoctorName: 'Dr. Marco Torres',
    referredToFacility: 'Philippine Orthopedic Center',
    type: 'External',
    urgency: 'Routine',
    status: 'Completed',
    reason: 'Chronic knee pain limiting exercise capacity, affecting cardiac rehab compliance',
    clinicalSummary: 'Patient is a 58-year-old female, post-CABG 6 months ago. Cardiac rehab progress has stalled due to bilateral knee pain (OA). Unable to complete treadmill exercise. XR shows Grade 3 OA both knees. BMI 28.',
    diagnosis: 'Primary osteoarthritis, bilateral knees',
    icdCode: 'M17.0',
    createdAt: '2026-01-20T11:00:00Z',
    acceptedAt: '2026-01-22T09:00:00Z',
    scheduledDate: '2026-01-28T14:00:00Z',
    completedAt: '2026-02-05T16:00:00Z',
    responseNotes: 'Evaluated patient. Started on physical therapy and intra-articular hyaluronic acid injections. Patient may resume low-impact cardiac rehab (cycling, swimming). Avoid treadmill for 4 weeks.',
    tenantId: 'metroGeneral',
  },
  {
    id: 'ref-005',
    patientId: 'p-005',
    patientName: 'Sofia Mendoza',
    referringDoctorId: 'staff-001',
    referringDoctorName: 'Dr. Ricardo Santos',
    referringSpecialty: 'Cardiology',
    referredToSpecialty: 'Gastroenterology',
    referredToDoctorName: 'Dr. Vicente Ang',
    type: 'External',
    urgency: 'Routine',
    status: 'Declined',
    reason: 'Recurrent epigastric pain — rule out GI cause vs. cardiac',
    clinicalSummary: 'Patient is a 48-year-old male with atypical chest pain. Cardiac workup (stress echo, Holter) negative. Epigastric pain persists, worse after meals. History of NSAID use for chronic back pain.',
    diagnosis: 'Dyspepsia, unspecified',
    icdCode: 'K30',
    createdAt: '2026-02-08T15:00:00Z',
    responseNotes: 'Unable to accept at this time — fully booked for the next 3 weeks. Suggest referring to Dr. Lim at Manila Doctors.',
    tenantId: 'metroGeneral',
  },
  // ── Received referrals (where currentStaff is the receiving doctor) ──
  {
    id: 'ref-101',
    patientId: 'p-101',
    patientName: 'Antonio Reyes Jr.',
    referringDoctorId: 'staff-002',
    referringDoctorName: 'Dr. Maria Clara Reyes',
    referringSpecialty: 'Pediatrics',
    referredToSpecialty: 'Cardiology',
    referredToDoctorId: 'staff-001',
    referredToDoctorName: 'Dr. Ricardo Santos',
    referredToFacility: 'Metro General Hospital',
    type: 'Internal',
    urgency: 'Urgent',
    status: 'Pending',
    reason: 'Pediatric patient with newly detected heart murmur and exercise intolerance',
    clinicalSummary: '12-year-old male presents with a grade 3/6 systolic murmur at the left sternal border, not previously documented. Reports exercise intolerance during PE class. No cyanosis, no clubbing. ECG shows left axis deviation.',
    diagnosis: 'Heart murmur, unspecified',
    icdCode: 'R01.1',
    attachedLabOrderIds: ['lab-010'],
    attachedNoteIds: ['note-010'],
    createdAt: '2026-02-15T11:00:00Z',
    tenantId: 'metroGeneral',
  },
  {
    id: 'ref-102',
    patientId: 'p-102',
    patientName: 'Carmen Aquino',
    referringDoctorId: 'staff-003',
    referringDoctorName: 'Dr. Albert Go',
    referringSpecialty: 'Emergency Medicine',
    referredToSpecialty: 'Cardiology',
    referredToDoctorId: 'staff-001',
    referredToDoctorName: 'Dr. Ricardo Santos',
    referredToFacility: 'Metro General Hospital',
    type: 'Internal',
    urgency: 'Emergent',
    status: 'Accepted',
    reason: 'Post-ER NSTEMI evaluation — requires cardiology follow-up and risk stratification',
    clinicalSummary: '67-year-old female presented to ER with substernal chest pain, troponin I elevated at 1.2 ng/mL (serial rising). ECG showed ST depression V4-V6. Started on heparin drip, dual antiplatelet therapy. Pain resolved after nitroglycerin. Needs urgent cardiology eval for possible catheterization.',
    diagnosis: 'Acute NSTEMI',
    icdCode: 'I21.4',
    attachedLabOrderIds: ['lab-011', 'lab-012'],
    attachedNoteIds: ['note-011'],
    createdAt: '2026-02-14T22:00:00Z',
    acceptedAt: '2026-02-15T06:00:00Z',
    tenantId: 'metroGeneral',
  },
  {
    id: 'ref-103',
    patientId: 'p-103',
    patientName: 'Jose Garcia',
    referringDoctorId: 'staff-n01',
    referringDoctorName: 'Dr. Patricia Lim',
    referringSpecialty: 'Family Medicine',
    referredToSpecialty: 'Cardiology',
    referredToDoctorId: 'staff-001',
    referredToDoctorName: 'Dr. Ricardo Santos',
    referredToFacility: 'Metro General Hospital',
    type: 'Internal',
    urgency: 'Routine',
    status: 'Scheduled',
    reason: 'Newly diagnosed atrial fibrillation on routine ECG — needs cardiology workup',
    clinicalSummary: '72-year-old male, found to have irregular rhythm on routine check-up. ECG confirms atrial fibrillation, ventricular rate 88 bpm. No symptoms of palpitations or syncope. CHA2DS2-VASc score = 3. Currently not on anticoagulation.',
    diagnosis: 'Atrial fibrillation, unspecified',
    icdCode: 'I48.91',
    createdAt: '2026-02-12T09:00:00Z',
    acceptedAt: '2026-02-12T14:00:00Z',
    scheduledDate: '2026-02-18T09:00:00Z',
    tenantId: 'metroGeneral',
  },
  {
    id: 'ref-104',
    patientId: 'p-104',
    patientName: 'Lourdes Tan',
    referringDoctorId: 'staff-002',
    referringDoctorName: 'Dr. Maria Clara Reyes',
    referringSpecialty: 'Pediatrics',
    referredToSpecialty: 'Cardiology',
    referredToDoctorId: 'staff-001',
    referredToDoctorName: 'Dr. Ricardo Santos',
    referredToFacility: 'Metro General Hospital',
    type: 'Internal',
    urgency: 'Routine',
    status: 'Completed',
    reason: 'Pre-operative cardiac clearance for cholecystectomy',
    clinicalSummary: '60-year-old female with symptomatic cholelithiasis scheduled for laparoscopic cholecystectomy. History of hypertension, controlled. No prior cardiac events. Needs pre-op cardiac clearance.',
    diagnosis: 'Pre-operative cardiac evaluation',
    icdCode: 'Z01.810',
    createdAt: '2026-01-28T10:00:00Z',
    acceptedAt: '2026-01-29T08:00:00Z',
    scheduledDate: '2026-02-03T11:00:00Z',
    completedAt: '2026-02-03T12:00:00Z',
    responseNotes: 'Patient is cleared for surgery under general anesthesia. Low cardiac risk per RCRI. Continue current medications. No need for additional cardiac testing.',
    tenantId: 'metroGeneral',
  },
  {
    id: 'ref-105',
    patientId: 'p-105',
    patientName: 'Miguel Fernandez',
    referringDoctorId: 'staff-003',
    referringDoctorName: 'Dr. Albert Go',
    referringSpecialty: 'Emergency Medicine',
    referredToSpecialty: 'Cardiology',
    referredToDoctorId: 'staff-001',
    referredToDoctorName: 'Dr. Ricardo Santos',
    referredToFacility: 'Metro General Hospital',
    type: 'Internal',
    urgency: 'Urgent',
    status: 'Pending',
    reason: 'Syncope with abnormal ECG — needs urgent cardiology evaluation',
    clinicalSummary: '55-year-old male brought to ER after syncopal episode at work. ECG shows prolonged QTc (520ms) and T-wave inversions in lateral leads. No structural heart disease on bedside echo. Family history of sudden cardiac death (brother, age 42).',
    diagnosis: 'Syncope, unspecified',
    icdCode: 'R55',
    attachedLabOrderIds: ['lab-015'],
    createdAt: '2026-02-16T07:30:00Z',
    tenantId: 'metroGeneral',
  },
];

/* ── Tiny style helpers (matching DoctorPrescriptions pattern) ── */
const pillStyle = (bg: string, color: string, extra?: React.CSSProperties): React.CSSProperties => ({
  fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase',
  lineHeight: '16px', whiteSpace: 'nowrap', background: bg, color, ...extra,
});
const btnStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
  padding: '8px 14px', borderRadius: 8, border: '1px solid var(--color-border)',
  background: 'var(--color-surface)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 4, minHeight: 36, color: 'var(--color-text)',
  ...extra,
});

/* ── Status & urgency color maps ── */
const statusColors: Record<ReferralStatus, { bg: string; color: string }> = {
  Pending:   { bg: 'rgba(59,130,246,0.08)',  color: 'var(--color-info)' },
  Accepted:  { bg: 'rgba(16,185,129,0.08)',  color: 'var(--color-success)' },
  Scheduled: { bg: 'rgba(124,58,237,0.08)',  color: '#7c3aed' },
  Completed: { bg: 'var(--color-background)', color: 'var(--color-text-muted)' },
  Declined:  { bg: 'rgba(239,68,68,0.06)',   color: 'var(--color-error)' },
  Cancelled: { bg: 'rgba(239,68,68,0.06)',   color: 'var(--color-error)' },
};

const urgencyColors: Record<ReferralUrgency, { bg: string; color: string }> = {
  Routine:  { bg: 'var(--color-background)', color: 'var(--color-text-muted)' },
  Urgent:   { bg: 'rgba(245,158,11,0.1)',    color: '#d97706' },
  Emergent: { bg: 'rgba(239,68,68,0.1)',     color: 'var(--color-error)' },
};

const statusIcons: Record<ReferralStatus, React.ReactNode> = {
  Pending:   <Clock size={12} />,
  Accepted:  <CheckCircle2 size={12} />,
  Scheduled: <Calendar size={12} />,
  Completed: <CheckCircle2 size={12} />,
  Declined:  <XCircle size={12} />,
  Cancelled: <XCircle size={12} />,
};

type TabKey = 'sent' | 'received';
type StatusFilter = 'All' | ReferralStatus;
type UrgencyFilter = 'All' | ReferralUrgency;

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */

export default function DoctorReferrals() {
  const { currentStaff, referrals, updateReferralStatus } = useProvider();

  // UI state
  const [activeTab, setActiveTab] = useState<TabKey>('sent');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReferral, setSelectedReferral] = useState<PatientReferral | null>(null);
  const [responseNotesDraft, setResponseNotesDraft] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Responsive listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ── Derived lists ── */
  const sentReferrals = useMemo(
    () => referrals.filter((r) => r.referringDoctorId === currentStaff.id),
    [referrals, currentStaff.id],
  );
  const receivedReferrals = useMemo(
    () => referrals.filter((r) => r.referredToDoctorId === currentStaff.id),
    [referrals, currentStaff.id],
  );

  const activeList = activeTab === 'sent' ? sentReferrals : receivedReferrals;

  const filtered = useMemo(() => {
    let list = activeList;
    if (statusFilter !== 'All') list = list.filter((r) => r.status === statusFilter);
    if (urgencyFilter !== 'All') list = list.filter((r) => r.urgency === urgencyFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) =>
        r.patientName.toLowerCase().includes(q) ||
        r.referredToSpecialty.toLowerCase().includes(q) ||
        r.referringSpecialty.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activeList, statusFilter, urgencyFilter, searchQuery]);

  /* ── Stats for the active view ── */
  const stats = useMemo(() => ({
    total: activeList.length,
    pending: activeList.filter((r) => r.status === 'Pending').length,
    accepted: activeList.filter((r) => r.status === 'Accepted').length,
    completed: activeList.filter((r) => r.status === 'Completed').length,
  }), [activeList]);

  /* ── Actions ── */
  const updateStatus = useCallback((id: string, status: ReferralStatus, extra?: Partial<PatientReferral>) => {
    updateReferralStatus(id, status, extra);
  }, [updateReferralStatus]);

  const handleAccept = useCallback((id: string) => {
    updateStatus(id, 'Accepted', { acceptedAt: new Date().toISOString() });
  }, [updateStatus]);

  const handleDecline = useCallback((id: string) => {
    updateStatus(id, 'Declined');
  }, [updateStatus]);

  const handleSchedule = useCallback((id: string) => {
    updateStatus(id, 'Scheduled', { scheduledDate: new Date(Date.now() + 2 * 86400000).toISOString() });
  }, [updateStatus]);

  const handleComplete = useCallback((id: string) => {
    updateStatus(id, 'Completed', { completedAt: new Date().toISOString() });
  }, [updateStatus]);

  const handleCancel = useCallback((id: string) => {
    updateStatus(id, 'Cancelled');
  }, [updateStatus]);

  const handleSaveResponseNotes = useCallback((id: string) => {
    updateReferralStatus(id, selectedReferral?.status ?? 'Accepted', { responseNotes: responseNotesDraft });
    if (selectedReferral) {
      setSelectedReferral({ ...selectedReferral, responseNotes: responseNotesDraft });
    }
  }, [responseNotesDraft, selectedReferral, updateReferralStatus]);

  const openDetail = useCallback((ref: PatientReferral) => {
    setSelectedReferral(ref);
    setResponseNotesDraft(ref.responseNotes ?? '');
  }, []);

  const closeDetail = useCallback(() => {
    setSelectedReferral(null);
    setResponseNotesDraft('');
  }, []);

  const fmtDate = (iso?: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  const fmtDateTime = (iso?: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  /* ══════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════ */
  return (
    <div className="doc-page" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Send size={20} /> Referrals
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
            {sentReferrals.length} sent · {receivedReferrals.length} received
            {stats.pending > 0 && <> · <span style={{ color: 'var(--color-info)', fontWeight: 700 }}>{stats.pending} pending</span></>}
          </p>
        </div>
      </div>

      {/* ── Stats Summary ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: 10,
      }}>
        {[
          { label: activeTab === 'sent' ? 'Total Sent' : 'Total Received', value: stats.total, icon: <Activity size={16} />, color: 'var(--color-primary)' },
          { label: 'Pending', value: stats.pending, icon: <Clock size={16} />, color: 'var(--color-info)' },
          { label: 'Accepted', value: stats.accepted, icon: <CheckCircle2 size={16} />, color: 'var(--color-success)' },
          { label: 'Completed', value: stats.completed, icon: <CheckCircle2 size={16} />, color: 'var(--color-text-muted)' },
        ].map((s) => (
          <div key={s.label} style={{
            background: 'var(--color-surface)', borderRadius: 12, padding: '14px 16px',
            border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: s.color,
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs: Sent / Received ── */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--color-surface)', borderRadius: 12, padding: 4, border: '1px solid var(--color-border)' }}>
        {([
          { key: 'sent' as TabKey, label: 'Sent Referrals', icon: <ArrowUpRight size={14} />, count: sentReferrals.length },
          { key: 'received' as TabKey, label: 'Received Referrals', icon: <ArrowDownLeft size={14} />, count: receivedReferrals.length },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setStatusFilter('All'); setUrgencyFilter('All'); setSearchQuery(''); }}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
              background: activeTab === tab.key ? 'var(--color-primary)' : 'transparent',
              color: activeTab === tab.key ? '#fff' : 'var(--color-text-muted)',
            }}
          >
            {tab.icon} {tab.label}
            <span style={{
              fontSize: 10, fontWeight: 800, padding: '1px 7px', borderRadius: 8,
              background: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : 'var(--color-background)',
              color: activeTab === tab.key ? '#fff' : 'var(--color-text-muted)',
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', borderRadius: 10,
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        }}>
          <Search size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <input
            placeholder="Search patient, specialty, reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1, border: 'none', background: 'transparent', outline: 'none',
              fontSize: 13, color: 'var(--color-text)', fontFamily: 'inherit',
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--color-text-muted)' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status pills */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, WebkitOverflowScrolling: 'touch' as any }}>
          {(['All', 'Pending', 'Accepted', 'Scheduled', 'Completed', 'Declined'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 32,
                background: statusFilter === s ? 'var(--color-primary)' : 'var(--color-surface)',
                color: statusFilter === s ? '#fff' : 'var(--color-text-muted)',
                border: statusFilter === s ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                transition: 'all 0.15s',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Urgency pills */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Filter size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          {(['All', 'Routine', 'Urgent', 'Emergent'] as UrgencyFilter[]).map((u) => (
            <button
              key={u}
              onClick={() => setUrgencyFilter(u)}
              style={{
                padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 30,
                background: urgencyFilter === u
                  ? (u === 'Emergent' ? 'var(--color-error)' : u === 'Urgent' ? '#d97706' : 'var(--color-primary)')
                  : 'var(--color-surface)',
                color: urgencyFilter === u ? '#fff' : 'var(--color-text-muted)',
                border: urgencyFilter === u ? 'none' : '1px solid var(--color-border)',
                transition: 'all 0.15s',
              }}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* ── Referral Cards ── */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 48, color: 'var(--color-text-muted)',
          background: 'var(--color-surface)', borderRadius: 14, boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-border)',
        }}>
          <Send size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 15 }}>No referrals match filter</div>
          <div style={{ fontSize: 13, marginTop: 4, opacity: 0.7 }}>Try a different filter or search term</div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: 12,
        }}>
          {filtered.map((ref) => (
            <ReferralCard
              key={ref.id}
              referral={ref}
              tab={activeTab}
              isMobile={isMobile}
              onView={() => openDetail(ref)}
              onAccept={() => handleAccept(ref.id)}
              onDecline={() => handleDecline(ref.id)}
              onSchedule={() => handleSchedule(ref.id)}
              onComplete={() => handleComplete(ref.id)}
              onCancel={() => handleCancel(ref.id)}
            />
          ))}
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selectedReferral && (
        <DetailModal
          referral={selectedReferral}
          tab={activeTab}
          isMobile={isMobile}
          responseNotesDraft={responseNotesDraft}
          onResponseNotesChange={setResponseNotesDraft}
          onSaveNotes={() => handleSaveResponseNotes(selectedReferral.id)}
          onAccept={() => { handleAccept(selectedReferral.id); setSelectedReferral({ ...selectedReferral, status: 'Accepted', acceptedAt: new Date().toISOString() }); }}
          onDecline={() => { handleDecline(selectedReferral.id); setSelectedReferral({ ...selectedReferral, status: 'Declined' }); }}
          onSchedule={() => { handleSchedule(selectedReferral.id); setSelectedReferral({ ...selectedReferral, status: 'Scheduled', scheduledDate: new Date(Date.now() + 2 * 86400000).toISOString() }); }}
          onComplete={() => { handleComplete(selectedReferral.id); setSelectedReferral({ ...selectedReferral, status: 'Completed', completedAt: new Date().toISOString() }); }}
          onCancel={() => { handleCancel(selectedReferral.id); setSelectedReferral({ ...selectedReferral, status: 'Cancelled' }); }}
          onClose={closeDetail}
          fmtDate={fmtDate}
          fmtDateTime={fmtDateTime}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════ */

interface ReferralCardProps {
  referral: PatientReferral;
  tab: TabKey;
  isMobile: boolean;
  onView: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onSchedule: () => void;
  onComplete: () => void;
  onCancel: () => void;
}

function ReferralCard({ referral, tab, isMobile, onView, onAccept, onDecline, onSchedule, onComplete, onCancel }: ReferralCardProps) {
  const r = referral;
  const sc = statusColors[r.status];
  const uc = urgencyColors[r.urgency];

  return (
    <div
      onClick={onView}
      style={{
        background: 'var(--color-surface)', borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
        border: '1px solid var(--color-border)', transition: 'box-shadow 0.15s, transform 0.15s',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.08))'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Card header */}
      <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {/* Patient avatar */}
        <div style={{
          width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
          background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 13, fontWeight: 700,
        }}>
          {r.patientName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {r.patientName}
            <span style={pillStyle(uc.bg, uc.color)}>
              {r.urgency === 'Emergent' && <AlertTriangle size={9} style={{ marginRight: 2 }} />}
              {r.urgency}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
            <span style={pillStyle(sc.bg, sc.color, { display: 'flex', alignItems: 'center', gap: 3 })}>
              {statusIcons[r.status]} {r.status}
            </span>
            <span style={pillStyle(
              r.type === 'External' ? 'rgba(124,58,237,0.08)' : 'rgba(59,130,246,0.06)',
              r.type === 'External' ? '#7c3aed' : 'var(--color-info)',
            )}>
              {r.type === 'External' ? <ExternalLink size={9} style={{ marginRight: 2 }} /> : null}
              {r.type}
            </span>
          </div>
        </div>
        <ChevronRight size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0, marginTop: 4 }} />
      </div>

      {/* Card details */}
      <div style={{ padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <User size={12} style={{ flexShrink: 0 }} />
          {tab === 'sent'
            ? <>To: <strong style={{ color: 'var(--color-text)' }}>{r.referredToDoctorName ?? r.referredToSpecialty}</strong> ({r.referredToSpecialty})</>
            : <>From: <strong style={{ color: 'var(--color-text)' }}>{r.referringDoctorName}</strong> ({r.referringSpecialty})</>
          }
        </div>
        {r.referredToFacility && (
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Building2 size={12} style={{ flexShrink: 0 }} />
            {r.referredToFacility}
          </div>
        )}
        <div style={{
          fontSize: 12, color: 'var(--color-text)', lineHeight: 1.5, marginTop: 2,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {r.reason}
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 'auto' }}>
          <Clock size={11} /> {new Date(r.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Card actions */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: '10px 16px', borderTop: '1px solid var(--color-border)',
          display: 'flex', gap: 6, flexWrap: 'wrap',
          background: 'var(--color-bg-secondary, var(--color-background))',
        }}
      >
        <button onClick={onView} style={btnStyle({ fontSize: 11, padding: '6px 10px', minHeight: 30 })}>
          <FileText size={12} /> View
        </button>
        {tab === 'sent' && r.status === 'Pending' && (
          <button onClick={onCancel} style={btnStyle({ fontSize: 11, padding: '6px 10px', minHeight: 30, color: 'var(--color-error)' })}>
            <XCircle size={12} /> Cancel
          </button>
        )}
        {tab === 'received' && r.status === 'Pending' && (
          <>
            <button onClick={onAccept} style={btnStyle({ fontSize: 11, padding: '6px 10px', minHeight: 30, background: 'var(--color-success)', color: '#fff', border: 'none' })}>
              <CheckCircle2 size={12} /> Accept
            </button>
            <button onClick={onDecline} style={btnStyle({ fontSize: 11, padding: '6px 10px', minHeight: 30, color: 'var(--color-error)' })}>
              <XCircle size={12} /> Decline
            </button>
          </>
        )}
        {tab === 'received' && r.status === 'Accepted' && (
          <button onClick={onSchedule} style={btnStyle({ fontSize: 11, padding: '6px 10px', minHeight: 30, background: '#7c3aed', color: '#fff', border: 'none' })}>
            <Calendar size={12} /> Schedule
          </button>
        )}
        {tab === 'received' && r.status === 'Scheduled' && (
          <button onClick={onComplete} style={btnStyle({ fontSize: 11, padding: '6px 10px', minHeight: 30, background: 'var(--color-success)', color: '#fff', border: 'none' })}>
            <CheckCircle2 size={12} /> Complete
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Detail Modal ── */

interface DetailModalProps {
  referral: PatientReferral;
  tab: TabKey;
  isMobile: boolean;
  responseNotesDraft: string;
  onResponseNotesChange: (v: string) => void;
  onSaveNotes: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onSchedule: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onClose: () => void;
  fmtDate: (iso?: string) => string;
  fmtDateTime: (iso?: string) => string;
}

function DetailModal({
  referral: r, tab, isMobile,
  responseNotesDraft, onResponseNotesChange, onSaveNotes,
  onAccept, onDecline, onSchedule, onComplete, onCancel, onClose,
  fmtDate, fmtDateTime,
}: DetailModalProps) {
  const sc = statusColors[r.status];
  const uc = urgencyColors[r.urgency];
  const isReceived = tab === 'received';

  const timelineSteps: { label: string; date?: string; done: boolean }[] = [
    { label: 'Created', date: r.createdAt, done: true },
    { label: 'Accepted', date: r.acceptedAt, done: !!r.acceptedAt },
    { label: 'Scheduled', date: r.scheduledDate, done: !!r.scheduledDate },
    { label: 'Completed', date: r.completedAt, done: !!r.completedAt },
  ];

  const inputStyle: React.CSSProperties = {
    padding: '8px 10px', borderRadius: 8, border: '1px solid var(--color-border)',
    background: 'var(--color-surface)', fontSize: 13, color: 'var(--color-text)', width: '100%',
    outline: 'none', fontFamily: 'inherit', minHeight: 60, resize: 'vertical',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? 8 : 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)', borderRadius: 16,
          width: '100%', maxWidth: 640,
          maxHeight: '90vh', overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Modal header */}
        <div style={{
          padding: '20px 24px 16px', display: 'flex', alignItems: 'flex-start', gap: 14,
          borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0,
          background: 'var(--color-surface)', zIndex: 1, borderRadius: '16px 16px 0 0',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
            background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 16, fontWeight: 700,
          }}>
            {r.patientName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)' }}>{r.patientName}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              <span style={pillStyle(sc.bg, sc.color, { display: 'flex', alignItems: 'center', gap: 3, fontSize: 11 })}>
                {statusIcons[r.status]} {r.status}
              </span>
              <span style={pillStyle(uc.bg, uc.color, { fontSize: 11 })}>
                {r.urgency}
              </span>
              <span style={pillStyle(
                r.type === 'External' ? 'rgba(124,58,237,0.08)' : 'rgba(59,130,246,0.06)',
                r.type === 'External' ? '#7c3aed' : 'var(--color-info)',
                { fontSize: 11 },
              )}>
                {r.type}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal body */}
        <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Referring / Receiving info */}
          <div style={{
            display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12,
          }}>
            <InfoBlock label="Referring Doctor" icon={<ArrowUpRight size={13} />}>
              <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 13 }}>{r.referringDoctorName}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{r.referringSpecialty}</div>
            </InfoBlock>
            <InfoBlock label="Referred To" icon={<ArrowDownLeft size={13} />}>
              <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 13 }}>{r.referredToDoctorName ?? r.referredToSpecialty}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{r.referredToSpecialty}</div>
              {r.referredToFacility && (
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Building2 size={11} /> {r.referredToFacility}
                </div>
              )}
            </InfoBlock>
          </div>

          {/* Reason */}
          <InfoBlock label="Reason for Referral" icon={<FileText size={13} />}>
            <div style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.6 }}>{r.reason}</div>
          </InfoBlock>

          {/* Clinical Summary */}
          <InfoBlock label="Clinical Summary" icon={<Activity size={13} />}>
            <div style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.6 }}>{r.clinicalSummary}</div>
          </InfoBlock>

          {/* Diagnosis + ICD */}
          {(r.diagnosis || r.icdCode) && (
            <div style={{
              display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12,
            }}>
              {r.diagnosis && (
                <InfoBlock label="Diagnosis">
                  <div style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 600 }}>{r.diagnosis}</div>
                </InfoBlock>
              )}
              {r.icdCode && (
                <InfoBlock label="ICD-10 Code">
                  <span style={pillStyle('var(--color-background)', 'var(--color-text)', { fontSize: 12, padding: '4px 10px', fontFamily: 'monospace' })}>
                    {r.icdCode}
                  </span>
                </InfoBlock>
              )}
            </div>
          )}

          {/* Attached Labs / Notes */}
          {((r.attachedLabOrderIds && r.attachedLabOrderIds.length > 0) || (r.attachedNoteIds && r.attachedNoteIds.length > 0)) && (
            <InfoBlock label="Attachments">
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {r.attachedLabOrderIds?.map((id) => (
                  <span key={id} style={{
                    padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: 'rgba(59,130,246,0.06)', color: 'var(--color-info)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                    border: '1px solid rgba(59,130,246,0.12)',
                  }}>
                    <Activity size={11} /> Lab: {id}
                  </span>
                ))}
                {r.attachedNoteIds?.map((id) => (
                  <span key={id} style={{
                    padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: 'rgba(16,185,129,0.06)', color: 'var(--color-success)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                    border: '1px solid rgba(16,185,129,0.12)',
                  }}>
                    <FileText size={11} /> Note: {id}
                  </span>
                ))}
              </div>
            </InfoBlock>
          )}

          {/* Timeline */}
          <InfoBlock label="Timeline">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
              {timelineSteps.map((step, i) => (
                <div key={step.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, position: 'relative', paddingBottom: i < timelineSteps.length - 1 ? 16 : 0 }}>
                  {/* Vertical line */}
                  {i < timelineSteps.length - 1 && (
                    <div style={{
                      position: 'absolute', left: 8, top: 18, bottom: 0, width: 2,
                      background: step.done ? 'var(--color-primary)' : 'var(--color-border)',
                    }} />
                  )}
                  {/* Dot */}
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    background: step.done ? 'var(--color-primary)' : 'var(--color-background)',
                    border: step.done ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {step.done && <CheckCircle2 size={10} style={{ color: '#fff' }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: step.done ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                      {step.label}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      {step.done ? fmtDateTime(step.date) : '—'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </InfoBlock>

          {/* Response Notes */}
          <InfoBlock label="Response Notes">
            {isReceived ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <textarea
                  value={responseNotesDraft}
                  onChange={(e) => onResponseNotesChange(e.target.value)}
                  placeholder="Add response notes..."
                  style={inputStyle}
                />
                <button onClick={onSaveNotes} style={btnStyle({ alignSelf: 'flex-end', background: 'var(--color-primary)', color: '#fff', border: 'none', fontWeight: 700 })}>
                  Save Notes
                </button>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: r.responseNotes ? 'var(--color-text)' : 'var(--color-text-muted)', lineHeight: 1.6, fontStyle: r.responseNotes ? 'normal' : 'italic' }}>
                {r.responseNotes || 'No response notes yet.'}
              </div>
            )}
          </InfoBlock>
        </div>

        {/* Modal footer actions */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid var(--color-border)',
          display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end',
          position: 'sticky', bottom: 0, background: 'var(--color-surface)',
          borderRadius: '0 0 16px 16px',
        }}>
          <button onClick={onClose} style={btnStyle()}>
            Close
          </button>

          {tab === 'sent' && r.status === 'Pending' && (
            <button onClick={onCancel} style={btnStyle({ color: 'var(--color-error)' })}>
              <XCircle size={13} /> Cancel Referral
            </button>
          )}

          {isReceived && r.status === 'Pending' && (
            <>
              <button onClick={onDecline} style={btnStyle({ color: 'var(--color-error)' })}>
                <XCircle size={13} /> Decline
              </button>
              <button onClick={onAccept} style={btnStyle({ background: 'var(--color-success)', color: '#fff', border: 'none', fontWeight: 700 })}>
                <CheckCircle2 size={13} /> Accept
              </button>
            </>
          )}

          {isReceived && r.status === 'Accepted' && (
            <button onClick={onSchedule} style={btnStyle({ background: '#7c3aed', color: '#fff', border: 'none', fontWeight: 700 })}>
              <Calendar size={13} /> Schedule
            </button>
          )}

          {isReceived && r.status === 'Scheduled' && (
            <button onClick={onComplete} style={btnStyle({ background: 'var(--color-success)', color: '#fff', border: 'none', fontWeight: 700 })}>
              <CheckCircle2 size={13} /> Mark Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Simple info block wrapper ── */
function InfoBlock({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--color-background)', borderRadius: 10, padding: '10px 14px',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
        color: 'var(--color-text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4,
      }}>
        {icon} {label}
      </div>
      {children}
    </div>
  );
}
