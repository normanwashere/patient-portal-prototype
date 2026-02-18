import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import {
  MOCK_STAFF,
  MOCK_CLINICAL_NOTES,
  MOCK_PRESCRIPTIONS,
  MOCK_LAB_ORDERS,
  MOCK_AVAILABILITY,
  MOCK_ROOMS,
  MOCK_EQUIPMENT,
  MOCK_QUEUE_PATIENTS,
  MOCK_SHIFT_SCHEDULES,
  MOCK_PHARMACY_ITEMS,
  MOCK_DISPENSING,
  MOCK_TRIAGE_RECORDS,
  MOCK_NURSING_TASKS,
  MOCK_FORM_TEMPLATES,
  MOCK_FORM_SUBMISSIONS,
  MOCK_IMMUNIZATION_RECORDS,
  MOCK_MANAGED_EVENTS,
  MOCK_EVENT_REGISTRATIONS,
  MOCK_AUDIT_LOGS,
  MOCK_PAYMENT_TRANSACTIONS,
  MOCK_INTERNAL_MESSAGES,
  MOCK_CDSS_ALERTS,
  MOCK_DASHBOARD_KPIS,
  MOCK_APPOINTMENTS,
  MOCK_TC_DOCTORS,
  MOCK_TC_SESSIONS,
  MOCK_CONVERSATIONS,
  MOCK_CHAT_MESSAGES,
  MOCK_HOMECARE_REQUESTS,
  MOCK_CONSULT_ROOMS,
  PROVIDER_BRANCHES,
  FACILITY_SCHEDULES,
  MOCK_REFERRALS,
} from '../data/providerMockData';
import type { ProviderBranch } from '../data/providerMockData';
import { useTheme } from '../../theme/ThemeContext';
import { getTenantBranches } from '../../data/mockBranches';
import type {
  StaffUser,
  ClinicalNote,
  Prescription,
  LabOrder,
  DoctorAvailability,
  Room,
  Equipment,
  QueuePatient,
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
  Appointment,
  StationType,
  DoctorOrder,
  DoctorOrderType,
  StationVisit,
  TeleconsultSession,
  TeleconsultDoctor,
  TeleconsultSessionStatus,
  DoctorTCStatus,
  Conversation,
  ChatMessage,
  ConversationType,
  HomeCareRequest,
  HomeCareRequestStatus,
  ConsultRoom,
  ProviderLOARequest,
  ProviderLOAStatus,
  PauseReason,
  PauseInfo,
  FacilitySchedule,
  PatientReferral,
  ReferralStatus,
} from '../types';

type CurrentApp = 'provider' | 'doctor';
type QueueMode = 'LINEAR' | 'MULTI_STREAM';
type DoctorMode = 'in-clinic' | 'teleconsult';

/** Lightweight global state for an active teleconsult call — persists across page navigation */
export interface ActiveTeleconsultCall {
  id: string;
  patientId: string;
  patientName: string;
  startedAt: number;          // Date.now() when the call started
  chiefComplaint?: string;
}

const now = () => new Date().toISOString();
let _idCounter = 1000;
const genId = (prefix: string) => `${prefix}-${_idCounter++}`;

// Map DoctorOrderType to a station
const ORDER_TO_STATION: Record<DoctorOrderType, StationType> = {
  'Lab-CBC': 'Lab',
  'Lab-Chemistry': 'Lab',
  'Lab-Urinalysis': 'Lab',
  'X-Ray': 'Imaging',
  'CT-Scan': 'Imaging',
  'Ultrasound': 'Imaging',
  'ECG': 'Imaging',
  'Pharmacy': 'Pharmacy',
  'Return-Consult': 'Return-Consult',
};

interface ProviderContextType {
  // Current staff & app
  currentStaff: StaffUser;
  currentApp: CurrentApp;
  queueMode: QueueMode;
  doctorMode: DoctorMode;
  switchStaff: (staffId: string) => void;
  switchApp: (app: CurrentApp) => void;
  toggleQueueMode: () => void;
  setDoctorMode: (mode: DoctorMode) => void;

  // Data state
  staff: StaffUser[];
  clinicalNotes: ClinicalNote[];
  prescriptions: Prescription[];
  labOrders: LabOrder[];
  availability: DoctorAvailability[];
  rooms: Room[];
  equipment: Equipment[];
  queuePatients: QueuePatient[];
  consultRooms: ConsultRoom[];
  shiftSchedules: ShiftSchedule[];
  pharmacyItems: PharmacyItem[];
  dispensing: DispensingRecord[];
  triageRecords: TriageRecord[];
  nursingTasks: NursingTask[];
  formTemplates: FormTemplate[];
  formSubmissions: FormSubmission[];
  immunizationRecords: ImmunizationRecord[];
  managedEvents: ManagedEvent[];
  eventRegistrations: EventRegistration[];
  auditLogs: AuditLog[];
  paymentTransactions: PaymentTransaction[];
  internalMessages: InternalMessage[];
  cdssAlerts: CDSSAlert[];
  dashboardKpis: DashboardKPI[];
  appointments: Appointment[];

  // ── Queue actions ──
  /** LINEAR: advance patient to next station in the swim lane, optionally assigning a consultation room */
  transferPatient: (patientId: string, toStation: StationType, roomAssignment?: { consultRoomId: string; consultRoomName: string; assignedDoctor?: string }) => void;
  /** MULTI_STREAM: doctor adds orders — ALL orders queued in parallel */
  addDoctorOrders: (patientId: string, orderTypes: DoctorOrderType[]) => void;
  /** MULTI_STREAM: start a specific order (set in-progress) */
  startOrder: (patientId: string, orderId: string) => void;
  /** MULTI_STREAM: complete a specific order; if all done → advance to post-order */
  completeOrder: (patientId: string, orderId: string) => void;
  /** Legacy: mark current order complete (sequential fallback) */
  completeCurrentOrder: (patientId: string) => void;
  /** Defer a specific order — reset to queued and move patient to bottom of queue */
  deferOrder: (patientId: string, orderId: string) => void;
  /** Check in a new walk-in patient */
  checkInPatient: (name: string, complaint: string, priority: QueuePatient['priority']) => void;
  callNextPatient: (stationId: string, patientId?: string) => void;
  startPatient: (patientId: string) => void;
  completePatient: (patientId: string) => void;
  markNoShow: (patientId: string) => void;
  skipPatient: (patientId: string) => void;
  /** Pause a patient's journey — they'll return later (e.g. fasting, next day) */
  pausePatient: (patientId: string, reason: PauseReason, notes?: string, resumeDate?: string) => void;
  /** Resume a paused patient's journey — re-queue them at the station where they paused */
  resumePatient: (patientId: string) => void;

  // ── Clinical notes ──
  signNote: (noteId: string) => void;
  saveDraftNote: (noteId: string, updates: Partial<ClinicalNote>) => void;
  addClinicalNote: (note: Omit<ClinicalNote, 'id'>) => void;

  // ── Prescriptions ──
  approvePrescription: (prescriptionId: string) => void;
  denyPrescription: (prescriptionId: string) => void;
  addPrescription: (rx: Omit<Prescription, 'id'>) => void;
  updatePrescription: (prescriptionId: string, updates: Partial<Omit<Prescription, 'id'>>) => void;

  // ── Lab orders ──
  updateLabOrderStatus: (orderId: string, status: string) => void;
  addLabOrder: (order: Omit<LabOrder, 'id'>) => void;

  // ── Alerts ──
  dismissAlert: (alertId: string) => void;
  actionAlert: (alertId: string) => void;
  addCdssAlert: (alert: Omit<CDSSAlert, 'id'>) => void;

  // ── Appointments ──
  updateAppointmentStatus: (appointmentId: string, status: string) => void;
  addAppointment: (apt: Omit<Appointment, 'id'>) => void;
  cancelAppointment: (appointmentId: string) => void;

  // ── Messages ──
  markMessageRead: (messageId: string) => void;
  sendMessage: (msg: Omit<InternalMessage, 'id' | 'date' | 'read'>) => void;

  // ── Nursing ──
  updateNursingTaskStatus: (taskId: string, status: string) => void;
  addTriageRecord: (record: TriageRecord) => void;
  addNursingTask: (task: Omit<NursingTask, 'id'>) => void;

