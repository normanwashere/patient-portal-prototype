import { useState, useMemo } from 'react';
import {
  Search,
  FileText,
  AlertTriangle,
  AlertCircle,
  ChevronUp,
  PenLine,
  Check,
  RefreshCw,
  Calendar,
  Send,
} from 'lucide-react';
import { useProvider } from '../../provider/context/ProviderContext';
import { useToast } from '../../context/ToastContext';
import type { LabOrder } from '../../provider/types';

const styles: Record<string, React.CSSProperties> = {
  page: { padding: 'var(--space, 16px)', maxWidth: 1000, margin: '0 auto' },
  title: { fontSize: 20, fontWeight: 700, color: 'var(--color-text)', marginBottom: 16 },
  searchBox: {
    width: '100%',
    padding: '12px 16px 12px 40px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    fontSize: 14,
    marginBottom: 16,
    position: 'relative' as const,
  },
  searchWrapper: { position: 'relative' as const, marginBottom: 12 },
  searchIcon: {
    position: 'absolute' as const,
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--color-text-muted)',
  },
  filterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    padding: '8px 14px',
    borderRadius: 20,
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  },
  chipActive: {
    background: 'var(--color-primary)',
    color: 'white',
    borderColor: 'var(--color-primary)',
  },
  card: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-sm)',
    padding: 16,
    marginBottom: 12,
    border: '1px solid var(--color-border)',
  },
  cardCritical: {
    borderColor: 'var(--color-error)',
    borderWidth: 2,
    animation: 'recording-pulse 2s infinite',
  },
  cardHeader: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  patientName: { fontWeight: 700, fontSize: 15, color: 'var(--color-text)' },
  testName: { fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 4 },
  badgeRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  badge: {
    padding: '4px 8px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
  },
  badgeLab: { background: 'var(--color-info-light)', color: 'var(--color-info-text)' },
  badgeRoutine: { background: 'var(--color-gray-200)', color: 'var(--color-gray-700)' },
  badgeStat: { background: 'var(--color-warning-light)', color: 'var(--color-warning-text)' },
  resultRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 8,
  },
  resultValue: { fontWeight: 700, fontSize: 16 },
  resultAbnormal: { color: 'var(--color-warning)' },
  resultCritical: { color: 'var(--color-error)' },
  refRange: { fontSize: 12, color: 'var(--color-text-muted)' },
  dateRow: { fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 },
  actionRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 },
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
  expandArea: { marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border)' },
  annotationInput: {
    width: '100%',
    minHeight: 60,
    padding: 10,
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    fontSize: 13,
    resize: 'vertical' as const,
  },
  detailPanel: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-md)',
    padding: 20,
    marginTop: 16,
  },
  detailTitle: { fontSize: 16, fontWeight: 700, marginBottom: 16 },
  barContainer: {
    height: 24,
    background: 'var(--color-gray-200)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative' as const,
  },
  barFill: {
    height: '100%',
    borderRadius: 12,
    transition: 'width 0.3s',
  },
  trendSection: { marginBottom: 16 },
  trendTitle: { fontSize: 13, fontWeight: 600, marginBottom: 8 },
  trendChart: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
    height: 60,
  },
  trendBar: {
    flex: 1,
    background: 'var(--color-primary-light)',
    borderRadius: 4,
    minHeight: 8,
  },
  cdssBox: {
    padding: 12,
    background: 'var(--color-warning-light)',
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
    borderLeft: '4px solid var(--color-warning)',
  },
};

type FilterType = 'all' | 'pending' | 'signed' | 'critical';

