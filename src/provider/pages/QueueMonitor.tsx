/**
 * QueueMonitor — Standalone full-screen display for a single station/room.
 * Opens in a new browser tab and is designed to fill an external monitor.
 *
 * Route: /provider/queue/monitor/:stationKey
 *   stationKey can be:
 *     - A station name like "Check-In", "Triage", "Lab", "Pharmacy", "Billing"
 *     - A consult room id like "cr-1", "cr-2" (for Consult rooms)
 *     - "cr-1-return" (for Return-Consult in a specific room)
 *     - "all" for a combined overview
 */

import { useState, useEffect, useRef, useMemo, type CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import {
  Monitor, Clock, CheckCircle, UserPlus, Stethoscope,
  FlaskConical, Layers, Pill, CreditCard, DoorOpen,
  ArrowRight, AlertTriangle, Coffee, Play,
} from 'lucide-react';
import { useProvider } from '../context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';
import { getPatientTenant } from '../data/providerMockData';
import type { QueuePatient, StationType } from '../types';

/* ── helpers ── */
const stationIcon = (st: StationType | string, size = 20) => {
  switch (st) {
    case 'Check-In': return <UserPlus size={size} />;
    case 'Triage': return <Stethoscope size={size} />;
    case 'Consult': return <DoorOpen size={size} />;
    case 'Return-Consult': return <ArrowRight size={size} />;
    case 'Lab': return <FlaskConical size={size} />;
    case 'Imaging': return <Layers size={size} />;
    case 'Pharmacy': return <Pill size={size} />;
    case 'Billing': return <CreditCard size={size} />;
    default: return <CheckCircle size={size} />;
  }
};

/* ═══════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════ */

const S: Record<string, CSSProperties> = {
  page: { position: 'fixed', inset: 0, background: '#0f172a', color: '#e2e8f0', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 24px', background: '#1e293b', borderBottom: '1px solid #334155', flexShrink: 0 },
  brand: { display: 'flex', alignItems: 'center', gap: 10, color: '#94a3b8', fontSize: 14, fontWeight: 600 },
  clock: { color: '#f1f5f9', fontSize: 20, fontWeight: 800, fontFamily: 'monospace', letterSpacing: 2 },
  date: { color: '#64748b', fontSize: 12, fontWeight: 500 },

  body: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 },

  /* Hero — Currently Attending */
  hero: { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, padding: '28px 32px', flexShrink: 0 },
  heroLabel: { fontSize: 16, fontWeight: 700, color: '#a7f3d0', textTransform: 'uppercase' as const, letterSpacing: 3 },
  heroTicket: { fontSize: 80, fontWeight: 900, color: '#ffffff', fontFamily: 'monospace', letterSpacing: 6, textShadow: '0 4px 20px rgba(0,0,0,.25)', lineHeight: 1 },
  heroSub: { fontSize: 14, color: '#a7f3d0', fontWeight: 500 },

  /* Empty hero */
  heroEmpty: { background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)' },
  heroEmptyText: { fontSize: 24, fontWeight: 700, color: '#475569' },

  /* Queue list */
  queueSection: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  queueHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px 8px', flexShrink: 0 },
  queueTitle: { fontSize: 14, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: 2 },
  queueCount: { fontSize: 13, fontWeight: 700, color: '#64748b' },
  queueGrid: { flex: 1, display: 'grid', padding: '8px 28px 20px', gap: 10, overflowY: 'auto' as const, alignContent: 'start' },

  /* Ticket card */
  ticketCard: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderRadius: 12, transition: 'all .3s' },
  ticketNum: { fontSize: 32, fontWeight: 900, fontFamily: 'monospace', letterSpacing: 2 },
  ticketStatus: { fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 10, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  ticketPriority: { fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8, marginLeft: 8 },

  /* Footer */
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 24px', background: '#1e293b', borderTop: '1px solid #334155', flexShrink: 0 },
  footerText: { color: '#475569', fontSize: 11 },
  footerStats: { color: '#64748b', fontSize: 12, fontWeight: 600 },

  /* Station Info */
  stationInfo: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 28px', background: '#1e293b', borderBottom: '1px solid #334155', flexShrink: 0 },
  stationIcon: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 12, background: '#334155' },
  stationName: { fontSize: 24, fontWeight: 900, color: '#f1f5f9', letterSpacing: 0.5 },
  stationMeta: { fontSize: 13, color: '#94a3b8', fontWeight: 500 },
};

