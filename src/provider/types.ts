// =============================================
// Provider & Doctor App - Data Models
// =============================================

// Re-export patient-side types for convenience
export type { Appointment, Medication, ClinicalResult, Invoice, Procedure, LOARequest, Claim, QueueStep, StepStatus, StepType, QueueInfo, UserProfile, Dependent, Notification, PhilHealth, HMOCard } from '../context/DataContext';

// ---- Staff & Auth ----
export type StaffRole = 'admin' | 'super_admin' | 'doctor' | 'nurse' | 'lab_tech' | 'pharmacist' | 'billing_staff' | 'front_desk' | 'hr' | 'imaging_tech';

export interface StaffUser {
    id: string;
    name: string;
    role: StaffRole;
    department: string;
    specialty?: string;
    /** Additional specializations (specialists can also do General Practice) */
    specializations?: string[];
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
    patientId?: string;
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

// ---- Facility Schedule & Capacity ----
export type FacilityCategoryId = 'lab' | 'imaging' | 'cardio' | 'special';

export interface FacilitySchedule {
    id: string;
    tenantId: string;
    branchId: string;
    categoryId: FacilityCategoryId;
    procedureName?: string;
    daysOfWeek: number[];       // 0=Sun..6=Sat
    startTime: string;          // 'HH:mm' e.g. '07:00'
    endTime: string;            // 'HH:mm' e.g. '17:00'
    slotDurationMin: number;    // 15, 30, 60
    dailyCap: number;           // max bookings per day
    bookedSlots: Record<string, number>;  // 'YYYY-MM-DD' -> count booked
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
    type: 'Screening' | 'Webinar' | 'Vaccination Drive' | 'Wellness' | 'Health Fair' | 'Article' | 'Campaign' | 'Feature' | 'Activity';
    date: string;
    time: string;
    location: string;
    capacity: number;
    registered: number;
    status: 'Draft' | 'Published' | 'Active' | 'Completed' | 'Cancelled';
    description: string;
    branchId?: string;
    tenantId?: string;
    /** Corresponding patient-facing community item ID (for cross-reference) */
    patientFacingId?: string;
    /** Whether this item requires patient registration */
    registerable?: boolean;
    /** External URL or source reference */
    sourceUrl?: string;
    /** Cover / banner image URL (data-URL or external link) */
    imageUrl?: string;
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

// ---- Messaging / Conversations ----
export type ConversationType = 'direct' | 'department' | 'group';

export interface Conversation {
    id: string;
    type: ConversationType;
    name: string;                      // For DM: other person's name. For dept/group: channel name
    participantIds: string[];
    participantNames: string[];
    departmentTag?: string;            // e.g. 'Lab', 'Nursing', 'Pharmacy', 'Emergency', 'Admin', 'Doctors'
    lastMessageText: string;
    lastMessageAt: string;
    lastMessageFromId: string;
    lastMessageFromName: string;
    unreadCount: number;
    pinned?: boolean;
    avatar?: string;                   // initials or icon key
}

export interface ChatMessage {
    id: string;
    conversationId: string;
    fromId: string;
    fromName: string;
    fromRole?: string;
    text: string;
    timestamp: string;
    read: boolean;
    type: 'text' | 'system' | 'file' | 'urgent';
    fileName?: string;
    replyToId?: string;
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

// ---- Pause / Hold ----
export type PauseReason = 'fasting_required' | 'return_tomorrow' | 'preparation_needed' | 'personal_request' | 'facility_closing' | 'other';

export const PAUSE_REASON_LABELS: Record<PauseReason, string> = {
    fasting_required: 'Fasting Required',
    return_tomorrow: 'Returning Tomorrow',
    preparation_needed: 'Preparation Needed',
    personal_request: 'Personal Request',
    facility_closing: 'Facility Closing',
    other: 'Other',
};

export interface PauseInfo {
    pausedAt: string;
    reason: PauseReason;
    resumeDate?: string;
    notes?: string;
    pausedAtStation: StationType;
    preservedOrders: DoctorOrder[];
}

export type QueuePatientStatus = 'QUEUED' | 'READY' | 'IN_SESSION' | 'COMPLETED' | 'NO_SHOW' | 'TRANSFERRED' | 'PAUSED';

export interface QueuePatient {
    id: string;
    patientName: string;
    patientId: string;
    ticketNumber: string;
    stationType: StationType;
    stationName: string;
    status: QueuePatientStatus;
    queuedAt: string;
    waitMinutes: number;
    priority: 'Normal' | 'Senior' | 'PWD' | 'Emergency';
    chiefComplaint?: string;
    assignedDoctor?: string;
    assignedNurse?: string;

    /** Consultation room assignment (for Consult / Return-Consult stations) */
    consultRoomId?: string;
    consultRoomName?: string;

    // Station journey tracking
    journeyHistory: StationVisit[];
    currentStationEnteredAt: string;

    // MULTI_STREAM: doctor-ordered re-queues
    doctorOrders: DoctorOrder[];
    currentOrderIndex: number; // -1 = no orders, otherwise index into doctorOrders

