import React, { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import { useToast } from './ToastContext';

// LOA & Benefits types
export interface LOARequest {
    id: string;
    type: string;
    provider: string;
    date: string;
    status: 'Approved' | 'Pending' | 'Rejected';
    amount: string;
}

export interface Claim {
    id: string;
    type: string;
    provider: string;
    date: string;
    amount: string;
    status: 'Processed' | 'Pending' | 'Rejected' | 'In Review';
    reimbursementMethod?: string;
}

export interface Procedure {
    id: string;
    category: string;
    name: string;
    date: string;
    time: string;
    location: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface Appointment {
    id: string;
    doctor: string;
    specialty: string;
    date: string;
    time: string;
    status: 'Upcoming' | 'Completed' | 'Cancelled';
    type?: string;
    location?: string;
    /** Doctor-side fields */
    patientName?: string;
    patientId?: string;
    chiefComplaint?: string;
    notes?: string;
}

export interface Medication {
    id: string;
    name: string;
    dosage: string;
    instruction: string;
    remaining: number;
    refillDate: string;
    status: 'Active' | 'Low Stock' | 'Refill Requested' | 'Expired';
}

export interface ClinicalResult {
    id: string;
    title: string;
    type: 'Laboratory' | 'Radiology' | 'Pathology' | 'Imaging';
    date: string;
    doctor: string;
    status: 'Final' | 'Pending';
    isCritical?: boolean;
    hasFollowUp?: boolean;
}

export interface DoctorRequest {
    id: string;
    type: 'Laboratory' | 'Imaging' | 'Procedure';
    title: string;
    doctor: string;
    date: string;
    status: 'Pending' | 'Scheduled' | 'Completed';
    priority: 'Routine' | 'Urgent' | 'Stat';
    notes?: string;
    facility?: string;
    homeCareEligible: boolean;
    specimenType?: 'Blood' | 'Urine' | 'Stool' | 'Swab' | 'Other';
}

// Unified Step Status
export type StepStatus = 'PENDING' | 'QUEUED' | 'READY' | 'IN_SESSION' | 'COMPLETED' | 'PAUSED';
export type StepType = 'TRIAGE' | 'CONSULT' | 'LAB' | 'IMAGING' | 'PHARMACY' | 'BILLING';

export interface QueueStep {
    id: string;
    label: string;
    location: string;
    floor: string;
    wing: string;
    status: StepStatus;
    type: StepType;
    waitMinutes: number;
    ticket: string;
    description?: string;
    preparation?: string;
    dependencies?: string[];
}

// Queue Info
export interface QueueInfo {
    queueNumber: string;
    peopleAhead: number;
    estimatedWaitTime: string;
    currentServing: string;
}

export interface BenefitCategory {
    id: string;
    name: string;
    limit: string;
    used: string;
    icon: string;
}

export interface PhilHealth {
    membershipNumber: string;
    status: 'Active' | 'Inactive' | 'Updating';
    category: string;
    lastContribution?: string;
    konsultaProvider?: string;
    fpeStatus?: string;
    mbl: string;
    mblUsed: string;
    benefitCategories: BenefitCategory[];
}

export interface HMOCard {
    id: string;
    provider: string;
    memberNo: string;
    accountName?: string;
    accountNumber?: string;
    planType: string;
    validity: string;
    coverageAmount: string;
    usedAmount: string;
    mbl: string;
    mblUsed: string;
    benefitCategories: BenefitCategory[];
    status: 'Active' | 'Pending';
}

export interface WellnessBenefit {
    id: string;
    type: string;
    balance: string;
    description: string;
    validity: string;
}

export interface Dependent {
    id: string;
    name: string;
    relation: string;
    birthDate: string;
    idNumber: string;
    photoUrl?: string;
}

export interface UserProfile {
    id: string;
    name: string;
    memberId: string;
    company: string;
    validity: string;
    membershipType: string;
    emergencyContact: {
        name: string;
        relation: string;
        phone: string;
    };
    philHealth?: PhilHealth;
    hmoCards: HMOCard[];
    wellnessBenefits: WellnessBenefit[];
}

interface DataContextType {
    appointments: Appointment[];
    medications: Medication[];
    results: ClinicalResult[];
    doctorRequests: DoctorRequest[];
    invoices: Invoice[];
    procedures: Procedure[];
    loaRequests: LOARequest[];
    claims: Claim[];
    userProfile: UserProfile | null;
    dependents: Dependent[];
    addAppointment: (appt: Omit<Appointment, 'id' | 'status'>) => void;
    cancelAppointment: (id: string) => void;
    requestRefill: (medId: string) => void;
    payInvoice: (id: string) => void;
    bookFollowUp: (resultId: string) => void;
    bookProcedure: (proc: Omit<Procedure, 'id' | 'status'>) => void;
    requestLOA: (loa: Omit<LOARequest, 'id' | 'status'>) => void;
    fileClaim: (claim: Omit<Claim, 'id' | 'status'>) => void;
    addHMOCard: (hmo: Omit<HMOCard, 'id' | 'mbl' | 'mblUsed' | 'benefitCategories' | 'status'>) => void;
    // Queue
    queueMode: 'LINEAR' | 'MULTI_STREAM';
    toggleQueueMode: () => void;
    isQueueActive: boolean;
    joinQueue: () => void;
    leaveQueue: () => void;
    steps: QueueStep[];
    linearSteps: QueueStep[];
    multiStreamSteps: QueueStep[];
    advanceQueue: () => void;
    queueForStep: (stepId: string) => void;
    startStep: (stepId: string) => void;
    checkIn: (stepId: string) => void;
    completeStep: (stepId: string) => void;
    queueAllAvailable: () => void;
    canQueueStep: (stepId: string) => boolean;
    isVisitComplete: boolean;
    queueInfo: QueueInfo;
    activeSteps: QueueStep[];
    pendingSteps: QueueStep[];
    completedSteps: QueueStep[];
    pausedSteps: QueueStep[];
    currentStepIndex: number;
    visitProgress: number;
    // Pause / Resume
    isQueuePaused: boolean;
    pauseReason: string | null;
    pauseNotes: string | null;
    pauseResumeDate: string | null;
    pauseQueue: (reason: string, notes?: string, resumeDate?: string) => void;
    resumeQueue: () => void;
    notifications: Notification[];
    unreadNotificationsCount: number;
    markAsRead: (id: string) => void;
    markReadByRoute: (pathname: string) => void;
    // Simulation
    isSimulating: boolean;
    toggleSimulation: () => void;
    // Patient Management
    currentPatientId: string;
    switchPatient: (patientId: string) => void;
    addDependent: (dependent: Omit<Dependent, 'id'>) => void;
    availablePatients: UserProfile[];
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    date: string;
    read: boolean;
    type: 'info' | 'success' | 'warning' | 'error';
    link?: string;
}

export interface Invoice {
    id: string;
    date: string;
    description: string;
    provider: string;
    amount: number;
    status: 'Paid' | 'Pending' | 'Overdue';
    type: 'Consultation' | 'Laboratory' | 'Radiology' | 'Procedure' | 'Pharmacy';
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial step data
const INITIAL_STEPS: QueueStep[] = [
    {
        id: 'triage', label: 'Triage / Vitals', location: 'Station 1', floor: 'G', wing: 'East',
        status: 'PENDING', type: 'TRIAGE', waitMinutes: 5, ticket: 'T-001',
        description: 'Standard assessment of vital signs (BP, HR, Temp).',
        preparation: 'Please have your HMO card and ID ready.',
        dependencies: []
    },
    {
        id: 'consult', label: 'Doctor Consult', location: 'Clinic Room 3', floor: '2F', wing: 'West',
        status: 'PENDING', type: 'CONSULT', waitMinutes: 15, ticket: 'C-101',
        description: 'Detailed consultation with Dr. Jen Diaz.',
        preparation: 'Prepare a list of your current symptoms and medications.',
        dependencies: ['triage']
    },
    {
        id: 'urinalysis', label: 'Urinalysis', location: 'Lab Collection', floor: '1F', wing: 'East',
        status: 'PENDING', type: 'LAB', waitMinutes: 10, ticket: 'L-505',
        description: 'Screening for metabolic and kidney disorders.',
        preparation: 'Mid-stream collection required. Sterile cups provided.',
        dependencies: ['consult']
    },
    {
        id: 'fecalysis', label: 'Fecalysis', location: 'Lab Collection', floor: '1F', wing: 'East',
        status: 'PENDING', type: 'LAB', waitMinutes: 10, ticket: 'L-506',
        description: 'Examination for parasites or GI infections.',
        preparation: 'Collect a small sample using the provided scoop.',
        dependencies: ['consult']
    },
    {
        id: 'xray', label: 'Chest X-Ray', location: 'Radiology Rm 2', floor: '1F', wing: 'West',
        status: 'PENDING', type: 'IMAGING', waitMinutes: 20, ticket: 'R-102',
        description: 'PA/Lateral view of the chest.',
        preparation: 'Remove necklaces, bras with wires, and metal objects.',
        dependencies: ['consult']
    },
    {
        id: 'cbc', label: 'Complete Blood Count', location: 'Phlebotomy', floor: '1F', wing: 'East',
        status: 'PENDING', type: 'LAB', waitMinutes: 15, ticket: 'L-507',
        description: 'Blood draw to evaluate overall health.',
        preparation: 'Relax and stay hydrated. No fasting required.',
        dependencies: ['consult']
    },
    {
        id: 'ultrasound', label: 'Ultrasound', location: 'Radiology Rm 4', floor: '1F', wing: 'West',
        status: 'PENDING', type: 'IMAGING', waitMinutes: 30, ticket: 'R-105',
        description: 'Abdominal ultrasound imaging.',
        preparation: 'Full bladder required. Drink 4-6 glasses of water 1hr prior.',
        dependencies: ['consult']
    },
    {
        id: 'pharmacy', label: 'Pharmacy', location: 'Disbursement', floor: 'G', wing: 'Main',
        status: 'PENDING', type: 'PHARMACY', waitMinutes: 10, ticket: 'P-202',
        description: 'Medication dispensing and counseling.',
        preparation: 'Prepare payment or HMO LOA.',
        dependencies: ['urinalysis', 'fecalysis', 'xray', 'cbc', 'ultrasound']
    },
    {
        id: 'billing', label: 'Billing', location: 'Cashier', floor: 'G', wing: 'Main',
        status: 'PENDING', type: 'BILLING', waitMinutes: 5, ticket: 'B-303',
        description: 'Final bill settlement.',
        preparation: 'Cash, Credit Card, and e-Wallets accepted.',
        dependencies: ['pharmacy']
    }
];

import { useTheme } from '../theme/ThemeContext';
import { METRO_DATA, MERALCO_DATA, HEALTHFIRST_DATA, MAXICARE_DATA } from '../data/tenantData';

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { showToast } = useToast();
    const { tenant } = useTheme();



    // Remediation: Invoices State
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [procedures, setProcedures] = useState<Procedure[]>([]);
    const [loaRequests, setLoaRequests] = useState<LOARequest[]>([]);
    const [claims, setClaims] = useState<Claim[]>([]);

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [results, setResults] = useState<ClinicalResult[]>([]);
    const [doctorRequests, setDoctorRequests] = useState<DoctorRequest[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [dependents, setDependents] = useState<Dependent[]>([]);

    const [currentPatientId, setCurrentPatientId] = useState<string>('p1');
    const [availablePatients, setAvailablePatients] = useState<UserProfile[]>([]);

    // Initialize data based on tenant
    React.useEffect(() => {
        let tenantData;
        switch (tenant.id) {
            case 'meralcoWellness':
                tenantData = MERALCO_DATA;
                break;
            case 'healthFirst':
                tenantData = HEALTHFIRST_DATA;
                break;
            case 'metroGeneral':
                tenantData = METRO_DATA;
                break;
            case 'maxicare':
                tenantData = MAXICARE_DATA;
                break;
            default:
                // Custom / dynamic tenants get a demo patient seeded
                tenantData = {
                    patients: [{
                        userProfile: {
                            id: 'p-custom',
                            name: 'Demo Patient',
                            memberId: '0000000001',
                            company: tenant.name.toUpperCase(),
                            validity: '01/2026 - 12/2026',
                            membershipType: 'Standard Member',
                            emergencyContact: { name: 'Emergency Contact', relation: 'Relative', phone: '0900-000-0000' },
                            philHealth: { membershipNumber: '00-000000000-0', category: 'Direct Contributor', status: 'Active', konsultaProvider: tenant.name, fpeStatus: 'Pending' },
                            hmoCards: [],
                            wellnessBenefits: []
                        },
                        dependents: [],
                        appointments: tenant.features.appointments ? [
                            { id: 'a-demo', doctor: 'Dr. Demo', specialty: 'General', date: 'Mar 1, 2026', time: '09:00 AM', status: 'Upcoming', location: tenant.name }
                        ] : [],
                        medications: [],
                        results: [],
                        notifications: [{ id: 'n-demo-1', title: 'Welcome', message: `Your ${tenant.name} portal is ready.`, date: 'Just now', read: false, type: 'success' }],
                        invoices: [],
                        procedures: [],
                        loaRequests: [],
                        claims: []
                    }]
                };
                break;
        }

        const patients = tenantData.patients;
        setAvailablePatients(patients.map((p: any) => p.userProfile));

        // Find current patient or fallback to first
        let currentPatient = patients.find((p: any) => p.userProfile.id === currentPatientId);
        if (!currentPatient) {
            currentPatient = patients[0];
            setCurrentPatientId(currentPatient.userProfile.id);
        }

        setAppointments(currentPatient.appointments);
        setMedications(currentPatient.medications);
        setResults(currentPatient.results);
        setDoctorRequests(currentPatient.doctorRequests || []);
        setNotifications(currentPatient.notifications);
        setInvoices(currentPatient.invoices || []);
        setProcedures(currentPatient.procedures || []);
        setLoaRequests(currentPatient.loaRequests || []);
        setClaims(currentPatient.claims || []);
        setUserProfile(currentPatient.userProfile || null);
        setDependents(currentPatient.dependents || []);
    }, [tenant.id, currentPatientId]);

    const switchPatient = React.useCallback((patientId: string) => {
        setCurrentPatientId(patientId);
    }, []);

    const addDependent = React.useCallback((dependent: Omit<Dependent, 'id'>) => {
        const newDep: Dependent = { ...dependent, id: `d-new-${Date.now()}`, idNumber: `DEP-${Math.floor(Math.random() * 1000)}` };
        setDependents(prev => [...prev, newDep]);

        // Add notification
        const newNotification: Notification = {
            id: `n-dep-${Date.now()}`,
            title: 'Dependent Added',
            message: `${dependent.name} has been added to your plan.`,
            date: 'Just now',
            read: false,
            type: 'success',
            link: '/profile/dependents'
        };
        setNotifications(prev => [newNotification, ...prev]);
    }, []);

    const unreadNotificationsCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    const markAsRead = React.useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, []);

    /**
     * Auto-mark notifications as read when the user visits the source page.
     * Uses the same link-prefix + keyword logic as useBadges so badges clear correctly.
     */
    const ROUTE_MATCHERS: Record<string, { prefixes: string[]; keywords: string[] }> = {
        '/appointments': { prefixes: ['/appointments', '/visits'], keywords: ['appointment', 'consult', 'procedure', 'homecare'] },
        '/visits': { prefixes: ['/visits', '/appointments'], keywords: ['appointment', 'consult', 'procedure', 'homecare'] },
        '/results': { prefixes: ['/results'], keywords: ['result', 'lab', 'report'] },
        '/medications': { prefixes: ['/medications'], keywords: ['prescription', 'refill', 'medication'] },
        '/immunization': { prefixes: ['/immunization'], keywords: ['immunization', 'vaccine', 'shot'] },
        '/medical-history': { prefixes: ['/medical-history', '/health'], keywords: ['history', 'record'] },
        '/health': { prefixes: ['/results', '/medications', '/immunization', '/medical-history', '/health'], keywords: ['result', 'lab', 'prescription', 'refill', 'immunization', 'vaccine'] },
        '/community': { prefixes: ['/community', '/events'], keywords: ['event', 'webinar', 'community'] },
        '/events': { prefixes: ['/events', '/community'], keywords: ['event', 'webinar'] },
        '/billing': { prefixes: ['/billing', '/financial', '/benefits'], keywords: ['bill', 'invoice', 'payment'] },
        '/benefits': { prefixes: ['/benefits', '/billing'], keywords: ['bill', 'invoice', 'payment', 'loa', 'benefit'] },
        '/coverage': { prefixes: ['/coverage', '/billing', '/benefits'], keywords: ['bill', 'invoice', 'payment', 'loa', 'benefit', 'philhealth'] },
        '/notifications': { prefixes: [], keywords: [] }, // handled separately (all)
    };

    const markReadByRoute = React.useCallback((pathname: string) => {
        // Find the best matching route key
        const routeKey = Object.keys(ROUTE_MATCHERS)
            .filter(k => pathname === k || pathname.startsWith(k + '/'))
            .sort((a, b) => b.length - a.length)[0]; // most specific match

        if (!routeKey) return;

        // Special case: /notifications marks ALL unread
        if (routeKey === '/notifications') {
            setNotifications(prev => {
                const hasUnread = prev.some(n => !n.read);
                if (!hasUnread) return prev;
                return prev.map(n => n.read ? n : { ...n, read: true });
            });
            return;
        }

        const matcher = ROUTE_MATCHERS[routeKey];
        if (!matcher) return;

        setNotifications(prev => {
            let changed = false;
            const updated = prev.map(n => {
                if (n.read) return n;
                const linkMatch = n.link && matcher.prefixes.some(p => n.link!.startsWith(p));
                const keywordMatch = matcher.keywords.some(k =>
                    n.title.toLowerCase().includes(k) || n.message.toLowerCase().includes(k)
                );
                if (linkMatch || keywordMatch) {
                    changed = true;
                    return { ...n, read: true };
                }
                return n;
            });
            return changed ? updated : prev;
        });
    }, []);

    const addAppointment = React.useCallback((appt: Omit<Appointment, 'id' | 'status'>) => {
        const newAppt: Appointment = { ...appt, id: Math.random().toString(36).substr(2, 9), status: 'Upcoming' };
        setAppointments(prev => [newAppt, ...prev]);
    }, []);

    const requestRefill = React.useCallback((medId: string) => {
        setMedications(prev => prev.map(m => m.id === medId ? { ...m, status: 'Refill Requested' } : m));
    }, []);

    const cancelAppointment = React.useCallback((id: string) => {
        setAppointments(prev => prev.map(appt => appt.id === id ? { ...appt, status: 'Cancelled' } : appt));
    }, []);

    const payInvoice = React.useCallback((id: string) => {
        setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'Paid' } : inv));
    }, []);

    const bookFollowUp = React.useCallback((resultId: string) => {
        setResults(prev => prev.map(r => r.id === resultId ? { ...r, hasFollowUp: true } : r));
    }, []);

    const bookProcedure = React.useCallback((proc: Omit<Procedure, 'id' | 'status'>) => {
        const newProc: Procedure = { ...proc, id: `PROC-${Math.random().toString(36).substr(2, 6)}`, status: 'Scheduled' };
        setProcedures(prev => [newProc, ...prev]);

        // Add to notifications
        const newNotification: Notification = {
            id: `n-proc-${Date.now()}`,
            title: 'Procedure Scheduled',
            message: `Your ${proc.name} has been scheduled for ${proc.date}.`,
            date: 'Just now',
            read: false,
            type: 'success',
            link: '/visits'
        };
        setNotifications(prev => [newNotification, ...prev]);
    }, []);

    const requestLOA = React.useCallback((loa: Omit<LOARequest, 'id' | 'status'>) => {
        const newLOA: LOARequest = { ...loa, id: `LOA-${Math.random().toString(36).substr(2, 6)}`, status: 'Pending' };
        setLoaRequests(prev => [newLOA, ...prev]);

        // Add to notifications
        const newNotification: Notification = {
            id: `n-loa-${Date.now()}`,
            title: 'LOA Request Submitted',
            message: `Your LOA request for ${loa.type} at ${loa.provider} is being processed.`,
            date: 'Just now',
            read: false,
            type: 'info',
            link: '/coverage'
        };
        setNotifications(prev => [newNotification, ...prev]);
    }, []);

    const fileClaim = React.useCallback((claim: Omit<Claim, 'id' | 'status'>) => {
        const newClaim: Claim = { ...claim, id: `CLM-${Math.random().toString(36).substr(2, 6)}`, status: 'In Review' };
        setClaims(prev => [newClaim, ...prev]);

        // Add to notifications
        const newNotification: Notification = {
            id: `n-claim-${Date.now()}`,
            title: 'Claim Filed',
            message: `Your reimbursement claim for ${claim.type} has been received.`,
            date: 'Just now',
            read: false,
            type: 'info',
            link: '/coverage'
        };
        setNotifications(prev => [newNotification, ...prev]);
    }, []);

    const addHMOCard = React.useCallback((hmo: Omit<HMOCard, 'id' | 'mbl' | 'mblUsed' | 'benefitCategories' | 'status'>) => {
        const newHmo: HMOCard = {
            ...hmo,
            id: `hmo-${Date.now()}`,
            status: 'Pending',
            mbl: '₱ 100,000.00',
            mblUsed: '₱ 0.00',
            benefitCategories: [
                { id: `bc1-${Date.now()}`, name: 'Dental Care', limit: '₱ 5,000.00', used: '₱ 0.00', icon: '🦷' },
                { id: `bc2-${Date.now()}`, name: 'Optical Allowance', limit: '₱ 2,000.00', used: '₱ 0.00', icon: '👓' }
            ]
        };

        setUserProfile(prev => {
            if (!prev) return null;
            return {
                ...prev,
                hmoCards: [...prev.hmoCards, newHmo]
            };
        });

        showToast(`${newHmo.provider} link request submitted!`, 'success');
    }, [showToast]);

    // Queue State
    const [queueMode, setQueueMode] = useState<'LINEAR' | 'MULTI_STREAM'>('LINEAR');
    const [isQueueActive, setIsQueueActive] = useState(false);
    const [steps, setSteps] = useState<QueueStep[]>(INITIAL_STEPS);
    const [isSimulating, setIsSimulating] = useState(false);

    // Pause state
    const [isQueuePaused, setIsQueuePaused] = useState(false);
    const [pauseReason, setPauseReason] = useState<string | null>(null);
    const [pauseNotes, setPauseNotes] = useState<string | null>(null);
    const [pauseResumeDate, setPauseResumeDate] = useState<string | null>(null);

    const linearSteps = useMemo(() => steps, [steps]);
    const multiStreamSteps = useMemo(() => steps, [steps]);

    const activeSteps = useMemo(() => steps.filter(s => ['QUEUED', 'READY', 'IN_SESSION'].includes(s.status)), [steps]);
    const pendingSteps = useMemo(() => steps.filter(s => s.status === 'PENDING'), [steps]);
    const completedSteps = useMemo(() => steps.filter(s => s.status === 'COMPLETED'), [steps]);
    const pausedSteps = useMemo(() => steps.filter(s => s.status === 'PAUSED'), [steps]);

    const currentStepIndex = useMemo(() => {
        const activeIdxs = steps
            .map((s, i) => ({ status: s.status, index: i }))
            .filter(s => ['QUEUED', 'READY', 'IN_SESSION'].includes(s.status));

        if (activeIdxs.length === 0) {
            if (steps.every(s => s.status === 'PENDING')) return 0;
            if (steps.every(s => s.status === 'COMPLETED')) return steps.length - 1;
            const lastCompletedIdx = steps.reduce((acc, s, i) => s.status === 'COMPLETED' ? i : acc, -1);
            return Math.min(lastCompletedIdx + 1, steps.length - 1);
        }

        const getRank = (status: string) => {
            if (status === 'IN_SESSION') return 3;
            if (status === 'READY') return 2;
            if (status === 'QUEUED') return 1;
            return 0;
        };

        const sorted = activeIdxs.sort((a, b) => getRank(b.status) - getRank(a.status));
        return sorted[0].index;
    }, [steps]);

    const visitProgress = useMemo(() => {
        const completedCount = steps.filter(s => s.status === 'COMPLETED').length;
        return Math.round((completedCount / steps.length) * 100);
    }, [steps]);

    const isVisitComplete = useMemo(() => steps.every(s => s.status === 'COMPLETED'), [steps]);

    const canQueueStep = React.useCallback((stepId: string): boolean => {
        const step = steps.find(s => s.id === stepId);
        if (!step || step.status !== 'PENDING') return false;
        if (!step.dependencies || step.dependencies.length === 0) return true;
        return step.dependencies.every(depId => steps.find(s => s.id === depId)?.status === 'COMPLETED');
    }, [steps]);

    const resetSteps = React.useCallback(() => {
        setSteps(INITIAL_STEPS.map(s => ({ ...s, status: 'PENDING' as StepStatus })));
    }, []);

    const toggleQueueMode = React.useCallback(() => setQueueMode(prev => prev === 'LINEAR' ? 'MULTI_STREAM' : 'LINEAR'), []);
    const joinQueue = React.useCallback(() => {
        // If resuming from paused state, un-pause and re-queue the paused steps
        if (isQueuePaused) {
            setSteps(prev => prev.map(s => s.status === 'PAUSED' ? { ...s, status: 'QUEUED' as StepStatus } : s));
            setIsQueuePaused(false);
            setPauseReason(null);
            setPauseNotes(null);
            setPauseResumeDate(null);
            return;
        }
        setIsQueueActive(true);
        resetSteps();
    }, [resetSteps, isQueuePaused]);
    const leaveQueue = React.useCallback(() => { setIsQueueActive(false); setIsQueuePaused(false); setPauseReason(null); setPauseNotes(null); setPauseResumeDate(null); resetSteps(); }, [resetSteps]);

    const pauseQueue = React.useCallback((reason: string, notes?: string, resumeDate?: string) => {
        setIsQueuePaused(true);
        setPauseReason(reason);
        setPauseNotes(notes ?? null);
        setPauseResumeDate(resumeDate ?? null);
        // Freeze active steps to PAUSED
        setSteps(prev => prev.map(s =>
            ['QUEUED', 'READY', 'IN_SESSION'].includes(s.status)
                ? { ...s, status: 'PAUSED' as StepStatus }
                : s
        ));
        showToast('Your visit has been paused. Progress saved.', 'info');
    }, [showToast]);

    const resumeQueue = React.useCallback(() => {
        setIsQueuePaused(false);
        setPauseReason(null);
        setPauseNotes(null);
        setPauseResumeDate(null);
        // Re-queue paused steps
        setSteps(prev => prev.map(s =>
            s.status === 'PAUSED' ? { ...s, status: 'QUEUED' as StepStatus } : s
        ));
        showToast('Welcome back! Your visit has resumed.', 'success');
    }, [showToast]);

    const advanceQueue = React.useCallback(() => {
        setSteps(prev => {
            const newSteps = [...prev];

            if (queueMode === 'LINEAR') {
                // Find the first step that isn't completed
                const idx = newSteps.findIndex(s => s.status !== 'COMPLETED');
                if (idx === -1) return prev;

                const cur = newSteps[idx];
                if (cur.status === 'PENDING') {
                    newSteps[idx] = { ...cur, status: 'QUEUED' };
                } else if (cur.status === 'QUEUED') {
                    newSteps[idx] = { ...cur, status: 'READY' };
                } else if (cur.status === 'READY') {
                    newSteps[idx] = { ...cur, status: 'IN_SESSION' };
                } else if (cur.status === 'IN_SESSION') {
                    newSteps[idx] = { ...cur, status: 'COMPLETED' };
                    // Linear: optionally auto-queue next
                    if (idx + 1 < newSteps.length && newSteps[idx + 1].status === 'PENDING') {
                        newSteps[idx + 1] = { ...newSteps[idx + 1], status: 'QUEUED' };
                    }
                }
            } else {
                // MULTI_STREAM: Move multiple streams forward simultaneously
                // 1. Move IN_SESSION -> COMPLETED
                prev.forEach((s, i) => {
                    if (s.status === 'IN_SESSION') {
                        newSteps[i] = { ...s, status: 'COMPLETED' };
                    }
                });

                // 2. Move READY -> IN_SESSION
                prev.forEach((s, i) => {
                    if (s.status === 'READY') {
                        newSteps[i] = { ...s, status: 'IN_SESSION' };
                    }
                });

                // 3. Move QUEUED -> READY
                prev.forEach((s, i) => {
                    if (s.status === 'QUEUED') {
                        newSteps[i] = { ...s, status: 'READY' };
                    }
                });

                // Manual Queueing: PENDING steps no longer automatically move to QUEUED.
                // This is now handled by manual user action (queueForStep or queueAllAvailable).
            }
            return newSteps;
        });
    }, [queueMode]);

    // Simulation is now manual. 
    // Auto-advance logic removed to support step-by-step advancement.

    const queueForStep = React.useCallback((stepId: string) => {
        setSteps(prev => prev.map(s => s.id === stepId && s.status === 'PENDING' ? { ...s, status: 'QUEUED' } : s));
    }, []);

    const startStep = React.useCallback((stepId: string) => {
        setSteps(prev => prev.map(s => s.id === stepId && s.status === 'QUEUED' ? { ...s, status: 'READY' } : s));
    }, []);

    const checkIn = React.useCallback((stepId: string) => {
        setSteps(prev => prev.map(s => s.id === stepId && s.status === 'READY' ? { ...s, status: 'IN_SESSION' } : s));
    }, []);

    const completeStep = React.useCallback((stepId: string) => {
        setSteps(prev => prev.map(s => s.id === stepId && s.status === 'IN_SESSION' ? { ...s, status: 'COMPLETED' } : s));
    }, []);

    const queueAllAvailable = React.useCallback(() => {
        setSteps(prev => {
            const queuableIds = prev
                .filter(s => s.status === 'PENDING')
                .filter(s => {
                    if (!s.dependencies || s.dependencies.length === 0) return true;
                    return s.dependencies.every(depId => prev.find(d => d.id === depId)?.status === 'COMPLETED');
                })
                .map(s => s.id);

            if (queuableIds.length === 0) return prev;
            return prev.map(s => queuableIds.includes(s.id) ? { ...s, status: 'QUEUED' as StepStatus } : s);
        });
    }, []);

    const queueInfo = useMemo<QueueInfo>(() => {
        const currentStep = steps[currentStepIndex];
        const isActive = currentStep && ['QUEUED', 'READY', 'IN_SESSION'].includes(currentStep.status);

        if (!isActive) {
            return {
                queueNumber: 'L-205',
                peopleAhead: 0,
                estimatedWaitTime: '0 mins',
                currentServing: '--'
            };
        }

        const isUserReadyOrServing = currentStep.status === 'READY' || currentStep.status === 'IN_SESSION';

        return {
            queueNumber: currentStep.ticket,
            peopleAhead: isUserReadyOrServing ? 0 : 4,
            estimatedWaitTime: isUserReadyOrServing ? 'Now' : `${currentStep.waitMinutes} mins`,
            currentServing: isUserReadyOrServing ? currentStep.ticket : 'L-201'
        };
    }, [steps, currentStepIndex]);

    return (
        <DataContext.Provider value={{
            appointments, medications, results, doctorRequests, invoices, procedures, loaRequests,
            userProfile, dependents,
            addAppointment, cancelAppointment, requestRefill, payInvoice, bookFollowUp,
            bookProcedure, requestLOA, fileClaim,
            addHMOCard,
            claims,
            queueMode, toggleQueueMode, isQueueActive, joinQueue, leaveQueue,
            steps, linearSteps, multiStreamSteps, advanceQueue,
            activeSteps, pendingSteps, completedSteps, pausedSteps, currentStepIndex, visitProgress,
            queueForStep, startStep, checkIn, completeStep, queueAllAvailable, canQueueStep, isVisitComplete,
            isQueuePaused, pauseReason, pauseNotes, pauseResumeDate, pauseQueue, resumeQueue,
            queueInfo, isSimulating, toggleSimulation: () => setIsSimulating(prev => !prev),
            notifications, unreadNotificationsCount, markAsRead, markReadByRoute,
            currentPatientId, switchPatient, addDependent, availablePatients
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within DataProvider');
    return context;
};
