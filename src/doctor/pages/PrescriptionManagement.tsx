import { useState, useMemo } from 'react';
import {
  RefreshCw,
  FileText,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react';
import { useProvider } from '../../provider/context/ProviderContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../theme/ThemeContext';
import type { Prescription } from '../../provider/types';

const styles: Record<string, React.CSSProperties> = {
  page: { padding: 'var(--space, 16px)', maxWidth: 1000, margin: '0 auto' },
  title: { fontSize: 20, fontWeight: 700, color: 'var(--color-text)', marginBottom: 16 },
  statsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: '1 1 120px',
    minWidth: 120,
    padding: 16,
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border)',
  },
  statLabel: { fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 700, color: 'var(--color-text)' },
  tabRow: {
    display: 'flex',
    gap: 4,
    marginBottom: 16,
    overflowX: 'auto',
    paddingBottom: 4,
  },
  tab: {
    padding: '10px 16px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  tabActive: {
    background: 'var(--color-primary)',
    color: 'white',
    borderColor: 'var(--color-primary)',
  },
  searchBox: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    fontSize: 14,
    marginBottom: 16,
  },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    padding: '6px 12px',
    borderRadius: 20,
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    fontSize: 12,
    cursor: 'pointer',
  },
  chipActive: { background: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' },
  card: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-sm)',
    padding: 16,
    marginBottom: 12,
    border: '1px solid var(--color-border)',
  },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: {
    textAlign: 'left' as const,
    padding: '10px 8px',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    borderBottom: '1px solid var(--color-border)',
  },
  td: {
    padding: '12px 8px',
    fontSize: 13,
    borderBottom: '1px solid var(--color-border)',
  },
  badge: { padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 },
  badgeActive: { background: 'var(--color-success-light)', color: 'var(--color-success-text)' },
  badgePending: { background: 'var(--color-warning-light)', color: 'var(--color-warning-text)' },
  badgeCompleted: { background: 'var(--color-gray-200)', color: 'var(--color-gray-700)' },
  btn: {
    padding: '8px 14px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  btnPrimary: { background: 'var(--color-primary)', color: 'white', border: 'none' },
  btnDanger: { background: 'var(--color-error-light)', color: 'var(--color-error-text)' },
  formGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    maxWidth: 480,
  },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: 'var(--color-text)' },
  input: {
    padding: 12,
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    fontSize: 14,
  },
  select: {
    padding: 12,
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    fontSize: 14,
    background: 'var(--color-surface)',
  },
  cdssPanel: {
    padding: 16,
    background: 'var(--color-warning-light)',
    borderRadius: 'var(--radius)',
    marginTop: 16,
    borderLeft: '4px solid var(--color-warning)',
  },
  cdssItem: { marginBottom: 8, fontSize: 13 },
  formularyOk: {
    padding: 12,
    background: 'var(--color-success-light)',
    borderRadius: 8,
    marginTop: 12,
    fontSize: 13,
    color: 'var(--color-success-text)',
  },
  drugList: { display: 'flex', flexDirection: 'column', gap: 8 },
  drugCard: {
    padding: 14,
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border)',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};

const MOCK_DRUGS = [
  { name: 'Rosuvastatin 20mg', generic: 'Rosuvastatin calcium', hmo: true, philhealth: false, price: 35 },
  { name: 'Metformin 850mg', generic: 'Metformin HCl', hmo: true, philhealth: true, price: 5 },
  { name: 'Losartan 50mg', generic: 'Losartan potassium', hmo: true, philhealth: false, price: 12 },
  { name: 'Amlodipine 10mg', generic: 'Amlodipine besylate', hmo: true, philhealth: true, price: 8 },
  { name: 'Cetirizine 10mg', generic: 'Cetirizine HCl', hmo: true, philhealth: true, price: 6 },
  { name: 'Paracetamol 500mg', generic: 'Acetaminophen', hmo: true, philhealth: true, price: 2 },
  { name: 'Omeprazole 20mg', generic: 'Omeprazole', hmo: true, philhealth: false, price: 10 },
  { name: 'Atorvastatin 20mg', generic: 'Atorvastatin calcium', hmo: true, philhealth: false, price: 28 },
  { name: 'Clopidogrel 75mg', generic: 'Clopidogrel bisulfate', hmo: true, philhealth: false, price: 28 },
  { name: 'Tramadol 50mg', generic: 'Tramadol HCl', hmo: false, philhealth: false, price: 15 },
];

const FREQUENCY_OPTIONS = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Every 8 hours',
  'As needed',
];

