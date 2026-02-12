import React from 'react';
import { useTheme } from '../theme/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Building2, Heart, Stethoscope, ChevronRight, CheckCircle } from 'lucide-react';
import './Login.css';

interface OrgOption {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    features: string[];
    color: string;
}

export const Login: React.FC = () => {
    const { setTenantId } = useTheme();
    const navigate = useNavigate();

    // Reset theme to default (Metro General) when visiting Login
    // This ensures "Theme Reset on Logout"
    React.useEffect(() => {
        setTenantId('metroGeneral');
    }, [setTenantId]);

    // Define org options with descriptions
    const orgOptions: OrgOption[] = [
        {
            id: 'metroGeneral',
            name: 'Metro General Hospital',
            description: 'Full-featured hospital with all services',
            icon: <Building2 size={28} />,
            features: ['Teleconsult', 'Clinic Visits', 'Lab Results', 'Queue', 'LOA'],
            color: '#0891b2',
        },
        {
            id: 'meralcoWellness',
            name: 'Meralco Wellness',
            description: 'Corporate wellness portal (no hospital features)',
            icon: <Heart size={28} />,
            features: ['LOA/Benefits', 'Forms', 'Profile', 'SSO Login'],
            color: '#DC602A',
        },
        {
            id: 'healthFirst',
            name: 'HealthFirst Clinic',
            description: 'Basic clinic with essential features',
            icon: <Stethoscope size={28} />,
            features: ['Clinic Visits', 'Queue', 'Results', 'Medications'],
            color: '#10b981',
        },
    ];

    const handleSelectOrg = (orgId: string) => {
        setTenantId(orgId);
        navigate('/');
    };

    return (
        <div className="login-page org-select">
            <div className="login-overlay"></div>

            <div className="login-content-wrapper">
                <div className="org-header">
                    <h1>Patient Portal</h1>
                    <p>Select your organization to continue</p>
                </div>

                <div className="org-grid">
                    {orgOptions.map((org) => (
                        <button
                            key={org.id}
                            className="org-card"
                            onClick={() => handleSelectOrg(org.id)}
                            style={{ '--org-color': org.color } as React.CSSProperties}
                        >
                            <div className="org-icon" style={{ background: org.color }}>
                                {org.icon}
                            </div>
                            <div className="org-info">
                                <h3>{org.name}</h3>
                                <p className="org-description">{org.description}</p>
                                <div className="org-features">
                                    {org.features.slice(0, 3).map((feature, idx) => (
                                        <span key={idx} className="feature-tag">
                                            <CheckCircle size={10} />
                                            {feature}
                                        </span>
                                    ))}
                                    {org.features.length > 3 && (
                                        <span className="feature-tag more">+{org.features.length - 3} more</span>
                                    )}
                                </div>
                            </div>
                            <ChevronRight size={20} className="org-chevron" />
                        </button>
                    ))}
                </div>

                <p className="demo-note">
                    This is a prototype. Select any organization to explore its features.
                </p>
            </div>

            <div className="login-footer">
                <p>&copy; 2024 Patient Portal PWA. All rights reserved.</p>
            </div>
        </div>
    );
};
