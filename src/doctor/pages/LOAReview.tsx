import { useState, useMemo } from 'react';
import {
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  BookOpen,
  Shield,
  Send,
} from 'lucide-react';
import { useProvider } from '../../provider/context/ProviderContext';
import { useToast } from '../../context/ToastContext';

type LOAStatus = 'Pending' | 'Approved' | 'Rejected';
type LOAType = 'Specialist' | 'Laboratory' | 'ER' | 'Inpatient' | 'Surgery';

interface LOARequest {
  id: string;
  patientName: string;
  type: LOAType;
  provider: string;
  requestDate: string;
  amount: string;
  status: LOAStatus;
  diagnosis: string;
  justification: string;
}

const MOCK_LOA_REQUESTS: LOARequest[] = [
  { id: 'loa-r1', patientName: 'Maria Santos', type: 'Specialist', provider: 'Metro General Hospital', requestDate: 'Feb 10, 2026', amount: '₱15,000', status: 'Pending', diagnosis: 'Hypertensive Heart Disease', justification: '' },
  { id: 'loa-r2', patientName: 'Jose Reyes', type: 'Laboratory', provider: 'Metro General Hospital', requestDate: 'Feb 9, 2026', amount: '₱3,500', status: 'Pending', diagnosis: 'Diabetes Mellitus Type 2', justification: '' },
  { id: 'loa-r3', patientName: 'Ana Lopez', type: 'ER', provider: 'Metro General Hospital', requestDate: 'Feb 8, 2026', amount: '₱25,000', status: 'Approved', diagnosis: 'Acute Gastroenteritis', justification: 'Emergency presentation with severe dehydration' },
  { id: 'loa-r4', patientName: 'Pedro Cruz', type: 'Inpatient', provider: 'Metro General Hospital', requestDate: 'Feb 7, 2026', amount: '₱120,000', status: 'Pending', diagnosis: 'Community-Acquired Pneumonia', justification: '' },
  { id: 'loa-r5', patientName: 'Rosa Bautista', type: 'Surgery', provider: 'Metro General Hospital', requestDate: 'Feb 6, 2026', amount: '₱250,000', status: 'Rejected', diagnosis: 'Cholecystolithiasis', justification: 'Non-emergent, requires pre-authorization' },
];

const MOCK_PREAUTH = [
  { id: 'pa-1', patientName: 'Carlos Mendoza', procedure: 'Colonoscopy', hmoProvider: 'Maxicare', estimatedCost: '₱45,000', documents: ['Lab results', 'Referral form', 'Consent'], complete: false },
  { id: 'pa-2', patientName: 'Sofia Garcia', procedure: 'MRI Spine', hmoProvider: 'Medicard', estimatedCost: '₱28,000', documents: ['Imaging referral', 'Prior auth form'], complete: true },
  { id: 'pa-3', patientName: 'Miguel Torres', procedure: 'Knee Arthroscopy', hmoProvider: 'PhilCare', estimatedCost: '₱180,000', documents: ['Ortho consult', 'X-ray', 'MRI'], complete: false },
];

