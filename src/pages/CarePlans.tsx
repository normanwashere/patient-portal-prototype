import React, { useState, useMemo, useEffect } from 'react';
import {
    ClipboardList, Target, CheckCircle2, Calendar,
    ChevronDown, ChevronUp, User, Activity,
    MessageSquare, Send,
} from 'lucide-react';
import { BackButton } from '../components/Common/BackButton';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../theme/ThemeContext';
import './HubPage.css';

/* ── Care Plan Types ──────────────────────────────────────── */

interface CarePlanGoal {
    label: string;
    completed: boolean;
}

interface CarePlan {
    id: string;
    name: string;
    assignedBy: string;
    specialty: string;
    startDate: string;
    targetDate: string;
    nextReview: string;
    status: 'Active' | 'Completed' | 'Scheduled';
    progressPercent: number;
    goals: CarePlanGoal[];
    interventions: string[];
}

// Metro General care plans (for Juan Dela Cruz p1)
const METRO_PLANS: CarePlan[] = [
    {
        id: 'cp-1',
        name: 'Diabetes Management Plan',
        assignedBy: 'Dr. Ricardo Santos',
        specialty: 'Cardiology / Internal Medicine',
        startDate: 'Jan 15, 2026',
        targetDate: 'Jul 15, 2026',
        nextReview: 'Mar 3, 2026',
        status: 'Active',
        progressPercent: 58,
        goals: [
            { label: 'Fasting blood glucose 80–130 mg/dL', completed: true },
            { label: 'HbA1c below 7.0%', completed: false },
            { label: 'Exercise 30 minutes daily, 5 days/week', completed: true },
            { label: 'Take diabetes medications on schedule (no missed doses)', completed: true },
            { label: 'Maintain healthy BMI or lose 5% body weight', completed: false },
        ],
        interventions: [
            'HbA1c test every 3 months',
            'Medical nutrition therapy with dietitian every 6 weeks',
            'Blood glucose self-monitoring 2x/day (fasting + post-meal)',
            'Annual dilated eye exam and foot exam',
        ],
    },
    {
        id: 'cp-2',
        name: 'Post-Surgery Recovery',
        assignedBy: 'Dr. Maria Clara Reyes',
        specialty: 'Pediatrics / General',
        startDate: 'Feb 1, 2026',
        targetDate: 'Apr 30, 2026',
        nextReview: 'Feb 22, 2026',
        status: 'Active',
        progressPercent: 33,
        goals: [
            { label: 'Full range of motion in right knee', completed: false },
            { label: 'Walk unassisted for 15 minutes', completed: true },
            { label: 'Pain level consistently < 3/10', completed: false },
            { label: 'Complete home exercise program daily', completed: true },
        ],
        interventions: [
            'Physical therapy 2x/week',
            'Wound care check at 2 weeks post-op',
            'Anti-inflammatory medication as prescribed',
            'Follow-up X-ray at 6 weeks',
        ],
    },
    {
        id: 'cp-3',
        name: 'Hypertension Management',
        assignedBy: 'Dr. Albert Go',
        specialty: 'Internal Medicine',
        startDate: 'Oct 5, 2025',
        targetDate: 'Apr 5, 2026',
        nextReview: 'Mar 10, 2026',
        status: 'Completed',
        progressPercent: 100,
        goals: [
            { label: 'Blood pressure < 130/80 mmHg', completed: true },
            { label: 'Reduce sodium intake to < 2,300 mg/day', completed: true },
            { label: 'Exercise 150 min/week', completed: true },
            { label: 'Take Losartan 50 mg daily', completed: true },
        ],
        interventions: [
            'Home blood pressure monitoring morning and evening with log',
            'Monthly in-clinic blood pressure and weight check',
            'DASH diet counseling with dietitian',
            'Annual lipid panel, ECG, and kidney function tests',
        ],
    },
];

