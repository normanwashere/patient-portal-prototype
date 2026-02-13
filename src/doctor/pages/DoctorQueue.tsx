import { useState, useEffect } from 'react';
import {
  PhoneCall,
  UserCheck,
  CheckCircle2,
  UserX,
  Clock,
  ChevronRight,
  Stethoscope,
  AlertTriangle,
  SkipForward,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProvider } from '../../provider/context/ProviderContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../theme/ThemeContext';

export const DoctorQueue = () => {
  const {
    currentStaff, queuePatients, queueStats,
    callNextPatient, startPatient, completePatient,
    markNoShow, skipPatient,
  } = useProvider();
  const { showToast } = useToast();
  const { tenant } = useTheme();
  const queueEnabled = tenant.features.queue;
  const navigate = useNavigate();
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Use 'Consult' station type to match queue patients' stationType/stationName
  const consultRoomId = 'Consult';

  const myQueue = queuePatients
    .filter(p => (p.stationType === 'Consult' || p.stationType === 'Return-Consult') && (p.assignedDoctor === currentStaff?.name || !p.assignedDoctor))
    .sort((a, b) => {
      const order = { IN_SESSION: 0, READY: 1, QUEUED: 2 };
      const ao = order[a.status as keyof typeof order] ?? 3;
      const bo = order[b.status as keyof typeof order] ?? 3;
      if (ao !== bo) return ao - bo;
      return new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime();
    });

  const inSession = myQueue.filter(p => p.status === 'IN_SESSION');
  const ready = myQueue.filter(p => p.status === 'READY');
  const queued = myQueue.filter(p => p.status === 'QUEUED');

  const handleCallNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    callNextPatient(consultRoomId);
    showToast('Next patient called', 'success');
  };
  const handleStart = (pid: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    startPatient(pid);
    showToast('Consult started', 'success');
    navigate('/doctor/encounter');
  };
  const handleComplete = (pid: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    completePatient(pid);
    showToast('Consult completed', 'success');
  };
  const handleNoShow = (pid: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    markNoShow(pid);
    showToast('Patient marked as no-show', 'info');
  };
  const handleSkip = (pid: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    skipPatient(pid);
    showToast('Patient moved to end of queue', 'info');
  };

  const getWaitColor = (wait: number) => {
    if (wait > 30) return 'var(--color-error)';
    if (wait > 15) return 'var(--color-warning)';
    return 'var(--color-text-muted)';
  };

  const renderCard = (p: typeof myQueue[0]) => {
    const isActive = p.status === 'IN_SESSION';
    const isReady = p.status === 'READY';
    return (
      <div
        key={p.id}
        className={`doc-patient-card ${isActive ? 'doc-patient-card--session' : isReady ? 'doc-patient-card--ready' : ''}`}
        onClick={isActive ? () => navigate('/doctor/encounter') : undefined}
      >
        <div className="doc-row doc-row--between" style={{ marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)' }}>{p.ticketNumber}</span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4, background: `color-mix(in srgb, ${getWaitColor(p.waitMinutes)} 10%, transparent)`, color: getWaitColor(p.waitMinutes) }}>
            <Clock size={12} /> {p.waitMinutes} min
          </span>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
          {p.patientName}
          {p.priority !== 'Normal' && (
            <span className={`doc-badge ${p.priority === 'Emergency' ? 'doc-badge--error' : 'doc-badge--warning'}`} style={{ marginLeft: 8 }}>
              {p.priority === 'Emergency' && <AlertTriangle size={10} style={{ marginRight: 2 }} />}
              {p.priority}
            </span>
          )}
        </div>
        {p.chiefComplaint && (
          <div className="doc-label-sm" style={{ fontStyle: 'italic', marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <Stethoscope size={13} style={{ marginTop: 2, flexShrink: 0 }} /> "{p.chiefComplaint}"
          </div>
        )}
        <div className="doc-label-sm" style={{ marginBottom: 10 }}>
          ID: {p.patientId}
          {isActive && <span style={{ color: 'var(--color-primary)', fontWeight: 600, marginLeft: 8 }}>In Session</span>}
          {isReady && <span style={{ color: 'var(--color-success)', fontWeight: 600, marginLeft: 8 }}>Ready</span>}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {p.status === 'QUEUED' && (
            <>
              <button className="doc-btn doc-btn--primary" style={{ padding: '10px 16px', fontSize: 13 }} onClick={e => handleCallNext(e)}>
                <PhoneCall size={14} /> Call
              </button>
              <button className="doc-btn doc-btn--secondary" style={{ padding: '10px 16px', fontSize: 13 }} onClick={e => handleSkip(p.patientId, e)}>
                <SkipForward size={14} /> Skip
              </button>
              <button className="doc-btn doc-btn--ghost" style={{ fontSize: 13 }} onClick={e => handleNoShow(p.patientId, e)}>
                <UserX size={14} /> No-Show
              </button>
            </>
          )}
          {p.status === 'READY' && (
            <button className="doc-btn doc-btn--success" style={{ padding: '10px 16px', fontSize: 13 }} onClick={e => handleStart(p.patientId, e)}>
              <UserCheck size={14} /> Start Consult
            </button>
          )}
          {p.status === 'IN_SESSION' && (
            <>
              <button className="doc-btn doc-btn--success" style={{ padding: '10px 16px', fontSize: 13 }} onClick={e => handleComplete(p.patientId, e)}>
                <CheckCircle2 size={14} /> Complete
              </button>
              <button className="doc-btn doc-btn--secondary" style={{ padding: '10px 14px', fontSize: 13 }}
                onClick={e => { e.stopPropagation(); navigate('/doctor/encounter'); }}>
                <ChevronRight size={14} /> Open Encounter
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const statsBar = (
    <div className="doc-stats-bar" style={{ marginBottom: 16 }}>
      <div className="doc-stat-chip">
        <div className="doc-stat-value" style={{ color: 'var(--color-success)' }}>{queueStats.completedToday}</div>
        <div className="doc-label-sm">Seen today</div>
      </div>
      <div className="doc-stat-chip">
        <div className="doc-stat-value">{queueStats.avgWaitTime || 18} min</div>
        <div className="doc-label-sm">Avg wait</div>
      </div>
      <div className="doc-stat-chip">
        <div className="doc-stat-value" style={{ color: 'var(--color-warning)' }}>{myQueue.length}</div>
        <div className="doc-label-sm">In my queue</div>
      </div>
    </div>
  );

  const queueList = myQueue.length === 0 ? (
    <div className="doc-card doc-empty-state">
      <Stethoscope size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
      <div className="doc-font-bold" style={{ color: 'var(--color-text)' }}>No patients waiting</div>
      <div className="doc-label-sm">Patients will appear here when they check in for your consultation.</div>
    </div>
  ) : (
    <>
      {inSession.length > 0 && (
        <>
          <div className="doc-section-label">Currently Seeing</div>
          {inSession.map(renderCard)}
        </>
      )}
      {ready.length > 0 && (
        <>
          <div className="doc-section-label">Ready for Consult</div>
          {ready.map(renderCard)}
        </>
      )}
      {queued.length > 0 && (
        <>
          <div className="doc-section-label">Waiting ({queued.length})</div>
          {queued.map(renderCard)}
        </>
      )}
    </>
  );

  if (!queueEnabled) {
    return (
      <div className="doc-page">
        <div className="doc-card doc-empty-state" style={{ textAlign: 'center', padding: 40 }}>
          <Stethoscope size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
          <h3 className="doc-font-bold" style={{ marginBottom: 8 }}>Queue not available</h3>
          <p className="doc-label-sm" style={{ marginBottom: 20 }}>
            The queue feature is not enabled for this facility. Use your schedule to manage appointments.
          </p>
          <button className="doc-btn doc-btn--primary" onClick={() => navigate('/doctor/schedule')}>
            View Schedule
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-row doc-row--between" style={{ marginBottom: 16 }}>
        <div>
          <h2 className="doc-font-xl doc-font-bold" style={{ fontSize: 20 }}>My Queue</h2>
          <div className="doc-label-sm">Patients waiting for your consultation</div>
        </div>
      </div>

      {isDesktop ? (
        <div className="doc-desktop-grid">
          <div className="doc-desktop-main">
            {queued.length > 0 && inSession.length === 0 && (
              <button className="doc-btn doc-btn--primary" style={{ width: '100%', marginBottom: 16 }} onClick={() => handleCallNext()}>
                <PhoneCall size={18} /> Call Next Patient
              </button>
            )}
            {queueList}
          </div>
          <div className="doc-desktop-aside">
            {statsBar}
          </div>
        </div>
      ) : (
        <>
          {statsBar}
          {queued.length > 0 && inSession.length === 0 && (
            <button className="doc-btn doc-btn--primary" style={{ width: '100%', marginBottom: 16 }} onClick={() => handleCallNext()}>
              <PhoneCall size={18} /> Call Next Patient
            </button>
          )}
          {queueList}
        </>
      )}
    </div>
  );
};
