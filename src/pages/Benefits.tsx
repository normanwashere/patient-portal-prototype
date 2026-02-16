import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { FileText, Plus, X, CreditCard, Shield, QrCode, ClipboardList, Wallet, Receipt, ChevronRight, Info, CheckCircle2, Clock, AlertTriangle, ShieldCheck, RefreshCw, Infinity } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useProvider } from '../provider/context/ProviderContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../theme/ThemeContext';
import { BackButton } from '../components/Common/BackButton';
import './Benefits.css';

// Importing assets if needed, but we'll use a placeholder for QR now or generated one
import memberQr from '../assets/member-qr.png';

type ServiceType = {
    id: string;
    label: string;
    description: string;
    estimatedAmount: string;
};

const HMO_SERVICES: ServiceType[] = [
    { id: 'Specialist Consultation', label: 'Specialist Consultation', description: 'Outpatient visit with a medical specialist', estimatedAmount: '₱ 1,200.00' },
    { id: 'Laboratory & Diagnostics', label: 'Laboratory & Diagnostics', description: 'X-rays, blood tests, and imaging', estimatedAmount: '₱ 3,500.00' },
    { id: 'Emergency Care', label: 'Emergency Care / ER', description: 'Urgent treatment for accidents or sudden illness', estimatedAmount: '₱ 8,000.00' },
    { id: 'In-patient Admission', label: 'In-patient Admission', description: 'Hospital confinement and room board', estimatedAmount: '₱ 25,000.00' },
    { id: 'Surgical Procedure', label: 'Surgical Procedure', description: 'Minor or major surgical operations', estimatedAmount: '₱ 50,000.00' },
    { id: 'Physical Therapy', label: 'Physical Therapy', description: 'Rehabilitation and therapy sessions', estimatedAmount: '₱ 1,500.00' },
];

const PHILHEALTH_SERVICES: ServiceType[] = [
    { id: 'Primary Care Consultation', label: 'Primary Care Consultation (Konsulta)', description: 'First contact visit with PC Provider', estimatedAmount: '₱ 500.00' },
    { id: 'UHC Laboratory Test', label: 'UHC Laboratory Test', description: 'Standard diagnostics covered by UHC package', estimatedAmount: '₱ 1,000.00' },
    { id: 'In-patient Subsidy', label: 'In-patient Case Rate', description: 'Fixed subsidy for hospital confinement', estimatedAmount: '₱ 15,000.00' },
];



