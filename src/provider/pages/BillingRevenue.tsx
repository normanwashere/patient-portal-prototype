import { useState, useMemo } from 'react';
import {
  CreditCard,
  DollarSign,
  FileText,
  TrendingUp,
  Search,
  Wallet,
  Banknote,
  Receipt,
  Shield,
  RefreshCcw,
  Plus,
  CheckCircle2,
  XCircle,
  Upload,
  Send,
  AlertCircle,
  Clock,
  Eye,
  Heart,
  Building2,
  Users,
  Activity,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Pill,
  Printer,
} from 'lucide-react';
import { useProvider } from '../context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { getPatientTenant } from '../data/providerMockData';
import type { PaymentTransaction } from '../types';

/* ─── helpers ─── */
const isToday = (dateStr: string) => {
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return dateStr === today;
};

/* ─── constants ─── */
const FEE_SCHEDULE = [
  // Consultations
  { service: 'Consultation', fee: 500, category: 'Consultation' },
  { service: 'Follow-up Consultation', fee: 350, category: 'Consultation' },
  { service: 'Teleconsultation', fee: 400, category: 'Consultation' },
  // Laboratory
  { service: 'CBC', fee: 350, category: 'Laboratory' },
  { service: 'Lipid Panel', fee: 450, category: 'Laboratory' },
  { service: 'FBS', fee: 180, category: 'Laboratory' },
  { service: 'HbA1c', fee: 400, category: 'Laboratory' },
  { service: 'Urinalysis', fee: 200, category: 'Laboratory' },
  { service: 'Fecalysis', fee: 150, category: 'Laboratory' },
  { service: 'Creatinine', fee: 250, category: 'Laboratory' },
  { service: 'Thyroid Function', fee: 850, category: 'Laboratory' },
  { service: 'Throat Swab', fee: 320, category: 'Laboratory' },
  { service: 'Urine Microalbumin', fee: 380, category: 'Laboratory' },
  // Imaging / Cardio
  { service: 'X-Ray', fee: 800, category: 'Imaging' },
  { service: 'Chest X-Ray', fee: 800, category: 'Imaging' },
  { service: 'Ultrasound', fee: 1200, category: 'Imaging' },
  { service: 'Pelvic Ultrasound', fee: 1400, category: 'Imaging' },
  { service: 'ECG', fee: 250, category: 'Imaging' },
  { service: '2D Echo', fee: 1500, category: 'Imaging' },
  { service: 'Cardiac Stress Test', fee: 3000, category: 'Imaging' },
  { service: 'CT Scan', fee: 3500, category: 'Imaging' },
  { service: 'MRI', fee: 8000, category: 'Imaging' },
  // Procedures
  { service: 'Wound Care / Suturing', fee: 1200, category: 'Procedure' },
  { service: 'IV Insertion', fee: 350, category: 'Procedure' },
  { service: 'Nebulization', fee: 250, category: 'Procedure' },
];

const INITIAL_CLAIMS = [
  { id: 'CLM-001', patient: 'Juan Dela Cruz', amount: 850, status: 'Submitted' as const, date: 'Feb 10, 2026' },
  { id: 'CLM-002', patient: 'Sofia Garcia', amount: 2100, status: 'Under Review' as const, date: 'Feb 9, 2026' },
  { id: 'CLM-003', patient: 'Carlos Reyes', amount: 680, status: 'Approved' as const, date: 'Feb 8, 2026' },
  { id: 'CLM-004', patient: 'Lourdes Bautista', amount: 450, status: 'Denied' as const, date: 'Feb 7, 2026' },
  { id: 'CLM-005', patient: 'Anna Santos', amount: 1200, status: 'Under Review' as const, date: 'Feb 11, 2026' },
];

const PAYMENT_METHODS: PaymentTransaction['method'][] = ['Cash', 'GCash', 'Maya', 'Credit Card', 'Debit Card', 'Insurance'];

/* ─── PhilHealth eClaims mock data ─── */
/* eClaims = hospital/institutional electronic claims for INPATIENT confinements,
   surgeries, emergency care (OECB). Uses CF1–CF4 forms, case-rate reimbursement,
   XML batch submission via Transmittal Control Numbers. */
type EClaimStatus = 'Draft' | 'Submitted' | 'In Process' | 'Return' | 'Approved' | 'Denied' | 'Paid';
type EClaimType = 'Inpatient' | 'Outpatient Emergency' | 'Outpatient Primary Care' | 'Z-Package' | 'Maternity' | 'Hemodialysis';

interface EClaimRecord {
  id: string;
  claimSeriesNo: string;
  claimType: EClaimType;
  pin: string;
  patientName: string;
  admissionDate: string;
  dischargeDate: string;
  icdCode: string;
  diagnosis: string;
  caseRateCode: string;
  caseRateDesc: string;
  totalAmountClaimed: number;
  totalAmountApproved: number;
  facilityShare: number;
  professionalFee: number;
  status: EClaimStatus;
  transmittalNo: string;
  dateSubmitted: string;
  claimForms: string[];
  remarks: string;
}

const INITIAL_ECLAIMS: EClaimRecord[] = [
  { id: 'EC-001', claimSeriesNo: 'CS-2026-0001', claimType: 'Inpatient', pin: '01-234567890-1', patientName: 'Juan Dela Cruz', admissionDate: 'Feb 8, 2026', dischargeDate: 'Feb 10, 2026', icdCode: 'J18.9', diagnosis: 'Pneumonia, unspecified organism', caseRateCode: 'CC-PNEU-M', caseRateDesc: 'Pneumonia Moderate Risk', totalAmountClaimed: 32000, totalAmountApproved: 32000, facilityShare: 19200, professionalFee: 12800, status: 'Approved', transmittalNo: 'TN-2026-0012', dateSubmitted: 'Feb 10, 2026', claimForms: ['CF1', 'CF2', 'CF4'], remarks: '' },
  { id: 'EC-002', claimSeriesNo: 'CS-2026-0002', claimType: 'Inpatient', pin: '01-345678901-2', patientName: 'Sofia Garcia', admissionDate: 'Feb 9, 2026', dischargeDate: 'Feb 11, 2026', icdCode: 'K35.80', diagnosis: 'Acute appendicitis, unspecified', caseRateCode: 'CC-APPY-S', caseRateDesc: 'Appendectomy (Surgical)', totalAmountClaimed: 24000, totalAmountApproved: 0, facilityShare: 14400, professionalFee: 9600, status: 'Submitted', transmittalNo: 'TN-2026-0013', dateSubmitted: 'Feb 11, 2026', claimForms: ['CF1', 'CF2', 'CF3', 'CF4'], remarks: '' },
  { id: 'EC-003', claimSeriesNo: 'CS-2026-0003', claimType: 'Inpatient', pin: '01-456789012-3', patientName: 'Carlos Reyes', admissionDate: 'Feb 5, 2026', dischargeDate: 'Feb 7, 2026', icdCode: 'I50.9', diagnosis: 'Heart failure, unspecified', caseRateCode: 'CC-CHF', caseRateDesc: 'Congestive Heart Failure', totalAmountClaimed: 17000, totalAmountApproved: 17000, facilityShare: 10200, professionalFee: 6800, status: 'Paid', transmittalNo: 'TN-2026-0010', dateSubmitted: 'Feb 7, 2026', claimForms: ['CF1', 'CF2', 'CF4'], remarks: '' },
  { id: 'EC-004', claimSeriesNo: 'CS-2026-0004', claimType: 'Inpatient', pin: '01-567890123-4', patientName: 'Lourdes Bautista', admissionDate: 'Feb 10, 2026', dischargeDate: 'Feb 12, 2026', icdCode: 'A09', diagnosis: 'Infectious gastroenteritis and colitis', caseRateCode: 'CC-AGE-M', caseRateDesc: 'Acute Gastroenteritis Moderate', totalAmountClaimed: 9000, totalAmountApproved: 0, facilityShare: 5400, professionalFee: 3600, status: 'In Process', transmittalNo: 'TN-2026-0014', dateSubmitted: 'Feb 12, 2026', claimForms: ['CF1', 'CF2', 'CF4'], remarks: '' },
  { id: 'EC-005', claimSeriesNo: 'CS-2026-0005', claimType: 'Maternity', pin: '01-678901234-5', patientName: 'Anna Santos', admissionDate: 'Feb 6, 2026', dischargeDate: 'Feb 8, 2026', icdCode: 'O80', diagnosis: 'Encounter for full-term uncomplicated delivery', caseRateCode: 'CC-NSD', caseRateDesc: 'Normal Spontaneous Delivery', totalAmountClaimed: 6500, totalAmountApproved: 0, facilityShare: 3900, professionalFee: 2600, status: 'Return', transmittalNo: 'TN-2026-0011', dateSubmitted: 'Feb 7, 2026', claimForms: ['CF1', 'CF2'], remarks: 'Incomplete supporting documents — please resubmit CF2 with attending physician signature and updated CF4.' },
  { id: 'EC-006', claimSeriesNo: 'CS-2026-0006', claimType: 'Hemodialysis', pin: '01-789012345-6', patientName: 'Roberto Tan', admissionDate: 'Feb 11, 2026', dischargeDate: 'Feb 11, 2026', icdCode: 'N18.5', diagnosis: 'Chronic kidney disease, stage 5 (ESRD)', caseRateCode: 'CC-HD-OPD', caseRateDesc: 'Hemodialysis — OPD (per session)', totalAmountClaimed: 4000, totalAmountApproved: 0, facilityShare: 2700, professionalFee: 1300, status: 'Draft', transmittalNo: '', dateSubmitted: '', claimForms: ['CF1', 'CF2'], remarks: '' },
  { id: 'EC-007', claimSeriesNo: 'CS-2026-0007', claimType: 'Outpatient Emergency', pin: '01-890123456-7', patientName: 'Maria Lim', admissionDate: 'Feb 3, 2026', dischargeDate: 'Feb 3, 2026', icdCode: 'J45.41', diagnosis: 'Moderate persistent asthma with acute exacerbation', caseRateCode: 'CC-OECB-ASTH', caseRateDesc: 'OECB — Asthma Exacerbation', totalAmountClaimed: 8000, totalAmountApproved: 8000, facilityShare: 4800, professionalFee: 3200, status: 'Approved', transmittalNo: 'TN-2026-0009', dateSubmitted: 'Feb 4, 2026', claimForms: ['CF1', 'CF2', 'CF4'], remarks: '' },
  { id: 'EC-008', claimSeriesNo: 'CS-2026-0008', claimType: 'Inpatient', pin: '01-901234567-8', patientName: 'Eduardo Villanueva', admissionDate: 'Feb 1, 2026', dischargeDate: 'Feb 4, 2026', icdCode: 'I21.0', diagnosis: 'Acute transmural MI of anterior wall', caseRateCode: 'CC-AMI', caseRateDesc: 'Acute Myocardial Infarction', totalAmountClaimed: 143000, totalAmountApproved: 143000, facilityShare: 85800, professionalFee: 57200, status: 'Paid', transmittalNo: 'TN-2026-0008', dateSubmitted: 'Feb 4, 2026', claimForms: ['CF1', 'CF2', 'CF3', 'CF4'], remarks: '' },
  { id: 'EC-009', claimSeriesNo: 'CS-2026-0009', claimType: 'Z-Package', pin: '01-012345678-9', patientName: 'Grace Mendoza', admissionDate: 'Jan 20, 2026', dischargeDate: 'Jan 30, 2026', icdCode: 'C50.9', diagnosis: 'Malignant neoplasm of breast, unspecified', caseRateCode: 'Z-BRCA-CHEMO', caseRateDesc: 'Z-Package — Breast Cancer Chemotherapy Cycle 1', totalAmountClaimed: 100000, totalAmountApproved: 100000, facilityShare: 60000, professionalFee: 40000, status: 'Approved', transmittalNo: 'TN-2026-0007', dateSubmitted: 'Jan 31, 2026', claimForms: ['CF1', 'CF2', 'CF3', 'CF4'], remarks: '' },
  { id: 'EC-010', claimSeriesNo: 'CS-2026-0010', claimType: 'Outpatient Emergency', pin: '01-123456789-0', patientName: 'Ricardo Cruz', admissionDate: 'Feb 12, 2026', dischargeDate: 'Feb 12, 2026', icdCode: 'T14.1', diagnosis: 'Open wound, unspecified body region', caseRateCode: 'CC-OECB-WOUND', caseRateDesc: 'OECB — Wound Care/Suturing', totalAmountClaimed: 5500, totalAmountApproved: 0, facilityShare: 3300, professionalFee: 2200, status: 'Submitted', transmittalNo: 'TN-2026-0015', dateSubmitted: 'Feb 12, 2026', claimForms: ['CF1', 'CF2'], remarks: '' },
  // ── Maxicare PCC eClaims ──
  { id: 'EC-MC01', claimSeriesNo: 'CS-MC-2026-0001', claimType: 'Outpatient Primary Care', pin: '44-556677889-0', patientName: 'Andrea Reyes', admissionDate: 'Feb 10, 2026', dischargeDate: 'Feb 10, 2026', icdCode: 'I10', diagnosis: 'Essential (primary) hypertension', caseRateCode: 'CC-YK-FU', caseRateDesc: 'Yakap Follow-up Consultation', totalAmountClaimed: 2500, totalAmountApproved: 2500, facilityShare: 1500, professionalFee: 1000, status: 'Approved', transmittalNo: 'TN-MC-2026-0001', dateSubmitted: 'Feb 10, 2026', claimForms: ['CF1', 'CF2'], remarks: '' },
  { id: 'EC-MC02', claimSeriesNo: 'CS-MC-2026-0002', claimType: 'Outpatient Primary Care', pin: '55-667788990-1', patientName: 'Mark Anthony Lim', admissionDate: 'Feb 3, 2026', dischargeDate: 'Feb 3, 2026', icdCode: 'E78.5', diagnosis: 'Dyslipidemia, unspecified', caseRateCode: 'CC-YK-FPE', caseRateDesc: 'Yakap First Patient Encounter', totalAmountClaimed: 3200, totalAmountApproved: 3200, facilityShare: 1920, professionalFee: 1280, status: 'Approved', transmittalNo: 'TN-MC-2026-0002', dateSubmitted: 'Feb 3, 2026', claimForms: ['CF1', 'CF2'], remarks: 'FPE with complete APE labs.' },
  { id: 'EC-MC03', claimSeriesNo: 'CS-MC-2026-0003', claimType: 'Outpatient Primary Care', pin: '44-112233445-6', patientName: 'Roberto Lim', admissionDate: 'Feb 5, 2026', dischargeDate: 'Feb 5, 2026', icdCode: 'E11.9', diagnosis: 'Type 2 diabetes mellitus without complications', caseRateCode: 'CC-YK-FU', caseRateDesc: 'Yakap Follow-up Consultation', totalAmountClaimed: 2500, totalAmountApproved: 0, facilityShare: 1500, professionalFee: 1000, status: 'Submitted', transmittalNo: 'TN-MC-2026-0003', dateSubmitted: 'Feb 6, 2026', claimForms: ['CF1', 'CF2'], remarks: '' },
  { id: 'EC-MC04', claimSeriesNo: 'CS-MC-2026-0004', claimType: 'Outpatient Primary Care', pin: '44-556677889-0', patientName: 'Andrea Reyes', admissionDate: 'Jan 20, 2026', dischargeDate: 'Jan 20, 2026', icdCode: 'R73.03', diagnosis: 'Prediabetes', caseRateCode: 'CC-YK-FU', caseRateDesc: 'Yakap Follow-up Consultation', totalAmountClaimed: 2500, totalAmountApproved: 2500, facilityShare: 1500, professionalFee: 1000, status: 'Paid', transmittalNo: 'TN-MC-2026-0004', dateSubmitted: 'Jan 21, 2026', claimForms: ['CF1', 'CF2'], remarks: '' },
  { id: 'EC-MC05', claimSeriesNo: 'CS-MC-2026-0005', claimType: 'Outpatient Emergency', pin: '44-998877665-4', patientName: 'Carmen Santos', admissionDate: 'Feb 8, 2026', dischargeDate: 'Feb 8, 2026', icdCode: 'J06.9', diagnosis: 'Acute upper respiratory infection, unspecified', caseRateCode: 'CC-OECB-URI', caseRateDesc: 'OECB — Acute URI', totalAmountClaimed: 5500, totalAmountApproved: 0, facilityShare: 3300, professionalFee: 2200, status: 'In Process', transmittalNo: 'TN-MC-2026-0005', dateSubmitted: 'Feb 9, 2026', claimForms: ['CF1', 'CF2'], remarks: '' },
];

