import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Shield, Gift, Activity, Plus } from 'lucide-react';

import { useData } from '../context/DataContext';
import { useTheme } from '../theme/ThemeContext';
import { ServiceCard } from '../components/ServiceCard/ServiceCard';
import { useBadges } from '../hooks/useBadges';
import './HubPage.css';
import './Profile.css'; // Reuse some ID card styles

export const Financial: React.FC = () => {
    const navigate = useNavigate();
    const { userProfile, addHMOCard } = useData();
    const { tenant } = useTheme();
    const { financeBadge } = useBadges();
    const hasHmo = tenant.features.hmo ?? false;
    const hasPhilHealth = tenant.features.philHealth ?? false;
    const [showAddModal, setShowAddModal] = React.useState(false);
    const [newProvider, setNewProvider] = React.useState('');
    const [accountName, setAccountName] = React.useState('');
    const [accountNumber, setAccountNumber] = React.useState('');

    const ph = userProfile?.philHealth;
    const hmos = userProfile?.hmoCards || [];
    const wellness = userProfile?.wellnessBenefits || [];

    const handleAddHMO = () => {
        if (!newProvider || !accountName || !accountNumber) return;
        addHMOCard({
            provider: newProvider,
            accountName,
            accountNumber,
            memberNo: accountNumber, // Use account number as member no for simulation
            planType: 'Comprehensive Care',
            validity: '2026-12-31',
            coverageAmount: '₱ 100,000.00',
            usedAmount: '₱ 0.00'
        });
        setNewProvider('');
        setAccountName('');
        setAccountNumber('');
        setShowAddModal(false);
    };

    return (
        <div className="financial-container">
            <header className="page-header">

                <div className="header-text">
                    <h2>Coverage & Claims</h2>
                    <p className="page-subtitle">
                        {hasHmo && hasPhilHealth ? 'Manage your HMO, PhilHealth and authorizations' :
                            hasHmo ? 'Manage your HMO coverage and authorizations' :
                                hasPhilHealth ? 'Manage your PhilHealth coverage' :
                                    'Manage your billing and payments'}
                    </p>
                </div>
            </header>

            {(hasHmo || hasPhilHealth) && (
                <section className="finance-section">
                    <div className="section-header-v2">
                        <h3>Your Coverage</h3>
                        <span className="badge-uhc">{(hasHmo ? hmos.length : 0) + (hasPhilHealth && ph ? 1 : 0)} Active Plans</span>
                    </div>

                    <div className="coverage-scroll-container">
                        {/* PhilHealth Card */}
                        {hasPhilHealth && (
                            <div className="mini-hmo-card ph-mini" onClick={() => navigate('/coverage/philhealth', { state: { from: '/coverage' } })}>
                                <div className="mini-card-header">
                                    <Shield size={16} />
                                    <span>PhilHealth UHC</span>
                                </div>
                                <div className="mini-card-body">
                                    <div className="mini-benefit-summary">
                                        <span className="label">MBL: {ph?.mbl || '₱ 0.00'}</span>
                                        <div className="mini-progress-bar">
                                            <div className="fill" style={{ width: ph?.mbl && ph?.mblUsed ? `${(parseFloat(ph.mblUsed.replace(/[^\d.]/g, '')) / parseFloat(ph.mbl.replace(/[^\d.]/g, ''))) * 100}%` : '0%' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mini-card-footer">
                                    <span className={`status-dot ${ph?.status === 'Active' ? 'active' : ''}`}></span>
                                    <span>{ph?.status || 'Active'}</span>
                                </div>
                            </div>
                        )}

                        {/* HMO Cards */}
                        {hasHmo && hmos.map(hmo => (
                            <div key={hmo.id} className={`mini-hmo-card hmo-accent ${hmo.status === 'Pending' ? 'pending' : ''}`} onClick={() => hmo.status === 'Active' ? navigate(`/benefits?id=${hmo.id}`) : null}>
                                <div className="mini-card-header">
                                    <CreditCard size={16} />
                                    <span>{hmo.provider}</span>
                                    {hmo.status === 'Pending' && <span className="pending-badge">Pending</span>}
                                </div>
                                <div className="mini-card-body">
                                    <div className="mini-benefit-summary">
                                        <span className="label">MBL: {hmo.mbl}</span>
                                        <div className="mini-progress-bar">
                                            <div className="fill" style={{ width: hmo.mbl && hmo.mblUsed ? `${(parseFloat(hmo.mblUsed.replace(/[^\d.]/g, '')) / parseFloat(hmo.mbl.replace(/[^\d.]/g, ''))) * 100}%` : '0%' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mini-card-footer">
                                    <Activity size={12} />
                                    <span>{hmo.status === 'Pending' ? 'Awaiting Approval' : hmo.planType}</span>
                                </div>
                            </div>
                        ))}

                        {/* Add HMO Action - only if HMO feature is enabled */}
                        {hasHmo && (
                            <div className="mini-hmo-card add-hmo-card" onClick={() => setShowAddModal(true)}>
                                <div className="add-hmo-content">
                                    <Plus size={24} />
                                    <span>Link New Provider</span>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Link New Provider</h3>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}><Plus size={20} style={{ transform: 'rotate(45deg)' }} /></button>
                        </div>
                        <div className="form-group" style={{ marginTop: '1rem' }}>
                            <label>HMO Provider</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g. Medicard, IntelliCare"
                                value={newProvider}
                                onChange={(e) => setNewProvider(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="form-group" style={{ marginTop: '0.75rem' }}>
                            <label>Account Name</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Full Name as shown in HMO"
                                value={accountName}
                                onChange={(e) => setAccountName(e.target.value)}
                            />
                        </div>
                        <div className="form-group" style={{ marginTop: '0.75rem' }}>
                            <label>Account / Member Number</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter account number"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                            />
                        </div>
                        <div className="modal-disclaimer" style={{ marginTop: '1rem' }}>
                            <p>You will be redirected to the provider's portal for authentication.</p>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                            <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleAddHMO} disabled={!newProvider || !accountName || !accountNumber}>Submit for Approval</button>
                        </div>
                    </div>
                </div>
            )}

            {wellness.length > 0 && userProfile?.company.includes('MERALCO') && (
                <section className="finance-section">
                    <div className="section-header-v2">
                        <h3>Meralco Employee Wellness Benefits</h3>
                    </div>
                    <div className="wellness-list">
                        {wellness.map(benefit => (
                            <div key={benefit.id} className="wellness-item-card">
                                <div className="wellness-icon">
                                    <Gift size={20} />
                                </div>
                                <div className="wellness-info">
                                    <span className="wellness-title">{benefit.type}</span>
                                    <span className="wellness-desc">{benefit.description}</span>
                                </div>
                                <div className="wellness-value">
                                    <span className="benefit-balance">{benefit.balance}</span>
                                    <span className="benefit-validity">{benefit.validity}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="finance-section" style={{ marginTop: '1.5rem' }}>
                <div className="section-header-v2">
                    <h3>Billing & Services</h3>
                </div>
                <div className="hub-grid">
                    <ServiceCard
                        title="Billing History"
                        description="View past invoices, statements, and payments."
                        icon={<CreditCard size={24} />}
                        onClick={() => navigate('/billing')}
                        colorTheme="orange"
                        badge={financeBadge}
                        actionLabel="View Bills"
                        backgroundImage="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600"
                    />
                </div>
            </section>
        </div>
    );
};