  // ── Pharmacy ──
  dispenseItem: (prescriptionId: string, staffName: string) => void;
  updatePharmacyStock: (itemId: string, quantity: number) => void;

  // ── Billing ──
  addPayment: (tx: Omit<PaymentTransaction, 'id' | 'referenceNumber'>) => void;
  refundPayment: (txId: string) => void;

  // ── Staff / HR ──
  updateStaffStatus: (staffId: string, status: StaffUser['status']) => void;
  updateShiftStatus: (shiftId: string, status: ShiftSchedule['status']) => void;

  // ── Facility ──
  updateRoomStatus: (roomId: string, status: Room['status']) => void;
  updateEquipmentStatus: (equipmentId: string, status: Equipment['status']) => void;

  // ── Events ──
  addEvent: (event: Omit<ManagedEvent, 'id'>) => void;
  updateEvent: (eventId: string, updates: Partial<Omit<ManagedEvent, 'id'>>) => void;
  updateEventStatus: (eventId: string, status: ManagedEvent['status']) => void;
  updateRegistrationStatus: (regId: string, status: EventRegistration['status']) => void;

  // ── Forms ──
  updateFormSubmissionStatus: (subId: string, status: FormSubmission['status'], reviewNotes?: string) => void;
  addFormTemplate: (tpl: Omit<FormTemplate, 'id' | 'createdDate' | 'usageCount'>) => void;

  // ── Immunization ──
  addImmunizationRecord: (rec: Omit<ImmunizationRecord, 'id'>) => void;

  // ── Audit ──
  addAuditLog: (action: string, module: string, details: string) => void;

  // ── Teleconsult Queue ──
  tcSessions: TeleconsultSession[];
  tcDoctors: TeleconsultDoctor[];
  /** Add a new teleconsult session (patient joins) */
  addTcSession: (session: Omit<TeleconsultSession, 'id'>) => void;
  /** Update session status (waiting→intake→ready→in-session→wrap-up→completed) */
  updateTcSessionStatus: (sessionId: string, status: TeleconsultSessionStatus) => void;
  /** Assign a doctor to a session */
  assignTcDoctor: (sessionId: string, doctorId: string) => void;
  /** Start a teleconsult session (doctor begins video call) */
  startTcSession: (sessionId: string) => void;
  /** End / complete a teleconsult session */
  endTcSession: (sessionId: string) => void;
  /** Mark session as no-show */
  markTcNoShow: (sessionId: string) => void;
  /** Cancel a session */
  cancelTcSession: (sessionId: string) => void;
  /** Update doctor teleconsult status */
  updateTcDoctorStatus: (doctorId: string, status: DoctorTCStatus, activity?: string) => void;
  /** Check in a scheduled doctor for teleconsult shift */
  checkInTcDoctor: (doctorId: string) => void;
  /** Computed: teleconsult stats */
  tcStats: {
    totalWaiting: number;
    totalInSession: number;
    totalCompleted: number;
    totalNoShow: number;
    avgWaitMinutes: number;
    doctorsAvailable: number;
    doctorsInSession: number;
    doctorsOnBreak: number;
    nowQueueLength: number;
    laterQueueLength: number;
  };

  // ── Active teleconsult call (global, persists across navigation) ──
  activeTeleconsultCall: ActiveTeleconsultCall | null;
  setActiveTeleconsultCall: (call: ActiveTeleconsultCall | null) => void;

  // ── Messaging / Conversations ──
  conversations: Conversation[];
  chatMessages: ChatMessage[];
  sendChatMessage: (conversationId: string, text: string, type?: ChatMessage['type']) => void;
  createConversation: (type: ConversationType, name: string, participantIds: string[], departmentTag?: string) => string;
  markConversationRead: (conversationId: string) => void;
  totalUnreadMessages: number;

  // ── Branch context (Super Admin) ──
  currentBranchId: string;
  availableBranches: ProviderBranch[];
  switchBranch: (branchId: string) => void;

  // ── HomeCare Requests ──
  homeCareRequests: HomeCareRequest[];
  updateHomeCareStatus: (requestId: string, status: HomeCareRequestStatus, updates?: Partial<HomeCareRequest>) => void;
  addHomeCareRequest: (req: Omit<HomeCareRequest, 'id'>) => void;

  // ── LOA Requests ──
  providerLoaRequests: ProviderLOARequest[];
  addProviderLoa: (req: Omit<ProviderLOARequest, 'id'>) => void;
  updateProviderLoaStatus: (id: string, status: ProviderLOAStatus, justification?: string) => void;

  // ── Facility Schedules ──
  facilitySchedules: FacilitySchedule[];
  bookFacilitySlot: (scheduleId: string, dateStr: string) => void;
  updateFacilitySchedule: (scheduleId: string, updates: Partial<Pick<FacilitySchedule, 'dailyCap' | 'startTime' | 'endTime' | 'daysOfWeek' | 'slotDurationMin'>>) => void;

  // ── Referrals ──
  referrals: PatientReferral[];
  addReferral: (ref: Omit<PatientReferral, 'id'>) => void;
  updateReferralStatus: (id: string, status: ReferralStatus, updates?: Partial<PatientReferral>) => void;

  // Computed values
  pendingLabOrders: LabOrder[];
  criticalAlerts: CDSSAlert[];
  todayAppointments: Appointment[];
  queueStats: {
    totalInQueue: number;
    avgWaitTime: number;
    longestWait: number;
    completedToday: number;
  };
}

const ProviderContext = createContext<ProviderContextType | undefined>(undefined);

const isToday = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  } catch {
    return false;
  }
};

