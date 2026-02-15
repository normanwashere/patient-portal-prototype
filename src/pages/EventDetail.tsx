import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ActionHub } from '../components/Community/ActionHub';
import { DetailHeader } from '../components/Community/DetailHeader';
import { MapPin, CheckCircle, ExternalLink } from 'lucide-react';

import { useToast } from '../context/ToastContext';
import { ALL_CONTENT } from '../data/content';
import type { EventContent } from '../data/content';
import './EventDetail.css';

export const EventDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [isRegistered, setIsRegistered] = useState(false);

    // Find event by ID
    const event = ALL_CONTENT.find(e => e.id === id && e.type === 'event') as EventContent | undefined;

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
            <DetailHeader
                onShare={() => showToast('Shared event!', 'success')}
            />

            {/* Hero Image Section */}
            <div className="detail-hero-section">
                <img src={event.image} alt={event.title} className="hero-bg-image" />
                <div className="hero-overlay-gradient"></div>
                <span className="event-type-badge">{event.type}</span>
            </div>

            {/* Content */}
            <div className="detail-content detail-content-sheet">
                <div className="detail-layout-grid">
                    {/* LEFT COLUMN: Main Content */}
                    <div className="detail-main-column">
                        <h1>{event.title}</h1>

                        <div className="description-section">
                            <h3>About this Event</h3>
                            <div className="description-text rich-text">
                                {typeof event.content === 'string' ? (
                                    <div dangerouslySetInnerHTML={{ __html: event.content }} />
                                ) : (
                                    event.content || event.summary
                                )}
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

                    {/* RIGHT COLUMN: Action Hub (Sidebar) */}
                    <div className="detail-side-column">
                        <ActionHub
                            type="event"
                            data={{
                                id: event.id,
                                title: event.title,
                                date: event.date,
                                time: event.time,
                                location: event.location,
                                spots: event.spots
                            }}
                        />
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
