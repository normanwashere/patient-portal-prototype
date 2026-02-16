import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle, XCircle, X, Loader } from 'lucide-react';

interface GeofenceCheckInProps {
  clinicName: string;
  onVerified: () => void;
  onCancel: () => void;
}

type GeofenceState = 'verifying' | 'verified' | 'out-of-range';

export const GeofenceCheckIn: React.FC<GeofenceCheckInProps> = ({
  clinicName,
  onVerified,
  onCancel,
}) => {
  const [state, setState] = useState<GeofenceState>('verifying');
  const [fadeClass, setFadeClass] = useState('gf-fade-in');

  useEffect(() => {
    if (state === 'verifying') {
      const timer = setTimeout(() => {
        setFadeClass('gf-fade-out');
        setTimeout(() => {
          setState('verified');
          setFadeClass('gf-fade-in');
        }, 300);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const handleSimulateOutOfRange = () => {
    setFadeClass('gf-fade-out');
    setTimeout(() => {
      setState('out-of-range');
      setFadeClass('gf-fade-in');
    }, 300);
  };

  const handleTryAgain = () => {
    setFadeClass('gf-fade-out');
    setTimeout(() => {
      setState('verifying');
      setFadeClass('gf-fade-in');
    }, 300);
  };

  return (
    <>
      <style>{`
        .gf-overlay {
          position: fixed;
          inset: 0;
          z-index: 2000;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: gfOverlayIn 0.3s ease-out;
        }
        @keyframes gfOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .gf-card {
          background: white;
          border-radius: 1.5rem;
          width: 100%;
          max-width: 380px;
          padding: 2rem 1.5rem;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          position: relative;
          overflow: hidden;
        }
        .gf-close-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          color: #94a3b8;
          transition: all 0.15s;
          z-index: 2;
        }
        .gf-close-btn:hover {
          background: #f1f5f9;
          color: #475569;
        }
        .gf-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1rem;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .gf-fade-in {
          opacity: 1;
          transform: translateY(0);
        }
        .gf-fade-out {
          opacity: 0;
          transform: translateY(8px);
        }

        /* Map visual */
        .gf-map {
          width: 100%;
          height: 160px;
          border-radius: 1rem;
          position: relative;
          overflow: hidden;
          background:
            linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px),
            linear-gradient(rgba(148, 163, 184, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.04) 1px, transparent 1px),
            linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          background-size: 40px 40px, 40px 40px, 10px 10px, 10px 10px, 100% 100%;
        }
        .gf-map::before {
          content: '';
          position: absolute;
          top: 10%;
          left: 15%;
          right: 20%;
          bottom: 30%;
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 2px;
        }
        .gf-map::after {
          content: '';
          position: absolute;
          top: 35%;
          left: 5%;
          width: 90%;
          height: 1px;
          background: rgba(148, 163, 184, 0.12);
        }
        .gf-map-road {
          position: absolute;
          top: 0;
          left: 40%;
          width: 12px;
          height: 100%;
          background: rgba(148, 163, 184, 0.1);
        }
        .gf-map-road-h {
          position: absolute;
          top: 55%;
          left: 0;
          width: 100%;
          height: 10px;
          background: rgba(148, 163, 184, 0.1);
        }
        .gf-pin {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
        }
        .gf-pin-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .gf-radius-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          z-index: 1;
        }
        .gf-radius-ring.verifying {
          width: 80px;
          height: 80px;
          border: 2px dashed var(--color-primary, #3b82f6);
          opacity: 0.5;
          animation: gfPulseRing 1.5s ease-in-out infinite;
        }
        .gf-radius-ring.verified {
          width: 100px;
          height: 100px;
          background: color-mix(in srgb, var(--color-success, #22c55e) 12%, transparent);
          border: 2px solid color-mix(in srgb, var(--color-success, #22c55e) 40%, transparent);
        }
        .gf-radius-ring.out-of-range {
          width: 100px;
          height: 100px;
          background: color-mix(in srgb, var(--color-error, #ef4444) 8%, transparent);
          border: 2px dashed color-mix(in srgb, var(--color-error, #ef4444) 30%, transparent);
        }
        @keyframes gfPulseRing {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.3; }
        }
        .gf-user-dot {
          position: absolute;
          z-index: 3;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 6px rgba(0,0,0,0.2);
        }
        .gf-user-dot.nearby {
          top: 42%;
          left: 56%;
          background: var(--color-success, #22c55e);
        }
        .gf-user-dot.far {
          top: 15%;
          left: 80%;
          background: var(--color-error, #ef4444);
        }
        .gf-user-dot.nearby::after,
        .gf-user-dot.far::after {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          animation: gfUserPulse 2s infinite;
        }
        .gf-user-dot.nearby::after {
          background: color-mix(in srgb, var(--color-success, #22c55e) 20%, transparent);
        }
        .gf-user-dot.far::after {
          background: color-mix(in srgb, var(--color-error, #ef4444) 20%, transparent);
        }
        @keyframes gfUserPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.6); opacity: 0; }
        }

        /* Spinner */
        .gf-spinner {
          animation: gfSpin 1s linear infinite;
        }
        @keyframes gfSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Checkmark celebration */
        .gf-check-icon {
          animation: gfPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes gfPopIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        /* Buttons */
        .gf-btn {
          width: 100%;
          padding: 14px 20px;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .gf-btn-primary {
          background: var(--color-primary, #3b82f6);
          color: white;
          box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary, #3b82f6) 40%, transparent);
        }
        .gf-btn-primary:hover {
          filter: brightness(1.05);
          transform: translateY(-1px);
        }
        .gf-btn-secondary {
          background: #f1f5f9;
          color: #475569;
        }
        .gf-btn-secondary:hover {
          background: #e2e8f0;
        }
        .gf-btn-error {
          background: var(--color-error, #ef4444);
          color: white;
        }
        .gf-simulate-link {
          font-size: 0.7rem;
          color: var(--color-text-muted, #94a3b8);
          cursor: pointer;
          border: none;
          background: none;
          text-decoration: underline;
          text-underline-offset: 2px;
          margin-top: 0.25rem;
          transition: color 0.15s;
        }
        .gf-simulate-link:hover {
          color: var(--color-error, #ef4444);
        }
        .gf-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }
        .gf-subtitle {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }
        .gf-clinic-name {
          font-weight: 700;
          color: #334155;
        }
        .gf-distance-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .gf-distance-badge.success {
          background: color-mix(in srgb, var(--color-success, #22c55e) 12%, transparent);
          color: var(--color-success-dark, #15803d);
        }
        .gf-distance-badge.error {
          background: color-mix(in srgb, var(--color-error, #ef4444) 12%, transparent);
          color: var(--color-error-dark, #991b1b);
        }
        .gf-btn-group {
          display: flex;
          gap: 10px;
          width: 100%;
        }
        .gf-btn-group .gf-btn {
          flex: 1;
        }
        .gf-rule-text {
          font-size: 0.75rem;
          color: #94a3b8;
          margin: 0;
        }
      `}</style>

      <div className="gf-overlay" onClick={onCancel}>
        <div className="gf-card" onClick={(e) => e.stopPropagation()}>
          <button className="gf-close-btn" onClick={onCancel} aria-label="Close">
            <X size={18} />
          </button>

          <div className={`gf-content ${fadeClass}`}>
            {/* ── State: Verifying ── */}
            {state === 'verifying' && (
              <>
                <div className="gf-map">
                  <div className="gf-map-road" />
                  <div className="gf-map-road-h" />
                  <div className="gf-radius-ring verifying" />
                  <div className="gf-pin">
                    <div className="gf-pin-icon" style={{ background: 'var(--color-primary, #3b82f6)', color: 'white' }}>
                      <MapPin size={20} />
                    </div>
                  </div>
                </div>

                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'color-mix(in srgb, var(--color-primary, #3b82f6) 10%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader size={24} className="gf-spinner" style={{ color: 'var(--color-primary, #3b82f6)' }} />
                </div>

                <h3 className="gf-title">Verifying your location...</h3>
                <p className="gf-subtitle">
                  Checking proximity to <span className="gf-clinic-name">{clinicName}</span>
                </p>
              </>
            )}

            {/* ── State: Verified (in range) ── */}
            {state === 'verified' && (
              <>
                <div className="gf-map">
                  <div className="gf-map-road" />
                  <div className="gf-map-road-h" />
                  <div className="gf-radius-ring verified" />
                  <div className="gf-pin">
                    <div className="gf-pin-icon" style={{ background: 'var(--color-success, #22c55e)', color: 'white' }}>
                      <MapPin size={20} />
                    </div>
                  </div>
                  <div className="gf-user-dot nearby" />
                </div>

                <div className="gf-check-icon" style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-success, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 16px color-mix(in srgb, var(--color-success, #22c55e) 40%, transparent)' }}>
                  <CheckCircle size={28} />
                </div>

                <h3 className="gf-title">Location Verified</h3>
                <p className="gf-subtitle">
                  You are within <span className="gf-distance-badge success"><MapPin size={11} /> 150m</span> of <span className="gf-clinic-name">{clinicName}</span>
                </p>

                <button className="gf-btn gf-btn-primary" onClick={onVerified}>
                  <CheckCircle size={18} /> Proceed to Check-in
                </button>

                <button className="gf-simulate-link" onClick={handleSimulateOutOfRange}>
                  Simulate out of range
                </button>
              </>
            )}

            {/* ── State: Out of range ── */}
            {state === 'out-of-range' && (
              <>
                <div className="gf-map">
                  <div className="gf-map-road" />
                  <div className="gf-map-road-h" />
                  <div className="gf-radius-ring out-of-range" />
                  <div className="gf-pin">
                    <div className="gf-pin-icon" style={{ background: '#e2e8f0', color: '#64748b' }}>
                      <MapPin size={20} />
                    </div>
                  </div>
                  <div className="gf-user-dot far" />
                </div>

                <div className="gf-check-icon" style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-error, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 16px color-mix(in srgb, var(--color-error, #ef4444) 40%, transparent)' }}>
                  <XCircle size={28} />
                </div>

                <h3 className="gf-title">Outside Clinic Range</h3>
                <p className="gf-subtitle">
                  You are <span className="gf-distance-badge error"><MapPin size={11} /> 2.4 km</span> from <span className="gf-clinic-name">{clinicName}</span>
                </p>
                <p className="gf-rule-text">You must be within 200m of the clinic to check in</p>

                <div className="gf-btn-group">
                  <button className="gf-btn gf-btn-secondary" onClick={onCancel}>
                    Cancel
                  </button>
                  <button className="gf-btn gf-btn-primary" onClick={handleTryAgain}>
                    Try Again
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