/* ─── PhilHealth Yakap mock data ─── */
/* Yakap (Yaman ng Kalusugan Para Malayo sa Sakit) = OUTPATIENT PRIMARY CARE.
   Replaced the old Konsulta program. Members register at an accredited YAKAP clinic
   as their "primary care home." Benefits include:
   - Personalized consultations (First Patient Encounter / follow-ups)
   - 75 essential medicines via GAMOT App (₱20,000/yr credit line, zero co-pay)
   - 13 outpatient lab tests (CBC, FBS, HbA1c, Lipid Panel, Creatinine, ALT, Urinalysis,
     Fecalysis+FOBT, Chest X-ray, ECG, Pap Smear, Serum Potassium, GeneXpert MTB/RIF)
   - 6 cancer screening tests (colonoscopy, liver ultrasound, AFP, low-dose CT, breast ultrasound, mammogram)
   - ₱900/yr co-payment for private clinics, zero for government facilities. */

type YakapMemberStatus = 'Registered' | 'FPE Completed' | 'Active' | 'Inactive' | 'Lapsed';

interface YakapLabTest {
  test: string;
  date: string;
  status: 'Completed' | 'Ordered' | 'Not Yet';
}

interface YakapPrescription {
  medication: string;
  dosage: string;
  gamotRefNo: string;
  amountCharged: number;
  dispensedDate: string;
}

interface YakapMember {
  id: string;
  pin: string;
  patientName: string;
  memberStatus: YakapMemberStatus;
  registeredClinic: string;
  registrationDate: string;
  fpeDate: string;
  lastVisitDate: string;
  totalVisits: number;
  // Medicine credit
  medicineCreditLimit: number;
  medicineCreditUsed: number;
  prescriptions: YakapPrescription[];
  // Lab utilization (13 tests)
  labTests: YakapLabTest[];
  // Cancer screenings
  cancerScreenings: YakapLabTest[];
  // Conditions being managed
  conditions: string[];
  annualCoPay: number;
  coPayPaid: boolean;
  remarks: string;
}

const YAKAP_LAB_TESTS = [
  'CBC with Platelet Count', 'Urinalysis', 'Fecalysis + FOBT', 'Fasting Blood Sugar',
  'HbA1c', 'Lipid Profile', 'Serum Creatinine / eGFR', 'ALT / SGPT',
  'Chest X-ray', 'GeneXpert MTB/RIF', 'Pap Smear', 'Serum Potassium', 'ECG',
];

const YAKAP_CANCER_SCREENS = [
  'Colonoscopy', 'Liver Ultrasound', 'Alpha Fetoprotein', 'Low-Dose Chest CT',
  'Breast Ultrasound', 'Mammogram',
];

