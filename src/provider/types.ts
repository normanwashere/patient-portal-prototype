// =============================================
// Provider & Doctor App - Data Models
// =============================================

// Re-export patient-side types for convenience
export type { Appointment, Medication, ClinicalResult, Invoice, Procedure, LOARequest, Claim, QueueStep, StepStatus, StepType, QueueInfo, UserProfile, Dependent, Notification, PhilHealth, HMOCard } from '../context/DataContext';

// ---- Staff & Auth ----
export type StaffRole = 'admin' | 'doctor' | 'nurse' | 'lab_tech' | 'pharmacist' | 'billing_staff' | 'front_desk' | 'hr' | 'imaging_tech';

export interface StaffUser {
    id: string;
    name: string;
    role: StaffRole;
    department: string;
    specialty?: string;
    branchId: string;
    email: string;
    phone: string;
    photoUrl: string;
    credentials: string[];
    licenseExpiry: string;
    status: 'Active' | 'On Leave' | 'Inactive';
    hireDate: string;
}

// ---- Clinical Notes / EMR ----
export interface ClinicalNote {
    id: string;
    patientId: string;
    patientName: string;
    appointmentId: string;
    doctorId: string;
    date: string;
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    icdCodes: string[];
    status: 'Draft' | 'Signed' | 'Amended';
    aiGenerated?: boolean;
}

// ---- AI Transcriber ----
export interface ConsultTranscript {
    id: string;
    appointmentId: string;
    patientId: string;
    doctorId: string;
    startTime: string;
    endTime?: string;
    transcript: TranscriptEntry[];
    status: 'Recording' | 'Processing' | 'Ready' | 'Reviewed';
}

export interface TranscriptEntry {
    timestamp: string;
    speaker: 'doctor' | 'patient';
    text: string;
}

export interface SOAPDraft {
    id: string;
    transcriptId: string;
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    suggestedICD10: { code: string; description: string; confidence: number }[];
    suggestedOrders: { type: string; name: string; reason: string }[];
    status: 'Draft' | 'Reviewed' | 'Signed';
}

// ---- CDSS ----
export type CDSSAlertType = 'drug_interaction' | 'drug_allergy' | 'dosage_range' | 'duplicate_order' | 'critical_value' | 'guideline' | 'preventive_care' | 'formulary';
export type CDSSSeverity = 'contraindicated' | 'major' | 'moderate' | 'minor' | 'info';

export interface CDSSAlert {
    id: string;
    type: CDSSAlertType;
    severity: CDSSSeverity;
    title: string;
    message: string;
    recommendation: string;
    encounterId?: string;
    orderId?: string;
    prescriptionId?: string;
    dismissed: boolean;
    actioned: boolean;
    createdAt: string;
}

// ---- Prescriptions ----
export interface Prescription {
    id: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
    refillsRemaining: number;
    status: 'Active' | 'Completed' | 'Cancelled' | 'Pending Approval';
    prescribedDate: string;
    notes?: string;
}

// ---- Lab / Imaging Orders ----
export type OrderStatus = 'Ordered' | 'Specimen Collected' | 'In Progress' | 'Resulted' | 'Reviewed' | 'Cancelled';
export type OrderPriority = 'Stat' | 'Routine' | 'Urgent';

export interface LabOrder {
    id: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    testName: string;
    testType: 'Laboratory' | 'Imaging' | 'Cardio' | 'Special';
    priority: OrderPriority;
    status: OrderStatus;
    orderedDate: string;
    collectedDate?: string;
    resultedDate?: string;
    result?: string;
    referenceRange?: string;
    isAbnormal?: boolean;
    isCritical?: boolean;
    notes?: string;
}

// ---- Doctor Availability ----
export interface DoctorAvailability {
    id: string;
    doctorId: string;
    doctorName: string;
    branchId: string;
    branchName: string;
    dayOfWeek: number; // 0-6
    startTime: string;
    endTime: string;
    slotDuration: number; // minutes
    isBlocked: boolean;
    blockReason?: string;
    recurring: boolean;
}