export const LabResultsReview = () => {
  const { labOrders, updateLabOrderStatus } = useProvider();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Record<string, string>>({});
  const [flaggedCritical, setFlaggedCritical] = useState<Record<string, boolean>>({});

  const filteredOrders = useMemo(() => {
    const resultedOrReviewed = labOrders.filter(
      (o) => o.status === 'Resulted' || o.status === 'Reviewed'
    );
    let list = resultedOrReviewed;

    if (filter === 'pending') list = list.filter((o) => o.status === 'Resulted');
    else if (filter === 'signed') list = list.filter((o) => o.status === 'Reviewed');
    else if (filter === 'critical') list = list.filter((o) => o.isCritical || flaggedCritical[o.id]);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.patientName.toLowerCase().includes(q) ||
          o.testName.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      const aCrit = a.isCritical || flaggedCritical[a.id];
      const bCrit = b.isCritical || flaggedCritical[b.id];
      if (aCrit && !bCrit) return -1;
      if (!aCrit && bCrit) return 1;
      return 0;
    });
  }, [labOrders, filter, search, flaggedCritical]);

  const handleSignOff = (id: string) => {
    updateLabOrderStatus(id, 'Reviewed');
    setDetailId(null);
  };

  const selectedOrder = detailId
    ? labOrders.find((o) => o.id === detailId)
    : null;

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Lab Results Review</h2>

      <div style={styles.searchWrapper}>
        <Search size={18} style={styles.searchIcon} />
        <input
          style={styles.searchBox}
          placeholder="Search by patient or test name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={styles.filterRow}>
        {(
          [
            ['all', 'All'],
            ['pending', 'Pending Review'],
            ['signed', 'Signed'],
            ['critical', 'Critical Only'],
          ] as [FilterType, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            style={{
              ...styles.chip,
              ...(filter === key ? styles.chipActive : {}),
            }}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        {filteredOrders.map((order) => (
          <ResultCard
            key={order.id}
            order={order}
            isExpanded={expandedId === order.id}
            isFlaggedCritical={!!(order.isCritical || flaggedCritical[order.id])}
            onToggleExpand={() =>
              setExpandedId((id) => (id === order.id ? null : order.id))
            }
            onViewDetail={() => setDetailId(order.id)}
            onSignOff={() => handleSignOff(order.id)}
            onToggleFlagCritical={() =>
              setFlaggedCritical((prev) => ({
                ...prev,
                [order.id]: !prev[order.id],
              }))
            }
            annotation={annotations[order.id] ?? ''}
            onAnnotationChange={(v) =>
              setAnnotations((prev) => ({ ...prev, [order.id]: v }))
            }
            styles={styles}
          />
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            color: 'var(--color-text-muted)',
          }}
        >
          <FileText size={40} style={{ marginBottom: 8, opacity: 0.5 }} />
          <p>No results match your filters.</p>
        </div>
      )}

      {selectedOrder && (
        <ResultDetail
          order={selectedOrder}
          onClose={() => setDetailId(null)}
          onSignOff={() => handleSignOff(selectedOrder.id)}
          showToast={showToast}
          styles={styles}
        />
      )}
    </div>
  );
};

