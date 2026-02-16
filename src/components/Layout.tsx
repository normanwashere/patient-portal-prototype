import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, User, Bell, WifiOff, Heart, X, TestTube, Pill, Syringe, Receipt, CalendarDays, LogOut, Video, ClipboardList, CreditCard, Stethoscope, Clock, Users, FlaskConical, HeartHandshake, ListOrdered, Shield, FileEdit, MapPin, UserPlus, Building2 } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { useData } from '../context/DataContext';
import { Sidebar } from './Sidebar';
import { useBadges } from '../hooks/useBadges';
import clsx from 'clsx';
import './Layout.css';

export const Layout: React.FC = () => {
    const { tenant } = useTheme();
    const { isQueueActive, unreadNotificationsCount, markReadByRoute } = useData();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const { visits } = tenant.features;
    const { careBadge, financeBadge, communityBadge, recordsBadge, newMedsCount, newLabsCount, newImmunizationsCount } = useBadges();

    // Check if any visit type is available
    const hasVisits = visits.teleconsultEnabled || visits.clinicVisitEnabled || visits.homeCareEnabled;

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Close menu on route change + auto-clear related notification badges
    useEffect(() => {
        setIsMenuOpen(false);
        markReadByRoute(location.pathname);
    }, [location.pathname, markReadByRoute]);

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

    const handleLogout = () => {
        setIsMenuOpen(false);
        navigate('/apps');
    };

    return (
        <div className="app-shell">
            {/* Sidebar (Desktop) */}
            <Sidebar />

            {/* Main Content Wrapper */}
            <div className="main-content-wrapper">
                {/* Offline Banner */}
                {isOffline && (
                    <div className="offline-banner">
                        <WifiOff size={14} />
                        <span>You are currently offline. Read-only mode active.</span>
                    </div>
                )}

                {/* Mobile Header (Hidden on Desktop) */}
                <header className="app-header mobile-only">
                    <div className="header-content container">
                        <div className="logo-section">
                            <img src={tenant.logoUrl} alt={tenant.name} className="tenant-logo" />
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
                            <Link to="/notifications" className="icon-btn" style={{ position: 'relative' }}>
                                <Bell size={20} color="var(--color-text-muted)" />
                                {unreadNotificationsCount > 0 && (
                                    <span className="nav-badge-overlay">{unreadNotificationsCount}</span>
                                )}
                            </Link>
                            <Link to="/profile" className="icon-btn">
                                <User size={20} color="var(--color-text-muted)" />
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="app-main">
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
            <div className={clsx('mobile-menu-drawer', isMenuOpen && 'open')}>
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
                                <Building2 size={20} />
                                <span>Book In-Person</span>
                            </Link>
                        )}

                        {visits.teleconsultEnabled && (
                            <Link to="/appointments/book" state={{ type: 'teleconsult' }} className={clsx('drawer-item', isActive('/appointments/book') && location.state?.type === 'teleconsult' && 'active')}>
                                <Video size={20} />
                                <span>Book Teleconsult</span>
                            </Link>
                        )}

                        {visits.teleconsultNowEnabled && (
                            <Link to="/visits/teleconsult-intake" className={clsx('drawer-item', isActive('/visits/teleconsult-intake') && 'active')}>
                                <Video size={20} />
                                <span>Teleconsult Now</span>
                            </Link>
                        )}

                        <Link to="/visits/book-procedure" className={clsx('drawer-item', isActive('/visits/book-procedure') && 'active')}>
                            <FlaskConical size={20} />
                            <span>Book Procedure</span>
                        </Link>

                        {visits.homeCareEnabled && (
                            <Link to="/visits/homecare" className={clsx('drawer-item', isActive('/visits/homecare') && 'active')}>
                                <HeartHandshake size={20} />
                                <span>HomeCare</span>
                            </Link>
                        )}

                        {tenant.features.queue && (
                            <Link to="/queue" className={clsx('drawer-item', isActive('/queue') && 'active')}>
                                <ListOrdered size={20} />
                                <span>Queue Tracker</span>
                            </Link>
                        )}
                    </div>

                    <div className="drawer-section">
                        <span className="drawer-section-title">Community</span>
                        <Link to="/community" className={clsx('drawer-item', isActive('/community') && 'active')}>
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
                        {tenant.features.carePlans && (
                            <Link to="/health/care-plans" className={clsx('drawer-item', isActive('/health/care-plans') && 'active')}>
                                <ClipboardList size={20} />
                                <span>Care Plans</span>
                            </Link>
                        )}
                        <Link to="/forms" className={clsx('drawer-item', isActive('/forms') && 'active')}>
                            <FileEdit size={20} />
                            <span>Forms</span>
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
                            {tenant.features.philHealth && (
                                <Link to="/coverage/philhealth" className={clsx('drawer-item', isActive('/coverage/philhealth') && 'active')}>
                                    <Shield size={20} />
                                    <span>PhilHealth</span>
                                </Link>
                            )}
                            <Link to="/billing" className={clsx('drawer-item', isActive('/billing') && 'active')}>
                                <Receipt size={20} />
                                <span>Billing</span>
                                {financeBadge > 0 && <span className="drawer-badge">{financeBadge}</span>}
                            </Link>
                        </div>
                    )}

                    {tenant.features.multiLocation && (
                        <div className="drawer-section">
                            <Link to="/branches" className={clsx('drawer-item', isActive('/branches') && 'active')}>
                                <MapPin size={20} />
                                <span>Find Clinics</span>
                            </Link>
                        </div>
                    )}

                    <div className="drawer-section">
                        <span className="drawer-section-title">Account</span>
                        <Link to="/profile" className={clsx('drawer-item', isActive('/profile') && !isActive('/profile/dependents') && 'active')}>
                            <User size={20} />
                            <span>Profile</span>
                        </Link>
                        <Link to="/profile/dependents" className={clsx('drawer-item', isActive('/profile/dependents') && 'active')}>
                            <UserPlus size={20} />
                            <span>Dependents</span>
                        </Link>
                    </div>
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
                    <Link to="/visits" className={clsx('nav-item', (isActive('/visits') || isActive('/appointments') || isActive('/queue')) && 'active')}>
                        <div style={{ position: 'relative' }}>
                            <Stethoscope size={22} />
                            {careBadge > 0 && <span className="nav-badge-dot" />}
                        </div>
                        <span>Care</span>
                    </Link>
                )}

                {/* Pillar 3: Community */}
                <Link to="/community" className={clsx('nav-item', isActive('/community') && 'active')}>
                    <div style={{ position: 'relative' }}>
                        <Users size={22} />
                        {communityBadge > 0 && <span className="nav-badge-dot" />}
                    </div>
                    <span>Community</span>
                </Link>

                {/* Pillar 4: Records */}
                <Link to="/health" className={clsx('nav-item', (isActive('/health') || isActive('/results') || isActive('/medications') || isActive('/immunization') || isActive('/medical-history') || isActive('/forms')) && 'active')}>
                    <div style={{ position: 'relative' }}>
                        <ClipboardList size={22} />
                        {(recordsBadge > 0) && <span className="nav-badge-dot" />}
                    </div>
                    <span>Records</span>
                </Link>

                {/* Pillar 5: Coverage - only if HMO or PhilHealth */}
                {(tenant.features.hmo || tenant.features.philHealth) && (
                    <Link to="/coverage" className={clsx('nav-item', (isActive('/coverage') || isActive('/benefits') || isActive('/billing')) && 'active')}>
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