const INITIAL_YAKAP: YakapMember[] = [
  {
    id: 'YK-001', pin: '01-234567890-1', patientName: 'Juan Dela Cruz', memberStatus: 'Active',
    registeredClinic: 'Maxicare PCC — Makati', registrationDate: 'Aug 1, 2025', fpeDate: 'Aug 5, 2025',
    lastVisitDate: 'Feb 5, 2026', totalVisits: 6,
    medicineCreditLimit: 20000, medicineCreditUsed: 7840,
    prescriptions: [
      { medication: 'Losartan 50mg', dosage: '1 tab OD', gamotRefNo: 'GMOT-2026-1201', amountCharged: 420, dispensedDate: 'Feb 5, 2026' },
      { medication: 'Amlodipine 5mg', dosage: '1 tab OD', gamotRefNo: 'GMOT-2026-1202', amountCharged: 350, dispensedDate: 'Feb 5, 2026' },
      { medication: 'Metformin 500mg', dosage: '1 tab BID', gamotRefNo: 'GMOT-2026-0890', amountCharged: 560, dispensedDate: 'Jan 8, 2026' },
      { medication: 'Rosuvastatin 20mg', dosage: '1 tab OD', gamotRefNo: 'GMOT-2025-3421', amountCharged: 680, dispensedDate: 'Nov 12, 2025' },
    ],
    labTests: [
      { test: 'CBC with Platelet Count', date: 'Aug 5, 2025', status: 'Completed' },
      { test: 'Fasting Blood Sugar', date: 'Aug 5, 2025', status: 'Completed' },
      { test: 'HbA1c', date: 'Feb 5, 2026', status: 'Completed' },
      { test: 'Lipid Profile', date: 'Aug 5, 2025', status: 'Completed' },
      { test: 'Serum Creatinine / eGFR', date: 'Feb 5, 2026', status: 'Completed' },
      { test: 'ALT / SGPT', date: 'Aug 5, 2025', status: 'Completed' },
      { test: 'Urinalysis', date: 'Aug 5, 2025', status: 'Completed' },
      { test: 'ECG', date: 'Aug 5, 2025', status: 'Completed' },
      { test: 'Chest X-ray', date: '', status: 'Not Yet' },
      { test: 'Fecalysis + FOBT', date: '', status: 'Not Yet' },
      { test: 'GeneXpert MTB/RIF', date: '', status: 'Not Yet' },
      { test: 'Pap Smear', date: '', status: 'Not Yet' },
      { test: 'Serum Potassium', date: '', status: 'Ordered' },
    ],
    cancerScreenings: [],
    conditions: ['Essential Hypertension (I10)', 'Type 2 Diabetes (E11.9)', 'Dyslipidemia (E78.5)'],
    annualCoPay: 900, coPayPaid: true, remarks: 'Chronic disease management — HTN + DM2. Good compliance.',
  },
  {
    id: 'YK-002', pin: '01-567890123-4', patientName: 'Lourdes Bautista', memberStatus: 'Active',
    registeredClinic: 'Maxicare PCC — Quezon City', registrationDate: 'Sep 10, 2025', fpeDate: 'Sep 15, 2025',
    lastVisitDate: 'Jan 28, 2026', totalVisits: 4,
    medicineCreditLimit: 20000, medicineCreditUsed: 3200,
    prescriptions: [
      { medication: 'Metformin 500mg', dosage: '1 tab BID', gamotRefNo: 'GMOT-2026-0654', amountCharged: 560, dispensedDate: 'Jan 28, 2026' },
      { medication: 'Glimepiride 2mg', dosage: '1 tab OD', gamotRefNo: 'GMOT-2026-0655', amountCharged: 480, dispensedDate: 'Jan 28, 2026' },
    ],
    labTests: [
      { test: 'CBC with Platelet Count', date: 'Sep 15, 2025', status: 'Completed' },
      { test: 'Fasting Blood Sugar', date: 'Sep 15, 2025', status: 'Completed' },
      { test: 'HbA1c', date: 'Jan 28, 2026', status: 'Completed' },
      { test: 'Lipid Profile', date: 'Sep 15, 2025', status: 'Completed' },
      { test: 'Serum Creatinine / eGFR', date: 'Jan 28, 2026', status: 'Completed' },
      { test: 'Urinalysis', date: 'Sep 15, 2025', status: 'Completed' },
      { test: 'ECG', date: '', status: 'Ordered' },
    ],
    cancerScreenings: [
      { test: 'Mammogram', date: 'Oct 20, 2025', status: 'Completed' },
    ],
    conditions: ['Type 2 Diabetes (E11.9)'],
    annualCoPay: 900, coPayPaid: true, remarks: 'FBS improving. HbA1c down from 8.2 to 7.1.',
  },
  {
    id: 'YK-003', pin: '01-345678901-2', patientName: 'Sofia Garcia', memberStatus: 'FPE Completed',
    registeredClinic: 'Maxicare PCC — Makati', registrationDate: 'Jan 20, 2026', fpeDate: 'Jan 25, 2026',
    lastVisitDate: 'Jan 25, 2026', totalVisits: 1,
    medicineCreditLimit: 20000, medicineCreditUsed: 0,
    prescriptions: [],
    labTests: [
      { test: 'CBC with Platelet Count', date: 'Jan 25, 2026', status: 'Completed' },
      { test: 'Urinalysis', date: 'Jan 25, 2026', status: 'Completed' },
      { test: 'Fasting Blood Sugar', date: 'Jan 25, 2026', status: 'Completed' },
    ],
    cancerScreenings: [],
    conditions: [],
    annualCoPay: 900, coPayPaid: true, remarks: 'FPE completed. Baseline screening normal. Follow-up in 6 months.',
  },
  {
    id: 'YK-004', pin: '01-890123456-7', patientName: 'Maria Lim', memberStatus: 'Active',
    registeredClinic: 'Maxicare PCC — Pasig', registrationDate: 'Aug 15, 2025', fpeDate: 'Aug 18, 2025',
    lastVisitDate: 'Feb 10, 2026', totalVisits: 8,
    medicineCreditLimit: 20000, medicineCreditUsed: 12450,
    prescriptions: [
      { medication: 'Salbutamol Nebules 2.5mg', dosage: 'PRN nebulization', gamotRefNo: 'GMOT-2026-1350', amountCharged: 380, dispensedDate: 'Feb 10, 2026' },
      { medication: 'Budesonide 200mcg Inhaler', dosage: '2 puffs BID', gamotRefNo: 'GMOT-2026-1351', amountCharged: 1200, dispensedDate: 'Feb 10, 2026' },
      { medication: 'Montelukast 10mg', dosage: '1 tab OD HS', gamotRefNo: 'GMOT-2026-1352', amountCharged: 520, dispensedDate: 'Feb 10, 2026' },
      { medication: 'Cetirizine 10mg', dosage: '1 tab OD', gamotRefNo: 'GMOT-2025-2810', amountCharged: 240, dispensedDate: 'Oct 5, 2025' },
    ],
    labTests: [
      { test: 'CBC with Platelet Count', date: 'Aug 18, 2025', status: 'Completed' },
      { test: 'Chest X-ray', date: 'Aug 18, 2025', status: 'Completed' },
      { test: 'GeneXpert MTB/RIF', date: 'Aug 18, 2025', status: 'Completed' },
      { test: 'ECG', date: 'Feb 10, 2026', status: 'Completed' },
    ],
    cancerScreenings: [
      { test: 'Pap Smear', date: 'Nov 10, 2025', status: 'Completed' },
    ],
    conditions: ['Bronchial Asthma (J45.20)', 'Allergic Rhinitis (J30.1)'],
    annualCoPay: 900, coPayPaid: true, remarks: 'Asthma well-controlled on current regimen. GeneXpert negative.',
  },
  {
    id: 'YK-005', pin: '01-901234567-8', patientName: 'Eduardo Villanueva', memberStatus: 'Active',
    registeredClinic: 'Maxicare PCC — Makati', registrationDate: 'Jul 28, 2025', fpeDate: 'Aug 1, 2025',
    lastVisitDate: 'Feb 8, 2026', totalVisits: 5,
    medicineCreditLimit: 20000, medicineCreditUsed: 15680,
    prescriptions: [
      { medication: 'Aspirin 80mg', dosage: '1 tab OD', gamotRefNo: 'GMOT-2026-1180', amountCharged: 180, dispensedDate: 'Feb 8, 2026' },
      { medication: 'Clopidogrel 75mg', dosage: '1 tab OD', gamotRefNo: 'GMOT-2026-1181', amountCharged: 890, dispensedDate: 'Feb 8, 2026' },
      { medication: 'Atorvastatin 40mg', dosage: '1 tab OD HS', gamotRefNo: 'GMOT-2026-1182', amountCharged: 780, dispensedDate: 'Feb 8, 2026' },
      { medication: 'Bisoprolol 5mg', dosage: '1 tab OD', gamotRefNo: 'GMOT-2026-1183', amountCharged: 620, dispensedDate: 'Feb 8, 2026' },
      { medication: 'Losartan 100mg', dosage: '1 tab OD', gamotRefNo: 'GMOT-2026-1184', amountCharged: 540, dispensedDate: 'Feb 8, 2026' },
    ],
    labTests: [
      { test: 'CBC with Platelet Count', date: 'Aug 1, 2025', status: 'Completed' },
      { test: 'Fasting Blood Sugar', date: 'Feb 8, 2026', status: 'Completed' },
      { test: 'Lipid Profile', date: 'Feb 8, 2026', status: 'Completed' },
      { test: 'Serum Creatinine / eGFR', date: 'Feb 8, 2026', status: 'Completed' },
      { test: 'Serum Potassium', date: 'Feb 8, 2026', status: 'Completed' },
      { test: 'ECG', date: 'Feb 8, 2026', status: 'Completed' },
      { test: 'ALT / SGPT', date: 'Aug 1, 2025', status: 'Completed' },
    ],
    cancerScreenings: [
      { test: 'Colonoscopy', date: '', status: 'Ordered' },
      { test: 'Low-Dose Chest CT', date: 'Sep 15, 2025', status: 'Completed' },
    ],
    conditions: ['Post-AMI (I25.2)', 'Essential Hypertension (I10)', 'Dyslipidemia (E78.5)'],
    annualCoPay: 900, coPayPaid: true, remarks: 'Post-MI maintenance. High medicine utilization — approaching credit limit.',
  },
  {
    id: 'YK-006', pin: '01-678901234-5', patientName: 'Anna Santos', memberStatus: 'Registered',
    registeredClinic: 'Maxicare PCC — Quezon City', registrationDate: 'Feb 1, 2026', fpeDate: '',
    lastVisitDate: '', totalVisits: 0,
    medicineCreditLimit: 20000, medicineCreditUsed: 0,
    prescriptions: [],
    labTests: [],
    cancerScreenings: [],
    conditions: [],
    annualCoPay: 900, coPayPaid: false, remarks: 'Newly registered via eGovPH. Pending First Patient Encounter scheduling.',
  },
  {
    id: 'YK-007', pin: '01-456789012-3', patientName: 'Carlos Reyes', memberStatus: 'Lapsed',
    registeredClinic: 'Maxicare PCC — Makati', registrationDate: 'Aug 10, 2025', fpeDate: 'Aug 15, 2025',
    lastVisitDate: 'Oct 20, 2025', totalVisits: 2,
    medicineCreditLimit: 20000, medicineCreditUsed: 2100,
    prescriptions: [
      { medication: 'Amlodipine 10mg', dosage: '1 tab OD', gamotRefNo: 'GMOT-2025-2450', amountCharged: 420, dispensedDate: 'Oct 20, 2025' },
    ],
    labTests: [
      { test: 'CBC with Platelet Count', date: 'Aug 15, 2025', status: 'Completed' },
      { test: 'Fasting Blood Sugar', date: 'Aug 15, 2025', status: 'Completed' },
      { test: 'Lipid Profile', date: 'Aug 15, 2025', status: 'Completed' },
    ],
    cancerScreenings: [],
    conditions: ['Essential Hypertension (I10)'],
    annualCoPay: 900, coPayPaid: true, remarks: 'No visit in 4 months. Follow-up overdue. Needs re-engagement.',
  },
  {
    id: 'YK-008', pin: '01-012345678-9', patientName: 'Grace Mendoza', memberStatus: 'Active',
    registeredClinic: 'Maxicare PCC — Pasig', registrationDate: 'Sep 1, 2025', fpeDate: 'Sep 5, 2025',
    lastVisitDate: 'Feb 3, 2026', totalVisits: 5,
    medicineCreditLimit: 20000, medicineCreditUsed: 4860,
    prescriptions: [
      { medication: 'Amoxicillin 500mg', dosage: '1 cap TID x 7 days', gamotRefNo: 'GMOT-2026-1090', amountCharged: 280, dispensedDate: 'Feb 3, 2026' },
      { medication: 'Paracetamol 500mg', dosage: '1 tab q4h PRN', gamotRefNo: 'GMOT-2026-1091', amountCharged: 120, dispensedDate: 'Feb 3, 2026' },
    ],
    labTests: [
      { test: 'CBC with Platelet Count', date: 'Sep 5, 2025', status: 'Completed' },
      { test: 'Urinalysis', date: 'Sep 5, 2025', status: 'Completed' },
      { test: 'Fasting Blood Sugar', date: 'Sep 5, 2025', status: 'Completed' },
      { test: 'Fecalysis + FOBT', date: 'Sep 5, 2025', status: 'Completed' },
      { test: 'Chest X-ray', date: 'Sep 5, 2025', status: 'Completed' },
    ],
    cancerScreenings: [
      { test: 'Pap Smear', date: 'Nov 20, 2025', status: 'Completed' },
      { test: 'Breast Ultrasound', date: 'Nov 20, 2025', status: 'Completed' },
    ],
    conditions: [],
    annualCoPay: 900, coPayPaid: true, remarks: 'Generally healthy. Current visit for acute URI. Cancer screenings up to date.',
  },
  // ── Maxicare PCC Yakap Members ──
  {
    id: 'YK-MC01', pin: '44-556677889-0', patientName: 'Andrea Reyes', memberStatus: 'Active',
    registeredClinic: 'Maxicare PCC — Ayala North Exchange', registrationDate: 'Oct 15, 2025', fpeDate: 'Oct 20, 2025',
    lastVisitDate: 'Feb 12, 2026', totalVisits: 5,
    medicineCreditLimit: 20000, medicineCreditUsed: 5840,
    prescriptions: [
      { medication: 'Losartan 50mg', dosage: '1 tab OD', gamotRefNo: 'GMOT-2026-MC01', amountCharged: 420, dispensedDate: 'Feb 10, 2026' },
      { medication: 'Amlodipine 5mg', dosage: '1 tab OD', gamotRefNo: 'GMOT-2026-MC02', amountCharged: 350, dispensedDate: 'Feb 10, 2026' },
      { medication: 'Vitamin D3 1000IU', dosage: '1 cap OD', gamotRefNo: 'GMOT-2026-MC03', amountCharged: 280, dispensedDate: 'Feb 10, 2026' },
    ],
    labTests: [
      { test: 'CBC with Platelet Count', date: 'Oct 20, 2025', status: 'Completed' },
      { test: 'Fasting Blood Sugar', date: 'Oct 20, 2025', status: 'Completed' },
      { test: 'HbA1c', date: 'Feb 10, 2026', status: 'Completed' },
      { test: 'Lipid Profile', date: 'Oct 20, 2025', status: 'Completed' },
      { test: 'Serum Creatinine / eGFR', date: 'Feb 10, 2026', status: 'Completed' },
      { test: 'Urinalysis', date: 'Oct 20, 2025', status: 'Completed' },
      { test: 'ECG', date: 'Oct 20, 2025', status: 'Completed' },
      { test: 'ALT / SGPT', date: '', status: 'Ordered' },
      { test: 'Chest X-ray', date: '', status: 'Not Yet' },
    ],
    cancerScreenings: [
      { test: 'Pap Smear', date: 'Nov 15, 2025', status: 'Completed' },
      { test: 'Breast Ultrasound', date: 'Nov 15, 2025', status: 'Completed' },
    ],
    conditions: ['Essential Hypertension (I10)', 'Pre-diabetes (R73.03)'],
    annualCoPay: 900, coPayPaid: true, remarks: 'Maxicare PRIMA Elite member. BP improving on dual therapy. HbA1c 5.8% — borderline.',
  },
  {
    id: 'YK-MC02', pin: '55-667788990-1', patientName: 'Mark Anthony Lim', memberStatus: 'FPE Completed',
    registeredClinic: 'Maxicare PCC — Bridgetowne', registrationDate: 'Jan 15, 2026', fpeDate: 'Feb 3, 2026',
    lastVisitDate: 'Feb 3, 2026', totalVisits: 1,
    medicineCreditLimit: 20000, medicineCreditUsed: 0,
    prescriptions: [],
    labTests: [
      { test: 'CBC with Platelet Count', date: 'Feb 3, 2026', status: 'Completed' },
      { test: 'Fasting Blood Sugar', date: 'Feb 3, 2026', status: 'Completed' },
      { test: 'Lipid Profile', date: 'Feb 3, 2026', status: 'Completed' },
    ],
    cancerScreenings: [],
    conditions: ['Dyslipidemia (E78.5)'],
    annualCoPay: 900, coPayPaid: true, remarks: 'Maxicare Corporate Gold. FPE completed. Elevated LDL — lifestyle modification advised.',
  },
  {
    id: 'YK-MC03', pin: '44-112233445-6', patientName: 'Roberto Lim', memberStatus: 'Active',
    registeredClinic: 'Maxicare PCC — Bridgetowne', registrationDate: 'Aug 20, 2025', fpeDate: 'Aug 25, 2025',
    lastVisitDate: 'Feb 12, 2026', totalVisits: 7,
    medicineCreditLimit: 20000, medicineCreditUsed: 9200,
    prescriptions: [
      { medication: 'Metformin 500mg', dosage: '1 tab BID', gamotRefNo: 'GMOT-2026-MC10', amountCharged: 560, dispensedDate: 'Feb 5, 2026' },
      { medication: 'Losartan 50mg', dosage: '1 tab OD', gamotRefNo: 'GMOT-2026-MC11', amountCharged: 420, dispensedDate: 'Feb 5, 2026' },
      { medication: 'Aspirin 80mg', dosage: '1 tab OD', gamotRefNo: 'GMOT-2026-MC12', amountCharged: 180, dispensedDate: 'Feb 5, 2026' },
    ],
    labTests: [
      { test: 'CBC with Platelet Count', date: 'Aug 25, 2025', status: 'Completed' },
      { test: 'Fasting Blood Sugar', date: 'Feb 5, 2026', status: 'Completed' },
      { test: 'HbA1c', date: 'Feb 5, 2026', status: 'Completed' },
      { test: 'Lipid Profile', date: 'Aug 25, 2025', status: 'Completed' },
      { test: 'Serum Creatinine / eGFR', date: 'Feb 5, 2026', status: 'Completed' },
      { test: 'Urinalysis', date: 'Aug 25, 2025', status: 'Completed' },
      { test: 'ECG', date: 'Feb 5, 2026', status: 'Completed' },
    ],
    cancerScreenings: [
      { test: 'Low-Dose Chest CT', date: 'Oct 10, 2025', status: 'Completed' },
    ],
    conditions: ['Type 2 Diabetes (E11.9)', 'Essential Hypertension (I10)'],
    annualCoPay: 900, coPayPaid: true, remarks: 'Senior citizen. DM2 + HTN management. HbA1c improving from 7.8 to 7.2.',
  },
];

