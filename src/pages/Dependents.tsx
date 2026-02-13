import React, { useState } from 'react';
import { useData, type Dependent } from '../context/DataContext';
import { BackButton } from '../components/Common/BackButton';
import { UserPlus, Shield, ChevronRight, User, Heart, UserCircle, X } from 'lucide-react';
import './Profile.css';

export const Dependents: React.FC = () => {
    const { dependents, userProfile, addDependent } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', relation: '', birthDate: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.relation && formData.birthDate) {
            addDependent({
                name: formData.name,
                relation: formData.relation,
                birthDate: formData.birthDate,
                idNumber: 'PENDING'
            });
            setIsModalOpen(false);
            setFormData({ name: '', relation: '', birthDate: '' });
        }
    };

    return (
        <div className="profile-container detail-page">
            <header className="page-header">
                <BackButton />
                <div className="header-text">
                    <h2 style={{ fontSize: '1.25rem' }}>Manage Dependents</h2>
                    <p className="page-subtitle">Family members covered under your plan</p>
                </div>
            </header>

            {/* Principal Holder Info */}
            <div className="principal-summary">
                <div className="principal-avatar">
                    <UserCircle size={32} />
                </div>
                <div className="principal-text">
                    <span className="principal-label">Principal Member</span>
                    <span className="principal-name">{userProfile?.name}</span>
                </div>
                <div className="plan-badge">GOLD</div>
            </div>

            <section className="dependents-section">
                <div className="section-header">
                    <h3>Your Dependents ({dependents.length})</h3>
                    <button className="add-dep-btn" onClick={() => setIsModalOpen(true)}>
                        <UserPlus size={16} />
                        Add New
                    </button>
                </div>

                <div className="dependents-list">
                    {dependents.length > 0 ? (
                        dependents.map((dep: Dependent) => (
                            <div key={dep.id} className="dependent-card-premium">
                                <div className="dep-avatar">
                                    <User size={24} />
                                </div>
                                <div className="dep-info">
                                    <div className="dep-header">
                                        <h4>{dep.name}</h4>
                                        <span className="dep-relation">{dep.relation}</span>
                                    </div>
                                    <div className="dep-meta">
                                        <span>Birth Date: {new Date(dep.birthDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        <span>ID: {dep.idNumber}</span>
                                    </div>
                                </div>
                                <button className="dep-action">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="empty-dependents">
                            <Heart size={48} className="empty-icon" />
                            <p>No dependents enrolled yet</p>
                            <span>Share your health benefits with your family</span>
                        </div>
                    )}
                </div>
            </section>

            {/* Add Dependent Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content premium-modal">
                        <div className="modal-header">
                            <h3>Add Dependent</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="premium-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter full name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Relationship</label>
                                <select
                                    value={formData.relation}
                                    onChange={e => setFormData({ ...formData, relation: e.target.value })}
                                    required
                                >
                                    <option value="">Select Relation</option>
                                    <option value="Spouse">Spouse</option>
                                    <option value="Son">Son</option>
                                    <option value="Daughter">Daughter</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Father">Father</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Birth Date</label>
                                <input
                                    type="date"
                                    value={formData.birthDate}
                                    onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-submit">Enroll Dependent</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <section className="profile-section">
                <div className="coverage-alert">
                    <Shield size={20} />
                    <div className="alert-content">
                        <strong>Coverage Information</strong>
                        <p>Dependents share the same room & board and outpatient limits as the principal member.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};
