export interface Branch {
    id: string;
    name: string;
    type: string; // 'hospital' | 'clinic' | 'lying-in'
    address: string;
    phone: string;
    hours: string;
    services: string[];
    distance: string;
    specializations?: string[];
    doctors?: { name: string; title: string; image?: string }[];
}

// Metro General Hospital: 4 Hospitals, 7 Clinics
export const METRO_GENERAL_BRANCHES: Branch[] = [
    // Hospitals (Top 2 nearest)
    {
        id: 'metro-hosp-main',
        name: 'Metro General Hospital - Main',
        type: 'hospital',
        address: '123 Health Ave, Makati',
        phone: '(02) 8888-0001',
        hours: '24/7 Emergency',
        services: ['ER', 'Surgery', 'ICU', 'Imaging'],
        distance: '2.3 km',
        specializations: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics'],
        doctors: [
            { name: 'Dr. Ricardo Santos', title: 'Senior Cardiologist' },
            { name: 'Dr. Maria Clara', title: 'Neurosurgeon' },
            { name: 'Dr. Juan dela Cruz', title: 'Oncologist' }
        ]
    },
    {
        id: 'metro-hosp-north',
        name: 'Metro General Hospital - North',
        type: 'hospital',
        address: '456 Medical Dr, Quezon City',
        phone: '(02) 8888-0002',
        hours: '24/7 Emergency',
        services: ['ER', 'Surgery', 'Lab'],
        distance: '5.1 km',
        specializations: ['Pediatrics', 'Obstetrics', 'Urology'],
        doctors: [
            { name: 'Dr. Elena Reyes', title: 'Chief of Pediatrics' },
            { name: 'Dr. Marco Polo', title: 'OB-GYN' }
        ]
    },
    // Other Hospitals
    {
        id: 'metro-hosp-south',
        name: 'Metro General Hospital - South',
        type: 'hospital',
        address: '789 Alabang Zapote Rd, Muntinlupa',
        phone: '(02) 8888-0003',
        hours: '24/7 Emergency',
        services: ['ER', 'Maternity', 'Pediatrics'],
        distance: '15.4 km',
    },
    {
        id: 'metro-hosp-east',
        name: 'Metro General Hospital - East',
        type: 'hospital',
        address: '101 Ortigas Ext, Pasig',
        phone: '(02) 8888-0004',
        hours: '24/7 Emergency',
        services: ['ER', 'Outpatient', 'Dialysis'],
        distance: '8.7 km',
    },
    // Clinics (Top 2 nearest)
    {
        id: 'metro-clinic-makati',
        name: 'Metro Clinic - Makati CBD',
        type: 'clinic',
        address: 'Ground Floor, Ayala Tower',
        phone: '(02) 8777-1001',
        hours: 'Mon-Sat 8AM-5PM',
        services: ['Consult', 'Lab'],
        distance: '1.2 km',
        specializations: ['Internal Medicine', 'Family Medicine'],
        doctors: [
            { name: 'Dr. Angela Yu', title: 'Family Physician' },
            { name: 'Dr. Robert Tan', title: 'Internist' }
        ]
    },
    {
        id: 'metro-clinic-bgc',
        name: 'Metro Clinic - BGC High St',
        type: 'clinic',
        address: '5th Floor, High Street Mall',
        phone: '(02) 8777-1002',
        hours: 'Mon-Sat 9AM-8PM',
        services: ['Consult', 'Vaccines'],
        distance: '3.8 km',
        specializations: ['Dermatology', 'Wellness'],
        doctors: [
            { name: 'Dr. Sofia Loren', title: 'Dermatologist' }
        ]
    },
    // Other Clinics
    {
        id: 'metro-clinic-ortigas',
        name: 'Metro Clinic - Podium',
        type: 'clinic',
        address: 'Level 2, Podium Mall',
        phone: '(02) 8777-1003',
        hours: 'Mon-Fri 10AM-7PM',
        services: ['Consult', 'Dental'],
        distance: '7.2 km',
    },
    {
        id: 'metro-clinic-qc',
        name: 'Metro Clinic - TriNoma',
        type: 'clinic',
        address: 'Level 3, TriNoma Mall',
        phone: '(02) 8777-1004',
        hours: 'Mon-Sun 10AM-9PM',
        services: ['Consult', 'Lab'],
        distance: '9.5 km',
    },
    {
        id: 'metro-clinic-mandaluyong',
        name: 'Metro Clinic - Megamall',
        type: 'clinic',
        address: 'Level 5, SM Megamall',
        phone: '(02) 8777-1005',
        hours: 'Mon-Sun 10AM-9PM',
        services: ['Consult', 'Dental', 'Eye Center'],
        distance: '6.8 km',
    },
    {
        id: 'metro-clinic-alabang',
        name: 'Metro Clinic - Town Center',
        type: 'clinic',
        address: 'Alabang Town Center',
        phone: '(02) 8777-1006',
        hours: 'Mon-Sun 11AM-8PM',
        services: ['Consult', 'Pedia'],
        distance: '16.0 km',
    },
    {
        id: 'metro-clinic-pasig',
        name: 'Metro Clinic - Kapitolyo',
        type: 'clinic',
        address: '12 East Capitol Dr',
        phone: '(02) 8777-1007',
        hours: 'Mon-Sat 8AM-5PM',
        services: ['Consult', 'Lab'],
        distance: '8.2 km',
    },
];

