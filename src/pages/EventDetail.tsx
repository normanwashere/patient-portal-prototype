import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, Share2, CheckCircle, ExternalLink } from 'lucide-react';
import { BackButton } from '../components/Common/BackButton';
import { useToast } from '../context/ToastContext';
import { EVENTS_DATA } from '../data/events'; // Import shared data
import './EventDetail.css';

export const EventDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [isRegistered, setIsRegistered] = useState(false);

    // Find event by ID
    const event = EVENTS_DATA.find(e => e.id === id);

    if (!event) {
        return (
            <div className="p-8 text-center">
                <h2>Event not found</h2>
                <button className="text-primary mt-4" onClick={() => navigate('/events')}>Back to Events</button>
            </div>
        );
    }

    // Check if originally registered (mock logic)
    useEffect(() => {
        if (event?.registered) setIsRegistered(true);
    }, [event]);

    const handleRegister = () => {
        setIsRegistered(true);
        showToast('Successfully registered for the event!', 'success');
    };

    return (
        <div className="event-detail-container">
            <header className="page-header">
                <BackButton />
                <div className="header-text" style={{ flex: 1 }}>
                    <h2 style={{ lineHeight: '1.2' }}>Health Events</h2>
                </div>
                <button className="btn-share">
                    <Share2 size={20} />
                </button>
            </header>

            {/* Hero Image */}
            <div className="detail-hero" style={{ backgroundImage: `url(${event.image})` }}>
                <span className="event-type-badge">{event.type}</span>
            </div>

            {/* Content */}
            <div className="detail-content">
                <h1>{event.title}</h1>

                <div className="event-info-grid">
                    <div className="info-item">
                        <Calendar size={18} />
                        <div>
                            <span className="label">Date</span>
                            <span className="value">{event.date}</span>
                        </div>
                    </div>
                    <div className="info-item">
                        <Clock size={18} />
                        <div>
                            <span className="label">Time</span>
                            <span className="value">{event.time}</span>
                        </div>
                    </div>
                    <div className="info-item">
                        <MapPin size={18} />
                        <div>
                            <span className="label">Location</span>
                            <span className="value">{event.location}</span>
                        </div>
                    </div>
                    <div className="info-item">
                        <Users size={18} />
                        <div>
                            <span className="label">Spots Left</span>
                            <span className="value">{event.spots - (event.registeredCount || 0)} of {event.spots}</span>
                        </div>
                    </div>
                </div>

                {/* Capacity Bar */}
                <div className="capacity-section">
                    <div className="capacity-bar">
                        <div className="capacity-fill" style={{ width: `${((event.registeredCount || 0) / event.spots) * 100}%` }} />
                    </div>
                    <span className="capacity-text">{event.registeredCount || 0} registered</span>
                </div>

                {/* Description */}
                <div className="description-section">
                    <h3>About this Event</h3>
                    <div className="description-text">
                        {event.description.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                        ))}
                    </div>
                </div>

                {/* Requirements */}
                {event.requirements && (
                    <div className="requirements-section">
                        <h3>Requirements</h3>
                        <ul>
                            {event.requirements.map((req, i) => (
                                <li key={i}>
                                    <CheckCircle size={16} />
                                    {req}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}


                {/* Location Map Placeholder */}
                <div className="location-section">
                    <h3>Location</h3>
                    <div className="map-placeholder">
                        <MapPin size={24} />
                        <span>{event.address}</span>
                        <button className="btn-directions">
                            <ExternalLink size={14} />
                            Get Directions
                        </button>
                    </div>
                </div>
            </div>

            {/* Fixed Bottom CTA */}
            <div className="detail-cta">
                {isRegistered ? (
                    <div className="registered-confirmation">
                        <CheckCircle size={20} />
                        <span>You're Registered!</span>
                    </div>
                ) : (
                    <button className="btn-register" onClick={handleRegister}>
                        Register Now
                    </button>
                )}
            </div>
        </div>
    );
};