const styles: Record<string, React.CSSProperties> = {
  page: { padding: 16, paddingBottom: 100, maxWidth: 700, margin: '0 auto' },
  header: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 },
  sub: { fontSize: 13, color: 'var(--color-text-muted)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 },
  statCard: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-sm)',
    padding: 14,
    border: '1px solid var(--color-border)',
  },
  statValue: { fontSize: 20, fontWeight: 700, color: 'var(--color-text)', marginBottom: 2 },
  statLabel: { fontSize: 11, color: 'var(--color-text-muted)' },
  tabs: { display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 },
  tab: {
    padding: '10px 16px',
    borderRadius: 20,
    border: 'none',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    background: 'var(--color-background)',
    color: 'var(--color-text-muted)',
  },
  tabActive: { background: 'var(--color-primary)', color: 'white' },
  card: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-sm)',
    padding: 16,
    marginBottom: 16,
    border: '1px solid var(--color-border)',
  },
  loaCard: {
    padding: 16,
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border)',
    marginBottom: 12,
    background: 'var(--color-surface)',
  },
  typeBadge: { fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6 },
  btn: {
    padding: '10px 16px',
    borderRadius: 'var(--radius)',
    border: 'none',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  btnSuccess: { background: 'var(--color-success)', color: 'white' },
  btnDanger: { background: 'var(--color-error)', color: 'white' },
  btnSecondary: { background: 'var(--color-background)', color: 'var(--color-text)', border: '1px solid var(--color-border)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 8px', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 11 },
  td: { padding: '10px 8px', borderTop: '1px solid var(--color-border)', color: 'var(--color-text)' },
  badge: { fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6 },
  searchInput: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border)',
    fontSize: 14,
    marginBottom: 12,
    background: 'var(--color-surface)',
  },
  textarea: {
    width: '100%',
    padding: 12,
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border)',
    fontSize: 13,
    minHeight: 80,
    marginTop: 8,
    resize: 'vertical',
  },
  guidelineSection: { marginBottom: 20 },
  guidelineTitle: { fontSize: 15, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 },
  guidelineText: { fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 8 },
  docItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', fontSize: 13 },
};