// Maxicare care plans (for Andrea Reyes p-mc1 and Mark Anthony Lim p-mc2)
const MAXICARE_PLANS: CarePlan[] = [
    {
        id: 'cp-mc1',
        name: 'Hypertension & Metabolic Risk Management',
        assignedBy: 'Dr. Carmela Ong',
        specialty: 'Internal Medicine',
        startDate: 'Jan 20, 2026',
        targetDate: 'Jul 20, 2026',
        nextReview: 'Mar 14, 2026',
        status: 'Active',
        progressPercent: 42,
        goals: [
            { label: 'Blood pressure consistently < 130/80 mmHg', completed: false },
            { label: 'HbA1c < 5.7% (reverse pre-diabetes)', completed: false },
            { label: 'LDL cholesterol < 130 mg/dL', completed: false },
            { label: 'DASH diet adherence ≥ 80%', completed: true },
            { label: 'Exercise ≥ 150 min/week (moderate intensity)', completed: true },
        ],
        interventions: [
            'Home BP monitoring 2x daily with log',
            'Losartan 50mg + Amlodipine 5mg daily',
            'Repeat HbA1c in 3 months',
            'Lipid panel recheck in 6 months',
            'Dietitian referral for DASH diet counseling',
        ],
    },
    {
        id: 'cp-mc2',
        name: 'Cardiovascular Risk Assessment',
        assignedBy: 'Dr. Ramon Bautista',
        specialty: 'Cardiology',
        startDate: 'Feb 3, 2026',
        targetDate: 'May 3, 2026',
        nextReview: 'Mar 17, 2026',
        status: 'Active',
        progressPercent: 20,
        goals: [
            { label: 'Complete Cardiac Stress Test', completed: false },
            { label: 'ASCVD risk score calculated', completed: false },
            { label: 'Statin therapy initiated if ASCVD risk ≥ 7.5%', completed: false },
            { label: 'Baseline ECG documented', completed: true },
        ],
        interventions: [
            'Cardiac Stress Test scheduled at PCC Makati',
            'Review complete lipid panel results',
            'Calculate 10-year ASCVD risk score',
            'Follow-up in 6 weeks post stress test',
        ],
    },
    {
        id: 'cp-mc3',
        name: 'Dyslipidemia & Cardiovascular Risk Reduction',
        assignedBy: 'Dr. Jen Diaz',
        specialty: 'Family Medicine',
        startDate: 'Feb 3, 2026',
        targetDate: 'Aug 3, 2026',
        nextReview: 'Apr 3, 2026',
        status: 'Active',
        progressPercent: 20,
        goals: [
            { label: 'LDL cholesterol < 130 mg/dL (from 162)', completed: false },
            { label: 'Triglycerides < 150 mg/dL (from 180)', completed: false },
            { label: 'HDL cholesterol > 40 mg/dL (currently 38)', completed: false },
            { label: 'Reduce dietary saturated fat intake', completed: true },
            { label: 'Exercise ≥ 150 min/week', completed: false },
            { label: 'Weight loss 3–5 kg (BMI 26.1 → target 24)', completed: false },
        ],
        interventions: [
            'Mediterranean diet emphasis — reduce red meat, increase fish & vegetables',
            'Structured exercise program 30 min/day, 5 days/week',
            'Recheck lipid panel in 3 months',
            'HbA1c baseline screening',
            'Reassess for statin if LDL persists > 160 at 3-month follow-up',
        ],
    },
];

// Default plans for other tenants
const DEFAULT_PLANS: CarePlan[] = [
    {
        id: 'cp-default-1',
        name: 'Wellness & Prevention',
        assignedBy: 'Your Doctor',
        specialty: 'Family Medicine',
        startDate: 'Mar 1, 2026',
        targetDate: 'Sep 1, 2026',
        nextReview: 'Apr 15, 2026',
        status: 'Scheduled',
        progressPercent: 0,
        goals: [
            { label: 'Annual physical exam completed', completed: false },
            { label: 'Update all vaccinations', completed: false },
            { label: 'Complete wellness screening', completed: false },
            { label: 'Establish baseline fitness metrics', completed: false },
        ],
        interventions: [
            'Comprehensive blood panel',
            'Cardiovascular risk assessment',
            'Cancer screening per age guidelines',
            'Mental health screening',
        ],
    },
];

