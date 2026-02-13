/**
 * Provider / Hospital Management System - Mock Data
 * Healthcare provider demo with realistic Filipino hospital context.
 * Dates in February 2026 timeframe.
 */

import type {
  Appointment,
  StaffUser,
  ClinicalNote,
  Prescription,
  LabOrder,
  DoctorAvailability,
  Room,
  Equipment,
  ShiftSchedule,
  PharmacyItem,
  DispensingRecord,
  TriageRecord,
  NursingTask,
  FormTemplate,
  FormSubmission,
  ImmunizationRecord,
  ManagedEvent,
  EventRegistration,
  AuditLog,
  PaymentTransaction,
  InternalMessage,
  CDSSAlert,
  DashboardKPI,
  QueuePatient,
  DoctorOrder,
  StationVisit,
  StationType,
} from '../types';

const BRANCH_MAIN = 'metro-hosp-main';
const BRANCH_NAME = 'Metro General Hospital - Main';

// =============================================
// 1. MOCK STAFF - 12+ staff members
// =============================================

export const MOCK_STAFF: StaffUser[] = [
  {
    id: 'staff-001',
    name: 'Dr. Ricardo Santos',
    role: 'doctor',
    department: 'Internal Medicine',
    specialty: 'Cardiology',
    branchId: BRANCH_MAIN,
    email: 'rsantos@metrogeneral.ph',
    phone: '0917-111-0001',
    photoUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
    credentials: ['MD', 'DPBS-Cardiology', 'FPAF'],
    licenseExpiry: '2027-03-15',
    status: 'Active',
    hireDate: '2020-01-15',
  },
  {
    id: 'staff-002',
    name: 'Dr. Maria Clara Reyes',
    role: 'doctor',
    department: 'Pediatrics',
    specialty: 'General Pediatrics',
    branchId: BRANCH_MAIN,
    email: 'mreyes@metrogeneral.ph',
    phone: '0917-111-0002',
    photoUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
    credentials: ['MD', 'DPPS'],
    licenseExpiry: '2026-08-20',
    status: 'Active',
    hireDate: '2019-06-01',
  },
  {
    id: 'staff-003',
    name: 'Dr. Albert Go',
    role: 'doctor',
    department: 'Emergency',
    specialty: 'Emergency Medicine',
    branchId: BRANCH_MAIN,
    email: 'ago@metrogeneral.ph',
    phone: '0917-111-0003',
    photoUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
    credentials: ['MD', 'DPBS-EM'],
    licenseExpiry: '2026-11-30',
    status: 'Active',
    hireDate: '2021-02-10',
  },
  {
    id: 'staff-004',
    name: 'Nurse Elena Torres',
    role: 'nurse',
    department: 'Internal Medicine',
    branchId: BRANCH_MAIN,
    email: 'etorres@metrogeneral.ph',
    phone: '0917-111-0004',
    photoUrl: 'https://randomuser.me/api/portraits/women/4.jpg',
    credentials: ['RN', 'BSN'],
    licenseExpiry: '2026-05-01',
    status: 'Active',
    hireDate: '2018-03-15',
  },
  {
    id: 'staff-005',
    name: 'Nurse Paolo Mendoza',
    role: 'nurse',
    department: 'Emergency',
    branchId: BRANCH_MAIN,
    email: 'pmendoza@metrogeneral.ph',
    phone: '0917-111-0005',
    photoUrl: 'https://randomuser.me/api/portraits/men/5.jpg',
    credentials: ['RN', 'BSN', 'ACLS'],
    licenseExpiry: '2026-09-15',
    status: 'Active',
    hireDate: '2020-08-01',
  },
  {
    id: 'staff-006',
    name: 'Maria Santos',
    role: 'lab_tech',
    department: 'Laboratory',
    branchId: BRANCH_MAIN,
    email: 'msantos@metrogeneral.ph',
    phone: '0917-111-0006',
    photoUrl: 'https://randomuser.me/api/portraits/women/6.jpg',
    credentials: ['RMT', 'BSMT'],
    licenseExpiry: '2026-07-20',
    status: 'Active',
    hireDate: '2017-11-01',
  },
  {
    id: 'staff-007',
    name: 'Roberto Villanueva',
    role: 'pharmacist',
    department: 'Pharmacy',
    branchId: BRANCH_MAIN,
    email: 'rvillanueva@metrogeneral.ph',
    phone: '0917-111-0007',
    photoUrl: 'https://randomuser.me/api/portraits/men/7.jpg',
    credentials: ['RPh', 'BSPharm'],
    licenseExpiry: '2026-12-31',
    status: 'Active',
    hireDate: '2016-04-01',
  },
  {
    id: 'staff-008',
    name: 'Carmen dela Cruz',
    role: 'billing_staff',
    department: 'Administration',
    branchId: BRANCH_MAIN,
    email: 'cdelacruz@metrogeneral.ph',
    phone: '0917-111-0008',
    photoUrl: 'https://randomuser.me/api/portraits/women/8.jpg',
    credentials: ['CPA', 'CHB'],
    licenseExpiry: '2027-01-15',
    status: 'Active',
    hireDate: '2019-01-10',
  },
  {
    id: 'staff-009',
    name: 'Liza Tan',
    role: 'front_desk',
    department: 'Administration',
    branchId: BRANCH_MAIN,
    email: 'ltan@metrogeneral.ph',
    phone: '0917-111-0009',
    photoUrl: 'https://randomuser.me/api/portraits/women/9.jpg',
    credentials: ['BSPHRM'],
    licenseExpiry: '2027-06-30',
    status: 'Active',
    hireDate: '2022-05-01',
  },
  {
    id: 'staff-010',
    name: 'Ramon Bautista',
    role: 'admin',
    department: 'Administration',
    branchId: BRANCH_MAIN,
    email: 'rbautista@metrogeneral.ph',
    phone: '0917-111-0010',
    photoUrl: 'https://randomuser.me/api/portraits/men/10.jpg',
    credentials: ['MBA', 'MHA'],
    licenseExpiry: '2027-12-31',
    status: 'Active',
    hireDate: '2015-07-01',
  },
  {
    id: 'staff-011',
    name: 'Ana Lim',
    role: 'hr',
    department: 'Administration',
    branchId: BRANCH_MAIN,
    email: 'alim@metrogeneral.ph',
    phone: '0917-111-0011',
    photoUrl: 'https://randomuser.me/api/portraits/women/11.jpg',
    credentials: ['CHRM', 'BSBA-HRM'],
    licenseExpiry: '2027-03-01',
    status: 'Active',
    hireDate: '2018-09-15',
  },
  {
    id: 'staff-012',
    name: 'Miguel Fernandez',
    role: 'imaging_tech',
    department: 'Radiology',
    branchId: BRANCH_MAIN,
    email: 'mfernandez@metrogeneral.ph',
    phone: '0917-111-0012',
    photoUrl: 'https://randomuser.me/api/portraits/men/12.jpg',
    credentials: ['RT(R)', 'BSRT'],
    licenseExpiry: '2026-10-15',
    status: 'Active',
    hireDate: '2020-03-01',
  },
];

// =============================================
// 2. MOCK CLINICAL NOTES - 6+ SOAP notes
// =============================================

