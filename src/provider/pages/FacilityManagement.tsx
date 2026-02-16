import { useState, useMemo, useCallback } from 'react';
import {
  Building2,
  Stethoscope,
  FlaskConical,
  Scan,
  BedDouble,
  AlertCircle,
  Wrench,
  LayoutGrid,
  BarChart3,
  MapPin,
  User,
  Clock,
  CheckCircle,
  CalendarClock,
  Activity,
  Edit3,
  Save,
  X,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  BarChart2,
} from 'lucide-react';
import React from 'react';
import { useProvider } from '../context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';
import { useToast } from '../../context/ToastContext';
import type { Room, Equipment, FacilitySchedule, FacilityCategoryId } from '../types';

const ROOM_TYPE_ICONS: Record<Room['type'], React.ComponentType<{ size?: number }>> = {
  Consultation: Stethoscope,
  Procedure: Wrench,
  Imaging: Scan,
  Lab: FlaskConical,
  Ward: BedDouble,
  OR: Stethoscope,
  Triage: AlertCircle,
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Available: { bg: 'var(--color-success-light)', color: 'var(--color-success)' },
  Occupied: { bg: 'var(--color-error-light)', color: 'var(--color-error)' },
  Maintenance: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' },
  Cleaning: { bg: 'var(--color-gray-200)', color: 'var(--color-text-muted)' },
};

const EQUIPMENT_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Available: { bg: 'var(--color-success-light)', color: 'var(--color-success)' },
  'In Use': { bg: 'var(--color-info-light)', color: 'var(--color-info)' },
  Maintenance: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' },
  'Out of Service': { bg: 'var(--color-error-light)', color: 'var(--color-error)' },
};

const MOCK_SERVICES = [
  { id: '1', name: 'General Consultation', category: 'Consultation', duration: '15 min', fee: 800, available: true },
  { id: '2', name: 'Specialist Consultation', category: 'Consultation', duration: '30 min', fee: 1500, available: true },
  { id: '3', name: 'Executive Check-up', category: 'Consultation', duration: '60 min', fee: 3500, available: true },
  { id: '4', name: 'CBC', category: 'Laboratory', duration: '30 min', fee: 350, available: true },
  { id: '5', name: 'Lipid Panel', category: 'Laboratory', duration: '1 day', fee: 450, available: true },
  { id: '6', name: 'HbA1c', category: 'Laboratory', duration: '1 day', fee: 380, available: true },
  { id: '7', name: 'Urinalysis', category: 'Laboratory', duration: '30 min', fee: 180, available: true },
  { id: '8', name: 'Chest X-Ray', category: 'Imaging', duration: '20 min', fee: 650, available: true },
  { id: '9', name: 'Ultrasound - Abdominal', category: 'Imaging', duration: '30 min', fee: 1200, available: true },
  { id: '10', name: 'CT Scan', category: 'Imaging', duration: '45 min', fee: 5500, available: true },
  { id: '11', name: '2D Echo', category: 'Cardiology', duration: '30 min', fee: 2500, available: true },
  { id: '12', name: 'ECG', category: 'Cardiology', duration: '15 min', fee: 350, available: true },
  { id: '13', name: 'Stress Test', category: 'Cardiology', duration: '45 min', fee: 3200, available: false },
  { id: '14', name: 'Minor Surgery', category: 'Special Procedures', duration: '60 min', fee: 5000, available: true },
  { id: '15', name: 'Dressing/Wound Care', category: 'Special Procedures', duration: '15 min', fee: 250, available: true },
  { id: '16', name: 'Vaccination', category: 'Special Procedures', duration: '15 min', fee: 450, available: true },
];

