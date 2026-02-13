import { useState, useMemo } from 'react';
import {
  Syringe,
  Calendar,
  ClipboardList,
  BarChart3,
  Search,
  Send,
  ChevronRight,
  Users,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useProvider } from '../../provider/context/ProviderContext';
import { useToast } from '../../context/ToastContext';
import type { ImmunizationRecord } from '../../provider/types';

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
  searchRow: { display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  searchInput: {
    flex: 1,
    minWidth: 140,
    padding: '10px 14px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border)',
    fontSize: 14,
    background: 'var(--color-surface)',
  },
  chipRow: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 },
  chip: {
    padding: '6px 12px',
    borderRadius: 20,
    border: '1px solid var(--color-border)',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    background: 'var(--color-surface)',
    color: 'var(--color-text-muted)',
  },
  chipActive: { background: 'var(--color-primary-transparent)', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 8px', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 11 },
  td: { padding: '10px 8px', borderTop: '1px solid var(--color-border)', color: 'var(--color-text)' },
  badge: { fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6 },
  scheduleItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 14,
    background: 'var(--color-background)',
    borderRadius: 8,
    marginBottom: 8,
    border: '1px solid var(--color-border)',
  },
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
  btnPrimary: { background: 'var(--color-primary)', color: 'white' },
  btnSecondary: { background: 'var(--color-background)', color: 'var(--color-text)', border: '1px solid var(--color-border)' },
  formRow: { marginBottom: 12 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border)',
    fontSize: 14,
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border)',
    fontSize: 14,
    background: 'var(--color-surface)',
  },
  calendarMock: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 4,
    marginBottom: 16,
    fontSize: 11,
  },
  barChart: { display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 16, minHeight: 120 },
  barItem: { flex: 1, textAlign: 'center' },
  bar: { height: 60, borderRadius: '4px 4px 0 0', minHeight: 4 },
  empty: { textAlign: 'center', padding: 32, color: 'var(--color-text-muted)', fontSize: 14 },
};

const VACCINE_OPTIONS = ['COVID-19 Booster', 'Influenza 2026', 'Pneumococcal PCV13', 'Hepatitis B', 'MMR', 'Tdap'];
const SITE_OPTIONS = ['Left Deltoid', 'Right Deltoid', 'Left Thigh', 'Right Thigh'];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Completed: { bg: 'var(--color-success-light)', color: 'var(--color-success)' },
  Due: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' },
  Overdue: { bg: 'var(--color-error-light)', color: 'var(--color-error)' },
  Scheduled: { bg: 'var(--color-info-light)', color: 'var(--color-info)' },
};

type TabId = 'records' | 'schedule' | 'administer' | 'reports';