export const ProviderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { tenant } = useTheme();
  const defaultStaff = MOCK_STAFF.find((s) => s.role === 'super_admin') ?? MOCK_STAFF.find((s) => s.role === 'doctor') ?? MOCK_STAFF[0];

  const [currentStaff, setCurrentStaff] = useState<StaffUser>(defaultStaff);
  const [currentApp, setCurrentApp] = useState<CurrentApp>('provider');
  const [queueMode, setQueueMode] = useState<QueueMode>('LINEAR');
  const [doctorMode, setDoctorModeState] = useState<DoctorMode>('in-clinic');

  const [staff, setStaff] = useState<StaffUser[]>(MOCK_STAFF);
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>(MOCK_CLINICAL_NOTES);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(MOCK_PRESCRIPTIONS);
  const [labOrders, setLabOrders] = useState<LabOrder[]>(MOCK_LAB_ORDERS);
  const [availability] = useState<DoctorAvailability[]>(MOCK_AVAILABILITY);
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [equipment, setEquipment] = useState<Equipment[]>(MOCK_EQUIPMENT);
  const [queuePatients, setQueuePatients] = useState<QueuePatient[]>(MOCK_QUEUE_PATIENTS);
  const [shiftSchedules, setShiftSchedules] = useState<ShiftSchedule[]>(MOCK_SHIFT_SCHEDULES);
  const [pharmacyItems, setPharmacyItems] = useState<PharmacyItem[]>(MOCK_PHARMACY_ITEMS);
  const [dispensing, setDispensing] = useState<DispensingRecord[]>(MOCK_DISPENSING);
  const [triageRecords, setTriageRecords] = useState<TriageRecord[]>(MOCK_TRIAGE_RECORDS);
  const [nursingTasks, setNursingTasks] = useState<NursingTask[]>(MOCK_NURSING_TASKS);
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>(MOCK_FORM_TEMPLATES);
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>(MOCK_FORM_SUBMISSIONS);
  const [immunizationRecords, setImmunizationRecords] = useState<ImmunizationRecord[]>(MOCK_IMMUNIZATION_RECORDS);
  const [managedEvents, setManagedEvents] = useState<ManagedEvent[]>(MOCK_MANAGED_EVENTS);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>(MOCK_EVENT_REGISTRATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>(MOCK_PAYMENT_TRANSACTIONS);
  const [internalMessages, setInternalMessages] = useState<InternalMessage[]>(MOCK_INTERNAL_MESSAGES);
  const [cdssAlerts, setCDSSAlerts] = useState<CDSSAlert[]>(MOCK_CDSS_ALERTS);
  const [dashboardKpis] = useState<DashboardKPI[]>(MOCK_DASHBOARD_KPIS);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [tcSessions, setTcSessions] = useState<TeleconsultSession[]>(MOCK_TC_SESSIONS);
  const [tcDoctors, setTcDoctors] = useState<TeleconsultDoctor[]>(MOCK_TC_DOCTORS);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(MOCK_CHAT_MESSAGES);

  // Global active teleconsult call state (persists across route changes)
  const [activeTeleconsultCall, setActiveTeleconsultCall] = useState<ActiveTeleconsultCall | null>(null);

  // Branch context — derived from tenant; falls back to hardcoded branches if none found
  const tenantBranches: ProviderBranch[] = useMemo(() => {
    const tBranches = getTenantBranches(tenant.id, tenant.name);
    if (tBranches.length > 0) {
      return tBranches.map(b => ({ id: b.id, name: b.name, address: b.address }));
    }
    return PROVIDER_BRANCHES;
  }, [tenant.id, tenant.name]);

  const [currentBranchId, setCurrentBranchId] = useState(() => tenantBranches[0]?.id ?? PROVIDER_BRANCHES[0].id);
  const availableBranches = tenantBranches;

  // Reset branch when tenant changes
  useEffect(() => {
    setCurrentBranchId(tenantBranches[0]?.id ?? PROVIDER_BRANCHES[0].id);
  }, [tenantBranches]);

  // HomeCare requests
  const [homeCareRequests, setHomeCareRequests] = useState<HomeCareRequest[]>(MOCK_HOMECARE_REQUESTS);
  const [facilitySchedules, setFacilitySchedules] = useState<FacilitySchedule[]>(FACILITY_SCHEDULES);
  const [referrals, setReferrals] = useState<PatientReferral[]>(MOCK_REFERRALS);

  // ── Wait-time ticker — increments waitMinutes every 30s for active patients & TC sessions ──
  const waitTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    waitTickRef.current = setInterval(() => {
      setQueuePatients(prev =>
        prev.map(p => {
          if (p.status === 'QUEUED' || p.status === 'READY' || p.status === 'IN_SESSION') {
            return { ...p, waitMinutes: p.waitMinutes + 1 };
          }
          return p;
        })
      );
      // Also tick teleconsult sessions that are still waiting / in active flow
      setTcSessions(prev =>
        prev.map(s => {
          if (s.status === 'in-queue' || s.status === 'doctor-assigned' || s.status === 'connecting' || s.status === 'in-session') {
            return { ...s, waitMinutes: s.waitMinutes + 1 };
          }
          return s;
        })
      );
    }, 30_000); // tick every 30 seconds for a snappier demo feel
    return () => {
      if (waitTickRef.current) clearInterval(waitTickRef.current);
    };
  }, []);

  // ── Basic switches ──
  const switchStaff = useCallback((staffId: string) => {
    const found = staff.find((s) => s.id === staffId);
    if (found) setCurrentStaff(found);
  }, [staff]);
  const switchApp = useCallback((app: CurrentApp) => {
    setCurrentApp(app);
    if (app === 'doctor') {
      setCurrentStaff((prev) => {
        if (prev.role === 'doctor') return prev;
        return staff.find((s) => s.role === 'doctor') ?? prev;
      });
    } else {
      setCurrentStaff((prev) => {
        if (prev.role === 'super_admin' || prev.role === 'doctor') return prev;
        return staff.find((s) => s.role === 'super_admin') ?? staff.find((s) => s.role === 'doctor') ?? prev;
      });
    }
  }, [staff]);
  const toggleQueueMode = useCallback(() => setQueueMode((p) => (p === 'LINEAR' ? 'MULTI_STREAM' : 'LINEAR')), []);
  const setDoctorMode = useCallback((mode: DoctorMode) => setDoctorModeState(mode), []);

  // ── Audit helper ──
  const _audit = useCallback((action: string, module: string, details: string) => {
    setAuditLogs((prev) => [
      { id: genId('log'), userId: currentStaff.id, userName: currentStaff.name, action, module, details, timestamp: now(), ipAddress: '10.0.1.42' },
      ...prev,
    ]);
  }, [currentStaff]);

  // ═══════════════════════════════════════════════
  //  QUEUE ACTIONS
  // ═══════════════════════════════════════════════

  const checkInPatient = useCallback((name: string, complaint: string, priority: QueuePatient['priority']) => {
    const ticket = `T-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const patient: QueuePatient = {
      id: genId('qp'),
      patientId: genId('pt'),
      patientName: name,
      ticketNumber: ticket,
      stationType: 'Check-In',
      stationName: 'Check-In',
      status: 'QUEUED',
      queuedAt: now(),
      waitMinutes: 0,
      priority,
      chiefComplaint: complaint,
      journeyHistory: [{ station: 'Check-In', enteredAt: now() }],
      currentStationEnteredAt: now(),
      doctorOrders: [],
      currentOrderIndex: -1,
    };
    setQueuePatients((prev) => [...prev, patient]);
    _audit('check_in', 'Queue', `Checked in ${name} - ${ticket}`);
  }, [_audit]);

  const transferPatient = useCallback((patientId: string, toStation: StationType, roomAssignment?: { consultRoomId: string; consultRoomName: string; assignedDoctor?: string }) => {
    setQueuePatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId && p.patientId !== patientId) return p;
        const exitVisit: StationVisit = { ...p.journeyHistory[p.journeyHistory.length - 1], exitedAt: now() };
        const newHistory = [...p.journeyHistory.slice(0, -1), exitVisit, { station: toStation, enteredAt: now() }];
        return {
          ...p,
          stationType: toStation,
          stationName: toStation,
          status: toStation === 'Done' ? 'COMPLETED' as const : 'QUEUED' as const,
          journeyHistory: newHistory,
          currentStationEnteredAt: now(),
          waitMinutes: 0,
          ...(roomAssignment ? {
            consultRoomId: roomAssignment.consultRoomId,
            consultRoomName: roomAssignment.consultRoomName,
            assignedDoctor: roomAssignment.assignedDoctor ?? p.assignedDoctor,
          } : {}),
        };
      })
    );
    _audit('transfer', 'Queue', `Transferred patient to ${toStation}${roomAssignment ? ` (${roomAssignment.consultRoomName})` : ''}`);
  }, [_audit]);

  // Add doctor orders — behaviour depends on queue mode:
  //   LINEAR:       first order = 'queued', rest = 'pending' (sequential, one at a time)
  //   MULTI_STREAM: ALL orders = 'queued' (parallel, patient in every room at once)
  const addDoctorOrders = useCallback((patientId: string, orderTypes: DoctorOrderType[]) => {
    const isLinear = queueMode === 'LINEAR';
    setQueuePatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId && p.patientId !== patientId) return p;
        const newOrders: DoctorOrder[] = orderTypes.map((t, i) => ({
          id: genId('ord'),
          type: t,
          label: t.replace(/-/g, ' '),
          targetStation: ORDER_TO_STATION[t],
          // LINEAR: only first = queued, rest pending. MULTI: all queued.
          status: (isLinear ? (i === 0 ? 'queued' : 'pending') : 'queued') as DoctorOrder['status'],
          orderedAt: now(),
        }));
        const merged = [...p.doctorOrders, ...newOrders];
        // Move patient to first order's station
        const firstNew = newOrders[0];
        const exitVisit: StationVisit = { ...p.journeyHistory[p.journeyHistory.length - 1], exitedAt: now() };
        const newHistory = [...p.journeyHistory.slice(0, -1), exitVisit, { station: firstNew.targetStation, enteredAt: now() }];
        return {
          ...p,
          doctorOrders: merged,
          currentOrderIndex: merged.length - newOrders.length, // index of first new order
          stationType: firstNew.targetStation,
          stationName: firstNew.targetStation,
          status: 'QUEUED' as const,
          journeyHistory: newHistory,
          currentStationEnteredAt: now(),
          waitMinutes: 0,
        };
      })
    );
    _audit('doctor_orders', 'Queue', `Added orders (${isLinear ? 'sequential' : 'parallel'}): ${orderTypes.join(', ')}`);
  }, [_audit, queueMode]);

  // MULTI_STREAM: start a specific order (not just "current")
  const startOrder = useCallback((patientId: string, orderId: string) => {
    setQueuePatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId && p.patientId !== patientId) return p;
        const orders = p.doctorOrders.map((o) =>
          o.id === orderId ? { ...o, status: 'in-progress' as const, startedAt: now() } : o
        );
        return { ...p, doctorOrders: orders };
      })
    );
    _audit('start_order', 'Queue', `Started order ${orderId}`);
  }, [_audit]);

  // MULTI_STREAM: complete a specific order; if ALL done → advance to Return-Consult
  const completeOrder = useCallback((patientId: string, orderId: string) => {
    setQueuePatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId && p.patientId !== patientId) return p;
        const orders = p.doctorOrders.map((o) =>
          o.id === orderId ? { ...o, status: 'completed' as const, completedAt: now() } : o
        );
        const allDone = orders.length > 0 && orders.every((o) => o.status === 'completed');
        if (allDone) {
          const exitVisit: StationVisit = { ...p.journeyHistory[p.journeyHistory.length - 1], exitedAt: now() };
          const newHistory = [...p.journeyHistory.slice(0, -1), exitVisit, { station: 'Return-Consult' as StationType, enteredAt: now() }];
          return {
            ...p,
            doctorOrders: orders,
            currentOrderIndex: -1,
            stationType: 'Return-Consult' as StationType,
            stationName: 'Return-Consult',
            status: 'QUEUED' as const,
            journeyHistory: newHistory,
            currentStationEnteredAt: now(),
            waitMinutes: 0,
          };
        }
        return { ...p, doctorOrders: orders };
      })
    );
    _audit('order_complete', 'Queue', `Completed order ${orderId}`);
  }, [_audit]);

  // LINEAR sequential: complete current order → advance to next order, or Return-Consult when all done
  const completeCurrentOrder = useCallback((patientId: string) => {
    setQueuePatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId && p.patientId !== patientId) return p;
        if (p.currentOrderIndex < 0) return p;
        const orders = [...p.doctorOrders];
        orders[p.currentOrderIndex] = { ...orders[p.currentOrderIndex], status: 'completed', completedAt: now() };
        // Find next pending order and activate it
        const nextIdx = orders.findIndex((o) => o.status === 'pending');
        if (nextIdx >= 0) {
          orders[nextIdx] = { ...orders[nextIdx], status: 'queued' };
          const target = orders[nextIdx].targetStation;
          const exitVisit: StationVisit = { ...p.journeyHistory[p.journeyHistory.length - 1], exitedAt: now() };
          const newHistory = [...p.journeyHistory.slice(0, -1), exitVisit, { station: target, enteredAt: now() }];
          return {
            ...p, doctorOrders: orders, currentOrderIndex: nextIdx,
            stationType: target, stationName: target,
            status: 'QUEUED' as const, journeyHistory: newHistory,
            currentStationEnteredAt: now(), waitMinutes: 0,
          };
        }
        // All orders done → route to Return-Consult
        const exitVisit: StationVisit = { ...p.journeyHistory[p.journeyHistory.length - 1], exitedAt: now() };
        const newHistory = [...p.journeyHistory.slice(0, -1), exitVisit, { station: 'Return-Consult' as StationType, enteredAt: now() }];
        return {
          ...p, doctorOrders: orders, currentOrderIndex: -1,
          stationType: 'Return-Consult' as StationType, stationName: 'Return-Consult',
          status: 'QUEUED' as const, journeyHistory: newHistory,
          currentStationEnteredAt: now(), waitMinutes: 0,
        };
      })
    );
    _audit('order_complete', 'Queue', 'Completed current order');
  }, [_audit]);

  const callNextPatient = useCallback((stationId: string, patientId?: string) => {
    setQueuePatients((prev) => {
      if (patientId) {
        const target = prev.find((p) => p.id === patientId && p.status === 'QUEUED');
        if (!target) return prev;
        return prev.map((p) => (p.id === patientId ? { ...p, status: 'READY' as const } : p));
      }
      const queued = prev.filter(
        (p) => p.status === 'QUEUED' && (p.stationName === stationId || p.stationType === stationId)
      );
      if (queued.length === 0) return prev;
      const priorityOrder = { Emergency: 0, Senior: 1, PWD: 1, Normal: 2 };
      queued.sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2));
      const next = queued[0];
      return prev.map((p) => (p.id === next.id ? { ...p, status: 'READY' as const } : p));
    });
  }, []);

  const startPatient = useCallback((patientId: string) => {
    setQueuePatients((prev) =>
      prev.map((p) =>
        (p.patientId === patientId || p.id === patientId) ? { ...p, status: 'IN_SESSION' as const } : p
      )
    );
  }, []);

  const completePatient = useCallback((patientId: string) => {
    setQueuePatients((prev) =>
      prev.map((p) => {
        if (p.patientId !== patientId && p.id !== patientId) return p;
        const exitVisit: StationVisit = { ...p.journeyHistory[p.journeyHistory.length - 1], exitedAt: now() };
        const newHistory = [...p.journeyHistory.slice(0, -1), exitVisit];
        return { ...p, status: 'COMPLETED' as const, stationType: 'Done' as StationType, journeyHistory: newHistory };
      })
    );
  }, []);

  const markNoShow = useCallback((patientId: string) => {
    setQueuePatients((prev) =>
      prev.map((p) =>
        (p.patientId === patientId || p.id === patientId) ? { ...p, status: 'NO_SHOW' as const } : p
      )
    );
  }, []);

  const skipPatient = useCallback((patientId: string) => {
    setQueuePatients((prev) => {
      const patient = prev.find((p) => p.patientId === patientId || p.id === patientId);
      if (!patient) return prev;
      const others = prev.filter((p) => p.patientId !== patientId && p.id !== patientId);
      return [...others, { ...patient, status: 'QUEUED' as const, waitMinutes: 0 }];
    });
  }, []);

  /** Pause a patient's journey — they'll return later (fasting, next day, etc.) */
  const bookFacilitySlot = useCallback((scheduleId: string, dateStr: string) => {
    setFacilitySchedules(prev =>
      prev.map(s => {
        if (s.id !== scheduleId) return s;
        const current = s.bookedSlots[dateStr] ?? 0;
        return { ...s, bookedSlots: { ...s.bookedSlots, [dateStr]: current + 1 } };
      })
    );
    _audit('book_facility_slot', 'Scheduling', `Booked slot on ${dateStr} for schedule ${scheduleId}`);
  }, [_audit]);

  const updateFacilitySchedule = useCallback((scheduleId: string, updates: Partial<Pick<FacilitySchedule, 'dailyCap' | 'startTime' | 'endTime' | 'daysOfWeek' | 'slotDurationMin'>>) => {
    setFacilitySchedules(prev =>
      prev.map(s => s.id === scheduleId ? { ...s, ...updates } : s)
    );
    _audit('update_facility_schedule', 'Scheduling', `Updated schedule ${scheduleId}: ${JSON.stringify(updates)}`);
  }, [_audit]);

  const pausePatient = useCallback((patientId: string, reason: PauseReason, notes?: string, resumeDate?: string) => {
    setQueuePatients((prev) =>
      prev.map((p) => {
        if (p.patientId !== patientId && p.id !== patientId) return p;
        const info: PauseInfo = {
          pausedAt: now(),
          reason,
          notes,
          resumeDate,
          pausedAtStation: p.stationType,
          preservedOrders: p.doctorOrders.filter((o) => o.status !== 'completed'),
        };
        return { ...p, status: 'PAUSED' as const, pauseInfo: info };
      })
    );
    _audit('pause_patient', 'Queue', `Paused patient ${patientId} — ${reason}${notes ? `: ${notes}` : ''}`);
  }, [_audit]);

  /** Resume a paused patient's journey — re-queue at the station where they paused */
  const resumePatient = useCallback((patientId: string) => {
    setQueuePatients((prev) =>
      prev.map((p) => {
        if ((p.patientId !== patientId && p.id !== patientId) || p.status !== 'PAUSED') return p;
        return {
          ...p,
          status: 'QUEUED' as const,
          waitMinutes: 0,
          currentStationEnteredAt: now(),
          pauseInfo: undefined,
        };
      })
    );
    _audit('resume_patient', 'Queue', `Resumed paused patient ${patientId}`);
  }, [_audit]);

  /** Defer a specific order — reset it to 'queued' and move the patient to the bottom of the queue */
  const deferOrder = useCallback((patientId: string, orderId: string) => {
    setQueuePatients((prev) => {
      const patient = prev.find((p) => p.id === patientId || p.patientId === patientId);
      if (!patient) return prev;
      const updatedOrders = patient.doctorOrders.map(o =>
        o.id === orderId ? { ...o, status: 'queued' as const, startedAt: undefined } : o
      );
      const updated = { ...patient, doctorOrders: updatedOrders, waitMinutes: 0 };
      const others = prev.filter((p) => p.id !== patientId && p.patientId !== patientId);
      return [...others, updated];
    });
    _audit('defer_order', 'Queue', `Deferred order ${orderId} for patient ${patientId}`);
  }, [_audit]);

  // ── Clinical notes ──
  const signNote = useCallback((noteId: string) => {
    setClinicalNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, status: 'Signed' as const } : n)));
    _audit('sign_note', 'Clinical', `Signed note ${noteId}`);
  }, [_audit]);

  const saveDraftNote = useCallback((noteId: string, updates: Partial<ClinicalNote>) => {
    setClinicalNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, ...updates, status: 'Draft' as const } : n)));
  }, []);

  const addClinicalNote = useCallback((note: Omit<ClinicalNote, 'id'>) => {
    setClinicalNotes((prev) => [{ ...note, id: genId('note') } as ClinicalNote, ...prev]);
    _audit('add_note', 'Clinical', `Created note for ${note.patientName}`);
  }, [_audit]);

  // ── Prescriptions ──
  const approvePrescription = useCallback((id: string) => {
    setPrescriptions((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'Active' as const } : p)));
    _audit('approve_rx', 'Pharmacy', `Approved prescription ${id}`);
  }, [_audit]);

  const denyPrescription = useCallback((id: string) => {
    setPrescriptions((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'Cancelled' as const } : p)));
    _audit('deny_rx', 'Pharmacy', `Denied prescription ${id}`);
  }, [_audit]);

  const addPrescription = useCallback((rx: Omit<Prescription, 'id'>) => {
    setPrescriptions((prev) => [{ ...rx, id: genId('rx') } as Prescription, ...prev]);
    _audit('add_rx', 'Pharmacy', `New prescription for ${rx.patientName}`);
  }, [_audit]);

  const updatePrescription = useCallback((id: string, updates: Partial<Omit<Prescription, 'id'>>) => {
    setPrescriptions((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    _audit('update_rx', 'Pharmacy', `Updated prescription ${id}`);
  }, [_audit]);

  // ── Lab orders ──
  const updateLabOrderStatus = useCallback((orderId: string, status: string) => {
    setLabOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const updates: Partial<LabOrder> = { status: status as LabOrder['status'] };
        if (status === 'Specimen Collected') updates.collectedDate = now();
        if (status === 'Resulted') updates.resultedDate = now();
        return { ...o, ...updates };
      })
    );
    _audit('lab_status', 'Lab', `Updated lab order ${orderId} → ${status}`);
  }, [_audit]);

  const addLabOrder = useCallback((order: Omit<LabOrder, 'id'>) => {
    setLabOrders((prev) => [{ ...order, id: genId('lab') } as LabOrder, ...prev]);
    _audit('add_lab', 'Lab', `New lab order: ${order.testName}`);
  }, [_audit]);

  // ── Alerts ──
  const dismissAlert = useCallback((alertId: string) => {
    setCDSSAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, dismissed: true } : a)));
  }, []);

  const actionAlert = useCallback((alertId: string) => {
    setCDSSAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, actioned: true, dismissed: true } : a)));
  }, []);

  const addCdssAlert = useCallback((alert: Omit<CDSSAlert, 'id'>) => {
    setCDSSAlerts((prev) => [{ ...alert, id: genId('cdss') } as CDSSAlert, ...prev]);
  }, []);

  // ── Appointments ──
  const updateAppointmentStatus = useCallback((id: string, status: string) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: status as Appointment['status'] } : a)));
    _audit('apt_status', 'Scheduling', `Appointment ${id} → ${status}`);
  }, [_audit]);

  const addAppointment = useCallback((apt: Omit<Appointment, 'id'>) => {
    setAppointments((prev) => [{ ...apt, id: genId('apt') } as Appointment, ...prev]);
    _audit('add_apt', 'Scheduling', `New appointment for ${apt.specialty ?? 'patient'}`);
  }, [_audit]);

  const cancelAppointment = useCallback((id: string) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'Cancelled' as Appointment['status'] } : a)));
    _audit('cancel_apt', 'Scheduling', `Cancelled appointment ${id}`);
  }, [_audit]);

  // ── Messages ──
  const markMessageRead = useCallback((messageId: string) => {
    setInternalMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, read: true } : m)));
  }, []);

  const sendMessage = useCallback((msg: Omit<InternalMessage, 'id' | 'date' | 'read'>) => {
    setInternalMessages((prev) => [{ ...msg, id: genId('msg'), date: now(), read: false } as InternalMessage, ...prev]);
    _audit('send_msg', 'Communications', `Message to ${msg.toName}: ${msg.subject}`);
  }, [_audit]);

  // ── Nursing ──
  const updateNursingTaskStatus = useCallback((taskId: string, status: string) => {
    setNursingTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: status as NursingTask['status'], ...(status === 'Completed' ? { completedTime: now() } : {}) }
          : t
      )
    );
  }, []);

  const addTriageRecord = useCallback((record: TriageRecord) => {
    setTriageRecords((prev) => [record, ...prev]);
    _audit('triage', 'Nursing', `Triage for ${record.patientName}`);
  }, [_audit]);

  const addNursingTask = useCallback((task: Omit<NursingTask, 'id'>) => {
    setNursingTasks((prev) => [{ ...task, id: genId('nt') } as NursingTask, ...prev]);
  }, []);

  // ── Pharmacy ──
  const dispenseItem = useCallback((prescriptionId: string, staffName: string) => {
    const rx = prescriptions.find((p) => p.id === prescriptionId);
    if (!rx) return;
    setDispensing((prev) => [
      { id: genId('disp'), prescriptionId, patientName: rx.patientName, medication: rx.medication, quantity: rx.quantity, dispensedBy: staffName, dispensedDate: now(), status: 'Dispensed' as const },
      ...prev,
    ]);
    setPrescriptions((prev) => prev.map((p) => (p.id === prescriptionId ? { ...p, status: 'Completed' as const } : p)));
    _audit('dispense', 'Pharmacy', `Dispensed ${rx.medication} for ${rx.patientName}`);
  }, [prescriptions, _audit]);

  const updatePharmacyStock = useCallback((itemId: string, quantity: number) => {
    setPharmacyItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const newStock = item.stockLevel + quantity;
        const status: PharmacyItem['status'] = newStock <= 0 ? 'Out of Stock' : newStock < item.minStock ? 'Low Stock' : 'In Stock';
        return { ...item, stockLevel: Math.max(0, newStock), status };
      })
    );
  }, []);

  // ── Billing ──
  const addPayment = useCallback((tx: Omit<PaymentTransaction, 'id' | 'referenceNumber'>) => {
    const ref = `REF-${Date.now().toString(36).toUpperCase()}`;
    setPaymentTransactions((prev) => [{ ...tx, id: genId('tx'), referenceNumber: ref } as PaymentTransaction, ...prev]);
    _audit('payment', 'Billing', `Payment ₱${tx.amount} - ${tx.method}`);
  }, [_audit]);

  const refundPayment = useCallback((txId: string) => {
    setPaymentTransactions((prev) => prev.map((t) => (t.id === txId ? { ...t, status: 'Refunded' as const } : t)));
    _audit('refund', 'Billing', `Refunded transaction ${txId}`);
  }, [_audit]);

  // ── Staff / HR ──
  const updateStaffStatus = useCallback((staffId: string, status: StaffUser['status']) => {
    setStaff((prev) => prev.map((s) => (s.id === staffId ? { ...s, status } : s)));
    _audit('staff_status', 'HR', `Staff ${staffId} → ${status}`);
  }, [_audit]);

  const updateShiftStatus = useCallback((shiftId: string, status: ShiftSchedule['status']) => {
    setShiftSchedules((prev) => prev.map((s) => (s.id === shiftId ? { ...s, status } : s)));
  }, []);

  // ── Facility ──
  const updateRoomStatus = useCallback((roomId: string, status: Room['status']) => {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, status } : r)));
    _audit('room_status', 'Facility', `Room ${roomId} → ${status}`);
  }, [_audit]);

  const updateEquipmentStatus = useCallback((equipmentId: string, status: Equipment['status']) => {
    setEquipment((prev) => prev.map((e) => (e.id === equipmentId ? { ...e, status } : e)));
  }, []);

  // ── Events ──
  const addEvent = useCallback((event: Omit<ManagedEvent, 'id'>) => {
    setManagedEvents((prev) => [{ ...event, id: genId('evt') } as ManagedEvent, ...prev]);
    _audit('add_event', 'Events', `New event: ${event.title}`);
  }, [_audit]);

  const updateEvent = useCallback((eventId: string, updates: Partial<Omit<ManagedEvent, 'id'>>) => {
    setManagedEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, ...updates } : e)));
    _audit('update_event', 'Events', `Updated event ${eventId}`);
  }, [_audit]);

  const updateEventStatus = useCallback((eventId: string, status: ManagedEvent['status']) => {
    setManagedEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, status } : e)));
  }, []);

  const updateRegistrationStatus = useCallback((regId: string, status: EventRegistration['status']) => {
    setEventRegistrations((prev) => prev.map((r) => (r.id === regId ? { ...r, status } : r)));
  }, []);

  // ── Forms ──
  const updateFormSubmissionStatus = useCallback((subId: string, status: FormSubmission['status'], reviewNotes?: string) => {
    setFormSubmissions((prev) =>
      prev.map((s) =>
        s.id === subId ? { ...s, status, reviewedBy: currentStaff.name, ...(reviewNotes ? { reviewNotes } : {}) } : s
      )
    );
    _audit('review_form', 'Forms', `Submission ${subId} → ${status}`);
  }, [currentStaff.name, _audit]);

  const addFormTemplate = useCallback((tpl: Omit<FormTemplate, 'id' | 'createdDate' | 'usageCount'>) => {
    setFormTemplates((prev) => [
      { ...tpl, id: genId('tpl'), createdDate: now(), usageCount: 0 } as FormTemplate,
      ...prev,
    ]);
    _audit('add_form', 'Forms', `New template: ${tpl.name}`);
  }, [_audit]);

  // ── Immunization ──
  const addImmunizationRecord = useCallback((rec: Omit<ImmunizationRecord, 'id'>) => {
    setImmunizationRecords((prev) => [{ ...rec, id: genId('imm') } as ImmunizationRecord, ...prev]);
    _audit('immunize', 'Immunization', `${rec.vaccine} for ${rec.patientName}`);
  }, [_audit]);

  // ── Audit ──
  const addAuditLog = useCallback((action: string, module: string, details: string) => {
    _audit(action, module, details);
  }, [_audit]);

  // ═══════ Messaging / Conversations ═══════

  const sendChatMessage = useCallback((conversationId: string, text: string, type: ChatMessage['type'] = 'text') => {
    const newMsg: ChatMessage = {
      id: genId('cm'),
      conversationId,
      fromId: currentStaff.id,
      fromName: currentStaff.name,
      fromRole: currentStaff.role,
      text,
      timestamp: now(),
      read: true,
      type,
    };
    setChatMessages((prev) => [...prev, newMsg]);
    // Update conversation's last message
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, lastMessageText: text, lastMessageAt: now(), lastMessageFromId: currentStaff.id, lastMessageFromName: currentStaff.name }
          : c
      )
    );
  }, [currentStaff]);

  const createConversation = useCallback((type: ConversationType, name: string, participantIds: string[], departmentTag?: string): string => {
    const id = genId('conv');
    const participantNames = participantIds.map((pid) => {
      const s = staff.find((st) => st.id === pid);
      return s?.name ?? pid;
    });
    const newConv: Conversation = {
      id, type, name, participantIds, participantNames,
      departmentTag,
      lastMessageText: '', lastMessageAt: now(),
      lastMessageFromId: currentStaff.id, lastMessageFromName: currentStaff.name,
      unreadCount: 0,
    };
    setConversations((prev) => [newConv, ...prev]);
    _audit('create_conversation', 'Messaging', `Created ${type} conversation: ${name}`);
    return id;
  }, [currentStaff, staff, _audit]);

  const markConversationRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
    setChatMessages((prev) =>
      prev.map((m) => (m.conversationId === conversationId && !m.read ? { ...m, read: true } : m))
    );
  }, []);

  const totalUnreadMessages = useMemo(() =>
    conversations.reduce((acc, c) => acc + c.unreadCount, 0),
  [conversations]);

  // ═══════ Teleconsult Queue Actions ═══════

  const addTcSession = useCallback((session: Omit<TeleconsultSession, 'id'>) => {
    const newSession: TeleconsultSession = { ...session, id: genId('tcs') };
    setTcSessions((prev) => [...prev, newSession]);
    _audit('tc_session_add', 'Teleconsult', `New ${session.type} session for ${session.patientName}`);
  }, [_audit]);

  const updateTcSessionStatus = useCallback((sessionId: string, status: TeleconsultSessionStatus) => {
    setTcSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        const updates: Partial<TeleconsultSession> = { status };
        // Intake is already done before entering the queue (Consult Now: before "Join Queue"; Consult Later: at booking)
        if (status === 'in-session') updates.sessionStartedAt = now();
        if (status === 'wrap-up') updates.sessionEndedAt = now();
        if (status === 'completed') { updates.sessionEndedAt = updates.sessionEndedAt ?? now(); updates.patientOnline = false; }
        return { ...s, ...updates };
      })
    );
    _audit('tc_status', 'Teleconsult', `Session ${sessionId} → ${status}`);
  }, [_audit]);

  const assignTcDoctor = useCallback((sessionId: string, doctorId: string) => {
    const doc = tcDoctors.find((d) => d.id === doctorId);
    if (!doc) return;
    setTcSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, assignedDoctorId: doctorId, assignedDoctorName: doc.name, status: 'doctor-assigned' as const, intakeCompleted: true }
          : s
      )
    );
    _audit('tc_assign', 'Teleconsult', `Assigned ${doc.name} to session ${sessionId}`);
  }, [tcDoctors, _audit]);

  const startTcSession = useCallback((sessionId: string) => {
    setTcSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, status: 'in-session' as const, sessionStartedAt: now() }
          : s
      )
    );
    // Update the doctor status
    const session = tcSessions.find((s) => s.id === sessionId);
    if (session?.assignedDoctorId) {
      setTcDoctors((prev) =>
        prev.map((d) =>
          d.id === session.assignedDoctorId
            ? { ...d, status: 'in-session' as const, currentSessionId: sessionId, currentActivity: `Teleconsult with ${session.patientName}` }
            : d
        )
      );
    }
    _audit('tc_start', 'Teleconsult', `Session ${sessionId} started`);
  }, [tcSessions, _audit]);

  const endTcSession = useCallback((sessionId: string) => {
    const session = tcSessions.find((s) => s.id === sessionId);
    setTcSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, status: 'completed' as const, sessionEndedAt: now(), patientOnline: false }
          : s
      )
    );
    // Free the doctor
    if (session?.assignedDoctorId) {
      setTcDoctors((prev) =>
        prev.map((d) =>
          d.id === session.assignedDoctorId
            ? { ...d, status: 'available' as const, currentSessionId: undefined, currentActivity: undefined, sessionsCompleted: d.sessionsCompleted + 1 }
            : d
        )
      );
    }
    _audit('tc_end', 'Teleconsult', `Session ${sessionId} completed`);
  }, [tcSessions, _audit]);

  const markTcNoShow = useCallback((sessionId: string) => {
    setTcSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'no-show' as const, patientOnline: false } : s))
    );
    _audit('tc_noshow', 'Teleconsult', `Session ${sessionId} marked no-show`);
  }, [_audit]);

  const cancelTcSession = useCallback((sessionId: string) => {
    const session = tcSessions.find((s) => s.id === sessionId);
    setTcSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'cancelled' as const, patientOnline: false } : s))
    );
    if (session?.assignedDoctorId) {
      setTcDoctors((prev) =>
        prev.map((d) =>
          d.id === session.assignedDoctorId && d.currentSessionId === sessionId
            ? { ...d, status: 'available' as const, currentSessionId: undefined, currentActivity: undefined }
            : d
        )
      );
    }
    _audit('tc_cancel', 'Teleconsult', `Session ${sessionId} cancelled`);
  }, [tcSessions, _audit]);

  const updateTcDoctorStatus = useCallback((doctorId: string, status: DoctorTCStatus, activity?: string) => {
    setTcDoctors((prev) =>
      prev.map((d) =>
        d.id === doctorId
          ? { ...d, status, currentActivity: activity ?? d.currentActivity }
          : d
      )
    );
    _audit('tc_doctor_status', 'Teleconsult', `Doctor ${doctorId} → ${status}`);
  }, [_audit]);

  const checkInTcDoctor = useCallback((doctorId: string) => {
    setTcDoctors((prev) =>
      prev.map((d) =>
        d.id === doctorId
          ? { ...d, checkedIn: true, status: 'available' as const }
          : d
      )
    );
    _audit('tc_doctor_checkin', 'Teleconsult', `Doctor ${doctorId} checked in`);
  }, [_audit]);

  const tcStats = useMemo(() => {
    const active = tcSessions.filter((s) => !['completed', 'no-show', 'cancelled'].includes(s.status));
    const waiting = active.filter((s) => s.status === 'in-queue' || s.status === 'doctor-assigned' || s.status === 'connecting');
    const inSession = active.filter((s) => s.status === 'in-session' || s.status === 'wrap-up');
    const completed = tcSessions.filter((s) => s.status === 'completed');
    const noShow = tcSessions.filter((s) => s.status === 'no-show');
    const waitTimes = waiting.map((s) => s.waitMinutes);
    const avgWait = waitTimes.length > 0 ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : 0;
    const checkedInDocs = tcDoctors.filter((d) => d.checkedIn);
    return {
      totalWaiting: waiting.length,
      totalInSession: inSession.length,
      totalCompleted: completed.length,
      totalNoShow: noShow.length,
      avgWaitMinutes: avgWait,
      doctorsAvailable: checkedInDocs.filter((d) => d.status === 'available').length,
      doctorsInSession: checkedInDocs.filter((d) => d.status === 'in-session').length,
      doctorsOnBreak: checkedInDocs.filter((d) => d.status === 'on-break' || d.status === 'clinic-consult' || d.status === 'rounds').length,
      nowQueueLength: tcSessions.filter((s) => s.type === 'now' && !['completed', 'no-show', 'cancelled'].includes(s.status)).length,
      laterQueueLength: tcSessions.filter((s) => s.type === 'later' && !['completed', 'no-show', 'cancelled'].includes(s.status)).length,
    };
  }, [tcSessions, tcDoctors]);

  // ═══════ Branch & HomeCare ═══════

  const switchBranch = useCallback((branchId: string) => {
    setCurrentBranchId(branchId);
    _audit('switch_branch', 'Admin', `Switched to branch ${branchId}`);
  }, [_audit]);

  const updateHomeCareStatus = useCallback((requestId: string, status: HomeCareRequestStatus, updates?: Partial<HomeCareRequest>) => {
    setHomeCareRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, ...updates, status, updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
          : r
      )
    );
    _audit('homecare_status', 'HomeCare', `Request ${requestId} → ${status}`);
  }, [_audit]);

  const addHomeCareRequest = useCallback((req: Omit<HomeCareRequest, 'id'>) => {
    const newReq: HomeCareRequest = { ...req, id: genId('hc') } as HomeCareRequest;
    setHomeCareRequests((prev) => [newReq, ...prev]);
    _audit('add_homecare', 'HomeCare', `New HomeCare request from ${req.patientName}`);
  }, [_audit]);

  // ═══════ LOA Requests ═══════
  const INITIAL_LOA: ProviderLOARequest[] = [
    { id: 'loa-r1', patientName: 'Maria Santos', type: 'Specialist', provider: 'Metro General Hospital', requestDate: 'Feb 10, 2026', amount: '₱15,000', status: 'Pending', diagnosis: 'Hypertensive Heart Disease', justification: '' },
    { id: 'loa-r2', patientName: 'Jose Reyes', type: 'Laboratory', provider: 'Metro General Hospital', requestDate: 'Feb 9, 2026', amount: '₱3,500', status: 'Pending', diagnosis: 'Diabetes Mellitus Type 2', justification: '' },
    { id: 'loa-r3', patientName: 'Ana Lopez', type: 'ER', provider: 'Metro General Hospital', requestDate: 'Feb 8, 2026', amount: '₱25,000', status: 'Approved', diagnosis: 'Acute Gastroenteritis', justification: 'Emergency presentation with severe dehydration' },
    { id: 'loa-r4', patientName: 'Pedro Cruz', type: 'Inpatient', provider: 'Metro General Hospital', requestDate: 'Feb 7, 2026', amount: '₱120,000', status: 'Pending', diagnosis: 'Community-Acquired Pneumonia', justification: '' },
    { id: 'loa-r5', patientName: 'Rosa Bautista', type: 'Surgery', provider: 'Metro General Hospital', requestDate: 'Feb 6, 2026', amount: '₱250,000', status: 'Rejected', diagnosis: 'Cholecystolithiasis', justification: 'Non-emergent, requires pre-authorization' },
    { id: 'loa-mc1', patientName: 'Andrea Reyes', patientId: 'p-self', type: 'In-patient Admission', provider: 'Maxicare', requestDate: 'Feb 16, 2026', amount: '₱25,000', status: 'Pending', diagnosis: '', justification: '' },
    { id: 'loa-mc2', patientName: 'Andrea Reyes', patientId: 'p-self', type: 'Annual Physical Exam', provider: 'Maxicare PCC - Bridgetowne', requestDate: 'Feb 2, 2026', amount: '₱0.00', status: 'Approved', diagnosis: 'Routine wellness', justification: 'Annual benefit' },
    { id: 'loa-mc3', patientName: 'Andrea Reyes', patientId: 'p-mc1', type: 'Cardiac Stress Test', provider: 'Maxicare PCC - Ayala North Exchange', requestDate: 'Feb 10, 2026', amount: '₱3,500', status: 'Approved', diagnosis: 'Hypertension — baseline cardiac eval', justification: 'Pre-authorized per cardiologist referral' },
    { id: 'loa-mc4', patientName: 'Andrea Reyes', patientId: 'p-mc1', type: 'Pelvic Ultrasound', provider: 'Maxicare PCC - BGC', requestDate: 'Feb 11, 2026', amount: '₱2,800', status: 'Pending', diagnosis: 'Annual wellness screening', justification: '' },
    { id: 'loa-mc5', patientName: 'Mark Anthony Lim', patientId: 'p-mc2', type: 'Annual Physical Exam', provider: 'Maxicare PCC - Bridgetowne', requestDate: 'Jan 28, 2026', amount: '₱0.00', status: 'Approved', diagnosis: 'Routine wellness', justification: 'Annual benefit' },
    { id: 'loa-mc6', patientName: 'Mark Anthony Lim', patientId: 'p-mc2', type: 'Laboratory - HbA1c Panel', provider: 'Maxicare PCC - Bridgetowne', requestDate: 'Feb 11, 2026', amount: '₱950', status: 'Approved', diagnosis: 'Metabolic screening', justification: 'Covered under preventive benefit' },
    { id: 'loa-mc7', patientName: 'Grace Lim', patientId: 'p-mc3', type: 'Prenatal Labs Package', provider: 'Maxicare PCC - BGC', requestDate: 'Feb 9, 2026', amount: '₱4,200', status: 'Approved', diagnosis: 'Pregnancy 28 weeks — prenatal panel', justification: 'Prenatal benefit coverage' },
    { id: 'loa-mc8', patientName: 'Roberto Lim', patientId: 'p-mc6', type: 'Laboratory - Renal Panel', provider: 'Maxicare PCC - Bridgetowne', requestDate: 'Feb 12, 2026', amount: '₱1,800', status: 'Pending', diagnosis: 'DM Type 2 — nephropathy screening', justification: '' },
    { id: 'loa-mc9', patientName: 'Paolo Reyes', patientId: 'p-mc4', type: 'ER Visit', provider: 'Maxicare PCC - BGC', requestDate: 'Feb 5, 2026', amount: '₱8,500', status: 'Approved', diagnosis: 'Hypertensive urgency — BP 180/110', justification: 'Emergency presentation' },
  ];

  const [providerLoaRequests, setProviderLoaRequests] = useState<ProviderLOARequest[]>(INITIAL_LOA);

  const addProviderLoa = useCallback((req: Omit<ProviderLOARequest, 'id'>) => {
    const newLoa: ProviderLOARequest = { ...req, id: genId('loa') };
    setProviderLoaRequests((prev) => [newLoa, ...prev]);
    _audit('add_loa', 'LOA', `New LOA from ${req.patientName} — ${req.type}`);
  }, [_audit]);

  const updateProviderLoaStatus = useCallback((id: string, status: ProviderLOAStatus, justification?: string) => {
    setProviderLoaRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, justification: justification ?? r.justification } : r))
    );
    _audit('loa_status', 'LOA', `LOA ${id} → ${status}`);
  }, [_audit]);

  // ═══════ Referrals ═══════
  const addReferral = useCallback((ref: Omit<PatientReferral, 'id'>) => {
    const newRef: PatientReferral = { ...ref, id: genId('ref') } as PatientReferral;
    setReferrals((prev) => [newRef, ...prev]);
    _audit('add_referral', 'Referral', `New referral for ${ref.patientName} → ${ref.referredToSpecialty}`);
  }, [_audit]);

  const updateReferralStatus = useCallback((id: string, status: ReferralStatus, updates?: Partial<PatientReferral>) => {
    setReferrals((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const merged: PatientReferral = { ...r, ...updates, status };
        if (status === 'Accepted' && !merged.acceptedAt) merged.acceptedAt = now();
        if (status === 'Completed' && !merged.completedAt) merged.completedAt = now();
        return merged;
      })
    );
    _audit('referral_status', 'Referral', `Referral ${id} → ${status}`);
  }, [_audit]);

  // ═══════ Computed ═══════
  const pendingLabOrders = useMemo(() => labOrders.filter((o) => o.status === 'Ordered' || o.status === 'In Progress'), [labOrders]);
  const criticalAlerts = useMemo(() => cdssAlerts.filter((a) => !a.dismissed), [cdssAlerts]);
  const todayAppointments = useMemo(() => appointments.filter((a) => isToday(a.date)), [appointments]);

  const queueStats = useMemo(() => {
    const active = queuePatients.filter((p) => p.status === 'QUEUED' || p.status === 'READY' || p.status === 'IN_SESSION');
    const waitTimes = active.map((p) => p.waitMinutes).filter((n) => n >= 0);
    return {
      totalInQueue: queuePatients.filter((p) => p.status === 'QUEUED' || p.status === 'READY').length,
      avgWaitTime: waitTimes.length > 0 ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : 0,
      longestWait: waitTimes.length > 0 ? Math.max(...waitTimes) : 0,
      completedToday: queuePatients.filter((p) => p.status === 'COMPLETED').length,
    };
  }, [queuePatients]);

  const value: ProviderContextType = useMemo(
    () => ({
      currentStaff, currentApp, queueMode, doctorMode, switchStaff, switchApp, toggleQueueMode, setDoctorMode,
      staff, clinicalNotes, prescriptions, labOrders, availability, rooms, equipment,
      queuePatients, consultRooms: MOCK_CONSULT_ROOMS, shiftSchedules, pharmacyItems, dispensing, triageRecords, nursingTasks,
      formTemplates, formSubmissions, immunizationRecords, managedEvents, eventRegistrations,
      auditLogs, paymentTransactions, internalMessages, cdssAlerts, dashboardKpis, appointments,
      // Queue
      transferPatient, addDoctorOrders, startOrder, completeOrder, completeCurrentOrder, checkInPatient,
      callNextPatient, startPatient, completePatient, markNoShow, skipPatient, pausePatient, resumePatient, deferOrder,
      // Clinical
      signNote, saveDraftNote, addClinicalNote,
      // Prescriptions
      approvePrescription, denyPrescription, addPrescription, updatePrescription,
      // Lab
      updateLabOrderStatus, addLabOrder,
      // Alerts
      dismissAlert, actionAlert, addCdssAlert,
      // Appointments
      updateAppointmentStatus, addAppointment, cancelAppointment,
      // Messages
      markMessageRead, sendMessage,
      // Nursing
      updateNursingTaskStatus, addTriageRecord, addNursingTask,
      // Pharmacy
      dispenseItem, updatePharmacyStock,
      // Billing
      addPayment, refundPayment,
      // Staff
      updateStaffStatus, updateShiftStatus,
      // Facility
      updateRoomStatus, updateEquipmentStatus,
      // Events
      addEvent, updateEvent, updateEventStatus, updateRegistrationStatus,
      // Forms
      updateFormSubmissionStatus, addFormTemplate,
      // Immunization
      addImmunizationRecord,
      // Audit
      addAuditLog,
      // Messaging
      conversations, chatMessages, sendChatMessage, createConversation, markConversationRead, totalUnreadMessages,
      // Teleconsult Queue
      tcSessions, tcDoctors,
      addTcSession, updateTcSessionStatus, assignTcDoctor, startTcSession, endTcSession,
      markTcNoShow, cancelTcSession, updateTcDoctorStatus, checkInTcDoctor, tcStats,
      // Active teleconsult call
      activeTeleconsultCall, setActiveTeleconsultCall,
      // Branch
      currentBranchId, availableBranches, switchBranch,
      // HomeCare
      homeCareRequests, updateHomeCareStatus, addHomeCareRequest,
      // LOA
      providerLoaRequests, addProviderLoa, updateProviderLoaStatus,
      // Facility Schedules
      facilitySchedules, bookFacilitySlot, updateFacilitySchedule,
      // Referrals
      referrals, addReferral, updateReferralStatus,
      // Computed
      pendingLabOrders, criticalAlerts, todayAppointments, queueStats,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      currentStaff, currentApp, queueMode, doctorMode, staff, clinicalNotes, prescriptions, labOrders,
      availability, rooms, equipment, queuePatients, shiftSchedules, pharmacyItems, dispensing,
      triageRecords, nursingTasks, formTemplates, formSubmissions, immunizationRecords,
      managedEvents, eventRegistrations, auditLogs, paymentTransactions, internalMessages,
      cdssAlerts, dashboardKpis, appointments, pendingLabOrders, criticalAlerts, todayAppointments, queueStats,
      conversations, chatMessages, totalUnreadMessages,
      tcSessions, tcDoctors, tcStats, activeTeleconsultCall,
      currentBranchId, homeCareRequests, providerLoaRequests,
      switchStaff, switchApp, toggleQueueMode, setDoctorMode, setActiveTeleconsultCall, transferPatient, addDoctorOrders, startOrder, completeOrder, completeCurrentOrder,
      checkInPatient, callNextPatient, startPatient, completePatient, markNoShow, skipPatient, pausePatient, resumePatient, deferOrder,
      signNote, saveDraftNote, addClinicalNote, approvePrescription, denyPrescription, addPrescription, updatePrescription,
      updateLabOrderStatus, addLabOrder, dismissAlert, actionAlert, addCdssAlert, updateAppointmentStatus, addAppointment, cancelAppointment,
      markMessageRead, sendMessage, updateNursingTaskStatus, addTriageRecord, addNursingTask,
      dispenseItem, updatePharmacyStock, addPayment, refundPayment,
      updateStaffStatus, updateShiftStatus, updateRoomStatus, updateEquipmentStatus,
      addEvent, updateEvent, updateEventStatus, updateRegistrationStatus,
      updateFormSubmissionStatus, addFormTemplate, addImmunizationRecord, addAuditLog,
      addTcSession, updateTcSessionStatus, assignTcDoctor, startTcSession, endTcSession,
      markTcNoShow, cancelTcSession, updateTcDoctorStatus, checkInTcDoctor,
      sendChatMessage, createConversation, markConversationRead,
      switchBranch, updateHomeCareStatus, addHomeCareRequest,
      addProviderLoa, updateProviderLoaStatus,
    ]
  );

  return <ProviderContext.Provider value={value}>{children}</ProviderContext.Provider>;
};

export const useProvider = () => {
  const context = useContext(ProviderContext);
  if (!context) throw new Error('useProvider must be used within a ProviderProvider');
  return context;
};
