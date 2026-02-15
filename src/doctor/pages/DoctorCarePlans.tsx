import { useState, useMemo, useCallback } from 'react';
import {
    ClipboardList, Target, CheckCircle2, Calendar, ChevronDown, ChevronUp,
    User, Activity, Plus, Edit3, Save, X, Trash2, Search,
    Sparkles, Loader2, Bot, RefreshCw,
} from 'lucide-react';
import { useProvider } from '../../provider/context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader, EmptyState } from '../../ui';

/* ══════════════════════════════════════════
   Care Plan Types
   ══════════════════════════════════════════ */

interface CarePlanGoal {
    label: string;
    completed: boolean;
}

type CarePlanStatus = 'Active' | 'Completed' | 'Scheduled' | 'Draft';

interface CarePlan {
    id: string;
    patientName: string;
    patientId: string;
    name: string;
    assignedBy: string;
    specialty: string;
    startDate: string;
    targetDate: string;
    nextReview: string;
    status: CarePlanStatus;
    progressPercent: number;
    goals: CarePlanGoal[];
    interventions: string[];
    notes?: string;
    lastUpdated: string;
    aiGenerated?: boolean;
}

/* ══════════════════════════════════════════
   AI Suggestion Templates
   ══════════════════════════════════════════ */

interface AISuggestion {
    name: string;
    specialty: string;
    goals: string[];
    interventions: string[];
    notes: string;
    duration: string; // e.g. "6 months"
}

