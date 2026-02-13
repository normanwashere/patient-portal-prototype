import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  CalendarClock,
  Users,
  LayoutDashboard,
  Calendar,
  Stethoscope,
  Video,
  FlaskConical,
  Pill,
  Syringe,
  FileCheck,
  Bell,
  ArrowLeftRight,
  ClipboardList,
  LogOut,
  ChevronDown,
  Building2,
  Clock,
  PhoneCall,
  MessageSquare,
} from 'lucide-react';
import { useProvider } from '../../provider/context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';
import type { TenantFeatures } from '../../types/tenant';
import { TeleconsultPiP } from './TeleconsultPiP';
import { DoctorSimulation } from './DoctorSimulation';
import './DoctorLayout.css';

const PREFIX = '/doctor';

interface NavItem {
  to: string;
  icon: React.FC<{ size?: number; className?: string }>;
  label: string;
  hasBadge?: 'queue' | 'results' | 'tasks' | 'teleconsult' | 'messages';
  badgeKey?: string;
  visible?: (f: TenantFeatures) => boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const SIDEBAR_SECTIONS: NavSection[] = [
  {
    label: 'Today',
    items: [
      { to: PREFIX, icon: LayoutDashboard, label: 'Dashboard' },
      { to: `${PREFIX}/schedule`, icon: Calendar, label: 'My Schedule' },
    ],
  },
  {
    label: 'My Queue',
    items: [
      { to: `${PREFIX}/queue`, icon: Users, label: 'In-Clinic Queue', hasBadge: 'queue', visible: (f) => f.queue },
      { to: `${PREFIX}/teleconsult`, icon: Video, label: 'Teleconsult Queue', hasBadge: 'teleconsult', visible: (f) => f.visits.teleconsultNowEnabled },
    ],
  },
  {
    label: 'Clinical',
    items: [
      { to: `${PREFIX}/encounter`, icon: Stethoscope, label: 'Patient Encounter' },
      { to: `${PREFIX}/teleconsult`, icon: Video, label: 'Teleconsult', visible: (f) => f.visits.teleconsultEnabled && !f.visits.teleconsultNowEnabled },
      { to: `${PREFIX}/results`, icon: FlaskConical, label: 'Lab Results', hasBadge: 'results', visible: (f) => f.visits.clinicLabFulfillmentEnabled },
      { to: `${PREFIX}/prescriptions`, icon: Pill, label: 'Prescriptions' },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: `${PREFIX}/messages`, icon: MessageSquare, label: 'Messages', hasBadge: 'messages' },
      { to: `${PREFIX}/tasks`, icon: ClipboardList, label: 'Tasks', hasBadge: 'tasks' },
      { to: `${PREFIX}/immunizations`, icon: Syringe, label: 'Immunizations' },
      { to: `${PREFIX}/loa`, icon: FileCheck, label: 'LOA Review', visible: (f) => f.loa },
    ],
  },
];

const ALL_BOTTOM_NAV_ITEMS: NavItem[] = [
  { to: PREFIX, icon: CalendarClock, label: 'Today', badgeKey: '' },
  { to: `${PREFIX}/queue`, icon: Users, label: 'Queue', badgeKey: 'queue', visible: (f) => f.queue },
  { to: `${PREFIX}/encounter`, icon: Stethoscope, label: 'Encounter', badgeKey: '' },
  { to: `${PREFIX}/results`, icon: FlaskConical, label: 'Results', badgeKey: 'results', visible: (f) => f.visits.clinicLabFulfillmentEnabled },
  { to: `${PREFIX}/tasks`, icon: ClipboardList, label: 'Tasks', badgeKey: 'tasks' },
];

