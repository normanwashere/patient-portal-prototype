import React, { useState, useCallback } from 'react';
import {
    Settings, Play, Square, RotateCcw, LayoutGrid, List,
    X, Clock, UserCircle, Plus, Trash2, ChevronDown, ChevronUp,
    Check, Sparkles, Clapperboard,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../theme/ThemeContext';
import { useData } from '../context/DataContext';
import type { TenantConfig, TenantFeatures, VisitFeatures } from '../types/tenant';
import './DemoControls.css';

/* ─────────────── Presets & Palettes ─────────────── */

type FeaturePreset = 'hospital' | 'clinic' | 'basic';

const FEATURE_PRESETS: Record<FeaturePreset, { label: string; description: string; features: TenantFeatures }> = {
    hospital: {
        label: 'Full Hospital',
        description: 'All features enabled',
        features: {
            sso: true, loa: true, hmo: true, philHealth: true,
            queue: true, appointments: true,
            multiLocation: true, admissions: true, cdss: true, aiAssistant: true,
            visits: {
                teleconsultEnabled: true, teleconsultNowEnabled: true, teleconsultLaterEnabled: true,
                clinicVisitEnabled: true, clinicF2fSchedulingEnabled: true, clinicLabFulfillmentEnabled: true,
            },
        },
    },
    clinic: {
        label: 'Standard Clinic',
        description: 'Clinic + labs, HMO only',
        features: {
            sso: true, loa: false, hmo: true, philHealth: false,
            queue: true, appointments: true,
            multiLocation: false, admissions: false, cdss: true, aiAssistant: false,
            visits: {
                teleconsultEnabled: true, teleconsultNowEnabled: false, teleconsultLaterEnabled: true,
                clinicVisitEnabled: true, clinicF2fSchedulingEnabled: true, clinicLabFulfillmentEnabled: true,
            },
        },
    },
    basic: {
        label: 'Basic Clinic',
        description: 'No teleconsult, no labs, PhilHealth only',
        features: {
            sso: false, loa: false, hmo: false, philHealth: true,
            queue: true, appointments: true,
            multiLocation: false, admissions: false, cdss: false, aiAssistant: false,
            visits: {
                teleconsultEnabled: false, teleconsultNowEnabled: false, teleconsultLaterEnabled: false,
                clinicVisitEnabled: true, clinicF2fSchedulingEnabled: true, clinicLabFulfillmentEnabled: false,
            },
        },
    },
};

const COLOR_OPTIONS = [
    { label: 'Blue', primary: '#0284c7', secondary: '#06b6d4', background: '#f3f4f6', surface: '#ffffff', text: '#0f172a', textMuted: '#64748b', border: '#e5e7eb' },
    { label: 'Orange', primary: '#f97316', secondary: '#d1d5db', background: '#f9fafb', surface: '#ffffff', text: '#431407', textMuted: '#9a3412', border: '#fdba74' },
    { label: 'Green', primary: '#22c55e', secondary: '#15803d', background: '#f0fdf4', surface: '#ffffff', text: '#14532d', textMuted: '#166534', border: '#86efac' },
    { label: 'Purple', primary: '#8b5cf6', secondary: '#a78bfa', background: '#f5f3ff', surface: '#ffffff', text: '#1e1b4b', textMuted: '#6d28d9', border: '#c4b5fd' },
    { label: 'Rose', primary: '#e11d48', secondary: '#fb7185', background: '#fff1f2', surface: '#ffffff', text: '#4c0519', textMuted: '#9f1239', border: '#fda4af' },
    { label: 'Teal', primary: '#0d9488', secondary: '#14b8a6', background: '#f0fdfa', surface: '#ffffff', text: '#134e4a', textMuted: '#0f766e', border: '#99f6e4' },
];

const BUILTIN_IDS = ['metroGeneral', 'meralcoWellness', 'healthFirst'];

/* ─────────────── Feature label helpers ─────────────── */

const FEATURE_LABELS: { key: keyof TenantFeatures; label: string; group: 'core' }[] = [
    { key: 'sso', label: 'SSO Login', group: 'core' },
    { key: 'hmo', label: 'HMO Integration', group: 'core' },
    { key: 'philHealth', label: 'PhilHealth', group: 'core' },
    { key: 'loa', label: 'LOA Requests', group: 'core' },
    { key: 'queue', label: 'Queue System', group: 'core' },
    { key: 'appointments', label: 'Appointments', group: 'core' },
    { key: 'multiLocation', label: 'Multi-Location', group: 'core' },
    { key: 'admissions', label: 'Admissions', group: 'core' },
    { key: 'cdss', label: 'CDSS Alerts', group: 'core' },
    { key: 'aiAssistant', label: 'AI Assistant', group: 'core' },
];

const VISIT_LABELS: { key: keyof VisitFeatures; label: string; parent?: keyof VisitFeatures }[] = [
    { key: 'teleconsultEnabled', label: 'Teleconsult' },
    { key: 'teleconsultNowEnabled', label: '↳ Consult Now', parent: 'teleconsultEnabled' },
    { key: 'teleconsultLaterEnabled', label: '↳ Consult Later', parent: 'teleconsultEnabled' },
    { key: 'clinicVisitEnabled', label: 'Clinic Visits' },
    { key: 'clinicF2fSchedulingEnabled', label: '↳ F2F Scheduling', parent: 'clinicVisitEnabled' },
    { key: 'clinicLabFulfillmentEnabled', label: '↳ Lab Fulfillment', parent: 'clinicVisitEnabled' },
];

/* ─────────────── Component ─────────────── */

export const DemoControls: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showPill, setShowPill] = useState(false);
    const location = useLocation();
    const isDoctorPortal = location.pathname.startsWith('/doctor');
    const isDoctorSimRunning = isDoctorPortal && !!(window as any).__doctorSimulationRunning;
    const { tenant, setTenantId, availableTenants, addTenant, removeTenant, updateTenantFeatures } = useTheme();
    const {
        toggleSimulation, isSimulating, queueMode, toggleQueueMode,
        leaveQueue, isQueueActive, isVisitComplete, advanceQueue,
        currentPatientId, availablePatients, switchPatient,
    } = useData();
    const [lastCompletedState, setLastCompletedState] = useState(isVisitComplete);

    // Create tenant state
    const [showCreateTenant, setShowCreateTenant] = useState(false);
    const [showFeatureDetails, setShowFeatureDetails] = useState(false);
    const [newTenantName, setNewTenantName] = useState('');
    const [newTenantTagline, setNewTenantTagline] = useState('');
    const [selectedPreset, setSelectedPreset] = useState<FeaturePreset>('clinic');
    const [selectedColorIdx, setSelectedColorIdx] = useState(0);
    const [customFeatures, setCustomFeatures] = useState<TenantFeatures>(FEATURE_PRESETS.clinic.features);

    // Auto-hide pill when visit completes
    React.useEffect(() => {
        if (isVisitComplete && !lastCompletedState) {
            if (isSimulating) toggleSimulation();
            const timer = setTimeout(() => setShowPill(false), 3000);
            return () => clearTimeout(timer);
        }
        setLastCompletedState(isVisitComplete);
    }, [isVisitComplete, lastCompletedState, isSimulating, toggleSimulation]);

    const handlePresetChange = useCallback((preset: FeaturePreset) => {
        setSelectedPreset(preset);
        setCustomFeatures({ ...FEATURE_PRESETS[preset].features });
    }, []);

    // ── Live toggle helpers for CURRENT tenant ──
    const liveToggleFeature = useCallback((key: keyof TenantFeatures) => {
        const next = { ...tenant.features, [key]: !tenant.features[key] };
        updateTenantFeatures(next);
    }, [tenant.features, updateTenantFeatures]);

    const liveToggleVisitFeature = useCallback((key: keyof VisitFeatures) => {
        const nextVisits = { ...tenant.features.visits, [key]: !tenant.features.visits[key] };
        // Parent-child dependency: turning off parent disables children
        if (key === 'teleconsultEnabled' && !nextVisits.teleconsultEnabled) {
            nextVisits.teleconsultNowEnabled = false;
            nextVisits.teleconsultLaterEnabled = false;
        }
        if (key === 'clinicVisitEnabled' && !nextVisits.clinicVisitEnabled) {
            nextVisits.clinicF2fSchedulingEnabled = false;
            nextVisits.clinicLabFulfillmentEnabled = false;
        }
        updateTenantFeatures({ ...tenant.features, visits: nextVisits });
    }, [tenant.features, updateTenantFeatures]);

    const liveApplyPreset = useCallback((preset: FeaturePreset) => {
        updateTenantFeatures({ ...FEATURE_PRESETS[preset].features });
    }, [updateTenantFeatures]);

    const toggleFeature = useCallback((key: keyof TenantFeatures) => {
        setCustomFeatures(prev => {
            const next = { ...prev, [key]: !prev[key] };
            return next;
        });
    }, []);

    const toggleVisitFeature = useCallback((key: keyof VisitFeatures) => {
        setCustomFeatures(prev => {
            const nextVisits = { ...prev.visits, [key]: !prev.visits[key] };
            // If parent teleconsult turned off, also turn off children
            if (key === 'teleconsultEnabled' && !nextVisits.teleconsultEnabled) {
                nextVisits.teleconsultNowEnabled = false;
                nextVisits.teleconsultLaterEnabled = false;
            }
            // If parent clinic turned off, also turn off children
            if (key === 'clinicVisitEnabled' && !nextVisits.clinicVisitEnabled) {
                nextVisits.clinicF2fSchedulingEnabled = false;
                nextVisits.clinicLabFulfillmentEnabled = false;
            }
            return { ...prev, visits: nextVisits };
        });
    }, []);

    const handleCreateTenant = useCallback(() => {
        if (!newTenantName.trim()) return;
        const id = newTenantName.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now();
        const colors = COLOR_OPTIONS[selectedColorIdx];
        const config: TenantConfig = {
            id,
            name: newTenantName.trim(),
            tagline: newTenantTagline.trim() || undefined,
            logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(newTenantName.trim())}&background=${colors.primary.slice(1)}&color=fff&size=128&bold=true`,
            colors: {
                primary: colors.primary,
                secondary: colors.secondary,
                background: colors.background,
                surface: colors.surface,
                text: colors.text,
                textMuted: colors.textMuted,
                border: colors.border,
            },
            features: { ...customFeatures },
        };
        addTenant(config);
        setTenantId(id);
        setShowCreateTenant(false);
        setNewTenantName('');
        setNewTenantTagline('');
    }, [newTenantName, newTenantTagline, selectedColorIdx, customFeatures, addTenant, setTenantId]);

    // Hide entirely when doctor simulation is running
    if (isDoctorSimRunning) return null;

    return (
        <div className="demo-controls-wrapper">
            {isOpen && (
                <div className="demo-panel" style={showCreateTenant ? { width: 340 } : undefined}>
                    <div className="demo-panel-header">
                        <h3>{showCreateTenant ? 'Create Tenant' : 'Demo Settings'}</h3>
                        <button onClick={() => { setIsOpen(false); setShowCreateTenant(false); }} style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={18} />
                        </button>
                    </div>

                    {showCreateTenant ? (
                        /* ─── CREATE TENANT PANEL ─── */
                        <div className="create-tenant-panel">
                            {/* Name & Tagline */}
                            <input
                                className="demo-input"
                                placeholder="Tenant Name"
                                value={newTenantName}
                                onChange={(e) => setNewTenantName(e.target.value)}
                                maxLength={40}
                            />
                            <input
                                className="demo-input"
                                placeholder="Tagline (optional)"
                                value={newTenantTagline}
                                onChange={(e) => setNewTenantTagline(e.target.value)}
                                maxLength={60}
                            />

                            {/* Color Picker */}
                            <span className="demo-label">Brand Color</span>
                            <div className="color-palette">
                                {COLOR_OPTIONS.map((c, i) => (
                                    <button
                                        key={c.label}
                                        className={`color-swatch ${selectedColorIdx === i ? 'active' : ''}`}
                                        style={{ background: c.primary }}
                                        onClick={() => setSelectedColorIdx(i)}
                                        title={c.label}
                                    >
                                        {selectedColorIdx === i && <Check size={12} color="white" />}
                                    </button>
                                ))}
                            </div>

                            {/* Feature Presets */}
                            <span className="demo-label">Feature Preset</span>
                            <div className="preset-grid">
                                {(Object.entries(FEATURE_PRESETS) as [FeaturePreset, typeof FEATURE_PRESETS[FeaturePreset]][]).map(([key, preset]) => (
                                    <button
                                        key={key}
                                        className={`preset-btn ${selectedPreset === key ? 'active' : ''}`}
                                        onClick={() => handlePresetChange(key)}
                                    >
                                        <strong>{preset.label}</strong>
                                        <span>{preset.description}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Feature Checkboxes */}
                            <span className="demo-label">Feature Flags</span>
                            <div className="feature-checklist">
                                {FEATURE_LABELS.map(({ key, label }) => (
                                    <label key={key} className="feature-check">
                                        <input
                                            type="checkbox"
                                            checked={!!customFeatures[key]}
                                            onChange={() => toggleFeature(key)}
                                        />
                                        <span>{label}</span>
                                    </label>
                                ))}
                                <div className="feature-divider" />
                                {VISIT_LABELS.map(({ key, label, parent }) => {
                                    const parentOff = parent ? !customFeatures.visits[parent] : false;
                                    return (
                                        <label key={key} className={`feature-check ${parentOff ? 'disabled' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={!!customFeatures.visits[key]}
                                                onChange={() => toggleVisitFeature(key)}
                                                disabled={parentOff}
                                            />
                                            <span>{label}</span>
                                        </label>
                                    );
                                })}
                            </div>

                            {/* Actions */}
                            <div className="create-tenant-actions">
                                <button className="btn-cancel-tenant" onClick={() => setShowCreateTenant(false)}>
                                    Cancel
                                </button>
                                <button
                                    className="btn-create-tenant"
                                    disabled={!newTenantName.trim()}
                                    onClick={handleCreateTenant}
                                >
                                    <Sparkles size={14} /> Create
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* ─── MAIN DEMO PANEL ─── */
                        <>
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
                                <div className="tenant-grid-v2">
                                    {availableTenants.map((t) => (
                                        <div key={t.id} className="tenant-card-wrap">
                                            <div
                                                className={`tenant-opt ${tenant.id === t.id ? 'active' : ''}`}
                                                onClick={() => setTenantId(t.id)}
                                            >
                                                <div className="tenant-dot" style={{ background: t.colors.primary }} />
                                                <span>{t.name.split(' ')[0]}</span>
                                            </div>
                                            {!BUILTIN_IDS.includes(t.id) && (
                                                <button
                                                    className="tenant-remove-btn"
                                                    onClick={(e) => { e.stopPropagation(); removeTenant(t.id); }}
                                                    title="Remove custom tenant"
                                                >
                                                    <Trash2 size={10} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button className="create-tenant-btn" onClick={() => setShowCreateTenant(true)}>
                                    <Plus size={14} /> Create New Tenant
                                </button>
                            </div>

                            {/* Live Feature Flags */}
                            <div className="demo-section">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className="demo-label">Feature Flags</span>
                                    <button
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.65rem' }}
                                        onClick={() => setShowFeatureDetails(!showFeatureDetails)}
                                    >
                                        {showFeatureDetails ? 'Collapse' : 'Expand'}{' '}
                                        {showFeatureDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                    </button>
                                </div>

                                {/* Quick tag overview (always visible) */}
                                <div className="feature-tags">
                                    {tenant.features.hmo && <span className="feature-tag on" onClick={() => liveToggleFeature('hmo')} style={{ cursor: 'pointer' }}>HMO</span>}
                                    {tenant.features.philHealth && <span className="feature-tag on" onClick={() => liveToggleFeature('philHealth')} style={{ cursor: 'pointer' }}>PhilH</span>}
                                    {tenant.features.queue && <span className="feature-tag on">Queue</span>}
                                    {tenant.features.appointments && <span className="feature-tag on">Appts</span>}
                                    {tenant.features.visits.teleconsultEnabled && <span className="feature-tag on">Telecon</span>}
                                    {tenant.features.visits.teleconsultNowEnabled && <span className="feature-tag on">Now</span>}
                                    {tenant.features.visits.clinicLabFulfillmentEnabled && <span className="feature-tag on">Labs</span>}
                                    {tenant.features.loa && <span className="feature-tag on">LOA</span>}
                                    {tenant.features.cdss && <span className="feature-tag on">CDSS</span>}
                                    {tenant.features.aiAssistant && <span className="feature-tag on">AI</span>}
                                    {!tenant.features.hmo && <span className="feature-tag off" onClick={() => liveToggleFeature('hmo')} style={{ cursor: 'pointer' }}>HMO</span>}
                                    {!tenant.features.philHealth && <span className="feature-tag off" onClick={() => liveToggleFeature('philHealth')} style={{ cursor: 'pointer' }}>PhilH</span>}
                                    {!tenant.features.visits.teleconsultEnabled && <span className="feature-tag off">Telecon</span>}
                                    {!tenant.features.visits.clinicLabFulfillmentEnabled && <span className="feature-tag off">Labs</span>}
                                    {!tenant.features.loa && <span className="feature-tag off">LOA</span>}
                                    {!tenant.features.cdss && <span className="feature-tag off">CDSS</span>}
                                </div>

                                {showFeatureDetails && (
                                    <>
                                        {/* Quick-apply presets */}
                                        <div className="preset-grid" style={{ marginTop: 8, marginBottom: 8 }}>
                                            {(Object.entries(FEATURE_PRESETS) as [FeaturePreset, typeof FEATURE_PRESETS[FeaturePreset]][]).map(([key, preset]) => (
                                                <button
                                                    key={key}
                                                    className="preset-btn"
                                                    onClick={() => liveApplyPreset(key)}
                                                >
                                                    <strong>{preset.label}</strong>
                                                    <span>{preset.description}</span>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Individual toggles */}
                                        <div className="feature-checklist">
                                            {FEATURE_LABELS.map(({ key, label }) => (
                                                <label key={key} className="feature-check">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!tenant.features[key]}
                                                        onChange={() => liveToggleFeature(key)}
                                                    />
                                                    <span>{label}</span>
                                                </label>
                                            ))}
                                            <div className="feature-divider" />
                                            {VISIT_LABELS.map(({ key, label, parent }) => {
                                                const parentOff = parent ? !tenant.features.visits[parent] : false;
                                                return (
                                                    <label key={key} className={`feature-check ${parentOff ? 'disabled' : ''}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={!!tenant.features.visits[key]}
                                                            onChange={() => liveToggleVisitFeature(key)}
                                                            disabled={parentOff}
                                                        />
                                                        <span>{label}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Doctor Simulation / Experience Mode */}
                            <div className="demo-section">
                                <span className="demo-label">{isDoctorPortal ? 'Guided Simulation' : 'Experience Mode'}</span>
                                {isDoctorPortal ? (
                                    <button
                                        className="sim-button start"
                                        onClick={() => {
                                            if ((window as any).__startDoctorSimulation) {
                                                (window as any).__startDoctorSimulation();
                                            }
                                            setIsOpen(false);
                                        }}
                                        style={{ width: '100%' }}
                                    >
                                        <Clapperboard size={16} />
                                        <span>Run Doctor Simulation</span>
                                    </button>
                                ) : (
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
                                )}
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
                                                <><Square size={16} fill="currentColor" /><span>Stop Auto-Advance</span></>
                                            ) : (
                                                <><Play size={16} fill="currentColor" /><span>Run Patient Journey</span></>
                                            )}
                                        </button>
                                        <button className="sim-button reset" onClick={leaveQueue}>
                                            <RotateCcw size={16} /><span>Reset Entire Visit</span>
                                        </button>
                                    </div>
                                ) : (
                                    <p className="demo-control-desc" style={{ textAlign: 'center', fontStyle: 'italic' }}>
                                        Check in to enable simulation
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            {showPill ? (
                <div className="demo-pill">
                    <button className="pill-btn advance" onClick={advanceQueue} title="Advance Step" disabled={isVisitComplete}>
                        <Play size={20} fill="currentColor" /><span>Advance Step</span>
                    </button>
                    <div className="pill-divider" />
                    <button
                        className="pill-btn stop"
                        onClick={() => { if (isSimulating) toggleSimulation(); setShowPill(false); }}
                        title="Stop Simulation"
                    >
                        <Square size={18} fill="currentColor" /><span>Stop</span>
                    </button>
                </div>
            ) : (
                <button
                    className={`demo-toggle-fab ${isOpen ? 'active' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                    title="Demo Settings"
                >
                    {isOpen ? <X size={24} /> : (isSimulating ? <Clock size={24} className="spin" /> : <Settings size={24} />)}
                </button>
            )}
        </div>
    );
};