export const MOCK_CLINICAL_NOTES: ClinicalNote[] = [
  {
    id: 'note-001',
    patientId: 'p1',
    patientName: 'Juan Dela Cruz',
    appointmentId: 'apt-101',
    doctorId: 'staff-001',
    date: '2026-02-10',
    subjective: 'Patient reports chest tightness on exertion, resolves with rest. Occasional palpitations. On rosuvastatin and clopidogrel.',
    objective: 'BP 132/82, HR 78 regular. Heart sounds normal. No peripheral edema.',
    assessment: 'Stable coronary artery disease, hypertension controlled.',
    plan: 'Continue current meds. Lipid panel and 2D Echo in 2 weeks. Lifestyle counseling.',
    icdCodes: ['I25.10', 'I10'],
    status: 'Signed',
    aiGenerated: false,
  },
  {
    id: 'note-002',
    patientId: 'p2',
    patientName: 'Sofia Garcia',
    appointmentId: 'apt-102',
    doctorId: 'staff-003',
    date: '2026-02-08',
    subjective: 'G2P1 at 24 weeks. Nausea improved. No vaginal bleeding. Baby moving well.',
    objective: 'Fundal height 24 cm. FHR 148 bpm. BP 118/72. Weight gain appropriate.',
    assessment: 'Low-risk pregnancy, progressing normally.',
    plan: 'Continue prenatal vitamins. Maternal serum screening ordered. Follow-up in 4 weeks.',
    icdCodes: ['Z33.1', 'Z34.00'],
    status: 'Signed',
    aiGenerated: true,
  },
  {
    id: 'note-003',
    patientId: 'p3',
    patientName: 'Carlos Reyes',
    appointmentId: 'apt-103',
    doctorId: 'staff-001',
    date: '2026-02-09',
    subjective: 'Annual physical. No acute complaints. Well-controlled hypertension on losartan.',
    objective: 'BP 120/78, BMI 26. Labs pending. ECG normal sinus rhythm.',
    assessment: 'Hypertension, well-controlled. Hyperlipidemia - follow lipid panel.',
    plan: 'Lipid panel, FBS. Continue losartan. Lifestyle modification.',
    icdCodes: ['I10', 'E78.5'],
    status: 'Draft',
    aiGenerated: true,
  },
  {
    id: 'note-004',
    patientId: 'p5',
    patientName: 'Anna Santos',
    appointmentId: 'apt-104',
    doctorId: 'staff-002',
    date: '2026-02-07',
    subjective: 'Mia, 3yo, fever 38.5°C x 2 days. Runny nose, mild cough. Reduced appetite.',
    objective: 'AOx4. T 38.2°C. Pharynx mildly erythematous. Lungs clear. No rash.',
    assessment: 'Acute viral URI, likely adenovirus.',
    plan: 'Supportive care. Paracetamol prn. Return if fever >39°C or respiratory distress.',
    icdCodes: ['J00', 'R50.9'],
    status: 'Signed',
    aiGenerated: false,
  },
  {
    id: 'note-005',
    patientId: 'p6',
    patientName: 'Lourdes Bautista',
    appointmentId: 'apt-105',
    doctorId: 'staff-001',
    date: '2026-02-11',
    subjective: 'DM2, HTN. Compliant with meds. No hypo episodes. Leg numbness occasionally.',
    objective: 'BP 138/85, FBS 6.8 (home log). Feet: mild decreased sensation. No ulcers.',
    assessment: 'Type 2 DM with early peripheral neuropathy. HTN suboptimal control.',
    plan: 'Increase amlodipine to 10mg. HbA1c, renal panel. Consider neurologist referral.',
    icdCodes: ['E11.40', 'I10', 'G63'],
    status: 'Amended',
    aiGenerated: false,
  },
  {
    id: 'note-006',
    patientId: 'p7',
    patientName: 'Miguel Torres',
    appointmentId: 'apt-106',
    doctorId: 'staff-003',
    date: '2026-02-12',
    subjective: 'New patient. Headache 3 days, frontal, pressure-like. No fever, no neck stiffness.',
    objective: 'Vitals normal. Neurologic exam intact. Fundoscopy normal.',
    assessment: 'Tension-type headache.',
    plan: 'OTC analgesics. Return if worsening or neurologic symptoms.',
    icdCodes: ['G44.2'],
    status: 'Draft',
    aiGenerated: true,
  },
];

// =============================================
// 3. MOCK PRESCRIPTIONS - 8+
// =============================================

export const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx-001',
    patientId: 'p1',
    patientName: 'Juan Dela Cruz',
    doctorId: 'staff-001',
    doctorName: 'Dr. Ricardo Santos',
    medication: 'Rosuvastatin',
    dosage: '20mg',
    frequency: 'Once daily at bedtime',
    duration: '90 days',
    quantity: 90,
    refillsRemaining: 2,
    status: 'Active',
    prescribedDate: '2026-02-01',
    notes: 'Take with food if GI upset.',
  },
  {
    id: 'rx-002',
    patientId: 'p1',
    patientName: 'Juan Dela Cruz',
    doctorId: 'staff-001',
    doctorName: 'Dr. Ricardo Santos',
    medication: 'Clopidogrel',
    dosage: '75mg',
    frequency: 'Once daily after breakfast',
    duration: '30 days',
    quantity: 30,
    refillsRemaining: 0,
    status: 'Active',
    prescribedDate: '2026-02-01',
  },
  {
    id: 'rx-003',
    patientId: 'p2',
    patientName: 'Sofia Garcia',
    doctorId: 'staff-003',
    doctorName: 'Dr. Albert Go',
    medication: 'Prenatal Vitamins',
    dosage: '1 tab',
    frequency: 'Once daily',
    duration: '180 days',
    quantity: 180,
    refillsRemaining: 1,
    status: 'Active',
    prescribedDate: '2026-01-15',
  },
  {
    id: 'rx-004',
    patientId: 'p3',
    patientName: 'Carlos Reyes',
    doctorId: 'staff-001',
    doctorName: 'Dr. Ricardo Santos',
    medication: 'Losartan',
    dosage: '50mg',
    frequency: 'Once daily in the morning',
    duration: '30 days',
    quantity: 30,
    refillsRemaining: 3,
    status: 'Completed',
    prescribedDate: '2026-01-20',
  },
  {
    id: 'rx-005',
    patientId: 'p4b',
    patientName: 'Roberto Villanueva',
    doctorId: 'staff-001',
    doctorName: 'Dr. Ricardo Santos',
    medication: 'Metformin',
    dosage: '850mg',
    frequency: 'Twice daily with meals',
    duration: '60 days',
    quantity: 120,
    refillsRemaining: 2,
    status: 'Active',
    prescribedDate: '2026-02-05',
    notes: 'Monitor for lactic acidosis in renal impairment.',
  },
  {
    id: 'rx-006',
    patientId: 'p5',
    patientName: 'Anna Santos',
    doctorId: 'staff-002',
    doctorName: 'Dr. Maria Clara Reyes',
    medication: 'Cetirizine Drops',
    dosage: '5mg/mL',
    frequency: '0.5mL once daily',
    duration: '14 days',
    quantity: 15,
    refillsRemaining: 0,
    status: 'Active',
    prescribedDate: '2026-02-07',
    notes: 'For dependent Mia Santos - pediatric dosing.',
  },
  {
    id: 'rx-007',
    patientId: 'p6',
    patientName: 'Lourdes Bautista',
    doctorId: 'staff-001',
    doctorName: 'Dr. Ricardo Santos',
    medication: 'Amlodipine',
    dosage: '10mg',
    frequency: 'Once daily in the morning',
    duration: '30 days',
    quantity: 30,
    refillsRemaining: 1,
    status: 'Pending Approval',
    prescribedDate: '2026-02-11',
    notes: 'Senior citizen - 20% discount applies.',
  },
  {
    id: 'rx-008',
    patientId: 'p4',
    patientName: 'Lisa Tan',
    doctorId: 'staff-002',
    doctorName: 'Dr. Maria Clara Reyes',
    medication: 'Cetirizine',
    dosage: '10mg',
    frequency: 'Once daily as needed for allergies',
    duration: '30 days',
    quantity: 30,
    refillsRemaining: 2,
    status: 'Cancelled',
    prescribedDate: '2026-01-25',
    notes: 'Patient switched to alternative - patient request.',
  },
];

// =============================================
// 4. MOCK LAB ORDERS - 10+
// =============================================

