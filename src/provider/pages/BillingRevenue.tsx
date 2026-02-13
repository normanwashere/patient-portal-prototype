import { useState, useMemo } from 'react';
import {
  CreditCard,
  DollarSign,
  FileText,
  TrendingUp,
  Search,
  Wallet,
  Banknote,
  Receipt,
  Shield,
  RefreshCcw,
  Plus,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useProvider } from '../context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';
import { useToast } from '../../context/ToastContext';
import type { PaymentTransaction } from '../types';

/* ─── helpers ─── */
const isToday = (dateStr: string) => {
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return dateStr === today;
};

/* ─── constants ─── */
const FEE_SCHEDULE = [
  { service: 'Consultation', fee: 500 },
  { service: 'CBC', fee: 350 },
  { service: 'X-Ray', fee: 800 },
  { service: 'Ultrasound', fee: 1200 },
  { service: 'ECG', fee: 250 },
  { service: 'HbA1c', fee: 400 },
  { service: 'Urinalysis', fee: 200 },
  { service: '2D Echo', fee: 1500 },
  { service: 'CT Scan', fee: 3500 },
  { service: 'MRI', fee: 8000 },
];

const INITIAL_CLAIMS = [
  { id: 'CLM-001', patient: 'Juan Dela Cruz', amount: 850, status: 'Submitted' as const, date: 'Feb 10, 2026' },
  { id: 'CLM-002', patient: 'Sofia Garcia', amount: 2100, status: 'Under Review' as const, date: 'Feb 9, 2026' },
  { id: 'CLM-003', patient: 'Carlos Reyes', amount: 680, status: 'Approved' as const, date: 'Feb 8, 2026' },
  { id: 'CLM-004', patient: 'Lourdes Bautista', amount: 450, status: 'Denied' as const, date: 'Feb 7, 2026' },
  { id: 'CLM-005', patient: 'Anna Santos', amount: 1200, status: 'Under Review' as const, date: 'Feb 11, 2026' },
];

const PAYMENT_METHODS: PaymentTransaction['method'][] = ['Cash', 'GCash', 'Maya', 'Credit Card', 'Debit Card', 'Insurance'];

/* ─── styles ─── */
const s: Record<string, React.CSSProperties> = {
  page: { padding: 24, background: 'var(--color-background)', minHeight: '100%' },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 },
  subtitle: { fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 24 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 },
  statCard: {
    background: 'var(--color-surface)',
    borderRadius: 12,
    padding: 20,
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border)',
  },
  statIcon: { width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 22, fontWeight: 700, color: 'var(--color-text)' },
  statLabel: { fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 },
  tabs: {
    display: 'flex',
    gap: 4,
    marginBottom: 20,
    borderBottom: '1px solid var(--color-border)',
    paddingBottom: 0,
  },
  tab: {
    padding: '12px 20px',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: -1,
  },
  tabActive: {
    color: 'var(--color-primary)',
    borderBottomColor: 'var(--color-primary)',
  },
  card: {
    background: 'var(--color-surface)',
    borderRadius: 12,
    padding: 24,
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border)',
  },
  toolbar: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' as const },
  searchWrap: { flex: 1, position: 'relative' as const, minWidth: 200 },
  searchIcon: { position: 'absolute' as const, left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' },
  searchInput: {
    width: '100%',
    padding: '10px 14px 10px 44px',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    fontSize: 14,
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    boxSizing: 'border-box' as const,
  },
  filterSelect: {
    padding: '10px 14px',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    background: 'var(--color-surface)',
    color: 'var(--color-text-muted)',
    fontSize: 14,
    cursor: 'pointer',
  },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: {
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    background: 'var(--color-background)',
    borderBottom: '1px solid var(--color-border)',
  },
  td: {
    padding: '14px 16px',
    fontSize: 14,
    color: 'var(--color-text)',
    borderBottom: '1px solid var(--color-border)',
  },
  badge: {
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  },
  btnPrimary: {
    padding: '10px 18px',
    background: 'var(--color-primary)',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  },
  btnDanger: {
    padding: '6px 12px',
    background: 'var(--color-error-light, #fee2e2)',
    color: 'var(--color-error, #ef4444)',
    border: '1px solid var(--color-error, #ef4444)',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  btnSuccess: {
    padding: '6px 12px',
    background: 'var(--color-success)',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  btnSmOutline: {
    padding: '6px 12px',
    background: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    color: 'var(--color-text-muted)',
  },
  formGroup: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    fontSize: 14,
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    boxSizing: 'border-box' as const,
  },
};

/* ─── sub-components ─── */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; color: string }> = {
    Completed: { bg: 'var(--color-success-light, #d1fae5)', color: 'var(--color-success, #10b981)' },
    Pending: { bg: 'var(--color-warning-light, #fef3c7)', color: 'var(--color-warning, #f59e0b)' },
    Failed: { bg: 'var(--color-error-light, #fee2e2)', color: 'var(--color-error, #ef4444)' },
    Refunded: { bg: 'var(--color-info-light, #dbeafe)', color: 'var(--color-info, #3b82f6)' },
  };
  const c = config[status] ?? { bg: 'var(--color-background)', color: 'var(--color-text-muted)' };
  return <span style={{ ...s.badge, background: c.bg, color: c.color }}>{status}</span>;
}

