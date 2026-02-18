/**
 * Communications – Full Messaging System for Provider App
 *
 * Features:
 * - Left panel: conversation list (DMs, Department channels, Group chats)
 * - Right panel: threaded chat view with message bubbles
 * - Compose bar at bottom with send
 * - New conversation / new DM modal
 * - Unread badges, pinned conversations, search
 * - Role-colored avatars, timestamps, urgent message styling
 */

import { useState, useMemo, useRef, useEffect, type CSSProperties } from 'react';
import {
  MessageSquare, Send, Search, Plus, Hash, Users, User,
  Pin, AlertTriangle,
  CheckCheck, Check, Building2, Pill, HeartPulse, Shield,
  Microscope, FileText, Zap, ArrowLeft,
} from 'lucide-react';
import { useProvider } from '../context/ProviderContext';
import { useToast } from '../../context/ToastContext';
import type { Conversation, ConversationType } from '../types';

// ── Colors ──
const V = {
  bg: '#f0f2f5',
  sidebar: 'var(--color-white)',
  chat: '#e5ddd5',
  chatBg: '#efeae2',
  card: 'var(--color-white)',
  border: 'var(--color-gray-200)',
  borderLight: 'var(--color-gray-100)',
  primary: 'var(--color-primary)',
  primaryLight: 'var(--color-info-light)',
  success: 'var(--color-success-dark)',
  successLight: 'var(--color-success-light)',
  warn: 'var(--color-warning)',
  warnLight: 'var(--color-warning-light)',
  danger: '#dc2626',
  dangerLight: 'var(--color-error-light)',
  info: 'var(--color-info)',
  purple: 'var(--color-purple-dark)',
  purpleLight: 'var(--color-purple-light)',
  text: 'var(--color-gray-800)',
  textSec: 'var(--color-gray-500)',
  textMuted: 'var(--color-gray-400)',
  bubbleSelf: '#dcf8c6',
  bubbleOther: 'var(--color-white)',
  radius: '10px',
  radiusSm: '6px',
  shadow: '0 1px 3px rgba(0,0,0,.08)',
  shadowMd: '0 4px 12px rgba(0,0,0,.1)',
};

const DEPT_ICONS: Record<string, typeof Hash> = {
  Laboratory: Microscope, Nursing: HeartPulse, Pharmacy: Pill,
  Emergency: Zap, Admin: Shield, Radiology: FileText,
};

const ROLE_COLORS: Record<string, string> = {
  doctor: 'var(--color-info-dark)', nurse: 'var(--color-success-dark)', lab_tech: 'var(--color-purple-dark)',
  pharmacist: 'var(--color-warning)', billing_staff: 'var(--color-info)', front_desk: 'var(--color-pink)',
  admin: 'var(--color-gray-500)', hr: 'var(--color-cyan)', imaging_tech: 'var(--color-purple)',
};

function getInitials(name: string): string {
  return name.split(' ').filter((_, i, a) => i === 0 || i === a.length - 1).map((w) => w[0]).join('').toUpperCase();
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch { return ''; }
}

function formatFullTime(iso: string): string {
  try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}

