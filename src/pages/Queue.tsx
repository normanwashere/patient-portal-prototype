import React from 'react';
import {
    MapPin,
    Check,
    Stethoscope,
    FlaskConical,
    Pill,
    Receipt,
    Clock,
    FileText,
    Download,
    Home,
    Info,
    PauseCircle,
    PlayCircle,
    CalendarClock,
    AlertCircle,
    X
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import { GeofenceCheckIn } from '../components/GeofenceCheckIn';
import './Queue.css';

const PAUSE_REASONS = [
    { id: 'fasting_required', label: 'I need to fast first', icon: '🍽️', description: 'Return after 8+ hours of fasting' },
    { id: 'return_tomorrow', label: "I'll come back tomorrow", icon: '📅', description: 'Continue your journey the next day' },
    { id: 'preparation_needed', label: 'Preparation needed', icon: '💧', description: 'E.g. full bladder for ultrasound' },
    { id: 'personal_request', label: 'Personal reasons', icon: '🏠', description: 'Step away and return later' },
] as const;

export const Queue: React.FC = () => {
    const [expandedStepId, setExpandedStepId] = React.useState<string | null>(null);
    const [showPauseModal, setShowPauseModal] = React.useState(false);
    const [selectedPauseReason, setSelectedPauseReason] = React.useState<string | null>(null);
    const [pauseNotesInput, setPauseNotesInput] = React.useState('');
    const [pauseResumeDateInput, setPauseResumeDateInput] = React.useState('');
    const [showGeofence, setShowGeofence] = React.useState(false);
    const {
        steps,
        queueInfo,
        queueMode,
        isQueueActive,
        joinQueue,
        activeSteps,
        pendingSteps,
        completedSteps,
        pausedSteps,
        isVisitComplete,
        queueForStep,
        queueAllAvailable,
        canQueueStep,
        isQueuePaused,
        pauseReason,
        pauseNotes,
        pauseResumeDate,
        pauseQueue,
        resumeQueue
    } = useData();
    const { showToast } = useToast();
    const activeStepRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (activeStepRef.current) {
            activeStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [isQueueActive, queueMode]); // Scroll when active or mode changes

    const getIcon = (type: string) => {
        if (type === 'TRIAGE') return Check;
        if (type === 'CONSULT') return Stethoscope;
        if (type === 'LAB' || type === 'IMAGING') return FlaskConical;
        if (type === 'PHARMACY') return Pill;
        if (type === 'BILLING') return Receipt;
        return Check;
    };

    const handleAction = (msg: string) => {
        showToast(msg, 'info');
    };

    const handleConfirmPause = () => {
        if (!selectedPauseReason) return;
        pauseQueue(selectedPauseReason, pauseNotesInput || undefined, pauseResumeDateInput || undefined);
        setShowPauseModal(false);
        setSelectedPauseReason(null);
        setPauseNotesInput('');
        setPauseResumeDateInput('');
    };

    const getPauseReasonLabel = (reason: string) => {
        const found = PAUSE_REASONS.find(r => r.id === reason);
        return found?.label ?? reason;
    };

    const StepDetailContent: React.FC<{ step: any; isBoard?: boolean }> = ({ step, isBoard }) => {
        const isActive = ['QUEUED', 'READY', 'IN_SESSION'].includes(step.status);
        if (!isActive && !isBoard) return null;

        return (
            <div className={`active-highlight-box ${isBoard ? 'board-expansion' : ''}`}>
                <div className="queue-comparison-grid">
                    <div className="queue-stat">
                        <span className="stat-label">Current Serving</span>
                        <span className="stat-value">{step.status === 'READY' || step.status === 'IN_SESSION' ? step.ticket : queueInfo?.currentServing || '--'}</span>
                    </div>
                    <div className="queue-stat">
                        <span className="stat-label highlight">Your Number</span>
                        <span className="stat-value highlight">{step.ticket}</span>
                    </div>
                </div>
                <div className="wait-time-row">
                    <div className="wait-time-item">
                        <Clock size={16} />
                        <span style={{ color: 'var(--color-primary-dark)', fontWeight: 800, fontSize: '0.9rem' }}>
                            {step.status === 'QUEUED' ? `~${step.waitMinutes} mins wait` : 'Called to station'}
                        </span>
                    </div>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                        {step.status === 'QUEUED' ? '4 ahead of you' : 'You are next'}
                    </span>
                </div>

                <div className="step-actions">
                    <button
                        className="action-btn primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAction(`Opening floor map for ${step.location}...`);
                        }}
                    >
                        Directions to {step.location.split(' ')[0]}
                    </button>
                    <button
                        className="action-btn secondary"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAction(`Retrieving orders for ${step.label}...`);
                        }}
                    >
                        <FileText size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> View Orders
                    </button>
                </div>

                <div className="step-card-content" style={{ marginTop: '1.5rem', padding: '0', border: 'none' }}>
                    <p className="step-description" style={{ fontSize: '0.875rem' }}>{step.description}</p>
                    {step.preparation && (
                        <p className="step-prep" style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>
                            <strong>Preparation:</strong> {step.preparation}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="journey-container">
            {/* Active Visit Header */}
            <div className="active-visit-header">
                {isQueueActive && !isVisitComplete && !isQueuePaused && (
                    <div className="active-pill">
                        <div className="pulsing-dot"></div>
                        Active Visit
                    </div>
                )}
                {isQueuePaused && (
                    <div className="active-pill" style={{ background: '#fef3c7', color: '#92400e' }}>
                        <PauseCircle size={14} style={{ marginRight: 4 }} />
                        Visit Paused
                    </div>
                )}
                <h1 className="journey-main-title">
                    {isVisitComplete ? 'Visit Summary' : isQueuePaused ? 'Visit Paused' : 'Your Patient Journey'}
                </h1>
                <div className="journey-date">
                    <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> • <span>General Check-up (Dr. Jen Diaz)</span>
                </div>
            </div>

            {/* ── Paused State Banner ── */}
            {isQueuePaused && (
                <div style={{
                    background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1px solid #fbbf24',
                    borderRadius: '1.25rem', padding: '1.5rem', marginBottom: '1.5rem',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center',
                }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: '#fbbf24', color: 'white', boxShadow: '0 4px 12px rgba(251,191,36,0.3)',
                    }}>
                        <PauseCircle size={28} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#92400e', marginBottom: 4 }}>
                            Your visit is paused
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#78350f', lineHeight: 1.5 }}>
                            {getPauseReasonLabel(pauseReason ?? '')}
                        </p>
                        {pauseNotes && (
                            <p style={{ fontSize: '0.75rem', color: '#92400e', marginTop: 6, fontStyle: 'italic' }}>
                                "{pauseNotes}"
                            </p>
                        )}
                        {pauseResumeDate && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, fontSize: '0.75rem', color: '#92400e' }}>
                                <CalendarClock size={14} />
                                <span>Expected return: <strong>{new Date(pauseResumeDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</strong></span>
                            </div>
                        )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#78350f', background: '#fef3c7', padding: '8px 14px', borderRadius: 8, border: '1px solid #fde68a' }}>
                        Your progress has been saved — you'll resume from <strong>{pausedSteps[0]?.label ?? 'your current step'}</strong> when you check in again.
                    </div>
                    <button
                        onClick={resumeQueue}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px',
                            background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 12,
                            fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
                            boxShadow: '0 4px 12px color-mix(in srgb, var(--color-primary), transparent 70%)',
                        }}
                    >
                        <PlayCircle size={18} /> Resume Visit
                    </button>
                </div>
            )}

            {/* ── Paused timeline (show completed + paused steps) ── */}
            {isQueuePaused && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {completedSteps.length > 0 && (
                        <section>
                            <h3 className="board-section-title">Completed</h3>
                            <div className="step-list-mini">
                                {completedSteps.map(step => (
                                    <div key={step.id} className="mini-step-item completed">
                                        <div className="mini-step-icon"><Check size={16} /></div>
                                        <div className="mini-step-info">
                                            <div className="mini-step-name">{step.label}</div>
                                            <div className="mini-step-meta">{step.location} • Done</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                    <section>
                        <h3 className="board-section-title" style={{ color: '#d97706' }}>Paused — Will Resume</h3>
                        <div className="step-list-mini">
                            {pausedSteps.map(step => (
                                <div key={step.id} className="mini-step-item" style={{ borderColor: '#fbbf24', background: '#fffbeb' }}>
                                    <div className="mini-step-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                                        <PauseCircle size={16} />
                                    </div>
                                    <div className="mini-step-info">
                                        <div className="mini-step-name">{step.label}</div>
                                        <div className="mini-step-meta">{step.location} • Paused</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                    {pendingSteps.length > 0 && (
                        <section>
                            <h3 className="board-section-title">Remaining</h3>
                            <div className="step-list-mini">
                                {pendingSteps.map(step => (
                                    <div key={step.id} className="mini-step-item">
                                        <div className="mini-step-icon">{React.createElement(getIcon(step.type), { size: 16 })}</div>
                                        <div className="mini-step-info">
                                            <div className="mini-step-name">{step.label}</div>
                                            <div className="mini-step-meta">{step.location} • Pending</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}

            {isVisitComplete ? (
                /* Visit Completed View */
                <div className="visit-completed-container" style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="completion-card" style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-transparent)', borderRadius: '1.25rem', padding: '2rem', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', background: 'var(--color-success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', margin: '0 auto 1.5rem' }}>
                            <Check size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>Visit Completed</h2>
                        <p style={{ color: 'var(--color-text)', opacity: 0.8 }}>All your scheduled steps for today are finished. You may now head to the exit.</p>
                    </div>

                    <div className="completion-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <button className="action-btn secondary" onClick={() => handleAction('Downloading medical summary...')}>
                            <Download size={18} style={{ marginRight: '8px', display: 'inline' }} /> Download Summary
                        </button>
                        <Link to="/dashboard" className="action-btn primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                            <Home size={18} style={{ marginRight: '8px' }} /> Return Home
                        </Link>
                    </div>

                    <section>
                        <h3 className="board-section-title">Completed Activity</h3>
                        <div className="step-list-mini">
                            {steps.map(step => (
                                <div key={step.id} className="mini-step-item completed">
                                    <div className="mini-step-icon">
                                        <Check size={16} />
                                    </div>
                                    <div className="mini-step-info">
                                        <div className="mini-step-name">{step.label}</div>
                                        <div className="mini-step-meta">{step.location} • Completed</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            ) : !isQueueActive ? (
                /* Check-In Landing State */
                <div className="checkin-landing-container" style={{ textAlign: 'center', padding: '4rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                    <div className="checkin-icon-placeholder" style={{ width: '80px', height: '80px', background: 'var(--color-primary-transparent)', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', marginBottom: '1rem' }}>
                        <Stethoscope size={40} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Ready to start?</h2>
                        <p style={{ color: '#64748b', maxWidth: '300px' }}>Check in now to begin your patient journey and see your place in the queue.</p>
                    </div>
                    <button
                        className="checkin-single-btn priority"
                        onClick={() => setShowGeofence(true)}
                        style={{ width: '100%', maxWidth: '280px', height: '3.5rem', fontSize: '1.1rem' }}
                    >
                        Check In Now
                    </button>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>Average wait time is currently 15 mins</p>
                </div>
            ) : (
                <>
                    {queueMode === 'LINEAR' ? (
                        /* Original Vertical Timeline (FlowView) */
                        <div className="timeline-container">
                            {steps.map((step) => {
                                const isCompleted = step.status === 'COMPLETED';
                                const isPaused = step.status === 'PAUSED';
                                const isActive = ['QUEUED', 'READY', 'IN_SESSION'].includes(step.status);
                                const statusClass = isCompleted ? 'completed' : isPaused ? 'paused' : isActive ? 'active' : '';
                                const StepIcon = getIcon(step.type);

                                return (
                                    <div
                                        key={step.id}
                                        className={`timeline-step ${statusClass}`}
                                        ref={isActive ? activeStepRef : null}
                                    >
                                        <div className="timeline-icon-wrapper">
                                            <div className="timeline-icon-circle">
                                                <StepIcon size={20} color={isActive || isCompleted ? 'currentColor' : '#9ca3af'} />
                                            </div>
                                        </div>
                                        <div className="step-card">
                                            {isActive && <div className="active-bar"></div>}
                                            <div className="step-card-header">
                                                <div>
                                                    <h3 className="step-title">{step.label}</h3>
                                                    <p className="step-meta"><MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} /> {step.location}</p>
                                                </div>
                                                <span className={`step-status-badge ${isPaused ? 'paused' : isActive ? 'in-progress' : isCompleted ? 'completed' : 'pending'}`}>
                                                    {step.status.replace('_', ' ')}
                                                </span>
                                            </div>

                                            {isActive ? (
                                                <StepDetailContent step={step} />
                                            ) : (
                                                <div className="step-card-content">
                                                    <p className="step-description">{step.description}</p>
                                                    {step.preparation && <p className="step-prep"><strong>Preparation:</strong> {step.preparation}</p>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* New Multi-Stream Board (BoardView) */
                        <div className="board-container">
                            <div className="requeue-reminder">
                                <Info size={16} />
                                <p><strong>Note:</strong> If you are called for a procedure while in another, you'll be automatically queued back to ensure you keep your spot.</p>
                            </div>
                            <section>
                                <h3 className="board-section-title">Active Orders</h3>
                                <div className="active-orders-grid">
                                    {activeSteps.map(step => {
                                        const StepIcon = getIcon(step.type);
                                        const status = step.status.toLowerCase().replace('_', '-');
                                        const isExpanded = expandedStepId === step.id;

                                        return (
                                            <div
                                                key={step.id}
                                                className={`active-tile ${status} ${isExpanded ? 'expanded' : ''}`}
                                                onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                                            >
                                                <div className="tile-top">
                                                    <div className="tile-icon-box">
                                                        <StepIcon size={18} />
                                                    </div>
                                                    <span className="tile-ticket">{step.ticket}</span>
                                                </div>
                                                <div className="tile-main">
                                                    <h4>{step.label}</h4>
                                                    {!isExpanded && (
                                                        <div className="tile-location">
                                                            <MapPin size={10} /> {step.location}
                                                        </div>
                                                    )}
                                                </div>
                                                {!isExpanded && (
                                                    <div className="tile-footer">
                                                        <span className={`tile-status-tag tag-${status}`}>{step.status.replace('_', ' ')}</span>
                                                        <div className="tile-wait">
                                                            <Clock size={10} /> {status === 'queued' ? `${step.waitMinutes}m` : 'Now'}
                                                        </div>
                                                    </div>
                                                )}

                                                {isExpanded && (
                                                    <div className="tile-expansion-content" onClick={(e) => e.stopPropagation()}>
                                                        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.75rem' }}>
                                                            <MapPin size={12} /> {step.location} • <span className={`tile-status-tag tag-${status}`} style={{ margin: 0 }}>{step.status.replace('_', ' ')}</span>
                                                        </div>
                                                        <StepDetailContent step={step} isBoard />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            {pendingSteps.length > 0 && (
                                <section>
                                    <div className="board-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h3 className="board-section-title" style={{ margin: 0 }}>Upcoming</h3>
                                        <button
                                            className="join-all-btn"
                                            onClick={() => {
                                                queueAllAvailable();
                                                showToast('Joining all available queues...', 'success');
                                            }}
                                        >
                                            Join All Available
                                        </button>
                                    </div>
                                    <div className="step-list-mini">
                                        {pendingSteps.map(step => {
                                            const isQueuable = canQueueStep(step.id);
                                            return (
                                                <div key={step.id} className={`mini-step-item ${isQueuable ? 'queuable' : ''}`}>
                                                    <div className="mini-step-icon">
                                                        {React.createElement(getIcon(step.type), { size: 16 })}
                                                    </div>
                                                    <div className="mini-step-info">
                                                        <div className="mini-step-name">{step.label}</div>
                                                        <div className="mini-step-meta">{step.location} • {step.waitMinutes}m wait</div>
                                                    </div>
                                                    {isQueuable && (
                                                        <button
                                                            className="mini-join-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                queueForStep(step.id);
                                                                showToast(`Joined queue for ${step.label}`, 'success');
                                                            }}
                                                        >
                                                            Join Queue
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                            {completedSteps.length > 0 && (
                                <section>
                                    <h3 className="board-section-title">Completed Today</h3>
                                    <div className="step-list-mini">
                                        {completedSteps.map(step => (
                                            <div key={step.id} className="mini-step-item completed">
                                                <div className="mini-step-icon">
                                                    <Check size={16} />
                                                </div>
                                                <div className="mini-step-info">
                                                    <div className="mini-step-name">{step.label}</div>
                                                    <div className="mini-step-meta">Finished at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Pause My Visit button — shown when queue is active and NOT paused */}
            {isQueueActive && !isVisitComplete && !isQueuePaused && (
                <button
                    onClick={() => setShowPauseModal(true)}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        width: '100%', padding: '14px', marginTop: '1rem',
                        background: 'white', color: '#92400e', border: '1px solid #fde68a',
                        borderRadius: 12, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                >
                    <PauseCircle size={18} /> Pause My Visit
                </button>
            )}

            {!isVisitComplete && !isQueuePaused && (
                /* Assistance Card */
                <div style={{ background: 'var(--color-background)', borderRadius: '1rem', padding: '1.25rem', border: '1px solid var(--color-border)', marginTop: '1.5rem', display: 'flex', gap: '1rem', color: 'var(--color-text)' }}>
                    <div style={{ flexShrink: 0, background: 'var(--color-surface)', padding: '0.5rem', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px' }}>
                        <Stethoscope size={20} style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                        <h4 style={{ fontWeight: 800, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Need Assistance?</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Our floor managers are wearing blue vests. Please approach them if you need help navigating.</p>
                    </div>
                </div>
            )}

            {/* ── Geofence Check-In Modal ── */}
            {showGeofence && (
                <GeofenceCheckIn
                    clinicName="Metro General Hospital"
                    onVerified={() => {
                        setShowGeofence(false);
                        joinQueue();
                        showToast('Location verified — checking you in!', 'success');
                    }}
                    onCancel={() => setShowGeofence(false)}
                />
            )}

            {/* ── Pause Modal ── */}
            {showPauseModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                }} onClick={() => setShowPauseModal(false)}>
                    <div
                        style={{
                            background: 'white', borderRadius: '1.5rem 1.5rem 0 0', width: '100%', maxWidth: 480,
                            maxHeight: '85vh', overflowY: 'auto', padding: '1.5rem',
                            animation: 'fadeInSlideUp 0.3s ease-out',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>Pause Your Visit</h3>
                            <button onClick={() => setShowPauseModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                                <X size={20} color="#94a3b8" />
                            </button>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                            Your progress will be saved. You can resume your journey when you return.
                        </p>

                        {/* Reason Selection */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.25rem' }}>
                            {PAUSE_REASONS.map(reason => (
                                <button
                                    key={reason.id}
                                    onClick={() => setSelectedPauseReason(reason.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                                        background: selectedPauseReason === reason.id ? '#fffbeb' : '#f8fafc',
                                        border: `2px solid ${selectedPauseReason === reason.id ? '#fbbf24' : '#e2e8f0'}`,
                                        borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                                    }}
                                >
                                    <span style={{ fontSize: '1.25rem' }}>{reason.icon}</span>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>{reason.label}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{reason.description}</div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Optional notes */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                                Notes (optional)
                            </label>
                            <textarea
                                value={pauseNotesInput}
                                onChange={(e) => setPauseNotesInput(e.target.value)}
                                placeholder="Any additional information..."
                                rows={2}
                                style={{
                                    width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 10,
                                    fontSize: '0.85rem', resize: 'none', fontFamily: 'inherit',
                                }}
                            />
                        </div>

                        {/* Preferred return date */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                                <CalendarClock size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                                Preferred return date (optional)
                            </label>
                            <input
                                type="date"
                                value={pauseResumeDateInput}
                                onChange={(e) => setPauseResumeDateInput(e.target.value)}
                                min={new Date().toISOString().slice(0, 10)}
                                style={{
                                    width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 10,
                                    fontSize: '0.85rem', fontFamily: 'inherit',
                                }}
                            />
                        </div>

                        {/* Warning */}
                        <div style={{
                            display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px',
                            background: '#fef3c7', borderRadius: 10, marginBottom: '1.25rem',
                            fontSize: '0.75rem', color: '#92400e', lineHeight: 1.4,
                        }}>
                            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                            <span>Paused visits expire after 48 hours. Please return within that window to continue your journey.</span>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                onClick={() => setShowPauseModal(false)}
                                style={{
                                    flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569',
                                    border: 'none', borderRadius: 12, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmPause}
                                disabled={!selectedPauseReason}
                                style={{
                                    flex: 1, padding: '12px',
                                    background: selectedPauseReason ? '#f59e0b' : '#e2e8f0',
                                    color: selectedPauseReason ? 'white' : '#94a3b8',
                                    border: 'none', borderRadius: 12, fontSize: '0.9rem', fontWeight: 700, cursor: selectedPauseReason ? 'pointer' : 'not-allowed',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                }}
                            >
                                <PauseCircle size={16} /> Pause Visit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
