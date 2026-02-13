import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
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
} from '../data/providerMockData';
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
} from '../types';

type CurrentApp = 'provider' | 'doctor';
type QueueMode = 'LINEAR' | 'MULTI_STREAM';

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
  switchStaff: (staffId: string) => void;
  switchApp: (app: CurrentApp) => void;
  toggleQueueMode: () => void;

  // Data state
  staff: StaffUser[];
  clinicalNotes: ClinicalNote[];
  prescriptions: Prescription[];
  labOrders: LabOrder[];
  availability: DoctorAvailability[];
  rooms: Room[];
  equipment: Equipment[];
  queuePatients: QueuePatient[];
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
  /** LINEAR: advance patient to next station in the swim lane */
  transferPatient: (patientId: string, toStation: StationType) => void;
  /** MULTI_STREAM: doctor adds orders — ALL orders queued in parallel */
  addDoctorOrders: (patientId: string, orderTypes: DoctorOrderType[]) => void;
  /** MULTI_STREAM: start a specific order (set in-progress) */
  startOrder: (patientId: string, orderId: string) => void;
  /** MULTI_STREAM: complete a specific order; if all done → advance to post-order */
  completeOrder: (patientId: string, orderId: string) => void;
  /** Legacy: mark current order complete (sequential fallback) */
  completeCurrentOrder: (patientId: string) => void;
  /** Check in a new walk-in patient */
  checkInPatient: (name: string, complaint: string, priority: QueuePatient['priority']) => void;
  callNextPatient: (stationId: string) => void;
  startPatient: (patientId: string) => void;
  completePatient: (patientId: string) => void;
  markNoShow: (patientId: string) => void;
  skipPatient: (patientId: string) => void;

  // ── Clinical notes ──
  signNote: (noteId: string) => void;
  saveDraftNote: (noteId: string, updates: Partial<ClinicalNote>) => void;
  addClinicalNote: (note: Omit<ClinicalNote, 'id'>) => void;

  // ── Prescriptions ──
  approvePrescription: (prescriptionId: string) => void;
  denyPrescription: (prescriptionId: string) => void;
  addPrescription: (rx: Omit<Prescription, 'id'>) => void;

  // ── Lab orders ──
  updateLabOrderStatus: (orderId: string, status: string) => void;
  addLabOrder: (order: Omit<LabOrder, 'id'>) => void;

  // ── Alerts ──
  dismissAlert: (alertId: string) => void;
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
  updateEventStatus: (eventId: string, status: ManagedEvent['status']) => void;
  updateRegistrationStatus: (regId: string, status: EventRegistration['status']) => void;

  // ── Forms ──
  updateFormSubmissionStatus: (subId: string, status: FormSubmission['status'], reviewNotes?: string) => void;
  addFormTemplate: (tpl: Omit<FormTemplate, 'id' | 'createdDate' | 'usageCount'>) => void;

  // ── Immunization ──
  addImmunizationRecord: (rec: Omit<ImmunizationRecord, 'id'>) => void;

  // ── Audit ──
  addAuditLog: (action: string, module: string, details: string) => void;

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
  const firstDoctor = MOCK_STAFF.find((s) => s.role === 'doctor') ?? MOCK_STAFF[0];

  const [currentStaff, setCurrentStaff] = useState<StaffUser>(firstDoctor);
  const [currentApp, setCurrentApp] = useState<CurrentApp>('provider');
  const [queueMode, setQueueMode] = useState<QueueMode>('LINEAR');

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

  // ── Basic switches ──
  const switchStaff = useCallback((staffId: string) => {
    const found = staff.find((s) => s.id === staffId);
    if (found) setCurrentStaff(found);
  }, [staff]);
  const switchApp = useCallback((app: CurrentApp) => setCurrentApp(app), []);
  const toggleQueueMode = useCallback(() => setQueueMode((p) => (p === 'LINEAR' ? 'MULTI_STREAM' : 'LINEAR')), []);

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

  const transferPatient = useCallback((patientId: string, toStation: StationType) => {
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
        };
      })
    );
    _audit('transfer', 'Queue', `Transferred patient to ${toStation}`);
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

  const callNextPatient = useCallback((stationId: string) => {
    setQueuePatients((prev) => {
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
      currentStaff, currentApp, queueMode, switchStaff, switchApp, toggleQueueMode,
      staff, clinicalNotes, prescriptions, labOrders, availability, rooms, equipment,
      queuePatients, shiftSchedules, pharmacyItems, dispensing, triageRecords, nursingTasks,
      formTemplates, formSubmissions, immunizationRecords, managedEvents, eventRegistrations,
      auditLogs, paymentTransactions, internalMessages, cdssAlerts, dashboardKpis, appointments,
      // Queue
      transferPatient, addDoctorOrders, startOrder, completeOrder, completeCurrentOrder, checkInPatient,
      callNextPatient, startPatient, completePatient, markNoShow, skipPatient,
      // Clinical
      signNote, saveDraftNote, addClinicalNote,
      // Prescriptions
      approvePrescription, denyPrescription, addPrescription,
      // Lab
      updateLabOrderStatus, addLabOrder,
      // Alerts
      dismissAlert, addCdssAlert,
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
      addEvent, updateEventStatus, updateRegistrationStatus,
      // Forms
      updateFormSubmissionStatus, addFormTemplate,
      // Immunization
      addImmunizationRecord,
      // Audit
      addAuditLog,
      // Computed
      pendingLabOrders, criticalAlerts, todayAppointments, queueStats,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      currentStaff, currentApp, queueMode, staff, clinicalNotes, prescriptions, labOrders,
      availability, rooms, equipment, queuePatients, shiftSchedules, pharmacyItems, dispensing,
      triageRecords, nursingTasks, formTemplates, formSubmissions, immunizationRecords,
      managedEvents, eventRegistrations, auditLogs, paymentTransactions, internalMessages,
      cdssAlerts, dashboardKpis, appointments, pendingLabOrders, criticalAlerts, todayAppointments, queueStats,
      switchStaff, switchApp, toggleQueueMode, transferPatient, addDoctorOrders, startOrder, completeOrder, completeCurrentOrder,
      checkInPatient, callNextPatient, startPatient, completePatient, markNoShow, skipPatient,
      signNote, saveDraftNote, addClinicalNote, approvePrescription, denyPrescription, addPrescription,
      updateLabOrderStatus, addLabOrder, dismissAlert, addCdssAlert, updateAppointmentStatus, addAppointment, cancelAppointment,
      markMessageRead, sendMessage, updateNursingTaskStatus, addTriageRecord, addNursingTask,
      dispenseItem, updatePharmacyStock, addPayment, refundPayment,
      updateStaffStatus, updateShiftStatus, updateRoomStatus, updateEquipmentStatus,
      addEvent, updateEventStatus, updateRegistrationStatus,
      updateFormSubmissionStatus, addFormTemplate, addImmunizationRecord, addAuditLog,
    ]
  );

  return <ProviderContext.Provider value={value}>{children}</ProviderContext.Provider>;
};

export const useProvider = () => {
  const context = useContext(ProviderContext);
  if (!context) throw new Error('useProvider must be used within a ProviderProvider');
  return context;
};
