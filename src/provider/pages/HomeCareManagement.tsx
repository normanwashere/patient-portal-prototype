import React, { useState, useMemo } from 'react';
import {
  Home,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MapPin,
  Phone,
  User,
  ChevronDown,
  ChevronUp,
  FileText,
  Droplet,
  FlaskConical,
  TestTube,
  XCircle,
  ClipboardList,
  Upload,
  Send,
  Loader2,
  Building2,
  Filter,
} from 'lucide-react';
import { useProvider } from '../context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';
import { useToast } from '../../context/ToastContext';
import type { HomeCareRequest, HomeCareRequestStatus } from '../types';

/* ── Status config ── */
const STATUS_CONFIG: Record<HomeCareRequestStatus, { bg: string; color: string; icon: React.FC<{ size?: number }> }> = {
  'Pending Review':        { bg: '#fef3c7', color: '#92400e', icon: Clock },
  'Confirmed':             { bg: '#dbeafe', color: '#1e40af', icon: CheckCircle2 },
  'Scheduled':             { bg: '#e0e7ff', color: '#3730a3', icon: Calendar },
  'In Progress':           { bg: '#fce7f3', color: '#9d174d', icon: Loader2 },
  'Completed':             { bg: '#dcfce7', color: '#166534', icon: CheckCircle2 },
  'Cancelled':             { bg: '#f3f4f6', color: '#6b7280', icon: XCircle },
  'Clarification Needed':  { bg: '#fef9c3', color: '#854d0e', icon: AlertCircle },
};

const ALL_STATUSES: HomeCareRequestStatus[] = [
  'Pending Review', 'Confirmed', 'Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Clarification Needed',
];

const specimenIcon = (type: string) => {
  switch (type) {
    case 'Blood': return <Droplet size={12} />;
    case 'Urine': return <FlaskConical size={12} />;
    case 'Stool': return <TestTube size={12} />;
    default: return <TestTube size={12} />;
  }
};

