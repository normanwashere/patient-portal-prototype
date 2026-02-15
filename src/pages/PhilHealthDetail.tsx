import React from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../theme/ThemeContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { Shield, ExternalLink, Info, Calendar, CheckCircle, Hospital, ClipboardList, Pill } from 'lucide-react';

import './Profile.css';

export const PhilHealthDetail: React.FC = () => {
    const { tenant } = useTheme();
    const { userProfile } = useData();
    const { showToast } = useToast();
    const navigate = useNavigate();

    // Redirect if PhilHealth feature is not enabled
    if (!tenant.features.philHealth) return <Navigate to="/coverage" replace />;
    const ph = userProfile?.philHealth;

    // UHC / Konsulta Benefits Data
    const diagnostics = [
        "CBC with Platelet Count", "Urinalysis", "Fecalysis", "Sputum Microscopy",
        "Lipid Profile", "Fasting Blood Sugar", "Chest X-Ray", "ECG"
    ];

    const medicines = [
        "Anti-hypertensives", "Anti-diabetics", "Anti-asthma", "Antibiotics", "Anti-pyretics"
    ];

    return (
        <div className="profile-container detail-page">
            <header className="page-header">

                <div className="header-text">
                    <h2>PhilHealth Profile</h2>
                    <p className="page-subtitle">Konsulta coverage and account details</p>
                </div>
            </header>

            {/* PhilHealth ID Card Visualization */}
            <section className="ph-id-card">
                <div className="ph-card-inner">
                    <div className="ph-card-header">
                        <div className="ph-logo">
                            <div className="ph-ring"></div>
                            <span>PhilHealth</span>
                        </div>
                        <span className="ph-label">Member Data Record</span>
                    </div>

                    <div className="ph-card-body">
                        <div className="ph-number">
                            {ph?.membershipNumber || '12-345678901-2'}
                        </div>
                        <div className="ph-name">
                            {userProfile?.name.toUpperCase()}
                        </div>
                        <div className="ph-meta">
                            <div className="ph-meta-item">
                                <label>Category</label>
                                <span>{ph?.category || 'Direct Contributor'}</span>
                            </div>
                            <div className="ph-meta-item">
                                <label>Status</label>
                                <span className={`ph-status ${ph?.status?.toLowerCase() || 'active'}`}>{ph?.status || 'Active'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="ph-card-footer">
                        <span>Republic of the Philippines</span>
                        <Shield size={16} />
                    </div>
                </div>
            </section>

            {/* Konsulta Provider Section */}
            <section className="profile-section">
                <div className="section-header-v2">
                    <h3>Konsulta PC Provider</h3>
                    <span className="badge-uhc">UHC Benefit</span>
                </div>
                <div className="pc-clinic-card">
                    <div className="pc-clinic-icon">
                        <Hospital size={24} />
                    </div>
                    <div className="pc-clinic-info">
                        <span className="pc-clinic-name">{ph?.konsultaProvider || 'Not Enrolled'}</span>
                        <span className="pc-clinic-label">Primary Care Provider (PC Clinic)</span>
                    </div>
                    <div className="fpe-status">
                        <span className="fpe-label">FPE Status</span>
                        <span className={`fpe-value ${ph?.fpeStatus?.toLowerCase().replace(/\s+/g, '-') || 'pending'}`}>
                            {ph?.fpeStatus || 'Pending'}
                        </span>
                    </div>
                </div>
            </section>

            <section className="profile-section">
                <div className="section-header-v2">
                    <h3>Konsulta Package Benefits</h3>
                </div>
                <div className="benefits-grid-uhc">
                    <div className="uhc-benefit-group">
                        <div className="uhc-benefit-header">
                            <ClipboardList size={18} />
                            <span>13 Diagnostic Tests</span>
                        </div>
                        <div className="uhc-tag-list">
                            {diagnostics.map(d => <span key={d} className="uhc-tag">{d}</span>)}
                            <span className="uhc-tag-more">+5 more</span>
                        </div>
                    </div>
                    <div className="uhc-benefit-group">
                        <div className="uhc-benefit-header">
                            <Pill size={18} />
                            <span>21 Essential Medicines</span>
                        </div>
                        <div className="uhc-tag-list">
                            {medicines.map(m => <span key={m} className="uhc-tag">{m}</span>)}
                            <span className="uhc-tag-more">+16 more</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="profile-section">
                <div className="section-header-v2">
                    <h3>Eligibility & Validity</h3>
                </div>
                <div className="info-card-premium">
                    <div className="info-item">
                        <CheckCircle size={20} className="info-icon" style={{ color: '#059669' }} />
                        <div className="info-text">
                            <span className="info-label">UHC Inclusion</span>
                            <span className="info-value">Automatic (Guaranteed)</span>
                        </div>
                    </div>
                    <div className="info-item">
                        <Calendar size={20} className="info-icon" />
                        <div className="info-text">
                            <span className="info-label">Membership Validity</span>
                            <span className="info-value">Verified until Dec 2024</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="profile-section">
                <div className="section-header-v2">
                    <h3>Actions</h3>
                </div>
                <div className="menu-list-v2">
                    <button className="menu-item-v2" onClick={() => navigate('/appointments/book')}>
                        <div className="icon-v2"><Calendar size={18} /></div>
                        <div className="menu-text">
                            <span className="menu-title">Book PC Consultation</span>
                            <span className="menu-desc">Schedule your First Patient Encounter (FPE)</span>
                        </div>
                    </button>
                    <button className="menu-item-v2" onClick={() => showToast('Konsulta User Guide will open in a new tab', 'info')}>
                        <div className="icon-v2"><Info size={18} /></div>
                        <div className="menu-text">
                            <span className="menu-title">Konsulta User Guide</span>
                            <span className="menu-desc">How to avail free diagnostic and lab tests</span>
                        </div>
                    </button>
                    <button className="menu-item-v2" onClick={() => showToast('Redirecting to PhilHealth Member Portal...', 'info')}>
                        <div className="icon-v2"><ExternalLink size={18} /></div>
                        <div className="menu-text">
                            <span className="menu-title">PhilHealth Member Portal</span>
                            <span className="menu-desc">Official government portal access</span>
                        </div>
                    </button>
                </div>
            </section>

            <div className="profile-footer-meta">
                <Shield size={14} />
                <span>Verified by PhilHealth National Database</span>
                <span className="meta-dot"></span>
                <span>ID {ph?.membershipNumber || '12-345678901-2'}</span>
            </div>
        </div>
    );
};