export const MOCK_LAB_ORDERS: LabOrder[] = [
  {
    id: 'lab-001',
    patientId: 'p1',
    patientName: 'Juan Dela Cruz',
    doctorId: 'staff-001',
    doctorName: 'Dr. Ricardo Santos',
    testName: 'CBC',
    testType: 'Laboratory',
    priority: 'Routine',
    status: 'Resulted',
    orderedDate: '2026-02-10',
    collectedDate: '2026-02-10',
    resultedDate: '2026-02-11',
    result: 'Hgb 14.2, Hct 42%, WBC 7.2, Plt 245',
    referenceRange: 'Hgb 13-17, Hct 39-50%, WBC 4-11, Plt 150-400',
    isAbnormal: false,
    isCritical: false,
  },
  {
    id: 'lab-002',
    patientId: 'p1',
    patientName: 'Juan Dela Cruz',
    doctorId: 'staff-001',
    doctorName: 'Dr. Ricardo Santos',
    testName: 'Lipid Panel',
    testType: 'Laboratory',
    priority: 'Routine',
    status: 'Reviewed',
    orderedDate: '2026-02-10',
    collectedDate: '2026-02-10',
    resultedDate: '2026-02-11',
    result: 'TC 198, TG 145, LDL 118, HDL 42',
    referenceRange: 'LDL <100 optimal',
    isAbnormal: true,
    isCritical: false,
    notes: 'LDL slightly elevated - continue statin.',
  },
  {
    id: 'lab-003',
    patientId: 'p3',
    patientName: 'Carlos Reyes',
    doctorId: 'staff-001',
    doctorName: 'Dr. Ricardo Santos',
    testName: 'FBS',
    testType: 'Laboratory',
    priority: 'Routine',
    status: 'In Progress',
    orderedDate: '2026-02-09',
    collectedDate: '2026-02-10',
  },
  {
    id: 'lab-004',
    patientId: 'p5',
    patientName: 'Anna Santos',
    doctorId: 'staff-002',
    doctorName: 'Dr. Maria Clara Reyes',
    testName: 'Urinalysis',
    testType: 'Laboratory',
    priority: 'Routine',
    status: 'Ordered',
    orderedDate: '2026-02-12',
  },
  {
    id: 'lab-005',
    patientId: 'p4b',
    patientName: 'Roberto Villanueva',
    doctorId: 'staff-001',
    doctorName: 'Dr. Ricardo Santos',
    testName: 'Fecalysis',
    testType: 'Laboratory',
    priority: 'Routine',
    status: 'Specimen Collected',
    orderedDate: '2026-02-11',
    collectedDate: '2026-02-12',
  },
  {
    id: 'lab-006',
    patientId: 'p6',
    patientName: 'Lourdes Bautista',
    doctorId: 'staff-001',
    doctorName: 'Dr. Ricardo Santos',
    testName: 'HbA1c',
    testType: 'Laboratory',
    priority: 'Urgent',
    status: 'Resulted',
    orderedDate: '2026-02-11',
    collectedDate: '2026-02-11',
    resultedDate: '2026-02-12',
    result: '8.2%',
    referenceRange: '<7% target',
    isAbnormal: true,
    isCritical: true,
    notes: 'Critical - notify MD. Patient advised to follow up.',
  },
  {
    id: 'lab-007',
    patientId: 'p1',
    patientName: 'Juan Dela Cruz',
    doctorId: 'staff-001',
    doctorName: 'Dr. Ricardo Santos',
    testName: '2D Echo',
    testType: 'Cardio',
    priority: 'Routine',
    status: 'Resulted',
    orderedDate: '2026-02-08',
    resultedDate: '2026-02-10',
    result: 'EF 55%, no regional wall motion abnormality.',
    referenceRange: 'EF 55-70%',
    isAbnormal: false,
  },
  {
    id: 'lab-008',
    patientId: 'p3',
    patientName: 'Carlos Reyes',
    doctorId: 'staff-001',
    doctorName: 'Dr. Ricardo Santos',
    testName: 'Chest X-Ray',
    testType: 'Imaging',
    priority: 'Routine',
    status: 'Resulted',
    orderedDate: '2026-02-09',
    resultedDate: '2026-02-09',
    result: 'Lungs clear, heart size normal, no focal lesions.',
    isAbnormal: false,
  },
  {
    id: 'lab-009',
    patientId: 'p7',
    patientName: 'Miguel Torres',
    doctorId: 'staff-003',
    doctorName: 'Dr. Albert Go',
    testName: 'Ultrasound',
    testType: 'Imaging',
    priority: 'Routine',
    status: 'Ordered',
    orderedDate: '2026-02-12',
    notes: 'Abdominal US for RUQ pain workup.',
  },
  {
    id: 'lab-010',
    patientId: 'p6',
    patientName: 'Lourdes Bautista',
    doctorId: 'staff-001',
    doctorName: 'Dr. Ricardo Santos',
    testName: 'ECG',
    testType: 'Cardio',
    priority: 'Stat',
    status: 'Resulted',
    orderedDate: '2026-02-11',
    resultedDate: '2026-02-11',
    result: 'Sinus rhythm 72bpm, normal axis. No acute changes.',
    isAbnormal: false,
  },
  {
    id: 'lab-011',
    patientId: 'p2',
    patientName: 'Sofia Garcia',
    doctorId: 'staff-003',
    doctorName: 'Dr. Albert Go',
    testName: 'CT Scan',
    testType: 'Imaging',
    priority: 'Urgent',
    status: 'Cancelled',
    orderedDate: '2026-02-05',
    notes: 'Cancelled - patient deferred. Will reschedule post-delivery.',
  },
];

// =============================================
// 5. MOCK DOCTOR AVAILABILITY - 6+ slots
// =============================================

export const MOCK_AVAILABILITY: DoctorAvailability[] = [
  {
    id: 'avail-001',
    doctorId: 'staff-001',
    doctorName: 'Dr. Ricardo Santos',
    branchId: BRANCH_MAIN,
    branchName: BRANCH_NAME,
    dayOfWeek: 1, // Monday
    startTime: '08:00',
    endTime: '12:00',
    slotDuration: 15,
    isBlocked: false,
    recurring: true,
  },
  {
    id: 'avail-002',
    doctorId: 'staff-001',
    doctorName: 'Dr. Ricardo Santos',
    branchId: BRANCH_MAIN,
    branchName: BRANCH_NAME,
    dayOfWeek: 1,
    startTime: '14:00',
    endTime: '17:00',
    slotDuration: 15,
    isBlocked: false,
    recurring: true,
  },
  {
    id: 'avail-003',
    doctorId: 'staff-001',
    doctorName: 'Dr. Ricardo Santos',
    branchId: BRANCH_MAIN,
    branchName: BRANCH_NAME,
    dayOfWeek: 3, // Wednesday
    startTime: '08:00',
    endTime: '12:00',
    slotDuration: 15,
    isBlocked: false,
    recurring: true,
  },
  {
    id: 'avail-004',
    doctorId: 'staff-002',
    doctorName: 'Dr. Maria Clara Reyes',
    branchId: BRANCH_MAIN,
    branchName: BRANCH_NAME,
    dayOfWeek: 2, // Tuesday
    startTime: '09:00',
    endTime: '13:00',
    slotDuration: 20,
    isBlocked: false,
    recurring: true,
  },
  {
    id: 'avail-005',
    doctorId: 'staff-002',
    doctorName: 'Dr. Maria Clara Reyes',
    branchId: BRANCH_MAIN,
    branchName: BRANCH_NAME,
    dayOfWeek: 4, // Thursday
    startTime: '09:00',
    endTime: '13:00',
    slotDuration: 20,
    isBlocked: false,
    recurring: true,
  },
  {
    id: 'avail-006',
    doctorId: 'staff-003',
    doctorName: 'Dr. Albert Go',
    branchId: BRANCH_MAIN,
    branchName: BRANCH_NAME,
    dayOfWeek: 0, // Sunday - ER coverage
    startTime: '00:00',
    endTime: '23:59',
    slotDuration: 30,
    isBlocked: false,
    recurring: true,
  },
  {
    id: 'avail-007',
    doctorId: 'staff-003',
    doctorName: 'Dr. Albert Go',
    branchId: BRANCH_MAIN,
    branchName: BRANCH_NAME,
    dayOfWeek: 2,
    startTime: '08:00',
    endTime: '16:00',
    slotDuration: 30,
    isBlocked: true,
    blockReason: 'Conference - Philippine College of Emergency Physicians',
    recurring: false,
  },
];

// =============================================
// 6. MOCK ROOMS - 10+
// =============================================

export const MOCK_ROOMS: Room[] = [
  { id: 'room-001', branchId: BRANCH_MAIN, name: 'Consult 1', type: 'Consultation', floor: '2', wing: 'East', capacity: 2, status: 'Occupied', currentPatient: 'Juan Dela Cruz', assignedDoctor: 'Dr. Ricardo Santos' },
  { id: 'room-002', branchId: BRANCH_MAIN, name: 'Consult 2', type: 'Consultation', floor: '2', wing: 'East', capacity: 2, status: 'Available' },
  { id: 'room-003', branchId: BRANCH_MAIN, name: 'Consult 3', type: 'Consultation', floor: '2', wing: 'East', capacity: 2, status: 'Occupied', currentPatient: 'Sofia Garcia', assignedDoctor: 'Dr. Albert Go' },
  { id: 'room-004', branchId: BRANCH_MAIN, name: 'Consult 4 - Pedia', type: 'Consultation', floor: '2', wing: 'West', capacity: 2, status: 'Available', assignedDoctor: 'Dr. Maria Clara Reyes' },
  { id: 'room-005', branchId: BRANCH_MAIN, name: 'Procedure Room A', type: 'Procedure', floor: '3', wing: 'Central', capacity: 4, status: 'Occupied', currentPatient: 'Carlos Reyes' },
  { id: 'room-006', branchId: BRANCH_MAIN, name: 'Procedure Room B', type: 'Procedure', floor: '3', wing: 'Central', capacity: 4, status: 'Cleaning' },
  { id: 'room-007', branchId: BRANCH_MAIN, name: 'Radiology 1', type: 'Imaging', floor: '1', wing: 'North', capacity: 1, status: 'Occupied', currentPatient: 'Lourdes Bautista' },
  { id: 'room-008', branchId: BRANCH_MAIN, name: 'Radiology 2', type: 'Imaging', floor: '1', wing: 'North', capacity: 1, status: 'Available' },
  { id: 'room-009', branchId: BRANCH_MAIN, name: 'Phlebotomy Lab', type: 'Lab', floor: '1', wing: 'South', capacity: 6, status: 'Available' },
  { id: 'room-010', branchId: BRANCH_MAIN, name: 'Ward 2-A', type: 'Ward', floor: '4', wing: 'East', capacity: 6, status: 'Occupied', currentPatient: 'Miguel Torres' },
  { id: 'room-011', branchId: BRANCH_MAIN, name: 'Triage 1', type: 'Triage', floor: 'G', wing: 'Emergency', capacity: 1, status: 'Occupied', currentPatient: 'Anna Santos' },
  { id: 'room-012', branchId: BRANCH_MAIN, name: 'Triage 2', type: 'Triage', floor: 'G', wing: 'Emergency', capacity: 1, status: 'Available' },
];