/* ─── styles ─── */
const s: Record<string, React.CSSProperties> = {
  page: { padding: 24, background: 'var(--color-background)', minHeight: '100%' },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 },
  subtitle: { fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 24 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 },
  statCard: {
    background: 'var(--color-surface)',
    borderRadius: 12,
    padding: 20,
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border)',
  },
  statIcon: { width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 22, fontWeight: 700, color: 'var(--color-text)' },
  statLabel: { fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 },
  tabs: {
    display: 'flex',
    gap: 4,
    marginBottom: 20,
    borderBottom: '1px solid var(--color-border)',
    paddingBottom: 0,
  },
  tab: {
    padding: '12px 20px',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: -1,
  },
  tabActive: {
    color: 'var(--color-primary)',
    borderBottomColor: 'var(--color-primary)',
  },
  card: {
    background: 'var(--color-surface)',
    borderRadius: 12,
    padding: 24,
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border)',
  },
  toolbar: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' as const },
  searchWrap: { flex: 1, position: 'relative' as const, minWidth: 200 },
  searchIcon: { position: 'absolute' as const, left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' },
  searchInput: {
    width: '100%',
    padding: '10px 14px 10px 44px',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    fontSize: 14,
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    boxSizing: 'border-box' as const,
  },
  filterSelect: {
    padding: '10px 14px',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    background: 'var(--color-surface)',
    color: 'var(--color-text-muted)',
    fontSize: 14,
    cursor: 'pointer',
  },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: {
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    background: 'var(--color-background)',
    borderBottom: '1px solid var(--color-border)',
  },
  td: {
    padding: '14px 16px',
    fontSize: 14,
    color: 'var(--color-text)',
    borderBottom: '1px solid var(--color-border)',
  },
  badge: {
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  },
  btnPrimary: {
    padding: '10px 18px',
    background: 'var(--color-primary)',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  },
  btnDanger: {
    padding: '6px 12px',
    background: 'var(--color-error-light, #fee2e2)',
    color: 'var(--color-error, #ef4444)',
    border: '1px solid var(--color-error, #ef4444)',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  btnSuccess: {
    padding: '6px 12px',
    background: 'var(--color-success)',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  btnSmOutline: {
    padding: '6px 12px',
    background: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    color: 'var(--color-text-muted)',
  },
  formGroup: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    fontSize: 14,
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    boxSizing: 'border-box' as const,
  },
};

/* ─── sub-components ─── */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; color: string }> = {
    Completed: { bg: 'var(--color-success-light, #d1fae5)', color: 'var(--color-success, #10b981)' },
    Pending: { bg: 'var(--color-warning-light, #fef3c7)', color: 'var(--color-warning, #f59e0b)' },
    Failed: { bg: 'var(--color-error-light, #fee2e2)', color: 'var(--color-error, #ef4444)' },
    Refunded: { bg: 'var(--color-info-light, #dbeafe)', color: 'var(--color-info, #3b82f6)' },
  };
  const c = config[status] ?? { bg: 'var(--color-background)', color: 'var(--color-text-muted)' };
  return <span style={{ ...s.badge, background: c.bg, color: c.color }}>{status}</span>;
}

function MethodBadge({ method }: { method: string }) {
  const icons: Record<string, React.ReactNode> = {
    'Credit Card': <CreditCard size={12} />,
    'Debit Card': <CreditCard size={12} />,
    GCash: <Receipt size={12} />,
    Maya: <Receipt size={12} />,
    Cash: <Banknote size={12} />,
    Insurance: <Shield size={12} />,
  };
  return (
    <span style={{ ...s.badge, background: 'var(--color-background)', color: 'var(--color-text)' }}>
      {icons[method] ?? <Wallet size={12} />} {method}
    </span>
  );
}

function ClaimStatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; color: string }> = {
    Submitted: { bg: 'var(--color-info-light, #dbeafe)', color: 'var(--color-info, #3b82f6)' },
    'Under Review': { bg: 'var(--color-warning-light, #fef3c7)', color: 'var(--color-warning, #f59e0b)' },
    Approved: { bg: 'var(--color-success-light, #d1fae5)', color: 'var(--color-success, #10b981)' },
    Denied: { bg: 'var(--color-error-light, #fee2e2)', color: 'var(--color-error, #ef4444)' },
  };
  const c = config[status] ?? { bg: 'var(--color-background)', color: 'var(--color-text-muted)' };
  return <span style={{ ...s.badge, background: c.bg, color: c.color }}>{status}</span>;
}

