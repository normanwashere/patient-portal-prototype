import { useState, useMemo } from 'react';
import { DrugLookupModal } from '../../provider/pages/DrugMaster';
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

interface FormularyDrug {
  name: string;
  generic: string;
  category: string;
  form: string;
  hmo: boolean;
  philhealth: boolean;
  price: number;
  stock: 'In Stock' | 'Low Stock' | 'Out of Stock';
  schedule?: string;
  route: string;
  commonDose: string;
}

const MOCK_DRUGS: FormularyDrug[] = [
  // ── Cardiovascular ──
  { name: 'Rosuvastatin 20mg', generic: 'Rosuvastatin calcium', category: 'Cardiovascular', form: 'Tablet', hmo: true, philhealth: false, price: 35, stock: 'In Stock', route: 'Oral', commonDose: '10-20mg once daily' },
  { name: 'Atorvastatin 20mg', generic: 'Atorvastatin calcium', category: 'Cardiovascular', form: 'Tablet', hmo: true, philhealth: false, price: 28, stock: 'In Stock', route: 'Oral', commonDose: '10-80mg once daily' },
  { name: 'Losartan 50mg', generic: 'Losartan potassium', category: 'Cardiovascular', form: 'Tablet', hmo: true, philhealth: false, price: 12, stock: 'In Stock', route: 'Oral', commonDose: '25-100mg once daily' },
  { name: 'Amlodipine 10mg', generic: 'Amlodipine besylate', category: 'Cardiovascular', form: 'Tablet', hmo: true, philhealth: true, price: 8, stock: 'In Stock', route: 'Oral', commonDose: '2.5-10mg once daily' },
  { name: 'Clopidogrel 75mg', generic: 'Clopidogrel bisulfate', category: 'Cardiovascular', form: 'Tablet', hmo: true, philhealth: false, price: 28, stock: 'In Stock', route: 'Oral', commonDose: '75mg once daily' },
  { name: 'Enalapril 10mg', generic: 'Enalapril maleate', category: 'Cardiovascular', form: 'Tablet', hmo: true, philhealth: true, price: 6, stock: 'In Stock', route: 'Oral', commonDose: '5-40mg daily in 1-2 doses' },
  { name: 'Metoprolol 50mg', generic: 'Metoprolol succinate', category: 'Cardiovascular', form: 'Tablet', hmo: true, philhealth: false, price: 14, stock: 'In Stock', route: 'Oral', commonDose: '25-200mg once daily' },
  { name: 'Warfarin 5mg', generic: 'Warfarin sodium', category: 'Cardiovascular', form: 'Tablet', hmo: true, philhealth: false, price: 10, stock: 'Low Stock', route: 'Oral', commonDose: '2-10mg once daily (INR guided)' },
  { name: 'Aspirin 80mg', generic: 'Acetylsalicylic acid', category: 'Cardiovascular', form: 'Enteric Tablet', hmo: true, philhealth: true, price: 1.5, stock: 'In Stock', route: 'Oral', commonDose: '75-100mg once daily' },

  // ── Diabetes / Endocrine ──
  { name: 'Metformin 850mg', generic: 'Metformin HCl', category: 'Diabetes', form: 'Tablet', hmo: true, philhealth: true, price: 5, stock: 'In Stock', route: 'Oral', commonDose: '500-1000mg twice daily' },
  { name: 'Metformin 500mg', generic: 'Metformin HCl', category: 'Diabetes', form: 'Tablet', hmo: true, philhealth: true, price: 3, stock: 'In Stock', route: 'Oral', commonDose: '500mg twice daily' },
  { name: 'Glimepiride 2mg', generic: 'Glimepiride', category: 'Diabetes', form: 'Tablet', hmo: true, philhealth: true, price: 8, stock: 'In Stock', route: 'Oral', commonDose: '1-4mg once daily' },
  { name: 'Insulin Glargine 100U/mL', generic: 'Insulin glargine', category: 'Diabetes', form: 'Injection Pen', hmo: true, philhealth: false, price: 1200, stock: 'In Stock', route: 'Subcutaneous', commonDose: '10-80 units once daily' },
  { name: 'Sitagliptin 100mg', generic: 'Sitagliptin phosphate', category: 'Diabetes', form: 'Tablet', hmo: false, philhealth: false, price: 55, stock: 'In Stock', route: 'Oral', commonDose: '100mg once daily' },
  { name: 'Levothyroxine 100mcg', generic: 'Levothyroxine sodium', category: 'Endocrine', form: 'Tablet', hmo: true, philhealth: true, price: 7, stock: 'In Stock', route: 'Oral', commonDose: '25-200mcg once daily' },

  // ── Pain & Anti-inflammatory ──
  { name: 'Paracetamol 500mg', generic: 'Acetaminophen', category: 'Pain/Anti-inflammatory', form: 'Tablet', hmo: true, philhealth: true, price: 2, stock: 'In Stock', route: 'Oral', commonDose: '500-1000mg every 4-6h (max 4g/day)' },
  { name: 'Ibuprofen 400mg', generic: 'Ibuprofen', category: 'Pain/Anti-inflammatory', form: 'Tablet', hmo: true, philhealth: true, price: 4, stock: 'In Stock', route: 'Oral', commonDose: '200-400mg every 4-6h' },
  { name: 'Celecoxib 200mg', generic: 'Celecoxib', category: 'Pain/Anti-inflammatory', form: 'Capsule', hmo: true, philhealth: false, price: 22, stock: 'In Stock', route: 'Oral', commonDose: '100-200mg once or twice daily' },
  { name: 'Tramadol 50mg', generic: 'Tramadol HCl', category: 'Pain/Anti-inflammatory', form: 'Capsule', hmo: false, philhealth: false, price: 15, stock: 'In Stock', schedule: 'Schedule IV', route: 'Oral', commonDose: '50-100mg every 4-6h' },
  { name: 'Naproxen 500mg', generic: 'Naproxen sodium', category: 'Pain/Anti-inflammatory', form: 'Tablet', hmo: true, philhealth: false, price: 8, stock: 'In Stock', route: 'Oral', commonDose: '250-500mg twice daily' },
  { name: 'Morphine Sulfate 10mg', generic: 'Morphine sulfate', category: 'Pain/Anti-inflammatory', form: 'Tablet', hmo: false, philhealth: false, price: 45, stock: 'Low Stock', schedule: 'Schedule II', route: 'Oral', commonDose: '10-30mg every 4h as needed' },

  // ── Antibiotics ──
  { name: 'Amoxicillin 500mg', generic: 'Amoxicillin trihydrate', category: 'Antibiotics', form: 'Capsule', hmo: true, philhealth: true, price: 6, stock: 'In Stock', route: 'Oral', commonDose: '250-500mg every 8h' },
  { name: 'Co-Amoxiclav 625mg', generic: 'Amoxicillin + Clavulanate', category: 'Antibiotics', form: 'Tablet', hmo: true, philhealth: true, price: 18, stock: 'In Stock', route: 'Oral', commonDose: '625mg every 8h' },
  { name: 'Azithromycin 500mg', generic: 'Azithromycin dihydrate', category: 'Antibiotics', form: 'Tablet', hmo: true, philhealth: false, price: 25, stock: 'In Stock', route: 'Oral', commonDose: '500mg day 1, then 250mg days 2-5' },
  { name: 'Ciprofloxacin 500mg', generic: 'Ciprofloxacin HCl', category: 'Antibiotics', form: 'Tablet', hmo: true, philhealth: false, price: 12, stock: 'In Stock', route: 'Oral', commonDose: '250-750mg every 12h' },
  { name: 'Ceftriaxone 1g', generic: 'Ceftriaxone sodium', category: 'Antibiotics', form: 'Vial (IV/IM)', hmo: true, philhealth: true, price: 85, stock: 'In Stock', route: 'IV/IM', commonDose: '1-2g once daily' },
  { name: 'Clindamycin 300mg', generic: 'Clindamycin HCl', category: 'Antibiotics', form: 'Capsule', hmo: true, philhealth: false, price: 14, stock: 'Low Stock', route: 'Oral', commonDose: '150-450mg every 6-8h' },

  // ── GI / Gastric ──
  { name: 'Omeprazole 20mg', generic: 'Omeprazole', category: 'Gastrointestinal', form: 'Capsule', hmo: true, philhealth: false, price: 10, stock: 'In Stock', route: 'Oral', commonDose: '20-40mg once daily before meals' },
  { name: 'Pantoprazole 40mg', generic: 'Pantoprazole sodium', category: 'Gastrointestinal', form: 'Tablet', hmo: true, philhealth: false, price: 15, stock: 'In Stock', route: 'Oral', commonDose: '20-40mg once daily' },
  { name: 'Domperidone 10mg', generic: 'Domperidone', category: 'Gastrointestinal', form: 'Tablet', hmo: true, philhealth: true, price: 4, stock: 'In Stock', route: 'Oral', commonDose: '10mg three times daily before meals' },
  { name: 'Loperamide 2mg', generic: 'Loperamide HCl', category: 'Gastrointestinal', form: 'Capsule', hmo: true, philhealth: true, price: 3, stock: 'In Stock', route: 'Oral', commonDose: '4mg initially, then 2mg after each loose stool' },

  // ── Respiratory / Allergy ──
  { name: 'Cetirizine 10mg', generic: 'Cetirizine HCl', category: 'Allergy/Respiratory', form: 'Tablet', hmo: true, philhealth: true, price: 6, stock: 'In Stock', route: 'Oral', commonDose: '10mg once daily' },
  { name: 'Loratadine 10mg', generic: 'Loratadine', category: 'Allergy/Respiratory', form: 'Tablet', hmo: true, philhealth: true, price: 5, stock: 'In Stock', route: 'Oral', commonDose: '10mg once daily' },
  { name: 'Salbutamol 2mg', generic: 'Salbutamol sulfate', category: 'Allergy/Respiratory', form: 'Tablet', hmo: true, philhealth: true, price: 3, stock: 'In Stock', route: 'Oral', commonDose: '2-4mg three times daily' },
  { name: 'Salbutamol MDI 100mcg', generic: 'Salbutamol sulfate', category: 'Allergy/Respiratory', form: 'Inhaler', hmo: true, philhealth: false, price: 350, stock: 'In Stock', route: 'Inhalation', commonDose: '1-2 puffs every 4-6h as needed' },
  { name: 'Montelukast 10mg', generic: 'Montelukast sodium', category: 'Allergy/Respiratory', form: 'Tablet', hmo: true, philhealth: false, price: 20, stock: 'In Stock', route: 'Oral', commonDose: '10mg once daily at bedtime' },
  { name: 'Fluticasone Nasal Spray', generic: 'Fluticasone propionate', category: 'Allergy/Respiratory', form: 'Nasal Spray', hmo: false, philhealth: false, price: 450, stock: 'Low Stock', route: 'Intranasal', commonDose: '1-2 sprays per nostril once daily' },

  // ── CNS / Psych ──
  { name: 'Sertraline 50mg', generic: 'Sertraline HCl', category: 'CNS/Psychiatric', form: 'Tablet', hmo: true, philhealth: false, price: 18, stock: 'In Stock', route: 'Oral', commonDose: '50-200mg once daily' },
  { name: 'Escitalopram 10mg', generic: 'Escitalopram oxalate', category: 'CNS/Psychiatric', form: 'Tablet', hmo: true, philhealth: false, price: 22, stock: 'In Stock', route: 'Oral', commonDose: '10-20mg once daily' },
  { name: 'Alprazolam 0.5mg', generic: 'Alprazolam', category: 'CNS/Psychiatric', form: 'Tablet', hmo: false, philhealth: false, price: 12, stock: 'In Stock', schedule: 'Schedule IV', route: 'Oral', commonDose: '0.25-0.5mg three times daily' },
  { name: 'Pregabalin 75mg', generic: 'Pregabalin', category: 'CNS/Psychiatric', form: 'Capsule', hmo: false, philhealth: false, price: 30, stock: 'In Stock', schedule: 'Schedule V', route: 'Oral', commonDose: '75-150mg twice daily' },

  // ── Vitamins & Supplements ──
  { name: 'Vitamin D3 1000IU', generic: 'Cholecalciferol', category: 'Vitamins/Supplements', form: 'Softgel', hmo: false, philhealth: false, price: 8, stock: 'In Stock', route: 'Oral', commonDose: '1000-2000IU once daily' },
  { name: 'Ferrous Sulfate 325mg', generic: 'Ferrous sulfate', category: 'Vitamins/Supplements', form: 'Tablet', hmo: true, philhealth: true, price: 2, stock: 'In Stock', route: 'Oral', commonDose: '325mg once to three times daily' },
  { name: 'Calcium + Vitamin D', generic: 'Calcium carbonate + Cholecalciferol', category: 'Vitamins/Supplements', form: 'Tablet', hmo: true, philhealth: false, price: 6, stock: 'In Stock', route: 'Oral', commonDose: '1 tablet once to twice daily' },
  { name: 'Folic Acid 5mg', generic: 'Folic acid', category: 'Vitamins/Supplements', form: 'Tablet', hmo: true, philhealth: true, price: 1.5, stock: 'In Stock', route: 'Oral', commonDose: '1-5mg once daily' },

  // ── Other ──
  { name: 'Prednisone 5mg', generic: 'Prednisone', category: 'Corticosteroids', form: 'Tablet', hmo: true, philhealth: true, price: 3, stock: 'In Stock', route: 'Oral', commonDose: '5-60mg daily (taper as directed)' },
  { name: 'Dexamethasone 4mg', generic: 'Dexamethasone', category: 'Corticosteroids', form: 'Tablet', hmo: true, philhealth: true, price: 5, stock: 'In Stock', route: 'Oral', commonDose: '0.5-9mg daily in divided doses' },
  { name: 'Heparin 5000U/mL', generic: 'Heparin sodium', category: 'Anticoagulant', form: 'Vial (IV/SC)', hmo: true, philhealth: false, price: 120, stock: 'In Stock', route: 'IV/SC', commonDose: '5000U SC every 8-12h (prophylaxis)' },
  { name: 'Enoxaparin 40mg', generic: 'Enoxaparin sodium', category: 'Anticoagulant', form: 'Pre-filled Syringe', hmo: true, philhealth: false, price: 350, stock: 'Low Stock', route: 'Subcutaneous', commonDose: '40mg SC once daily (prophylaxis)' },
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
  const [lookupDrug, setLookupDrug] = useState<string | null>(null);

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
          <ActivePrescriptionsTable prescriptions={filteredActive} styles={styles} onDrugClick={setLookupDrug} />
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

      {activeTab === 'formulary' && <FormularyTab drugs={MOCK_DRUGS} styles={styles} onDrugClick={setLookupDrug} />}

      {lookupDrug && <DrugLookupModal drugName={lookupDrug} onClose={() => setLookupDrug(null)} />}
    </div>
  );
};

