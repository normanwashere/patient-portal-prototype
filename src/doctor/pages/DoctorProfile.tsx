import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Building2, Award, Calendar, Shield,
  ChevronRight, LogOut, ArrowLeftRight, Settings, Bell,
  Stethoscope, GraduationCap, Clock, MapPin, Star,
  ToggleLeft, ToggleRight, Moon, Smartphone, Lock,
  Fingerprint, Key, Eye, Globe, X,
} from 'lucide-react';
import { useProvider } from '../../provider/context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';
import { useToast } from '../../context/ToastContext';

export const DoctorProfile = () => {
  const { currentStaff, switchApp } = useProvider();
  const { tenant } = useTheme();
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
    name: currentStaff.name,
    email: currentStaff.email,
    phone: currentStaff.phone,
    language: 'English',
    darkMode: false,
    autoLogout: true,
  });

  const isDoctor = currentStaff.role === 'doctor';
  const specializations = currentStaff.specializations ?? (currentStaff.specialty ? [currentStaff.specialty] : []);
  const primarySpecialty = currentStaff.specialty ?? currentStaff.department;

  const handleSignOut = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/apps');
  };

  const roleLabel =
    currentStaff.role === 'doctor' ? 'Physician' :
    currentStaff.role === 'nurse' ? 'Staff Nurse' :
    currentStaff.role === 'front_desk' ? 'Front Desk / Receptionist' :
    currentStaff.role.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

  // Styles
  const s = {
    container: {
      display: 'flex', flexDirection: 'column' as const, gap: 20,
      maxWidth: 640, margin: '0 auto', paddingBottom: 80,
      animation: 'slideUp 0.4s ease-out',
    },
    header: {
      display: 'flex', alignItems: 'center', gap: 18, padding: '8px 0',
    },
    avatar: {
      width: 80, height: 80, borderRadius: 20,
      background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-dark, #1e40af))`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 10px 25px -5px var(--color-primary-transparent)',
      border: '3px solid white', flexShrink: 0,
    },
    avatarImg: {
      width: 80, height: 80, borderRadius: 20, objectFit: 'cover' as const,
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
      border: '3px solid white', flexShrink: 0,
    },
    nameSection: { flex: 1, minWidth: 0 },
    name: { fontSize: 22, fontWeight: 800, margin: 0, color: 'var(--color-text)', letterSpacing: '-0.02em' },
    roleBadge: {
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 100,
      background: 'var(--color-primary-light)', color: 'var(--color-primary)', marginTop: 4,
    },
    card: {
      background: 'var(--color-surface, white)', borderRadius: 16,
      border: '1px solid var(--color-border, #e2e8f0)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden',
    },
    cardHeader: {
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '14px 18px', fontSize: 14, fontWeight: 700, color: 'var(--color-text)',
      borderBottom: '1px solid var(--color-border, #e2e8f0)',
    },
    row: {
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 18px', borderBottom: '1px solid var(--color-border, #e2e8f0)',
    },
    rowLast: {
      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
    },
    rowIcon: { color: 'var(--color-text-muted)', flexShrink: 0 },
    rowLabel: { fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 },
    rowValue: { fontSize: 14, fontWeight: 600, color: 'var(--color-text)' },
    specChip: {
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '5px 12px', borderRadius: 100,
      background: 'var(--color-primary-light)', color: 'var(--color-primary)',
      fontSize: 12, fontWeight: 600,
    },
    gpChip: {
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '5px 12px', borderRadius: 100,
      background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)',
      fontSize: 12, fontWeight: 600,
    },
    menuItem: {
      display: 'flex', alignItems: 'center', gap: 12, width: '100%',
      padding: '16px 18px', border: 'none', borderRadius: 0,
      background: 'transparent', cursor: 'pointer', textAlign: 'left' as const,
      borderBottom: '1px solid var(--color-border, #e2e8f0)',
      transition: 'background 0.15s', textDecoration: 'none', color: 'inherit',
    },
    menuIcon: {
      width: 36, height: 36, borderRadius: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    },
    signoutBtn: {
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      width: '100%', padding: '14px 0', borderRadius: 14,
      border: '1.5px solid rgba(239, 68, 68, 0.2)',
      background: 'rgba(239, 68, 68, 0.04)', color: 'var(--color-error)',
      cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
    },
    footer: {
      textAlign: 'center' as const, fontSize: 11, color: 'var(--color-text-muted)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    },
  };

  return (
    <div style={s.container}>
      {/* ===== Profile Header ===== */}
      <header style={s.header}>
        {currentStaff.photoUrl ? (
          <img
            src={currentStaff.photoUrl}
            alt={currentStaff.name}
            style={s.avatarImg}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div style={s.avatar}>
            <User size={36} color="white" />
          </div>
        )}
        <div style={s.nameSection}>
          <h2 style={s.name}>{currentStaff.name}</h2>
          <div style={s.roleBadge}>
            <Stethoscope size={12} />
            {roleLabel}
          </div>
        </div>
      </header>

      {/* ===== Specializations Card (doctors only) ===== */}
      {isDoctor && specializations.length > 0 && (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <GraduationCap size={16} /> Specializations
          </div>
          <div style={{ padding: '14px 18px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {specializations.map((spec) => (
              <span
                key={spec}
                style={spec === 'General Practice' ? s.gpChip : s.specChip}
              >
                {spec === 'General Practice' && <Star size={11} />}
                {spec}
              </span>
            ))}
          </div>
          <div style={{ padding: '0 18px 14px', fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            Primary specialty: <strong style={{ color: 'var(--color-text)' }}>{primarySpecialty}</strong>.
            {specializations.includes('General Practice') && (
              <> Also available for <strong style={{ color: 'var(--color-success)' }}>General Practice</strong> consultations.</>
            )}
          </div>
        </div>
      )}

      {/* ===== Professional Info Card ===== */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <Building2 size={16} /> Professional Information
        </div>
        <div style={s.row}>
          <Building2 size={16} style={s.rowIcon} />
          <div style={{ flex: 1 }}>
            <div style={s.rowLabel}>Department</div>
            <div style={s.rowValue}>{currentStaff.department}</div>
          </div>
        </div>
        <div style={s.row}>
          <MapPin size={16} style={s.rowIcon} />
          <div style={{ flex: 1 }}>
            <div style={s.rowLabel}>Branch</div>
            <div style={s.rowValue}>{currentStaff.branchId === 'BRANCH_MAIN' ? tenant.name + ' — Main Branch' : currentStaff.branchId}</div>
          </div>
        </div>
        {currentStaff.credentials.length > 0 && (
          <div style={s.row}>
            <Award size={16} style={s.rowIcon} />
            <div style={{ flex: 1 }}>
              <div style={s.rowLabel}>Credentials</div>
              <div style={s.rowValue}>{currentStaff.credentials.join(', ')}</div>
            </div>
          </div>
        )}
        <div style={s.row}>
          <Calendar size={16} style={s.rowIcon} />
          <div style={{ flex: 1 }}>
            <div style={s.rowLabel}>License Expiry</div>
            <div style={s.rowValue}>{currentStaff.licenseExpiry}</div>
          </div>
        </div>
        <div style={s.rowLast}>
          <Clock size={16} style={s.rowIcon} />
          <div style={{ flex: 1 }}>
            <div style={s.rowLabel}>Employed Since</div>
            <div style={s.rowValue}>{currentStaff.hireDate}</div>
          </div>
        </div>
      </div>

      {/* ===== Contact Card ===== */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <Phone size={16} /> Contact
        </div>
        <div style={s.row}>
          <Mail size={16} style={s.rowIcon} />
          <div style={{ flex: 1 }}>
            <div style={s.rowLabel}>Email</div>
            <div style={s.rowValue}>{currentStaff.email}</div>
          </div>
        </div>
        <div style={s.rowLast}>
          <Phone size={16} style={s.rowIcon} />
          <div style={{ flex: 1 }}>
            <div style={s.rowLabel}>Phone</div>
            <div style={s.rowValue}>{currentStaff.phone}</div>
          </div>
        </div>
      </div>

      {/* ===== Settings Menu ===== */}
      <div style={s.card}>
        <button style={s.menuItem} onClick={() => navigate('/doctor/tasks')}>
          <div style={{ ...s.menuIcon, background: 'rgba(59,130,246,0.08)' }}>
            <Bell size={18} color="var(--color-info)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>Notifications</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Alerts, messages & reminders</div>
          </div>
          <ChevronRight size={16} color="var(--color-text-muted)" />
        </button>
        <button style={s.menuItem} onClick={() => setShowPrivacyModal(true)}>
          <div style={{ ...s.menuIcon, background: 'rgba(16,185,129,0.08)' }}>
            <Shield size={18} color="var(--color-success)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>Privacy & Security</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Biometrics, 2FA & access logs</div>
          </div>
          <ChevronRight size={16} color="var(--color-text-muted)" />
        </button>
        <button style={{ ...s.menuItem, borderBottom: 'none' }} onClick={() => setShowSettingsModal(true)}>
          <div style={{ ...s.menuIcon, background: 'rgba(100,116,139,0.08)' }}>
            <Settings size={18} color="var(--color-gray-500)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>Account Settings</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Personal info & preferences</div>
          </div>
          <ChevronRight size={16} color="var(--color-text-muted)" />
        </button>
      </div>

      {/* ===== App Switching ===== */}
      <div style={s.card}>
        <button style={s.menuItem} onClick={() => { switchApp('provider'); navigate('/provider'); }}>
          <div style={{ ...s.menuIcon, background: 'rgba(124,58,237,0.08)' }}>
            <ArrowLeftRight size={18} color="var(--color-secondary, #7c3aed)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>Switch to Provider App</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Admin, operations & facility</div>
          </div>
          <ChevronRight size={16} color="var(--color-text-muted)" />
        </button>
        <button style={{ ...s.menuItem, borderBottom: 'none' }} onClick={() => navigate('/dashboard')}>
          <div style={{ ...s.menuIcon, background: 'rgba(59,130,246,0.06)' }}>
            <ArrowLeftRight size={18} color="var(--color-info)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>Back to Patient Portal</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Patient view & services</div>
          </div>
          <ChevronRight size={16} color="var(--color-text-muted)" />
        </button>
      </div>

      {/* ===== Sign Out ===== */}
      <button style={s.signoutBtn} onClick={handleSignOut}>
        <LogOut size={18} />
        Sign Out
      </button>

      <div style={s.footer}>
        <span>Doctor Portal v1.2.0</span>
        <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-text-muted)' }} />
        <span>Secured by STITCH</span>
      </div>

      {/* ===== Privacy Modal ===== */}
      {showPrivacyModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowPrivacyModal(false)}>
          <div style={{ background: 'var(--color-surface, #fff)', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480, maxHeight: '85vh', overflow: 'auto', padding: '20px 20px 32px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={18} /> Privacy & Security</h3>
              <button onClick={() => setShowPrivacyModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={20} style={{ color: 'var(--color-text-muted)' }} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { key: 'biometrics', label: 'Biometric Login', desc: 'Fingerprint or face recognition', icon: Fingerprint },
                { key: 'twoFactor', label: 'Two-Factor Authentication', desc: 'Extra security for sign-in', icon: Key },
                { key: 'screenLock', label: 'Auto Screen Lock', desc: 'Lock after 5 min inactivity', icon: Lock },
                { key: 'activityLog', label: 'Activity Logging', desc: 'Track login and device access', icon: Eye },
                { key: 'shareData', label: 'Share Clinical Data', desc: 'Allow inter-facility data access', icon: Globe },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, background: 'var(--color-background, #f8fafc)', border: '1px solid var(--color-border, #e2e8f0)' }}>
                  <item.icon size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{item.desc}</div>
                  </div>
                  <button onClick={() => { setPrivacyPrefs(p => ({ ...p, [item.key]: !(p as Record<string, boolean>)[item.key] })); showToast(`${item.label} ${(privacyPrefs as Record<string, boolean>)[item.key] ? 'disabled' : 'enabled'}`, 'success'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: (privacyPrefs as Record<string, boolean>)[item.key] ? 'var(--color-primary)' : '#94a3b8' }}>
                    {(privacyPrefs as Record<string, boolean>)[item.key] ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => showToast('Password change initiated — check your email', 'success')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginTop: 16, padding: '12px 0', borderRadius: 12, border: '1px solid var(--color-border, #e2e8f0)', background: 'var(--color-surface, #fff)', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--color-text)', fontFamily: 'inherit' }}>
              <Lock size={16} /> Change Password
            </button>
          </div>
        </div>
      )}

      {/* ===== Account Settings Modal ===== */}
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
                  <input type={field.type} value={(accountPrefs as Record<string, string | boolean>)[field.key] as string} onChange={e => setAccountPrefs(p => ({ ...p, [field.key]: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--color-border, #e2e8f0)', fontSize: 14, color: 'var(--color-text)', background: 'var(--color-background, #f8fafc)', fontFamily: 'inherit', boxSizing: 'border-box' }} />
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Moon size={16} style={{ color: 'var(--color-text-muted)' }} /><span style={{ fontSize: 14, color: 'var(--color-text)' }}>Dark Mode</span></div>
                <button onClick={() => { setAccountPrefs(p => ({ ...p, darkMode: !p.darkMode })); showToast('Theme preference updated', 'info'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: accountPrefs.darkMode ? 'var(--color-primary)' : '#94a3b8' }}>
                  {accountPrefs.darkMode ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, background: 'var(--color-background, #f8fafc)', border: '1px solid var(--color-border, #e2e8f0)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Smartphone size={16} style={{ color: 'var(--color-text-muted)' }} /><span style={{ fontSize: 14, color: 'var(--color-text)' }}>Auto-Logout on Idle</span></div>
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
