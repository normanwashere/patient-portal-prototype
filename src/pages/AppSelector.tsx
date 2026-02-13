import { useNavigate } from 'react-router-dom';
import { useTheme } from '../theme/ThemeContext';
import {
    Stethoscope,
    Building2,
    Users,
    ArrowRight,
    Shield,
    Smartphone,
    Monitor,
    HeartPulse,
} from 'lucide-react';
import React, { useState } from 'react';
import type { TenantFeatures } from '../types/tenant';

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    header: {
        textAlign: 'center',
        marginBottom: '3rem',
    },
    headerTitle: {
        fontSize: '2rem',
        fontWeight: 800,
        color: '#ffffff',
        letterSpacing: '-0.02em',
        marginBottom: '0.5rem',
    },
    headerSubtitle: {
        fontSize: '1rem',
        color: '#94a3b8',
        fontWeight: 400,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        maxWidth: '1100px',
        width: '100%',
    },
    card: {
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '2rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
    },
    iconWrap: {
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.25rem',
        color: '#ffffff',
    },
    cardTitle: {
        fontSize: '1.25rem',
        fontWeight: 700,
        color: '#ffffff',
        marginBottom: '0.5rem',
    },
    cardDescription: {
        fontSize: '0.875rem',
        color: '#94a3b8',
        lineHeight: 1.6,
        marginBottom: '1.25rem',
    },
    featureList: {
        listStyle: 'none',
        padding: 0,
        margin: '0 0 1.5rem 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    featureItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.8rem',
        color: '#cbd5e1',
    },
    dot: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        flexShrink: 0,
    },
    cardFooter: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    platformBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        fontSize: '0.75rem',
        color: '#64748b',
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '0.375rem 0.75rem',
        borderRadius: '20px',
    },
    enterButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'none',
        border: 'none',
        color: '#ffffff',
        fontSize: '0.95rem',
        fontWeight: 600,
        cursor: 'pointer',
        padding: '0.5rem 1rem',
        borderRadius: '12px',
        transition: 'all 0.2s ease',
    },
    versionBadge: {
        position: 'absolute' as const,
        top: '1rem',
        right: '1rem',
        fontSize: '0.7rem',
        fontWeight: 600,
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
    },
    footer: {
        marginTop: '3rem',
        textAlign: 'center' as const,
        color: '#475569',
        fontSize: '0.85rem',
    },
};

function getApps(features: TenantFeatures) {
    const patientFeatures = [
        'Appointment booking & history',
        features.visits.clinicLabFulfillmentEnabled && 'Lab results & medications',
        features.queue && 'Queue tracking & check-in',
        features.visits.teleconsultEnabled && 'Teleconsult',
        'Billing & payments',
        (features.hmo || features.philHealth) && 'Insurance & coverage management',
    ].filter(Boolean) as string[];

    const doctorFeatures = [
        'Today view & patient schedule',
        features.queue && 'Patient queue management',
        'SOAP notes with AI Transcriber',
        'CDSS clinical decision support',
        'e-Prescriptions',
        features.visits.clinicLabFulfillmentEnabled && 'Lab results review',
        features.visits.teleconsultEnabled && 'Teleconsult (doctor side)',
        (features.hmo || features.loa) && 'LOA & insurance review',
    ].filter(Boolean) as string[];

    const providerFeatures = [
        'Admin dashboard & KPIs',
        features.queue && 'Queue management operations',
        features.appointments && 'Scheduling & resource management',
        features.visits.clinicLabFulfillmentEnabled && 'Lab, imaging & pharmacy ops',
        'Billing & revenue cycle',
        'HR, staffing & facility management',
        'Analytics & compliance reports',
    ].filter(Boolean) as string[];

    return [
        {
            id: 'patient',
            title: 'Patient Portal',
            description: 'Access your health records, book appointments, manage medications, and connect with your care team.',
            icon: Users,
            iconBg: 'linear-gradient(135deg, #06b6d4, #0284c7)',
            accentColor: '#06b6d4',
            route: '/dashboard',
            badge: 'Live',
            badgeBg: 'rgba(16, 185, 129, 0.2)',
            badgeColor: '#10b981',
            platform: 'Mobile-First',
            platformIcon: Smartphone,
            features: patientFeatures,
        },
        {
            id: 'doctor',
            title: 'Doctor App',
            description: 'Manage your schedule, see patients, write notes with AI assistance, and review lab results.',
            icon: Stethoscope,
            iconBg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            accentColor: '#8b5cf6',
            route: '/doctor',
            badge: 'New',
            badgeBg: 'rgba(139, 92, 246, 0.2)',
            badgeColor: '#8b5cf6',
            platform: 'Mobile-First',
            platformIcon: Smartphone,
            features: doctorFeatures,
        },
        {
            id: 'provider',
            title: 'Provider Dashboard',
            description: 'Hospital and clinic management with queue operations, billing, scheduling, and analytics.',
            icon: Building2,
            iconBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
            accentColor: '#f59e0b',
            route: '/provider',
            badge: 'New',
            badgeBg: 'rgba(245, 158, 11, 0.2)',
            badgeColor: '#f59e0b',
            platform: 'Desktop-First',
            platformIcon: Monitor,
            features: providerFeatures,
        },
    ];
}

export function AppSelector() {
    const navigate = useNavigate();
    const { tenant } = useTheme();
    const apps = getApps(tenant.features);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <img
                        src={tenant.logoUrl}
                        alt={tenant.name}
                        style={{ height: 40, objectFit: 'contain' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                </div>
                <h1 style={styles.headerTitle}>{tenant.name}</h1>
                <p style={styles.headerSubtitle}>Select an application to continue</p>
            </header>

            <div style={styles.grid}>
                {apps.map((app) => {
                    const PlatformIcon = app.platformIcon;
                    const AppIcon = app.icon;
                    const isHovered = hoveredCard === app.id;
                    return (
                        <div
                            key={app.id}
                            style={{
                                ...styles.card,
                                borderColor: isHovered ? app.accentColor : 'rgba(255, 255, 255, 0.1)',
                                transform: isHovered ? 'translateY(-4px)' : 'none',
                                boxShadow: isHovered ? `0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px ${app.accentColor}40` : 'none',
                            }}
                            onMouseEnter={() => setHoveredCard(app.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                            onClick={() => navigate(app.route)}
                        >
                            <span style={{ ...styles.versionBadge, background: app.badgeBg, color: app.badgeColor }}>
                                {app.badge}
                            </span>
                            <div style={{ ...styles.iconWrap, background: app.iconBg }}>
                                <AppIcon size={28} />
                            </div>
                            <h2 style={styles.cardTitle}>{app.title}</h2>
                            <p style={styles.cardDescription}>{app.description}</p>
                            <ul style={styles.featureList}>
                                {app.features.map((f, i) => (
                                    <li key={i} style={styles.featureItem}>
                                        <span style={{ ...styles.dot, background: app.accentColor }} />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <div style={styles.cardFooter}>
                                <span style={styles.platformBadge}>
                                    <PlatformIcon size={14} />
                                    {app.platform}
                                </span>
                                <button style={{ ...styles.enterButton, color: app.accentColor }}>
                                    Enter <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <footer style={styles.footer}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Shield size={14} /> HIPAA Compliant
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <HeartPulse size={14} /> HL7 FHIR Ready
                    </span>
                </div>
            </footer>
        </div>
    );
}
