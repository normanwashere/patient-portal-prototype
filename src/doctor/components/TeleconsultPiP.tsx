/**
 * TeleconsultPiP — Floating picture-in-picture mini-video window
 * Shown on all doctor pages when an active teleconsult call exists
 * and the user is NOT on the /doctor/teleconsult page.
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Maximize2,
  Clock,
} from 'lucide-react';
import { useProvider } from '../../provider/context/ProviderContext';

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

export const TeleconsultPiP = () => {
  const { activeTeleconsultCall, setActiveTeleconsultCall } = useProvider();
  const navigate = useNavigate();
  const location = useLocation();

  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  // Dragging state
  const [position, setPosition] = useState({ x: -1, y: -1 }); // -1 means use default
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const pipRef = useRef<HTMLDivElement>(null);

  // Timer
  useEffect(() => {
    if (!activeTeleconsultCall) return;
    const tick = setInterval(() => {
      setElapsed(Math.floor((Date.now() - activeTeleconsultCall.startedAt) / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [activeTeleconsultCall]);

  // Set default position (bottom-right)
  useEffect(() => {
    if (position.x === -1 && typeof window !== 'undefined') {
      setPosition({
        x: window.innerWidth - 320,
        y: window.innerHeight - 240,
      });
    }
  }, [position.x]);

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return; // Don't drag from buttons
    setIsDragging(true);
    const rect = pipRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 300, e.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 180, e.clientY - dragOffset.current.y)),
      });
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging]);

  // Don't show if no active call or we're on the teleconsult page
  const isOnTeleconsultPage = location.pathname.startsWith('/doctor/teleconsult');
  if (!activeTeleconsultCall || isOnTeleconsultPage) return null;

  const handleReturnToCall = () => {
    navigate('/doctor/teleconsult');
  };

  const handleEndCall = () => {
    setActiveTeleconsultCall(null);
  };

  return (
    <div
      ref={pipRef}
      onMouseDown={handleMouseDown}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: 300,
        zIndex: 9999,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.12)',
        border: '2px solid rgba(255,255,255,0.15)',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        transition: isDragging ? 'none' : 'box-shadow 0.2s',
        fontFamily: 'inherit',
      }}
    >
      {/* Video area */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          height: 140,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Patient avatar */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: 1,
          }}
        >
          {getInitials(activeTeleconsultCall.patientName)}
        </div>

        {/* Patient name */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 10,
            fontSize: 12,
            fontWeight: 700,
            color: '#fff',
            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            maxWidth: 180,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {activeTeleconsultCall.patientName}
        </div>

        {/* Timer */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            fontWeight: 700,
            color: '#4ade80',
            background: 'rgba(0,0,0,0.5)',
            padding: '3px 8px',
            borderRadius: 6,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#4ade80',
              display: 'inline-block',
              animation: 'pulse 2s infinite',
            }}
          />
          <Clock size={10} />
          {formatTime(elapsed)}
        </div>

        {/* Self-view (doctor) */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            right: 10,
            width: 40,
            height: 40,
            borderRadius: 8,
            background: 'rgba(30,41,59,0.9)',
            border: '2px solid rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            color: '#94a3b8',
          }}
        >
          DR
        </div>

        {/* Recording indicator */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 10,
            fontSize: 9,
            fontWeight: 800,
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            background: 'rgba(0,0,0,0.5)',
            padding: '3px 6px',
            borderRadius: 4,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#ef4444',
              display: 'inline-block',
              animation: 'pulse 1.5s infinite',
            }}
          />
          LIVE
        </div>
      </div>

      {/* Controls bar */}
      <div
        style={{
          background: '#1e293b',
          padding: '8px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <button
          onClick={() => setMicOn(!micOn)}
          title={micOn ? 'Mute' : 'Unmute'}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: micOn ? 'rgba(255,255,255,0.1)' : 'rgba(239,68,68,0.2)',
            color: micOn ? '#94a3b8' : '#ef4444',
            transition: 'all 0.15s',
          }}
        >
          {micOn ? <Mic size={14} /> : <MicOff size={14} />}
        </button>

        <button
          onClick={() => setVideoOn(!videoOn)}
          title={videoOn ? 'Camera off' : 'Camera on'}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: videoOn ? 'rgba(255,255,255,0.1)' : 'rgba(239,68,68,0.2)',
            color: videoOn ? '#94a3b8' : '#ef4444',
            transition: 'all 0.15s',
          }}
        >
          {videoOn ? <Video size={14} /> : <VideoOff size={14} />}
        </button>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Return to call */}
        <button
          onClick={handleReturnToCall}
          title="Return to teleconsult"
          style={{
            height: 32,
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            padding: '0 12px',
            background: 'rgba(99,102,241,0.9)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            transition: 'all 0.15s',
          }}
        >
          <Maximize2 size={12} />
          Open
        </button>

        {/* End call */}
        <button
          onClick={handleEndCall}
          title="End call"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ef4444',
            color: '#fff',
            transition: 'all 0.15s',
          }}
        >
          <PhoneOff size={14} />
        </button>
      </div>
    </div>
  );
};
