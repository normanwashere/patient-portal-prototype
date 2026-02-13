import { useState } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  FileSignature,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useProvider } from '../../provider/context/ProviderContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../theme/ThemeContext';

type FilterType = 'all' | 'pending' | 'critical' | 'reviewed';

export const DoctorResults = () => {
  const { currentStaff, labOrders, updateLabOrderStatus, cdssAlerts, dismissAlert } = useProvider();
  const { showToast } = useToast();
  const { tenant } = useTheme();
  const hasCDSS = tenant.features.cdss ?? false;
  const [filter, setFilter] = useState<FilterType>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  // Only show orders for this doctor
  const myOrders = labOrders.filter((o) => o.doctorName === currentStaff?.name);

  const filtered = myOrders.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'critical') return r.isCritical;
    if (filter === 'pending') return r.status === 'Resulted';
    if (filter === 'reviewed') return r.status === 'Reviewed';
    return true;
  });

  const pendingCount = myOrders.filter((o) => o.status === 'Resulted').length;

  const relatedAlerts = cdssAlerts.filter(
    (a) => !a.dismissed && (a.type === 'critical_value' || a.type === 'guideline')
  );

  const handleSignResult = (orderId: string) => {
    updateLabOrderStatus(orderId, 'Reviewed');
    showToast('Result signed and released', 'success');
  };

  return (
    <div className="doc-page" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>Lab Results</h2>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          {pendingCount} pending review
        </span>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {([
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'critical', label: 'Critical' },
          { key: 'reviewed', label: 'Reviewed' },
        ] as const).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '6px 14px', borderRadius: 20, border: 'none',
              background: filter === f.key ? 'var(--color-primary)' : 'var(--color-surface)',
              color: filter === f.key ? 'white' : 'var(--color-text-muted)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Results List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)', background: 'var(--color-surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)' }}>
          <FlaskConical size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
          <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>No results match filter</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((order) => {
            const isReviewed = order.status === 'Reviewed';
            const isPending = order.status === 'Resulted';
            return (
              <div key={order.id} style={{
                background: 'var(--color-surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)',
                borderLeft: `3px solid ${order.isCritical ? 'var(--color-error)' : isReviewed ? 'var(--color-success)' : 'var(--color-info)'}`,
                overflow: 'hidden',
              }}>
                {/* Header */}
                <div
                  style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: order.isCritical ? 'rgba(239,68,68,0.1)' : 'rgba(139,92,246,0.1)',
                    color: order.isCritical ? 'var(--color-error)' : '#8b5cf6', flexShrink: 0,
                  }}>
                    {order.isCritical ? <AlertTriangle size={16} /> : <FlaskConical size={16} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{order.testName}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      {order.patientName} &middot; {order.testType} &middot; {order.orderedDate}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isReviewed ? (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.1)', color: 'var(--color-success)' }}>REVIEWED</span>
                    ) : isPending ? (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(59,130,246,0.1)', color: 'var(--color-info)' }}>PENDING</span>
                    ) : (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(245,158,11,0.1)', color: 'var(--color-warning)' }}>{order.status.toUpperCase()}</span>
                    )}
                    {expanded === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Expanded Detail */}
                {expanded === order.id && (
                  <div style={{ borderTop: '1px solid var(--color-border)' }}>
                    <div style={{ padding: '14px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13, marginBottom: 12 }}>
                        <div>
                          <span style={{ color: 'var(--color-text-muted)' }}>Priority:</span>{' '}
                          <span style={{ fontWeight: 600 }}>{order.priority}</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--color-text-muted)' }}>Type:</span>{' '}
                          <span style={{ fontWeight: 600 }}>{order.testType}</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--color-text-muted)' }}>Ordered:</span>{' '}
                          <span>{order.orderedDate}</span>
                        </div>
                        {order.resultedDate && (
                          <div>
                            <span style={{ color: 'var(--color-text-muted)' }}>Resulted:</span>{' '}
                            <span>{order.resultedDate}</span>
                          </div>
                        )}
                      </div>

                      {order.result && (
                        <div style={{
                          padding: 12, borderRadius: 8, background: 'var(--color-background)',
                          border: '1px solid var(--color-border)', marginBottom: 12,
                        }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 6 }}>Result</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: order.isCritical ? 'var(--color-error)' : order.isAbnormal ? 'var(--color-warning)' : 'var(--color-text)' }}>
                            {order.result}
                          </div>
                          {order.referenceRange && (
                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                              Reference range: {order.referenceRange}
                            </div>
                          )}
                          {order.isAbnormal && (
                            <span style={{
                              display: 'inline-block', marginTop: 6,
                              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase',
                              background: order.isCritical ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                              color: order.isCritical ? 'var(--color-error)' : 'var(--color-warning)',
                            }}>
                              {order.isCritical ? 'CRITICAL' : 'ABNORMAL'}
                            </span>
                          )}
                        </div>
                      )}

                      {order.notes && (
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                          Notes: {order.notes}
                        </div>
                      )}

                      {/* CDSS Alerts for critical results */}
                      {hasCDSS && order.isCritical && relatedAlerts.length > 0 && (
                        <div style={{ padding: 12, background: 'rgba(239,68,68,0.03)', borderRadius: 8, marginBottom: 12, border: '1px solid rgba(239,68,68,0.1)' }}>
                          {relatedAlerts.slice(0, 2).map((alert) => (
                            <div key={alert.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '6px 0', fontSize: 12 }}>
                              <AlertTriangle size={14} style={{ color: 'var(--color-error)', flexShrink: 0, marginTop: 1 }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600 }}>{alert.title}</div>
                                <div style={{ color: 'var(--color-text-muted)', marginTop: 2 }}>{alert.recommendation}</div>
                              </div>
                              <button
                                onClick={() => dismissAlert(alert.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 11 }}
                              >
                                Dismiss
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Sign action */}
                    {isPending && (
                      <div style={{ padding: '12px 14px', display: 'flex', gap: 8, borderTop: '1px solid var(--color-border)' }}>
                        <button
                          onClick={() => handleSignResult(order.id)}
                          style={{
                            flex: 1, padding: '10px', border: 'none', borderRadius: 8,
                            background: 'var(--color-success)', color: 'white', fontSize: 13,
                            fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: 6,
                          }}
                        >
                          <FileSignature size={14} /> Sign & Release
                        </button>
                      </div>
                    )}

                    {isReviewed && (
                      <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid var(--color-border)', color: 'var(--color-success)', fontSize: 13 }}>
                        <CheckCircle2 size={16} /> Reviewed and signed
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
