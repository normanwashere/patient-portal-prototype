import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, MapPin, User, CheckCircle, Stethoscope, Building2, ChevronRight, Video, Search } from 'lucide-react';

import { useToast } from '../context/ToastContext';
import { useData } from '../context/DataContext';
import { useHeader } from '../context/HeaderContext';
import { useTheme } from '../theme/ThemeContext';
import { DOCTORS, SPECIALTIES } from '../data/mockAppointmentData';
import { getTenantBranches } from '../data/mockBranches';
import type { Doctor, Specialty } from '../data/mockAppointmentData';
import type { Branch } from '../data/mockBranches';
import { IntakeForm } from '../components/IntakeForm';
import './AppointmentBooking.css';

// Steps: 
// 0. type-selection (if no type provided)
// 1. preference (Loc/Spec/Doc)
// 2. primary_selection (Loc List OR Spec List)
// 3. secondary_selection (Spec List OR Loc List) -> Then Doc List
// 4. datetime
// 5. intake (NEW)
// 6. confirm
// 7. success

type BookingStep = 'type-selection' | 'in-person-branch' | 'preference' | 'primary' | 'secondary' | 'doctor' | 'datetime' | 'intake' | 'confirm' | 'success';
type PreferenceType = 'location' | 'specialty' | 'doctor';
type AppointmentType = 'in-person' | 'teleconsult';

