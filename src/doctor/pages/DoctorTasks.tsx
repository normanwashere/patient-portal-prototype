import {
  FlaskConical,
  Pill,
  FileSignature,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProvider } from '../../provider/context/ProviderContext';

interface DerivedTask {
  id: string;
  type: 'lab-review' | 'refill-request' | 'note-sign';
  patientName: string;
  description: string;
  priority: 'critical' | 'urgent' | 'normal';
  route: string;
}

export const DoctorTasks = () => {
  const { currentStaff, labOrders, prescriptions, clinicalNotes } = useProvider();
  const navigate = useNavigate();

  // Derive tasks from provider data
  const tasks: DerivedTask[] = [];

  // Lab results pending review
  labOrders
    .filter((o) => o.status === 'Resulted' && o.doctorName === currentStaff?.name)
    .forEach((o) => {
      tasks.push({
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
      tasks.push({
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
      tasks.push({
        id: `note-${n.id}`,
        type: 'note-sign',
        patientName: n.patientName ?? 'Patient',
        description: `Sign clinical note from ${n.date}`,
        priority: 'urgent',
        route: '/doctor/encounter',
      });
    });

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
      case 'lab-review': return { bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6' };
      case 'refill-request': return { bg: 'rgba(16,185,129,0.1)', color: 'var(--color-success)' };
      case 'note-sign': return { bg: 'var(--color-primary-transparent)', color: 'var(--color-primary)' };
      default: return { bg: 'rgba(59,130,246,0.1)', color: 'var(--color-info)' };
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="doc-page" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>Tasks</h2>
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)', background: 'var(--color-surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)' }}>
          <CheckCircle2 size={40} style={{ color: 'var(--color-success)', marginBottom: 8 }} />
          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text)' }}>All caught up!</div>
          <div style={{ fontSize: 12 }}>No pending tasks</div>
        </div>
      </div>
    );
  }

  return (
    <div className="doc-page" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>Tasks ({tasks.length})</h2>
      </div>

      {/* Group by priority */}
      {(['critical', 'urgent', 'normal'] as const).map((priority) => {
        const group = tasks.filter((t) => t.priority === priority);
        if (group.length === 0) return null;

        return (
          <div key={priority}>
            <div style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              color: priority === 'critical' ? 'var(--color-error)' : priority === 'urgent' ? 'var(--color-warning)' : 'var(--color-text-muted)',
              marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {priority === 'critical' && <AlertCircle size={12} />}
              {priority} ({group.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {group.map((task) => {
                const icon = getIconBg(task.type);
                return (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px',
                      background: 'var(--color-surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)',
                      borderLeft: `3px solid ${priority === 'critical' ? 'var(--color-error)' : priority === 'urgent' ? 'var(--color-warning)' : 'transparent'}`,
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
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
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
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
