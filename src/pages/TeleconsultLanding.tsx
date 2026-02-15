import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, CalendarDays, Clock } from 'lucide-react';
import { ServiceCard } from '../components/ServiceCard/ServiceCard';
import { useTheme } from '../theme/ThemeContext';
import './HubPage.css'; // Reusing hub styles

export const TeleconsultLanding: React.FC = () => {
    const navigate = useNavigate();
    const { tenant } = useTheme();
    const { visits } = tenant.features;

    return (
        <div className="hub-page">
            <header className="page-header">
                <div className="header-text">
                    <h2>Teleconsultation</h2>
                    <p className="page-subtitle">Choose how you want to connect with a doctor</p>
                </div>
            </header>

            <div className="hub-grid">
                {/* Consult Now - Only show if feature is enabled */}
                {visits.teleconsultNowEnabled && (
                    <ServiceCard
                        title="Consult Now"
                        description="Connect immediately with an available General Practitioner (GP). Best for quick consultations and general health concerns."
                        icon={<Video size={24} />}
                        onClick={() => navigate('/visits/consult-now')}
                        colorTheme="blue"
                        actionLabel="Connect Now"
                        backgroundImage="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600"
                    />
                )}

                {/* Consult Later - Only show if feature is enabled */}
                {visits.teleconsultLaterEnabled && (
                    <ServiceCard
                        title="Consult Later"
                        description="Schedule an appointment with a specific specialist for a future date and time."
                        icon={<CalendarDays size={24} />}
                        onClick={() => navigate('/visits/consult-later')}
                        colorTheme="purple"
                        actionLabel="Book Appointment"
                        backgroundImage="https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600"
                    />
                )}
            </div>

            <div className="info-section" style={{ marginTop: '2rem', padding: '1.5rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#334155' }}>
                    <Clock size={16} /> Operating Hours
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#64748B' }}>
                    {visits.teleconsultNowEnabled && (
                        <><strong>General Practitioners:</strong> Available 24/7<br /></>
                    )}
                    <strong>Specialists:</strong> Based on scheduled availability (Mon-Sat 8:00 AM - 5:00 PM)
                </p>
            </div>
        </div>
    );
};