// ---- Rooms / Equipment ----
export interface Room {
    id: string;
    branchId: string;
    name: string;
    type: 'Consultation' | 'Procedure' | 'Imaging' | 'Lab' | 'Ward' | 'OR' | 'Triage';
    floor: string;
    wing: string;
    capacity: number;
    status: 'Available' | 'Occupied' | 'Maintenance' | 'Cleaning';
    currentPatient?: string;
    assignedDoctor?: string;
}

export interface Equipment {
    id: string;
    name: string;
    type: string;
    branchId: string;
    roomId?: string;
    status: 'Available' | 'In Use' | 'Maintenance' | 'Out of Service';
    lastMaintenance: string;
    nextMaintenance: string;
}

// ---- Queue Config ----
export interface QueueConfig {
    id: string;
    branchId: string;
    mode: 'LINEAR' | 'MULTI_STREAM';
    stations: StationConfig[];
    waitThresholds: { warning: number; critical: number };
    priorityRules: PriorityRule[];
    operatingHours: { start: string; end: string };
}

export interface StationConfig {
    id: string;
    name: string;
    type: string;
    location: string;
    capacity: number;
    assignedStaff: string[];
}

export interface PriorityRule {
    id: string;
    label: string;
    level: number;
    description: string;
}

export interface StationAssignment {
    id: string;
    stationId: string;
    staffId: string;
    staffName: string;
    shift: 'Morning' | 'Afternoon' | 'Night';
    date: string;
}

// ---- Shift Schedule ----
export interface ShiftSchedule {
    id: string;
    staffId: string;
    staffName: string;
    role: StaffRole;
    date: string;
    shift: 'Morning' | 'Afternoon' | 'Night';
    department: string;
    branchId: string;
    status: 'Scheduled' | 'On Duty' | 'Completed' | 'Absent' | 'Leave';
}

// ---- Pharmacy ----
export interface PharmacyItem {
    id: string;
    name: string;
    genericName: string;
    category: string;
    stockLevel: number;
    minStock: number;
    unitPrice: number;
    expiryDate: string;
    batchNumber: string;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expired';
    isControlled: boolean;
}

export interface DispensingRecord {
    id: string;
    prescriptionId: string;
    patientName: string;
    medication: string;
    quantity: number;
    dispensedBy: string;
    dispensedDate: string;
    status: 'Pending' | 'Dispensed' | 'Partially Dispensed' | 'Returned';
}

// ---- Nursing ----
export interface TriageRecord {
    id: string;
    patientId: string;
    patientName: string;
    nurseId: string;
    date: string;
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    respiratoryRate: number;
    oxygenSaturation: number;
    painScale: number;
    chiefComplaint: string;
    priority: 'Emergency' | 'Urgent' | 'Semi-Urgent' | 'Non-Urgent';
    notes?: string;
}

export interface NursingTask {
    id: string;
    patientId: string;
    patientName: string;
    nurseId: string;
    type: 'Medication' | 'Vital Signs' | 'Wound Care' | 'Assessment' | 'Discharge' | 'Other';
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
    dueTime: string;
    completedTime?: string;
    notes?: string;
}

// ---- Forms / Documents ----
export interface FormTemplate {
    id: string;
    name: string;
    type: 'intake' | 'consent' | 'questionnaire' | 'assessment' | 'certificate';
    fields: FormField[];
    status: 'Active' | 'Draft' | 'Archived';
    createdDate: string;
    usageCount: number;
}

export interface FormField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea' | 'radio';
    required: boolean;
    options?: string[];
}

export interface FormSubmission {
    id: string;
    templateId: string;
    templateName: string;
    patientId: string;
    patientName: string;
    submittedDate: string;
    status: 'Pending Review' | 'Reviewed' | 'Flagged' | 'Archived';
    data: Record<string, unknown>;
    reviewedBy?: string;
    reviewNotes?: string;
}

// ---- Immunization ----
export interface ImmunizationRecord {
    id: string;
    patientId: string;
    patientName: string;
    vaccine: string;
    dose: string;
    administeredDate: string;
    administeredBy: string;
    batchNumber: string;
    site: string;
    nextDueDate?: string;
    status: 'Completed' | 'Due' | 'Overdue' | 'Scheduled';
}

// ---- Medical Records ----
export interface MedicalRecord {
    id: string;
    patientId: string;
    patientName: string;
    type: 'Consultation' | 'Lab' | 'Imaging' | 'Procedure' | 'Discharge' | 'Certificate';
    title: string;
    date: string;
    doctor: string;
    summary: string;
    status: 'Final' | 'Draft' | 'Amended';
}

