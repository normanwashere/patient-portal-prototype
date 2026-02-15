import React from 'react';
import { Calendar, Clock, MapPin, Users, Share2, ExternalLink, ArrowRight, Zap, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ActionHub.css';

interface ActionHubProps {
    type: 'event' | 'feature' | 'activity' | 'campaign' | 'article'; // Broadened types to match data
    data: {
        id: string;
        title: string;
        date?: string;
        time?: string;
        location?: string;
        spots?: number;
        route?: string;      // For features
        sourceUrl?: string;  // For articles
        externalLink?: string; // For articles/sources
    };
    category?: string; // Passed for context
}

export const ActionHub: React.FC<ActionHubProps> = ({ type, data, category }) => {
    const navigate = useNavigate();

    // 1. EVENT / CAMPAIGN / ACTIVITY -> Registration Card
    if (['event', 'activity', 'campaign'].includes(type) || (type === 'campaign' && !data.route)) {
        return (
            <div className="action-hub-card">
                <h3>{type === 'campaign' ? 'Join Campaign' : 'Event Details'}</h3>

                <div className="event-action-grid">
                    <div className="action-item">
                        <div className="action-label"><Calendar size={14} /> DATE</div>
                        <div className="action-value">{data.date || 'TBA'}</div>
                    </div>
                    <div className="action-item">
                        <div className="action-label"><Clock size={14} /> TIME</div>
                        <div className="action-value">{data.time || 'All Day'}</div>
                    </div>
                    <div className="action-item">
                        <div className="action-label"><MapPin size={14} /> LOCATION</div>
                        <div className="action-value">{data.location || 'Online'}</div>
                    </div>
                    <div className="action-item">
                        <div className="action-label"><Users size={14} /> {data.spots ? 'SPOTS LEFT' : 'CAPACITY'}</div>
                        <div className="action-value">{data.spots ? `${data.spots} of 50` : 'Open'}</div>
                    </div>
                </div>

                <div className="progress-bar-container" style={{ marginBottom: '1.5rem', background: '#f1f5f9', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                    <div className="progress-fill" style={{ width: '60%', background: 'var(--color-primary)', height: '100%' }}></div>
                </div>

                <button className="btn-action-primary">
                    Register Now
                </button>
            </div>
        );
    }

    // 2. FEATURE / APP -> Try It Now Card
    // 'feature' type or if it has a route
    if (type === 'feature' || data.route) {
        return (
            <div className="action-hub-card">
                <div className="feature-action-content">
                    <div className="feature-icon-wrapper">
                        <Zap size={32} />
                    </div>
                    <h3>Try New Feature</h3>
                    <p className="feature-description">
                        This feature is now available in your portal. Give it a try differently!
                    </p>
                    <button
                        className="btn-action-primary"
                        onClick={() => data.route && navigate(data.route)}
                    >
                        Open {category || 'Feature'} <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        );
    }

    // 3. ARTICLE / GUIDE -> Share Card
    // Fallback for guide, article, or anything else
    return (
        <div className="action-hub-card">
            <h3>Share this Story</h3>

            <div className="article-action-row">
                <div className="share-buttons">
                    <button className="btn-action-secondary"><Copy size={18} /></button>
                    <button className="btn-action-secondary"><Share2 size={18} /></button>
                </div>
                <div style={{ flex: 1 }}></div>
                {data.externalLink && (
                    <button
                        className="btn-action-secondary"
                        onClick={() => window.open(data.externalLink, '_blank')}
                    >
                        <ExternalLink size={16} /> Source
                    </button>
                )}
            </div>

            <button className="btn-action-primary" onClick={() => {
                // Mock share
                alert('Shared to your feed!');
            }}>
                Share with Friends
            </button>
        </div>
    );
};
