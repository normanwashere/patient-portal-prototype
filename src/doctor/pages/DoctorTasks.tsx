import { useState } from 'react';
import {
  FlaskConical,
  Pill,
  FileSignature,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProvider } from '../../provider/context/ProviderContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader, StatusBadge, EmptyState } from '../../ui';

type TaskType = 'lab-review' | 'refill-request' | 'note-sign';
type TaskFilter = 'all' | TaskType;

interface DerivedTask {
  id: string;
  type: TaskType;
  patientName: string;
  description: string;
  priority: 'critical' | 'urgent' | 'normal';
  route: string;
}

export const DoctorTasks = () => {
  const { currentStaff, labOrders, prescriptions, clinicalNotes } = useProvider();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [typeFilter, setTypeFilter] = useState<TaskFilter>('all');
  const [snoozed, setSnoozed] = useState<Set<string>>(new Set());
  const [showSnoozed, setShowSnoozed] = useState(false);

  // Derive tasks from provider data
  const allTasks: DerivedTask[] = [];

  // Lab results pending review
  labOrders
    .filter((o) => o.status === 'Resulted' && o.doctorName === currentStaff?.name)
    .forEach((o) => {
      allTasks.push({
        id: `lab-${o.id}`,
        type: 'lab-review',
        patientName: o.patientName,
        description: `Review ${o.testName} result${o.isCritical ? ' (CRITICAL)' : ''}`,
        priority: o.isCritical ? 'critical' : o.priority === 'Stat' ? 'urgent' : 'normal',
        route: '/doctor/results',
      });
    });

  // Prescriptions pending approval
  prescriptions
    .filter((p) => p.status === 'Pending Approval' && p.doctorName === currentStaff?.name)
    .forEach((p) => {
      allTasks.push({
        id: `rx-${p.id}`,
        type: 'refill-request',
        patientName: p.patientName,
        description: `Approve ${p.medication} ${p.dosage} refill`,
        priority: 'normal',
        route: '/doctor/prescriptions',
      });
    });

  // Unsigned clinical notes
  clinicalNotes
    .filter((n) => n.status === 'Draft' && n.doctorId === currentStaff?.id)
    .forEach((n) => {
      allTasks.push({
        id: `note-${n.id}`,
        type: 'note-sign',
        patientName: n.patientName ?? 'Patient',
        description: `Sign clinical note from ${n.date}`,
        priority: 'urgent',
        route: '/doctor/encounter',
      });
    });

  const activeTasks = allTasks.filter(t => !snoozed.has(t.id));
  const snoozedTasks = allTasks.filter(t => snoozed.has(t.id));

  // Apply type filter
  const filtered = typeFilter === 'all'
    ? activeTasks
    : activeTasks.filter(t => t.type === typeFilter);

  const handleSnooze = (taskId: string) => {
    setSnoozed(prev => new Set(prev).add(taskId));
    showToast('Task snoozed — will reappear later', 'info');
  };

  const handleUnsnooze = (taskId: string) => {
    setSnoozed(prev => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
    showToast('Task restored', 'success');
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'lab-review': return <FlaskConical size={16} />;
      case 'refill-request': return <Pill size={16} />;
      case 'note-sign': return <FileSignature size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'lab-review': return { bg: 'rgba(139,92,246,0.1)', color: 'var(--color-purple)' };
      case 'refill-request': return { bg: 'rgba(16,185,129,0.1)', color: 'var(--color-success)' };
      case 'note-sign': return { bg: 'var(--color-primary-transparent)', color: 'var(--color-primary)' };
      default: return { bg: 'rgba(59,130,246,0.1)', color: 'var(--color-info)' };
    }
  };

  const filterOptions: { key: TaskFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: activeTasks.length },
    { key: 'lab-review', label: 'Lab Reviews', count: activeTasks.filter(t => t.type === 'lab-review').length },
    { key: 'refill-request', label: 'Prescriptions', count: activeTasks.filter(t => t.type === 'refill-request').length },
    { key: 'note-sign', label: 'Unsigned Notes', count: activeTasks.filter(t => t.type === 'note-sign').length },
  ];

  const renderTask = (task: DerivedTask, isSnoozedView = false) => {
    const icon = getIconBg(task.type);
    return (
      <div
        key={task.id}
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px',
          background: isSnoozedView ? 'var(--color-background)' : 'var(--color-surface)',
          borderRadius: 'var(--radius)', boxShadow: isSnoozedView ? 'none' : 'var(--shadow-sm)',
          borderLeft: `3px solid ${task.priority === 'critical' ? 'var(--color-error)' : task.priority === 'urgent' ? 'var(--color-warning)' : 'transparent'}`,
          opacity: isSnoozedView ? 0.7 : 1,
          border: isSnoozedView ? '1px solid var(--color-border)' : undefined,
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: icon.bg, color: icon.color, flexShrink: 0,
        }}>
          {getTaskIcon(task.type)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{task.patientName}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{task.description}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {isSnoozedView ? (
              <button
                onClick={() => handleUnsnooze(task.id)}
                style={{
                  padding: '6px 14px', borderRadius: 6, border: 'none',
                  background: 'var(--color-primary)', color: 'white', fontSize: 11,
                  fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
              >
                Restore
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate(task.route)}
                  style={{
                    padding: '6px 14px', borderRadius: 6, border: 'none',
                    background: 'var(--color-primary)', color: 'white', fontSize: 11,
                    fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}
                >
                  Open
                </button>
                <button
                  onClick={() => handleSnooze(task.id)}
                  style={{
                    padding: '6px 14px', borderRadius: 6,
                    border: '1px solid var(--color-border)', background: 'var(--color-surface)',
                    color: 'var(--color-text-muted)', fontSize: 11,
                    fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <Clock size={11} /> Snooze
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (allTasks.length === 0) {
    return (
      <div className="doc-page" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <PageHeader title="Tasks" style={{ marginBottom: 0 }} />
        <EmptyState
          icon={<CheckCircle2 size={40} style={{ color: 'var(--color-success)' }} />}
          title="All caught up!"
          description="No pending tasks"
          style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)' }}
        />
      </div>
    );
  }

  return (
    <div className="doc-page" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader
        title={`Tasks (${activeTasks.length})`}
        style={{ marginBottom: 0 }}
        actions={
          snoozedTasks.length > 0 ? (
            <button
              onClick={() => setShowSnoozed(!showSnoozed)}
              style={{
                padding: '5px 12px', borderRadius: 6, border: '1px solid var(--color-border)',
                background: showSnoozed ? 'var(--color-primary)' : 'var(--color-surface)',
                color: showSnoozed ? 'white' : 'var(--color-text-muted)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <Clock size={12} /> Snoozed ({snoozedTasks.length})
            </button>
          ) : undefined
        }
      />

      {/* Type filter chips */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {filterOptions.map(f => (
          <button
            key={f.key}
            onClick={() => setTypeFilter(f.key)}
            style={{
              padding: '6px 14px', borderRadius: 20, border: 'none',
              background: typeFilter === f.key ? 'var(--color-primary)' : 'var(--color-surface)',
              color: typeFilter === f.key ? 'white' : 'var(--color-text-muted)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            {f.key !== 'all' && (typeFilter === f.key ? <X size={10} /> : <Filter size={10} />)}
            {f.label}
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 8,
              background: typeFilter === f.key ? 'rgba(255,255,255,0.2)' : 'var(--color-background)',
            }}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Snoozed tasks section */}
      {showSnoozed && snoozedTasks.length > 0 && (
        <div>
          <div style={{
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
            color: 'var(--color-text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Clock size={12} /> Snoozed ({snoozedTasks.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {snoozedTasks.map(task => renderTask(task, true))}
          </div>
        </div>
      )}

      {/* Active tasks by priority */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 32, color: 'var(--color-text-muted)',
          background: 'var(--color-surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)',
        }}>
          <Filter size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
          <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>No tasks match filter</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Try a different category or check snoozed tasks</div>
        </div>
      ) : (
        (['critical', 'urgent', 'normal'] as const).map((priority) => {
          const group = filtered.filter((t) => t.priority === priority);
          if (group.length === 0) return null;

          return (
            <div key={priority}>
              <div style={{ marginBottom: 8 }}>
                <StatusBadge
                  variant={priority === 'critical' ? 'error' : priority === 'urgent' ? 'warning' : 'muted'}
                  icon={priority === 'critical' ? <AlertCircle size={12} /> : undefined}
                  style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  {priority} ({group.length})
                </StatusBadge>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.map(task => renderTask(task))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