// ---- Events Management ----
export interface EventRegistration {
    id: string;
    eventId: string;
    eventName: string;
    patientId: string;
    patientName: string;
    registeredDate: string;
    status: 'Registered' | 'Attended' | 'No-Show' | 'Cancelled';
    notes?: string;
}

export interface ManagedEvent {
    id: string;
    title: string;
    type: 'Screening' | 'Webinar' | 'Vaccination Drive' | 'Wellness' | 'Health Fair';
    date: string;
    time: string;
    location: string;
    capacity: number;
    registered: number;
    status: 'Draft' | 'Published' | 'Active' | 'Completed' | 'Cancelled';
    description: string;
    branchId?: string;
}

// ---- Audit Log ----
export interface AuditLog {
    id: string;
    userId: string;
    userName: string;
    action: string;
    module: string;
    details: string;
    timestamp: string;
    ipAddress: string;
}

// ---- Payment Transactions ----
export interface PaymentTransaction {
    id: string;
    invoiceId: string;
    patientName: string;
    amount: number;
    method: 'Credit Card' | 'Debit Card' | 'GCash' | 'Maya' | 'Cash' | 'Insurance';
    status: 'Completed' | 'Pending' | 'Failed' | 'Refunded';
    transactionDate: string;
    referenceNumber: string;
    convenienceFee?: number;
}

// ---- Notifications (Internal) ----
export interface InternalMessage {
    id: string;
    fromId: string;
    fromName: string;
    toId: string;
    toName: string;
    subject: string;
    body: string;
    date: string;
    read: boolean;
    priority: 'Normal' | 'Urgent';
}

// ---- KPIs / Analytics ----
export interface DashboardKPI {
    label: string;
    value: string | number;
    change: number; // percentage
    trend: 'up' | 'down' | 'stable';
    icon: string;
}

// Station flow for LINEAR mode:
//   Check-In → Triage → Consult → [orders: Lab, Imaging, etc. one at a time] → Return-Consult → Pharmacy → Billing → Done
// At Return-Consult the doctor chooses: Pharmacy first then Billing, OR straight to Billing.
export type StationType = 'Check-In' | 'Triage' | 'Consult' | 'Lab' | 'Imaging' | 'Return-Consult' | 'Pharmacy' | 'Billing' | 'Done';

export const LINEAR_STATION_ORDER: StationType[] = [
    'Check-In', 'Triage', 'Consult', 'Lab', 'Imaging', 'Return-Consult', 'Pharmacy', 'Billing', 'Done',
];

// Doctor order types for MULTI_STREAM mode
export type DoctorOrderType = 'Lab-CBC' | 'Lab-Chemistry' | 'Lab-Urinalysis' | 'X-Ray' | 'CT-Scan' | 'Ultrasound' | 'ECG' | 'Pharmacy' | 'Return-Consult';

export interface DoctorOrder {
    id: string;
    type: DoctorOrderType;
    label: string;
    targetStation: StationType;
    status: 'pending' | 'queued' | 'in-progress' | 'completed';
    orderedAt: string;
    startedAt?: string;
    completedAt?: string;
}

export interface StationVisit {
    station: StationType;
    enteredAt: string;
    exitedAt?: string;
    staffId?: string;
    notes?: string;
}

export interface QueuePatient {
    id: string;
    patientName: string;
    patientId: string;
    ticketNumber: string;
    stationType: StationType;
    stationName: string;
    status: 'QUEUED' | 'READY' | 'IN_SESSION' | 'COMPLETED' | 'NO_SHOW' | 'TRANSFERRED';
    queuedAt: string;
    waitMinutes: number;
    priority: 'Normal' | 'Senior' | 'PWD' | 'Emergency';
    chiefComplaint?: string;
    assignedDoctor?: string;
    assignedNurse?: string;

    // Station journey tracking
    journeyHistory: StationVisit[];
    currentStationEnteredAt: string;

    // MULTI_STREAM: doctor-ordered re-queues
    doctorOrders: DoctorOrder[];
    currentOrderIndex: number; // -1 = no orders, otherwise index into doctorOrders
}
