import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Video, CalendarDays, Building2 } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { ServiceCard } from '../components/ServiceCard/ServiceCard';
import { useBadges } from '../hooks/useBadges';

import './Visits.css';

export const Visits: React.FC = () => {
    const { tenant } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { visits } = tenant.features;
    const { careBadge } = useBadges();

    // Check if any visit type is available
    const hasAnyVisit = visits.teleconsultEnabled || visits.clinicVisitEnabled;

    const teleconsultRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const state = location.state as { focus?: string } | null;
        if (state?.focus === 'teleconsult' && teleconsultRef.current) {
            teleconsultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Optional: visual highlight
            teleconsultRef.current.style.transition = 'box-shadow 0.3s ease';
            teleconsultRef.current.style.boxShadow = '0 0 0 4px var(--color-primary-transparent)';
            setTimeout(() => {
                if (teleconsultRef.current) teleconsultRef.current.style.boxShadow = 'none';
            }, 2000);
        }
    }, [location.state]);

    return (
        <div className="visits-container">
            <header className="page-header">
                {/* BackButton removed - handled by Layout */}
                <div className="header-text">
                    <h2>Care Services</h2>
                    <p className="page-subtitle">Schedule and manage your healthcare needs</p>
                </div>
            </header>

            {!hasAnyVisit && (
                <div className="empty-state-card">
                    <CalendarDays size={48} />
                    <h3>Visits Coming Soon</h3>
                    <p>Visit booking is not yet available for {tenant.name}. Please check back later.</p>
                </div>
            )}

            {/* 4 Cards Layout for Mobile/Desktop requests */}
            <div className="hub-grid">
                {/* 1. Upcoming Appointments */}
                <ServiceCard
                    title="Upcoming Appointments"
                    description="View your scheduled visits."
                    icon={<CalendarDays size={24} />}
                    onClick={() => navigate('/appointments?view=upcoming')}
                    colorTheme="primary"
                    badge={careBadge}
                    actionLabel="View All"
                    backgroundImage="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600"
                />

                {/* 2. Book Procedure */}
                <ServiceCard
                    title="Book Procedure"
                    description="Schedule lab tests or diagnostics."
                    icon={<Building2 size={24} />}
                    onClick={() => navigate('/visits/book-procedure')}
                    colorTheme="blue"
                    actionLabel="Schedule"
                    backgroundImage="https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?w=600"
                />

                {/* 3. Book In-Person Consult */}
                {visits.clinicVisitEnabled && (
                    <ServiceCard
                        title="Book In-Person Consult"
                        description="Schedule a visit at our facility."
                        icon={<Building2 size={24} />}
                        onClick={() => navigate('/visits/book-clinic')}
                        colorTheme="green"
                        actionLabel="Book Now"
                        backgroundImage="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600"
                    />
                )}

                {/* 4. Book Teleconsult for Later */}
                {visits.teleconsultEnabled && (
                    <ServiceCard
                        title="Book Teleconsult for Later"
                        description="Schedule a video consultation."
                        icon={<Video size={24} />}
                        onClick={() => navigate('/visits/book-teleconsult')}
                        colorTheme="blue"
                        actionLabel="Schedule"
                        backgroundImage="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600"
                    />
                )}

                {/* 5. Teleconsult Now */}
                {visits.teleconsultEnabled && (
                    <ServiceCard
                        title="Teleconsult Now"
                        description="Connect with a doctor immediately."
                        icon={<Video size={24} />}
                        onClick={() => navigate('/visits/teleconsult-intake')}
                        colorTheme="purple"
                        actionLabel="Start Now"
                        backgroundImage="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600"
                    />
                )}
            </div>

            {/* Can add "Upcoming Visits" list below the grid if needed, or keep it separate */}
        </div>
    );
};
