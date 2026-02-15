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
  TeleconsultSession,
  TeleconsultDoctor,
  Conversation,
  ChatMessage,
  HomeCareRequest,
  ConsultRoom,
} from '../types';

const BRANCH_MAIN = 'metro-hosp-main';
const BRANCH_NAME = 'Metro General Hospital - Main';
const BRANCH_NORTH = 'metro-hosp-north';
const BRANCH_NORTH_NAME = 'Metro General Hospital - North';
const BRANCH_MC_AYALA = 'mc-pcc-ayala';
const BRANCH_MC_AYALA_NAME = 'Maxicare PCC - Ayala North Exchange';
void BRANCH_MC_AYALA; // used in appointment data below
const BRANCH_MC_BGC = 'mc-pcc-bgc';
const BRANCH_MC_BGC_NAME = 'Maxicare PCC - BGC';
const BRANCH_MC_BRIDGE = 'mc-pcc-bridgetowne';
const BRANCH_MC_BRIDGE_NAME = 'Maxicare PCC - Bridgetowne';

// =============================================
// PATIENT → TENANT MAPPING
// Maps patient IDs to their tenant so Records and other modules
// can filter data by the active organization/tenant.
// =============================================
export const PATIENT_TENANT_MAP: Record<string, string> = {
  // Metro General Hospital patients
  'p1': 'metroGeneral', // Juan Dela Cruz
  'p2': 'metroGeneral', // Sofia Garcia
  'p3': 'metroGeneral', // Carlos Reyes
  'p4': 'metroGeneral', // Lisa Tan
  'p4b': 'metroGeneral', // Roberto Villanueva
  'p5': 'metroGeneral', // Anna Santos
  'p6': 'metroGeneral', // Lourdes Bautista
  'p7': 'metroGeneral', // Miguel Torres
  'p8': 'metroGeneral', // Maria Lim
  'p9': 'metroGeneral', // Grace Mendoza
  'p10': 'metroGeneral', // Ricardo Lim
  'p11': 'metroGeneral', // Elena Villanueva
  'p12': 'metroGeneral', // Diego Aquino
  'p1b': 'metroGeneral', // Enrico Magsaysay
  'p5b': 'metroGeneral', // Teresa Cruz
  'pt-new-1': 'metroGeneral', // Ramon Ong
  'pt-new-2': 'metroGeneral', // Patricia Gomez
  // Maxicare PCC patients
  'p-mc1': 'maxicare', // Andrea Reyes
  'p-mc2': 'maxicare', // Mark Anthony Lim
  'p-mc3': 'maxicare', // Grace Lim
  'p-mc4': 'maxicare', // Paolo Reyes
  'p-mc5': 'maxicare', // Carmen Santos
  'p-mc6': 'maxicare', // Roberto Lim
  'p-mc7': 'maxicare', // Elisa Tan
  'p-mc8': 'maxicare', // Riza Mendoza
  'p-mc9': 'maxicare', // Dennis Aquino
  'p-mc10': 'maxicare', // Josefina Cruz
  'p-mc11': 'maxicare', // Patricia Villanueva
  'p-mc12': 'maxicare', // Fernando Reyes
  'p-mc13': 'maxicare', // Lorna Diaz
  'p-mc14': 'maxicare', // Arturo Villanueva
  'p-mc15': 'maxicare', // Cynthia Abad
  'p-mc16': 'maxicare', // Eduardo Bautista
  'p-mc17': 'maxicare', // Maricel Torres
};

