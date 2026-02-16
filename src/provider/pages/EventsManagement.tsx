import { useState, useMemo, useRef } from 'react';
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
  FileText,
  Megaphone,
  Star,
  ExternalLink,
  Link2,
  Image as ImageIcon,
  Pencil,
  X,
  Trash2,
  Save,
} from 'lucide-react';
import { useProvider } from '../context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { getPatientTenant } from '../data/providerMockData';
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
  tab: { padding: '12px 16px', fontSize: 14, fontWeight: 600, color: 'var(--color-text-muted)', background: 'none', borderWidth: 0, borderStyle: 'none' as const, borderBottomWidth: 3, borderBottomStyle: 'solid' as const, borderBottomColor: 'transparent', cursor: 'pointer', marginBottom: -1 },
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
    updateEventStatus, updateRegistrationStatus, addEvent, updateEvent, addAuditLog,
  } = useProvider();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>('events');
  const [eventFilter, setEventFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
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
  const [newImageUrl, setNewImageUrl] = useState('');
  const createFileRef = useRef<HTMLInputElement>(null);

  // Edit modal state
  const [editingEvent, setEditingEvent] = useState<ManagedEvent | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState<ManagedEvent['type']>('Screening');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('09:00');
  const [editLocation, setEditLocation] = useState('');
  const [editCapacity, setEditCapacity] = useState('50');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const editFileRef = useRef<HTMLInputElement>(null);

  /* ── Tenant-filtered data ── */
  const tenantId = tenant.id;
  const tenantEvents = useMemo(() =>
    managedEvents.filter(e => !e.tenantId || e.tenantId === tenantId),
    [managedEvents, tenantId]
  );
  const tenantRegs = useMemo(() => {
    const tenantEventIds = new Set(tenantEvents.map(e => e.id));
    return eventRegistrations.filter(r =>
      tenantEventIds.has(r.eventId) && (!r.patientId || getPatientTenant(r.patientId) === tenantId || tenantEventIds.has(r.eventId))
    );
  }, [eventRegistrations, tenantEvents, tenantId]);

  /* ── Content type categories ── */
  const EVENT_TYPES: ManagedEvent['type'][] = ['Screening', 'Webinar', 'Vaccination Drive', 'Wellness', 'Health Fair', 'Activity'];
  const CONTENT_TYPES: ManagedEvent['type'][] = ['Article', 'Campaign', 'Feature'];
  const _ALL_TYPES = [...EVENT_TYPES, ...CONTENT_TYPES]; void _ALL_TYPES;
  const eventTypeSet = useMemo(() => new Set(tenantEvents.map(e => e.type)), [tenantEvents]);
  const isContentType = (type: string) => CONTENT_TYPES.includes(type as ManagedEvent['type']);

  const filteredEvents = useMemo(() => {
    let list = tenantEvents;
    if (eventFilter) list = list.filter((e) => e.status === eventFilter);
    if (typeFilter) {
      if (typeFilter === '_events') list = list.filter(e => EVENT_TYPES.includes(e.type));
      else if (typeFilter === '_content') list = list.filter(e => CONTENT_TYPES.includes(e.type));
      else list = list.filter(e => e.type === typeFilter);
    }
    return list;
  }, [tenantEvents, eventFilter, typeFilter]);

  const filteredRegs = useMemo(() => {
    let list = tenantRegs;
    if (regEventFilter) list = list.filter((r) => r.eventId === regEventFilter);
    if (regStatusFilter) list = list.filter((r) => r.status === regStatusFilter);
    return list;
  }, [tenantRegs, regEventFilter, regStatusFilter]);

  const regStatuses = useMemo(() => [...new Set(tenantRegs.map((r) => r.status))], [tenantRegs]);

  /* ── Stats ── */
  const stats = useMemo(() => ({
    totalEvents: tenantEvents.filter(e => !isContentType(e.type)).length,
    totalContent: tenantEvents.filter(e => isContentType(e.type)).length,
    activeItems: tenantEvents.filter(e => e.status === 'Active').length,
    totalRegistrations: tenantRegs.length,
    registeredCount: tenantRegs.filter(r => r.status === 'Registered').length,
    attendedCount: tenantRegs.filter(r => r.status === 'Attended').length,
  }), [tenantEvents, tenantRegs]);

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

  /* ── Image file → data-URL helper ── */
  const handleFileToDataUrl = (file: File, cb: (url: string) => void) => {
    if (!file.type.startsWith('image/')) { showToast('Please select an image file', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5 MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => cb(reader.result as string);
    reader.readAsDataURL(file);
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
      capacity: CONTENT_TYPES.includes(newType) ? 0 : (parseInt(newCapacity) || 50),
      registered: 0,
      status: 'Draft',
      description: newDescription.trim(),
      tenantId: tenant.id,
      registerable: !CONTENT_TYPES.includes(newType),
      imageUrl: newImageUrl || undefined,
    });
    addAuditLog('create_event', 'Events', `Created event: ${newTitle.trim()}`);
    showToast(`Event "${newTitle.trim()}" created as Draft`, 'success');
    setNewTitle('');
    setNewDate('');
    setNewTime('09:00');
    setNewLocation('');
    setNewCapacity('50');
    setNewDescription('');
    setNewImageUrl('');
    setActiveTab('events');
  };

  /* ── Edit helpers ── */
  const openEdit = (event: ManagedEvent) => {
    setEditingEvent(event);
    setEditTitle(event.title);
    setEditType(event.type);
    setEditDate(event.date);
    setEditTime(event.time);
    setEditLocation(event.location);
    setEditCapacity(String(event.capacity));
    setEditDescription(event.description);
    setEditImageUrl(event.imageUrl || '');
  };
  const closeEdit = () => setEditingEvent(null);

  const handleSaveEdit = () => {
    if (!editingEvent) return;
    if (!editTitle.trim()) { showToast('Title is required', 'error'); return; }
    if (!editDate) { showToast('Date is required', 'error'); return; }
    if (!editLocation.trim()) { showToast('Location is required', 'error'); return; }

    updateEvent(editingEvent.id, {
      title: editTitle.trim(),
      type: editType,
      date: editDate,
      time: editTime,
      location: editLocation.trim(),
      capacity: CONTENT_TYPES.includes(editType) ? 0 : (parseInt(editCapacity) || 50),
      description: editDescription.trim(),
      registerable: !CONTENT_TYPES.includes(editType),
      imageUrl: editImageUrl || undefined,
    });
    addAuditLog('update_event', 'Events', `Edited event: ${editTitle.trim()}`);
    showToast(`"${editTitle.trim()}" updated`, 'success');
    closeEdit();
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

  const typeIcon = (type: ManagedEvent['type']) => {
    switch (type) {
      case 'Article': return FileText;
      case 'Campaign': return Megaphone;
      case 'Feature': return Star;
      default: return Calendar;
    }
  };

  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ size?: number }>; count?: number }[] = [
    { id: 'events', label: 'Events & Content', icon: Calendar, count: tenantEvents.length },
    { id: 'registrations', label: 'Registrations', icon: Users, count: tenantRegs.length },
    { id: 'create', label: 'Create Event', icon: Plus },
  ];

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Events & Content Management</h1>
      <p style={styles.subtitle}>{tenant.name} · Manage events, articles, registrations, and published content</p>

      {/* ── Summary stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Events', value: stats.totalEvents, color: 'var(--color-primary)' },
          { label: 'Articles / Content', value: stats.totalContent, color: 'var(--color-info, #3b82f6)' },
          { label: 'Active Items', value: stats.activeItems, color: 'var(--color-success, #10b981)' },
          { label: 'Registrations', value: stats.totalRegistrations, color: 'var(--color-warning, #f59e0b)' },
          { label: 'Registered', value: stats.registeredCount, color: '#8b5cf6' },
          { label: 'Attended', value: stats.attendedCount, color: '#06b6d4' },
        ].map((s, i) => (
          <div key={i} style={{ ...styles.card, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={styles.tabs}>
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            style={{ ...styles.tab, ...(activeTab === id ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(id)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon size={16} />
              {label}
              {count !== undefined && <span style={{ ...styles.badge, background: activeTab === id ? 'color-mix(in srgb, var(--color-primary) 15%, transparent)' : 'var(--color-gray-200)', color: activeTab === id ? 'var(--color-primary)' : 'var(--color-text-muted)', fontSize: 10, marginLeft: 2 }}>{count}</span>}
            </span>
          </button>
        ))}
      </div>

      {/* ─── EVENTS TAB ─── */}
      {activeTab === 'events' && (
        <>
          <div style={styles.header}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {/* Type category chips */}
              <div style={{ ...styles.chips, marginRight: 12 }}>
                <button style={{ ...styles.chip, ...(typeFilter === null ? styles.chipActive : {}) }} onClick={() => setTypeFilter(null)}>All</button>
                <button style={{ ...styles.chip, ...(typeFilter === '_events' ? styles.chipActive : {}) }} onClick={() => setTypeFilter('_events')}>Events</button>
                <button style={{ ...styles.chip, ...(typeFilter === '_content' ? styles.chipActive : {}) }} onClick={() => setTypeFilter('_content')}>Content</button>
                {[...eventTypeSet].sort().map(t => (
                  <button key={t} style={{ ...styles.chip, ...(typeFilter === t ? styles.chipActive : {}), fontSize: 11 }} onClick={() => setTypeFilter(t)}>{t}</button>
                ))}
              </div>
            </div>
            <div style={styles.chips}>
              <button
                style={{ ...styles.chip, ...(eventFilter === null ? styles.chipActive : {}) }}
                onClick={() => setEventFilter(null)}
              >
                All Status
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
              const isContent = isContentType(event.type);
              const pct = event.capacity > 0 ? Math.round((event.registered / event.capacity) * 100) : 0;
              const actions = getNextActions(event.status);
              const TypeIcon = typeIcon(event.type);
              return (
                <div key={event.id} style={{ ...styles.card, borderLeft: isContent ? '3px solid var(--color-info, #3b82f6)' : undefined }}>
                  <div style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', flex: 1, marginRight: 8 }}>{event.title}</h3>
                      <span style={{ ...styles.badge, ...statusStyle, flexShrink: 0 }}>{event.status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ ...styles.badge, background: isContent ? 'color-mix(in srgb, var(--color-info) 12%, transparent)' : 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: isContent ? 'var(--color-info, #3b82f6)' : 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <TypeIcon size={10} /> {event.type}
                      </span>
                      {event.registerable && <span style={{ ...styles.badge, background: 'color-mix(in srgb, var(--color-success) 12%, transparent)', color: 'var(--color-success)' }}>Registration Open</span>}
                      {event.patientFacingId && <span style={{ ...styles.badge, background: 'color-mix(in srgb, #8b5cf6 12%, transparent)', color: '#8b5cf6', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Link2 size={9} /> Patient Portal</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, fontSize: 12, color: 'var(--color-text-muted)' }}>
                      <Calendar size={13} /> {event.date} · <Clock size={13} /> {event.time}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                      <MapPin size={13} /> {event.location}
                    </div>
                    {/* Cover image thumbnail */}
                    {event.imageUrl && (
                      <div style={{ marginBottom: 10, borderRadius: 8, overflow: 'hidden', maxHeight: 140 }}>
                        <img src={event.imageUrl} alt="" style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
                      </div>
                    )}
                    {event.description && (
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {event.description}
                      </div>
                    )}
                    {/* Capacity bar — only for registerable events */}
                    {event.capacity > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span>Capacity</span>
                          <span style={{ fontWeight: 600 }}>{event.registered} / {event.capacity}</span>
                        </div>
                        <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: pct >= 90 ? 'var(--color-error)' : 'var(--color-primary)', transition: 'width 0.3s' }} />
                        </div>
                      </div>
                    )}
                    {/* Source URL for articles */}
                    {event.sourceUrl && (
                      <div style={{ marginBottom: 10 }}>
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <ExternalLink size={10} /> Source: <span style={{ color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer' }}>{event.sourceUrl.replace(/https?:\/\//, '').split('/')[0]}</span>
                        </span>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        style={{ ...styles.btn, ...styles.btnSecondary, padding: '6px 12px', fontSize: 12 }}
                        onClick={() => openEdit(event)}
                      >
                        <Pencil size={14} /> Edit
                      </button>
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
                {tenantEvents.filter(e => e.registerable !== false).map((e) => (
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

      {/* ─── EDIT EVENT MODAL ─── */}
      {editingEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,.18)', border: '1px solid var(--color-border)' }}>
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <Pencil size={18} style={{ color: 'var(--color-primary)' }} /> Edit Event
              </h2>
              <button onClick={closeEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20} /></button>
            </div>

            {/* Modal body */}
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Title *</label>
                <input style={styles.input} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Event title..." />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Type</label>
                <select style={styles.input} value={editType} onChange={(e) => setEditType(e.target.value as ManagedEvent['type'])}>
                  <optgroup label="Events">
                    <option value="Screening">Screening</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Vaccination Drive">Vaccination Drive</option>
                    <option value="Wellness">Wellness</option>
                    <option value="Health Fair">Health Fair</option>
                    <option value="Activity">Activity</option>
                  </optgroup>
                  <optgroup label="Content">
                    <option value="Article">Article</option>
                    <option value="Campaign">Campaign</option>
                    <option value="Feature">Feature</option>
                  </optgroup>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Date *</label>
                  <input type="date" style={styles.input} value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Time</label>
                  <input type="time" style={styles.input} value={editTime} onChange={(e) => setEditTime(e.target.value)} />
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Location *</label>
                <input style={styles.input} value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="Event location..." />
              </div>
              {!CONTENT_TYPES.includes(editType) && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Capacity</label>
                  <input type="number" style={styles.input} value={editCapacity} onChange={(e) => setEditCapacity(e.target.value)} min="1" />
                </div>
              )}
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea style={styles.textarea} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Event description..." />
              </div>

              {/* ── Cover Image ── */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Cover Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    style={{ ...styles.btn, ...styles.btnSecondary, padding: '8px 14px', fontSize: 12 }}
                    onClick={() => editFileRef.current?.click()}
                  >
                    <ImageIcon size={14} /> Choose File
                  </button>
                  <input
                    ref={editFileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileToDataUrl(file, setEditImageUrl);
                      e.target.value = '';
                    }}
                  />
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)', flex: 1 }}>or paste a URL:</span>
                </div>
                <input
                  style={{ ...styles.input, marginTop: 6 }}
                  value={editImageUrl.startsWith('data:') ? '(uploaded file)' : editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  readOnly={editImageUrl.startsWith('data:')}
                />
                {editImageUrl && (
                  <div style={{ marginTop: 8, position: 'relative', display: 'inline-block' }}>
                    <img
                      src={editImageUrl}
                      alt="preview"
                      style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--color-border)' }}
                    />
                    <button
                      type="button"
                      style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      onClick={() => setEditImageUrl('')}
                      title="Remove image"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Current status info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-text-muted)', padding: '8px 12px', background: 'var(--color-background)', borderRadius: 8 }}>
                <AlertCircle size={14} />
                Current status: <span style={{ ...styles.badge, ...(STATUS_COLORS[editingEvent.status] || STATUS_COLORS.Draft) }}>{editingEvent.status}</span>
                &nbsp;· Registered: <strong>{editingEvent.registered}</strong>
              </div>
            </div>

            {/* Modal footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 20px', borderTop: '1px solid var(--color-border)' }}>
              <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={closeEdit}><X size={14} /> Cancel</button>
              <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={handleSaveEdit}><Save size={14} /> Save Changes</button>
            </div>
          </div>
        </div>
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
                <optgroup label="Events">
                  <option value="Screening">Screening</option>
                  <option value="Webinar">Webinar</option>
                  <option value="Vaccination Drive">Vaccination Drive</option>
                  <option value="Wellness">Wellness</option>
                  <option value="Health Fair">Health Fair</option>
                  <option value="Activity">Activity</option>
                </optgroup>
                <optgroup label="Content">
                  <option value="Article">Article</option>
                  <option value="Campaign">Campaign</option>
                  <option value="Feature">Feature</option>
                </optgroup>
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

            {/* ── Cover Image ── */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Cover Image</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  style={{ ...styles.btn, ...styles.btnSecondary, padding: '8px 14px', fontSize: 12 }}
                  onClick={() => createFileRef.current?.click()}
                >
                  <ImageIcon size={14} /> Choose File
                </button>
                <input
                  ref={createFileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileToDataUrl(file, setNewImageUrl);
                    e.target.value = '';
                  }}
                />
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', flex: 1 }}>or paste a URL:</span>
              </div>
              <input
                style={{ ...styles.input, marginTop: 6 }}
                value={newImageUrl.startsWith('data:') ? '(uploaded file)' : newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                readOnly={newImageUrl.startsWith('data:')}
              />
              {newImageUrl && (
                <div style={{ marginTop: 8, position: 'relative', display: 'inline-block' }}>
                  <img
                    src={newImageUrl}
                    alt="preview"
                    style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--color-border)' }}
                  />
                  <button
                    type="button"
                    style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    onClick={() => setNewImageUrl('')}
                    title="Remove image"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
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
