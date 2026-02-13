import type { TenantConfig } from '../types/tenant';

export const tenants: Record<string, TenantConfig> = {
    // Org 1: Metro General Hospital (Full features)
    metroGeneral: {
        id: 'metroGeneral',
        name: 'Metro General Hospital',
        tagline: 'World-Class Care, Close to Home',
        logoUrl: 'https://enterprise.static.domains/PatientPortal/metrohospcropped.png',
        loginBackgroundUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b9af923?q=80&w=2000&auto=format&fit=crop',
        colors: {
            // "Blue, Cyan, Light Gray"
            primary: '#0284c7',    // Blue/Sky 600
            secondary: '#06b6d4',  // Cyan 500
            background: '#f3f4f6', // Light Gray 100
            surface: '#ffffff',    // White
            text: '#0f172a',       // Slate 900
            textMuted: '#64748b',  // Slate 500
            border: '#e5e7eb',     // Gray 200
        },
        features: {
            sso: true,
            loa: true,
            hmo: true,
            philHealth: true,
            queue: true,
            appointments: true,
            multiLocation: true,
            admissions: true,
            cdss: true,
            aiAssistant: true,
            visits: {
                teleconsultEnabled: true,
                teleconsultNowEnabled: true,
                teleconsultLaterEnabled: true,
                clinicVisitEnabled: true,
                clinicF2fSchedulingEnabled: true,
                clinicLabFulfillmentEnabled: true,
            },
        },
    },

    // Org 2: Meralco Wellness (Clinic + Labs, NO Teleconsult Now)
    meralcoWellness: {
        id: 'meralcoWellness',
        name: 'Meralco Wellness Center',
        tagline: 'Powering Healthy Lives',
        logoUrl: 'https://enterprise.static.domains/PatientPortal/meralcowellnesscropped.png',
        loginBackgroundUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2000&auto=format&fit=crop',
        colors: {
            // "Orange, Light Gray, White"
            primary: '#f97316',    // Orange 500
            secondary: '#d1d5db',  // Gray 300 (Light Gray as secondary per request, essentially neutral)
            background: '#f9fafb', // Gray 50 (Light Grayish)
            surface: '#ffffff',    // White
            text: '#431407',       // Dark Orange/Brown
            textMuted: '#9a3412',
            border: '#fdba74',     // Orange 200
        },
        features: {
            sso: true,
            loa: false,
            hmo: true,           // Corporate HMO cards
            philHealth: false,   // No PhilHealth integration
            queue: true,
            appointments: true,
            multiLocation: false,
            admissions: false,
            cdss: true,
            aiAssistant: false,
            visits: {
                teleconsultEnabled: true, // Can schedule
                teleconsultNowEnabled: false, // NO NOW
                teleconsultLaterEnabled: true,
                clinicVisitEnabled: true,
                clinicF2fSchedulingEnabled: true,
                clinicLabFulfillmentEnabled: true, // Has Labs
            },
        },
    },

    // Org 3: HealthFirst Clinic (Basic, No Labs, No Teleconsult)
    healthFirst: {
        id: 'healthFirst',
        name: 'HealthFirst Clinic',
        tagline: 'Your First Step to Health',
        logoUrl: 'https://enterprise.static.domains/PatientPortal/healtfirstcropped.png',
        loginBackgroundUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop',
        colors: {
            // "Light Green, Dark Green, White"
            primary: '#22c55e',    // Green 500 (Light Green)
            secondary: '#15803d',  // Green 700 (Dark Green)
            background: '#f0fdf4', // Green 50
            surface: '#ffffff',    // White
            text: '#14532d',       // Green 900
            textMuted: '#166534',
            border: '#86efac',     // Green 300
        },
        features: {
            sso: false,
            loa: false,
            hmo: false,          // No HMO integration
            philHealth: true,    // PhilHealth / Konsulta only
            queue: true,
            appointments: true,
            multiLocation: true,
            admissions: false,
            cdss: false,
            aiAssistant: false,
            visits: {
                teleconsultEnabled: false, // NO TELECONSULT
                teleconsultNowEnabled: false,
                teleconsultLaterEnabled: false,
                clinicVisitEnabled: true,
                clinicF2fSchedulingEnabled: true,
                clinicLabFulfillmentEnabled: false, // NO LABS
            },
        },
    },
};

export const defaultTenant = tenants.metroGeneral;

