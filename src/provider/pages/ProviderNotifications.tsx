import { useState } from 'react';
import {
  Bell, BellOff, Check, CheckCheck, AlertTriangle, Info, UserPlus, Calendar,
  Package, FileText, Shield, Trash2, Filter, Clock, ChevronDown,
} from 'lucide-react';
interface Notification {
  id: string;
  type: 'alert' | 'info' | 'appointment' | 'system' | 'staff' | 'inventory' | 'compliance';
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'alert', title: 'Critical Lab Result', message: 'Patient Maria Santos — Potassium level 6.2 mEq/L (critical high). Requires immediate physician review.', time: '5 min ago', read: false, priority: 'high' },
  { id: '2', type: 'system', title: 'FHIR API Sync Complete', message: 'Successfully synced 1,247 patient records with central HIE. 3 records flagged for manual review.', time: '12 min ago', read: false, priority: 'medium' },
  { id: '3', type: 'appointment', title: 'Appointment Cancellation', message: 'Juan Dela Cruz cancelled 2:30 PM appointment with Dr. Reyes. Slot now available for rebooking.', time: '28 min ago', read: false, priority: 'low' },
  { id: '4', type: 'staff', title: 'New Staff Onboarding', message: 'Nurse Ana Rivera has completed compliance training. RBAC role "Senior Nurse" pending approval.', time: '45 min ago', read: false, priority: 'medium' },
  { id: '5', type: 'inventory', title: 'Low Inventory Alert', message: 'Metformin 500mg stock below minimum threshold (42 units remaining). Auto-reorder triggered.', time: '1 hr ago', read: true, priority: 'high' },
  { id: '6', type: 'compliance', title: 'HIPAA Audit Trail Update', message: 'Monthly access audit report generated. 2 anomalous access patterns detected — review recommended.', time: '1.5 hr ago', read: true, priority: 'high' },
  { id: '7', type: 'info', title: 'System Maintenance Scheduled', message: 'Planned maintenance window: Saturday 2:00 AM — 4:00 AM. HL7 message processing will be paused.', time: '2 hr ago', read: true, priority: 'low' },
  { id: '8', type: 'appointment', title: 'Teleconsult Room Ready', message: 'Virtual consultation room for Dr. Garcia is provisioned. 3 teleconsult appointments today.', time: '3 hr ago', read: true, priority: 'low' },
  { id: '9', type: 'system', title: 'ERP Sync Successful', message: 'Oracle ERP billing data synced. 156 invoice records processed. Revenue dashboard updated.', time: '4 hr ago', read: true, priority: 'medium' },
  { id: '10', type: 'alert', title: 'Queue Threshold Exceeded', message: 'Outpatient queue exceeded 45 min average wait time. Consider opening additional consult rooms.', time: '4.5 hr ago', read: true, priority: 'high' },
];

const TYPE_CONFIG: Record<string, { icon: React.FC<any>; color: string; bg: string }> = {
  alert: { icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  info: { icon: Info, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  appointment: { icon: Calendar, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  system: { icon: Shield, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
  staff: { icon: UserPlus, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
  inventory: { icon: Package, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  compliance: { icon: FileText, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
};

export const ProviderNotifications = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<string>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  const filtered = filter === 'all'
    ? notifications
    : filter === 'unread'
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.type === filter);

  const filterOptions = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'alert', label: 'Alerts' },
    { key: 'system', label: 'System' },
    { key: 'appointment', label: 'Appointments' },
    { key: 'staff', label: 'Staff' },
    { key: 'inventory', label: 'Inventory' },
    { key: 'compliance', label: 'Compliance' },
  ];

  return (
    <div style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={22} /> Notifications
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10,
              border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, color: 'var(--color-text)',
            }}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowFilterDropdown(!showFilterDropdown)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10,
              border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, color: 'var(--color-text)',
            }}>
              <Filter size={14} /> {filterOptions.find(f => f.key === filter)?.label} <ChevronDown size={12} />
            </button>
            {showFilterDropdown && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 4, background: 'var(--color-surface)',
                border: '1px solid var(--color-border)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                zIndex: 50, minWidth: 160, overflow: 'hidden',
              }}>
                {filterOptions.map(opt => (
                  <button key={opt.key} onClick={() => { setFilter(opt.key); setShowFilterDropdown(false); }} style={{
                    display: 'block', width: '100%', padding: '10px 14px', border: 'none', background: filter === opt.key ? 'var(--color-primary-light)' : 'transparent',
                    color: filter === opt.key ? 'var(--color-primary)' : 'var(--color-text)', fontSize: 13, fontWeight: filter === opt.key ? 600 : 400,
                    cursor: 'pointer', textAlign: 'left',
                  }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
            <BellOff size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ fontSize: 14 }}>No notifications to show</p>
          </div>
        ) : (
          filtered.map(notif => {
            const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
            const Icon = cfg.icon;
            return (
              <div key={notif.id} onClick={() => markRead(notif.id)} style={{
                display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 12,
                background: notif.read ? 'var(--color-surface)' : 'rgba(99, 102, 241, 0.04)',
                border: `1px solid ${notif.read ? 'var(--color-border)' : 'rgba(99, 102, 241, 0.15)'}`,
                cursor: 'pointer', transition: 'all 0.15s', position: 'relative',
              }}>
                {/* Unread indicator */}
                {!notif.read && <div style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: '50%', background: '#6366f1' }} />}
                {/* Icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: cfg.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={18} style={{ color: cfg.color }} />
                </div>
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: notif.read ? 500 : 700, color: 'var(--color-text)' }}>{notif.title}</span>
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={10} /> {notif.time}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>{notif.message}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                      background: notif.priority === 'high' ? 'rgba(239,68,68,0.1)' : notif.priority === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(100,116,139,0.1)',
                      color: notif.priority === 'high' ? '#ef4444' : notif.priority === 'medium' ? '#f59e0b' : '#64748b',
                      textTransform: 'uppercase',
                    }}>
                      {notif.priority}
                    </span>
                    {!notif.read && (
                      <button onClick={(e) => { e.stopPropagation(); markRead(notif.id); }} style={{
                        display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none',
                        cursor: 'pointer', fontSize: 11, color: 'var(--color-primary)', fontWeight: 600, padding: 0,
                      }}>
                        <Check size={12} /> Mark read
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }} style={{
                      display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: 11, color: 'var(--color-text-muted)', padding: 0, marginLeft: 'auto',
                    }}>
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