// Meralco Wellness: 2 Hospitals, 5 Clinics
export const MERALCO_WELLNESS_BRANCHES: Branch[] = [
    // Hospitals
    {
        id: 'meralco-med-center',
        name: 'Meralco Corporate Medical Center',
        type: 'hospital',
        address: 'Ortigas Ave, Pasig',
        phone: '(02) 1621-1111',
        hours: '24/7 Operations',
        services: ['ER', 'Occupational Health', 'Checkups'],
        distance: '1.5 km',
        specializations: ['Occupational Health', 'Emergency Medicine'],
        doctors: [
            { name: 'Dr. Luis Gomez', title: 'Occupational Health MD' }
        ]
    },
    {
        id: 'meralco-recovery',
        name: 'Meralco Recovery Center',
        type: 'hospital',
        address: 'Meralco Ave, Pasig',
        phone: '(02) 1621-2222',
        hours: '8AM-5PM',
        services: ['Rehab', 'Wellness'],
        distance: '4.0 km',
    },
    // Clinics
    {
        id: 'meralco-clinic-site1',
        name: 'Meralco Wellness - Site 1',
        type: 'clinic',
        address: 'Compound A, Pasig',
        phone: '(02) 1621-3001',
        hours: 'Mon-Fri 7AM-4PM',
        services: ['Consult', 'First Aid'],
        distance: '0.8 km',
        specializations: ['Primary Care', 'First Aid'],
        doctors: [
            { name: 'Dr. Sarah Lee', title: 'General Physician' }
        ]
    },
    {
        id: 'meralco-clinic-site2',
        name: 'Meralco Wellness - Site 2',
        type: 'clinic',
        address: 'Sector 5, Pasig',
        phone: '(02) 1621-3002',
        hours: 'Mon-Fri 8AM-5PM',
        services: ['Consult', 'Dental'],
        distance: '2.2 km',
    },
    {
        id: 'meralco-clinic-makati',
        name: 'Meralco Satellite - Makati',
        type: 'clinic',
        address: 'Rockwell Drive',
        phone: '(02) 1621-3003',
        hours: 'Mon-Fri 9AM-6PM',
        services: ['Consult', 'Lab Extraction'],
        distance: '5.5 km',
    },
    {
        id: 'meralco-clinic-taguig',
        name: 'Meralco Satellite - Taguig',
        type: 'clinic',
        address: 'Market Market',
        phone: '(02) 1621-3004',
        hours: 'Mon-Sat 10AM-7PM',
        services: ['Consult', 'Optical'],
        distance: '6.1 km',
    },
    {
        id: 'meralco-clinic-qc',
        name: 'Meralco Satellite - QC',
        type: 'clinic',
        address: 'Commonwealth Ave',
        phone: '(02) 1621-3005',
        hours: 'Mon-Fri 8AM-5PM',
        services: ['Consult', 'X-Ray'],
        distance: '12.3 km',
    },
];

// HealthFirst: 3 Clinics
export const HEALTH_FIRST_BRANCHES: Branch[] = [
    {
        id: 'healthfirst-main',
        name: 'HealthFirst Clinic - Main',
        type: 'clinic',
        address: 'Shaw Blvd, Mandaluyong',
        phone: '(02) 7777-8888',
        hours: 'Mon-Sat 8AM-6PM',
        services: ['Consult', 'Lab', 'X-Ray', 'Ultrasound'],
        distance: '1.0 km',
        specializations: ['Diagnostic Imaging', 'Laboratory Medicine'],
        doctors: [
            { name: 'Dr. Anna Santos', title: 'Radiologist' },
            { name: 'Dr. Benjie Tan', title: 'Pathologist' }
        ]
    },
    {
        id: 'healthfirst-pasay',
        name: 'HealthFirst Clinic - Pasay',
        type: 'clinic',
        address: 'Taft Ave, Pasay',
        phone: '(02) 7777-8889',
        hours: 'Mon-Sat 7AM-5PM',
        services: ['Consult', 'Lab'],
        distance: '4.2 km',
        specializations: ['Primary Care'],
        doctors: [
            { name: 'Dr. Teresa Lim', title: 'General Physician' }
        ]
    },
    {
        id: 'healthfirst-qc',
        name: 'HealthFirst Clinic - Quezon City',
        type: 'clinic',
        address: 'Katipunan Ave, Quezon City',
        phone: '(02) 7777-8890',
        hours: 'Mon-Fri 8AM-5PM',
        services: ['Consult', 'Vaccines'],
        distance: '9.8 km',
    },
];

