import React from 'react';
import { Pill, AlertCircle, RefreshCw, Calendar, Check } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

import './Results.css';

export const Medications: React.FC = () => {
    const { medications, requestRefill, notifications, markAsRead } = useData();
    const { showToast } = useToast();
    const [selectedMed, setSelectedMed] = React.useState<any | null>(null);

    // Auto-mark notifications as read
    React.useEffect(() => {
        const unread = notifications.filter(n => !n.read && (n.link === '/medications' || n.title.toLowerCase().includes('prescription') || n.title.toLowerCase().includes('refill')));
        unread.forEach(n => markAsRead(n.id));
    }, [notifications, markAsRead]);

    const handleRefill = (med: any) => {
        requestRefill(med.id);
        showToast(`Refill requested for ${med.name}`, 'success');
    };

    return (
        <div className="results-container">
            <header className="page-header">

                <div className="header-text">
                    <h2>My Medications</h2>
                    <p className="page-subtitle">Prescriptions and scheduled treatments</p>
                </div>
            </header>

            <div className="info-box" style={{ background: '#ecfdf5', color: '#065f46' }}>
                <AlertCircle size={18} />
                <p>Your prescriptions are synced from your doctor's latest records.</p>
            </div>

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
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Pill size={14} /> {med.remaining} left
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Calendar size={14} /> Refill: {med.refillDate}
                                </span>
                            </div>
                        </div>

                        {/* Ops Hat: Refill Action */}
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
                ))}
            </div>

            {medications.length === 0 && (
                <div className="empty-state">
                    <Pill size={48} color="#e5e7eb" />
                    <p>No active medications.</p>
                </div>
            )}

            {/* View Details Modal */}
            {selectedMed && (
                <div className="modal-overlay" onClick={() => setSelectedMed(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Prescription Details</h3>
                            <button className="close-btn" onClick={() => setSelectedMed(null)}>
                                <Check size={20} style={{ transform: 'rotate(45deg)' }} />
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
                                <h5 style={{ margin: '0 0 0.5rem 0' }}>Doctor's Notes:</h5>
                                <p style={{ fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic' }}>
                                    "Take with food to avoid gastric irritation. Monitor BP daily."
                                </p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setSelectedMed(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
