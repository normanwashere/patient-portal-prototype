import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Shield, Settings, Phone, ChevronRight, LogOut, CreditCard, Users, HeartPulse, X, Eye, EyeOff, Fingerprint, Lock, Smartphone, Key, Globe, Moon, ToggleLeft, ToggleRight } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import './Profile.css';

export const Profile: React.FC = () => {
    const { tenant } = useTheme();
    const { userProfile } = useData();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [privacyPrefs, setPrivacyPrefs] = useState({
        biometrics: true,
        twoFactor: true,
        shareData: false,
        activityLog: true,
        screenLock: true,
    });
    const [accountPrefs, setAccountPrefs] = useState({
        name: userProfile?.name ?? '',
        email: 'patient@email.com',
        phone: '+63 917 555 0101',
        language: 'English',
        darkMode: false,
        autoLogout: true,
    });

    const handleSignOut = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userToken');
        navigate('/apps');
    };

    if (!userProfile) return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Connecting to profile...</h2>
            <p>Please wait while we secure your patient identity.</p>
        </div>
    );

    return (
        <div className="profile-container">
            {/* Header / Identity */}
            <header className="profile-header-premium">
                <div className="avatar-wrapper">
                    <div className="avatar-large-glow">
                        <User size={40} color="white" />
                    </div>
                </div>
                <div className="profile-info-v2">
                    <h2>{userProfile.name}</h2>
                    <span className="member-id-v2">Member ID: {userProfile.memberId}</span>
                </div>
            </header>

            {/* HMO Card Visualization - only for tenants with HMO */}
            {tenant.features.hmo && (
                <section className="hmo-card-v2">
                    <div className="card-top">
                        <img src={tenant.logoUrl} alt="Logo" className="card-logo-v2" />
                        <div className="member-tier">
                            <div className="tier-dot"></div>
                            <span>{userProfile.membershipType}</span>
                        </div>
                    </div>
                    <div className="card-main">
                        <div className="card-field">
                            <label>Member Name</label>
                            <span>{userProfile.name.toUpperCase()}</span>
                        </div>
                        <div className="card-bottom-row">
                            <div className="card-field">
                                <label>Company</label>
                                <span>{userProfile.company}</span>
                            </div>
                            <div className="card-field align-right">
                                <label>Validity</label>
                                <span>{userProfile.validity}</span>
                            </div>
                        </div>
                    </div>
                    <div className="card-footer-v2">
                        <div className="sos-info">
                            <div className="sos-label">HMO HOTLINE</div>
                            <div className="sos-value">0917-123-4567</div>
                        </div>
                        <CreditCard size={20} className="card-chip-icon" />
                    </div>
                </section>
            )}

            {/* Quick Actions */}
            <section className="profile-quick-actions">
                <button className="quick-action-btn" onClick={() => navigate('/profile/dependents')}>
                    <Users size={20} />
                    <span>Dependents</span>
                </button>
                {tenant.features.philHealth && (
                    <button className="quick-action-btn" onClick={() => navigate('/coverage/philhealth')}>
                        <HeartPulse size={20} />
                        <span>PhilHealth</span>
                    </button>
                )}
            </section>

            {/* Emergency Contacts */}
            <section className="profile-section-v2">
                <div className="section-header-v2">
                    <h3>Emergency Contact</h3>
                </div>
                <div className="contact-card-premium">
                    <div className="contact-content">
                        <div className="contact-avatar">
                            <Phone size={18} />
                        </div>
                        <div className="contact-details-v2">
                            <span className="contact-name">{userProfile.emergencyContact.name}</span>
                            <span className="contact-relation">{userProfile.emergencyContact.relation} • {userProfile.emergencyContact.phone}</span>
                        </div>
                    </div>
                    <button className="call-action-btn" onClick={() => showToast('Calling emergency contact...', 'info')}>Call</button>
                </div>
            </section>

            {/* Settings & Preferences */}
            <section className="menu-list-v2">
                <button className="menu-item-v2" onClick={() => navigate('/notifications')}>
                    <div className="icon-v2"><Bell size={20} /></div>
                    <div className="menu-text">
                        <span className="menu-title">Notifications</span>
                        <span className="menu-desc">Updates, alerts & reminders</span>
                    </div>
                    <ChevronRight size={18} className="chevron-v2" />
                </button>
                <button className="menu-item-v2" onClick={() => setShowPrivacyModal(true)}>
                    <div className="icon-v2"><Shield size={20} /></div>
                    <div className="menu-text">
                        <span className="menu-title">Privacy & Security</span>
                        <span className="menu-desc">Biometrics, password & 2FA</span>
                    </div>
                    <ChevronRight size={18} className="chevron-v2" />
                </button>
                <button className="menu-item-v2" onClick={() => setShowSettingsModal(true)}>
                    <div className="icon-v2"><Settings size={20} /></div>
                    <div className="menu-text">
                        <span className="menu-title">Account Settings</span>
                        <span className="menu-desc">Personal info & preferences</span>
                    </div>
                    <ChevronRight size={18} className="chevron-v2" />
                </button>
            </section>

            <button className="btn-logout-v2" onClick={handleSignOut}>
                <LogOut size={20} />
                <span>Sign Out Account</span>
            </button>

            <div className="profile-footer-meta">
                <span>Patient Portal v1.2.0</span>
                <div className="meta-dot"></div>
                <span>Secured by STITCH</span>
            </div>

            {/* Privacy & Security Modal */}
            {showPrivacyModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowPrivacyModal(false)}>
                    <div style={{ background: 'var(--color-surface, #fff)', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480, maxHeight: '85vh', overflow: 'auto', padding: '20px 20px 32px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={18} /> Privacy & Security</h3>
                            <button onClick={() => setShowPrivacyModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={20} style={{ color: 'var(--color-text-muted)' }} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                { key: 'biometrics', label: 'Biometric Login', desc: 'Use fingerprint or face recognition', icon: Fingerprint },
                                { key: 'twoFactor', label: 'Two-Factor Authentication', desc: 'Extra security layer for sign-in', icon: Key },
                                { key: 'screenLock', label: 'Auto Screen Lock', desc: 'Lock app after 5 minutes of inactivity', icon: Lock },
                                { key: 'activityLog', label: 'Activity Logging', desc: 'Track login history and device access', icon: Eye },
                                { key: 'shareData', label: 'Share Health Data', desc: 'Allow sharing with connected providers', icon: Globe },
                            ].map(item => (
                                <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, background: 'var(--color-background, #f8fafc)', border: '1px solid var(--color-border, #e2e8f0)' }}>
                                    <item.icon size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{item.label}</div>
                                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{item.desc}</div>
                                    </div>
                                    <button onClick={() => { setPrivacyPrefs(p => ({ ...p, [item.key]: !(p as any)[item.key] })); showToast(`${item.label} ${(privacyPrefs as any)[item.key] ? 'disabled' : 'enabled'}`, 'success'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: (privacyPrefs as any)[item.key] ? 'var(--color-primary)' : '#94a3b8' }}>
                                        {(privacyPrefs as any)[item.key] ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => showToast('Password change initiated — check your email', 'success')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginTop: 16, padding: '12px 0', borderRadius: 12, border: '1px solid var(--color-border, #e2e8f0)', background: 'var(--color-surface, #fff)', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>
                            <Lock size={16} /> Change Password
                        </button>
                    </div>
                </div>
            )}

            {/* Account Settings Modal */}
            {showSettingsModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowSettingsModal(false)}>
                    <div style={{ background: 'var(--color-surface, #fff)', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480, maxHeight: '85vh', overflow: 'auto', padding: '20px 20px 32px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 8 }}><Settings size={18} /> Account Settings</h3>
                            <button onClick={() => setShowSettingsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={20} style={{ color: 'var(--color-text-muted)' }} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {[
                                { key: 'name', label: 'Display Name', type: 'text' },
                                { key: 'email', label: 'Email Address', type: 'email' },
                                { key: 'phone', label: 'Phone Number', type: 'tel' },
                            ].map(field => (
                                <div key={field.key}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>{field.label}</label>
                                    <input type={field.type} value={(accountPrefs as any)[field.key]} onChange={e => setAccountPrefs(p => ({ ...p, [field.key]: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--color-border, #e2e8f0)', fontSize: 14, color: 'var(--color-text)', background: 'var(--color-background, #f8fafc)', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                                </div>
                            ))}
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Language</label>
                                <select value={accountPrefs.language} onChange={e => setAccountPrefs(p => ({ ...p, language: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--color-border, #e2e8f0)', fontSize: 14, color: 'var(--color-text)', background: 'var(--color-background, #f8fafc)', fontFamily: 'inherit' }}>
                                    <option>English</option>
                                    <option>Filipino</option>
                                    <option>Spanish</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, background: 'var(--color-background, #f8fafc)', border: '1px solid var(--color-border, #e2e8f0)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <Moon size={16} style={{ color: 'var(--color-text-muted)' }} />
                                    <span style={{ fontSize: 14, color: 'var(--color-text)' }}>Dark Mode</span>
                                </div>
                                <button onClick={() => { setAccountPrefs(p => ({ ...p, darkMode: !p.darkMode })); showToast('Theme preference updated', 'info'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: accountPrefs.darkMode ? 'var(--color-primary)' : '#94a3b8' }}>
                                    {accountPrefs.darkMode ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                                </button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, background: 'var(--color-background, #f8fafc)', border: '1px solid var(--color-border, #e2e8f0)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <Smartphone size={16} style={{ color: 'var(--color-text-muted)' }} />
                                    <span style={{ fontSize: 14, color: 'var(--color-text)' }}>Auto-Logout on Idle</span>
                                </div>
                                <button onClick={() => setAccountPrefs(p => ({ ...p, autoLogout: !p.autoLogout }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: accountPrefs.autoLogout ? 'var(--color-primary)' : '#94a3b8' }}>
                                    {accountPrefs.autoLogout ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                                </button>
                            </div>
                        </div>
                        <button onClick={() => { setShowSettingsModal(false); showToast('Account settings saved', 'success'); }} style={{ width: '100%', marginTop: 20, padding: '12px 0', borderRadius: 12, border: 'none', background: 'var(--color-primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'inherit' }}>Save Changes</button>
                    </div>
                </div>
            )}
        </div>
    );
};