/* ── Styles ────────────────────────────────────────────────── */

const styles = {
    statsRow: { display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' as const } as React.CSSProperties,
    statCard: (_c: string) => ({ flex: '1 1 0', minWidth: '100px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '0.25rem', padding: '0.75rem 0.5rem', borderRadius: '12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }) as React.CSSProperties,
    statValue: (color: string) => ({ fontSize: '1.5rem', fontWeight: 800, color, lineHeight: 1 }) as React.CSSProperties,
    statLabel: { fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 } as React.CSSProperties,
    filterRow: { display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto' as const, paddingBottom: '4px' } as React.CSSProperties,
    filterChip: (active: boolean) => ({ padding: '0.4rem 0.9rem', borderRadius: '999px', border: active ? '1px solid var(--color-primary)' : '1px solid var(--color-border)', background: active ? 'var(--color-primary-light)' : 'var(--color-surface)', color: active ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: active ? 600 : 500, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap' as const, transition: 'all 0.15s ease' }) as React.CSSProperties,
    card: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', marginBottom: '0.75rem', overflow: 'hidden', transition: 'box-shadow 0.2s ease' } as React.CSSProperties,
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1rem 1.1rem', cursor: 'pointer', gap: '0.75rem' } as React.CSSProperties,
    cardHeaderLeft: { flex: 1, minWidth: 0 } as React.CSSProperties,
    planName: { fontSize: '1.02rem', fontWeight: 600, color: 'var(--color-text)', margin: 0, lineHeight: 1.3 } as React.CSSProperties,
    doctorRow: { display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.3rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' } as React.CSSProperties,
    metaRow: { display: 'flex', flexWrap: 'wrap' as const, alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' } as React.CSSProperties,
    metaItem: { display: 'flex', alignItems: 'center', gap: '0.3rem' } as React.CSSProperties,
    badge: (status: CarePlan['status']) => {
        const colorMap: Record<CarePlan['status'], { bg: string; text: string }> = {
            Active: { bg: 'color-mix(in srgb, var(--color-primary), white 88%)', text: 'var(--color-primary)' },
            Completed: { bg: 'color-mix(in srgb, var(--color-success), white 88%)', text: 'var(--color-success)' },
            Scheduled: { bg: 'color-mix(in srgb, var(--color-warning), white 85%)', text: 'var(--color-warning)' },
        };
        const c = colorMap[status];
        return { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '999px', background: c.bg, color: c.text, whiteSpace: 'nowrap' } as React.CSSProperties;
    },
    progressWrapper: { padding: '0 1.1rem 0.75rem' } as React.CSSProperties,
    progressBarOuter: { height: '6px', borderRadius: '999px', background: 'var(--color-border)', overflow: 'hidden' } as React.CSSProperties,
    progressBarInner: (pct: number, status: CarePlan['status']) => ({ height: '100%', borderRadius: '999px', width: `${pct}%`, background: status === 'Completed' ? 'var(--color-success)' : status === 'Scheduled' ? 'var(--color-warning)' : 'var(--color-primary)', transition: 'width 0.6s ease' }) as React.CSSProperties,
    progressLabel: { fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' } as React.CSSProperties,
    expandedBody: { padding: '0 1.1rem 1.1rem', borderTop: '1px solid var(--color-border)' } as React.CSSProperties,
    subHeading: { fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', margin: '1rem 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' } as React.CSSProperties,
    goalItem: { display: 'flex', alignItems: 'flex-start', gap: '0.45rem', padding: '0.35rem 0', fontSize: '0.88rem', color: 'var(--color-text)', lineHeight: 1.45, cursor: 'pointer', borderRadius: 6, transition: 'background 0.15s' } as React.CSSProperties,
    goalIconDone: { color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' } as React.CSSProperties,
    goalIconPending: { color: 'var(--color-border)', flexShrink: 0, marginTop: '2px' } as React.CSSProperties,
    interventionList: { listStyle: 'none', padding: 0, margin: 0 } as React.CSSProperties,
    interventionItem: { display: 'flex', alignItems: 'flex-start', gap: '0.45rem', padding: '0.25rem 0', fontSize: '0.88rem', color: 'var(--color-text)', lineHeight: 1.45 } as React.CSSProperties,
    interventionDot: { color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' } as React.CSSProperties,
    reviewBanner: { display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'var(--color-primary-light)', fontSize: '0.84rem', fontWeight: 500, color: 'var(--color-primary)' } as React.CSSProperties,
    chevron: { color: 'var(--color-text-muted)', flexShrink: 0 } as React.CSSProperties,
    noteSection: { marginTop: '1rem', padding: '0.85rem', borderRadius: 10, background: 'color-mix(in srgb, var(--color-primary), white 95%)', border: '1px solid color-mix(in srgb, var(--color-primary), white 85%)' } as React.CSSProperties,
    noteHeading: { fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' } as React.CSSProperties,
    noteInput: { display: 'flex', gap: '0.5rem', alignItems: 'flex-end' } as React.CSSProperties,
    noteTextarea: { flex: 1, padding: '0.6rem 0.75rem', borderRadius: 10, border: '1px solid var(--color-border)', fontSize: '0.88rem', color: 'var(--color-text)', background: 'var(--color-surface)', resize: 'vertical' as const, fontFamily: 'inherit', minHeight: 64, lineHeight: 1.5 } as React.CSSProperties,
    sendBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, borderRadius: 10, border: 'none', background: 'var(--color-primary)', color: '#fff', cursor: 'pointer', flexShrink: 0, transition: 'opacity 0.15s' } as React.CSSProperties,
    noteItem: { display: 'flex', gap: '0.5rem', padding: '0.4rem 0', fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.45 } as React.CSSProperties,
    completedBanner: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', padding: '0.75rem 0.85rem', borderRadius: 10, background: 'color-mix(in srgb, var(--color-success), white 88%)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-success, #16a34a)' } as React.CSSProperties,
};

/* ── Care Plan Card (Interactive) ─────────────────────────── */

const CarePlanCard: React.FC<{
    plan: CarePlan;
    onToggleGoal: (planId: string, goalIdx: number) => void;
}> = ({ plan, onToggleGoal }) => {
    const [expanded, setExpanded] = useState(plan.status === 'Active');
    const [noteText, setNoteText] = useState('');
    const [notes, setNotes] = useState<{ text: string; time: string }[]>([]);
    const { showToast } = useToast();
    const completedGoals = plan.goals.filter(g => g.completed).length;

    const handleSendNote = () => {
        if (!noteText.trim()) return;
        setNotes(prev => [...prev, { text: noteText.trim(), time: 'Just now' }]);
        setNoteText('');
        showToast('Note sent to your care team', 'success');
    };

    return (
        <div style={styles.card}>
            <div
                style={styles.cardHeader}
                onClick={() => setExpanded(prev => !prev)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setExpanded(prev => !prev); }}
                aria-expanded={expanded}
            >
                <div style={styles.cardHeaderLeft}>
                    <p style={styles.planName}>{plan.name}</p>
                    <div style={styles.doctorRow}>
                        <User size={14} />
                        <span>{plan.assignedBy}</span>
                        <span style={{ opacity: 0.5 }}>·</span>
                        <span>{plan.specialty}</span>
                    </div>
                    <div style={styles.metaRow}>
                        <span style={styles.metaItem}>
                            <Calendar size={13} />
                            {plan.startDate} → {plan.targetDate}
                        </span>
                        <span style={styles.badge(plan.status)}>
                            <Activity size={11} />
                            {plan.status}
                        </span>
                    </div>
                </div>
                <div style={styles.chevron}>
                    {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>

            <div style={styles.progressWrapper}>
                <div style={styles.progressBarOuter}>
                    <div style={styles.progressBarInner(plan.progressPercent, plan.status)} />
                </div>
                <div style={styles.progressLabel}>
                    {completedGoals}/{plan.goals.length} goals completed ({plan.progressPercent}%)
                </div>
            </div>

            {expanded && (
                <div style={styles.expandedBody}>
                    {/* Interactive Goals */}
                    <div style={styles.subHeading}><Target size={15} /> Goals</div>
                    {plan.goals.map((goal, i) => (
                        <div
                            key={i}
                            style={styles.goalItem}
                            onClick={(e) => { e.stopPropagation(); onToggleGoal(plan.id, i); }}
                            role="checkbox"
                            aria-checked={goal.completed}
                            tabIndex={0}
                        >
                            <CheckCircle2
                                size={16}
                                style={goal.completed ? styles.goalIconDone : styles.goalIconPending}
                            />
                            <span style={{
                                textDecoration: goal.completed ? 'line-through' : 'none',
                                opacity: goal.completed ? 0.7 : 1,
                            }}>
                                {goal.label}
                            </span>
                        </div>
                    ))}

                    {/* Interventions */}
                    <div style={styles.subHeading}><ClipboardList size={15} /> Interventions</div>
                    <ul style={styles.interventionList}>
                        {plan.interventions.map((item, i) => (
                            <li key={i} style={styles.interventionItem}>
                                <Activity size={14} style={styles.interventionDot} />
                                {item}
                            </li>
                        ))}
                    </ul>

                    {/* Next Review */}
                    <div style={styles.reviewBanner}>
                        <Calendar size={15} />
                        Next Review: {plan.nextReview}
                    </div>

                    {/* Completed celebration banner */}
                    {plan.status === 'Completed' && (
                        <div style={styles.completedBanner}>
                            <CheckCircle2 size={18} />
                            All goals completed — great work! Your doctor will review on your next visit.
                        </div>
                    )}

                    {/* Patient Notes / Messages to Care Team */}
                    {(plan.status === 'Active' || plan.status === 'Completed') && (
                        <div style={styles.noteSection}>
                            <div style={styles.noteHeading}><MessageSquare size={16} /> Message Care Team</div>
                            {notes.map((n, i) => (
                                <div key={i} style={styles.noteItem}>
                                    <User size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                                    <div>
                                        <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{n.text}</span>
                                        <span style={{ marginLeft: 8, fontSize: '0.76rem', opacity: 0.55 }}>{n.time}</span>
                                    </div>
                                </div>
                            ))}
                            <div style={styles.noteInput}>
                                <textarea
                                    style={styles.noteTextarea}
                                    placeholder="Ask your doctor a question or share an update..."
                                    value={noteText}
                                    onChange={e => setNoteText(e.target.value)}
                                    rows={2}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendNote(); } }}
                                />
                                <button style={{ ...styles.sendBtn, opacity: noteText.trim() ? 1 : 0.4 }} onClick={handleSendNote} disabled={!noteText.trim()}>
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/* ── Main Care Plans Page ─────────────────────────────────── */

export const CarePlans: React.FC = () => {
    const { tenant } = useTheme();
    const initialPlans = useMemo(() => {
        switch (tenant.id) {
            case 'metroGeneral': return METRO_PLANS;
            case 'maxicare': return MAXICARE_PLANS;
            default: return DEFAULT_PLANS;
        }
    }, [tenant.id]);
    const [plans, setPlans] = useState<CarePlan[]>(initialPlans);
    useEffect(() => { setPlans(initialPlans); }, [initialPlans]);
    const [filter, setFilter] = useState<string>('All');
    const { showToast } = useToast();
    const filters = ['All', 'Active', 'Completed', 'Scheduled'];

    const handleToggleGoal = (planId: string, goalIdx: number) => {
        // Compute the toast message outside the state updater to avoid
        // "Cannot update a component while rendering a different component"
        let toastMsg = '';
        let toastType: 'success' | 'info' = 'info';

        setPlans(prev => prev.map(p => {
            if (p.id !== planId) return p;
            if (p.status === 'Scheduled') return p;

            const goals = [...p.goals];
            goals[goalIdx] = { ...goals[goalIdx], completed: !goals[goalIdx].completed };
            const completedCount = goals.filter(g => g.completed).length;
            const allDone = completedCount === goals.length;
            const newPct = Math.round((completedCount / goals.length) * 100);

            let newStatus = p.status;
            if (allDone && p.status === 'Active') {
                newStatus = 'Completed';
                toastMsg = 'All goals completed! Care plan marked as complete.';
                toastType = 'success';
            } else if (!allDone && p.status === 'Completed') {
                newStatus = 'Active';
                toastMsg = 'Goal reopened — care plan moved back to Active.';
                toastType = 'info';
            } else {
                toastMsg = goals[goalIdx].completed ? 'Goal marked complete!' : 'Goal marked incomplete';
                toastType = goals[goalIdx].completed ? 'success' : 'info';
            }

            return { ...p, goals, progressPercent: newPct, status: newStatus };
        }));

        // Fire toast after the state update, not during it
        setTimeout(() => {
            if (toastMsg) showToast(toastMsg, toastType);
        }, 0);
    };

    const filtered = filter === 'All' ? plans : plans.filter(p => p.status === filter);

    const activeCount = plans.filter(p => p.status === 'Active').length;
    const completedCount = plans.filter(p => p.status === 'Completed').length;
    const scheduledCount = plans.filter(p => p.status === 'Scheduled').length;
    const totalGoals = plans.reduce((acc, p) => acc + p.goals.length, 0);
    const completedGoals = plans.reduce((acc, p) => acc + p.goals.filter(g => g.completed).length, 0);

    return (
        <div className="hub-page">
            <header className="page-header">
                <BackButton to="/health" />
                <div className="header-text">
                    <h2>My Care Plans</h2>
                    <p className="page-subtitle">Track your treatment goals and progress</p>
                </div>
            </header>

            {/* Stats */}
            <div style={styles.statsRow}>
                <div style={styles.statCard('var(--color-primary)')}>
                    <span style={styles.statValue('var(--color-primary)')}>{activeCount}</span>
                    <span style={styles.statLabel}>Active</span>
                </div>
                <div style={styles.statCard('var(--color-success)')}>
                    <span style={styles.statValue('var(--color-success)')}>{completedCount}</span>
                    <span style={styles.statLabel}>Completed</span>
                </div>
                <div style={styles.statCard('var(--color-warning, #f59e0b)')}>
                    <span style={styles.statValue('var(--color-warning, #f59e0b)')}>{scheduledCount}</span>
                    <span style={styles.statLabel}>Scheduled</span>
                </div>
                <div style={styles.statCard('var(--color-text)')}>
                    <span style={styles.statValue('var(--color-text)')}>{completedGoals}/{totalGoals}</span>
                    <span style={styles.statLabel}>Goals Met</span>
                </div>
            </div>

            {/* Filter chips */}
            <div style={styles.filterRow}>
                {filters.map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={styles.filterChip(filter === f)}>
                        {f}
                    </button>
                ))}
            </div>

            {/* Plan cards */}
            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                    <ClipboardList size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
                    <p>No {filter.toLowerCase()} care plans</p>
                </div>
            ) : (
                filtered.map(plan => (
                    <CarePlanCard key={plan.id} plan={plan} onToggleGoal={handleToggleGoal} />
                ))
            )}
        </div>
    );
};
