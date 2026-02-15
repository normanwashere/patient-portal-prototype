import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DetailHeader } from '../components/Community/DetailHeader';
import { CalendarDays, Clock, User } from 'lucide-react';
import { ActionHub } from '../components/Community/ActionHub';
import { ALL_CONTENT } from '../data/content';
import type { ArticleContent } from '../data/content';
import './EventDetail.css'; // Reusing EventDetail styles for consistency

// Use shared data instead of local GUIDES
const GUIDES = ALL_CONTENT.filter(c => c.type === 'guide') as ArticleContent[];


// GUIDES are now filtered from ALL_CONTENT
// ...

export const HealthGuideDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const guide = GUIDES.find(g => g.id === id);

    if (!guide) {
        return (
            <div className="p-8 text-center">
                <h2>Health Guide not found</h2>
                <button className="text-blue-600 mt-4 font-medium" onClick={() => navigate('/news', { state: { tab: 'guides' } })}>
                    Back to Health Guides
                </button>
            </div>
        );
    }

    return (
        <div className="event-detail-container">
            {/* Header */}
            {/* Header */}
            <DetailHeader
                showBookmark={true}
                onBookmark={() => { /* toggle bookmark */ }}
                onShare={() => {
                    if (navigator.share) {
                        navigator.share({
                            title: guide.title,
                            text: guide.summary,
                            url: window.location.href,
                        });
                    }
                }}
            />

            {/* Hero Image */}
            <div className="detail-hero" style={{ backgroundImage: `url(${guide.image})` }}>
                <span className="event-type-badge">{guide.category}</span>
            </div>

            {/* Content */}
            <div className="detail-content detail-content-sheet">
                <div className="detail-layout-grid">
                    {/* LEFT COLUMN: Main Content */}
                    <div className="detail-main-column">
                        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                            <span className="flex items-center gap-1"><Clock size={14} /> {guide.readTime}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><CalendarDays size={14} /> {guide.date}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><User size={14} /> {guide.author}</span>
                        </div>

                        <h1 className="text-2xl font-bold mb-6 text-slate-800">{guide.title}</h1>

                        <div className="description-section">
                            <div className="description-text space-y-6 rich-text">
                                {guide.content ? (
                                    <div dangerouslySetInnerHTML={{ __html: guide.content }} />
                                ) : (
                                    <>
                                        <p className="font-medium text-lg text-gray-800 leading-relaxed border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded-r-lg">
                                            {guide.summary}
                                        </p>
                                        <p>
                                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                        </p>
                                        <h3>Key Takeaways</h3>
                                        <ul>
                                            <li>Understanding the basics of {guide.category}</li>
                                            <li>Simple steps to improve your health</li>
                                            <li>When to see a doctor</li>
                                        </ul>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Action Hub (Sidebar) */}
                    <div className="detail-side-column">
                        <ActionHub
                            type="article"
                            data={{
                                id: guide.id,
                                title: guide.title,
                                date: guide.date,
                                externalLink: guide.url
                            }}
                        />
                    </div>
                </div>

                {/* Mobile Sticky CTA (Hidden on Desktop) */}
                <div className="detail-cta">
                    <button className="btn-register" onClick={() => {
                        // Share logic
                        if (navigator.share) {
                            navigator.share({
                                title: guide.title,
                                text: guide.summary,
                                url: window.location.href,
                            });
                        }
                    }}>
                        Share this Guide
                    </button>
                </div>
            </div>
        </div>
    );
};
