import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, MapPin, User, CheckCircle, Stethoscope, Building2, ChevronRight, Video } from 'lucide-react';
import { BackButton } from '../components/Common/BackButton';
import { useToast } from '../context/ToastContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../theme/ThemeContext';
import { useProvider } from '../provider/context/ProviderContext';
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
    const { addAppointment, userProfile } = useData();
    const { addAppointment: addProviderAppointment } = useProvider();
    const { tenant } = useTheme();
    const visits = tenant.features.visits;

    // Tenant-scoped branches and doctors
    const tenantBranches = getTenantBranches(tenant.id, tenant.name);
    const tenantBranchIds = new Set(tenantBranches.map(b => b.id));
    const tenantDoctors = DOCTORS.filter(d => d.locationIds.some(lid => tenantBranchIds.has(lid)));

    // State
    // State - Lazy Initialize from location.state to avoid flicker
    const [bookingType, setBookingType] = useState<AppointmentType | null>(() => {
        return (location.state?.type as AppointmentType) || (location.state?.locationId ? 'in-person' : null);
    });

    const [step, setStep] = useState<BookingStep>(() => {
        if (location.state?.locationId) return 'secondary';
        if (location.state?.type === 'in-person' && location.state?.branch === 'consult') return 'preference';
        if (location.state?.type) return 'preference';
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
        if (step === 'type-selection') navigate(-1);
        else if (step === 'in-person-branch') setStep('type-selection');
        else if (step === 'preference') {
            if (location.state?.type === 'in-person' && location.state?.branch === 'consult') navigate(-1);
            else if (location.state?.type) navigate(-1);
            else if (bookingType === 'in-person') setStep('in-person-branch');
            else setStep('type-selection');
        }
        else if (step === 'primary') setStep('preference');
        else if (step === 'secondary') {
            // If we pre-selected location from outside, go back to preference or home?
            if (location.state?.locationId && preference === 'location') {
                navigate(-1); // Or reset state
            } else {
                setStep('primary');
            }
        }
        else if (step === 'doctor') {
            if (preference === 'doctor') setStep('preference');
            else setStep('secondary');
        }
        else if (step === 'datetime') {
            // If we searched doctor directly, go back to doctor list (which was step 'preference' technically or 'doctor' step?)
            // Wait, if Pref=Doctor, we showed list. selection -> Date. So back -> Pref (Doctor List).
            if (preference === 'doctor') setStep('preference');
            else setStep('doctor'); // Back to list of doctors filtered by Loc/Spec
        }
        else if (step === 'intake') setStep('datetime');
        else if (step === 'confirm') setStep('intake');
    };

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

    const renderDoctorFormat = () => (
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
            <h3 className="step-instruction">Select a Doctor</h3>

            <div className="doctor-list">
                {getDoctors().map(doc => (
                    <button key={doc.id} className={`doctor-card ${selectedDoctor?.id === doc.id ? 'selected' : ''}`}
                        onClick={() => { setSelectedDoctor(doc); setStep('datetime'); }} >
                        <img src={doc.image} alt={doc.name} className="doctor-avatar" />
                        <div className="doctor-info">
                            <h4>{doc.name}</h4>
                            <span className="doctor-specialty">{doc.specialtyName}</span>
                            <span className="doctor-fee">Initial Fee: ₱{doc.fee}</span>
                        </div>
                        <div className="doctor-rating">⭐ {doc.rating}</div>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderDateTime = () => {
        // Use doctor's dynamic availability or fallback
        const availability = selectedDoctor?.available || [];
        const currentSelectedDateObj = availability.find(d => d.date === selectedDate);
        const availableSlots = currentSelectedDateObj?.slots || [];

        // Build a set of available date numbers for the calendar
        const today = new Date();
        const availableDateMap = new Map<number, { status: string; slots: string[] }>();
        availability.forEach(d => {
            // Parse "Feb 14" style dates
            const parsed = new Date(`${d.date}, ${today.getFullYear()}`);
            if (!isNaN(parsed.getTime())) {
                availableDateMap.set(parsed.getDate(), { status: d.status, slots: d.slots });
            }
        });

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

                    {/* Calendar View */}
                    <div className="calendar-picker">
                        <div className="calendar-header-row">
                            <span className="calendar-month">
                                {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                        <div className="calendar-weekdays">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <span key={d} className="cal-weekday">{d}</span>
                            ))}
                        </div>
                        <div className="calendar-grid">
                            {(() => {
                                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                                const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                                const startPad = firstDay.getDay();
                                const cells = [];

                                for (let i = 0; i < startPad; i++) {
                                    cells.push(<span key={`pad-${i}`} className="cal-day pad" />);
                                }

                                for (let d = 1; d <= lastDay.getDate(); d++) {
                                    const dateObj = new Date(today.getFullYear(), today.getMonth(), d);
                                    const isPast = dateObj <= today;
                                    const avail = availableDateMap.get(d);
                                    const hasSlots = !!avail && avail.status !== 'Full';
                                    const isLimited = !!avail && avail.status === 'Limited';
                                    const isFull = !!avail && avail.status === 'Full';
                                    const isDisabled = isPast || !avail;
                                    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                    const isSelected = selectedDate === dateStr;

                                    cells.push(
                                        <button
                                            key={d}
                                            className={`cal-day ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''} ${isFull ? 'full' : ''} ${isLimited ? 'limited' : ''}`}
                                            disabled={isDisabled || isFull}
                                            onClick={() => { setSelectedDate(dateStr); setSelectedTime(''); }}
                                        >
                                            <span className="cal-day-num">{d}</span>
                                            {!isPast && hasSlots && !isLimited && <span className="cal-dot available" />}
                                            {!isPast && isLimited && <span className="cal-dot limited" />}
                                            {!isPast && isFull && <span className="cal-dot full" />}
                                        </button>
                                    );
                                }

                                return cells;
                            })()}
                        </div>
                        <div className="calendar-legend">
                            <span><span className="cal-dot available" /> Available</span>
                            <span><span className="cal-dot limited" /> Limited</span>
                            <span><span className="cal-dot full" /> Full</span>
                        </div>
                    </div>

                    {/* Time Slots */}
                    {selectedDate && (
                        <div className="time-slots-section animate-in">
                            <div className="time-slots-header">
                                <span>Available times for <strong>{selectedDate}</strong></span>
                            </div>
                            <div className="time-slots-grid">
                                {availableSlots.length > 0 ? availableSlots.map(t => (
                                    <button key={t} className={`time-slot-btn ${selectedTime === t ? 'selected' : ''}`}
                                        onClick={() => setSelectedTime(t)}>
                                        {t}
                                    </button>
                                )) : (
                                    <div className="no-slots" style={{ gridColumn: '1 / -1' }}>No slots available for this date.</div>
                                )}
                            </div>
                        </div>
                    )}
                    {!selectedDate && (
                        <div className="placeholder-slots">Select a date on the calendar to see available times.</div>
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
                const apptPayload = {
                    doctor: selectedDoctor?.name || '',
                    specialty: selectedSpecialty?.name || selectedDoctor?.specialtyName || '',
                    date: selectedDate,
                    time: selectedTime,
                    type: bookingType === 'teleconsult' ? 'Teleconsult' : 'In-Person',
                    location: selectedBranch?.name || undefined,
                    patientName: userProfile?.name || 'Patient',
                    patientId: userProfile?.id || 'p-self',
                    chiefComplaint: '',
                    notes: `Booked via patient portal`,
                };
                addAppointment(apptPayload);
                addProviderAppointment({ ...apptPayload, status: 'Upcoming' });
                setStep('success');
                showToast('Appointment booked!', 'success');
            }}>Confirm Booking</button>
        </div>
    );

    return (
        <div className="booking-container">
            <header className="page-header">
                {step !== 'success' && (
                    <BackButton onClick={handleBack} />
                )}
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

            {step === 'success' && (
                <div className="step-content success-content">
                    <CheckCircle size={64} className="success-icon" />
                    <h3>Booking Confirmed!</h3>
                    <p>You are booked with {selectedDoctor?.name} on {selectedDate} at {selectedTime}.</p>
                    <button className="btn-primary" onClick={() => navigate('/appointments')}>View Appointments</button>
                    <button className="btn-secondary" onClick={() => navigate('/')}>Back to Home</button>
                </div>
            )}
        </div>
    );
};
