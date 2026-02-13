import { useState, useMemo } from 'react';
import {
  Calendar,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Stethoscope,
  ArrowUpCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  X,
} from 'lucide-react';
import { useProvider } from '../context/ProviderContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../theme/ThemeContext';
import type { Appointment } from '../types';

/* ─── helpers ─── */
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];
const APT_TYPES = ['In-Person', 'Teleconsult', 'Follow-up', 'Annual Physical', 'Lab Only'];

const getWeekDates = (offset: number) => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const isSameDay = (a: Date, b: Date) =>
  a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

const statusColor = (s: string) => {
  const map: Record<string, { bg: string; fg: string }> = {
    Upcoming:     { bg: 'var(--color-info-light, #dbeafe)',    fg: 'var(--color-info, #3b82f6)' },
    Scheduled:    { bg: 'var(--color-info-light, #dbeafe)',    fg: 'var(--color-info, #3b82f6)' },
    Confirmed:    { bg: 'var(--color-success-light, #d1fae5)', fg: 'var(--color-success, #10b981)' },
    'In Progress':{ bg: 'var(--color-warning-light, #fef3c7)', fg: 'var(--color-warning, #f59e0b)' },
    Completed:    { bg: 'var(--color-gray-200, #e2e8f0)',      fg: 'var(--color-text-muted)' },
    Cancelled:    { bg: 'var(--color-error-light, #fee2e2)',   fg: 'var(--color-error, #ef4444)' },
    'No Show':    { bg: 'var(--color-error-light, #fee2e2)',   fg: 'var(--color-error, #ef4444)' },
  };
  return map[s] ?? { bg: 'var(--color-background)', fg: 'var(--color-text-muted)' };
};

/* ─── mock waitlist ─── */
const INITIAL_WAITLIST = [
  { id: 'w1', patient: 'Rosa Fernandez', doctor: 'Dr. Ricardo Santos', preferredDate: 'Feb 15, 2026', status: 'Pending' as const },
  { id: 'w2', patient: 'Eduardo Santos', doctor: 'Dr. Maria Clara Reyes', preferredDate: 'Feb 16, 2026', status: 'Pending' as const },
  { id: 'w3', patient: 'Maria Cruz', doctor: 'Dr. Ricardo Santos', preferredDate: 'Feb 14, 2026', status: 'Contacted' as const },
  { id: 'w4', patient: 'Pedro Gomez', doctor: 'Dr. Albert Go', preferredDate: 'Feb 18, 2026', status: 'Pending' as const },
  { id: 'w5', patient: 'Ana Lim', doctor: 'Dr. Maria Clara Reyes', preferredDate: 'Feb 17, 2026', status: 'Pending' as const },
];

