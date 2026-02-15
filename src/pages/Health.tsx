import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TestTube, Pill, Syringe, Clock, FileText, ClipboardList } from 'lucide-react';
import { ServiceCard } from '../components/ServiceCard/ServiceCard';
import { useBadges } from '../hooks/useBadges';
import { useTheme } from '../theme/ThemeContext';
import './HubPage.css';

export const Health: React.FC = () => {
    const navigate = useNavigate();
    const { newMedsCount, newLabsCount, newImmunizationsCount } = useBadges();

    return (
        <div className="hub-page">
            <header className="page-header">
                <div className="flex items-center justify-between mb-6">
                    <h2>Health Records</h2>
                    <p className="page-subtitle">Manage your medical history and results</p>
                </div>
            </header>

            <div className="hub-grid">
                <ServiceCard
                    title="Past Appointments"
                    description="View your previous teleconsult and clinic visits."
                    icon={<Clock size={24} />}
                    onClick={() => navigate('/health/past-appointments')}
                    colorTheme="primary"
                    actionLabel="View History"
                    backgroundImage="https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600"
                />

                <ServiceCard
                    title="Medical History"
                    description="Access your electronic medical records and past consultations."
                    icon={<FileText size={24} />}
                    onClick={() => navigate('/medical-history')}
                    colorTheme="purple"
                    actionLabel="View Records"
                    backgroundImage="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600"
                />

                <ServiceCard
                    title="Lab Results"
                    description="View your diagnostic and laboratory test results."
                    icon={<TestTube size={24} />}
                    onClick={() => navigate('/results')}
                    colorTheme="blue"
                    badge={newLabsCount}
                    actionLabel="View Results"
                    backgroundImage="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600"
                />

                <ServiceCard
                    title="Medications"
                    description="Track your active prescriptions and medication history."
                    icon={<Pill size={24} />}
                    onClick={() => navigate('/medications')}
                    colorTheme="green"
                    badge={newMedsCount}
                    actionLabel="Manage Meds"
                    backgroundImage="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600"
                />

                <ServiceCard
                    title="Immunizations"
                    description="View your vaccination records and history."
                    icon={<Syringe size={24} />}
                    onClick={() => navigate('/immunization')}
                    colorTheme="purple"
                    badge={newImmunizationsCount}
                    actionLabel="View Records"
                    backgroundImage="https://images.unsplash.com/photo-1615631648086-325025c9e51e?w=600"
                />

                {(useTheme().tenant.features.carePlans ?? true) && (
                    <ServiceCard
                        title="My Care Plans"
                        description="Track treatment goals, interventions, and progress across your care team."
                        icon={<ClipboardList size={24} />}
                        onClick={() => navigate('/health/care-plans')}
                        colorTheme="primary"
                        badge={2}
                        actionLabel="View Plans"
                        backgroundImage="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600"
                    />
                )}
            </div>
        </div>
    );
};
