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
    Info
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import './Queue.css';

export const Queue: React.FC = () => {
    const [expandedStepId, setExpandedStepId] = React.useState<string | null>(null);
    const {
        steps,
        queueInfo,
        queueMode,
        isQueueActive,
        joinQueue,
        activeSteps,
        pendingSteps,
        completedSteps,
        isVisitComplete,
        queueForStep,
        queueAllAvailable,
        canQueueStep
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
                {isQueueActive && !isVisitComplete && (
                    <div className="active-pill">
                        <div className="pulsing-dot"></div>
                        Active Visit
                    </div>
                )}
                <h1 className="journey-main-title">
                    {isVisitComplete ? 'Visit Summary' : 'Your Patient Journey'}
                </h1>
                <div className="journey-date">
                    <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> • <span>General Check-up (Dr. Jen Diaz)</span>
                </div>
            </div>

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
                        onClick={() => joinQueue()}
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
                                const isActive = ['QUEUED', 'READY', 'IN_SESSION'].includes(step.status);
                                const statusClass = isCompleted ? 'completed' : isActive ? 'active' : '';
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
                                                <span className={`step-status-badge ${isActive ? 'in-progress' : isCompleted ? 'completed' : 'pending'}`}>
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

            {!isVisitComplete && (
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
        </div>
    );
};