// =============================================
// 7. MOCK EQUIPMENT - 6+
// =============================================

export const MOCK_EQUIPMENT: Equipment[] = [
  { id: 'eq-001', name: 'Digital X-Ray Machine', type: 'Radiography', branchId: BRANCH_MAIN, roomId: 'room-007', status: 'In Use', lastMaintenance: '2026-01-15', nextMaintenance: '2026-04-15' },
  { id: 'eq-002', name: 'Portable Ultrasound', type: 'Ultrasound', branchId: BRANCH_MAIN, roomId: 'room-005', status: 'Available', lastMaintenance: '2026-02-01', nextMaintenance: '2026-05-01' },
  { id: 'eq-003', name: 'CT Scanner 64-slice', type: 'CT', branchId: BRANCH_MAIN, roomId: 'room-008', status: 'Available', lastMaintenance: '2026-01-20', nextMaintenance: '2026-07-20' },
  { id: 'eq-004', name: 'ECG Machine - 12-lead', type: 'Cardiology', branchId: BRANCH_MAIN, status: 'In Use', lastMaintenance: '2026-02-05', nextMaintenance: '2026-05-05' },
  { id: 'eq-005', name: 'MRI 1.5T', type: 'MRI', branchId: BRANCH_MAIN, roomId: 'room-008', status: 'Maintenance', lastMaintenance: '2026-02-10', nextMaintenance: '2026-02-13' },
  { id: 'eq-006', name: 'Vital Signs Monitor', type: 'Patient Monitoring', branchId: BRANCH_MAIN, roomId: 'room-011', status: 'Available', lastMaintenance: '2026-01-28', nextMaintenance: '2026-04-28' },
];

// =============================================
// 8. MOCK QUEUE PATIENTS - 12+
// =============================================

const qpBase = (id: string, patientId: string, patientName: string, ticket: string, station: StationType, status: QueuePatient['status'], queuedAt: string, waitMin: number, priority: QueuePatient['priority'], complaint: string, doc?: string, nurse?: string, orders: DoctorOrder[] = [], orderIdx = -1, history?: StationVisit[]): QueuePatient => ({
  id, patientId, patientName, ticketNumber: ticket, stationType: station, stationName: station, status, queuedAt, waitMinutes: waitMin, priority, chiefComplaint: complaint, assignedDoctor: doc, assignedNurse: nurse,
  journeyHistory: history ?? [{ station, enteredAt: queuedAt }],
  currentStationEnteredAt: queuedAt,
  doctorOrders: orders,
  currentOrderIndex: orderIdx,
});

