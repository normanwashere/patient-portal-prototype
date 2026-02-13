import { useState } from 'react';
import {
  Pill,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  User,
} from 'lucide-react';
import { useProvider } from '../../provider/context/ProviderContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../theme/ThemeContext';

export const DoctorPrescriptions = () => {
  const { currentStaff, prescriptions, approvePrescription, denyPrescription, cdssAlerts, dismissAlert } = useProvider();
  const { showToast } = useToast();
  const { tenant } = useTheme();
  const hasCDSS = tenant.features.cdss ?? false;
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');

  // Only show this doctor's prescriptions
  const myPrescriptions = prescriptions.filter((p) => p.doctorName === currentStaff?.name);

  const filtered = myPrescriptions.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return r.status === 'Pending Approval';
    if (filter === 'active') return r.status === 'Active';
    if (filter === 'completed') return r.status === 'Completed';
    return true;
  });

  const pendingCount = myPrescriptions.filter((r) => r.status === 'Pending Approval').length;

  const drugAlerts = cdssAlerts.filter(
    (a) => !a.dismissed && (a.type === 'drug_interaction' || a.type === 'drug_allergy' || a.type === 'dosage_range' || a.type === 'formulary')
  );

  const handleApprove = (id: string) => {
    approvePrescription(id);
    showToast('Prescription approved', 'success');
  };

  const handleDeny = (id: string) => {
    denyPrescription(id);
    showToast('Prescription denied', 'info');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending Approval': return { bg: 'rgba(59,130,246,0.1)', color: 'var(--color-info)' };
      case 'Active': return { bg: 'rgba(16,185,129,0.1)', color: 'var(--color-success)' };
      case 'Completed': return { bg: 'var(--color-background)', color: 'var(--color-text-muted)' };
      case 'Cancelled': return { bg: 'rgba(239,68,68,0.1)', color: 'var(--color-error)' };
      default: return { bg: 'var(--color-background)', color: 'var(--color-text-muted)' };
    }
  };

  return (
    <div className="doc-page" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>Prescriptions</h2>

      {/* Drug Safety Alerts (CDSS) */}
      {hasCDSS && drugAlerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>Drug Safety Alerts</div>
          {drugAlerts.map((alert) => (
            <div key={alert.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
              borderRadius: 'var(--radius)',
              background: alert.severity === 'contraindicated' || alert.severity === 'major' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)',
              border: `1px solid ${alert.severity === 'contraindicated' || alert.severity === 'major' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'}`,
            }}>
              <AlertTriangle size={14} style={{ color: alert.severity === 'contraindicated' || alert.severity === 'major' ? 'var(--color-error)' : 'var(--color-warning)', flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{alert.title}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{alert.message}</div>
                <div style={{ fontSize: 12, marginTop: 6, padding: '6px 10px', background: 'var(--color-background)', borderRadius: 6, lineHeight: 1.5 }}>
                  {alert.recommendation}
                </div>
              </div>
              <button
                onClick={() => dismissAlert(alert.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 11, flexShrink: 0 }}
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Filter & count */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>
            {filter === 'pending' ? 'Pending Approvals' : filter === 'all' ? 'All Prescriptions' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Prescriptions`}
          </div>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            {pendingCount} pending
          </span>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
          {(['all', 'pending', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', textTransform: 'capitalize', whiteSpace: 'nowrap',
                background: filter === f ? 'var(--color-primary)' : 'var(--color-surface)',
                color: filter === f ? 'white' : 'var(--color-text-muted)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Prescription List */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)', background: 'var(--color-surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)' }}>
            <Pill size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>No prescriptions match filter</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((rx) => {
              const statusColors = getStatusColor(rx.status);
              return (
                <div key={rx.id} style={{
                  background: 'var(--color-surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)',
                  padding: '14px', display: 'flex', flexDirection: 'column', gap: 10,
                  borderLeft: `3px solid ${rx.status === 'Pending Approval' ? 'var(--color-info)' : rx.status === 'Active' ? 'var(--color-success)' : 'var(--color-border)'}`,
                  opacity: rx.status === 'Completed' || rx.status === 'Cancelled' ? 0.7 : 1,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Pill size={14} style={{ color: 'var(--color-primary)' }} />
                        {rx.medication} {rx.dosage}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <User size={11} /> {rx.patientName}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase',
                      background: statusColors.bg, color: statusColors.color,
                    }}>
                      {rx.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
                    <span>{rx.frequency}</span>
                    <span>{rx.duration}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {rx.prescribedDate}
                    </span>
                    {rx.refillsRemaining > 0 && (
                      <span>Refills: {rx.refillsRemaining}</span>
                    )}
                  </div>

                  {rx.notes && (
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                      {rx.notes}
                    </div>
                  )}

                  {rx.status === 'Pending Approval' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleApprove(rx.id)}
                        style={{
                          flex: 1, padding: '10px', border: 'none', borderRadius: 8,
                          background: 'var(--color-success)', color: 'white', fontSize: 12,
                          fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: 4,
                        }}
                      >
                        <CheckCircle2 size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleDeny(rx.id)}
                        style={{
                          padding: '10px 16px', border: '1px solid var(--color-border)', borderRadius: 8,
                          background: 'var(--color-surface)', color: 'var(--color-text-muted)', fontSize: 12,
                          fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: 4,
                        }}
                      >
                        <XCircle size={14} /> Deny
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
