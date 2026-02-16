import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Upload,
    FileText,
    User,
    MapPin,
    Calendar,
    Clock,
    CheckCircle,
    ChevronRight,
    Building2,
    Phone,
    Home,
    Briefcase,
    X,
    AlertCircle,
    Hourglass,
    ClipboardList,
    Globe,
    Droplet,
    FlaskConical,
    TestTube,
} from 'lucide-react';
import { BackButton } from '../components/Common/BackButton';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../theme/ThemeContext';
import { useData } from '../context/DataContext';
import { useProvider } from '../provider/context/ProviderContext';
import { getTenantBranches } from '../data/mockBranches';
import type { Branch } from '../data/mockBranches';
import type { DoctorRequest } from '../context/DataContext';
import './HomeCareBooking.css';

/* ── Types ── */
type AddressType = 'home' | 'office';
type ReferralSource = 'network' | 'upload' | null;

interface PatientInfo {
    name: string;
    mobile: string;
    addressType: AddressType;
    address: string;
}

interface DateSlot {
    date: string;
    time: string;
}

/* ── Steps (5 now — service step removed) ── */
const STEP_LABELS = [
    'Referral',
    'Information',
    'Facility',
    'Schedule',
    'Review',
];

const TOTAL_STEPS = STEP_LABELS.length;

/* ── Default time slots for HomeCare collection ── */
const HC_TIME_SLOTS = [
    '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM',
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '02:00 PM', '02:30 PM', '03:00 PM',
];