export const MOCK_QUEUE_PATIENTS: QueuePatient[] = [
  // ────── SECTION 1: Pre-Consult ──────

  // Carlos: just arrived at Check-In
  qpBase('qp-003', 'p3', 'Carlos Reyes', 'T003', 'Check-In', 'QUEUED', '2026-02-12T09:00:00', 5, 'Normal', 'Annual physical'),
  // Ramon: PWD at Check-In
  qpBase('qp-009', 'pt-new-1', 'Ramon Ong', 'T009', 'Check-In', 'QUEUED', '2026-02-12T09:20:00', 0, 'PWD', 'New patient - BP check'),
  // Anna: READY at Triage
  qpBase('qp-004', 'p5', 'Anna Santos', 'T004', 'Triage', 'READY', '2026-02-12T08:15:00', 18, 'Normal', 'Daughter fever - Mia, 3yo', undefined, 'Nurse Paolo Mendoza', [], -1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T08:00:00', exitedAt: '2026-02-12T08:08:00' }, { station: 'Triage', enteredAt: '2026-02-12T08:08:00' }]),
  // Patricia: Emergency at Triage
  qpBase('qp-010', 'pt-new-2', 'Patricia Gomez', 'T010', 'Triage', 'READY', '2026-02-12T08:50:00', 15, 'Emergency', 'Chest pain, SOB', undefined, 'Nurse Elena Torres', [], -1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T08:45:00', exitedAt: '2026-02-12T08:48:00' }, { station: 'Triage', enteredAt: '2026-02-12T08:48:00' }]),
  // Juan: QUEUED at Consult — waiting for doctor
  qpBase('qp-001', 'p1', 'Juan Dela Cruz', 'T001', 'Consult', 'QUEUED', '2026-02-12T08:30:00', 12, 'Normal', 'Follow-up chest tightness', undefined, 'Nurse Elena Torres', [], -1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T08:00:00', exitedAt: '2026-02-12T08:05:00' }, { station: 'Triage', enteredAt: '2026-02-12T08:05:00', exitedAt: '2026-02-12T08:18:00' }, { station: 'Consult', enteredAt: '2026-02-12T08:18:00' }]),
  // Miguel: QUEUED at Consult — second in line
  qpBase('qp-006', 'p7', 'Miguel Torres', 'T006', 'Consult', 'QUEUED', '2026-02-12T09:10:00', 2, 'Normal', 'Headache 3 days', undefined, undefined, [], -1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T08:55:00', exitedAt: '2026-02-12T09:00:00' }, { station: 'Triage', enteredAt: '2026-02-12T09:00:00', exitedAt: '2026-02-12T09:08:00' }, { station: 'Consult', enteredAt: '2026-02-12T09:08:00' }]),

  // ────── SECTION 2: Doctor Orders (parallel rooms) ──────

  // Lourdes: 3 orders — Lab-Chemistry DONE, Lab-CBC in-progress, X-Ray queued (in Lab AND Imaging simultaneously)
  qpBase('qp-005', 'p6', 'Lourdes Bautista', 'T005', 'Lab', 'IN_SESSION', '2026-02-12T07:45:00', 0, 'Senior', 'FBS, HbA1c + Chest X-Ray', undefined, undefined,
    [
      { id: 'ord-501', type: 'Lab-Chemistry', label: 'Lab Chemistry', targetStation: 'Lab', status: 'completed', orderedAt: '2026-02-12T08:00:00', completedAt: '2026-02-12T08:25:00' },
      { id: 'ord-502', type: 'Lab-CBC', label: 'Lab CBC', targetStation: 'Lab', status: 'in-progress', orderedAt: '2026-02-12T08:00:00', startedAt: '2026-02-12T08:25:00' },
      { id: 'ord-503', type: 'X-Ray', label: 'X-Ray', targetStation: 'Imaging', status: 'queued', orderedAt: '2026-02-12T08:00:00' },
    ], 1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T07:30:00', exitedAt: '2026-02-12T07:35:00' }, { station: 'Triage', enteredAt: '2026-02-12T07:35:00', exitedAt: '2026-02-12T07:42:00' }, { station: 'Consult', enteredAt: '2026-02-12T07:42:00', exitedAt: '2026-02-12T08:00:00' }, { station: 'Lab', enteredAt: '2026-02-12T08:00:00' }]),
  // Lisa: 2 orders BOTH queued in parallel — X-Ray + Urinalysis (appears in Imaging AND Lab rooms)
  qpBase('qp-007', 'p4', 'Lisa Tan', 'T007', 'Imaging', 'QUEUED', '2026-02-12T08:30:00', 22, 'Normal', 'Pre-employment: X-Ray + Urinalysis', undefined, undefined,
    [
      { id: 'ord-701', type: 'X-Ray', label: 'X-Ray', targetStation: 'Imaging', status: 'queued', orderedAt: '2026-02-12T08:50:00' },
      { id: 'ord-702', type: 'Lab-Urinalysis', label: 'Lab Urinalysis', targetStation: 'Lab', status: 'queued', orderedAt: '2026-02-12T08:50:00' },
    ], 0,
    [{ station: 'Check-In', enteredAt: '2026-02-12T08:10:00', exitedAt: '2026-02-12T08:15:00' }, { station: 'Triage', enteredAt: '2026-02-12T08:15:00', exitedAt: '2026-02-12T08:22:00' }, { station: 'Consult', enteredAt: '2026-02-12T08:22:00', exitedAt: '2026-02-12T08:50:00' }, { station: 'Imaging', enteredAt: '2026-02-12T08:50:00' }]),
  // Sofia: 3 orders — Lab-CBC queued, Ultrasound in-progress, ECG queued (in Lab AND Imaging)
  qpBase('qp-002', 'p2', 'Sofia Garcia', 'T002', 'Imaging', 'IN_SESSION', '2026-02-12T08:45:00', 8, 'Normal', 'Prenatal check 24 weeks', 'Dr. Albert Go', undefined,
    [
      { id: 'ord-201', type: 'Lab-CBC', label: 'Lab CBC', targetStation: 'Lab', status: 'queued', orderedAt: '2026-02-12T09:00:00' },
      { id: 'ord-202', type: 'Ultrasound', label: 'Ultrasound', targetStation: 'Imaging', status: 'in-progress', orderedAt: '2026-02-12T09:00:00', startedAt: '2026-02-12T09:05:00' },
      { id: 'ord-203', type: 'ECG', label: 'ECG', targetStation: 'Imaging', status: 'queued', orderedAt: '2026-02-12T09:00:00' },
    ], 1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T08:30:00', exitedAt: '2026-02-12T08:35:00' }, { station: 'Triage', enteredAt: '2026-02-12T08:35:00', exitedAt: '2026-02-12T08:42:00' }, { station: 'Consult', enteredAt: '2026-02-12T08:42:00', exitedAt: '2026-02-12T09:00:00' }, { station: 'Imaging', enteredAt: '2026-02-12T09:00:00' }]),

  // ────── SECTION 3: Post-Orders ──────

  // Maria: ALL orders completed → now at Return-Consult, doctor deciding Pharmacy or Billing
  qpBase('qp-013', 'p8', 'Maria Lim', 'T013', 'Return-Consult', 'IN_SESSION', '2026-02-12T07:30:00', 8, 'Normal', 'Return consult — reviewing results', 'Dr. Ricardo Santos', undefined,
    [
      { id: 'ord-1301', type: 'Lab-CBC', label: 'Lab CBC', targetStation: 'Lab', status: 'completed', orderedAt: '2026-02-12T08:00:00', completedAt: '2026-02-12T08:30:00' },
      { id: 'ord-1302', type: 'Lab-Chemistry', label: 'Lab Chemistry', targetStation: 'Lab', status: 'completed', orderedAt: '2026-02-12T08:00:00', completedAt: '2026-02-12T08:35:00' },
      { id: 'ord-1303', type: 'X-Ray', label: 'X-Ray', targetStation: 'Imaging', status: 'completed', orderedAt: '2026-02-12T08:00:00', completedAt: '2026-02-12T08:40:00' },
    ], -1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T07:15:00', exitedAt: '2026-02-12T07:20:00' }, { station: 'Triage', enteredAt: '2026-02-12T07:20:00', exitedAt: '2026-02-12T07:30:00' }, { station: 'Consult', enteredAt: '2026-02-12T07:30:00', exitedAt: '2026-02-12T08:00:00' }, { station: 'Lab', enteredAt: '2026-02-12T08:00:00', exitedAt: '2026-02-12T08:35:00' }, { station: 'Imaging', enteredAt: '2026-02-12T08:00:00', exitedAt: '2026-02-12T08:40:00' }, { station: 'Return-Consult', enteredAt: '2026-02-12T08:45:00' }]),
  // Teresa: post-order, at Pharmacy (doctor sent her to Pharmacy from Return-Consult)
  qpBase('qp-012', 'p5b', 'Teresa Cruz', 'T012', 'Pharmacy', 'QUEUED', '2026-02-12T09:25:00', 5, 'Normal', 'Medication pickup post-consult', undefined, undefined,
    [
      { id: 'ord-1201', type: 'Lab-Urinalysis', label: 'Lab Urinalysis', targetStation: 'Lab', status: 'completed', orderedAt: '2026-02-12T08:30:00', completedAt: '2026-02-12T09:00:00' },
    ], -1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T08:15:00', exitedAt: '2026-02-12T08:20:00' }, { station: 'Triage', enteredAt: '2026-02-12T08:20:00', exitedAt: '2026-02-12T08:28:00' }, { station: 'Consult', enteredAt: '2026-02-12T08:28:00', exitedAt: '2026-02-12T08:30:00' }, { station: 'Lab', enteredAt: '2026-02-12T08:30:00', exitedAt: '2026-02-12T09:00:00' }, { station: 'Return-Consult', enteredAt: '2026-02-12T09:00:00', exitedAt: '2026-02-12T09:15:00' }, { station: 'Pharmacy', enteredAt: '2026-02-12T09:15:00' }]),
  // Enrico: post-order, sent directly to Billing from Return-Consult (no pharmacy needed)
  qpBase('qp-011', 'p1b', 'Enrico Magsaysay', 'T011', 'Billing', 'QUEUED', '2026-02-12T09:30:00', 3, 'Normal', 'Payment - consultation', undefined, undefined,
    [
      { id: 'ord-1101', type: 'Lab-CBC', label: 'Lab CBC', targetStation: 'Lab', status: 'completed', orderedAt: '2026-02-12T08:15:00', completedAt: '2026-02-12T08:45:00' },
    ], -1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T08:00:00', exitedAt: '2026-02-12T08:05:00' }, { station: 'Triage', enteredAt: '2026-02-12T08:05:00', exitedAt: '2026-02-12T08:15:00' }, { station: 'Consult', enteredAt: '2026-02-12T08:15:00', exitedAt: '2026-02-12T09:00:00' }, { station: 'Lab', enteredAt: '2026-02-12T09:00:00', exitedAt: '2026-02-12T08:45:00' }, { station: 'Return-Consult', enteredAt: '2026-02-12T09:00:00', exitedAt: '2026-02-12T09:20:00' }, { station: 'Billing', enteredAt: '2026-02-12T09:20:00' }]),

  // ────── DONE ──────

  // Roberto: fully completed
  qpBase('qp-008', 'p4b', 'Roberto Villanueva', 'T008', 'Done', 'COMPLETED', '2026-02-12T08:00:00', 0, 'Normal', 'Medication pickup - Metformin', undefined, undefined, [], -1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T07:45:00', exitedAt: '2026-02-12T07:48:00' }, { station: 'Pharmacy', enteredAt: '2026-02-12T07:48:00', exitedAt: '2026-02-12T08:00:00' }]),
];

// =============================================
// 9. MOCK SHIFT SCHEDULES - 10+
// =============================================

export const MOCK_SHIFT_SCHEDULES: ShiftSchedule[] = [
  { id: 'shift-001', staffId: 'staff-001', staffName: 'Dr. Ricardo Santos', role: 'doctor', date: '2026-02-12', shift: 'Morning', department: 'Internal Medicine', branchId: BRANCH_MAIN, status: 'On Duty' },
  { id: 'shift-002', staffId: 'staff-002', staffName: 'Dr. Maria Clara Reyes', role: 'doctor', date: '2026-02-12', shift: 'Morning', department: 'Pediatrics', branchId: BRANCH_MAIN, status: 'On Duty' },
  { id: 'shift-003', staffId: 'staff-003', staffName: 'Dr. Albert Go', role: 'doctor', date: '2026-02-12', shift: 'Morning', department: 'Emergency', branchId: BRANCH_MAIN, status: 'On Duty' },
  { id: 'shift-004', staffId: 'staff-004', staffName: 'Nurse Elena Torres', role: 'nurse', date: '2026-02-12', shift: 'Morning', department: 'Internal Medicine', branchId: BRANCH_MAIN, status: 'On Duty' },
  { id: 'shift-005', staffId: 'staff-005', staffName: 'Nurse Paolo Mendoza', role: 'nurse', date: '2026-02-12', shift: 'Morning', department: 'Emergency', branchId: BRANCH_MAIN, status: 'On Duty' },
  { id: 'shift-006', staffId: 'staff-006', staffName: 'Maria Santos', role: 'lab_tech', date: '2026-02-12', shift: 'Morning', department: 'Laboratory', branchId: BRANCH_MAIN, status: 'On Duty' },
  { id: 'shift-007', staffId: 'staff-007', staffName: 'Roberto Villanueva', role: 'pharmacist', date: '2026-02-12', shift: 'Morning', department: 'Pharmacy', branchId: BRANCH_MAIN, status: 'On Duty' },
  { id: 'shift-008', staffId: 'staff-009', staffName: 'Liza Tan', role: 'front_desk', date: '2026-02-12', shift: 'Morning', department: 'Administration', branchId: BRANCH_MAIN, status: 'On Duty' },
  { id: 'shift-009', staffId: 'staff-004', staffName: 'Nurse Elena Torres', role: 'nurse', date: '2026-02-11', shift: 'Morning', department: 'Internal Medicine', branchId: BRANCH_MAIN, status: 'Completed' },
  { id: 'shift-010', staffId: 'staff-011', staffName: 'Ana Lim', role: 'hr', date: '2026-02-12', shift: 'Morning', department: 'Administration', branchId: BRANCH_MAIN, status: 'Leave' },
  { id: 'shift-011', staffId: 'staff-012', staffName: 'Miguel Fernandez', role: 'imaging_tech', date: '2026-02-12', shift: 'Afternoon', department: 'Radiology', branchId: BRANCH_MAIN, status: 'Scheduled' },
];

// =============================================
// 10. MOCK PHARMACY ITEMS - 10+
// =============================================

export const MOCK_PHARMACY_ITEMS: PharmacyItem[] = [
  { id: 'ph-001', name: 'Rosuvastatin 20mg', genericName: 'Rosuvastatin calcium', category: 'Statins', stockLevel: 450, minStock: 100, unitPrice: 35, expiryDate: '2026-08-15', batchNumber: 'RSV202501', status: 'In Stock', isControlled: false },
  { id: 'ph-002', name: 'Clopidogrel 75mg', genericName: 'Clopidogrel bisulfate', category: 'Antiplatelet', stockLevel: 320, minStock: 80, unitPrice: 28, expiryDate: '2026-09-20', batchNumber: 'CLP202502', status: 'In Stock', isControlled: false },
  { id: 'ph-003', name: 'Metformin 850mg', genericName: 'Metformin HCl', category: 'Antidiabetic', stockLevel: 85, minStock: 150, unitPrice: 5, expiryDate: '2026-11-01', batchNumber: 'MTF202506', status: 'Low Stock', isControlled: false },
  { id: 'ph-004', name: 'Losartan 50mg', genericName: 'Losartan potassium', category: 'ARB', stockLevel: 0, minStock: 80, unitPrice: 12, expiryDate: '2026-07-01', batchNumber: 'LSR202504', status: 'Out of Stock', isControlled: false },
  { id: 'ph-005', name: 'Amlodipine 10mg', genericName: 'Amlodipine besylate', category: 'CCB', stockLevel: 280, minStock: 100, unitPrice: 8, expiryDate: '2026-10-15', batchNumber: 'AML202503', status: 'In Stock', isControlled: false },
  { id: 'ph-006', name: 'Tramadol 50mg', genericName: 'Tramadol HCl', category: 'Analgesic', stockLevel: 120, minStock: 50, unitPrice: 15, expiryDate: '2026-06-30', batchNumber: 'TRD202505', status: 'In Stock', isControlled: true },
  { id: 'ph-007', name: 'Alprazolam 0.5mg', genericName: 'Alprazolam', category: 'Benzodiazepine', stockLevel: 200, minStock: 60, unitPrice: 18, expiryDate: '2026-12-01', batchNumber: 'ALP202507', status: 'In Stock', isControlled: true },
  { id: 'ph-008', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Analgesic/Antipyretic', stockLevel: 1200, minStock: 300, unitPrice: 2, expiryDate: '2027-01-15', batchNumber: 'PRC202601', status: 'In Stock', isControlled: false },
  { id: 'ph-009', name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', category: 'Antihistamine', stockLevel: 380, minStock: 100, unitPrice: 6, expiryDate: '2026-09-30', batchNumber: 'CTZ202508', status: 'In Stock', isControlled: false },
  { id: 'ph-010', name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'PPI', stockLevel: 520, minStock: 120, unitPrice: 10, expiryDate: '2026-08-20', batchNumber: 'OMP202509', status: 'In Stock', isControlled: false },
  { id: 'ph-011', name: 'Insulin Glargine 100U/mL', genericName: 'Insulin glargine', category: 'Insulin', stockLevel: 45, minStock: 30, unitPrice: 850, expiryDate: '2026-05-15', batchNumber: 'INS202510', status: 'In Stock', isControlled: true },
];

// =============================================
// 11. MOCK DISPENSING RECORDS - 6+
// =============================================

export const MOCK_DISPENSING: DispensingRecord[] = [
  { id: 'disp-001', prescriptionId: 'rx-001', patientName: 'Juan Dela Cruz', medication: 'Rosuvastatin 20mg', quantity: 30, dispensedBy: 'Roberto Villanueva', dispensedDate: '2026-02-01', status: 'Dispensed' },
  { id: 'disp-002', prescriptionId: 'rx-002', patientName: 'Juan Dela Cruz', medication: 'Clopidogrel 75mg', quantity: 30, dispensedBy: 'Roberto Villanueva', dispensedDate: '2026-02-01', status: 'Dispensed' },
  { id: 'disp-003', prescriptionId: 'rx-005', patientName: 'Roberto Villanueva', medication: 'Metformin 850mg', quantity: 60, dispensedBy: 'Roberto Villanueva', dispensedDate: '2026-02-05', status: 'Dispensed' },
  { id: 'disp-004', prescriptionId: 'rx-006', patientName: 'Anna Santos', medication: 'Cetirizine Drops', quantity: 15, dispensedBy: 'Roberto Villanueva', dispensedDate: '2026-02-07', status: 'Dispensed' },
  { id: 'disp-005', prescriptionId: 'rx-007', patientName: 'Lourdes Bautista', medication: 'Amlodipine 10mg', quantity: 30, dispensedBy: 'Roberto Villanueva', dispensedDate: '2026-02-12', status: 'Pending' },
  { id: 'disp-006', prescriptionId: 'rx-003', patientName: 'Sofia Garcia', medication: 'Prenatal Vitamins', quantity: 90, dispensedBy: 'Roberto Villanueva', dispensedDate: '2026-01-15', status: 'Partially Dispensed' },
];

// =============================================
// 12. MOCK TRIAGE RECORDS - 6+
// =============================================

export const MOCK_TRIAGE_RECORDS: TriageRecord[] = [
  { id: 'triage-001', patientId: 'p5', patientName: 'Anna Santos', nurseId: 'staff-005', date: '2026-02-12', bloodPressure: '118/76', heartRate: 88, temperature: 37.2, respiratoryRate: 18, oxygenSaturation: 98, painScale: 2, chiefComplaint: 'Daughter fever - Mia 3yo, T 38.5', priority: 'Semi-Urgent', notes: 'Parent anxious. Child AOx4, playful.' },
  { id: 'triage-002', patientId: 'pt-new-2', patientName: 'Patricia Gomez', nurseId: 'staff-005', date: '2026-02-12', bloodPressure: '158/98', heartRate: 112, temperature: 36.8, respiratoryRate: 24, oxygenSaturation: 94, painScale: 8, chiefComplaint: 'Chest pain, shortness of breath', priority: 'Emergency', notes: 'Started 30 min ago. Diaphoretic. ECG ordered.' },
  { id: 'triage-003', patientId: 'p6', patientName: 'Lourdes Bautista', nurseId: 'staff-004', date: '2026-02-11', bloodPressure: '138/85', heartRate: 76, temperature: 36.5, respiratoryRate: 16, oxygenSaturation: 99, painScale: 0, chiefComplaint: 'DM/HTN follow-up, lab draw', priority: 'Non-Urgent' },
  { id: 'triage-004', patientId: 'p3', patientName: 'Carlos Reyes', nurseId: 'staff-004', date: '2026-02-12', bloodPressure: '122/78', heartRate: 72, temperature: 36.6, respiratoryRate: 16, oxygenSaturation: 99, painScale: 0, chiefComplaint: 'Annual physical exam', priority: 'Non-Urgent' },
  { id: 'triage-005', patientId: 'p7', patientName: 'Miguel Torres', nurseId: 'staff-005', date: '2026-02-12', bloodPressure: '120/80', heartRate: 78, temperature: 36.7, respiratoryRate: 18, oxygenSaturation: 99, painScale: 4, chiefComplaint: 'Headache 3 days, frontal pressure', priority: 'Non-Urgent' },
  { id: 'triage-006', patientId: 'pt-new-1', patientName: 'Ramon Ong', nurseId: 'staff-004', date: '2026-02-12', bloodPressure: '145/92', heartRate: 82, temperature: 36.5, respiratoryRate: 16, oxygenSaturation: 98, painScale: 0, chiefComplaint: 'BP check - new patient, PWD', priority: 'Semi-Urgent', notes: 'PWD ID presented.' },
];

// =============================================
// 13. MOCK NURSING TASKS - 8+
// =============================================

export const MOCK_NURSING_TASKS: NursingTask[] = [
  { id: 'task-001', patientId: 'p1', patientName: 'Juan Dela Cruz', nurseId: 'staff-004', type: 'Vital Signs', description: 'BP check before consult', priority: 'High', status: 'Completed', dueTime: '2026-02-12T08:45:00', completedTime: '2026-02-12T08:42:00' },
  { id: 'task-002', patientId: 'p6', patientName: 'Lourdes Bautista', nurseId: 'staff-004', type: 'Medication', description: 'Administer morning meds - Amlodipine, Metformin', priority: 'High', status: 'Completed', dueTime: '2026-02-12T07:30:00', completedTime: '2026-02-12T07:28:00' },
  { id: 'task-003', patientId: 'p5', patientName: 'Anna Santos', nurseId: 'staff-005', type: 'Assessment', description: 'Triage - pediatric fever case', priority: 'High', status: 'In Progress', dueTime: '2026-02-12T09:00:00', notes: 'Mia 3yo - parent with patient' },
  { id: 'task-004', patientId: 'pt-new-2', patientName: 'Patricia Gomez', nurseId: 'staff-005', type: 'Vital Signs', description: 'Repeat BP and ECG - chest pain workup', priority: 'High', status: 'Pending', dueTime: '2026-02-12T09:30:00' },
  { id: 'task-005', patientId: 'p2', patientName: 'Sofia Garcia', nurseId: 'staff-004', type: 'Assessment', description: 'Prenatal FHR check', priority: 'Medium', status: 'Completed', dueTime: '2026-02-12T08:50:00', completedTime: '2026-02-12T08:48:00' },
  { id: 'task-006', patientId: 'p4', patientName: 'Lisa Tan', nurseId: 'staff-005', type: 'Wound Care', description: 'Dress wound - minor laceration from fall', priority: 'Medium', status: 'Overdue', dueTime: '2026-02-12T08:00:00', notes: 'Reschedule - patient in imaging' },
  { id: 'task-007', patientId: 'p7', patientName: 'Miguel Torres', nurseId: 'staff-004', type: 'Discharge', description: 'Discharge education - tension headache', priority: 'Low', status: 'Pending', dueTime: '2026-02-12T11:00:00' },
  { id: 'task-008', patientId: 'p3', patientName: 'Carlos Reyes', nurseId: 'staff-004', type: 'Other', description: 'Escort to lab for FBS draw', priority: 'Medium', status: 'Pending', dueTime: '2026-02-12T09:45:00' },
];

// =============================================
// 14. MOCK FORM TEMPLATES
// =============================================

const todayFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const MOCK_FORM_TEMPLATES: FormTemplate[] = [
  { id: 'form-001', name: 'Adult Intake Form', type: 'intake', fields: [{ id: 'f1', label: 'Chief Complaint', type: 'textarea', required: true }, { id: 'f2', label: 'Allergies', type: 'text', required: false }, { id: 'f3', label: 'Current Medications', type: 'textarea', required: false }], status: 'Active', createdDate: '2024-01-15', usageCount: 1250 },
  { id: 'form-002', name: 'Consent for Treatment', type: 'consent', fields: [{ id: 'f1', label: 'Patient Name', type: 'text', required: true }, { id: 'f2', label: 'I consent to treatment', type: 'checkbox', required: true }, { id: 'f3', label: 'Date', type: 'date', required: true }], status: 'Active', createdDate: '2023-06-01', usageCount: 2100 },
  { id: 'form-003', name: 'PHQ-9 Depression Screening', type: 'assessment', fields: [{ id: 'f1', label: 'Little interest in doing things', type: 'radio', required: true, options: ['Not at all', 'Several days', 'More than half', 'Nearly every day'] }, { id: 'f2', label: 'Feeling down', type: 'radio', required: true, options: ['Not at all', 'Several days', 'More than half', 'Nearly every day'] }], status: 'Active', createdDate: '2024-03-10', usageCount: 456 },
  { id: 'form-004', name: 'Pre-Op Questionnaire', type: 'questionnaire', fields: [{ id: 'f1', label: 'Previous surgeries', type: 'textarea', required: false }, { id: 'f2', label: 'Anesthesia reaction', type: 'select', required: false, options: ['None', 'Mild', 'Moderate', 'Severe'] }], status: 'Draft', createdDate: '2025-01-20', usageCount: 0 },
  { id: 'form-005', name: 'Patient Satisfaction Survey', type: 'questionnaire', fields: [{ id: 'f1', label: 'Overall rating', type: 'number', required: true }, { id: 'f2', label: 'Comments', type: 'textarea', required: false }], status: 'Archived', createdDate: '2022-11-01', usageCount: 3500 },
];

// =============================================
// 15. MOCK FORM SUBMISSIONS
// =============================================

export const MOCK_FORM_SUBMISSIONS: FormSubmission[] = [
  { id: 'sub-001', templateId: 'form-001', templateName: 'Adult Intake Form', patientId: 'p1', patientName: 'Juan Dela Cruz', submittedDate: todayFormatted, status: 'Pending Review', data: { chiefComplaint: 'Hypertension follow-up', allergies: 'None' } },
  { id: 'sub-002', templateId: 'form-001', templateName: 'Adult Intake Form', patientId: 'p3', patientName: 'Carlos Reyes', submittedDate: 'Feb 11, 2026', status: 'Reviewed', data: { chiefComplaint: 'Annual physical', allergies: 'Penicillin' }, reviewedBy: 'Dr. Ricardo Santos', reviewNotes: 'Completed' },
  { id: 'sub-003', templateId: 'form-003', templateName: 'PHQ-9 Depression Screening', patientId: 'p6', patientName: 'Lourdes Bautista', submittedDate: 'Feb 10, 2026', status: 'Flagged', data: { f1: 'Several days', f2: 'Several days' }, reviewedBy: 'Dr. Ricardo Santos', reviewNotes: 'Refer to psych' },
  { id: 'sub-004', templateId: 'form-002', templateName: 'Consent for Treatment', patientId: 'p5', patientName: 'Anna Santos', submittedDate: todayFormatted, status: 'Pending Review', data: {} },
];

// =============================================
// 16. MOCK IMMUNIZATION RECORDS
// =============================================

export const MOCK_IMMUNIZATION_RECORDS: ImmunizationRecord[] = [
  { id: 'imm-001', patientId: 'p1', patientName: 'Juan Dela Cruz', vaccine: 'Flu Shot', dose: '1 dose', administeredDate: '2025-10-15', administeredBy: 'Nurse Elena Torres', batchNumber: 'FLU-2025-001', site: 'Left deltoid', status: 'Completed', nextDueDate: '2026-10-15' },
  { id: 'imm-002', patientId: 'p2', patientName: 'Sofia Garcia', vaccine: 'COVID-19 Booster', dose: '3rd', administeredDate: '2025-11-20', administeredBy: 'Dr. Ricardo Santos', batchNumber: 'COVID-B-2025', site: 'Left Deltoid', status: 'Completed', nextDueDate: '2026-11-20' },
  { id: 'imm-003', patientId: 'p3', patientName: 'Carlos Reyes', vaccine: 'Influenza 2026', dose: '1 dose', administeredDate: '', administeredBy: '', batchNumber: '', site: '', status: 'Due', nextDueDate: '2026-02-15' },
  { id: 'imm-004', patientId: 'p4', patientName: 'Lisa Tan', vaccine: 'Pneumococcal PCV13', dose: '1 dose', administeredDate: '', administeredBy: '', batchNumber: '', site: '', status: 'Overdue', nextDueDate: '2026-01-10' },
  { id: 'imm-005', patientId: 'p5', patientName: 'Anna Santos', vaccine: 'Hepatitis B', dose: '2 of 3', administeredDate: '', administeredBy: '', batchNumber: '', site: '', status: 'Scheduled', nextDueDate: '2026-02-20' },
  { id: 'imm-006', patientId: 'p6', patientName: 'Lourdes Bautista', vaccine: 'MMR', dose: '1 dose', administeredDate: '2025-09-01', administeredBy: 'Nurse Elena Torres', batchNumber: 'MMR-2025', site: 'Right Deltoid', status: 'Completed', nextDueDate: undefined },
];

// =============================================
// 17. MOCK MANAGED EVENTS
// =============================================

export const MOCK_MANAGED_EVENTS: ManagedEvent[] = [
  { id: 'evt-001', title: 'Free Blood Pressure Screening', type: 'Screening', date: todayFormatted, time: '09:00 - 12:00', location: 'Main Lobby', capacity: 100, registered: 45, status: 'Active', description: 'Free BP screening.', branchId: BRANCH_MAIN },
];

// =============================================
// 18. MOCK EVENT REGISTRATIONS
// =============================================

export const MOCK_EVENT_REGISTRATIONS: EventRegistration[] = [
  { id: 'reg-001', eventId: 'evt-001', eventName: 'Free Blood Pressure Screening', patientId: 'p1', patientName: 'Juan Dela Cruz', registeredDate: todayFormatted, status: 'Registered' },
];

// =============================================
// 19. MOCK AUDIT LOGS
// =============================================

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'audit-001', userId: 'staff-001', userName: 'Dr. Ricardo Santos', action: 'SIGNED_NOTE', module: 'Clinical Notes', details: 'Signed note for patient Sofia Garcia', timestamp: new Date(Date.now() - 60000).toISOString(), ipAddress: '192.168.1.10' },
  { id: 'audit-002', userId: 'staff-009', userName: 'Liza Tan', action: 'CHECK_IN', module: 'Front Desk', details: 'Checked in patient Carlos Reyes', timestamp: new Date(Date.now() - 180000).toISOString(), ipAddress: '192.168.1.15' },
  { id: 'audit-003', userId: 'staff-004', userName: 'Nurse Elena Torres', action: 'TRIAGE_UPDATE', module: 'Triage', details: 'Updated vital signs for Anna Santos', timestamp: new Date(Date.now() - 300000).toISOString(), ipAddress: '192.168.1.12' },
  { id: 'audit-004', userId: 'staff-007', userName: 'Roberto Villanueva', action: 'DISPENSE', module: 'Pharmacy', details: 'Dispensed Amlodipine to Lourdes Bautista', timestamp: new Date(Date.now() - 420000).toISOString(), ipAddress: '192.168.1.18' },
  { id: 'audit-005', userId: 'staff-006', userName: 'Maria Santos', action: 'LAB_RESULT', module: 'Laboratory', details: 'Entered HbA1c result for Lourdes Bautista', timestamp: new Date(Date.now() - 600000).toISOString(), ipAddress: '192.168.1.20' },
  { id: 'audit-006', userId: 'staff-008', userName: 'Carmen dela Cruz', action: 'PAYMENT', module: 'Billing', details: 'Processed GCash payment ₱800', timestamp: new Date(Date.now() - 720000).toISOString(), ipAddress: '192.168.1.22' },
  { id: 'audit-007', userId: 'staff-003', userName: 'Dr. Albert Go', action: 'ORDER_LAB', module: 'Orders', details: 'Ordered CBC for Miguel Torres', timestamp: new Date(Date.now() - 900000).toISOString(), ipAddress: '192.168.1.10' },
  { id: 'audit-008', userId: 'staff-002', userName: 'Dr. Maria Clara Reyes', action: 'PRESCRIBE', module: 'Prescriptions', details: 'Prescribed Cetirizine Drops for Mia Santos', timestamp: new Date(Date.now() - 1080000).toISOString(), ipAddress: '192.168.1.11' },
];

// =============================================
// 20. MOCK PAYMENT TRANSACTIONS
// =============================================

export const MOCK_PAYMENT_TRANSACTIONS: PaymentTransaction[] = [
  { id: 'pay-001', invoiceId: 'inv-001', patientName: 'Juan Dela Cruz', amount: 800, method: 'GCash', status: 'Completed', transactionDate: todayFormatted, referenceNumber: 'GC-20260212-001', convenienceFee: 15 },
  { id: 'pay-002', invoiceId: 'inv-002', patientName: 'Sofia Garcia', amount: 1500, method: 'Credit Card', status: 'Completed', transactionDate: todayFormatted, referenceNumber: 'CC-20260212-002', convenienceFee: 25 },
  { id: 'pay-003', invoiceId: 'inv-003', patientName: 'Carlos Reyes', amount: 680, method: 'Maya', status: 'Pending', transactionDate: todayFormatted, referenceNumber: 'MY-20260212-003', convenienceFee: 12 },
  { id: 'pay-004', invoiceId: 'inv-004', patientName: 'Lourdes Bautista', amount: 2100, method: 'Cash', status: 'Completed', transactionDate: 'Feb 11, 2026', referenceNumber: 'CSH-20260211-004' },
  { id: 'pay-005', invoiceId: 'inv-005', patientName: 'Anna Santos', amount: 450, method: 'GCash', status: 'Failed', transactionDate: todayFormatted, referenceNumber: 'GC-20260212-005', convenienceFee: 8 },
  { id: 'pay-006', invoiceId: 'inv-006', patientName: 'Miguel Torres', amount: 1200, method: 'Debit Card', status: 'Refunded', transactionDate: 'Feb 10, 2026', referenceNumber: 'DC-20260210-006' },
];

// =============================================
// 21. MOCK INTERNAL MESSAGES
// =============================================

export const MOCK_INTERNAL_MESSAGES: InternalMessage[] = [
  { id: 'msg-001', fromId: 'staff-002', fromName: 'Dr. Maria Clara Reyes', toId: 'staff-001', toName: 'Dr. Ricardo Santos', subject: 'Consult Request - Pedia', body: 'Please refer Carlos Reyes for pediatric consult. Patient has family history of asthma.', date: todayFormatted, read: false, priority: 'Normal' },
  { id: 'msg-002', fromId: 'staff-004', fromName: 'Nurse Elena Torres', toId: 'staff-001', toName: 'Dr. Ricardo Santos', subject: 'Lab result critical - Lourdes Bautista', body: 'HbA1c resulted at 8.2%. Patient advised. Please review and call patient.', date: todayFormatted, read: true, priority: 'Urgent' },
  { id: 'msg-003', fromId: 'staff-001', fromName: 'Dr. Ricardo Santos', toId: 'staff-006', toName: 'Maria Santos', subject: 'Stat lab - Miguel Torres', body: 'Ordered abdominal US for Miguel Torres. Please prioritize. Patient has RUQ pain.', date: 'Feb 11, 2026', read: true, priority: 'Normal' },
  { id: 'msg-004', fromId: 'staff-009', fromName: 'Liza Tan', toId: 'staff-001', toName: 'Dr. Ricardo Santos', subject: 'No-show follow-up', body: 'Patient Anna Santos missed her 9:00 AM appointment. Should we reschedule?', date: 'Feb 10, 2026', read: false, priority: 'Normal' },
  { id: 'msg-005', fromId: 'staff-003', fromName: 'Dr. Albert Go', toId: 'staff-001', toName: 'Dr. Ricardo Santos', subject: 'ER consult - Patricia Gomez', body: 'Chest pain, SOB. ECG and troponin ordered. May need cardiology consult if elevated.', date: todayFormatted, read: false, priority: 'Urgent' },
];

// =============================================
// 22. MOCK CDSS ALERTS
// =============================================

export const MOCK_CDSS_ALERTS: CDSSAlert[] = [
  // ── Patient-level alerts — visible at encounter onset ──
  { id: 'cdss-001', type: 'drug_allergy', severity: 'contraindicated', title: 'Drug-Allergy Conflict', message: 'Patient has documented Penicillin allergy. Current medication list includes Amoxicillin which is cross-reactive.', recommendation: 'Discontinue Amoxicillin. Consider Azithromycin 500mg as alternative.', prescriptionId: 'rx-001', dismissed: false, actioned: false, createdAt: todayFormatted },
  { id: 'cdss-004', type: 'preventive_care', severity: 'info', title: 'Preventive Care Reminder', message: 'Patient is due for annual flu vaccination (last: Feb 2025). COVID-19 booster eligible.', recommendation: 'Offer flu shot and COVID booster at this visit if no contraindications.', dismissed: false, actioned: false, createdAt: todayFormatted },
  // ── Action-triggered alerts — dismissed initially, fired dynamically by encounter actions ──
  { id: 'cdss-002', type: 'drug_interaction', severity: 'major', title: 'Drug-Drug Interaction', message: 'Metformin and contrast dye interaction risk.', recommendation: 'Hold Metformin 48h before/after contrast imaging.', dismissed: true, actioned: false, createdAt: todayFormatted },
  { id: 'cdss-003', type: 'dosage_range', severity: 'moderate', title: 'Dosage Review', message: 'Amlodipine 10mg may cause hypotension in elderly.', recommendation: 'Consider 5mg starting dose for patients over 65.', prescriptionId: 'rx-007', dismissed: true, actioned: false, createdAt: todayFormatted },
];

// =============================================
// 23. MOCK DASHBOARD KPIS (8 for Provider Dashboard)
// =============================================

export const MOCK_DASHBOARD_KPIS: DashboardKPI[] = [
  { label: 'Patient Volume', value: 142, change: 8, trend: 'up', icon: 'users' },
  { label: 'Revenue', value: '₱2.4M', change: 12, trend: 'up', icon: 'dollar' },
  { label: 'Avg Wait Time', value: '18 min', change: -5, trend: 'down', icon: 'clock' },
  { label: 'No-Show Rate', value: '4.2%', change: -1, trend: 'down', icon: 'userx' },
  { label: 'Bed Occupancy', value: '78%', change: 3, trend: 'up', icon: 'bed' },
  { label: 'Queue Throughput', value: 89, change: 15, trend: 'up', icon: 'flow' },
  { label: 'Insurance Claims', value: 24, change: -2, trend: 'down', icon: 'claims' },
  { label: 'Staff Utilization', value: '92%', change: 5, trend: 'up', icon: 'staff' },
];

// =============================================
// 24. MOCK APPOINTMENTS (for todayAppointments computed)
// =============================================

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'apt-001', doctor: 'Dr. Ricardo Santos', specialty: 'Internal Medicine', date: todayFormatted, time: '09:00 AM', status: 'Upcoming', type: 'In-Person', location: BRANCH_NAME },
  { id: 'apt-002', doctor: 'Dr. Ricardo Santos', specialty: 'Internal Medicine', date: todayFormatted, time: '09:30 AM', status: 'Upcoming', type: 'In-Person', location: BRANCH_NAME },
  { id: 'apt-003', doctor: 'Dr. Maria Clara Reyes', specialty: 'Pediatrics', date: 'Feb 10, 2026', time: '10:00 AM', status: 'Completed', type: 'In-Person' },
];
