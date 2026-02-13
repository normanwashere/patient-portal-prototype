import { useState, useMemo } from 'react';
import {
  Calendar,
  Users,
  Plus,
  Send,
  MapPin,
  Clock,
  XCircle,
  CheckCircle,
  AlertCircle,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useProvider } from '../context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';
import { useToast } from '../../context/ToastContext';
import type { CSSProperties } from 'react';
import type { ManagedEvent, EventRegistration } from '../types';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Draft: { bg: 'var(--color-gray-200)', color: 'var(--color-text-muted)' },
  Published: { bg: 'var(--color-info-light)', color: 'var(--color-info)' },
  Active: { bg: 'var(--color-success-light)', color: 'var(--color-success)' },
  Completed: { bg: 'var(--color-gray-200)', color: 'var(--color-text-muted)' },
  Cancelled: { bg: 'var(--color-error-light)', color: 'var(--color-error)' },
  Registered: { bg: 'var(--color-success-light)', color: 'var(--color-success)' },
  Attended: { bg: 'var(--color-info-light)', color: 'var(--color-info)' },
  'No-Show': { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' },
};

const styles: Record<string, CSSProperties> = {
  page: { padding: 24, background: 'var(--color-background)', minHeight: '100%' },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 },
  subtitle: { color: 'var(--color-text-muted)', marginBottom: 24, fontSize: 14 },
  tabs: { display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap', borderBottom: '1px solid var(--color-border)', paddingBottom: 0 },
  tab: { padding: '12px 16px', fontSize: 14, fontWeight: 600, color: 'var(--color-text-muted)', background: 'none', border: 'none', borderBottom: '3px solid transparent', cursor: 'pointer', marginBottom: -1 },
  tabActive: { color: 'var(--color-primary)', borderBottomColor: 'var(--color-primary)' },
  card: { background: 'var(--color-surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' },
  badge: { padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 },
  btn: { padding: '8px 16px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 },
  btnPrimary: { background: 'var(--color-primary)', color: 'white' },
  btnSecondary: { background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' },
  btnSuccess: { background: 'var(--color-success)', color: 'white' },
  btnWarning: { background: 'var(--color-warning)', color: 'white' },
  btnDanger: { background: 'var(--color-error)', color: 'white' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 },
  chips: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  chip: { padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer' },
  chipActive: { background: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: 12, borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)', fontWeight: 600 },
  td: { padding: 12, borderBottom: '1px solid var(--color-border)', color: 'var(--color-text)' },
  input: { width: '100%', padding: 10, borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', fontSize: 14, background: 'var(--color-surface)', color: 'var(--color-text)', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: 10, borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', fontSize: 14, minHeight: 80, resize: 'vertical', background: 'var(--color-surface)', color: 'var(--color-text)', boxSizing: 'border-box' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)' },
};

type TabId = 'events' | 'registrations' | 'create';

export const EventsManagement = () => {
  const { tenant } = useTheme();
  const {
    managedEvents, eventRegistrations,
    updateEventStatus, updateRegistrationStatus, addEvent, addAuditLog,
  } = useProvider();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>('events');
  const [eventFilter, setEventFilter] = useState<string | null>(null);
  const [regEventFilter, setRegEventFilter] = useState<string | null>(null);
  const [regStatusFilter, setRegStatusFilter] = useState<string | null>(null);

  // Create form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ManagedEvent['type']>('Screening');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newLocation, setNewLocation] = useState('');
  const [newCapacity, setNewCapacity] = useState('50');
  const [newDescription, setNewDescription] = useState('');

  const filteredEvents = useMemo(() => {
    if (!eventFilter) return managedEvents;
    return managedEvents.filter((e) => e.status === eventFilter);
  }, [managedEvents, eventFilter]);

  const filteredRegs = useMemo(() => {
    let list = eventRegistrations;
    if (regEventFilter) list = list.filter((r) => r.eventId === regEventFilter);
    if (regStatusFilter) list = list.filter((r) => r.status === regStatusFilter);
    return list;
  }, [eventRegistrations, regEventFilter, regStatusFilter]);

  const regStatuses = useMemo(() => [...new Set(eventRegistrations.map((r) => r.status))], [eventRegistrations]);

  const handleEventStatusChange = (eventId: string, eventTitle: string, newStatus: ManagedEvent['status']) => {
    updateEventStatus(eventId, newStatus);
    addAuditLog('event_status', 'Events', `Event "${eventTitle}" → ${newStatus}`);
    showToast(`Event "${eventTitle}" updated to ${newStatus}`, 'success');
  };

  const handleRegStatusChange = (regId: string, patientName: string, newStatus: EventRegistration['status']) => {
    updateRegistrationStatus(regId, newStatus);
    addAuditLog('reg_status', 'Events', `Registration for ${patientName} → ${newStatus}`);
    showToast(`${patientName} marked as ${newStatus}`, 'success');
  };

  const handleCreateEvent = () => {
    if (!newTitle.trim()) { showToast('Please enter an event title', 'error'); return; }
    if (!newDate) { showToast('Please select a date', 'error'); return; }
    if (!newLocation.trim()) { showToast('Please enter a location', 'error'); return; }

    addEvent({
      title: newTitle.trim(),
      type: newType,
      date: newDate,
      time: newTime,
      location: newLocation.trim(),
      capacity: parseInt(newCapacity) || 50,
      registered: 0,
      status: 'Draft',
      description: newDescription.trim(),
    });
    addAuditLog('create_event', 'Events', `Created event: ${newTitle.trim()}`);
    showToast(`Event "${newTitle.trim()}" created as Draft`, 'success');
    setNewTitle('');
    setNewDate('');
    setNewTime('09:00');
    setNewLocation('');
    setNewCapacity('50');
    setNewDescription('');
    setActiveTab('events');
  };

  const getNextActions = (status: ManagedEvent['status']): { label: string; newStatus: ManagedEvent['status']; style: CSSProperties; icon: React.ComponentType<{ size?: number }> }[] => {
    switch (status) {
      case 'Draft': return [
        { label: 'Publish', newStatus: 'Published', style: styles.btnPrimary, icon: Send },
        { label: 'Cancel', newStatus: 'Cancelled', style: styles.btnDanger, icon: XCircle },
      ];
      case 'Published': return [
        { label: 'Activate', newStatus: 'Active', style: styles.btnSuccess, icon: CheckCircle },
        { label: 'Cancel', newStatus: 'Cancelled', style: styles.btnDanger, icon: XCircle },
      ];
      case 'Active': return [
        { label: 'Complete', newStatus: 'Completed', style: styles.btnSecondary, icon: CheckCircle },
        { label: 'Cancel', newStatus: 'Cancelled', style: styles.btnDanger, icon: XCircle },
      ];
      default: return [];
    }
  };

  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'registrations', label: 'Registrations', icon: Users },
    { id: 'create', label: 'Create Event', icon: Plus },
  ];

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Events Management</h1>
      <p style={styles.subtitle}>{tenant.name} · Manage events, registrations, and schedules</p>

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

      {/* ─── EVENTS TAB ─── */}
      {activeTab === 'events' && (
        <>
          <div style={styles.header}>
            <div style={styles.chips}>
              <button
                style={{ ...styles.chip, ...(eventFilter === null ? styles.chipActive : {}) }}
                onClick={() => setEventFilter(null)}
              >
                All
              </button>
              {(['Draft', 'Published', 'Active', 'Completed', 'Cancelled'] as const).map((s) => (
                <button
                  key={s}
                  style={{ ...styles.chip, ...(eventFilter === s ? styles.chipActive : {}) }}
                  onClick={() => setEventFilter(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div style={styles.grid}>
            {filteredEvents.map((event) => {
              const statusStyle = STATUS_COLORS[event.status] || STATUS_COLORS.Draft;
              const pct = event.capacity ? Math.round((event.registered / event.capacity) * 100) : 0;
              const actions = getNextActions(event.status);
              return (
                <div key={event.id} style={styles.card}>
                  <div style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>{event.title}</h3>
                      <span style={{ ...styles.badge, ...statusStyle }}>{event.status}</span>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ ...styles.badge, background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>{event.type}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 12, color: 'var(--color-text-muted)' }}>
                      <Calendar size={14} /> {event.date} · <Clock size={14} /> {event.time}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                      <MapPin size={14} /> {event.location}
                    </div>
                    {event.description && (
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
                        {event.description}
                      </div>
                    )}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span>Capacity</span>
                        <span style={{ fontWeight: 600 }}>{event.registered} / {event.capacity}</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: pct >= 90 ? 'var(--color-error)' : 'var(--color-primary)', transition: 'width 0.3s' }} />
                      </div>
                    </div>
                    {actions.length > 0 && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {actions.map(({ label, newStatus, style, icon: ActionIcon }) => (
                          <button
                            key={newStatus}
                            style={{ ...styles.btn, ...style, padding: '6px 12px', fontSize: 12 }}
                            onClick={() => handleEventStatusChange(event.id, event.title, newStatus)}
                          >
                            <ActionIcon size={14} /> {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {filteredEvents.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
              No events match the current filter.
            </div>
          )}
        </>
      )}

      {/* ─── REGISTRATIONS TAB ─── */}
      {activeTab === 'registrations' && (
        <>
          <div style={styles.header}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                style={{ padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', fontSize: 13, background: 'var(--color-surface)', color: 'var(--color-text)' }}
                value={regEventFilter ?? ''}
                onChange={(e) => setRegEventFilter(e.target.value || null)}
              >
                <option value="">All Events</option>
                {managedEvents.map((e) => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
              <select
                style={{ padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', fontSize: 13, background: 'var(--color-surface)', color: 'var(--color-text)' }}
                value={regStatusFilter ?? ''}
                onChange={(e) => setRegStatusFilter(e.target.value || null)}
              >
                <option value="">All Status</option>
                {regStatuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {filteredRegs.length} registrations
            </span>
          </div>
          <div style={{ ...styles.card, overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Event</th>
                  <th style={styles.th}>Patient</th>
                  <th style={styles.th}>Registered Date</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Notes</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegs.map((reg) => {
                  const regStatusStyle = STATUS_COLORS[reg.status] || STATUS_COLORS.Registered;
                  const canAct = reg.status === 'Registered';
                  return (
                    <tr key={reg.id}>
                      <td style={styles.td}>{reg.eventName}</td>
                      <td style={styles.td}><span style={{ fontWeight: 600 }}>{reg.patientName}</span></td>
                      <td style={styles.td}>{reg.registeredDate}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, ...regStatusStyle }}>{reg.status}</span>
                      </td>
                      <td style={styles.td}>{reg.notes ?? '—'}</td>
                      <td style={styles.td}>
                        {canAct ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              style={{ ...styles.btn, ...styles.btnSuccess, padding: '4px 10px', fontSize: 11 }}
                              onClick={() => handleRegStatusChange(reg.id, reg.patientName, 'Attended')}
                              title="Mark Attended"
                            >
                              <UserCheck size={12} /> Attend
                            </button>
                            <button
                              style={{ ...styles.btn, ...styles.btnWarning, padding: '4px 10px', fontSize: 11 }}
                              onClick={() => handleRegStatusChange(reg.id, reg.patientName, 'No-Show')}
                              title="Mark No-Show"
                            >
                              <AlertCircle size={12} /> No-Show
                            </button>
                            <button
                              style={{ ...styles.btn, ...styles.btnDanger, padding: '4px 10px', fontSize: 11 }}
                              onClick={() => handleRegStatusChange(reg.id, reg.patientName, 'Cancelled')}
                              title="Cancel Registration"
                            >
                              <UserX size={12} /> Cancel
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredRegs.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: 'var(--color-text-muted)', padding: 32 }}>
                      No registrations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ─── CREATE EVENT TAB ─── */}
      {activeTab === 'create' && (
        <div style={{ ...styles.card, padding: 24, maxWidth: 600 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={18} style={{ color: 'var(--color-primary)' }} />
            Create New Event
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Title *</label>
              <input style={styles.input} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Event title..." />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Type</label>
              <select style={styles.input} value={newType} onChange={(e) => setNewType(e.target.value as ManagedEvent['type'])}>
                <option value="Screening">Screening</option>
                <option value="Webinar">Webinar</option>
                <option value="Vaccination Drive">Vaccination Drive</option>
                <option value="Wellness">Wellness</option>
                <option value="Health Fair">Health Fair</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date *</label>
                <input type="date" style={styles.input} value={newDate} onChange={(e) => setNewDate(e.target.value)} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Time</label>
                <input type="time" style={styles.input} value={newTime} onChange={(e) => setNewTime(e.target.value)} />
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Location *</label>
              <input style={styles.input} value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="Event location..." />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Capacity</label>
              <input type="number" style={styles.input} value={newCapacity} onChange={(e) => setNewCapacity(e.target.value)} min="1" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea style={styles.textarea} value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Event description..." />
            </div>
            <button
              style={{ ...styles.btn, ...styles.btnPrimary, alignSelf: 'flex-start', padding: '10px 24px' }}
              onClick={handleCreateEvent}
            >
              <Plus size={16} /> Create Event
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