/* ─── styles ─── */
const s: Record<string, React.CSSProperties> = {
  page: { padding: 24, background: 'var(--color-background)', minHeight: '100%' },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 },
  subtitle: { fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 24 },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 12, marginBottom: 20 },
  weekNav: { display: 'flex', alignItems: 'center', gap: 8 },
  navBtn: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' },
  btnPrimary: { padding: '10px 18px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 },
  btnSm: { padding: '5px 10px', borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 },
  card: { background: 'var(--color-surface)', borderRadius: 12, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', padding: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 16 },
  badge: { padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, display: 'inline-block' },
  overlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'var(--color-surface)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  formGroup: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 },
  input: { width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 14, background: 'var(--color-surface)', color: 'var(--color-text)', boxSizing: 'border-box' as const },
  th: { padding: '10px 12px', textAlign: 'left' as const, fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '2px solid var(--color-border)' },
  td: { padding: '12px', fontSize: 13, color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)' },
};

/* ─── types ─── */
interface WaitlistItem {
  id: string;
  patient: string;
  doctor: string;
  preferredDate: string;
  status: 'Pending' | 'Contacted';
}

/* ═══════════════════════════════════════════════ */
export const SchedulingOps = () => {
  const {
    staff, appointments, availability,
    addAppointment, updateAppointmentStatus, cancelAppointment,
  } = useProvider();
  const { showToast } = useToast();
  useTheme();

  const [weekOffset, setWeekOffset] = useState(0);
  const [showBookModal, setShowBookModal] = useState(false);
  const [waitlist, setWaitlist] = useState<WaitlistItem[]>(INITIAL_WAITLIST);

  // form state
  const [formPatient, setFormPatient] = useState('');
  const [formDoctor, setFormDoctor] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formType, setFormType] = useState('In-Person');

  const doctors = useMemo(() => staff.filter((st) => st.role === 'doctor'), [staff]);
  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const today = new Date();
  const todayIdx = weekDates.findIndex((d) => isSameDay(d, today));

  /* ── booking ── */
  const handleBook = () => {
    if (!formPatient.trim() || !formDoctor || !formDate || !formTime) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    const apt: Omit<Appointment, 'id'> = {
      doctor: formDoctor,
      specialty: doctors.find((d) => d.name === formDoctor)?.specialty ?? '',
      date: formDate,
      time: formTime,
      status: 'Upcoming',
      type: formType,
      location: 'Main Branch',
    };
    addAppointment(apt);
    showToast(`Appointment booked for ${formPatient} with ${formDoctor}`, 'success');
    setShowBookModal(false);
    setFormPatient('');
    setFormDoctor('');
    setFormDate('');
    setFormTime('');
    setFormType('In-Person');
  };

  /* ── status actions ── */
  const handleConfirm = (id: string) => {
    updateAppointmentStatus(id, 'Confirmed');
    showToast('Appointment confirmed', 'success');
  };
  const handleCancel = (id: string) => {
    cancelAppointment(id);
    showToast('Appointment cancelled', 'info');
  };
  const handleNoShow = (id: string) => {
    updateAppointmentStatus(id, 'No Show');
    showToast('Marked as No Show', 'info');
  };
  const handleComplete = (id: string) => {
    updateAppointmentStatus(id, 'Completed');
    showToast('Appointment completed', 'success');
  };

  /* ── waitlist ── */
  const handlePromote = (w: WaitlistItem) => {
    const apt: Omit<Appointment, 'id'> = {
      doctor: w.doctor,
      specialty: doctors.find((d) => d.name === w.doctor)?.specialty ?? '',
      date: w.preferredDate,
      time: '10:00 AM',
      status: 'Upcoming',
      type: 'In-Person',
      location: 'Main Branch',
    };
    addAppointment(apt);
    setWaitlist((prev) => prev.filter((item) => item.id !== w.id));
    showToast(`${w.patient} promoted from waitlist and appointment booked`, 'success');
  };
  const handleRemoveWait = (id: string) => {
    setWaitlist((prev) => prev.filter((item) => item.id !== id));
    showToast('Removed from waitlist', 'info');
  };

  /* ── calendar data ── */
  const getAptsForDayDoctor = (date: Date, doctorName: string) =>
    appointments.filter((a) => {
      if (a.doctor !== doctorName) return false;
      const parsed = new Date(a.date);
      if (isNaN(parsed.getTime())) return false;
      return isSameDay(parsed, date);
    });

  return (
    <div style={s.page}>
      <h1 style={s.title}>Scheduling Operations</h1>
      <p style={s.subtitle}>Manage appointments, availability, and waitlist</p>

      {/* ── top bar ── */}
      <div style={s.topBar}>
        <div style={s.weekNav}>
          <button style={s.navBtn} onClick={() => setWeekOffset((p) => p - 1)}><ChevronLeft size={18} /></button>
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)', minWidth: 180, textAlign: 'center' }}>
            {fmtDate(weekDates[0])} – {fmtDate(weekDates[6])}
          </span>
          <button style={s.navBtn} onClick={() => setWeekOffset((p) => p + 1)}><ChevronRight size={18} /></button>
          {weekOffset !== 0 && (
            <button style={{ ...s.navBtn, fontSize: 12, padding: '4px 10px' }} onClick={() => setWeekOffset(0)}>Today</button>
          )}
        </div>
        <button style={s.btnPrimary} onClick={() => setShowBookModal(true)}>
          <Plus size={18} /> Book Appointment
        </button>
      </div>

      {/* ── calendar grid ── */}
      <div style={s.card}>
        <h2 style={s.sectionTitle}>
          <Calendar size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Weekly Schedule
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr>
                <th style={{ ...s.th, minWidth: 140 }}>Doctor</th>
                {weekDates.map((d, i) => (
                  <th key={i} style={{
                    ...s.th,
                    textAlign: 'center',
                    background: i === todayIdx ? 'var(--color-primary-light, rgba(220,96,42,0.08))' : undefined,
                    minWidth: 130,
                  }}>
                    {WEEK_DAYS[d.getDay()]}<br />
                    <span style={{ color: i === todayIdx ? 'var(--color-primary)' : 'var(--color-text)', fontSize: 13, fontWeight: 700 }}>
                      {d.getDate()}/{d.getMonth() + 1}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc.id}>
                  <td style={{ ...s.td, fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Stethoscope size={14} style={{ color: 'var(--color-primary)' }} />
                      {doc.name}
                    </div>
                    {doc.specialty && <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{doc.specialty}</div>}
                  </td>
                  {weekDates.map((d, i) => {
                    const dayApts = getAptsForDayDoctor(d, doc.name);
                    return (
                      <td key={i} style={{
                        ...s.td,
                        background: i === todayIdx ? 'var(--color-primary-light, rgba(220,96,42,0.04))' : undefined,
                        verticalAlign: 'top',
                        padding: 6,
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minHeight: 60 }}>
                          {dayApts.map((a) => {
                            const sc = statusColor(a.status);
                            return (
                              <div key={a.id} style={{
                                padding: '6px 8px',
                                borderRadius: 8,
                                background: sc.bg,
                                border: `1px solid ${sc.fg}20`,
                                fontSize: 11,
                              }}>
                                <div style={{ fontWeight: 700, color: sc.fg }}>{a.time}</div>
                                <div style={{ color: 'var(--color-text)', fontSize: 10 }}>{a.type ?? 'Visit'}</div>
                                <div style={{ color: sc.fg, fontSize: 10, fontWeight: 600 }}>{a.status}</div>
                                {/* action buttons */}
                                <div style={{ display: 'flex', gap: 3, marginTop: 4, flexWrap: 'wrap' }}>
                                  {(a.status === 'Upcoming' || (a.status as string) === 'Scheduled') && (
                                    <>
                                      <button style={{ ...s.btnSm, background: 'var(--color-success)', color: 'white' }} onClick={(e) => { e.stopPropagation(); handleConfirm(a.id); }} title="Confirm">
                                        <CheckCircle2 size={10} /> OK
                                      </button>
                                      <button style={{ ...s.btnSm, background: 'var(--color-error)', color: 'white' }} onClick={(e) => { e.stopPropagation(); handleCancel(a.id); }} title="Cancel">
                                        <XCircle size={10} />
                                      </button>
                                      <button style={{ ...s.btnSm, background: 'var(--color-warning)', color: 'white' }} onClick={(e) => { e.stopPropagation(); handleNoShow(a.id); }} title="No Show">
                                        <AlertTriangle size={10} />
                                      </button>
                                    </>
                                  )}
                                  {(a.status as string) === 'Confirmed' && (
                                    <>
                                      <button style={{ ...s.btnSm, background: 'var(--color-primary)', color: 'white' }} onClick={(e) => { e.stopPropagation(); handleComplete(a.id); }} title="Complete">
                                        <CheckCircle2 size={10} /> Done
                                      </button>
                                      <button style={{ ...s.btnSm, background: 'var(--color-error)', color: 'white' }} onClick={(e) => { e.stopPropagation(); handleCancel(a.id); }} title="Cancel">
                                        <XCircle size={10} />
                                      </button>
                                      <button style={{ ...s.btnSm, background: 'var(--color-warning)', color: 'white' }} onClick={(e) => { e.stopPropagation(); handleNoShow(a.id); }} title="No Show">
                                        <AlertTriangle size={10} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          {dayApts.length === 0 && (
                            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', padding: 4, textAlign: 'center' }}>—</div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── doctor availability ── */}
      <div style={s.card}>
        <h2 style={s.sectionTitle}>
          <Clock size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Doctor Availability
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {doctors.map((doc) => {
            const docAvail = availability.filter((a) => a.doctorId === doc.id || a.doctorName === doc.name);
            return (
              <div key={doc.id} style={{
                padding: 16,
                borderRadius: 10,
                border: '1px solid var(--color-border)',
                background: 'var(--color-background)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <User size={16} style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)' }}>{doc.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{doc.specialty ?? doc.department}</div>
                  </div>
                </div>
                {docAvail.length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No schedule set</div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {docAvail.map((av) => (
                    <div key={av.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 10px',
                      borderRadius: 6,
                      background: av.isBlocked ? 'var(--color-error-light, #fee2e2)' : 'var(--color-success-light, #d1fae5)',
                      fontSize: 12,
                    }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                        {DAY_LABELS[av.dayOfWeek]}
                      </span>
                      <span style={{ color: av.isBlocked ? 'var(--color-error)' : 'var(--color-success)', fontWeight: 600 }}>
                        {av.isBlocked ? (av.blockReason ?? 'Blocked') : `${av.startTime} – ${av.endTime}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── waitlist ── */}
      <div style={s.card}>
        <h2 style={s.sectionTitle}>
          <ListTodo size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Waitlist ({waitlist.length})
        </h2>
        {waitlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-muted)', fontSize: 14 }}>
            No patients on the waitlist
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={s.th}>Patient</th>
                  <th style={s.th}>Requested Doctor</th>
                  <th style={s.th}>Preferred Date</th>
                  <th style={s.th}>Status</th>
                  <th style={{ ...s.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {waitlist.map((w) => (
                  <tr key={w.id}>
                    <td style={s.td}>
                      <span style={{ fontWeight: 600 }}>{w.patient}</span>
                    </td>
                    <td style={{ ...s.td, color: 'var(--color-text-muted)' }}>{w.doctor}</td>
                    <td style={{ ...s.td, color: 'var(--color-text-muted)' }}>{w.preferredDate}</td>
                    <td style={s.td}>
                      <span style={{
                        ...s.badge,
                        background: w.status === 'Contacted' ? 'var(--color-info-light, #dbeafe)' : 'var(--color-warning-light, #fef3c7)',
                        color: w.status === 'Contacted' ? 'var(--color-info, #3b82f6)' : 'var(--color-warning, #f59e0b)',
                      }}>
                        {w.status}
                      </span>
                    </td>
                    <td style={{ ...s.td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          style={{ ...s.btnSm, background: 'var(--color-success)', color: 'white', padding: '6px 12px' }}
                          onClick={() => handlePromote(w)}
                          title="Promote to appointment"
                        >
                          <ArrowUpCircle size={12} /> Promote
                        </button>
                        <button
                          style={{ ...s.btnSm, background: 'var(--color-error)', color: 'white', padding: '6px 12px' }}
                          onClick={() => handleRemoveWait(w.id)}
                          title="Remove from waitlist"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══ Book Appointment Modal ═══ */}
      {showBookModal && (
        <div style={s.overlay} onClick={() => setShowBookModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>Book Appointment</h2>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                onClick={() => setShowBookModal(false)}
              >
                <X size={20} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Patient Name *</label>
              <input
                style={s.input}
                placeholder="Enter patient name"
                value={formPatient}
                onChange={(e) => setFormPatient(e.target.value)}
              />
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Doctor *</label>
              <select style={s.input} value={formDoctor} onChange={(e) => setFormDoctor(e.target.value)}>
                <option value="">Select doctor</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.name}>{d.name} – {d.specialty ?? d.department}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={s.formGroup}>
                <label style={s.label}>Date *</label>
                <input
                  style={s.input}
                  type="date"
                  value={formDate}
                  onChange={(e) => {
                    const d = new Date(e.target.value);
                    setFormDate(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
                  }}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Time *</label>
                <select style={s.input} value={formTime} onChange={(e) => setFormTime(e.target.value)}>
                  <option value="">Select time</option>
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Appointment Type</label>
              <select style={s.input} value={formType} onChange={(e) => setFormType(e.target.value)}>
                {APT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                style={{ ...s.btnPrimary, background: 'var(--color-border)', color: 'var(--color-text)' }}
                onClick={() => setShowBookModal(false)}
              >
                Cancel
              </button>
              <button style={s.btnPrimary} onClick={handleBook}>
                <Plus size={16} /> Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