function ActivePrescriptionsTable({
  prescriptions,
  styles: s,
  onDrugClick,
}: {
  prescriptions: Prescription[];
  styles: Record<string, React.CSSProperties>;
  onDrugClick: (name: string) => void;
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
                  <td style={s.td}>
                    <span
                      style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
                      onClick={() => onDrugClick(rx.medication)}
                      title="View drug information"
                    >
                      {rx.medication}
                    </span>
                  </td>
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
  onDrugClick,
}: {
  drugs: FormularyDrug[];
  styles: Record<string, React.CSSProperties>;
  onDrugClick: (name: string) => void;
}) {
  const { tenant } = useTheme();
  const hasHmo = tenant.features.hmo ?? false;
  const hasPhilHealth = tenant.features.philHealth ?? false;
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [coverageFilter, setCoverageFilter] = useState<'all' | 'hmo' | 'philhealth'>('all');
  const [expandedDrug, setExpandedDrug] = useState<string | null>(null);

  const categories = useMemo(() => ['All', ...Array.from(new Set(drugs.map(d => d.category))).sort()], [drugs]);

  const filtered = useMemo(() => {
    let list = drugs;
    if (categoryFilter !== 'All') list = list.filter(d => d.category === categoryFilter);
    if (coverageFilter === 'hmo') list = list.filter(d => d.hmo);
    if (coverageFilter === 'philhealth') list = list.filter(d => d.philhealth);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(d => d.name.toLowerCase().includes(q) || d.generic.toLowerCase().includes(q) || d.category.toLowerCase().includes(q));
    }
    return list;
  }, [drugs, categoryFilter, coverageFilter, search]);

  const totalCount = drugs.length;
  const hmoCount = drugs.filter(d => d.hmo).length;
  const phCount = drugs.filter(d => d.philhealth).length;
  const lowStockCount = drugs.filter(d => d.stock === 'Low Stock').length;
  const oosCount = drugs.filter(d => d.stock === 'Out of Stock').length;

  const stockColor = (stock: string) => stock === 'In Stock' ? '#10b981' : stock === 'Low Stock' ? '#f59e0b' : '#ef4444';
  const stockBg = (stock: string) => stock === 'In Stock' ? 'rgba(16,185,129,0.08)' : stock === 'Low Stock' ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Summary Stats */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Drugs', value: totalCount, color: 'var(--color-primary)' },
          ...(hasHmo ? [{ label: 'HMO Covered', value: hmoCount, color: '#3b82f6' }] : []),
          ...(hasPhilHealth ? [{ label: 'PhilHealth', value: phCount, color: '#10b981' }] : []),
          { label: 'Low Stock', value: lowStockCount, color: '#f59e0b' },
          ...(oosCount > 0 ? [{ label: 'Out of Stock', value: oosCount, color: '#ef4444' }] : []),
        ].map(stat => (
          <div key={stat.label} style={{ flex: '1 1 100px', minWidth: 90, padding: '10px 14px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 3 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input style={s.searchBox} placeholder="Search by drug name, generic, or category..." value={search} onChange={e => setSearch(e.target.value)} />

      {/* Category Chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategoryFilter(cat)} style={{
            padding: '5px 12px', borderRadius: 20, border: categoryFilter === cat ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
            background: categoryFilter === cat ? 'var(--color-primary)' : 'var(--color-surface)', color: categoryFilter === cat ? '#fff' : 'var(--color-text-muted)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Coverage Filter */}
      {(hasHmo || hasPhilHealth) && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginRight: 4 }}>Coverage:</span>
          {[
            { key: 'all' as const, label: 'All' },
            ...(hasHmo ? [{ key: 'hmo' as const, label: 'HMO Covered' }] : []),
            ...(hasPhilHealth ? [{ key: 'philhealth' as const, label: 'PhilHealth' }] : []),
          ].map(opt => (
            <button key={opt.key} onClick={() => setCoverageFilter(opt.key)} style={{
              padding: '4px 10px', borderRadius: 6, border: coverageFilter === opt.key ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
              background: coverageFilter === opt.key ? 'var(--color-primary-light, rgba(59,130,246,0.1))' : 'transparent',
              color: coverageFilter === opt.key ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}>
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Results Count */}
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>
        Showing {filtered.length} of {totalCount} drugs
        {categoryFilter !== 'All' && <> in <strong>{categoryFilter}</strong></>}
      </div>

      {/* Drug Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <p style={{ fontWeight: 600 }}>No drugs found</p>
            <span style={{ fontSize: 13 }}>Try a different search or category</span>
          </div>
        ) : filtered.map(d => {
          const isExpanded = expandedDrug === d.name;
          return (
            <div key={d.name} onClick={() => setExpandedDrug(isExpanded ? null : d.name)} style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10,
              overflow: 'hidden', cursor: 'pointer', transition: 'all 0.15s',
              borderLeft: `3px solid ${stockColor(d.stock)}`,
            }}>
              {/* Main Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 1 }}>{d.generic}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', flex: '0 1 auto' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'rgba(100,116,139,0.08)', color: '#64748b' }}>{d.category}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'rgba(100,116,139,0.08)', color: '#64748b' }}>{d.form}</span>
                  {d.schedule && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>{d.schedule}</span>}
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: stockBg(d.stock), color: stockColor(d.stock) }}>{d.stock}</span>
                </div>
                <div style={{ textAlign: 'right', minWidth: 70, flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>₱{d.price < 1 ? d.price.toFixed(2) : d.price}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>per unit</div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginTop: 12 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>Route</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>{d.route}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>Common Dose</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>{d.commonDose}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>Form</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>{d.form}</div>
                    </div>
                    {d.schedule && (
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>Controlled</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444' }}>{d.schedule}</div>
                      </div>
                    )}
                  </div>
                  {/* Coverage Row */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    {hasHmo && (
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                        background: d.hmo ? 'rgba(16,185,129,0.08)' : 'rgba(100,116,139,0.06)',
                        color: d.hmo ? '#10b981' : '#94a3b8',
                      }}>
                        HMO: {d.hmo ? 'Covered ✓' : 'Not covered'}
                      </span>
                    )}
                    {hasPhilHealth && (
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                        background: d.philhealth ? 'rgba(16,185,129,0.08)' : 'rgba(100,116,139,0.06)',
                        color: d.philhealth ? '#10b981' : '#94a3b8',
                      }}>
                        PhilHealth: {d.philhealth ? 'Covered ✓' : 'Not covered'}
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); onDrugClick(d.name); }}
                      style={{
                        marginLeft: 'auto', padding: '5px 14px', borderRadius: 6,
                        border: '1px solid var(--color-primary)', background: 'transparent',
                        color: 'var(--color-primary)', fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', whiteSpace: 'nowrap',
                      }}
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