/* ═══════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════ */

export const QueueMonitor = () => {
  const { stationKey } = useParams<{ stationKey: string }>();
  const { tenant } = useTheme();
  const { queuePatients, consultRooms } = useProvider();
  const tenantId = tenant.id;

  // ── Tenant-filtered data ──
  const tenantPatients = useMemo(
    () => queuePatients.filter(p => getPatientTenant(p.patientId) === tenantId),
    [queuePatients, tenantId],
  );
  const tenantRooms = useMemo(
    () => consultRooms.filter(r => !r.tenantId || r.tenantId === tenantId),
    [consultRooms, tenantId],
  );
  const tenantStats = useMemo(() => {
    const active = tenantPatients.filter(p => p.status === 'QUEUED' || p.status === 'READY' || p.status === 'IN_SESSION');
    const waitTimes = active.map(p => p.waitMinutes).filter(n => n >= 0);
    return {
      completedToday: tenantPatients.filter(p => p.status === 'COMPLETED').length,
      avgWaitTime: waitTimes.length > 0 ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : 0,
    };
  }, [tenantPatients]);

  // Live clock
  const [clockTick, setClockTick] = useState(Date.now());
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    clockRef.current = setInterval(() => setClockTick(Date.now()), 1000);
    return () => { if (clockRef.current) clearInterval(clockRef.current); };
  }, []);

  // Parse stationKey to determine what to display
  const display = useMemo(() => {
    const key = decodeURIComponent(stationKey || 'all');

    // Consult room — both Consult AND Return-Consult share the same physical room
    // Legacy "-return" suffix routes are normalised to the base room
    const cleanKey = key.endsWith('-return') ? key.replace('-return', '') : key;
    const room = tenantRooms.find(r => r.id === cleanKey);
    if (room) return { type: 'consult-room' as const, roomId: cleanKey, room, label: `${room.name} — ${room.doctorName}`, sublabel: room.specialty };

    // Check if it's a station name
    const stationNames: StationType[] = ['Check-In', 'Triage', 'Lab', 'Imaging', 'Pharmacy', 'Billing'];
    const found = stationNames.find(s => s.toLowerCase() === key.toLowerCase());
    if (found) return { type: 'station' as const, stationType: found, label: found, sublabel: '' };

    // Default: overview
    return { type: 'overview' as const, label: 'Queue Overview', sublabel: '' };
  }, [stationKey, tenantRooms]);

  // Filter patients for this display
  // For consult rooms: Consult AND Return-Consult share the same room/doctor
  const { attending, waiting } = useMemo(() => {
    const active = tenantPatients.filter(
      p => p.status !== 'COMPLETED' && p.status !== 'NO_SHOW' && p.stationType !== 'Done'
    );

    let relevant: QueuePatient[];
    if (display.type === 'consult-room') {
      // Both Consult and Return-Consult patients in this room
      relevant = active.filter(p =>
        (p.stationType === 'Consult' || p.stationType === 'Return-Consult') &&
        p.consultRoomId === display.roomId
      );
    } else if (display.type === 'station') {
      relevant = active.filter(p => p.stationType === display.stationType);
    } else {
      relevant = active;
    }

    const att = relevant.filter(p => p.status === 'IN_SESSION');
    const wait = relevant.filter(p => p.status !== 'IN_SESSION');
    // Sort waiting: Emergency first, then by wait time descending
    wait.sort((a, b) => {
      const priOrder: Record<string, number> = { Emergency: 0, PWD: 1, Senior: 2, Normal: 3 };
      const pa = priOrder[a.priority] ?? 3;
      const pb = priOrder[b.priority] ?? 3;
      if (pa !== pb) return pa - pb;
      return b.waitMinutes - a.waitMinutes;
    });
    return { attending: att, waiting: wait };
  }, [tenantPatients, display]);

  const now = new Date(clockTick);
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const ticketBg = (p: QueuePatient): CSSProperties => {
    if (p.status === 'READY') return { background: '#1e40af', color: '#ffffff' };
    if (p.priority === 'Emergency') return { background: '#7f1d1d', color: '#fecaca' };
    if (p.priority === 'Senior' || p.priority === 'PWD') return { background: '#1e3a5f', color: '#bfdbfe' };
    return { background: '#1e293b', color: '#cbd5e1' };
  };

  const statusBadge = (p: QueuePatient) => {
    if (p.status === 'READY') return { text: 'NEXT', bg: '#2563eb', color: '#fff' };
    if (p.status === 'QUEUED') return { text: 'WAITING', bg: '#475569', color: '#94a3b8' };
    return { text: p.status.replace('_', ' '), bg: '#475569', color: '#94a3b8' };
  };

  /** Return-Consult tag so the monitor can differentiate first-visit vs return patients */
  const typeBadge = (p: QueuePatient) => {
    if (p.stationType === 'Return-Consult') return { text: 'RETURN', bg: '#7c3aed', color: '#ede9fe' };
    return null;
  };

  // ── Other stations summary — so patients can see queues elsewhere ──
  const otherStations = useMemo(() => {
    const active = tenantPatients.filter(
      p => p.status !== 'COMPLETED' && p.status !== 'NO_SHOW' && p.stationType !== 'Done'
    );

    // Define the facility stations patients typically visit in parallel
    const facilityStations: { key: string; label: string; icon: StationType }[] = [
      { key: 'Lab', label: 'Laboratory', icon: 'Lab' },
      { key: 'Imaging', label: 'Imaging', icon: 'Imaging' },
      { key: 'Pharmacy', label: 'Pharmacy', icon: 'Pharmacy' },
      { key: 'Billing', label: 'Billing', icon: 'Billing' },
    ];

    // Also include consult rooms
    const roomEntries = tenantRooms.filter(r => r.status !== 'Closed').map(r => ({
      key: `room-${r.id}`,
      label: r.name,
      icon: 'Consult' as StationType,
    }));

    const all = [...facilityStations, ...roomEntries];

    // Determine what the current display is so we can exclude it
    const currentKeys = new Set<string>();
    if (display.type === 'station') {
      currentKeys.add(display.stationType!);
    } else if (display.type === 'consult-room') {
      currentKeys.add(`room-${display.roomId}`);
    }

    return all
      .filter(s => !currentKeys.has(s.key) && !currentKeys.has(`room-${s.key}`))
      .map(s => {
        let stationPatients: QueuePatient[];
        if (s.key.startsWith('room-')) {
          const roomId = s.key.replace('room-', '');
          // Room combines both Consult and Return-Consult (same physical room)
          stationPatients = active.filter(p =>
            (p.stationType === 'Consult' || p.stationType === 'Return-Consult') &&
            p.consultRoomId === roomId
          );
        } else {
          stationPatients = active.filter(p => p.stationType === s.key);
        }

        const attendingPts = stationPatients.filter(p => p.status === 'IN_SESSION');
        const waitQueue = stationPatients
          .filter(p => p.status !== 'IN_SESSION')
          .sort((a, b) => {
            const priOrder: Record<string, number> = { Emergency: 0, PWD: 1, Senior: 2, Normal: 3 };
            const pa = priOrder[a.priority] ?? 3;
            const pb = priOrder[b.priority] ?? 3;
            if (pa !== pb) return pa - pb;
            return b.waitMinutes - a.waitMinutes;
          });
        const attendingTickets = attendingPts.map(p => p.ticketNumber);
        const next2 = waitQueue.slice(0, 2).map(p => p.ticketNumber);
        return {
          ...s,
          total: stationPatients.length,
          waiting: waitQueue.length,
          inSession: attendingPts.length,
          attendingTickets,
          next2,
        };
      })
      .filter(s => s.total > 0 || ['Lab', 'Imaging', 'Pharmacy', 'Billing'].includes(s.key)); // always show main facilities
  }, [tenantPatients, tenantRooms, display]);

  // Dynamic grid columns based on queue size
  const gridCols = waiting.length <= 3 ? '1fr' : waiting.length <= 8 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)';
  // Dynamic ticket font size based on count
  const ticketFontSize = waiting.length <= 4 ? 40 : waiting.length <= 8 ? 32 : 24;
  const heroFontSize = attending.length <= 1 ? 100 : attending.length <= 3 ? 60 : 44;

  // Determine display icon
  const displayIcon = display.type === 'consult-room'
    ? <DoorOpen size={24} />
    : display.type === 'station'
      ? stationIcon(display.stationType!, 24)
      : <Monitor size={24} />;

  return (
    <div style={S.page}>
      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.02)} }
        .qm-attending { animation: pulse 2.5s ease-in-out infinite; }

        /* READY ticket — subtle glowing border pulse to call attention */
        @keyframes readyGlow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59,130,246,0), 0 0 0 0 rgba(59,130,246,0);
            border-color: rgba(59,130,246,0.4);
            background: #1e40af;
          }
          50% {
            box-shadow: 0 0 16px 2px rgba(59,130,246,0.35), inset 0 0 12px rgba(59,130,246,0.08);
            border-color: rgba(96,165,250,0.8);
            background: #1d4ed8;
          }
        }
        .qm-ready-flash {
          animation: readyGlow 2s ease-in-out infinite;
          border: 2px solid rgba(59,130,246,0.4);
        }

        /* NEXT badge blink inside READY ticket */
        @keyframes badgeBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .qm-ready-flash .qm-next-badge {
          animation: badgeBlink 1.2s ease-in-out infinite;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      `}</style>

      {/* Toolbar */}
      <div style={S.toolbar}>
        <div style={S.brand}>
          <Monitor size={18} /> {tenant.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={S.date}>{dateStr}</span>
          <span style={S.clock}>{timeStr}</span>
        </div>
      </div>

      {/* Station Identity */}
      <div style={S.stationInfo}>
        <div style={S.stationIcon}>{displayIcon}</div>
        <div>
          <div style={S.stationName}>{display.label}</div>
          {display.sublabel && <div style={S.stationMeta}>{display.sublabel}</div>}
          {display.type === 'consult-room' && display.room?.status === 'On Break' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fbbf24', fontSize: 12, fontWeight: 600, marginTop: 4 }}>
              <Coffee size={12} /> Doctor is on break
            </div>
          )}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20 }}>
          {attending.length > 0 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#34d399', fontFamily: 'monospace' }}>
                {attending.length}
              </div>
              <div style={{ fontSize: 10, color: '#6ee7b7', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Attending</div>
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9', fontFamily: 'monospace' }}>
              {waiting.length}
            </div>
            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>In Queue</div>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid #334155', paddingLeft: 20 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#94a3b8', fontFamily: 'monospace' }}>
              {attending.length + waiting.length}
            </div>
            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Total</div>
          </div>
        </div>
      </div>

      <div style={S.body}>
        {/* Currently Attending */}
        {attending.length > 0 ? (
          <div className="qm-attending" style={S.hero}>
            <div style={S.heroLabel}>Currently Attending</div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
              {attending.map(p => {
                const tb = typeBadge(p);
                return (
                  <div key={p.id} style={{ textAlign: 'center' }}>
                    <div style={{ ...S.heroTicket, fontSize: heroFontSize }}>{p.ticketNumber}</div>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
                      {p.priority !== 'Normal' && (
                        <span style={{ fontSize: 13, fontWeight: 700, color: p.priority === 'Emergency' ? '#fca5a5' : '#a7f3d0' }}>
                          {p.priority}
                        </span>
                      )}
                      {tb && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: tb.bg, color: tb.color }}>
                          {tb.text}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={S.heroSub}>
              <Play size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
              {attending.length === 1 ? 'In session' : `${attending.length} patients in session`}
            </div>
          </div>
        ) : (
          <div style={{ ...S.hero, ...S.heroEmpty }}>
            <div style={S.heroEmptyText}>No patient currently attending</div>
            <div style={{ fontSize: 13, color: '#475569' }}>Waiting for next patient</div>
          </div>
        )}

        {/* Waiting Queue */}
        <div style={S.queueSection}>
          <div style={S.queueHeader}>
            <span style={S.queueTitle}>Waiting Queue</span>
            <span style={S.queueCount}>{waiting.length} patient{waiting.length !== 1 ? 's' : ''}</span>
          </div>
          {waiting.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155', fontSize: 18, fontWeight: 600 }}>
              Queue is clear
            </div>
          ) : (
            <div style={{ ...S.queueGrid, gridTemplateColumns: gridCols }}>
              {waiting.map((p, i) => {
                const bg = ticketBg(p);
                const badge = statusBadge(p);
                const tb = typeBadge(p);
                const isNext = i === 0 && p.status === 'QUEUED';
                return (
                  <div
                    key={p.id}
                    className={p.status === 'READY' ? 'qm-ready-flash' : ''}
                    style={{
                      ...S.ticketCard,
                      ...bg,
                      ...(isNext ? { borderLeft: '4px solid #3b82f6' } : {}),
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ ...S.ticketNum, fontSize: ticketFontSize }}>{p.ticketNumber}</div>
                      {p.priority !== 'Normal' && (
                        <span style={{
                          ...S.ticketPriority,
                          background: p.priority === 'Emergency' ? '#dc2626' : p.priority === 'Senior' ? '#1d4ed8' : '#15803d',
                          color: '#fff',
                        }}>
                          {p.priority === 'Emergency' && <AlertTriangle size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />}
                          {p.priority}
                        </span>
                      )}
                      {tb && (
                        <span style={{ ...S.ticketPriority, background: tb.bg, color: tb.color }}>
                          {tb.text}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: bg.color, opacity: 0.7, fontWeight: 500 }}>
                        <Clock size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                        +{p.waitMinutes}m
                      </span>
                      <span className={badge.text === 'NEXT' ? 'qm-next-badge' : ''} style={{ ...S.ticketStatus, background: badge.bg, color: badge.color }}>
                        {badge.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Other Stations Status Bar ── */}
      {otherStations.length > 0 && (
        <div style={{
          display: 'flex', gap: 0, padding: '0 0', background: '#0f172a',
          borderTop: '1px solid #1e293b', flexShrink: 0, overflowX: 'auto',
        }}>
          {otherStations.map((s, i) => {
            const isEmpty = s.total === 0;
            return (
              <div key={s.key} style={{
                flex: '1 1 0', minWidth: 160, padding: '8px 14px',
                borderRight: i < otherStations.length - 1 ? '1px solid #1e293b' : 'none',
                opacity: isEmpty ? 0.45 : 1,
              }}>
                {/* Header: station name + queue count badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <span style={{ color: '#64748b', flexShrink: 0 }}>{stationIcon(s.icon, 13)}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</span>
                  <span style={{
                    marginLeft: 'auto', fontSize: 10, fontWeight: 800, fontFamily: 'monospace',
                    padding: '1px 6px', borderRadius: 8, flexShrink: 0,
                    background: s.waiting === 0 ? '#166534' : s.waiting <= 3 ? '#854d0e' : '#991b1b',
                    color: s.waiting === 0 ? '#86efac' : s.waiting <= 3 ? '#fde68a' : '#fecaca',
                  }}>
                    {s.waiting}
                  </span>
                </div>

                {/* Attending row */}
                {s.attendingTickets.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                    <Play size={8} style={{ color: '#34d399', flexShrink: 0 }} />
                    {s.attendingTickets.map(t => (
                      <span key={t} style={{
                        fontSize: 11, fontWeight: 800, fontFamily: 'monospace', letterSpacing: 1,
                        color: '#34d399', padding: '1px 5px', borderRadius: 4,
                        background: 'rgba(52,211,153,0.12)',
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Next in queue row */}
                {s.next2.length > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={8} style={{ color: '#64748b', flexShrink: 0 }} />
                    {s.next2.map((t, j) => (
                      <span key={t} style={{
                        fontSize: 11, fontWeight: 800, fontFamily: 'monospace', letterSpacing: 1,
                        color: j === 0 ? '#93c5fd' : '#64748b',
                        padding: '1px 5px', borderRadius: 4,
                        background: j === 0 ? 'rgba(59,130,246,0.12)' : 'transparent',
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  !s.attendingTickets.length && (
                    <div style={{ fontSize: 10, color: '#334155', fontWeight: 500 }}>
                      {isEmpty ? 'No queue' : 'Clear'}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div style={S.footer}>
        <span style={S.footerText}>{tenant.name} — Queue Management System</span>
        <span style={S.footerStats}>
          Completed today: {tenantStats.completedToday} • Avg wait: {tenantStats.avgWaitTime}m
        </span>
      </div>
    </div>
  );
};