export const Benefits: React.FC = () => {
    const { tenant } = useTheme();
    const { loaRequests, requestLOA, userProfile, claims, fileClaim, currentPatientId } = useData();
    const { addProviderLoa } = useProvider();
    const { showToast } = useToast();
    const location = useLocation();
    const navigate = useNavigate();

    // Redirect if HMO feature is not enabled
    if (!tenant.features.hmo) return <Navigate to="/coverage" replace />;
    const queryParams = new URLSearchParams(location.search);
    const hmoIdParam = queryParams.get('id');
    const [activeTab, setActiveTab] = useState<'overview' | 'claims'>('overview');
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showCardModal, setShowCardModal] = useState(false);

    // Active Provider for the Overview tab
    const hmos = userProfile?.hmoCards || [];
    const ph = userProfile?.philHealth;
    const [activeProviderId, setActiveProviderId] = useState('');

    // Form state for LOA modal
    const [selectedHmoId, setSelectedHmoId] = useState('');
    const [selectedServiceId, setSelectedServiceId] = useState('');

    // Consumer package filter state
    const [packageFilter, setPackageFilter] = useState<'All' | 'Available' | 'Availed' | 'Deferred'>('All');

    // Set active provider — re-evaluate when patient/tenant/cards change
    useEffect(() => {
        // If URL has an id param AND it matches a card the current patient owns, use it
        if (hmoIdParam && hmos.some((h: any) => h.id === hmoIdParam)) {
            setActiveProviderId(hmoIdParam);
        } else if (hmos.length > 0) {
            setActiveProviderId(hmos[0].id);
        } else if (ph) {
            setActiveProviderId('philhealth');
        } else {
            setActiveProviderId('');
        }
        setPackageFilter('All');
    }, [currentPatientId, tenant.id, hmos, ph, hmoIdParam]);

    // Derived services based on modal selection
    const availableServices = useMemo(() => {
        return selectedHmoId === 'philhealth' ? PHILHEALTH_SERVICES : HMO_SERVICES;
    }, [selectedHmoId]);

    // Set default modal selection when opened
    useEffect(() => {
        if (showRequestModal && hmos.length > 0 && !selectedHmoId) {
            setSelectedHmoId(hmos[0].id);
        }
    }, [showRequestModal, hmos]);

    // Reset modal service when coverage changes
    useEffect(() => {
        if (availableServices.length > 0) {
            setSelectedServiceId(availableServices[0].id);
        }
    }, [availableServices]);

    // Get active provider data for the UI
    const activeProviderData = useMemo(() => {
        if (activeProviderId === 'philhealth') {
            return {
                provider: 'PhilHealth',
                mbl: ph?.mbl || '₱ 0.00',
                mblUsed: ph?.mblUsed || '₱ 0.00',
                benefitCategories: ph?.benefitCategories || [],
                isPhilHealth: true,
                packageType: undefined as string | undefined,
                packageItems: [] as any[]
            };
        }
        const hmo = hmos.find((h: any) => h.id === activeProviderId);
        return {
            provider: hmo?.provider || 'Unknown',
            planType: hmo?.planType || '',
            coverageAmount: hmo?.coverageAmount || '',
            validity: hmo?.validity || '',
            mbl: hmo?.mbl || '₱ 0.00',
            mblUsed: hmo?.mblUsed || '₱ 0.00',
            benefitCategories: hmo?.benefitCategories || [],
            isPhilHealth: false,
            packageType: hmo?.packageType as string | undefined,
            packageItems: (hmo?.packageItems || []) as any[]
        };
    }, [activeProviderId, hmos, ph]);

    const filteredPackageItems = useMemo(() => {
        const items = activeProviderData.packageItems || [];
        if (packageFilter === 'All') return items;
        return items.filter((item: any) => item.status === packageFilter);
    }, [activeProviderData.packageItems, packageFilter]);

    const packageStats = useMemo(() => {
        const items = activeProviderData.packageItems || [];
        const total = items.length;
        const availed = items.filter((i: any) => i.status === 'Availed').length;
        const available = items.filter((i: any) => i.status === 'Available').length;
        const deferred = items.filter((i: any) => i.status === 'Deferred').length;
        const active = items.filter((i: any) => i.status === 'Active').length;
        return { total, availed, available, deferred, active };
    }, [activeProviderData.packageItems]);

    const groupedPackageItems = useMemo(() => {
        const groups: Record<string, any[]> = {};
        filteredPackageItems.forEach((item: any) => {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
        });
        return groups;
    }, [filteredPackageItems]);

    const filteredLoaRequests = useMemo(() => {
        return loaRequests.filter(req => {
            if (activeProviderId === 'philhealth') return req.provider.toLowerCase().includes('philhealth');
            const hmo = hmos.find(h => h.id === activeProviderId);
            return hmo && req.provider.toLowerCase().includes(hmo.provider.toLowerCase() || '');
        });
    }, [activeProviderId, loaRequests, hmos]);

    const handleRequestSubmit = () => {
        const providerName = activeProviderData.provider === 'PhilHealth' ? 'PhilHealth UHC' : activeProviderData.provider;
        const service = availableServices.find(s => s.id === selectedServiceId);
        const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        requestLOA({
            provider: providerName,
            type: service?.label || selectedServiceId,
            date: now,
            amount: service?.estimatedAmount || '₱ 0.00'
        });

        addProviderLoa({
            patientName: userProfile?.name || 'Patient',
            patientId: userProfile?.id || 'p-self',
            type: service?.label || selectedServiceId,
            provider: providerName,
            requestDate: now,
            amount: service?.estimatedAmount || '₱ 0.00',
            status: 'Pending',
            diagnosis: '',
            justification: '',
        });

        showToast(`LOA Request for ${providerName} submitted!`, 'success');
        setShowRequestModal(false);
    };

    const handleFileClaim = () => {
        const type = 'Medical Reimbursement';
        const activeProvider = [...hmos, ...(ph ? [{ id: 'philhealth', provider: 'PhilHealth' }] : [])].find(h => h.id === activeProviderId);
        const providerLabel = (activeProvider as any)?.provider || activeProvider?.id || 'Medical Center';
        fileClaim({
            provider: providerLabel,
            type,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            amount: '₱ 4,500.00'
        });
        showToast('Reimbursement claim filed successfully!', 'success');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved':
            case 'Processed': return 'text-green-600 bg-green-50';
            case 'Pending':
            case 'In Review': return 'text-yellow-600 bg-yellow-50';
            case 'Rejected': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="benefits-container">
            <header className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <BackButton to="/coverage" />
                    <div>
                        <h2>LOA & Benefits</h2>
                        <p className="page-subtitle" style={{ marginTop: '0.25rem' }}>Management and history of authorizations</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary card-btn" onClick={() => setShowCardModal(true)}>
                        <QrCode size={18} />
                        <span>Digital Card</span>
                    </button>
                    {activeProviderId !== 'philhealth' && (
                        <button className="btn-primary" onClick={() => setShowRequestModal(true)}>
                            <Plus size={18} />
                            <span>Request LOA</span>
                        </button>
                    )}
                    {activeProviderId === 'philhealth' && (
                        <button className="btn-primary-outline" onClick={() => navigate('/coverage/philhealth')}>
                            <Info size={18} />
                            <span>Konsulta Info</span>
                        </button>
                    )}
                </div>
            </header>

            <div className="tab-navigation">
                <button
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview & LOA
                </button>
                <button
                    className={`tab-btn ${activeTab === 'claims' ? 'active' : ''}`}
                    onClick={() => setActiveTab('claims')}
                >
                    Reimbursements
                </button>
            </div>

            {activeTab === 'overview' ? (
                <>
                    <div className="provider-indicator">
                        {activeProviderId === 'philhealth' ? <Shield size={16} /> : <CreditCard size={16} />}
                        <span>{activeProviderData.provider}</span>
                        {activeProviderData.packageType === 'consumer' && (
                            <span className="package-type-badge consumer">Consumer Package</span>
                        )}
                        {activeProviderData.packageType === 'corporate' && (
                            <span className="package-type-badge corporate">Corporate Plan</span>
                        )}
                    </div>

                    {activeProviderData.packageType === 'consumer' ? (
                        /* ========== CONSUMER PACKAGE VIEW ========== */
                        <>
                            <div className="consumer-package-header">
                                <div className="dashlabs-sync-badge">
                                    <RefreshCw size={13} />
                                    <span>Dashlabs Sync</span>
                                    <span className="sync-time">Last synced: 2 hours ago</span>
                                </div>
                            </div>

                            <div className="consumer-package-summary">
                                <div className="progress-ring-container">
                                    <svg className="progress-ring" viewBox="0 0 120 120">
                                        <circle className="progress-ring-bg" cx="60" cy="60" r="52" />
                                        <circle
                                            className="progress-ring-fill"
                                            cx="60" cy="60" r="52"
                                            strokeDasharray={`${2 * Math.PI * 52}`}
                                            strokeDashoffset={`${2 * Math.PI * 52 * (1 - packageStats.availed / Math.max(packageStats.total, 1))}`}
                                        />
                                    </svg>
                                    <div className="progress-ring-text">
                                        <span className="ring-count">{packageStats.availed}</span>
                                        <span className="ring-total">/ {packageStats.total} availed</span>
                                    </div>
                                </div>
                                <div className="package-summary-details">
                                    <h3>{activeProviderData.planType || 'Consumer Package'}</h3>
                                    <p className="package-summary-sub">
                                        {activeProviderData.coverageAmount && <strong>{activeProviderData.coverageAmount}</strong>}
                                        {activeProviderData.coverageAmount && ' · '}
                                        Valid {activeProviderData.validity || '1 year from activation'}
                                    </p>
                                    <p className="package-summary-desc">Unlimited consultations across 20+ specialties, diagnostics, Set A lab tests, X-rays, ECG, and 3 advanced imaging tests at Maxicare PCCs nationwide.</p>
                                    <div className="package-stat-pills">
                                        <span className="stat-pill availed">{packageStats.availed} Availed</span>
                                        <span className="stat-pill available">{packageStats.available} Available</span>
                                        {packageStats.deferred > 0 && <span className="stat-pill deferred">{packageStats.deferred} Deferred</span>}
                                        {packageStats.active > 0 && <span className="stat-pill active">{packageStats.active} Active</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="package-filter-tabs">
                                {(['All', 'Available', 'Availed', 'Deferred'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        className={`package-filter-btn ${packageFilter === tab ? 'active' : ''}`}
                                        onClick={() => setPackageFilter(tab)}
                                    >
                                        {tab}
                                        {tab !== 'All' && (
                                            <span className="filter-count">
                                                {tab === 'Availed' ? packageStats.availed :
                                                 tab === 'Available' ? packageStats.available :
                                                 packageStats.deferred}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="package-checklist">
                                {Object.keys(groupedPackageItems).length > 0 ? (
                                    Object.entries(groupedPackageItems).map(([category, items]) => (
                                        <div key={category} className="package-category-group">
                                            <h4 className="package-category-label">{category}</h4>
                                            <div className="package-items-list">
                                                {items.map((item: any) => {
                                                    const isUnlimited = item.limit === 0;
                                                    const isAvailed = item.status === 'Availed';
                                                    const isAvailable = item.status === 'Available';
                                                    const isDeferred = item.status === 'Deferred';
                                                    const isActive = item.status === 'Active';

                                                    return (
                                                    <div key={item.id} className={`package-checklist-item status-${item.status.toLowerCase()}`}>
                                                        <div className="checklist-status-icon">
                                                            {isAvailed && <CheckCircle2 size={18} />}
                                                            {isAvailable && <Clock size={18} />}
                                                            {isDeferred && <AlertTriangle size={18} />}
                                                            {isActive && <ShieldCheck size={18} />}
                                                        </div>
                                                        <div className="checklist-item-content">
                                                            <div className="checklist-item-header">
                                                                <span className="checklist-item-name">{item.name}</span>
                                                                <div className="checklist-badges">
                                                                    {isUnlimited && (
                                                                        <span className="checklist-limit-badge unlimited"><Infinity size={10} /> Unlimited</span>
                                                                    )}
                                                                    {!isUnlimited && item.limit > 0 && isAvailed && (
                                                                        <span className="checklist-limit-badge consumed">{item.used}/{item.limit} used</span>
                                                                    )}
                                                                    {!isUnlimited && item.limit > 0 && !isAvailed && !isActive && (
                                                                        <span className="checklist-limit-badge remaining">{item.limit - item.used} left</span>
                                                                    )}
                                                                    <span className={`checklist-status-badge ${item.status.toLowerCase()}`}>
                                                                        {isAvailed && item.used > 0 ? `Availed${isUnlimited ? ` ×${item.used}` : ''}` : item.status}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {(item.completedDate || item.facility) && (
                                                                <div className="checklist-item-meta">
                                                                    {item.completedDate && <span>Last: {item.completedDate}</span>}
                                                                    {item.completedDate && item.facility && <span> · </span>}
                                                                    {item.facility && <span>{item.facility}</span>}
                                                                </div>
                                                            )}
                                                            {item.notes && (
                                                                <div className="checklist-item-notes">{item.notes}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <p>No items match the selected filter.</p>
                                    </div>
                                )}
                            </div>

                            <div className="benefit-grid" style={{ marginTop: '0.5rem' }}>
                                <div className="requests-section" style={{ gridColumn: '1 / -1' }}>
                                    <div className="section-header-v3">
                                        <h3>LOA History</h3>
                                        <ChevronRight size={18} />
                                    </div>
                                    <div className="requests-list">
                                        {filteredLoaRequests.length > 0 ? (
                                            filteredLoaRequests.map(req => (
                                                <div key={req.id} className="request-card">
                                                    <div className="req-icon">
                                                        <FileText size={20} color="var(--color-primary)" />
                                                    </div>
                                                    <div className="req-details">
                                                        <h4>{req.provider}</h4>
                                                        <span className="req-type">{req.type} • {req.date}</span>
                                                    </div>
                                                    <div className="req-status">
                                                        <span className={`status-badge ${getStatusColor(req.status)}`}>
                                                            {req.status}
                                                        </span>
                                                        <span className="req-amount">{req.amount}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="empty-state">
                                                <p>No requests found.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* ========== CORPORATE / DEFAULT MBL VIEW ========== */
                        <>
                            {/* Employer info for corporate */}
                            {(() => {
                                const hmo = hmos.find((h: any) => h.id === activeProviderId);
                                return hmo?.accountName ? (
                                    <div className="corp-employer-bar">
                                        <span className="corp-employer-label">Employer</span>
                                        <span className="corp-employer-name">{hmo.accountName}</span>
                                        {hmo.accountNumber && <span className="corp-employer-acct">Account: {hmo.accountNumber}</span>}
                                    </div>
                                ) : null;
                            })()}

                            <div className="benefits-summary-card">
                                <div className="benefit-item">
                                    <div className="benefit-header">
                                        <span className="label">Maximum Benefit Limit (MBL)</span>
                                        <span className="value">{activeProviderData.mbl}</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="fill"
                                            style={{
                                                width: `${Math.min((parseFloat(activeProviderData.mblUsed.replace(/[^\d.]/g, '')) / Math.max(parseFloat(activeProviderData.mbl.replace(/[^\d.]/g, '')), 1)) * 100, 100)}%`,
                                                background: (() => {
                                                    const pct = parseFloat(activeProviderData.mblUsed.replace(/[^\d.]/g, '')) / Math.max(parseFloat(activeProviderData.mbl.replace(/[^\d.]/g, '')), 1);
                                                    return pct > 0.8 ? '#ef4444' : pct > 0.5 ? '#f59e0b' : 'var(--color-primary)';
                                                })()
                                            }}
                                        ></div>
                                    </div>
                                    <div className="benefit-footer">
                                        <span className="subtext">{activeProviderData.mblUsed} used</span>
                                        <span className="subtext" style={{ fontWeight: 700 }}>
                                            ₱ {(parseFloat(activeProviderData.mbl.replace(/[^\d.]/g, '')) - parseFloat(activeProviderData.mblUsed.replace(/[^\d.]/g, ''))).toLocaleString(undefined, { minimumFractionDigits: 2 })} remaining
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="corp-breakdown-section">
                                <div className="section-header-v3">
                                    <h3>Coverage Breakdown</h3>
                                    <Info size={16} />
                                </div>
                                <div className="corp-breakdown-grid">
                                    {activeProviderData.benefitCategories.length > 0 ? (
                                        activeProviderData.benefitCategories.map((item: any) => {
                                            const usedVal = parseFloat(item.used.replace(/[^\d.]/g, ''));
                                            const limitVal = parseFloat(item.limit.replace(/[^\d.]/g, ''));
                                            const pct = limitVal > 0 ? usedVal / limitVal : 0;
                                            const remaining = limitVal - usedVal;
                                            const barColor = pct > 0.8 ? '#ef4444' : pct > 0.5 ? '#f59e0b' : '#10b981';
                                            return (
                                                <div key={item.id} className="corp-benefit-card">
                                                    <div className="corp-card-top">
                                                        <span className="corp-card-icon">{item.icon}</span>
                                                        <span className="corp-card-name">{item.name}</span>
                                                    </div>
                                                    <div className="corp-card-bar">
                                                        <div className="corp-bar-track">
                                                            <div className="corp-bar-fill" style={{ width: `${Math.min(pct * 100, 100)}%`, background: barColor }}></div>
                                                        </div>
                                                    </div>
                                                    <div className="corp-card-amounts">
                                                        <span className="corp-used">{item.used} used</span>
                                                        <span className="corp-limit">of {item.limit}</span>
                                                    </div>
                                                    <div className="corp-card-remaining" style={{ color: barColor }}>
                                                        ₱ {remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })} available
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                                            <p>No category-specific limits.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="benefit-grid" style={{ marginTop: '0.5rem' }}>
                                <div className="requests-section" style={{ gridColumn: '1 / -1' }}>
                                    <div className="section-header-v3">
                                        <h3>LOA History</h3>
                                        <ChevronRight size={18} />
                                    </div>
                                    <div className="requests-list">
                                        {filteredLoaRequests.length > 0 ? (
                                            filteredLoaRequests.map(req => (
                                                <div key={req.id} className="request-card">
                                                    <div className="req-icon">
                                                        <FileText size={20} color="var(--color-primary)" />
                                                    </div>
                                                    <div className="req-details">
                                                        <h4>{req.provider}</h4>
                                                        <span className="req-type">{req.type} • {req.date}</span>
                                                    </div>
                                                    <div className="req-status">
                                                        <span className={`status-badge ${getStatusColor(req.status)}`}>
                                                            {req.status}
                                                        </span>
                                                        <span className="req-amount">{req.amount}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="empty-state">
                                                <p>No requests found.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </>
            ) : (
                <div className="claims-section">
                    <div className="claims-header-banner">
                        <div className="banner-content">
                            <h3>Reimbursement Claims</h3>
                            <p>File claims for medical expenses paid out-of-pocket.</p>
                        </div>
                        <button className="btn-primary" onClick={handleFileClaim}>
                            <Wallet size={18} />
                            <span>File a Claim</span>
                        </button>
                    </div>

                    <div className="claims-list">
                        {claims.length > 0 ? (
                            claims.map(claim => (
                                <div key={claim.id} className="request-card claim-card">
                                    <div className="req-icon claim-icon">
                                        <Receipt size={20} color="#6366f1" />
                                    </div>
                                    <div className="req-details">
                                        <h4>{claim.type}</h4>
                                        <span className="req-type">{claim.provider} • {claim.date}</span>
                                        {claim.reimbursementMethod && (
                                            <span className="claim-method">Pay via: {claim.reimbursementMethod}</span>
                                        )}
                                    </div>
                                    <div className="req-status">
                                        <span className={`status-badge ${getStatusColor(claim.status)}`}>
                                            {claim.status}
                                        </span>
                                        <span className="req-amount">{claim.amount}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <ClipboardList size={40} strokeWidth={1} />
                                <p>You haven't filed any claims yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* LOA Request Modal */}
            {showRequestModal && (
                <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3>Request Authorization</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem' }}>Select coverage provider and service</p>
                            </div>
                            <button className="close-btn" onClick={() => setShowRequestModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                            <label>Provider</label>
                            <div className="hmo-selection-grid" style={{ pointerEvents: 'none', opacity: 0.8 }}>
                                <button
                                    className="hmo-select-btn selected"
                                >
                                    {activeProviderId === 'philhealth' ? <Shield size={16} /> : <CreditCard size={16} />}
                                    <span>{activeProviderData.provider === 'PhilHealth' ? 'PhilHealth UHC' : activeProviderData.provider}</span>
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Service Type ({activeProviderId === 'philhealth' ? 'UHC Packages' : 'HMO Coverage'})</label>
                            <div className="service-type-picker">
                                {(activeProviderId === 'philhealth' ? PHILHEALTH_SERVICES : HMO_SERVICES).map(service => (
                                    <div
                                        key={service.id}
                                        className={`service-option ${selectedServiceId === service.id ? 'active' : ''}`}
                                        onClick={() => setSelectedServiceId(service.id)}
                                    >
                                        <div className="service-option-info">
                                            <span className="service-option-label">{service.label}</span>
                                            <span className="service-option-desc">{service.description}</span>
                                        </div>
                                        <div className="service-option-amount">
                                            {service.estimatedAmount}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="modal-disclaimer" style={{ marginTop: '1.25rem' }}>
                            <p>Verification typically takes 2-5 minutes.</p>
                        </div>

                        <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                            <button className="btn-secondary" onClick={() => setShowRequestModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleRequestSubmit}>Request LOA</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Digital Card Modal */}
            {showCardModal && (
                <div className="modal-overlay" onClick={() => setShowCardModal(false)}>
                    <div className="digital-card-container" onClick={e => e.stopPropagation()}>
                        <div className="membership-card premium">
                            <div className="card-texture"></div>
                            <div className="card-top">
                                <div className="card-logo">
                                    <Shield color="#fff" size={24} />
                                    <span>{hmos[0]?.provider || 'METRO GENERAL'}</span>
                                </div>
                                <div className="card-chip"></div>
                            </div>
                            <div className="card-mid">
                                <div className="member-info">
                                    <span className="card-label">Member Name</span>
                                    <span className="card-value">{userProfile?.name}</span>
                                </div>
                                <div className="qr-container">
                                    <img src={memberQr} alt="QR Code" className="qr-code-img" />
                                </div>
                            </div>
                            <div className="card-bottom">
                                <div className="card-details-row">
                                    <div>
                                        <span className="card-label">Member ID</span>
                                        <span className="card-value">{hmos[0]?.memberNo || '0000-0000-00'}</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className="card-label">Valid Thru</span>
                                        <span className="card-value">{hmos[0]?.validity || '12/2025'}</span>
                                    </div>
                                </div>
                                <div className="card-tier">
                                    <span>{hmos[0]?.planType || 'PLATINUM PLUS'}</span>
                                </div>
                            </div>
                        </div>
                        <button className="close-card-btn" onClick={() => setShowCardModal(false)}>
                            <X size={24} color="#fff" />
                        </button>
                        <p className="card-hint">Present this card at the provider's reception desk</p>
                    </div>
                </div>
            )}
        </div>
    );
};
