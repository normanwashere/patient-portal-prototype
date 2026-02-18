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
    Activity,
    Home,
} from 'lucide-react';
import { BackButton } from '../components/Common/BackButton';
import { useToast } from '../context/ToastContext';
import { useData } from '../context/DataContext';
import { useProvider } from '../provider/context/ProviderContext';
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
    const { bookProcedure, addAppointment, userProfile } = useData();
    const { addAppointment: addProviderAppointment, facilitySchedules, bookFacilitySlot } = useProvider();
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

    // ── Schedule-driven availability ──
    const matchingSchedules = React.useMemo(() => {
        if (!selectedBranch || !selectedCategory) return [];
        return facilitySchedules.filter(s =>
            s.tenantId === tenant.id &&
            s.branchId === selectedBranch.id &&
            s.categoryId === selectedCategory.id &&
            (!s.procedureName || s.procedureName === selectedProcedure)
        );
    }, [facilitySchedules, tenant.id, selectedBranch, selectedCategory, selectedProcedure]);

    const activeSchedule = React.useMemo(() => {
        const procedureMatch = matchingSchedules.find(s => s.procedureName === selectedProcedure);
        return procedureMatch ?? matchingSchedules.find(s => !s.procedureName) ?? matchingSchedules[0] ?? null;
    }, [matchingSchedules, selectedProcedure]);

    const generateTimeSlots = React.useCallback((sched: typeof activeSchedule) => {
        if (!sched) return [];
        const slots: string[] = [];
        const [sh, sm] = sched.startTime.split(':').map(Number);
        const [eh, em] = sched.endTime.split(':').map(Number);
        const startMin = sh * 60 + sm;
        const endMin = eh * 60 + em;
        for (let m = startMin; m < endMin; m += sched.slotDurationMin) {
            const h = Math.floor(m / 60);
            const mn = m % 60;
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
            slots.push(`${String(h12).padStart(2, '0')}:${String(mn).padStart(2, '0')} ${ampm}`);
        }
        return slots;
    }, []);

    const getDateStatus = React.useCallback((dateObj: Date): { available: boolean; full: boolean; limited: boolean; remaining: number; total: number } => {
        if (!activeSchedule) return { available: false, full: false, limited: false, remaining: 0, total: 0 };
        const dow = dateObj.getDay();
        if (!activeSchedule.daysOfWeek.includes(dow)) return { available: false, full: false, limited: false, remaining: 0, total: activeSchedule.dailyCap };
        const isoStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        const booked = activeSchedule.bookedSlots[isoStr] ?? 0;
        const remaining = Math.max(0, activeSchedule.dailyCap - booked);
        const full = remaining === 0;
        const limited = !full && booked >= activeSchedule.dailyCap * 0.8;
        return { available: !full, full, limited, remaining, total: activeSchedule.dailyCap };
    }, [activeSchedule]);

    // ── Availability helpers for branch / category / procedure selection ──
    const _schedAvail = React.useCallback((scheds: typeof facilitySchedules) => {
        const today = new Date();
        let totalSlots = 0;
        let totalBooked = 0;
        for (const s of scheds) {
            for (let i = 0; i < 30; i++) {
                const d = new Date(today); d.setDate(d.getDate() + i);
                if (!s.daysOfWeek.includes(d.getDay())) continue;
                const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const booked = s.bookedSlots[iso] ?? 0;
                totalSlots += s.dailyCap;
                totalBooked += Math.min(booked, s.dailyCap);
            }
        }
        const remaining = totalSlots - totalBooked;
        const pct = totalSlots > 0 ? totalBooked / totalSlots : 1;
        return { hasSchedule: scheds.length > 0, totalSlots, remaining, full: remaining === 0, limited: remaining > 0 && pct >= 0.8 };
    }, []);

    const branchAvailability = React.useMemo(() => {
        const map = new Map<string, ReturnType<typeof _schedAvail>>();
        for (const b of tenantBranches) {
            const catFilter = selectedCategory ? (s: typeof facilitySchedules[0]) => s.categoryId === selectedCategory.id : () => true;
            const procFilter = selectedProcedure ? (s: typeof facilitySchedules[0]) => !s.procedureName || s.procedureName === selectedProcedure : () => true;
            const scheds = facilitySchedules.filter(s => s.tenantId === tenant.id && s.branchId === b.id && catFilter(s) && procFilter(s));
            map.set(b.id, _schedAvail(scheds));
        }
        return map;
    }, [tenantBranches, facilitySchedules, tenant.id, selectedCategory, selectedProcedure, _schedAvail]);

    const categoryAvailability = React.useMemo(() => {
        const map = new Map<string, ReturnType<typeof _schedAvail>>();
        for (const cat of CATEGORIES) {
            const branchFilter = selectedBranch ? (s: typeof facilitySchedules[0]) => s.branchId === selectedBranch.id : () => true;
            const scheds = facilitySchedules.filter(s => s.tenantId === tenant.id && branchFilter(s) && s.categoryId === cat.id);
            map.set(cat.id, _schedAvail(scheds));
        }
        return map;
    }, [facilitySchedules, tenant.id, selectedBranch, _schedAvail]);

    const procedureAvailability = React.useMemo(() => {
        const map = new Map<string, ReturnType<typeof _schedAvail>>();
        if (!selectedCategory) return map;
        for (const proc of selectedCategory.procedures) {
            const branchFilter = selectedBranch ? (s: typeof facilitySchedules[0]) => s.branchId === selectedBranch.id : () => true;
            const scheds = facilitySchedules.filter(s => s.tenantId === tenant.id && branchFilter(s) && s.categoryId === selectedCategory.id && (!s.procedureName || s.procedureName === proc));
            map.set(proc, _schedAvail(scheds));
        }
        return map;
    }, [facilitySchedules, tenant.id, selectedBranch, selectedCategory, _schedAvail]);

    const AvailBadge: React.FC<{ info: ReturnType<typeof _schedAvail> }> = ({ info }) => {
        if (!info.hasSchedule) return <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#f1f5f9', color: '#94a3b8', fontWeight: 600 }}>No Schedule</span>;
        if (info.full) return <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#fef2f2', color: '#dc2626', fontWeight: 600, textDecoration: 'line-through' }}>Full This Month</span>;
        if (info.limited) return <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#fffbeb', color: '#d97706', fontWeight: 600 }}>{info.remaining} slots left</span>;
        return <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#f0fdf4', color: '#16a34a', fontWeight: 600 }}>{info.remaining} slots</span>;
    };

    const handleSuccess = () => {
        if (selectedProcedure && selectedBranch) {
            bookProcedure({
                category: selectedCategory?.title || 'Procedure',
                name: selectedProcedure,
                date: selectedDate,
                time: selectedTime,
                location: selectedBranch.name
            });

            // Patient-side appointment — shows in Upcoming Appointments
            addAppointment({
                doctor: 'Procedure Team',
                specialty: selectedCategory?.title || 'Procedure',
                date: selectedDate,
                time: selectedTime,
                type: 'In-Person',
                location: selectedBranch.name,
                notes: `Procedure: ${selectedProcedure}`,
            });

            // Provider-side appointment — shows in provider scheduling
            addProviderAppointment({
                doctor: 'Procedure Team',
                specialty: selectedCategory?.title || 'Procedure',
                date: selectedDate,
                time: selectedTime,
                status: 'Upcoming',
                type: 'In-Person',
                location: selectedBranch.name,
                patientName: userProfile?.name || 'Patient',
                patientId: userProfile?.id || 'p-self',
                chiefComplaint: selectedProcedure,
                notes: `Procedure booking: ${selectedProcedure} (${selectedCategory?.title || 'General'})`,
            });

            // Consume a slot on the facility schedule
            if (activeSchedule && selectedDate) {
                const pd = new Date(selectedDate);
                const isoStr = `${pd.getFullYear()}-${String(pd.getMonth() + 1).padStart(2, '0')}-${String(pd.getDate()).padStart(2, '0')}`;
                bookFacilitySlot(activeSchedule.id, isoStr);
            }

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
                {/* HomeCare cross-link — shown on step 1 only */}
                {step === 1 && tenant.features.visits.homeCareEnabled && (
                    <div className="hc-crosslink-banner" onClick={() => navigate('/visits/homecare')}>
                        <Home size={18} />
                        <div>
                            <strong>Prefer collection at home?</strong>
                            <span>Try HomeCare — we send a medical professional to your home or office.</span>
                        </div>
                        <ChevronRight size={16} className="chevron" />
                    </div>
                )}

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
                                    {tenantBranches.map(b => {
                                        const avail = branchAvailability.get(b.id);
                                        const isFull = avail?.full || !avail?.hasSchedule;
                                        return (
                                            <button key={b.id} className={`selection-card ${isFull ? 'unavailable' : ''}`}
                                                onClick={() => { if (!isFull) { setSelectedBranch(b); setStep(3); } }}
                                                style={isFull ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}>
                                                <MapPin size={24} className="icon-muted" />
                                                <div className="card-info">
                                                    <h4 style={isFull ? { textDecoration: 'line-through', color: 'var(--color-text-muted)' } : undefined}>{b.name}</h4>
                                                    <p>{b.address}</p>
                                                    {avail && <AvailBadge info={avail} />}
                                                </div>
                                                {!isFull && <ChevronRight className="chevron" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className="step-instruction">Select Procedure Category</h3>
                                <div className="preference-cards">
                                    {CATEGORIES.map(cat => {
                                        const avail = categoryAvailability.get(cat.id);
                                        const isFull = avail?.full || !avail?.hasSchedule;
                                        return (
                                            <button key={cat.id} className={`pref-card ${isFull ? 'unavailable' : ''}`}
                                                onClick={() => { if (!isFull) { setSelectedCategory(cat); setStep(3); } }}
                                                style={isFull ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}>
                                                <div className="pref-icon location"><cat.icon size={32} /></div>
                                                <div className="pref-text">
                                                    <h4 style={isFull ? { textDecoration: 'line-through' } : undefined}>{cat.title}</h4>
                                                    <p>{cat.description}</p>
                                                    {avail && <AvailBadge info={avail} />}
                                                </div>
                                                {!isFull && <ChevronRight className="pref-arrow" />}
                                            </button>
                                        );
                                    })}
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
                                    {CATEGORIES.map(cat => {
                                        const avail = categoryAvailability.get(cat.id);
                                        const isFull = avail?.full || !avail?.hasSchedule;
                                        return (
                                            <button key={cat.id} className={`pref-card ${isFull ? 'unavailable' : ''}`}
                                                onClick={() => { if (!isFull) { setSelectedCategory(cat); setStep(4); } }}
                                                style={isFull ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}>
                                                <div className="pref-icon location"><cat.icon size={32} /></div>
                                                <div className="pref-text">
                                                    <h4 style={isFull ? { textDecoration: 'line-through' } : undefined}>{cat.title}</h4>
                                                    <p>{cat.description}</p>
                                                    {avail && <AvailBadge info={avail} />}
                                                </div>
                                                {!isFull && <ChevronRight className="pref-arrow" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="context-banner">
                                    {selectedCategory && <selectedCategory.icon size={16} />} <span>Category: <strong>{selectedCategory?.title}</strong></span>
                                </div>
                                <h3 className="step-instruction">Choose Specific Procedure</h3>
                                <div className="procedure-list">
                                    {selectedCategory?.procedures.map(proc => {
                                        const avail = procedureAvailability.get(proc);
                                        const isFull = avail?.full;
                                        return (
                                            <button key={proc} className={`selection-card ${selectedProcedure === proc ? 'active' : ''} ${isFull ? 'unavailable' : ''}`}
                                                onClick={() => { if (!isFull) { setSelectedProcedure(proc); setStep(4); } }}
                                                style={isFull ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}>
                                                <div className="card-info">
                                                    <h4 style={isFull ? { textDecoration: 'line-through', color: 'var(--color-text-muted)' } : undefined}>{proc}</h4>
                                                    {avail && <AvailBadge info={avail} />}
                                                </div>
                                                {!isFull && <ChevronRight className="chevron" />}
                                            </button>
                                        );
                                    })}
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
                                    {selectedCategory?.procedures.map(proc => {
                                        const avail = procedureAvailability.get(proc);
                                        const isFull = avail?.full;
                                        return (
                                            <button key={proc} className={`selection-card ${selectedProcedure === proc ? 'active' : ''} ${isFull ? 'unavailable' : ''}`}
                                                onClick={() => { if (!isFull) { setSelectedProcedure(proc); setStep(5); } }}
                                                style={isFull ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}>
                                                <div className="card-info">
                                                    <h4 style={isFull ? { textDecoration: 'line-through', color: 'var(--color-text-muted)' } : undefined}>{proc}</h4>
                                                    {avail && <AvailBadge info={avail} />}
                                                </div>
                                                {!isFull && <ChevronRight className="chevron" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="context-banner">
                                    <CheckCircle size={16} /> <span>Procedure: <strong>{selectedProcedure}</strong></span>
                                </div>
                                <h3 className="step-instruction">Select a Location</h3>
                                <div className="list-grid">
                                    {tenantBranches.map(b => {
                                        const avail = branchAvailability.get(b.id);
                                        const isFull = avail?.full || !avail?.hasSchedule;
                                        return (
                                            <button key={b.id} className={`selection-card ${isFull ? 'unavailable' : ''}`}
                                                onClick={() => { if (!isFull) { setSelectedBranch(b); setStep(5); } }}
                                                style={isFull ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}>
                                                <MapPin size={24} className="icon-muted" />
                                                <div className="card-info">
                                                    <h4 style={isFull ? { textDecoration: 'line-through', color: 'var(--color-text-muted)' } : undefined}>{b.name}</h4>
                                                    <p>{b.address}</p>
                                                    {avail && <AvailBadge info={avail} />}
                                                </div>
                                                {!isFull && <ChevronRight className="chevron" />}
                                            </button>
                                        );
                                    })}
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
                            {/* Schedule info banner */}
                            {activeSchedule && (
                                <div className="schedule-info-banner" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)', marginBottom: 12, fontSize: '0.8rem', color: 'var(--color-primary-dark, var(--color-primary))' }}>
                                    <Clock size={14} />
                                    <span>
                                        {activeSchedule.startTime} – {activeSchedule.endTime} •
                                        {' '}{activeSchedule.slotDurationMin}min slots •
                                        {' '}{activeSchedule.dailyCap} slots/day •
                                        {' '}{activeSchedule.daysOfWeek.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}
                                    </span>
                                </div>
                            )}

                            {!activeSchedule && (
                                <div style={{ padding: '16px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.85rem', marginBottom: 12 }}>
                                    No schedule available for this procedure at the selected branch. Please try a different branch or procedure.
                                </div>
                            )}

                            {/* Calendar Grid */}
                            <div className="calendar-picker">
                                <div className="calendar-header-row">
                                    <Calendar size={16} />
                                    <span className="calendar-month">
                                        {new Date(Date.now() + 86400000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className="calendar-weekdays">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                        <span key={d} className="cal-weekday">{d}</span>
                                    ))}
                                </div>
                                <div className="calendar-grid">
                                    {(() => {
                                        const today = new Date();
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
                                            const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                            const isSelected = selectedDate === dateStr;
                                            const status = getDateStatus(dateObj);
                                            const isDisabled = isPast || !status.available;

                                            cells.push(
                                                <button
                                                    key={d}
                                                    className={`cal-day ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''} ${status.full && !isPast ? 'full' : ''} ${status.limited ? 'limited' : ''}`}
                                                    disabled={isDisabled}
                                                    onClick={() => { setSelectedDate(dateStr); setSelectedTime(''); }}
                                                    title={isPast ? 'Past date' : status.full ? 'Fully booked' : `${status.remaining} of ${status.total} slots remaining`}
                                                >
                                                    <span className="cal-day-num">{d}</span>
                                                    {!isPast && status.available && !status.limited && <span className="cal-dot available" />}
                                                    {!isPast && status.limited && <span className="cal-dot limited" />}
                                                    {!isPast && status.full && <span className="cal-dot full" />}
                                                    {!isPast && status.available && (
                                                        <span className="cal-remaining" style={{ fontSize: '0.55rem', color: status.limited ? '#d97706' : 'var(--color-success)', fontWeight: 700, lineHeight: 1 }}>
                                                            {status.remaining}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        }

                                        return cells;
                                    })()}
                                </div>
                                <div className="calendar-legend">
                                    <span><span className="cal-dot available" /> Available</span>
                                    <span><span className="cal-dot limited" /> Limited (&lt;20%)</span>
                                    <span><span className="cal-dot full" /> Full</span>
                                </div>
                            </div>

                            {/* Time Slots — generated from schedule */}
                            {selectedDate && activeSchedule && (() => {
                                const parsedDate = new Date(selectedDate);
                                const status = getDateStatus(parsedDate);
                                const slots = generateTimeSlots(activeSchedule);

                                return (
                                    <div className="time-slots-section animate-in">
                                        <div className="time-slots-header">
                                            <Clock size={16} />
                                            <span>Available times for <strong>{selectedDate}</strong></span>
                                            {status.limited && <span className="limited-badge">Limited — {status.remaining} slots left</span>}
                                            {!status.limited && <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>{status.remaining} of {status.total} slots remaining</span>}
                                        </div>
                                        <div className="time-slots-grid">
                                            {slots.map(t => (
                                                <button
                                                    key={t}
                                                    className={`time-slot-btn ${selectedTime === t ? 'selected' : ''}`}
                                                    onClick={() => setSelectedTime(t)}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Location info */}
                            <div className="confirm-card glass-card" style={{ marginTop: '0.5rem' }}>
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
                            <button className="btn-text" onClick={() => navigate('/dashboard')}>Back to Home</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
