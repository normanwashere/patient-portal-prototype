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
                { id: '101', doctor: 'Dr. Albert Go', specialty: 'Cardiology', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), time: '10:00 AM', status: 'Upcoming', type: 'In-Person', location: 'Heart Center, 3F' },
                { id: '102', doctor: 'Dr. Jen Diaz', specialty: 'Endocrinology', date: addDays(14), time: '02:00 PM', status: 'Upcoming', type: 'Teleconsult' },
                { id: '103', doctor: 'Dr. Rahn Lim', specialty: 'Pulmonology', date: subDays(45), time: '11:00 AM', status: 'Completed', type: 'In-Person', location: 'Medical Arts Bldg, 5F' },
            ],
            medications: [
                { id: 'm1', name: 'Rosuvastatin', dosage: '20mg', instruction: 'Once daily at bedtime', remaining: 28, refillDate: addDays(25), status: 'Active' },
                { id: 'm2', name: 'Clopidogrel', dosage: '75mg', instruction: 'Once daily after breakfast', remaining: 5, refillDate: addDays(3), status: 'Low Stock' },
                { id: 'm3', name: 'Metformin', dosage: '500mg', instruction: 'Twice a day with meals', remaining: 60, refillDate: addDays(58), status: 'Active' },
            ],
            results: [
                { id: 'r1', title: '2D Echo with Doppler', type: 'Imaging', date: subDays(2), doctor: 'Dr. Go', status: 'Final', isCritical: false },
                { id: 'r2', title: 'HbA1c', type: 'Laboratory', date: subDays(5), doctor: 'Dr. Diaz', status: 'Final', isCritical: true, hasFollowUp: false },
            ],
            notifications: [
                { id: 'n1', title: 'Appointment Reminder', message: 'You have a Cardiology appointment in 2 days.', date: '2 hours ago', read: false, type: 'info', link: '/appointments' },
                { id: 'n2', title: 'Critical Result', message: 'Your HbA1c results require attention.', date: '3 days ago', read: false, type: 'warning', link: '/results' },
            ],
            invoices: [
                { id: 'INV-001', date: subDays(2), description: 'Cardiology Consultation', provider: 'Dr. Albert Go', amount: 1500, status: 'Pending', type: 'Consultation' },
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
            loaRequests: []
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
            loaRequests: []
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
            loaRequests: []
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
            loaRequests: []
        }
    ]
};

// ==========================================
// ORG 4: MAXICARE
// ==========================================
export const MAXICARE_DATA: any = {
    patients: [
        {
            userProfile: {
                id: 'p-max-1',
                name: 'Mateo Maxicare',
                memberId: 'MAX-88990011',
                company: 'MAXICARE HEALTH CORP',
                validity: '01/2026 - 12/2026',
                membershipType: 'Gold Member',
                emergencyContact: { name: 'Maria Maxicare', relation: 'Spouse', phone: '0917-000-8888' },
                philHealth: {
                    membershipNumber: '11-223344556-7',
                    status: 'Active',
                    category: 'Private Sector Employee',
                    lastContribution: 'Jan 2026',
                    konsultaProvider: 'Maxicare Primary Care Center - BGC',
                    fpeStatus: 'Completed',
                    mbl: '₱ 50,000.00',
                    mblUsed: '₱ 0.00',
                    benefitCategories: [
                        { id: 'ph-m1', name: 'Primary Care Package', limit: '₱ 5,000.00', used: '₱ 0.00', icon: '🩺' }
                    ]
                },
                hmoCards: [
                    {
                        id: 'hmo-m1',
                        provider: 'Maxicare',
                        memberNo: '1122-3344-MAX',
                        planType: 'Platinum Plus',
                        validity: '2026-12-31',
                        coverageAmount: '₱ 250,000.00',
                        usedAmount: '₱ 12,500.00',
                        mbl: '₱ 250,000.00',
                        mblUsed: '₱ 12,500.00',
                        status: 'Active',
                        benefitCategories: [
                            { id: 'b1', name: 'Dental Care', limit: '₱ 5,000.00', used: '₱ 0.00', icon: '🦷' },
                            { id: 'b2', name: 'Optical Allowance', limit: '₱ 3,500.00', used: '₱ 0.00', icon: '👓' },
                            { id: 'b3', name: 'Annual Check-up', limit: 'Unlimited', used: '1 Visit', icon: '🩺' }
                        ]
                    }
                ],
                wellnessBenefits: [
                    { id: 'w-m1', type: 'Gym Membership', balance: 'Active', description: 'Anytime Fitness Access', validity: '2026' }
                ]
            },
            dependents: [],
            appointments: [
                { id: 'appt-m1', doctor: 'Dr. Sarah Smith', specialty: 'General Practice', date: addDays(2), time: '10:00 AM', status: 'Upcoming', type: 'Teleconsult', location: 'Maxicare Telemed' },
                { id: 'appt-m2', doctor: 'Dr. John Doe', specialty: 'Cardiology', date: subDays(14), time: '02:00 PM', status: 'Completed', type: 'In-Person', location: 'Maxicare PCC BGC' }
            ],
            medications: [
                { id: 'med-m1', name: 'Amlodipine', dosage: '5mg', instruction: 'Once daily', remaining: 30, refillDate: addDays(25), status: 'Active' }
            ],
            results: [
                { id: 'res-m1', title: 'Complete Blood Count', type: 'Laboratory', date: subDays(14), doctor: 'Dr. Doe', status: 'Final' },
                { id: 'res-m2', title: 'Lipid Profile', type: 'Laboratory', date: subDays(14), doctor: 'Dr. Doe', status: 'Final' }
            ],
            notifications: [
                { id: 'not-m1', title: 'Consultation Ready', message: 'You can now join the queue for immediate consult.', date: 'Just now', read: false, type: 'info', link: '/visits' }
            ],
            invoices: [
                { id: 'inv-m1', date: subDays(14), description: 'Cardiology Consult', provider: 'Maxicare PCC', amount: 0, status: 'Paid', type: 'Consultation' } // HMO covered
            ],
            procedures: [],
            loaRequests: []
        }
    ]
};
