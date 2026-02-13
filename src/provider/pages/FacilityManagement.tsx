import { useState, useMemo } from 'react';
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
} from 'lucide-react';
import React from 'react';
import { useProvider } from '../context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';
import { useToast } from '../../context/ToastContext';
import type { Room, Equipment } from '../types';

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
  tab: { padding: '12px 16px', fontSize: 14, fontWeight: 600, color: 'var(--color-text-muted)', background: 'none', border: 'none', borderBottom: '3px solid transparent', cursor: 'pointer', marginBottom: -1 },
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

export const FacilityManagement = () => {
  const { tenant } = useTheme();
  const { rooms, equipment, updateRoomStatus, updateEquipmentStatus, addAuditLog } = useProvider();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'rooms' | 'equipment' | 'services'>('rooms');
  const [roomFilter, setRoomFilter] = useState<string | null>(null);

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

  const tabs = [
    { id: 'rooms' as const, label: 'Rooms', icon: LayoutGrid },
    { id: 'equipment' as const, label: 'Equipment', icon: Wrench },
    { id: 'services' as const, label: 'Services', icon: Stethoscope },
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
    </div>
  );
};
