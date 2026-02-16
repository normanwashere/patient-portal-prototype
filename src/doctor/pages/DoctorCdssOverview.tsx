import { useState, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Info,
  XCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  X,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProvider } from '../../provider/context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';
import { useToast } from '../../context/ToastContext';
import type { CDSSAlert, CDSSSeverity } from '../../provider/types';

const SEVERITY_CONFIG: Record<CDSSSeverity, { label: string; color: string; bg: string; icon: typeof AlertTriangle }> = {
  contraindicated: { label: 'Contraindicated', color: '#991b1b', bg: 'rgba(239,68,68,0.10)', icon: XCircle },
  major:           { label: 'Major',           color: '#c2410c', bg: 'rgba(234,88,12,0.10)', icon: AlertTriangle },
  moderate:        { label: 'Moderate',        color: '#a16207', bg: 'rgba(234,179,8,0.10)',  icon: AlertCircle },
  minor:           { label: 'Minor',           color: '#1d4ed8', bg: 'rgba(59,130,246,0.10)', icon: Info },
  info:            { label: 'Info',            color: '#0e7490', bg: 'rgba(6,182,212,0.10)',  icon: Info },
};

const SEVERITY_ORDER: CDSSSeverity[] = ['contraindicated', 'major', 'moderate', 'minor', 'info'];

interface PatientGroup {
  patientId: string;
  patientName: string;
  alerts: CDSSAlert[];
}