function MethodBadge({ method }: { method: string }) {
  const icons: Record<string, React.ReactNode> = {
    'Credit Card': <CreditCard size={12} />,
    'Debit Card': <CreditCard size={12} />,
    GCash: <Receipt size={12} />,
    Maya: <Receipt size={12} />,
    Cash: <Banknote size={12} />,
    Insurance: <Shield size={12} />,
  };
  return (
    <span style={{ ...s.badge, background: 'var(--color-background)', color: 'var(--color-text)' }}>
      {icons[method] ?? <Wallet size={12} />} {method}
    </span>
  );
}

function ClaimStatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; color: string }> = {
    Submitted: { bg: 'var(--color-info-light, #dbeafe)', color: 'var(--color-info, #3b82f6)' },
    'Under Review': { bg: 'var(--color-warning-light, #fef3c7)', color: 'var(--color-warning, #f59e0b)' },
    Approved: { bg: 'var(--color-success-light, #d1fae5)', color: 'var(--color-success, #10b981)' },
    Denied: { bg: 'var(--color-error-light, #fee2e2)', color: 'var(--color-error, #ef4444)' },
  };
  const c = config[status] ?? { bg: 'var(--color-background)', color: 'var(--color-text-muted)' };
  return <span style={{ ...s.badge, background: c.bg, color: c.color }}>{status}</span>;
}

