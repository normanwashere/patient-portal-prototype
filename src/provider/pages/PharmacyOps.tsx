import { useState, useMemo } from 'react';
import {
  Pill,
  AlertTriangle,
  Package,
  ClipboardCheck,
  Search,
  Plus,
  Minus,
  CheckCircle2,
  Shield,
  Clock,
  Archive,
} from 'lucide-react';
import { useProvider } from '../context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge, TabBar, PageHeader } from '../../ui';
import type { BadgeVariant } from '../../ui';

/* ───────── shared inline styles ───────── */
const S: Record<string, React.CSSProperties> = {
  page: { padding: 24, background: 'var(--color-background)', minHeight: '100%' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  titleWrap: { display: 'flex', flexDirection: 'column', gap: 4 },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--color-text)', margin: 0 },
  subtitle: { fontSize: 14, color: 'var(--color-text-muted)', margin: 0 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 },
  statCard: { background: 'var(--color-surface)', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.06)', border: '1px solid var(--color-border)' },
  statIcon: { width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 22, fontWeight: 700, color: 'var(--color-text)' },
  statLabel: { fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 },
  tabs: { display: 'flex', gap: 4, borderBottom: '1px solid var(--color-border)', marginBottom: 20, paddingBottom: 0 },
  tab: { padding: '12px 20px', fontSize: 14, fontWeight: 600, color: 'var(--color-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -1, borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', gap: 8 },
  tabActive: { color: 'var(--color-primary)', borderBottomColor: 'var(--color-primary)' },
  card: { background: 'var(--color-surface)', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.06)', border: '1px solid var(--color-border)', marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: 600, color: 'var(--color-text)', marginBottom: 16, margin: 0 },
  toolbar: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' },
  searchWrap: { position: 'relative' as const, flex: 1, minWidth: 200 },
  searchIcon: { position: 'absolute' as const, left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' },
  searchInput: { width: '100%', padding: '10px 14px 10px 38px', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 14, background: 'var(--color-surface)', color: 'var(--color-text)', boxSizing: 'border-box' as const },
  chip: { padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-muted)', cursor: 'pointer' },
  chipActive: { background: 'var(--color-primary)', borderColor: 'var(--color-primary)', color: 'white' },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: { padding: '12px 14px', textAlign: 'left' as const, fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', background: 'var(--color-background)', borderBottom: '1px solid var(--color-border)', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  td: { padding: '14px 14px', fontSize: 14, color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)' },
  btn: { padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 },
  btnPrimary: { background: 'var(--color-primary)', color: 'white' },
  btnSuccess: { background: 'var(--color-success)', color: 'white' },
  btnOutline: { background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)' },
  btnIcon: { width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', padding: 0 },
  badge: { display: 'inline-block', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 },
  progressBar: { height: 8, borderRadius: 4, background: 'var(--color-border)', overflow: 'hidden' },
  emptyState: { textAlign: 'center' as const, padding: 40, color: 'var(--color-text-muted)' },
};

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  'Active': 'info',
  'Pending Approval': 'warning',
  'Completed': 'success',
  'Cancelled': 'error',
  'Dispensed': 'success',
  'Pending': 'warning',
  'Partially Dispensed': 'indigo',
  'Returned': 'error',
  'In Stock': 'success',
  'Low Stock': 'warning',
  'Out of Stock': 'error',
  'Expired': 'error',
};

function getStockBarColor(ratio: number) {
  if (ratio >= 1) return 'var(--color-success)';
  if (ratio >= 0.5) return 'var(--color-warning)';
  return 'var(--color-error)';
}

export function PharmacyOps() {
  const { tenant } = useTheme();
  const { showToast } = useToast();
  const {
    prescriptions,
    dispensing,
    pharmacyItems,
    currentStaff,
    dispenseItem,
    updatePharmacyStock,
  } = useProvider();

  const labEnabled = tenant.features.visits.clinicLabFulfillmentEnabled;

  const [activeTab, setActiveTab] = useState<'prescriptions' | 'dispensing' | 'inventory'>('prescriptions');
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<string>('all');

  /* ───────── computed ───────── */
  const pendingRx = useMemo(() =>
    prescriptions.filter(p => p.status === 'Active' || p.status === 'Pending Approval'),
    [prescriptions]
  );

  const dispensableRx = useMemo(() =>
    prescriptions.filter(p => p.status === 'Active'),
    [prescriptions]
  );

  const totalItems = pharmacyItems.length;
  const lowStockCount = pharmacyItems.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length;
  const dispensedToday = dispensing.filter(d => d.status === 'Dispensed').length;
  const controlledCount = pharmacyItems.filter(i => i.isControlled).length;

  const filteredInventory = useMemo(() => {
    return pharmacyItems.filter(i => {
      const q = search.toLowerCase();
      const matchSearch = !search || i.name.toLowerCase().includes(q) || i.genericName.toLowerCase().includes(q);
      const matchStock = stockFilter === 'all'
        || (stockFilter === 'low' && (i.status === 'Low Stock' || i.status === 'Out of Stock'))
        || (stockFilter === 'ok' && i.status === 'In Stock')
        || (stockFilter === 'controlled' && i.isControlled);
      return matchSearch && matchStock;
    });
  }, [pharmacyItems, search, stockFilter]);

  const filteredDispensing = useMemo(() => {
    if (!search) return dispensing;
    const q = search.toLowerCase();
    return dispensing.filter(d =>
      d.patientName.toLowerCase().includes(q) ||
      d.medication.toLowerCase().includes(q) ||
      d.prescriptionId.toLowerCase().includes(q)
    );
  }, [dispensing, search]);

  /* ───────── handlers ───────── */
  const handleDispense = (rxId: string) => {
    dispenseItem(rxId, currentStaff.name);
    showToast('Medication dispensed successfully', 'success');
  };

  const handleStockChange = (itemId: string, delta: number) => {
    updatePharmacyStock(itemId, delta);
    showToast(`Stock ${delta > 0 ? 'increased' : 'decreased'} by ${Math.abs(delta)}`, 'info');
  };

  /* ───────── gate on feature flag ───────── */
  if (!labEnabled) {
    return (
      <div style={S.page}>
        <div style={{ ...S.card, textAlign: 'center', padding: 60 }}>
          <Pill size={48} style={{ color: 'var(--color-text-muted)', marginBottom: 16 }} />
          <h2 style={{ color: 'var(--color-text)', marginBottom: 8 }}>Pharmacy Not Enabled</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            This facility does not have pharmacy operations enabled. Contact admin to activate.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      {/* ── Header ── */}
      <PageHeader title="Pharmacy Operations" subtitle="Prescription dispensing, records, and inventory management" />

      {/* ── Stats Row ── */}
      <div style={S.statsRow}>
        {[
          { label: 'Pending Rx', value: pendingRx.length, bg: 'var(--color-warning-light)', color: 'var(--color-warning-dark)', icon: <Clock size={20} /> },
          { label: 'Dispensed', value: dispensedToday, bg: 'var(--color-success-light)', color: 'var(--color-success-dark)', icon: <CheckCircle2 size={20} /> },
          { label: 'Low / OOS', value: lowStockCount, bg: 'var(--color-error-light)', color: 'var(--color-error-dark)', icon: <AlertTriangle size={20} /> },
          { label: 'Total Items', value: totalItems, bg: 'var(--color-info-light)', color: 'var(--color-info-dark)', icon: <Package size={20} /> },
          { label: 'Controlled', value: controlledCount, bg: 'var(--color-purple-light)', color: 'var(--color-purple-dark)', icon: <Shield size={20} /> },
        ].map(s => (
          <div key={s.label} style={S.statCard}>
            <div style={{ ...S.statIcon, background: s.bg }}>
              <span style={{ color: s.color }}>{s.icon}</span>
            </div>
            <div style={S.statValue}>{s.value}</div>
            <div style={S.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <TabBar
        tabs={[
          { key: 'prescriptions' as const, label: 'Prescriptions', icon: <ClipboardCheck size={16} /> },
          { key: 'dispensing' as const, label: 'Dispensing', icon: <Archive size={16} /> },
          { key: 'inventory' as const, label: 'Inventory', icon: <Package size={16} /> },
        ]}
        active={activeTab}
        onChange={(key) => { setActiveTab(key); setSearch(''); }}
      />

      {/* ═══════════ PRESCRIPTIONS TAB ═══════════ */}
      {activeTab === 'prescriptions' && (
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={S.cardTitle}>Active & Pending Prescriptions</h2>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
              Logged in as <strong>{currentStaff.name}</strong>
            </span>
          </div>

          {dispensableRx.length === 0 ? (
            <div style={S.emptyState}>
              <Pill size={40} style={{ color: 'var(--color-text-muted)', marginBottom: 12 }} />
              <p>No active prescriptions to dispense.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>Rx ID</th>
                    <th style={S.th}>Patient</th>
                    <th style={S.th}>Medication</th>
                    <th style={S.th}>Dosage</th>
                    <th style={S.th}>Frequency</th>
                    <th style={S.th}>Qty</th>
                    <th style={S.th}>Refills</th>
                    <th style={S.th}>Doctor</th>
                    <th style={S.th}>Status</th>
                    <th style={S.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dispensableRx.map(rx => (
                    <tr key={rx.id}>
                      <td style={S.td}><span style={{ fontWeight: 600 }}>{rx.id}</span></td>
                      <td style={S.td}>{rx.patientName}</td>
                      <td style={S.td}>
                        <div style={{ fontWeight: 600 }}>{rx.medication}</div>
                        {rx.notes && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{rx.notes}</div>}
                      </td>
                      <td style={S.td}>{rx.dosage}</td>
                      <td style={S.td}>{rx.frequency}</td>
                      <td style={S.td}>{rx.quantity}</td>
                      <td style={S.td}>{rx.refillsRemaining}</td>
                      <td style={S.td}>{rx.doctorName}</td>
                      <td style={S.td}><StatusBadge variant={STATUS_VARIANT[rx.status] ?? 'muted'}>{rx.status}</StatusBadge></td>
                      <td style={S.td}>
                        <button
                          style={{ ...S.btn, ...S.btnSuccess, fontSize: 12, padding: '6px 14px' }}
                          onClick={() => handleDispense(rx.id)}
                        >
                          <CheckCircle2 size={14} /> Dispense
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pending approval section */}
          {(() => {
            const pending = prescriptions.filter(p => p.status === 'Pending Approval');
            if (pending.length === 0) return null;
            return (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, padding: '20px 0 10px', marginTop: 16 }}>
                  Pending Approval ({pending.length})
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        <th style={S.th}>Rx ID</th>
                        <th style={S.th}>Patient</th>
                        <th style={S.th}>Medication</th>
                        <th style={S.th}>Doctor</th>
                        <th style={S.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pending.map(p => (
                        <tr key={p.id} style={{ background: '#fffbeb' }}>
                          <td style={S.td}><span style={{ fontWeight: 600 }}>{p.id}</span></td>
                          <td style={S.td}>{p.patientName}</td>
                          <td style={S.td}>{p.medication} {p.dosage}</td>
                          <td style={S.td}>{p.doctorName}</td>
                          <td style={S.td}><StatusBadge variant={STATUS_VARIANT[p.status] ?? 'muted'}>{p.status}</StatusBadge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ═══════════ DISPENSING TAB ═══════════ */}
      {activeTab === 'dispensing' && (
        <div style={S.card}>
          <h2 style={S.cardTitle}>Dispensing Records</h2>
          <div style={S.toolbar}>
            <div style={S.searchWrap}>
              <Search size={16} style={S.searchIcon} />
              <input
                style={S.searchInput}
                placeholder="Search records..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {filteredDispensing.length === 0 ? (
            <div style={S.emptyState}>
              <Archive size={40} style={{ marginBottom: 12 }} />
              <p>No dispensing records found.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>ID</th>
                    <th style={S.th}>Rx ID</th>
                    <th style={S.th}>Patient</th>
                    <th style={S.th}>Medication</th>
                    <th style={S.th}>Qty</th>
                    <th style={S.th}>Dispensed By</th>
                    <th style={S.th}>Date</th>
                    <th style={S.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDispensing.map(d => (
                    <tr key={d.id}>
                      <td style={S.td}><span style={{ fontWeight: 600 }}>{d.id}</span></td>
                      <td style={S.td}>{d.prescriptionId}</td>
                      <td style={S.td}>{d.patientName}</td>
                      <td style={S.td}>{d.medication}</td>
                      <td style={S.td}>{d.quantity}</td>
                      <td style={S.td}>{d.dispensedBy}</td>
                      <td style={S.td}>{d.dispensedDate}</td>
                      <td style={S.td}><StatusBadge variant={STATUS_VARIANT[d.status] ?? 'muted'}>{d.status}</StatusBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ INVENTORY TAB ═══════════ */}
      {activeTab === 'inventory' && (
        <div style={S.card}>
          <h2 style={S.cardTitle}>Pharmacy Inventory</h2>
          <div style={S.toolbar}>
            <div style={S.searchWrap}>
              <Search size={16} style={S.searchIcon} />
              <input
                style={S.searchInput}
                placeholder="Search by name or generic..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'low', label: 'Low / OOS' },
                { id: 'ok', label: 'In Stock' },
                { id: 'controlled', label: 'Controlled' },
              ].map(f => (
                <button
                  key={f.id}
                  style={{ ...S.chip, ...(stockFilter === f.id ? S.chipActive : {}) }}
                  onClick={() => setStockFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Name</th>
                  <th style={S.th}>Generic</th>
                  <th style={S.th}>Category</th>
                  <th style={S.th}>Stock</th>
                  <th style={S.th}>Min</th>
                  <th style={S.th}>Price</th>
                  <th style={S.th}>Expiry</th>
                  <th style={S.th}>Status</th>
                  <th style={S.th}>Adjust</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(item => {
                  const ratio = item.minStock > 0 ? item.stockLevel / (item.minStock * 2) : 1;
                  const barColor = getStockBarColor(item.minStock > 0 ? item.stockLevel / item.minStock : 1);
                  const isExpiringSoon = new Date(item.expiryDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                  const isLow = item.status === 'Low Stock' || item.status === 'Out of Stock';
                  return (
                    <tr key={item.id} style={isLow ? { background: '#fffbeb', borderLeft: '3px solid var(--color-warning)' } : undefined}>
                      <td style={S.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 600 }}>{item.name}</span>
                          {item.isControlled && (
                            <Shield size={14} style={{ color: 'var(--color-purple-dark)' }} />
                          )}
                        </div>
                      </td>
                      <td style={S.td}>{item.genericName}</td>
                      <td style={S.td}>{item.category}</td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ ...S.progressBar, width: 60, flexShrink: 0 }}>
                            <div style={{ width: `${Math.min(100, ratio * 100)}%`, height: '100%', background: barColor, borderRadius: 4 }} />
                          </div>
                          <span style={{ fontWeight: 600, color: isLow ? 'var(--color-error)' : 'var(--color-text)' }}>{item.stockLevel}</span>
                        </div>
                      </td>
                      <td style={S.td}>{item.minStock}</td>
                      <td style={S.td}>₱{item.unitPrice.toLocaleString()}</td>
                      <td style={S.td}>
                        <span style={isExpiringSoon ? { color: 'var(--color-error)', fontWeight: 600 } : {}}>
                          {item.expiryDate}
                        </span>
                      </td>
                      <td style={S.td}><StatusBadge variant={STATUS_VARIANT[item.status] ?? 'muted'}>{item.status}</StatusBadge></td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button
                            style={S.btnIcon}
                            onClick={() => handleStockChange(item.id, -1)}
                            disabled={item.stockLevel <= 0}
                            title="Decrease stock by 1"
                          >
                            <Minus size={14} />
                          </button>
                          <button
                            style={{ ...S.btnIcon, background: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' }}
                            onClick={() => handleStockChange(item.id, 1)}
                            title="Increase stock by 1"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            style={{ ...S.btn, ...S.btnOutline, padding: '4px 10px', fontSize: 12 }}
                            onClick={() => handleStockChange(item.id, 10)}
                            title="Add 10 units"
                          >
                            +10
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
