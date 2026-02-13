import {
    METRO_GENERAL_BRANCHES,
    MERALCO_WELLNESS_BRANCHES,
    HEALTH_FIRST_BRANCHES,
    getTenantBranches,
} from './mockBranches';

export { getTenantBranches };

// Combine all branches for lookup (used only for doctor matching)
export const ALL_BRANCHES = [
    ...METRO_GENERAL_BRANCHES,
    ...MERALCO_WELLNESS_BRANCHES,
    ...HEALTH_FIRST_BRANCHES
];


export interface Specialty {
    id: string;
    name: string;
    icon: string;
    description: string;
}

export interface Doctor {
    id: string;
    name: string;
    specialtyId: string;
    specialtyName: string; // denormalized for ease
    locationIds: string[]; // IDs of branches where they practice
    image: string;
    rating: number;
    fee: number;
    bio: string;
    available: { date: string; day: string; slots: string[]; status: 'Available' | 'Full' | 'Limited' }[];
}

export const SPECIALTIES: Specialty[] = [
    { id: 'gen-med', name: 'General Medicine', icon: '🩺', description: 'Primary care and checkups' },
    { id: 'cardio', name: 'Cardiology', icon: '❤️', description: 'Heart and blood vessels' },
    { id: 'derma', name: 'Dermatology', icon: '🧴', description: 'Skin, hair, and nails' },
    { id: 'peds', name: 'Pediatrics', icon: '👶', description: 'Child healthcare' },
    { id: 'obgyn', name: 'OB-GYN', icon: '🤰', description: 'Women\'s health' },
    { id: 'eyes', name: 'Ophthalmology', icon: '👁️', description: 'Eye care' },
    { id: 'ent', name: 'ENT', icon: '👂', description: 'Ear, nose, and throat' },
    { id: 'ortho', name: 'Orthopedics', icon: '🦴', description: 'Bones and joints' },
];

const generateAvailability = () => {
    const dates = [];
    const today = new Date();
    const statuses = ['Available', 'Available', 'Limited', 'Full', 'Available', 'Limited', 'Available'] as const;

    for (let i = 0; i < 7; i++) {
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + i + 1);

        const dateStr = nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const dayStr = nextDate.toLocaleDateString('en-US', { weekday: 'short' });
        const status = statuses[i % statuses.length]; // cycle through statuses for demo

        let slots = ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'];
        if (status === 'Full') slots = [];
        if (status === 'Limited') slots = ['03:30 PM'];

        dates.push({
            date: dateStr,
            day: dayStr,
            slots: slots,
            status: status
        });
    }
    return dates;
};

const availability7Days = generateAvailability();

// Helper to get dynamic date
const getFutureDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const APPOINTMENTS = [
    {
        id: '1',
        doctor: 'Dr. Sarah Wilson',
        specialty: 'Cardiology',
        date: getFutureDate(2), // 2 days from now
        time: '10:00 AM',
        status: 'Upcoming',
        type: 'In-Person',
        location: 'Metro General Hospital'
    },
    {
        id: '1a', // Old one
        doctor: 'Dr. James Wilson',
        specialty: 'General Medicine',
        date: 'Oct 24, 2023',
        time: '10:00 AM',
        status: 'Upcoming',
        type: 'In-Person',
        location: 'Metro General Hospital'
    },
];

