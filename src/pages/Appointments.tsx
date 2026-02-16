import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../components/Common/BackButton';
import { Clock, User, CheckCircle } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

const TENANT_SERVICES: Record<string, string[]> = {
    maxicare: ['Internal Medicine', 'Family Medicine', 'Cardiology', 'OB-GYN', 'Dermatology', 'Pediatrics'],
    metroGeneral: ['General Consultation', 'Cardiology', 'Pediatrics', 'OB-GYN', 'Dental', 'Dermatology'],
    default: ['General Consultation', 'Cardiology', 'Pediatrics', 'Dental'],
};

const TENANT_DOCTORS: Record<string, { id: number; name: string; specialty: string; available: string }[]> = {
    maxicare: [
        { id: 1, name: 'Dr. Carmela Ong', specialty: 'Internal Medicine', available: 'Today, 2:00 PM' },
        { id: 2, name: 'Dr. Jen Diaz', specialty: 'Family Medicine', available: 'Today, 4:30 PM' },
        { id: 3, name: 'Dr. Ramon Bautista', specialty: 'Cardiology', available: 'Tomorrow, 9:00 AM' },
        { id: 4, name: 'Dr. Patricia Santos', specialty: 'OB-GYN', available: 'Tomorrow, 10:30 AM' },
        { id: 5, name: 'Dr. Maria Cruz', specialty: 'Dermatology', available: addDaysStr(2) + ', 1:00 PM' },
        { id: 6, name: 'Dr. Leo Villanueva', specialty: 'Pediatrics', available: addDaysStr(3) + ', 9:00 AM' },
    ],
    metroGeneral: [
        { id: 1, name: 'Dr. Ricardo Santos', specialty: 'Cardiology', available: 'Today, 10:00 AM' },
        { id: 2, name: 'Dr. Maria Clara Reyes', specialty: 'Pediatrics', available: 'Today, 1:00 PM' },
        { id: 3, name: 'Dr. Albert Go', specialty: 'OB-GYN', available: 'Tomorrow, 9:00 AM' },
        { id: 4, name: 'Dr. Carmen Diaz', specialty: 'Dermatology', available: 'Tomorrow, 2:00 PM' },
        { id: 5, name: 'Dr. Elena Martinez', specialty: 'General Consultation', available: addDaysStr(2) + ', 10:00 AM' },
        { id: 6, name: 'Dr. Thomas Ramos', specialty: 'Dental', available: addDaysStr(2) + ', 3:00 PM' },
    ],
    default: [
        { id: 1, name: 'Dr. Sarah Smith', specialty: 'General Practice', available: 'Today, 2:00 PM' },
        { id: 2, name: 'Dr. John Doe', specialty: 'General Practice', available: 'Today, 4:30 PM' },
        { id: 3, name: 'Dr. Emily Chen', specialty: 'Cardiology', available: 'Tomorrow, 9:00 AM' },
    ],
};

function addDaysStr(n: number) {
    const d = new Date(); d.setDate(d.getDate() + n);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

import './Appointments.css';

export const Appointments: React.FC = () => {
    const { tenant } = useTheme();
    const navigate = useNavigate();
    const [step, setStep] = React.useState(1);
    const [selectedService, setSelectedService] = React.useState('');
    const [selectedDoctor, setSelectedDoctor] = React.useState<any>(null);

    const services = TENANT_SERVICES[tenant.id] ?? TENANT_SERVICES.default;
    const doctors = TENANT_DOCTORS[tenant.id] ?? TENANT_DOCTORS.default;
    const filteredDoctors = doctors.filter(d => d.specialty === selectedService || !selectedService);

    const handleBook = () => {
        setStep(4); // Success
    };

    return (
        <div className="appointments-container">
            <header className="page-header">
                <BackButton onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} />
                <div className="header-text">
                    <h2 style={{ fontSize: '1.25rem' }}>Book Appointment</h2>
                </div>
            </header>

            {/* Step 1: Select Service */}
            {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>Select Service</h3>
                    {services.map(service => (
                        <button
                            key={service}
                            onClick={() => { setSelectedService(service); setStep(2); }}
                            style={{
                                padding: '1rem',
                                textAlign: 'left',
                                background: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius)',
                                fontWeight: 500,
                                color: 'var(--color-text)'
                            }}
                        >
                            {service}
                        </button>
                    ))}
                </div>
            )}

            {/* Step 2: Select Doctor */}
            {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>Select Doctor for {selectedService}</h3>
                    {(filteredDoctors.length > 0 ? filteredDoctors : doctors).map(doc => (
                        <button
                            key={doc.id}
                            onClick={() => { setSelectedDoctor(doc); setStep(3); }}
                            style={{
                                padding: '1rem',
                                textAlign: 'left',
                                background: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}
                        >
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={20} color="var(--color-text-muted)" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{doc.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{doc.specialty}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                    <Clock size={12} /> {doc.available}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Confirm Booking</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div><strong>Service:</strong> {selectedService}</div>
                            <div><strong>Doctor:</strong> {selectedDoctor?.name}</div>
                            <div><strong>Time:</strong> {selectedDoctor?.available}</div>
                            <div><strong>Location:</strong> {tenant.name} Main Clinic</div>
                        </div>
                    </div>

                    <button
                        onClick={handleBook}
                        style={{
                            padding: '1rem',
                            background: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius)',
                            fontWeight: 600,
                            fontSize: '1rem'
                        }}
                    >
                        Confirm Booking
                    </button>
                </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
                    <CheckCircle size={64} color="var(--color-primary)" style={{ marginBottom: '1.5rem' }} />
                    <h2>Booking Confirmed!</h2>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                        Your appointment with {selectedDoctor?.name} is confirmed.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            padding: '0.75rem 2rem',
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius)',
                            color: 'var(--color-text)'
                        }}
                    >
                        Back to Home
                    </button>
                </div>
            )}
        </div>
    );
};
