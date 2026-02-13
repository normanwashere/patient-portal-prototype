import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Zap,
    ChevronRight,
    CheckCircle,
    Calendar,
    MapPin,
    Clock,
    FlaskConical,
    Stethoscope,
    Activity
} from 'lucide-react';
import { BackButton } from '../components/Common/BackButton';
import { useToast } from '../context/ToastContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../theme/ThemeContext';
import { getTenantBranches } from '../data/mockBranches';
import type { Branch } from '../data/mockBranches';
import './BookProcedure.css';

type ProcedureCategory = {
    id: string;
    title: string;
    description: string;
    icon: any;
    procedures: string[];
};

const CATEGORIES: ProcedureCategory[] = [
    {
        id: 'lab',
        title: 'Laboratory Tests',
        description: 'Blood work, Urinalysis, Fecalysis',
        icon: FlaskConical,
        procedures: ['Complete Blood Count (CBC)', 'Urinalysis', 'Fecalysis', 'Fast Blood Sugar (FBS)', 'Lipid Profile']
    },
    {
        id: 'imaging',
        title: 'Radiology / Imaging',
        description: 'X-Ray, Ultrasound, CT Scan',
        icon: Zap,
        procedures: ['Chest X-Ray', 'Abdominal Ultrasound', 'CT Scan - Head', 'MRI - Lumbar']
    },
    {
        id: 'cardio',
        title: 'Cardiovascular',
        description: 'ECG, 2D Echo, Stress Test',
        icon: Activity,
        procedures: ['ECG', '2D Echo with Doppler', 'Treadmill Stress Test']
    },
    {
        id: 'special',
        title: 'Special Procedures',
        description: 'Biopsy, Endoscopy, Dialysis',
        icon: Stethoscope,
        procedures: ['Endoscopy', 'Colonoscopy', 'Hemo-Dialysis Session']
    }
];

