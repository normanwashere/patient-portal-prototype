import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home, FileText, CreditCard, Stethoscope, Users,
    Clock, Activity, TestTube, Pill, Syringe,
    Heart, Receipt, Video, Star, Calendar, ClipboardList,
    ChevronDown, ChevronRight, LogOut, Bell, User, Building2, FlaskConical
} from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import clsx from 'clsx';
import { useData } from '../context/DataContext';
import './Sidebar.css';
import { useBadges } from '../hooks/useBadges';

export const Sidebar: React.FC = () => {
    const { tenant } = useTheme();
    const { unreadNotificationsCount } = useData();
    const location = useLocation();
    const navigate = useNavigate();

    // Use centralized badge hook
    const { careBadge, financeBadge, communityBadge, recordsBadge, newMedsCount, newLabsCount, newImmunizationsCount } = useBadges();

    // State for expanded sections
    const [expanded, setExpanded] = useState<Record<string, boolean>>({
        records: true,
        finance: true,
        care: true,
        community: true,
        users: true
    });

    const toggleSection = (section: string) => {
        setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

    const NavItem = ({ to, icon: Icon, label, badge }: { to: string, icon: any, label: string, badge?: number }) => (
        <Link to={to} className={clsx('sidebar-item sub-item', isActive(to) && 'active')}>
            <div style={{ position: 'relative', display: 'flex' }}>
                <Icon size={18} />
                {badge !== undefined && badge > 0 && (
                    <span className="nav-badge-overlay sidebar-badge">{badge}</span>
                )}
            </div>
            <span style={{ flex: 1 }}>{label}</span>
        </Link>
    );

    const NavGroup = ({ id, label, icon: Icon, to, children, badge }: { id: string, label: string, icon: any, to: string, children: React.ReactNode, badge?: number }) => {
        const isGroupActive = location.pathname.startsWith(to);
        const showHeaderBadge = !expanded[id] && badge !== undefined && badge > 0;

        return (
            <div className="nav-group">
                <div className={clsx('sidebar-item group-header-row', (expanded[id] || isGroupActive) && 'open')}>
                    <Link to={to} className="group-link-area">
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Icon size={20} />
                            {showHeaderBadge && (
                                <span className="nav-badge-overlay sidebar-badge" style={{ top: '-6px', right: '-6px' }}>{badge}</span>
                            )}
                        </div>
                        <span>{label}</span>
                    </Link>
                    <button
                        className="group-toggle-btn"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleSection(id);
                        }}
                    >
                        {expanded[id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                </div>
                {expanded[id] && (
                    <div className="group-content">
                        {children}
                    </div>
                )}
            </div>
        );
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <img src={tenant.logoUrl} alt={tenant.name} className="sidebar-logo" />
                <h2 className="sidebar-title">{tenant.name}</h2>
            </div>

            <nav className="sidebar-nav">
                {/* 1. Home Pillar */}
                <Link to="/dashboard" className={clsx('sidebar-item', location.pathname === '/dashboard' && 'active')}>
                    <Home size={20} />
                    <span>Home</span>
                </Link>

                {/* 4. Care Pillar -> /visits */}
                <NavGroup id="care" label="Care" icon={Stethoscope} to="/visits" badge={careBadge}>
                    <NavItem to="/appointments?view=upcoming" icon={Calendar} label="Upcoming Appointments" badge={careBadge} />

                    {tenant.features.visits.clinicVisitEnabled && (
                        <Link to="/appointments/book?type=in-person" className={clsx('sidebar-item sub-item', isActive('/appointments/book') && location.search.includes('type=in-person') && 'active')}>
                            <Building2 size={18} />
                            <span>Book In-Person Consult</span>
                        </Link>
                    )}

                    {tenant.features.visits.teleconsultEnabled && (
                        <Link to="/appointments/book?type=teleconsult" className={clsx('sidebar-item sub-item', isActive('/appointments/book') && location.search.includes('type=teleconsult') && 'active')}>
                            <Video size={18} />
                            <span>Book Teleconsult</span>
                        </Link>
                    )}

                    {tenant.features.visits.teleconsultEnabled && (
                        <Link to="/visits/teleconsult-intake" className={clsx('sidebar-item sub-item', isActive('/visits/teleconsult-intake') && 'active')}>
                            <Video size={18} />
                            <span>Teleconsult Now</span>
                        </Link>
                    )}

                    <Link to="/visits/book-procedure" className={clsx('sidebar-item sub-item', isActive('/visits/book-procedure') && 'active')}>
                        <FlaskConical size={18} />
                        <span>Book Procedure</span>
                    </Link>
                </NavGroup>

                {/* 5. Community Pillar -> /community */}
                <NavGroup id="community" label="Community" icon={Users} to="/community" badge={communityBadge}>
                    <NavItem to="/community" icon={Star} label="Featured" badge={communityBadge} />
                    <NavItem to="/events" icon={Calendar} label="All Events" />
                </NavGroup>

                {/* 2. Records Pillar (Moved logic) */}
                <NavGroup id="records" label="Records" icon={FileText} to="/health" badge={recordsBadge}>
                    <NavItem to="/appointments?view=past" icon={Clock} label="Past Appts" />
                    <NavItem to="/medical-history" icon={Activity} label="Medical History" />
                    <NavItem to="/results" icon={TestTube} label="Lab Results" badge={newLabsCount} />
                    <NavItem to="/medications" icon={Pill} label="Medications" badge={newMedsCount} />
                    <NavItem to="/immunization" icon={Syringe} label="Immunizations" badge={newImmunizationsCount} />
                    {tenant.features.carePlans && (
                        <NavItem to="/health/care-plans" icon={ClipboardList} label="Care Plans" badge={2} />
                    )}
                </NavGroup>

                {/* 3. Coverage Pillar - visible if HMO or PhilHealth enabled */}
                {(tenant.features.hmo || tenant.features.philHealth) && (
                    <NavGroup id="coverage" label="Coverage & Claims" icon={CreditCard} to="/coverage" badge={financeBadge}>
                        {tenant.features.hmo && <NavItem to="/benefits" icon={Heart} label="LOA & Benefits" />}
                        <NavItem to="/billing" icon={Receipt} label="Billing History" badge={financeBadge} />
                    </NavGroup>
                )}

                {/* 6. Users Pillar -> /profile */}
                <NavGroup id="users" label="Users" icon={User} to="/profile" badge={unreadNotificationsCount}>
                    <NavItem to="/profile" icon={User} label="Profile" />
                    <NavItem to="/notifications" icon={Bell} label="Notifications" badge={unreadNotificationsCount} />
                </NavGroup>
            </nav>

            <div className="sidebar-footer">
                <button className="sidebar-item logout-btn" onClick={() => navigate('/apps')}>
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
                <div className="version-info">
                    v0.5.0 (PWA)
                </div>
            </div>
        </aside >
    );
};
