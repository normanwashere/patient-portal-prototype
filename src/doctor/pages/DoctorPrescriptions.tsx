import { useState, useCallback } from 'react';
import { DrugInfoModal } from '../../provider/pages/DrugMaster';
import {
  Pill,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FileText,
  ShieldAlert,
  Copy,
  Ban,
  Edit3,
  Save,
  X,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { useProvider } from '../../provider/context/ProviderContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../theme/ThemeContext';
import type { Prescription } from '../../provider/types';

/* ── tiny style helpers ── */
const pill = (bg: string, color: string, extra?: React.CSSProperties): React.CSSProperties => ({
  fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase',
  lineHeight: '16px', whiteSpace: 'nowrap', background: bg, color, ...extra,
});
const btn = (extra?: React.CSSProperties): React.CSSProperties => ({
  padding: '8px 14px', borderRadius: 8, border: '1px solid var(--color-border)',
  background: 'var(--color-surface)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 4, minHeight: 36, color: 'var(--color-text)',
  ...extra,
});

export const DoctorPrescriptions = () => {
  const {
    currentStaff, prescriptions, approvePrescription, denyPrescription, updatePrescription,
    addPrescription, cdssAlerts, dismissAlert, actionAlert,
  } = useProvider();
  const { showToast } = useToast();
  const { tenant } = useTheme();
  const hasCDSS = tenant.features.cdss ?? false;

  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [editingRx, setEditingRx] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Prescription>>({});
  const [alertActionPanel, setAlertActionPanel] = useState<string | null>(null); // alert id showing actions
  const [lookupDrug, setLookupDrug] = useState<string | null>(null);

  // Only show this doctor's prescriptions
  const myPrescriptions = prescriptions.filter((p) => p.doctorName === currentStaff?.name);

  const filtered = myPrescriptions.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return r.status === 'Pending Approval';
    if (filter === 'active') return r.status === 'Active';
    if (filter === 'completed') return r.status === 'Completed' || r.status === 'Cancelled';
    return true;
  });

  const pendingCount = myPrescriptions.filter((r) => r.status === 'Pending Approval').length;

  // Drug alerts
  const drugAlerts = hasCDSS
    ? cdssAlerts.filter(
        (a) => !a.dismissed && (a.type === 'drug_interaction' || a.type === 'drug_allergy' || a.type === 'dosage_range' || a.type === 'formulary')
      )
    : [];

  // Map alerts by prescriptionId → alerts[]  and patientId → alerts[]
  const alertsByPrescriptionId = new Map<string, typeof drugAlerts>();
  const alertsByPatientId = new Map<string, typeof drugAlerts>();
  drugAlerts.forEach((a) => {
    if (a.prescriptionId) {
      const existing = alertsByPrescriptionId.get(a.prescriptionId) ?? [];
      alertsByPrescriptionId.set(a.prescriptionId, [...existing, a]);
      const rx = prescriptions.find((p) => p.id === a.prescriptionId);
      if (rx) {
        const pExisting = alertsByPatientId.get(rx.patientId) ?? [];
        if (!pExisting.some((e) => e.id === a.id))
          alertsByPatientId.set(rx.patientId, [...pExisting, a]);
      }
    }
  });

  // Sort: pending → alerts → active → completed
  const statusPriority = (status: string, rxId: string): number => {
    if (status === 'Pending Approval') return 0;
    if (alertsByPrescriptionId.has(rxId)) return 1;
    if (status === 'Active') return 2;
    if (status === 'Completed') return 3;
    return 4;
  };
  const sorted = [...filtered].sort((a, b) => {
    const d = statusPriority(a.status, a.id) - statusPriority(b.status, b.id);
    return d !== 0 ? d : new Date(b.prescribedDate).getTime() - new Date(a.prescribedDate).getTime();
  });

  // Group by patient
  const patientGroups = new Map<string, { patientName: string; patientId: string; prescriptions: typeof sorted }>();
  sorted.forEach((rx) => {
    const g = patientGroups.get(rx.patientId) ?? { patientName: rx.patientName, patientId: rx.patientId, prescriptions: [] };
    g.prescriptions.push(rx);
    patientGroups.set(rx.patientId, g);
  });
  const sortedGroups = [...patientGroups.values()].sort((a, b) => {
    const aP = a.prescriptions.some((r) => r.status === 'Pending Approval');
    const bP = b.prescriptions.some((r) => r.status === 'Pending Approval');
    if (aP !== bP) return aP ? -1 : 1;
    const aA = a.prescriptions.some((r) => alertsByPrescriptionId.has(r.id));
    const bA = b.prescriptions.some((r) => alertsByPrescriptionId.has(r.id));
    if (aA !== bA) return aA ? -1 : 1;
    return a.patientName.localeCompare(b.patientName);
  });

  /* ── handlers ── */
  const handleApprove = (id: string) => { approvePrescription(id); showToast('Prescription approved', 'success'); };
  const handleDeny = (id: string) => { denyPrescription(id); showToast('Prescription denied', 'info'); };

  const toggleCard = useCallback((id: string) => {
    setExpandedCard((prev) => (prev === id ? null : id));
    setEditingRx(null);
    setEditDraft({});
  }, []);

  const startEdit = useCallback((rx: Prescription) => {
    setEditingRx(rx.id);
    setEditDraft({ medication: rx.medication, dosage: rx.dosage, frequency: rx.frequency, duration: rx.duration, notes: rx.notes ?? '' });
  }, []);

  const saveEdit = useCallback((rxId: string) => {
    updatePrescription(rxId, editDraft);
    setEditingRx(null);
    setEditDraft({});
    showToast('Prescription updated', 'success');
  }, [editDraft, updatePrescription, showToast]);

  const cancelEdit = useCallback(() => { setEditingRx(null); setEditDraft({}); }, []);

  // Alert resolution handlers
  const handleSwitchMedication = useCallback((alertId: string, prescriptionId: string | undefined) => {
    if (!prescriptionId) return;
    const rx = prescriptions.find((p) => p.id === prescriptionId);
    if (!rx) return;
    // Auto-expand and start edit on the affected Rx
    setExpandedCard(prescriptionId);
    startEdit(rx);
    actionAlert(alertId);
    showToast('Alert resolved — edit the medication below', 'info');
    setAlertActionPanel(null);
  }, [prescriptions, startEdit, actionAlert, showToast]);

  const handleAcknowledgeAlert = useCallback((alertId: string) => {
    actionAlert(alertId);
    showToast('Alert acknowledged and documented', 'success');
    setAlertActionPanel(null);
  }, [actionAlert, showToast]);

  const handleDismissAlert = useCallback((alertId: string) => {
    dismissAlert(alertId);
    showToast('Alert dismissed', 'info');
    setAlertActionPanel(null);
  }, [dismissAlert, showToast]);

  const handleDiscontinueFromAlert = useCallback((alertId: string, prescriptionId: string | undefined) => {
    if (!prescriptionId) return;
    updatePrescription(prescriptionId, { status: 'Cancelled' });
    actionAlert(alertId);
    showToast('Medication discontinued and alert resolved', 'success');
    setAlertActionPanel(null);
  }, [updatePrescription, actionAlert, showToast]);

  /* ── style helpers ── */
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Pending Approval': return { bg: 'rgba(59,130,246,0.08)', color: 'var(--color-info)', border: 'var(--color-info)' };
      case 'Active': return { bg: 'rgba(16,185,129,0.08)', color: 'var(--color-success)', border: 'var(--color-success)' };
      case 'Completed': return { bg: 'var(--color-background)', color: 'var(--color-text-muted)', border: 'var(--color-border)' };
      case 'Cancelled': return { bg: 'rgba(239,68,68,0.06)', color: 'var(--color-error)', border: 'var(--color-error)' };
      default: return { bg: 'var(--color-background)', color: 'var(--color-text-muted)', border: 'var(--color-border)' };
    }
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px 10px', borderRadius: 8, border: '1px solid var(--color-border)',
    background: 'var(--color-surface)', fontSize: 13, color: 'var(--color-text)', width: '100%',
    outline: 'none', fontFamily: 'inherit',
  };

  const alertCount = drugAlerts.length;

  /* ═══════════════════════════ RENDER ═══════════════════════════ */
  return (
    <div className="doc-page" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>Prescriptions</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
            {myPrescriptions.length} prescription{myPrescriptions.length !== 1 ? 's' : ''}
            {pendingCount > 0 && <> · <span style={{ color: 'var(--color-info)', fontWeight: 700 }}>{pendingCount} pending</span></>}
            {alertCount > 0 && <> · <span style={{ color: 'var(--color-error)', fontWeight: 700 }}>{alertCount} alert{alertCount !== 1 ? 's' : ''}</span></>}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch' }}>
        {(['all', 'pending', 'active', 'completed'] as const).map((f) => {
          const count = f === 'all' ? myPrescriptions.length : f === 'pending' ? pendingCount
            : myPrescriptions.filter((r) => f === 'active' ? r.status === 'Active' : (r.status === 'Completed' || r.status === 'Cancelled')).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', textTransform: 'capitalize', whiteSpace: 'nowrap',
                minHeight: 36, display: 'flex', alignItems: 'center', gap: 6,
                background: filter === f ? 'var(--color-primary)' : 'var(--color-surface)',
                color: filter === f ? '#fff' : 'var(--color-text-muted)',
                boxShadow: filter === f ? 'none' : 'var(--shadow-sm)',
                border: filter === f ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                transition: 'all 0.15s',
              }}
            >
              {f}
              {count > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 8,
                  background: filter === f ? 'rgba(255,255,255,0.25)' : 'var(--color-background)',
                  color: filter === f ? '#fff' : 'var(--color-text-muted)',
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Grouped prescription list */}
      {sorted.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 48, color: 'var(--color-text-muted)',
          background: 'var(--color-surface)', borderRadius: 14, boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-border)',
        }}>
          <Pill size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 15 }}>No prescriptions match filter</div>
          <div style={{ fontSize: 13, marginTop: 4, opacity: 0.7 }}>Try a different filter</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {sortedGroups.map((group) => {
            const patientAlerts = alertsByPatientId.get(group.patientId) ?? [];
            const hasPending = group.prescriptions.some((r) => r.status === 'Pending Approval');
            const hasAlerts = patientAlerts.length > 0;

            return (
              <div key={group.patientId} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {/* ─── Patient header ─── */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                  background: 'var(--color-surface)', borderRadius: '12px 12px 0 0',
                  border: '1px solid var(--color-border)', borderBottom: 'none',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--color-primary)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 12, fontWeight: 700,
                  }}>
                    {group.patientName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>{group.patientName}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      {group.prescriptions.length} medication{group.prescriptions.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {hasPending && <span style={pill('rgba(59,130,246,0.08)', 'var(--color-info)')}>NEEDS ACTION</span>}
                    {hasAlerts && (
                      <span style={pill('rgba(239,68,68,0.08)', 'var(--color-error)', { display: 'flex', alignItems: 'center', gap: 3 })}>
                        <AlertTriangle size={10} /> {patientAlerts.length}
                      </span>
                    )}
                  </div>
                </div>

                {/* ─── Drug safety alerts for this patient ─── */}
                {hasCDSS && patientAlerts.length > 0 && (
                  <div style={{
                    background: 'rgba(239,68,68,0.02)', borderLeft: '1px solid var(--color-border)',
                    borderRight: '1px solid var(--color-border)',
                  }}>
                    {patientAlerts.map((alert) => {
                      const isHigh = alert.severity === 'contraindicated' || alert.severity === 'major';
                      const showActions = alertActionPanel === alert.id;
                      const linkedRx = alert.prescriptionId ? prescriptions.find((p) => p.id === alert.prescriptionId) : null;

                      return (
                        <div key={alert.id} style={{
                          borderBottom: '1px solid var(--color-border)',
                          background: isHigh ? 'rgba(239,68,68,0.04)' : 'rgba(245,158,11,0.04)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px' }}>
                            <ShieldAlert size={14} style={{
                              color: isHigh ? 'var(--color-error)' : 'var(--color-warning)',
                              flexShrink: 0, marginTop: 1,
                            }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: isHigh ? 'var(--color-error)' : 'var(--color-warning)' }}>
                                {alert.title}
                                <span style={pill(
                                  isHigh ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                                  isHigh ? 'var(--color-error)' : 'var(--color-warning)',
                                  { marginLeft: 6, fontSize: 9 },
                                )}>
                                  {alert.severity}
                                </span>
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2, lineHeight: 1.5 }}>
                                {alert.message}
                              </div>
                              {/* Recommendation box */}
                              <div style={{
                                fontSize: 12, marginTop: 6, padding: '6px 10px',
                                background: 'var(--color-background)', borderRadius: 6, lineHeight: 1.5,
                                color: 'var(--color-text)', fontWeight: 500,
                              }}>
                                {alert.recommendation}
                              </div>
                              {/* Linked prescription reference */}
                              {linkedRx && (
                                <div style={{
                                  fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4,
                                  display: 'flex', alignItems: 'center', gap: 4,
                                }}>
                                  <Pill size={10} /> Affects: <strong style={{ color: 'var(--color-text)' }}>{linkedRx.medication} {linkedRx.dosage}</strong>
                                </div>
                              )}
                            </div>
                            {/* Toggle actions */}
                            <button
                              onClick={() => setAlertActionPanel(showActions ? null : alert.id)}
                              style={{
                                background: isHigh ? 'var(--color-error)' : 'var(--color-warning)',
                                border: 'none', cursor: 'pointer', color: '#fff',
                                fontSize: 11, fontWeight: 700, flexShrink: 0,
                                padding: '6px 12px', borderRadius: 6,
                                display: 'flex', alignItems: 'center', gap: 4,
                              }}
                            >
                              {showActions ? 'Close' : 'Resolve'}
                              {!showActions && <ChevronDown size={12} />}
                            </button>
                          </div>

                          {/* ─── Alert action panel ─── */}
                          {showActions && (
                            <div style={{
                              padding: '8px 14px 12px', display: 'flex', flexDirection: 'column', gap: 6,
                              background: 'var(--color-background)', borderTop: '1px dashed var(--color-border)',
                            }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                                Choose action
                              </div>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {/* Switch medication */}
                                {alert.prescriptionId && (
                                  <button
                                    onClick={() => handleSwitchMedication(alert.id, alert.prescriptionId)}
                                    style={btn({
                                      background: 'var(--color-primary)', color: '#fff',
                                      border: 'none', fontWeight: 700,
                                    })}
                                  >
                                    <Edit3 size={13} /> Switch Medication
                                  </button>
                                )}
                                {/* Discontinue offending Rx */}
                                {alert.prescriptionId && (
                                  <button
                                    onClick={() => handleDiscontinueFromAlert(alert.id, alert.prescriptionId)}
                                    style={btn({ color: 'var(--color-error)', fontWeight: 700 })}
                                  >
                                    <Ban size={13} /> Discontinue
                                  </button>
                                )}
                                {/* Acknowledge & keep */}
                                <button
                                  onClick={() => handleAcknowledgeAlert(alert.id)}
                                  style={btn()}
                                >
                                  <Eye size={13} /> Acknowledge &amp; Keep
                                </button>
                                {/* Dismiss (not clinically actioned) */}
                                <button
                                  onClick={() => handleDismissAlert(alert.id)}
                                  style={btn({ color: 'var(--color-text-muted)' })}
                                >
                                  <X size={13} /> Dismiss
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ─── Prescription cards ─── */}
                {group.prescriptions.map((rx, i) => {
                  const statusStyle = getStatusStyle(rx.status);
                  const rxAlerts = alertsByPrescriptionId.get(rx.id) ?? [];
                  const isExpanded = expandedCard === rx.id;
                  const isEditing = editingRx === rx.id;
                  const isLast = i === group.prescriptions.length - 1;
                  const isDone = rx.status === 'Completed' || rx.status === 'Cancelled';

                  return (
                    <div
                      key={rx.id}
                      id={`rx-${rx.id}`}
                      style={{
                        background: 'var(--color-surface)',
                        borderLeft: '1px solid var(--color-border)',
                        borderRight: '1px solid var(--color-border)',
                        borderBottom: '1px solid var(--color-border)',
                        borderRadius: isLast ? '0 0 12px 12px' : 0,
                        overflow: 'hidden',
                        transition: 'all 0.15s',
                        opacity: isDone ? 0.65 : 1,
                      }}
                    >
                      {/* Row header (always visible, clickable) */}
                      <div
                        onClick={() => toggleCard(rx.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '12px 14px', cursor: 'pointer',
                          borderLeft: `3px solid ${statusStyle.border}`,
                        }}
                      >
                        <Pill size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span
                              style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
                              onClick={(e) => { e.stopPropagation(); setLookupDrug(rx.medication); }}
                              title="View drug information"
                            >
                              {rx.medication}
                            </span> {rx.dosage}
                            {rxAlerts.length > 0 && <AlertTriangle size={13} style={{ color: 'var(--color-error)', flexShrink: 0 }} />}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>{rx.frequency}</span><span>·</span><span>{rx.duration}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <span style={pill(statusStyle.bg, statusStyle.color)}>{rx.status}</span>
                          {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--color-text-muted)' }} />}
                        </div>
                      </div>

                      {/* ─── Expanded panel ─── */}
                      {isExpanded && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            padding: '0 14px 14px',
                            borderLeft: `3px solid ${statusStyle.border}`,
                            display: 'flex', flexDirection: 'column', gap: 10,
                          }}
                        >
                          {/* CDSS inline warning on this Rx */}
                          {rxAlerts.length > 0 && (
                            <div style={{
                              padding: '8px 10px', borderRadius: 8,
                              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)',
                              display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
                            }}>
                              <ShieldAlert size={14} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
                              <span style={{ color: 'var(--color-error)', fontWeight: 600 }}>
                                {rxAlerts.map((a) => a.title).join(' · ')}
                              </span>
                              <ArrowRight size={12} style={{ color: 'var(--color-text-muted)', marginLeft: 'auto', flexShrink: 0 }} />
                              <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>See alert above</span>
                            </div>
                          )}

                          {/* ─── View mode ─── */}
                          {!isEditing && (
                            <>
                              {/* Detail grid */}
                              <div style={{
                                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                                gap: 8, padding: '10px 12px',
                                background: 'var(--color-background)', borderRadius: 10,
                              }}>
                                {[
                                  { label: 'Prescribed', value: rx.prescribedDate, icon: <Clock size={12} /> },
                                  { label: 'Quantity', value: `${rx.quantity} units`, icon: null },
                                  { label: 'Refills', value: rx.refillsRemaining > 0 ? String(rx.refillsRemaining) : 'None', icon: <RefreshCw size={12} /> },
                                  { label: 'Duration', value: rx.duration, icon: null },
                                ].map((d) => (
                                  <div key={d.label}>
                                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 2 }}>{d.label}</div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                      {d.icon} {d.value}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Notes */}
                              {rx.notes && (
                                <div style={{
                                  fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic',
                                  padding: '8px 12px', background: 'var(--color-background)', borderRadius: 8,
                                  lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 6,
                                }}>
                                  <FileText size={12} style={{ flexShrink: 0, marginTop: 2 }} /> {rx.notes}
                                </div>
                              )}
                            </>
                          )}

                          {/* ─── Edit mode ─── */}
                          {isEditing && (
                            <div style={{
                              display: 'flex', flexDirection: 'column', gap: 10,
                              padding: '12px', background: 'var(--color-background)', borderRadius: 10,
                              border: '1px solid var(--color-primary)',
                            }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Edit3 size={13} /> Editing Prescription
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                <div>
                                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 3 }}>Medication</label>
                                  <input
                                    style={inputStyle}
                                    value={editDraft.medication ?? ''}
                                    onChange={(e) => setEditDraft((d) => ({ ...d, medication: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 3 }}>Dosage</label>
                                  <input
                                    style={inputStyle}
                                    value={editDraft.dosage ?? ''}
                                    onChange={(e) => setEditDraft((d) => ({ ...d, dosage: e.target.value }))}
                                  />
                                </div>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                <div>
                                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 3 }}>Frequency</label>
                                  <input
                                    style={inputStyle}
                                    value={editDraft.frequency ?? ''}
                                    onChange={(e) => setEditDraft((d) => ({ ...d, frequency: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 3 }}>Duration</label>
                                  <input
                                    style={inputStyle}
                                    value={editDraft.duration ?? ''}
                                    onChange={(e) => setEditDraft((d) => ({ ...d, duration: e.target.value }))}
                                  />
                                </div>
                              </div>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 3 }}>Notes</label>
                                <textarea
                                  style={{ ...inputStyle, minHeight: 48, resize: 'vertical' }}
                                  value={editDraft.notes ?? ''}
                                  onChange={(e) => setEditDraft((d) => ({ ...d, notes: e.target.value }))}
                                />
                              </div>
                              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                <button onClick={cancelEdit} style={btn()}>
                                  <X size={13} /> Cancel
                                </button>
                                <button onClick={() => saveEdit(rx.id)} style={btn({ background: 'var(--color-success)', color: '#fff', border: 'none', fontWeight: 700 })}>
                                  <Save size={13} /> Save Changes
                                </button>
                              </div>
                            </div>
                          )}

                          {/* ─── Action buttons ─── */}
                          {!isEditing && (
                            <>
                              {rx.status === 'Pending Approval' && (
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button onClick={() => handleApprove(rx.id)} style={btn({ flex: 1, background: 'var(--color-success)', color: '#fff', border: 'none', fontWeight: 700, justifyContent: 'center', minHeight: 44 })}>
                                    <CheckCircle2 size={15} /> Approve
                                  </button>
                                  <button onClick={() => startEdit(rx)} style={btn({ minHeight: 44, justifyContent: 'center' })}>
                                    <Edit3 size={15} /> Edit
                                  </button>
                                  <button onClick={() => handleDeny(rx.id)} style={btn({ minHeight: 44, justifyContent: 'center', color: 'var(--color-text-muted)' })}>
                                    <XCircle size={15} /> Deny
                                  </button>
                                </div>
                              )}

                              {rx.status === 'Active' && (
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                  <button onClick={() => startEdit(rx)} style={btn()}>
                                    <Edit3 size={12} /> Edit
                                  </button>
                                  <button onClick={() => {
                                    addPrescription({
                                      patientId: rx.patientId,
                                      patientName: rx.patientName,
                                      doctorName: rx.doctorName,
                                      medication: rx.medication,
                                      dosage: rx.dosage,
                                      frequency: rx.frequency,
                                      duration: rx.duration,
                                      quantity: rx.quantity,
                                      refillsRemaining: Math.max(0, (rx.refillsRemaining ?? 1) - 1),
                                      status: 'Active',
                                      prescribedDate: new Date().toISOString().slice(0, 10),
                                      notes: `Refill of ${rx.medication}`,
                                    });
                                    showToast(`Refill created for ${rx.medication}`, 'success');
                                  }} style={btn()}>
                                    <RefreshCw size={12} /> Refill
                                  </button>
                                  <button onClick={() => {
                                    const newRx = { ...rx } as Omit<Prescription, 'id'> & { id?: string };
                                    delete newRx.id;
                                    addPrescription({ ...newRx, status: 'Pending Approval' as const, prescribedDate: new Date().toISOString().slice(0, 10) });
                                    showToast('Prescription duplicated as pending draft', 'info');
                                  }} style={btn()}>
                                    <Copy size={12} /> Duplicate
                                  </button>
                                  <button onClick={() => {
                                    updatePrescription(rx.id, { status: 'Cancelled' });
                                    showToast('Prescription discontinued', 'info');
                                  }} style={btn({ color: 'var(--color-error)' })}>
                                    <Ban size={12} /> Discontinue
                                  </button>
                                </div>
                              )}

                              {(rx.status === 'Completed' || rx.status === 'Cancelled') && (
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button onClick={() => {
                                    const newRx = { ...rx } as Omit<Prescription, 'id'> & { id?: string };
                                    delete newRx.id;
                                    addPrescription({ ...newRx, status: 'Pending Approval' as const, prescribedDate: new Date().toISOString().slice(0, 10) });
                                    showToast(`Re-prescribed ${rx.medication} as pending`, 'success');
                                  }} style={btn()}>
                                    <RefreshCw size={12} /> Re-prescribe
                                  </button>
                                  <button onClick={() => {
                                    const newRx = { ...rx } as Omit<Prescription, 'id'> & { id?: string };
                                    delete newRx.id;
                                    addPrescription({ ...newRx, status: 'Pending Approval' as const, prescribedDate: new Date().toISOString().slice(0, 10) });
                                    showToast('Prescription duplicated as pending draft', 'info');
                                  }} style={btn()}>
                                    <Copy size={12} /> Duplicate
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {lookupDrug && <DrugInfoModal drugName={lookupDrug} onClose={() => setLookupDrug(null)} />}
    </div>
  );
};