export const BookProcedure: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { bookProcedure } = useData();
    const { tenant } = useTheme();
    const tenantBranches = getTenantBranches(tenant.id, tenant.name);

    const [step, setStep] = React.useState<number>(1);
    const [bookingMode, setBookingMode] = React.useState<'location' | 'procedure' | null>(null);
    const [selectedBranch, setSelectedBranch] = React.useState<Branch | null>(null);
    const [selectedCategory, setSelectedCategory] = React.useState<ProcedureCategory | null>(null);
    const [selectedProcedure, setSelectedProcedure] = React.useState<string>('');
    const [selectedDate, setSelectedDate] = React.useState<string>('');
    const [selectedTime, setSelectedTime] = React.useState<string>('');

    const TOTAL_STEPS = 5;

    const handleSuccess = () => {
        if (selectedProcedure && selectedBranch) {
            bookProcedure({
                category: selectedCategory?.title || 'Procedure',
                name: selectedProcedure,
                date: selectedDate,
                time: selectedTime,
                location: selectedBranch.name
            });
            showToast('Procedure scheduled successfully!', 'success');
            setStep(6);
        }
    };

    return (
        <div className="booking-container">
            <header className="page-header">
                {step < 6 && (
                    <BackButton onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} />
                )}
                <div className="header-text">
                    <h2>{step === 6 ? 'Confirmed' : 'Book a Procedure'}</h2>
                </div>
                {step < 6 && (
                    <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}></div>
                    </div>
                )}
            </header>

            <main className="booking-body">
                {step === 1 && (
                    <div className="step-content animate-in">
                        <h3 className="step-instruction">How would you like to start?</h3>
                        <div className="preference-cards">
                            <button className="pref-card" onClick={() => { setBookingMode('location'); setStep(2); }}>
                                <div className="pref-icon location"><MapPin size={32} /></div>
                                <div className="pref-text">
                                    <h4>By Location</h4>
                                    <p>Find a facility near you</p>
                                </div>
                                <ChevronRight className="pref-arrow" />
                            </button>
                            <button className="pref-card" onClick={() => { setBookingMode('procedure'); setStep(2); }}>
                                <div className="pref-icon specialty"><Stethoscope size={32} /></div>
                                <div className="pref-text">
                                    <h4>By Procedure Type</h4>
                                    <p>Search by medical service</p>
                                </div>
                                <ChevronRight className="pref-arrow" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Branch selection (if mode=location) OR Category selection (if mode=procedure) */}
                {step === 2 && (
                    <div className="step-content animate-in">
                        {bookingMode === 'location' ? (
                            <>
                                <h3 className="step-instruction">Select a Location</h3>
                                <div className="list-grid">
                                    {tenantBranches.map(b => (
                                        <button key={b.id} className="selection-card" onClick={() => { setSelectedBranch(b); setStep(3); }}>
                                            <MapPin size={24} className="icon-muted" />
                                            <div className="card-info">
                                                <h4>{b.name}</h4>
                                                <p>{b.address}</p>
                                            </div>
                                            <ChevronRight className="chevron" />
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className="step-instruction">Select Procedure Category</h3>
                                <div className="preference-cards">
                                    {CATEGORIES.map(cat => (
                                        <button key={cat.id} className="pref-card" onClick={() => { setSelectedCategory(cat); setStep(3); }}>
                                            <div className="pref-icon location"><cat.icon size={32} /></div>
                                            <div className="pref-text">
                                                <h4>{cat.title}</h4>
                                                <p>{cat.description}</p>
                                            </div>
                                            <ChevronRight className="pref-arrow" />
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Step 3: Category (if mode=location) OR Procedure (if mode=procedure) */}
                {step === 3 && (
                    <div className="step-content animate-in">
                        {bookingMode === 'location' ? (
                            <>
                                <div className="context-banner">
                                    <MapPin size={16} /> <span>At <strong>{selectedBranch?.name}</strong></span>
                                </div>
                                <h3 className="step-instruction">Select Procedure Category</h3>
                                <div className="preference-cards">
                                    {CATEGORIES.map(cat => (
                                        <button key={cat.id} className="pref-card" onClick={() => { setSelectedCategory(cat); setStep(4); }}>
                                            <div className="pref-icon location"><cat.icon size={32} /></div>
                                            <div className="pref-text">
                                                <h4>{cat.title}</h4>
                                                <p>{cat.description}</p>
                                            </div>
                                            <ChevronRight className="pref-arrow" />
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="context-banner">
                                    {selectedCategory && <selectedCategory.icon size={16} />} <span>Category: <strong>{selectedCategory?.title}</strong></span>
                                </div>
                                <h3 className="step-instruction">Choose Specific Procedure</h3>
                                <div className="procedure-list">
                                    {selectedCategory?.procedures.map(proc => (
                                        <button key={proc} className={`selection-card ${selectedProcedure === proc ? 'active' : ''}`}
                                            onClick={() => { setSelectedProcedure(proc); setStep(4); }}>
                                            <div className="card-info"><h4>{proc}</h4></div>
                                            <ChevronRight className="chevron" />
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Step 4: Procedure (if mode=location) OR Branch (if mode=procedure) */}
                {step === 4 && (
                    <div className="step-content animate-in">
                        {bookingMode === 'location' ? (
                            <>
                                <div className="context-banner">
                                    {selectedCategory && <selectedCategory.icon size={16} />} <span>At <strong>{selectedBranch?.name}</strong> • <strong>{selectedCategory?.title}</strong></span>
                                </div>
                                <h3 className="step-instruction">Choose Specific Procedure</h3>
                                <div className="procedure-list">
                                    {selectedCategory?.procedures.map(proc => (
                                        <button key={proc} className={`selection-card ${selectedProcedure === proc ? 'active' : ''}`}
                                            onClick={() => { setSelectedProcedure(proc); setStep(5); }}>
                                            <div className="card-info"><h4>{proc}</h4></div>
                                            <ChevronRight className="chevron" />
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="context-banner">
                                    <CheckCircle size={16} /> <span>Procedure: <strong>{selectedProcedure}</strong></span>
                                </div>
                                <h3 className="step-instruction">Select a Location</h3>
                                <div className="list-grid">
                                    {tenantBranches.map(b => (
                                        <button key={b.id} className="selection-card" onClick={() => { setSelectedBranch(b); setStep(5); }}>
                                            <MapPin size={24} className="icon-muted" />
                                            <div className="card-info">
                                                <h4>{b.name}</h4>
                                                <p>{b.address}</p>
                                            </div>
                                            <ChevronRight className="chevron" />
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {step === 5 && (
                    <div className="step-content animate-in">
                        <div className="context-banner">
                            <CheckCircle size={16} />
                            <span>Ready to book: <strong>{selectedProcedure}</strong> at <strong>{selectedBranch?.name}</strong></span>
                        </div>
                        <h3 className="step-instruction">Schedule your visit</h3>

                        <div className="datetime-section">
                            <div className="confirm-card glass-card">
                                <div className="confirm-row">
                                    <Calendar size={18} />
                                    <div>
                                        <span className="label">Preferred Date</span>
                                        <input
                                            type="date"
                                            className="date-input"
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="confirm-row">
                                    <Clock size={18} />
                                    <div>
                                        <span className="label">Preferred Time</span>
                                        <select className="date-input" onChange={(e) => setSelectedTime(e.target.value)}>
                                            <option value="">Select Time</option>
                                            <option>08:00 AM</option>
                                            <option>09:00 AM</option>
                                            <option>10:00 AM</option>
                                            <option>01:00 PM</option>
                                            <option>02:00 PM</option>
                                            <option>03:00 PM</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="confirm-row">
                                    <MapPin size={18} />
                                    <div>
                                        <span className="label">Location</span>
                                        <span className="value">{selectedBranch?.name}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="prep-notice">
                                <Zap size={16} />
                                <p><strong>Preparation:</strong> Some procedures require fasting or special intake. We will send guidelines via SMS after confirmation.</p>
                            </div>

                            <button
                                className="btn-confirm"
                                disabled={!selectedDate || !selectedTime}
                                onClick={handleSuccess}
                            >
                                Confirm Appointment
                            </button>
                        </div>
                    </div>
                )}

                {step === 6 && (
                    <div className="step-content success-content animate-in">
                        <div className="success-lottie">
                            <CheckCircle size={80} color="#10b981" />
                        </div>
                        <h3>Booking Confirmed!</h3>
                        <p>Your <strong>{selectedProcedure}</strong> is scheduled for <strong>{selectedDate}</strong> at <strong>{selectedTime}</strong>.</p>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>Location: {selectedBranch?.name}</p>

                        <div className="next-steps-card">
                            <h4>Next Steps</h4>
                            <ul>
                                <li>Check your SMS for preparation guidelines</li>
                                <li>Arrive 15 minutes before your schedule</li>
                                <li>Bring your HMO Card / ID</li>
                            </ul>
                        </div>

                        <div className="success-actions">
                            <button className="btn-primary" onClick={() => navigate('/appointments')}>View Appointments</button>
                            {tenant.features.hmo && (
                                <button className="btn-secondary" onClick={() => navigate('/benefits')}>Request LOA for this Procedure</button>
                            )}
                            <button className="btn-text" onClick={() => navigate('/')}>Back to Home</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
