import React, { useState, useMemo } from 'react';
import {
  Users,
  CalendarClock,
  ClipboardCheck,
  Search,
  UserCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Pause,
  Play,
} from 'lucide-react';
import { useProvider } from '../context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';
import { useToast } from '../../context/ToastContext';
import type { StaffUser, ShiftSchedule } from '../types';

/* ─── helpers ─── */
function formatRole(role: string): string {
  const map: Record<string, string> = {
    admin: 'Admin', doctor: 'Doctor', nurse: 'Nurse', lab_tech: 'Lab Tech',
    pharmacist: 'Pharmacist', billing_staff: 'Billing', front_desk: 'Front Desk',
    hr: 'HR', imaging_tech: 'Imaging Tech',
  };
  return map[role] ?? role.replace(/_/g, ' ');
}

const staffStatusColors: Record<string, { bg: string; fg: string }> = {
  Active: { bg: 'var(--color-success-light, #d1fae5)', fg: 'var(--color-success, #10b981)' },
  'On Leave': { bg: 'var(--color-warning-light, #fef3c7)', fg: 'var(--color-warning, #f59e0b)' },
  Inactive: { bg: 'var(--color-error-light, #fee2e2)', fg: 'var(--color-error, #ef4444)' },
};

const shiftStatusColors: Record<string, { bg: string; fg: string }> = {
  Scheduled: { bg: 'var(--color-info-light, #dbeafe)', fg: 'var(--color-info, #3b82f6)' },
  'On Duty': { bg: 'var(--color-success-light, #d1fae5)', fg: 'var(--color-success, #10b981)' },
  Completed: { bg: 'var(--color-gray-200, #e2e8f0)', fg: 'var(--color-text-muted)' },
  Absent: { bg: 'var(--color-error-light, #fee2e2)', fg: 'var(--color-error, #ef4444)' },
  Leave: { bg: 'var(--color-warning-light, #fef3c7)', fg: 'var(--color-warning, #f59e0b)' },
};

type TabId = 'directory' | 'shifts' | 'attendance';

/* ─── styles ─── */
const s: Record<string, React.CSSProperties> = {
  page: { padding: 24, background: 'var(--color-background)', minHeight: '100%' },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 },
  subtitle: { fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 24 },
  tabs: {
    display: 'flex',
    gap: 4,
    borderBottom: '1px solid var(--color-border)',
    marginBottom: 20,
    paddingBottom: 0,
  },
  tab: {
    padding: '12px 20px',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: -1,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  },
  tabActive: {
    color: 'var(--color-primary)',
    borderBottomColor: 'var(--color-primary)',
  },
  card: {
    background: 'var(--color-surface)',
    borderRadius: 12,
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border)',
    padding: 20,
    marginBottom: 20,
  },
  toolbar: { display: 'flex', gap: 12, flexWrap: 'wrap' as const, marginBottom: 20 },
  searchWrap: {
    flex: 1,
    minWidth: 200,
    position: 'relative' as const,
  },
  searchIcon: {
    position: 'absolute' as const,
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--color-text-muted)',
  },
  searchInput: {
    width: '100%',
    padding: '10px 14px 10px 44px',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    fontSize: 14,
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    boxSizing: 'border-box' as const,
  },
  select: {
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    fontSize: 14,
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    cursor: 'pointer',
  },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: {
    padding: '12px 14px',
    textAlign: 'left' as const,
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    background: 'var(--color-background)',
    borderBottom: '2px solid var(--color-border)',
  },
  td: {
    padding: '14px',
    fontSize: 14,
    color: 'var(--color-text)',
    borderBottom: '1px solid var(--color-border)',
  },
  badge: {
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    display: 'inline-block',
  },
  statusBtn: {
    padding: '5px 10px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    background: 'var(--color-surface)',
    borderRadius: 12,
    padding: 20,
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border)',
    textAlign: 'center' as const,
  },
  statValue: { fontSize: 28, fontWeight: 700, color: 'var(--color-text)' },
  statLabel: { fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 },
};

