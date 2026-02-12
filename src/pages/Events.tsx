import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EVENTS_DATA } from '../data/events';
import './Events.css';

export const Events: React.FC = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState<string>('All');

    const events = EVENTS_DATA;

    const types = ['All', 'Screening', 'Webinar', 'Vaccination Drive', 'Wellness', 'Health Fair'];
    const filtered = filter === 'All' ? events : events.filter(e => e.type === filter);
    const featured = events.filter(e => e.featured);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Screening': return 'screening';
            case 'Webinar': return 'webinar';
            case 'Vaccination Drive': return 'vaccination';
            case 'Wellness': return 'wellness';
            case 'Health Fair': return 'fair';
            default: return 'default';
        }
    };

    return (
        <div className="events-container">
            <header className="page-header">
                <h2>Events & Activities</h2>
            </header>

            {/* Featured Events Carousel */}
            <div className="featured-section">
                <h3>Featured</h3>
                <div className="featured-scroll">
                    {featured.map(event => (
                        <div
                            key={event.id}
                            className="featured-card"
                            onClick={() => navigate(`/events/${event.id}`)}
                        >
                            <div className="featured-image" style={{ backgroundImage: `url(${event.image})` }}>
                                <span className={`event-badge ${getTypeColor(event.type)}`}>{event.type}</span>
                            </div>
                            <div className="featured-info">
                                <h4>{event.title}</h4>
                                <div className="event-meta">
                                    <span><Calendar size={12} /> {event.date}</span>
                                    <span><MapPin size={12} /> {event.location}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filter */}
            <div className="filter-chips">
                {types.map(t => (
                    <button
                        key={t}
                        className={`chip ${filter === t ? 'active' : ''}`}
                        onClick={() => setFilter(t)}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* All Events List */}
            <div className="events-list">
                {filtered.map(event => (
                    <div
                        key={event.id}
                        className="event-card"
                        onClick={() => navigate(`/events/${event.id}`)}
                    >
                        <div className="event-thumb" style={{ backgroundImage: `url(${event.image})` }} />
                        <div className="event-content">
                            <div className="event-header">
                                <span className={`type-pill ${getTypeColor(event.type)}`}>{event.type}</span>
                                {event.registered && <span className="registered-badge">Registered</span>}
                            </div>
                            <h4>{event.title}</h4>
                            <div className="event-details">
                                <span><Calendar size={14} /> {event.date}</span>
                                <span><Clock size={14} /> {event.time}</span>
                            </div>
                            <div className="event-footer">
                                <span className="spots"><Users size={14} /> {event.spots} spots left</span>
                                <ChevronRight size={18} className="chevron" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="empty-state">
                    <Calendar size={48} />
                    <p>No events found for this category.</p>
                </div>
            )}
        </div>
    );
};
