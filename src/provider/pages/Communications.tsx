import { useState, useMemo } from 'react';
import {
  Mail,
  Send,
  Plus,
  ChevronRight,
  Megaphone,
  AlertCircle,
  Inbox,
  CheckCircle,
} from 'lucide-react';
import React from 'react';
import { useProvider } from '../context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';
import { useToast } from '../../context/ToastContext';
import type { InternalMessage } from '../types';

const styles: Record<string, React.CSSProperties> = {
  page: { padding: 24, background: 'var(--color-background)', minHeight: '100%' },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 },
  subtitle: { color: 'var(--color-text-muted)', marginBottom: 24, fontSize: 14 },
  tabs: { display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap', borderBottom: '1px solid var(--color-border)', paddingBottom: 0 },
  tab: { padding: '12px 16px', fontSize: 14, fontWeight: 600, color: 'var(--color-text-muted)', background: 'none', border: 'none', borderBottom: '3px solid transparent', cursor: 'pointer', marginBottom: -1 },
  tabActive: { color: 'var(--color-primary)', borderBottomColor: 'var(--color-primary)' },
  card: { background: 'var(--color-surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' },
  badge: { padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 },
  btn: { padding: '8px 16px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 },
  btnPrimary: { background: 'var(--color-primary)', color: 'white' },
  btnSecondary: { background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' },
  msgRow: { padding: 16, borderBottom: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12, transition: 'background 0.15s' },
  msgRowUnread: { background: 'var(--color-info-light)' },
  input: { width: '100%', padding: 10, borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', fontSize: 14, background: 'var(--color-surface)', color: 'var(--color-text)', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: 10, borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', fontSize: 14, minHeight: 120, resize: 'vertical', background: 'var(--color-surface)', color: 'var(--color-text)', boxSizing: 'border-box' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)' },
};

type TabId = 'inbox' | 'compose' | 'broadcast';

export const Communications = () => {
  const { tenant } = useTheme();
  const { internalMessages, currentStaff, staff, markMessageRead, sendMessage, addAuditLog } = useProvider();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>('inbox');
  const [selectedMsg, setSelectedMsg] = useState<InternalMessage | null>(null);

  // Compose state
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composePriority, setComposePriority] = useState<'Normal' | 'Urgent'>('Normal');

  // Broadcast state
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');

  const myId = currentStaff?.id ?? '';
  const inbox = useMemo(() => internalMessages.filter((m) => m.toId === myId), [internalMessages, myId]);
  const unreadCount = inbox.filter((m) => !m.read).length;

  const handleSelectMessage = (msg: InternalMessage) => {
    setSelectedMsg(msg);
    if (!msg.read && msg.toId === myId) {
      markMessageRead(msg.id);
    }
  };

  const handleSendMessage = () => {
    if (!composeTo) { showToast('Please select a recipient', 'error'); return; }
    if (!composeSubject.trim()) { showToast('Please enter a subject', 'error'); return; }
    if (!composeBody.trim()) { showToast('Please enter a message body', 'error'); return; }

    const recipient = staff.find((s) => s.id === composeTo);
    if (!recipient) { showToast('Invalid recipient', 'error'); return; }

    sendMessage({
      fromId: currentStaff.id,
      fromName: currentStaff.name,
      toId: recipient.id,
      toName: recipient.name,
      subject: composeSubject.trim(),
      body: composeBody.trim(),
      priority: composePriority,
    });
    addAuditLog('send_message', 'Communications', `Message sent to ${recipient.name}: ${composeSubject.trim()}`);
    showToast(`Message sent to ${recipient.name}`, 'success');
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    setComposePriority('Normal');
  };

  const handleBroadcast = () => {
    if (!broadcastSubject.trim()) { showToast('Please enter a broadcast subject', 'error'); return; }
    if (!broadcastBody.trim()) { showToast('Please enter a broadcast message', 'error'); return; }
    addAuditLog('broadcast', 'Communications', `Broadcast: ${broadcastSubject.trim()}`);
    showToast(`Broadcast "${broadcastSubject.trim()}" sent to all staff (mock)`, 'success');
    setBroadcastSubject('');
    setBroadcastBody('');
  };

  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ size?: number }>; badgeCount?: number }[] = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, badgeCount: unreadCount },
    { id: 'compose', label: 'Compose', icon: Plus },
    { id: 'broadcast', label: 'Broadcast', icon: Megaphone },
  ];

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Communications</h1>
      <p style={styles.subtitle}>{tenant.name} · Internal messages and broadcasts</p>

      <div style={styles.tabs}>
        {tabs.map(({ id, label, icon: Icon, badgeCount }) => (
          <button
            key={id}
            style={{ ...styles.tab, ...(activeTab === id ? styles.tabActive : {}) }}
            onClick={() => { setActiveTab(id); setSelectedMsg(null); }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon size={16} />
              {label}
              {badgeCount !== undefined && badgeCount > 0 && (
                <span style={{ ...styles.badge, background: 'var(--color-error)', color: 'white', minWidth: 18, textAlign: 'center' }}>
                  {badgeCount}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {/* ─── INBOX TAB ─── */}
      {activeTab === 'inbox' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedMsg ? 'minmax(0, 1fr) minmax(280px, 420px)' : '1fr', gap: 24 }}>
          <div style={styles.card}>
            <div style={{ padding: 16, borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: 15 }}>
                <Mail size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Inbox ({inbox.length})
              </span>
              {unreadCount > 0 && (
                <span style={{ ...styles.badge, background: 'var(--color-primary)', color: 'white' }}>
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div>
              {inbox.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  <Mail size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                  <div>No messages</div>
                </div>
              ) : (
                inbox.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      ...styles.msgRow,
                      ...(!msg.read ? styles.msgRowUnread : {}),
                      ...(selectedMsg?.id === msg.id ? { borderLeft: '3px solid var(--color-primary)' } : {}),
                    }}
                    onClick={() => handleSelectMessage(msg)}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: msg.read ? 500 : 700, color: 'var(--color-text)' }}>
                          {msg.fromName}
                        </span>
                        {msg.priority === 'Urgent' && (
                          <span style={{ ...styles.badge, background: 'var(--color-error-light)', color: 'var(--color-error)' }}>
                            <AlertCircle size={10} style={{ marginRight: 2 }} /> Urgent
                          </span>
                        )}
                      </div>
                      <div style={{ fontWeight: msg.read ? 400 : 600, fontSize: 13, color: 'var(--color-text)', marginBottom: 2 }}>{msg.subject}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{new Date(msg.date).toLocaleString()}</div>
                    </div>
                    {!msg.read && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0, marginTop: 6 }} />
                    )}
                    <ChevronRight size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Message detail panel */}
          {selectedMsg && (
            <div style={styles.card}>
              <div style={{ padding: 16, borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>{selectedMsg.subject}</h3>
                  <span style={{
                    ...styles.badge,
                    ...(selectedMsg.priority === 'Urgent'
                      ? { background: 'var(--color-error-light)', color: 'var(--color-error)' }
                      : { background: 'var(--color-gray-200)', color: 'var(--color-text-muted)' }),
                  }}>
                    {selectedMsg.priority}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  From: <strong>{selectedMsg.fromName}</strong> → To: <strong>{selectedMsg.toName}</strong>
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  {new Date(selectedMsg.date).toLocaleString()}
                </div>
                <div style={{ marginTop: 4 }}>
                  <span style={{ ...styles.badge, background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
                    <CheckCircle size={10} style={{ marginRight: 2 }} /> Read
                  </span>
                </div>
              </div>
              <div style={{ padding: 16, fontSize: 14, lineHeight: 1.7, color: 'var(--color-text)' }}>
                {selectedMsg.body}
              </div>
              <div style={{ padding: 16, borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8 }}>
                <button
                  style={{ ...styles.btn, ...styles.btnPrimary }}
                  onClick={() => {
                    setActiveTab('compose');
                    setComposeTo(selectedMsg.fromId);
                    setComposeSubject(`Re: ${selectedMsg.subject}`);
                    setComposeBody('');
                    setSelectedMsg(null);
                  }}
                >
                  <Send size={14} /> Reply
                </button>
                <button
                  style={{ ...styles.btn, ...styles.btnSecondary }}
                  onClick={() => setSelectedMsg(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── COMPOSE TAB ─── */}
      {activeTab === 'compose' && (
        <div style={{ ...styles.card, padding: 24, maxWidth: 600 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Send size={18} style={{ color: 'var(--color-primary)' }} />
            New Message
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>To</label>
              <select
                style={styles.input}
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
              >
                <option value="">Select recipient...</option>
                {staff
                  .filter((s) => s.id !== currentStaff.id)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role.replace(/_/g, ' ')}) — {s.department}
                    </option>
                  ))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Subject</label>
              <input
                style={styles.input}
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="Enter subject..."
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Body</label>
              <textarea
                style={styles.textarea}
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Type your message..."
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Priority</label>
              <select
                style={styles.input}
                value={composePriority}
                onChange={(e) => setComposePriority(e.target.value as 'Normal' | 'Urgent')}
              >
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <button
              style={{ ...styles.btn, ...styles.btnPrimary, alignSelf: 'flex-start', padding: '10px 24px' }}
              onClick={handleSendMessage}
            >
              <Send size={16} /> Send Message
            </button>
          </div>
        </div>
      )}

      {/* ─── BROADCAST TAB ─── */}
      {activeTab === 'broadcast' && (
        <div style={{ ...styles.card, padding: 24, maxWidth: 600 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Megaphone size={18} style={{ color: 'var(--color-primary)' }} />
            Send Broadcast
          </h2>
          <div style={{ padding: 12, background: 'var(--color-info-light)', borderRadius: 'var(--radius)', marginBottom: 20, fontSize: 13, color: 'var(--color-info)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} />
            This will broadcast a message to all staff members.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Subject</label>
              <input
                style={styles.input}
                value={broadcastSubject}
                onChange={(e) => setBroadcastSubject(e.target.value)}
                placeholder="Broadcast subject..."
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Message</label>
              <textarea
                style={styles.textarea}
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
                placeholder="Enter broadcast message..."
              />
            </div>
            <button
              style={{ ...styles.btn, ...styles.btnPrimary, alignSelf: 'flex-start', padding: '10px 24px' }}
              onClick={handleBroadcast}
            >
              <Megaphone size={16} /> Send Broadcast
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