/** Helper: returns the tenantId for a given patient, defaults to 'metroGeneral' */
export function getPatientTenant(patientId: string): string {
  return PATIENT_TENANT_MAP[patientId] ?? 'metroGeneral';
}

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
    specializations: ['Cardiology', 'Internal Medicine', 'General Practice'],
    branchId: BRANCH_MAIN,
    email: 'rsantos@metrogeneral.ph',
    phone: '0917-111-0001',
    photoUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
    credentials: ['MD', 'FPCP', 'FPCC', 'DPBS-Cardiology'],
    licenseExpiry: '2027-03-15',
    status: 'Active',
    hireDate: '2020-01-15',
  },
  {
    id: 'staff-002',
    name: 'Dr. Maria Clara Reyes',
    role: 'doctor',
    department: 'Pediatrics',
    specialty: 'Pediatrics',
    specializations: ['Pediatrics', 'General Practice'],
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
    department: 'Emergency Medicine',
    specialty: 'Emergency Medicine',
    specializations: ['Emergency Medicine', 'Internal Medicine', 'General Practice'],
    branchId: BRANCH_MAIN,
    email: 'ago@metrogeneral.ph',
    phone: '0917-111-0003',
    photoUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
    credentials: ['MD', 'DPBEM'],
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
  // ── Super Admin (can switch between branches) ──
  {
    id: 'staff-100',
    name: 'Dr. Fernando Aquino',
    role: 'super_admin',
    department: 'Executive',
    specialty: 'Hospital Administration',
    branchId: BRANCH_MAIN,
    email: 'faquino@metrogeneral.ph',
    phone: '0917-100-0001',
    photoUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
    credentials: ['MD', 'MBA', 'MHA', 'FACHE'],
    licenseExpiry: '2028-12-31',
    status: 'Active',
    hireDate: '2012-01-15',
  },
  // ── North Branch Staff ──
  {
    id: 'staff-n01',
    name: 'Dr. Patricia Lim',
    role: 'doctor',
    department: 'Family Medicine',
    specialty: 'Family Medicine',
    specializations: ['Family Medicine', 'General Practice'],
    branchId: BRANCH_NORTH,
    email: 'plim@metrogeneral.ph',
    phone: '0917-222-0001',
    photoUrl: 'https://randomuser.me/api/portraits/women/30.jpg',
    credentials: ['MD', 'DPAFP'],
    licenseExpiry: '2027-06-30',
    status: 'Active',
    hireDate: '2021-04-01',
  },
  {
    id: 'staff-n02',
    name: 'Nurse Diana Cruz',
    role: 'nurse',
    department: 'General Nursing',
    branchId: BRANCH_NORTH,
    email: 'dcruz@metrogeneral.ph',
    phone: '0917-222-0002',
    photoUrl: 'https://randomuser.me/api/portraits/women/31.jpg',
    credentials: ['RN', 'BSN'],
    licenseExpiry: '2026-12-31',
    status: 'Active',
    hireDate: '2022-01-10',
  },
  {
    id: 'staff-n03',
    name: 'Antonio Ramos',
    role: 'admin',
    department: 'Administration',
    branchId: BRANCH_NORTH,
    email: 'aramos@metrogeneral.ph',
    phone: '0917-222-0003',
    photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    credentials: ['MBA'],
    licenseExpiry: '2027-12-31',
    status: 'Active',
    hireDate: '2019-08-01',
  },
  // ── Maxicare PCC Doctors (mapped from patient app tenant data) ──
  {
    id: 'staff-mc01',
    name: 'Dr. Carmela Ong',
    role: 'doctor',
    department: 'Internal Medicine',
    specialty: 'Internal Medicine',
    specializations: ['Internal Medicine', 'General Practice', 'Primary Care'],
    branchId: BRANCH_MAIN,
    email: 'cong@maxicare.ph',
    phone: '0917-333-0001',
    photoUrl: 'https://randomuser.me/api/portraits/women/40.jpg',
    credentials: ['MD', 'FPCP', 'DPIM'],
    licenseExpiry: '2027-09-30',
    status: 'Active',
    hireDate: '2019-03-01',
  },
  {
    id: 'staff-mc02',
    name: 'Dr. Ramon Bautista',
    role: 'doctor',
    department: 'Cardiology',
    specialty: 'Cardiology',
    specializations: ['Cardiology', 'Internal Medicine', 'General Practice'],
    branchId: BRANCH_MAIN,
    email: 'rbautista@maxicare.ph',
    phone: '0917-333-0002',
    photoUrl: 'https://randomuser.me/api/portraits/men/41.jpg',
    credentials: ['MD', 'FPCP', 'FPCC'],
    licenseExpiry: '2027-06-15',
    status: 'Active',
    hireDate: '2018-07-01',
  },
  {
    id: 'staff-mc03',
    name: 'Dr. Patricia Santos',
    role: 'doctor',
    department: 'OB-GYN',
    specialty: 'OB-GYN',
    specializations: ['OB-GYN', 'General Practice'],
    branchId: BRANCH_MAIN,
    email: 'psantos@maxicare.ph',
    phone: '0917-333-0003',
    photoUrl: 'https://randomuser.me/api/portraits/women/42.jpg',
    credentials: ['MD', 'FPOGS'],
    licenseExpiry: '2027-03-20',
    status: 'Active',
    hireDate: '2020-01-15',
  },
  {
    id: 'staff-mc04',
    name: 'Dr. Jen Diaz',
    role: 'doctor',
    department: 'Family Medicine',
    specialty: 'Family Medicine',
    specializations: ['Family Medicine', 'General Practice', 'Primary Care'],
    branchId: BRANCH_MAIN,
    email: 'jdiaz@maxicare.ph',
    phone: '0917-333-0004',
    photoUrl: 'https://randomuser.me/api/portraits/women/43.jpg',
    credentials: ['MD', 'DPAFP'],
    licenseExpiry: '2027-11-30',
    status: 'Active',
    hireDate: '2021-06-01',
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
  // --- Maxicare patients ---
  {
    id: 'note-mc01',
    patientId: 'p-mc1',
    patientName: 'Andrea Reyes',
    appointmentId: 'apt-mc01',
    doctorId: 'staff-mc01',
    date: '2026-01-20',
    subjective: 'Annual wellness visit. Patient reports well-controlled hypertension on Losartan 50mg. Occasional mild fatigue. Taking Vitamin D3 supplement. Denies chest pain, dyspnea, or palpitations. Last menstrual period regular.',
    objective: 'BP 138/86, HR 76, RR 16, Temp 36.5°C, SpO2 98%, Weight 62kg, BMI 24.2. General: Well-appearing, no acute distress. HEENT: Normal. Lungs: Clear bilaterally. Heart: Regular rate and rhythm, no murmurs. Abdomen: Soft, non-tender. Extremities: No edema.',
    assessment: 'Essential hypertension, borderline controlled. Vitamin D insufficiency on supplementation. Due for routine screening labs.',
    plan: 'Continue Losartan 50mg daily. Continue Vitamin D3 1000IU daily. Order comprehensive metabolic panel: CBC, Lipid Panel, FBS, HbA1c, Kidney Function Test, Urinalysis. Consider adding Amlodipine 5mg if BP remains above target at follow-up. Referral to Cardiology for cardiac risk assessment. Return in 4 weeks for lab review.',
    icdCodes: ['I10', 'E55.9', 'Z00.00'],
    status: 'Signed',
    aiGenerated: false,
  },
  {
    id: 'note-mc02',
    patientId: 'p-mc1',
    patientName: 'Andrea Reyes',
    appointmentId: 'apt-mc02',
    doctorId: 'staff-mc02',
    date: '2026-02-03',
    subjective: 'Referred by Dr. Ong for cardiac risk assessment. Patient with hypertension on Losartan. Father had MI at age 58. Occasional exertional fatigue. No chest pain, orthopnea, or PND.',
    objective: 'BP 134/84, HR 74, regular. Heart sounds: S1/S2 normal, no S3/S4, no murmurs. JVP not elevated. No peripheral edema. Peripheral pulses 2+ bilaterally.',
    assessment: 'Hypertension with family history of premature CAD. Borderline cardiovascular risk profile. Pending lipid panel results for ASCVD risk calculation.',
    plan: 'Order Cardiac Stress Test for baseline evaluation. Review lipid panel when resulted. If LDL elevated, consider statin therapy. Pelvic ultrasound per Dr. Ong request for wellness. Follow-up in 6 weeks or sooner if stress test abnormal.',
    icdCodes: ['I10', 'Z82.49', 'Z13.6'],
    status: 'Signed',
    aiGenerated: false,
  },
  {
    id: 'note-mc03',
    patientId: 'p-mc1',
    patientName: 'Andrea Reyes',
    appointmentId: 'apt-mc03',
    doctorId: 'staff-mc01',
    date: '2026-02-14',
    subjective: 'Follow-up for lab review. Patient reports compliance with medications. BP home readings averaging 132-140/82-88. Mild fatigue persists. No new symptoms.',
    objective: 'BP 136/84, HR 78. Weight stable at 62kg. Reviewed lab results: CBC normal, FBS 95 mg/dL (normal), HbA1c 5.8% (pre-diabetic borderline), Lipid Panel with borderline high LDL 142 mg/dL, Urinalysis normal. Kidney function and thyroid pending.',
    assessment: 'Hypertension, suboptimally controlled. Pre-diabetes (HbA1c 5.8%). Borderline dyslipidemia (LDL 142). Awaiting remaining lab results.',
    plan: 'Add Amlodipine 5mg daily for better BP control. Lifestyle modification counseling: dietary sodium reduction, DASH diet, 150min/week moderate exercise. Repeat HbA1c in 3 months. Pending: Kidney Function Test, Thyroid Function Test, Fecalysis, Throat Swab, Urine Microalbumin results. Schedule follow-up in 4 weeks.',
    icdCodes: ['I10', 'R73.03', 'E78.5'],
    status: 'Draft',
    aiGenerated: true,
  },
  {
    id: 'note-mc04',
    patientId: 'p-mc2',
    patientName: 'Mark Anthony Lim',
    appointmentId: 'apt-mc04',
    doctorId: 'staff-mc04',
    date: '2026-02-10',
    subjective: 'New patient, initial consultation. 28-year-old male, newly enrolled in Corporate Gold plan. No significant past medical history. No current medications. Non-smoker, occasional alcohol. Works in IT, sedentary lifestyle. No family history of chronic disease.',
    objective: 'BP 118/76, HR 68, RR 14, Temp 36.6°C, SpO2 99%, Weight 72kg, Height 170cm, BMI 24.9. General: Healthy-appearing male. HEENT: Normal. Lungs: Clear. Heart: Regular, no murmurs. Abdomen: Soft, non-tender. Neurologic: Intact.',
    assessment: 'Healthy young adult, initial visit for enrollment. No active medical issues identified.',
    plan: 'Baseline CBC ordered. Routine wellness counseling: regular exercise, balanced diet. Recommend annual check-up. Multivitamins prescribed for general wellness. Return as needed or in 12 months for annual physical.',
    icdCodes: ['Z00.00', 'Z02.89'],
    status: 'Signed',
    aiGenerated: false,
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
  // Juan's Metformin — mapped from patient app medications (m3)
  {
    id: 'rx-010',
    patientId: 'p1',
    patientName: 'Juan Dela Cruz',
    doctorId: 'staff-001',
    doctorName: 'Dr. Ricardo Santos',
    medication: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily with meals',
    duration: '90 days',
    quantity: 180,
    refillsRemaining: 2,
    status: 'Active',
    prescribedDate: '2026-02-01',
    notes: 'For pre-diabetes management. Monitor renal function periodically.',
  },
  // Amoxicillin for Lourdes Bautista — triggers CDSS drug-allergy alert (Penicillin allergy)
  {
    id: 'rx-009',
    patientId: 'p6',
    patientName: 'Lourdes Bautista',
    doctorId: 'staff-001',
    doctorName: 'Dr. Ricardo Santos',
    medication: 'Amoxicillin',
    dosage: '500mg',
    frequency: 'Three times daily',
    duration: '7 days',
    quantity: 21,
    refillsRemaining: 0,
    status: 'Pending Approval',
    prescribedDate: '2026-02-12',
    notes: 'For suspected UTI — pending approval.',
  },
  // --- Maxicare patients ---
  {
    id: 'rx-mc01',
    patientId: 'p-mc1',
    patientName: 'Andrea Reyes',
    doctorId: 'staff-mc01',
    doctorName: 'Dr. Carmela Ong',
    medication: 'Losartan',
    dosage: '50mg',
    frequency: 'Once daily in the morning',
    duration: '90 days',
    quantity: 90,
    refillsRemaining: 2,
    status: 'Active',
    prescribedDate: '2026-01-20',
    notes: 'For essential hypertension. Monitor BP regularly.',
  },
  {
    id: 'rx-mc02',
    patientId: 'p-mc1',
    patientName: 'Andrea Reyes',
    doctorId: 'staff-mc01',
    doctorName: 'Dr. Carmela Ong',
    medication: 'Vitamin D3',
    dosage: '1000IU',
    frequency: 'Once daily after breakfast',
    duration: '90 days',
    quantity: 90,
    refillsRemaining: 1,
    status: 'Active',
    prescribedDate: '2026-01-20',
    notes: 'Vitamin D insufficiency supplementation.',
  },
  {
    id: 'rx-mc03',
    patientId: 'p-mc1',
    patientName: 'Andrea Reyes',
    doctorId: 'staff-mc01',
    doctorName: 'Dr. Carmela Ong',
    medication: 'Amlodipine',
    dosage: '5mg',
    frequency: 'Once daily in the evening',
    duration: '30 days',
    quantity: 30,
    refillsRemaining: 2,
    status: 'Active',
    prescribedDate: '2026-02-14',
    notes: 'Added for suboptimal BP control on Losartan monotherapy.',
  },
  {
    id: 'rx-mc04',
    patientId: 'p-mc2',
    patientName: 'Mark Anthony Lim',
    doctorId: 'staff-mc04',
    doctorName: 'Dr. Jen Diaz',
    medication: 'Multivitamins',
    dosage: '1 tablet',
    frequency: 'Once daily after breakfast',
    duration: '60 days',
    quantity: 60,
    refillsRemaining: 1,
    status: 'Active',
    prescribedDate: '2026-02-10',
    notes: 'General wellness supplementation for new enrollee.',
  },
  {
    id: 'rx-mc05',
    patientId: 'p-mc2',
    patientName: 'Mark Anthony Lim',
    doctorId: 'staff-mc04',
    doctorName: 'Dr. Jen Diaz',
    medication: 'Cetirizine',
    dosage: '10mg',
    frequency: 'Once daily at bedtime',
    duration: '30 days',
    quantity: 30,
    refillsRemaining: 2,
    status: 'Active',
    prescribedDate: '2026-02-03',
    notes: 'For allergic rhinitis symptoms.',
  },
  {
    id: 'rx-mc06',
    patientId: 'p-mc2',
    patientName: 'Mark Anthony Lim',
    doctorId: 'staff-mc04',
    doctorName: 'Dr. Jen Diaz',
    medication: 'Omeprazole',
    dosage: '20mg',
    frequency: 'Once daily before breakfast',
    duration: '14 days',
    quantity: 14,
    refillsRemaining: 0,
    status: 'Active',
    prescribedDate: '2026-02-03',
    notes: 'GERD symptoms — epigastric discomfort. Short-course PPI.',
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
  // --- Juan Dela Cruz additional requests mapped from patient app (dreq-mg2, dreq-mg3) ---
  {
    id: 'lab-012',
    patientId: 'p1',
    patientName: 'Juan Dela Cruz',
    doctorId: 'staff-001',
    doctorName: 'Dr. Ricardo Santos',
    testName: 'HbA1c',
    testType: 'Laboratory',
    priority: 'Routine',
    status: 'Resulted',
    orderedDate: '2026-02-08',
    collectedDate: '2026-02-08',
    resultedDate: '2026-02-10',
    result: '6.1%',
    referenceRange: '<5.7% normal, 5.7-6.4% pre-diabetes, ≥6.5% diabetes',
    isAbnormal: true,
    isCritical: false,
    notes: 'dreq-mg2 — Pre-diabetic range. Metformin started. Repeat in 3 months.',
  },
  {
    id: 'lab-013',
    patientId: 'p1',
    patientName: 'Juan Dela Cruz',
    doctorId: 'staff-001',
    doctorName: 'Dr. Ricardo Santos',
    testName: 'Chest X-Ray',
    testType: 'Imaging',
    priority: 'Routine',
    status: 'Resulted',
    orderedDate: '2026-02-09',
    resultedDate: '2026-02-09',
    result: 'Heart size normal. Lungs clear. No acute cardiopulmonary process.',
    referenceRange: 'Normal chest radiograph',
    isAbnormal: false,
    isCritical: false,
    notes: 'dreq-mg3 — Pre-procedure clearance. Normal findings.',
  },
  // --- Sofia Garcia doctor requests mapped from patient app ---
  {
    id: 'lab-014',
    patientId: 'p2',
    patientName: 'Sofia Garcia',
    doctorId: 'staff-003',
    doctorName: 'Dr. Albert Go',
    testName: 'Maternal Serum AFP/hCG',
    testType: 'Laboratory',
    priority: 'Routine',
    status: 'Ordered',
    orderedDate: '2026-02-12',
    notes: 'Prenatal screening panel. 2nd trimester maternal serum markers.',
  },
  {
    id: 'lab-015',
    patientId: 'p2',
    patientName: 'Sofia Garcia',
    doctorId: 'staff-003',
    doctorName: 'Dr. Albert Go',
    testName: 'Urinalysis with Culture',
    testType: 'Laboratory',
    priority: 'Routine',
    status: 'Ordered',
    orderedDate: '2026-02-12',
    notes: 'Routine prenatal urinalysis with culture and sensitivity.',
  },
  // --- Maxicare patients: Andrea Reyes (12 orders mapped to doctor requests) ---
  {
    id: 'lab-mc01',
    patientId: 'p-mc1',
    patientName: 'Andrea Reyes',
    doctorId: 'staff-mc01',
    doctorName: 'Dr. Carmela Ong',
    testName: 'CBC',
    testType: 'Laboratory',
    priority: 'Routine',
    status: 'Resulted',
    orderedDate: '2026-01-22',
    collectedDate: '2026-01-22',
    resultedDate: '2026-01-24',
    result: 'Hgb 13.1, Hct 39.5%, WBC 6.8, Plt 268, RBC 4.52, MCV 87.4',
    referenceRange: 'Hgb 12-16, Hct 36-46%, WBC 4-11, Plt 150-400',
    isAbnormal: false,
    isCritical: false,
    notes: 'dreq-mc5 — All values within normal limits.',
  },
  {
    id: 'lab-mc02',
    patientId: 'p-mc1',
    patientName: 'Andrea Reyes',
    doctorId: 'staff-mc01',
    doctorName: 'Dr. Carmela Ong',
    testName: 'Lipid Panel',
    testType: 'Laboratory',
    priority: 'Routine',
    status: 'Resulted',
    orderedDate: '2026-01-22',
    collectedDate: '2026-01-22',
    resultedDate: '2026-01-25',
    result: 'TC 218, TG 156, LDL 142, HDL 45, VLDL 31',
    referenceRange: 'TC <200, TG <150, LDL <100 optimal/<130 near optimal, HDL >50 (F)',
    isAbnormal: true,
    isCritical: false,
    notes: 'dreq-mc7 — LDL borderline high. HDL slightly below optimal for female. Lifestyle modification recommended, consider statin if persistent.',
  },
  {
    id: 'lab-mc03',
    patientId: 'p-mc1',
    patientName: 'Andrea Reyes',
    doctorId: 'staff-mc01',
    doctorName: 'Dr. Carmela Ong',
    testName: 'FBS (Fasting Blood Sugar)',
    testType: 'Laboratory',
    priority: 'Routine',
    status: 'Resulted',
    orderedDate: '2026-01-22',
    collectedDate: '2026-01-22',
    resultedDate: '2026-01-24',
    result: '95 mg/dL',
    referenceRange: '70-100 mg/dL (normal), 100-125 mg/dL (pre-diabetes)',
    isAbnormal: false,
    isCritical: false,
    notes: 'dreq-mc6 — Normal fasting glucose.',
  },
  {
    id: 'lab-mc04',
    patientId: 'p-mc1',
    patientName: 'Andrea Reyes',
    doctorId: 'staff-mc01',
    doctorName: 'Dr. Carmela Ong',
    testName: 'HbA1c',
    testType: 'Laboratory',
    priority: 'Routine',
    status: 'Resulted',
    orderedDate: '2026-01-22',
    collectedDate: '2026-01-22',
    resultedDate: '2026-01-26',
    result: '5.8%',
    referenceRange: '<5.7% normal, 5.7-6.4% pre-diabetes, ≥6.5% diabetes',
    isAbnormal: true,
    isCritical: false,
    notes: 'dreq-mc4 — Pre-diabetic borderline. Recommend lifestyle modification and repeat in 3 months.',
  },
  {
    id: 'lab-mc05',
    patientId: 'p-mc1',
    patientName: 'Andrea Reyes',
    doctorId: 'staff-mc01',
    doctorName: 'Dr. Carmela Ong',
    testName: 'Serum Creatinine / Kidney Function Test',
    testType: 'Laboratory',
    priority: 'Routine',
    status: 'Ordered',
    orderedDate: '2026-02-14',
    notes: 'dreq-mc1 — Baseline renal function assessment for hypertensive patient on ARB therapy.',
  },
  {
    id: 'lab-mc06',
    patientId: 'p-mc1',
    patientName: 'Andrea Reyes',
    doctorId: 'staff-mc01',
    doctorName: 'Dr. Carmela Ong',
    testName: 'Thyroid Function Test (TSH, FT4)',
    testType: 'Laboratory',
    priority: 'Routine',
    status: 'In Progress',
    orderedDate: '2026-02-14',
    collectedDate: '2026-02-15',
    notes: 'dreq-mc2 — Evaluate fatigue. Specimen collected, awaiting processing.',
  },
  {
    id: 'lab-mc07',
    patientId: 'p-mc1',
    patientName: 'Andrea Reyes',
    doctorId: 'staff-mc01',
    doctorName: 'Dr. Carmela Ong',
    testName: 'Urinalysis',
    testType: 'Laboratory',
    priority: 'Routine',
    status: 'Resulted',
    orderedDate: '2026-01-22',
    collectedDate: '2026-01-22',
    resultedDate: '2026-01-23',
    result: 'Color: Yellow, Clarity: Clear, pH 6.0, SG 1.020, Protein: Neg, Glucose: Neg, RBC: 0-2/hpf, WBC: 1-3/hpf, Bacteria: None',
    referenceRange: 'pH 5.0-8.0, SG 1.005-1.030, Protein Neg, Glucose Neg',
    isAbnormal: false,
    isCritical: false,
    notes: 'dreq-mc8 — Normal urinalysis. No evidence of proteinuria or UTI.',
  },
  {
    id: 'lab-mc08',
    patientId: 'p-mc1',
    patientName: 'Andrea Reyes',
    doctorId: 'staff-mc01',
    doctorName: 'Dr. Carmela Ong',
    testName: 'Fecalysis',
    testType: 'Laboratory',
    priority: 'Routine',
    status: 'Specimen Collected',
    orderedDate: '2026-02-14',
    collectedDate: '2026-02-15',
    notes: 'dreq-mc9 — Routine stool examination. Specimen submitted, awaiting analysis.',
  },
  {
    id: 'lab-mc09',
    patientId: 'p-mc1',
    patientName: 'Andrea Reyes',
    doctorId: 'staff-mc01',
    doctorName: 'Dr. Carmela Ong',
    testName: 'Throat Swab Culture',
    testType: 'Laboratory',
    priority: 'Routine',
    status: 'Ordered',
    orderedDate: '2026-02-14',
    notes: 'dreq-mc10 — Screening throat culture per wellness panel.',
  },
  {
    id: 'lab-mc10',
    patientId: 'p-mc1',
    patientName: 'Andrea Reyes',
    doctorId: 'staff-mc01',
    doctorName: 'Dr. Carmela Ong',
    testName: 'Urine Microalbumin',
    testType: 'Laboratory',
    priority: 'Routine',
    status: 'Ordered',
    orderedDate: '2026-02-14',
    notes: 'dreq-mc11 — Screen for early diabetic/hypertensive nephropathy given pre-diabetes and HTN.',
  },
  {
    id: 'lab-mc11',
    patientId: 'p-mc1',
    patientName: 'Andrea Reyes',
    doctorId: 'staff-mc02',
    doctorName: 'Dr. Ramon Bautista',
    testName: 'Cardiac Stress Test',
    testType: 'Imaging',
    priority: 'Routine',
    status: 'Ordered',
    orderedDate: '2026-02-03',
    notes: 'dreq-mc12 — Baseline cardiac stress evaluation. Family history of premature CAD. Schedule with Cardiology unit.',
  },
  {
    id: 'lab-mc12',
    patientId: 'p-mc1',
    patientName: 'Andrea Reyes',
    doctorId: 'staff-mc02',
    doctorName: 'Dr. Ramon Bautista',
    testName: 'Pelvic Ultrasound',
    testType: 'Imaging',
    priority: 'Routine',
    status: 'Ordered',
    orderedDate: '2026-02-03',
    notes: 'dreq-mc3 — Annual wellness screening. Per Dr. Ong referral.',
  },
  // --- Maxicare: Mark Anthony Lim ---
  {
    id: 'lab-mc13',
    patientId: 'p-mc2',
    patientName: 'Mark Anthony Lim',
    doctorId: 'staff-mc04',
    doctorName: 'Dr. Jen Diaz',
    testName: 'CBC',
    testType: 'Laboratory',
    priority: 'Routine',
    status: 'Resulted',
    orderedDate: '2026-01-30',
    resultedDate: '2026-02-03',
    notes: 'Hgb 15.1, Hct 45.2%, WBC 6.5, Plt 230 — all normal.',
  },
  // ── Additional Maxicare labs for p-mc2 (Mark Anthony Lim) ──
  {
    id: 'lab-mc14',
    patientId: 'p-mc2',
    patientName: 'Mark Anthony Lim',
    doctorId: 'staff-mc04',
    doctorName: 'Dr. Jen Diaz',
    testName: 'Fasting Blood Sugar',
    testType: 'Laboratory',
    priority: 'Routine',
    status: 'Resulted',
    orderedDate: '2026-01-30',
    resultedDate: '2026-02-03',
    notes: 'Result: 88 mg/dL — normal fasting glucose.',
  },
  {
    id: 'lab-mc15',
    patientId: 'p-mc2',
    patientName: 'Mark Anthony Lim',
    doctorId: 'staff-mc04',
    doctorName: 'Dr. Jen Diaz',
    testName: 'Lipid Profile Panel',
    testType: 'Laboratory',
    priority: 'Routine',
    status: 'Resulted',
    orderedDate: '2026-01-30',
    resultedDate: '2026-02-03',
    isAbnormal: true,
    notes: 'TC 242, TG 180, LDL 162, HDL 38. LDL elevated — lifestyle + statin discussion.',
  },
  {
    id: 'lab-mc16',
    patientId: 'p-mc2',
    patientName: 'Mark Anthony Lim',
    doctorId: 'staff-mc04',
    doctorName: 'Dr. Jen Diaz',
    testName: 'Liver Function Test (ALT/AST)',
    testType: 'Laboratory',
    priority: 'Routine',
    status: 'Resulted',
    orderedDate: '2026-01-30',
    resultedDate: '2026-02-03',
    notes: 'ALT 28, AST 22 — within normal limits.',
  },
  {
    id: 'lab-mc17',
    patientId: 'p-mc2',
    patientName: 'Mark Anthony Lim',
    doctorId: 'staff-mc04',
    doctorName: 'Dr. Jen Diaz',
    testName: 'Chest X-Ray (PA)',
    testType: 'Imaging',
    priority: 'Routine',
    status: 'Resulted',
    orderedDate: '2026-01-30',
    resultedDate: '2026-02-03',
    notes: 'Heart and lungs normal. No acute findings.',
  },
  {
    id: 'lab-mc18',
    patientId: 'p-mc2',
    patientName: 'Mark Anthony Lim',
    doctorId: 'staff-mc01',
    doctorName: 'Dr. Carmela Ong',
    testName: 'HbA1c',
    testType: 'Laboratory',
    priority: 'Routine',
    status: 'Ordered',
    orderedDate: '2026-02-11',
    notes: 'Baseline metabolic screening per Dr. Ong.',
  },
  {
    id: 'lab-mc19',
    patientId: 'p-mc2',
    patientName: 'Mark Anthony Lim',
    doctorId: 'staff-mc04',
    doctorName: 'Dr. Jen Diaz',
    testName: 'Serum Uric Acid',
    testType: 'Laboratory',
    priority: 'Routine',
    status: 'Ordered',
    orderedDate: '2026-02-11',
    notes: 'Patient reports occasional joint pain after meals.',
  },
  {
    id: 'lab-mc20',
    patientId: 'p-mc2',
    patientName: 'Mark Anthony Lim',
    doctorId: 'staff-mc04',
    doctorName: 'Dr. Jen Diaz',
    testName: 'Urinalysis',
    testType: 'Laboratory',
    priority: 'Routine',
    status: 'Ordered',
    orderedDate: '2026-02-11',
    notes: 'Follow-up screening.',
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
// 8a. CONSULTATION ROOMS (for queue display)
// =============================================

export const MOCK_CONSULT_ROOMS: ConsultRoom[] = [
  { id: 'cr-1', name: 'Room 1', doctorName: 'Dr. Ricardo Santos', doctorId: 'staff-001', specialty: 'Cardiology / Internal Medicine', floor: '2F', handlesReturn: true, status: 'Active', tenantId: 'metroGeneral' },
  { id: 'cr-2', name: 'Room 2', doctorName: 'Dr. Maria Clara Reyes', doctorId: 'staff-002', specialty: 'Pediatrics', floor: '2F', handlesReturn: true, status: 'Active', tenantId: 'metroGeneral' },
  { id: 'cr-3', name: 'Room 3', doctorName: 'Dr. Albert Go', doctorId: 'staff-003', specialty: 'OB-GYN / Emergency', floor: '2F', handlesReturn: true, status: 'Active', tenantId: 'metroGeneral' },
  { id: 'cr-4', name: 'Room 4', doctorName: 'Dr. Carmen Diaz', doctorId: 'staff-014', specialty: 'Dermatology', floor: '2F', handlesReturn: false, status: 'On Break', tenantId: 'metroGeneral' },
  // ── Maxicare PCC Consult Rooms ──
  { id: 'cr-mc1', name: 'Room A', doctorName: 'Dr. Carmela Ong', doctorId: 'staff-mc01', specialty: 'Internal Medicine', floor: '1F', handlesReturn: true, status: 'Active', tenantId: 'maxicare' },
  { id: 'cr-mc2', name: 'Room B', doctorName: 'Dr. Jen Diaz', doctorId: 'staff-mc04', specialty: 'Family Medicine', floor: '1F', handlesReturn: true, status: 'Active', tenantId: 'maxicare' },
  { id: 'cr-mc3', name: 'Room C', doctorName: 'Dr. Patricia Santos', doctorId: 'staff-mc03', specialty: 'OB-GYN', floor: '1F', handlesReturn: true, status: 'Active', tenantId: 'maxicare' },
  { id: 'cr-mc4', name: 'Room D', doctorName: 'Dr. Ramon Bautista', doctorId: 'staff-mc02', specialty: 'Cardiology', floor: '1F', handlesReturn: false, status: 'Active', tenantId: 'maxicare' },
];

// =============================================
// 8b. MOCK QUEUE PATIENTS - 12+
// =============================================

const qpBase = (id: string, patientId: string, patientName: string, ticket: string, station: StationType, status: QueuePatient['status'], queuedAt: string, waitMin: number, priority: QueuePatient['priority'], complaint: string, doc?: string, nurse?: string, orders: DoctorOrder[] = [], orderIdx = -1, history?: StationVisit[], consultRoomId?: string, consultRoomName?: string): QueuePatient => ({
  id, patientId, patientName, ticketNumber: ticket, stationType: station, stationName: station, status, queuedAt, waitMinutes: waitMin, priority, chiefComplaint: complaint, assignedDoctor: doc, assignedNurse: nurse,
  journeyHistory: history ?? [{ station, enteredAt: queuedAt }],
  currentStationEnteredAt: queuedAt,
  doctorOrders: orders,
  currentOrderIndex: orderIdx,
  ...(consultRoomId ? { consultRoomId, consultRoomName } : {}),
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
  // Juan: IN_SESSION at Consult Room 1 (Dr. Santos - Cardiology) — doctor is seeing him
  qpBase('qp-001', 'p1', 'Juan Dela Cruz', 'T001', 'Consult', 'IN_SESSION', '2026-02-12T08:30:00', 12, 'Normal', 'Follow-up chest tightness', 'Dr. Ricardo Santos', 'Nurse Elena Torres', [], -1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T08:00:00', exitedAt: '2026-02-12T08:05:00' }, { station: 'Triage', enteredAt: '2026-02-12T08:05:00', exitedAt: '2026-02-12T08:18:00' }, { station: 'Consult', enteredAt: '2026-02-12T08:18:00' }], 'cr-1', 'Room 1'),
  // Diego: QUEUED at Consult Room 1 — waiting for Dr. Santos after Juan
  qpBase('qp-017', 'p12', 'Diego Aquino', 'T017', 'Consult', 'QUEUED', '2026-02-12T09:25:00', 3, 'Normal', 'Palpitations, intermittent', 'Dr. Ricardo Santos', undefined, [], -1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T09:05:00', exitedAt: '2026-02-12T09:10:00' }, { station: 'Triage', enteredAt: '2026-02-12T09:10:00', exitedAt: '2026-02-12T09:20:00' }, { station: 'Consult', enteredAt: '2026-02-12T09:20:00' }], 'cr-1', 'Room 1'),
  // Miguel: IN_SESSION at Consult Room 3 (Dr. Go) — doctor is seeing him
  qpBase('qp-006', 'p7', 'Miguel Torres', 'T006', 'Consult', 'IN_SESSION', '2026-02-12T09:10:00', 2, 'Normal', 'Headache 3 days', 'Dr. Albert Go', undefined, [], -1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T08:55:00', exitedAt: '2026-02-12T09:00:00' }, { station: 'Triage', enteredAt: '2026-02-12T09:00:00', exitedAt: '2026-02-12T09:08:00' }, { station: 'Consult', enteredAt: '2026-02-12T09:08:00' }], 'cr-3', 'Room 3'),
  // Grace: IN_SESSION at Consult Room 2 (Dr. Reyes - Pedia) — child patient
  qpBase('qp-014', 'p9', 'Grace Mendoza', 'T014', 'Consult', 'IN_SESSION', '2026-02-12T08:20:00', 0, 'Normal', 'Child immunization consult', 'Dr. Maria Clara Reyes', 'Nurse Paolo Mendoza', [], -1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T08:00:00', exitedAt: '2026-02-12T08:05:00' }, { station: 'Triage', enteredAt: '2026-02-12T08:05:00', exitedAt: '2026-02-12T08:15:00' }, { station: 'Consult', enteredAt: '2026-02-12T08:15:00' }], 'cr-2', 'Room 2'),
  // Ricardo: QUEUED at Consult Room 2 — next for Dr. Reyes
  qpBase('qp-015', 'p10', 'Ricardo Lim', 'T015', 'Consult', 'QUEUED', '2026-02-12T09:15:00', 5, 'Normal', 'Skin rash - child 5yo', 'Dr. Maria Clara Reyes', undefined, [], -1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T08:50:00', exitedAt: '2026-02-12T08:55:00' }, { station: 'Triage', enteredAt: '2026-02-12T08:55:00', exitedAt: '2026-02-12T09:05:00' }, { station: 'Consult', enteredAt: '2026-02-12T09:05:00' }], 'cr-2', 'Room 2'),

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

  // Maria: ALL orders completed → now at Return-Consult Room 1 (Dr. Santos), waiting for her turn (Juan is in session)
  qpBase('qp-013', 'p8', 'Maria Lim', 'T013', 'Return-Consult', 'QUEUED', '2026-02-12T07:30:00', 8, 'Normal', 'Return consult — reviewing results', 'Dr. Ricardo Santos', undefined,
    [
      { id: 'ord-1301', type: 'Lab-CBC', label: 'Lab CBC', targetStation: 'Lab', status: 'completed', orderedAt: '2026-02-12T08:00:00', completedAt: '2026-02-12T08:30:00' },
      { id: 'ord-1302', type: 'Lab-Chemistry', label: 'Lab Chemistry', targetStation: 'Lab', status: 'completed', orderedAt: '2026-02-12T08:00:00', completedAt: '2026-02-12T08:35:00' },
      { id: 'ord-1303', type: 'X-Ray', label: 'X-Ray', targetStation: 'Imaging', status: 'completed', orderedAt: '2026-02-12T08:00:00', completedAt: '2026-02-12T08:40:00' },
    ], -1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T07:15:00', exitedAt: '2026-02-12T07:20:00' }, { station: 'Triage', enteredAt: '2026-02-12T07:20:00', exitedAt: '2026-02-12T07:30:00' }, { station: 'Consult', enteredAt: '2026-02-12T07:30:00', exitedAt: '2026-02-12T08:00:00' }, { station: 'Lab', enteredAt: '2026-02-12T08:00:00', exitedAt: '2026-02-12T08:35:00' }, { station: 'Imaging', enteredAt: '2026-02-12T08:00:00', exitedAt: '2026-02-12T08:40:00' }, { station: 'Return-Consult', enteredAt: '2026-02-12T08:45:00' }], 'cr-1', 'Room 1'),
  // Elena: Return-Consult Room 3 (Dr. Go), reviewing prenatal results
  qpBase('qp-016', 'p11', 'Elena Villanueva', 'T016', 'Return-Consult', 'QUEUED', '2026-02-12T08:50:00', 6, 'Normal', 'Return — prenatal lab review', 'Dr. Albert Go', undefined,
    [
      { id: 'ord-1601', type: 'Lab-CBC', label: 'Lab CBC', targetStation: 'Lab', status: 'completed', orderedAt: '2026-02-12T08:10:00', completedAt: '2026-02-12T08:35:00' },
      { id: 'ord-1602', type: 'Lab-Urinalysis', label: 'Lab Urinalysis', targetStation: 'Lab', status: 'completed', orderedAt: '2026-02-12T08:10:00', completedAt: '2026-02-12T08:40:00' },
    ], -1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T07:45:00', exitedAt: '2026-02-12T07:50:00' }, { station: 'Triage', enteredAt: '2026-02-12T07:50:00', exitedAt: '2026-02-12T08:00:00' }, { station: 'Consult', enteredAt: '2026-02-12T08:00:00', exitedAt: '2026-02-12T08:10:00' }, { station: 'Lab', enteredAt: '2026-02-12T08:10:00', exitedAt: '2026-02-12T08:40:00' }, { station: 'Return-Consult', enteredAt: '2026-02-12T08:45:00' }], 'cr-3', 'Room 3'),
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

  // ────── MAXICARE PCC QUEUE ──────
  // Andrea: IN_SESSION at Room A (Dr. Ong) — HTN follow-up
  qpBase('qp-mc01', 'p-mc1', 'Andrea Reyes', 'MC-001', 'Consult', 'IN_SESSION', '2026-02-12T09:30:00', 10, 'Normal', 'Hypertension follow-up & lab review', 'Dr. Carmela Ong', undefined, [], -1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T09:15:00', exitedAt: '2026-02-12T09:20:00' }, { station: 'Triage', enteredAt: '2026-02-12T09:20:00', exitedAt: '2026-02-12T09:28:00' }, { station: 'Consult', enteredAt: '2026-02-12T09:28:00' }], 'cr-mc1', 'Room A'),
  // Mark: QUEUED at Room B (Dr. Diaz) — waiting after triage
  qpBase('qp-mc02', 'p-mc2', 'Mark Anthony Lim', 'MC-002', 'Consult', 'QUEUED', '2026-02-12T09:00:00', 15, 'Normal', 'APE follow-up — lipid panel review', 'Dr. Jen Diaz', undefined, [], -1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T08:45:00', exitedAt: '2026-02-12T08:50:00' }, { station: 'Triage', enteredAt: '2026-02-12T08:50:00', exitedAt: '2026-02-12T08:58:00' }, { station: 'Consult', enteredAt: '2026-02-12T08:58:00' }], 'cr-mc2', 'Room B'),
  // Grace Lim: IN_SESSION at Room C (Dr. Santos OB) — prenatal
  qpBase('qp-mc03', 'p-mc3', 'Grace Lim', 'MC-003', 'Consult', 'IN_SESSION', '2026-02-12T10:00:00', 5, 'Normal', 'Prenatal check — 28 weeks', 'Dr. Patricia Santos', undefined, [], -1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T09:45:00', exitedAt: '2026-02-12T09:48:00' }, { station: 'Triage', enteredAt: '2026-02-12T09:48:00', exitedAt: '2026-02-12T09:55:00' }, { station: 'Consult', enteredAt: '2026-02-12T09:55:00' }], 'cr-mc3', 'Room C'),
  // Paolo Reyes: at Triage — Andrea's husband
  qpBase('qp-mc04', 'p-mc4', 'Paolo Reyes', 'MC-004', 'Triage', 'READY', '2026-02-12T10:10:00', 8, 'Normal', 'Annual wellness consultation', undefined, undefined, [], -1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T10:00:00', exitedAt: '2026-02-12T10:05:00' }, { station: 'Triage', enteredAt: '2026-02-12T10:05:00' }]),
  // Carmen Santos: Post-consult Lab — blood work ordered by Dr. Ong
  qpBase('qp-mc05', 'p-mc5', 'Carmen Santos', 'MC-005', 'Lab', 'QUEUED', '2026-02-12T08:30:00', 25, 'Normal', 'Lab work — FBS, HbA1c, Lipid Panel', undefined, undefined,
    [
      { id: 'ord-mc01', type: 'Lab-Chemistry', label: 'Lab Chemistry (FBS, HbA1c, Lipid)', targetStation: 'Lab', status: 'queued', orderedAt: '2026-02-12T09:15:00' },
    ], 0,
    [{ station: 'Check-In', enteredAt: '2026-02-12T08:15:00', exitedAt: '2026-02-12T08:20:00' }, { station: 'Triage', enteredAt: '2026-02-12T08:20:00', exitedAt: '2026-02-12T08:28:00' }, { station: 'Consult', enteredAt: '2026-02-12T08:28:00', exitedAt: '2026-02-12T09:15:00' }, { station: 'Lab', enteredAt: '2026-02-12T09:15:00' }]),
  // Roberto Lim: Return-Consult Room A — labs done, waiting for Dr. Ong review
  qpBase('qp-mc06', 'p-mc6', 'Roberto Lim', 'MC-006', 'Return-Consult', 'QUEUED', '2026-02-12T08:00:00', 12, 'Senior', 'Return consult — reviewing FBS & HbA1c results', 'Dr. Carmela Ong', undefined,
    [
      { id: 'ord-mc02', type: 'Lab-Chemistry', label: 'Lab Chemistry', targetStation: 'Lab', status: 'completed', orderedAt: '2026-02-12T08:30:00', completedAt: '2026-02-12T09:10:00' },
    ], -1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T07:45:00', exitedAt: '2026-02-12T07:50:00' }, { station: 'Triage', enteredAt: '2026-02-12T07:50:00', exitedAt: '2026-02-12T07:58:00' }, { station: 'Consult', enteredAt: '2026-02-12T07:58:00', exitedAt: '2026-02-12T08:30:00' }, { station: 'Lab', enteredAt: '2026-02-12T08:30:00', exitedAt: '2026-02-12T09:10:00' }, { station: 'Return-Consult', enteredAt: '2026-02-12T09:15:00' }], 'cr-mc1', 'Room A'),
  // Elisa Tan: at Pharmacy — meds pickup
  qpBase('qp-mc07', 'p-mc7', 'Elisa Tan', 'MC-007', 'Pharmacy', 'QUEUED', '2026-02-12T09:40:00', 6, 'Normal', 'Medication pickup — Losartan, Amlodipine', undefined, undefined,
    [], -1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T08:00:00', exitedAt: '2026-02-12T08:05:00' }, { station: 'Triage', enteredAt: '2026-02-12T08:05:00', exitedAt: '2026-02-12T08:12:00' }, { station: 'Consult', enteredAt: '2026-02-12T08:12:00', exitedAt: '2026-02-12T08:45:00' }, { station: 'Return-Consult', enteredAt: '2026-02-12T09:00:00', exitedAt: '2026-02-12T09:25:00' }, { station: 'Pharmacy', enteredAt: '2026-02-12T09:25:00' }]),
  // Fernando Reyes: Check-In — just walked in
  qpBase('qp-mc08', 'p-mc12', 'Fernando Reyes', 'MC-008', 'Check-In', 'QUEUED', '2026-02-12T10:20:00', 3, 'Normal', 'Consultation — chronic cough 2 weeks'),
  // Lorna Diaz: Triage — Senior with dizziness
  qpBase('qp-mc09', 'p-mc13', 'Lorna Diaz', 'MC-009', 'Triage', 'IN_SESSION', '2026-02-12T10:05:00', 12, 'Senior', 'Recurring dizziness & vertigo', undefined, undefined, [], -1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T09:55:00', exitedAt: '2026-02-12T10:00:00' }, { station: 'Triage', enteredAt: '2026-02-12T10:00:00' }]),
  // Arturo Villanueva: Consult Room D (Dr. Bautista) — cardiac concern
  qpBase('qp-mc10', 'p-mc14', 'Arturo Villanueva', 'MC-010', 'Consult', 'QUEUED', '2026-02-12T09:50:00', 18, 'Normal', 'Chest pain evaluation — cardiac risk screening', 'Dr. Ramon Bautista', undefined, [], -1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T09:30:00', exitedAt: '2026-02-12T09:35:00' }, { station: 'Triage', enteredAt: '2026-02-12T09:35:00', exitedAt: '2026-02-12T09:45:00' }, { station: 'Consult', enteredAt: '2026-02-12T09:45:00' }], 'cr-mc4', 'Room D'),
  // Cynthia Abad: Imaging — X-ray ordered after consult
  qpBase('qp-mc11', 'p-mc15', 'Cynthia Abad', 'MC-011', 'Imaging', 'IN_SESSION', '2026-02-12T09:20:00', 22, 'Normal', 'Chest X-ray (PA/Lateral)', undefined, undefined,
    [{ id: 'ord-mc11a', type: 'X-Ray', label: 'Chest X-Ray', targetStation: 'Imaging', status: 'in-progress', orderedAt: '2026-02-12T09:10:00' }], 0,
    [{ station: 'Check-In', enteredAt: '2026-02-12T08:30:00', exitedAt: '2026-02-12T08:35:00' }, { station: 'Triage', enteredAt: '2026-02-12T08:35:00', exitedAt: '2026-02-12T08:42:00' }, { station: 'Consult', enteredAt: '2026-02-12T08:42:00', exitedAt: '2026-02-12T09:10:00' }, { station: 'Imaging', enteredAt: '2026-02-12T09:15:00' }]),
  // Eduardo Bautista: Billing — final step before discharge
  qpBase('qp-mc12', 'p-mc16', 'Eduardo Bautista', 'MC-012', 'Billing', 'QUEUED', '2026-02-12T09:55:00', 8, 'Normal', 'Settlement — consultation & labs', undefined, undefined,
    [{ id: 'ord-mc12a', type: 'Lab-CBC', label: 'CBC', targetStation: 'Lab', status: 'completed', orderedAt: '2026-02-12T08:15:00' }, { id: 'ord-mc12b', type: 'Lab-Chemistry', label: 'FBS', targetStation: 'Lab', status: 'completed', orderedAt: '2026-02-12T08:15:00' }], -1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T07:30:00', exitedAt: '2026-02-12T07:35:00' }, { station: 'Triage', enteredAt: '2026-02-12T07:35:00', exitedAt: '2026-02-12T07:43:00' }, { station: 'Consult', enteredAt: '2026-02-12T07:43:00', exitedAt: '2026-02-12T08:15:00' }, { station: 'Lab', enteredAt: '2026-02-12T08:20:00', exitedAt: '2026-02-12T09:00:00' }, { station: 'Return-Consult', enteredAt: '2026-02-12T09:05:00', exitedAt: '2026-02-12T09:30:00' }, { station: 'Pharmacy', enteredAt: '2026-02-12T09:30:00', exitedAt: '2026-02-12T09:45:00' }, { station: 'Billing', enteredAt: '2026-02-12T09:45:00' }]),
  // Maricel Torres: Return-Consult Room B — labs done, returning to Dr. Diaz
  qpBase('qp-mc13', 'p-mc17', 'Maricel Torres', 'MC-013', 'Return-Consult', 'READY', '2026-02-12T09:10:00', 20, 'Normal', 'Return — urinalysis & CBC results review', 'Dr. Jen Diaz', undefined,
    [{ id: 'ord-mc13a', type: 'Lab-CBC', label: 'CBC', targetStation: 'Lab', status: 'completed', orderedAt: '2026-02-12T08:35:00' }, { id: 'ord-mc13b', type: 'Lab-Urinalysis', label: 'Urinalysis', targetStation: 'Lab', status: 'completed', orderedAt: '2026-02-12T08:35:00' }], -1,
    [{ station: 'Check-In', enteredAt: '2026-02-12T07:50:00', exitedAt: '2026-02-12T07:55:00' }, { station: 'Triage', enteredAt: '2026-02-12T07:55:00', exitedAt: '2026-02-12T08:03:00' }, { station: 'Consult', enteredAt: '2026-02-12T08:03:00', exitedAt: '2026-02-12T08:35:00' }, { station: 'Lab', enteredAt: '2026-02-12T08:40:00', exitedAt: '2026-02-12T09:20:00' }, { station: 'Return-Consult', enteredAt: '2026-02-12T09:25:00' }], 'cr-mc2', 'Room B'),
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
  // ── Maxicare Dispensing ──
  { id: 'disp-mc01', prescriptionId: 'rx-mc01', patientName: 'Andrea Reyes', medication: 'Losartan 50mg', quantity: 60, dispensedBy: 'Pharmacist Liza Reyes', dispensedDate: '2026-02-10', status: 'Dispensed' },
  { id: 'disp-mc02', prescriptionId: 'rx-mc02', patientName: 'Andrea Reyes', medication: 'Vitamin D3 1000IU', quantity: 90, dispensedBy: 'Pharmacist Liza Reyes', dispensedDate: '2026-02-10', status: 'Dispensed' },
  { id: 'disp-mc03', prescriptionId: 'rx-mc03', patientName: 'Andrea Reyes', medication: 'Amlodipine 5mg', quantity: 30, dispensedBy: 'Pharmacist Liza Reyes', dispensedDate: '2026-02-10', status: 'Dispensed' },
  { id: 'disp-mc04', prescriptionId: 'rx-mc04', patientName: 'Mark Anthony Lim', medication: 'Multivitamins', quantity: 60, dispensedBy: 'Pharmacist Liza Reyes', dispensedDate: '2026-02-10', status: 'Dispensed' },
  { id: 'disp-mc05', prescriptionId: 'rx-mc05', patientName: 'Mark Anthony Lim', medication: 'Cetirizine 10mg', quantity: 30, dispensedBy: 'Pharmacist Liza Reyes', dispensedDate: '2026-02-03', status: 'Dispensed' },
  { id: 'disp-mc06', prescriptionId: 'rx-mc06', patientName: 'Mark Anthony Lim', medication: 'Omeprazole 20mg', quantity: 14, dispensedBy: 'Pharmacist Liza Reyes', dispensedDate: '2026-02-03', status: 'Dispensed' },
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
  // --- Maxicare patients ---
  { id: 'tri-mc01', patientId: 'p-mc1', patientName: 'Andrea Reyes', nurseId: 'staff-004', date: '2026-01-20', bloodPressure: '138/86', heartRate: 76, temperature: 36.5, respiratoryRate: 16, oxygenSaturation: 98, painScale: 0, chiefComplaint: 'Annual wellness check-up, medication review', priority: 'Non-Urgent', notes: 'Maxicare PRIMA Elite member. Weight: 62kg. On Losartan 50mg and Vitamin D3. Compliant with medications.' },
  { id: 'tri-mc02', patientId: 'p-mc1', patientName: 'Andrea Reyes', nurseId: 'staff-004', date: '2026-02-12', bloodPressure: '132/82', heartRate: 72, temperature: 36.4, respiratoryRate: 16, oxygenSaturation: 99, painScale: 0, chiefComplaint: 'Hypertension follow-up & lab review', priority: 'Non-Urgent', notes: 'BP improving since adding Amlodipine 5mg. Weight: 61kg.' },
  { id: 'tri-mc03', patientId: 'p-mc2', patientName: 'Mark Anthony Lim', nurseId: 'staff-004', date: '2026-02-12', bloodPressure: '126/80', heartRate: 78, temperature: 36.5, respiratoryRate: 18, oxygenSaturation: 99, painScale: 0, chiefComplaint: 'APE follow-up — lipid panel review', priority: 'Non-Urgent', notes: 'Corporate Gold member. Weight: 78kg, BMI 26.1. Elevated LDL on last panel.' },
  { id: 'tri-mc04', patientId: 'p-mc3', patientName: 'Grace Lim', nurseId: 'staff-004', date: '2026-02-12', bloodPressure: '112/72', heartRate: 84, temperature: 36.6, respiratoryRate: 18, oxygenSaturation: 98, painScale: 1, chiefComplaint: 'Prenatal check — 28 weeks', priority: 'Non-Urgent', notes: 'Weight: 65kg, fundal height 27cm. No edema. Fetal heart tones good.' },
  { id: 'tri-mc05', patientId: 'p-mc6', patientName: 'Roberto Lim', nurseId: 'staff-004', date: '2026-02-12', bloodPressure: '148/92', heartRate: 82, temperature: 36.4, respiratoryRate: 16, oxygenSaturation: 97, painScale: 0, chiefComplaint: 'DM/HTN follow-up, lab review', priority: 'Semi-Urgent', notes: 'Senior citizen. BP slightly elevated. On Metformin 500mg BID.' },
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
// ISO date for timestamp strings (e.g. "2026-02-12")
const _pad = (n: number) => String(n).padStart(2, '0');
const _d = new Date();
const todayISO = `${_d.getFullYear()}-${_pad(_d.getMonth() + 1)}-${_pad(_d.getDate())}`;

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
  { id: 'sub-001', templateId: 'form-001', templateName: 'Adult Intake Form', patientId: 'p1', patientName: 'Juan Dela Cruz', submittedDate: todayFormatted, status: 'Pending Review', data: { chiefComplaint: 'Hypertension follow-up', allergies: 'NSAIDs' } },
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
  // --- Maxicare patients ---
  { id: 'imm-mc01', patientId: 'p-mc1', patientName: 'Andrea Reyes', vaccine: 'Influenza Vaccine 2025', dose: 'Dose 1', administeredDate: '2025-10-08', administeredBy: 'Nurse Elena Torres', batchNumber: 'FLU-2025-MC01', site: 'Left Deltoid', status: 'Completed', nextDueDate: '2026-10-08' },
  { id: 'imm-mc02', patientId: 'p-mc1', patientName: 'Andrea Reyes', vaccine: 'Pneumococcal PCV20', dose: 'Dose 1', administeredDate: '2025-08-15', administeredBy: 'Dr. Carmela Ong', batchNumber: 'PCV20-2025-MC01', site: 'Right Deltoid', status: 'Completed', nextDueDate: undefined },
  { id: 'imm-mc03', patientId: 'p-mc2', patientName: 'Mark Anthony Lim', vaccine: 'Influenza Vaccine 2025', dose: 'Dose 1', administeredDate: '2025-12-10', administeredBy: 'Dr. Jen Diaz', batchNumber: 'FLU-2025-MC02', site: 'Left Deltoid', status: 'Completed', nextDueDate: '2026-12-10' },
];

// =============================================
// 17. MOCK MANAGED EVENTS
// =============================================

export const MOCK_MANAGED_EVENTS: ManagedEvent[] = [
  // ── Metro General / Default tenant events (mapped to DEFAULT_COMMUNITY_ITEMS) ──
  {
    id: 'evt-001', title: 'Free Blood Pressure Screening', type: 'Screening',
    date: todayFormatted, time: '09:00 - 12:00', location: 'Main Lobby',
    capacity: 100, registered: 45, status: 'Active',
    description: 'Free BP screening for all patients and walk-ins. No appointment required.',
    branchId: BRANCH_MAIN, tenantId: 'metroGeneral', registerable: true,
  },
  {
    id: 'evt-002', title: 'Flu Vaccine Drive', type: 'Vaccination Drive',
    date: 'Feb 15, 2026', time: '09:00 AM - 04:00 PM', location: 'Main Lobby',
    capacity: 50, registered: 32, status: 'Published',
    description: 'Annual influenza vaccination drive. Open to all members and dependents. Walk-ins welcome while supplies last.',
    branchId: BRANCH_MAIN, tenantId: 'metroGeneral', patientFacingId: '1', registerable: true,
  },
  {
    id: 'evt-003', title: '"I Am Well" Campaign', type: 'Campaign',
    date: 'Ongoing', time: 'Join Anytime', location: 'Community',
    capacity: 0, registered: 128, status: 'Active',
    description: 'Wellness awareness campaign promoting preventive health practices. Members can track steps, share progress, and earn rewards.',
    branchId: BRANCH_MAIN, tenantId: 'metroGeneral', patientFacingId: '2', registerable: false,
  },
  {
    id: 'evt-004', title: 'Yoga for Wellness', type: 'Activity',
    date: 'Every Saturday', time: '06:00 AM - 07:00 AM', location: 'Rooftop Garden',
    capacity: 30, registered: 18, status: 'Active',
    description: 'Weekly yoga sessions for patients and staff. Bring your own mat. Instructor-led, all levels welcome.',
    branchId: BRANCH_MAIN, tenantId: 'metroGeneral', patientFacingId: '3', registerable: true,
  },
  {
    id: 'evt-005', title: 'Mental Health Webinar', type: 'Webinar',
    date: 'Feb 20, 2026', time: '02:00 PM - 03:30 PM', location: 'Online (Zoom)',
    capacity: 200, registered: 89, status: 'Published',
    description: 'Expert-led webinar on managing stress and anxiety. Featuring Dr. Anna Santos, Psychiatry. Free for all members.',
    branchId: BRANCH_MAIN, tenantId: 'metroGeneral', patientFacingId: '4', registerable: true,
  },
  {
    id: 'evt-006', title: 'Blood Donation Drive', type: 'Health Fair',
    date: 'Feb 25, 2026', time: '08:00 AM - 03:00 PM', location: 'Community Hall',
    capacity: 100, registered: 41, status: 'Published',
    description: 'In partnership with Philippine Red Cross. All blood types needed. Free health screening for donors. Light snacks provided.',
    branchId: BRANCH_MAIN, tenantId: 'metroGeneral', patientFacingId: '5', registerable: true,
  },
  {
    id: 'evt-007', title: 'Teleconsult 24/7', type: 'Feature',
    date: 'Available Now', time: 'Anytime', location: 'Online',
    capacity: 0, registered: 0, status: 'Active',
    description: 'Round-the-clock teleconsultation service for members. Connect with licensed physicians from anywhere.',
    branchId: BRANCH_MAIN, tenantId: 'metroGeneral', patientFacingId: 'teleconsult', registerable: false,
  },

  // ── Maxicare tenant events & articles (mapped to MAXICARE_COMMUNITY_ITEMS) ──
  {
    id: 'evt-mc01', title: '24/7 Teleconsult with Video Call', type: 'Feature',
    date: 'Available Now', time: '24/7', location: 'Online',
    capacity: 0, registered: 0, status: 'Active',
    description: 'Maxicare 24/7 teleconsultation with video call capability. Available to all active members via MyMaxicare app.',
    tenantId: 'maxicare', patientFacingId: 'mc-teleconsult', registerable: false,
  },
  {
    id: 'evt-mc02', title: 'How to Say "I Love You" in a Diabetes-Friendly Way', type: 'Article',
    date: 'Feb 1, 2026', time: 'Read Anytime', location: 'Maxicare News & Updates',
    capacity: 0, registered: 0, status: 'Published',
    description: 'Valentine\'s Day feature — diabetes-friendly gift ideas promoting PRIMA for Diabetes healthcare e-voucher (₱2,099). Content sourced from maxicare.com.ph announcements.',
    tenantId: 'maxicare', patientFacingId: 'mc-1', registerable: false,
    sourceUrl: 'https://www.maxicare.com.ph/latest-announcements/',
  },
  {
    id: 'evt-mc03', title: 'Achieve the Freedom to be in Charge with MyMaxicare', type: 'Article',
    date: 'Jan 22, 2026', time: 'Read Anytime', location: 'Maxicare News & Updates',
    capacity: 0, registered: 0, status: 'Published',
    description: 'Article promoting MyMaxicare HMO plan for freelancers, self-employed, and small business owners. Covers plan features and enrollment.',
    tenantId: 'maxicare', patientFacingId: 'mc-2', registerable: false,
    sourceUrl: 'https://www.maxicare.com.ph/latest-announcements/',
  },
  {
    id: 'evt-mc04', title: 'Maxicare Group Maintains Great Place to Work® Certification', type: 'Campaign',
    date: 'Jan 2, 2026', time: 'Announcement', location: 'Maxicare News & Updates',
    capacity: 0, registered: 0, status: 'Published',
    description: 'Corporate announcement — Maxicare Group successfully renews Great Place to Work® certification for consecutive years.',
    tenantId: 'maxicare', patientFacingId: 'mc-3', registerable: false,
    sourceUrl: 'https://www.maxicare.com.ph/latest-announcements/',
  },
  {
    id: 'evt-mc05', title: 'Lock In to Crush 2026!', type: 'Article',
    date: 'Dec 22, 2025', time: 'Read Anytime', location: 'Maxicare News & Updates',
    capacity: 0, registered: 0, status: 'Published',
    description: 'New year goals article promoting PRIMA Screen (₱2,499) preventive health screening and Ease Insurance plans (₱388/year).',
    tenantId: 'maxicare', patientFacingId: 'mc-4', registerable: false,
    sourceUrl: 'https://www.maxicare.com.ph/latest-announcements/',
  },
  {
    id: 'evt-mc06', title: 'Keep Holiday Cheers Healthy with Maxicare PRIMA and LifesavER', type: 'Article',
    date: 'Dec 17, 2025', time: 'Read Anytime', location: 'Maxicare News & Updates',
    capacity: 0, registered: 0, status: 'Published',
    description: 'Holiday health tips promoting PRIMA (₱999/year) prepaid healthcare and LifesavER prepaid emergency cards (₱2,299).',
    tenantId: 'maxicare', patientFacingId: 'mc-5', registerable: false,
    sourceUrl: 'https://www.maxicare.com.ph/latest-announcements/',
  },
  {
    id: 'evt-mc07', title: 'New Year\'s Resolution, what? Life Goals Start Today!', type: 'Article',
    date: 'Dec 10, 2025', time: 'Read Anytime', location: 'Maxicare News & Updates',
    capacity: 0, registered: 0, status: 'Published',
    description: 'Motivational article about starting life goals today, promoting Maxicare Insurance plans starting at ₱388/year.',
    tenantId: 'maxicare', patientFacingId: 'mc-6', registerable: false,
    sourceUrl: 'https://www.maxicare.com.ph/latest-announcements/',
  },
  {
    id: 'evt-mc08', title: 'Maxicare HomeCare', type: 'Feature',
    date: 'Available Now', time: 'Book Anytime', location: 'Your Home',
    capacity: 0, registered: 0, status: 'Active',
    description: 'Laboratory specimen collection at home. Upload doctor referral, select PCC, and nominate preferred dates. Available to all active members.',
    tenantId: 'maxicare', patientFacingId: 'mc-7', registerable: false,
    sourceUrl: 'https://www.maxicare.com.ph/get-care/homecare/',
  },
  {
    id: 'evt-mc09', title: 'Animal Bite Vaccination', type: 'Vaccination Drive',
    date: 'Available Daily', time: '24/7 Hotline', location: 'All Maxicare PCCs',
    capacity: 0, registered: 0, status: 'Active',
    description: 'Animal bite vaccination hotline: (02) 7798-7704. Rabies is 100% preventable with timely vaccination. Walk-in to any Maxicare PCC.',
    tenantId: 'maxicare', patientFacingId: 'mc-8', registerable: false,
  },
  {
    id: 'evt-mc10', title: 'Free Annual Check-up Package', type: 'Screening',
    date: 'Mar 1, 2026', time: '08:00 AM - 05:00 PM', location: 'All Maxicare PCCs',
    capacity: 200, registered: 67, status: 'Published',
    description: 'Complimentary annual wellness screening for PRIMA Elite and Corporate Gold members. Includes CBC, Lipid Panel, FBS, Urinalysis, and basic physical exam.',
    tenantId: 'maxicare', registerable: true,
  },
  {
    id: 'evt-mc11', title: 'Diabetes Prevention Webinar', type: 'Webinar',
    date: 'Feb 28, 2026', time: '02:00 PM - 03:00 PM', location: 'Online (Zoom)',
    capacity: 150, registered: 43, status: 'Published',
    description: 'Expert discussion on pre-diabetes management and lifestyle intervention. Featuring Dr. Carmela Ong, Internal Medicine. Free for all Maxicare members.',
    tenantId: 'maxicare', registerable: true,
  },
];

// =============================================
// 18. MOCK EVENT REGISTRATIONS
// =============================================

export const MOCK_EVENT_REGISTRATIONS: EventRegistration[] = [
  // ── Metro General registrations ──
  { id: 'reg-001', eventId: 'evt-001', eventName: 'Free Blood Pressure Screening', patientId: 'p1', patientName: 'Juan Dela Cruz', registeredDate: todayFormatted, status: 'Registered' },
  { id: 'reg-002', eventId: 'evt-001', eventName: 'Free Blood Pressure Screening', patientId: 'p6', patientName: 'Lourdes Bautista', registeredDate: todayFormatted, status: 'Registered', notes: 'Senior citizen — priority seating' },
  { id: 'reg-003', eventId: 'evt-001', eventName: 'Free Blood Pressure Screening', patientId: 'p3', patientName: 'Carlos Reyes', registeredDate: todayFormatted, status: 'Attended' },
  { id: 'reg-004', eventId: 'evt-002', eventName: 'Flu Vaccine Drive', patientId: 'p1', patientName: 'Juan Dela Cruz', registeredDate: 'Feb 10, 2026', status: 'Registered' },
  { id: 'reg-005', eventId: 'evt-002', eventName: 'Flu Vaccine Drive', patientId: 'p2', patientName: 'Sofia Garcia', registeredDate: 'Feb 10, 2026', status: 'Registered', notes: 'Pregnant — check vaccine eligibility' },
  { id: 'reg-006', eventId: 'evt-002', eventName: 'Flu Vaccine Drive', patientId: 'p5', patientName: 'Anna Santos', registeredDate: 'Feb 11, 2026', status: 'Registered' },
  { id: 'reg-007', eventId: 'evt-004', eventName: 'Yoga for Wellness', patientId: 'p2', patientName: 'Sofia Garcia', registeredDate: 'Feb 8, 2026', status: 'Attended' },
  { id: 'reg-008', eventId: 'evt-004', eventName: 'Yoga for Wellness', patientId: 'p4', patientName: 'Lisa Tan', registeredDate: 'Feb 8, 2026', status: 'Attended' },
  { id: 'reg-009', eventId: 'evt-005', eventName: 'Mental Health Webinar', patientId: 'p1', patientName: 'Juan Dela Cruz', registeredDate: 'Feb 12, 2026', status: 'Registered' },
  { id: 'reg-010', eventId: 'evt-005', eventName: 'Mental Health Webinar', patientId: 'p7', patientName: 'Miguel Torres', registeredDate: 'Feb 13, 2026', status: 'Registered' },
  { id: 'reg-011', eventId: 'evt-006', eventName: 'Blood Donation Drive', patientId: 'p3', patientName: 'Carlos Reyes', registeredDate: 'Feb 11, 2026', status: 'Registered' },
  { id: 'reg-012', eventId: 'evt-006', eventName: 'Blood Donation Drive', patientId: 'p7', patientName: 'Miguel Torres', registeredDate: 'Feb 12, 2026', status: 'Registered' },
  // ── Maxicare registrations ──
  { id: 'reg-mc01', eventId: 'evt-mc10', eventName: 'Free Annual Check-up Package', patientId: 'p-mc1', patientName: 'Andrea Reyes', registeredDate: 'Feb 14, 2026', status: 'Registered', notes: 'PRIMA Elite member — full panel included' },
  { id: 'reg-mc02', eventId: 'evt-mc10', eventName: 'Free Annual Check-up Package', patientId: 'p-mc2', patientName: 'Mark Anthony Lim', registeredDate: 'Feb 14, 2026', status: 'Registered', notes: 'Corporate Gold — new enrollee' },
  { id: 'reg-mc03', eventId: 'evt-mc11', eventName: 'Diabetes Prevention Webinar', patientId: 'p-mc1', patientName: 'Andrea Reyes', registeredDate: 'Feb 15, 2026', status: 'Registered', notes: 'HbA1c 5.8% — pre-diabetic borderline, directly relevant' },
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
  // ── Maxicare PCC Transactions ──
  { id: 'pay-mc01', invoiceId: 'inv-mc01', patientName: 'Andrea Reyes', amount: 800, method: 'GCash', status: 'Completed', transactionDate: todayFormatted, referenceNumber: 'GC-MC-20260212-001', convenienceFee: 15 },
  { id: 'pay-mc02', invoiceId: 'inv-mc02', patientName: 'Andrea Reyes', amount: 1200, method: 'Credit Card', status: 'Completed', transactionDate: 'Feb 10, 2026', referenceNumber: 'CC-MC-20260210-002', convenienceFee: 25 },
  { id: 'pay-mc03', invoiceId: 'inv-mc03', patientName: 'Mark Anthony Lim', amount: 600, method: 'Cash', status: 'Completed', transactionDate: 'Feb 3, 2026', referenceNumber: 'CSH-MC-20260203-003' },
  { id: 'pay-mc04', invoiceId: 'inv-mc04', patientName: 'Mark Anthony Lim', amount: 2800, method: 'Maya', status: 'Completed', transactionDate: 'Feb 3, 2026', referenceNumber: 'MY-MC-20260203-004', convenienceFee: 56 },
  { id: 'pay-mc05', invoiceId: 'inv-mc05', patientName: 'Grace Lim', amount: 650, method: 'GCash', status: 'Pending', transactionDate: todayFormatted, referenceNumber: 'GC-MC-20260212-005', convenienceFee: 12 },
  { id: 'pay-mc06', invoiceId: 'inv-mc06', patientName: 'Roberto Lim', amount: 1500, method: 'Cash', status: 'Completed', transactionDate: 'Feb 11, 2026', referenceNumber: 'CSH-MC-20260211-006' },
  { id: 'pay-mc07', invoiceId: 'inv-mc07', patientName: 'Carmen Santos', amount: 450, method: 'Credit Card', status: 'Pending', transactionDate: todayFormatted, referenceNumber: 'CC-MC-20260212-007', convenienceFee: 8 },
  { id: 'pay-mc08', invoiceId: 'inv-mc08', patientName: 'Elisa Tan', amount: 350, method: 'Cash', status: 'Completed', transactionDate: 'Feb 11, 2026', referenceNumber: 'CSH-MC-20260211-008' },
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
  // ── Lourdes Bautista (p6) — Penicillin + Sulfa allergies ──
  // rx-009 is Amoxicillin 500mg (Pending Approval) for Lourdes — cross-reactive with Penicillin
  { id: 'cdss-001', type: 'drug_allergy', severity: 'contraindicated', title: 'Drug-Allergy Conflict', message: 'Lourdes Bautista has a documented Penicillin allergy. Amoxicillin (rx-009) is a penicillin-class antibiotic and is contraindicated.', recommendation: 'Discontinue Amoxicillin. Consider Azithromycin 500mg TID × 7 days as alternative for UTI.', prescriptionId: 'rx-009', dismissed: false, actioned: false, createdAt: todayFormatted },
  // rx-007 is Amlodipine 10mg (Pending Approval) for Lourdes — high dose for elderly
  { id: 'cdss-003', type: 'dosage_range', severity: 'moderate', title: 'Dosage Review — Elderly Patient', message: 'Amlodipine 10mg may cause symptomatic hypotension in patients over 65. Lourdes Bautista is a senior citizen.', recommendation: 'Consider starting with Amlodipine 5mg and titrating up based on BP response.', prescriptionId: 'rx-007', dismissed: false, actioned: false, createdAt: todayFormatted },
  // ── Roberto Villanueva (p4b) — Metformin drug interaction ──
  // rx-005 is Metformin 850mg (Active) for Roberto
  { id: 'cdss-002', type: 'drug_interaction', severity: 'major', title: 'Drug-Drug Interaction', message: 'Roberto Villanueva is on Metformin 850mg. If contrast imaging is ordered, Metformin must be held to prevent lactic acidosis.', recommendation: 'Hold Metformin 48 hours before and after any contrast imaging procedure.', prescriptionId: 'rx-005', dismissed: true, actioned: false, createdAt: todayFormatted },
  // ── General preventive care ──
  { id: 'cdss-004', type: 'preventive_care', severity: 'info', title: 'Preventive Care Reminder', message: 'Patient is due for annual flu vaccination (last: Feb 2025). COVID-19 booster eligible.', recommendation: 'Offer flu shot and COVID booster at this visit if no contraindications.', dismissed: false, actioned: false, createdAt: todayFormatted },
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

const tomorrowFormatted = new Date(Date.now() + 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const dayAfterFormatted = new Date(Date.now() + 2 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const _t = new Date(Date.now() + 86400000);
const tomorrowISO = `${_t.getFullYear()}-${_pad(_t.getMonth() + 1)}-${_pad(_t.getDate())}`;

export const MOCK_APPOINTMENTS: Appointment[] = [
  // In-person appointments
  { id: 'apt-001', doctor: 'Dr. Ricardo Santos', specialty: 'Internal Medicine', date: todayFormatted, time: '09:00 AM', status: 'Upcoming', type: 'In-Person', location: BRANCH_NAME },
  { id: 'apt-002', doctor: 'Dr. Ricardo Santos', specialty: 'Internal Medicine', date: todayFormatted, time: '09:30 AM', status: 'Upcoming', type: 'In-Person', location: BRANCH_NAME },
  { id: 'apt-003', doctor: 'Dr. Maria Clara Reyes', specialty: 'Pediatrics', date: 'Feb 10, 2026', time: '10:00 AM', status: 'Completed', type: 'In-Person' },

  // Scheduled teleconsult appointments
  { id: 'apt-tc-001', doctor: 'Dr. Ricardo Santos', specialty: 'Internal Medicine', date: todayFormatted, time: '02:00 PM', status: 'Upcoming', type: 'Teleconsult', patientName: 'Elena Villareal', patientId: 'p-tc-10', chiefComplaint: 'Follow-up hypertension management', notes: 'Patient requested teleconsult. Last BP reading 138/86 at home.' },
  { id: 'apt-tc-002', doctor: 'Dr. Ricardo Santos', specialty: 'Internal Medicine', date: todayFormatted, time: '02:30 PM', status: 'Upcoming', type: 'Teleconsult', patientName: 'Roberto Cruz', patientId: 'p-tc-11', chiefComplaint: 'Lab results review — lipid panel', notes: 'Results came in yesterday. Total cholesterol 245. Needs counseling.' },
  { id: 'apt-tc-003', doctor: 'Dr. Ricardo Santos', specialty: 'Internal Medicine', date: todayFormatted, time: '03:15 PM', status: 'Upcoming', type: 'Teleconsult', patientName: 'Sofia Mendoza', patientId: 'p-tc-12', chiefComplaint: 'Post-surgical follow-up — appendectomy', notes: 'Day 7 post-op. Verify wound healing via video. Clear liquids diet compliance.' },
  { id: 'apt-tc-004', doctor: 'Dr. Ricardo Santos', specialty: 'Internal Medicine', date: tomorrowFormatted, time: '10:00 AM', status: 'Upcoming', type: 'Teleconsult', patientName: 'Marco Tan', patientId: 'p-tc-13', chiefComplaint: 'Diabetes management check-in', notes: 'HbA1c follow-up. Home glucose readings trending up.' },
  { id: 'apt-tc-005', doctor: 'Dr. Ricardo Santos', specialty: 'Internal Medicine', date: tomorrowFormatted, time: '11:30 AM', status: 'Upcoming', type: 'Teleconsult', patientName: 'Isabel Garcia', patientId: 'p-tc-14', chiefComplaint: 'Anxiety and sleep issues', notes: 'Referred from GP. First teleconsult visit.' },
  { id: 'apt-tc-006', doctor: 'Dr. Ricardo Santos', specialty: 'Internal Medicine', date: dayAfterFormatted, time: '09:00 AM', status: 'Upcoming', type: 'Teleconsult', patientName: 'Antonio Reyes Jr.', patientId: 'p-tc-15', chiefComplaint: 'Chronic cough — 3-week follow-up', notes: 'Was prescribed antibiotics last visit. Check resolution.' },

  // ── Maxicare PCC Appointments ──
  { id: 'apt-mc01', doctor: 'Dr. Carmela Ong', specialty: 'Internal Medicine', date: todayFormatted, time: '10:00 AM', status: 'Upcoming', type: 'In-Person', location: BRANCH_MC_AYALA_NAME, patientName: 'Andrea Reyes', patientId: 'p-mc1', chiefComplaint: 'Hypertension follow-up & lab review' },
  { id: 'apt-mc02', doctor: 'Dr. Ramon Bautista', specialty: 'Cardiology', date: todayFormatted, time: '02:00 PM', status: 'Upcoming', type: 'Teleconsult', patientName: 'Andrea Reyes', patientId: 'p-mc1', chiefComplaint: 'Cardiac stress test results review' },
  { id: 'apt-mc03', doctor: 'Dr. Jen Diaz', specialty: 'Family Medicine', date: todayFormatted, time: '09:00 AM', status: 'Upcoming', type: 'In-Person', location: BRANCH_MC_BRIDGE_NAME, patientName: 'Mark Anthony Lim', patientId: 'p-mc2', chiefComplaint: 'APE follow-up — lipid panel review' },
  { id: 'apt-mc04', doctor: 'Dr. Carmela Ong', specialty: 'Internal Medicine', date: tomorrowFormatted, time: '10:30 AM', status: 'Upcoming', type: 'Teleconsult', patientName: 'Mark Anthony Lim', patientId: 'p-mc2', chiefComplaint: 'HbA1c baseline review' },
  { id: 'apt-mc05', doctor: 'Dr. Patricia Santos', specialty: 'OB-GYN', date: todayFormatted, time: '11:00 AM', status: 'Upcoming', type: 'In-Person', location: BRANCH_MC_BGC_NAME, patientName: 'Grace Lim', patientId: 'p-mc3', chiefComplaint: 'Prenatal check — 28 weeks' },
  { id: 'apt-mc06', doctor: 'Dr. Carmela Ong', specialty: 'Internal Medicine', date: 'Feb 10, 2026', time: '09:30 AM', status: 'Completed', type: 'In-Person', patientName: 'Andrea Reyes', patientId: 'p-mc1' },
  { id: 'apt-mc07', doctor: 'Dr. Jen Diaz', specialty: 'Family Medicine', date: 'Feb 3, 2026', time: '10:00 AM', status: 'Completed', type: 'In-Person', patientName: 'Mark Anthony Lim', patientId: 'p-mc2' },
];

// =============================================
// Teleconsult Queue Management Mock Data
// =============================================

export const MOCK_TC_DOCTORS: TeleconsultDoctor[] = [
  {
    id: 'tcd-001', staffId: 'staff-001', name: 'Dr. Ricardo Santos', specialty: 'Internal Medicine',
    photoUrl: '', status: 'in-session', currentSessionId: 'tcs-002',
    shiftStart: `${todayISO}T08:00:00`, shiftEnd: `${todayISO}T17:00:00`,
    sessionsCompleted: 5, avgSessionMinutes: 14, scheduledDate: todayFormatted, checkedIn: true,
    currentActivity: 'Teleconsult with Maria Cruz', tenantId: 'metroGeneral',
  },
  {
    id: 'tcd-002', staffId: 'staff-002', name: 'Dr. Ana Reyes', specialty: 'Pediatrics',
    photoUrl: '', status: 'in-session', currentSessionId: 'tcs-010',
    shiftStart: `${todayISO}T08:00:00`, shiftEnd: `${todayISO}T16:00:00`,
    sessionsCompleted: 3, avgSessionMinutes: 12, scheduledDate: todayFormatted, checkedIn: true,
    currentActivity: 'Connecting with Teresa Lim', tenantId: 'metroGeneral',
  },
  {
    id: 'tcd-003', staffId: 'staff-003', name: 'Dr. Jose Manalo', specialty: 'General Practice',
    photoUrl: '', status: 'on-break',
    shiftStart: `${todayISO}T07:00:00`, shiftEnd: `${todayISO}T15:00:00`,
    breakStart: `${todayISO}T12:00:00`, breakEnd: `${todayISO}T12:30:00`,
    sessionsCompleted: 7, avgSessionMinutes: 10, scheduledDate: todayFormatted, checkedIn: true,
    currentActivity: 'Lunch break', tenantId: 'metroGeneral',
  },
  {
    id: 'tcd-004', staffId: 'staff-004', name: 'Dr. Patricia Lim', specialty: 'Dermatology',
    photoUrl: '', status: 'clinic-consult',
    shiftStart: `${todayISO}T09:00:00`, shiftEnd: `${todayISO}T18:00:00`,
    sessionsCompleted: 2, avgSessionMinutes: 18, scheduledDate: todayFormatted, checkedIn: true,
    currentActivity: 'Clinic consult Room 3', tenantId: 'metroGeneral',
  },
  {
    id: 'tcd-005', staffId: 'staff-005', name: 'Dr. Miguel Torres', specialty: 'Cardiology',
    photoUrl: '', status: 'rounds',
    shiftStart: `${todayISO}T08:00:00`, shiftEnd: `${todayISO}T16:00:00`,
    sessionsCompleted: 1, avgSessionMinutes: 20, scheduledDate: todayFormatted, checkedIn: true,
    currentActivity: 'Ward rounds Floor 2', tenantId: 'metroGeneral',
  },
  {
    id: 'tcd-006', staffId: 'staff-006', name: 'Dr. Carmen Bautista', specialty: 'OB-GYN',
    photoUrl: '', status: 'in-session', currentSessionId: 'tcs-106',
    shiftStart: `${todayISO}T09:00:00`, shiftEnd: `${todayISO}T18:00:00`,
    sessionsCompleted: 1, avgSessionMinutes: 15, scheduledDate: todayFormatted, checkedIn: true,
    currentActivity: 'Teleconsult with Cynthia Reyes', tenantId: 'metroGeneral',
  },
  {
    id: 'tcd-007', staffId: 'staff-007', name: 'Dr. Rafael Domingo', specialty: 'Internal Medicine',
    photoUrl: '', status: 'available',
    shiftStart: `${todayISO}T08:00:00`, shiftEnd: `${todayISO}T17:00:00`,
    sessionsCompleted: 4, avgSessionMinutes: 15, scheduledDate: todayFormatted, checkedIn: true,
    tenantId: 'metroGeneral',
  },
  {
    id: 'tcd-008', staffId: 'staff-008', name: 'Dr. Lilia Navarro', specialty: 'Psychiatry',
    photoUrl: '', status: 'offline',
    shiftStart: `${tomorrowISO}T09:00:00`, shiftEnd: `${tomorrowISO}T17:00:00`,
    sessionsCompleted: 0, avgSessionMinutes: 0, scheduledDate: tomorrowFormatted, checkedIn: false,
    tenantId: 'metroGeneral',
  },
  // ── Maxicare PCC Teleconsult Doctors ──
  {
    id: 'tcd-mc01', staffId: 'staff-mc01', name: 'Dr. Carmela Ong', specialty: 'Internal Medicine',
    photoUrl: '', status: 'in-session', currentSessionId: 'tcs-mc02',
    shiftStart: `${todayISO}T08:00:00`, shiftEnd: `${todayISO}T17:00:00`,
    sessionsCompleted: 3, avgSessionMinutes: 16, scheduledDate: todayFormatted, checkedIn: true,
    currentActivity: 'Teleconsult with Andrea Reyes', tenantId: 'maxicare',
  },
  {
    id: 'tcd-mc02', staffId: 'staff-mc02', name: 'Dr. Ramon Bautista', specialty: 'Cardiology',
    photoUrl: '', status: 'available',
    shiftStart: `${todayISO}T09:00:00`, shiftEnd: `${todayISO}T18:00:00`,
    sessionsCompleted: 2, avgSessionMinutes: 18, scheduledDate: todayFormatted, checkedIn: true,
    tenantId: 'maxicare',
  },
  {
    id: 'tcd-mc03', staffId: 'staff-mc04', name: 'Dr. Jen Diaz', specialty: 'Family Medicine',
    photoUrl: '', status: 'available',
    shiftStart: `${todayISO}T07:00:00`, shiftEnd: `${todayISO}T16:00:00`,
    sessionsCompleted: 4, avgSessionMinutes: 12, scheduledDate: todayFormatted, checkedIn: true,
    tenantId: 'maxicare',
  },
  {
    id: 'tcd-mc04', staffId: 'staff-mc03', name: 'Dr. Patricia Santos', specialty: 'OB-GYN',
    photoUrl: '', status: 'clinic-consult',
    shiftStart: `${todayISO}T08:00:00`, shiftEnd: `${todayISO}T17:00:00`,
    sessionsCompleted: 1, avgSessionMinutes: 20, scheduledDate: todayFormatted, checkedIn: true,
    currentActivity: 'In-clinic prenatal consult', tenantId: 'maxicare',
  },
];

export const MOCK_TC_SESSIONS: TeleconsultSession[] = [
  // ── Consult Now (on-demand) ──
  // Intake form is completed BEFORE joining queue.
  // Queue lifecycle: in-queue → doctor-assigned → connecting → in-session → wrap-up → completed
  {
    id: 'tcs-001', patientId: 'p-tc-01', patientName: 'Juan Dela Cruz',
    type: 'now', status: 'in-queue', specialty: 'General Practice',
    chiefComplaint: 'Persistent headache for 3 days',
    queuedAt: `${todayISO}T09:15:00`, waitMinutes: 42,
    priority: 'Normal', intakeCompleted: true, patientOnline: true, connectionQuality: 'good',
  },
  {
    id: 'tcs-002', patientId: 'p-tc-02', patientName: 'Maria Cruz',
    type: 'now', status: 'in-session', specialty: 'Internal Medicine',
    chiefComplaint: 'Chest tightness and shortness of breath',
    assignedDoctorId: 'tcd-001', assignedDoctorName: 'Dr. Ricardo Santos',
    queuedAt: `${todayISO}T09:00:00`, intakeStartedAt: `${todayISO}T09:05:00`,
    sessionStartedAt: `${todayISO}T09:20:00`, waitMinutes: 20,
    priority: 'Urgent', intakeCompleted: true, patientOnline: true, connectionQuality: 'good',
  },
  {
    id: 'tcs-003', patientId: 'p-tc-03', patientName: 'Pedro Alvarez',
    type: 'now', status: 'in-queue', specialty: 'General Practice',
    chiefComplaint: 'Skin rash on both arms — spreading',
    queuedAt: `${todayISO}T09:25:00`, intakeStartedAt: `${todayISO}T09:25:00`,
    waitMinutes: 32, priority: 'Normal', intakeCompleted: true,
    patientOnline: true, connectionQuality: 'fair',
  },
  {
    id: 'tcs-004', patientId: 'p-tc-04', patientName: 'Rosa Mendoza',
    type: 'now', status: 'doctor-assigned', specialty: 'Internal Medicine',
    chiefComplaint: 'Dizziness and nausea since yesterday',
    assignedDoctorId: 'tcd-007', assignedDoctorName: 'Dr. Rafael Domingo',
    queuedAt: `${todayISO}T09:45:00`, intakeStartedAt: `${todayISO}T09:48:00`,
    waitMinutes: 12, priority: 'Normal', intakeCompleted: true,
    patientOnline: true, connectionQuality: 'good',
  },
  {
    id: 'tcs-005', patientId: 'p-tc-05', patientName: 'Carlos Garcia',
    type: 'now', status: 'wrap-up', specialty: 'General Practice',
    chiefComplaint: 'Follow-up — UTI treatment',
    assignedDoctorId: 'tcd-003', assignedDoctorName: 'Dr. Jose Manalo',
    queuedAt: `${todayISO}T08:30:00`, intakeStartedAt: `${todayISO}T08:35:00`,
    sessionStartedAt: `${todayISO}T08:45:00`, sessionEndedAt: `${todayISO}T09:00:00`,
    waitMinutes: 15, priority: 'Follow-Up', intakeCompleted: true, patientOnline: false, connectionQuality: 'good',
  },
  {
    id: 'tcs-006', patientId: 'p-tc-06', patientName: 'Leticia Tan',
    type: 'now', status: 'completed', specialty: 'General Practice',
    chiefComplaint: 'Sore throat and mild fever',
    assignedDoctorId: 'tcd-003', assignedDoctorName: 'Dr. Jose Manalo',
    queuedAt: `${todayISO}T07:45:00`, intakeStartedAt: `${todayISO}T07:50:00`,
    sessionStartedAt: `${todayISO}T08:00:00`, sessionEndedAt: `${todayISO}T08:12:00`,
    waitMinutes: 15, priority: 'Normal', intakeCompleted: true,
    patientOnline: false,
  },
  {
    id: 'tcs-007', patientId: 'p-tc-07', patientName: 'Fernando Villanueva',
    type: 'now', status: 'in-queue', specialty: 'Pediatrics',
    chiefComplaint: 'Child with high fever (39.2°C) and vomiting',
    queuedAt: `${todayISO}T09:40:00`, waitMinutes: 17,
    priority: 'Urgent', intakeCompleted: true, patientOnline: true, connectionQuality: 'good',
  },
  {
    id: 'tcs-008', patientId: 'p-tc-08', patientName: 'Angela Santos',
    type: 'now', status: 'no-show', specialty: 'Dermatology',
    chiefComplaint: 'Acne flare-up consultation',
    queuedAt: `${todayISO}T08:00:00`, waitMinutes: 60,
    priority: 'Normal', intakeCompleted: true, patientOnline: false,
  },
  {
    id: 'tcs-009', patientId: 'p-tc-21', patientName: 'Ramon Diaz',
    type: 'now', status: 'cancelled', specialty: 'General Practice',
    chiefComplaint: 'Mild lower back pain',
    queuedAt: `${todayISO}T09:05:00`, waitMinutes: 0,
    priority: 'Normal', intakeCompleted: true, patientOnline: false,
    notes: 'Patient decided to visit clinic in person instead.',
  },
  {
    id: 'tcs-010', patientId: 'p-tc-22', patientName: 'Teresa Lim',
    type: 'now', status: 'connecting', specialty: 'Internal Medicine',
    chiefComplaint: 'Recurring stomach cramps after meals',
    assignedDoctorId: 'tcd-002', assignedDoctorName: 'Dr. Ana Reyes',
    queuedAt: `${todayISO}T09:50:00`, intakeStartedAt: `${todayISO}T09:52:00`,
    waitMinutes: 8, priority: 'Normal', intakeCompleted: true,
    patientOnline: true, connectionQuality: 'good',
  },

  // ── Consult Later (scheduled) ──
  // Intake form is completed when booking/confirming the schedule.
  // Queue lifecycle: in-queue → doctor-assigned → connecting → in-session → wrap-up → completed
  {
    id: 'tcs-101', patientId: 'p-tc-10', patientName: 'Elena Villareal',
    type: 'later', status: 'in-queue', specialty: 'Internal Medicine',
    chiefComplaint: 'Follow-up hypertension management',
    scheduledTime: `${todayISO}T14:00:00`,
    assignedDoctorId: 'tcd-001', assignedDoctorName: 'Dr. Ricardo Santos',
    queuedAt: `${todayISO}T13:50:00`, waitMinutes: 10,
    priority: 'Follow-Up', intakeCompleted: true, patientOnline: true, connectionQuality: 'good',
  },
  {
    id: 'tcs-102', patientId: 'p-tc-11', patientName: 'Roberto Cruz',
    type: 'later', status: 'in-queue', specialty: 'Internal Medicine',
    chiefComplaint: 'Lab results review — lipid panel',
    scheduledTime: `${todayISO}T14:30:00`,
    assignedDoctorId: 'tcd-001', assignedDoctorName: 'Dr. Ricardo Santos',
    queuedAt: `${todayISO}T14:20:00`, waitMinutes: 10,
    priority: 'Normal', intakeCompleted: true, patientOnline: false,
  },
  {
    id: 'tcs-103', patientId: 'p-tc-12', patientName: 'Sofia Mendoza',
    type: 'later', status: 'doctor-assigned', specialty: 'Internal Medicine',
    chiefComplaint: 'Post-surgical follow-up — appendectomy',
    scheduledTime: `${todayISO}T15:15:00`,
    assignedDoctorId: 'tcd-007', assignedDoctorName: 'Dr. Rafael Domingo',
    queuedAt: `${todayISO}T15:00:00`, waitMinutes: 15,
    priority: 'Follow-Up', intakeCompleted: true, patientOnline: true, connectionQuality: 'good',
  },
  {
    id: 'tcs-104', patientId: 'p-tc-13', patientName: 'Marco Tan',
    type: 'later', status: 'in-queue', specialty: 'Internal Medicine',
    chiefComplaint: 'Diabetes management check-in',
    scheduledTime: `${tomorrowISO}T10:00:00`,
    assignedDoctorId: 'tcd-001', assignedDoctorName: 'Dr. Ricardo Santos',
    queuedAt: `${tomorrowISO}T09:50:00`, waitMinutes: 0,
    priority: 'Follow-Up', intakeCompleted: true, patientOnline: false,
  },
  {
    id: 'tcs-105', patientId: 'p-tc-14', patientName: 'Isabel Garcia',
    type: 'later', status: 'in-queue', specialty: 'Psychiatry',
    chiefComplaint: 'Anxiety and sleep issues',
    scheduledTime: `${tomorrowISO}T11:30:00`,
    assignedDoctorId: 'tcd-008', assignedDoctorName: 'Dr. Lilia Navarro',
    queuedAt: `${tomorrowISO}T11:20:00`, waitMinutes: 0,
    priority: 'Normal', intakeCompleted: true, patientOnline: false,
  },
  {
    id: 'tcs-106', patientId: 'p-tc-09', patientName: 'Cynthia Reyes',
    type: 'later', status: 'in-session', specialty: 'OB-GYN',
    chiefComplaint: 'Prenatal checkup — 2nd trimester',
    scheduledTime: `${todayISO}T10:00:00`,
    assignedDoctorId: 'tcd-006', assignedDoctorName: 'Dr. Carmen Bautista',
    queuedAt: `${todayISO}T09:55:00`, intakeStartedAt: `${todayISO}T09:58:00`,
    sessionStartedAt: `${todayISO}T10:02:00`, waitMinutes: 5,
    priority: 'Normal', intakeCompleted: true, patientOnline: true, connectionQuality: 'good',
  },

  // ── Consult Later — additional states to ensure full coverage ──
  {
    id: 'tcs-107', patientId: 'p-tc-16', patientName: 'Gloria Aquino',
    type: 'later', status: 'in-queue', specialty: 'Cardiology',
    chiefComplaint: 'Palpitations and occasional chest pain',
    scheduledTime: `${todayISO}T11:00:00`,
    assignedDoctorId: 'tcd-005', assignedDoctorName: 'Dr. Miguel Torres',
    queuedAt: `${todayISO}T10:50:00`, intakeStartedAt: `${todayISO}T10:50:00`,
    waitMinutes: 10, priority: 'Urgent', intakeCompleted: true,
    patientOnline: true, connectionQuality: 'good',
  },
  {
    id: 'tcs-108', patientId: 'p-tc-17', patientName: 'Danilo Ferrer',
    type: 'later', status: 'wrap-up', specialty: 'Internal Medicine',
    chiefComplaint: 'Asthma medication review',
    scheduledTime: `${todayISO}T09:00:00`,
    assignedDoctorId: 'tcd-005', assignedDoctorName: 'Dr. Miguel Torres',
    queuedAt: `${todayISO}T08:55:00`, intakeStartedAt: `${todayISO}T08:58:00`,
    sessionStartedAt: `${todayISO}T09:03:00`, sessionEndedAt: `${todayISO}T09:18:00`,
    waitMinutes: 5, priority: 'Follow-Up', intakeCompleted: true,
    patientOnline: false, connectionQuality: 'good',
  },
  {
    id: 'tcs-109', patientId: 'p-tc-18', patientName: 'Beatriz Ramirez',
    type: 'later', status: 'completed', specialty: 'Dermatology',
    chiefComplaint: 'Eczema flare-up — follow-up treatment plan',
    scheduledTime: `${todayISO}T08:30:00`,
    assignedDoctorId: 'tcd-004', assignedDoctorName: 'Dr. Patricia Lim',
    queuedAt: `${todayISO}T08:25:00`, intakeStartedAt: `${todayISO}T08:28:00`,
    sessionStartedAt: `${todayISO}T08:32:00`, sessionEndedAt: `${todayISO}T08:50:00`,
    waitMinutes: 5, priority: 'Normal', intakeCompleted: true,
    patientOnline: false,
  },
  {
    id: 'tcs-110', patientId: 'p-tc-19', patientName: 'Ricardo Aguilar',
    type: 'later', status: 'no-show', specialty: 'Internal Medicine',
    chiefComplaint: 'Blood pressure monitoring — 3-month follow-up',
    scheduledTime: `${todayISO}T10:30:00`,
    assignedDoctorId: 'tcd-001', assignedDoctorName: 'Dr. Ricardo Santos',
    queuedAt: `${todayISO}T10:20:00`, waitMinutes: 30,
    priority: 'Follow-Up', intakeCompleted: true,
    patientOnline: false,
  },
  {
    id: 'tcs-111', patientId: 'p-tc-20', patientName: 'Maricel Ocampo',
    type: 'later', status: 'cancelled', specialty: 'OB-GYN',
    chiefComplaint: 'Postnatal check — 6-week follow-up',
    scheduledTime: `${todayISO}T13:00:00`,
    assignedDoctorId: 'tcd-002', assignedDoctorName: 'Dr. Ana Reyes',
    queuedAt: `${todayISO}T12:50:00`, waitMinutes: 0,
    priority: 'Normal', intakeCompleted: true,
    patientOnline: false,
    notes: 'Patient called to reschedule — child is sick.',
  },
  {
    id: 'tcs-112', patientId: 'p-tc-23', patientName: 'Angelica Ramos',
    type: 'later', status: 'doctor-assigned', specialty: 'Pediatrics',
    chiefComplaint: 'Child immunization schedule review',
    scheduledTime: `${todayISO}T10:30:00`,
    assignedDoctorId: 'tcd-002', assignedDoctorName: 'Dr. Ana Reyes',
    queuedAt: `${todayISO}T10:25:00`, intakeStartedAt: `${todayISO}T10:27:00`,
    waitMinutes: 5, priority: 'Normal', intakeCompleted: true,
    patientOnline: true, connectionQuality: 'good',
  },

  // ── Maxicare PCC Teleconsult Sessions ──
  {
    id: 'tcs-mc01', patientId: 'p-mc8', patientName: 'Riza Mendoza',
    type: 'now', status: 'in-queue', specialty: 'Internal Medicine',
    chiefComplaint: 'Recurring headache and dizziness for 2 days',
    queuedAt: `${todayISO}T09:45:00`, waitMinutes: 18,
    priority: 'Normal', intakeCompleted: true, patientOnline: true, connectionQuality: 'good',
  },
  {
    id: 'tcs-mc02', patientId: 'p-mc1', patientName: 'Andrea Reyes',
    type: 'later', status: 'in-session', specialty: 'Internal Medicine',
    chiefComplaint: 'Cardiac stress test results review',
    scheduledTime: `${todayISO}T14:00:00`,
    assignedDoctorId: 'tcd-mc01', assignedDoctorName: 'Dr. Carmela Ong',
    queuedAt: `${todayISO}T13:50:00`, intakeStartedAt: `${todayISO}T13:55:00`,
    sessionStartedAt: `${todayISO}T14:02:00`, waitMinutes: 10,
    priority: 'Follow-Up', intakeCompleted: true, patientOnline: true, connectionQuality: 'good',
  },
  {
    id: 'tcs-mc03', patientId: 'p-mc2', patientName: 'Mark Anthony Lim',
    type: 'later', status: 'in-queue', specialty: 'Internal Medicine',
    chiefComplaint: 'HbA1c baseline review — elevated LDL follow-up',
    scheduledTime: `${tomorrowISO}T10:30:00`,
    assignedDoctorId: 'tcd-mc01', assignedDoctorName: 'Dr. Carmela Ong',
    queuedAt: `${tomorrowISO}T10:20:00`, waitMinutes: 0,
    priority: 'Normal', intakeCompleted: true, patientOnline: false,
  },
  {
    id: 'tcs-mc04', patientId: 'p-mc9', patientName: 'Dennis Aquino',
    type: 'now', status: 'doctor-assigned', specialty: 'Family Medicine',
    chiefComplaint: 'Mild cough and sore throat — possible URI',
    assignedDoctorId: 'tcd-mc03', assignedDoctorName: 'Dr. Jen Diaz',
    queuedAt: `${todayISO}T10:00:00`, intakeStartedAt: `${todayISO}T10:05:00`,
    waitMinutes: 8, priority: 'Normal', intakeCompleted: true,
    patientOnline: true, connectionQuality: 'fair',
  },
  {
    id: 'tcs-mc05', patientId: 'p-mc10', patientName: 'Josefina Cruz',
    type: 'now', status: 'completed', specialty: 'Internal Medicine',
    chiefComplaint: 'Follow-up — blood pressure medication adjustment',
    assignedDoctorId: 'tcd-mc01', assignedDoctorName: 'Dr. Carmela Ong',
    queuedAt: `${todayISO}T08:00:00`, intakeStartedAt: `${todayISO}T08:05:00`,
    sessionStartedAt: `${todayISO}T08:15:00`, sessionEndedAt: `${todayISO}T08:30:00`,
    waitMinutes: 15, priority: 'Follow-Up', intakeCompleted: true, patientOnline: false,
  },
  {
    id: 'tcs-mc06', patientId: 'p-mc11', patientName: 'Patricia Villanueva',
    type: 'later', status: 'doctor-assigned', specialty: 'OB-GYN',
    chiefComplaint: 'Prenatal teleconsult — 1st trimester concerns',
    scheduledTime: `${todayISO}T15:00:00`,
    assignedDoctorId: 'tcd-mc04', assignedDoctorName: 'Dr. Patricia Santos',
    queuedAt: `${todayISO}T14:50:00`, intakeStartedAt: `${todayISO}T14:52:00`,
    waitMinutes: 8, priority: 'Normal', intakeCompleted: true,
    patientOnline: true, connectionQuality: 'good',
  },
  // ── Additional Maxicare Teleconsult Sessions ──
  {
    id: 'tcs-mc07', patientId: 'p-mc12', patientName: 'Fernando Reyes',
    type: 'now', status: 'in-queue', specialty: 'Family Medicine',
    chiefComplaint: 'Persistent cough for 2 weeks — wants clearance for work',
    queuedAt: `${todayISO}T10:15:00`, waitMinutes: 25,
    priority: 'Normal', intakeCompleted: true, patientOnline: true, connectionQuality: 'good',
  },
  {
    id: 'tcs-mc08', patientId: 'p-mc15', patientName: 'Cynthia Abad',
    type: 'now', status: 'connecting', specialty: 'Internal Medicine',
    chiefComplaint: 'Recurring headaches and elevated blood pressure readings at home',
    assignedDoctorId: 'tcd-mc02', assignedDoctorName: 'Dr. Ramon Bautista',
    queuedAt: `${todayISO}T10:05:00`, intakeStartedAt: `${todayISO}T10:08:00`,
    waitMinutes: 12, priority: 'Urgent', intakeCompleted: true,
    patientOnline: true, connectionQuality: 'good',
  },
  {
    id: 'tcs-mc09', patientId: 'p-mc16', patientName: 'Eduardo Bautista',
    type: 'later', status: 'in-queue', specialty: 'Cardiology',
    chiefComplaint: 'Post-ECG review — palpitations at night',
    scheduledTime: `${todayISO}T14:00:00`,
    queuedAt: `${todayISO}T13:50:00`, waitMinutes: 5,
    priority: 'Follow-Up', intakeCompleted: true, patientOnline: true, connectionQuality: 'fair',
  },
  {
    id: 'tcs-mc10', patientId: 'p-mc17', patientName: 'Maricel Torres',
    type: 'now', status: 'wrap-up', specialty: 'Family Medicine',
    chiefComplaint: 'UTI symptoms — dysuria and frequency',
    assignedDoctorId: 'tcd-mc03', assignedDoctorName: 'Dr. Jen Diaz',
    queuedAt: `${todayISO}T09:30:00`, intakeStartedAt: `${todayISO}T09:32:00`,
    sessionStartedAt: `${todayISO}T09:40:00`, sessionEndedAt: `${todayISO}T09:55:00`,
    waitMinutes: 10, priority: 'Normal', intakeCompleted: true,
    patientOnline: true, connectionQuality: 'good',
  },
];

// =============================================
// Messaging / Conversations Mock Data
// =============================================

const t = (h: number, m: number) => {
  const d = new Date(); d.setHours(h, m, 0, 0);
  return d.toISOString();
};

export const MOCK_CONVERSATIONS: Conversation[] = [
  // ── Direct Messages ──
  {
    id: 'conv-dm-001', type: 'direct', name: 'Dr. Maria Clara Reyes',
    participantIds: ['staff-001', 'staff-002'], participantNames: ['Dr. Ricardo Santos', 'Dr. Maria Clara Reyes'],
    lastMessageText: 'The pedia referral has been sent. Let me know if you need the labs.', lastMessageAt: t(9, 45),
    lastMessageFromId: 'staff-002', lastMessageFromName: 'Dr. Maria Clara Reyes', unreadCount: 1, pinned: true,
  },
  {
    id: 'conv-dm-002', type: 'direct', name: 'Nurse Elena Torres',
    participantIds: ['staff-001', 'staff-004'], participantNames: ['Dr. Ricardo Santos', 'Nurse Elena Torres'],
    lastMessageText: 'Patient in Bed 3 vitals are stable now. Shall I continue q4h monitoring?', lastMessageAt: t(9, 30),
    lastMessageFromId: 'staff-004', lastMessageFromName: 'Nurse Elena Torres', unreadCount: 2,
  },
  {
    id: 'conv-dm-003', type: 'direct', name: 'Dr. Albert Go',
    participantIds: ['staff-001', 'staff-003'], participantNames: ['Dr. Ricardo Santos', 'Dr. Albert Go'],
    lastMessageText: 'Got it, will handle the ER consult. Thanks Doc.', lastMessageAt: t(8, 50),
    lastMessageFromId: 'staff-003', lastMessageFromName: 'Dr. Albert Go', unreadCount: 0,
  },
  {
    id: 'conv-dm-004', type: 'direct', name: 'Roberto Villanueva',
    participantIds: ['staff-001', 'staff-007'], participantNames: ['Dr. Ricardo Santos', 'Roberto Villanueva'],
    lastMessageText: 'Metformin 500mg is back in stock. I reserved 30 tabs for your patient.', lastMessageAt: t(8, 15),
    lastMessageFromId: 'staff-007', lastMessageFromName: 'Roberto Villanueva', unreadCount: 0,
  },
  {
    id: 'conv-dm-005', type: 'direct', name: 'Carmen dela Cruz',
    participantIds: ['staff-001', 'staff-008'], participantNames: ['Dr. Ricardo Santos', 'Carmen dela Cruz'],
    lastMessageText: 'PhilHealth claim for patient Reyes has been filed. Tracking #PH-2026-0412.', lastMessageAt: t(7, 55),
    lastMessageFromId: 'staff-008', lastMessageFromName: 'Carmen dela Cruz', unreadCount: 0,
  },

  // ── Department Channels ──
  {
    id: 'conv-dept-lab', type: 'department', name: 'Laboratory',
    participantIds: ['staff-001', 'staff-002', 'staff-003', 'staff-004', 'staff-006'],
    participantNames: ['Dr. Ricardo Santos', 'Dr. Maria Clara Reyes', 'Dr. Albert Go', 'Nurse Elena Torres', 'Maria Santos'],
    departmentTag: 'Laboratory',
    lastMessageText: 'CBC results for patient Dela Cruz are ready. Hemoglobin slightly low at 11.2.', lastMessageAt: t(9, 55),
    lastMessageFromId: 'staff-006', lastMessageFromName: 'Maria Santos', unreadCount: 3, pinned: true,
  },
  {
    id: 'conv-dept-nursing', type: 'department', name: 'Nursing Station',
    participantIds: ['staff-001', 'staff-002', 'staff-003', 'staff-004', 'staff-005'],
    participantNames: ['Dr. Ricardo Santos', 'Dr. Maria Clara Reyes', 'Dr. Albert Go', 'Nurse Elena Torres', 'Nurse Paolo Mendoza'],
    departmentTag: 'Nursing',
    lastMessageText: 'Shift handover complete. 2 patients need wound dressing change at 2pm.', lastMessageAt: t(9, 10),
    lastMessageFromId: 'staff-005', lastMessageFromName: 'Nurse Paolo Mendoza', unreadCount: 0,
  },
  {
    id: 'conv-dept-pharmacy', type: 'department', name: 'Pharmacy',
    participantIds: ['staff-001', 'staff-002', 'staff-007'],
    participantNames: ['Dr. Ricardo Santos', 'Dr. Maria Clara Reyes', 'Roberto Villanueva'],
    departmentTag: 'Pharmacy',
    lastMessageText: 'Low stock alert: Amoxicillin 500mg capsules — only 45 units left.', lastMessageAt: t(8, 40),
    lastMessageFromId: 'staff-007', lastMessageFromName: 'Roberto Villanueva', unreadCount: 1,
  },
  {
    id: 'conv-dept-er', type: 'department', name: 'Emergency Room',
    participantIds: ['staff-001', 'staff-003', 'staff-005'],
    participantNames: ['Dr. Ricardo Santos', 'Dr. Albert Go', 'Nurse Paolo Mendoza'],
    departmentTag: 'Emergency',
    lastMessageText: 'Incoming trauma case — ETA 10 minutes. MVA, male, mid-30s, conscious.', lastMessageAt: t(10, 5),
    lastMessageFromId: 'staff-003', lastMessageFromName: 'Dr. Albert Go', unreadCount: 2, pinned: true,
  },
  {
    id: 'conv-dept-admin', type: 'department', name: 'Administration',
    participantIds: ['staff-001', 'staff-008', 'staff-009', 'staff-010', 'staff-011'],
    participantNames: ['Dr. Ricardo Santos', 'Carmen dela Cruz', 'Liza Tan', 'Ramon Bautista', 'Ana Lim'],
    departmentTag: 'Admin',
    lastMessageText: 'Monthly compliance reports are due by Friday. Please submit to HR.', lastMessageAt: t(8, 0),
    lastMessageFromId: 'staff-010', lastMessageFromName: 'Ramon Bautista', unreadCount: 0,
  },
  {
    id: 'conv-dept-radiology', type: 'department', name: 'Radiology',
    participantIds: ['staff-001', 'staff-003', 'staff-012'],
    participantNames: ['Dr. Ricardo Santos', 'Dr. Albert Go', 'Miguel Fernandez'],
    departmentTag: 'Radiology',
    lastMessageText: 'Chest X-ray for Garcia ready for reading. Uploaded to PACS.', lastMessageAt: t(9, 20),
    lastMessageFromId: 'staff-012', lastMessageFromName: 'Miguel Fernandez', unreadCount: 1,
  },

  // ── Group chats ──
  {
    id: 'conv-grp-001', type: 'group', name: 'Doctors On-Call',
    participantIds: ['staff-001', 'staff-002', 'staff-003'],
    participantNames: ['Dr. Ricardo Santos', 'Dr. Maria Clara Reyes', 'Dr. Albert Go'],
    lastMessageText: 'I can cover the 6pm-10pm slot tonight if needed.', lastMessageAt: t(10, 10),
    lastMessageFromId: 'staff-003', lastMessageFromName: 'Dr. Albert Go', unreadCount: 1,
  },
  {
    id: 'conv-grp-002', type: 'group', name: 'Patient Care Team - Dela Cruz',
    participantIds: ['staff-001', 'staff-004', 'staff-006', 'staff-007'],
    participantNames: ['Dr. Ricardo Santos', 'Nurse Elena Torres', 'Maria Santos', 'Roberto Villanueva'],
    lastMessageText: 'Pharmacy has dispensed the updated prescription. Nurse please confirm receipt.', lastMessageAt: t(9, 35),
    lastMessageFromId: 'staff-007', lastMessageFromName: 'Roberto Villanueva', unreadCount: 0,
  },
];

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  // ── conv-dm-001: Dr. Santos ↔ Dr. Reyes ──
  { id: 'cm-001', conversationId: 'conv-dm-001', fromId: 'staff-001', fromName: 'Dr. Ricardo Santos', fromRole: 'doctor', text: 'Hi Maria Clara, I have a 7-year-old patient with recurrent febrile seizures. Can I get a pedia consult?', timestamp: t(9, 0), read: true, type: 'text' },
  { id: 'cm-002', conversationId: 'conv-dm-001', fromId: 'staff-002', fromName: 'Dr. Maria Clara Reyes', fromRole: 'doctor', text: 'Sure, send me the chart. Any family history of epilepsy?', timestamp: t(9, 5), read: true, type: 'text' },
  { id: 'cm-003', conversationId: 'conv-dm-001', fromId: 'staff-001', fromName: 'Dr. Ricardo Santos', fromRole: 'doctor', text: 'No family hx. This is the 3rd episode in 6 months. Last EEG was normal. Sending chart now.', timestamp: t(9, 10), read: true, type: 'text' },
  { id: 'cm-004', conversationId: 'conv-dm-001', fromId: 'staff-002', fromName: 'Dr. Maria Clara Reyes', fromRole: 'doctor', text: 'Got it. I\'ll review and get back to you within the hour. Might want to consider a repeat EEG.', timestamp: t(9, 20), read: true, type: 'text' },
  { id: 'cm-005', conversationId: 'conv-dm-001', fromId: 'staff-001', fromName: 'Dr. Ricardo Santos', fromRole: 'doctor', text: 'Agree. Also please check if we need any specific labs before starting prophylaxis.', timestamp: t(9, 30), read: true, type: 'text' },
  { id: 'cm-006', conversationId: 'conv-dm-001', fromId: 'staff-002', fromName: 'Dr. Maria Clara Reyes', fromRole: 'doctor', text: 'The pedia referral has been sent. Let me know if you need the labs.', timestamp: t(9, 45), read: false, type: 'text' },

  // ── conv-dm-002: Dr. Santos ↔ Nurse Torres ──
  { id: 'cm-010', conversationId: 'conv-dm-002', fromId: 'staff-001', fromName: 'Dr. Ricardo Santos', fromRole: 'doctor', text: 'Elena, how is the patient in Bed 3 doing? Last I checked BP was 160/95.', timestamp: t(8, 30), read: true, type: 'text' },
  { id: 'cm-011', conversationId: 'conv-dm-002', fromId: 'staff-004', fromName: 'Nurse Elena Torres', fromRole: 'nurse', text: 'BP has come down to 140/88 after the 2nd dose of Amlodipine. No complaints of headache now.', timestamp: t(8, 45), read: true, type: 'text' },
  { id: 'cm-012', conversationId: 'conv-dm-002', fromId: 'staff-001', fromName: 'Dr. Ricardo Santos', fromRole: 'doctor', text: 'Good. Continue monitoring. Let me know if it goes above 150 systolic again.', timestamp: t(9, 0), read: true, type: 'text' },
  { id: 'cm-013', conversationId: 'conv-dm-002', fromId: 'staff-004', fromName: 'Nurse Elena Torres', fromRole: 'nurse', text: 'Noted, Doc. Will take vitals again at 10am.', timestamp: t(9, 10), read: true, type: 'text' },
  { id: 'cm-014', conversationId: 'conv-dm-002', fromId: 'staff-004', fromName: 'Nurse Elena Torres', fromRole: 'nurse', text: 'Patient in Bed 3 vitals are stable now. Shall I continue q4h monitoring?', timestamp: t(9, 30), read: false, type: 'text' },

  // ── conv-dm-003: Dr. Santos ↔ Dr. Go ──
  { id: 'cm-020', conversationId: 'conv-dm-003', fromId: 'staff-001', fromName: 'Dr. Ricardo Santos', fromRole: 'doctor', text: 'Albert, I have an ER consult request. 45M, chest pain, rule out ACS. Can you take it?', timestamp: t(8, 30), read: true, type: 'text' },
  { id: 'cm-021', conversationId: 'conv-dm-003', fromId: 'staff-003', fromName: 'Dr. Albert Go', fromRole: 'doctor', text: 'Sure, what bed? I\'ll head there now.', timestamp: t(8, 35), read: true, type: 'text' },
  { id: 'cm-022', conversationId: 'conv-dm-003', fromId: 'staff-001', fromName: 'Dr. Ricardo Santos', fromRole: 'doctor', text: 'ER Bed 7. ECG and troponin already ordered. Thanks!', timestamp: t(8, 40), read: true, type: 'text' },
  { id: 'cm-023', conversationId: 'conv-dm-003', fromId: 'staff-003', fromName: 'Dr. Albert Go', fromRole: 'doctor', text: 'Got it, will handle the ER consult. Thanks Doc.', timestamp: t(8, 50), read: true, type: 'text' },

  // ── conv-dept-lab: Laboratory channel ──
  { id: 'cm-030', conversationId: 'conv-dept-lab', fromId: 'staff-001', fromName: 'Dr. Ricardo Santos', fromRole: 'doctor', text: 'Maria, can you rush the CBC for patient Dela Cruz? Bed 5, suspected infection.', timestamp: t(9, 0), read: true, type: 'text' },
  { id: 'cm-031', conversationId: 'conv-dept-lab', fromId: 'staff-006', fromName: 'Maria Santos', fromRole: 'lab_tech', text: 'On it. Sample received. Will have results in 30 minutes.', timestamp: t(9, 10), read: true, type: 'text' },
  { id: 'cm-032', conversationId: 'conv-dept-lab', fromId: 'staff-002', fromName: 'Dr. Maria Clara Reyes', fromRole: 'doctor', text: 'Can I also add a blood culture to that order? Suspecting sepsis.', timestamp: t(9, 15), read: true, type: 'text' },
  { id: 'cm-033', conversationId: 'conv-dept-lab', fromId: 'staff-006', fromName: 'Maria Santos', fromRole: 'lab_tech', text: 'Blood culture added. Will need a new sample though — please have nursing draw it.', timestamp: t(9, 25), read: true, type: 'text' },
  { id: 'cm-034', conversationId: 'conv-dept-lab', fromId: 'staff-004', fromName: 'Nurse Elena Torres', fromRole: 'nurse', text: 'Will draw the blood culture sample now. Sending down in 10 minutes.', timestamp: t(9, 35), read: true, type: 'text' },
  { id: 'cm-035', conversationId: 'conv-dept-lab', fromId: 'staff-006', fromName: 'Maria Santos', fromRole: 'lab_tech', text: 'CBC results for patient Dela Cruz are ready. Hemoglobin slightly low at 11.2.', timestamp: t(9, 55), read: false, type: 'text' },

  // ── conv-dept-er: Emergency Room channel ──
  { id: 'cm-040', conversationId: 'conv-dept-er', fromId: 'staff-005', fromName: 'Nurse Paolo Mendoza', fromRole: 'nurse', text: 'ER is getting full. 8 patients waiting, 3 in treatment. Heads up.', timestamp: t(9, 30), read: true, type: 'text' },
  { id: 'cm-041', conversationId: 'conv-dept-er', fromId: 'staff-003', fromName: 'Dr. Albert Go', fromRole: 'doctor', text: 'Copy. I\'m clearing Bed 2 now — patient being admitted to ward. That should free up a spot.', timestamp: t(9, 40), read: true, type: 'text' },
  { id: 'cm-042', conversationId: 'conv-dept-er', fromId: 'staff-003', fromName: 'Dr. Albert Go', fromRole: 'doctor', text: 'Incoming trauma case — ETA 10 minutes. MVA, male, mid-30s, conscious.', timestamp: t(10, 5), read: false, type: 'urgent' },

  // ── conv-dept-pharmacy: Pharmacy channel ──
  { id: 'cm-050', conversationId: 'conv-dept-pharmacy', fromId: 'staff-007', fromName: 'Roberto Villanueva', fromRole: 'pharmacist', text: 'Low stock alert: Amoxicillin 500mg capsules — only 45 units left.', timestamp: t(8, 40), read: false, type: 'urgent' },

  // ── conv-dept-nursing: Nursing Station channel ──
  { id: 'cm-060', conversationId: 'conv-dept-nursing', fromId: 'staff-004', fromName: 'Nurse Elena Torres', fromRole: 'nurse', text: 'Morning rounds done for Ward A. All patients stable.', timestamp: t(7, 30), read: true, type: 'text' },
  { id: 'cm-061', conversationId: 'conv-dept-nursing', fromId: 'staff-005', fromName: 'Nurse Paolo Mendoza', fromRole: 'nurse', text: 'Shift handover complete. 2 patients need wound dressing change at 2pm.', timestamp: t(9, 10), read: true, type: 'text' },

  // ── conv-grp-001: Doctors On-Call ──
  { id: 'cm-070', conversationId: 'conv-grp-001', fromId: 'staff-001', fromName: 'Dr. Ricardo Santos', fromRole: 'doctor', text: 'Who\'s covering the evening shift today? I have a teleconsult at 6pm.', timestamp: t(9, 50), read: true, type: 'text' },
  { id: 'cm-071', conversationId: 'conv-grp-001', fromId: 'staff-002', fromName: 'Dr. Maria Clara Reyes', fromRole: 'doctor', text: 'I\'m on until 4pm only. Albert?', timestamp: t(10, 0), read: true, type: 'text' },
  { id: 'cm-072', conversationId: 'conv-grp-001', fromId: 'staff-003', fromName: 'Dr. Albert Go', fromRole: 'doctor', text: 'I can cover the 6pm-10pm slot tonight if needed.', timestamp: t(10, 10), read: false, type: 'text' },

  // ── conv-grp-002: Patient Care Team ──
  { id: 'cm-080', conversationId: 'conv-grp-002', fromId: 'staff-001', fromName: 'Dr. Ricardo Santos', fromRole: 'doctor', text: 'Updated prescription for patient Dela Cruz — switching to Augmentin. Please dispense.', timestamp: t(9, 15), read: true, type: 'text' },
  { id: 'cm-081', conversationId: 'conv-grp-002', fromId: 'staff-006', fromName: 'Maria Santos', fromRole: 'lab_tech', text: 'Lab results confirm bacterial infection. Sensitivity shows Augmentin is appropriate.', timestamp: t(9, 20), read: true, type: 'text' },
  { id: 'cm-082', conversationId: 'conv-grp-002', fromId: 'staff-007', fromName: 'Roberto Villanueva', fromRole: 'pharmacist', text: 'Pharmacy has dispensed the updated prescription. Nurse please confirm receipt.', timestamp: t(9, 35), read: true, type: 'text' },

  // ── conv-dept-admin: Administration channel ──
  { id: 'cm-090', conversationId: 'conv-dept-admin', fromId: 'staff-010', fromName: 'Ramon Bautista', fromRole: 'admin', text: 'Monthly compliance reports are due by Friday. Please submit to HR.', timestamp: t(8, 0), read: true, type: 'text' },

  // ── conv-dept-radiology: Radiology channel ──
  { id: 'cm-100', conversationId: 'conv-dept-radiology', fromId: 'staff-001', fromName: 'Dr. Ricardo Santos', fromRole: 'doctor', text: 'Miguel, I ordered a chest X-ray for patient Garcia. Priority please.', timestamp: t(9, 0), read: true, type: 'text' },
  { id: 'cm-101', conversationId: 'conv-dept-radiology', fromId: 'staff-012', fromName: 'Miguel Fernandez', fromRole: 'imaging_tech', text: 'Chest X-ray for Garcia ready for reading. Uploaded to PACS.', timestamp: t(9, 20), read: false, type: 'text' },

  // ── conv-dm-004: Dr. Santos ↔ Pharmacist ──
  { id: 'cm-110', conversationId: 'conv-dm-004', fromId: 'staff-001', fromName: 'Dr. Ricardo Santos', fromRole: 'doctor', text: 'Roberto, is Metformin 500mg available? Need 30 tabs for a discharge patient.', timestamp: t(8, 0), read: true, type: 'text' },
  { id: 'cm-111', conversationId: 'conv-dm-004', fromId: 'staff-007', fromName: 'Roberto Villanueva', fromRole: 'pharmacist', text: 'Metformin 500mg is back in stock. I reserved 30 tabs for your patient.', timestamp: t(8, 15), read: true, type: 'text' },

  // ── conv-dm-005: Dr. Santos ↔ Billing ──
  { id: 'cm-120', conversationId: 'conv-dm-005', fromId: 'staff-001', fromName: 'Dr. Ricardo Santos', fromRole: 'doctor', text: 'Carmen, can you check the PhilHealth claim status for patient Reyes?', timestamp: t(7, 40), read: true, type: 'text' },
  { id: 'cm-121', conversationId: 'conv-dm-005', fromId: 'staff-008', fromName: 'Carmen dela Cruz', fromRole: 'billing_staff', text: 'PhilHealth claim for patient Reyes has been filed. Tracking #PH-2026-0412.', timestamp: t(7, 55), read: true, type: 'text' },
];

// =============================================
// Branch List for Super Admin
// =============================================

export interface ProviderBranch {
  id: string;
  name: string;
  address: string;
}

export const PROVIDER_BRANCHES: ProviderBranch[] = [
  { id: BRANCH_MAIN, name: BRANCH_NAME, address: 'Taft Avenue, Ermita, Manila' },
  { id: BRANCH_NORTH, name: BRANCH_NORTH_NAME, address: 'Mindanao Avenue, Quezon City' },
];

// =============================================
// HomeCare Requests Mock Data
// =============================================

const hcSubDays = (d: number) => {
  const dt = new Date(); dt.setDate(dt.getDate() - d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const hcAddDays = (d: number) => {
  const dt = new Date(); dt.setDate(dt.getDate() + d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const MOCK_HOMECARE_REQUESTS: HomeCareRequest[] = [
  {
    id: 'hcr-001',
    patientName: 'Juan Dela Cruz',
    patientId: 'p1',
    mobile: '0917-555-1001',
    address: 'Unit 1205, One Archers Place, Taft Ave, Ermita, Manila',
    addressType: 'home',
    branchId: BRANCH_MAIN,
    branchName: BRANCH_NAME,
    referralSource: 'network',
    requestTitles: ['Lipid Profile Panel', 'HbA1c (Glycosylated Hemoglobin)'],
    specimenTypes: ['Blood'],
    orderingDoctor: 'Dr. Albert Go',
    preferredDate1: hcAddDays(3),
    preferredTime1: '08:00 AM',
    preferredDate2: hcAddDays(5),
    preferredTime2: '09:00 AM',
    confirmedDate: hcAddDays(3),
    confirmedTime: '08:00 AM',
    status: 'Confirmed',
    assignedCollector: 'Med Tech Rosa Garcia',
    submittedAt: hcSubDays(2),
    updatedAt: hcSubDays(1),
    priority: 'Routine',
  },
  {
    id: 'hcr-002',
    patientName: 'Lourdes Bautista',
    patientId: 'p6',
    mobile: '0917-555-1006',
    address: 'Block 5, Lot 12, BF Homes, Parañaque',
    addressType: 'home',
    branchId: BRANCH_MAIN,
    branchName: BRANCH_NAME,
    referralSource: 'network',
    requestTitles: ['Complete Blood Count (CBC)', 'Fasting Blood Sugar (FBS)'],
    specimenTypes: ['Blood'],
    orderingDoctor: 'Dr. Jen Diaz',
    preferredDate1: hcAddDays(4),
    preferredTime1: '07:30 AM',
    preferredDate2: hcAddDays(6),
    preferredTime2: '08:00 AM',
    status: 'Pending Review',
    submittedAt: hcSubDays(0),
    updatedAt: hcSubDays(0),
    priority: 'Urgent',
    notes: 'Senior citizen — needs early morning schedule. Fasting required.',
  },
  {
    id: 'hcr-003',
    patientName: 'Sofia Garcia',
    patientId: 'p2',
    mobile: '0917-555-1002',
    address: '15F, Greenbelt Residences, Legaspi St, Makati',
    addressType: 'office',
    branchId: BRANCH_MAIN,
    branchName: BRANCH_NAME,
    referralSource: 'network',
    requestTitles: ['Maternal Serum AFP/hCG', 'Urinalysis with Culture'],
    specimenTypes: ['Blood', 'Urine'],
    orderingDoctor: 'Dr. Santos',
    preferredDate1: hcAddDays(2),
    preferredTime1: '10:00 AM',
    preferredDate2: hcAddDays(4),
    preferredTime2: '10:30 AM',
    status: 'Scheduled',
    confirmedDate: hcAddDays(2),
    confirmedTime: '10:00 AM',
    assignedCollector: 'Med Tech Carlo Reyes',
    submittedAt: hcSubDays(3),
    updatedAt: hcSubDays(1),
    priority: 'Routine',
    notes: 'Pregnant patient (24 weeks). Handle with care.',
  },
  {
    id: 'hcr-004',
    patientName: 'Carlos Reyes',
    patientId: 'p3',
    mobile: '0917-555-1003',
    address: '22 Mabini St, Brgy San Antonio, Quezon City',
    addressType: 'home',
    branchId: BRANCH_MAIN,
    branchName: BRANCH_NAME,
    referralSource: 'upload',
    requestTitles: ['Per uploaded referral — Lab tests'],
    specimenTypes: ['Blood'],
    referralFile: 'Dr_Reyes_Referral_2026.pdf',
    preferredDate1: hcAddDays(5),
    preferredTime1: '09:00 AM',
    preferredDate2: hcAddDays(7),
    preferredTime2: '08:30 AM',
    status: 'Clarification Needed',
    submittedAt: hcSubDays(1),
    updatedAt: hcSubDays(0),
    priority: 'Routine',
    notes: 'Uploaded referral is blurry. Need to confirm specific tests. Contacted patient via SMS.',
  },
  {
    id: 'hcr-005',
    patientName: 'Lisa Tan',
    patientId: 'p4',
    mobile: '0917-555-1004',
    address: '3/F Rockwell Business Center, Makati',
    addressType: 'office',
    branchId: BRANCH_MAIN,
    branchName: BRANCH_NAME,
    referralSource: 'network',
    requestTitles: ['Complete Blood Count (CBC)'],
    specimenTypes: ['Blood'],
    orderingDoctor: 'Dr. Ricardo Santos',
    preferredDate1: hcSubDays(3),
    preferredTime1: '08:00 AM',
    preferredDate2: hcSubDays(1),
    preferredTime2: '09:00 AM',
    confirmedDate: hcSubDays(3),
    confirmedTime: '08:00 AM',
    status: 'Completed',
    assignedCollector: 'Med Tech Rosa Garcia',
    submittedAt: hcSubDays(5),
    updatedAt: hcSubDays(3),
    priority: 'Routine',
  },
  {
    id: 'hcr-006',
    patientName: 'Maria Lim',
    patientId: 'p8',
    mobile: '0917-555-1008',
    address: 'Lot 3, Phase 2, Camella Homes, Caloocan',
    addressType: 'home',
    branchId: BRANCH_MAIN,
    branchName: BRANCH_NAME,
    referralSource: 'network',
    requestTitles: ['Kidney Function Test (BUN, Creatinine)'],
    specimenTypes: ['Blood'],
    orderingDoctor: 'Dr. Ricardo Santos',
    preferredDate1: hcAddDays(6),
    preferredTime1: '07:00 AM',
    preferredDate2: hcAddDays(8),
    preferredTime2: '08:00 AM',
    status: 'Pending Review',
    submittedAt: hcSubDays(0),
    updatedAt: hcSubDays(0),
    priority: 'Routine',
  },
  // ── North Branch requests ──
  {
    id: 'hcr-n01',
    patientName: 'Elena Villareal',
    patientId: 'p-tc-10',
    mobile: '0917-555-2001',
    address: '88 Congressional Road, Novaliches, QC',
    addressType: 'home',
    branchId: BRANCH_NORTH,
    branchName: BRANCH_NORTH_NAME,
    referralSource: 'network',
    requestTitles: ['Fasting Blood Sugar (FBS)', 'Lipid Panel'],
    specimenTypes: ['Blood'],
    orderingDoctor: 'Dr. Patricia Lim',
    preferredDate1: hcAddDays(3),
    preferredTime1: '07:00 AM',
    preferredDate2: hcAddDays(5),
    preferredTime2: '08:00 AM',
    status: 'Pending Review',
    submittedAt: hcSubDays(1),
    updatedAt: hcSubDays(1),
    priority: 'Routine',
  },
  {
    id: 'hcr-n02',
    patientName: 'Roberto Cruz',
    patientId: 'p-tc-11',
    mobile: '0917-555-2002',
    address: '14 Regalado Ave, Fairview, QC',
    addressType: 'home',
    branchId: BRANCH_NORTH,
    branchName: BRANCH_NORTH_NAME,
    referralSource: 'upload',
    requestTitles: ['Per uploaded referral — Blood work'],
    specimenTypes: ['Blood'],
    referralFile: 'Cruz_Lab_Request_2026.pdf',
    preferredDate1: hcAddDays(4),
    preferredTime1: '08:00 AM',
    preferredDate2: hcAddDays(6),
    preferredTime2: '09:00 AM',
    status: 'Confirmed',
    confirmedDate: hcAddDays(4),
    confirmedTime: '08:00 AM',
    assignedCollector: 'Med Tech Ana Lopez',
    submittedAt: hcSubDays(2),
    updatedAt: hcSubDays(0),
    priority: 'Routine',
  },
  // ── Maxicare PCC HomeCare Requests ──
  {
    id: 'hcr-mc01',
    patientName: 'Andrea Reyes',
    patientId: 'p-mc1',
    mobile: '0917-555-1234',
    address: '12F Two Serendra, BGC, Taguig',
    addressType: 'home',
    branchId: BRANCH_MC_BGC,
    branchName: BRANCH_MC_BGC_NAME,
    referralSource: 'network',
    requestTitles: ['Kidney Function Test (BUN, Creatinine)', 'Urine Microalbumin (ACR)', 'Fecalysis with Occult Blood'],
    specimenTypes: ['Blood', 'Urine', 'Stool'],
    orderingDoctor: 'Dr. Carmela Ong',
    preferredDate1: hcAddDays(2),
    preferredTime1: '07:30 AM',
    preferredDate2: hcAddDays(4),
    preferredTime2: '08:00 AM',
    status: 'Pending Review',
    submittedAt: hcSubDays(0),
    updatedAt: hcSubDays(0),
    priority: 'Routine',
    notes: 'Patient prefers early morning. Fasting required for kidney function panel.',
  },
  {
    id: 'hcr-mc02',
    patientName: 'Mark Anthony Lim',
    patientId: 'p-mc2',
    mobile: '0918-222-3344',
    address: '15F Eastwood Parkview, Libis, QC',
    addressType: 'home',
    branchId: BRANCH_MC_BRIDGE,
    branchName: BRANCH_MC_BRIDGE_NAME,
    referralSource: 'network',
    requestTitles: ['HbA1c', 'Serum Uric Acid', 'Urinalysis'],
    specimenTypes: ['Blood', 'Urine'],
    orderingDoctor: 'Dr. Jen Diaz',
    preferredDate1: hcAddDays(3),
    preferredTime1: '08:00 AM',
    preferredDate2: hcAddDays(5),
    preferredTime2: '09:00 AM',
    confirmedDate: hcAddDays(3),
    confirmedTime: '08:00 AM',
    status: 'Confirmed',
    assignedCollector: 'Med Tech Liza Reyes',
    submittedAt: hcSubDays(2),
    updatedAt: hcSubDays(1),
    priority: 'Routine',
  },
  {
    id: 'hcr-mc03',
    patientName: 'Roberto Lim',
    patientId: 'p-mc6',
    mobile: '0917-555-6789',
    address: 'Block 3, Lot 5, Vista Verde, Cainta, Rizal',
    addressType: 'home',
    branchId: BRANCH_MC_BRIDGE,
    branchName: BRANCH_MC_BRIDGE_NAME,
    referralSource: 'network',
    requestTitles: ['Complete Blood Count (CBC)', 'Fasting Blood Sugar (FBS)'],
    specimenTypes: ['Blood'],
    orderingDoctor: 'Dr. Carmela Ong',
    preferredDate1: hcSubDays(3),
    preferredTime1: '07:00 AM',
    preferredDate2: hcSubDays(1),
    preferredTime2: '08:00 AM',
    confirmedDate: hcSubDays(3),
    confirmedTime: '07:00 AM',
    status: 'Completed',
    assignedCollector: 'Med Tech Carlo Santos',
    submittedAt: hcSubDays(5),
    updatedAt: hcSubDays(3),
    priority: 'Urgent',
    notes: 'Senior citizen. Fasting required.',
  },
];