function derivePatientName(alert: CDSSAlert, queuePatients: { patientId: string; patientName: string }[]): string {
  const qp = queuePatients.find(p => p.patientId === alert.patientId);
  if (qp) return qp.patientName;
  const match = alert.message.match(/^([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/);
  if (match) return match[1];
  return alert.patientId ?? 'Unknown Patient';
}

export const DoctorCdssOverview = () => {
  const { cdssAlerts, dismissAlert, queuePatients } = useProvider();
  const { tenant } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  const [dismissingId, setDissmissingId] = useState<string | null>(null);

  const activeAlerts = useMemo(() => cdssAlerts.filter(a => !a.dismissed), [cdssAlerts]);

  const patientGroups: PatientGroup[] = useMemo(() => {
    const map = new Map<string, PatientGroup>();
    for (const alert of activeAlerts) {
      const pid = alert.patientId ?? '_unknown';
      if (!map.has(pid)) {
        map.set(pid, {
          patientId: pid,
          patientName: derivePatientName(alert, queuePatients),
          alerts: [],
        });
      }
      map.get(pid)!.alerts.push(alert);
    }
    const groups = Array.from(map.values());
    groups.sort((a, b) => {
      const aMax = Math.min(...a.alerts.map(al => SEVERITY_ORDER.indexOf(al.severity)));
      const bMax = Math.min(...b.alerts.map(al => SEVERITY_ORDER.indexOf(al.severity)));
      return aMax - bMax;
    });
    return groups;
  }, [activeAlerts, queuePatients]);

  const totalBySeverity = useMemo(() => {
    const counts: Record<CDSSSeverity, number> = { contraindicated: 0, major: 0, moderate: 0, minor: 0, info: 0 };
    for (const a of activeAlerts) counts[a.severity]++;
    return counts;
  }, [activeAlerts]);

  const handleDismiss = (alertId: string) => {
    setDissmissingId(alertId);
    setTimeout(() => {
      dismissAlert(alertId);
      setDissmissingId(null);
      showToast('Alert dismissed', 'success');
    }, 300);
  };

  const handleReviewInEncounter = (patientId: string, patientName: string) => {
    navigate('/doctor/encounter', { state: { patientId, patientName } });
  };

  const toggleExpand = (pid: string) => {
    setExpandedPatient(prev => prev === pid ? null : pid);
  };

  const hasCDSS = tenant.features.cdss ?? false;

  if (!hasCDSS) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <ShieldAlert size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
        <div style={{ fontSize: 16, fontWeight: 600 }}>CDSS is not enabled for this tenant.</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => navigate('/doctor')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-muted)' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldAlert size={22} style={{ color: 'var(--color-error)' }} />
            CDSS Alerts Overview
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
            Clinical Decision Support alerts grouped by patient
          </p>
        </div>
      </div>

      {/* Summary Bar */}
      {activeAlerts.length > 0 && (
        <div style={{
          display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20,
          padding: '14px 16px', borderRadius: 12,
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginRight: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            {activeAlerts.length} Active Alert{activeAlerts.length !== 1 ? 's' : ''}
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)' }}>
              across {patientGroups.length} patient{patientGroups.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div style={{ flex: 1 }} />
          {SEVERITY_ORDER.filter(s => totalBySeverity[s] > 0).map(s => {
            const cfg = SEVERITY_CONFIG[s];
            return (
              <span key={s} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: cfg.bg, color: cfg.color,
              }}>
                {totalBySeverity[s]} {cfg.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {activeAlerts.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 24px',
          background: 'var(--color-surface)', borderRadius: 16,
          border: '1px solid var(--color-border)',
        }}>
          <CheckCircle2 size={48} style={{ color: '#22c55e', marginBottom: 16 }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>All Clear</div>
          <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
            No active clinical decision support alerts. All checks have been reviewed or dismissed.
          </div>
        </div>
      )}

      {/* Patient Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {patientGroups.map(group => {
          const isExpanded = expandedPatient === group.patientId || patientGroups.length <= 3;
          const highestSeverity = SEVERITY_ORDER.find(s => group.alerts.some(a => a.severity === s)) ?? 'info';
          const hsCfg = SEVERITY_CONFIG[highestSeverity];
          const sortedAlerts = [...group.alerts].sort(
            (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
          );

          return (
            <div
              key={group.patientId}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 14,
                overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              {/* Patient Header — two-row layout */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleExpand(group.patientId)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleExpand(group.patientId); }}
                style={{
                  padding: '16px 18px', cursor: 'pointer',
                  borderLeft: `4px solid ${hsCfg.color}`,
                }}
              >
                {/* Row 1: Name + Expand chevron */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: hsCfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <ShieldAlert size={18} style={{ color: hsCfg.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>
                      {group.patientName}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {group.alerts.length} alert{group.alerts.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  {patientGroups.length > 3 && (
                    isExpanded
                      ? <ChevronUp size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                      : <ChevronDown size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  )}
                </div>
                {/* Row 2: Severity badges + Action button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {SEVERITY_ORDER.filter(s => group.alerts.some(a => a.severity === s)).map(s => {
                    const count = group.alerts.filter(a => a.severity === s).length;
                    const cfg = SEVERITY_CONFIG[s];
                    return (
                      <span key={s} style={{
                        padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                        background: cfg.bg, color: cfg.color,
                      }}>
                        {count} {cfg.label}
                      </span>
                    );
                  })}
                  <div style={{ flex: 1 }} />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleReviewInEncounter(group.patientId, group.patientName); }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      background: 'var(--color-primary)', color: '#fff', border: 'none',
                      cursor: 'pointer', whiteSpace: 'nowrap',
                    }}
                  >
                    <Stethoscope size={14} /> Review in Encounter
                  </button>
                </div>
              </div>

              {/* Alert List */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid var(--color-border)' }}>
                  {sortedAlerts.map(alert => {
                    const cfg = SEVERITY_CONFIG[alert.severity];
                    const SevIcon = cfg.icon;
                    const isDismissing = dismissingId === alert.id;
                    return (
                      <div
                        key={alert.id}
                        style={{
                          padding: '14px 18px',
                          borderBottom: '1px solid var(--color-border)',
                          opacity: isDismissing ? 0.4 : 1,
                          transition: 'opacity 0.3s',
                        }}
                      >
                        {/* Alert header row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: 7,
                            background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <SevIcon size={13} style={{ color: cfg.color }} />
                          </div>
                          <span style={{
                            fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                            padding: '2px 8px', borderRadius: 10, background: cfg.bg, color: cfg.color,
                          }}>
                            {cfg.label}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                            {alert.type.replace(/_/g, ' ')}
                          </span>
                          <div style={{ flex: 1 }} />
                          <button
                            onClick={() => handleDismiss(alert.id)}
                            disabled={isDismissing}
                            title="Dismiss alert"
                            style={{
                              background: 'none', border: '1px solid var(--color-border)',
                              borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
                              color: 'var(--color-text-muted)', flexShrink: 0,
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              fontSize: 11, fontWeight: 600,
                            }}
                          >
                            <X size={11} /> Dismiss
                          </button>
                        </div>
                        {/* Alert content */}
                        <div style={{ paddingLeft: 36 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>
                            {alert.title}
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.55, marginBottom: alert.recommendation ? 8 : 0 }}>
                            {alert.message}
                          </div>
                          {alert.recommendation && (
                            <div style={{
                              fontSize: 12, padding: '10px 12px', borderRadius: 8,
                              background: 'rgba(var(--color-primary-rgb, 59, 130, 246), 0.05)',
                              border: '1px solid rgba(var(--color-primary-rgb, 59, 130, 246), 0.10)',
                              color: 'var(--color-text)', lineHeight: 1.55,
                            }}>
                              <strong style={{ color: 'var(--color-primary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Recommendation</strong>
                              <div style={{ marginTop: 3 }}>{alert.recommendation}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
