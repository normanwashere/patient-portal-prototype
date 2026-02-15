import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Clock, User, CheckCircle } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

const SERVICES = ['General Consultation', 'Cardiology', 'Pediatrics', 'Dental'];
const DOCTORS = [
    { id: 1, name: 'Dr. Sarah Smith', specialty: 'General Practice', available: 'Today, 2:00 PM' },
    { id: 2, name: 'Dr. John Doe', specialty: 'General Practice', available: 'Today, 4:30 PM' },
    { id: 3, name: 'Dr. Emily Chen', specialty: 'Cardiology', available: 'Tomorrow, 9:00 AM' },
];

import './Appointments.css';

export const Appointments: React.FC = () => {
    const { tenant } = useTheme();
    const navigate = useNavigate();
    const [step, setStep] = React.useState(1);
    const [selectedService, setSelectedService] = React.useState('');
    const [selectedDoctor, setSelectedDoctor] = React.useState<any>(null);

    const handleBook = () => {
        setStep(4); // Success
    };

    return (
        <div className="appointments-container">
            <header className="page-header">
                <div className="header-text">
                    <h2 style={{ fontSize: '1.25rem' }}>Book Appointment</h2>
                </div>
            </header>

            {/* Step 1: Select Service */}
            {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>Select Service</h3>
                    {SERVICES.map(service => (
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
                    <button className="btn-text" onClick={() => setStep(1)} style={{ alignSelf: 'flex-start', paddingLeft: 0 }}>← Back to Services</button>
                    <h3 style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>Select Doctor for {selectedService}</h3>
                    {DOCTORS.map(doc => (
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
                    <button className="btn-text" onClick={() => setStep(2)} style={{ alignSelf: 'flex-start', paddingLeft: 0 }}>← Back to Doctors</button>
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
