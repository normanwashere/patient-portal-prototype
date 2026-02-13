import { useState } from 'react';
import {
  Settings, Monitor, Moon, Clock, Shield, Database,
  Bell, Lock, Server, Wifi, RefreshCw, Download, Upload, ToggleLeft, ToggleRight,
  Check, AlertTriangle, HardDrive, Zap, Languages, Volume2,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../theme/ThemeContext';

interface SettingToggle {
  key: string;
  label: string;
  description: string;
  icon: React.FC<any>;
  enabled: boolean;
}

export const ProviderSettings = () => {
  const { showToast } = useToast();
  const { tenant } = useTheme();

  const [activeTab, setActiveTab] = useState('general');

  const [generalSettings, setGeneralSettings] = useState<SettingToggle[]>([
    { key: 'darkMode', label: 'Dark Mode', description: 'Enable dark color theme across the platform', icon: Moon, enabled: false },
    { key: 'compactMode', label: 'Compact View', description: 'Reduce spacing for information-dense layouts', icon: Monitor, enabled: false },
    { key: 'animations', label: 'Animations', description: 'Enable smooth transitions and micro-interactions', icon: Zap, enabled: true },
    { key: 'soundAlerts', label: 'Sound Alerts', description: 'Play audio notification for critical events', icon: Volume2, enabled: true },
    { key: 'language', label: 'Auto-Translate', description: 'Automatically translate interface based on user locale', icon: Languages, enabled: false },
    { key: 'timezone', label: '24-Hour Time', description: 'Display time in 24-hour format', icon: Clock, enabled: false },
  ]);

  const [securitySettings, setSecuritySettings] = useState<SettingToggle[]>([
    { key: 'mfa', label: 'Multi-Factor Authentication', description: 'Require 2FA for all staff logins', icon: Shield, enabled: true },
    { key: 'sessionTimeout', label: 'Auto-Logout (15 min)', description: 'Automatically logout after 15 minutes of inactivity', icon: Lock, enabled: true },
    { key: 'ipWhitelist', label: 'IP Whitelist', description: 'Restrict access to approved IP ranges only', icon: Wifi, enabled: false },
    { key: 'auditLog', label: 'Enhanced Audit Logging', description: 'Log all data access with user, time, and context', icon: Database, enabled: true },
    { key: 'encryptAtRest', label: 'Encryption at Rest', description: 'AES-256 encryption for all stored patient data', icon: HardDrive, enabled: true },
    { key: 'hipaaMode', label: 'HIPAA Strict Mode', description: 'Enforce additional PHI access controls and masking', icon: AlertTriangle, enabled: true },
  ]);

  const [integrationSettings, setIntegrationSettings] = useState<SettingToggle[]>([
    { key: 'fhirSync', label: 'FHIR R4 Auto-Sync', description: 'Automatically sync patient data via FHIR R4 API every 5 minutes', icon: RefreshCw, enabled: true },
    { key: 'hl7Engine', label: 'HL7 v2 Engine', description: 'Process HL7 ADT, ORM, ORU messages from connected systems', icon: Server, enabled: true },
    { key: 'erpSync', label: 'ERP Integration', description: 'Sync billing and inventory data with Oracle/SAP ERP', icon: Database, enabled: true },
    { key: 'labIntegration', label: 'LIS Auto-Import', description: 'Automatically import lab results from Laboratory Information System', icon: Download, enabled: true },
    { key: 'pacsIntegration', label: 'PACS Viewer', description: 'Enable embedded DICOM image viewer for radiology results', icon: Monitor, enabled: false },
    { key: 'paymentGateway', label: 'Payment Gateway', description: 'Enable GCash, Maya, and credit card payment processing', icon: Zap, enabled: true },
  ]);

  const [notifSettings, setNotifSettings] = useState<SettingToggle[]>([
    { key: 'criticalLab', label: 'Critical Lab Results', description: 'Immediately notify physicians of critical/abnormal results', icon: AlertTriangle, enabled: true },
    { key: 'queueAlerts', label: 'Queue Threshold Alerts', description: 'Alert when patient wait time exceeds 30 minutes', icon: Clock, enabled: true },
    { key: 'inventoryAlerts', label: 'Low Inventory Alerts', description: 'Notify pharmacy when stock falls below minimum levels', icon: Download, enabled: true },
    { key: 'systemAlerts', label: 'System Health Alerts', description: 'Notify admins of downtime, sync failures, or errors', icon: Server, enabled: true },
    { key: 'complianceAlerts', label: 'Compliance Reminders', description: 'Send reminders for pending certifications and training', icon: Shield, enabled: true },
    { key: 'appointmentReminders', label: 'Patient Appointment SMS', description: 'Send automated SMS reminders 24 hours before appointments', icon: Bell, enabled: true },
  ]);

  const toggleSetting = (category: string, key: string) => {
    const setter = category === 'general' ? setGeneralSettings : category === 'security' ? setSecuritySettings : category === 'integrations' ? setIntegrationSettings : setNotifSettings;
    setter(prev => prev.map(s => s.key === key ? { ...s, enabled: !s.enabled } : s));
    showToast('Setting updated', 'success');
  };

  const tabs = [
    { key: 'general', label: 'General', icon: Settings },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'integrations', label: 'Integrations', icon: Server },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'system', label: 'System Info', icon: Monitor },
  ];

  const currentSettings = activeTab === 'general' ? generalSettings : activeTab === 'security' ? securitySettings : activeTab === 'integrations' ? integrationSettings : notifSettings;

  const renderToggleList = (settings: SettingToggle[], category: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {settings.map(s => {
        const Icon = s.icon;
        return (
          <div key={s.key} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
            borderRadius: 12, background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            transition: 'all 0.15s',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: s.enabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.08)', flexShrink: 0,
            }}>
              <Icon size={18} style={{ color: s.enabled ? '#10b981' : '#64748b' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{s.label}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{s.description}</div>
            </div>
            <button onClick={() => toggleSetting(category, s.key)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex',
              color: s.enabled ? '#10b981' : '#94a3b8', transition: 'color 0.2s',
            }}>
              {s.enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ padding: '24px 20px', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Settings size={22} /> System Settings
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
          Configure platform behavior, security, integrations, and notifications for {tenant.name}
        </p>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10,
              border: activeTab === tab.key ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
              background: activeTab === tab.key ? 'var(--color-primary-light)' : 'var(--color-surface)',
              color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontWeight: activeTab === tab.key ? 700 : 500, fontSize: 13, cursor: 'pointer',
              whiteSpace: 'nowrap', transition: 'all 0.15s',
            }}>
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Settings Content */}
      {activeTab !== 'system' && renderToggleList(currentSettings, activeTab)}

      {/* System Info Tab */}
      {activeTab === 'system' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Platform Info */}
          <div style={{ background: 'var(--color-surface)', borderRadius: 14, border: '1px solid var(--color-border)', padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 16px' }}>Platform Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {[
                { label: 'Platform', value: 'MedConnect Enterprise' },
                { label: 'Version', value: 'v3.2.1-beta' },
                { label: 'Environment', value: 'Production' },
                { label: 'Tenant', value: tenant.name },
                { label: 'Region', value: 'Asia-Pacific (Manila)' },
                { label: 'Last Deploy', value: 'Feb 11, 2026 10:45 AM' },
              ].map(info => (
                <div key={info.label} style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--color-background)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{info.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginTop: 4 }}>{info.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Health Checks */}
          <div style={{ background: 'var(--color-surface)', borderRadius: 14, border: '1px solid var(--color-border)', padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 16px' }}>System Health</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { name: 'API Server', status: 'Healthy', latency: '12ms', uptime: '99.97%' },
                { name: 'Database (PostgreSQL)', status: 'Healthy', latency: '3ms', uptime: '99.99%' },
                { name: 'FHIR R4 Endpoint', status: 'Healthy', latency: '45ms', uptime: '99.95%' },
                { name: 'HL7 v2 Engine', status: 'Healthy', latency: '8ms', uptime: '99.98%' },
                { name: 'Redis Cache', status: 'Healthy', latency: '1ms', uptime: '100%' },
                { name: 'Storage (S3)', status: 'Healthy', latency: '22ms', uptime: '99.99%' },
              ].map(svc => (
                <div key={svc.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
                  <Check size={14} style={{ color: '#22c55e', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{svc.name}</span>
                  <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>{svc.status}</span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)', minWidth: 50, textAlign: 'right' }}>{svc.latency}</span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)', minWidth: 55, textAlign: 'right' }}>{svc.uptime}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => showToast('System data exported to CSV', 'success')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, background: 'var(--color-primary)', color: '#fff', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              <Download size={14} /> Export System Report
            </button>
            <button onClick={() => showToast('Configuration backup created', 'success')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              <Upload size={14} /> Backup Config
            </button>
            <button onClick={() => showToast('Cache cleared successfully', 'success')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              <RefreshCw size={14} /> Clear Cache
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