const styles: Record<string, React.CSSProperties> = {
  page: { padding: 24, background: 'var(--color-background)', minHeight: '100%' },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--color-text)', marginBottom: 24 },
  tabs: { display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap', borderBottom: '1px solid var(--color-border)', paddingBottom: 0 },
  tab: { padding: '12px 16px', fontSize: 14, fontWeight: 600, color: 'var(--color-text-muted)', background: 'none', borderWidth: 0, borderStyle: 'none' as const, borderBottomWidth: 3, borderBottomStyle: 'solid' as const, borderBottomColor: 'transparent', cursor: 'pointer', marginBottom: -1 },
  tabActive: { color: 'var(--color-primary)', borderBottomColor: 'var(--color-primary)' },
  card: { background: 'var(--color-surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', padding: 16 },
  badge: { padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 },
  utilBar: { display: 'flex', gap: 8, padding: 12, background: 'var(--color-surface)', borderRadius: 'var(--radius)', marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' },
  chip: { padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer' },
  chipActive: { background: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: 12, borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)', fontWeight: 600 },
  td: { padding: 12, borderBottom: '1px solid var(--color-border)', color: 'var(--color-text)' },
  btn: { padding: '8px 16px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 },
  btnPrimary: { background: 'var(--color-primary)', color: 'white' },
  btnSecondary: { background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' },
  select: { padding: '6px 10px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'var(--color-surface)', color: 'var(--color-text)' },
};

const ROOM_STATUSES: Room['status'][] = ['Available', 'Occupied', 'Maintenance', 'Cleaning'];
const EQUIPMENT_STATUSES: Equipment['status'][] = ['Available', 'In Use', 'Maintenance', 'Out of Service'];

interface ScheduleEditDraft {
  dailyCap: number;
  startTime: string;
  endTime: string;
  slotDurationMin: number;
  daysOfWeek: number[];
}

export const FacilityManagement = () => {
  const { tenant } = useTheme();
  const { rooms, equipment, updateRoomStatus, updateEquipmentStatus, addAuditLog, facilitySchedules, updateFacilitySchedule, bookFacilitySlot } = useProvider();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'rooms' | 'equipment' | 'services' | 'schedules'>('rooms');
  const [roomFilter, setRoomFilter] = useState<string | null>(null);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ScheduleEditDraft | null>(null);
  const [simulateDate, setSimulateDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [scheduleViewMode, setScheduleViewMode] = useState<'week' | 'month'>('week');
  const [monthCalendarMonth, setMonthCalendarMonth] = useState<Date>(() => new Date());

  const admissionsEnabled = tenant.features.admissions === true;
  const labFulfillmentEnabled = tenant.features.visits.clinicLabFulfillmentEnabled;

  const filteredRooms = useMemo(() => {
    let list = rooms;
    if (!admissionsEnabled) {
      list = list.filter((r) => r.type !== 'Ward' && r.type !== 'OR');
    }
    if (!roomFilter) return list;
    return list.filter((r) => r.status === roomFilter);
  }, [rooms, roomFilter, admissionsEnabled]);

  const roomsByFloor = useMemo(() => {
    const map = new Map<string, Room[]>();
    filteredRooms.forEach((r) => {
      const key = `Floor ${r.floor} - ${r.wing}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredRooms]);

  const utilization = useMemo(() => {
    const total = rooms.length;
    const occupied = rooms.filter((r) => r.status === 'Occupied').length;
    return total ? Math.round((occupied / total) * 100) : 0;
  }, [rooms]);

  const handleRoomStatusChange = (roomId: string, roomName: string, newStatus: Room['status']) => {
    updateRoomStatus(roomId, newStatus);
    addAuditLog('room_status_change', 'Facility', `Room "${roomName}" status changed to ${newStatus}`);
    showToast(`Room "${roomName}" updated to ${newStatus}`, 'success');
  };

  const handleEquipmentStatusChange = (eqId: string, eqName: string, newStatus: Equipment['status']) => {
    updateEquipmentStatus(eqId, newStatus);
    addAuditLog('equipment_status_change', 'Facility', `Equipment "${eqName}" status changed to ${newStatus}`);
    showToast(`Equipment "${eqName}" updated to ${newStatus}`, 'success');
  };

  const startEditing = useCallback((sched: FacilitySchedule) => {
    setEditingScheduleId(sched.id);
    setEditDraft({
      dailyCap: sched.dailyCap,
      startTime: sched.startTime,
      endTime: sched.endTime,
      slotDurationMin: sched.slotDurationMin,
      daysOfWeek: [...sched.daysOfWeek],
    });
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingScheduleId(null);
    setEditDraft(null);
  }, []);

  const saveEditing = useCallback(() => {
    if (!editingScheduleId || !editDraft) return;
    updateFacilitySchedule(editingScheduleId, {
      dailyCap: editDraft.dailyCap,
      startTime: editDraft.startTime,
      endTime: editDraft.endTime,
      slotDurationMin: editDraft.slotDurationMin,
      daysOfWeek: editDraft.daysOfWeek,
    });
    addAuditLog('schedule_update', 'Scheduling', `Updated schedule ${editingScheduleId}`);
    showToast('Schedule updated successfully', 'success');
    setEditingScheduleId(null);
    setEditDraft(null);
  }, [editingScheduleId, editDraft, updateFacilitySchedule, addAuditLog, showToast]);

  const toggleDow = useCallback((dow: number) => {
    setEditDraft(prev => {
      if (!prev) return prev;
      const has = prev.daysOfWeek.includes(dow);
      return {
        ...prev,
        daysOfWeek: has ? prev.daysOfWeek.filter(d => d !== dow) : [...prev.daysOfWeek, dow].sort(),
      };
    });
  }, []);

  const handleSimulateBooking = useCallback((schedId: string) => {
    bookFacilitySlot(schedId, simulateDate);
    showToast(`Simulated booking on ${simulateDate}`, 'success');
  }, [bookFacilitySlot, simulateDate, showToast]);

  const LAB_IMAGING_CATEGORIES = ['Laboratory', 'Imaging'];

  const serviceByCategory = useMemo(() => {
    const map = new Map<string, typeof MOCK_SERVICES>();
    MOCK_SERVICES.forEach((s) => {
      if (!labFulfillmentEnabled && LAB_IMAGING_CATEGORIES.includes(s.category)) return;
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category)!.push(s);
    });
    return Array.from(map.entries());
  }, [labFulfillmentEnabled]);

  // ── Tenant-filtered facility schedules ──
  const tenantSchedules = useMemo(
    () => facilitySchedules.filter(s => s.tenantId === tenant.id),
    [facilitySchedules, tenant.id],
  );

  const CATEGORY_LABELS: Record<FacilityCategoryId, { label: string; icon: React.ComponentType<{ size?: number }> }> = {
    lab: { label: 'Laboratory', icon: FlaskConical },
    imaging: { label: 'Radiology / Imaging', icon: Scan },
    cardio: { label: 'Cardiovascular', icon: Activity },
    special: { label: 'Special Procedures', icon: Stethoscope },
  };

  const schedulesByCategory = useMemo(() => {
    const map = new Map<FacilityCategoryId, FacilitySchedule[]>();
    tenantSchedules.forEach(s => {
      if (!map.has(s.categoryId)) map.set(s.categoryId, []);
      map.get(s.categoryId)!.push(s);
    });
    return Array.from(map.entries());
  }, [tenantSchedules]);

  const DOW_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DOW_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getNext7DaysUsage = (sched: FacilitySchedule) => {
    const days: { date: string; iso: string; dow: number; booked: number; cap: number; operates: boolean }[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dow = d.getDay();
      const operates = sched.daysOfWeek.includes(dow);
      const booked = sched.bookedSlots[iso] ?? 0;
      days.push({ date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), iso, dow, booked, cap: sched.dailyCap, operates });
    }
    return days;
  };

  const getMonthCalendarDays = useCallback((sched: FacilitySchedule, month: Date) => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const firstDay = new Date(year, m, 1);
    const lastDay = new Date(year, m + 1, 0);
    const startPad = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const todayISO = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();

    const cells: { day: number; iso: string; dow: number; booked: number; cap: number; operates: boolean; isToday: boolean; inMonth: boolean }[] = [];
    for (let i = 0; i < startPad; i++) {
      cells.push({ day: 0, iso: '', dow: i, booked: 0, cap: 0, operates: false, isToday: false, inMonth: false });
    }
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, m, d);
      const dow = date.getDay();
      const iso = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const operates = sched.daysOfWeek.includes(dow);
      const booked = sched.bookedSlots[iso] ?? 0;
      cells.push({ day: d, iso, dow, booked, cap: sched.dailyCap, operates, isToday: iso === todayISO, inMonth: true });
    }
    const remainder = cells.length % 7;
    if (remainder > 0) {
      for (let i = 0; i < 7 - remainder; i++) {
        cells.push({ day: 0, iso: '', dow: 0, booked: 0, cap: 0, operates: false, isToday: false, inMonth: false });
      }
    }
    return cells;
  }, []);

  const monthLabel = useMemo(() => monthCalendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), [monthCalendarMonth]);

  const prevMonth = useCallback(() => setMonthCalendarMonth(prev => {
    const d = new Date(prev);
    d.setMonth(d.getMonth() - 1);
    return d;
  }), []);

  const nextMonth = useCallback(() => setMonthCalendarMonth(prev => {
    const d = new Date(prev);
    d.setMonth(d.getMonth() + 1);
    return d;
  }), []);

  const goToToday = useCallback(() => setMonthCalendarMonth(new Date()), []);

  const tabs = [
    { id: 'rooms' as const, label: 'Rooms', icon: LayoutGrid },
    { id: 'equipment' as const, label: 'Equipment', icon: Wrench },
    { id: 'services' as const, label: 'Services', icon: Stethoscope },
    { id: 'schedules' as const, label: 'Schedules & Capacity', icon: CalendarClock },
  ];

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Facility Management</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 24, fontSize: 14 }}>
        {tenant.name} · Manage rooms, equipment, and services
      </p>

      <div style={styles.tabs}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            style={{ ...styles.tab, ...(activeTab === id ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(id)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon size={16} />
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* ─── ROOMS TAB ─── */}
      {activeTab === 'rooms' && (
        <>
          <div style={styles.utilBar}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, color: 'var(--color-primary)' }}>
              <BarChart3 size={20} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>Room Utilization</span>
              <div style={{ flex: 1, maxWidth: 200, height: 8, background: 'var(--color-border)', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${utilization}%`,
                    height: '100%',
                    background: utilization > 80 ? 'var(--color-error)' : 'var(--color-primary)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{utilization}% occupied</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {ROOM_STATUSES.map((status) => (
                <button
                  key={status}
                  style={{ ...styles.chip, ...(roomFilter === status ? styles.chipActive : {}) }}
                  onClick={() => setRoomFilter(roomFilter === status ? null : status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {roomsByFloor.map(([floorKey, floorRooms]) => (
            <div key={floorKey} style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                {floorKey}
              </h3>
              <div style={styles.grid}>
                {floorRooms.map((room) => {
                  const TypeIcon = ROOM_TYPE_ICONS[room.type];
                  const statusStyle = STATUS_COLORS[room.status] || STATUS_COLORS.Available;
                  return (
                    <div key={room.id} style={styles.card}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                            <TypeIcon size={18} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{room.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{room.type}</div>
                          </div>
                        </div>
                        <select
                          value={room.status}
                          onChange={(e) => handleRoomStatusChange(room.id, room.name, e.target.value as Room['status'])}
                          style={{
                            ...styles.select,
                            background: statusStyle.bg,
                            color: statusStyle.color,
                            borderColor: statusStyle.color,
                          }}
                        >
                          {ROOM_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={12} />
                          F{room.floor} · {room.wing}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <User size={12} />
                          Cap: {room.capacity}
                        </span>
                      </div>
                      {room.currentPatient && (
                        <div style={{ marginTop: 8, padding: 8, background: 'var(--color-gray-100)', borderRadius: 6 }}>
                          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>Current Patient</div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{room.currentPatient}</div>
                        </div>
                      )}
                      {room.assignedDoctor && !room.currentPatient && (
                        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-text-muted)' }}>Dr: {room.assignedDoctor}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {filteredRooms.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
              No rooms match the current filter.
            </div>
          )}
        </>
      )}

      {/* ─── EQUIPMENT TAB ─── */}
      {activeTab === 'equipment' && (
        <div style={{ ...styles.card, overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Last Maintenance</th>
                <th style={styles.th}>Next Maintenance</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((eq) => {
                const room = eq.roomId ? rooms.find((r) => r.id === eq.roomId) : null;
                const roomName = room ? room.name : '—';
                const eqStatusStyle = EQUIPMENT_STATUS_COLORS[eq.status] || EQUIPMENT_STATUS_COLORS.Available;
                return (
                  <tr key={eq.id}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Wrench size={16} style={{ color: 'var(--color-primary)' }} />
                        <span style={{ fontWeight: 600 }}>{eq.name}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{eq.type}</td>
                    <td style={styles.td}>{roomName}</td>
                    <td style={styles.td}>
                      <select
                        value={eq.status}
                        onChange={(e) => handleEquipmentStatusChange(eq.id, eq.name, e.target.value as Equipment['status'])}
                        style={{
                          ...styles.select,
                          background: eqStatusStyle.bg,
                          color: eqStatusStyle.color,
                          borderColor: eqStatusStyle.color,
                        }}
                      >
                        {EQUIPMENT_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td style={styles.td}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle size={12} style={{ color: 'var(--color-success)' }} />
                        {eq.lastMaintenance}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={14} style={{ color: 'var(--color-warning)' }} />
                        {eq.nextMaintenance}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {equipment.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
              No equipment records found.
            </div>
          )}
        </div>
      )}

      {/* ─── SERVICES TAB ─── */}
      {activeTab === 'services' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {serviceByCategory.map(([category, items]) => (
            <div key={category}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 12 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Building2 size={18} style={{ color: 'var(--color-primary)' }} />
                  {category}
                </span>
              </h3>
              <div style={styles.grid}>
                {items.map((svc) => (
                  <div key={svc.id} style={styles.card}>
                    <div style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>{svc.name}</div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> {svc.duration}
                      </span>
                      <span>₱{svc.fee.toLocaleString()}</span>
                    </div>
                    <span style={{ ...styles.badge, ...(svc.available ? STATUS_COLORS.Available : STATUS_COLORS.Maintenance) }}>
                      {svc.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Schedules & Capacity Tab ── */}
      {activeTab === 'schedules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* View toggle + summary stats */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flex: 1 }}>
              {schedulesByCategory.map(([catId, scheds]) => {
                const catInfo = CATEGORY_LABELS[catId];
                const CatIcon = catInfo.icon;
                const totalCap = scheds.reduce((sum, s) => sum + s.dailyCap, 0);
                return (
                  <div key={catId} style={{ ...styles.card, flex: '1 1 140px', padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <CatIcon size={14} />
                      <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--color-text)' }}>{catInfo.label}</span>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary)' }}>{totalCap}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{scheds.length} schedule{scheds.length > 1 ? 's' : ''}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', background: 'var(--color-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
              <button onClick={() => setScheduleViewMode('week')} style={{ padding: '8px 14px', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, background: scheduleViewMode === 'week' ? 'var(--color-primary)' : 'transparent', color: scheduleViewMode === 'week' ? '#fff' : 'var(--color-text-muted)' }}>
                <BarChart2 size={14} /> Week
              </button>
              <button onClick={() => setScheduleViewMode('month')} style={{ padding: '8px 14px', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, background: scheduleViewMode === 'month' ? 'var(--color-primary)' : 'transparent', color: scheduleViewMode === 'month' ? '#fff' : 'var(--color-text-muted)' }}>
                <CalendarDays size={14} /> Month
              </button>
            </div>
          </div>

          {/* Schedules by category */}
          {schedulesByCategory.map(([catId, scheds]) => {
            const catInfo = CATEGORY_LABELS[catId];
            const CatIcon = catInfo.icon;
            return (
              <div key={catId}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CatIcon size={18} style={{ color: 'var(--color-primary)' }} />
                  {catInfo.label}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {scheds.map(sched => {
                    const days = getNext7DaysUsage(sched);
                    const todayUsage = days[0];
                    const todayPct = todayUsage.operates ? Math.round((todayUsage.booked / todayUsage.cap) * 100) : 0;
                    const isEditing = editingScheduleId === sched.id;
                    return (
                      <div key={sched.id} style={{ ...styles.card, padding: 0, overflow: 'hidden', border: isEditing ? '2px solid var(--color-primary)' : undefined }}>
                        {/* Header with edit button */}
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)' }}>
                              {sched.procedureName ?? catInfo.label}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                              Branch: {sched.branchId} · {sched.startTime} – {sched.endTime} · {sched.slotDurationMin}min slots
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <span style={{ ...styles.badge, background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-primary)' }}>
                              Cap: {sched.dailyCap}/day
                            </span>
                            <span style={{ ...styles.badge, background: 'color-mix(in srgb, var(--color-info) 12%, transparent)', color: 'var(--color-info)' }}>
                              {sched.daysOfWeek.map(d => DOW_NAMES[d]).join(', ')}
                            </span>
                            {!isEditing ? (
                              <button onClick={() => { setEditingScheduleId(sched.id); setEditDraft({ dailyCap: sched.dailyCap, startTime: sched.startTime, endTime: sched.endTime, slotDurationMin: sched.slotDurationMin, daysOfWeek: [...sched.daysOfWeek] }); }} style={{ ...styles.btn, ...styles.btnSecondary, padding: '4px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Edit3 size={12} /> Edit
                              </button>
                            ) : (
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button onClick={() => { if (editDraft) { updateFacilitySchedule(sched.id, editDraft); showToast('Schedule updated', 'success'); } setEditingScheduleId(null); setEditDraft(null); }} style={{ ...styles.btn, background: 'var(--color-success)', color: '#fff', padding: '4px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Save size={12} /> Save
                                </button>
                                <button onClick={() => { setEditingScheduleId(null); setEditDraft(null); }} style={{ ...styles.btn, ...styles.btnSecondary, padding: '4px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <X size={12} /> Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Inline edit form */}
                        {isEditing && editDraft && (
                          <div style={{ padding: '12px 16px', background: 'color-mix(in srgb, var(--color-primary) 4%, var(--color-background))', borderBottom: '1px solid var(--color-border)', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
                            <div>
                              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Daily Cap</label>
                              <input type="number" min={1} max={200} value={editDraft.dailyCap} onChange={e => setEditDraft({ ...editDraft, dailyCap: parseInt(e.target.value) || 1 })} style={{ ...styles.select, width: 70 }} />
                            </div>
                            <div>
                              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Start</label>
                              <input type="time" value={editDraft.startTime} onChange={e => setEditDraft({ ...editDraft, startTime: e.target.value })} style={{ ...styles.select, width: 100 }} />
                            </div>
                            <div>
                              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>End</label>
                              <input type="time" value={editDraft.endTime} onChange={e => setEditDraft({ ...editDraft, endTime: e.target.value })} style={{ ...styles.select, width: 100 }} />
                            </div>
                            <div>
                              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Slot (min)</label>
                              <select value={editDraft.slotDurationMin} onChange={e => setEditDraft({ ...editDraft, slotDurationMin: parseInt(e.target.value) })} style={{ ...styles.select, width: 70 }}>
                                {[15, 20, 30, 45, 60].map(v => <option key={v} value={v}>{v}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Operating Days</label>
                              <div style={{ display: 'flex', gap: 3 }}>
                                {DOW_NAMES.map((name, idx) => {
                                  const active = editDraft.daysOfWeek.includes(idx);
                                  return (
                                    <button key={idx} onClick={() => setEditDraft({ ...editDraft, daysOfWeek: active ? editDraft.daysOfWeek.filter(d => d !== idx) : [...editDraft.daysOfWeek, idx].sort() })} style={{ width: 32, height: 28, borderRadius: 6, border: '1px solid ' + (active ? 'var(--color-primary)' : 'var(--color-border)'), background: active ? 'var(--color-primary)' : 'var(--color-surface)', color: active ? '#fff' : 'var(--color-text-muted)', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                                      {name.slice(0, 2)}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ── WEEK VIEW: 7-day bar chart ── */}
                        {scheduleViewMode === 'week' && (
                          <div style={{ padding: '12px 16px' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Next 7 Days — Capacity Usage
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {days.map((day, i) => {
                                const pct = day.operates ? Math.round((day.booked / day.cap) * 100) : 0;
                                const barColor = !day.operates ? '#e5e7eb' : pct >= 100 ? 'var(--color-error)' : pct >= 80 ? 'var(--color-warning)' : 'var(--color-success)';
                                const remaining = day.operates ? Math.max(0, day.cap - day.booked) : 0;
                                return (
                                  <div key={day.iso} style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: 10, fontWeight: 600, color: i === 0 ? 'var(--color-primary)' : 'var(--color-text-muted)', marginBottom: 4 }}>
                                      {i === 0 ? 'Today' : DOW_NAMES[day.dow]}
                                    </div>
                                    <div style={{ fontSize: 9, color: 'var(--color-text-muted)', marginBottom: 4 }}>{day.date}</div>
                                    <div style={{ height: 48, background: '#f1f5f9', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: day.operates ? `${Math.min(pct, 100)}%` : '0%', background: barColor, borderRadius: '0 0 4px 4px', transition: 'height 0.3s' }} />
                                    </div>
                                    <div style={{ fontSize: 10, fontWeight: 700, marginTop: 4, color: !day.operates ? '#9ca3af' : pct >= 100 ? 'var(--color-error)' : 'var(--color-text)' }}>
                                      {!day.operates ? 'Closed' : pct >= 100 ? 'Full' : `${remaining} left`}
                                    </div>
                                    <div style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>{day.operates ? `${day.booked}/${day.cap}` : '—'}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* ── MONTH VIEW: calendar grid ── */}
                        {scheduleViewMode === 'month' && (() => {
                          const mYear = monthCalendarMonth.getFullYear();
                          const mMonth = monthCalendarMonth.getMonth();
                          const firstDay = new Date(mYear, mMonth, 1);
                          const lastDay = new Date(mYear, mMonth + 1, 0);
                          const startPad = firstDay.getDay();
                          const todayStr = new Date().toISOString().slice(0, 10);
                          return (
                            <div style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <button onClick={() => setMonthCalendarMonth(new Date(mYear, mMonth - 1, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }}><ChevronLeft size={16} /></button>
                                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>
                                  {firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </span>
                                <button onClick={() => setMonthCalendarMonth(new Date(mYear, mMonth + 1, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }}><ChevronRight size={16} /></button>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
                                {DOW_NAMES.map(n => <div key={n} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', paddingBottom: 4 }}>{n}</div>)}
                                {Array.from({ length: startPad }, (_, i) => <div key={`p-${i}`} />)}
                                {Array.from({ length: lastDay.getDate() }, (_, i) => {
                                  const d = i + 1;
                                  const dateObj = new Date(mYear, mMonth, d);
                                  const iso = `${mYear}-${String(mMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                  const dow = dateObj.getDay();
                                  const operates = sched.daysOfWeek.includes(dow);
                                  const booked = sched.bookedSlots[iso] ?? 0;
                                  const cap = sched.dailyCap;
                                  const pct = operates ? Math.round((booked / cap) * 100) : 0;
                                  const isToday = iso === todayStr;
                                  const bg = !operates ? '#f8fafc' : pct >= 100 ? '#fef2f2' : pct >= 80 ? '#fffbeb' : '#f0fdf4';
                                  const border = isToday ? '2px solid var(--color-primary)' : '1px solid ' + (!operates ? '#f1f5f9' : pct >= 100 ? '#fecaca' : pct >= 80 ? '#fde68a' : '#bbf7d0');
                                  const textColor = !operates ? '#cbd5e1' : pct >= 100 ? 'var(--color-error)' : pct >= 80 ? '#d97706' : 'var(--color-success)';
                                  return (
                                    <div key={d} style={{ background: bg, border, borderRadius: 6, padding: '4px 2px', textAlign: 'center', minHeight: 44 }}>
                                      <div style={{ fontSize: 11, fontWeight: isToday ? 800 : 600, color: isToday ? 'var(--color-primary)' : 'var(--color-text)' }}>{d}</div>
                                      {operates ? (
                                        <>
                                          <div style={{ fontSize: 9, fontWeight: 700, color: textColor }}>{pct >= 100 ? 'Full' : `${cap - booked}`}</div>
                                          <div style={{ height: 3, background: '#e5e7eb', borderRadius: 2, margin: '2px 3px 0', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: pct >= 100 ? 'var(--color-error)' : pct >= 80 ? 'var(--color-warning)' : 'var(--color-success)', borderRadius: 2 }} />
                                          </div>
                                        </>
                                      ) : (
                                        <div style={{ fontSize: 8, color: '#cbd5e1' }}>closed</div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 10, color: 'var(--color-text-muted)' }}>
                                <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#bbf7d0', marginRight: 4 }} />Available</span>
                                <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#fde68a', marginRight: 4 }} />Limited</span>
                                <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#fecaca', marginRight: 4 }} />Full</span>
                                <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#f1f5f9', marginRight: 4 }} />Closed</span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Today's utilization bar */}
                        <div style={{ padding: '0 16px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>Today:</span>
                            <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ height: '100%', borderRadius: 3, transition: 'width 0.3s', width: todayUsage.operates ? `${Math.min(todayPct, 100)}%` : '0%', background: todayPct >= 100 ? 'var(--color-error)' : todayPct >= 80 ? 'var(--color-warning)' : 'var(--color-success)' }} />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 11, color: todayPct >= 100 ? 'var(--color-error)' : 'var(--color-text)' }}>
                              {todayUsage.operates ? `${todayUsage.booked}/${todayUsage.cap} (${todayPct}%)` : 'Closed today'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {schedulesByCategory.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
              No facility schedules configured for {tenant.name}.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