const AI_TEMPLATES: Record<string, AISuggestion> = {
    diabetes: {
        name: 'Type 2 Diabetes Management Plan',
        specialty: 'Endocrinology',
        goals: [
            'Maintain fasting blood glucose 80–130 mg/dL (ADA pre-meal target)',
            'Achieve HbA1c < 7.0% within 3 months (individualize per age, comorbidities, and hypoglycemia risk)',
            'Engage in moderate-intensity aerobic exercise ≥ 150 min/week (e.g., brisk walking)',
            'Achieve ≥ 95% adherence to prescribed antidiabetic medication regimen',
            'Maintain BMI 18.5–24.9 or achieve ≥ 5% weight loss if overweight/obese',
            'Complete annual dilated retinal examination and comprehensive foot exam',
        ],
        interventions: [
            'HbA1c laboratory test every 3 months (quarterly) until at target, then every 6 months',
            'Medical nutrition therapy (MNT) with registered dietitian every 6 weeks',
            'Self-monitoring of blood glucose: FBS + 2-hour post-prandial, frequency per therapy type',
            'Annual comprehensive metabolic panel, lipid panel, and urine albumin-to-creatinine ratio (UACR)',
            'Annual dilated eye exam (ophthalmology) and monofilament foot exam',
            'Quarterly clinical review: weight, BP, medication adherence, hypoglycemia assessment',
            'Diabetes self-management education and support (DSMES) enrollment',
        ],
        notes: 'AI-generated plan based on ADA 2026 Standards of Care. Individualize HbA1c target (< 7.0% for most adults; < 8.0% if history of severe hypoglycemia, limited life expectancy, or extensive comorbidities). Recommend baseline HbA1c, lipid panel, eGFR, and UACR before initiation. Consider SGLT2 inhibitor or GLP-1 RA for patients with established CVD or CKD. Screen for depression (PHQ-9) and diabetes distress annually.',
        duration: '6 months',
    },
    hypertension: {
        name: 'Hypertension Management Plan',
        specialty: 'Internal Medicine',
        goals: [
            'Achieve blood pressure < 130/80 mmHg consistently (per ACC/AHA guidelines)',
            'Reduce dietary sodium to < 2,300 mg/day (ideally < 1,500 mg/day)',
            'Engage in aerobic exercise ≥ 150 min/week (e.g., brisk walking, cycling)',
            'Achieve ≥ 95% adherence to prescribed antihypertensive regimen',
            'Achieve BMI < 25 kg/m² or ≥ 5% weight loss if overweight',
            'Limit alcohol: ≤ 2 drinks/day (men), ≤ 1 drink/day (women)',
        ],
        interventions: [
            'Home blood pressure monitoring: 2 readings morning and evening with log',
            'Monthly in-clinic blood pressure and weight check for first 3 months, then quarterly',
            'Dietary counseling (DASH diet) with registered dietitian',
            'Lipid panel at baseline and annually (sooner if dyslipidemia identified)',
            'Annual ECG, serum creatinine, eGFR, electrolytes, and urinalysis',
            'Assess 10-year ASCVD risk (Pooled Cohort Equations) for statin consideration',
            'Stress management counseling referral if psychosocial stressors identified',
        ],
        notes: 'AI-generated based on ACC/AHA 2017 Hypertension Guidelines (reaffirmed 2024). Consider ambulatory blood pressure monitoring (ABPM) if white-coat or masked hypertension suspected. Target < 130/80 for most adults; may individualize for frail elderly (< 140/90). Screen for secondary causes if onset < 30 years, resistant hypertension, or acute worsening.',
        duration: '6 months',
    },
    postop: {
        name: 'Post-Surgical Recovery Plan',
        specialty: 'General Surgery',
        goals: [
            'Achieve full or functional range of motion at surgical site per surgical team benchmarks',
            'Pain level consistently < 3/10 on VAS by week 4 (minimize opioid use)',
            'Ambulate unassisted for ≥ 20 minutes by week 6',
            'Surgical wound fully healed with no signs of SSI (redness, warmth, purulence, dehiscence)',
            'Resume activities of daily living (ADLs) independently by target date',
            'Complete prescribed rehabilitation program (≥ 80% session attendance)',
        ],
        interventions: [
            'Physical therapy 2–3x/week for 8 weeks (per surgical team protocol)',
            'Surgical wound assessment at 1, 2, and 4 weeks post-op (sooner if signs of infection)',
            'Multimodal analgesia: scheduled acetaminophen/NSAIDs, opioids PRN short-term with taper plan',
            'Follow-up imaging (X-ray/MRI) at 6 weeks or as indicated by procedure type',
            'DVT prophylaxis per Caprini score: pharmacologic (LMWH/DOACs) + mechanical (SCDs) as indicated',
            'Nutrition counseling: adequate protein intake (1.2–1.5 g/kg/day) for wound healing',
        ],
        notes: 'AI-generated post-operative recovery framework. Customize rehabilitation milestones based on specific procedure type, patient baseline functional status, and surgeon preference. Monitor for SSI at each visit per CDC/NHSN criteria. Early mobilization is critical to reducing VTE risk and improving outcomes.',
        duration: '3 months',
    },
    prenatal: {
        name: 'Prenatal Care Plan',
        specialty: 'OB-GYN',
        goals: [
            'Complete all trimester-appropriate screenings on schedule per ACOG guidelines',
            'Maintain healthy weight gain per IOM guidelines for pre-pregnancy BMI category',
            'Take prenatal vitamins daily: folic acid ≥ 400 mcg, iron 27 mg, DHA 200 mg',
            'Attend childbirth and breastfeeding preparation course by 34 weeks',
            'Maintain BP < 140/90 mmHg and glucose within normal ranges throughout pregnancy',
            'Develop and discuss birth plan with provider by 36 weeks',
        ],
        interventions: [
            'Prenatal visits: monthly until 28 weeks → biweekly 28–36 weeks → weekly 36 weeks to delivery',
            'First trimester: dating ultrasound, NIPT or first-trimester screening, CBC, blood type/Rh/antibody, rubella/varicella immunity, STI panel',
            'Glucose challenge test (GCT 50g) at 24–28 weeks; 3-hour GTT if abnormal',
            'Anatomy ultrasound at 18–22 weeks',
            'Tdap vaccination at 27–36 weeks gestation',
            'Group B Streptococcus (GBS) screening at 36–37 weeks',
            'Mental health screening (PHQ-9 or Edinburgh) each trimester and postpartum',
            'Iron and folate supplementation throughout pregnancy; reassess hemoglobin at 28 weeks',
        ],
        notes: 'AI-generated based on ACOG prenatal care guidelines. Flag high-risk factors (AMA ≥ 35, prior preeclampsia, GDM history, chronic HTN, BMI ≥ 30) for enhanced surveillance. Low-dose aspirin 81 mg starting 12–16 weeks if preeclampsia risk factors present. Rh-negative patients: RhoGAM at 28 weeks and postpartum if infant is Rh-positive.',
        duration: '9 months',
    },
    asthma: {
        name: 'Asthma Control Plan',
        specialty: 'Pulmonology',
        goals: [
            'Peak expiratory flow consistently ≥ 80% personal best (green zone)',
            'No nighttime awakenings due to asthma symptoms (well-controlled criterion)',
            'Demonstrate correct inhaler/spacer technique at each visit',
            'Exercise without activity limitation most days',
            'Use SABA rescue inhaler ≤ 2 days/week (excluding pre-exercise use)',
            'Zero exacerbations requiring systemic corticosteroids, ED visits, or hospitalization',
        ],
        interventions: [
            'Spirometry (FEV1, FEV1/FVC) at baseline and every 6–12 months to monitor control',
            'Written asthma action plan: review and update at each visit (green/yellow/red zones)',
            'Environmental trigger identification and avoidance counseling (allergens, irritants, exercise)',
            'Inhaler technique assessment and re-education at every visit',
            'Annual influenza vaccination; pneumococcal vaccination per ACIP schedule (PCV20 or PCV15+PPSV23)',
            'Step therapy review at each visit: step up if uncontrolled × 2–4 weeks, step down if well-controlled × 3 months',
            'Allergy testing (skin prick or specific IgE) referral if triggers unclear; consider allergen immunotherapy',
        ],
        notes: 'AI-generated based on GINA 2025 guidelines. Classify severity at initial visit; assess control level at every subsequent visit using validated tools (ACT or ACQ). For patients ≥ 12 years on Step 1–2, GINA recommends as-needed low-dose ICS-formoterol as preferred reliever. Consider biologic therapy referral (anti-IgE, anti-IL5, anti-IL4R) if uncontrolled on Step 4–5.',
        duration: '6 months',
    },
    wellness: {
        name: 'Preventive Wellness Plan',
        specialty: 'Family Medicine',
        goals: [
            'Complete age-appropriate annual health examination',
            'Update all recommended vaccinations per ACIP adult immunization schedule',
            'Complete USPSTF-recommended cancer screenings for age and sex',
            'Establish baseline cardiovascular risk profile (10-year ASCVD risk)',
            'Achieve recommended physical activity level (≥ 150 min/week moderate aerobic)',
            'Complete mental health and substance use screening',
        ],
        interventions: [
            'Comprehensive metabolic panel, CBC, and lipid panel',
            'ASCVD risk assessment: BP, lipid panel, fasting glucose or HbA1c, BMI',
            'Cancer screening per USPSTF: colonoscopy starting age 45, low-dose CT lung (if eligible), cervical (age 21–65), breast (mammogram age 40+)',
            'Mental health screening: PHQ-9 (depression), GAD-7 (anxiety), AUDIT-C (alcohol use)',
            'Body composition assessment, fitness evaluation, and fall risk screening (if age ≥ 65)',
            'Lifestyle counseling: nutrition (Mediterranean/DASH diet), exercise prescription, sleep hygiene, stress management',
        ],
        notes: 'AI-generated preventive care plan based on USPSTF 2024 recommendations and ACIP immunization schedule. Adjust screening intervals and modalities based on individual risk factors, family history, and shared decision-making. Screen for prediabetes (BMI ≥ 25 or age ≥ 35). Discuss advance directives if age ≥ 50.',
        duration: '12 months',
    },
};