/* ── Styles ── */
const s: Record<string, React.CSSProperties> = {
  page: { padding: 24, background: 'var(--color-background)', minHeight: '100%' },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 },
  subtitle: { fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 24 },

  /* Stats row */
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 12, marginBottom: 24 },
  statCard: {
    background: 'var(--color-surface)', borderRadius: 12, padding: '16px 18px',
    border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' as const, gap: 4,
  },
  statLabel: { fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 },
  statValue: { fontSize: 28, fontWeight: 800, color: 'var(--color-text)' },

  /* Toolbar */
  toolbar: { display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' as const, alignItems: 'center' },
  searchBox: {
    flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 8,
    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
    borderRadius: 10, padding: '8px 12px',
  },
  searchInput: { flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: 'var(--color-text)' },
  filterBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-surface)',
    cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--color-text)',
  },
  filterMenu: {
    display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginBottom: 16,
  },
  filterChip: {
    padding: '5px 12px', borderRadius: 20, border: '1px solid var(--color-border)',
    background: 'var(--color-surface)', cursor: 'pointer', fontSize: 12, fontWeight: 600,
    color: 'var(--color-text-muted)', transition: 'all 0.2s',
  },
  filterChipActive: {
    background: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)',
  },

  /* Request cards */
  cardList: { display: 'flex', flexDirection: 'column' as const, gap: 12 },
  card: {
    background: 'var(--color-surface)', borderRadius: 14, padding: 20,
    border: '1px solid var(--color-border)', transition: 'all 0.2s',
    cursor: 'pointer',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  patientName: { fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 2 },
  cardMeta: { fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 },
  statusBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 },
  priorityBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px',
    borderRadius: 12, fontSize: 10, fontWeight: 700,
  },

  /* Expanded details */
  details: {
    marginTop: 12, padding: '14px 16px', background: 'var(--color-background)',
    borderRadius: 10, display: 'flex', flexDirection: 'column' as const, gap: 10,
  },
  detailRow: { display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13 },
  detailLabel: { fontWeight: 600, color: 'var(--color-text)', minWidth: 110, flexShrink: 0 },
  detailValue: { color: 'var(--color-text-muted)', lineHeight: 1.5 },
  specimenChip: {
    display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600,
    padding: '2px 8px', borderRadius: 12, marginRight: 4,
  },

  /* Actions */
  actionRow: {
    display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' as const,
  },
  actionBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
    borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s',
  },
  confirmBtn: { background: '#2563eb', color: 'white' },
  scheduleBtn: { background: '#7c3aed', color: 'white' },
  clarifyBtn: { background: '#f59e0b', color: 'white' },
  completeBtn: { background: '#10b981', color: 'white' },
  cancelBtn: { background: '#ef4444', color: 'white' },
  secondaryBtn: { background: 'var(--color-background)', color: 'var(--color-text)', border: '1px solid var(--color-border)' },

  /* Confirm/schedule form inline */
  inlineForm: {
    marginTop: 10, padding: 14, borderRadius: 10,
    background: 'var(--color-bg-tint-soft, #f0f7ff)', border: '1px solid var(--color-border)',
    display: 'flex', flexDirection: 'column' as const, gap: 10,
  },
  formRow: { display: 'flex', gap: 10, flexWrap: 'wrap' as const, alignItems: 'center' },
  formInput: {
    flex: '1 1 160px', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)',
    fontSize: 13, outline: 'none', background: 'white',
  },
  formTextarea: {
    width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)',
    fontSize: 13, outline: 'none', background: 'white', resize: 'vertical' as const, minHeight: 60,
  },

  /* Empty state */
  empty: {
    textAlign: 'center' as const, padding: 60, color: 'var(--color-text-muted)',
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 12,
  },

  /* Branch pill */
  branchPill: {
    display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600,
    padding: '4px 12px', borderRadius: 20, background: 'var(--color-bg-tint, rgba(0,70,190,0.08))',
    color: 'var(--color-primary)',
  },

  /* Request titles list */
  requestList: { display: 'flex', flexDirection: 'column' as const, gap: 2, margin: 0, padding: 0, listStyle: 'none' },
  requestItem: { fontSize: 13, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 4 },
};

