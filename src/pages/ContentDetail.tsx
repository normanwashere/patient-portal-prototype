import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ALL_CONTENT } from '../data/content';
import { useToast } from '../context/ToastContext';
import {
    Clock, User, Calendar
} from 'lucide-react';
import './ContentDetail.css';

export const ContentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [isRegistered, setIsRegistered] = useState(false);

    // Find content
    const content = useMemo(() => ALL_CONTENT.find(c => c.id === id), [id]);

    const handleRegister = () => {
        setIsRegistered(true);
        showToast('Successfully registered for event!', 'success');
    };

    // Get related content (memoized to avoid random shifts, taking first 2 of same type)
    const relatedContent = useMemo(() => {
        if (!content) return [];
        return ALL_CONTENT.filter(c => c.type === content.type && c.id !== content.id).slice(0, 3);
    }, [content]);

    if (!content) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Content Not Found</h2>
                <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
                    onClick={() => navigate('/news')}
                >
                    Back to News
                </button>
            </div>
        );
    }

    const isEvent = content.type === 'event';

    return (
        <div className="content-detail-container">
            {/* 1. Hero Image (Full Width) */}
            <div className="cd-hero">
                <img
                    src={content.image}
                    alt={content.title}
                    className="cd-hero-img"
                />
                <div className="cd-hero-overlay"></div>
            </div>

            {/* 2. Content Body */}
            <div className="cd-body">
                {/* Badge */}
                <span className="cd-badge">
                    {content.category || (isEvent ? "Event" : "Health Guide")}
                </span>

                {/* Title */}
                <h1 className="cd-title font-display">
                    {content.title}
                </h1>

                {/* Metadata */}
                <div className="cd-metadata">
                    <div className="cd-meta-item">
                        <Clock size={14} className="cd-meta-icon" />
                        {content.date.toUpperCase()}
                    </div>
                    {content.author &&
                        <div className="cd-meta-item">
                            <User size={14} className="cd-meta-icon" />
                            {content.author.toUpperCase()}
                        </div>
                    }
                    {isEvent && 'time' in content && (
                        <div className="cd-meta-item">
                            <Calendar size={14} className="cd-meta-icon" />
                            {(content as any).time}
                        </div>
                    )}
                </div>

                {/* Author Block (Only if not an event, or if event has specific organizer/speaker) */}
                {!isEvent && (
                    <div className="cd-author-block">
                        <div className="cd-author-info">
                            <div className="cd-author-avatar">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Doctor" />
                            </div>
                            <div>
                                <h4 className="cd-author-name">Dr. Sarah Jenkins</h4>
                                <p className="cd-author-role">Board-certified Sleep Specialist</p>
                            </div>
                        </div>
                        <button className="cd-follow-btn">
                            Follow
                        </button>
                    </div>
                )}

                {/* Highlights Section */}
                <div className="cd-highlights">
                    <div className="cd-highlights-header">
                        <div className="cd-highlights-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                        </div>
                        <h3 className="cd-highlights-title">
                            {isEvent ? 'Event Details' : 'Article Highlights'}
                        </h3>
                    </div>
                    <ul className="cd-highlights-list">
                        {isEvent ? (
                            <>
                                <li className="cd-highlight-item">
                                    <span className="cd-bullet">•</span>
                                    Location: {(content as any).location}
                                </li>
                                <li className="cd-highlight-item">
                                    <span className="cd-bullet">•</span>
                                    Time: {(content as any).time}
                                </li>
                                {(content as any).requirements && (content as any).requirements.map((req: string, i: number) => (
                                    <li key={i} className="cd-highlight-item">
                                        <span className="cd-bullet">•</span>
                                        {req}
                                    </li>
                                ))}
                            </>
                        ) : (
                            <>
                                <li className="cd-highlight-item">
                                    <span className="cd-bullet">•</span>
                                    Maintain a consistent sleep-wake schedule even on weekends.
                                </li>
                                <li className="cd-highlight-item">
                                    <span className="cd-bullet">•</span>
                                    Optimize your environment: 65°F (18°C) is ideal.
                                </li>
                                <li className="cd-highlight-item">
                                    <span className="cd-bullet">•</span>
                                    Avoid caffeine and blue light at least 2-3 hours before bed.
                                </li>
                            </>
                        )}
                    </ul>
                </div>

                {/* Content Text */}
                <div className="cd-text">
                    {/* Lead Paragraph */}
                    <p className="cd-lead">
                        {content.summary}
                    </p>

                    {/* Render dynamic HTML content if available */}
                    {(content as any).content ? (
                        <div className="rich-text" dangerouslySetInnerHTML={{ __html: (content as any).content }} />
                    ) : (
                        /* Fallback / Placeholder if no content exists */
                        !isEvent ? (
                            <>
                                <p className="font-medium italic mb-6">
                                    Quality sleep is the foundation of good health. These evidence-based strategies can help you fall asleep faster.
                                </p>
                                <h3 className="font-bold text-slate-900 text-lg mb-2">1. Stick to a Schedule</h3>
                                <p className="mb-6">
                                    Go to bed and wake up at the same time every day, including weekends. Consistency reinforces your body's sleep-wake cycle.
                                </p>
                                <h3 className="font-bold text-slate-900 text-lg mb-2">2. Create a Restful Environment</h3>
                                <p className="mb-6">
                                    Keep your bedroom dark, quiet, and cool. Consider using darkening shades, earplugs, or a fan to create an environment that fits your needs.
                                </p>
                            </>
                        ) : (
                            <p className="mb-6">
                                Join us for this important health event. Spots are limited, so please register early to secure your place.
                            </p>
                        )
                    )}
                </div>

                {/* Related Guides */}
                <div className="cd-related">
                    <div className="cd-related-header">
                        <h3 className="cd-related-title font-display">Related Content</h3>
                        <button className="cd-related-view-all">View All</button>
                    </div>
                    <div className="cd-related-scroll">
                        {relatedContent.map(item => (
                            <div key={item.id} className="cd-related-card" onClick={() => navigate(`/content/${item.id}`)}>
                                <div className="cd-related-img-wrapper">
                                    <img src={item.image} alt={item.title} className="cd-related-img" />
                                </div>
                                <div className="cd-related-category">
                                    {item.category || 'Wellness'}
                                </div>
                                <h4 className="cd-related-card-title font-display">
                                    {item.title}
                                </h4>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. Sticky Bottom Bar (Register for Events) */}
            {/* 3. Sticky Bottom Bar (Register for Events) */}
            {isEvent && (
                <div className="cd-bottom-bar" style={{ justifyContent: 'center' }}>
                    <button
                        className={`cd-register-btn ${isRegistered ? 'registered' : ''}`}
                        onClick={handleRegister}
                        disabled={isRegistered}
                        style={{
                            backgroundColor: isRegistered ? '#10b981' : 'var(--color-primary)',
                            color: 'white',
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.75rem',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            cursor: isRegistered ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {isRegistered ? (
                            <>
                                <span style={{ fontSize: '1.2rem' }}>✓</span>
                                Registered
                            </>
                        ) : 'Register Now'}
                    </button>
                </div>
            )}
        </div>
    );
};