const TYPE_COLORS: Record<LOAType, { bg: string; color: string }> = {
  Specialist: { bg: 'var(--color-info-light)', color: 'var(--color-info)' },
  Laboratory: { bg: 'var(--color-success-light)', color: 'var(--color-success)' },
  ER: { bg: 'var(--color-error-light)', color: 'var(--color-error)' },
  Inpatient: { bg: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' },
  Surgery: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' },
};

const STATUS_COLORS: Record<LOAStatus, { bg: string; color: string }> = {
  Pending: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' },
  Approved: { bg: 'var(--color-success-light)', color: 'var(--color-success)' },
  Rejected: { bg: 'var(--color-error-light)', color: 'var(--color-error)' },
};

type TabId = 'pending' | 'all' | 'preauth' | 'guidelines';
const HIGH_VALUE_THRESHOLD = 50000;

export const LOAReview = () => {
  const { currentStaff } = useProvider();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>('pending');
  const [loaRequests, setLoaRequests] = useState<LOARequest[]>(MOCK_LOA_REQUESTS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [justifications, setJustifications] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LOAStatus | null>(null);
  const [typeFilter, setTypeFilter] = useState<LOAType | null>(null);

  const pendingCount = loaRequests.filter((r) => r.status === 'Pending').length;
  const approvedThisMonth = 23;
  const totalLOAValue = loaRequests
    .filter((r) => r.status === 'Approved')
    .reduce((sum, r) => sum + parseFloat(r.amount.replace(/[^\d.]/g, '')) || 0, 0);
  const avgReviewTime = '2.4 hrs';

  const pendingList = useMemo(() => loaRequests.filter((r) => r.status === 'Pending'), [loaRequests]);

  const filteredAll = useMemo(() => {
    let list = loaRequests;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.patientName.toLowerCase().includes(q));
    }
    if (statusFilter) list = list.filter((r) => r.status === statusFilter);
    if (typeFilter) list = list.filter((r) => r.type === typeFilter);
    return list;
  }, [loaRequests, search, statusFilter, typeFilter]);

  const handleApprove = (id: string) => {
    setLoaRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'Approved' as const, justification: justifications[id] ?? r.justification } : r
      )
    );
    setExpandedId(null);
  };

  const handleDeny = (id: string) => {
    setLoaRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'Rejected' as const, justification: justifications[id] ?? r.justification } : r
      )
    );
    setExpandedId(null);
  };

  const parseAmount = (s: string) => parseFloat(s.replace(/[^\d.]/g, '')) || 0;
  const isHighValue = (amt: string) => parseAmount(amt) >= HIGH_VALUE_THRESHOLD;

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'pending', label: 'Pending Review', icon: Clock },
    { id: 'all', label: 'All Requests', icon: FileCheck },
    { id: 'preauth', label: 'Pre-Authorization', icon: Shield },
    { id: 'guidelines', label: 'Guidelines', icon: BookOpen },
  ];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>LOA & Insurance Review</h1>
        <p style={styles.sub}>Review and approve Letters of Authorization · {currentStaff?.name}</p>
      </header>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: 'var(--color-warning)' }}>{pendingCount}</div>
          <div style={styles.statLabel}>Pending Reviews</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: 'var(--color-success)' }}>{approvedThisMonth}</div>
          <div style={styles.statLabel}>Approved This Month</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: 'var(--color-primary)' }}>
            ₱{(totalLOAValue / 1000).toFixed(0)}K
          </div>
          <div style={styles.statLabel}>Total LOA Value</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{avgReviewTime}</div>
          <div style={styles.statLabel}>Avg Review Time</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              ...styles.tab,
              ...(activeTab === id ? styles.tabActive : {}),
            }}
          >
            <Icon size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            {label}
          </button>
        ))}
      </div>

      {/* Pending Review Tab */}
      {activeTab === 'pending' && (
        <div style={styles.card}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--color-text)' }}>Pending Review</div>
          {pendingList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-muted)' }}>
              <CheckCircle2 size={40} style={{ marginBottom: 8, opacity: 0.5 }} />
              <p>No pending LOA requests</p>
            </div>
          ) : (
            pendingList.map((r) => {
              const expanded = expandedId === r.id;
              const tc = TYPE_COLORS[r.type];
              return (
                <div key={r.id} style={styles.loaCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)', marginBottom: 4 }}>
                        {r.patientName}
                      </div>
                      <span style={{ ...styles.typeBadge, ...tc }}>{r.type}</span>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 6 }}>
                        {r.provider} · {r.requestDate}
                      </div>
                      <div style={{ fontSize: 13, marginTop: 4 }}>
                        <strong style={isHighValue(r.amount) ? { color: 'var(--color-error)' } : {}}>{r.amount}</strong>
                        {' · '}
                        {r.diagnosis}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedId(expanded ? null : r.id)}
                    style={{
                      marginTop: 12,
                      padding: 6,
                      background: 'none',
                      border: 'none',
                      fontSize: 12,
                      color: 'var(--color-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    Clinical Justification
                  </button>
                  {expanded && (
                    <div style={{ marginTop: 8 }}>
                      <textarea
                        placeholder="Enter clinical justification..."
                        value={justifications[r.id] ?? r.justification}
                        onChange={(e) => setJustifications((prev) => ({ ...prev, [r.id]: e.target.value }))}
                        style={styles.textarea}
                      />
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button style={{ ...styles.btn, ...styles.btnSuccess }} onClick={() => handleApprove(r.id)}>
                          <CheckCircle2 size={16} /> Approve
                        </button>
                        <button style={{ ...styles.btn, ...styles.btnDanger }} onClick={() => handleDeny(r.id)}>
                          <XCircle size={16} /> Deny
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* All Requests Tab */}
      {activeTab === 'all' && (
        <div style={styles.card}>
          <input
            type="text"
            placeholder="Search by patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {(['Pending', 'Approved', 'Rejected'] as LOAStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? null : s)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  border: '1px solid var(--color-border)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: statusFilter === s ? 'var(--color-primary-transparent)' : 'var(--color-surface)',
                  color: statusFilter === s ? 'var(--color-primary)' : 'var(--color-text-muted)',
                }}
              >
                {s}
              </button>
            ))}
            {(['Specialist', 'Laboratory', 'ER', 'Inpatient', 'Surgery'] as LOAType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(typeFilter === t ? null : t)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  border: '1px solid var(--color-border)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: typeFilter === t ? 'var(--color-primary-transparent)' : 'var(--color-surface)',
                  color: typeFilter === t ? 'var(--color-primary)' : 'var(--color-text-muted)',
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Patient</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Provider</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAll.map((r) => {
                  const sc = STATUS_COLORS[r.status];
                  const tc = TYPE_COLORS[r.type];
                  return (
                    <tr key={r.id}>
                      <td style={styles.td}>{r.patientName}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.typeBadge, ...tc }}>{r.type}</span>
                      </td>
                      <td style={styles.td}>{r.provider}</td>
                      <td style={styles.td}>{r.requestDate}</td>
                      <td style={styles.td}>
                        <span style={isHighValue(r.amount) ? { fontWeight: 700, color: 'var(--color-error)' } : {}}>{r.amount}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, ...sc }}>{r.status}</span>
                      </td>
                      <td style={styles.td}>
                        {r.status === 'Pending' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button style={{ ...styles.btn, ...styles.btnSuccess, padding: '6px 10px', fontSize: 11 }} onClick={() => handleApprove(r.id)}>Approve</button>
                            <button style={{ ...styles.btn, ...styles.btnDanger, padding: '6px 10px', fontSize: 11 }} onClick={() => handleDeny(r.id)}>Deny</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pre-Authorization Tab */}
      {activeTab === 'preauth' && (
        <div style={styles.card}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--color-text)' }}>HMO Pre-Authorization Requests</div>
          {MOCK_PREAUTH.map((pa) => (
            <div key={pa.id} style={styles.loaCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{pa.patientName}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{pa.procedure}</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>{pa.hmoProvider} · {pa.estimatedCost}</div>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>Required Documents</div>
                {pa.documents.map((doc, i) => (
                  <div key={i} style={styles.docItem}>
                    <input type="checkbox" defaultChecked={pa.complete} style={{ accentColor: 'var(--color-primary)' }} />
                    {doc}
                  </div>
                ))}
              </div>
              <button style={{ ...styles.btn, ...styles.btnPrimary, marginTop: 12 }} onClick={() => showToast('Pre-authorization submitted successfully', 'success')}>
                <Send size={14} /> Submit Pre-Auth
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Guidelines Tab */}
      {activeTab === 'guidelines' && (
        <div style={styles.card}>
          <div style={styles.guidelineSection}>
            <div style={styles.guidelineTitle}>When LOA is Required</div>
            <div style={styles.guidelineText}>
              LOA (Letter of Authorization) is required for HMO-covered procedures, specialist referrals, laboratory work-ups exceeding basic panels, imaging studies (CT, MRI), inpatient admissions, and surgical procedures. Emergency services may be post-authorized.
            </div>
          </div>
          <div style={styles.guidelineSection}>
            <div style={styles.guidelineTitle}>Coverage Limits by Type</div>
            <div style={styles.guidelineText}>
              <strong>Consultation:</strong> ₱500–₱2,000 per visit<br />
              <strong>Laboratory:</strong> Up to ₱5,000 per episode<br />
              <strong>Imaging:</strong> ₱3,000–₱25,000 depending on modality<br />
              <strong>Inpatient:</strong> Varies by plan (typically 80–90% of room & board)<br />
              <strong>Surgery:</strong> Pre-authorization required for procedures &gt;₱50,000
            </div>
          </div>
          <div style={styles.guidelineSection}>
            <div style={styles.guidelineTitle}>Documentation Requirements</div>
            <div style={styles.guidelineText}>
              Provide ICD-10 diagnosis codes, clinical justification, treatment plan, and supporting lab/imaging when applicable. For surgery, include operative plan and surgeon credentials.
            </div>
          </div>
          <div style={{ ...styles.guidelineSection, padding: 16, background: 'var(--color-background)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
            <div style={{ ...styles.guidelineTitle, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={18} style={{ color: 'var(--color-primary)' }} /> PhilHealth Benefit Reference
            </div>
            <div style={styles.guidelineText}>
              PhilHealth benefit packages (e.g., Z Benefit, Case Rates) have specific eligibility criteria. Ensure diagnosis and procedure codes align with PhilHealth guidelines. LOA does not replace PhilHealth approval for case-based claims.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
