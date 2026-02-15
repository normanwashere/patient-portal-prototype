import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Video, CalendarDays, Building2, Home } from 'lucide-react';
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
    const teleconsultNowRef = useRef<HTMLDivElement>(null);
    const [highlightTeleconsult, setHighlightTeleconsult] = useState(false);

    // If navigated here with highlight state, scroll to and pulse the teleconsult now card
    useEffect(() => {
        const state = location.state as { highlight?: string } | null;
        if (state?.highlight === 'teleconsult-now') {
            setHighlightTeleconsult(true);
            // Scroll to the card after a brief delay for render
            setTimeout(() => {
                teleconsultNowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
            // Clear highlight after animation
            const timer = setTimeout(() => setHighlightTeleconsult(false), 3000);
            // Clear the state so refresh doesn't re-trigger
            window.history.replaceState({}, '');
            return () => clearTimeout(timer);
        }
    }, [location.state]);

    // Check if any visit type is available
    const hasAnyVisit = visits.teleconsultEnabled || visits.clinicVisitEnabled;

    return (
        <div className="visits-container">
            <header className="page-header pillar-header">
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

                {/* 2. Book Procedure — In-Facility */}
                <ServiceCard
                    title="Book Procedure"
                    description="Visit a facility for lab tests, imaging, or diagnostics."
                    icon={<Building2 size={24} />}
                    onClick={() => navigate('/visits/book-procedure')}
                    colorTheme="blue"
                    actionLabel="Schedule"
                    backgroundImage="https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?w=600"
                />

                {/* 2b. HomeCare — At-Home Collection */}
                {visits.homeCareEnabled && (
                    <ServiceCard
                        title="HomeCare"
                        description="We send a medical professional to your home or office for specimen collection."
                        icon={<Home size={24} />}
                        onClick={() => navigate('/visits/homecare')}
                        colorTheme="green"
                        actionLabel="Book HomeCare"
                        backgroundImage="https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=600"
                    />
                )}

                {/* 3. Book In-Person Consult */}
                {visits.clinicVisitEnabled && (
                    <ServiceCard
                        title="Book In-Person Consult"
                        description="Schedule a visit at our facility."
                        icon={<Building2 size={24} />}
                        onClick={() => navigate('/appointments/book', { state: { type: 'in-person', branch: 'consult' } })}
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
                        onClick={() => navigate('/appointments/book', { state: { type: 'teleconsult' } })}
                        colorTheme="blue"
                        actionLabel="Schedule"
                        backgroundImage="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600"
                    />
                )}

                {/* 5. Teleconsult Now */}
                {visits.teleconsultEnabled && (
                    <div ref={teleconsultNowRef} className={highlightTeleconsult ? 'teleconsult-highlight' : ''}>
                        <ServiceCard
                            title="Teleconsult Now"
                            description="Connect with a doctor immediately."
                            icon={<Video size={24} />}
                            onClick={() => navigate('/visits/teleconsult-intake')}
                            colorTheme="purple"
                            actionLabel="Start Now"
                            backgroundImage="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600"
                        />
                    </div>
                )}
            </div>

            {/* Can add "Upcoming Visits" list below the grid if needed, or keep it separate */}
        </div>
    );
};
