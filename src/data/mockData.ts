import type { Appointment, Medication, ClinicalResult, Notification, Invoice, Procedure, LOARequest, UserProfile, Dependent } from '../context/DataContext';

// Helper for dynamic dates
const TODAY = new Date();
const addDays = (days: number) => {
    const d = new Date(TODAY);
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const subDays = (days: number) => {
    const d = new Date(TODAY);
    d.setDate(d.getDate() - days);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ==========================================
// ORG 1: METRO GENERAL HOSPITAL (Hospital / Specialists)
// ==========================================
export const METRO_DATA = {
    appointments: [
        { id: '101', doctor: 'Dr. Albert Go', specialty: 'Cardiology', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), time: '10:00 AM', status: 'Upcoming', type: 'In-Person', location: 'Heart Center, 3F' },
        { id: '102', doctor: 'Dr. Jen Diaz', specialty: 'Endocrinology', date: addDays(14), time: '02:00 PM', status: 'Upcoming', type: 'Teleconsult' },
        { id: '103', doctor: 'Dr. Rahn Lim', specialty: 'Pulmonology', date: subDays(45), time: '11:00 AM', status: 'Completed', type: 'In-Person', location: 'Medical Arts Bldg, 5F' },
    ] as Appointment[],

    medications: [
        { id: 'm1', name: 'Rosuvastatin', dosage: '20mg', instruction: 'Once daily at bedtime', remaining: 28, refillDate: addDays(25), status: 'Active' },
        { id: 'm2', name: 'Clopidogrel', dosage: '75mg', instruction: 'Once daily after breakfast', remaining: 5, refillDate: addDays(3), status: 'Low Stock' },
        { id: 'm3', name: 'Metformin', dosage: '500mg', instruction: 'Twice a day with meals', remaining: 60, refillDate: addDays(58), status: 'Active' },
    ] as Medication[],

    results: [
        { id: 'r1', title: '2D Echo with Doppler', type: 'Imaging', date: subDays(2), doctor: 'Dr. Go', status: 'Final', isCritical: false },
        { id: 'r2', title: 'HbA1c', type: 'Laboratory', date: subDays(5), doctor: 'Dr. Diaz', status: 'Final', isCritical: true, hasFollowUp: false },
        { id: 'r3', title: 'Chest X-Ray (PA/Lateral)', type: 'Imaging', date: subDays(45), doctor: 'Dr. Lim', status: 'Final' },
    ] as ClinicalResult[],

    notifications: [
        { id: 'n1', title: 'Appointment Reminder', message: 'You have a Cardiology appointment in 2 days.', date: '2 hours ago', read: false, type: 'info', link: '/appointments' },
        { id: 'n2', title: 'Critical Result', message: 'Your HbA1c results require attention.', date: '3 days ago', read: false, type: 'warning', link: '/results' },
        { id: 'n3', title: 'Prescription Low', message: 'Clopidogrel is running low.', date: '1 day ago', read: true, type: 'info', link: '/medications' },
    ] as Notification[],

    invoices: [
        { id: 'INV-001', date: subDays(2), description: 'Cardiology Consultation', provider: 'Dr. Albert Go', amount: 1500, status: 'Pending', type: 'Consultation' },
        { id: 'INV-002', date: subDays(5), description: 'HbA1c Laboratory', provider: 'Metro Lab', amount: 850, status: 'Paid', type: 'Laboratory' }
    ] as Invoice[],

    procedures: [
        { id: 'proc-1', category: 'Radiology', name: 'Chest X-Ray', date: subDays(45), time: '11:00 AM', location: 'Radiology Rm 2, 1F', status: 'Completed' }
    ] as Procedure[],

    loaRequests: [
        { id: 'loa-1', type: 'Lab Test', provider: 'Metro Lab', date: subDays(5), status: 'Approved', amount: '₱ 850.00' }
    ] as LOARequest[],

    userProfile: {
        id: 'u-1',
        name: 'Juan Dela Cruz',
        memberId: '1029384756',
        company: 'MERALCO INC.',
        validity: '01/2023 - 12/2024',
        membershipType: 'Gold Member',
        emergencyContact: { name: 'Maria Dela Cruz', relation: 'Spouse', phone: '0917-888-0000' },
        philHealth: { membershipNumber: '12-345678901-2', status: 'Active', category: 'Private Sector Employee', lastContribution: 'Jan 2024' }
    } as UserProfile,

    dependents: [
        { id: 'd-1', name: 'Maria Dela Cruz', relation: 'Spouse', birthDate: '1992-05-15', idNumber: 'DEP-101' },
        { id: 'd-2', name: 'Jun Dela Cruz', relation: 'Son', birthDate: '2018-10-20', idNumber: 'DEP-102' }
    ] as Dependent[]
};

// ==========================================
// ORG 2: MERALCO WELLNESS (Corporate / Employee Health)
// ==========================================
export const MERALCO_DATA = {
    appointments: [
        { id: '201', doctor: 'Dr. Sarah Lee', specialty: 'Occupational Health', date: addDays(5), time: '09:00 AM', status: 'Upcoming', type: 'In-Person', location: 'Wellness Center, G/F' },
        { id: '202', doctor: 'Nutritionist Marco', specialty: 'Dietary', date: addDays(10), time: '01:00 PM', status: 'Upcoming', type: 'Teleconsult' },
        { id: '203', doctor: 'Annual Physical Exam', specialty: 'General', date: subDays(180), time: '08:00 AM', status: 'Completed', type: 'In-Person', location: 'Wellness Center' },
    ] as Appointment[],

    medications: [
        { id: 'm4', name: 'Multivitamins', dosage: '1 tab', instruction: 'Daily with breakfast', remaining: 15, refillDate: addDays(12), status: 'Active' },
        { id: 'm5', name: 'Ascorbic Acid', dosage: '500mg', instruction: 'Twice daily', remaining: 30, refillDate: addDays(28), status: 'Active' },
    ] as Medication[],

    results: [
        { id: 'r4', title: 'Annual Physical Exam Report', type: 'Laboratory', date: subDays(180), doctor: 'Dr. Lee', status: 'Final' },
        { id: 'r5', title: 'Drug Test Screening', type: 'Laboratory', date: subDays(5), doctor: 'Admin', status: 'Final', isCritical: false },
        { id: 'r6', title: 'Body Composition Analysis', type: 'Imaging', date: subDays(10), doctor: 'Nutr. Marco', status: 'Final' },
    ] as ClinicalResult[],

    notifications: [
        { id: 'n4', title: 'Drug Test Result', message: 'Your recent screening results are available.', date: '1 hour ago', read: false, type: 'info', link: '/results' },
        { id: 'n5', title: 'Wellness Webinar', message: 'Join "Ergonomics at Work" tomorrow.', date: '5 hours ago', read: false, type: 'success', link: '/events' },
    ] as Notification[],

    invoices: [
        { id: 'INV-101', date: subDays(180), description: 'Annual Physical Exam', provider: 'Wellness Center', amount: 0, status: 'Paid', type: 'Procedure' },
    ] as Invoice[],

    procedures: [] as Procedure[],
    loaRequests: [] as LOARequest[],

    userProfile: {
        id: 'u-2',
        name: 'Ricardo Meralco',
        memberId: '9988776655',
        company: 'MERALCO CORP',
        validity: '05/2022 - 05/2025',
        membershipType: 'Platinum Corporate',
        emergencyContact: { name: 'Elena Meralco', relation: 'Sister', phone: '0922-111-2233' },
        philHealth: { membershipNumber: '99-887766554-3', status: 'Active', category: 'Government Employee', lastContribution: 'Dec 2023' }
    } as UserProfile,

    dependents: [
        { id: 'd-3', name: 'Elena Meralco', relation: 'Sister', birthDate: '1985-03-12', idNumber: 'DEP-201' }
    ] as Dependent[]
};

// ==========================================
// ORG 3: HEALTHFIRST (Community Clinic / Primary Care)
// ==========================================
export const HEALTHFIRST_DATA = {
    appointments: [
        { id: '301', doctor: 'Dr. Michael Tan', specialty: 'Pediatrics', date: addDays(1), time: '03:00 PM', status: 'Upcoming', type: 'In-Person', location: 'Clinic 1' },
        { id: '302', doctor: 'Dr. Anna Santos', specialty: 'OB-GYN', date: addDays(20), time: '10:30 AM', status: 'Upcoming', type: 'In-Person', location: 'Clinic 2' },
        { id: '303', doctor: 'Dr. John Doe', specialty: 'General Practice', date: subDays(14), time: '09:00 AM', status: 'Completed', type: 'In-Person', location: 'Clinic 1' },
    ] as Appointment[],

    medications: [
        { id: 'm6', name: 'Paracetamol', dosage: '250mg/5ml', instruction: 'Every 4 hours for fever', remaining: 1, refillDate: '-', status: 'Expired' },
        { id: 'm7', name: 'Co-Amoxiclav', dosage: '625mg', instruction: 'Twice daily for 7 days', remaining: 14, refillDate: '-', status: 'Active' },
    ] as Medication[],

    results: [
        { id: 'r7', title: 'Fecalysis', type: 'Laboratory', date: subDays(14), doctor: 'Dr. Doe', status: 'Final' },
        { id: 'r8', title: 'Urinalysis', type: 'Laboratory', date: subDays(14), doctor: 'Dr. Doe', status: 'Final' },
    ] as ClinicalResult[],

    notifications: [
        { id: 'n6', title: 'Vaccine Schedule', message: 'Measles vaccine due next week.', date: '1 day ago', read: false, type: 'warning', link: '/immunization' },
        { id: 'n7', title: 'Clinic Announcement', message: 'We are closed on holidays.', date: '1 week ago', read: true, type: 'info', link: '/community' },
    ] as Notification[],

    invoices: [
        { id: 'INV-201', date: subDays(14), description: 'Pediatric Consult', provider: 'Dr. Tan', amount: 500, status: 'Pending', type: 'Consultation' },
        { id: 'INV-202', date: subDays(14), description: 'Medicines', provider: 'HealthFirst Pharmacy', amount: 320, status: 'Paid', type: 'Pharmacy' },
    ] as Invoice[],

    procedures: [] as Procedure[],
    loaRequests: [] as LOARequest[],

    userProfile: {
        id: 'u-3',
        name: 'Anna Santos',
        memberId: '3344556677',
        company: 'SELF-EMPLOYED',
        validity: '01/2024 - 12/2024',
        membershipType: 'Community Plus',
        emergencyContact: { name: 'Luis Santos', relation: 'Husband', phone: '0908-777-6655' },
        philHealth: { membershipNumber: '33-445566778-9', status: 'Updating', category: 'Individually Paying' }
    } as UserProfile,

    dependents: [] as Dependent[]
};
