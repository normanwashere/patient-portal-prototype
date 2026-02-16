import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CalendarDays, ChevronRight, TestTube, Pill, CreditCard, Heart,
    Syringe, ClipboardList, Video, FileText, Building2, Users,
    Settings2, X, Check, HeartHandshake, Send,
} from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { useData } from '../context/DataContext';
import { useBadges } from '../hooks/useBadges';
import { BannerCarousel } from '../components/BannerCarousel';
import { CheckInCard } from '../components/CheckInCard';
import { GeofenceCheckIn } from '../components/GeofenceCheckIn';
import { HospitalWidget } from '../components/HospitalWidget/HospitalWidget';
import {
    getTenantBranches,
    type Branch
} from '../data/mockBranches';
import './Dashboard.css';

/* ═══════════════════════════════════════════════════
   Quick Action Definitions
   ═══════════════════════════════════════════════════ */

interface QuickActionDef {
    id: string;
    label: string;
    icon: React.FC<{ size?: number }>;
    to: string;
    /** return true to show this action; receives tenant features */
    visible?: (f: any) => boolean;
    /** badge count getter */
    badgeKey?: 'labs' | 'meds';
}

const ALL_QUICK_ACTIONS: QuickActionDef[] = [
    { id: 'appointments', label: 'Book Appointment', icon: CalendarDays, to: '/visits' },
    { id: 'lab-results', label: 'Lab Results', icon: TestTube, to: '/results', badgeKey: 'labs' },
    { id: 'medications', label: 'Medications', icon: Pill, to: '/medications', badgeKey: 'meds' },
    { id: 'care-plans', label: 'Care Plans', icon: ClipboardList, to: '/health/care-plans', visible: (f) => !!f.carePlans },
    { id: 'billing', label: 'Billing', icon: CreditCard, to: '/billing' },
    { id: 'hmo-benefits', label: 'HMO Benefits', icon: Heart, to: '/benefits', visible: (f) => !!f.hmo },
    { id: 'vaccines', label: 'Vaccines', icon: Syringe, to: '/immunization' },
    { id: 'teleconsult', label: 'Teleconsult', icon: Video, to: '/visits/teleconsult-intake', visible: (f) => !!f.visits?.teleconsultEnabled },
    { id: 'homecare', label: 'HomeCare', icon: HeartHandshake, to: '/visits/homecare', visible: (f) => !!f.visits?.homeCareEnabled },
    { id: 'referrals', label: 'My Referrals', icon: Send, to: '/referrals' },
    { id: 'medical-history', label: 'Medical History', icon: FileText, to: '/medical-history' },
    { id: 'branches', label: 'Find Clinics', icon: Building2, to: '/branches' },
    { id: 'community', label: 'Community', icon: Users, to: '/community' },
];

/** Default visible actions (order matters) */
const DEFAULT_ACTION_IDS = [
    'appointments', 'lab-results', 'medications', 'care-plans', 'referrals', 'hmo-benefits', 'vaccines',
];

const STORAGE_KEY = 'patient-quick-actions';

function loadSavedActions(): string[] | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return null;
}

function saveActions(ids: string[]) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch { /* ignore */ }
}

/* ═══════════════════════════════════════════════════
   Quick Actions Customizer Modal
   ═══════════════════════════════════════════════════ */