export const DOCTORS: Doctor[] = [
    // ── Metro General Doctors ──
    {
        id: 'd1', name: 'Dr. Jen Diaz', specialtyId: 'gen-med', specialtyName: 'General Medicine',
        locationIds: ['metro-hosp-main', 'metro-hosp-north', 'metro-clinic-makati'],
        image: 'https://randomuser.me/api/portraits/women/44.jpg', rating: 4.9, fee: 800,
        bio: 'Dr. Diaz has over 10 years of experience in primary care and preventive medicine. She advocates for holistic wellness and patient education.',
        available: availability7Days
    },
    {
        id: 'd2', name: 'Dr. Juan Reyes', specialtyId: 'cardio', specialtyName: 'Cardiology',
        locationIds: ['metro-hosp-main', 'metro-hosp-north'],
        image: 'https://randomuser.me/api/portraits/men/32.jpg', rating: 4.8, fee: 1500,
        bio: 'Specializing in interventional cardiology, Dr. Reyes is committed to heart health and innovative treatments for cardiovascular diseases.',
        available: availability7Days
    },
    {
        id: 'd3', name: 'Dr. Ana Cruz', specialtyId: 'peds', specialtyName: 'Pediatrics',
        locationIds: ['metro-hosp-main', 'metro-hosp-south', 'metro-clinic-bgc'],
        image: 'https://randomuser.me/api/portraits/women/68.jpg', rating: 4.7, fee: 1000,
        bio: 'Dr. Cruz loves working with children and ensuring their healthy development from infancy through adolescence.',
        available: availability7Days
    },
    {
        id: 'd4', name: 'Dr. Roberto Go', specialtyId: 'ortho', specialtyName: 'Orthopedics',
        locationIds: ['metro-hosp-main', 'metro-hosp-north', 'metro-hosp-east'],
        image: 'https://randomuser.me/api/portraits/men/45.jpg', rating: 4.9, fee: 1800,
        bio: 'Expert in sports medicine and joint replacement, Dr. Go helps patients regain mobility and live pain-free.',
        available: availability7Days
    },
    {
        id: 'd5', name: 'Dr. Lisa Chen', specialtyId: 'derma', specialtyName: 'Dermatology',
        locationIds: ['metro-clinic-makati', 'metro-clinic-bgc', 'metro-clinic-ortigas'],
        image: 'https://randomuser.me/api/portraits/women/22.jpg', rating: 4.6, fee: 1200,
        bio: 'Dr. Chen specializes in clinical and cosmetic dermatology, helping patients feel confident in their own skin.',
        available: availability7Days
    },
    {
        id: 'd6', name: 'Dr. Mark Lee', specialtyId: 'ent', specialtyName: 'ENT',
        locationIds: ['metro-hosp-main', 'metro-hosp-east', 'metro-clinic-mandaluyong'],
        image: 'https://randomuser.me/api/portraits/men/11.jpg', rating: 4.8, fee: 1100,
        bio: 'Treating a wide range of ear, nose, and throat conditions with a patient-centered approach.',
        available: availability7Days
    },

    // ── Meralco Wellness Doctors ──
    {
        id: 'd7', name: 'Dr. Luis Gomez', specialtyId: 'gen-med', specialtyName: 'General Medicine',
        locationIds: ['meralco-med-center', 'meralco-clinic-site1', 'meralco-clinic-site2'],
        image: 'https://randomuser.me/api/portraits/men/52.jpg', rating: 4.7, fee: 700,
        bio: 'Occupational health specialist dedicated to workplace wellness and preventive care for corporate employees.',
        available: availability7Days
    },
    {
        id: 'd8', name: 'Dr. Sarah Lee', specialtyId: 'gen-med', specialtyName: 'General Medicine',
        locationIds: ['meralco-clinic-site1', 'meralco-clinic-makati'],
        image: 'https://randomuser.me/api/portraits/women/33.jpg', rating: 4.8, fee: 750,
        bio: 'Primary care physician with a focus on chronic disease management and patient education.',
        available: availability7Days
    },
    {
        id: 'd9', name: 'Dr. Carlo Mendoza', specialtyId: 'cardio', specialtyName: 'Cardiology',
        locationIds: ['meralco-med-center', 'meralco-clinic-makati'],
        image: 'https://randomuser.me/api/portraits/men/29.jpg', rating: 4.9, fee: 1400,
        bio: 'Corporate cardiovascular specialist focusing on executive health screening and heart disease prevention.',
        available: availability7Days
    },
    {
        id: 'd10', name: 'Dr. Patricia Reyes', specialtyId: 'eyes', specialtyName: 'Ophthalmology',
        locationIds: ['meralco-clinic-taguig', 'meralco-med-center'],
        image: 'https://randomuser.me/api/portraits/women/56.jpg', rating: 4.6, fee: 1000,
        bio: 'Comprehensive eye care from routine exams to specialized treatments.',
        available: availability7Days
    },

    // ── HealthFirst Clinic Doctors ──
    {
        id: 'd11', name: 'Dr. Anna Santos', specialtyId: 'gen-med', specialtyName: 'General Medicine',
        locationIds: ['healthfirst-main', 'healthfirst-pasay'],
        image: 'https://randomuser.me/api/portraits/women/41.jpg', rating: 4.8, fee: 500,
        bio: 'Community-focused physician providing affordable primary care and Konsulta services.',
        available: availability7Days
    },
    {
        id: 'd12', name: 'Dr. Benjie Tan', specialtyId: 'gen-med', specialtyName: 'General Medicine',
        locationIds: ['healthfirst-main', 'healthfirst-qc'],
        image: 'https://randomuser.me/api/portraits/men/61.jpg', rating: 4.7, fee: 500,
        bio: 'Experienced family doctor with a passion for accessible healthcare in underserved communities.',
        available: availability7Days
    },
    {
        id: 'd13', name: 'Dr. Teresa Lim', specialtyId: 'peds', specialtyName: 'Pediatrics',
        locationIds: ['healthfirst-main', 'healthfirst-pasay'],
        image: 'https://randomuser.me/api/portraits/women/72.jpg', rating: 4.9, fee: 600,
        bio: 'Pediatrician specializing in newborn care and childhood immunizations.',
        available: availability7Days
    },
];


