import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, ChevronRight, Sparkles, Users } from 'lucide-react';
import { BackButton } from '../components/Common/BackButton';
import './Community.css';

interface CommunityItem {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    type: 'event' | 'activity' | 'feature' | 'campaign';
    image: string;
    spots?: number;
}

const COMMUNITY_ITEMS: CommunityItem[] = [
    {
        id: 'teleconsult',
        title: 'Teleconsult 24/7',
        description: 'Consult top specialists from home anytime',
        date: 'Available Now',
        time: 'Anytime',
        location: 'Online',
        type: 'feature',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600'
    },
    {
        id: '1',
        title: 'Flu Vaccine Drive',
        description: 'Protect yourself and your family. 20% off for members.',
        date: 'Feb 15, 2026',
        time: '9:00 AM - 4:00 PM',
        location: 'Main Lobby',
        type: 'event',
        image: 'https://images.unsplash.com/photo-1633613286991-611fe299c4be?w=600',
        spots: 50
    },
    {
        id: '2',
        title: '"I Am Well" Campaign',
        description: 'Make a personal commitment to wellness and self-care',
        date: 'Ongoing',
        time: 'Join Anytime',
        location: 'Community',
        type: 'campaign',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600'
    },
    {
        id: '3',
        title: 'Yoga for Wellness',
        description: 'Start your weekend with mindful movement',
        date: 'Every Saturday',
        time: '6:00 AM',
        location: 'Rooftop Garden',
        type: 'activity',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600',
        spots: 30
    },
    {
        id: '4',
        title: 'Mental Health Webinar',
        description: 'Learn about stress management and self-care',
        date: 'Feb 20, 2026',
        time: '2:00 PM',
        location: 'Online',
        type: 'event',
        image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600',
        spots: 200
    },
    {
        id: '5',
        title: 'Blood Donation Drive',
        description: 'Give the gift of life. Every drop counts.',
        date: 'Feb 25, 2026',
        time: '8:00 AM - 3:00 PM',
        location: 'Community Hall',
        type: 'event',
        image: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=600',
        spots: 100
    },
];

export const Community: React.FC = () => {
    const navigate = useNavigate();

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'event': return 'event';
            case 'activity': return 'activity';
            case 'feature': return 'feature';
            case 'campaign': return 'campaign';
            default: return 'default';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'event': return 'Event';
            case 'activity': return 'Activity';
            case 'feature': return 'New Feature';
            case 'campaign': return 'Campaign';
            default: return type;
        }
    };

    const handleCardClick = (item: CommunityItem) => {
        if (item.id === 'teleconsult') {
            navigate('/visits/teleconsult');
        } else {
            navigate(`/events/${item.id}`);
        }
    };

    // Featured items (first 3)
    const featured = COMMUNITY_ITEMS.slice(0, 3);
    const allItems = COMMUNITY_ITEMS;

    return (
        <div className="community-container">
            <header className="page-header">
                <BackButton />
                <div className="header-text">
                    <h2>Community Hub</h2>
                    <p className="page-subtitle">Health tips, events, and community wellness</p>
                </div>
            </header>

            {/* Featured Section - Horizontal Scroll */}
            <section className="featured-section">
                <h3><Sparkles size={14} /> Featured</h3>
                <div className="featured-scroll">
                    {featured.map(item => (
                        <div
                            key={item.id}
                            className="featured-card"
                            onClick={() => handleCardClick(item)}
                        >
                            <div className="featured-image" style={{ backgroundImage: `url(${item.image})` }}>
                                <span className={`event-badge ${getTypeColor(item.type)}`}>
                                    {getTypeLabel(item.type)}
                                </span>
                            </div>
                            <div className="featured-info">
                                <h4>{item.title}</h4>
                                <p className="featured-desc">{item.description}</p>
                                <div className="event-meta">
                                    <span><Calendar size={12} /> {item.date}</span>
                                    <span><MapPin size={12} /> {item.location}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* All Events & Activities */}
            <section className="events-section">
                <h3><Calendar size={14} /> All Events & Activities</h3>
                <div className="events-list">
                    {allItems.map(item => (
                        <div
                            key={item.id}
                            className="event-card"
                            onClick={() => handleCardClick(item)}
                        >
                            <div className="event-thumb" style={{ backgroundImage: `url(${item.image})` }} />
                            <div className="event-content">
                                <div className="event-header">
                                    <span className={`type-pill ${getTypeColor(item.type)}`}>
                                        {getTypeLabel(item.type)}
                                    </span>
                                </div>
                                <h4>{item.title}</h4>
                                <div className="event-details">
                                    <span><Calendar size={14} /> {item.date}</span>
                                    <span><Clock size={14} /> {item.time}</span>
                                </div>
                                <div className="event-footer">
                                    {item.spots && (
                                        <span className="spots"><Users size={14} /> {item.spots} spots</span>
                                    )}
                                    {!item.spots && <span className="spots"><MapPin size={14} /> {item.location}</span>}
                                    <ChevronRight size={18} className="chevron" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