export const ImmunizationManagement = () => {
  const { currentStaff, immunizationRecords } = useProvider();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>('records');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [localAdministered, setLocalAdministered] = useState<ImmunizationRecord[]>([]);

  // Administer form state
  const [formPatient, setFormPatient] = useState('');
  const [formVaccine, setFormVaccine] = useState(VACCINE_OPTIONS[0]);
  const [formDose, setFormDose] = useState('');
  const [formBatch, setFormBatch] = useState('');
  const [formSite, setFormSite] = useState(SITE_OPTIONS[0]);
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));

  const allRecords = useMemo(() => {
    const fromContext = immunizationRecords ?? [];
    return [...localAdministered, ...fromContext];
  }, [immunizationRecords, localAdministered]);

  const stats = useMemo(() => {
    const total = allRecords.length;
    const dueOverdue = allRecords.filter((r) => r.status === 'Due' || r.status === 'Overdue').length;
    const administeredThisMonth = allRecords.filter((r) => {
      if (r.status !== 'Completed' || !r.administeredDate) return false;
      const d = new Date(r.administeredDate);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return { total, dueOverdue, administeredThisMonth, coverageRate: '94%' };
  }, [allRecords]);

  const filteredRecords = useMemo(() => {
    let list = allRecords;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.patientName.toLowerCase().includes(q) || r.vaccine.toLowerCase().includes(q)
      );
    }
    if (statusFilter) list = list.filter((r) => r.status === statusFilter);
    return list;
  }, [allRecords, search, statusFilter]);

  const upcomingImmunizations = useMemo(
    () =>
      allRecords
        .filter((r) => r.status === 'Due' || r.status === 'Scheduled')
        .sort((a, b) => {
          const da = a.nextDueDate ? new Date(a.nextDueDate).getTime() : 0;
          const db = b.nextDueDate ? new Date(b.nextDueDate).getTime() : 0;
          return da - db;
        }),
    [allRecords]
  );

  const recentAdministrations = useMemo(
    () =>
      [...allRecords]
        .filter((r) => r.status === 'Completed' && r.administeredDate)
        .sort((a, b) => new Date(b.administeredDate).getTime() - new Date(a.administeredDate).getTime())
        .slice(0, 5),
    [allRecords]
  );

  const handleRecordAdminister = () => {
    if (!formPatient.trim() || !formVaccine || !formDose.trim()) return;
    const newRecord: ImmunizationRecord = {
      id: `imm-local-${Date.now()}`,
      patientId: `p-${Date.now()}`,
      patientName: formPatient.trim(),
      vaccine: formVaccine,
      dose: formDose.trim(),
      administeredDate: formDate,
      administeredBy: currentStaff?.name ?? 'Unknown',
      batchNumber: formBatch.trim(),
      site: formSite,
      status: 'Completed',
      nextDueDate: undefined,
    };
    setLocalAdministered((prev) => [newRecord, ...prev]);
    setFormPatient('');
    setFormDose('');
    setFormBatch('');
  };

  const statuses = ['Completed', 'Due', 'Overdue', 'Scheduled'];

  const mockCoverage = [
    { vaccine: 'Flu', pct: 92 },
    { vaccine: 'COVID-19', pct: 88 },
    { vaccine: 'MMR', pct: 96 },
    { vaccine: 'Hep B', pct: 85 },
    { vaccine: 'PCV13', pct: 78 },
  ];

  const mockMonthly = [12, 18, 15, 22, 19, 24];

  const overduePatients = useMemo(
    () => allRecords.filter((r) => r.status === 'Overdue'),
    [allRecords]
  );

  const getDaysUntil = (dateStr?: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)} days overdue`;
    if (diff === 0) return 'Due today';
    return `${diff} days`;
  };

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'records', label: 'Records', icon: ClipboardList },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'administer', label: 'Administer', icon: Syringe },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Immunization Management</h1>
        <p style={styles.sub}>Track and administer vaccines</p>
      </header>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}>Total Records</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: 'var(--color-warning)' }}>{stats.dueOverdue}</div>
          <div style={styles.statLabel}>Due / Overdue</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: 'var(--color-primary)' }}>{stats.administeredThisMonth}</div>
          <div style={styles.statLabel}>Administered This Month</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: 'var(--color-success)' }}>{stats.coverageRate}</div>
          <div style={styles.statLabel}>Coverage Rate</div>
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

      {/* Records Tab */}
      {activeTab === 'records' && (
        <div style={styles.card}>
          <div style={styles.searchRow}>
            <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search by patient or vaccine..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...styles.searchInput, paddingLeft: 36 }}
              />
            </div>
          </div>
          <div style={styles.chipRow}>
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? null : s)}
                style={{
                  ...styles.chip,
                  ...(statusFilter === s ? styles.chipActive : {}),
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Patient</th>
                  <th style={styles.th}>Vaccine</th>
                  <th style={styles.th}>Dose</th>
                  <th style={styles.th}>Date Administered</th>
                  <th style={styles.th}>Administered By</th>
                  <th style={styles.th}>Site</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Next Due</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ ...styles.td, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No records found
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => {
                    const sc = STATUS_COLORS[r.status] ?? { bg: 'var(--color-background)', color: 'var(--color-text-muted)' };
                    return (
                      <tr key={r.id}>
                        <td style={styles.td}>{r.patientName}</td>
                        <td style={styles.td}>{r.vaccine}</td>
                        <td style={styles.td}>{r.dose}</td>
                        <td style={styles.td}>{r.administeredDate || '—'}</td>
                        <td style={styles.td}>{r.administeredBy || '—'}</td>
                        <td style={styles.td}>{r.site || '—'}</td>
                        <td style={styles.td}>
                          <span style={{ ...styles.badge, ...sc }}>{r.status}</span>
                        </td>
                        <td style={styles.td}>{r.nextDueDate ?? '—'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <>
          <div style={styles.card}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--color-text)' }}>Upcoming Immunizations</div>
            <div style={styles.calendarMock}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>{d}</div>
              ))}
              {Array.from({ length: 35 }, (_, i) => (
                <div
                  key={i}
                  style={{
                    padding: 6,
                    borderRadius: 6,
                    background: i === 12 || i === 15 || i === 18 ? 'var(--color-primary-transparent)' : 'transparent',
                    color: [12, 15, 18].includes(i) ? 'var(--color-primary)' : 'var(--color-text)',
                  }}
                >
                  {i < 7 ? (i + 1) : i - 6}
                </div>
              ))}
            </div>
          </div>
          <div style={styles.card}>
            {upcomingImmunizations.length === 0 ? (
              <div style={styles.empty}>
                <Calendar size={40} style={{ marginBottom: 8, opacity: 0.5 }} />
                <p>No upcoming immunizations</p>
              </div>
            ) : (
              upcomingImmunizations.map((r) => (
                <div key={r.id} style={styles.scheduleItem}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{r.patientName}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {r.vaccine} · Due {r.nextDueDate ?? 'TBD'} · {getDaysUntil(r.nextDueDate)}
                    </div>
                  </div>
                  <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={() => showToast('Reminder sent to patient', 'success')}>
                    <Send size={14} /> Send Reminder
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Administer Tab */}
      {activeTab === 'administer' && (
        <>
          <div style={styles.card}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--color-text)' }}>Record Administration</div>
            <div style={styles.formRow}>
              <label style={styles.label}>Patient</label>
              <input
                type="text"
                value={formPatient}
                onChange={(e) => setFormPatient(e.target.value)}
                placeholder="Patient name"
                style={styles.input}
              />
            </div>
            <div style={styles.formRow}>
              <label style={styles.label}>Vaccine</label>
              <select value={formVaccine} onChange={(e) => setFormVaccine(e.target.value)} style={styles.select}>
                {VACCINE_OPTIONS.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div style={styles.formRow}>
              <label style={styles.label}>Dose</label>
              <input
                type="text"
                value={formDose}
                onChange={(e) => setFormDose(e.target.value)}
                placeholder="e.g. 1 dose, 2 of 3"
                style={styles.input}
              />
            </div>
            <div style={styles.formRow}>
              <label style={styles.label}>Batch Number</label>
              <input
                type="text"
                value={formBatch}
                onChange={(e) => setFormBatch(e.target.value)}
                placeholder="Batch number"
                style={styles.input}
              />
            </div>
            <div style={styles.formRow}>
              <label style={styles.label}>Site</label>
              <select value={formSite} onChange={(e) => setFormSite(e.target.value)} style={styles.select}>
                {SITE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div style={styles.formRow}>
              <label style={styles.label}>Date</label>
              <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} style={styles.input} />
            </div>
            <div style={styles.formRow}>
              <label style={styles.label}>Administered By</label>
              <input
                type="text"
                value={currentStaff?.name ?? ''}
                readOnly
                style={{ ...styles.input, background: 'var(--color-background)', color: 'var(--color-text-muted)' }}
              />
            </div>
            <button style={{ ...styles.btn, ...styles.btnPrimary, width: '100%', justifyContent: 'center' }} onClick={handleRecordAdminister}>
              <CheckCircle2 size={18} /> Record Administration
            </button>
          </div>
          <div style={styles.card}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--color-text)' }}>Recent Administrations</div>
            {recentAdministrations.length === 0 ? (
              <div style={styles.empty}>No recent administrations</div>
            ) : (
              recentAdministrations.map((r) => (
                <div key={r.id} style={{ padding: '10px 0', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{r.patientName}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{r.vaccine} · {r.administeredDate}</div>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <>
          <div style={styles.card}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--color-text)' }}>Coverage by Vaccine Type</div>
            <div style={styles.barChart}>
              {mockCoverage.map((v) => (
                <div key={v.vaccine} style={styles.barItem}>
                  <div
                    style={{
                      ...styles.bar,
                      height: `${v.pct}%`,
                      background: 'var(--color-primary)',
                    }}
                  />
                  <div style={{ fontSize: 11, marginTop: 6, color: 'var(--color-text-muted)' }}>{v.vaccine}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text)' }}>{v.pct}%</div>
                </div>
              ))}
            </div>
          </div>
          <div style={styles.card}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--color-text)' }}>Monthly Administration Count</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              {mockMonthly.map((n, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div
                    style={{
                      height: n * 4,
                      minHeight: 20,
                      background: 'var(--color-info-light)',
                      borderRadius: '4px 4px 0 0',
                      marginBottom: 6,
                    }}
                  />
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>M{i + 1}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={styles.card}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={18} style={{ color: 'var(--color-error)' }} /> Overdue Patients
            </div>
            {overduePatients.length === 0 ? (
              <div style={styles.empty}>No overdue patients</div>
            ) : (
              overduePatients.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    background: 'var(--color-error-light)',
                    borderRadius: 8,
                    marginBottom: 8,
                    border: '1px solid rgba(239,68,68,0.2)',
                  }}
                >
                  <Users size={16} style={{ color: 'var(--color-error)' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.patientName}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{r.vaccine} · Due {r.nextDueDate ?? 'TBD'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
