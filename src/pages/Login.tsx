import React from 'react';
import { useTheme } from '../theme/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
    Building2,
    Heart,
    Stethoscope,
    ChevronRight,
    CheckCircle,
    User,
    Shield,
    HeartPulse,
    Microscope,
    UserCheck,
    ArrowLeft,
} from 'lucide-react';
import './Login.css';

interface OrgOption {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    features: string[];
    color: string;
}

interface RoleOption {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    route: string;
    accessLevel: string;
    accessColor: string;
}

export const Login: React.FC = () => {
    const { setTenantId } = useTheme();
    const navigate = useNavigate();
    const [selectedOrg, setSelectedOrg] = React.useState<OrgOption | null>(null);

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

    // Define role options
    const roleOptions: RoleOption[] = [
        {
            id: 'patient',
            name: 'Patient',
            description: 'View appointments, results, and manage your health records',
            icon: <User size={28} />,
            route: '/dashboard',
            accessLevel: 'Full Access',
            accessColor: '#10b981',
        },
        {
            id: 'doctor',
            name: 'Doctor',
            description: 'Manage consultations, patient records, and clinical workflows',
            icon: <Stethoscope size={28} />,
            route: '/doctor',
            accessLevel: 'Clinical',
            accessColor: '#3b82f6',
        },
        {
            id: 'provider-admin',
            name: 'Provider Admin',
            description: 'Oversee operations, manage staff, and configure settings',
            icon: <Shield size={28} />,
            route: '/provider',
            accessLevel: 'Full Access',
            accessColor: '#10b981',
        },
        {
            id: 'nurse',
            name: 'Nurse',
            description: 'Assist with patient care, vitals, and nursing workflows',
            icon: <HeartPulse size={28} />,
            route: '/provider/nursing',
            accessLevel: 'Clinical',
            accessColor: '#3b82f6',
        },
        {
            id: 'lab-tech',
            name: 'Lab Technician',
            description: 'Process lab orders, imaging requests, and upload results',
            icon: <Microscope size={28} />,
            route: '/provider/lab-imaging',
            accessLevel: 'Operations',
            accessColor: '#f59e0b',
        },
        {
            id: 'front-desk',
            name: 'Front Desk',
            description: 'Handle patient check-ins, queue management, and scheduling',
            icon: <UserCheck size={28} />,
            route: '/provider/queue',
            accessLevel: 'Read-Only',
            accessColor: '#8b5cf6',
        },
    ];

    const handleSelectOrg = (org: OrgOption) => {
        setTenantId(org.id);
        setSelectedOrg(org);
    };

    const handleSelectRole = (role: RoleOption) => {
        localStorage.setItem('userRole', role.id);
        navigate(role.route);
    };

    const handleBackToOrg = () => {
        setSelectedOrg(null);
        setTenantId('metroGeneral');
    };

    return (
        <div className="login-page org-select">
            <div className="login-overlay"></div>

            <div className="login-content-wrapper">
                {/* ===== STEP 1: Org Selection ===== */}
                {!selectedOrg && (
                    <>
                        <div className="org-header">
                            <h1>Patient Portal</h1>
                            <p>Select your organization to continue</p>
                        </div>

                        <div className="org-grid">
                            {orgOptions.map((org) => (
                                <button
                                    key={org.id}
                                    className="org-card"
                                    onClick={() => handleSelectOrg(org)}
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
                    </>
                )}

                {/* ===== STEP 2: Role Selection ===== */}
                {selectedOrg && (
                    <>
                        <div className="org-header">
                            <button className="role-back-btn" onClick={handleBackToOrg}>
                                <ArrowLeft size={18} />
                                Back
                            </button>
                            <div className="selected-org-badge" style={{ '--org-color': selectedOrg.color } as React.CSSProperties}>
                                <div className="selected-org-icon" style={{ background: selectedOrg.color }}>
                                    {selectedOrg.icon}
                                </div>
                                <span>{selectedOrg.name}</span>
                            </div>
                            <h1>Select Your Role</h1>
                            <p>Choose how you'd like to access the portal</p>
                        </div>

                        <div className="role-grid">
                            {roleOptions.map((role) => (
                                <button
                                    key={role.id}
                                    className="org-card role-card"
                                    onClick={() => handleSelectRole(role)}
                                    style={{ '--org-color': role.accessColor } as React.CSSProperties}
                                >
                                    <div className="org-icon" style={{ background: role.accessColor }}>
                                        {role.icon}
                                    </div>
                                    <div className="org-info">
                                        <h3>{role.name}</h3>
                                        <p className="org-description">{role.description}</p>
                                        <span
                                            className="role-access-badge"
                                            style={{ background: `${role.accessColor}22`, color: role.accessColor, borderColor: `${role.accessColor}44` }}
                                        >
                                            {role.accessLevel}
                                        </span>
                                    </div>
                                    <ChevronRight size={20} className="org-chevron" />
                                </button>
                            ))}
                        </div>

                        <p className="demo-note">
                            Each role provides a different view of the portal. Select any role to explore.
                        </p>
                    </>
                )}
            </div>

            <div className="login-footer">
                <p>&copy; 2024 Patient Portal PWA. All rights reserved.</p>
            </div>
        </div>
    );
};
