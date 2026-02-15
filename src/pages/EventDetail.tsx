import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, Share2, CheckCircle, ExternalLink, BookOpen } from 'lucide-react';
import { BackButton } from '../components/Common/BackButton';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../theme/ThemeContext';
import { EVENTS_DATA } from '../data/events';
import { getCommunityItems } from './Community';
import './EventDetail.css';

export const EventDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { tenant } = useTheme();
    const [isRegistered, setIsRegistered] = useState(false);

    // Find event by ID - check EVENTS_DATA first, then community items
    const eventsDataMatch = EVENTS_DATA.find(e => e.id === id);
    const communityItems = getCommunityItems(tenant.id);
    const communityMatch = communityItems.find(e => e.id === id);

    // Determine item type and if it's registerable
    const itemType = communityMatch?.type || 'event';
    const isRegisterable = communityMatch ? communityMatch.type === 'event' : true;
    const isArticle = itemType === 'article';
    const isFeature = itemType === 'feature';
    const isContentOnly = isArticle || isFeature || itemType === 'campaign';

    // Build a unified event object
    const event = eventsDataMatch || (communityMatch ? {
        id: communityMatch.id,
        title: communityMatch.title,
        description: communityMatch.description,
        date: communityMatch.date,
        time: communityMatch.time,
        location: communityMatch.location,
        address: communityMatch.location,
        type: (communityMatch.type === 'event' ? 'Health Fair' :
               communityMatch.type === 'campaign' ? 'Campaign' :
               communityMatch.type === 'feature' ? 'Feature' :
               communityMatch.type === 'article' ? 'Article' : 'Article') as any,
        image: communityMatch.image,
        spots: communityMatch.spots || (isRegisterable ? 100 : 0),
        registeredCount: communityMatch.spots ? Math.floor(communityMatch.spots * 0.4) : (isRegisterable ? 35 : 0),
        registered: false,
        featured: true,
        organizer: tenant.name,
        requirements: undefined,
    } : null);

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

    // Page title based on type
    const pageTitle = isRegisterable ? 'Health Events' : isArticle ? 'News & Updates' : 'Community';

    return (
        <div className="event-detail-container">
            <header className="page-header detail-page-header">
                <BackButton />
                <div className="header-text" style={{ flex: 1 }}>
                    <h2 style={{ lineHeight: '1.2' }}>{pageTitle}</h2>
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

                {/* Info Grid - adapt for content type */}
                <div className={`event-info-grid ${isContentOnly ? 'info-compact' : ''}`}>
                    <div className="info-item">
                        <Calendar size={18} />
                        <div>
                            <span className="label">{isArticle ? 'Published' : 'Date'}</span>
                            <span className="value">{event.date}</span>
                        </div>
                    </div>
                    {!isContentOnly && (
                        <div className="info-item">
                            <Clock size={18} />
                            <div>
                                <span className="label">Time</span>
                                <span className="value">{event.time}</span>
                            </div>
                        </div>
                    )}
                    {!isContentOnly && (
                        <div className="info-item">
                            <MapPin size={18} />
                            <div>
                                <span className="label">Location</span>
                                <span className="value">{event.location}</span>
                            </div>
                        </div>
                    )}
                    {isContentOnly && (
                        <div className="info-item">
                            <BookOpen size={18} />
                            <div>
                                <span className="label">Source</span>
                                <span className="value">{event.location}</span>
                            </div>
                        </div>
                    )}
                    {isRegisterable && event.spots > 0 && (
                        <div className="info-item">
                            <Users size={18} />
                            <div>
                                <span className="label">Spots Left</span>
                                <span className="value">{event.spots - (event.registeredCount || 0)} of {event.spots}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Capacity Bar - only for registerable events */}
                {isRegisterable && event.spots > 0 && (
                    <div className="capacity-section">
                        <div className="capacity-bar">
                            <div className="capacity-fill" style={{ width: `${((event.registeredCount || 0) / event.spots) * 100}%` }} />
                        </div>
                        <span className="capacity-text">{event.registeredCount || 0} registered</span>
                    </div>
                )}

                {/* Description */}
                <div className="description-section">
                    <h3>{isArticle ? 'Full Article' : isContentOnly ? 'Details' : 'About this Event'}</h3>
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

                {/* Location Map Placeholder - only for physical events */}
                {!isContentOnly && (
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
                )}
            </div>

            {/* Fixed Bottom CTA */}
            <div className="detail-cta">
                {isRegisterable ? (
                    isRegistered ? (
                        <div className="registered-confirmation">
                            <CheckCircle size={20} />
                            <span>You're Registered!</span>
                        </div>
                    ) : (
                        <button className="btn-register" onClick={handleRegister}>
                            Register Now
                        </button>
                    )
                ) : (
                    <button className="btn-back-community" onClick={() => navigate(-1)}>
                        Back to Community
                    </button>
                )}
            </div>
        </div>
    );
};