type Tab = 'active' | 'refill' | 'new' | 'formulary';
type StatusFilter = 'all' | 'Active' | 'Completed' | 'Pending Approval';

export const PrescriptionManagement = () => {
  const { prescriptions, approvePrescription, denyPrescription } = useProvider();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const activeCount = prescriptions.filter((p) => p.status === 'Active').length;
  const pendingCount = prescriptions.filter((p) => p.status === 'Pending Approval').length;

  const filteredActive = useMemo(() => {
    let list = prescriptions;
    if (statusFilter !== 'all') list = list.filter((p) => p.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.patientName.toLowerCase().includes(q) ||
          p.medication.toLowerCase().includes(q)
      );
    }
    return list;
  }, [prescriptions, statusFilter, search]);

  const refillList = prescriptions.filter((p) => p.status === 'Pending Approval');

  const tabs: [Tab, string][] = [
    ['active', 'Active Prescriptions'],
    ['refill', 'Refill Requests'],
    ['new', 'New Prescription'],
    ['formulary', 'Formulary'],
  ];

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Prescription Management</h2>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Active Prescriptions</div>
          <div style={styles.statValue}>{activeCount}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Pending Refill Approvals</div>
          <div style={styles.statValue}>{pendingCount}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>e-Prescriptions This Month</div>
          <div style={styles.statValue}>47</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Drug Alerts</div>
          <div style={styles.statValue}>2</div>
        </div>
      </div>

      <div style={styles.tabRow}>
        {tabs.map(([key, label]) => (
          <button
            key={key}
            style={{
              ...styles.tab,
              ...(activeTab === key ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'active' && (
        <>
          <input
            style={styles.searchBox}
            placeholder="Search by patient or medication..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={styles.chipRow}>
            {(['all', 'Active', 'Completed', 'Pending Approval'] as const).map((s) => (
              <button
                key={s}
                style={{
                  ...styles.chip,
                  ...(statusFilter === s ? styles.chipActive : {}),
                }}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>
          <ActivePrescriptionsTable prescriptions={filteredActive} styles={styles} />
        </>
      )}

      {activeTab === 'refill' && (
        <RefillRequests
          prescriptions={refillList}
          approvePrescription={approvePrescription}
          denyPrescription={denyPrescription}
          showToast={showToast}
          styles={styles}
        />
      )}

      {activeTab === 'new' && <NewPrescriptionForm showToast={showToast} styles={styles} />}

      {activeTab === 'formulary' && <FormularyTab drugs={MOCK_DRUGS} styles={styles} />}
    </div>
  );
};

function ActivePrescriptionsTable({
  prescriptions,
  styles: s,
}: {
  prescriptions: Prescription[];
  styles: Record<string, React.CSSProperties>;
}) {
  const byPatient = useMemo(() => {
    const map = new Map<string, Prescription[]>();
    prescriptions.forEach((p) => {
      const key = p.patientName;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    return map;
  }, [prescriptions]);

  return (
    <div style={s.card}>
      <div style={{ overflowX: 'auto' }}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Patient</th>
              <th style={s.th}>Medication</th>
              <th style={s.th}>Dosage</th>
              <th style={s.th}>Frequency</th>
              <th style={s.th}>Duration</th>
              <th style={s.th}>Refills</th>
              <th style={s.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(byPatient.entries()).flatMap(([, list]) =>
              list.map((rx) => (
                <tr key={rx.id}>
                  <td style={s.td}>{rx.patientName}</td>
                  <td style={s.td}>{rx.medication}</td>
                  <td style={s.td}>{rx.dosage}</td>
                  <td style={s.td}>{rx.frequency}</td>
                  <td style={s.td}>{rx.duration}</td>
                  <td style={s.td}>{rx.refillsRemaining}</td>
                  <td style={s.td}>
                    <span
                      style={{
                        ...s.badge,
                        ...(rx.status === 'Active'
                          ? s.badgeActive
                          : rx.status === 'Pending Approval'
                          ? s.badgePending
                          : s.badgeCompleted),
                      }}
                    >
                      {rx.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RefillRequests({
  prescriptions,
  approvePrescription,
  denyPrescription,
  showToast,
  styles: s,
}: {
  prescriptions: Prescription[];
  approvePrescription: (id: string) => void;
  denyPrescription: (id: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  styles: Record<string, React.CSSProperties>;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {prescriptions.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <RefreshCw size={40} style={{ marginBottom: 8, opacity: 0.5 }} />
          <p>No pending refill requests.</p>
        </div>
      ) : (
        prescriptions.map((rx) => (
          <div key={rx.id} style={s.card}>
            <div style={{ marginBottom: 8 }}>
              <strong>{rx.patientName}</strong> — {rx.medication} {rx.dosage}
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>
              Original: {rx.prescribedDate} · Refills left: {rx.refillsRemaining}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                style={{ ...s.btn, ...s.btnPrimary }}
                onClick={() => approvePrescription(rx.id)}
              >
                <Check size={14} /> Approve
              </button>
              <button style={{ ...s.btn, ...s.btnDanger }} onClick={() => { denyPrescription(rx.id); showToast('Prescription denied', 'info'); }}>
                <X size={14} /> Deny
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function NewPrescriptionForm({
  showToast,
  styles: s,
}: {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  styles: Record<string, React.CSSProperties>;
}) {
  const { tenant } = useTheme();
  const hasHmo = tenant.features.hmo ?? false;
  const [patient, setPatient] = useState('');
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [quantity, setQuantity] = useState('');
  const [refills, setRefills] = useState('');
  const [instructions, setInstructions] = useState('');

  return (
    <div style={s.card}>
      <div style={s.formGrid}>
        <div style={s.formGroup}>
          <label style={s.label}>Patient Search</label>
          <input
            style={s.input}
            placeholder="Search patient..."
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
          />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>Medication</label>
          <input
            style={s.input}
            placeholder="Type to search (e.g. Atorvastatin)"
            value={medication}
            onChange={(e) => setMedication(e.target.value)}
          />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>Dosage</label>
          <input
            style={s.input}
            placeholder="e.g. 20mg"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
          />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>Frequency</label>
          <select
            style={s.select}
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          >
            <option value="">Select...</option>
            {FREQUENCY_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>Duration</label>
          <input
            style={s.input}
            placeholder="e.g. 30 days"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>Quantity</label>
          <input
            style={s.input}
            type="number"
            placeholder="e.g. 30"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>Refills</label>
          <input
            style={s.input}
            type="number"
            placeholder="e.g. 2"
            value={refills}
            onChange={(e) => setRefills(e.target.value)}
          />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>Instructions</label>
          <input
            style={s.input}
            placeholder="Additional instructions..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </div>

        <div style={s.cdssPanel}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            <AlertTriangle size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            CDSS Alerts
          </div>
          <div style={s.cdssItem}>
            <strong>Drug-Drug Interaction:</strong> Warfarin + Aspirin — Major interaction
          </div>
          <div style={s.cdssItem}>
            <strong>Drug-Allergy:</strong> Patient allergic to Penicillin — Amoxicillin
            contraindicated
          </div>
        </div>

        {hasHmo && (
          <div style={s.formularyOk}>
            Atorvastatin 20mg — Covered by HMO ✓
          </div>
        )}

        <button style={{ ...s.btn, ...s.btnPrimary, marginTop: 8 }} onClick={() => showToast('e-Prescription submitted to pharmacy', 'success')}>
          <FileText size={16} /> Submit e-Prescription
        </button>
      </div>
    </div>
  );
}

function FormularyTab({
  drugs,
  styles: s,
}: {
  drugs: typeof MOCK_DRUGS;
  styles: Record<string, React.CSSProperties>;
}) {
  const { tenant } = useTheme();
  const hasHmo = tenant.features.hmo ?? false;
  const hasPhilHealth = tenant.features.philHealth ?? false;
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    if (!search.trim()) return drugs;
    const q = search.toLowerCase();
    return drugs.filter(
      (d) =>
        d.name.toLowerCase().includes(q) || d.generic.toLowerCase().includes(q)
    );
  }, [drugs, search]);

  return (
    <>
      <input
        style={s.searchBox}
        placeholder="Search drugs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div style={s.drugList}>
        {filtered.map((d) => (
          <div key={d.name} style={s.drugCard}>
            <div>
              <div style={{ fontWeight: 600 }}>{d.name}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{d.generic}</div>
            </div>
            <div style={{ textAlign: 'right' as const }}>
              {(hasHmo || hasPhilHealth) && (
                <div style={{ fontSize: 12 }}>
                  {hasHmo && <>HMO: {d.hmo ? '✓' : '—'}</>}
                  {hasHmo && hasPhilHealth && ' · '}
                  {hasPhilHealth && <>PhilHealth: {d.philhealth ? '✓' : '—'}</>}
                </div>
              )}
              <div style={{ fontWeight: 600, marginTop: 4 }}>₱{d.price}/unit</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
