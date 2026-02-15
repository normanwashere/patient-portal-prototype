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
            // "Blue, Cyan" — background subtly tinted with sky blue
            primary: '#0284c7',    // Blue/Sky 600
            secondary: '#06b6d4',  // Cyan 500
            background: '#f0f7ff', // Sky-blue tinted background
            surface: '#ffffff',    // White
            text: '#0f172a',       // Slate 900
            textMuted: '#64748b',  // Slate 500
            border: '#dbe8f4',     // Blue-gray border
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
            carePlans: true,
            visits: {
                teleconsultEnabled: true,
                teleconsultNowEnabled: true,
                teleconsultLaterEnabled: true,
                clinicVisitEnabled: true,
                clinicF2fSchedulingEnabled: true,
                clinicLabFulfillmentEnabled: true,
                homeCareEnabled: true,
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
            // "Orange, Warm Neutrals" — background subtly warm-tinted
            primary: '#f97316',    // Orange 500
            secondary: '#d1d5db',  // Gray 300
            background: '#fff8f3', // Warm orange-tinted background
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
            carePlans: true,
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
            carePlans: false,   // Basic clinic, no care plans
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
    // Org 4: Maxicare (HMO Provider – Primary Care Clinics + Affiliated Network)
    maxicare: {
        id: 'maxicare',
        name: 'Maxicare',
        tagline: 'Live Your Best Life',
        logoUrl: 'https://www.maxicare.com.ph/wp-content/uploads/2022/11/new-home-logo.png',
        loginBackgroundUrl: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=2000&auto=format&fit=crop',
        colors: {
            // Maxicare brand: Royal Blue primary, Gold/Yellow accent (from logo)
            primary: '#0046BE',     // Maxicare royal blue
            secondary: '#FDB81E',   // Maxicare gold/yellow accent
            background: '#eef3ff',  // Blue-tinted background reflecting brand
            surface: '#ffffff',     // White
            text: '#1a1a2e',        // Near-black
            textMuted: '#6c757d',   // Muted gray
            border: '#d0dbf0',      // Soft blue-gray border
        },
        features: {
            sso: true,
            loa: true,
            hmo: true,              // Core HMO provider
            philHealth: true,
            queue: true,
            appointments: true,
            multiLocation: true,    // 41+ Primary Care Clinics nationwide
            admissions: false,      // HMO, not a hospital
            cdss: true,
            aiAssistant: true,
            carePlans: true,
            visits: {
                teleconsultEnabled: true,
                teleconsultNowEnabled: true,    // 24/7 Teleconsult with Video Call
                teleconsultLaterEnabled: true,
                clinicVisitEnabled: true,
                clinicF2fSchedulingEnabled: true,
                clinicLabFulfillmentEnabled: true,  // Labs at PCCs
                homeCareEnabled: true,              // HomeCare: lab collection at home/office
            },
        },
    },
};

export const defaultTenant = tenants.metroGeneral;

