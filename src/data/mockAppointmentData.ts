import {
    METRO_GENERAL_BRANCHES,
    MERALCO_WELLNESS_BRANCHES,
    HEALTH_FIRST_BRANCHES
} from './mockBranches';

// ... (other interfaces)

// Combine all branches for lookup
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
    {
        id: 'd1', name: 'Dr. Jen Diaz', specialtyId: 'gen-med', specialtyName: 'General Medicine',
        locationIds: ['main', 'north', 'wellness-makati'],
        image: 'https://randomuser.me/api/portraits/women/44.jpg', rating: 4.9, fee: 800,
        bio: 'Dr. Diaz has over 10 years of experience in primary care and preventive medicine. She advocates for holistic wellness and patient education.',
        available: availability7Days
    },
    {
        id: 'd2', name: 'Dr. Juan Reyes', specialtyId: 'cardio', specialtyName: 'Cardiology',
        locationIds: ['main', 'north'],
        image: 'https://randomuser.me/api/portraits/men/32.jpg', rating: 4.8, fee: 1500,
        bio: 'Specializing in interventional cardiology, Dr. Reyes is committed to heart health and innovative treatments for cardiovascular diseases.',
        available: availability7Days
    },
    {
        id: 'd3', name: 'Dr. Ana Cruz', specialtyId: 'peds', specialtyName: 'Pediatrics',
        locationIds: ['main', 'wellness-bgc', 'south-clinic'],
        image: 'https://randomuser.me/api/portraits/women/68.jpg', rating: 4.7, fee: 1000,
        bio: 'Dr. Cruz loves working with children and ensuring their healthy development from infancy through adolescence.',
        available: availability7Days
    },
    {
        id: 'd4', name: 'Dr. Roberto Go', specialtyId: 'ortho', specialtyName: 'Orthopedics',
        locationIds: ['main', 'north'],
        image: 'https://randomuser.me/api/portraits/men/45.jpg', rating: 4.9, fee: 1800,
        bio: 'Expert in sports medicine and joint replacement, Dr. Go helps patients regain mobility and live pain-free.',
        available: availability7Days
    },
    {
        id: 'd5', name: 'Dr. Lisa Chen', specialtyId: 'derma', specialtyName: 'Dermatology',
        locationIds: ['wellness-makati', 'wellness-bgc', 'wellness-ortigas'],
        image: 'https://randomuser.me/api/portraits/women/22.jpg', rating: 4.6, fee: 1200,
        bio: 'Dr. Chen specializes in clinical and cosmetic dermatology, helping patients feel confident in their own skin.',
        available: availability7Days
    },
    {
        id: 'd6', name: 'Dr. Mark Lee', specialtyId: 'ent', specialtyName: 'ENT',
        locationIds: ['main', 'east-clinic'],
        image: 'https://randomuser.me/api/portraits/men/11.jpg', rating: 4.8, fee: 1100,
        bio: 'Treating a wide range of ear, nose, and throat conditions with a patient-centered approach.',
        available: availability7Days
    }
];