// Maxicare Primary Care Clinics
export const MAXICARE_BRANCHES: Branch[] = [
    // NCR
    {
        id: 'maxicare-ayala-north',
        name: 'Maxicare Primary Care - Ayala North Exchange',
        type: 'clinic',
        address: '2/F The Shops, Ayala North Exchange, Makati City',
        phone: '(02) 7798-7739',
        hours: '24hrs Mon-Sun',
        services: ['Consultation', 'Laboratory', 'Ultrasound', 'ECG', 'Treadmill', 'X-Ray', '2D Echo', 'Holter'],
        distance: '0.8 km',
        specializations: ['Internal Medicine', 'Family Medicine', 'Pediatrics', 'ENT', 'OB-Gyne', 'Dermatology', 'Ophthalmology', 'Psychiatry', 'IM-Cardiology'],
    },
    {
        id: 'maxicare-bgc',
        name: 'Maxicare Primary Care - Bonifacio Technology Center',
        type: 'clinic',
        address: '2nd Ave cor 31st St, BGC, Taguig',
        phone: '(02) 7798-7739',
        hours: '6AM-10PM Mon-Sun',
        services: ['Consultation', 'Lab', 'X-Ray', 'CT-Scan', 'MRI', 'Ultrasound', 'Treadmill', 'ECG', '2D Echo'],
        distance: '4.2 km',
        specializations: ['GP', 'Internal Medicine', 'Family Medicine', 'OB-Gyne', 'ENT', 'Pediatrics', 'Dermatology', 'Psychiatry', 'IM-Cardiology', 'Orthopedics'],
    },
    {
        id: 'maxicare-bridgetowne',
        name: 'Maxicare Primary Care - Bridgetowne',
        type: 'clinic',
        address: 'Unit 1-3 Zeta Tower, Bridgetowne, C-5 Road, Quezon City',
        phone: '(02) 7798-7739',
        hours: '24hrs Mon-Sun',
        services: ['Consultation', 'Lab', 'Ultrasound', 'ECG', 'Treadmill', 'X-Ray', '2D Echo'],
        distance: '11.5 km',
    },
    {
        id: 'maxicare-centris',
        name: 'Maxicare Primary Care - Centris',
        type: 'clinic',
        address: 'G/F Cyberpod Centris 5, Eton Centris, Quezon City',
        phone: '(02) 7908-6925',
        hours: '6AM-10PM Mon-Sun',
        services: ['Lab', 'Ultrasound', 'ECG', 'Treadmill', '2D Echo', 'X-Ray', 'Holter', 'Physical Therapy'],
        distance: '9.8 km',
    },
    {
        id: 'maxicare-vv-soliven',
        name: 'Maxicare Primary Care - VV Soliven',
        type: 'clinic',
        address: 'EDSA Greenhills, San Juan City',
        phone: '(02) 7798-7788',
        hours: '6AM-10PM Mon-Sun',
        services: ['Consultation', 'Lab', 'CT Scan', 'Ultrasound', 'ECG', '2D Echo', 'X-Ray', 'Treadmill', 'Holter'],
        distance: '5.6 km',
    },
    {
        id: 'maxicare-cubao',
        name: 'Maxicare Primary Care - Cubao',
        type: 'clinic',
        address: 'Cyberpark Tower 2, Araneta City, Quezon City',
        phone: '(02) 7798-7739',
        hours: '6AM-10PM Mon-Sun',
        services: ['Consultation', 'Lab', 'Ultrasound', 'ECG', 'X-Ray', '2D Echo'],
        distance: '10.2 km',
    },
    {
        id: 'maxicare-fairview',
        name: 'Maxicare Primary Care - Fairview',
        type: 'clinic',
        address: 'AD Center, Regalado Hi-Way, Fairview, Quezon City',
        phone: '(02) 7798-7739',
        hours: '6AM-10PM Mon-Sun',
        services: ['Consultation', 'Lab', 'Ultrasound', 'ECG', 'X-Ray', '2D Echo'],
        distance: '18.3 km',
    },
    {
        id: 'maxicare-hemady',
        name: 'Maxicare Primary Care - Hemady',
        type: 'clinic',
        address: 'Hemady Square, Dona Hemady St, Quezon City',
        phone: '(02) 7798-7739',
        hours: '6AM-10PM Mon-Sun',
        services: ['Consultation', 'Lab', 'Ultrasound', 'ECG', 'X-Ray', '2D Echo'],
        distance: '8.1 km',
    },
    {
        id: 'maxicare-double-dragon',
        name: 'Maxicare Primary Care - Double Dragon Meridian Park',
        type: 'clinic',
        address: 'Diosdado Macapagal Ave, Pasay City',
        phone: '(02) 7798-7739',
        hours: '6AM-10PM Mon-Sun',
        services: ['Consultation', 'Lab', 'Ultrasound', 'ECG', 'X-Ray', '2D Echo'],
        distance: '7.4 km',
    },
    {
        id: 'maxicare-alabang',
        name: 'Maxicare Primary Care - Alabang',
        type: 'clinic',
        address: 'Filinvest Three Bldg, Alabang-Zapote Rd, Muntinlupa',
        phone: '(02) 7798-7739',
        hours: '6AM-10PM Mon-Sun',
        services: ['Consultation', 'Lab', 'Ultrasound', 'ECG', 'X-Ray', '2D Echo'],
        distance: '16.5 km',
    },
    // Luzon (outside NCR)
    {
        id: 'maxicare-clark',
        name: 'Maxicare Primary Care - Clark',
        type: 'clinic',
        address: 'G/F SM City Clark, Angeles, Pampanga',
        phone: '(045) 499-0000',
        hours: '6AM-10PM Mon-Sun',
        services: ['Consultation', 'Lab', 'Ultrasound', 'ECG', 'X-Ray', '2D Echo'],
        distance: '82 km',
    },
    {
        id: 'maxicare-imus',
        name: 'Maxicare Primary Care - Imus',
        type: 'clinic',
        address: 'Metro MPC Building, E. Aguinaldo Highway, Imus, Cavite',
        phone: '(046) 419-8017',
        hours: '6AM-10PM Mon-Sun',
        services: ['Consultation', 'Lab', 'Ultrasound', 'ECG', 'X-Ray', '2D Echo'],
        distance: '34 km',
    },
    // Visayas
    {
        id: 'maxicare-cebu',
        name: 'Maxicare Primary Care - Cebu Business Park',
        type: 'clinic',
        address: 'Mindanao Ave, Cebu Business Park, Cebu City',
        phone: '(032) 260-9067',
        hours: '6AM-10PM Mon-Sun',
        services: ['Consultation', 'Lab', 'Ultrasound', 'ECG', 'Treadmill', 'X-Ray', '2D Echo', 'Holter'],
        distance: '565 km',
    },
    {
        id: 'maxicare-iloilo',
        name: 'Maxicare Primary Care - Iloilo',
        type: 'clinic',
        address: 'Three Techno Place, Megaworld Blvd, Iloilo City',
        phone: '(033) 328-7031',
        hours: '6AM-10PM Mon-Sun',
        services: ['Consultation', 'Lab', 'Ultrasound', 'ECG', 'X-Ray', '2D Echo'],
        distance: '475 km',
    },
    // Mindanao
    {
        id: 'maxicare-davao',
        name: 'Maxicare Primary Care - Davao',
        type: 'clinic',
        address: 'Abreeza Mall, JP Laurel Ave, Davao City',
        phone: '(082) 293-2446',
        hours: '6AM-10PM Mon-Sun',
        services: ['Consultation', 'Lab', 'Ultrasound', 'ECG', 'Treadmill', '2D Echo', 'X-Ray'],
        distance: '965 km',
    },
];

/**
 * Returns branches for the given tenant ID.
 * Custom / unknown tenants get a generic branch using the tenant name.
 */
export function getTenantBranches(tenantId: string, tenantName?: string): Branch[] {
    switch (tenantId) {
        case 'metroGeneral': return METRO_GENERAL_BRANCHES;
        case 'meralcoWellness': return MERALCO_WELLNESS_BRANCHES;
        case 'healthFirst': return HEALTH_FIRST_BRANCHES;
        case 'maxicare': return MAXICARE_BRANCHES;
        default:
            // Dynamic / custom tenants get one generic branch
            return [{
                id: `${tenantId}-main`,
                name: `${tenantName || 'Main'} - Primary Location`,
                type: 'clinic',
                address: 'Demo Address',
                phone: '(02) 0000-0000',
                hours: 'Mon-Sat 8AM-5PM',
                services: ['Consult'],
                distance: '1.0 km',
            }];
    }
}