export const DoctorLayout = () => {
  const {
    currentStaff,
    switchApp,
    internalMessages,
    queueStats,
    criticalAlerts,
    doctorMode,
    setDoctorMode,
    activeTeleconsultCall,
  } = useProvider();
  const navigate = useNavigate();
  const { tenant } = useTheme();
  const teleconsultNowEnabled = tenant.features.visits.teleconsultNowEnabled;
  // Live queue mode toggle only when teleconsult NOW is available
  const hasLiveQueue = teleconsultNowEnabled;

  const hasCDSS = tenant.features.cdss ?? false;

  const messageCount = internalMessages.filter(
    (m) => m.toId === currentStaff.id && !m.read
  ).length;

  const queueCount = queueStats.totalInQueue;
  const alertBadgeCount = hasCDSS ? criticalAlerts.filter(a => !a.dismissed).length : 0;
  const pendingResultCount = 0; // placeholder – not yet in context
  const teleconsultQueueCount = 3; // mock – patients waiting in teleconsult queue
  const taskBadgeCount = alertBadgeCount;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);

  // Expose simulation state globally for DemoControls
  useEffect(() => {
    (window as any).__startDoctorSimulation = () => setShowSimulation(true);
    (window as any).__doctorSimulationRunning = showSimulation;
    return () => { delete (window as any).__startDoctorSimulation; };
  }, [showSimulation]);

  // Active teleconsult elapsed timer for sidebar
  const [tcElapsed, setTcElapsed] = useState(0);
  useEffect(() => {
    if (!activeTeleconsultCall) { setTcElapsed(0); return; }
    const tick = () => setTcElapsed(Math.floor((Date.now() - activeTeleconsultCall.startedAt) / 1000));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [activeTeleconsultCall]);
  const fmtTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="doctor-shell">
      {/* Top Header (Mobile) */}
      <header className="doctor-header">
        <button
          className="doctor-header-left doctor-header-left--tappable"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-expanded={mobileMenuOpen}
          aria-label="Profile menu"
        >
          <div className="doctor-header-info">
            <span className="doctor-header-name">
              {currentStaff.name}
              <ChevronDown size={14} className={`doctor-header-chevron ${mobileMenuOpen ? 'open' : ''}`} />
            </span>
            <span className="doctor-header-specialty">
              {currentStaff.specialty ?? currentStaff.department}
            </span>
          </div>
        </button>
        <div className="doctor-header-actions">
          {/* Mobile mode toggle */}
          {hasLiveQueue && (
            <button
              onClick={() => setDoctorMode(doctorMode === 'in-clinic' ? 'teleconsult' : 'in-clinic')}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 700, minHeight: 36,
                background: doctorMode === 'teleconsult' ? 'var(--color-secondary-bg, rgba(124,58,237,0.1))' : 'var(--color-primary-transparent, rgba(59,130,246,0.08))',
                color: doctorMode === 'teleconsult' ? 'var(--color-secondary, #7c3aed)' : 'var(--color-primary)',
              }}
              aria-label="Toggle doctor mode"
            >
              {doctorMode === 'teleconsult' ? <Video size={14} /> : <Building2 size={14} />}
              {doctorMode === 'teleconsult' ? 'Tele' : 'Clinic'}
            </button>
          )}
          <Link
            to={`${PREFIX}/messages`}
            className="doctor-header-btn doctor-notification-btn"
            aria-label="Messages"
          >
            <MessageSquare size={19} />
            {messageCount > 0 && (
              <span className="doctor-header-badge">{messageCount}</span>
            )}
          </Link>
          <Link
            to={`${PREFIX}/tasks`}
            className="doctor-header-btn doctor-notification-btn"
            aria-label="Tasks & Notifications"
          >
            <Bell size={20} />
            {taskBadgeCount > 0 && (
              <span className="doctor-header-badge">{taskBadgeCount}</span>
            )}
          </Link>
          <img
            src={tenant.logoUrl}
            alt={tenant.name}
            className="doctor-header-logo"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* Mobile profile dropdown */}
        {mobileMenuOpen && (
          <>
            <div className="doctor-mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
            <div className="doctor-mobile-menu">
              <Link
                to="/provider"
                className="doctor-mobile-menu-item"
                onClick={() => { switchApp('provider'); setMobileMenuOpen(false); }}
              >
                <ArrowLeftRight size={16} />
                Switch to Provider App
              </Link>
              <Link
                to="/login"
                className="doctor-mobile-menu-item doctor-mobile-menu-item--logout"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogOut size={16} />
                Logout
              </Link>
            </div>
          </>
        )}
      </header>

      {/* Desktop Sidebar */}
      <aside className="doctor-sidebar" aria-label="Doctor navigation">
        <div className="doctor-sidebar-inner">
          <div className="doctor-sidebar-header">
            <div className="doctor-sidebar-profile">
              <img
                src={currentStaff.photoUrl}
                alt={currentStaff.name}
                className="doctor-sidebar-avatar"
              />
              <div className="doctor-sidebar-info">
                <span className="doctor-sidebar-name">{currentStaff.name}</span>
                <span className="doctor-sidebar-specialty">
                  {currentStaff.specialty ?? currentStaff.department}
                </span>
              </div>
            </div>
          </div>

          {/* Mode toggle: In Clinic ↔ Teleconsult (only when live teleconsult NOW is available) */}
          {hasLiveQueue && (
            <div style={{
              margin: '0 12px 8px', padding: 3, borderRadius: 10,
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              display: 'flex', gap: 2,
            }}>
              <button
                onClick={() => setDoctorMode('in-clinic')}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '8px 6px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 700, transition: 'all 0.2s',
                  background: doctorMode === 'in-clinic' ? 'var(--color-primary)' : 'transparent',
                  color: doctorMode === 'in-clinic' ? '#fff' : 'var(--color-text-muted)',
                }}
              >
                <Building2 size={14} /> In Clinic
              </button>
              <button
                onClick={() => setDoctorMode('teleconsult')}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '8px 6px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 700, transition: 'all 0.2s',
                  background: doctorMode === 'teleconsult' ? 'var(--color-secondary, #7c3aed)' : 'transparent',
                  color: doctorMode === 'teleconsult' ? '#fff' : 'var(--color-text-muted)',
                }}
              >
                <Video size={14} /> Teleconsult
              </button>
            </div>
          )}

          {/* Active teleconsult call indicator in sidebar */}
          {activeTeleconsultCall && (
            <div
              onClick={() => navigate('/doctor/teleconsult')}
              style={{
                margin: '0 12px 10px', padding: '10px 12px', borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(99,102,241,0.05))',
                border: '1.5px solid rgba(124,58,237,0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#4ade80', animation: 'pulse 2s infinite',
                }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-secondary, #7c3aed)', letterSpacing: '0.03em' }}>
                  ACTIVE CALL
                </span>
                <span style={{
                  marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--color-secondary, #7c3aed)',
                  display: 'flex', alignItems: 'center', gap: 3,
                }}>
                  <Clock size={10} />
                  {fmtTime(tcElapsed)}
                </span>
              </div>
              <div style={{
                fontSize: 12, fontWeight: 600, color: 'var(--color-text)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                marginBottom: 6,
              }}>
                {activeTeleconsultCall.patientName}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); navigate('/doctor/teleconsult'); }}
                style={{
                  width: '100%', padding: '6px 0', borderRadius: 7,
                  border: 'none', cursor: 'pointer',
                  background: 'var(--color-secondary, linear-gradient(135deg, #7c3aed, #6366f1))',
                  color: '#fff', fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}
              >
                <PhoneCall size={12} /> Return to Call
              </button>
            </div>
          )}

          <nav className="doctor-sidebar-nav">
            {SIDEBAR_SECTIONS.map((section) => {
              const visibleItems = section.items.filter(
                (item) => !item.visible || item.visible(tenant.features)
              );
              if (visibleItems.length === 0) return null;
              return (
                <div key={section.label} className="doctor-nav-section">
                  <span className="doctor-nav-section-label">{section.label}</span>
                  {visibleItems.map((item) => {
                    const badgeCount =
                      item.hasBadge === 'queue' ? queueCount :
                      item.hasBadge === 'results' ? pendingResultCount :
                      item.hasBadge === 'tasks' ? taskBadgeCount :
                      item.hasBadge === 'teleconsult' ? teleconsultQueueCount :
                      item.hasBadge === 'messages' ? messageCount :
                      0;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === PREFIX}
                        className={({ isActive }) =>
                          `doctor-sidebar-item ${isActive ? 'active' : ''}`
                        }
                      >
                        <item.icon size={18} className="doctor-sidebar-icon" />
                        <span>{item.label}</span>
                        {badgeCount > 0 && (
                          <span className="doctor-sidebar-badge">{badgeCount}</span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              );
            })}
          </nav>

          <div className="doctor-sidebar-footer">
            <Link
              to="/provider"
              className="doctor-sidebar-switch"
              onClick={() => switchApp('provider')}
            >
              <ArrowLeftRight size={14} />
              Switch to Provider App
            </Link>
            <Link to="/dashboard" className="doctor-sidebar-switch doctor-sidebar-back">
              <ArrowLeftRight size={14} />
              Back to Patient Portal
            </Link>
            <Link to="/apps" className="doctor-sidebar-switch doctor-sidebar-signout">
              <LogOut size={14} />
              Sign Out
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="doctor-main">
        <Outlet />
      </main>

      {/* Teleconsult PiP — floating mini video when call is active and user navigates away */}
      <TeleconsultPiP />

      {/* Mobile Bottom Nav - filtered by tenant features */}
      <nav
        className="doctor-bottom-nav"
        aria-label="Quick navigation"
        role="navigation"
      >
        {ALL_BOTTOM_NAV_ITEMS
          .filter((item) => !item.visible || item.visible(tenant.features))
          .map((item) => {
            const badgeCount =
              item.badgeKey === 'queue' ? queueCount :
              item.badgeKey === 'results' ? pendingResultCount :
              item.badgeKey === 'tasks' ? taskBadgeCount :
              item.badgeKey === 'teleconsult' ? teleconsultQueueCount :
              item.badgeKey === 'messages' ? messageCount :
              0;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === PREFIX}
                className={({ isActive }) =>
                  `doctor-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <item.icon size={22} className="doctor-nav-icon" />
                <span className="doctor-nav-label">{item.label}</span>
                {badgeCount > 0 && (
                  <span className="doctor-nav-badge">{badgeCount}</span>
                )}
              </NavLink>
            );
          })}
      </nav>

      {/* Doctor Simulation Overlay */}
      {showSimulation && (
        <DoctorSimulation onClose={() => setShowSimulation(false)} />
      )}
    </div>
  );
};
