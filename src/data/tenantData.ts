// Helper for dynamic dates
const TODAY = new Date();
const addDays = (days: number) => {
    const d = new Date(TODAY);
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const subDays = (days: number) => {
    const d = new Date(TODAY);
    d.setDate(d.getDate() - days);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ==========================================
// ORG 1: METRO GENERAL HOSPITAL
// ==========================================
export const METRO_DATA: any = {
    patients: [
        // Patient 1: Chronic Care (High complexity)
        {
            userProfile: {
                id: 'p1',
                name: 'Juan Dela Cruz',
                memberId: '1029384756',
                company: 'MERALCO INC.',
                validity: '01/2023 - 12/2024',
                membershipType: 'Gold Member',
                emergencyContact: { name: 'Maria Dela Cruz', relation: 'Spouse', phone: '0917-888-0000' },
                philHealth: {
                    membershipNumber: '12-345678901-2',
                    status: 'Active',
                    category: 'Private Sector Employee',
                    lastContribution: 'Jan 2024',
                    konsultaProvider: 'Metro General Hospital - Primary Care',
                    fpeStatus: 'Completed',
                    mbl: '₱ 50,000.00',
                    mblUsed: '₱ 1,500.00',
                    benefitCategories: [
                        { id: 'ph1', name: 'Konsulta Packages', limit: '₱ 5,000.00', used: '₱ 1,500.00', icon: '🩺' },
                        { id: 'ph2', name: 'In-patient Subsidy', limit: '₱ 30,000.00', used: '₱ 0.00', icon: '🏥' },
                        { id: 'ph3', name: 'Maternity Package', limit: '₱ 15,000.00', used: '₱ 0.00', icon: '👶' }
                    ]
                },
                hmoCards: [
                    {
                        id: 'hmo-1',
                        provider: 'Maxicare',
                        memberNo: '1122-3344-55',
                        planType: 'Platinum Plus',
                        validity: '2025-12-31',
                        coverageAmount: '₱ 200,000.00',
                        usedAmount: '₱ 15,400.00',
                        mbl: '₱ 200,000.00',
                        mblUsed: '₱ 15,400.00',
                        status: 'Active',
                        benefitCategories: [
                            { id: 'b1', name: 'Dental Care', limit: '₱ 5,000.00', used: '₱ 0.00', icon: '🦷' },
                            { id: 'b2', name: 'Optical Allowance', limit: '₱ 2,500.00', used: '₱ 2,500.00', icon: '👓' },
                            { id: 'b3', name: 'Mental Health', limit: '₱ 10,000.00', used: '₱ 1,200.00', icon: '🧠' },
                            { id: 'b4', name: 'ER Coverage', limit: '₱ 100,000.00', used: '₱ 0.00', icon: '🚑' },
                        ]
                    }
                ],
                wellnessBenefits: [
                    { id: 'w-1', type: 'Gym Reimbursement', balance: '₱ 2,500.00', description: 'Monthly fitness allowance', validity: 'Monthly' }
                ]
            },
            dependents: [
                { id: 'd-1', name: 'Maria Dela Cruz', relation: 'Spouse', birthDate: '1992-05-15', idNumber: 'DEP-101' },
                { id: 'd-2', name: 'Jun Dela Cruz', relation: 'Son', birthDate: '2018-10-20', idNumber: 'DEP-102' }
            ],
            appointments: [
                { id: '101', doctor: 'Dr. Ricardo Santos', specialty: 'Cardiology', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), time: '10:00 AM', status: 'Upcoming', type: 'In-Person', location: 'Heart Center, 3F' },
                { id: '102', doctor: 'Dr. Albert Go', specialty: 'Internal Medicine', date: addDays(14), time: '02:00 PM', status: 'Upcoming', type: 'Teleconsult' },
                { id: '103', doctor: 'Dr. Maria Clara Reyes', specialty: 'Pediatrics', date: subDays(45), time: '11:00 AM', status: 'Completed', type: 'In-Person', location: 'OPD, 2F' },
            ],
            medications: [
                { id: 'm1', name: 'Rosuvastatin', dosage: '20mg', instruction: 'Once daily at bedtime', remaining: 28, refillDate: addDays(25), status: 'Active' },
                { id: 'm2', name: 'Clopidogrel', dosage: '75mg', instruction: 'Once daily after breakfast', remaining: 5, refillDate: addDays(3), status: 'Low Stock' },
                { id: 'm3', name: 'Metformin', dosage: '500mg', instruction: 'Twice a day with meals', remaining: 60, refillDate: addDays(58), status: 'Active' },
            ],
            results: [
                { id: 'r1', title: '2D Echo with Doppler', type: 'Imaging', date: subDays(4), doctor: 'Dr. Ricardo Santos', status: 'Final', isCritical: false },
                { id: 'r2', title: 'HbA1c', type: 'Laboratory', date: subDays(4), doctor: 'Dr. Ricardo Santos', status: 'Final', isCritical: true, hasFollowUp: false },
                { id: 'r3', title: 'CBC', type: 'Laboratory', date: subDays(3), doctor: 'Dr. Ricardo Santos', status: 'Final', isCritical: false },
                { id: 'r4', title: 'Lipid Panel', type: 'Laboratory', date: subDays(3), doctor: 'Dr. Ricardo Santos', status: 'Final', isCritical: false },
                { id: 'r5', title: 'Chest X-Ray', type: 'Imaging', date: subDays(5), doctor: 'Dr. Ricardo Santos', status: 'Final', isCritical: false },
            ],
            notifications: [
                { id: 'n1', title: 'Appointment Reminder', message: 'You have a Cardiology appointment in 2 days.', date: '2 hours ago', read: false, type: 'info', link: '/appointments' },
                { id: 'n2', title: 'Critical Result', message: 'Your HbA1c results require attention.', date: '3 days ago', read: false, type: 'warning', link: '/results' },
            ],
            invoices: [
                { id: 'INV-001', date: subDays(2), description: 'Cardiology Consultation', provider: 'Dr. Ricardo Santos', amount: 1500, status: 'Pending', type: 'Consultation' },
                { id: 'INV-002', date: subDays(5), description: 'HbA1c Laboratory', provider: 'Metro Lab', amount: 850, status: 'Paid', type: 'Laboratory' }
            ],
            procedures: [
                { id: 'proc-1', category: 'Radiology', name: 'Chest X-Ray', date: subDays(45), time: '11:00 AM', location: 'Radiology Rm 2, 1F', status: 'Completed' }
            ],
            loaRequests: [
                { id: 'loa-1', type: 'Laboratory & Diagnostics', provider: 'Metro Lab', date: subDays(5), status: 'Approved', amount: '₱ 850.00' }
            ],
            claims: [
                { id: 'clm-1', type: 'Optical Reimbursement', provider: 'Executive Optical', date: subDays(12), amount: '₱ 2,500.00', status: 'Processed', reimbursementMethod: 'Bank Transfer' }
            ],
            doctorRequests: [
                { id: 'dreq-mg1', type: 'Laboratory', title: 'Lipid Profile Panel', doctor: 'Dr. Ricardo Santos', date: subDays(4), status: 'Completed', priority: 'Routine', notes: 'TC 198, TG 145, LDL 118, HDL 42. LDL slightly elevated — continue statin.', homeCareEligible: true, specimenType: 'Blood' },
                { id: 'dreq-mg2', type: 'Laboratory', title: 'HbA1c (Glycosylated Hemoglobin)', doctor: 'Dr. Ricardo Santos', date: subDays(6), status: 'Completed', priority: 'Routine', notes: 'Result: 6.1% — pre-diabetic range. Metformin started.', homeCareEligible: true, specimenType: 'Blood' },
                { id: 'dreq-mg3', type: 'Imaging', title: 'Chest X-Ray (PA/Lateral)', doctor: 'Dr. Ricardo Santos', date: subDays(5), status: 'Completed', priority: 'Routine', facility: 'Metro General - Main', notes: 'Heart size normal. Lungs clear. No acute findings.', homeCareEligible: false },
                { id: 'dreq-mg4', type: 'Laboratory', title: 'Complete Blood Count (CBC)', doctor: 'Dr. Ricardo Santos', date: subDays(4), status: 'Completed', priority: 'Urgent', notes: 'Hgb 14.2, Hct 42%, WBC 7.2, Plt 245 — all within normal limits.', homeCareEligible: true, specimenType: 'Blood' },
                { id: 'dreq-mg5', type: 'Procedure', title: '2D Echo with Doppler', doctor: 'Dr. Ricardo Santos', date: subDays(6), status: 'Completed', priority: 'Routine', facility: 'Metro General - Heart Center', notes: 'EF 55%, no regional wall motion abnormality.', homeCareEligible: false },
            ]
        },
        // Patient 2: Prenatal Care (Mid complexity)
        {
            userProfile: {
                id: 'p2',
                name: 'Sofia Garcia',
                memberId: '2049586731',
                company: 'GLOBE TELECOM',
                validity: '06/2023 - 06/2025',
                membershipType: 'Platinum Member',
                emergencyContact: { name: 'Luis Garcia', relation: 'Husband', phone: '0918-123-4455' },
                philHealth: {
                    membershipNumber: '22-334455667-1',
                    status: 'Active',
                    category: 'Private Sector Employee',
                    lastContribution: 'Feb 2024',
                    konsultaProvider: 'HealthFirst North Center',
                    fpeStatus: 'Completed',
                    mbl: '₱ 50,000.00',
                    mblUsed: '₱ 2,500.00',
                    benefitCategories: [
                        { id: 'ph-s1', name: 'Maternity Package', limit: '₱ 25,000.00', used: '₱ 2,500.00', icon: '👶' }
                    ]
                },
                hmoCards: [
                    { id: 'hmo-2', provider: 'Intellicare', memberNo: 'G-123456789', planType: 'Corporate Gold', validity: '2025-06-30', coverageAmount: '₱ 150,000.00', usedAmount: '₱ 45,000.00', status: 'Active' }
                ],
                wellnessBenefits: [
                    { id: 'w-2', type: 'Maternity Fund', balance: '₱ 20,000.00', description: 'Prenatal & delivery support', validity: '2025-06-30' }
                ]
            },
            dependents: [],
            appointments: [
                { id: '104', doctor: 'Dr. Anna Santos', specialty: 'OB-GYN', date: addDays(4), time: '09:30 AM', status: 'Upcoming', type: 'In-Person', location: 'Women\'s Clinic, 2F' },
            ],
            medications: [
                { id: 'm4', name: 'Prenatal Vitamins', dosage: '1 tab', instruction: 'Once daily', remaining: 90, refillDate: addDays(85), status: 'Active' },
            ],
            results: [
                { id: 'r4', title: 'Maternal Serum Screening', type: 'Laboratory', date: subDays(10), doctor: 'Dr. Santos', status: 'Final' },
            ],
            notifications: [
                { id: 'n4', title: 'Checkup Due', message: 'Your prenatal checkup is in 4 days.', date: 'Yesterday', read: false, type: 'info', link: '/appointments' },
            ],
            invoices: [],
            procedures: [
                { id: 'proc-2', category: 'Diagnostics', name: 'Congenital Anomaly Scan', date: addDays(30), time: '10:00 AM', location: 'Imaging Center', status: 'Scheduled' }
            ],
            loaRequests: [],
            doctorRequests: [
                { id: 'dreq-mg6', type: 'Laboratory', title: 'Maternal Serum AFP/hCG', doctor: 'Dr. Santos', date: subDays(2), status: 'Pending', priority: 'Routine', notes: 'Second trimester screening.', homeCareEligible: true, specimenType: 'Blood' },
                { id: 'dreq-mg7', type: 'Laboratory', title: 'Urinalysis with Culture', doctor: 'Dr. Santos', date: subDays(2), status: 'Pending', priority: 'Routine', notes: 'Rule out UTI. Midstream clean catch.', homeCareEligible: true, specimenType: 'Urine' },
            ]
        }
    ]
};

// ==========================================
// ORG 2: MERALCO WELLNESS
// ==========================================
export const MERALCO_DATA: any = {
    patients: [
        // Patient 1: Corporate Executive
        {
            userProfile: {
                id: 'p3',
                name: 'Ricardo Meralco',
                memberId: '9988776655',
                company: 'MERALCO CORP',
                validity: '05/2022 - 05/2025',
                membershipType: 'Platinum Corporate',
                emergencyContact: { name: 'Elena Meralco', relation: 'Sister', phone: '0922-111-2233' },
                philHealth: {
                    membershipNumber: '99-887766554-3',
                    status: 'Active',
                    category: 'Government Employee',
                    lastContribution: 'Dec 2023',
                    konsultaProvider: 'Meralco Wellness Center',
                    fpeStatus: 'Completed',
                    mbl: '₱ 100,000.00',
                    mblUsed: '₱ 0.00',
                    benefitCategories: [
                        { id: 'ph-r1', name: 'Executive Check-up', limit: '₱ 20,000.00', used: '₱ 0.00', icon: '🩺' }
                    ]
                },
                hmoCards: [
                    { id: 'hmo-3', provider: 'General Shield', memberNo: 'EX-009988', planType: 'Executive Platinum', validity: '2025-05-31', coverageAmount: '₱ 500,000.00', usedAmount: '₱ 0.00', mbl: '₱ 500,000.00', mblUsed: '₱ 0.00', status: 'Active' },
                    { id: 'hmo-4', provider: 'Global Health', memberNo: 'GH-991122', planType: 'International Elite', validity: '2026-12-31', coverageAmount: '₱ 1,000,000.00', usedAmount: '₱ 12,000.00', mbl: '₱ 1,000,000.00', mblUsed: '₱ 12,000.00', status: 'Active' }
                ],
                wellnessBenefits: [
                    { id: 'w-3', type: 'Executive Check-up', balance: '1 Remaining', description: 'Annual comprehensive screening', validity: 'Annual' },
                    { id: 'w-4', type: 'Mental Wellness Fund', balance: '₱ 15,000.00', description: 'Consultations & therapy', validity: '2025-05-31' }
                ]
            },
            dependents: [
                { id: 'd-3', name: 'Elena Meralco', relation: 'Sister', birthDate: '1985-03-12', idNumber: 'DEP-201' }
            ],
            appointments: [
                { id: '201', doctor: 'Dr. Sarah Lee', specialty: 'Occupational Health', date: addDays(5), time: '09:00 AM', status: 'Upcoming', type: 'In-Person', location: 'Wellness Center, G/F' },
                { id: '202', doctor: 'Nutritionist Marco', specialty: 'Dietary', date: addDays(10), time: '01:00 PM', status: 'Upcoming', type: 'Teleconsult' },
            ],
            medications: [
                { id: 'm5', name: 'Multivitamins', dosage: '1 tab', instruction: 'Daily with breakfast', remaining: 15, refillDate: addDays(12), status: 'Active' },
            ],
            results: [
                { id: 'r5', title: 'Annual Physical Exam Report', type: 'Laboratory', date: subDays(180), doctor: 'Dr. Lee', status: 'Final' },
            ],
            notifications: [
                { id: 'n5', title: 'Drug Test Result', message: 'Your recent screening results are available.', date: '1 hour ago', read: false, type: 'info', link: '/results' },
            ],
            invoices: [
                { id: 'INV-101', date: subDays(180), description: 'Annual Physical Exam', provider: 'Wellness Center', amount: 0, status: 'Paid', type: 'Procedure' },
            ],
            procedures: [],
            loaRequests: [],
            doctorRequests: [
                { id: 'dreq-mw1', type: 'Laboratory', title: 'Fasting Blood Sugar (FBS)', doctor: 'Dr. Sarah Lee', date: subDays(2), status: 'Pending', priority: 'Routine', notes: 'Annual wellness screening follow-up.', homeCareEligible: true, specimenType: 'Blood' },
                { id: 'dreq-mw2', type: 'Laboratory', title: 'Lipid Panel', doctor: 'Dr. Sarah Lee', date: subDays(2), status: 'Pending', priority: 'Routine', notes: 'Part of annual physical exam.', homeCareEligible: true, specimenType: 'Blood' },
            ]
        },
        // Patient 2: New Hire
        {
            userProfile: {
                id: 'p4',
                name: 'Lisa Tan',
                memberId: '1122334455',
                company: 'MERALCO INC.',
                validity: '01/2024 - 01/2025',
                membershipType: 'Staff Member',
                emergencyContact: { name: 'Kevin Tan', relation: 'Brother', phone: '0919-555-6677' },
                philHealth: {
                    membershipNumber: '11-223344556-7',
                    status: 'Active',
                    category: 'Private Sector Employee',
                    lastContribution: 'Jan 2024',
                    konsultaProvider: 'Metro General Hospital - Primary Care',
                    fpeStatus: 'Pending'
                },
                hmoCards: [
                    { id: 'hmo-5', provider: 'Maxicare', memberNo: '1122-3344-99', planType: 'Basis Silver', validity: '2025-01-15', coverageAmount: '₱ 60,000.00', usedAmount: '₱ 5,000.00', status: 'Active' }
                ],
                wellnessBenefits: [
                    { id: 'w-5', type: 'Optical Allowance', balance: '₱ 3,000.00', description: 'Frames and lenses reimbursement', validity: 'Bi-annual' }
                ]
            },
            dependents: [],
            appointments: [],
            medications: [],
            results: [],
            notifications: [],
            invoices: [],
            procedures: [],
            loaRequests: [],
            doctorRequests: []
        }
    ]
};

// ==========================================
// ORG 3: HEALTHFIRST
// ==========================================
export const HEALTHFIRST_DATA: any = {
    patients: [
        // Patient 1: Community Member
        {
            userProfile: {
                id: 'p5',
                name: 'Anna Santos',
                memberId: '3344556677',
                company: 'SELF-EMPLOYED',
                validity: '01/2024 - 12/2024',
                membershipType: 'Community Plus',
                emergencyContact: { name: 'Luis Santos', relation: 'Husband', phone: '0908-777-6655' },
                philHealth: {
                    membershipNumber: '33-445566778-9',
                    status: 'Updating',
                    category: 'Individually Paying',
                    konsultaProvider: 'HealthFirst Community Clinic',
                    fpeStatus: 'Not Registered',
                    mbl: '₱ 15,000.00',
                    mblUsed: '₱ 0.00',
                    benefitCategories: []
                },
                hmoCards: [],
                wellnessBenefits: [
                    { id: 'w-6', type: 'Community Health Grant', balance: '₱ 5,000.00', description: 'Localized healthcare support', validity: 'N/A' }
                ]
            },
            dependents: [],
            appointments: [
                { id: '301', doctor: 'Dr. Michael Tan', specialty: 'Pediatrics', date: addDays(1), time: '03:00 PM', status: 'Upcoming', type: 'In-Person', location: 'Clinic 1' },
            ],
            medications: [],
            results: [],
            notifications: [
                { id: 'n6', title: 'Vaccine Schedule', message: 'Measles vaccine due next week.', date: '1 day ago', read: false, type: 'warning', link: '/immunization' },
            ],
            invoices: [],
            procedures: [],
            loaRequests: [],
            doctorRequests: [
                { id: 'dreq-hf1', type: 'Laboratory', title: 'Newborn Screening Panel', doctor: 'Dr. Michael Tan', date: subDays(1), status: 'Pending', priority: 'Urgent', notes: 'Mandatory newborn metabolic screening.', homeCareEligible: true, specimenType: 'Blood' },
            ]
        }
    ]
};

// ==========================================
// ORG 4: MAXICARE
// ==========================================
export const MAXICARE_DATA: any = {
    patients: [
        // Patient 1: PRIMA by MaxiHealth member (Individual Plan)
        {
            userProfile: {
                id: 'p-mc1',
                name: 'Andrea Reyes',
                memberId: 'MC-2024-88001',
                company: 'SELF-EMPLOYED',
                validity: '01/2025 - 12/2025',
                membershipType: 'PRIMA Elite',
                emergencyContact: { name: 'Paolo Reyes', relation: 'Husband', phone: '0917-555-1234' },
                philHealth: {
                    membershipNumber: '44-556677889-0',
                    status: 'Active',
                    category: 'Individually Paying',
                    lastContribution: 'Jan 2025',
                    konsultaProvider: 'Maxicare PCC',
                    fpeStatus: 'Completed',
                    mbl: '₱ 50,000.00',
                    mblUsed: '₱ 0.00',
                    benefitCategories: [
                        { id: 'ph-mc1', name: 'Konsulta Packages', limit: '₱ 5,000.00', used: '₱ 0.00', icon: '🩺' }
                    ]
                },
                hmoCards: [
                    {
                        id: 'hmo-mc1',
                        provider: 'Maxicare',
                        memberNo: 'MC-PRIMA-88001',
                        planType: 'PRIMA Elite',
                        validity: '2025-12-31',
                        coverageAmount: '₱ 100,000.00',
                        usedAmount: '₱ 8,500.00',
                        mbl: '₱ 100,000.00',
                        mblUsed: '₱ 8,500.00',
                        status: 'Active',
                        benefitCategories: [
                            { id: 'b-mc1', name: 'Dental', limit: '₱ 5,000.00', used: '₱ 0.00', icon: '🦷' },
                            { id: 'b-mc2', name: 'Optical', limit: '₱ 3,000.00', used: '₱ 0.00', icon: '👓' },
                            { id: 'b-mc3', name: 'Mental Health', limit: '₱ 10,000.00', used: '₱ 2,500.00', icon: '🧠' },
                            { id: 'b-mc4', name: 'ER Coverage', limit: '₱ 50,000.00', used: '₱ 0.00', icon: '🚑' }
                        ]
                    }
                ],
                wellnessBenefits: [
                    { id: 'w-mc1', type: 'Annual Check-up', balance: '1 Remaining', description: 'Comprehensive health screening at any PCC', validity: 'Annual' }
                ]
            },
            dependents: [
                { id: 'd-mc1', name: 'Paolo Reyes', relation: 'Husband', birthDate: '1988-11-03', idNumber: 'DEP-MC01' }
            ],
            appointments: [
                { id: 'mc-101', doctor: 'Dr. Carmela Ong', specialty: 'Internal Medicine', date: addDays(7), time: '10:00 AM', status: 'Upcoming', type: 'In-Person', location: 'Maxicare PCC - Ayala North Exchange' },
                { id: 'mc-102', doctor: 'Dr. Ramon Bautista', specialty: 'Cardiology', date: addDays(14), time: '02:00 PM', status: 'Upcoming', type: 'Teleconsult' },
                { id: 'mc-105', doctor: 'Dr. Carmela Ong', specialty: 'Laboratory', date: addDays(5), time: '07:30 AM', status: 'Upcoming', type: 'HomeCare', location: 'Maxicare PCC - BGC' },
                { id: 'mc-106', doctor: 'Dr. Ramon Bautista', specialty: 'Cardiology', date: addDays(9), time: '08:00 AM', status: 'Upcoming', type: 'Procedure', location: 'Maxicare PCC - Ayala North Exchange' },
                { id: 'mc-103', doctor: 'Dr. Carmela Ong', specialty: 'Internal Medicine', date: subDays(21), time: '09:00 AM', status: 'Completed', type: 'In-Person', location: 'Maxicare PCC - Ayala North Exchange' },
                { id: 'mc-104', doctor: 'Dr. Ramon Bautista', specialty: 'Cardiology', date: subDays(10), time: '03:00 PM', status: 'Completed', type: 'Teleconsult' },
                { id: 'mc-107', doctor: 'Dr. Carmela Ong', specialty: 'Laboratory', date: subDays(7), time: '08:00 AM', status: 'Completed', type: 'HomeCare', location: 'Maxicare PCC - BGC' },
                { id: 'mc-108', doctor: 'Dr. Carmela Ong', specialty: 'Laboratory', date: subDays(30), time: '08:00 AM', status: 'Completed', type: 'Procedure', location: 'Maxicare PCC - Ayala North Exchange' },
            ],
            medications: [
                { id: 'm-mc1', name: 'Losartan', dosage: '50mg', instruction: 'Once daily in the morning', remaining: 60, refillDate: addDays(55), status: 'Active' },
                { id: 'm-mc2', name: 'Vitamin D3', dosage: '1000IU', instruction: 'Once daily after breakfast', remaining: 75, refillDate: addDays(70), status: 'Active' },
                { id: 'm-mc3', name: 'Amlodipine', dosage: '5mg', instruction: 'Once daily in the evening', remaining: 28, refillDate: addDays(26), status: 'Active' }
            ],
            results: [
                { id: 'r-mc1', title: 'CBC', type: 'Laboratory', date: subDays(21), doctor: 'Dr. Carmela Ong', status: 'Final', isCritical: false },
                { id: 'r-mc2', title: 'Lipid Panel', type: 'Laboratory', date: subDays(20), doctor: 'Dr. Carmela Ong', status: 'Final', isCritical: false },
                { id: 'r-mc3', title: 'FBS (Fasting Blood Sugar)', type: 'Laboratory', date: subDays(21), doctor: 'Dr. Carmela Ong', status: 'Final', isCritical: false },
                { id: 'r-mc4', title: 'HbA1c', type: 'Laboratory', date: subDays(19), doctor: 'Dr. Carmela Ong', status: 'Final', isCritical: true, hasFollowUp: true },
                { id: 'r-mc5', title: 'Urinalysis', type: 'Laboratory', date: subDays(22), doctor: 'Dr. Carmela Ong', status: 'Final', isCritical: false },
                { id: 'r-mc11', title: 'Pelvic Ultrasound', type: 'Imaging', date: subDays(8), doctor: 'Dr. Ramon Bautista', status: 'Final', isCritical: false },
                { id: 'r-mc12', title: 'Thyroid Function Test (FT3, FT4, TSH)', type: 'Laboratory', date: subDays(1), doctor: 'Dr. Carmela Ong', status: 'Pending', isCritical: false },
                { id: 'r-mc13', title: 'Fecalysis with Occult Blood', type: 'Laboratory', date: subDays(1), doctor: 'Dr. Carmela Ong', status: 'Pending', isCritical: false },
                { id: 'r-mc14', title: 'Kidney Function Panel', type: 'Laboratory', date: subDays(7), doctor: 'Dr. Carmela Ong', status: 'Final', isCritical: false },
            ],
            notifications: [
                { id: 'n-mc1', title: 'Appointment Reminder', message: 'You have an Internal Medicine appointment in 7 days.', date: '2 hours ago', read: false, type: 'info', link: '/appointments' },
                { id: 'n-mc2', title: 'Lab Results Ready', message: 'Your CBC and Lipid Panel results are now available.', date: '1 day ago', read: false, type: 'info', link: '/results' },
                { id: 'n-mc6', title: 'HomeCare Scheduled', message: 'Your home specimen collection is confirmed for ' + addDays(5) + ' at 7:30 AM.', date: '4 hours ago', read: false, type: 'success', link: '/appointments/history' },
                { id: 'n-mc7', title: 'Procedure Booking Confirmed', message: 'Cardiac Stress Test scheduled at Maxicare PCC - Ayala on ' + addDays(9) + '.', date: '1 day ago', read: false, type: 'success', link: '/appointments/history' },
                { id: 'n-mc8', title: 'LOA Approved', message: 'Your Letter of Authorization for Cardiac Stress Test has been approved.', date: '2 days ago', read: true, type: 'info', link: '/benefits' },
                { id: 'n-mc9', title: 'Care Plan Updated', message: 'Dr. Ong has updated your Hypertension Management care plan.', date: '3 days ago', read: true, type: 'info', link: '/health' }
            ],
            invoices: [
                { id: 'INV-MC001', date: subDays(3), description: 'Consultation Fee', provider: 'Dr. Carmela Ong', amount: 800, status: 'Paid', type: 'Consultation' },
                { id: 'INV-MC002', date: subDays(5), description: 'Lab Fees', provider: 'Maxicare Lab', amount: 1200, status: 'Pending', type: 'Laboratory' }
            ],
            procedures: [
                { id: 'proc-mc1', category: 'Laboratory', name: 'Annual Check-up Package', date: subDays(30), time: '8:00 AM', location: 'Maxicare PCC - BGC', status: 'Completed' },
                { id: 'proc-mc4', category: 'Cardiovascular', name: 'Cardiac Stress Test (Treadmill)', date: addDays(9), time: '8:00 AM', location: 'Maxicare PCC - Ayala North Exchange', status: 'Scheduled' },
                { id: 'proc-mc5', category: 'Imaging', name: 'Pelvic Ultrasound', date: addDays(18), time: '9:30 AM', location: 'Maxicare PCC - BGC', status: 'Scheduled' },
                { id: 'proc-mc6', category: 'Laboratory', name: 'Kidney Function Panel (Home Collection)', date: addDays(5), time: '7:30 AM', location: 'HomeCare', status: 'Scheduled' }
            ],
            loaRequests: [
                { id: 'loa-mc1', type: 'Annual Physical Exam', provider: 'Maxicare PCC - BGC', date: subDays(30), status: 'Approved', amount: '₱ 0.00' },
                { id: 'loa-mc3', type: 'Cardiac Stress Test', provider: 'Maxicare PCC - Ayala North Exchange', date: subDays(2), status: 'Approved', amount: '₱ 3,500.00' },
                { id: 'loa-mc4', type: 'Imaging - Pelvic Ultrasound', provider: 'Maxicare PCC - BGC', date: subDays(1), status: 'Pending', amount: '₱ 2,800.00' },
                { id: 'loa-mc5', type: 'Laboratory - Kidney Function Panel', provider: 'Maxicare PCC - BGC (HomeCare)', date: subDays(3), status: 'Approved', amount: '₱ 1,200.00' }
            ],
            claims: [
                { id: 'clm-mc1', type: 'Dental Reimbursement', provider: 'Smile Dental Clinic', date: subDays(60), amount: '₱ 3,500.00', status: 'Processed', reimbursementMethod: 'Bank Transfer' }
            ],
            doctorRequests: [
                { id: 'dreq-mc1', type: 'Laboratory', title: 'Kidney Function Test (BUN, Creatinine)', doctor: 'Dr. Carmela Ong', date: subDays(1), status: 'Pending', priority: 'Routine', notes: 'Baseline renal panel for Losartan monitoring.', homeCareEligible: true, specimenType: 'Blood' },
                { id: 'dreq-mc2', type: 'Laboratory', title: 'Thyroid Function Test (FT3, FT4, TSH)', doctor: 'Dr. Carmela Ong', date: subDays(1), status: 'In Progress', priority: 'Routine', notes: 'Specimen collected. Awaiting processing.', homeCareEligible: true, specimenType: 'Blood' },
                { id: 'dreq-mc3', type: 'Imaging', title: 'Pelvic Ultrasound', doctor: 'Dr. Ramon Bautista', date: subDays(11), status: 'Scheduled', priority: 'Routine', facility: 'Maxicare PCC - BGC', notes: 'Annual wellness screening per Dr. Ong referral.', homeCareEligible: false },
                { id: 'dreq-mc4', type: 'Laboratory', title: 'HbA1c', doctor: 'Dr. Carmela Ong', date: subDays(23), status: 'Completed', priority: 'Routine', notes: 'Result: 5.8% — pre-diabetic borderline. Lifestyle modification recommended.', homeCareEligible: true, specimenType: 'Blood' },
                { id: 'dreq-mc5', type: 'Laboratory', title: 'Complete Blood Count (CBC)', doctor: 'Dr. Carmela Ong', date: subDays(23), status: 'Completed', priority: 'Urgent', notes: 'Hgb 13.1, Hct 39.5%, WBC 6.8, Plt 268 — all within normal limits.', homeCareEligible: true, specimenType: 'Blood' },
                { id: 'dreq-mc6', type: 'Laboratory', title: 'Fasting Blood Sugar (FBS)', doctor: 'Dr. Carmela Ong', date: subDays(23), status: 'Completed', priority: 'Routine', notes: 'Result: 95 mg/dL — normal fasting glucose.', homeCareEligible: true, specimenType: 'Blood' },
                { id: 'dreq-mc7', type: 'Laboratory', title: 'Lipid Profile Panel', doctor: 'Dr. Carmela Ong', date: subDays(23), status: 'Completed', priority: 'Routine', notes: 'TC 218, TG 156, LDL 142, HDL 45. LDL borderline high.', homeCareEligible: true, specimenType: 'Blood' },
                { id: 'dreq-mc8', type: 'Laboratory', title: 'Urinalysis with Culture & Sensitivity', doctor: 'Dr. Carmela Ong', date: subDays(23), status: 'Completed', priority: 'Routine', notes: 'Normal urinalysis. No proteinuria or UTI.', homeCareEligible: true, specimenType: 'Urine' },
                { id: 'dreq-mc9', type: 'Laboratory', title: 'Fecalysis with Occult Blood', doctor: 'Dr. Carmela Ong', date: subDays(1), status: 'In Progress', priority: 'Routine', notes: 'Specimen collected. Awaiting analysis.', homeCareEligible: true, specimenType: 'Stool' },
                { id: 'dreq-mc10', type: 'Laboratory', title: 'Throat Swab Culture', doctor: 'Dr. Carmela Ong', date: subDays(1), status: 'Pending', priority: 'Urgent', notes: 'Recurrent sore throat — rule out Group A Streptococcus.', homeCareEligible: true, specimenType: 'Swab' },
                { id: 'dreq-mc11', type: 'Laboratory', title: 'Urine Microalbumin (ACR)', doctor: 'Dr. Carmela Ong', date: subDays(1), status: 'Pending', priority: 'Routine', notes: 'Annual diabetic nephropathy screening.', homeCareEligible: true, specimenType: 'Urine' },
                { id: 'dreq-mc12', type: 'Procedure', title: 'Cardiac Stress Test (Treadmill)', doctor: 'Dr. Ramon Bautista', date: subDays(11), status: 'Scheduled', priority: 'Routine', facility: 'Maxicare PCC - Makati', notes: 'Baseline cardiovascular assessment.', homeCareEligible: false },
            ]
        },
        // Patient 2: Corporate member (LifesavER plan)
        {
            userProfile: {
                id: 'p-mc2',
                name: 'Mark Anthony Lim',
                memberId: 'MC-2025-44002',
                company: 'ACCENTURE PH',
                validity: '03/2025 - 03/2026',
                membershipType: 'Corporate Gold',
                emergencyContact: { name: 'Grace Lim', relation: 'Wife', phone: '0918-222-3344' },
                philHealth: {
                    membershipNumber: '55-667788990-1',
                    status: 'Active',
                    category: 'Private Sector Employee',
                    lastContribution: 'Feb 2025',
                    konsultaProvider: 'Maxicare PCC',
                    fpeStatus: 'Completed',
                    mbl: '₱ 100,000.00',
                    mblUsed: '₱ 3,200.00',
                    benefitCategories: [
                        { id: 'ph-mc2', name: 'Konsulta Packages', limit: '₱ 5,000.00', used: '₱ 1,200.00', icon: '🩺' }
                    ]
                },
                hmoCards: [
                    {
                        id: 'hmo-mc2',
                        provider: 'Maxicare',
                        memberNo: 'MC-CORP-44002',
                        planType: 'Corporate Gold',
                        validity: '2026-03-31',
                        coverageAmount: '₱ 200,000.00',
                        usedAmount: '₱ 4,500.00',
                        mbl: '₱ 200,000.00',
                        mblUsed: '₱ 4,500.00',
                        status: 'Active',
                        benefitCategories: [
                            { id: 'b-mc5', name: 'Dental', limit: '₱ 8,000.00', used: '₱ 0.00', icon: '🦷' },
                            { id: 'b-mc6', name: 'Optical', limit: '₱ 5,000.00', used: '₱ 0.00', icon: '👓' },
                            { id: 'b-mc7', name: 'Mental Health', limit: '₱ 15,000.00', used: '₱ 0.00', icon: '🧠' },
                            { id: 'b-mc8', name: 'ER Coverage', limit: '₱ 100,000.00', used: '₱ 0.00', icon: '🚑' }
                        ]
                    }
                ],
                wellnessBenefits: [
                    { id: 'w-mc2', type: 'Annual Physical Exam', balance: '1 Remaining', description: 'Corporate wellness APE at any Maxicare PCC', validity: 'Annual' }
                ]
            },
            dependents: [
                { id: 'd-mc2', name: 'Grace Lim', relation: 'Wife', birthDate: '1993-06-18', idNumber: 'DEP-MC02' }
            ],
            appointments: [
                { id: 'mc-201', doctor: 'Dr. Jen Diaz', specialty: 'Family Medicine', date: addDays(3), time: '09:00 AM', status: 'Upcoming', type: 'In-Person', location: 'Maxicare PCC - Bridgetowne' },
                { id: 'mc-202', doctor: 'Dr. Carmela Ong', specialty: 'Internal Medicine', date: addDays(10), time: '02:30 PM', status: 'Upcoming', type: 'Teleconsult' },
                { id: 'mc-204', doctor: 'Dr. Jen Diaz', specialty: 'Laboratory', date: addDays(6), time: '07:00 AM', status: 'Upcoming', type: 'HomeCare', location: 'Maxicare PCC - Bridgetowne' },
                { id: 'mc-205', doctor: 'Dr. Jen Diaz', specialty: 'Laboratory', date: addDays(12), time: '08:30 AM', status: 'Upcoming', type: 'Procedure', location: 'Maxicare PCC - Bridgetowne' },
                { id: 'mc-203', doctor: 'Dr. Jen Diaz', specialty: 'Family Medicine', date: subDays(14), time: '10:00 AM', status: 'Completed', type: 'In-Person', location: 'Maxicare PCC - Bridgetowne' },
                { id: 'mc-206', doctor: 'Dr. Jen Diaz', specialty: 'Laboratory', date: subDays(5), time: '08:00 AM', status: 'Completed', type: 'HomeCare', location: 'Maxicare PCC - Bridgetowne' },
            ],
            medications: [
                { id: 'm-mc4', name: 'Multivitamins', dosage: '1 tab', instruction: 'Once daily after breakfast', remaining: 45, refillDate: addDays(40), status: 'Active' },
                { id: 'm-mc5', name: 'Cetirizine', dosage: '10mg', instruction: 'Once daily at bedtime for allergies', remaining: 20, refillDate: addDays(18), status: 'Active' },
                { id: 'm-mc6', name: 'Omeprazole', dosage: '20mg', instruction: 'Once daily before breakfast', remaining: 8, refillDate: addDays(6), status: 'Low Stock' },
            ],
            results: [
                { id: 'r-mc6', title: 'CBC', type: 'Laboratory', date: subDays(14), doctor: 'Dr. Jen Diaz', status: 'Final', isCritical: false },
                { id: 'r-mc7', title: 'Fasting Blood Sugar', type: 'Laboratory', date: subDays(14), doctor: 'Dr. Jen Diaz', status: 'Final', isCritical: false },
                { id: 'r-mc8', title: 'Lipid Panel', type: 'Laboratory', date: subDays(14), doctor: 'Dr. Jen Diaz', status: 'Final', isCritical: true, hasFollowUp: true },
                { id: 'r-mc9', title: 'Liver Function Test (ALT/AST)', type: 'Laboratory', date: subDays(14), doctor: 'Dr. Jen Diaz', status: 'Final', isCritical: false },
                { id: 'r-mc10', title: 'Chest X-Ray', type: 'Imaging', date: subDays(14), doctor: 'Dr. Jen Diaz', status: 'Final', isCritical: false },
            ],
            notifications: [
                { id: 'n-mc3', title: 'Appointment Reminder', message: 'You have a Family Medicine appointment in 3 days with Dr. Diaz.', date: '3 hours ago', read: false, type: 'info', link: '/appointments' },
                { id: 'n-mc4', title: 'Lab Results Ready', message: 'Your Lipid Panel results require attention — elevated LDL.', date: '2 days ago', read: false, type: 'warning', link: '/results' },
                { id: 'n-mc5', title: 'Medication Refill', message: 'Omeprazole is running low. Request a refill at your next visit.', date: '1 day ago', read: false, type: 'info', link: '/medications' },
                { id: 'n-mc10', title: 'HomeCare Confirmed', message: 'Home specimen collection scheduled for ' + addDays(6) + ' at 7:00 AM.', date: '5 hours ago', read: false, type: 'success', link: '/appointments/history' },
                { id: 'n-mc11', title: 'Procedure Booking Confirmed', message: 'HbA1c + Uric Acid procedure scheduled at Bridgetowne on ' + addDays(12) + '.', date: '1 day ago', read: false, type: 'success', link: '/appointments/history' },
                { id: 'n-mc12', title: 'LOA Approved', message: 'Your Annual Physical Exam LOA has been approved.', date: '2 weeks ago', read: true, type: 'info', link: '/benefits' }
            ],
            invoices: [
                { id: 'INV-MC003', date: subDays(14), description: 'Consultation Fee', provider: 'Dr. Jen Diaz', amount: 600, status: 'Paid', type: 'Consultation' },
                { id: 'INV-MC004', date: subDays(14), description: 'APE Lab Package', provider: 'Maxicare Lab', amount: 2800, status: 'Paid', type: 'Laboratory' },
                { id: 'INV-MC005', date: subDays(14), description: 'Chest X-Ray', provider: 'Maxicare Imaging', amount: 650, status: 'Pending', type: 'Imaging' }
            ],
            procedures: [
                { id: 'proc-mc2', category: 'Imaging', name: 'Chest X-Ray (PA)', date: subDays(14), time: '10:30 AM', location: 'Maxicare PCC - Bridgetowne', status: 'Completed' },
                { id: 'proc-mc3', category: 'Laboratory', name: 'Annual Physical Exam Package', date: addDays(3), time: '9:00 AM', location: 'Maxicare PCC - Bridgetowne', status: 'Scheduled' },
                { id: 'proc-mc7', category: 'Laboratory', name: 'HbA1c + Serum Uric Acid', date: addDays(12), time: '8:30 AM', location: 'Maxicare PCC - Bridgetowne', status: 'Scheduled' },
                { id: 'proc-mc8', category: 'Laboratory', name: 'Urinalysis (Home Collection)', date: addDays(6), time: '7:00 AM', location: 'HomeCare', status: 'Scheduled' }
            ],
            loaRequests: [
                { id: 'loa-mc2', type: 'Annual Physical Exam', provider: 'Maxicare PCC - Bridgetowne', date: subDays(14), status: 'Approved', amount: '₱ 0.00' },
                { id: 'loa-mc6', type: 'Laboratory - HbA1c Panel', provider: 'Maxicare PCC - Bridgetowne', date: subDays(1), status: 'Approved', amount: '₱ 950.00' },
                { id: 'loa-mc7', type: 'Laboratory - Serum Uric Acid', provider: 'Maxicare PCC - Bridgetowne', date: subDays(1), status: 'Pending', amount: '₱ 450.00' }
            ],
            claims: [],
            doctorRequests: [
                { id: 'dreq-mc13', type: 'Laboratory', title: 'Complete Blood Count (CBC)', doctor: 'Dr. Jen Diaz', date: subDays(16), status: 'Completed', priority: 'Routine', notes: 'Hgb 15.1, Hct 45.2%, WBC 6.5, Plt 230 — all normal.', homeCareEligible: true, specimenType: 'Blood' },
                { id: 'dreq-mc14', type: 'Laboratory', title: 'Fasting Blood Sugar (FBS)', doctor: 'Dr. Jen Diaz', date: subDays(16), status: 'Completed', priority: 'Routine', notes: 'Result: 88 mg/dL — normal fasting glucose.', homeCareEligible: true, specimenType: 'Blood' },
                { id: 'dreq-mc15', type: 'Laboratory', title: 'Lipid Profile Panel', doctor: 'Dr. Jen Diaz', date: subDays(16), status: 'Completed', priority: 'Routine', notes: 'TC 242, TG 180, LDL 162, HDL 38. LDL elevated — lifestyle + statin discussion.', homeCareEligible: true, specimenType: 'Blood' },
                { id: 'dreq-mc16', type: 'Laboratory', title: 'Liver Function Test (ALT/AST)', doctor: 'Dr. Jen Diaz', date: subDays(16), status: 'Completed', priority: 'Routine', notes: 'ALT 28, AST 22 — within normal limits.', homeCareEligible: true, specimenType: 'Blood' },
                { id: 'dreq-mc17', type: 'Imaging', title: 'Chest X-Ray (PA)', doctor: 'Dr. Jen Diaz', date: subDays(16), status: 'Completed', priority: 'Routine', facility: 'Maxicare PCC - Bridgetowne', notes: 'Heart and lungs normal. No acute findings.', homeCareEligible: false },
                { id: 'dreq-mc18', type: 'Laboratory', title: 'Urinalysis', doctor: 'Dr. Jen Diaz', date: subDays(1), status: 'Pending', priority: 'Routine', notes: 'Follow-up screening.', homeCareEligible: true, specimenType: 'Urine' },
                { id: 'dreq-mc19', type: 'Laboratory', title: 'HbA1c', doctor: 'Dr. Carmela Ong', date: subDays(1), status: 'Pending', priority: 'Routine', notes: 'Baseline metabolic screening.', homeCareEligible: true, specimenType: 'Blood' },
                { id: 'dreq-mc20', type: 'Laboratory', title: 'Serum Uric Acid', doctor: 'Dr. Jen Diaz', date: subDays(1), status: 'Pending', priority: 'Routine', notes: 'Patient reports occasional joint pain after meals.', homeCareEligible: true, specimenType: 'Blood' },
            ]
        }
    ]
};