export const AppointmentBooking: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();
    const { setCustomBack } = useHeader();
    const { addAppointment } = useData();
    const { tenant } = useTheme();
    const visits = tenant.features.visits;

    // Tenant-scoped branches and doctors
    const tenantBranches = getTenantBranches(tenant.id, tenant.name);
    const tenantBranchIds = new Set(tenantBranches.map(b => b.id));
    const tenantDoctors = DOCTORS.filter(d => d.locationIds.some(lid => tenantBranchIds.has(lid)));

    // State
    // State - Lazy Initialize from location.state to avoid flicker
    const [bookingType, setBookingType] = useState<AppointmentType | null>(() => {
        const path = location.pathname;
        if (path.includes('book-clinic')) return 'in-person';
        if (path.includes('book-teleconsult')) return 'teleconsult';

        const searchParams = new URLSearchParams(location.search);
        const queryType = searchParams.get('type') as AppointmentType | null;
        return (location.state?.type as AppointmentType) || queryType || (location.state?.locationId ? 'in-person' : null);
    });

    const [step, setStep] = useState<BookingStep>(() => {
        const path = location.pathname;
        // If route is specific, skip type selection and go straight to preference
        if (path.includes('book-clinic') || path.includes('book-teleconsult')) {
            if (path.includes('book-clinic') && location.state?.branch === 'consult') return 'preference';
            // For clinic, usually start at in-person-branch unless specified
            if (path.includes('book-clinic')) return 'preference'; // actually preference is better? No, need to choose procedure vs consult if generic.
            // Wait, "Book In-Person Consult" from Visits page usually assumes "Consultation" so we skip the procedure choice?
            // The previous flow was: In-Person -> [Type: Consult/Procedure] -> Preference.
            // If URL is /visits/book-clinic, we assume In-Person.
            return 'preference';
        }

        const searchParams = new URLSearchParams(location.search);
        const queryType = searchParams.get('type');
        if (location.state?.locationId) return 'secondary';
        if (location.state?.type === 'in-person' && location.state?.branch === 'consult') return 'preference';
        if (location.state?.type || queryType) return 'preference';
        return 'type-selection';
    });

    const [preference, setPreference] = useState<PreferenceType>(
        location.state?.locationId ? 'location' : 'location'
    );

    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [doctorSearchQuery, setDoctorSearchQuery] = useState('');

    // Handle Location ID pre-selection side-effects (finding the branch object)
    useEffect(() => {
        if (location.state?.locationId && !selectedBranch) {
            const branch = tenantBranches.find(b => b.id === location.state.locationId);
            if (branch) {
                setSelectedBranch(branch);
            }
        }
    }, [location.state, tenantBranches]);

    // Helpers
    const getPageTitle = () => {
        if (step === 'success') return 'Confirmed';
        if (step === 'type-selection') return 'Book Appointment';
        if (bookingType === 'teleconsult') return 'New Teleconsult Appointment';
        return 'New In-Person Appointment';
    };

    // Progress Logic
    const getProgress = () => {
        switch (step) {
            case 'type-selection': return 10;
            case 'in-person-branch': return 20;
            case 'preference': return 30;
            case 'primary': return 40;
            case 'secondary': return 55;
            case 'doctor': return 65;
            case 'datetime': return 75;
            case 'intake': return 85;
            case 'confirm': return 95;
            case 'success': return 100;
            default: return 0;
        }
    };

    // Derived Data for Lists (all scoped to current tenant)
    const getBranches = () => {
        if (selectedSpecialty) {
            // Filter tenant branches that have doctors with this specialty
            const docLocIds = tenantDoctors
                .filter(d => d.specialtyId === selectedSpecialty.id)
                .flatMap(d => d.locationIds);
            return tenantBranches.filter(b => docLocIds.includes(b.id));
        }
        return tenantBranches;
    };

    const getSpecialties = () => {
        if (selectedBranch) {
            // Filter specialties available at this branch (from tenant doctors only)
            const branchSpecs = tenantDoctors
                .filter(d => d.locationIds.includes(selectedBranch.id))
                .map(d => d.specialtyId);
            return SPECIALTIES.filter(s => branchSpecs.includes(s.id));
        }
        // Show specialties that tenant doctors offer
        const tenantSpecIds = new Set(tenantDoctors.map(d => d.specialtyId));
        return SPECIALTIES.filter(s => tenantSpecIds.has(s.id));
    };

    const getDoctors = () => {
        let docs = tenantDoctors;
        if (selectedBranch) {
            docs = docs.filter(d => d.locationIds.includes(selectedBranch.id));
        }
        if (selectedSpecialty) {
            docs = docs.filter(d => d.specialtyId === selectedSpecialty.id);
        }
        return docs;
    };

    // Navigation Handlers
    const handleBack = () => {
        if (step === 'type-selection') {
            navigate('/visits'); // Explicit exit
        }
        else if (step === 'in-person-branch') {
            // If we are on a specific route, going back from here means going to Visits
            if (location.pathname.includes('book-clinic')) navigate('/visits');
            else setStep('type-selection');
        }
        else if (step === 'preference') {
            // Always exit flow if we are at the preference step (start of flow)
            navigate('/visits');
        }
        else if (step === 'primary') setStep('preference');
        else if (step === 'secondary') {
            if (location.state?.locationId && preference === 'location') {
                navigate('/visits'); // Or reset state
            } else {
                setStep('primary');
            }
        }
        else if (step === 'doctor') {
            if (preference === 'doctor') setStep('preference');
            else setStep('secondary');
        }
        else if (step === 'datetime') {
            if (preference === 'doctor') setStep('preference');
            else setStep('doctor');
        }
        else if (step === 'intake') setStep('datetime');
        else if (step === 'confirm') setStep('intake');
    };

    // Sync custom back handler to Header
    useEffect(() => {
        // Define when we are at the "root" of the booking flow
        const isAtRoot =
            step === 'type-selection' ||
            step === 'preference' ||
            (step === 'in-person-branch' && location.pathname.includes('book-clinic')); // If specific route, this is root

        if (isAtRoot) {
            setCustomBack(null); // Let Layout handle "Back" (goes to /visits)
        } else {
            setCustomBack(handleBack);
        }

        return () => setCustomBack(null);
    }, [step, bookingType, preference, selectedBranch, selectedSpecialty, selectedDoctor, location.state, location.pathname, handleBack]);

    // React to URL query param changes
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const queryType = searchParams.get('type') as AppointmentType | null;
        if (queryType) {
            setBookingType(queryType);
            setStep('preference');
            setSelectedBranch(null);
            setSelectedSpecialty(null);
            setSelectedDoctor(null);
        }
    }, [location.search]);

    // --- Render Helpers ---

    const renderTypeSelection = () => (
        <div className="step-content">
            <h3 className="step-instruction">Select Appointment Type</h3>
            <div className="preference-cards">
                {visits.clinicVisitEnabled && (
                    <button className="pref-card" onClick={() => { setBookingType('in-person'); setStep('in-person-branch'); }}>
                        <div className="pref-icon location"><Building2 size={32} /></div>
                        <div className="pref-text">
                            <h4>In-Person Visit</h4>
                            <p>Book a visit at one of our clinics or hospitals</p>
                        </div>
                        <ChevronRight className="pref-arrow" />
                    </button>
                )}

                {visits.teleconsultEnabled && (
                    <button className="pref-card" onClick={() => { setBookingType('teleconsult'); setStep('preference'); }}>
                        <div className="pref-icon specialty"><Video size={32} /></div>
                        <div className="pref-text">
                            <h4>Teleconsult</h4>
                            <p>Video consultation with a doctor</p>
                        </div>
                        <ChevronRight className="pref-arrow" />
                    </button>
                )}
            </div>
        </div>
    );

    const renderInPersonBranch = () => (
        <div className="step-content">
            <h3 className="step-instruction">What would you like to book?</h3>
            <div className="preference-cards">
                <button className="pref-card" onClick={() => navigate('/visits/book-procedure')}>
                    <div className="pref-icon location"><Building2 size={32} /></div>
                    <div className="pref-text">
                        <h4>Procedure</h4>
                        <p>Tests, X-rays, or minor surgical procedures</p>
                    </div>
                    <ChevronRight className="pref-arrow" />
                </button>

                <button className="pref-card" onClick={() => setStep('preference')}>
                    <div className="pref-icon specialty"><Stethoscope size={32} /></div>
                    <div className="pref-text">
                        <h4>Consultation</h4>
                        <p>Standard check-up or medical consult</p>
                    </div>
                    <ChevronRight className="pref-arrow" />
                </button>
            </div>
        </div>
    );

    const renderPreferenceStep = () => (
        <div className="step-content">
            <h3 className="step-instruction">How would you like to start?</h3>
            <div className="preference-cards">
                {bookingType === 'in-person' && (
                    <button className="pref-card" onClick={() => { setPreference('location'); setStep('primary'); }}>
                        <div className="pref-icon location"><Building2 size={32} /></div>
                        <div className="pref-text">
                            <h4>By Location</h4>
                            <p>Find a clinic or hospital near you</p>
                        </div>
                        <ChevronRight className="pref-arrow" />
                    </button>
                )}

                <button className="pref-card" onClick={() => { setPreference('specialty'); setStep('primary'); }}>
                    <div className="pref-icon specialty"><Stethoscope size={32} /></div>
                    <div className="pref-text">
                        <h4>By Specialization</h4>
                        <p>Search by medical department</p>
                    </div>
                    <ChevronRight className="pref-arrow" />
                </button>

                <button className="pref-card" onClick={() => { setPreference('doctor'); setStep('doctor'); }}>
                    <div className="pref-icon doctor"><User size={32} /></div>
                    <div className="pref-text">
                        <h4>Find a Doctor</h4>
                        <p>Search for a specific doctor</p>
                    </div>
                    <ChevronRight className="pref-arrow" />
                </button>
            </div>
        </div>
    );

    const renderPrimarySelection = () => {
        if (preference === 'location') {
            return (
                <div className="step-content">
                    <h3 className="step-instruction">Select a Location</h3>
                    <div className="list-grid">
                        {getBranches().map(b => (
                            <button key={b.id} className="selection-card" onClick={() => { setSelectedBranch(b); setStep('secondary'); }}>
                                <MapPin size={24} className="icon-muted" />
                                <div className="card-info">
                                    <h4>{b.name}</h4>
                                    <p>{b.address}</p>
                                </div>
                                <ChevronRight className="chevron" />
                            </button>
                        ))}
                    </div>
                </div>
            );
        } else if (preference === 'specialty') {
            return (
                <div className="step-content">
                    <h3 className="step-instruction">Select Specialization</h3>
                    <div className="specialty-grid">
                        {getSpecialties().map(s => (
                            <button key={s.id} className="specialty-card" onClick={() => {
                                setSelectedSpecialty(s);
                                if (bookingType === 'teleconsult') {
                                    setStep('doctor'); // Skip Location selection
                                } else {
                                    setStep('secondary'); // Go to Location selection
                                }
                            }}>
                                <span className="spec-icon">{s.icon}</span>
                                <span className="spec-name">{s.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderSecondarySelection = () => {
        // If Pref=Location, now select Specialty available there
        if (preference === 'location') {
            // Edge case: if pre-selected, selectedBranch is set.
            // Only reachable in 'in-person' mode
            return (
                <div className="step-content">
                    <div className="context-banner">
                        <MapPin size={16} /> <span>At <strong>{selectedBranch?.name}</strong></span>
                        <button className="change-btn" onClick={() => setStep('primary')}>Change</button>
                    </div>
                    <h3 className="step-instruction">Select Department</h3>
                    <div className="specialty-grid">
                        {getSpecialties().length > 0 ? getSpecialties().map(s => (
                            <button key={s.id} className="specialty-card" onClick={() => { setSelectedSpecialty(s); setStep('doctor'); }}>
                                <span className="spec-icon">{s.icon}</span>
                                <span className="spec-name">{s.name}</span>
                            </button>
                        )) : (
                            <p className="no-data">No specialties found at this location.</p>
                        )}
                    </div>
                </div>
            );
        }
        // If Pref=Specialty, now select Location that has it
        else if (preference === 'specialty') {
            return (
                <div className="step-content">
                    <div className="context-banner">
                        <Stethoscope size={16} /> <span>For <strong>{selectedSpecialty?.name}</strong></span>
                        <button className="change-btn" onClick={() => setStep('primary')}>Change</button>
                    </div>
                    <h3 className="step-instruction">Select Location</h3>
                    <div className="list-grid">
                        {getBranches().length > 0 ? getBranches().map(b => (
                            <button key={b.id} className="selection-card" onClick={() => { setSelectedBranch(b); setStep('doctor'); }}>
                                <MapPin size={24} className="icon-muted" />
                                <div className="card-info">
                                    <h4>{b.name}</h4>
                                    <p>{b.distance}</p>
                                </div>
                                <ChevronRight className="chevron" />
                            </button>
                        )) : (
                            <p className="no-data">No locations found for this specialty.</p>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };



    // ... existing renders ...

    const renderDoctorFormat = () => {
        // Filter doctors based on search
        const filteredDoctors = getDoctors().filter(doc =>
            doc.name.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
            doc.specialtyName.toLowerCase().includes(doctorSearchQuery.toLowerCase())
        );

        return (
            <div className="step-content">
                {preference !== 'doctor' && (
                    <div className="context-banner-stack">
                        {bookingType === 'in-person' && selectedBranch && (
                            <div className="tag"><MapPin size={14} /> {selectedBranch.name}</div>
                        )}
                        {selectedSpecialty && (
                            <div className="tag"><Stethoscope size={14} /> {selectedSpecialty.name}</div>
                        )}
                        {bookingType === 'teleconsult' && (
                            <div className="tag"><Video size={14} /> Teleconsult</div>
                        )}
                    </div>
                )}

                <div className="doctor-step-header">
                    <h3 className="step-instruction">Select a Doctor</h3>
                    <div className="doctor-search-bar">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by name or specialty..."
                            value={doctorSearchQuery}
                            onChange={(e) => setDoctorSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="doctor-list detailed-list">
                    {filteredDoctors.length > 0 ? filteredDoctors.map(doc => {
                        // Find branch names for this doctor
                        const docBranches = tenantBranches.filter(b => doc.locationIds.includes(b.id));

                        return (
                            <button key={doc.id} className={`doctor-card detailed ${selectedDoctor?.id === doc.id ? 'selected' : ''}`}
                                onClick={() => { setSelectedDoctor(doc); setStep('datetime'); }} >
                                <div className="doctor-card-main">
                                    <img src={doc.image} alt={doc.name} className="doctor-avatar large" />
                                    <div className="doctor-info">
                                        <div className="doc-header-row">
                                            <h4>{doc.name}</h4>
                                            <div className="doctor-rating">⭐ {doc.rating}</div>
                                        </div>
                                        <span className="doctor-specialty">{doc.specialtyName}</span>

                                        <div className="doctor-locations">
                                            {docBranches.slice(0, 2).map(b => (
                                                <span key={b.id} className="loc-badge">
                                                    <MapPin size={10} /> {b.name.replace('Maxicare PCC - ', '').replace('Metro General ', '')}
                                                </span>
                                            ))}
                                            {docBranches.length > 2 && <span className="loc-badge more">+{docBranches.length - 2} more</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="doctor-card-footer">
                                    <span className="doctor-fee">Initial Fee: ₱{doc.fee}</span>
                                    <span className="action-text">View Availability <ChevronRight size={14} /></span>
                                </div>
                            </button>
                        );
                    }) : (
                        <div className="no-data-placeholder">
                            <p>No doctors found matching "{doctorSearchQuery}"</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderDateTime = () => {
        // Use doctor's dynamic availability or fallback
        const availability = selectedDoctor?.available || [];
        const currentSelectedDateObj = availability.find(d => d.date === selectedDate);
        const availableSlots = currentSelectedDateObj?.slots || [];

        return (
            <div className="step-content">
                <div className="doctor-summary-mini with-bio">
                    <div className="doc-header">
                        <img src={selectedDoctor?.image} alt="" />
                        <div>
                            <h4>{selectedDoctor?.name}</h4>
                            <p className="doc-spec">{selectedDoctor?.specialtyName}</p>
                            <div className="doc-rating-mini">⭐ {selectedDoctor?.rating}</div>
                        </div>
                    </div>
                    {selectedDoctor?.bio && (
                        <p className="doc-bio">{selectedDoctor.bio}</p>
                    )}
                </div>

                <div className="datetime-section">
                    <h3>Select Date & Time</h3>
                    <div className="date-scroll">
                        {availability.map((d, index) => (
                            <button key={index}
                                className={`date-card ${selectedDate === d.date ? 'selected' : ''} ${d.status === 'Full' ? 'full' : ''}`}
                                disabled={d.status === 'Full'}
                                onClick={() => {
                                    if (d.status !== 'Full') {
                                        setSelectedDate(d.date);
                                        setSelectedTime(''); // Reset time when date changes
                                    }
                                }}>
                                <span className="date-day">{d.day}</span>
                                <span className="date-num">{d.date.split(' ')[1]}</span>
                                <span className={`date-status ${d.status.toLowerCase()}`}>{d.status}</span>
                            </button>
                        ))}
                    </div>

                    {selectedDate && (
                        <div className="time-grid animate-in">
                            {availableSlots.length > 0 ? availableSlots.map(t => (
                                <button key={t} className={`time-card ${selectedTime === t ? 'selected' : ''}`}
                                    onClick={() => setSelectedTime(t)}>
                                    {t}
                                </button>
                            )) : (
                                <div className="no-slots">No slots available for this date.</div>
                            )}
                        </div>
                    )}
                    {!selectedDate && (
                        <div className="placeholder-slots">Please select a date above to see available times.</div>
                    )}
                </div>

                <button className="btn-next" disabled={!selectedDate || !selectedTime} onClick={() => setStep('intake')}>
                    Continue
                </button>
            </div>
        );
    };

    const renderIntake = () => (
        <div className="step-content">
            <h3 className="step-instruction">Tell us more about your visit</h3>
            <IntakeForm
                onSubmit={() => setStep('confirm')}
                submitLabel="Continue to Confirmation"
            />
        </div>
    );

    const renderConfirm = () => (
        <div className="step-content">
            <h3 className="step-instruction">Confirm Appointment</h3>
            <div className="confirm-card">
                <div className="confirm-row">
                    <User size={18} />
                    <div><span className="label">Doctor</span><span className="value">{selectedDoctor?.name}</span></div>
                </div>
                <div className="confirm-row">
                    <Stethoscope size={18} />
                    <div><span className="label">Specialty</span><span className="value">{selectedSpecialty?.name || selectedDoctor?.specialtyName}</span></div>
                </div>
                <div className="confirm-row">
                    <Calendar size={18} />
                    <div><span className="label">Date & Time</span><span className="value">{selectedDate} @ {selectedTime}</span></div>
                </div>
                {bookingType === 'in-person' ? (
                    <div className="confirm-row">
                        <MapPin size={18} />
                        <div><span className="label">Location</span><span className="value">{selectedBranch?.name || 'Main Hospital'}</span></div>
                    </div>
                ) : (
                    <div className="confirm-row">
                        <Video size={18} />
                        <div><span className="label">Type</span><span className="value">Teleconsult (Video Call)</span></div>
                    </div>
                )}
            </div>
            <button className="btn-confirm" onClick={() => {
                addAppointment({
                    doctor: selectedDoctor?.name || '',
                    specialty: selectedSpecialty?.name || '',
                    date: selectedDate,
                    time: selectedTime
                });
                setStep('success');
                showToast('Appointment booked!', 'success');
            }}>Confirm Booking</button>
        </div>
    );

    return (
        <div className="booking-container">
            <header className="booking-header">
                <div className="header-text">
                    <h2>{getPageTitle()}</h2>
                    {step !== 'success' && (
                        <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${getProgress()}%` }}></div>
                        </div>
                    )}
                </div>
            </header>

            {step === 'type-selection' && renderTypeSelection()}
            {step === 'in-person-branch' && renderInPersonBranch()}
            {step === 'preference' && renderPreferenceStep()}
            {step === 'primary' && renderPrimarySelection()}
            {step === 'secondary' && renderSecondarySelection()}
            {step === 'doctor' && renderDoctorFormat()}
            {step === 'datetime' && renderDateTime()}
            {step === 'intake' && renderIntake()}
            {step === 'confirm' && renderConfirm()}

            {
                step === 'success' && (
                    <div className="step-content success-content">
                        <CheckCircle size={64} className="success-icon" />
                        <h3>Booking Confirmed!</h3>
                        <p>You are booked with {selectedDoctor?.name} on {selectedDate} at {selectedTime}.</p>
                        <button className="btn-primary" onClick={() => navigate('/appointments')}>View Appointments</button>
                        <button className="btn-secondary" onClick={() => navigate('/')}>Back to Home</button>
                    </div>
                )
            }
        </div >
    );
};
