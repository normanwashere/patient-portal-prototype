import { useState, useMemo } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  HeartPulse,
  Microscope,
  Pill,
  BookOpen,
  CreditCard,
  UserCog,
  Building2,
  Shield,
  MessageSquare,
  CalendarCheck,
  BarChart3,
  FileText,
  Bell,
  Search,
  ChevronDown,
  Menu,
  Stethoscope,
  Cable,
  Server,
  Video,
  Home,
  MapPin,
  LogOut,
  FolderSearch,
} from 'lucide-react';
import { useProvider } from '../context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';
import { isProviderModuleAllowed } from '../roleAccess';
import type { TenantFeatures } from '../../types/tenant';
import clsx from 'clsx';
import './ProviderLayout.css';

const PREFIX = '/provider';

interface SidebarItem {
  to: string;
  icon: React.FC<{ size?: number; className?: string }>;
  label: string;
  /** Return false to hide this item for the current tenant */
  visible?: (f: TenantFeatures) => boolean;
}

interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    label: 'Main',
    items: [
      { to: `${PREFIX}/dashboard`, icon: LayoutDashboard, label: 'Dashboard' },
      { to: `${PREFIX}/queue`, icon: Users, label: 'Queue Management', visible: (f) => f.queue },
      { to: `${PREFIX}/teleconsult-queue`, icon: Video, label: 'Teleconsult Queue', visible: (f) => f.visits.teleconsultEnabled },
      { to: `${PREFIX}/scheduling`, icon: CalendarDays, label: 'Scheduling', visible: (f) => f.appointments },
    ],
  },
  {
    label: 'Clinical',
    items: [
      { to: `${PREFIX}/nursing`, icon: HeartPulse, label: 'Nursing Station' },
      { to: `${PREFIX}/lab-imaging`, icon: Microscope, label: 'Lab & Imaging', visible: (f) => f.visits.clinicLabFulfillmentEnabled },
      { to: `${PREFIX}/pharmacy`, icon: Pill, label: 'Pharmacy', visible: (f) => f.visits.clinicLabFulfillmentEnabled },
      { to: `${PREFIX}/drug-master`, icon: BookOpen, label: 'Drug Master' },
      { to: `${PREFIX}/homecare`, icon: Home, label: 'HomeCare', visible: (f) => !!f.visits.homeCareEnabled },
      { to: `${PREFIX}/records`, icon: FolderSearch, label: 'Records' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: `${PREFIX}/billing`, icon: CreditCard, label: 'Billing & Revenue' },
      { to: `${PREFIX}/hr`, icon: UserCog, label: 'HR & Staff' },
      { to: `${PREFIX}/facility`, icon: Building2, label: 'Facility' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: `${PREFIX}/users`, icon: Shield, label: 'User Management' },
      { to: `${PREFIX}/communications`, icon: MessageSquare, label: 'Communications' },
      { to: `${PREFIX}/events`, icon: CalendarCheck, label: 'Events' },
      { to: `${PREFIX}/analytics`, icon: BarChart3, label: 'Analytics' },
      { to: `${PREFIX}/forms`, icon: FileText, label: 'Forms' },
      { to: `${PREFIX}/integrations`, icon: Cable, label: 'Integrations' },
      { to: `${PREFIX}/architecture`, icon: Server, label: 'Architecture' },
    ],
  },
];

function formatRole(role: string): string {
  const map: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    doctor: 'Doctor',
    nurse: 'Nurse',
    lab_tech: 'Lab Tech',
    pharmacist: 'Pharmacist',
    billing_staff: 'Billing',
    front_desk: 'Front Desk',
    hr: 'HR',
    imaging_tech: 'Imaging Tech',
  };
  return map[role] ?? role.replace(/_/g, ' ');
}

function pathToBreadcrumb(pathname: string): { label: string; path?: string }[] {
  const segments = pathname.replace(PREFIX, '').split('/').filter(Boolean);
  const result: { label: string; path?: string }[] = [{ label: 'Provider', path: PREFIX }];
  let acc = PREFIX;
  for (const seg of segments) {
    acc += `/${seg}`;
    result.push({
      label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
      path: acc,
    });
  }
  return result;
}

