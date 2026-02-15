import { useState } from 'react';
import {
  User, Mail, Phone, Shield, Camera, Save, Edit3, Star,
  Award, Calendar, Building2, Stethoscope, FileText, Key, Bell, Globe,
} from 'lucide-react';
import { useProvider } from '../context/ProviderContext';
import { useToast } from '../../context/ToastContext';

export const ProviderProfile = () => {
  const { currentStaff } = useProvider();
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: currentStaff?.name ?? 'Dr. Sarah Garcia',
    email: 'sarah.garcia@metrogeneral.ph',
    phone: '+63 917 555 0123',
    specialty: currentStaff?.specialty ?? 'Internal Medicine',
    department: 'Outpatient Department',
    employeeId: 'EMP-2024-001',
    licenseNo: 'PRC-MD-2019-045891',
    npiNumber: '1234567890',
    role: currentStaff?.role ?? 'Doctor',
    joinDate: 'January 15, 2019',
    bio: 'Board-certified internal medicine physician with 7+ years of clinical experience. Special interest in chronic disease management, diabetes care, and preventive medicine.',
    languages: ['English', 'Filipino', 'Spanish'],
    certifications: ['Board Certified - Internal Medicine', 'Advanced Cardiac Life Support (ACLS)', 'Basic Life Support (BLS)', 'HIPAA Compliance'],
  });

  const [notifPrefs, setNotifPrefs] = useState({
    email: true,
    push: true,
    sms: false,
    criticalAlerts: true,
    scheduleChanges: true,
    labResults: true,
    systemUpdates: false,
  });

  const handleSave = () => {
    setIsEditing(false);
    showToast('Profile updated successfully', 'success');
  };

  const sectionStyle: React.CSSProperties = {
    background: 'var(--color-surface)', borderRadius: 14,
    border: '1px solid var(--color-border)', padding: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  };

  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' };
  const valueStyle: React.CSSProperties = { fontSize: 14, fontWeight: 500, color: 'var(--color-text)' };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 8,
    border: '1px solid var(--color-border)', fontSize: 14,
    color: 'var(--color-text)', background: 'var(--color-background)',
    fontFamily: 'inherit', boxSizing: 'border-box',
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Profile Header */}
      <div style={{ ...sectionStyle, display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark, #b04f22))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 32, fontWeight: 800, flexShrink: 0,
          }}>
            {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <button onClick={() => showToast('Photo upload simulated', 'info')} style={{
            position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%',
            background: 'var(--color-primary)', border: '2px solid var(--color-surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <Camera size={12} color="#fff" />
          </button>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px' }}>{profile.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{profile.specialty}</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-border)' }} />
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{profile.department}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: 'rgba(16,185,129,0.1)', color: 'var(--color-success)' }}>Active</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>{profile.role}</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: 'rgba(99,102,241,0.1)', color: 'var(--color-indigo)' }}>RBAC: Level 3</span>
          </div>
        </div>
        <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10,
          background: isEditing ? 'var(--color-primary)' : 'var(--color-surface)',
          color: isEditing ? '#fff' : 'var(--color-text)', border: isEditing ? 'none' : '1px solid var(--color-border)',
          fontWeight: 600, fontSize: 13, cursor: 'pointer',
        }}>
          {isEditing ? <><Save size={14} /> Save</> : <><Edit3 size={14} /> Edit</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {/* Personal Information */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={16} /> Personal Information
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Full Name', value: profile.name, icon: User, key: 'name' },
              { label: 'Email', value: profile.email, icon: Mail, key: 'email' },
              { label: 'Phone', value: profile.phone, icon: Phone, key: 'phone' },
              { label: 'Department', value: profile.department, icon: Building2, key: 'department' },
            ].map(item => (
              <div key={item.key}>
                <label style={labelStyle}>{item.label}</label>
                {isEditing ? (
                  <input style={inputStyle} value={(profile as any)[item.key]} onChange={e => setProfile(p => ({ ...p, [item.key]: e.target.value }))} />
                ) : (
                  <div style={{ ...valueStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <item.icon size={14} style={{ color: 'var(--color-text-muted)' }} />
                    {item.value}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Professional Details */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Stethoscope size={16} /> Professional Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label style={labelStyle}>Employee ID</label><div style={valueStyle}>{profile.employeeId}</div></div>
            <div><label style={labelStyle}>PRC License No.</label><div style={valueStyle}>{profile.licenseNo}</div></div>
            <div><label style={labelStyle}>NPI Number</label><div style={valueStyle}>{profile.npiNumber}</div></div>
            <div><label style={labelStyle}>Joined</label><div style={{ ...valueStyle, display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={14} style={{ color: 'var(--color-text-muted)' }} /> {profile.joinDate}</div></div>
            <div><label style={labelStyle}>Languages</label><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{profile.languages.map(l => (
              <span key={l} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 6, background: 'var(--color-background)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>{l}</span>
            ))}</div></div>
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Award size={16} /> Certifications & Training
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {profile.certifications.map(cert => (
            <div key={cert} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
              <Star size={14} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--color-text)' }}>{cert}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={16} /> Bio
        </h3>
        {isEditing ? (
          <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} />
        ) : (
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-text-muted)', margin: 0 }}>{profile.bio}</p>
        )}
      </div>

      {/* Notification Preferences */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={16} /> Notification Preferences
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {[
            { key: 'email', label: 'Email Notifications', icon: Mail },
            { key: 'push', label: 'Push Notifications', icon: Bell },
            { key: 'sms', label: 'SMS Alerts', icon: Phone },
            { key: 'criticalAlerts', label: 'Critical Lab Alerts', icon: Shield },
            { key: 'scheduleChanges', label: 'Schedule Changes', icon: Calendar },
            { key: 'labResults', label: 'Lab Results', icon: FileText },
            { key: 'systemUpdates', label: 'System Updates', icon: Globe },
          ].map(pref => (
            <label key={pref.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'var(--color-background)', border: '1px solid var(--color-border)', cursor: 'pointer' }}>
              <pref.icon size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, color: 'var(--color-text)' }}>{pref.label}</span>
              <input
                type="checkbox"
                checked={(notifPrefs as any)[pref.key]}
                onChange={() => { setNotifPrefs(p => ({ ...p, [pref.key]: !(p as any)[pref.key] })); showToast(`${pref.label} ${(notifPrefs as any)[pref.key] ? 'disabled' : 'enabled'}`, 'info'); }}
                style={{ width: 18, height: 18, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Security */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Key size={16} /> Security & Access
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 10, background: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>Change Password</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Last changed 30 days ago</div>
            </div>
            <button onClick={() => showToast('Password change dialog would open here', 'info')} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>Update</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 10, background: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>Two-Factor Authentication</div>
              <div style={{ fontSize: 12, color: 'var(--color-success)' }}>Enabled — Authenticator app</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: 'rgba(16,185,129,0.1)', color: 'var(--color-success)' }}>Active</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 10, background: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>Active Sessions</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>2 devices — This device, iPad</div>
            </div>
            <button onClick={() => showToast('Other sessions terminated', 'success')} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--color-error)' }}>Revoke others</button>
          </div>
        </div>
      </div>
    </div>
  );
};
