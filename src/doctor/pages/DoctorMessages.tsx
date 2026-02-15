import { useState } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  Clock,
  AlertTriangle,
  ChevronLeft,
  Check,
  CheckCheck,
} from 'lucide-react';
import { useProvider } from '../../provider/context/ProviderContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../ui';

export const DoctorMessages = () => {
  const {
    currentStaff,
    internalMessages,
    markMessageRead,
    sendMessage,
  } = useProvider();
  const { showToast } = useToast();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');

  // Messages for this doctor
  const myMessages = internalMessages
    .filter((m) => m.toId === currentStaff.id || m.fromId === currentStaff.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = myMessages.filter((m) => {
    if (filter === 'unread' && m.read) return false;
    if (filter === 'urgent' && m.priority !== 'Urgent') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        m.subject.toLowerCase().includes(q) ||
        m.fromName.toLowerCase().includes(q) ||
        m.body.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const unreadCount = myMessages.filter((m) => !m.read && m.toId === currentStaff.id).length;
  const urgentCount = myMessages.filter((m) => m.priority === 'Urgent' && !m.read).length;
  const selected = selectedId ? internalMessages.find((m) => m.id === selectedId) : null;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const msg = internalMessages.find((m) => m.id === id);
    if (msg && !msg.read && msg.toId === currentStaff.id) {
      markMessageRead(id);
    }
  };

  const handleReply = () => {
    if (!replyText.trim() || !selected) return;
    sendMessage({
      fromId: currentStaff.id,
      fromName: currentStaff.name,
      toId: selected.fromId,
      toName: selected.fromName,
      subject: `Re: ${selected.subject}`,
      body: replyText.trim(),
      priority: 'Normal',
    });
    showToast('Reply sent', 'success');
    setReplyText('');
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  // ===== MESSAGE DETAIL VIEW =====
  if (selected) {
    const isFromMe = selected.fromId === currentStaff.id;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 800, margin: '0 auto' }}>
        {/* Back button */}
        <button
          onClick={() => setSelectedId(null)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, background: 'none',
            border: 'none', cursor: 'pointer', padding: '6px 0',
            fontSize: 14, fontWeight: 600, color: 'var(--color-primary)',
          }}
        >
          <ChevronLeft size={18} /> Back to Messages
        </button>

        {/* Message card */}
        <div style={{
          background: 'var(--color-surface)', borderRadius: 14, border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'var(--color-primary)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0,
              }}>
                {getInitials(isFromMe ? selected.toName : selected.fromName)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>
                  {selected.subject}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {isFromMe ? `To: ${selected.toName}` : `From: ${selected.fromName}`}
                </div>
              </div>
              {selected.priority === 'Urgent' && (
                <span style={{
                  padding: '4px 10px', borderRadius: 6,
                  background: 'rgba(239,68,68,0.08)', color: 'var(--color-error)',
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>
                  <AlertTriangle size={11} style={{ marginRight: 3, verticalAlign: 'text-bottom' }} />
                  URGENT
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> {selected.date}
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '20px', fontSize: 14, lineHeight: 1.7, color: 'var(--color-text)' }}>
            {selected.body}
          </div>
        </div>

        {/* Reply */}
        {!isFromMe && (
          <div style={{
            background: 'var(--color-surface)', borderRadius: 14,
            border: '1px solid var(--color-border)', padding: '16px',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 10 }}>
              Reply to {selected.fromName}
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              style={{
                width: '100%', minHeight: 100, borderRadius: 10,
                border: '1px solid var(--color-border)', padding: '12px 14px',
                fontSize: 14, fontFamily: 'inherit', lineHeight: 1.6,
                color: 'var(--color-text)', background: 'var(--color-background)',
                resize: 'vertical', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button
                onClick={handleReply}
                disabled={!replyText.trim()}
                style={{
                  padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: replyText.trim() ? 'var(--color-primary)' : 'var(--color-border)',
                  color: replyText.trim() ? '#fff' : 'var(--color-text-muted)',
                  fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s',
                }}
              >
                <Send size={14} /> Send Reply
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== MESSAGE LIST VIEW =====
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <PageHeader
        title="Messages"
        subtitle={unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
        icon={<MessageSquare size={22} />}
        style={{ marginBottom: 0 }}
      />

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div style={{
          flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 10, padding: '0 12px',
        }}>
          <Search size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontSize: 14, color: 'var(--color-text)', padding: '10px 0',
              width: '100%', fontFamily: 'inherit',
            }}
          />
        </div>
        {(['all', 'unread', 'urgent'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, transition: 'all 0.15s',
              background: filter === f ? 'var(--color-primary)' : 'var(--color-surface)',
              color: filter === f ? '#fff' : 'var(--color-text-muted)',
              ...(filter !== f ? { border: '1px solid var(--color-border)' } : {}),
            }}
          >
            {f === 'all' && 'All'}
            {f === 'unread' && `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
            {f === 'urgent' && `Urgent${urgentCount > 0 ? ` (${urgentCount})` : ''}`}
          </button>
        ))}
      </div>

      {/* Message list */}
      {filtered.length === 0 ? (
        <div style={{
          padding: '48px 24px', textAlign: 'center', borderRadius: 14,
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        }}>
          <MessageSquare size={40} style={{ color: 'var(--color-border)', marginBottom: 12 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>
            {searchQuery ? 'No messages found' : filter === 'unread' ? 'No unread messages' : filter === 'urgent' ? 'No urgent messages' : 'No messages yet'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', opacity: 0.7 }}>
            Messages from the provider portal will appear here
          </div>
        </div>
      ) : (
        <div style={{
          borderRadius: 14, overflow: 'hidden',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {filtered.map((msg, i) => {
            const isFromMe = msg.fromId === currentStaff.id;
            const isUnread = !msg.read && msg.toId === currentStaff.id;
            return (
              <button
                key={msg.id}
                onClick={() => handleSelect(msg.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  width: '100%', textAlign: 'left', padding: '14px 16px',
                  background: isUnread ? 'rgba(59,130,246,0.03)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none',
                  transition: 'background 0.15s',
                  minHeight: 44,
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: isFromMe ? 'var(--color-text-muted)' : 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 12, fontWeight: 700,
                }}>
                  {getInitials(isFromMe ? msg.toName : msg.fromName)}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{
                      fontSize: 14, fontWeight: isUnread ? 800 : 600,
                      color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap', flex: 1,
                    }}>
                      {isFromMe ? msg.toName : msg.fromName}
                    </span>
                    {msg.priority === 'Urgent' && (
                      <AlertTriangle size={12} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
                    )}
                    {isUnread && (
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: 'var(--color-primary)', flexShrink: 0,
                      }} />
                    )}
                  </div>
                  <div style={{
                    fontSize: 13, fontWeight: isUnread ? 700 : 500,
                    color: isUnread ? 'var(--color-text)' : 'var(--color-text-muted)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    marginBottom: 2,
                  }}>
                    {msg.subject}
                  </div>
                  <div style={{
                    fontSize: 12, color: 'var(--color-text-muted)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    opacity: 0.8,
                  }}>
                    {msg.body}
                  </div>
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                    {msg.date}
                  </span>
                  {isFromMe && (
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      {msg.read ? <CheckCheck size={14} /> : <Check size={14} />}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