export const ProviderLayout = () => {
  const { currentStaff, switchApp, internalMessages, currentBranchId, availableBranches, switchBranch } = useProvider();
  const navigate = useNavigate();
  const { tenant } = useTheme();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const isSuperAdmin = currentStaff.role === 'super_admin';
  const currentBranch = availableBranches.find(b => b.id === currentBranchId) ?? availableBranches[0];

  const unreadCount = internalMessages.filter((m) => !m.read).length;
  const breadcrumbs = pathToBreadcrumb(location.pathname);

  const ALWAYS_ALLOWED = ['dashboard', 'notifications', 'profile', 'settings'];
  const currentRouteAllowed = useMemo(() => {
    const slug = location.pathname.replace(`${PREFIX}/`, '').split('/')[0] || 'dashboard';
    if (ALWAYS_ALLOWED.includes(slug)) return true;
    return isProviderModuleAllowed(currentStaff.role, slug);
  }, [location.pathname, currentStaff.role]);

  return (
    <div className="provider-shell">
      {/* Skip link */}
      <a href="#provider-main-content" className="provider-skip-link">
        Skip to main content
      </a>

      {/* Sidebar */}
      <aside
        className={clsx(
          'provider-sidebar',
          mobileSidebarOpen && 'mobile-open'
        )}
        aria-label="Provider navigation"
      >
        <div className="provider-sidebar-inner">
          {/* Logo / Brand */}
          <div className="provider-sidebar-brand">
            <img
              src={tenant.logoUrl}
              alt={tenant.name}
              className="provider-sidebar-logo"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="provider-sidebar-title">Provider Portal</span>
          </div>

          {/* Branch indicator */}
          <div className="provider-branch-indicator">
            <MapPin size={14} className="provider-branch-icon" />
            {isSuperAdmin ? (
              <div className="provider-branch-switcher">
                <button
                  className="provider-branch-btn"
                  onClick={() => setBranchDropdownOpen(o => !o)}
                >
                  <span className="provider-branch-name">{currentBranch.name}</span>
                  <ChevronDown size={14} />
                </button>
                {branchDropdownOpen && (
                  <>
                    <div className="provider-branch-overlay" onClick={() => setBranchDropdownOpen(false)} />
                    <div className="provider-branch-dropdown">
                      {availableBranches.map(b => (
                        <button
                          key={b.id}
                          className={clsx('provider-branch-option', b.id === currentBranchId && 'active')}
                          onClick={() => { switchBranch(b.id); setBranchDropdownOpen(false); }}
                        >
                          <span>{b.name}</span>
                          {b.id === currentBranchId && <span className="provider-branch-check">✓</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <span className="provider-branch-name">{currentBranch.name}</span>
            )}
          </div>

          {/* Nav sections - filtered by tenant feature flags AND staff role */}
          <nav className="provider-sidebar-nav">
            {SIDEBAR_SECTIONS.map((section) => {
              const visibleItems = section.items.filter(
                (item) => {
                  // Check tenant feature flag
                  if (item.visible && !item.visible(tenant.features)) return false;
                  // Check role access
                  const slug = item.to.replace(`${PREFIX}/`, '');
                  return isProviderModuleAllowed(currentStaff.role, slug);
                }
              );
              if (visibleItems.length === 0) return null;
              return (
                <div key={section.label} className="provider-nav-section">
                  <span className="provider-nav-section-label">{section.label}</span>
                  {visibleItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                      key={to}
                      to={to}
                      title={label}
                      className={({ isActive }) =>
                        clsx('provider-nav-item', isActive && 'active')
                      }
                      end={to === `${PREFIX}/dashboard`}
                    >
                      <Icon size={20} className="provider-nav-icon" />
                      <span className="provider-nav-text">{label}</span>
                    </NavLink>
                  ))}
                </div>
              );
            })}
          </nav>

          {/* Footer links */}
          <div className="provider-sidebar-footer">
            <button
              type="button"
              className="provider-sidebar-switch"
              onClick={() => {
                switchApp('doctor');
                navigate('/doctor');
              }}
            >
              <Stethoscope size={16} />
              <span>Switch to Doctor App</span>
            </button>
            <Link to="/dashboard" className="provider-sidebar-switch provider-sidebar-back">
              Back to Patient Portal
            </Link>
            <Link to="/apps" className="provider-sidebar-switch provider-sidebar-signout">
              <LogOut size={16} />
              <span>Sign Out</span>
            </Link>
          </div>
        </div>

        {/* Mobile overlay */}
        <div
          className="provider-sidebar-overlay"
          aria-hidden="true"
          onClick={() => setMobileSidebarOpen(false)}
        />
      </aside>

      {/* Main content area */}
      <div className="provider-content-wrapper">
        {/* Header */}
        <header className="provider-header">
          <div className="provider-header-left">
            <button
              type="button"
              className="provider-hamburger"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>

            {/* Breadcrumb */}
            <ol className="provider-breadcrumb">
              {breadcrumbs.map((b, i) => {
                const isLast = i === breadcrumbs.length - 1;
                return (
                  <li key={i}>
                    {i > 0 && <span className="provider-breadcrumb-sep">/</span>}
                    {b.path && !isLast ? (
                      <Link to={b.path} className="provider-breadcrumb-link">
                        {b.label}
                      </Link>
                    ) : (
                      <span className={clsx('provider-breadcrumb-link', isLast && 'provider-breadcrumb-current')}>
                        {b.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="provider-header-right">
            {/* Search */}
            <div className="provider-search-wrap">
              <Search size={18} className="provider-search-icon" />
              <input
                type="search"
                placeholder="Search patients, orders..."
                className="provider-search-input"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                aria-label="Search"
              />
            </div>

            {/* Notifications */}
            <Link to={`${PREFIX}/notifications`} className="provider-header-btn provider-notif-btn">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="provider-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </Link>

            {/* User dropdown */}
            <div className="provider-user-wrap">
              <button
                type="button"
                className="provider-user-trigger"
                onClick={() => setUserDropdownOpen((o) => !o)}
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
              >
                <span className="provider-role-badge">{formatRole(currentStaff.role)}</span>
                <img
                  src={currentStaff.photoUrl}
                  alt={currentStaff.name}
                  className="provider-avatar"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentStaff.name);
                  }}
                />
                <span className="provider-user-name">{currentStaff.name}</span>
                <ChevronDown size={18} className="provider-user-chevron" />
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="provider-dropdown-backdrop"
                    aria-hidden="true"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="provider-user-dropdown" role="menu">
                    <div className="provider-dropdown-header">
                      <img
                        src={currentStaff.photoUrl}
                        alt=""
                        className="provider-dropdown-avatar"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://ui-avatars.com/api/?name=' +
                            encodeURIComponent(currentStaff.name);
                        }}
                      />
                      <div>
                        <span className="provider-dropdown-name">{currentStaff.name}</span>
                        <span className="provider-dropdown-role">{formatRole(currentStaff.role)}</span>
                      </div>
                    </div>
                    <Link to={`${PREFIX}/profile`} className="provider-dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                      Profile
                    </Link>
                    <Link to={`${PREFIX}/settings`} className="provider-dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                      Settings
                    </Link>
                    <Link to="/apps" className="provider-dropdown-item provider-dropdown-logout" onClick={() => setUserDropdownOpen(false)}>
                      Sign Out
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="provider-main" id="provider-main-content">
          {currentRouteAllowed ? (
            <Outlet />
          ) : (
            <Navigate to="/provider/dashboard" replace />
          )}
        </main>

        {/* Mobile bottom bar */}
        <nav className="provider-bottom-bar" aria-label="Quick navigation">
          <NavLink to={`${PREFIX}/dashboard`} end className={({ isActive }) => clsx('provider-bottom-item', isActive && 'active')}>
            <LayoutDashboard size={22} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to={`${PREFIX}/queue`} className={({ isActive }) => clsx('provider-bottom-item', isActive && 'active')}>
            <Users size={22} />
            <span>Queue</span>
          </NavLink>
          <NavLink to={`${PREFIX}/scheduling`} className={({ isActive }) => clsx('provider-bottom-item', isActive && 'active')}>
            <CalendarDays size={22} />
            <span>Schedule</span>
          </NavLink>
          <Link to={`${PREFIX}/notifications`} className="provider-bottom-item">
            <Bell size={22} />
            <span>Alerts</span>
            {unreadCount > 0 && <span className="provider-bottom-badge">{unreadCount}</span>}
          </Link>
        </nav>
      </div>
    </div>
  );
};