    /** Pause / hold state — set when patient needs to leave and return later */
    pauseInfo?: PauseInfo;
}

/** Consultation room definition for queue display */
export interface ConsultRoom {
    id: string;
    name: string;
    doctorName: string;
    doctorId: string;
    specialty: string;
    floor: string;
    /** Whether the room handles return consults as well */
    handlesReturn: boolean;
    status: 'Active' | 'On Break' | 'Closed';
    /** Tenant/organization this room belongs to */
    tenantId?: string;
}

// =============================================
// Teleconsult Queue Management
// =============================================

export type TeleconsultType = 'now' | 'later';
/**
 * Teleconsult session lifecycle — aligned with Patient App + Doctor App flows:
 *
 *  NOTE: Intake form is completed BEFORE the session enters the queue.
 *        - Consult Now  → patient fills intake form, then clicks "Join Queue"
 *        - Consult Later → patient fills intake form when booking/scheduling
 *
 *  in-queue        → Patient in queue, sees "Waiting for Doctor" with timer
 *  doctor-assigned → Doctor assigned, patient still waiting, doctor sees patient in their queue
 *  connecting      → Doctor joining call, patient sees "Connecting..." animation
 *  in-session      → Active video call (patient sees doctor; doctor has SOAP/AI/orders/Rx panel)
 *  wrap-up         → Call ended; patient sees "Consultation Ended"; doctor completing post-call notes
 *  completed       → Fully done; patient can leave; doctor back to waiting room
 *  no-show         → Patient did not connect
 *  cancelled       → Session cancelled by patient or provider
 */
export type TeleconsultSessionStatus = 'in-queue' | 'doctor-assigned' | 'connecting' | 'in-session' | 'wrap-up' | 'completed' | 'no-show' | 'cancelled';
export type DoctorTCStatus = 'available' | 'in-session' | 'on-break' | 'clinic-consult' | 'rounds' | 'offline' | 'scheduled';

export interface TeleconsultSession {
    id: string;
    patientId: string;
    patientName: string;
    type: TeleconsultType;
    status: TeleconsultSessionStatus;
    assignedDoctorId?: string;
    assignedDoctorName?: string;
    specialty: string;
    chiefComplaint: string;
    scheduledTime?: string;        // for 'later' type
    queuedAt: string;
    intakeStartedAt?: string;
    sessionStartedAt?: string;
    sessionEndedAt?: string;
    waitMinutes: number;
    priority: 'Normal' | 'Urgent' | 'Follow-Up';
    intakeCompleted: boolean;
    notes?: string;
    // Patient connection
    patientOnline: boolean;
    connectionQuality?: 'good' | 'fair' | 'poor';
}

export interface TeleconsultDoctor {
    id: string;
    staffId: string;
    name: string;
    specialty: string;
    photoUrl: string;
    status: DoctorTCStatus;
    currentSessionId?: string;
    shiftStart: string;
    shiftEnd: string;
    breakStart?: string;
    breakEnd?: string;
    sessionsCompleted: number;
    avgSessionMinutes: number;
    // For scheduled doctors not yet checked in
    scheduledDate: string;
    checkedIn: boolean;
    currentActivity?: string; // e.g. 'Clinic consult Room 3', 'Ward rounds Floor 2'
    /** Tenant/organization this doctor belongs to */
    tenantId?: string;
}

// =============================================
// HomeCare Request (Provider-side view)
// =============================================

export type HomeCareRequestStatus = 'Pending Review' | 'Confirmed' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Clarification Needed';

export interface HomeCareRequest {
    id: string;
    patientName: string;
    patientId: string;
    mobile: string;
    address: string;
    addressType: 'home' | 'office';
    branchId: string;
    branchName: string;
    referralSource: 'network' | 'upload';
    /** For network referrals — list of selected lab request titles */
    requestTitles: string[];
    /** Specimen types to collect */
    specimenTypes: string[];
    referralFile?: string;
    orderingDoctor?: string;
    preferredDate1: string;
    preferredTime1: string;
    preferredDate2: string;
    preferredTime2: string;
    confirmedDate?: string;
    confirmedTime?: string;
    status: HomeCareRequestStatus;
    assignedCollector?: string;
    submittedAt: string;
    updatedAt: string;
    notes?: string;
    priority: 'Routine' | 'Urgent';
}

// =============================================
// LOA (Letter of Authorization) — Provider-side
// =============================================

export type ProviderLOAStatus = 'Pending' | 'Approved' | 'Rejected';
export type ProviderLOAType = 'Specialist' | 'Laboratory' | 'ER' | 'Inpatient' | 'Surgery' | 'In-patient Admission' | 'Annual Physical Exam' | string;

export interface ProviderLOARequest {
    id: string;
    patientName: string;
    patientId?: string;
    type: ProviderLOAType;
    provider: string;
    requestDate: string;
    amount: string;
    status: ProviderLOAStatus;
    diagnosis: string;
    justification: string;
}
