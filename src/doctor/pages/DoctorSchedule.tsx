import { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Video,
  MapPin,
  Calendar,
  Lock,
  Check,
  X,
  UserX,
  Clock,
  Stethoscope,
} from 'lucide-react';
import { useProvider } from '../../provider/context/ProviderContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../theme/ThemeContext';
import { PageHeader } from '../../ui';
import './DoctorSchedule.css';

const SLOT_HEIGHT = 54;
const SLOTS = Array.from({ length: 24 }, (_, i) => 7 * 60 + i * 30); // 7AM-7PM in 30min

const formatSlot = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const am = h < 12;
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m === 0 ? '00' : '30'}${am ? 'a' : 'p'}`;
};

const parseTimeToMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
};

const parseAptTime = (timeStr: string) => {
  const [timePart, ampm] = timeStr.split(' ');
  const [hrStr, minStr] = timePart.split(':');
  let hr = parseInt(hrStr, 10);
  if (ampm === 'PM' && hr !== 12) hr += 12;
  if (ampm === 'AM' && hr === 12) hr = 0;
  return hr * 60 + (parseInt(minStr || '0', 10) || 0);
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const DoctorSchedule = () => {
  const { currentStaff, appointments, availability, updateAppointmentStatus } = useProvider();
  const { showToast } = useToast();
  const { tenant } = useTheme();
  const teleconsultEnabled = tenant.features.visits.teleconsultEnabled;

  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [expandedApt, setExpandedApt] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const dateStr = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const shortDateStr = selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const dayOfWeek = selectedDate.getDay();

  const isToday = useMemo(() => {
    const t = new Date();
    return selectedDate.getDate() === t.getDate() && selectedDate.getMonth() === t.getMonth() && selectedDate.getFullYear() === t.getFullYear();
  }, [selectedDate]);

  const myAvailability = availability.filter(a => a.doctorId === currentStaff?.id);

  const dayAppointments = useMemo(() => {
    return appointments.filter(a => {
      const d = new Date(a.date);
      return d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear() && a.doctor === currentStaff?.name;
    }).sort((a, b) => parseAptTime(a.time) - parseAptTime(b.time));
  }, [appointments, selectedDate, currentStaff?.name]);

  const blockedSlots = useMemo(() => {
    return myAvailability.filter(a => a.dayOfWeek === dayOfWeek && a.isBlocked);
  }, [myAvailability, dayOfWeek]);

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const showCurrentLine = isToday && currentMinutes >= 7 * 60 && currentMinutes <= 19 * 60;
  const currentLineTop = showCurrentLine ? (currentMinutes - 7 * 60) * (SLOT_HEIGHT / 30) : 0;

  const goPrev = () => setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() - (viewMode === 'week' ? 7 : 1)); return n; });
  const goNext = () => setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() + (viewMode === 'week' ? 7 : 1)); return n; });
  const goToday = () => setSelectedDate(new Date());

  const weekDays = useMemo(() => {
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return d; });
  }, [selectedDate]);

  // Stats
  const totalApts = dayAppointments.length;
  const confirmedApts = dayAppointments.filter(a => a.status === 'Upcoming').length;
  const teleApts = dayAppointments.filter(a => a.type === 'Teleconsult').length;

  const getAptStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming': return { bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.25)', text: 'var(--color-info)', dot: 'var(--color-info)' };
      case 'Completed': return { bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.25)', text: 'var(--color-success)', dot: 'var(--color-success)' };
      case 'Cancelled': return { bg: 'rgba(239, 68, 68, 0.06)', border: 'rgba(239, 68, 68, 0.2)', text: 'var(--color-error)', dot: 'var(--color-error)' };
      default: return { bg: 'rgba(100, 116, 139, 0.08)', border: 'rgba(100, 116, 139, 0.2)', text: 'var(--color-gray-500)', dot: 'var(--color-gray-500)' };
    }
  };

  return (
    <div className="ds-page">
      {/* ===== Header ===== */}
      <PageHeader
        title="Schedule"
        subtitle={`${isToday ? 'Today' : shortDateStr} · Dr. ${currentStaff?.name?.replace(/^Dr\.\s*/i, '').split(' ')[0] ?? 'Doctor'}`}
        actions={
          <div className="ds-view-toggle">
            {(['day', 'week'] as const).map(mode => (
              <button key={mode} className={`ds-view-btn ${viewMode === mode ? 'ds-view-btn--active' : ''}`} onClick={() => setViewMode(mode)}>
                {mode === 'day' ? 'Day' : 'Week'}
              </button>
            ))}
          </div>
        }
        style={{ marginBottom: 0 }}
      />

      {/* ===== Stats Strip ===== */}
      <div className="ds-stats">
        <div className="ds-stat">
          <div className="ds-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
            <Calendar size={16} style={{ color: 'var(--color-info)' }} />
          </div>
          <div>
            <span className="ds-stat-value">{totalApts}</span>
            <span className="ds-stat-label">Appointments</span>
          </div>
        </div>
        <div className="ds-stat-divider" />
        <div className="ds-stat">
          <div className="ds-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <Check size={16} style={{ color: 'var(--color-success)' }} />
          </div>
          <div>
            <span className="ds-stat-value">{confirmedApts}</span>
            <span className="ds-stat-label">Confirmed</span>
          </div>
        </div>
        {teleconsultEnabled && (
          <>
            <div className="ds-stat-divider" />
            <div className="ds-stat">
              <div className="ds-stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                <Video size={16} style={{ color: 'var(--color-purple)' }} />
              </div>
              <div>
                <span className="ds-stat-value">{teleApts}</span>
                <span className="ds-stat-label">Teleconsult</span>
              </div>
            </div>
          </>
        )}
        <div className="ds-stat-divider" />
        <div className="ds-stat">
          <div className="ds-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <Clock size={16} style={{ color: 'var(--color-warning)' }} />
          </div>
          <div>
            <span className="ds-stat-value">{myAvailability.filter(a => !a.isBlocked).length}</span>
            <span className="ds-stat-label">Avail. Slots</span>
          </div>
        </div>
      </div>

      {/* ===== Date Navigation ===== */}
      <div className="ds-date-nav">
        <button className="ds-nav-btn" onClick={goPrev} aria-label="Previous">
          <ChevronLeft size={18} />
        </button>
        <div className="ds-date-center">
          <span className="ds-date-label">{isDesktop ? dateStr : shortDateStr}</span>
          {!isToday && <button className="ds-today-chip" onClick={goToday}>Today</button>}
          {isToday && <span className="ds-today-badge">Today</span>}
        </div>
        <button className="ds-nav-btn" onClick={goNext} aria-label="Next">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* ===== DAY VIEW ===== */}
      {viewMode === 'day' && (
        <>
          {/* Appointment List (card-based, better than timeline on mobile) */}
          {dayAppointments.length > 0 ? (
            <div className="ds-apt-list">
              {dayAppointments.map(apt => {
                const colors = getAptStatusColor(apt.status);
                const isTele = teleconsultEnabled && apt.type === 'Teleconsult';
                const isExpanded = expandedApt === apt.id;
                return (
                  <div key={apt.id} className={`ds-apt-card ${isExpanded ? 'ds-apt-card--expanded' : ''}`} style={{ borderLeftColor: colors.dot }} onClick={() => setExpandedApt(isExpanded ? null : apt.id)}>
                    <div className="ds-apt-card-main">
                      <div className="ds-apt-time-col">
                        <span className="ds-apt-time">{apt.time}</span>
                        <span className="ds-apt-type-icon">
                          {isTele ? <Video size={14} style={{ color: 'var(--color-purple)' }} /> : <MapPin size={14} style={{ color: 'var(--color-info)' }} />}
                        </span>
                      </div>
                      <div className="ds-apt-info">
                        <span className="ds-apt-specialty">{apt.specialty}</span>
                        <span className="ds-apt-meta">
                          {isTele ? 'Teleconsult' : (apt.location || 'In-Person')}
                          {apt.type && !isTele ? ` · ${apt.type}` : ''}
                        </span>
                      </div>
                      <div className="ds-apt-status-col">
                        <span className="ds-apt-status" style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                          {apt.status}
                        </span>
                      </div>
                    </div>
                    {/* Expanded Actions */}
                    {isExpanded && (
                      <div className="ds-apt-actions">
                        <button className="ds-apt-action ds-apt-action--confirm" onClick={e => { e.stopPropagation(); updateAppointmentStatus(apt.id, 'Upcoming'); showToast('Appointment confirmed', 'success'); }}>
                          <Check size={14} /> Confirm
                        </button>
                        <button className="ds-apt-action ds-apt-action--complete" onClick={e => { e.stopPropagation(); updateAppointmentStatus(apt.id, 'Completed'); showToast('Marked as completed', 'success'); }}>
                          <Stethoscope size={14} /> Complete
                        </button>
                        <button className="ds-apt-action ds-apt-action--cancel" onClick={e => { e.stopPropagation(); updateAppointmentStatus(apt.id, 'Cancelled'); showToast('Appointment cancelled', 'info'); }}>
                          <X size={14} /> Cancel
                        </button>
                        <button className="ds-apt-action ds-apt-action--noshow" onClick={e => { e.stopPropagation(); updateAppointmentStatus(apt.id, 'Cancelled'); showToast('Marked as no-show', 'info'); }}>
                          <UserX size={14} /> No-Show
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="ds-empty">
              <Calendar size={40} style={{ opacity: 0.15, marginBottom: 8 }} />
              <p>No appointments for this day</p>
              <span>Select another date or check the week view</span>
            </div>
          )}

          {/* Timeline (visual, scrollable) */}
          <details className="ds-timeline-details" open={isDesktop}>
            <summary className="ds-timeline-summary">
              <Clock size={16} /> Timeline View
            </summary>
            <div className="ds-timeline">
              {showCurrentLine && (
                <div className="ds-current-line" style={{ top: currentLineTop }}>
                  <span className="ds-current-dot" />
                </div>
              )}
              {SLOTS.map(slotStart => {
                const slotEnd = slotStart + 30;
                const apt = dayAppointments.find(a => {
                  const aptMin = parseAptTime(a.time);
                  return aptMin >= slotStart && aptMin < slotEnd;
                });
                const blocked = blockedSlots.some(b => {
                  const start = parseTimeToMinutes(b.startTime);
                  const end = parseTimeToMinutes(b.endTime);
                  return slotStart >= start && slotEnd <= end;
                });
                const isCurrentSlot = isToday && currentMinutes >= slotStart && currentMinutes < slotEnd;
                const isPast = isToday && slotEnd < currentMinutes;
                return (
                  <div key={slotStart} className={`ds-slot ${isCurrentSlot ? 'ds-slot--current' : ''} ${isPast ? 'ds-slot--past' : ''}`}>
                    <span className="ds-slot-time">{formatSlot(slotStart)}</span>
                    <div className="ds-slot-content">
                      {blocked ? (
                        <div className="ds-slot-block ds-slot-block--locked">
                          <Lock size={12} /> Blocked
                        </div>
                      ) : apt ? (
                        <div className={`ds-slot-block ${apt.type === 'Teleconsult' ? 'ds-slot-block--tele' : 'ds-slot-block--apt'}`}>
                          {apt.type === 'Teleconsult' ? <Video size={12} /> : <Stethoscope size={12} />}
                          <span>{apt.specialty}</span>
                          <span className="ds-slot-status">{apt.status}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </details>
        </>
      )}

      {/* ===== WEEK VIEW ===== */}
      {viewMode === 'week' && (
        <div className="ds-week">
          {weekDays.map(d => {
            const dw = d.getDay();
            const dayApts = appointments.filter(a => {
              const ad = new Date(a.date);
              return ad.getDate() === d.getDate() && ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear() && a.doctor === currentStaff?.name;
            });
            const isDToday = d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            const isSelected = d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth();
            return (
              <div key={d.toISOString()} className={`ds-week-day ${isDToday ? 'ds-week-day--today' : ''} ${isSelected ? 'ds-week-day--selected' : ''}`} onClick={() => { setSelectedDate(d); setViewMode('day'); }}>
                <div className="ds-week-day-header">
                  <span className="ds-week-day-name">{DAY_NAMES[dw]}</span>
                  <span className={`ds-week-day-num ${isDToday ? 'ds-week-day-num--today' : ''}`}>{d.getDate()}</span>
                </div>
                {dayApts.length === 0 ? (
                  <div className="ds-week-empty">No appointments</div>
                ) : (
                  <div className="ds-week-apts">
                    {dayApts.slice(0, 3).map(apt => {
                      const colors = getAptStatusColor(apt.status);
                      return (
                        <div key={apt.id} className="ds-week-apt" style={{ borderLeftColor: colors.dot }}>
                          <span className="ds-week-apt-time">{apt.time}</span>
                          <span className="ds-week-apt-name">{apt.specialty}</span>
                        </div>
                      );
                    })}
                    {dayApts.length > 3 && (
                      <div className="ds-week-more">+{dayApts.length - 3} more</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ===== Availability Section ===== */}
      <section className="ds-availability">
        <div className="ds-avail-header">
          <h3 className="ds-avail-title">
            <Calendar size={16} /> Weekly Availability
          </h3>
          <button className="ds-block-btn" onClick={() => showToast('Time block added to schedule', 'success')}>
            <Lock size={14} /> Block Time
          </button>
        </div>
        {myAvailability.length === 0 ? (
          <p className="ds-avail-empty">No availability configured</p>
        ) : (
          <div className="ds-avail-grid">
            {myAvailability.filter(a => !a.isBlocked).slice(0, 7).map(a => (
              <div key={a.id} className="ds-avail-slot">
                <div className="ds-avail-day">{DAY_FULL[a.dayOfWeek]}</div>
                <div className="ds-avail-time">{a.startTime} – {a.endTime}</div>
                {a.branchName && <span className="ds-avail-branch">{a.branchName}</span>}
                <button className="ds-avail-toggle" onClick={() => showToast(`Slot ${a.startTime}–${a.endTime} toggled`, 'success')}>
                  Toggle
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
