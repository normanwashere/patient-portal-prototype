import React from 'react';
import {
    LogIn,
    ArrowRight,
    Check,
    Stethoscope,
    FlaskConical,
    Pill,
    Receipt
} from 'lucide-react';
import '../pages/Queue.css'; // Import Journey styles
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import './CheckInCard.css';

interface CheckInCardProps {
    onCheckIn: (type: 'priority' | 'walkin') => void;
    onLeaveQueue: () => void;
}

export const CheckInCard: React.FC<CheckInCardProps> = ({
    onCheckIn,
}) => {
    const {
        steps,
        queueInfo,
        isQueueActive,
        currentStepIndex,
        visitProgress,
        isVisitComplete
    } = useData();

    const currentStep = steps[currentStepIndex];
    const displayIndex = currentStepIndex;
    const isComplete = steps.every(s => s.status === 'COMPLETED');

    // Determine status color/label based on global step
    const getStatusLabel = () => {
        if (isComplete) return { status: 'complete', label: 'Complete', destination: 'Visit Complete' };
        if (!currentStep) return { status: 'waiting', label: 'Waiting', destination: 'Please wait' };

        let statusClass = 'waiting';
        let statusText = 'Waiting';
        let destinationText = `Go to ${currentStep.location}`;

        if (currentStep.status === 'IN_SESSION') {
            statusClass = 'in-progress';
            statusText = 'In Progress';
            destinationText = `Complete the ${currentStep.label} steps`;
        } else if (currentStep.status === 'READY') {
            statusClass = 'ready';
            statusText = 'Ready';
            destinationText = `${currentStep.location} is ready for you, please approach`;
        } else if (currentStep.status === 'QUEUED') {
            statusClass = 'queued';
            statusText = 'Queued';
            destinationText = `Make your way to ${currentStep.location} (${currentStep.floor} ${currentStep.wing} Wing)`;
        }

        return {
            status: statusClass,
            label: `${currentStep.label} (${statusText})`,
            destination: destinationText
        };
    };

    const statusInfo = getStatusLabel();

    // After check-in: show queue number and current stage or Completion
    if (isQueueActive && queueInfo) {
        if (isVisitComplete) {
            return (
                <div className="journey-card dashboard-widget completed">
                    <div className="journey-header compact" style={{ paddingBottom: '0.5rem' }}>
                        <div>
                            <h2 className="journey-title" style={{ fontSize: '1rem' }}>Visit Completed</h2>
                            <p className="journey-subtitle">Finished Today • {new Date().toLocaleDateString()}</p>
                        </div>
                        <Link to="/queue" className="view-journey-link">
                            Summary <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="completion-widget-content" style={{ padding: '1rem', textAlign: 'center', background: 'var(--color-primary-light)', borderRadius: '1rem', margin: '0 1rem 1rem', border: '1px solid var(--color-primary-transparent)' }}>
                        <div style={{ width: '32px', height: '32px', background: 'var(--color-success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', margin: '0 auto 0.5rem' }}>
                            <Check size={18} />
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-primary-dark)', fontWeight: '600' }}>All steps finished. Safe travels!</p>
                    </div>
                    <div className="visit-progress-bar-mini" style={{ height: '4px', background: 'var(--color-success)', width: '100%', borderBottomLeftRadius: '1.25rem', borderBottomRightRadius: '1.25rem' }}></div>
                </div>
            );
        }

        const isReady = currentStep?.status === 'READY';

        return (
            <div className={`journey-card dashboard-widget ${isReady ? 'ready-attention' : ''}`}>
                <div className="journey-card-top-line">
                    <div className="journey-card-progress" style={{ width: `${(displayIndex / (steps.length - 1)) * 100}%` }}></div>
                </div>

                <div className="journey-header compact" style={{ paddingBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div>
                            <h2 className="journey-title" style={{ fontSize: '1rem' }}>Journey Status</h2>
                            <p className="journey-subtitle">Visit #829 • Today</p>
                        </div>
                        {currentStep && (
                            <span className={`step-status-badge ${['QUEUED', 'READY', 'IN_SESSION'].includes(currentStep.status) ? 'in-progress' : currentStep.status === 'COMPLETED' ? 'completed' : 'pending'}`} style={{ fontSize: '0.6rem', padding: '0.15rem 0.5rem' }}>
                                {currentStep.status.replace('_', ' ')}
                            </span>
                        )}
                    </div>
                    <Link to="/queue" className="view-journey-link">
                        View <ArrowRight size={14} />
                    </Link>
                </div>

                {/* Horizontal Steps (Compact) */}
                <div className="horizontal-steps compact" style={{ marginBottom: '1rem', padding: '0 1rem' }}>
                    {steps.slice(0, 5).map((step, index) => {
                        const isCompleted = index < displayIndex;
                        const isActive = index === displayIndex;
                        const statusClass = isCompleted ? 'completed' : isActive ? 'active' : '';

                        let StepIcon = Check;
                        if (step.type === 'TRIAGE') StepIcon = Check;
                        else if (step.type === 'CONSULT') StepIcon = Stethoscope;
                        else if (step.type === 'LAB' || step.type === 'IMAGING') StepIcon = FlaskConical;
                        else if (step.type === 'PHARMACY') StepIcon = Pill;
                        else if (step.type === 'BILLING') StepIcon = Receipt;

                        return (
                            <React.Fragment key={step.id}>
                                <div className={`h-step-item ${statusClass}`}>
                                    <div className="h-step-icon" style={{ width: '1.75rem', height: '1.75rem' }}>
                                        <StepIcon size={12} />
                                    </div>
                                </div>
                                {index < 4 && <div className={`h-connector ${index < displayIndex ? 'filled' : ''}`}></div>}
                            </React.Fragment>
                        )
                    })}
                </div>

                <div className="queue-info-box" style={{ margin: '0 1rem 1rem', padding: '0.75rem' }}>
                    <div className="queue-info-left">
                        <div className="your-number-badge">
                            <span className="your-number-label">Your #</span>
                            <span className="your-number-value" style={{ fontSize: '1.1rem' }}>{queueInfo.queueNumber}</span>
                        </div>
                        <div className="queue-details-text">
                            <span className="queue-name" style={{ fontSize: '0.7rem' }}>{statusInfo.destination}</span>
                            <span className="people-ahead" style={{ fontSize: '0.65rem' }}>{queueInfo.peopleAhead} ahead</span>
                        </div>
                    </div>
                    {/* Circle Progress */}
                    <div className="circular-progress" style={{ width: '2.5rem', height: '2.5rem' }}>
                        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 48 48">
                            <circle cx="24" cy="24" r="18" stroke="#f1f5f9" strokeWidth="4" fill="none" />
                            <circle cx="24" cy="24" r="18" stroke="var(--color-primary)" strokeWidth="4" fill="none"
                                strokeDasharray="113"
                                strokeDashoffset={113 - (113 * visitProgress) / 100}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                            />
                        </svg>
                        <span className="circular-text" style={{ fontSize: '0.6rem' }}>{visitProgress}%</span>
                    </div>
                </div>
            </div>
        );
    }

    // Before check-in: single button
    return (
        <button
            className="checkin-single-btn priority"
            onClick={() => onCheckIn('priority')}
        >
            <LogIn size={18} />
            <span>Check In</span>
        </button>
    );
};
