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

// Maxicare: Primary Care Clinics (PCCs) and Help Centers
// Data scraped from https://www.maxihealth.com.ph/services/
export const MAXICARE_BRANCHES: Branch[] = [
    // NCR - Primary Care Clinics
    {
        id: 'maxi-pcc-alabang',
        name: 'Maxicare PCC - Alabang Southkey',
        type: 'clinic',
        address: 'G/F Southkey Hub, Northgate Filinvest, Alabang',
        phone: '(02) 7798-7739',
        hours: '24/7 Operations',
        services: ['Consult', 'Lab', 'General Ultrasound', 'OB-Sono', 'ECG', '2D Echo', 'X-Ray', 'Holter', 'Treadmill', 'Animal Bite'],
        distance: '16.5 km',
        specializations: ['Internal Medicine', 'Family Medicine', 'General Medicine', 'Pediatrics', 'ENT', 'OB-GYN', 'Dermatology', 'Ophthalmology', 'Psychiatry', 'Cardiology', 'Endocrinology', 'Gastroenterology', 'Oncology', 'Infectious Disease', 'General Surgery', 'Urology'],
    },
    {
        id: 'maxi-pcc-ayala-north',
        name: 'Maxicare PCC - Ayala North Exchange',
        type: 'clinic',
        address: '2F The Shops, Ayala North Exchange, Makati',
        phone: '(02) 7798-7739',
        hours: '24/7 Operations',
        services: ['Consult', 'Lab', 'General Ultrasound', 'OB-Sono', 'ECG', 'Treadmill', 'X-Ray', '2D Echo', 'Holter', 'Animal Bite'],
        distance: '1.8 km',
        specializations: ['Internal Medicine', 'Family Medicine', 'General Medicine', 'Pediatrics', 'ENT', 'OB-GYN', 'Dermatology', 'Ophthalmology', 'Psychiatry', 'Cardiology', 'Endocrinology', 'Infectious Disease', 'Gastroenterology', 'Nephrology', 'Rheumatology', 'Orthopedics', 'General Surgery'],
    },
    {
        id: 'maxi-pcc-bgc',
        name: 'Maxicare PCC - BGC W City Center',
        type: 'clinic',
        address: 'W City Center, 7th Ave cor 30th St, BGC, Taguig',
        phone: '(02) 7798-7739',
        hours: '6AM - 10PM',
        services: ['Consult', 'Lab', 'X-Ray', 'Ultrasound', 'Dental'],
        distance: '4.5 km',
        specializations: ['Dermatology', 'Ophthalmology', 'Dental Medicine', 'Internal Medicine', 'Pediatrics'],
    },
    {
        id: 'maxi-pcc-bonifacio-tech',
        name: 'Maxicare PCC - Bonifacio Technology Center',
        type: 'clinic',
        address: 'Bonifacio Technology Center, BGC, Taguig',
        phone: '(02) 7798-7739',
        hours: '24/7 Operations',
        services: ['Consult', 'Lab', 'X-Ray', 'CT-Scan', 'MRI', 'General Ultrasound', 'OB-Sono', 'Treadmill', 'ECG', '2D Echo', 'Animal Bite'],
        distance: '4.8 km',
        specializations: ['Internal Medicine', 'Family Medicine', 'OB-GYN', 'ENT', 'Ophthalmology', 'Pediatrics', 'Dermatology', 'Psychiatry', 'Gastroenterology', 'Cardiology', 'Nephrology', 'Pulmonology', 'Endocrinology', 'Rheumatology', 'Urology', 'General Surgery', 'Orthopedics'],
    },
    {
        id: 'maxi-pcc-bridgetowne',
        name: 'Maxicare PCC - Bridgetowne',
        type: 'clinic',
        address: 'Zeta Tower, C5 Road, Ugong Norte, QC',
        phone: '(02) 7798-7739',
        hours: '7AM - 7PM',
        services: ['Consult', 'Lab', 'General Ultrasound', 'OB-Sono', 'ECG', 'Treadmill', 'X-Ray', '2D Echo', 'Animal Bite'],
        distance: '6.2 km',
        specializations: ['Internal Medicine', 'Family Medicine', 'General Medicine', 'Pediatrics', 'ENT', 'OB-GYN', 'Dermatology', 'Ophthalmology', 'Psychiatry', 'Cardiology', 'Endocrinology', 'Gastroenterology', 'Pulmonology', 'Nephrology', 'Rheumatology', 'Infectious Disease', 'Orthopedics', 'Urology', 'General Surgery'],
    },
    {
        id: 'maxi-pcc-centris',
        name: 'Maxicare PCC - Eton Centris',
        type: 'clinic',
        address: 'Ground Floor, Cyberpod 5, Eton Centris, QC',
        phone: '(02) 7908-6925',
        hours: '8AM - 5PM',
        services: ['Lab', 'General Ultrasound', 'OB-Sono', 'ECG', 'Treadmill', '2D Echo', 'X-Ray', 'Holter', 'Animal Bite', 'Physical Therapy'],
        distance: '8.1 km',
        specializations: ['Internal Medicine', 'Family Medicine', 'General Medicine', 'Pediatrics', 'ENT', 'OB-GYN', 'Dermatology', 'Ophthalmology', 'Psychiatry', 'Cardiology', 'Endocrinology', 'Gastroenterology', 'Pulmonology', 'Nephrology', 'Rheumatology', 'Infectious Disease', 'Orthopedics', 'Urology', 'General Surgery', 'Rehab Medicine'],
    },
    {
        id: 'maxi-pcc-cubao',
        name: 'Maxicare PCC - Cubao',
        type: 'clinic',
        address: '20th Ave, Cubao, Quezon City',
        phone: '(02) 7798-7739',
        hours: '8AM - 5PM',
        services: ['Consult', 'Lab', 'ECG', 'General Ultrasound', 'OB-Sono', 'X-Ray', '2D Echo', 'Animal Bite'],
        distance: '5.5 km',
        specializations: ['Internal Medicine', 'Family Medicine', 'General Medicine', 'Pediatrics', 'ENT', 'OB-GYN', 'Dermatology', 'Ophthalmology', 'Psychiatry', 'Cardiology', 'Endocrinology', 'Gastroenterology', 'Pulmonology', 'Nephrology', 'Infectious Disease', 'Urology', 'Orthopedics', 'General Surgery'],
    },
    {
        id: 'maxi-pcc-double-dragon',
        name: 'Maxicare PCC - Double Dragon',
        type: 'clinic',
        address: 'G/F Tower 2, Double Dragon Meridian Park, Pasay',
        phone: '(02) 7798-7739',
        hours: '8AM - 5PM',
        services: ['Consult', 'Lab', 'General Ultrasound', 'OB-Sono', 'ECG', '2D Echo', 'X-Ray', 'Animal Bite'],
        distance: '5.9 km',
        specializations: ['Internal Medicine', 'Family Medicine', 'General Medicine', 'Pediatrics', 'ENT', 'OB-GYN', 'Dermatology', 'Ophthalmology', 'Psychiatry', 'Orthopedics', 'Cardiology', 'Endocrinology', 'Gastroenterology', 'Pulmonology', 'Nephrology', 'Oncology', 'Infectious Disease', 'General Surgery'],
    },
    {
        id: 'maxi-pcc-fairview',
        name: 'Maxicare PCC - Fairview',
        type: 'clinic',
        address: 'Fairview, Quezon City',
        phone: '(02) 7798-7739',
        hours: '8AM - 5PM',
        services: ['Consult', 'Lab', 'General Ultrasound', 'OB-Sono', 'ECG', '2D Echo', 'X-Ray', 'Animal Bite'],
        distance: '15.0 km',
        specializations: ['Internal Medicine', 'Family Medicine', 'General Medicine', 'Pediatrics', 'ENT', 'OB-GYN', 'Dermatology', 'Psychiatry', 'Cardiology', 'Gastroenterology', 'Infectious Disease', 'Orthopedics', 'Urology'],
    },
    {
        id: 'maxi-pcc-hemady',
        name: 'Maxicare PCC - Hemady',
        type: 'clinic',
        address: 'Hemady Square, E. Rodriguez Sr. Ave, QC',
        phone: '(02) 7798-7739',
        hours: '8AM - 5PM',
        services: ['Consult', 'Lab', 'General Ultrasound', 'OB-Sono', 'ECG', '2D Echo', 'X-Ray', 'Animal Bite'],
        distance: '6.5 km',
        specializations: ['General Medicine', 'Internal Medicine', 'Pediatrics', 'ENT', 'OB-GYN', 'Dermatology', 'Ophthalmology', 'Cardiology', 'Nephrology', 'Endocrinology', 'Rheumatology', 'Gastroenterology', 'Infectious Disease', 'General Surgery', 'Orthopedics', 'Urology'],
    },
    {
        id: 'maxi-pcc-robinsons-malabon',
        name: 'Maxicare PCC - Robinsons Malabon',
        type: 'clinic',
        address: 'Robinsons Town Mall Malabon',
        phone: '0917-163-9670',
        hours: '10AM - 6PM',
        services: ['Consult', 'Lab', 'Animal Bite'],
        distance: '10.5 km',
        specializations: ['Internal Medicine', 'Family Medicine', 'General Medicine', 'Pediatrics', 'ENT', 'OB-GYN', 'Dermatology'],
    },
    {
        id: 'maxi-pcc-sm-bf-paranaque',
        name: 'Maxicare PCC - SM BF Parañaque',
        type: 'clinic',
        address: 'SM City BF Parañaque',
        phone: '(02) 7798-7739',
        hours: '10AM - 7PM',
        services: ['Consult', 'Lab', 'General Ultrasound', 'ECG', '2D Echo', 'Animal Bite'],
        distance: '14.2 km',
        specializations: ['General Medicine', 'Internal Medicine', 'Family Medicine', 'Cardiology', 'Pediatrics', 'ENT', 'OB-GYN', 'Ophthalmology', 'Dermatology', 'Pulmonology', 'Nephrology', 'Rheumatology'],
    },
    {
        id: 'maxi-pcc-robinsons-las-pinas',
        name: 'Maxicare PCC - Robinsons Las Piñas',
        type: 'clinic',
        address: 'Robinsons Place Las Piñas',
        phone: '(02) 7798-7739',
        hours: '10AM - 7PM',
        services: ['Consult', 'Lab', 'General Ultrasound', 'OB-Sono', 'ECG', '2D Echo', 'X-Ray', 'Animal Bite'],
        distance: '15.8 km',
        specializations: ['General Medicine', 'Internal Medicine', 'Family Medicine', 'Ophthalmology', 'Psychiatry', 'Pediatrics', 'ENT', 'OB-GYN', 'Dermatology', 'Cardiology', 'Pulmonology', 'Nephrology', 'Urology', 'Rheumatology', 'Infectious Disease'],
    },
    {
        id: 'maxi-pcc-robinsons-metro-east',
        name: 'Maxicare PCC - Robinsons Metro East',
        type: 'clinic',
        address: 'Robinsons Metro East, Pasig',
        phone: '(02) 7798-7739',
        hours: '10AM - 7PM',
        services: ['Consult', 'Lab', 'General Ultrasound', 'OB-Sono', 'ECG', '2D Echo', 'X-Ray', 'Animal Bite'],
        distance: '9.0 km',
        specializations: ['General Medicine', 'Internal Medicine', 'Family Medicine', 'Cardiology', 'Pediatrics', 'ENT', 'OB-GYN', 'Dermatology', 'Ophthalmology', 'Endocrinology', 'General Surgery', 'Nephrology', 'Rheumatology', 'Infectious Disease', 'Orthopedics', 'Urology'],
    },
    {
        id: 'maxi-pcc-robinsons-novaliches',
        name: 'Maxicare PCC - Robinsons Novaliches',
        type: 'clinic',
        address: 'Robinsons Novaliches, QC',
        phone: '(02) 7798-7739',
        hours: '10AM - 7PM',
        services: ['Consult', 'Lab', 'General Ultrasound', 'OB-Sono', 'ECG', '2D Echo', 'X-Ray', 'Animal Bite'],
        distance: '16.0 km',
        specializations: ['General Medicine', 'Internal Medicine', 'Family Medicine', 'Cardiology', 'Pediatrics', 'ENT', 'OB-GYN', 'Dermatology', 'Ophthalmology', 'Pulmonology', 'General Surgery', 'Nephrology', 'Infectious Disease', 'Urology'],
    },
    {
        id: 'maxi-pcc-robinsons-otis',
        name: 'Maxicare PCC - Robinsons Otis',
        type: 'clinic',
        address: 'Robinsons Otis, Manila',
        phone: '(02) 7798-7739',
        hours: '10AM - 7PM',
        services: ['Consult', 'Lab', 'General Ultrasound', 'OB-Sono', 'ECG', '2D Echo', 'X-Ray', 'Animal Bite'],
        distance: '4.0 km',
        specializations: ['General Medicine', 'Internal Medicine', 'Family Medicine', 'Cardiology', 'Pediatrics', 'ENT', 'OB-GYN', 'Dermatology', 'Psychiatry', 'Ophthalmology', 'Pulmonology', 'Nephrology', 'Endocrinology', 'Gastroenterology', 'Urology', 'Infectious Disease', 'General Surgery'],
    },
    {
        id: 'maxi-pcc-vv-soliven',
        name: 'Maxicare PCC - VV Soliven',
        type: 'clinic',
        address: 'VV Soliven Shopping Complex, San Juan',
        phone: '(02) 7798 7788',
        hours: '8AM - 5PM',
        services: ['Consult', 'Lab', 'CT Scan', 'General Ultrasound', 'OB-Sono', 'ECG', '2D Echo', 'X-Ray', 'Animal Bite', 'Treadmill', 'Holter'],
        distance: '5.2 km',
        specializations: ['Consultation', 'Internal Medicine', 'Family Medicine', 'General Medicine', 'Pediatrics', 'ENT', 'OB-GYN', 'Dermatology', 'Ophthalmology', 'Orthopedics', 'General Surgery', 'Psychiatry', 'Cardiology', 'Pulmonology', 'Nephrology', 'Endocrinology', 'Gastroenterology', 'Rheumatology', 'Infectious Disease', 'Urology'],
    },
    // Provincial - Key Hubs
    {
        id: 'maxi-pcc-cebu-business-park',
        name: 'Maxicare PCC - Cebu Business Park',
        type: 'clinic',
        address: 'AppleOne Tower, Mindanao Ave, Cebu City',
        phone: '(032) 260-9067',
        hours: '6AM - 10PM',
        services: ['Consult', 'Lab', 'General Ultrasound', 'OB-Sono', 'ECG', 'Treadmill', 'X-Ray', '2D Echo', 'Holter', 'Animal Bite'],
        distance: '570 km',
        specializations: ['Internal Medicine', 'Family Medicine', 'General Medicine', 'Pediatrics', 'ENT', 'OB-GYN', 'Dermatology', 'Psychiatry', 'Cardiology', 'Endocrinology', 'Infectious Disease', 'Nephrology', 'Gastroenterology', 'Pulmonology', 'Rheumatology'],
    },
    {
        id: 'maxi-pcc-cebu-exchange',
        name: 'Maxicare PCC - Cebu Exchange',
        type: 'clinic',
        address: 'Cebu Exchange Tower, Cebu IT Park',
        phone: '(02) 7798-7739',
        hours: '8AM - 5PM',
        services: ['Consult', 'Lab', 'General Ultrasound', 'OB-Sono', '2D Echo', 'ECG', 'Animal Bite', 'Holter'],
        distance: '572 km',
        specializations: ['Internal Medicine', 'Family Medicine', 'General Medicine', 'Pediatrics', 'ENT', 'OB-GYN', 'Ophthalmology', 'Endocrinology', 'Cardiology', 'Gastroenterology', 'Pulmonology'],
    },
    {
        id: 'maxi-pcc-cebu-skyrise',
        name: 'Maxicare PCC - Cebu Skyrise',
        type: 'clinic',
        address: 'Skyrise 1, Cebu IT Park, Cebu City',
        phone: '(032) 260 9069',
        hours: '8AM - 5PM',
        services: ['Consult', 'Lab', 'General Ultrasound', 'OB-Sono', 'ECG', 'Treadmill', 'Holter', 'X-Ray', '2D Echo', 'Animal Bite'],
        distance: '572 km',
        specializations: ['Internal Medicine', 'Family Medicine', 'General Medicine', 'Pediatrics', 'OB-GYN', 'Cardiology', 'Nephrology'],
    },
    {
        id: 'maxi-pcc-davao',
        name: 'Maxicare PCC - Davao',
        type: 'clinic',
        address: '3/F FTC Tower, Mt. Apo St, Davao City',
        phone: '(082) 293-2446',
        hours: '8AM - 5PM',
        services: ['Consult', 'Lab', 'General Ultrasound', 'OB-Sono', 'ECG', 'Treadmill', '2D Echo', 'X-Ray', 'Animal Bite'],
        distance: '980 km',
        specializations: ['Internal Medicine', 'Family Medicine', 'General Medicine', 'Pediatrics', 'ENT', 'OB-GYN', 'Dermatology', 'Ophthalmology', 'Psychiatry', 'Cardiology', 'Pulmonology', 'Nephrology'],
    },
    {
        id: 'maxi-pcc-cdo',
        name: 'Maxicare PCC - Cagayan De Oro',
        type: 'clinic',
        address: 'Cagayan De Oro City',
        phone: '(088) 864 8804',
        hours: '8AM - 5PM',
        services: ['Consult', 'Lab', 'General Ultrasound', 'OB-Sono', 'ECG', 'Treadmill', 'X-Ray', '2D Echo'],
        distance: '800 km',
        specializations: ['Consultation', 'Animal Bite', 'Internal Medicine', 'Family Medicine', 'General Medicine', 'Pediatrics', 'ENT', 'OB-GYN', 'Dermatology', 'Ophthalmology', 'Psychiatry', 'Cardiology', 'Endocrinology', 'Gastroenterology', 'Pulmonology', 'Nephrology', 'Rheumatology', 'Infectious Disease', 'Orthopedics', 'Urology', 'General Surgery'],
    },
    {
        id: 'maxi-pcc-iloilo',
        name: 'Maxicare PCC - Iloilo',
        type: 'clinic',
        address: 'Iloilo City',
        phone: '(033) 328-7031',
        hours: '8AM - 5PM',
        services: ['Consult', 'Lab', 'General Ultrasound', 'OB-Sono', 'ECG', 'X-Ray', '2D Echo'],
        distance: '450 km',
        specializations: ['Internal Medicine', 'Family Medicine', 'General Medicine', 'Pediatrics', 'ENT', 'OB-GYN', 'Psychiatry', 'Dermatology', 'Nephrology', 'Rheumatology', 'General Surgery'],
    },
    {
        id: 'maxi-pcc-baguio',
        name: 'Maxicare PCC - Baguio',
        type: 'clinic',
        address: 'Baguio City',
        phone: '(074) 661 8833',
        hours: '8AM - 5PM',
        services: ['Consult', 'Lab', 'General Ultrasound', 'ECG', 'X-Ray', '2D Echo', 'Animal Bite'],
        distance: '250 km',
        specializations: ['Internal Medicine', 'General Medicine', 'ENT', 'OB-GYN', 'Pediatrics', 'Ophthalmology', 'General Surgery', 'Cardiology', 'Nephrology', 'Endocrinology'],
    },
    {
        id: 'maxi-pcc-bacolod',
        name: 'Maxicare PCC - Bacolod',
        type: 'clinic',
        address: 'Bacolod City',
        phone: '(034) 458 6715',
        hours: '8AM - 5PM',
        services: ['Consult', 'Lab', 'ECG', 'General Ultrasound', 'OB-Sono', 'X-Ray', '2D Echo', 'Animal Bite'],
        distance: '480 km',
        specializations: ['Internal Medicine', 'General Medicine', 'Family Medicine', 'Pediatrics', 'ENT', 'OB-GYN', 'Psychiatry', 'Ophthalmology', 'Cardiology', 'Nephrology'],
    },
    {
        id: 'maxi-pcc-clark',
        name: 'Maxicare PCC - Clark',
        type: 'clinic',
        address: 'Clark, Pampanga',
        phone: '0917-830-6252',
        hours: '8AM - 5PM',
        services: ['Consult', 'Lab', 'General Ultrasound', 'OB-Sono', 'ECG', '2D Echo', 'X-Ray', 'Animal Bite'],
        distance: '80 km',
        specializations: ['Internal Medicine', 'Family Medicine', 'General Medicine', 'Pediatrics', 'ENT', 'OB-GYN', 'Ophthalmology', 'Psychiatry', 'Cardiology', 'Gastroenterology', 'Nephrology', 'General Surgery'],
    },
    {
        id: 'maxi-pcc-starmills',
        name: 'Maxicare PCC - Robinsons Starmills',
        type: 'clinic',
        address: 'Robinsons Starmills, Pampanga',
        phone: '0917-109-6651',
        hours: '10AM - 7PM',
        services: ['Consult', 'Lab', 'General Ultrasound', 'OB-Sono', 'ECG', '2D Echo', 'X-Ray', 'Animal Bite'],
        distance: '75 km',
        specializations: ['Internal Medicine', 'Family Medicine', 'General Medicine', 'Pediatrics', 'ENT', 'OB-GYN', 'Cardiology', 'Ophthalmology', 'Gastroenterology', 'General Surgery', 'Orthopedics'],
    },
    // Help Centers (Hospital Based)
    {
        id: 'maxi-hc-makati-med',
        name: 'Maxicare Helpdesk - Makati Med',
        type: 'hospital',
        address: 'Makati Medical Center, Amorsolo St',
        phone: '(02) 8888-8999',
        hours: 'Mon-Sat 8AM-5PM',
        services: ['LOA Issuance', 'Admissions Assistance'],
        distance: '2.0 km',
    },
    {
        id: 'maxi-hc-st-lukes-bgc',
        name: 'Maxicare Helpdesk - St. Luke\'s BGC',
        type: 'hospital',
        address: 'St. Luke\'s Medical Center, BGC',
        phone: '(02) 8789-7700',
        hours: 'Mon-Sat 8AM-5PM',
        services: ['LOA Issuance', 'Admissions Assistance'],
        distance: '4.2 km',
    },
    {
        id: 'maxi-hc-medical-city',
        name: 'Maxicare Helpdesk - The Medical City',
        type: 'hospital',
        address: 'Ortigas Ave, Pasig',
        phone: '(02) 8988-1000',
        hours: 'Mon-Sat 7AM-7PM',
        services: ['LOA Issuance', 'Admissions Assistance'],
        distance: '3.5 km',
    }
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
