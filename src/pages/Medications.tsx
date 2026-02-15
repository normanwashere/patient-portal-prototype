import React from 'react';
import { Pill, AlertCircle, RefreshCw, Calendar, Check, FileText, Printer, X, ClipboardList, Activity, Heart, Stethoscope, AlertTriangle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../theme/ThemeContext';
import { BackButton } from '../components/Common/BackButton';
import './Results.css';
import './Medications.css';

// ── In-Person Procedure Orders ──
interface ProcedureOrder {
    id: string;
    name: string;
    type: 'procedure';
    doctor: string;
    specialization: string;
    scheduledDate: string;
    location: string;
    status: 'Scheduled' | 'Pending Approval';
    instructions: string;
}

const procedureOrders: ProcedureOrder[] = [
    {
        id: 'proc-1',
        name: 'Cardiac Stress Test',
        type: 'procedure',
        doctor: 'Dr. Albert Go',
        specialization: 'Cardiology',
        scheduledDate: 'Mar 15, 2026',
        location: 'Heart Center, 3F',
        status: 'Scheduled',
        instructions: 'No caffeine 24 hours prior. Wear comfortable clothing and sneakers.',
    },
    {
        id: 'proc-2',
        name: 'Colonoscopy',
        type: 'procedure',
        doctor: 'Dr. Rahn Lim',
        specialization: 'Gastroenterology',
        scheduledDate: 'Apr 2, 2026',
        location: 'Endoscopy Suite, 2F',
        status: 'Pending Approval',
        instructions: 'Clear liquid diet 24 hours before. Complete bowel prep as instructed.',
    },
];

// ── Prescription detail mappings (mock enrichment) ──
const prescriptionDetails: Record<string, {
    doctor: string;
    license: string;
    specialization: string;
    frequency: string;
    duration: string;
    quantity: string;
    refills: number;
    specialInstructions: string;
}> = {
    'm1': { doctor: 'Dr. Albert Go', license: 'PRC-0085321', specialization: 'Cardiology', frequency: 'Once daily at bedtime', duration: '90 days', quantity: '90 tablets', refills: 2, specialInstructions: 'Take with or without food. Avoid grapefruit juice. Report any unexplained muscle pain or weakness immediately.' },
    'm2': { doctor: 'Dr. Albert Go', license: 'PRC-0085321', specialization: 'Cardiology', frequency: 'Once daily after breakfast', duration: '30 days', quantity: '30 tablets', refills: 3, specialInstructions: 'Do not stop abruptly. Take consistently at the same time daily. Report any unusual bleeding or bruising.' },
    'm3': { doctor: 'Dr. Jen Diaz', license: 'PRC-0091247', specialization: 'Endocrinology', frequency: 'Twice a day with meals', duration: '60 days', quantity: '120 tablets', refills: 2, specialInstructions: 'Take with food to minimize gastric irritation. Monitor blood glucose regularly. Avoid excessive alcohol intake.' },
    'm4': { doctor: 'Dr. Sarah Lee', license: 'PRC-0078456', specialization: 'Occupational Health', frequency: 'Once daily with breakfast', duration: '30 days', quantity: '30 tablets', refills: 5, specialInstructions: 'May be taken with or without food.' },
    'm5': { doctor: 'Dr. Sarah Lee', license: 'PRC-0078456', specialization: 'Occupational Health', frequency: 'Twice daily', duration: '30 days', quantity: '60 tablets', refills: 5, specialInstructions: 'Best absorbed on an empty stomach, but may be taken with food if stomach upset occurs.' },
    'm6': { doctor: 'Dr. Michael Tan', license: 'PRC-0082130', specialization: 'Pediatrics', frequency: 'Every 4-6 hours as needed', duration: '7 days', quantity: '1 bottle (60ml)', refills: 0, specialInstructions: 'Do not exceed 4 doses in 24 hours. Use the measuring cup provided. Shake well before use.' },
    'm7': { doctor: 'Dr. Michael Tan', license: 'PRC-0082130', specialization: 'Pediatrics', frequency: 'Twice daily for 7 days', duration: '7 days', quantity: '14 tablets', refills: 0, specialInstructions: 'Complete the full course of antibiotics even if feeling better. Take at evenly spaced intervals.' },
    'm8': { doctor: 'Dr. Carmela Ong', license: 'PRC-0076893', specialization: 'Internal Medicine', frequency: 'Once daily in the morning', duration: '90 days', quantity: '90 tablets', refills: 3, specialInstructions: 'Monitor blood pressure regularly. Avoid potassium supplements and salt substitutes. Stay hydrated.' },
    'm9': { doctor: 'Dr. Carmela Ong', license: 'PRC-0076893', specialization: 'Internal Medicine', frequency: 'Once daily', duration: '90 days', quantity: '90 softgels', refills: 5, specialInstructions: 'Take with a meal containing fat for better absorption.' },
};

const defaultRxDetail = {
    doctor: 'Dr. Attending Physician',
    license: 'PRC-0000000',
    specialization: 'General Practice',
    frequency: 'As directed',
    duration: '30 days',
    quantity: '30 units',
    refills: 1,
    specialInstructions: 'Take as directed by your physician. Follow up if symptoms persist.',
};

export const Medications: React.FC = () => {
    const { medications, requestRefill, notifications, markAsRead, userProfile } = useData();
    const { showToast } = useToast();
    const { tenant } = useTheme();
    const [selectedMed, setSelectedMed] = React.useState<any | null>(null);
    const [rxModalMed, setRxModalMed] = React.useState<any | null>(null);

    // Auto-mark notifications as read
    React.useEffect(() => {
        const unread = notifications.filter(n => !n.read && (n.link === '/medications' || n.title.toLowerCase().includes('prescription') || n.title.toLowerCase().includes('refill')));
        unread.forEach(n => markAsRead(n.id));
    }, [notifications, markAsRead]);

    const handleRefill = (med: any) => {
        requestRefill(med.id);
        showToast(`Refill requested for ${med.name}`, 'success');
    };

    const handlePrint = () => {
        showToast('Printing prescription...', 'info');
        setTimeout(() => window.print(), 300);
    };

    const openRxModal = (med: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setRxModalMed(med);
    };

    const rxDetail = rxModalMed ? (prescriptionDetails[rxModalMed.id] || defaultRxDetail) : null;
    const patientName = userProfile?.name || 'Patient';
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className="results-container">
            <header className="page-header">
                <BackButton />
                <div className="header-text">
                    <h2>My Medications</h2>
                    <p className="page-subtitle">Prescriptions, orders &amp; scheduled procedures</p>
                </div>
            </header>

            <div className="info-box" style={{ background: '#ecfdf5', color: '#065f46' }}>
                <AlertCircle size={18} />
                <p>Your prescriptions are synced from your doctor's latest records.</p>
            </div>

            {/* ── Medications Section ── */}
            <div className="results-list">
                {medications.map(med => (
                    <div
                        key={med.id}
                        className="result-card"
                        onClick={() => setSelectedMed(med)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="result-icon laboratory" style={{ background: '#fef3c7', color: '#d97706' }}>
                            <Pill size={24} />
                        </div>
                        <div className="result-info">
                            <div className="result-title-row">
                                <h4>{med.name} {med.dosage}</h4>
                                {med.status === 'Low Stock' && (
                                    <span className="badge-critical" style={{ background: '#fee2e2', color: '#ef4444' }}>Low Stock</span>
                                )}
                                {med.status === 'Refill Requested' && (
                                    <span className="badge-critical" style={{ background: '#d1fae5', color: '#065f46' }}>Requested</span>
                                )}
                            </div>
                            <span className="result-meta">{med.instruction}</span>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: '#666', flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Pill size={14} /> {med.remaining} left
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Calendar size={14} /> Refill: {med.refillDate}
                                </span>
                            </div>
                        </div>

                        <div className="med-card-actions">
                            <button
                                className="btn-view-rx"
                                onClick={(e) => openRxModal(med, e)}
                                title="View e-Prescription"
                            >
                                <FileText size={14} />
                                View Rx
                            </button>
                            <button
                                className="btn-icon"
                                onClick={(e) => { e.stopPropagation(); handleRefill(med); }}
                                disabled={med.status === 'Refill Requested'}
                                style={{ opacity: med.status === 'Refill Requested' ? 0.5 : 1 }}
                            >
                                {med.status === 'Refill Requested' ? (
                                    <Check size={20} color="var(--color-primary)" />
                                ) : (
                                    <RefreshCw size={20} color={med.status === 'Low Stock' ? '#ef4444' : 'var(--color-primary)'} />
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── In-Person Procedure Orders ── */}
            {procedureOrders.length > 0 && (
                <>
                    <div className="med-section-divider">
                        <span>Procedure Orders</span>
                    </div>
                    <div className="results-list">
                        {procedureOrders.map(proc => (
                            <div key={proc.id} className="result-card" style={{ cursor: 'default' }}>
                                <div className="result-icon procedure-card-icon">
                                    {proc.name.includes('Cardiac') || proc.name.includes('Stress') ? (
                                        <Heart size={24} />
                                    ) : proc.name.includes('Colonoscopy') || proc.name.includes('Endoscopy') ? (
                                        <Activity size={24} />
                                    ) : (
                                        <Stethoscope size={24} />
                                    )}
                                </div>
                                <div className="result-info">
                                    <div className="result-title-row">
                                        <h4>{proc.name}</h4>
                                        <span className="procedure-type-badge">
                                            <ClipboardList size={10} /> Procedure
                                        </span>
                                        {proc.status === 'Scheduled' ? (
                                            <span className="procedure-scheduled-badge">Scheduled</span>
                                        ) : (
                                            <span className="procedure-pending-badge">Pending</span>
                                        )}
                                    </div>
                                    <span className="result-meta">
                                        {proc.doctor} · {proc.specialization}
                                    </span>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: '#666', flexWrap: 'wrap' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={14} /> {proc.scheduledDate}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            📍 {proc.location}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.35rem 0 0', lineHeight: 1.45 }}>
                                        <AlertTriangle size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                        {proc.instructions}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {medications.length === 0 && procedureOrders.length === 0 && (
                <div className="empty-state">
                    <Pill size={48} color="#e5e7eb" />
                    <p>No active medications or procedure orders.</p>
                </div>
            )}

            {/* ── Quick-View Details Modal (existing) ── */}
            {selectedMed && (
                <div className="modal-overlay" onClick={() => setSelectedMed(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Prescription Details</h3>
                            <button className="close-btn" onClick={() => setSelectedMed(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ padding: '1rem 0' }}>
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary)' }}>{selectedMed.name} {selectedMed.dosage}</h4>
                                <p style={{ margin: 0, fontSize: '0.95rem' }}>{selectedMed.instruction}</p>
                            </div>

                            <p><strong>Remaining Qty:</strong> {selectedMed.remaining}</p>
                            <p><strong>Refill Date:</strong> {selectedMed.refillDate}</p>
                            <p><strong>Status:</strong> {selectedMed.status}</p>

                            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                                <h5 style={{ margin: '0 0 0.5rem 0' }}>Doctor&apos;s Notes:</h5>
                                <p style={{ fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic' }}>
                                    &quot;Take with food to avoid gastric irritation. Monitor BP daily.&quot;
                                </p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-view-rx"
                                style={{ padding: '0.6rem 1rem', fontSize: '0.82rem' }}
                                onClick={() => { setSelectedMed(null); setRxModalMed(selectedMed); }}
                            >
                                <FileText size={15} /> View e-Prescription
                            </button>
                            <button className="btn-secondary" onClick={() => setSelectedMed(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── E-Prescription Modal ── */}
            {rxModalMed && rxDetail && (
                <div className="rx-modal-overlay" onClick={() => setRxModalMed(null)}>
                    <div className="rx-modal" onClick={e => e.stopPropagation()}>
                        <div className="rx-modal-scroll">
                            {/* Clinic Header */}
                            <div className="rx-header">
                                <div className="rx-watermark">℞</div>
                                <div className="rx-rx-symbol">℞</div>
                                <h2 className="rx-clinic-name">{tenant.name}</h2>
                                <p className="rx-clinic-tagline">
                                    {tenant.tagline || 'Electronic Prescription'}
                                </p>
                            </div>

                            {/* Doctor Info */}
                            <div className="rx-doctor-info">
                                <p className="rx-doctor-name">{rxDetail.doctor}</p>
                                <p className="rx-doctor-detail">{rxDetail.specialization}</p>
                                <p className="rx-doctor-detail">License No. {rxDetail.license}</p>
                            </div>

                            {/* Patient Info */}
                            <div className="rx-patient-row">
                                <div className="rx-patient-field">
                                    <span className="rx-patient-label">Patient</span>
                                    <span className="rx-patient-value">{patientName}</span>
                                </div>
                                <div className="rx-patient-field">
                                    <span className="rx-patient-label">Date</span>
                                    <span className="rx-patient-value">{today}</span>
                                </div>
                                <div className="rx-patient-field">
                                    <span className="rx-patient-label">Rx No.</span>
                                    <span className="rx-patient-value">RX-{rxModalMed.id.toUpperCase()}-{new Date().getFullYear()}</span>
                                </div>
                            </div>

                            {/* Prescription Details */}
                            <div className="rx-body">
                                <div className="rx-body-watermark">℞</div>
                                <div className="rx-section-title">
                                    <Pill size={14} /> Prescription
                                </div>
                                <div className="rx-med-block">
                                    <p className="rx-med-name">{rxModalMed.name} {rxModalMed.dosage}</p>
                                    <div className="rx-med-grid">
                                        <div>
                                            <div className="rx-med-field-label">Dosage</div>
                                            <div className="rx-med-field-value">{rxModalMed.dosage}</div>
                                        </div>
                                        <div>
                                            <div className="rx-med-field-label">Frequency</div>
                                            <div className="rx-med-field-value">{rxDetail.frequency}</div>
                                        </div>
                                        <div>
                                            <div className="rx-med-field-label">Duration</div>
                                            <div className="rx-med-field-value">{rxDetail.duration}</div>
                                        </div>
                                        <div>
                                            <div className="rx-med-field-label">Quantity</div>
                                            <div className="rx-med-field-value">{rxDetail.quantity}</div>
                                        </div>
                                        <div>
                                            <div className="rx-med-field-label">Refills</div>
                                            <div className="rx-med-field-value">{rxDetail.refills}</div>
                                        </div>
                                        <div>
                                            <div className="rx-med-field-label">Route</div>
                                            <div className="rx-med-field-value">Oral</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Special Instructions */}
                            <div className="rx-instructions">
                                <div className="rx-instructions-title">
                                    <AlertTriangle size={12} /> Special Instructions
                                </div>
                                <p className="rx-instructions-text">{rxDetail.specialInstructions}</p>
                            </div>

                            {/* Digital Signature */}
                            <div className="rx-signature">
                                <div className="rx-sig-line">{rxDetail.doctor}</div>
                                <div className="rx-sig-label">Prescribing Physician</div>
                                <div className="rx-sig-license">License No. {rxDetail.license} · Digitally Signed</div>
                            </div>
                        </div>

                        {/* Footer with Print & Close */}
                        <div className="rx-modal-footer">
                            <button className="rx-btn-print" onClick={handlePrint}>
                                <Printer size={16} /> Print Prescription
                            </button>
                            <button className="rx-btn-close" onClick={() => setRxModalMed(null)}>
                                <X size={16} /> Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
