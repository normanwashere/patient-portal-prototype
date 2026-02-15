import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Search, User } from 'lucide-react';
import { ALL_CONTENT } from '../data/content';
import { useTheme } from '../theme/ThemeContext';
import './ContentDashboard.css';

type TabType = 'all' | 'event' | 'guide' | 'news' | 'campaign';

export const ContentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { tenant } = useTheme();
    const [activeTab, setActiveTab] = useState<TabType>('guide'); // Default to Wellness Guides per mock
    const [searchTerm, setSearchTerm] = useState('');

    // Filter Content
    const filteredContent = useMemo(() => {
        let items = ALL_CONTENT;

        // Tenant Filter
        // If content has a tenantId, it MUST match the current tenant.
        // If no tenantId, it's global (show for everyone).
        items = items.filter(item =>
            !item.tenantId || item.tenantId === tenant.id
        );

        // Tab Filter
        if (activeTab !== 'all') {
            items = items.filter(item => item.type === activeTab);
        }

        // Search Filter
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            items = items.filter(i => i.title.toLowerCase().includes(lower) || i.summary.toLowerCase().includes(lower));
        }

        return items;
    }, [activeTab, searchTerm, tenant.id]);

    // Featured Items for Carousel (based on active tab)
    const featuredItems = useMemo(() => {
        return filteredContent.filter(i => i.featured).slice(0, 3);
    }, [filteredContent]);

    const handleCardClick = (id: string) => {
        navigate(`/content/${id}`);
    };

    const TabButton = ({ id, label }: { id: TabType, label: string }) => (
        <button
            className={`tab-btn ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
        >
            {label}
        </button>
    );

    return (
        <div className="health-hub-container container max-w-md mx-auto md:max-w-4xl">
            {/* 1. Header: Dynamic Tenant Hub + Profile */}
            <header className="hub-header">
                <h1 className="hub-title font-display">{tenant.name} Hub</h1>
                <div className="profile-icon-btn">
                    <User size={20} />
                </div>
            </header>

            {/* 2. Search Bar */}
            <div className="search-container">
                <div className="search-wrapper">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search guides, events, and news..."
                        className="hub-search-input font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* 3. Segmented Control Tabs */}
            <div className="tabs-container">
                <div className="hub-tabs">
                    <TabButton id="guide" label="Guides" />
                    <TabButton id="event" label="Events" />
                    <TabButton id="news" label="News" />
                    <TabButton id="campaign" label="Campaigns" />
                </div>
            </div>

            {/* Content Area */}
            <div className="hub-content">

                {/* 4. Featured Hero (Shows for current tab if any featured items exist) */}
                {featuredItems.length > 0 && (
                    <div className="featured-card-wrapper group" onClick={() => handleCardClick(featuredItems[0].id)}>
                        <img
                            src={featuredItems[0].image}
                            alt={featuredItems[0].title}
                            className="featured-img"
                        />
                        <div className="featured-overlay"></div>
                        <div className="featured-content">
                            <span className="featured-badge">
                                Featured
                            </span>
                            <h2 className="featured-title font-display">
                                {featuredItems[0].title}
                            </h2>
                            <button className="read-now-btn">
                                Read Now
                            </button>
                        </div>
                    </div>
                )}

                {/* 5. Daily Articles Grid (Guides, News, Campaigns) */}
                {(activeTab === 'guide' || activeTab === 'news' || activeTab === 'campaign') && (
                    <section>
                        <div className="section-header">
                            <h3 className="section-title font-display">
                                {activeTab === 'guide' ? 'Daily Articles' :
                                    activeTab === 'news' ? 'Latest News' :
                                        'Active Campaigns'}
                            </h3>
                            <button className="view-all-link">View all</button>
                        </div>
                        <div className="articles-grid">
                            {filteredContent.filter(i => !i.featured).map(item => (
                                <div key={item.id} className="article-card group" onClick={() => handleCardClick(item.id)}>
                                    <div className="article-thumb-wrapper">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="article-thumb"
                                        />
                                    </div>
                                    <div className="article-category">
                                        {item.category || (item.type === 'guide' ? 'Wellness' : 'News')}
                                    </div>
                                    <h4 className="article-title font-display">
                                        {item.title}
                                    </h4>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 6. Events List (Only on Events tab) */}
                {activeTab === 'event' && (
                    <section>
                        <h3 className="section-title font-display mb-4">Upcoming Events</h3>
                        <div className="events-list">
                            {filteredContent.filter(i => !i.featured).map(item => (
                                <div key={item.id} className="event-list-item" onClick={() => handleCardClick(item.id)}>
                                    {/* Date Block */}
                                    <div className="event-date-box">
                                        <span className="event-month">
                                            {new Date(item.date).toLocaleString('default', { month: 'short' }).toUpperCase()}
                                        </span>
                                        <span className="event-day">
                                            {new Date(item.date).getDate()}
                                        </span>
                                    </div>
                                    <div className="event-info">
                                        <h4 className="event-title">{item.title}</h4>
                                        <div className="event-type">
                                            <Activity size={12} className="mr-1" />
                                            Event
                                        </div>
                                        <span className="register-link">Register Now</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {filteredContent.length === 0 && (
                    <div className="empty-state">
                        <p>No content found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
