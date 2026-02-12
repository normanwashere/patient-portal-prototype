import React, { useState } from 'react';
import { Settings, Play, Square, RotateCcw, LayoutGrid, List, X, Clock, UserCircle } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { useData } from '../context/DataContext';
import './DemoControls.css';

export const DemoControls: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showPill, setShowPill] = useState(false);
    const { tenant, setTenantId, availableTenants } = useTheme();
    const {
        toggleSimulation,
        isSimulating,
        queueMode,
        toggleQueueMode,
        leaveQueue,
        isQueueActive,
        isVisitComplete,
        advanceQueue,
        currentPatientId,
        availablePatients,
        switchPatient
    } = useData();
    const [lastCompletedState, setLastCompletedState] = useState(isVisitComplete);

    // Auto-hide pill when visit completes
    React.useEffect(() => {
        if (isVisitComplete && !lastCompletedState) {
            // Visit just completed
            if (isSimulating) {
                toggleSimulation();
            }
            // Optional: short delay before hiding pill to let user see "Finished"
            const timer = setTimeout(() => {
                setShowPill(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
        setLastCompletedState(isVisitComplete);
    }, [isVisitComplete, lastCompletedState, isSimulating, toggleSimulation]);

    return (
        <div className="demo-controls-wrapper">
            {isOpen && (
                <div className="demo-panel">
                    <div className="demo-panel-header">
                        <h3>Demo Settings</h3>
                        <button onClick={() => setIsOpen(false)} style={{ color: '#64748b' }}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* Patient Switcher */}
                    <div className="demo-section">
                        <span className="demo-label">Simulated Patient</span>
                        <div className="patient-list-v2">
                            {availablePatients.map((p) => (
                                <button
                                    key={p.id}
                                    className={`patient-opt-v2 ${currentPatientId === p.id ? 'active' : ''}`}
                                    onClick={() => switchPatient(p.id)}
                                >
                                    <div className="patient-avatar-mini">
                                        <UserCircle size={14} />
                                    </div>
                                    <div className="patient-info-mini">
                                        <span className="patient-name-mini">{p.name.split(' ')[0]}</span>
                                        <span className="patient-tier-mini">{p.membershipType.split(' ')[0]}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tenant Selector */}
                    <div className="demo-section">
                        <span className="demo-label">Hospital Brand</span>
                        <div className="tenant-grid">
                            {availableTenants.map((t) => (
                                <div
                                    key={t.id}
                                    className={`tenant-opt ${tenant.id === t.id ? 'active' : ''}`}
                                    onClick={() => setTenantId(t.id)}
                                >
                                    <div
                                        className="tenant-dot"
                                        style={{ background: t.id === 'metroGeneral' ? '#0891b2' : t.id === 'meralcoWellness' ? '#ea580c' : '#059669' }}
                                    />
                                    <span>{t.name.split(' ')[0]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Queue Mode Toggle */}
                    <div className="demo-section">
                        <span className="demo-label">Experience Mode</span>
                        <div className="demo-control-row" onClick={toggleQueueMode} style={{ cursor: 'pointer' }}>
                            <div className="demo-control-info">
                                <span className="demo-control-name">
                                    {queueMode === 'LINEAR' ? 'Linear Journey' : 'Multi-Stream'}
                                </span>
                                <span className="demo-control-desc">
                                    {queueMode === 'LINEAR' ? 'Step-by-step flow' : 'Simultaneous queues'}
                                </span>
                            </div>
                            {queueMode === 'LINEAR' ? <List size={20} color="#3b82f6" /> : <LayoutGrid size={20} color="#10b981" />}
                        </div>
                    </div>

                    {/* Simulation Controls */}
                    <div className="demo-section">
                        <span className="demo-label">Simulation</span>
                        {isQueueActive ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <button
                                    className={`sim-button ${isSimulating ? 'stop' : 'start'}`}
                                    onClick={() => {
                                        toggleSimulation();
                                        setIsOpen(false);
                                        setShowPill(true);
                                    }}
                                    disabled={isVisitComplete}
                                >
                                    {isSimulating ? (
                                        <>
                                            <Square size={16} fill="currentColor" />
                                            <span>Stop Auto-Advance</span>
                                        </>
                                    ) : (
                                        <>
                                            <Play size={16} fill="currentColor" />
                                            <span>Run Patient Journey</span>
                                        </>
                                    )}
                                </button>
                                <button className="sim-button reset" onClick={leaveQueue}>
                                    <RotateCcw size={16} />
                                    <span>Reset Entire Visit</span>
                                </button>
                            </div>
                        ) : (
                            <p className="demo-control-desc" style={{ textAlign: 'center', fontStyle: 'italic' }}>
                                Check in to enable simulation
                            </p>
                        )}
                    </div>
                </div>
            )}

            {showPill ? (
                /* Simulation Control Pill */
                <div className="demo-pill">
                    <button
                        className="pill-btn advance"
                        onClick={advanceQueue}
                        title="Advance Step"
                        disabled={isVisitComplete}
                    >
                        <Play size={20} fill="currentColor" />
                        <span>Advance Step</span>
                    </button>
                    <div className="pill-divider"></div>
                    <button
                        className="pill-btn stop"
                        onClick={() => {
                            if (isSimulating) toggleSimulation();
                            setShowPill(false);
                        }}
                        title="Stop Simulation"
                    >
                        <Square size={18} fill="currentColor" />
                        <span>Stop</span>
                    </button>
                </div>
            ) : (
                /* Standard Settings Toggle */
                <button
                    className={`demo-toggle-fab ${isOpen ? 'active' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                    title="Demo Settings"
                >
                    {isOpen ? <X size={24} /> : (
                        isSimulating ? <Clock size={24} className="spin" /> : <Settings size={24} />
                    )}
                </button>
            )}
        </div>
    );
};
