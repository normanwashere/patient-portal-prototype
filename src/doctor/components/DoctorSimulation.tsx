import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Play, Pause, SkipForward, SkipBack, X, RotateCcw,
  Stethoscope, ShieldAlert, Video, MessageSquare, ClipboardList,
  LayoutDashboard, Users, Pill, Brain, MonitorSmartphone,
} from 'lucide-react';
import { useProvider } from '../../provider/context/ProviderContext';

/* ─────────── Types ─────────── */

interface SimStep {
  id: string;
  route: string;
  feature: string;
  featureColor: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  duration: number; // seconds
  action?: () => void; // runs on enter
  cleanup?: () => void; // runs on leave
}

/* ─────────── Component ─────────── */

interface Props {
  onClose: () => void;
}

export const DoctorSimulation: React.FC<Props> = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setDoctorMode, setActiveTeleconsultCall } = useProvider();

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  /* ─────────── Steps ─────────── */

  const steps: SimStep[] = [
    {
      id: 'welcome',
      route: '/doctor',
      feature: 'DASHBOARD',
      featureColor: '#3b82f6',
      icon: <LayoutDashboard size={18} />,
      title: 'Morning Shift Begins',
      description: 'Dr. Santos starts his day. The dashboard shows today\'s appointments, pending tasks, real-time queue status, and KPI metrics at a glance.',
      duration: 8,
    },
    {
      id: 'queue',
      route: '/doctor/queue',
      feature: 'QUEUE',
      featureColor: '#10b981',
      icon: <Users size={18} />,
      title: 'In-Clinic Queue Management',
      description: 'The queue shows checked-in patients with wait times, chief complaints, and priority levels. The doctor can call the next patient, start encounters, or mark no-shows.',
      duration: 8,
    },
    {
      id: 'encounter',
      route: '/doctor/encounter',
      feature: 'ENCOUNTER',
      featureColor: '#8b5cf6',
      icon: <Stethoscope size={18} />,
      title: 'Patient Encounter — SOAP Notes',
      description: 'Juan Dela Cruz is seen for a hypertension follow-up. The encounter page provides SOAP documentation, vitals, allergies, and clinical tools — all in one view.',
      duration: 10,
    },
    {
      id: 'ai-assistant',
      route: '/doctor/encounter',
      feature: 'AI ASSISTANT',
      featureColor: '#ec4899',
      icon: <Brain size={18} />,
      title: 'AI Clinical Assistant',
      description: 'When activated, the AI assistant transcribes the encounter in real-time and can auto-generate SOAP notes. The doctor reviews and edits before signing.',
      duration: 8,
    },
    {
      id: 'prescriptions',
      route: '/doctor/prescriptions',
      feature: 'PRESCRIPTIONS',
      featureColor: '#f59e0b',
      icon: <Pill size={18} />,
      title: 'Prescription Management',
      description: 'Prescriptions are grouped by patient and sorted by urgency. Pending approvals and safety alerts surface first so nothing gets missed.',
      duration: 8,
    },
    {
      id: 'cdss',
      route: '/doctor/prescriptions',
      feature: 'CDSS',
      featureColor: '#ef4444',
      icon: <ShieldAlert size={18} />,
      title: 'Clinical Decision Support (CDSS)',
      description: 'CDSS detected a Drug-Allergy Conflict — Lourdes Bautista has a documented Penicillin allergy, but Amoxicillin was prescribed. The doctor can Switch Medication, Discontinue, or Acknowledge & Keep.',
      duration: 10,
    },
    {
      id: 'switch-tele',
      route: '/doctor',
      feature: 'MODE SWITCH',
      featureColor: '#7c3aed',
      icon: <Video size={18} />,
      title: 'Switching to Teleconsult Mode',
      description: 'Dr. Santos switches to teleconsult mode. The in-clinic queue is paused and the system transitions to the teleconsult waiting room.',
      duration: 7,
      action: () => setDoctorMode('teleconsult'),
      cleanup: () => setDoctorMode('in-clinic'),
    },
    {
      id: 'teleconsult-queue',
      route: '/doctor/teleconsult',
      feature: 'TELECONSULT',
      featureColor: '#7c3aed',
      icon: <Video size={18} />,
      title: 'Teleconsult Waiting Room',
      description: 'Patients waiting for a video consultation appear here with their intake information — chief complaint, vitals, and medical history — visible before joining the call.',
      duration: 8,
    },
    {
      id: 'teleconsult-call',
      route: '/doctor/teleconsult',
      feature: 'TELECONSULT',
      featureColor: '#7c3aed',
      icon: <MonitorSmartphone size={18} />,
      title: 'Desktop Teleconsult Layout',
      description: 'On desktop, the video feed and encounter tools display side by side — no need to minimize the video. SOAP notes, AI transcription, and CDSS are always accessible during the call.',
      duration: 9,
      action: () => {
        setActiveTeleconsultCall({
          id: 'sim-tc',
          patientName: 'Ana Reyes',
          startedAt: Date.now(),
          chiefComplaint: 'Persistent cough and low-grade fever',
        });
      },
    },
    {
      id: 'pip',
      route: '/doctor',
      feature: 'PICTURE-IN-PICTURE',
      featureColor: '#7c3aed',
      icon: <MonitorSmartphone size={18} />,
      title: 'Picture-in-Picture & Active Encounter Card',
      description: 'Navigating away from teleconsult keeps the call alive. A floating PiP video window follows the doctor, and an active encounter card provides one-click return to the call.',
      duration: 9,
    },
    {
      id: 'messages',
      route: '/doctor/messages',
      feature: 'MESSAGES',
      featureColor: '#06b6d4',
      icon: <MessageSquare size={18} />,
      title: 'Internal Messages',
      description: 'Messages from the provider portal include urgent consult requests, lab notifications, and administrative updates. Unread counts appear in the header and sidebar.',
      duration: 8,
      action: () => {
        setActiveTeleconsultCall(null);
      },
    },
    {
      id: 'tasks',
      route: '/doctor/tasks',
      feature: 'TASKS',
      featureColor: '#f97316',
      icon: <ClipboardList size={18} />,
      title: 'Tasks & Notifications',
      description: 'The tasks page centralizes pending lab reviews, prescription approvals, clinical reminders, and CDSS alerts — ensuring nothing falls through the cracks.',
      duration: 8,
    },
    {
      id: 'results',
      route: '/doctor/results',
      feature: 'LAB RESULTS',
      featureColor: '#14b8a6',
      icon: <ClipboardList size={18} />,
      title: 'Lab Results Review',
      description: 'Pending and completed lab results are reviewed here. Critical values are flagged, and the doctor can acknowledge, annotate, and follow up on abnormal findings.',
      duration: 8,
    },
    {
      id: 'complete',
      route: '/doctor',
      feature: 'COMPLETE',
      featureColor: '#10b981',
      icon: <LayoutDashboard size={18} />,
      title: 'Simulation Complete',
      description: 'The doctor portal provides a seamless, intelligent workflow — from queue management and clinical encounters to CDSS safety alerts, teleconsult, and team collaboration.',
      duration: 12,
      action: () => setDoctorMode('in-clinic'),
    },
  ];

  const step = steps[currentStep];
  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  /* ─────────── Step execution ─────────── */

  const executeStep = useCallback((idx: number) => {
    // Cleanup previous
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    const s = steps[idx];
    if (!s) return;
    // Navigate
    if (location.pathname !== s.route) {
      navigate(s.route);
    }
    // Run action
    if (s.action) {
      setTimeout(() => s.action!(), 300);
    }
    // Store cleanup
    if (s.cleanup) cleanupRef.current = s.cleanup;
    // Set countdown
    setCountdown(s.duration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, location.pathname]);

  /* ─────────── Controls ─────────── */

  const goToStep = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(idx, totalSteps - 1));
    setCurrentStep(clamped);
    executeStep(clamped);
  }, [totalSteps, executeStep]);

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) goToStep(currentStep + 1);
    else { setIsPlaying(false); }
  }, [currentStep, totalSteps, goToStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  const handlePlayPause = useCallback(() => setIsPlaying((p) => !p), []);

  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(true);
    executeStep(0);
  }, [executeStep]);

  const handleClose = useCallback(() => {
    if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; }
    setActiveTeleconsultCall(null);
    setDoctorMode('in-clinic');
    onClose();
  }, [onClose, setActiveTeleconsultCall, setDoctorMode]);

  /* ─────────── Auto-advance timer ─────────── */

  useEffect(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (!isPlaying) return;
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, handleNext]);

  /* ─────────── Initial mount ─────────── */

  useEffect(() => {
    executeStep(0);
    setTimeout(() => setIsVisible(true), 100);
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─────────── Render ─────────── */

  return (
    <>
      {/* Dim overlay at the edges */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 15%, transparent 70%, rgba(0,0,0,0.25) 100%)',
        transition: 'opacity 0.4s',
        opacity: isVisible ? 1 : 0,
      }} />

      {/* Main simulation bar */}
      <div style={{
        position: 'fixed',
        bottom: 80, // above mobile nav
        left: '50%',
        transform: `translateX(-50%) translateY(${isVisible ? '0' : '20px'})`,
        zIndex: 9999,
        width: 'min(560px, calc(100vw - 32px))',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: isVisible ? 1 : 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', position: 'relative' }}>
          <div style={{
            height: '100%', background: step.featureColor,
            width: `${progress}%`, transition: 'width 0.5s ease, background 0.3s',
            borderRadius: '0 2px 2px 0',
          }} />
          {/* Countdown indicator */}
          {isPlaying && (
            <div style={{
              position: 'absolute', right: 0, top: 0, height: '100%',
              width: `${(countdown / step.duration) * (100 - progress)}%`,
              background: 'rgba(255,255,255,0.08)',
              transition: 'width 1s linear',
            }} />
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '14px 16px 10px' }}>
          {/* Top row: feature tag + step counter + close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 800,
              background: step.featureColor, color: '#fff', letterSpacing: '0.06em',
            }}>
              {step.icon}
              {step.feature}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }}>
              {currentStep + 1} / {totalSteps}
            </span>
            <button onClick={handleClose} style={{
              background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
              padding: 4, borderRadius: 6, display: 'flex',
            }}>
              <X size={16} />
            </button>
          </div>

          {/* Title */}
          <div style={{
            fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4,
            lineHeight: 1.3,
          }}>
            {step.title}
          </div>

          {/* Description */}
          <div style={{
            fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55,
            marginBottom: 12,
          }}>
            {step.description}
          </div>

          {/* Controls */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10,
          }}>
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              style={{
                ...ctrlBtn, opacity: currentStep === 0 ? 0.3 : 1,
              }}
              title="Previous"
            >
              <SkipBack size={14} />
            </button>

            <button
              onClick={handlePlayPause}
              style={{
                ...ctrlBtn,
                background: isPlaying ? 'rgba(255,255,255,0.12)' : step.featureColor,
                width: 36, height: 36, borderRadius: '50%',
              }}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: 2 }} />}
            </button>

            <button
              onClick={handleNext}
              disabled={currentStep === totalSteps - 1}
              style={{
                ...ctrlBtn, opacity: currentStep === totalSteps - 1 ? 0.3 : 1,
              }}
              title="Next"
            >
              <SkipForward size={14} />
            </button>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Countdown text */}
            {isPlaying && currentStep < totalSteps - 1 && (
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                Next in {countdown}s
              </span>
            )}

            {currentStep === totalSteps - 1 && (
              <button onClick={handleRestart} style={{ ...ctrlBtn, gap: 4, padding: '6px 12px' }}>
                <RotateCcw size={12} /> Replay
              </button>
            )}
          </div>
        </div>

        {/* Step dots */}
        <div style={{
          display: 'flex', gap: 3, padding: '0 16px 10px', justifyContent: 'center',
        }}>
          {steps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goToStep(i)}
              style={{
                width: i === currentStep ? 18 : 6, height: 6,
                borderRadius: 3, border: 'none', cursor: 'pointer', padding: 0,
                background: i === currentStep ? step.featureColor : i < currentStep ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                transition: 'all 0.3s',
              }}
              title={s.title}
            />
          ))}
        </div>
      </div>
    </>
  );
};

/* ─────────── Shared button style ─────────── */

const ctrlBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: 'none', cursor: 'pointer', color: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 32, height: 32, borderRadius: 8, padding: 0,
  fontSize: 12, fontWeight: 600,
};