/* ═══════════════════════════════════════════════ */
export function BillingRevenue() {
  const { tenant } = useTheme();
  const { paymentTransactions, addPayment, refundPayment } = useProvider();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'transactions' | 'invoice' | 'claims' | 'fees'>('transactions');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  // invoice form
  const [invPatient, setInvPatient] = useState('');
  const [invAmount, setInvAmount] = useState('');
  const [invMethod, setInvMethod] = useState<PaymentTransaction['method']>('Cash');
  const [invDesc, setInvDesc] = useState('');

  // claims
  const [claims, setClaims] = useState(INITIAL_CLAIMS);

  /* ── computed stats ── */
  const totalRevenue = useMemo(
    () => paymentTransactions.filter((t) => t.status === 'Completed').reduce((a, t) => a + t.amount, 0),
    [paymentTransactions]
  );
  const outstanding = useMemo(
    () => paymentTransactions.filter((t) => t.status === 'Pending').reduce((a, t) => a + t.amount, 0),
    [paymentTransactions]
  );
  const todaysCollections = useMemo(
    () => paymentTransactions.filter((t) => t.status === 'Completed' && isToday(t.transactionDate)).reduce((a, t) => a + t.amount, 0),
    [paymentTransactions]
  );
  const refundedTotal = useMemo(
    () => paymentTransactions.filter((t) => t.status === 'Refunded').reduce((a, t) => a + t.amount, 0),
    [paymentTransactions]
  );

  /* ── filtered transactions ── */
  const filteredTx = useMemo(() => {
    return paymentTransactions.filter((t) => {
      const matchSearch = !search || t.patientName.toLowerCase().includes(search.toLowerCase()) || t.referenceNumber.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchMethod = methodFilter === 'all' || t.method === methodFilter;
      return matchSearch && matchStatus && matchMethod;
    });
  }, [paymentTransactions, search, statusFilter, methodFilter]);

  /* ── tab list (conditionally hide claims) ── */
  const tabList = useMemo(() => {
    const list: { id: 'transactions' | 'invoice' | 'claims' | 'fees'; label: string; icon: React.ReactNode }[] = [
      { id: 'transactions', label: 'Transactions', icon: <CreditCard size={16} /> },
      { id: 'invoice', label: 'Create Invoice', icon: <FileText size={16} /> },
    ];
    if (tenant.features.hmo || tenant.features.loa) {
      list.push({ id: 'claims', label: 'Insurance Claims', icon: <Shield size={16} /> });
    }
    list.push({ id: 'fees', label: 'Fee Schedule', icon: <DollarSign size={16} /> });
    return list;
  }, [tenant.features.hmo, tenant.features.loa]);

  const effectiveTab = tabList.some((t) => t.id === activeTab) ? activeTab : 'transactions';

  /* ── refund handler ── */
  const handleRefund = (txId: string) => {
    refundPayment(txId);
    showToast('Payment refunded successfully', 'success');
  };

  /* ── create invoice ── */
  const handleCreateInvoice = () => {
    if (!invPatient.trim() || !invAmount || parseFloat(invAmount) <= 0) {
      showToast('Please fill in patient name and a valid amount', 'error');
      return;
    }
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const tx: Omit<PaymentTransaction, 'id' | 'referenceNumber'> = {
      invoiceId: `INV-${Date.now().toString(36).toUpperCase()}`,
      patientName: invPatient.trim(),
      amount: parseFloat(invAmount),
      method: invMethod,
      status: 'Completed',
      transactionDate: today,
      convenienceFee: invMethod === 'GCash' || invMethod === 'Maya' ? Math.round(parseFloat(invAmount) * 0.02) : 0,
    };
    addPayment(tx);
    showToast(`Invoice created: ₱${parseFloat(invAmount).toLocaleString()} for ${invPatient}`, 'success');
    setInvPatient('');
    setInvAmount('');
    setInvMethod('Cash');
    setInvDesc('');
  };

  /* ── claim actions ── */
  const handleApproveClaim = (id: string) => {
    setClaims((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'Approved' as const } : c)));
    showToast(`Claim ${id} approved`, 'success');
  };
  const handleDenyClaim = (id: string) => {
    setClaims((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'Denied' as const } : c)));
    showToast(`Claim ${id} denied`, 'info');
  };

  return (
    <div style={s.page}>
      <h1 style={s.title}>Billing & Revenue</h1>
      <p style={s.subtitle}>Manage transactions, invoices, claims, and fee schedules</p>

      {/* ── stat cards ── */}
      <div style={s.statsRow}>
        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: 'var(--color-success-light, #d1fae5)' }}>
            <DollarSign size={22} style={{ color: 'var(--color-success)' }} />
          </div>
          <div style={s.statValue}>₱{totalRevenue.toLocaleString()}</div>
          <div style={s.statLabel}>Total Revenue</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: 'var(--color-warning-light, #fef3c7)' }}>
            <TrendingUp size={22} style={{ color: 'var(--color-warning)' }} />
          </div>
          <div style={s.statValue}>₱{outstanding.toLocaleString()}</div>
          <div style={s.statLabel}>Outstanding</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: 'var(--color-info-light, #dbeafe)' }}>
            <CreditCard size={22} style={{ color: 'var(--color-info, #3b82f6)' }} />
          </div>
          <div style={s.statValue}>₱{todaysCollections.toLocaleString()}</div>
          <div style={s.statLabel}>Today&apos;s Collections</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: 'var(--color-error-light, #fee2e2)' }}>
            <RefreshCcw size={22} style={{ color: 'var(--color-error)' }} />
          </div>
          <div style={s.statValue}>₱{refundedTotal.toLocaleString()}</div>
          <div style={s.statLabel}>Refunded</div>
        </div>
      </div>

      {/* ── tabs ── */}
      <div style={s.tabs}>
        {tabList.map((tab) => (
          <button
            key={tab.id}
            style={{ ...s.tab, ...(effectiveTab === tab.id ? s.tabActive : {}) }}
            onClick={() => setActiveTab(tab.id)}
          >
            <span style={{ marginRight: 6, verticalAlign: 'middle', display: 'inline-flex' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ Transactions Tab ═══ */}
      {effectiveTab === 'transactions' && (
        <div style={s.card}>
          <div style={s.toolbar}>
            <div style={s.searchWrap}>
              <Search size={18} style={s.searchIcon} />
              <input
                style={s.searchInput}
                placeholder="Search by patient or reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select style={s.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
            <select style={s.filterSelect} value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
              <option value="all">All Methods</option>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {filteredTx.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>No transactions found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Ref #</th>
                    <th style={s.th}>Patient</th>
                    <th style={s.th}>Amount</th>
                    <th style={s.th}>Method</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Date</th>
                    <th style={{ ...s.th, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTx.map((t) => (
                    <tr key={t.id}>
                      <td style={s.td}><span style={{ fontWeight: 600 }}>{t.referenceNumber}</span></td>
                      <td style={s.td}>{t.patientName}</td>
                      <td style={s.td}>₱{t.amount.toLocaleString()}</td>
                      <td style={s.td}><MethodBadge method={t.method} /></td>
                      <td style={s.td}><StatusBadge status={t.status} /></td>
                      <td style={s.td}>{t.transactionDate}</td>
                      <td style={{ ...s.td, textAlign: 'right' }}>
                        {t.status === 'Completed' && (
                          <button style={s.btnDanger} onClick={() => handleRefund(t.id)}>
                            <RefreshCcw size={12} /> Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: 16, fontSize: 13, color: 'var(--color-text-muted)' }}>
            Showing {filteredTx.length} of {paymentTransactions.length} transactions
          </div>
        </div>
      )}

      {/* ═══ Create Invoice Tab ═══ */}
      {effectiveTab === 'invoice' && (
        <div style={s.card}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 20 }}>
            <FileText size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Create New Invoice
          </h3>

          <div style={{ maxWidth: 500 }}>
            <div style={s.formGroup}>
              <label style={s.label}>Patient Name *</label>
              <input
                style={s.input}
                placeholder="Enter patient name"
                value={invPatient}
                onChange={(e) => setInvPatient(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={s.formGroup}>
                <label style={s.label}>Amount (₱) *</label>
                <input
                  style={s.input}
                  type="number"
                  placeholder="0.00"
                  min="0"
                  value={invAmount}
                  onChange={(e) => setInvAmount(e.target.value)}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Payment Method</label>
                <select style={s.input} value={invMethod} onChange={(e) => setInvMethod(e.target.value as PaymentTransaction['method'])}>
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Description / Notes</label>
              <textarea
                style={{ ...s.input, minHeight: 80, resize: 'vertical' as const }}
                placeholder="Add description or notes..."
                value={invDesc}
                onChange={(e) => setInvDesc(e.target.value)}
              />
            </div>

            {(invMethod === 'GCash' || invMethod === 'Maya') && invAmount && (
              <div style={{
                padding: 12,
                borderRadius: 8,
                background: 'var(--color-info-light, #dbeafe)',
                color: 'var(--color-info, #3b82f6)',
                fontSize: 13,
                marginBottom: 16,
              }}>
                Convenience fee: ₱{Math.round(parseFloat(invAmount || '0') * 0.02).toLocaleString()} (2%)
              </div>
            )}

            <button style={s.btnPrimary} onClick={handleCreateInvoice}>
              <Plus size={16} /> Create Invoice & Record Payment
            </button>
          </div>
        </div>
      )}

      {/* ═══ Insurance Claims Tab ═══ */}
      {effectiveTab === 'claims' && (
        <div style={s.card}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 20 }}>
            <Shield size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Insurance Claims
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Claim ID</th>
                  <th style={s.th}>Patient</th>
                  <th style={s.th}>Amount</th>
                  <th style={s.th}>Date</th>
                  <th style={s.th}>Status</th>
                  <th style={{ ...s.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c) => (
                  <tr key={c.id}>
                    <td style={s.td}><span style={{ fontWeight: 600 }}>{c.id}</span></td>
                    <td style={s.td}>{c.patient}</td>
                    <td style={s.td}>₱{c.amount.toLocaleString()}</td>
                    <td style={s.td}>{c.date}</td>
                    <td style={s.td}><ClaimStatusBadge status={c.status} /></td>
                    <td style={{ ...s.td, textAlign: 'right' }}>
                      {(c.status === 'Submitted' || c.status === 'Under Review') && (
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button style={s.btnSuccess} onClick={() => handleApproveClaim(c.id)}>
                            <CheckCircle2 size={12} /> Approve
                          </button>
                          <button style={s.btnDanger} onClick={() => handleDenyClaim(c.id)}>
                            <XCircle size={12} /> Deny
                          </button>
                        </div>
                      )}
                      {c.status === 'Approved' && (
                        <span style={{ fontSize: 12, color: 'var(--color-success)', fontWeight: 600 }}>Processed</span>
                      )}
                      {c.status === 'Denied' && (
                        <span style={{ fontSize: 12, color: 'var(--color-error)', fontWeight: 600 }}>Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginTop: 20 }}>
            {(['Submitted', 'Under Review', 'Approved', 'Denied'] as const).map((st) => {
              const count = claims.filter((c) => c.status === st).length;
              const total = claims.filter((c) => c.status === st).reduce((a, c) => a + c.amount, 0);
              return (
                <div key={st} style={{
                  padding: 14,
                  borderRadius: 8,
                  background: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>{st}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>{count}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>₱{total.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ Fee Schedule Tab ═══ */}
      {effectiveTab === 'fees' && (
        <div style={s.card}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 20 }}>
            <DollarSign size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Fee Schedule
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Service</th>
                  <th style={s.th}>Fee (₱)</th>
                  <th style={s.th}>Category</th>
                </tr>
              </thead>
              <tbody>
                {FEE_SCHEDULE.map((row) => (
                  <tr key={row.service}>
                    <td style={s.td}>
                      <span style={{ fontWeight: 600 }}>{row.service}</span>
                    </td>
                    <td style={s.td}>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₱{row.fee.toLocaleString()}</span>
                    </td>
                    <td style={s.td}>
                      <span style={{
                        ...s.badge,
                        background: row.fee >= 1000 ? 'var(--color-warning-light, #fef3c7)' : 'var(--color-success-light, #d1fae5)',
                        color: row.fee >= 1000 ? 'var(--color-warning, #f59e0b)' : 'var(--color-success, #10b981)',
                      }}>
                        {row.fee >= 1000 ? 'Premium' : 'Standard'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'var(--color-background)', fontSize: 13, color: 'var(--color-text-muted)' }}>
            Prices are in Philippine Peso (₱). Additional convenience fees may apply for digital payments.
          </div>
        </div>
      )}
    </div>
  );
}