const CustomizerModal: React.FC<{
    availableActions: QuickActionDef[];
    selectedIds: string[];
    onSave: (ids: string[]) => void;
    onClose: () => void;
}> = ({ availableActions, selectedIds, onSave, onClose }) => {
    const [draft, setDraft] = useState<string[]>([...selectedIds]);

    const toggle = (id: string) => {
        setDraft(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const moveUp = (id: string) => {
        setDraft(prev => {
            const idx = prev.indexOf(id);
            if (idx <= 0) return prev;
            const next = [...prev];
            [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
            return next;
        });
    };

    const moveDown = (id: string) => {
        setDraft(prev => {
            const idx = prev.indexOf(id);
            if (idx < 0 || idx >= prev.length - 1) return prev;
            const next = [...prev];
            [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
            return next;
        });
    };

    return (
        <div className="qa-modal-overlay" onClick={onClose}>
            <div className="qa-modal" onClick={e => e.stopPropagation()}>
                <div className="qa-modal-header">
                    <h3>Customize Quick Actions</h3>
                    <button className="qa-modal-close" onClick={onClose}><X size={18} /></button>
                </div>

                <p className="qa-modal-desc">Select and reorder the shortcuts shown on your dashboard.</p>

                {/* Selected actions (reorderable) */}
                <div className="qa-section-label">Active ({draft.length})</div>
                <div className="qa-list">
                    {draft.map((id) => {
                        const action = availableActions.find(a => a.id === id);
                        if (!action) return null;
                        const Icon = action.icon;
                        return (
                            <div key={id} className="qa-item active">
                                <div className="qa-item-grip">
                                    <button className="qa-reorder-btn" onClick={() => moveUp(id)} title="Move up">▲</button>
                                    <button className="qa-reorder-btn" onClick={() => moveDown(id)} title="Move down">▼</button>
                                </div>
                                <Icon size={18} />
                                <span className="qa-item-label">{action.label}</span>
                                <button className="qa-remove-btn" onClick={() => toggle(id)} title="Remove">
                                    <X size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Available to add */}
                <div className="qa-section-label">Available</div>
                <div className="qa-list">
                    {availableActions.filter(a => !draft.includes(a.id)).map(action => {
                        const Icon = action.icon;
                        return (
                            <div key={action.id} className="qa-item available" onClick={() => toggle(action.id)}>
                                <Icon size={18} />
                                <span className="qa-item-label">{action.label}</span>
                                <span className="qa-add-badge">+ Add</span>
                            </div>
                        );
                    })}
                    {availableActions.filter(a => !draft.includes(a.id)).length === 0 && (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.82rem', padding: '0.5rem 0' }}>
                            All actions added
                        </p>
                    )}
                </div>

                <div className="qa-modal-footer">
                    <button className="qa-btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="qa-btn-primary" onClick={() => onSave(draft)}>
                        <Check size={15} /> Save
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════
   Dashboard Component
   ═══════════════════════════════════════════════════ */

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { tenant } = useTheme();
    const { joinQueue, leaveQueue } = useData();
    const { newLabsCount, newMedsCount } = useBadges();
    const [showCustomizer, setShowCustomizer] = useState(false);
    const [showConfirmPrompt, setShowConfirmPrompt] = useState(false);
    const [showGeofence, setShowGeofence] = useState(false);

    // Long-press detection
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pressedRef = useRef(false);

    const handlePointerDown = useCallback(() => {
        pressedRef.current = true;
        longPressTimer.current = setTimeout(() => {
            if (pressedRef.current) {
                setShowConfirmPrompt(true);
            }
        }, 600);
    }, []);

    const handlePointerUp = useCallback(() => {
        pressedRef.current = false;
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }, []);

    const handlePointerLeave = useCallback(() => {
        pressedRef.current = false;
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }, []);

    // Available actions based on tenant features
    const availableActions = useMemo(() =>
        ALL_QUICK_ACTIONS.filter(a => !a.visible || a.visible(tenant.features)),
    [tenant.features]);

    // Selected action IDs (persisted)
    const [selectedIds, setSelectedIds] = useState<string[]>(() => {
        const saved = loadSavedActions();
        if (saved) {
            return saved.filter(id => availableActions.some(a => a.id === id));
        }
        return DEFAULT_ACTION_IDS.filter(id => availableActions.some(a => a.id === id));
    });

    // Re-validate when features change
    useEffect(() => {
        setSelectedIds(prev => {
            const valid = prev.filter(id => availableActions.some(a => a.id === id));
            if (valid.length === 0) {
                return DEFAULT_ACTION_IDS.filter(id => availableActions.some(a => a.id === id));
            }
            return valid;
        });
    }, [availableActions]);

    const handleSaveActions = useCallback((ids: string[]) => {
        setSelectedIds(ids);
        saveActions(ids);
        setShowCustomizer(false);
    }, []);

    const activeActions = useMemo(() =>
        selectedIds.map(id => availableActions.find(a => a.id === id)).filter(Boolean) as QuickActionDef[],
    [selectedIds, availableActions]);

    const getBadge = (key?: string) => {
        if (key === 'labs') return newLabsCount;
        if (key === 'meds') return newMedsCount;
        return 0;
    };

    const getTopBranches = (branches: Branch[]) => {
        const hospitals = branches.filter(b => b.type === 'hospital').slice(0, 2);
        const clinics = branches.filter(b => b.type === 'clinic').slice(0, 2);
        return [...hospitals, ...clinics];
    };

    return (
        <div className="dashboard-container container">

            {/* Banner Section */}
            <section className="marketing-banner-section">
                <BannerCarousel />
            </section>

            {/* Visit Context Widget */}
            <section className="queue-section">
                <CheckInCard
                    onCheckIn={() => setShowGeofence(true)}
                    onLeaveQueue={() => leaveQueue()}
                />
            </section>

            {/* Quick Actions - Long-press to customize */}
            <section className="action-center">
                <h3 className="section-title">Quick Actions</h3>
                <div className="quick-actions-grid">
                    {activeActions.map(action => {
                        const Icon = action.icon;
                        const badge = getBadge(action.badgeKey);
                        return (
                            <button
                                key={action.id}
                                className="quick-action-btn"
                                onClick={() => navigate(action.to)}
                                onPointerDown={handlePointerDown}
                                onPointerUp={handlePointerUp}
                                onPointerLeave={handlePointerLeave}
                                onContextMenu={e => { e.preventDefault(); setShowConfirmPrompt(true); }}
                            >
                                {badge > 0 ? (
                                    <div className="icon-badge-box">
                                        <Icon size={20} />
                                        <span className="btn-badge">{badge}</span>
                                    </div>
                                ) : (
                                    <Icon size={20} />
                                )}
                                <span>{action.label}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Find Hospitals */}
            <section className="hospitals-section">
                <div className="section-header-row">
                    <h3 className="section-title">Find Hospitals and Clinics</h3>
                    <button className="view-all-link" onClick={() => navigate('/branches')}>
                        View all <ChevronRight size={16} />
                    </button>
                </div>

                <div className="hospitals-grid">
                    {(() => {
                        const branches: Branch[] = getTenantBranches(tenant.id, tenant.name);
                        const displayBranches = getTopBranches(branches);
                        return displayBranches.map(branch => (
                            <HospitalWidget key={branch.id} branch={branch} />
                        ));
                    })()}
                </div>
            </section>

            {/* Confirm Prompt (tap & hold) */}
            {showConfirmPrompt && (
                <div className="qa-modal-overlay" onClick={() => setShowConfirmPrompt(false)}>
                    <div className="qa-confirm-prompt" onClick={e => e.stopPropagation()}>
                        <div className="qa-confirm-icon"><Settings2 size={28} /></div>
                        <h3>Customize Quick Actions?</h3>
                        <p>Rearrange, add, or remove shortcuts from your dashboard.</p>
                        <div className="qa-confirm-actions">
                            <button className="qa-btn-secondary" onClick={() => setShowConfirmPrompt(false)}>Cancel</button>
                            <button className="qa-btn-primary" onClick={() => { setShowConfirmPrompt(false); setShowCustomizer(true); }}>
                                Customize
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Geofence Check-In Modal */}
            {showGeofence && (
                <GeofenceCheckIn
                    clinicName={tenant.name}
                    onVerified={() => { setShowGeofence(false); joinQueue(); }}
                    onCancel={() => setShowGeofence(false)}
                />
            )}

            {/* Customizer Modal */}
            {showCustomizer && (
                <CustomizerModal
                    availableActions={availableActions}
                    selectedIds={selectedIds}
                    onSave={handleSaveActions}
                    onClose={() => setShowCustomizer(false)}
                />
            )}
        </div>
    );
};