export const HomeCareManagement: React.FC = () => {
  const { homeCareRequests, updateHomeCareStatus, currentStaff, currentBranchId } = useProvider();
  const { tenant } = useTheme();
  const { showToast } = useToast();

  const isSuperAdmin = currentStaff.role === 'super_admin';

  /* ── Filters ── */
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<HomeCareRequestStatus | 'All'>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* ── Inline action forms ── */
  const [actionForm, setActionForm] = useState<{ id: string; type: 'confirm' | 'schedule' | 'clarify' | 'notes' } | null>(null);
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formCollector, setFormCollector] = useState('');
  const [formNotes, setFormNotes] = useState('');

  /* ── Filter requests by branch (super admin sees all, others see own branch) ── */
  const branchFiltered = useMemo(() => {
    if (isSuperAdmin) return homeCareRequests;
    return homeCareRequests.filter(r => r.branchId === currentBranchId);
  }, [homeCareRequests, currentBranchId, isSuperAdmin]);

  const filtered = useMemo(() => {
    let list = branchFiltered;
    if (statusFilter !== 'All') list = list.filter(r => r.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.patientName.toLowerCase().includes(q) ||
        r.requestTitles.some(t => t.toLowerCase().includes(q)) ||
        r.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [branchFiltered, statusFilter, search]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const pending = branchFiltered.filter(r => r.status === 'Pending Review').length;
    const confirmed = branchFiltered.filter(r => r.status === 'Confirmed').length;
    const scheduled = branchFiltered.filter(r => r.status === 'Scheduled').length;
    const inProgress = branchFiltered.filter(r => r.status === 'In Progress').length;
    const completed = branchFiltered.filter(r => r.status === 'Completed').length;
    const needsClarification = branchFiltered.filter(r => r.status === 'Clarification Needed').length;
    return { pending, confirmed, scheduled, inProgress, completed, needsClarification, total: branchFiltered.length };
  }, [branchFiltered]);

  /* ── Action handlers ── */
  const handleConfirm = (req: HomeCareRequest) => {
    if (!formDate || !formTime) { showToast('Please fill date and time', 'info'); return; }
    updateHomeCareStatus(req.id, 'Confirmed', {
      confirmedDate: formDate,
      confirmedTime: formTime,
      assignedCollector: formCollector || undefined,
      notes: formNotes || req.notes,
    });
    showToast(`Request ${req.id} confirmed for ${formDate} at ${formTime}`, 'success');
    resetForm();
  };

  const handleSchedule = (req: HomeCareRequest) => {
    if (!formCollector) { showToast('Please assign a collector', 'info'); return; }
    updateHomeCareStatus(req.id, 'Scheduled', {
      assignedCollector: formCollector,
      notes: formNotes || req.notes,
    });
    showToast(`Request ${req.id} scheduled — collector assigned`, 'success');
    resetForm();
  };

  const handleClarify = (req: HomeCareRequest) => {
    if (!formNotes) { showToast('Please add a note for the patient', 'info'); return; }
    updateHomeCareStatus(req.id, 'Clarification Needed', { notes: formNotes });
    showToast(`Request ${req.id} marked — clarification needed`, 'info');
    resetForm();
  };

  const handleStartCollection = (id: string) => {
    updateHomeCareStatus(id, 'In Progress');
    showToast('Collection started', 'success');
  };

  const handleComplete = (id: string) => {
    updateHomeCareStatus(id, 'Completed');
    showToast('HomeCare request completed!', 'success');
  };

  const handleCancel = (id: string) => {
    updateHomeCareStatus(id, 'Cancelled', { notes: formNotes || 'Cancelled by admin' });
    showToast('Request cancelled', 'info');
    resetForm();
  };

  const resetForm = () => {
    setActionForm(null);
    setFormDate('');
    setFormTime('');
    setFormCollector('');
    setFormNotes('');
  };

  const openActionForm = (id: string, type: 'confirm' | 'schedule' | 'clarify' | 'notes') => {
    setActionForm({ id, type });
    setFormDate('');
    setFormTime('');
    setFormCollector('');
    setFormNotes('');
  };

  /* ── Render card ── */
  const renderCard = (req: HomeCareRequest) => {
    const isExpanded = expandedId === req.id;
    const statusCfg = STATUS_CONFIG[req.status];
    const StatusIcon = statusCfg.icon;
    const isActionOpen = actionForm?.id === req.id;

    return (
      <div
        key={req.id}
        style={{ ...s.card, ...(isExpanded ? { borderColor: 'var(--color-primary)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' } : {}) }}
        onClick={() => setExpandedId(isExpanded ? null : req.id)}
      >
        {/* Header */}
        <div style={s.cardHeader}>
          <div>
            <div style={s.patientName}>{req.patientName}</div>
            <div style={s.cardMeta}>
              <span>{req.id}</span>
              <span>•</span>
              <span>{req.submittedAt}</span>
              {isSuperAdmin && (
                <>
                  <span>•</span>
                  <span style={s.branchPill}><Building2 size={11} /> {req.branchName}</span>
                </>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              ...s.priorityBadge,
              background: req.priority === 'Urgent' ? '#fef2f2' : '#f3f4f6',
              color: req.priority === 'Urgent' ? '#dc2626' : '#6b7280',
            }}>
              {req.priority}
            </span>
            <span style={{ ...s.statusBadge, background: statusCfg.bg, color: statusCfg.color }}>
              <StatusIcon size={12} /> {req.status}
            </span>
            {isExpanded ? <ChevronUp size={16} color="var(--color-text-muted)" /> : <ChevronDown size={16} color="var(--color-text-muted)" />}
          </div>
        </div>

        {/* Summary line */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', fontSize: 13, color: 'var(--color-text-muted)' }}>
          {req.requestTitles.slice(0, 2).map((t, i) => <span key={i}>{t}</span>)}
          {req.requestTitles.length > 2 && <span>+{req.requestTitles.length - 2} more</span>}
          <span>•</span>
          {req.specimenTypes.map(sp => (
            <span key={sp} style={{
              ...s.specimenChip,
              background: sp === 'Blood' ? 'rgba(220,38,38,0.08)' : sp === 'Urine' ? 'rgba(234,179,8,0.1)' : 'rgba(107,114,128,0.08)',
              color: sp === 'Blood' ? '#b91c1c' : sp === 'Urine' ? '#a16207' : '#4b5563',
            }}>
              {specimenIcon(sp)} {sp}
            </span>
          ))}
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <div style={s.details} onClick={e => e.stopPropagation()}>
            <div style={s.detailRow}>
              <span style={s.detailLabel}><User size={13} /> Patient</span>
              <span style={s.detailValue}>{req.patientName} ({req.patientId})</span>
            </div>
            <div style={s.detailRow}>
              <span style={s.detailLabel}><Phone size={13} /> Mobile</span>
              <span style={s.detailValue}>{req.mobile}</span>
            </div>
            <div style={s.detailRow}>
              <span style={s.detailLabel}><MapPin size={13} /> Address</span>
              <span style={s.detailValue}>{req.addressType === 'home' ? '🏠' : '🏢'} {req.address}</span>
            </div>
            <div style={s.detailRow}>
              <span style={s.detailLabel}><ClipboardList size={13} /> Requests</span>
              <div>
                <ul style={s.requestList}>
                  {req.requestTitles.map((t, i) => <li key={i} style={s.requestItem}>• {t}</li>)}
                </ul>
              </div>
            </div>
            <div style={s.detailRow}>
              <span style={s.detailLabel}><Droplet size={13} /> Specimens</span>
              <span style={s.detailValue}>
                {req.specimenTypes.map(sp => (
                  <span key={sp} style={{
                    ...s.specimenChip,
                    background: sp === 'Blood' ? 'rgba(220,38,38,0.08)' : sp === 'Urine' ? 'rgba(234,179,8,0.1)' : 'rgba(107,114,128,0.08)',
                    color: sp === 'Blood' ? '#b91c1c' : sp === 'Urine' ? '#a16207' : '#4b5563',
                  }}>
                    {specimenIcon(sp)} {sp}
                  </span>
                ))}
              </span>
            </div>
            <div style={s.detailRow}>
              <span style={s.detailLabel}><FileText size={13} /> Source</span>
              <span style={s.detailValue}>
                {req.referralSource === 'network'
                  ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><ClipboardList size={12} /> In-network — {req.orderingDoctor}</span>
                  : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Upload size={12} /> External — {req.referralFile || 'No file'}</span>}
              </span>
            </div>
            <div style={s.detailRow}>
              <span style={s.detailLabel}><Calendar size={13} /> Preferred</span>
              <span style={s.detailValue}>
                1) {req.preferredDate1} at {req.preferredTime1}<br />
                2) {req.preferredDate2} at {req.preferredTime2}
              </span>
            </div>
            {req.confirmedDate && (
              <div style={s.detailRow}>
                <span style={s.detailLabel}><CheckCircle2 size={13} /> Confirmed</span>
                <span style={{ ...s.detailValue, fontWeight: 700, color: '#166534' }}>{req.confirmedDate} at {req.confirmedTime}</span>
              </div>
            )}
            {req.assignedCollector && (
              <div style={s.detailRow}>
                <span style={s.detailLabel}><User size={13} /> Collector</span>
                <span style={s.detailValue}>{req.assignedCollector}</span>
              </div>
            )}
            {req.notes && (
              <div style={s.detailRow}>
                <span style={s.detailLabel}><AlertCircle size={13} /> Notes</span>
                <span style={s.detailValue}>{req.notes}</span>
              </div>
            )}

            {/* ── Action Buttons ── */}
            <div style={s.actionRow}>
              {req.status === 'Pending Review' && (
                <>
                  <button style={{ ...s.actionBtn, ...s.confirmBtn }} onClick={() => openActionForm(req.id, 'confirm')}>
                    <CheckCircle2 size={14} /> Confirm & Schedule
                  </button>
                  <button style={{ ...s.actionBtn, ...s.clarifyBtn }} onClick={() => openActionForm(req.id, 'clarify')}>
                    <AlertCircle size={14} /> Request Clarification
                  </button>
                  <button style={{ ...s.actionBtn, ...s.cancelBtn }} onClick={() => handleCancel(req.id)}>
                    <XCircle size={14} /> Cancel
                  </button>
                </>
              )}
              {req.status === 'Confirmed' && (
                <>
                  <button style={{ ...s.actionBtn, ...s.scheduleBtn }} onClick={() => openActionForm(req.id, 'schedule')}>
                    <Calendar size={14} /> Assign Collector
                  </button>
                  <button style={{ ...s.actionBtn, ...s.cancelBtn }} onClick={() => handleCancel(req.id)}>
                    <XCircle size={14} /> Cancel
                  </button>
                </>
              )}
              {req.status === 'Scheduled' && (
                <>
                  <button style={{ ...s.actionBtn, ...s.confirmBtn }} onClick={() => handleStartCollection(req.id)}>
                    <Loader2 size={14} /> Start Collection
                  </button>
                </>
              )}
              {req.status === 'In Progress' && (
                <>
                  <button style={{ ...s.actionBtn, ...s.completeBtn }} onClick={() => handleComplete(req.id)}>
                    <CheckCircle2 size={14} /> Mark Completed
                  </button>
                </>
              )}
              {req.status === 'Clarification Needed' && (
                <>
                  <button style={{ ...s.actionBtn, ...s.confirmBtn }} onClick={() => openActionForm(req.id, 'confirm')}>
                    <CheckCircle2 size={14} /> Confirm & Schedule
                  </button>
                  <button style={{ ...s.actionBtn, ...s.cancelBtn }} onClick={() => handleCancel(req.id)}>
                    <XCircle size={14} /> Cancel
                  </button>
                </>
              )}
              {(req.status === 'Completed' || req.status === 'Cancelled') && (
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No actions available</span>
              )}
            </div>

            {/* ── Inline Action Forms ── */}
            {isActionOpen && actionForm?.type === 'confirm' && (
              <div style={s.inlineForm}>
                <strong style={{ fontSize: 13 }}>Confirm Schedule</strong>
                <div style={s.formRow}>
                  <input type="text" placeholder="Date (e.g. Feb 18, 2026)" value={formDate} onChange={e => setFormDate(e.target.value)} style={s.formInput} />
                  <input type="text" placeholder="Time (e.g. 08:00 AM)" value={formTime} onChange={e => setFormTime(e.target.value)} style={s.formInput} />
                </div>
                <input type="text" placeholder="Assigned collector (optional)" value={formCollector} onChange={e => setFormCollector(e.target.value)} style={s.formInput} />
                <textarea placeholder="Notes (optional)" value={formNotes} onChange={e => setFormNotes(e.target.value)} style={s.formTextarea} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ ...s.actionBtn, ...s.confirmBtn }} onClick={() => handleConfirm(req)}>
                    <Send size={13} /> Confirm
                  </button>
                  <button style={{ ...s.actionBtn, ...s.secondaryBtn }} onClick={resetForm}>Cancel</button>
                </div>
              </div>
            )}
            {isActionOpen && actionForm?.type === 'schedule' && (
              <div style={s.inlineForm}>
                <strong style={{ fontSize: 13 }}>Assign Collector</strong>
                <input type="text" placeholder="Collector name (e.g. Med Tech Rosa Garcia)" value={formCollector} onChange={e => setFormCollector(e.target.value)} style={s.formInput} />
                <textarea placeholder="Notes (optional)" value={formNotes} onChange={e => setFormNotes(e.target.value)} style={s.formTextarea} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ ...s.actionBtn, ...s.scheduleBtn }} onClick={() => handleSchedule(req)}>
                    <Send size={13} /> Assign & Schedule
                  </button>
                  <button style={{ ...s.actionBtn, ...s.secondaryBtn }} onClick={resetForm}>Cancel</button>
                </div>
              </div>
            )}
            {isActionOpen && actionForm?.type === 'clarify' && (
              <div style={s.inlineForm}>
                <strong style={{ fontSize: 13 }}>Request Clarification</strong>
                <textarea placeholder="Describe what needs clarification (e.g. referral blurry, need to confirm tests)" value={formNotes} onChange={e => setFormNotes(e.target.value)} style={s.formTextarea} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ ...s.actionBtn, ...s.clarifyBtn }} onClick={() => handleClarify(req)}>
                    <Send size={13} /> Send Clarification
                  </button>
                  <button style={{ ...s.actionBtn, ...s.secondaryBtn }} onClick={resetForm}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={s.page}>
      <div style={s.title}>
        <Home size={24} /> HomeCare Management
      </div>
      <p style={s.subtitle}>
        Monitor, review, and manage all HomeCare specimen collection requests{isSuperAdmin ? ' across all branches' : ` — ${tenant.name}`}.
      </p>

      {/* Stats */}
      <div style={s.statsRow}>
        <div style={s.statCard}>
          <span style={s.statLabel}>Total Requests</span>
          <span style={s.statValue}>{stats.total}</span>
        </div>
        <div style={{ ...s.statCard, borderLeft: '3px solid #f59e0b' }}>
          <span style={s.statLabel}>Pending Review</span>
          <span style={{ ...s.statValue, color: '#92400e' }}>{stats.pending}</span>
        </div>
        <div style={{ ...s.statCard, borderLeft: '3px solid #2563eb' }}>
          <span style={s.statLabel}>Confirmed</span>
          <span style={{ ...s.statValue, color: '#1e40af' }}>{stats.confirmed}</span>
        </div>
        <div style={{ ...s.statCard, borderLeft: '3px solid #7c3aed' }}>
          <span style={s.statLabel}>Scheduled</span>
          <span style={{ ...s.statValue, color: '#3730a3' }}>{stats.scheduled}</span>
        </div>
        <div style={{ ...s.statCard, borderLeft: '3px solid #10b981' }}>
          <span style={s.statLabel}>Completed</span>
          <span style={{ ...s.statValue, color: '#166534' }}>{stats.completed}</span>
        </div>
        {stats.needsClarification > 0 && (
          <div style={{ ...s.statCard, borderLeft: '3px solid #eab308' }}>
            <span style={s.statLabel}>Needs Clarification</span>
            <span style={{ ...s.statValue, color: '#854d0e' }}>{stats.needsClarification}</span>
          </div>
        )}
      </div>

      {/* Search & Filter toolbar */}
      <div style={s.toolbar}>
        <div style={s.searchBox}>
          <Search size={16} color="var(--color-text-muted)" />
          <input
            style={s.searchInput}
            placeholder="Search by patient, test, or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button style={s.filterBtn} onClick={() => setShowFilters(!showFilters)}>
          <Filter size={14} /> Filter
          {statusFilter !== 'All' && <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--color-primary)' }} />}
        </button>
      </div>

      {showFilters && (
        <div style={s.filterMenu}>
          {(['All', ...ALL_STATUSES] as const).map(st => (
            <button
              key={st}
              style={{
                ...s.filterChip,
                ...(statusFilter === st ? s.filterChipActive : {}),
              }}
              onClick={() => setStatusFilter(st as HomeCareRequestStatus | 'All')}
            >
              {st}
            </button>
          ))}
        </div>
      )}

      {/* Request Cards */}
      {filtered.length === 0 ? (
        <div style={s.empty}>
          <Home size={48} color="var(--color-border)" />
          <p>No HomeCare requests{statusFilter !== 'All' ? ` with status "${statusFilter}"` : ''}{search ? ` matching "${search}"` : ''}.</p>
        </div>
      ) : (
        <div style={s.cardList}>
          {filtered.map(renderCard)}
        </div>
      )}
    </div>
  );
};