/* ═══════════════════════════════════════════════ */
export const HRStaff = () => {
  const { staff, shiftSchedules, updateStaffStatus, updateShiftStatus } = useProvider();
  useTheme();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabId>('directory');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  /* ── filtered staff ── */
  const filteredStaff = useMemo(() => {
    return staff.filter((st) => {
      const matchSearch = !search ||
        st.name.toLowerCase().includes(search.toLowerCase()) ||
        (st.specialty?.toLowerCase().includes(search.toLowerCase())) ||
        st.email.toLowerCase().includes(search.toLowerCase());
      const matchDept = !deptFilter || st.department === deptFilter;
      const matchRole = !roleFilter || st.role === roleFilter;
      return matchSearch && matchDept && matchRole;
    });
  }, [staff, search, deptFilter, roleFilter]);

  const departments = useMemo(() => [...new Set(staff.map((st) => st.department))], [staff]);
  const roles = useMemo(() => [...new Set(staff.map((st) => st.role))], [staff]);

  /* ── today's shifts ── */
  const todayShifts = useMemo(() => {
    const today = new Date();
    return shiftSchedules.filter((sh) => {
      try {
        const d = new Date(sh.date);
        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      } catch {
        return true; // show all if date parsing fails
      }
    });
  }, [shiftSchedules]);

  // If no shifts match "today" exactly, show all shifts (demo-friendly)
  const displayShifts = todayShifts.length > 0 ? todayShifts : shiftSchedules;

  /* ── staff status handler ── */
  const handleStaffStatus = (staffId: string, status: StaffUser['status']) => {
    updateStaffStatus(staffId, status);
    showToast(`Staff status updated to ${status}`, 'success');
  };

  /* ── shift status handler ── */
  const handleShiftStatus = (shiftId: string, status: ShiftSchedule['status']) => {
    updateShiftStatus(shiftId, status);
    showToast(`Shift status updated to ${status}`, 'success');
  };

  /* ── attendance stats ── */
  const attendanceStats = useMemo(() => {
    const total = shiftSchedules.length;
    const completed = shiftSchedules.filter((sh) => sh.status === 'Completed').length;
    const onDuty = shiftSchedules.filter((sh) => sh.status === 'On Duty').length;
    const absent = shiftSchedules.filter((sh) => sh.status === 'Absent').length;
    const onLeave = shiftSchedules.filter((sh) => sh.status === 'Leave').length;
    const scheduled = shiftSchedules.filter((sh) => sh.status === 'Scheduled').length;
    const attendanceRate = total > 0 ? Math.round(((completed + onDuty) / total) * 100) : 0;
    return { total, completed, onDuty, absent, onLeave, scheduled, attendanceRate };
  }, [shiftSchedules]);

  const staffStats = useMemo(() => {
    const active = staff.filter((st) => st.status === 'Active').length;
    const onLeave = staff.filter((st) => st.status === 'On Leave').length;
    const inactive = staff.filter((st) => st.status === 'Inactive').length;
    return { total: staff.length, active, onLeave, inactive };
  }, [staff]);

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'directory', label: 'Staff Directory', icon: <Users size={16} /> },
    { id: 'shifts', label: 'Shifts', icon: <CalendarClock size={16} /> },
    { id: 'attendance', label: 'Attendance', icon: <ClipboardCheck size={16} /> },
  ];

  return (
    <div style={s.page}>
      <h1 style={s.title}>HR & Staff Management</h1>
      <p style={s.subtitle}>Manage staff directory, shifts, and attendance tracking</p>

      {/* ── tabs ── */}
      <div style={s.tabs}>
        {tabs.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            style={{ ...s.tab, ...(activeTab === id ? s.tabActive : {}) }}
            onClick={() => setActiveTab(id)}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* ═══ Staff Directory Tab ═══ */}
      {activeTab === 'directory' && (
        <div style={s.card}>
          <div style={s.toolbar}>
            <div style={s.searchWrap}>
              <Search size={18} style={s.searchIcon} />
              <input
                type="search"
                placeholder="Search by name, specialty, or email..."
                style={s.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select style={s.select} value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select style={s.select} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              {roles.map((r) => <option key={r} value={r}>{formatRole(r)}</option>)}
            </select>
          </div>

          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>
            Showing {filteredStaff.length} of {staff.length} staff members
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Staff</th>
                  <th style={s.th}>Role</th>
                  <th style={s.th}>Department</th>
                  <th style={s.th}>Contact</th>
                  <th style={s.th}>Status</th>
                  <th style={{ ...s.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((st) => {
                  const sc = staffStatusColors[st.status] ?? staffStatusColors.Active;
                  return (
                    <tr key={st.id}>
                      <td style={s.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img
                            src={st.photoUrl}
                            alt=""
                            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://ui-avatars.com/api/?name=' + encodeURIComponent(st.name) + '&background=random';
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{st.name}</div>
                            {st.specialty && <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{st.specialty}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={s.td}>
                        <span style={{
                          ...s.badge,
                          background: 'var(--color-info-light, #dbeafe)',
                          color: 'var(--color-info, #3b82f6)',
                        }}>
                          {formatRole(st.role)}
                        </span>
                      </td>
                      <td style={s.td}>{st.department}</td>
                      <td style={s.td}>
                        <div style={{ fontSize: 13 }}>{st.email}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{st.phone}</div>
                      </td>
                      <td style={s.td}>
                        <span style={{ ...s.badge, background: sc.bg, color: sc.fg }}>{st.status}</span>
                      </td>
                      <td style={{ ...s.td, textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {st.status !== 'Active' && (
                            <button
                              style={{ ...s.statusBtn, background: 'var(--color-success)', color: 'white' }}
                              onClick={() => handleStaffStatus(st.id, 'Active')}
                              title="Set Active"
                            >
                              <CheckCircle2 size={12} /> Active
                            </button>
                          )}
                          {st.status !== 'On Leave' && (
                            <button
                              style={{ ...s.statusBtn, background: 'var(--color-warning)', color: 'white' }}
                              onClick={() => handleStaffStatus(st.id, 'On Leave')}
                              title="Set On Leave"
                            >
                              <Pause size={12} /> Leave
                            </button>
                          )}
                          {st.status !== 'Inactive' && (
                            <button
                              style={{ ...s.statusBtn, background: 'var(--color-error)', color: 'white' }}
                              onClick={() => handleStaffStatus(st.id, 'Inactive')}
                              title="Set Inactive"
                            >
                              <XCircle size={12} /> Inactive
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ Shifts Tab ═══ */}
      {activeTab === 'shifts' && (
        <div style={s.card}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
            <CalendarClock size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            {todayShifts.length > 0 ? "Today's Shifts" : 'All Shifts'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 20 }}>
            {displayShifts.length} shifts displayed
          </p>

          {displayShifts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>No shifts scheduled</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Staff</th>
                    <th style={s.th}>Role</th>
                    <th style={s.th}>Department</th>
                    <th style={s.th}>Shift</th>
                    <th style={s.th}>Date</th>
                    <th style={s.th}>Status</th>
                    <th style={{ ...s.th, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayShifts.map((sh) => {
                    const sc = shiftStatusColors[sh.status] ?? shiftStatusColors.Scheduled;
                    return (
                      <tr key={sh.id}>
                        <td style={s.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <UserCircle size={18} style={{ color: 'var(--color-primary)' }} />
                            <span style={{ fontWeight: 600 }}>{sh.staffName}</span>
                          </div>
                        </td>
                        <td style={s.td}>
                          <span style={{
                            ...s.badge,
                            background: 'var(--color-info-light, #dbeafe)',
                            color: 'var(--color-info, #3b82f6)',
                          }}>
                            {formatRole(sh.role)}
                          </span>
                        </td>
                        <td style={s.td}>{sh.department}</td>
                        <td style={s.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock size={14} style={{ color: 'var(--color-text-muted)' }} />
                            {sh.shift}
                          </div>
                        </td>
                        <td style={s.td}>{sh.date}</td>
                        <td style={s.td}>
                          <span style={{ ...s.badge, background: sc.bg, color: sc.fg }}>{sh.status}</span>
                        </td>
                        <td style={{ ...s.td, textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            {sh.status === 'Scheduled' && (
                              <button
                                style={{ ...s.statusBtn, background: 'var(--color-success)', color: 'white' }}
                                onClick={() => handleShiftStatus(sh.id, 'On Duty')}
                              >
                                <Play size={12} /> Start
                              </button>
                            )}
                            {sh.status === 'On Duty' && (
                              <button
                                style={{ ...s.statusBtn, background: 'var(--color-primary)', color: 'white' }}
                                onClick={() => handleShiftStatus(sh.id, 'Completed')}
                              >
                                <CheckCircle2 size={12} /> Complete
                              </button>
                            )}
                            {(sh.status === 'Scheduled' || sh.status === 'On Duty') && (
                              <>
                                <button
                                  style={{ ...s.statusBtn, background: 'var(--color-error)', color: 'white' }}
                                  onClick={() => handleShiftStatus(sh.id, 'Absent')}
                                >
                                  <XCircle size={12} /> Absent
                                </button>
                                <button
                                  style={{ ...s.statusBtn, background: 'var(--color-warning)', color: 'white' }}
                                  onClick={() => handleShiftStatus(sh.id, 'Leave')}
                                >
                                  <Pause size={12} /> Leave
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══ Attendance Tab ═══ */}
      {activeTab === 'attendance' && (
        <>
          {/* Staff overview */}
          <div style={s.statsGrid}>
            <div style={s.statCard}>
              <div style={{ ...s.statValue, color: 'var(--color-primary)' }}>{staffStats.total}</div>
              <div style={s.statLabel}>Total Staff</div>
            </div>
            <div style={s.statCard}>
              <div style={{ ...s.statValue, color: 'var(--color-success)' }}>{staffStats.active}</div>
              <div style={s.statLabel}>Active</div>
            </div>
            <div style={s.statCard}>
              <div style={{ ...s.statValue, color: 'var(--color-warning)' }}>{staffStats.onLeave}</div>
              <div style={s.statLabel}>On Leave</div>
            </div>
            <div style={s.statCard}>
              <div style={{ ...s.statValue, color: 'var(--color-error)' }}>{staffStats.inactive}</div>
              <div style={s.statLabel}>Inactive</div>
            </div>
          </div>

          {/* Shift / attendance summary */}
          <div style={s.card}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 20 }}>
              <ClipboardCheck size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
              Attendance Summary
            </h2>

            <div style={s.statsGrid}>
              <div style={{ ...s.statCard, background: 'var(--color-background)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                  <CheckCircle2 size={20} style={{ color: 'var(--color-success)' }} />
                </div>
                <div style={s.statValue}>{attendanceStats.attendanceRate}%</div>
                <div style={s.statLabel}>Attendance Rate</div>
              </div>
              <div style={{ ...s.statCard, background: 'var(--color-background)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                  <CalendarClock size={20} style={{ color: 'var(--color-info, #3b82f6)' }} />
                </div>
                <div style={s.statValue}>{attendanceStats.scheduled}</div>
                <div style={s.statLabel}>Scheduled</div>
              </div>
              <div style={{ ...s.statCard, background: 'var(--color-background)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                  <Play size={20} style={{ color: 'var(--color-success)' }} />
                </div>
                <div style={s.statValue}>{attendanceStats.onDuty}</div>
                <div style={s.statLabel}>On Duty</div>
              </div>
              <div style={{ ...s.statCard, background: 'var(--color-background)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                  <CheckCircle2 size={20} style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <div style={s.statValue}>{attendanceStats.completed}</div>
                <div style={s.statLabel}>Completed</div>
              </div>
              <div style={{ ...s.statCard, background: 'var(--color-background)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                  <AlertCircle size={20} style={{ color: 'var(--color-error)' }} />
                </div>
                <div style={s.statValue}>{attendanceStats.absent}</div>
                <div style={s.statLabel}>Absent</div>
              </div>
              <div style={{ ...s.statCard, background: 'var(--color-background)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                  <Pause size={20} style={{ color: 'var(--color-warning)' }} />
                </div>
                <div style={s.statValue}>{attendanceStats.onLeave}</div>
                <div style={s.statLabel}>On Leave</div>
              </div>
            </div>

            {/* Attendance rate progress bar */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>Overall Attendance Rate</span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{attendanceStats.attendanceRate}%</span>
              </div>
              <div style={{ height: 12, background: 'var(--color-gray-200, #e2e8f0)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{
                  width: `${attendanceStats.attendanceRate}%`,
                  height: '100%',
                  background: attendanceStats.attendanceRate >= 90
                    ? 'var(--color-success)'
                    : attendanceStats.attendanceRate >= 75
                      ? 'var(--color-warning)'
                      : 'var(--color-error)',
                  borderRadius: 6,
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>

            {/* Department breakdown */}
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginTop: 28, marginBottom: 16 }}>
              Department Breakdown
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Department</th>
                    <th style={s.th}>Total Staff</th>
                    <th style={s.th}>Active</th>
                    <th style={s.th}>On Leave</th>
                    <th style={s.th}>Inactive</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => {
                    const deptStaff = staff.filter((st) => st.department === dept);
                    const active = deptStaff.filter((st) => st.status === 'Active').length;
                    const onLeave = deptStaff.filter((st) => st.status === 'On Leave').length;
                    const inactive = deptStaff.filter((st) => st.status === 'Inactive').length;
                    return (
                      <tr key={dept}>
                        <td style={{ ...s.td, fontWeight: 600 }}>{dept}</td>
                        <td style={s.td}>{deptStaff.length}</td>
                        <td style={s.td}>
                          <span style={{ ...s.badge, ...{ background: staffStatusColors.Active.bg, color: staffStatusColors.Active.fg } }}>
                            {active}
                          </span>
                        </td>
                        <td style={s.td}>
                          <span style={{ ...s.badge, ...{ background: staffStatusColors['On Leave'].bg, color: staffStatusColors['On Leave'].fg } }}>
                            {onLeave}
                          </span>
                        </td>
                        <td style={s.td}>
                          <span style={{ ...s.badge, ...{ background: staffStatusColors.Inactive.bg, color: staffStatusColors.Inactive.fg } }}>
                            {inactive}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