/* ═══════════════════════════════════════════════ */
export function BillingRevenue() {
  const { tenant } = useTheme();
  const {
    paymentTransactions, addPayment, refundPayment,
    clinicalNotes, labOrders, prescriptions, dispensing,
  } = useProvider();
  const { showToast } = useToast();

  type TabId = 'transactions' | 'invoice' | 'claims' | 'fees' | 'eclaims' | 'yakap';
  const [activeTab, setActiveTab] = useState<TabId>('transactions');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  // invoice form — patient journey based
  const [invPatientId, setInvPatientId] = useState('');
  const [invMethod, setInvMethod] = useState<PaymentTransaction['method']>('Cash');
  const [invDiscount, setInvDiscount] = useState<'none' | 'senior' | 'pwd' | 'philhealth'>('none');
  const [invNotes, setInvNotes] = useState('');

  /* ── Line item types for invoice builder ── */
  interface InvoiceLineItem {
    id: string;
    category: 'Consultation' | 'Laboratory' | 'Imaging' | 'Medication' | 'Procedure';
    description: string;
    unitPrice: number;
    quantity: number;
    selected: boolean;
    source: string; // e.g. "lab-001", "rx-001"
    doctor?: string;
    date?: string;
  }
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [customItemDesc, setCustomItemDesc] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [customItemCat, setCustomItemCat] = useState<InvoiceLineItem['category']>('Consultation');

  /* ── Fee lookup helper ── */
  const feeMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const f of FEE_SCHEDULE) m.set(f.service.toLowerCase(), f.fee);
    return m;
  }, []);
  const lookupFee = (name: string, fallback: number) => {
    const lower = name.toLowerCase();
    for (const [key, fee] of feeMap) {
      if (lower.includes(key) || key.includes(lower)) return fee;
    }
    return fallback;
  };

  /* ── Build patient list from all data (tenant-filtered) ── */
  const tenantId = tenant.id;
  const patientList = useMemo(() => {
    const map = new Map<string, { id: string; name: string; encounters: number; lastDate: string }>();
    const add = (pid: string, pname: string, date?: string) => {
      if (getPatientTenant(pid) !== tenantId) return;
      if (!map.has(pid)) map.set(pid, { id: pid, name: pname, encounters: 0, lastDate: '' });
      const p = map.get(pid)!;
      p.encounters++;
      if (date && date > p.lastDate) p.lastDate = date;
    };
    for (const n of clinicalNotes) add(n.patientId, n.patientName, n.date);
    for (const o of labOrders) add(o.patientId, o.patientName, o.orderedDate);
    for (const rx of prescriptions) add(rx.patientId, rx.patientName, rx.prescribedDate);
    return Array.from(map.values()).sort((a, b) => b.lastDate.localeCompare(a.lastDate));
  }, [clinicalNotes, labOrders, prescriptions, tenantId]);

  /* ── When patient changes, rebuild line items from their journey ── */
  const loadPatientBillableItems = (patientId: string) => {
    if (!patientId) { setLineItems([]); return; }
    const items: InvoiceLineItem[] = [];
    // 1. Consultations from clinical notes
    for (const n of clinicalNotes.filter(n => n.patientId === patientId)) {
      items.push({
        id: `li-note-${n.id}`, category: 'Consultation',
        description: `Consultation — ${(n.icdCodes ?? []).join(', ') || 'General'}`,
        unitPrice: 500, quantity: 1, selected: true, source: n.id,
        doctor: n.doctorId, date: n.date,
      });
    }
    // 2. Lab orders
    for (const o of labOrders.filter(o => o.patientId === patientId)) {
      const cat: InvoiceLineItem['category'] = (o.testType === 'Imaging' || o.testType === 'Cardio') ? 'Imaging' : 'Laboratory';
      items.push({
        id: `li-lab-${o.id}`, category: cat,
        description: o.testName,
        unitPrice: lookupFee(o.testName, cat === 'Imaging' ? 1200 : 350),
        quantity: 1, selected: true, source: o.id,
        doctor: o.doctorName, date: o.orderedDate,
      });
    }
    // 3. Prescriptions / Dispensed medications
    for (const rx of prescriptions.filter(rx => rx.patientId === patientId && rx.status === 'Active')) {
      const disp = dispensing.find(d => d.prescriptionId === rx.id);
      items.push({
        id: `li-rx-${rx.id}`, category: 'Medication',
        description: `${rx.medication} ${rx.dosage} × ${rx.quantity}`,
        unitPrice: Math.round(rx.quantity * 8.5), // estimate per-unit cost
        quantity: 1, selected: !!disp, source: rx.id,
        doctor: rx.doctorName, date: rx.prescribedDate,
      });
    }
    setLineItems(items);
  };

  const selectedPatientName = patientList.find(p => p.id === invPatientId)?.name ?? '';

  const handlePatientSelect = (pid: string) => {
    setInvPatientId(pid);
    loadPatientBillableItems(pid);
  };

  const toggleLineItem = (id: string) => {
    setLineItems(prev => prev.map(li => li.id === id ? { ...li, selected: !li.selected } : li));
  };

  const updateLineItemQty = (id: string, qty: number) => {
    setLineItems(prev => prev.map(li => li.id === id ? { ...li, quantity: Math.max(1, qty) } : li));
  };

  const updateLineItemPrice = (id: string, price: number) => {
    setLineItems(prev => prev.map(li => li.id === id ? { ...li, unitPrice: Math.max(0, price) } : li));
  };

  const addCustomLineItem = () => {
    if (!customItemDesc.trim() || !customItemPrice) return;
    setLineItems(prev => [...prev, {
      id: `li-custom-${Date.now()}`, category: customItemCat,
      description: customItemDesc.trim(), unitPrice: parseFloat(customItemPrice),
      quantity: 1, selected: true, source: 'manual',
    }]);
    setCustomItemDesc('');
    setCustomItemPrice('');
  };

  const removeLineItem = (id: string) => {
    setLineItems(prev => prev.filter(li => li.id !== id));
  };

  /* ── Invoice totals ── */
  const invoiceTotals = useMemo(() => {
    const selected = lineItems.filter(li => li.selected);
    const subtotal = selected.reduce((a, li) => a + li.unitPrice * li.quantity, 0);
    const byCategory = new Map<string, number>();
    for (const li of selected) {
      byCategory.set(li.category, (byCategory.get(li.category) ?? 0) + li.unitPrice * li.quantity);
    }
    let discountPct = 0;
    let discountLabel = '';
    if (invDiscount === 'senior') { discountPct = 20; discountLabel = 'Senior Citizen (20%)'; }
    else if (invDiscount === 'pwd') { discountPct = 20; discountLabel = 'PWD (20%)'; }
    else if (invDiscount === 'philhealth') { discountPct = 0; discountLabel = 'PhilHealth — see eClaims'; }
    const discountAmt = Math.round(subtotal * discountPct / 100);
    const convFee = (invMethod === 'GCash' || invMethod === 'Maya') ? Math.round((subtotal - discountAmt) * 0.02) : 0;
    const total = subtotal - discountAmt + convFee;
    return { selected: selected.length, subtotal, byCategory, discountPct, discountLabel, discountAmt, convFee, total };
  }, [lineItems, invDiscount, invMethod]);

  // claims
  const [claims, setClaims] = useState(INITIAL_CLAIMS);

  // PhilHealth eClaims
  const [eclaims, setEclaims] = useState(INITIAL_ECLAIMS);
  const [eclaimSearch, setEclaimSearch] = useState('');
  const [eclaimStatusFilter, setEclaimStatusFilter] = useState('all');
  const [eclaimTypeFilter, setEclaimTypeFilter] = useState('all');
  const [eclaimExpandedId, setEclaimExpandedId] = useState<string | null>(null);

  // PhilHealth Yakap
  const [yakapMembers, setYakapMembers] = useState(INITIAL_YAKAP);
  const [yakapSearch, setYakapSearch] = useState('');
  const [yakapStatusFilter, setYakapStatusFilter] = useState('all');
  const [yakapExpandedId, setYakapExpandedId] = useState<string | null>(null);

  /* ── computed stats ── */
  const totalRevenue = useMemo(
    () => paymentTransactions.filter((t) => t.status === 'Completed').reduce((a, t) => a + t.amount, 0),
    [paymentTransactions]
  );
  const outstanding = useMemo(
    () => paymentTransactions.filter((t) => t.status === 'Pending').reduce((a, t) => a + t.amount, 0),
    [paymentTransactions]
  );
  const todaysCollections = useMemo(
    () => paymentTransactions.filter((t) => t.status === 'Completed' && isToday(t.transactionDate)).reduce((a, t) => a + t.amount, 0),
    [paymentTransactions]
  );
  const refundedTotal = useMemo(
    () => paymentTransactions.filter((t) => t.status === 'Refunded').reduce((a, t) => a + t.amount, 0),
    [paymentTransactions]
  );

  /* ── filtered transactions ── */
  const filteredTx = useMemo(() => {
    return paymentTransactions.filter((t) => {
      const matchSearch = !search || t.patientName.toLowerCase().includes(search.toLowerCase()) || t.referenceNumber.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchMethod = methodFilter === 'all' || t.method === methodFilter;
      return matchSearch && matchStatus && matchMethod;
    });
  }, [paymentTransactions, search, statusFilter, methodFilter]);

  /* ── tab list (conditionally hide claims) ── */
  const tabList = useMemo(() => {
    const list: { id: TabId; label: string; icon: React.ReactNode }[] = [
      { id: 'transactions', label: 'Transactions', icon: <CreditCard size={16} /> },
      { id: 'invoice', label: 'Create Invoice', icon: <FileText size={16} /> },
    ];
    if (tenant.features.hmo || tenant.features.loa) {
      list.push({ id: 'claims', label: 'Insurance Claims', icon: <Shield size={16} /> });
    }
    // PhilHealth tabs — always shown for PH-based tenants
    list.push({ id: 'eclaims', label: 'PhilHealth eClaims', icon: <Building2 size={16} /> });
    list.push({ id: 'yakap', label: 'PhilHealth Yakap', icon: <Heart size={16} /> });
    list.push({ id: 'fees', label: 'Fee Schedule', icon: <DollarSign size={16} /> });
    return list;
  }, [tenant.features.hmo, tenant.features.loa]);

  const effectiveTab = tabList.some((t) => t.id === activeTab) ? activeTab : 'transactions';

  /* ── refund handler ── */
  const handleRefund = (txId: string) => {
    refundPayment(txId);
    showToast('Payment refunded successfully', 'success');
  };

  /* ── create invoice ── */
  const handleCreateInvoice = () => {
    if (!invPatientId || invoiceTotals.selected === 0) {
      showToast('Select a patient and at least one billable item', 'error');
      return;
    }
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    lineItems.filter(li => li.selected).map(li => li.description).join(', ');
    const tx: Omit<PaymentTransaction, 'id' | 'referenceNumber'> = {
      invoiceId: `INV-${Date.now().toString(36).toUpperCase()}`,
      patientName: selectedPatientName,
      amount: invoiceTotals.total,
      method: invMethod,
      status: 'Pending',
      transactionDate: today,
      convenienceFee: invoiceTotals.convFee,
    };
    addPayment(tx);
    showToast(`Invoice ₱${invoiceTotals.total.toLocaleString()} generated for ${selectedPatientName} — ${invoiceTotals.selected} items`, 'success');
    setInvPatientId('');
    setLineItems([]);
    setInvMethod('Cash');
    setInvDiscount('none');
    setInvNotes('');
  };

  /* ── print preview — opens a clean printable invoice in a new window ── */
  const handlePrintPreview = () => {
    if (!invPatientId || invoiceTotals.selected === 0) {
      showToast('Select a patient and billable items first', 'error');
      return;
    }
    const selected = lineItems.filter(li => li.selected);
    const invoiceNo = `INV-${Date.now().toString(36).toUpperCase()}`;
    const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    const categories = ['Consultation', 'Laboratory', 'Imaging', 'Medication', 'Procedure'] as const;
    let itemsHtml = '';
    for (const cat of categories) {
      const catItems = selected.filter(li => li.category === cat);
      if (catItems.length === 0) continue;
      itemsHtml += `<tr style="background:#f8fafc"><td colspan="4" style="padding:8px 12px;font-weight:700;font-size:13px;color:#334155;border-bottom:1px solid #e2e8f0">${cat}</td></tr>`;
      for (const li of catItems) {
        itemsHtml += `<tr>
          <td style="padding:8px 12px;font-size:13px;border-bottom:1px solid #f1f5f9">${li.description}${li.date ? `<br><span style="font-size:11px;color:#94a3b8">${li.date}</span>` : ''}</td>
          <td style="padding:8px 12px;text-align:center;font-size:13px;border-bottom:1px solid #f1f5f9">${li.quantity}</td>
          <td style="padding:8px 12px;text-align:right;font-size:13px;border-bottom:1px solid #f1f5f9;font-variant-numeric:tabular-nums">₱${li.unitPrice.toLocaleString()}</td>
          <td style="padding:8px 12px;text-align:right;font-size:13px;font-weight:600;border-bottom:1px solid #f1f5f9;font-variant-numeric:tabular-nums">₱${(li.unitPrice * li.quantity).toLocaleString()}</td>
        </tr>`;
      }
    }

    let summaryHtml = `
      <tr><td colspan="3" style="text-align:right;padding:6px 12px;font-size:13px;color:#64748b">Subtotal</td>
          <td style="text-align:right;padding:6px 12px;font-weight:600;font-size:13px;font-variant-numeric:tabular-nums">₱${invoiceTotals.subtotal.toLocaleString()}</td></tr>`;
    if (invoiceTotals.discountAmt > 0) {
      summaryHtml += `
      <tr><td colspan="3" style="text-align:right;padding:4px 12px;font-size:12px;color:#16a34a">${invoiceTotals.discountLabel}</td>
          <td style="text-align:right;padding:4px 12px;font-weight:600;font-size:12px;color:#16a34a">−₱${invoiceTotals.discountAmt.toLocaleString()}</td></tr>`;
    }
    if (invoiceTotals.convFee > 0) {
      summaryHtml += `
      <tr><td colspan="3" style="text-align:right;padding:4px 12px;font-size:12px;color:#0ea5e9">Convenience Fee (2%)</td>
          <td style="text-align:right;padding:4px 12px;font-weight:600;font-size:12px;color:#0ea5e9">+₱${invoiceTotals.convFee.toLocaleString()}</td></tr>`;
    }
    summaryHtml += `
      <tr><td colspan="3" style="text-align:right;padding:10px 12px;font-size:16px;font-weight:800;border-top:2px solid #1e293b">TOTAL</td>
          <td style="text-align:right;padding:10px 12px;font-size:16px;font-weight:800;border-top:2px solid #1e293b;font-variant-numeric:tabular-nums">₱${invoiceTotals.total.toLocaleString()}</td></tr>`;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${invoiceNo}</title>
      <style>
        @media print { body { margin: 0; } .no-print { display: none !important; } @page { margin: 20mm 15mm; } }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 40px 24px; }
        table { width: 100%; border-collapse: collapse; }
      </style>
    </head><body>
      <div class="no-print" style="text-align:center;margin-bottom:24px">
        <button onclick="window.print()" style="padding:10px 32px;font-size:14px;font-weight:700;border:none;border-radius:8px;background:#2563eb;color:#fff;cursor:pointer">
          🖨️ Print Invoice
        </button>
        <button onclick="window.close()" style="padding:10px 24px;font-size:14px;font-weight:600;border:1px solid #e2e8f0;border-radius:8px;background:#fff;color:#64748b;cursor:pointer;margin-left:8px">
          Close
        </button>
      </div>

      <!-- Header -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #1e293b">
        <div>
          <div style="font-size:22px;font-weight:800;color:#1e293b">${tenant.name}</div>
          <div style="font-size:13px;color:#64748b;margin-top:4px">Healthcare Provider</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:1px">Invoice</div>
          <div style="font-size:18px;font-weight:800;color:#1e293b;margin-top:2px">${invoiceNo}</div>
          <div style="font-size:12px;color:#64748b;margin-top:4px">${dateStr}</div>
        </div>
      </div>

      <!-- Patient Info -->
      <div style="display:flex;gap:40px;margin-bottom:28px">
        <div>
          <div style="font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">Bill To</div>
          <div style="font-size:16px;font-weight:700;color:#1e293b">${selectedPatientName}</div>
        </div>
        <div>
          <div style="font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">Payment Method</div>
          <div style="font-size:14px;font-weight:600;color:#1e293b">${invMethod}</div>
        </div>
        ${invDiscount !== 'none' ? `<div>
          <div style="font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">Discount</div>
          <div style="font-size:14px;font-weight:600;color:#16a34a">${invoiceTotals.discountLabel}</div>
        </div>` : ''}
      </div>

      <!-- Line Items -->
      <table>
        <thead>
          <tr style="border-bottom:2px solid #1e293b">
            <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px">Description</th>
            <th style="text-align:center;padding:10px 12px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px">Qty</th>
            <th style="text-align:right;padding:10px 12px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px">Unit Price</th>
            <th style="text-align:right;padding:10px 12px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px">Amount</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>${summaryHtml}</tfoot>
      </table>

      ${invNotes ? `<div style="margin-top:24px;padding:12px 16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0">
        <div style="font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;margin-bottom:4px">Notes</div>
        <div style="font-size:13px;color:#475569">${invNotes}</div>
      </div>` : ''}

      <div style="margin-top:40px;padding-top:16px;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#94a3b8">
        ${tenant.name} · This is a computer-generated document. · ${dateStr}
      </div>
    </body></html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  /* ── claim actions ── */
  const handleApproveClaim = (id: string) => {
    setClaims((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'Approved' as const } : c)));
    showToast(`Claim ${id} approved`, 'success');
  };
  const handleDenyClaim = (id: string) => {
    setClaims((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'Denied' as const } : c)));
    showToast(`Claim ${id} denied`, 'info');
  };

  /* ── PhilHealth eClaims computed ── */
  const filteredEclaims = useMemo(() => {
    return eclaims.filter((e) => {
      const matchSearch = !eclaimSearch || e.patientName.toLowerCase().includes(eclaimSearch.toLowerCase()) || e.claimSeriesNo.toLowerCase().includes(eclaimSearch.toLowerCase()) || e.pin.includes(eclaimSearch);
      const matchStatus = eclaimStatusFilter === 'all' || e.status === eclaimStatusFilter;
      const matchType = eclaimTypeFilter === 'all' || e.claimType === eclaimTypeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [eclaims, eclaimSearch, eclaimStatusFilter, eclaimTypeFilter]);

  const eclaimStats = useMemo(() => {
    const total = eclaims.length;
    const submitted = eclaims.filter(e => e.status === 'Submitted' || e.status === 'In Process').length;
    const approved = eclaims.filter(e => e.status === 'Approved' || e.status === 'Paid').length;
    const returned = eclaims.filter(e => e.status === 'Return').length;
    const totalClaimed = eclaims.reduce((a, e) => a + e.totalAmountClaimed, 0);
    const totalPaid = eclaims.filter(e => e.status === 'Paid').reduce((a, e) => a + e.totalAmountApproved, 0);
    return { total, submitted, approved, returned, totalClaimed, totalPaid };
  }, [eclaims]);

  const handleEclaimSubmit = (id: string) => {
    setEclaims(prev => prev.map(e => e.id === id ? { ...e, status: 'Submitted' as const, dateSubmitted: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), transmittalNo: `TN-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}` } : e));
    showToast(`eClaim ${id} submitted to PhilHealth`, 'success');
  };

  const handleEclaimResubmit = (id: string) => {
    setEclaims(prev => prev.map(e => e.id === id ? { ...e, status: 'Submitted' as const, remarks: '' } : e));
    showToast(`eClaim ${id} resubmitted`, 'success');
  };

  /* ── PhilHealth Yakap computed ── */
  const filteredYakap = useMemo(() => {
    return yakapMembers.filter((y) => {
      const matchSearch = !yakapSearch || y.patientName.toLowerCase().includes(yakapSearch.toLowerCase()) || y.pin.includes(yakapSearch) || y.registeredClinic.toLowerCase().includes(yakapSearch.toLowerCase());
      const matchStatus = yakapStatusFilter === 'all' || y.memberStatus === yakapStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [yakapMembers, yakapSearch, yakapStatusFilter]);

  const yakapStats = useMemo(() => {
    const registered = yakapMembers.length;
    const active = yakapMembers.filter(y => y.memberStatus === 'Active').length;
    const fpeCompleted = yakapMembers.filter(y => y.fpeDate).length;
    const totalMedsUsed = yakapMembers.reduce((a, y) => a + y.medicineCreditUsed, 0);
    const totalLabsDone = yakapMembers.reduce((a, y) => a + y.labTests.filter(t => t.status === 'Completed').length, 0);
    const lapsed = yakapMembers.filter(y => y.memberStatus === 'Lapsed').length;
    return { registered, active, fpeCompleted, totalMedsUsed, totalLabsDone, lapsed };
  }, [yakapMembers]);

  const handleScheduleFPE = (id: string) => {
    setYakapMembers(prev => prev.map(y => y.id === id ? { ...y, fpeDate: 'Feb 18, 2026', remarks: 'FPE scheduled for Feb 18, 2026' } : y));
    showToast('First Patient Encounter scheduled', 'success');
  };

  const handleIssueGamotRx = (_id: string) => {
    showToast('GAMOT digital prescription generated — QR code sent to patient', 'success');
  };

  return (
    <div style={s.page}>
      <h1 style={s.title}>Billing & Revenue</h1>
      <p style={s.subtitle}>Manage transactions, invoices, claims, and fee schedules</p>

      {/* ── stat cards ── */}
      <div style={s.statsRow}>
        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: 'var(--color-success-light, #d1fae5)' }}>
            <DollarSign size={22} style={{ color: 'var(--color-success)' }} />
          </div>
          <div style={s.statValue}>₱{totalRevenue.toLocaleString()}</div>
          <div style={s.statLabel}>Total Revenue</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: 'var(--color-warning-light, #fef3c7)' }}>
            <TrendingUp size={22} style={{ color: 'var(--color-warning)' }} />
          </div>
          <div style={s.statValue}>₱{outstanding.toLocaleString()}</div>
          <div style={s.statLabel}>Outstanding</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: 'var(--color-info-light, #dbeafe)' }}>
            <CreditCard size={22} style={{ color: 'var(--color-info, #3b82f6)' }} />
          </div>
          <div style={s.statValue}>₱{todaysCollections.toLocaleString()}</div>
          <div style={s.statLabel}>Today&apos;s Collections</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: 'var(--color-error-light, #fee2e2)' }}>
            <RefreshCcw size={22} style={{ color: 'var(--color-error)' }} />
          </div>
          <div style={s.statValue}>₱{refundedTotal.toLocaleString()}</div>
          <div style={s.statLabel}>Refunded</div>
        </div>
      </div>

      {/* ── tabs ── */}
      <div style={s.tabs}>
        {tabList.map((tab) => (
          <button
            key={tab.id}
            style={{ ...s.tab, ...(effectiveTab === tab.id ? s.tabActive : {}) }}
            onClick={() => setActiveTab(tab.id)}
          >
            <span style={{ marginRight: 6, verticalAlign: 'middle', display: 'inline-flex' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ Transactions Tab ═══ */}
      {effectiveTab === 'transactions' && (
        <div style={s.card}>
          <div style={s.toolbar}>
            <div style={s.searchWrap}>
              <Search size={18} style={s.searchIcon} />
              <input
                style={s.searchInput}
                placeholder="Search by patient or reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select style={s.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
            <select style={s.filterSelect} value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
              <option value="all">All Methods</option>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {filteredTx.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>No transactions found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Ref #</th>
                    <th style={s.th}>Patient</th>
                    <th style={s.th}>Amount</th>
                    <th style={s.th}>Method</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Date</th>
                    <th style={{ ...s.th, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTx.map((t) => (
                    <tr key={t.id}>
                      <td style={s.td}><span style={{ fontWeight: 600 }}>{t.referenceNumber}</span></td>
                      <td style={s.td}>{t.patientName}</td>
                      <td style={s.td}>₱{t.amount.toLocaleString()}</td>
                      <td style={s.td}><MethodBadge method={t.method} /></td>
                      <td style={s.td}><StatusBadge status={t.status} /></td>
                      <td style={s.td}>{t.transactionDate}</td>
                      <td style={{ ...s.td, textAlign: 'right' }}>
                        {t.status === 'Completed' && (
                          <button style={s.btnDanger} onClick={() => handleRefund(t.id)}>
                            <RefreshCcw size={12} /> Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: 16, fontSize: 13, color: 'var(--color-text-muted)' }}>
            Showing {filteredTx.length} of {paymentTransactions.length} transactions
          </div>
        </div>
      )}

      {/* ═══ Create Invoice Tab ═══ */}
      {effectiveTab === 'invoice' && (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' as const }}>
          {/* ─ Left: Patient + Line Items ─ */}
          <div style={{ flex: '1 1 600px', minWidth: 0 }}>
            <div style={{ ...s.card, marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={16} style={{ color: 'var(--color-primary)' }} />
                Select Patient
              </h3>
              <select
                style={{ ...s.input, fontSize: 14, fontWeight: 500 }}
                value={invPatientId}
                onChange={(e) => handlePatientSelect(e.target.value)}
              >
                <option value="">— Select a patient —</option>
                {patientList.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.encounters} encounters · last: {p.lastDate || 'N/A'})</option>
                ))}
              </select>
            </div>

            {invPatientId && (
              <>
                {/* ─ Billable Line Items ─ */}
                <div style={{ ...s.card, marginBottom: 16, padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                      Billable Items from Patient Journey
                    </h3>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      {lineItems.filter(li => li.selected).length} / {lineItems.length} selected
                    </span>
                  </div>

                  {lineItems.length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
                      No billable items found for this patient.
                    </div>
                  ) : (
                    <table style={{ ...s.table, fontSize: 13 }}>
                      <thead>
                        <tr>
                          <th style={{ ...s.th, width: 32, padding: '8px 10px' }}></th>
                          <th style={{ ...s.th, padding: '8px 12px' }}>Category</th>
                          <th style={{ ...s.th, padding: '8px 12px' }}>Description</th>
                          <th style={{ ...s.th, padding: '8px 12px' }}>Doctor / Date</th>
                          <th style={{ ...s.th, padding: '8px 12px', textAlign: 'right' as const }}>Unit Price</th>
                          <th style={{ ...s.th, padding: '8px 12px', textAlign: 'center' as const, width: 50 }}>Qty</th>
                          <th style={{ ...s.th, padding: '8px 12px', textAlign: 'right' as const }}>Amount</th>
                          <th style={{ ...s.th, padding: '8px 6px', width: 30 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(['Consultation', 'Laboratory', 'Imaging', 'Medication', 'Procedure'] as const).map(cat => {
                          const catItems = lineItems.filter(li => li.category === cat);
                          if (catItems.length === 0) return null;
                          const catColors: Record<string, string> = { Consultation: '#8b5cf6', Laboratory: '#3b82f6', Imaging: '#06b6d4', Medication: '#10b981', Procedure: '#f59e0b' };
                          return catItems.map((li, idx) => (
                            <tr key={li.id} style={{ background: li.selected ? undefined : 'color-mix(in srgb, var(--color-text-muted) 3%, var(--color-surface))', opacity: li.selected ? 1 : 0.55 }}>
                              <td style={{ ...s.td, padding: '8px 10px', borderBottom: '1px solid var(--color-border)' }}>
                                <input
                                  type="checkbox"
                                  checked={li.selected}
                                  onChange={() => toggleLineItem(li.id)}
                                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                                />
                              </td>
                              <td style={{ ...s.td, padding: '8px 12px', fontSize: 12 }}>
                                {idx === 0 && <span style={{ ...s.badge, background: `color-mix(in srgb, ${catColors[cat] ?? '#888'} 12%, transparent)`, color: catColors[cat] ?? '#888', fontSize: 10, fontWeight: 700, padding: '2px 6px' }}>{cat}</span>}
                              </td>
                              <td style={{ ...s.td, padding: '8px 12px', fontWeight: 500 }}>{li.description}</td>
                              <td style={{ ...s.td, padding: '8px 12px', fontSize: 11, color: 'var(--color-text-muted)' }}>
                                {li.doctor && <div>{li.doctor}</div>}
                                {li.date && <div>{li.date}</div>}
                              </td>
                              <td style={{ ...s.td, padding: '8px 12px', textAlign: 'right' as const }}>
                                <input
                                  type="number"
                                  value={li.unitPrice}
                                  onChange={(e) => updateLineItemPrice(li.id, parseFloat(e.target.value) || 0)}
                                  style={{ width: 80, padding: '4px 6px', border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 12, textAlign: 'right' as const, background: 'var(--color-surface)', color: 'var(--color-text)', boxSizing: 'border-box' as const }}
                                />
                              </td>
                              <td style={{ ...s.td, padding: '8px 12px', textAlign: 'center' as const }}>
                                <input
                                  type="number"
                                  value={li.quantity}
                                  onChange={(e) => updateLineItemQty(li.id, parseInt(e.target.value) || 1)}
                                  min={1}
                                  style={{ width: 44, padding: '4px 4px', border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 12, textAlign: 'center' as const, background: 'var(--color-surface)', color: 'var(--color-text)', boxSizing: 'border-box' as const }}
                                />
                              </td>
                              <td style={{ ...s.td, padding: '8px 12px', textAlign: 'right' as const, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                                ₱{(li.unitPrice * li.quantity).toLocaleString()}
                              </td>
                              <td style={{ ...s.td, padding: '8px 6px' }}>
                                {li.source === 'manual' && (
                                  <button onClick={() => removeLineItem(li.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', padding: 2 }}>
                                    <XCircle size={14} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ));
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* ─ Add Custom Line Item ─ */}
                <div style={{ ...s.card, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 10 }}>Add Custom Line Item</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' as const }}>
                    <select style={{ ...s.input, width: 120, flex: 'none', padding: '8px 10px', fontSize: 12 }} value={customItemCat} onChange={(e) => setCustomItemCat(e.target.value as InvoiceLineItem['category'])}>
                      <option value="Consultation">Consultation</option>
                      <option value="Laboratory">Laboratory</option>
                      <option value="Imaging">Imaging</option>
                      <option value="Medication">Medication</option>
                      <option value="Procedure">Procedure</option>
                    </select>
                    <input style={{ ...s.input, flex: 1, minWidth: 140, padding: '8px 10px', fontSize: 12 }} placeholder="Description" value={customItemDesc} onChange={(e) => setCustomItemDesc(e.target.value)} />
                    <input style={{ ...s.input, width: 90, flex: 'none', padding: '8px 10px', fontSize: 12 }} type="number" placeholder="Price" value={customItemPrice} onChange={(e) => setCustomItemPrice(e.target.value)} />
                    <button style={{ ...s.btnSuccess, padding: '8px 12px', fontSize: 12 }} onClick={addCustomLineItem}>
                      <Plus size={12} /> Add
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ─ Right: Invoice Summary (sticky) ─ */}
          <div style={{ flex: '0 0 320px', position: 'sticky' as const, top: 24 }}>
            <div style={{ ...s.card, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', background: 'color-mix(in srgb, var(--color-primary) 6%, var(--color-surface))', borderBottom: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Receipt size={16} style={{ color: 'var(--color-primary)' }} />
                  Invoice Summary
                </h3>
                {selectedPatientName && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>{selectedPatientName}</div>}
              </div>

              <div style={{ padding: '16px 20px' }}>
                {invoiceTotals.selected === 0 ? (
                  <div style={{ padding: 20, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 12 }}>
                    {invPatientId ? 'Select billable items to build invoice' : 'Select a patient to get started'}
                  </div>
                ) : (
                  <>
                    {/* Subtotals by category */}
                    <div style={{ marginBottom: 14 }}>
                      {Array.from(invoiceTotals.byCategory.entries()).map(([cat, amt]) => (
                        <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', color: 'var(--color-text-muted)' }}>
                          <span>{cat} ({lineItems.filter(li => li.selected && li.category === cat).length})</span>
                          <span style={{ fontWeight: 600, color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>₱{amt.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: '1px solid var(--color-border)', padding: '10px 0 6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                        <span>Subtotal</span>
                        <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>₱{invoiceTotals.subtotal.toLocaleString()}</span>
                      </div>
                      {invoiceTotals.discountAmt > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-success)', marginBottom: 4 }}>
                          <span>{invoiceTotals.discountLabel}</span>
                          <span style={{ fontWeight: 600 }}>−₱{invoiceTotals.discountAmt.toLocaleString()}</span>
                        </div>
                      )}
                      {invoiceTotals.convFee > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-info)', marginBottom: 4 }}>
                          <span>Convenience Fee (2%)</span>
                          <span style={{ fontWeight: 600 }}>+₱{invoiceTotals.convFee.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ borderTop: '2px solid var(--color-text)', padding: '10px 0 0', display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, color: 'var(--color-text)' }}>
                      <span>Total</span>
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>₱{invoiceTotals.total.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Payment & Discount Controls */}
              <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>Discount</label>
                  <select style={{ ...s.input, padding: '8px 10px', fontSize: 12 }} value={invDiscount} onChange={(e) => setInvDiscount(e.target.value as typeof invDiscount)}>
                    <option value="none">No Discount</option>
                    <option value="senior">Senior Citizen (20%)</option>
                    <option value="pwd">PWD (20%)</option>
                    <option value="philhealth">PhilHealth Deduction</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>Payment Method</label>
                  <select style={{ ...s.input, padding: '8px 10px', fontSize: 12 }} value={invMethod} onChange={(e) => setInvMethod(e.target.value as PaymentTransaction['method'])}>
                    {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>Notes</label>
                  <textarea style={{ ...s.input, minHeight: 48, resize: 'vertical' as const, padding: '8px 10px', fontSize: 12 }} placeholder="Internal notes..." value={invNotes} onChange={(e) => setInvNotes(e.target.value)} />
                </div>
              </div>

              {/* Actions */}
              <div style={{ padding: '12px 20px 16px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                <button
                  style={{ ...s.btnPrimary, justifyContent: 'center', width: '100%', opacity: invoiceTotals.selected === 0 ? 0.5 : 1 }}
                  onClick={handleCreateInvoice}
                  disabled={invoiceTotals.selected === 0}
                >
                  <FileText size={15} /> Generate Invoice
                </button>
                <button
                  style={{ ...s.btnSmOutline, justifyContent: 'center', width: '100%' }}
                  onClick={handlePrintPreview}
                >
                  <Printer size={13} /> Print Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Insurance Claims Tab ═══ */}
      {effectiveTab === 'claims' && (
        <div style={s.card}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 20 }}>
            <Shield size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Insurance Claims
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Claim ID</th>
                  <th style={s.th}>Patient</th>
                  <th style={s.th}>Amount</th>
                  <th style={s.th}>Date</th>
                  <th style={s.th}>Status</th>
                  <th style={{ ...s.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c) => (
                  <tr key={c.id}>
                    <td style={s.td}><span style={{ fontWeight: 600 }}>{c.id}</span></td>
                    <td style={s.td}>{c.patient}</td>
                    <td style={s.td}>₱{c.amount.toLocaleString()}</td>
                    <td style={s.td}>{c.date}</td>
                    <td style={s.td}><ClaimStatusBadge status={c.status} /></td>
                    <td style={{ ...s.td, textAlign: 'right' }}>
                      {(c.status === 'Submitted' || c.status === 'Under Review') && (
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button style={s.btnSuccess} onClick={() => handleApproveClaim(c.id)}>
                            <CheckCircle2 size={12} /> Approve
                          </button>
                          <button style={s.btnDanger} onClick={() => handleDenyClaim(c.id)}>
                            <XCircle size={12} /> Deny
                          </button>
                        </div>
                      )}
                      {c.status === 'Approved' && (
                        <span style={{ fontSize: 12, color: 'var(--color-success)', fontWeight: 600 }}>Processed</span>
                      )}
                      {c.status === 'Denied' && (
                        <span style={{ fontSize: 12, color: 'var(--color-error)', fontWeight: 600 }}>Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginTop: 20 }}>
            {(['Submitted', 'Under Review', 'Approved', 'Denied'] as const).map((st) => {
              const count = claims.filter((c) => c.status === st).length;
              const total = claims.filter((c) => c.status === st).reduce((a, c) => a + c.amount, 0);
              return (
                <div key={st} style={{
                  padding: 14,
                  borderRadius: 8,
                  background: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>{st}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>{count}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>₱{total.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ PhilHealth eClaims Tab ═══ */}
      {effectiveTab === 'eclaims' && (
        <div>
          {/* eClaims stat cards */}
          <div style={s.statsRow}>
            {[
              { label: 'Total Claims', value: eclaimStats.total, icon: <FileText size={20} />, bg: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', iconColor: 'var(--color-primary)' },
              { label: 'Pending/In Process', value: eclaimStats.submitted, icon: <Clock size={20} />, bg: 'var(--color-warning-light, #fef3c7)', iconColor: 'var(--color-warning, #f59e0b)' },
              { label: 'Approved/Paid', value: eclaimStats.approved, icon: <CheckCircle2 size={20} />, bg: 'var(--color-success-light, #d1fae5)', iconColor: 'var(--color-success)' },
              { label: 'Returned', value: eclaimStats.returned, icon: <AlertCircle size={20} />, bg: 'var(--color-error-light, #fee2e2)', iconColor: 'var(--color-error, #ef4444)' },
              { label: 'Total Claimed', value: `₱${eclaimStats.totalClaimed.toLocaleString()}`, icon: <Send size={20} />, bg: 'var(--color-info-light, #dbeafe)', iconColor: 'var(--color-info, #3b82f6)' },
              { label: 'Total Paid', value: `₱${eclaimStats.totalPaid.toLocaleString()}`, icon: <Banknote size={20} />, bg: 'var(--color-success-light, #d1fae5)', iconColor: 'var(--color-success)' },
            ].map((st, idx) => (
              <div key={idx} style={s.statCard}>
                <div style={{ ...s.statIcon, background: st.bg }}>
                  <span style={{ color: st.iconColor }}>{st.icon}</span>
                </div>
                <div style={s.statValue}>{st.value}</div>
                <div style={s.statLabel}>{st.label}</div>
              </div>
            ))}
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={18} style={{ color: 'var(--color-primary)' }} />
                PhilHealth eClaims
              </h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ ...s.btnPrimary, fontSize: 12, padding: '8px 14px' }} onClick={() => {
                  const drafts = eclaims.filter(e => e.status === 'Draft');
                  if (drafts.length === 0) { showToast('No draft claims to submit', 'info'); return; }
                  setEclaims(prev => prev.map(e => e.status === 'Draft' ? { ...e, status: 'Submitted' as const, dateSubmitted: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), transmittalNo: `TN-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}` } : e));
                  showToast(`${drafts.length} draft claim(s) batch submitted`, 'success');
                }}>
                  <Upload size={14} /> Batch Submit Drafts
                </button>
              </div>
            </div>

            <div style={s.toolbar}>
              <div style={s.searchWrap}>
                <Search size={18} style={s.searchIcon} />
                <input style={s.searchInput} placeholder="Search by patient, PIN, or claim series..." value={eclaimSearch} onChange={(e) => setEclaimSearch(e.target.value)} />
              </div>
              <select style={s.filterSelect} value={eclaimStatusFilter} onChange={(e) => setEclaimStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                {(['Draft', 'Submitted', 'In Process', 'Return', 'Approved', 'Denied', 'Paid'] as EClaimStatus[]).map(st => <option key={st} value={st}>{st}</option>)}
              </select>
              <select style={s.filterSelect} value={eclaimTypeFilter} onChange={(e) => setEclaimTypeFilter(e.target.value)}>
                <option value="all">All Types</option>
                {(['Inpatient', 'Outpatient Emergency', 'Outpatient Primary Care', 'Z-Package', 'Maternity', 'Hemodialysis'] as EClaimType[]).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {filteredEclaims.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>No eClaims found</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {/* Table header */}
                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 100px 1fr 110px 90px 100px 90px', gap: 0, padding: '10px 16px', background: 'var(--color-background)', borderBottom: '1px solid var(--color-border)', fontWeight: 600, fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  <span>Claim Series</span>
                  <span>Patient</span>
                  <span>Type</span>
                  <span>Diagnosis / ICD</span>
                  <span style={{ textAlign: 'right' }}>Claimed</span>
                  <span>Status</span>
                  <span>Submitted</span>
                  <span style={{ textAlign: 'right' }}>Actions</span>
                </div>
                {filteredEclaims.map((ec) => {
                  const expanded = eclaimExpandedId === ec.id;
                  const eclaimStatusConfig: Record<EClaimStatus, { bg: string; color: string }> = {
                    Draft: { bg: 'var(--color-gray-100, #f3f4f6)', color: 'var(--color-text-muted)' },
                    Submitted: { bg: 'var(--color-info-light, #dbeafe)', color: 'var(--color-info, #3b82f6)' },
                    'In Process': { bg: 'var(--color-warning-light, #fef3c7)', color: 'var(--color-warning, #f59e0b)' },
                    Return: { bg: '#fef3c7', color: '#d97706' },
                    Approved: { bg: 'var(--color-success-light, #d1fae5)', color: 'var(--color-success, #10b981)' },
                    Denied: { bg: 'var(--color-error-light, #fee2e2)', color: 'var(--color-error, #ef4444)' },
                    Paid: { bg: '#d1fae5', color: '#059669' },
                  };
                  const stCfg = eclaimStatusConfig[ec.status];
                  return (
                    <div key={ec.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <div
                        style={{ display: 'grid', gridTemplateColumns: '130px 1fr 100px 1fr 110px 90px 100px 90px', gap: 0, padding: '12px 16px', alignItems: 'center', cursor: 'pointer', transition: 'background .15s' }}
                        onClick={() => setEclaimExpandedId(expanded ? null : ec.id)}
                        onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in srgb, var(--color-primary) 3%, var(--color-surface))'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          {ec.claimSeriesNo}
                        </span>
                        <span style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 500 }}>{ec.patientName}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: ec.claimType === 'Inpatient' ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)' : ec.claimType === 'Z-Package' ? '#ede9fe' : ec.claimType === 'Maternity' ? '#fce7f3' : ec.claimType === 'Hemodialysis' ? '#fef3c7' : 'var(--color-info-light, #dbeafe)', color: ec.claimType === 'Inpatient' ? 'var(--color-primary)' : ec.claimType === 'Z-Package' ? '#7c3aed' : ec.claimType === 'Maternity' ? '#db2777' : ec.claimType === 'Hemodialysis' ? '#d97706' : 'var(--color-info, #3b82f6)', whiteSpace: 'nowrap' }}>{ec.claimType === 'Outpatient Emergency' ? 'OPD-ER' : ec.claimType}</span>
                        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{ec.icdCode}</span> — {ec.diagnosis.length > 30 ? ec.diagnosis.substring(0, 30) + '…' : ec.diagnosis}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', textAlign: 'right' }}>₱{ec.totalAmountClaimed.toLocaleString()}</span>
                        <span style={{ ...s.badge, background: stCfg.bg, color: stCfg.color, fontSize: 10, padding: '3px 8px' }}>{ec.status}</span>
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{ec.dateSubmitted || '—'}</span>
                        <span style={{ textAlign: 'right' }}>
                          {ec.status === 'Draft' && (
                            <button style={{ ...s.btnPrimary, fontSize: 10, padding: '4px 10px' }} onClick={(e) => { e.stopPropagation(); handleEclaimSubmit(ec.id); }}>
                              <Send size={10} /> Submit
                            </button>
                          )}
                          {ec.status === 'Return' && (
                            <button style={{ ...s.btnSmOutline, fontSize: 10, padding: '4px 10px', borderColor: '#d97706', color: '#d97706' }} onClick={(e) => { e.stopPropagation(); handleEclaimResubmit(ec.id); }}>
                              <RotateCcw size={10} /> Resubmit
                            </button>
                          )}
                          {(ec.status !== 'Draft' && ec.status !== 'Return') && (
                            <button style={{ ...s.btnSmOutline, fontSize: 10, padding: '4px 10px' }} onClick={(e) => { e.stopPropagation(); setEclaimExpandedId(expanded ? null : ec.id); }}>
                              <Eye size={10} /> View
                            </button>
                          )}
                        </span>
                      </div>

                      {/* Expanded details */}
                      {expanded && (
                        <div style={{ padding: '0 16px 16px', background: 'color-mix(in srgb, var(--color-primary) 2%, var(--color-surface))' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, padding: 16, borderRadius: 10, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>PhilHealth PIN</div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{ec.pin}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Claim Type</div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{ec.claimType}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Admission → Discharge</div>
                              <div style={{ fontSize: 13, color: 'var(--color-text)' }}>{ec.admissionDate} → {ec.dischargeDate || 'Ongoing'}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Case Rate</div>
                              <div style={{ fontSize: 13, color: 'var(--color-text)' }}>
                                <span style={{ fontWeight: 600 }}>{ec.caseRateCode}</span> — {ec.caseRateDesc}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Transmittal # (TCN)</div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', fontFamily: 'monospace' }}>{ec.transmittalNo || '—'}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Claim Forms</div>
                              <div style={{ display: 'flex', gap: 4 }}>
                                {ec.claimForms.map(cf => (
                                  <span key={cf} style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }}>{cf}</span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Amount Claimed</div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>₱{ec.totalAmountClaimed.toLocaleString()}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Facility Share</div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>₱{ec.facilityShare.toLocaleString()}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Professional Fee</div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>₱{ec.professionalFee.toLocaleString()}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Amount Approved</div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: ec.totalAmountApproved > 0 ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                                {ec.totalAmountApproved > 0 ? `₱${ec.totalAmountApproved.toLocaleString()}` : '—'}
                              </div>
                            </div>
                          </div>
                          {ec.remarks && (
                            <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 8, background: ec.status === 'Return' ? '#fef3c7' : 'var(--color-background)', border: `1px solid ${ec.status === 'Return' ? '#f59e0b' : 'var(--color-border)'}`, fontSize: 12, color: ec.status === 'Return' ? '#92400e' : 'var(--color-text-muted)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                              <span><strong>Remarks:</strong> {ec.remarks}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: 16, fontSize: 13, color: 'var(--color-text-muted)' }}>
              Showing {filteredEclaims.length} of {eclaims.length} eClaims
            </div>
          </div>

          {/* PhilHealth eClaims Info Banner */}
          <div style={{ marginTop: 16, padding: 16, borderRadius: 10, background: 'color-mix(in srgb, var(--color-primary) 5%, var(--color-surface))', border: '1px solid color-mix(in srgb, var(--color-primary) 15%, var(--color-border))', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Building2 size={20} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>PhilHealth Electronic Claims Submission</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Claims are electronically submitted to PhilHealth through the eClaims portal. Ensure all Claim Forms (CF1–CF4) are complete and signed before submission. Returned claims must be resubmitted with corrections within 60 days.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PhilHealth Yakap Tab ═══ */}
      {effectiveTab === 'yakap' && (
        <div>
          {/* Yakap stat cards */}
          <div style={s.statsRow}>
            {[
              { label: 'Registered Members', value: yakapStats.registered, icon: <Users size={20} />, bg: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', iconColor: 'var(--color-primary)' },
              { label: 'Active (Post-FPE)', value: yakapStats.active, icon: <Heart size={20} />, bg: 'var(--color-success-light, #d1fae5)', iconColor: 'var(--color-success)' },
              { label: 'FPE Completed', value: yakapStats.fpeCompleted, icon: <CheckCircle2 size={20} />, bg: 'var(--color-info-light, #dbeafe)', iconColor: 'var(--color-info, #3b82f6)' },
              { label: 'GAMOT Meds Dispensed', value: `₱${yakapStats.totalMedsUsed.toLocaleString()}`, icon: <Pill size={20} />, bg: '#ede9fe', iconColor: '#8b5cf6' },
              { label: 'Lab Tests Done', value: yakapStats.totalLabsDone, icon: <Activity size={20} />, bg: 'var(--color-warning-light, #fef3c7)', iconColor: 'var(--color-warning, #f59e0b)' },
              { label: 'Lapsed', value: yakapStats.lapsed, icon: <AlertCircle size={20} />, bg: 'var(--color-error-light, #fee2e2)', iconColor: 'var(--color-error, #ef4444)' },
            ].map((st, idx) => (
              <div key={idx} style={s.statCard}>
                <div style={{ ...s.statIcon, background: st.bg }}>
                  <span style={{ color: st.iconColor }}>{st.icon}</span>
                </div>
                <div style={s.statValue}>{st.value}</div>
                <div style={s.statLabel}>{st.label}</div>
              </div>
            ))}
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Heart size={18} style={{ color: '#10b981' }} />
                Yakap — Primary Care Members
              </h3>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 600 }}>GAMOT App</span> · Digital Prescriptions · ₱20K Credit/Year · 13 Lab Tests · 6 Cancer Screenings
              </div>
            </div>

            <div style={s.toolbar}>
              <div style={s.searchWrap}>
                <Search size={18} style={s.searchIcon} />
                <input style={s.searchInput} placeholder="Search by patient, PIN, or clinic..." value={yakapSearch} onChange={(e) => setYakapSearch(e.target.value)} />
              </div>
              <select style={s.filterSelect} value={yakapStatusFilter} onChange={(e) => setYakapStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                {(['Registered', 'FPE Completed', 'Active', 'Inactive', 'Lapsed'] as YakapMemberStatus[]).map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>

            {filteredYakap.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>No Yakap members found</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredYakap.map((yk) => {
                  const expanded = yakapExpandedId === yk.id;
                  const medsPct = Math.round((yk.medicineCreditUsed / yk.medicineCreditLimit) * 100);
                  const labsDone = yk.labTests.filter(t => t.status === 'Completed').length;
                  const labsTotal = 13;
                  const statusCfg: Record<YakapMemberStatus, { bg: string; color: string }> = {
                    Registered: { bg: 'var(--color-info-light, #dbeafe)', color: 'var(--color-info, #3b82f6)' },
                    'FPE Completed': { bg: '#ede9fe', color: '#7c3aed' },
                    Active: { bg: 'var(--color-success-light, #d1fae5)', color: 'var(--color-success, #10b981)' },
                    Inactive: { bg: 'var(--color-gray-100, #f3f4f6)', color: 'var(--color-text-muted)' },
                    Lapsed: { bg: 'var(--color-error-light, #fee2e2)', color: 'var(--color-error, #ef4444)' },
                  };
                  const sCfg = statusCfg[yk.memberStatus];

                  return (
                    <div key={yk.id} style={{ borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-surface)', overflow: 'hidden' }}>
                      {/* Main row */}
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', cursor: 'pointer', transition: 'background .15s' }}
                        onClick={() => setYakapExpandedId(expanded ? null : yk.id)}
                        onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in srgb, var(--color-primary) 3%, var(--color-surface))'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        {/* Avatar */}
                        <div style={{ width: 42, height: 42, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: sCfg.bg, fontWeight: 700, fontSize: 14, color: sCfg.color }}>
                          {yk.patientName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>{yk.patientName}</span>
                            <span style={{ ...s.badge, background: sCfg.bg, color: sCfg.color, fontSize: 10, padding: '2px 8px' }}>{yk.memberStatus}</span>
                            {yk.conditions.length > 0 && yk.conditions.slice(0, 2).map((c, i) => (
                              <span key={i} style={{ fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', color: 'var(--color-primary)' }}>{c.split('(')[0].trim()}</span>
                            ))}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 3 }}>
                            {yk.registeredClinic} · {yk.totalVisits} visit{yk.totalVisits !== 1 ? 's' : ''}{yk.lastVisitDate ? ` · Last: ${yk.lastVisitDate}` : ''}
                          </div>
                        </div>

                        {/* Medicine Credit bar */}
                        <div style={{ width: 110, flexShrink: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 600, marginBottom: 2 }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>GAMOT</span>
                            <span style={{ color: medsPct >= 80 ? 'var(--color-error)' : medsPct >= 50 ? '#d97706' : 'var(--color-success)' }}>₱{(yk.medicineCreditLimit - yk.medicineCreditUsed).toLocaleString()}</span>
                          </div>
                          <div style={{ height: 5, borderRadius: 3, background: 'var(--color-background)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(medsPct, 100)}%`, borderRadius: 3, background: medsPct >= 80 ? 'var(--color-error)' : medsPct >= 50 ? '#d97706' : 'var(--color-success)', transition: 'width .3s' }} />
                          </div>
                        </div>

                        {/* Lab utilization */}
                        <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 50 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: labsDone >= 8 ? 'var(--color-success)' : 'var(--color-primary)' }}>{labsDone}/{labsTotal}</div>
                          <div style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>Labs</div>
                        </div>

                        {expanded ? <ChevronUp size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />}
                      </div>

                      {/* Expanded details */}
                      {expanded && (
                        <div style={{ borderTop: '1px solid var(--color-border)', background: 'color-mix(in srgb, var(--color-primary) 2%, var(--color-surface))' }}>
                          {/* Member info row */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>PIN</div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', fontFamily: 'monospace' }}>{yk.pin}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>Registered</div>
                              <div style={{ fontSize: 12, color: 'var(--color-text)' }}>{yk.registrationDate}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>First Patient Encounter</div>
                              <div style={{ fontSize: 12, color: yk.fpeDate ? 'var(--color-text)' : 'var(--color-warning)' }}>{yk.fpeDate || 'Not yet scheduled'}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>Annual Co-Pay (₱900)</div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: yk.coPayPaid ? 'var(--color-success)' : 'var(--color-warning)' }}>{yk.coPayPaid ? 'Paid' : 'Unpaid'}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>Medicine Credit</div>
                              <div style={{ fontSize: 12, color: 'var(--color-text)' }}>
                                <span style={{ fontWeight: 700, color: medsPct >= 80 ? 'var(--color-error)' : 'var(--color-text)' }}>₱{yk.medicineCreditUsed.toLocaleString()}</span> / ₱{yk.medicineCreditLimit.toLocaleString()} ({medsPct}%)
                              </div>
                            </div>
                          </div>

                          {/* GAMOT Prescriptions */}
                          {yk.prescriptions.length > 0 && (
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Pill size={12} style={{ color: '#8b5cf6' }} /> GAMOT Digital Prescriptions
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {yk.prescriptions.map((rx, i) => (
                                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 6, background: 'var(--color-surface)', border: '1px solid var(--color-border)', fontSize: 11 }}>
                                    <span style={{ fontWeight: 600, color: 'var(--color-text)', flex: 1 }}>{rx.medication}</span>
                                    <span style={{ color: 'var(--color-text-muted)' }}>{rx.dosage}</span>
                                    <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#8b5cf6', fontWeight: 600 }}>{rx.gamotRefNo}</span>
                                    <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>₱{rx.amountCharged.toLocaleString()}</span>
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>{rx.dispensedDate}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Lab Tests — 13 covered tests */}
                          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Activity size={12} style={{ color: 'var(--color-primary)' }} /> Covered Lab Tests ({labsDone}/13 completed)
                            </div>
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                              {YAKAP_LAB_TESTS.map(testName => {
                                const rec = yk.labTests.find(t => t.test === testName);
                                const st = rec?.status ?? 'Not Yet';
                                const bgc = st === 'Completed' ? 'var(--color-success-light, #d1fae5)' : st === 'Ordered' ? 'var(--color-warning-light, #fef3c7)' : 'var(--color-gray-100, #f3f4f6)';
                                const fc = st === 'Completed' ? 'var(--color-success)' : st === 'Ordered' ? '#d97706' : 'var(--color-text-muted)';
                                return (
                                  <span key={testName} style={{ fontSize: 9, fontWeight: 600, padding: '3px 7px', borderRadius: 5, background: bgc, color: fc, whiteSpace: 'nowrap' }} title={rec?.date ? `${testName} — ${rec.date}` : testName}>
                                    {st === 'Completed' ? '✓' : st === 'Ordered' ? '◷' : '○'} {testName.length > 18 ? testName.substring(0, 16) + '…' : testName}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          {/* Cancer Screenings */}
                          {(yk.cancerScreenings.length > 0 || yk.memberStatus === 'Active') && (
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Shield size={12} style={{ color: '#ec4899' }} /> Cancer Screenings ({yk.cancerScreenings.filter(c => c.status === 'Completed').length}/6 available)
                              </div>
                              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                {YAKAP_CANCER_SCREENS.map(testName => {
                                  const rec = yk.cancerScreenings.find(t => t.test === testName);
                                  const st = rec?.status ?? 'Not Yet';
                                  const bgc = st === 'Completed' ? '#fce7f3' : st === 'Ordered' ? '#fef3c7' : 'var(--color-gray-100, #f3f4f6)';
                                  const fc = st === 'Completed' ? '#db2777' : st === 'Ordered' ? '#d97706' : 'var(--color-text-muted)';
                                  return (
                                    <span key={testName} style={{ fontSize: 9, fontWeight: 600, padding: '3px 7px', borderRadius: 5, background: bgc, color: fc, whiteSpace: 'nowrap' }}>
                                      {st === 'Completed' ? '✓' : '○'} {testName}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Notes + Actions */}
                          <div style={{ padding: '12px 16px' }}>
                            {yk.remarks && (
                              <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--color-background)', border: '1px solid var(--color-border)', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 10 }}>
                                <strong>Notes:</strong> {yk.remarks}
                              </div>
                            )}
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {yk.memberStatus === 'Registered' && !yk.fpeDate && (
                                <button style={{ ...s.btnPrimary, fontSize: 12, padding: '8px 14px' }} onClick={() => handleScheduleFPE(yk.id)}>
                                  <Plus size={12} /> Schedule FPE
                                </button>
                              )}
                              {(yk.memberStatus === 'Active' || yk.memberStatus === 'FPE Completed') && (
                                <button style={{ ...s.btnPrimary, fontSize: 12, padding: '8px 14px' }} onClick={() => handleIssueGamotRx(yk.id)}>
                                  <FileText size={12} /> Issue GAMOT Rx
                                </button>
                              )}
                              {yk.memberStatus === 'Lapsed' && (
                                <button style={{ ...s.btnPrimary, fontSize: 12, padding: '8px 14px' }} onClick={() => { setYakapMembers(prev => prev.map(y => y.id === yk.id ? { ...y, memberStatus: 'Active' as const, remarks: 'Re-engaged — follow-up scheduled' } : y)); showToast('Member re-engaged', 'success'); }}>
                                  <RotateCcw size={12} /> Re-engage
                                </button>
                              )}
                              <button style={s.btnSmOutline} onClick={() => showToast('Member profile printed', 'info')}>
                                <FileText size={12} /> Print Summary
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: 16, fontSize: 13, color: 'var(--color-text-muted)' }}>
              Showing {filteredYakap.length} of {yakapMembers.length} Yakap members
            </div>
          </div>

          {/* Yakap Info Banner */}
          <div style={{ marginTop: 16, padding: 16, borderRadius: 10, background: 'color-mix(in srgb, var(--color-success) 5%, var(--color-surface))', border: '1px solid color-mix(in srgb, var(--color-success) 15%, var(--color-border))', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Heart size={20} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>PhilHealth Yakap — Yaman ng Kalusugan Para Malayo sa Sakit</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Yakap is PhilHealth{"'"}s expanded primary care program (replacing Konsulta). Members register at an accredited YAKAP clinic as their primary care home. Benefits include personalized consultations, 75 essential medicines via the GAMOT App (₱20,000/yr credit with zero co-pay), 13 outpatient lab tests, and 6 cancer screening tests. Annual co-payment is ₱900 for private clinics. Digital prescriptions use QR-authenticated e-prescriptions redeemable at accredited pharmacies.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Fee Schedule Tab ═══ */}
      {effectiveTab === 'fees' && (
        <div style={s.card}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 20 }}>
            <DollarSign size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Fee Schedule
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Service</th>
                  <th style={s.th}>Fee (₱)</th>
                  <th style={s.th}>Category</th>
                </tr>
              </thead>
              <tbody>
                {FEE_SCHEDULE.map((row) => (
                  <tr key={row.service}>
                    <td style={s.td}>
                      <span style={{ fontWeight: 600 }}>{row.service}</span>
                    </td>
                    <td style={s.td}>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₱{row.fee.toLocaleString()}</span>
                    </td>
                    <td style={s.td}>
                      {(() => {
                        const catColors: Record<string, { bg: string; color: string }> = {
                          Consultation: { bg: 'color-mix(in srgb, #8b5cf6 12%, transparent)', color: '#8b5cf6' },
                          Laboratory: { bg: 'color-mix(in srgb, #3b82f6 12%, transparent)', color: '#3b82f6' },
                          Imaging: { bg: 'color-mix(in srgb, #06b6d4 12%, transparent)', color: '#06b6d4' },
                          Procedure: { bg: 'color-mix(in srgb, #f59e0b 12%, transparent)', color: '#f59e0b' },
                        };
                        const cc = catColors[row.category] ?? { bg: 'var(--color-background)', color: 'var(--color-text-muted)' };
                        return <span style={{ ...s.badge, background: cc.bg, color: cc.color }}>{row.category}</span>;
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'var(--color-background)', fontSize: 13, color: 'var(--color-text-muted)' }}>
            Prices are in Philippine Peso (₱). Additional convenience fees may apply for digital payments.
          </div>
        </div>
      )}
    </div>
  );
}
