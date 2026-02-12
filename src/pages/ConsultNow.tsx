import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Mic, MicOff, VideoOff, Phone, MessageSquare, Clock, User } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './ConsultNow.css';

type ConsultState = 'connecting' | 'waiting' | 'joined' | 'ended';

export const ConsultNow: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [state, setState] = useState<ConsultState>('connecting');
    const [waitTime, setWaitTime] = useState(0);
    const [micEnabled, setMicEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);

    // Simulate connection and waiting
    useEffect(() => {
        const connectTimer = setTimeout(() => {
            setState('waiting');
        }, 2000);

        return () => clearTimeout(connectTimer);
    }, []);

    // Wait timer
    useEffect(() => {
        if (state === 'waiting') {
            const interval = setInterval(() => {
                setWaitTime(prev => prev + 1);
            }, 1000);

            // Simulate doctor joining after 8 seconds
            const joinTimer = setTimeout(() => {
                setState('joined');
                showToast('Dr. Diaz has joined the call', 'success');
            }, 8000);

            // ... (skipping context implies I should probably use multi_replace or break this up if lines are far apart)
            // wait, replace_file_content needs contiguous block. 
            // I'll do two calls or one block if they are close. 
            // Line 36 and 122 are far apart. I will use multi_replace.

            return () => {
                clearInterval(interval);
                clearTimeout(joinTimer);
            };
        }
    }, [state, showToast]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEndCall = () => {
        setState('ended');
        showToast('Consultation ended', 'info');
    };

    return (
        <div className="consult-now-container">
            {/* Connecting State */}
            {state === 'connecting' && (
                <div className="state-screen connecting">
                    <div className="pulse-ring">
                        <Video size={40} />
                    </div>
                    <h2>Connecting...</h2>
                    <p>Preparing your video consultation</p>
                </div>
            )}

            {/* Waiting State */}
            {state === 'waiting' && (
                <div className="state-screen waiting">
                    <div className="waiting-animation">
                        <div className="doctor-avatar">
                            <User size={32} />
                        </div>
                        <div className="waiting-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                    <h2>Waiting for Doctor</h2>
                    <p>You're in the queue. A doctor will join shortly.</p>
                    <div className="wait-timer">
                        <Clock size={16} />
                        <span>Wait time: {formatTime(waitTime)}</span>
                    </div>

                    {/* Preview controls */}
                    <div className="preview-controls">
                        <button
                            className={`control-btn ${!micEnabled ? 'disabled' : ''}`}
                            onClick={() => setMicEnabled(!micEnabled)}
                        >
                            {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                        </button>
                        <button
                            className={`control-btn ${!videoEnabled ? 'disabled' : ''}`}
                            onClick={() => setVideoEnabled(!videoEnabled)}
                        >
                            {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                        </button>
                    </div>

                    <button className="btn-cancel" onClick={() => navigate('/visits')}>
                        Leave Queue
                    </button>
                </div>
            )}

            {/* Joined State (Mock Video Call) */}
            {state === 'joined' && (
                <div className="state-screen joined">
                    <div className="video-area">
                        <div className="remote-video">
                            <img
                                src="https://randomuser.me/api/portraits/women/44.jpg"
                                alt="Dr. Diaz"
                                className="doctor-image"
                            />
                            <span className="doctor-name">Dr. Jen Diaz</span>
                        </div>
                        <div className="local-video">
                            <User size={24} />
                            <span>You</span>
                        </div>
                    </div>

                    <div className="call-controls">
                        <button
                            className={`control-btn ${!micEnabled ? 'disabled' : ''}`}
                            onClick={() => setMicEnabled(!micEnabled)}
                        >
                            {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                        </button>
                        <button
                            className={`control-btn ${!videoEnabled ? 'disabled' : ''}`}
                            onClick={() => setVideoEnabled(!videoEnabled)}
                        >
                            {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                        </button>
                        <button className="control-btn chat">
                            <MessageSquare size={20} />
                        </button>
                        <button className="control-btn end" onClick={handleEndCall}>
                            <Phone size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Ended State */}
            {state === 'ended' && (
                <div className="state-screen ended">
                    <div className="ended-icon">
                        <Video size={40} />
                    </div>
                    <h2>Consultation Ended</h2>
                    <p>Thank you for using teleconsult!</p>
                    <div className="ended-actions">
                        <button className="btn-primary" onClick={() => navigate('/visits')}>
                            Back to Visits
                        </button>
                        <button className="btn-secondary" onClick={() => navigate('/')}>
                            Go Home
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