const AI_CONDITION_OPTIONS = [
    { key: 'diabetes', label: 'Type 2 Diabetes' },
    { key: 'hypertension', label: 'Hypertension' },
    { key: 'postop', label: 'Post-Surgical Recovery' },
    { key: 'prenatal', label: 'Prenatal Care' },
    { key: 'asthma', label: 'Asthma' },
    { key: 'wellness', label: 'Preventive Wellness' },
];

/* ══════════════════════════════════════════
   Mock Data
   ══════════════════════════════════════════ */

const MOCK_CARE_PLANS: CarePlan[] = [
    {
        id: 'cp-1', patientName: 'Juan Dela Cruz', patientId: 'p1',
        name: 'Diabetes Management Plan', assignedBy: 'Dr. Maria Santos', specialty: 'Endocrinology',
        startDate: 'Jan 15, 2026', targetDate: 'Jul 15, 2026', nextReview: 'Mar 3, 2026',
        status: 'Active', progressPercent: 58,
        goals: [
            { label: 'Fasting blood glucose 80–130 mg/dL (ADA pre-meal target)', completed: true },
            { label: 'HbA1c < 7.0%', completed: false },
            { label: 'Exercise ≥ 150 min/week (30 min × 5 days)', completed: true },
            { label: 'Maintain ≥ 95% medication adherence (no missed doses)', completed: true },
            { label: 'Achieve ≥ 5% weight loss or maintain BMI 18.5–24.9', completed: false },
        ],
        interventions: ['HbA1c every 3 months (quarterly)', 'Medical nutrition therapy with dietitian every 6 weeks', 'Blood glucose self-monitoring 2x/day (FBS + post-prandial)', 'Annual dilated eye exam and monofilament foot exam'],
        notes: 'Patient showing good adherence to medication regimen. HbA1c trending downward from 8.2% → 7.4%. Continue current therapy and reassess at next quarterly review.',
        lastUpdated: 'Feb 10, 2026',
    },
    {
        id: 'cp-2', patientName: 'Juan Dela Cruz', patientId: 'p1',
        name: 'Post-Surgery Recovery', assignedBy: 'Dr. Roberto Lim', specialty: 'Orthopedic Surgery',
        startDate: 'Feb 1, 2026', targetDate: 'Apr 30, 2026', nextReview: 'Feb 22, 2026',
        status: 'Active', progressPercent: 33,
        goals: [
            { label: 'Full range of motion in right knee', completed: false },
            { label: 'Walk unassisted for 15 minutes', completed: true },
            { label: 'Pain level consistently < 3/10', completed: false },
            { label: 'Complete home exercise program daily', completed: true },
        ],
        interventions: ['Physical therapy 2x/week', 'Wound care check at 2 weeks post-op', 'Anti-inflammatory medication as prescribed', 'Follow-up X-ray at 6 weeks'],
        lastUpdated: 'Feb 8, 2026',
    },
    {
        id: 'cp-3', patientName: 'Sofia Garcia', patientId: 'p2',
        name: 'Prenatal Care Plan', assignedBy: 'Dr. Albert Go', specialty: 'OB-GYN',
        startDate: 'Jan 10, 2026', targetDate: 'Aug 15, 2026', nextReview: 'Feb 20, 2026',
        status: 'Active', progressPercent: 25,
        goals: [
            { label: 'Complete all trimester-appropriate screenings on schedule', completed: true },
            { label: 'Maintain healthy weight gain per IOM guidelines for BMI category', completed: false },
            { label: 'Take prenatal vitamins daily (folic acid ≥ 400 mcg, iron, DHA)', completed: true },
            { label: 'Attend childbirth and breastfeeding preparation course by 34 weeks', completed: false },
        ],
        interventions: ['Monthly prenatal visits (biweekly after 28 weeks, weekly after 36 weeks)', 'Glucose challenge test (GCT) at 24–28 weeks', 'Anatomy ultrasound at 18–22 weeks', 'Iron/folate supplementation; GBS screening at 36–37 weeks'],
        notes: 'G1P0, no complications identified. First trimester screening completed — low risk. Continue routine prenatal schedule.',
        lastUpdated: 'Feb 11, 2026',
    },
    {
        id: 'cp-4', patientName: 'Carlos Reyes', patientId: 'p3',
        name: 'Hypertension Management', assignedBy: 'Dr. Ricardo Santos', specialty: 'Internal Medicine',
        startDate: 'Oct 5, 2025', targetDate: 'Apr 5, 2026', nextReview: 'Mar 10, 2026',
        status: 'Completed', progressPercent: 100,
        goals: [
            { label: 'Blood pressure < 130/80 mmHg', completed: true },
            { label: 'Reduce sodium intake to < 2,300 mg/day', completed: true },
            { label: 'Exercise 150 min/week', completed: true },
            { label: 'Take Losartan 50 mg daily', completed: true },
        ],
        interventions: ['Home BP monitoring 2x daily with log', 'Monthly in-clinic BP and weight check', 'DASH diet counseling with dietitian', 'Annual lipid panel, ECG, and renal function tests'],
        lastUpdated: 'Jan 28, 2026',
    },
    {
        id: 'cp-5', patientName: 'Lourdes Bautista', patientId: 'p6',
        name: 'Diabetes & Hypertension Co-management', assignedBy: 'Dr. Ricardo Santos', specialty: 'Internal Medicine',
        startDate: 'Jan 20, 2026', targetDate: 'Jul 20, 2026', nextReview: 'Mar 15, 2026',
        status: 'Active', progressPercent: 18,
        goals: [
            { label: 'HbA1c < 7.0% (current 8.2% — critical)', completed: false },
            { label: 'Blood pressure < 130/80 mmHg consistently', completed: false },
            { label: 'Complete quarterly labs on schedule', completed: true },
            { label: 'Attend diabetes education sessions', completed: false },
        ],
        interventions: ['HbA1c every 3 months', 'Amlodipine 10mg daily (pending approval)', 'Dietitian referral for diabetic meal planning', 'ECG monitoring — latest sinus rhythm 72bpm normal'],
        notes: 'Senior citizen. HbA1c 8.2% — critical. Needs aggressive lifestyle modification and medication optimization. Penicillin allergy noted.',
        lastUpdated: 'Feb 12, 2026',
    },
    // Maxicare patient care plans
    {
        id: 'cp-mc1', patientName: 'Andrea Reyes', patientId: 'p-mc1',
        name: 'Hypertension & Metabolic Risk Management', assignedBy: 'Dr. Carmela Ong', specialty: 'Internal Medicine',
        startDate: 'Jan 20, 2026', targetDate: 'Jul 20, 2026', nextReview: 'Mar 14, 2026',
        status: 'Active', progressPercent: 42,
        goals: [
            { label: 'Blood pressure consistently < 130/80 mmHg', completed: false },
            { label: 'HbA1c < 5.7% (reverse pre-diabetes)', completed: false },
            { label: 'LDL cholesterol < 130 mg/dL', completed: false },
            { label: 'DASH diet adherence ≥ 80%', completed: true },
            { label: 'Exercise ≥ 150 min/week (moderate intensity)', completed: true },
        ],
        interventions: ['Home BP monitoring 2x daily with log', 'Losartan 50mg + Amlodipine 5mg daily', 'Repeat HbA1c in 3 months', 'Lipid panel recheck in 6 months', 'Dietitian referral for DASH diet counseling'],
        notes: 'BP borderline at 138/86 on initial Losartan monotherapy. Amlodipine 5mg added. HbA1c 5.8% — lifestyle modification initiated. LDL 142 — dietary intervention first, reassess for statin at 6-month follow-up.',
        lastUpdated: 'Feb 14, 2026',
    },
    {
        id: 'cp-mc2', patientName: 'Mark Anthony Lim', patientId: 'p-mc2',
        name: 'Dyslipidemia & Cardiovascular Risk Reduction', assignedBy: 'Dr. Jen Diaz', specialty: 'Family Medicine',
        startDate: 'Feb 3, 2026', targetDate: 'Aug 3, 2026', nextReview: 'Apr 3, 2026',
        status: 'Active', progressPercent: 20,
        goals: [
            { label: 'LDL cholesterol < 130 mg/dL (from 162)', completed: false },
            { label: 'Triglycerides < 150 mg/dL (from 180)', completed: false },
            { label: 'HDL cholesterol > 40 mg/dL (currently 38)', completed: false },
            { label: 'Reduce dietary saturated fat intake', completed: true },
            { label: 'Exercise ≥ 150 min/week', completed: false },
            { label: 'Weight loss 3–5 kg (BMI 26.1 → target 24)', completed: false },
        ],
        interventions: ['Dietary counseling — Mediterranean diet emphasis', 'Structured exercise program 30 min/day, 5 days/week', 'Recheck lipid panel in 3 months', 'HbA1c baseline screening', 'Serum uric acid monitoring', 'Reassess for statin at 3-month follow-up if LDL persists > 160'],
        notes: 'Corporate Gold member, 32 yo male. APE revealed significant dyslipidemia: LDL 162, TG 180, HDL 38. BMI 26.1. Lifestyle modification as first-line approach. Will reassess for statin at 3-month follow-up.',
        lastUpdated: 'Feb 3, 2026',
    },
];