export const HomeCareBooking: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();
    const { tenant } = useTheme();
    const { doctorRequests, userProfile, addAppointment } = useData();
    const { addHomeCareRequest, addAppointment: addProviderAppointment } = useProvider();
    const tenantBranches = getTenantBranches(tenant.id, tenant.name);

    /* ── State ── */
    const [step, setStep] = useState(1);
    const [referralSource, setReferralSource] = useState<ReferralSource>(null);
    const [selectedRequests, setSelectedRequests] = useState<DoctorRequest[]>([]);
    const [referralFile, setReferralFile] = useState<string | null>(null);
    const [noReferral, setNoReferral] = useState(false);
    const [patientInfo, setPatientInfo] = useState<PatientInfo>({
        name: '',
        mobile: '',
        addressType: 'home',
        address: '',
    });
    const [selectedFacility, setSelectedFacility] = useState<Branch | null>(null);
    const [dateSlot1, setDateSlot1] = useState<DateSlot>({ date: '', time: '' });
    const [dateSlot2, setDateSlot2] = useState<DateSlot>({ date: '', time: '' });
    const [activeDateSlot, setActiveDateSlot] = useState<1 | 2>(1);

    /* ── Pre-select from route state (navigated from Results > Requests tab) ── */
    useEffect(() => {
        const state = location.state as { fromRequest?: DoctorRequest } | null;
        if (state?.fromRequest) {
            setReferralSource('network');
            setSelectedRequests([state.fromRequest]);
            // Clear state to avoid re-trigger on refresh
            window.history.replaceState({}, '');
        }
    }, [location.state]);

    /* ── Eligible requests for HomeCare (lab-only, pending, home-eligible) ── */
    const eligibleRequests = useMemo(() => {
        return doctorRequests.filter(
            r => r.homeCareEligible && r.status === 'Pending' && r.type === 'Laboratory'
        );
    }, [doctorRequests]);

    /* ── PCC branches ── */
    const pccBranches = useMemo(() => {
        return tenantBranches.filter(b => b.type === 'clinic' || b.services.some(s =>
            s.toLowerCase().includes('lab') || s.toLowerCase().includes('laboratory')
        ));
    }, [tenantBranches]);

    /* ── Derived service name from selected source ── */
    const serviceName = selectedRequests.length > 0
        ? selectedRequests.map(r => r.title).join(', ')
        : (referralFile ? `Per uploaded referral (${referralFile})` : 'External referral — pending confirmation');

    /* ── Specimen summary: group selected requests by specimen type ── */
    const specimenSummary = useMemo(() => {
        const grouped: Record<string, string[]> = {};
        for (const req of selectedRequests) {
            const spec = req.specimenType || 'Other';
            if (!grouped[spec]) grouped[spec] = [];
            grouped[spec].push(req.title);
        }
        return Object.entries(grouped);
    }, [selectedRequests]);

    /* ── Specimen icon helper ── */
    const specimenIcon = (type: string) => {
        switch (type) {
            case 'Blood': return <Droplet size={14} />;
            case 'Urine': return <FlaskConical size={14} />;
            case 'Stool': return <TestTube size={14} />;
            default: return <TestTube size={14} />;
        }
    };

    /* ── Navigation helpers ── */
    const goBack = () => {
        // Within referral sub-views, go back to source selection
        if (step === 1 && referralSource !== null) {
            setReferralSource(null);
            setSelectedRequests([]);
            return;
        }
        if (step > 1) setStep(step - 1);
        else navigate(-1);
    };

    const canProceed = (): boolean => {
        switch (step) {
            case 1: return !!(selectedRequests.length > 0 || referralFile || noReferral);
            case 2: return !!(patientInfo.name && patientInfo.mobile && patientInfo.address);
            case 3: return !!selectedFacility;
            case 4: return !!(dateSlot1.date && dateSlot1.time && dateSlot2.date && dateSlot2.time);
            case 5: return true;
            default: return false;
        }
    };

    const handleNext = () => {
        if (step < TOTAL_STEPS) {
            setStep(step + 1);
        } else if (step === TOTAL_STEPS) {
            // Push HomeCare request to provider context
            const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            addHomeCareRequest({
                patientName: patientInfo.name || userProfile?.name || 'Patient',
                patientId: userProfile?.id || 'p-self',
                mobile: patientInfo.mobile,
                address: patientInfo.address,
                addressType: patientInfo.addressType,
                branchId: selectedFacility?.id || '',
                branchName: selectedFacility?.name || '',
                referralSource: referralSource === 'network' ? 'network' : 'upload',
                requestTitles: selectedRequests.map(r => r.title),
                specimenTypes: [...new Set(selectedRequests.map(r => r.specimenType || 'Other'))],
                referralFile: referralFile || undefined,
                orderingDoctor: selectedRequests[0]?.doctor || undefined,
                preferredDate1: dateSlot1.date,
                preferredTime1: dateSlot1.time,
                preferredDate2: dateSlot2.date,
                preferredTime2: dateSlot2.time,
                status: 'Pending Review',
                submittedAt: now,
                updatedAt: now,
                priority: 'Routine',
            });

            // Patient-side appointment — shows in Upcoming Appointments
            addAppointment({
                doctor: selectedRequests[0]?.doctor || 'HomeCare Team',
                specialty: 'Laboratory',
                date: dateSlot1.date,
                time: dateSlot1.time,
                type: 'HomeCare',
                location: selectedFacility?.name || 'HomeCare',
                notes: `HomeCare: ${serviceName}`,
            });

            // Provider-side appointment for visibility
            addProviderAppointment({
                doctor: selectedRequests[0]?.doctor || 'HomeCare Team',
                specialty: 'Laboratory',
                date: dateSlot1.date,
                time: dateSlot1.time,
                status: 'Upcoming',
                type: 'HomeCare',
                location: selectedFacility?.name || 'HomeCare',
                patientName: patientInfo.name || userProfile?.name || 'Patient',
                patientId: userProfile?.id || 'p-self',
                chiefComplaint: `HomeCare: ${serviceName}`,
                notes: `HomeCare lab collection — ${selectedRequests.map(r => r.title).join(', ') || 'External referral'}`,
            });

            setStep(TOTAL_STEPS + 1);
            showToast('HomeCare request submitted!', 'success');
        }
    };

    const handleFileUpload = () => {
        setReferralFile('Doctor_Referral_2025.pdf');
        setNoReferral(false);
    };

    const handleToggleRequest = (req: DoctorRequest) => {
        setSelectedRequests(prev => {
            const exists = prev.find(r => r.id === req.id);
            if (exists) return prev.filter(r => r.id !== req.id);
            return [...prev, req];
        });
        setReferralFile(null);
        setNoReferral(false);
    };

    /* ── Calendar logic ── */
    const renderCalendar = (slotNum: 1 | 2) => {
        const slot = slotNum === 1 ? dateSlot1 : dateSlot2;
        const setSlot = slotNum === 1 ? setDateSlot1 : setDateSlot2;
        const otherSlot = slotNum === 1 ? dateSlot2 : dateSlot1;

        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() + 3);

        const firstDay = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const lastDay = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        const startPad = firstDay.getDay();
        const cells = [];

        for (let i = 0; i < startPad; i++) {
            cells.push(<span key={`pad-${i}`} className="cal-day pad" />);
        }

        for (let d = 1; d <= lastDay.getDate(); d++) {
            const dateObj = new Date(startDate.getFullYear(), startDate.getMonth(), d);
            const isPast = dateObj < startDate;
            const isWeekend = dateObj.getDay() === 0;
            const isDisabled = isPast || isWeekend;
            const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const isSelected = slot.date === dateStr;
            const isOtherSelected = otherSlot.date === dateStr;

            cells.push(
                <button
                    key={d}
                    className={`cal-day ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''} ${isOtherSelected ? 'other-selected' : ''}`}
                    disabled={isDisabled}
                    onClick={() => { setSlot({ date: dateStr, time: '' }); setActiveDateSlot(slotNum); }}
                >
                    <span className="cal-day-num">{d}</span>
                    {!isDisabled && !isOtherSelected && <span className="cal-dot available" />}
                    {isOtherSelected && <span className="cal-dot other" />}
                </button>
            );
        }

        return {
            monthLabel: startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            cells,
        };
    };

    /* ── RENDER ── */
    return (
        <div className="hc-booking-container">
            {/* Header */}
            {step <= TOTAL_STEPS && (
                <header className="page-header">
                    <BackButton onClick={goBack} />
                    <div className="header-text">
                        <h2>HomeCare Service</h2>
                        <p className="page-subtitle">Lab collection at your home or office</p>
                    </div>
                </header>
            )}

            <main className="hc-body">
                {/* Staged progress bar — under page header, above step content */}
                {step <= TOTAL_STEPS && (
                    <div className="hc-staged-progress">
                        <div className="hc-staged-track">
                            {STEP_LABELS.map((label, i) => {
                                const stepNum = i + 1;
                                const isDone = stepNum < step;
                                const isCurrent = stepNum === step;
                                return (
                                    <React.Fragment key={i}>
                                        {/* Connector line before (skip for first) */}
                                        {i > 0 && (
                                            <div className={`hc-staged-connector ${isDone || isCurrent ? 'filled' : ''}`} />
                                        )}
                                        <div className={`hc-staged-step ${isCurrent ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                                            <span className="hc-staged-circle">
                                                {isDone ? <CheckCircle size={14} /> : stepNum}
                                            </span>
                                            <span className="hc-staged-label">{label}</span>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                )}
                {/* ── Step 1: Referral Source ── */}
                {step === 1 && referralSource === null && (
                    <div className="step-content animate-in">
                        <h3 className="step-instruction">How do you have your doctor's request?</h3>
                        <p className="hc-hint">Select where the lab/procedure request is coming from.</p>

                        <div className="hc-source-cards">
                            <button className="hc-source-card" onClick={() => setReferralSource('network')}>
                                <div className="hc-source-icon network">
                                    <ClipboardList size={32} />
                                </div>
                                <div className="hc-source-text">
                                    <h4>From {tenant.name}</h4>
                                    <p>Select from doctor requests already in your records — issued by a doctor within our network.</p>
                                </div>
                                {eligibleRequests.length > 0 && (
                                    <span className="hc-source-badge">{eligibleRequests.length} pending</span>
                                )}
                                <ChevronRight size={18} className="hc-source-chevron" />
                            </button>

                            <button className="hc-source-card" onClick={() => setReferralSource('upload')}>
                                <div className="hc-source-icon upload">
                                    <Globe size={32} />
                                </div>
                                <div className="hc-source-text">
                                    <h4>Upload External Referral</h4>
                                    <p>Upload a referral from a doctor outside our network — a paper or digital copy.</p>
                                </div>
                                <ChevronRight size={18} className="hc-source-chevron" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Step 1a: Network — pick from doctor requests (multi-select) ── */}
                {step === 1 && referralSource === 'network' && (
                    <div className="step-content animate-in">
                        <h3 className="step-instruction">Select Doctor Requests</h3>
                        <p className="hc-hint">Select one or more pending lab/procedure orders to be fulfilled via HomeCare collection.</p>

                        {selectedRequests.length > 0 && (
                            <div className="hc-selection-summary">
                                <span className="hc-selection-count">{selectedRequests.length} selected</span>
                                {specimenSummary.map(([type]) => (
                                    <span key={type} className={`hc-specimen-chip ${type.toLowerCase()}`}>
                                        {specimenIcon(type)} {type}
                                    </span>
                                ))}
                            </div>
                        )}

                        {eligibleRequests.length === 0 ? (
                            <div className="hc-empty-requests">
                                <ClipboardList size={40} />
                                <p>No pending HomeCare-eligible requests found.</p>
                                <button className="btn-text" onClick={() => setReferralSource('upload')}>
                                    Upload an external referral instead
                                </button>
                            </div>
                        ) : (
                            <div className="hc-request-list">
                                {eligibleRequests.map(req => {
                                    const isSelected = selectedRequests.some(r => r.id === req.id);
                                    return (
                                        <button
                                            key={req.id}
                                            className={`hc-request-card ${isSelected ? 'active' : ''}`}
                                            onClick={() => handleToggleRequest(req)}
                                        >
                                            <div className="hc-req-header">
                                                <h4>{req.title}</h4>
                                                {isSelected
                                                    ? <CheckCircle size={18} className="check-icon" />
                                                    : <span className="hc-select-circle" />}
                                            </div>
                                            <span className="hc-req-meta">{req.date} • {req.doctor}</span>
                                            {req.notes && <p className="hc-req-notes">{req.notes}</p>}
                                            <div className="hc-req-badges">
                                                <span className="hc-req-type">{req.type}</span>
                                                <span className={`hc-req-priority ${req.priority.toLowerCase()}`}>{req.priority}</span>
                                                {req.specimenType && (
                                                    <span className={`hc-specimen-badge ${req.specimenType.toLowerCase()}`}>
                                                        {specimenIcon(req.specimenType)} {req.specimenType}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <button className="btn-next" disabled={selectedRequests.length === 0} onClick={handleNext}>
                            Continue ({selectedRequests.length}) <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {/* ── Step 1b: Upload — external referral ── */}
                {step === 1 && referralSource === 'upload' && (
                    <div className="step-content animate-in">
                        <h3 className="step-instruction">Upload Doctor Referral</h3>
                        <p className="hc-hint">Upload the referral/request form from your external doctor. This helps us prepare the right collection kit.</p>

                        <div className="hc-upload-zone" onClick={handleFileUpload}>
                            {referralFile ? (
                                <div className="hc-uploaded-file">
                                    <FileText size={32} />
                                    <div>
                                        <span className="hc-filename">{referralFile}</span>
                                        <span className="hc-filestatus">Uploaded successfully</span>
                                    </div>
                                    <button className="hc-remove-file" onClick={(e) => { e.stopPropagation(); setReferralFile(null); }}>
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="hc-upload-placeholder">
                                    <Upload size={40} />
                                    <span>Tap to upload referral</span>
                                    <span className="hc-upload-formats">PDF, JPG, PNG (max 10MB)</span>
                                </div>
                            )}
                        </div>

                        <label className="hc-checkbox-label">
                            <input
                                type="checkbox"
                                checked={noReferral}
                                onChange={(e) => { setNoReferral(e.target.checked); if (e.target.checked) setReferralFile(null); }}
                            />
                            <span>I don't have a referral yet — proceed without one</span>
                        </label>

                        {noReferral && (
                            <div className="hc-info-banner">
                                <AlertCircle size={16} />
                                <span>Without a referral, our team will contact you to confirm the specific tests needed before dispatching a collector.</span>
                            </div>
                        )}

                        <button className="btn-next" disabled={!referralFile && !noReferral} onClick={handleNext}>
                            Continue <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {/* ── Step 2: Patient Information & Address ── */}
                {step === 2 && (
                    <div className="step-content animate-in">
                        <h3 className="step-instruction">Confirm Your Information</h3>
                        <p className="hc-hint">Provide the address where the medical professional should go for specimen collection.</p>

                        {/* Show selected service summary */}
                        {selectedRequests.length > 0 ? (
                            <div className="hc-context-pills">
                                {selectedRequests.map(r => (
                                    <div key={r.id} className="hc-context-pill">
                                        <ClipboardList size={14} /> {r.title}
                                        {r.specimenType && <span className={`hc-specimen-badge sm ${r.specimenType.toLowerCase()}`}>{r.specimenType}</span>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="hc-context-pill">
                                <Upload size={14} /> {referralFile || 'No referral — pending confirmation'}
                            </div>
                        )}

                        <div className="hc-form-group">
                            <label className="hc-label"><User size={14} /> Full Name</label>
                            <input
                                className="hc-input"
                                value={patientInfo.name}
                                onChange={e => setPatientInfo({ ...patientInfo, name: e.target.value })}
                                placeholder="e.g. Andrea Reyes"
                            />
                        </div>

                        <div className="hc-form-group">
                            <label className="hc-label"><Phone size={14} /> Mobile Number</label>
                            <input
                                className="hc-input"
                                value={patientInfo.mobile}
                                onChange={e => setPatientInfo({ ...patientInfo, mobile: e.target.value })}
                                placeholder="e.g. 0917-555-1234"
                                type="tel"
                            />
                        </div>

                        <div className="hc-form-group">
                            <label className="hc-label">Address Type</label>
                            <div className="hc-address-type-row">
                                <button
                                    className={`hc-addr-btn ${patientInfo.addressType === 'home' ? 'active' : ''}`}
                                    onClick={() => setPatientInfo({ ...patientInfo, addressType: 'home' })}
                                >
                                    <Home size={18} /> Home Address
                                </button>
                                <button
                                    className={`hc-addr-btn ${patientInfo.addressType === 'office' ? 'active' : ''}`}
                                    onClick={() => setPatientInfo({ ...patientInfo, addressType: 'office' })}
                                >
                                    <Briefcase size={18} /> Office Address
                                </button>
                            </div>
                        </div>

                        <div className="hc-form-group">
                            <label className="hc-label"><MapPin size={14} /> Complete Address</label>
                            <textarea
                                className="hc-textarea"
                                value={patientInfo.address}
                                onChange={e => setPatientInfo({ ...patientInfo, address: e.target.value })}
                                rows={3}
                                placeholder={patientInfo.addressType === 'home'
                                    ? 'Unit/Floor, Building/House No., Street, Barangay, City'
                                    : 'Company Name, Floor/Unit, Building, Street, City'}
                            />
                        </div>

                        <button className="btn-next" disabled={!canProceed()} onClick={handleNext}>
                            Continue <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {/* ── Step 3: Select Preferred PCC Facility ── */}
                {step === 3 && (
                    <div className="step-content animate-in">
                        <h3 className="step-instruction">Select Preferred Facility</h3>
                        <p className="hc-hint">Choose the nearest or preferred Primary Care Center (PCC) that will dispatch the collection team to your location.</p>

                        <div className="list-grid">
                            {pccBranches.map(b => (
                                <button
                                    key={b.id}
                                    className={`selection-card ${selectedFacility?.id === b.id ? 'active' : ''}`}
                                    onClick={() => setSelectedFacility(b)}
                                >
                                    <Building2 size={24} className="icon-muted" />
                                    <div className="card-info">
                                        <h4>{b.name}</h4>
                                        <p>{b.address}</p>
                                        <span className="hc-distance">{b.distance} away</span>
                                    </div>
                                    {selectedFacility?.id === b.id
                                        ? <CheckCircle size={20} className="check-icon" />
                                        : <ChevronRight className="chevron" />}
                                </button>
                            ))}
                        </div>

                        <button className="btn-next" disabled={!canProceed()} onClick={handleNext}>
                            Continue <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {/* ── Step 4: Nominate 2 Date/Time Slots ── */}
                {step === 4 && (
                    <div className="step-content animate-in">
                        <h3 className="step-instruction">Nominate Preferred Dates</h3>
                        <p className="hc-hint">Please select <strong>two</strong> preferred dates and times. Our team will confirm the final schedule.</p>

                        <div className="hc-date-tabs">
                            <button
                                className={`hc-date-tab ${activeDateSlot === 1 ? 'active' : ''} ${dateSlot1.date && dateSlot1.time ? 'complete' : ''}`}
                                onClick={() => setActiveDateSlot(1)}
                            >
                                {dateSlot1.date && dateSlot1.time
                                    ? <><CheckCircle size={14} /> Option 1: {dateSlot1.date}</>
                                    : <>Option 1 {!dateSlot1.date && '(select date)'}</>}
                            </button>
                            <button
                                className={`hc-date-tab ${activeDateSlot === 2 ? 'active' : ''} ${dateSlot2.date && dateSlot2.time ? 'complete' : ''}`}
                                onClick={() => setActiveDateSlot(2)}
                            >
                                {dateSlot2.date && dateSlot2.time
                                    ? <><CheckCircle size={14} /> Option 2: {dateSlot2.date}</>
                                    : <>Option 2 {!dateSlot2.date && '(select date)'}</>}
                            </button>
                        </div>

                        {(() => {
                            const { monthLabel, cells } = renderCalendar(activeDateSlot);
                            const activeSlot = activeDateSlot === 1 ? dateSlot1 : dateSlot2;
                            const setActiveSlot = activeDateSlot === 1 ? setDateSlot1 : setDateSlot2;

                            return (
                                <>
                                    <div className="calendar-picker">
                                        <div className="calendar-header-row">
                                            <Calendar size={16} />
                                            <span className="calendar-month">{monthLabel}</span>
                                        </div>
                                        <div className="calendar-weekdays">
                                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                                <span key={d} className="cal-weekday">{d}</span>
                                            ))}
                                        </div>
                                        <div className="calendar-grid">{cells}</div>
                                        <div className="calendar-legend">
                                            <span><span className="cal-dot available" /> Available</span>
                                            <span><span className="cal-dot other" /> Other option</span>
                                        </div>
                                    </div>

                                    {activeSlot.date && (
                                        <div className="time-slots-section animate-in">
                                            <div className="time-slots-header">
                                                <Clock size={16} />
                                                <span>Select time for <strong>{activeSlot.date}</strong></span>
                                            </div>
                                            <div className="time-slots-grid">
                                                {HC_TIME_SLOTS.map(t => (
                                                    <button
                                                        key={t}
                                                        className={`time-slot-btn ${activeSlot.time === t ? 'selected' : ''}`}
                                                        onClick={() => setActiveSlot({ ...activeSlot, time: t })}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        })()}

                        <button className="btn-next" disabled={!canProceed()} onClick={handleNext}>
                            Continue to Review <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {/* ── Step 5: Review & Submit ── */}
                {step === 5 && (
                    <div className="step-content animate-in">
                        <h3 className="step-instruction">Review Your Request</h3>
                        <p className="hc-hint">Please review the details below before submitting.</p>

                        <div className="hc-review-card">
                            <div className="hc-review-section">
                                <h4>Service / Requests ({selectedRequests.length > 0 ? selectedRequests.length : 1})</h4>
                                {selectedRequests.length > 0 ? (
                                    <>
                                        <ul className="hc-review-request-list">
                                            {selectedRequests.map(r => (
                                                <li key={r.id}>
                                                    <span>{r.title}</span>
                                                    {r.specimenType && (
                                                        <span className={`hc-specimen-badge sm ${r.specimenType.toLowerCase()}`}>
                                                            {specimenIcon(r.specimenType)} {r.specimenType}
                                                        </span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                        <span className="hc-review-source-badge network">
                                            <ClipboardList size={11} /> In-network request{selectedRequests.length > 1 ? 's' : ''}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <p>{serviceName}</p>
                                        <span className="hc-review-source-badge upload">
                                            <Upload size={11} /> External referral
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Specimen Collection Summary */}
                            {specimenSummary.length > 0 && (
                                <div className="hc-review-section">
                                    <h4>Collection Summary</h4>
                                    <div className="hc-collection-summary">
                                        {specimenSummary.map(([type, tests]) => (
                                            <div key={type} className="hc-collection-row">
                                                <span className={`hc-specimen-badge ${type.toLowerCase()}`}>
                                                    {specimenIcon(type)} {type} draw
                                                </span>
                                                <span className="hc-collection-tests">{tests.join(', ')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="hc-review-section">
                                <h4>Referral</h4>
                                <p>{selectedRequests.length > 0
                                    ? selectedRequests.map(r => r.doctor).filter((v, i, a) => a.indexOf(v) === i).join(', ')
                                    : referralFile
                                        ? referralFile
                                        : 'No referral uploaded — team will contact for confirmation'}
                                </p>
                            </div>

                            <div className="hc-review-section">
                                <h4>Patient Information</h4>
                                <div className="hc-review-row"><User size={14} /><span>{patientInfo.name}</span></div>
                                <div className="hc-review-row"><Phone size={14} /><span>{patientInfo.mobile}</span></div>
                                <div className="hc-review-row">
                                    {patientInfo.addressType === 'home' ? <Home size={14} /> : <Briefcase size={14} />}
                                    <span>{patientInfo.addressType === 'home' ? 'Home' : 'Office'}: {patientInfo.address}</span>
                                </div>
                            </div>

                            <div className="hc-review-section">
                                <h4>Dispatching Facility</h4>
                                <div className="hc-review-row"><Building2 size={14} /><span>{selectedFacility?.name}</span></div>
                                <div className="hc-review-row"><MapPin size={14} /><span>{selectedFacility?.address}</span></div>
                            </div>

                            <div className="hc-review-section">
                                <h4>Preferred Schedule</h4>
                                <div className="hc-schedule-options">
                                    <div className="hc-sched-option">
                                        <span className="hc-sched-label">Option 1</span>
                                        <span>{dateSlot1.date} at {dateSlot1.time}</span>
                                    </div>
                                    <div className="hc-sched-option">
                                        <span className="hc-sched-label">Option 2</span>
                                        <span>{dateSlot2.date} at {dateSlot2.time}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="hc-info-banner">
                            <AlertCircle size={16} />
                            <span>After submitting, our team will review your request and confirm the final schedule. You will receive an SMS and in-app notification.</span>
                        </div>

                        <button className="btn-confirm" onClick={handleNext}>
                            Submit HomeCare Request
                        </button>
                    </div>
                )}

                {/* ── Step 6: Pending Confirmation ── */}
                {step === TOTAL_STEPS + 1 && (
                    <div className="step-content success-content animate-in">
                        <div className="hc-pending-icon">
                            <Hourglass size={64} />
                        </div>
                        <h3>Request Submitted</h3>
                        <p className="hc-pending-status">Your HomeCare request is now <strong>Pending Review</strong>.</p>
                        <p className="text-muted" style={{ fontSize: '0.9rem', maxWidth: '320px', margin: '0 auto' }}>
                            An admin from <strong>{selectedFacility?.name}</strong> will review your request and confirm the schedule or reach out for any clarifications.
                        </p>

                        <div className="hc-pending-details">
                            <div className="hc-pending-row">
                                <span className="hc-pending-label">Service{selectedRequests.length > 1 ? 's' : ''}</span>
                                <span>{serviceName}</span>
                            </div>
                            <div className="hc-pending-row">
                                <span className="hc-pending-label">Source</span>
                                <span>{selectedRequests.length > 0 ? `In-network (${selectedRequests.length} request${selectedRequests.length > 1 ? 's' : ''})` : 'External referral'}</span>
                            </div>
                            <div className="hc-pending-row">
                                <span className="hc-pending-label">Location</span>
                                <span>{patientInfo.addressType === 'home' ? 'Home' : 'Office'} — {patientInfo.address.substring(0, 40)}...</span>
                            </div>
                            <div className="hc-pending-row">
                                <span className="hc-pending-label">Preferred Dates</span>
                                <span>{dateSlot1.date} or {dateSlot2.date}</span>
                            </div>
                            <div className="hc-pending-row">
                                <span className="hc-pending-label">Status</span>
                                <span className="hc-status-badge pending">Pending</span>
                            </div>
                        </div>

                        <div className="next-steps-card">
                            <h4>What Happens Next</h4>
                            <ul>
                                <li>Our team reviews your request and referral within 24 hours</li>
                                <li>You will receive an SMS confirmation with the assigned date and collector details</li>
                                <li>On the day of collection, a certified medical technologist will arrive at your location</li>
                                <li>Results will be available on your patient portal within 24-48 hours</li>
                            </ul>
                        </div>

                        <div className="success-actions">
                            <button className="btn-primary" onClick={() => navigate('/appointments')}>View Appointments</button>
                            <button className="btn-text" onClick={() => navigate('/visits')}>Back to Care Services</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
