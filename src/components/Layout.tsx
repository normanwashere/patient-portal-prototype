import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Bell, Heart, X, TestTube, Pill, Syringe, Receipt, CalendarDays, LogOut, Video, ClipboardList, CreditCard, Stethoscope, Clock, Users, FlaskConical, ChevronRight } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { useData } from '../context/DataContext';
import { useBadges } from '../hooks/useBadges';
import { Sidebar } from './Sidebar';
import { OfflineBanner } from './Common/OfflineBanner';
// Breadcrumbs removed per user feedback
import { useHeader } from '../context/HeaderContext';
import clsx from 'clsx';
import './Layout.css';

export const Layout: React.FC = () => {
    const { customBack } = useHeader();
    const { tenant } = useTheme();
    const { isQueueActive, unreadNotificationsCount } = useData();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { visits } = tenant.features;
    const { careBadge, financeBadge, communityBadge, recordsBadge, newMedsCount, newLabsCount, newImmunizationsCount } = useBadges();

    // Check if any visit type is available
    const hasVisits = visits.teleconsultEnabled || visits.clinicVisitEnabled;

    // Close menu on route change

    // Close menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

    const handleLogout = () => {
        setIsMenuOpen(false);
        navigate('/apps');
    };

    // List of "Pillar" (Root) paths where Back button should be HIDDEN
    const pillarPaths = ['/dashboard', '/visits', '/news', '/health', '/coverage', '/profile', '/apps', '/', '/appointments', '/visits/consult-now'];

    // Deterministic parent route map — every sub-page maps to its known parent
    const parentRouteMap: Record<string, string> = {
        '/appointments/book': '/visits',
        '/visits/book-clinic': '/visits',
        '/visits/book-teleconsult': '/visits',
        '/visits/teleconsult': '/visits', // Landing page -> Visits Pillar
        '/visits/consult-now': '/visits/teleconsult', // Waiting Room -> Landing Page (or could be Visits)

        '/visits/teleconsult-intake': '/visits', // Per user request
        '/visits/book-procedure': '/visits',
        '/visits/consult-later': '/visits',
        '/medical-history': '/health',
        '/results': '/health',
        '/medications': '/health',
        '/immunization': '/health',
        '/health/care-plans': '/health',
        '/health/past-appointments': '/health',
        '/billing': '/coverage',
        '/benefits': '/coverage',
        '/coverage/philhealth': '/coverage',
        '/checkout': '/billing',
        '/payment-success': '/billing',
        '/events': '/news',
        '/profile/dependents': '/profile',
        '/branches': '/visits',
        '/forms': '/dashboard',
        '/notifications': '/dashboard',
        '/queue': '/visits', // Queue -> Visits
    };

    // Get the deterministic parent for the current route
    const getParentRoute = (pathname: string): string => {
        // Special mapping for Content Detail pages
        if (pathname.startsWith('/content/')) {
            return '/news';
        }

        // 1. Exact match in parentRouteMap
        if (parentRouteMap[pathname]) return parentRouteMap[pathname];

        // 2. Try matching dynamic segments (e.g., /results/123 → check /results/:id)
        const segments = pathname.split('/').filter(Boolean);
        if (segments.length >= 2) {
            const parentPath = '/' + segments.slice(0, -1).join('/');
            // If the parent path itself is a valid route, go there
            if (parentRouteMap[parentPath] || pillarPaths.includes(parentPath)) {
                return parentPath;
            }
        }

        // 3. Fallback: go to dashboard
        return '/dashboard';
    };

    // Normalize path to handle trailing slashes
    const normalizedPath = location.pathname.endsWith('/') && location.pathname.length > 1
        ? location.pathname.slice(0, -1)
        : location.pathname;

    // Immersive pages: Only hide header for specific full-screen flows if needed (none for now for content)
    const isImmersivePage = false;
    const showBackButton = ((!pillarPaths.includes(normalizedPath)) || !!customBack) && !isImmersivePage;

    return (
        <div className="app-shell">
            {/* Sidebar (Desktop) */}
            <Sidebar />

            {/* Main Content Wrapper */}
            <div className="main-content-wrapper">
                {/* Offline Banner */}
                <OfflineBanner />

                {/* Mobile Header (Hidden on Desktop) - Hide on immersive pages */}
                {!isImmersivePage && (
                    <header className="app-header mobile-only">
                        <div className="header-content container">
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {/* Always show Logo */}
                                <div className="logo-section">
                                    <img
                                        src={tenant.logoUrl}
                                        alt={tenant.name}
                                        className="tenant-logo"
                                        style={{ maxHeight: '32px', objectFit: 'contain' }}
                                    />
                                </div>
                            </div>

                            <div className="header-actions">
                                {/* Queue Indicator */}
                                {isQueueActive && (
                                    <button
                                        className="icon-btn queue-indicator"
                                        onClick={() => navigate('/queue')}
                                        aria-label="View Queue Status"
                                        style={{ marginRight: '0.5rem' }}
                                    >
                                        <Clock size={20} className="queue-icon-anim" />
                                        <span className="queue-dot"></span>
                                    </button>
                                )}
                                <button
                                    className="icon-btn"
                                    style={{ position: 'relative' }}
                                    onClick={() => {
                                        if (location.pathname === '/notifications') {
                                            navigate(-1);
                                        } else {
                                            navigate('/notifications');
                                        }
                                    }}
                                    aria-label="Notifications"
                                >
                                    <Bell size={20} color="var(--color-text-muted)" />
                                    {unreadNotificationsCount > 0 && (
                                        <span className="nav-badge-overlay">{unreadNotificationsCount}</span>
                                    )}
                                </button>
                                <Link to="/profile" className="icon-btn" aria-label="Profile">
                                    <Users size={20} color="var(--color-text-muted)" />
                                </Link>

                            </div>
                        </div>
                    </header>
                )}

                {/* Main Content Area */}
                <main className={clsx('app-main', showBackButton && 'with-back-btn')}>
                    {/* Desktop Back Button */}
                    {showBackButton && (
                        <div className="desktop-back-wrapper desktop-only">
                            <button
                                onClick={() => {
                                    if (customBack) {
                                        customBack();
                                    } else if (location.state?.from) {
                                        navigate(location.state.from);
                                    } else {
                                        navigate(getParentRoute(normalizedPath));
                                    }
                                }}
                                className="back-btn-circle"
                                aria-label="Go Back"
                            >
                                <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                        </div>
                    )}

                    {/* Mobile Back Button (in-page, above content) */}
                    {showBackButton && (
                        <div className="mobile-back-strip mobile-only">
                            <button
                                onClick={() => {
                                    if (customBack) {
                                        customBack();
                                    } else if (location.state?.from) {
                                        navigate(location.state.from);
                                    } else {
                                        navigate(getParentRoute(normalizedPath));
                                    }
                                }}
                                className="back-btn-circle"
                                aria-label="Go Back"
                            >
                                <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                        </div>
                    )}

                    <Outlet />
                </main>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="menu-overlay" onClick={() => setIsMenuOpen(false)} />
            )}

            <style>{`
.pulse-icon {
    animation: pulse-ring 2s infinite;
}
@keyframes pulse-ring {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
}
`}</style>

            {/* Mobile Menu Drawer */}
            <div className={clsx('mobile-menu-drawer mobile-only', isMenuOpen && 'open')}>
                <div className="drawer-header">

                    <style>{`
/* Header Queue Indicator */
.queue-indicator {
    color: var(--color-primary) !important;
    position: relative;
    background: rgba(8, 145, 178, 0.1) !important;
}

.queue-icon-anim {
    animation: queue-pulse 2s infinite ease-in-out;
}

.queue-dot {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 8px;
    height: 8px;
    background: #ef4444;
    border-radius: 50%;
    border: 2px solid white;
}

@keyframes queue-pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
}
`}</style>
                    <h3>Menu</h3>
                    <button className="close-btn" onClick={() => setIsMenuOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                <nav className="drawer-nav">
                    <div className="drawer-section">
                        <span className="drawer-section-title">Main</span>
                        <Link to="/dashboard" className={clsx('drawer-item', isActive('/dashboard') && 'active')}>
                            <Home size={20} />
                            <span>Home</span>
                        </Link>
                        <Link to="/notifications" className={clsx('drawer-item', isActive('/notifications') && 'active')}>
                            <Bell size={20} />
                            <span>Notifications</span>
                            {unreadNotificationsCount > 0 && (
                                <span className="drawer-badge">{unreadNotificationsCount}</span>
                            )}
                        </Link>
                    </div>

                    {/* Care Services Section */}
                    <div className="drawer-section">
                        <span className="drawer-section-title">Care Services</span>
                        <Link to="/appointments?view=upcoming" className={clsx('drawer-item', isActive('/appointments') && location.search.includes('upcoming') && 'active')}>
                            <CalendarDays size={20} />
                            <span>Upcoming Appts</span>
                            {careBadge > 0 && <span className="drawer-badge">{careBadge}</span>}
                        </Link>

                        {visits.clinicVisitEnabled && (
                            <Link to="/appointments/book" state={{ type: 'in-person' }} className={clsx('drawer-item', isActive('/appointments/book') && location.state?.type === 'in-person' && 'active')}>
                                <Home size={20} />
                                <span>Book In-Person</span>
                            </Link>
                        )}

                        {visits.teleconsultEnabled && (
                            <>
                                <Link to="/appointments/book" state={{ type: 'teleconsult' }} className={clsx('drawer-item', isActive('/appointments/book') && location.state?.type === 'teleconsult' && 'active')}>
                                    <Video size={20} />
                                    <span>Book Teleconsult</span>
                                </Link>
                                <Link to="/visits/consult-now" className={clsx('drawer-item', isActive('/visits/consult-now') && 'active')}>
                                    <Video size={20} />
                                    <span>Teleconsult Now</span>
                                </Link>
                            </>
                        )}

                        <Link to="/visits/book-procedure" className={clsx('drawer-item', isActive('/visits/book-procedure') && 'active')}>
                            <FlaskConical size={20} />
                            <span>Book Procedure</span>
                        </Link>
                    </div>

                    <div className="drawer-section">
                        <span className="drawer-section-title">News & Community</span>
                        <Link to="/news" className={clsx('drawer-item', isActive('/news') && 'active')}>
                            <Users size={20} />
                            <span>Featured</span>
                            {communityBadge > 0 && <span className="drawer-badge">{communityBadge}</span>}
                        </Link>
                        <Link to="/events" className={clsx('drawer-item', isActive('/events') && 'active')}>
                            <CalendarDays size={20} />
                            <span>All Events</span>
                        </Link>
                    </div>

                    <div className="drawer-section">
                        <span className="drawer-section-title">Health Records</span>
                        <Link to="/appointments?view=past" className={clsx('drawer-item', isActive('/appointments') && location.search.includes('past') && 'active')}>
                            <Clock size={20} />
                            <span>Past Appts</span>
                        </Link>
                        <Link to="/medical-history" className={clsx('drawer-item', isActive('/medical-history') && 'active')}>
                            <ClipboardList size={20} />
                            <span>Medical History</span>
                        </Link>
                        <Link to="/results" className={clsx('drawer-item', isActive('/results') && 'active')}>
                            <TestTube size={20} />
                            <span>Results</span>
                            {newLabsCount > 0 && <span className="drawer-badge">{newLabsCount}</span>}
                        </Link>
                        <Link to="/medications" className={clsx('drawer-item', isActive('/medications') && 'active')}>
                            <Pill size={20} />
                            <span>Medications</span>
                            {newMedsCount > 0 && <span className="drawer-badge">{newMedsCount}</span>}
                        </Link>
                        <Link to="/immunization" className={clsx('drawer-item', isActive('/immunization') && 'active')}>
                            <Syringe size={20} />
                            <span>Immunization</span>
                            {newImmunizationsCount > 0 && <span className="drawer-badge">{newImmunizationsCount}</span>}
                        </Link>
                    </div>

                    {(tenant.features.hmo || tenant.features.philHealth) && (
                        <div className="drawer-section">
                            <span className="drawer-section-title">Coverage & Claims</span>
                            {tenant.features.hmo && (
                                <Link to="/benefits" className={clsx('drawer-item', isActive('/benefits') && 'active')}>
                                    <Heart size={20} />
                                    <span>LOA / Benefits</span>
                                </Link>
                            )}
                            <Link to="/billing" className={clsx('drawer-item', isActive('/billing') && 'active')}>
                                <Receipt size={20} />
                                <span>Billing</span>
                                {financeBadge > 0 && <span className="drawer-badge">{financeBadge}</span>}
                            </Link>
                        </div>
                    )}
                </nav>

                <div className="drawer-footer">
                    <button className="drawer-item logout" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Bottom Navigation (Mobile Only) - 5 Pillars */}
            <nav className="bottom-nav mobile-only">
                {/* Pillar 1: Home */}
                <Link to="/dashboard" className={clsx('nav-item', location.pathname === '/dashboard' && 'active')}>
                    <Home size={22} />
                    <span>Home</span>
                </Link>

                {/* Pillar 2: Care */}
                {hasVisits && (
                    <Link to="/visits" className={clsx('nav-item', isActive('/visits') || isActive('/appointments') && 'active')}>
                        <div style={{ position: 'relative' }}>
                            <Stethoscope size={22} />
                            {careBadge > 0 && <span className="nav-badge-dot" />}
                        </div>
                        <span>Care</span>
                    </Link>
                )}

                {/* Pillar 3: News */}
                <Link to="/news" className={clsx('nav-item', isActive('/news') && 'active')}>
                    <div style={{ position: 'relative' }}>
                        <Users size={22} />
                        {communityBadge > 0 && <span className="nav-badge-dot" />}
                    </div>
                    <span>News</span>
                </Link>

                {/* Pillar 4: Records */}
                <Link to="/health" className={clsx('nav-item', isActive('/health') && 'active')}>
                    <div style={{ position: 'relative' }}>
                        <ClipboardList size={22} />
                        {(recordsBadge > 0) && <span className="nav-badge-dot" />}
                    </div>
                    <span>Records</span>
                </Link>

                {/* Pillar 5: Coverage - only if HMO or PhilHealth */}
                {(tenant.features.hmo || tenant.features.philHealth) && (
                    <Link to="/coverage" className={clsx('nav-item', isActive('/coverage') && 'active')}>
                        <div style={{ position: 'relative' }}>
                            <CreditCard size={22} />
                            {financeBadge > 0 && <span className="nav-badge-dot" />}
                        </div>
                        <span>Coverage</span>
                    </Link>
                )}
            </nav>
        </div>
    );
};