/* ══════════════════════════════════════════
   Inline Styles
   ══════════════════════════════════════════ */

const css = {
    page: { padding: '0 0 2rem', maxWidth: 960, margin: '0 auto' } as React.CSSProperties,
    toolbar: { display: 'flex', flexWrap: 'wrap' as const, gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' } as React.CSSProperties,
    searchBox: { flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 13 } as React.CSSProperties,
    searchInput: { border: 'none', outline: 'none', flex: 1, background: 'transparent', fontSize: 13, color: 'var(--color-text)' } as React.CSSProperties,
    chip: (active: boolean) => ({ padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: active ? 700 : 500, background: active ? 'var(--color-primary)' : 'var(--color-surface)', color: active ? '#fff' : 'var(--color-text-muted)', boxShadow: active ? '0 2px 8px var(--color-primary-transparent, rgba(0,0,0,0.1))' : 'none', transition: 'all 0.15s ease' }) as React.CSSProperties,
    btnPrimary: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'var(--color-primary)', color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' as const } as React.CSSProperties,
    btnGhost: { display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer' } as React.CSSProperties,
    statsRow: { display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' as const } as React.CSSProperties,
    stat: () => ({ flex: '1 1 0', minWidth: 80, textAlign: 'center' as const, padding: '0.65rem 0.5rem', borderRadius: 10, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }) as React.CSSProperties,
    statNum: (color: string) => ({ fontSize: '1.35rem', fontWeight: 800, color, lineHeight: 1 }) as React.CSSProperties,
    statLbl: { fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500 } as React.CSSProperties,
    card: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, marginBottom: '0.75rem', overflow: 'hidden', transition: 'box-shadow 0.2s ease' } as React.CSSProperties,
    cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.9rem 1rem', cursor: 'pointer', gap: '0.5rem' } as React.CSSProperties,
    planName: { fontSize: '0.98rem', fontWeight: 600, color: 'var(--color-text)', margin: 0, lineHeight: 1.3 } as React.CSSProperties,
    metaRow: { display: 'flex', flexWrap: 'wrap' as const, alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' } as React.CSSProperties,
    metaItem: { display: 'flex', alignItems: 'center', gap: 3 } as React.CSSProperties,
    badge: (status: CarePlanStatus) => {
        const map: Record<CarePlanStatus, { bg: string; fg: string }> = {
            Active: { bg: 'color-mix(in srgb, var(--color-primary) 12%, white)', fg: 'var(--color-primary)' },
            Completed: { bg: 'color-mix(in srgb, var(--color-success) 12%, white)', fg: 'var(--color-success)' },
            Scheduled: { bg: 'color-mix(in srgb, var(--color-warning, #f59e0b) 12%, white)', fg: 'var(--color-warning, #f59e0b)' },
            Draft: { bg: 'color-mix(in srgb, var(--color-text-muted) 12%, white)', fg: 'var(--color-text-muted)' },
        };
        const c = map[status];
        return { display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: c.bg, color: c.fg } as React.CSSProperties;
    },
    progressWrap: { padding: '0 1rem 0.6rem' } as React.CSSProperties,
    progressOuter: { height: 5, borderRadius: 999, background: 'var(--color-border)', overflow: 'hidden' } as React.CSSProperties,
    progressInner: (pct: number, status: CarePlanStatus) => ({ height: '100%', borderRadius: 999, width: `${pct}%`, background: status === 'Completed' ? 'var(--color-success)' : status === 'Scheduled' ? 'var(--color-warning, #f59e0b)' : 'var(--color-primary)', transition: 'width 0.5s ease' }) as React.CSSProperties,
    progressLbl: { fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.3rem' } as React.CSSProperties,
    expandBody: { padding: '0 1rem 1rem', borderTop: '1px solid var(--color-border)' } as React.CSSProperties,
    subHeading: { fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)', margin: '0.85rem 0 0.4rem', display: 'flex', alignItems: 'center', gap: 5 } as React.CSSProperties,
    goalItem: { display: 'flex', alignItems: 'flex-start', gap: 6, padding: '0.25rem 0', fontSize: '0.86rem', color: 'var(--color-text)', lineHeight: 1.45 } as React.CSSProperties,
    goalCheck: (done: boolean) => ({ color: done ? 'var(--color-success)' : 'var(--color-border)', flexShrink: 0, marginTop: 2, cursor: 'pointer' }) as React.CSSProperties,
    intItem: { display: 'flex', alignItems: 'flex-start', gap: 6, padding: '0.2rem 0', fontSize: '0.86rem', color: 'var(--color-text)', lineHeight: 1.45 } as React.CSSProperties,
    noteBox: { background: 'var(--color-primary-light, #f0f9ff)', borderRadius: 8, padding: '0.6rem 0.75rem', marginTop: '0.75rem', fontSize: '0.84rem', color: 'var(--color-primary)', fontWeight: 500, display: 'flex', alignItems: 'flex-start', gap: 6 } as React.CSSProperties,
    reviewBanner: { display: 'flex', alignItems: 'center', gap: 6, marginTop: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 8, background: 'var(--color-primary-light, #f0f9ff)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-primary)' } as React.CSSProperties,
    actionRow: { display: 'flex', gap: 6, marginTop: '0.85rem', flexWrap: 'wrap' as const } as React.CSSProperties,
    patientTag: { display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--color-primary-light, #f0f9ff)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, marginBottom: 2 } as React.CSSProperties,
    aiBadge: { display: 'inline-flex', alignItems: 'center', gap: 3, background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)', color: '#fff', padding: '2px 7px', borderRadius: 6, fontSize: 10, fontWeight: 700 } as React.CSSProperties,
    /* Modal */
    overlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 } as React.CSSProperties,
    modal: { background: 'var(--color-surface)', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' as const, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' } as React.CSSProperties,
    modalHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)' } as React.CSSProperties,
    modalTitle: { fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 } as React.CSSProperties,
    modalBody: { padding: '1rem 1.25rem' } as React.CSSProperties,
    modalFoot: { display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '0.75rem 1.25rem', borderTop: '1px solid var(--color-border)' } as React.CSSProperties,
    formGroup: { marginBottom: '0.85rem' } as React.CSSProperties,
    formLabel: { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 } as React.CSSProperties,
    formInput: { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 13, color: 'var(--color-text)', background: 'var(--color-surface)', boxSizing: 'border-box' as const } as React.CSSProperties,
    formTextarea: { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 13, color: 'var(--color-text)', background: 'var(--color-surface)', minHeight: 60, resize: 'vertical' as const, fontFamily: 'inherit', boxSizing: 'border-box' as const } as React.CSSProperties,
    aiPanel: { background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)', border: '1px solid #c7d2fe', borderRadius: 10, padding: '0.85rem', marginBottom: '1rem' } as React.CSSProperties,
    aiHeading: { display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 700, color: '#4f46e5', margin: '0 0 0.5rem' } as React.CSSProperties,
    aiCondBtn: (active: boolean) => ({ padding: '5px 11px', borderRadius: 8, border: active ? '2px solid #6366f1' : '1px solid #c7d2fe', background: active ? '#fff' : 'rgba(255,255,255,0.6)', color: active ? '#4f46e5' : '#6b7280', fontSize: 12, fontWeight: active ? 700 : 500, cursor: 'pointer', transition: 'all 0.12s' }) as React.CSSProperties,
    aiApplyBtn: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.15s' } as React.CSSProperties,
    aiNote: { fontSize: '0.76rem', color: '#6b7280', lineHeight: 1.4, marginTop: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: 4 } as React.CSSProperties,
};

/* ══════════════════════════════════════════
   Care Plan Card
   ══════════════════════════════════════════ */

const CarePlanCard: React.FC<{
    plan: CarePlan;
    onToggleGoal: (planId: string, goalIdx: number) => void;
    onDelete: (planId: string) => void;
}> = ({ plan, onToggleGoal, onDelete }) => {
    const [expanded, setExpanded] = useState(plan.status === 'Active');
    const completedGoals = plan.goals.filter(g => g.completed).length;

    return (
        <div style={css.card}>
            <div style={css.cardHead} onClick={() => setExpanded(v => !v)} role="button" tabIndex={0}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <p style={css.planName}>{plan.name}</p>
                        {plan.aiGenerated && <span style={css.aiBadge}><Sparkles size={9} /> AI</span>}
                    </div>
                    <div style={css.metaRow}>
                        <span style={css.patientTag}><User size={11} />{plan.patientName || 'Unassigned'}</span>
                        <span style={css.metaItem}><User size={12} />{plan.assignedBy}</span>
                        <span style={{ opacity: 0.4 }}>·</span>
                        <span>{plan.specialty}</span>
                    </div>
                    <div style={css.metaRow}>
                        {plan.startDate && <span style={css.metaItem}><Calendar size={12} />{plan.startDate} → {plan.targetDate}</span>}
                        <span style={css.badge(plan.status)}><Activity size={10} />{plan.status}</span>
                    </div>
                </div>
                <div style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>
                    {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </div>

            {plan.status !== 'Draft' && (
                <div style={css.progressWrap}>
                    <div style={css.progressOuter}><div style={css.progressInner(plan.progressPercent, plan.status)} /></div>
                    <div style={css.progressLbl}>{completedGoals}/{plan.goals.length} goals ({plan.progressPercent}%)</div>
                </div>
            )}

            {expanded && (
                <div style={css.expandBody}>
                    <div style={css.subHeading}><Target size={14} /> Goals</div>
                    {plan.goals.map((goal, i) => (
                        <div key={i} style={css.goalItem}>
                            <CheckCircle2 size={16} style={css.goalCheck(goal.completed)} onClick={(e) => { e.stopPropagation(); onToggleGoal(plan.id, i); }} />
                            <span style={{ textDecoration: goal.completed ? 'line-through' : 'none', opacity: goal.completed ? 0.65 : 1 }}>{goal.label}</span>
                        </div>
                    ))}

                    <div style={css.subHeading}><ClipboardList size={14} /> Interventions</div>
                    {plan.interventions.map((item, i) => (
                        <div key={i} style={css.intItem}>
                            <Activity size={13} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
                            {item}
                        </div>
                    ))}

                    {plan.notes && (
                        <div style={css.noteBox}><Edit3 size={14} style={{ flexShrink: 0, marginTop: 1 }} />{plan.notes}</div>
                    )}
                    {plan.nextReview && (
                        <div style={css.reviewBanner}><Calendar size={14} />Next Review: {plan.nextReview}</div>
                    )}

                    <div style={css.actionRow}>
                        <button style={css.btnGhost}><Edit3 size={13} /> Edit Plan</button>
                        {plan.status === 'Draft' && (
                            <button style={css.btnGhost} onClick={(e) => { e.stopPropagation(); onDelete(plan.id); }}><Trash2 size={13} /> Delete Draft</button>
                        )}
                        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-text-muted)', alignSelf: 'center' }}>Updated {plan.lastUpdated}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════
   Create Care Plan Modal (with AI)
   ══════════════════════════════════════════ */

const CreateModal: React.FC<{
    onClose: () => void;
    onCreate: (plan: CarePlan) => void;
    doctorName: string;
    aiEnabled: boolean;
}> = ({ onClose, onCreate, doctorName, aiEnabled }) => {
    const [form, setForm] = useState({ patientName: '', name: '', specialty: '', startDate: '', targetDate: '', goals: '', interventions: '', notes: '' });
    const [aiCondition, setAiCondition] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiApplied, setAiApplied] = useState(false);

    const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

    const handleAIGenerate = useCallback(() => {
        if (!aiCondition) return;
        setAiLoading(true);
        // Simulate AI generation delay
        setTimeout(() => {
            const template = AI_TEMPLATES[aiCondition];
            if (template) {
                setForm(f => ({
                    ...f,
                    name: template.name,
                    specialty: template.specialty,
                    goals: template.goals.join('\n'),
                    interventions: template.interventions.join('\n'),
                    notes: template.notes,
                }));
                setAiApplied(true);
            }
            setAiLoading(false);
        }, 1200);
    }, [aiCondition]);

    const handleRegenerate = useCallback(() => {
        setAiApplied(false);
        setAiCondition(null);
        setForm(f => ({ ...f, name: '', specialty: '', goals: '', interventions: '', notes: '' }));
    }, []);

    const handleSubmit = () => {
        if (!form.name.trim()) return;
        const goals = form.goals.split('\n').filter(Boolean).map(l => ({ label: l.trim(), completed: false }));
        const interventions = form.interventions.split('\n').filter(Boolean).map(l => l.trim());
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        onCreate({
            id: `cp-new-${Date.now()}`,
            patientName: form.patientName || '',
            patientId: '',
            name: form.name,
            assignedBy: doctorName,
            specialty: form.specialty || 'General',
            startDate: form.startDate || dateStr,
            targetDate: form.targetDate || '',
            nextReview: '',
            status: form.patientName ? 'Active' : 'Draft',
            progressPercent: 0,
            goals: goals.length > 0 ? goals : [{ label: 'No goals defined yet', completed: false }],
            interventions: interventions.length > 0 ? interventions : ['To be determined'],
            notes: form.notes || undefined,
            lastUpdated: dateStr,
            aiGenerated: aiApplied,
        });
    };

    return (
        <div style={css.overlay} onClick={onClose}>
            <div style={css.modal} onClick={e => e.stopPropagation()}>
                <div style={css.modalHead}>
                    <h3 style={css.modalTitle}>Create Care Plan</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={18} /></button>
                </div>
                <div style={css.modalBody}>
                    {/* AI Assistant Panel */}
                    {aiEnabled && (
                        <div style={css.aiPanel}>
                            <div style={css.aiHeading}>
                                <Bot size={16} />
                                AI Care Plan Assistant
                                {aiApplied && <span style={{ ...css.aiBadge, fontSize: 9, marginLeft: 4 }}><Sparkles size={8} /> Applied</span>}
                            </div>

                            {!aiApplied ? (
                                <>
                                    <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 0.5rem', lineHeight: 1.4 }}>
                                        Select a condition and AI will generate evidence-based goals, interventions, and clinical notes.
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '0.6rem' }}>
                                        {AI_CONDITION_OPTIONS.map(opt => (
                                            <button key={opt.key} style={css.aiCondBtn(aiCondition === opt.key)} onClick={() => setAiCondition(opt.key)}>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        style={{ ...css.aiApplyBtn, opacity: aiCondition ? 1 : 0.4 }}
                                        onClick={handleAIGenerate}
                                        disabled={!aiCondition || aiLoading}
                                    >
                                        {aiLoading ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</> : <><Sparkles size={13} /> Generate Plan</>}
                                    </button>
                                    <div style={css.aiNote}>
                                        <Bot size={12} style={{ flexShrink: 0, marginTop: 1 }} />
                                        AI suggestions follow latest clinical guidelines (ADA, ACC/AHA, GINA, ACOG, USPSTF). Always review and customize for the individual patient.
                                    </div>
                                </>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600 }}>
                                        Plan generated from {AI_CONDITION_OPTIONS.find(o => o.key === aiCondition)?.label} template. You can edit all fields below.
                                    </span>
                                    <button onClick={handleRegenerate} style={{ ...css.btnGhost, padding: '4px 10px', fontSize: 11 }}>
                                        <RefreshCw size={12} /> Reset
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Form Fields */}
                    <div style={css.formGroup}>
                        <label style={css.formLabel}>Plan Name *</label>
                        <input style={css.formInput} placeholder="e.g. Diabetes Management Plan" value={form.name} onChange={e => set('name', e.target.value)} />
                    </div>
                    <div style={css.formGroup}>
                        <label style={css.formLabel}>Patient Name (leave blank to save as Draft)</label>
                        <input style={css.formInput} placeholder="e.g. Juan Dela Cruz" value={form.patientName} onChange={e => set('patientName', e.target.value)} />
                    </div>
                    <div style={css.formGroup}>
                        <label style={css.formLabel}>Specialty</label>
                        <input style={css.formInput} placeholder="e.g. Endocrinology" value={form.specialty} onChange={e => set('specialty', e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <div style={{ ...css.formGroup, flex: 1 }}>
                            <label style={css.formLabel}>Start Date</label>
                            <input style={css.formInput} type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
                        </div>
                        <div style={{ ...css.formGroup, flex: 1 }}>
                            <label style={css.formLabel}>Target Date</label>
                            <input style={css.formInput} type="date" value={form.targetDate} onChange={e => set('targetDate', e.target.value)} />
                        </div>
                    </div>
                    <div style={css.formGroup}>
                        <label style={css.formLabel}>Goals (one per line) {aiApplied && <span style={{ color: '#6366f1', fontWeight: 400 }}>- AI generated, edit as needed</span>}</label>
                        <textarea style={{ ...css.formTextarea, minHeight: 100 }} placeholder={"Fasting blood sugar < 126 mg/dL\nHbA1c < 7.0%\nWalk 30 minutes daily"} value={form.goals} onChange={e => set('goals', e.target.value)} rows={5} />
                    </div>
                    <div style={css.formGroup}>
                        <label style={css.formLabel}>Interventions (one per line) {aiApplied && <span style={{ color: '#6366f1', fontWeight: 400 }}>- AI generated, edit as needed</span>}</label>
                        <textarea style={{ ...css.formTextarea, minHeight: 80 }} placeholder={"Monthly HbA1c test\nDiet consultation every 6 weeks"} value={form.interventions} onChange={e => set('interventions', e.target.value)} rows={4} />
                    </div>
                    <div style={css.formGroup}>
                        <label style={css.formLabel}>Clinical Notes {aiApplied && <span style={{ color: '#6366f1', fontWeight: 400 }}>- AI rationale included</span>}</label>
                        <textarea style={css.formTextarea} placeholder="Any additional notes..." value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} />
                    </div>
                </div>
                <div style={css.modalFoot}>
                    <button style={css.btnGhost} onClick={onClose}>Cancel</button>
                    <button style={{ ...css.btnPrimary, opacity: form.name.trim() ? 1 : 0.4 }} onClick={handleSubmit} disabled={!form.name.trim()}>
                        <Save size={14} /> {form.patientName ? 'Create Plan' : 'Save as Draft'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════ */

export const DoctorCarePlans = () => {
    const { currentStaff } = useProvider();
    const { tenant } = useTheme();
    const { showToast } = useToast();
    const [plans, setPlans] = useState<CarePlan[]>(MOCK_CARE_PLANS);
    const [filter, setFilter] = useState<string>('All');
    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);

    const aiEnabled = !!tenant.features.aiAssistant;
    const filters = ['All', 'Active', 'Completed', 'Scheduled', 'Draft'];

    const filtered = useMemo(() => {
        let result = plans;
        if (filter !== 'All') result = result.filter(p => p.status === filter);
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(q) || p.patientName.toLowerCase().includes(q) || p.specialty.toLowerCase().includes(q));
        }
        return result;
    }, [plans, filter, search]);

    const counts = useMemo(() => ({
        active: plans.filter(p => p.status === 'Active').length,
        completed: plans.filter(p => p.status === 'Completed').length,
        scheduled: plans.filter(p => p.status === 'Scheduled').length,
        draft: plans.filter(p => p.status === 'Draft').length,
        totalGoals: plans.reduce((a, p) => a + p.goals.length, 0),
        metGoals: plans.reduce((a, p) => a + p.goals.filter(g => g.completed).length, 0),
    }), [plans]);

    const handleToggleGoal = (planId: string, goalIdx: number) => {
        setPlans(prev => prev.map(p => {
            if (p.id !== planId) return p;
            const goals = [...p.goals];
            goals[goalIdx] = { ...goals[goalIdx], completed: !goals[goalIdx].completed };
            const completedCount = goals.filter(g => g.completed).length;
            return { ...p, goals, progressPercent: Math.round((completedCount / goals.length) * 100) };
        }));
        showToast('Goal updated', 'success');
    };

    const handleDelete = (planId: string) => {
        setPlans(prev => prev.filter(p => p.id !== planId));
        showToast('Draft deleted', 'info');
    };

    const handleCreate = (plan: CarePlan) => {
        setPlans(prev => [plan, ...prev]);
        setShowCreate(false);
        showToast(`Care plan "${plan.name}" created${plan.aiGenerated ? ' (AI-assisted)' : ''}`, 'success');
    };

    // Receptionist: read-only view
    const canCreate = currentStaff.role === 'doctor' || currentStaff.role === 'nurse' || currentStaff.role === 'admin';

    return (
        <div style={css.page}>
            <PageHeader title="Care Plans" subtitle={`Manage and track patient care plans · ${currentStaff.name}`} />

            {/* Stats */}
            <div style={css.statsRow}>
                <div style={css.stat()}><div style={css.statNum('var(--color-primary)')}>{counts.active}</div><div style={css.statLbl}>Active</div></div>
                <div style={css.stat()}><div style={css.statNum('var(--color-success)')}>{counts.completed}</div><div style={css.statLbl}>Completed</div></div>
                <div style={css.stat()}><div style={css.statNum('var(--color-warning, #f59e0b)')}>{counts.scheduled}</div><div style={css.statLbl}>Scheduled</div></div>
                <div style={css.stat()}><div style={css.statNum('var(--color-text-muted)')}>{counts.draft}</div><div style={css.statLbl}>Drafts</div></div>
                <div style={css.stat()}><div style={css.statNum('var(--color-text)')}>{counts.metGoals}/{counts.totalGoals}</div><div style={css.statLbl}>Goals Met</div></div>
            </div>

            {/* Toolbar */}
            <div style={css.toolbar}>
                <div style={css.searchBox}>
                    <Search size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                    <input style={css.searchInput} placeholder="Search plans, patients, specialty..." value={search} onChange={e => setSearch(e.target.value)} />
                    {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 0 }}><X size={14} /></button>}
                </div>
                {canCreate && (
                    <button style={css.btnPrimary} onClick={() => setShowCreate(true)}>
                        <Plus size={15} /> New Plan
                        {aiEnabled && <Sparkles size={12} style={{ marginLeft: 2, opacity: 0.8 }} />}
                    </button>
                )}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' }}>
                {filters.map(f => (
                    <button key={f} style={css.chip(filter === f)} onClick={() => setFilter(f)}>
                        {f}
                        {f !== 'All' && <span style={{ marginLeft: 4, opacity: 0.7 }}>{f === 'Active' ? counts.active : f === 'Completed' ? counts.completed : f === 'Scheduled' ? counts.scheduled : counts.draft}</span>}
                    </button>
                ))}
            </div>

            {/* Plans */}
            {filtered.length === 0 ? (
                <EmptyState icon={<ClipboardList size={40} />} title="No care plans found" description={search ? 'Try a different search term.' : `No ${filter.toLowerCase()} care plans.`} />
            ) : (
                filtered.map(plan => <CarePlanCard key={plan.id} plan={plan} onToggleGoal={handleToggleGoal} onDelete={handleDelete} />)
            )}

            {/* Create Modal */}
            {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreate={handleCreate} doctorName={currentStaff.name} aiEnabled={aiEnabled} />}

            {/* Spinner keyframe (for AI loading) */}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};
