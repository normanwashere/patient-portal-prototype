import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, ChevronRight, Sparkles, Users } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import './Community.css';

export interface CommunityItem {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    type: 'event' | 'activity' | 'feature' | 'campaign' | 'article';
    image: string;
    spots?: number;
}

const DEFAULT_COMMUNITY_ITEMS: CommunityItem[] = [
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

// Maxicare-specific community content (scraped from maxicare.com.ph/latest-announcements)
const MAXICARE_COMMUNITY_ITEMS: CommunityItem[] = [
    {
        id: 'mc-teleconsult',
        title: '24/7 Teleconsult with Video Call',
        description: 'Get access to expert medical care anytime, anywhere. Call a doctor now!',
        date: 'Available Now',
        time: '24/7',
        location: 'Online',
        type: 'feature',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600'
    },
    {
        id: 'mc-1',
        title: 'How to Say "I Love You" in a Diabetes-Friendly Way',
        description: 'It\'s the season of hearts — this Valentine\'s Day, think about the loved ones in your life, especially those managing diabetes. Simple choices can make a big difference. Helping them manage blood sugar levels during celebrations shows love and thoughtfulness.\n\nDitch the box of chocolates and try a personalized gift, create new memories with a nature walk or museum visit, and choose low-sugar, low-carb options if you\'re gifting edible treats.\n\nGive the gift of peace of mind with PRIMA for Diabetes by Maxicare Clinics — a prepaid healthcare e-voucher designed to support your loved one throughout their diabetes care journey, including essential tests like blood sugar, HBA1C, and lipid profile, nationwide access to Maxicare Clinics, plus a ₱10,000 Personal Accident Insurance Coverage, all for just ₱2,099.',
        date: 'Feb 1, 2026',
        time: 'Read Anytime',
        location: 'Maxicare News & Updates',
        type: 'article',
        image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600'
    },
    {
        id: 'mc-2',
        title: 'Achieve the Freedom to be in Charge with MyMaxicare',
        description: 'Most Filipinos know healthcare is important. The problem? A lot of people still think HMO plans are something you only get if you have a corporate job. If you\'re freelancing, self-employed, running a small business, or building your career independently, getting an HMO can feel out of reach.\n\nMyMaxicare is an HMO plan that lets you access Maxicare\'s wide network of hospitals and physicians nationwide. Each year you renew, it gets more rewarding as you unlock benefits like Daily Hospital Cash Benefit and Maxicare Insurance\'s Critical Illness Coverage up to ₱300,000.\n\nGet or renew your MyMaxicare plan today at maxicare.com.ph/maxicare-plans/mymaxicare or call Maxicare 24/7 Customer Care.',
        date: 'Jan 22, 2026',
        time: 'Read Anytime',
        location: 'Maxicare News & Updates',
        type: 'article',
        image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600'
    },
    {
        id: 'mc-3',
        title: 'Maxicare Group Consistently Maintains Great Place to Work® Certification',
        description: 'We\'re kicking off the year with a great milestone: Maxicare Group officially renews its Great Place to Work® certification! The recognition is more than a badge — it reflects the supportive culture we build together every day.\n\nFor consecutive years, the Maxicare Group has successfully earned this certification — for Maxicare Health Plans and Maxicare Insurance this is their 4th time, while Maxicare Clinics has earned its 2nd.\n\nThis year\'s recertification was even more remarkable due to the significant increase in employee engagement and positive perception of the management. By taking the best care of our people, we ensure they are empowered to take the best possible care of our members.',
        date: 'Jan 2, 2026',
        time: 'Announcement',
        location: 'Maxicare News & Updates',
        type: 'campaign',
        image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600'
    },
    {
        id: 'mc-4',
        title: 'Lock In to Crush 2026!',
        description: 'Imagine stepping into a boxing ring armed only with surgical gloves... You\'re almost ready to win, but you\'re missing the essentials. This 2026, level up and get ahead of the unexpected before it even hits.\n\nYour 2026 starter pack: Lock in your goals with S.M.A.R.T. planning, find an accountability buddy, and choose the right vibe with main-character confidence.\n\nEnsure you\'re in top-tier shape with PRIMA Screen starting at only ₱2,499 — enjoy an annual physical exam, five essential laboratory tests, an ECG, and comprehensive vital screenings. Pair that with Ease Insurance plans starting at ₱388 a year for critical illness and life protection.',
        date: 'Dec 22, 2025',
        time: 'Read Anytime',
        location: 'Maxicare News & Updates',
        type: 'article',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600'
    },
    {
        id: 'mc-5',
        title: 'Keep Holiday Cheers Healthy with Maxicare PRIMA and LifesavER',
        description: 'The holidays mean get-togethers, carols, and lovingly-cooked food! But let\'s make it extra special by also taking care of each other\'s well-being.\n\nOverconsuming fatty, salty, or sweet food can spike blood pressure and sugar. Too much alcohol can trigger "holiday heart syndrome." Moderate eating and a daily 30-minute exercise can help prevent these.\n\nMaxicare PRIMA offers streamlined access to healthcare starting at only ₱999/year with unlimited consultations. For emergencies, Maxicare LifesavER prepaid emergency cards help cover unexpected ER bills, accepted at any Maxicare-affiliated hospital, starting at just ₱2,299.',
        date: 'Dec 17, 2025',
        time: 'Read Anytime',
        location: 'Maxicare News & Updates',
        type: 'article',
        image: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=600'
    },
    {
        id: 'mc-6',
        title: 'New Year\'s Resolution, what? Life Goals Start Today!',
        description: 'Why wait for January to set new resolutions when you can start today? Here are three things you can work on to kickstart your "new year, new me" goals.\n\nExercise Regularly: The WHO recommends 150 minutes of walking per week. Start small — take the stairs or do two 10-minute walks a day. Save More Money: Start as low as ₱50 per week and gradually increase. The habit is what matters.\n\nGet Insured: Think of health and life insurance as your protection from life\'s unexpected moments. Maxicare Insurance offers plans starting at ₱388/year with critical illness coverage, accident benefits, and death benefits up to ₱250k.',
        date: 'Dec 10, 2025',
        time: 'Read Anytime',
        location: 'Maxicare News & Updates',
        type: 'article',
        image: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=600'
    },
    {
        id: 'mc-7',
        title: 'Maxicare HomeCare',
        description: 'Get your needed laboratory tests done in the comfort and safety of your home with Maxicare HomeCare. Our healthcare professionals come to you.',
        date: 'Available Now',
        time: 'Book Anytime',
        location: 'Your Home',
        type: 'feature',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600'
    },
    {
        id: 'mc-8',
        title: 'Animal Bite Vaccination',
        description: 'Bitten or scratched by an animal? Call our 24/7 Animal Bite Hotline at (02) 7798-7704. Rabies is 100% preventable with timely vaccination.',
        date: 'Available Daily',
        time: '24/7 Hotline',
        location: 'All Maxicare PCCs',
        type: 'event',
        image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600'
    },
];

export function getCommunityItems(tenantId: string): CommunityItem[] {
    switch (tenantId) {
        case 'maxicare': return MAXICARE_COMMUNITY_ITEMS;
        default: return DEFAULT_COMMUNITY_ITEMS;
    }
}

const FILTER_TABS = [
    { key: 'all', label: 'All' },
    { key: 'article', label: 'Articles' },
    { key: 'event', label: 'Events' },
    { key: 'feature', label: 'Features' },
    { key: 'campaign', label: 'Campaigns' },
    { key: 'activity', label: 'Activities' },
] as const;

export const Community: React.FC = () => {
    const navigate = useNavigate();
    const { tenant } = useTheme();
    const COMMUNITY_ITEMS = getCommunityItems(tenant.id);
    const [activeFilter, setActiveFilter] = useState<string>('all');

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'event': return 'event';
            case 'activity': return 'activity';
            case 'feature': return 'feature';
            case 'campaign': return 'campaign';
            case 'article': return 'article';
            default: return 'default';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'event': return 'Event';
            case 'activity': return 'Activity';
            case 'feature': return 'New Feature';
            case 'campaign': return 'Campaign';
            case 'article': return 'Article';
            default: return type;
        }
    };

    const handleCardClick = (item: CommunityItem) => {
        if (item.id === 'teleconsult' || item.id === 'mc-teleconsult') {
            navigate('/visits', { state: { highlight: 'teleconsult-now' } });
        } else {
            navigate(`/events/${item.id}`);
        }
    };

    // Featured items (first 3)
    const featured = COMMUNITY_ITEMS.slice(0, 3);
    // Filtered items based on active tab
    const filteredItems = activeFilter === 'all'
        ? COMMUNITY_ITEMS
        : COMMUNITY_ITEMS.filter(item => item.type === activeFilter);

    // Count per type (for badge counts)
    const typeCounts: Record<string, number> = {};
    for (const item of COMMUNITY_ITEMS) {
        typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
    }

    return (
        <div className="community-container">
            <header className="page-header pillar-header">
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

            {/* Filter Tabs */}
            <section className="events-section">
                <div className="community-filter-tabs">
                    {FILTER_TABS.map(tab => {
                        const count = tab.key === 'all' ? COMMUNITY_ITEMS.length : (typeCounts[tab.key] || 0);
                        if (tab.key !== 'all' && count === 0) return null;
                        return (
                            <button
                                key={tab.key}
                                className={`community-filter-tab ${activeFilter === tab.key ? 'active' : ''}`}
                                onClick={() => setActiveFilter(tab.key)}
                            >
                                {tab.label}
                                <span className="filter-count">{count}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="events-list">
                    {filteredItems.length === 0 && (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem 0' }}>
                            No items in this category yet.
                        </p>
                    )}
                    {filteredItems.map(item => (
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

