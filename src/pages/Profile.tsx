import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Shield, Settings, Phone, ChevronRight, LogOut, CreditCard, Users, HeartPulse } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { useData } from '../context/DataContext';
import './Profile.css';

export const Profile: React.FC = () => {
    const { tenant } = useTheme();
    const { userProfile } = useData();
    const navigate = useNavigate();

    const handleSignOut = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userToken');
        navigate('/login');
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

            {/* HMO Card Visualization */}
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

            {/* Quick Actions */}
            <section className="profile-quick-actions">
                <button className="quick-action-btn" onClick={() => navigate('/profile/dependents')}>
                    <Users size={20} />
                    <span>Dependents</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/coverage/philhealth')}>
                    <HeartPulse size={20} />
                    <span>PhilHealth</span>
                </button>
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
                    <button className="call-action-btn">Call</button>
                </div>
            </section>

            {/* Settings & Preferences */}
            <section className="menu-list-v2">
                <button className="menu-item-v2">
                    <div className="icon-v2"><Bell size={20} /></div>
                    <div className="menu-text">
                        <span className="menu-title">Notifications</span>
                        <span className="menu-desc">Updates, alerts & reminders</span>
                    </div>
                    <ChevronRight size={18} className="chevron-v2" />
                </button>
                <button className="menu-item-v2">
                    <div className="icon-v2"><Shield size={20} /></div>
                    <div className="menu-text">
                        <span className="menu-title">Privacy & Security</span>
                        <span className="menu-desc">Biometrics, password & 2FA</span>
                    </div>
                    <ChevronRight size={18} className="chevron-v2" />
                </button>
                <button className="menu-item-v2">
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
        </div>
    );
};