// ── Styles ──
const S: Record<string, CSSProperties> = {
  page: { display: 'flex', height: 'calc(100vh - 64px)', background: V.bg, overflow: 'hidden' },

  // Left panel
  left: { width: 340, minWidth: 280, background: V.sidebar, borderRight: `1px solid ${V.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  leftHeader: { padding: '16px 16px 12px', borderBottom: `1px solid ${V.border}` },
  leftTitle: { fontSize: 18, fontWeight: 700, color: V.text, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 },
  searchBox: { position: 'relative' as const },
  searchInput: { width: '100%', padding: '8px 12px 8px 34px', borderRadius: 20, border: `1px solid ${V.border}`, fontSize: 13, outline: 'none', background: 'var(--color-gray-50)', boxSizing: 'border-box' as const },
  convList: { flex: 1, overflowY: 'auto' as const },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: V.textMuted, textTransform: 'uppercase' as const, padding: '12px 16px 4px', letterSpacing: '0.5px' },

  // Conversation item
  convItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer', transition: 'background .1s', borderBottom: `1px solid ${V.borderLight}` },
  convItemActive: { background: V.primaryLight },
  convAvatar: { width: 42, height: 42, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0 },
  convInfo: { flex: 1, minWidth: 0 },
  convName: { fontSize: 14, fontWeight: 600, color: V.text, display: 'flex', alignItems: 'center', gap: 5 },
  convLastMsg: { fontSize: 12, color: V.textSec, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, marginTop: 2 },
  convMeta: { display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: 4, flexShrink: 0 },
  convTime: { fontSize: 11, color: V.textMuted },
  unreadBadge: { minWidth: 18, height: 18, borderRadius: 9, background: V.primary, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' },

  // Right panel - chat
  right: { flex: 1, display: 'flex', flexDirection: 'column', background: V.chatBg, overflow: 'hidden' },
  chatHeader: { padding: '12px 20px', background: V.card, borderBottom: `1px solid ${V.border}`, display: 'flex', alignItems: 'center', gap: 12 },
  chatHeaderName: { fontSize: 15, fontWeight: 700, color: V.text },
  chatHeaderSub: { fontSize: 12, color: V.textSec },
  chatMessages: { flex: 1, overflowY: 'auto' as const, padding: '16px 60px 16px 60px' },
  msgGroup: { marginBottom: 16 },
  dateDivider: { textAlign: 'center' as const, margin: '16px 0', fontSize: 11, color: V.textMuted },
  dateDividerBadge: { background: '#fff', padding: '4px 12px', borderRadius: 8, boxShadow: V.shadow, display: 'inline-block' },
  bubble: { maxWidth: '65%', padding: '8px 12px', borderRadius: '8px', fontSize: 13, lineHeight: 1.5, position: 'relative' as const, boxShadow: '0 1px 1px rgba(0,0,0,.06)' },
  bubbleSelf: { background: V.bubbleSelf, marginLeft: 'auto', borderTopRightRadius: 2 },
  bubbleOther: { background: V.bubbleOther, borderTopLeftRadius: 2 },
  bubbleSender: { fontSize: 11, fontWeight: 700, marginBottom: 2 },
  bubbleTime: { fontSize: 10, color: V.textMuted, marginTop: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 },
  bubbleUrgent: { background: V.dangerLight, border: `1px solid ${V.danger}33` },
  systemMsg: { textAlign: 'center' as const, fontSize: 12, color: V.textMuted, padding: '4px 12px', background: '#ffffffcc', borderRadius: 8, display: 'inline-block', margin: '4px auto' },

  // Compose
  composeBar: { padding: '10px 20px', background: V.card, borderTop: `1px solid ${V.border}`, display: 'flex', alignItems: 'center', gap: 10 },
  composeInput: { flex: 1, padding: '10px 14px', borderRadius: 20, border: `1px solid ${V.border}`, fontSize: 13, outline: 'none', background: 'var(--color-gray-50)' },
  sendBtn: { width: 40, height: 40, borderRadius: '50%', background: V.primary, color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  // Empty state
  emptyState: { flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', color: V.textMuted, gap: 8 },

  // Modal
  overlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: V.card, borderRadius: V.radius, padding: 24, width: '100%', maxWidth: 480, maxHeight: '80vh', overflow: 'auto' as const, boxShadow: V.shadowMd },
  modalTitle: { fontSize: 16, fontWeight: 700, color: V.text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },

  // Buttons
  btn: { display: 'inline-flex', alignItems: 'center', gap: 5, border: 'none', borderRadius: V.radiusSm, cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '7px 12px', transition: 'all .15s' },
  btnPrimary: { background: V.primary, color: '#fff' },
  btnOutline: { background: 'transparent', border: `1px solid ${V.border}`, color: V.text },
  btnSm: { padding: '5px 10px', fontSize: 11 },
  formLabel: { fontSize: 12, fontWeight: 600, color: V.textSec, display: 'block', marginBottom: 4 },
  formInput: { width: '100%', padding: '8px 12px', borderRadius: V.radiusSm, border: `1px solid ${V.border}`, fontSize: 13, outline: 'none', boxSizing: 'border-box' as const },
  formSelect: { width: '100%', padding: '8px 12px', borderRadius: V.radiusSm, border: `1px solid ${V.border}`, fontSize: 13, background: V.card, cursor: 'pointer', boxSizing: 'border-box' as const },
};

// ── Main Component ──
export const Communications = () => {
  const {
    conversations, chatMessages, sendChatMessage, createConversation, markConversationRead,
    totalUnreadMessages, currentStaff, staff,
    // Keep old messaging for backward compat
  } = useProvider();
  const { showToast } = useToast();

  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [composeText, setComposeText] = useState('');
  const [newConvOpen, setNewConvOpen] = useState(false);
  const [_mobileShowChat, setMobileShowChat] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'direct' | 'department' | 'group'>('all');

  // New conversation form
  const [newConvType, setNewConvType] = useState<ConversationType>('direct');
  const [newConvName, setNewConvName] = useState('');
  const [newConvParticipants, setNewConvParticipants] = useState<string[]>([]);
  const [newConvDeptTag, setNewConvDeptTag] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get active conversation and its messages
  const activeConv = useMemo(() =>
    conversations.find((c) => c.id === selectedConv) ?? null,
  [conversations, selectedConv]);

  const activeMessages = useMemo(() =>
    chatMessages.filter((m) => m.conversationId === selectedConv).sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
  [chatMessages, selectedConv]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    let convs = [...conversations];
    if (filterType !== 'all') convs = convs.filter((c) => c.type === filterType);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      convs = convs.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.lastMessageText.toLowerCase().includes(q) ||
        (c.departmentTag || '').toLowerCase().includes(q)
      );
    }
    // Sort: pinned first, then by last message time
    return convs.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.lastMessageAt.localeCompare(a.lastMessageAt);
    });
  }, [conversations, filterType, searchQuery]);

  // Group conversations by type
  const dmConvs = filteredConversations.filter((c) => c.type === 'direct');
  const deptConvs = filteredConversations.filter((c) => c.type === 'department');
  const groupConvs = filteredConversations.filter((c) => c.type === 'group');

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length]);

  // Mark as read when selecting
  const handleSelectConv = (convId: string) => {
    setSelectedConv(convId);
    markConversationRead(convId);
    setMobileShowChat(true);
  };

  // Send message
  const handleSend = () => {
    if (!composeText.trim() || !selectedConv) return;
    sendChatMessage(selectedConv, composeText.trim());
    setComposeText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Create new conversation
  const handleCreateConv = () => {
    if (newConvType === 'direct') {
      if (newConvParticipants.length === 0) { showToast('Select a person', 'error'); return; }
      const otherStaff = staff.find((s) => s.id === newConvParticipants[0]);
      // Check if DM already exists
      const existing = conversations.find((c) =>
        c.type === 'direct' &&
        c.participantIds.includes(currentStaff.id) &&
        c.participantIds.includes(newConvParticipants[0])
      );
      if (existing) {
        setSelectedConv(existing.id);
        setNewConvOpen(false);
        return;
      }
      const id = createConversation('direct', otherStaff?.name || '', [currentStaff.id, ...newConvParticipants]);
      setSelectedConv(id);
    } else {
      if (!newConvName.trim()) { showToast('Enter a name', 'error'); return; }
      if (newConvParticipants.length === 0) { showToast('Add participants', 'error'); return; }
      const ids = [currentStaff.id, ...newConvParticipants.filter((p) => p !== currentStaff.id)];
      const id = createConversation(newConvType, newConvName.trim(), ids, newConvType === 'department' ? newConvDeptTag : undefined);
      setSelectedConv(id);
    }
    showToast('Conversation created', 'success');
    setNewConvOpen(false);
    setNewConvName('');
    setNewConvParticipants([]);
    setMobileShowChat(true);
  };

  // ── Render: Conversation Avatar ──
  const renderAvatar = (conv: Conversation, size = 42) => {
    if (conv.type === 'department') {
      const DeptIcon = DEPT_ICONS[conv.departmentTag || ''] || Hash;
      const colors = ['var(--color-info-dark)', 'var(--color-purple-dark)', 'var(--color-info)', 'var(--color-success-dark)', 'var(--color-warning)', 'var(--color-error-dark)'];
      const bg = colors[conv.id.charCodeAt(conv.id.length - 1) % colors.length];
      return (
        <div style={{ ...S.convAvatar, width: size, height: size, background: bg, fontSize: size * 0.33 }}>
          <DeptIcon size={size * 0.45} />
        </div>
      );
    }
    if (conv.type === 'group') {
      return (
        <div style={{ ...S.convAvatar, width: size, height: size, background: V.purple, fontSize: size * 0.33 }}>
          <Users size={size * 0.45} />
        </div>
      );
    }
    // DM — show other person's initials
    const otherName = conv.participantNames.find((n) => n !== currentStaff.name) || conv.name;
    const otherId = conv.participantIds.find((id) => id !== currentStaff.id) || '';
    const otherStaff = staff.find((s) => s.id === otherId);
    const bg = ROLE_COLORS[otherStaff?.role || ''] || 'var(--color-gray-500)';
    return (
      <div style={{ ...S.convAvatar, width: size, height: size, background: bg, fontSize: size * 0.33 }}>
        {getInitials(otherName)}
      </div>
    );
  };

  // ── Render: Conversation List Item ──
  const renderConvItem = (conv: Conversation) => {
    const isActive = selectedConv === conv.id;
    const displayName = conv.type === 'direct'
      ? conv.participantNames.find((n) => n !== currentStaff.name) || conv.name
      : conv.name;

    return (
      <div
        key={conv.id}
        style={{ ...S.convItem, ...(isActive ? S.convItemActive : {}) }}
        onClick={() => handleSelectConv(conv.id)}
        onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--color-gray-50)'; }}
        onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        {renderAvatar(conv)}
        <div style={S.convInfo}>
          <div style={S.convName}>
            {conv.pinned && <Pin size={11} style={{ color: V.textMuted }} />}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</span>
          </div>
          <div style={S.convLastMsg}>
            {conv.lastMessageFromName && conv.lastMessageFromId !== currentStaff.id && (
              <span style={{ fontWeight: 600, marginRight: 4 }}>{conv.lastMessageFromName.split(' ')[0]}:</span>
            )}
            {conv.lastMessageFromId === currentStaff.id && (
              <span style={{ color: V.textMuted, marginRight: 4 }}>You:</span>
            )}
            {conv.lastMessageText || 'No messages yet'}
          </div>
        </div>
        <div style={S.convMeta}>
          <span style={{ ...S.convTime, color: conv.unreadCount > 0 ? V.primary : V.textMuted }}>
            {formatTime(conv.lastMessageAt)}
          </span>
          {conv.unreadCount > 0 && (
            <span style={S.unreadBadge}>{conv.unreadCount}</span>
          )}
        </div>
      </div>
    );
  };

  // ── Render: Chat Messages ──
  const renderMessages = () => {
    if (!activeConv) return null;

    let lastDate = '';
    return activeMessages.map((msg, idx) => {
      const isSelf = msg.fromId === currentStaff.id;
      const msgDate = new Date(msg.timestamp).toLocaleDateString();
      const showDate = msgDate !== lastDate;
      lastDate = msgDate;

      // Show sender name for group/dept chats (not DM)
      const showSender = !isSelf && activeConv.type !== 'direct';
      // Check if previous message was from same sender (collapse sender name)
      const prevMsg = idx > 0 ? activeMessages[idx - 1] : null;
      const sameSenderAsPrev = prevMsg && prevMsg.fromId === msg.fromId && !showDate;

      if (msg.type === 'system') {
        return (
          <div key={msg.id}>
            {showDate && (
              <div style={S.dateDivider}><span style={S.dateDividerBadge}>{msgDate === new Date().toLocaleDateString() ? 'Today' : msgDate}</span></div>
            )}
            <div style={{ textAlign: 'center', margin: '8px 0' }}>
              <span style={S.systemMsg}>{msg.text}</span>
            </div>
          </div>
        );
      }

      const senderColor = ROLE_COLORS[msg.fromRole || ''] || V.textSec;

      return (
        <div key={msg.id}>
          {showDate && (
            <div style={S.dateDivider}><span style={S.dateDividerBadge}>{msgDate === new Date().toLocaleDateString() ? 'Today' : msgDate}</span></div>
          )}
          <div style={{
            display: 'flex',
            justifyContent: isSelf ? 'flex-end' : 'flex-start',
            marginBottom: sameSenderAsPrev ? 2 : 8,
          }}>
            <div style={{
              ...S.bubble,
              ...(isSelf ? S.bubbleSelf : S.bubbleOther),
              ...(msg.type === 'urgent' ? S.bubbleUrgent : {}),
            }}>
              {showSender && !sameSenderAsPrev && (
                <div style={{ ...S.bubbleSender, color: senderColor }}>{msg.fromName}</div>
              )}
              {msg.type === 'urgent' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: V.danger, fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                  <AlertTriangle size={11} /> URGENT
                </div>
              )}
              <div>{msg.text}</div>
              <div style={S.bubbleTime}>
                {formatFullTime(msg.timestamp)}
                {isSelf && (msg.read ? <CheckCheck size={12} color={V.info} /> : <Check size={12} />)}
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  // ── Render: Chat Header ──
  const renderChatHeader = () => {
    if (!activeConv) return null;
    const displayName = activeConv.type === 'direct'
      ? activeConv.participantNames.find((n) => n !== currentStaff.name) || activeConv.name
      : activeConv.name;
    const participantCount = activeConv.participantIds.length;
    const typeLabel = activeConv.type === 'department' ? 'Department Channel' : activeConv.type === 'group' ? 'Group Chat' : '';

    return (
      <div style={S.chatHeader}>
        <button
          style={{ ...S.btn, ...S.btnOutline, ...S.btnSm, padding: 6, display: 'none' }}
          className="msg-back-btn"
          onClick={() => setMobileShowChat(false)}
        >
          <ArrowLeft size={16} />
        </button>
        {renderAvatar(activeConv, 38)}
        <div style={{ flex: 1 }}>
          <div style={S.chatHeaderName}>{displayName}</div>
          <div style={S.chatHeaderSub}>
            {typeLabel && <span>{typeLabel} · </span>}
            {participantCount} participant{participantCount !== 1 ? 's' : ''}
            {activeConv.departmentTag && <span> · {activeConv.departmentTag}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={{ ...S.btn, ...S.btnOutline, ...S.btnSm }} title="Members" onClick={() => showToast(`${participantCount} member${participantCount !== 1 ? 's' : ''} in this conversation`, 'info')}>
            <Users size={14} /> {participantCount}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={S.page}>
      {/* ── Left Panel: Conversations ── */}
      <div style={S.left}>
        <div style={S.leftHeader}>
          <div style={S.leftTitle}>
            <MessageSquare size={20} /> Messages
            {totalUnreadMessages > 0 && (
              <span style={S.unreadBadge}>{totalUnreadMessages}</span>
            )}
            <div style={{ marginLeft: 'auto' }}>
              <button
                style={{ ...S.btn, ...S.btnPrimary, ...S.btnSm }}
                onClick={() => { setNewConvOpen(true); setNewConvType('direct'); setNewConvParticipants([]); setNewConvName(''); }}
              >
                <Plus size={13} /> New
              </button>
            </div>
          </div>

          {/* Search */}
          <div style={S.searchBox}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: V.textMuted }} />
            <input
              style={S.searchInput}
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Type filter */}
          <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
            {([
              { key: 'all' as const, label: 'All' },
              { key: 'direct' as const, label: 'Direct' },
              { key: 'department' as const, label: 'Depts' },
              { key: 'group' as const, label: 'Groups' },
            ]).map((f) => (
              <button key={f.key}
                style={{
                  ...S.btn, ...S.btnSm, flex: 1, justifyContent: 'center',
                  background: filterType === f.key ? V.primary : 'transparent',
                  color: filterType === f.key ? '#fff' : V.textSec,
                  border: filterType === f.key ? 'none' : `1px solid ${V.border}`,
                }}
                onClick={() => setFilterType(f.key)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation list */}
        <div style={S.convList}>
          {filterType === 'all' ? (
            <>
              {deptConvs.length > 0 && (
                <>
                  <div style={S.sectionLabel}>Departments</div>
                  {deptConvs.map(renderConvItem)}
                </>
              )}
              {dmConvs.length > 0 && (
                <>
                  <div style={S.sectionLabel}>Direct Messages</div>
                  {dmConvs.map(renderConvItem)}
                </>
              )}
              {groupConvs.length > 0 && (
                <>
                  <div style={S.sectionLabel}>Group Chats</div>
                  {groupConvs.map(renderConvItem)}
                </>
              )}
            </>
          ) : (
            filteredConversations.map(renderConvItem)
          )}
          {filteredConversations.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: V.textMuted, fontSize: 13 }}>
              No conversations found
            </div>
          )}
        </div>
      </div>

      {/* ── Right Panel: Chat ── */}
      <div style={S.right}>
        {activeConv ? (
          <>
            {renderChatHeader()}
            <div style={S.chatMessages}>
              {activeMessages.length === 0 ? (
                <div style={{ ...S.emptyState, paddingTop: 60 }}>
                  <MessageSquare size={32} />
                  <div>No messages yet. Start the conversation!</div>
                </div>
              ) : (
                renderMessages()
              )}
              <div ref={messagesEndRef} />
            </div>
            <div style={S.composeBar}>
              <input
                style={S.composeInput}
                value={composeText}
                onChange={(e) => setComposeText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
              />
              <button
                style={{ ...S.sendBtn, opacity: composeText.trim() ? 1 : 0.5 }}
                onClick={handleSend}
                disabled={!composeText.trim()}
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div style={S.emptyState}>
            <MessageSquare size={48} style={{ opacity: 0.3 }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: V.text }}>Select a conversation</div>
            <div style={{ fontSize: 13, maxWidth: 300, textAlign: 'center' }}>
              Choose a conversation from the left panel or start a new one to message doctors, nurses, or departments.
            </div>
            <button
              style={{ ...S.btn, ...S.btnPrimary, marginTop: 8 }}
              onClick={() => { setNewConvOpen(true); setNewConvType('direct'); setNewConvParticipants([]); setNewConvName(''); }}
            >
              <Plus size={14} /> New Conversation
            </button>
          </div>
        )}
      </div>

      {/* ── New Conversation Modal ── */}
      {newConvOpen && (
        <div style={S.overlay} onClick={() => setNewConvOpen(false)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalTitle}>
              <Plus size={18} /> New Conversation
            </div>

            {/* Type selector */}
            <div style={{ marginBottom: 16 }}>
              <div style={S.formLabel}>Type</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {([
                  { key: 'direct' as ConversationType, label: 'Direct Message', icon: User },
                  { key: 'department' as ConversationType, label: 'Department', icon: Building2 },
                  { key: 'group' as ConversationType, label: 'Group Chat', icon: Users },
                ]).map((t) => {
                  const Icon = t.icon;
                  return (
                    <button key={t.key}
                      style={{
                        ...S.btn, flex: 1, flexDirection: 'column', alignItems: 'center', padding: '10px 8px',
                        background: newConvType === t.key ? V.primaryLight : 'var(--color-gray-50)',
                        color: newConvType === t.key ? V.primary : V.textSec,
                        border: `2px solid ${newConvType === t.key ? V.primary : V.border}`,
                        borderRadius: V.radiusSm,
                      }}
                      onClick={() => { setNewConvType(t.key); setNewConvParticipants([]); }}>
                      <Icon size={18} />
                      <span style={{ fontSize: 11, fontWeight: 600, marginTop: 4 }}>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DM: select person */}
            {newConvType === 'direct' && (
              <div style={{ marginBottom: 16 }}>
                <div style={S.formLabel}>Send to</div>
                <select style={S.formSelect}
                  value={newConvParticipants[0] || ''}
                  onChange={(e) => setNewConvParticipants(e.target.value ? [e.target.value] : [])}>
                  <option value="">Select a person...</option>
                  {staff.filter((s) => s.id !== currentStaff.id).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.role.replace(/_/g, ' ')} ({s.department})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Department / Group: name + participants */}
            {(newConvType === 'department' || newConvType === 'group') && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <div style={S.formLabel}>{newConvType === 'department' ? 'Department Name' : 'Group Name'}</div>
                  <input style={S.formInput} value={newConvName} onChange={(e) => setNewConvName(e.target.value)}
                    placeholder={newConvType === 'department' ? 'e.g. Cardiology, ICU' : 'e.g. Night Shift Team'} />
                </div>
                {newConvType === 'department' && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={S.formLabel}>Department Tag</div>
                    <select style={S.formSelect} value={newConvDeptTag} onChange={(e) => setNewConvDeptTag(e.target.value)}>
                      <option value="">Select...</option>
                      {['Laboratory', 'Nursing', 'Pharmacy', 'Emergency', 'Admin', 'Radiology', 'Cardiology', 'ICU', 'OB-GYN', 'Pediatrics'].map((d) =>
                        <option key={d} value={d}>{d}</option>
                      )}
                    </select>
                  </div>
                )}
                <div style={{ marginBottom: 12 }}>
                  <div style={S.formLabel}>Add Participants</div>
                  <div style={{ maxHeight: 200, overflow: 'auto', border: `1px solid ${V.border}`, borderRadius: V.radiusSm }}>
                    {staff.filter((s) => s.id !== currentStaff.id).map((s) => {
                      const isSelected = newConvParticipants.includes(s.id);
                      return (
                        <div key={s.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer',
                            borderBottom: `1px solid ${V.borderLight}`,
                            background: isSelected ? V.primaryLight : 'transparent',
                          }}
                          onClick={() => {
                            setNewConvParticipants((prev) =>
                              isSelected ? prev.filter((p) => p !== s.id) : [...prev, s.id]
                            );
                          }}>
                          <div style={{
                            width: 18, height: 18, borderRadius: 4, border: `2px solid ${isSelected ? V.primary : V.border}`,
                            background: isSelected ? V.primary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {isSelected && <Check size={12} color="#fff" />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: V.text }}>{s.name}</div>
                            <div style={{ fontSize: 11, color: V.textSec }}>{s.role.replace(/_/g, ' ')} · {s.department}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {newConvParticipants.length > 0 && (
                    <div style={{ fontSize: 12, color: V.primary, marginTop: 4 }}>
                      {newConvParticipants.length} selected
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button style={{ ...S.btn, ...S.btnPrimary, flex: 1, justifyContent: 'center' }}
                onClick={handleCreateConv}>
                <MessageSquare size={14} /> Create
              </button>
              <button style={{ ...S.btn, ...S.btnOutline, flex: 1, justifyContent: 'center' }}
                onClick={() => setNewConvOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