function ResultCard({
  order,
  isExpanded,
  isFlaggedCritical,
  onToggleExpand,
  onViewDetail,
  onSignOff,
  onToggleFlagCritical,
  annotation,
  onAnnotationChange,
  styles: s,
}: {
  order: LabOrder;
  isExpanded: boolean;
  isFlaggedCritical: boolean;
  onToggleExpand: () => void;
  onViewDetail: () => void;
  onSignOff: () => void;
  onToggleFlagCritical: () => void;
  annotation: string;
  onAnnotationChange: (v: string) => void;
  styles: Record<string, React.CSSProperties>;
}) {
  return (
    <div
      style={{
        ...s.card,
        ...(order.isCritical ? s.cardCritical : {}),
      }}
    >
      <div style={s.cardHeader}>
        <div>
          <div style={s.patientName}>{order.patientName}</div>
          <div style={s.testName}>{order.testName}</div>
        </div>
        <div style={s.badgeRow}>
          <span style={{ ...s.badge, ...s.badgeLab }}>{order.testType}</span>
          <span
            style={{
              ...s.badge,
              ...(order.priority === 'Stat' ? s.badgeStat : s.badgeRoutine),
            }}
          >
            {order.priority}
          </span>
          {order.isAbnormal && (
            <span style={{ ...s.badge, background: 'var(--color-warning-light)', color: 'var(--color-warning-text)' }}>
              Abnormal
            </span>
          )}
          {order.isCritical && (
            <span style={{ ...s.badge, background: 'var(--color-error-light)', color: 'var(--color-error-text)' }}>
              <AlertCircle size={10} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Critical
            </span>
          )}
        </div>
      </div>

      <div style={s.resultRow}>
        <span
          style={{
            ...s.resultValue,
            ...(order.isCritical ? s.resultCritical : order.isAbnormal ? s.resultAbnormal : {}),
          }}
        >
          {order.result ?? '—'}
        </span>
        {order.referenceRange && (
          <span style={s.refRange}>(Ref: {order.referenceRange})</span>
        )}
      </div>

      <div style={s.dateRow}>
        Ordered {order.orderedDate} → Resulted {order.resultedDate ?? '—'}
      </div>

      <div style={s.actionRow}>
        {order.status === 'Resulted' && (
          <button style={{ ...s.btn, ...s.btnPrimary }} onClick={onSignOff}>
            <Check size={14} /> Sign Off
          </button>
        )}
        <button style={s.btn} onClick={onViewDetail}>
          View Detail
        </button>
        <button style={s.btn} onClick={onToggleExpand}>
          {isExpanded ? <ChevronUp size={14} /> : <PenLine size={14} />} Add
          Annotation
        </button>
        <button
          style={{
            ...s.btn,
            ...(isFlaggedCritical ? { background: 'var(--color-error-light)', color: 'var(--color-error-text)' } : {}),
          }}
          onClick={onToggleFlagCritical}
        >
          <AlertCircle size={14} /> Flag Critical
        </button>
      </div>

      {isExpanded && (
        <div style={s.expandArea}>
          <textarea
            style={s.annotationInput}
            placeholder="Add annotation..."
            value={annotation}
            onChange={(e) => onAnnotationChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

const MOCK_TREND = [
  { label: 'Jan', value: 5.2 },
  { label: 'Feb', value: 5.8 },
  { label: 'Current', value: 6.1 },
];
const MOCK_CDSS =
  'LDL 190 mg/dL - Consider statin therapy per ACC/AHA guidelines.';

function ResultDetail({
  order,
  onClose,
  onSignOff,
  showToast,
  styles: s,
}: {
  order: LabOrder;
  onClose: () => void;
  onSignOff: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  styles: Record<string, React.CSSProperties>;
}) {
  const maxVal = Math.max(...MOCK_TREND.map((t) => t.value));
  return (
    <div style={s.detailPanel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={s.detailTitle}>Result Detail - {order.testName}</h3>
        <button style={s.btn} onClick={onClose}>
          Close
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>Patient:</strong> {order.patientName}
      </div>
      <div style={{ marginBottom: 16 }}>
        <strong>Result:</strong> {order.result}
      </div>
      {order.referenceRange && (
        <div style={{ marginBottom: 16 }}>
          <strong>Reference Range:</strong> {order.referenceRange}
        </div>
      )}

      <div style={s.barContainer}>
        <div
          style={{
            ...s.barFill,
            width: '60%',
            background: order.isAbnormal ? 'var(--color-warning)' : 'var(--color-primary)',
          }}
        />
      </div>

      <div style={s.trendSection}>
        <div style={s.trendTitle}>Trend (Jan: 5.2, Feb: 5.8, Current: 6.1)</div>
        <div style={s.trendChart}>
          {MOCK_TREND.map((t) => (
            <div key={t.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  ...s.trendBar,
                  width: '100%',
                  height: `${Math.max(8, (t.value / maxVal) * 50)}px`,
                }}
              />
              <div style={{ fontSize: 10, marginTop: 4 }}>{t.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={s.cdssBox}>
        <AlertTriangle size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
        {MOCK_CDSS}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {order.status === 'Resulted' && (
          <button style={{ ...s.btn, ...s.btnPrimary }} onClick={onSignOff}>
            <Check size={14} /> Sign Off
          </button>
        )}
        <button style={s.btn} onClick={() => showToast('Retest requested for ' + order.testName, 'success')}>
          <RefreshCw size={14} /> Request Retest
        </button>
        <button style={s.btn} onClick={() => showToast('Follow-up scheduled for ' + order.patientName, 'success')}>
          <Calendar size={14} /> Schedule Follow-up
        </button>
        <button style={s.btn} onClick={() => showToast('Result sent to ' + order.patientName, 'success')}>
          <Send size={14} /> Send to Patient
        </button>
      </div>
    </div>
  );
}
