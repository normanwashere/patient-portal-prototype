import { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
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
} from 'lucide-react';
import { useProvider } from '../../provider/context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';
import type { TenantFeatures } from '../../types/tenant';
import './DoctorLayout.css';

const PREFIX = '/doctor';

interface NavItem {
  to: string;
  icon: React.FC<{ size?: number; className?: string }>;
  label: string;
  hasBadge?: 'queue' | 'results' | 'tasks';
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
      { to: `${PREFIX}/queue`, icon: Users, label: 'My Queue', hasBadge: 'queue', visible: (f) => f.queue },
    ],
  },
  {
    label: 'Clinical',
    items: [
      { to: `${PREFIX}/encounter`, icon: Stethoscope, label: 'Patient Encounter' },
      { to: `${PREFIX}/teleconsult`, icon: Video, label: 'Teleconsult', visible: (f) => f.visits.teleconsultEnabled },
      { to: `${PREFIX}/results`, icon: FlaskConical, label: 'Lab Results', hasBadge: 'results', visible: (f) => f.visits.clinicLabFulfillmentEnabled },
      { to: `${PREFIX}/prescriptions`, icon: Pill, label: 'Prescriptions' },
    ],
  },
  {
    label: 'Management',
    items: [
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
  } = useProvider();
  const { tenant } = useTheme();

  const hasCDSS = tenant.features.cdss ?? false;

  const notificationCount = internalMessages.filter(
    (m) => m.toId === currentStaff.id && !m.read
  ).length;

  const queueCount = queueStats.totalInQueue;
  const alertBadgeCount = hasCDSS ? criticalAlerts.filter(a => !a.dismissed).length : 0;
  const pendingResultCount = 0; // placeholder – not yet in context
  const taskBadgeCount = notificationCount + alertBadgeCount;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <Link
            to={`${PREFIX}/tasks`}
            className="doctor-header-btn doctor-notification-btn"
            aria-label="Tasks & Notifications"
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="doctor-header-badge">{notificationCount}</span>
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
    </div>
  );
};
