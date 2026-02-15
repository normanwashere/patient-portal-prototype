import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CalendarDays, MapPin, Clock, ChevronRight, Sparkles, Users, BookOpen, Activity } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import './Community.css'; // Reusing community styles
import './HubPage.css';   // Reusing hub styles for guides

// --- Types ---
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
    featured?: boolean; // New flag for Hero section
}

interface HealthGuide {
    id: string;
    title: string;
    category: string;
    summary: string;
    imageUrl: string;
    readTime: string;
    url: string;
    content?: React.ReactNode;
    date?: string;
    author?: string;
}

// --- Data: Community Items ---
const COMMUNITY_ITEMS: CommunityItem[] = [
    {
        id: 'teleconsult',
        title: 'Teleconsult 24/7',
        description: 'Consult top specialists from home anytime. Our doctors are ready to help you.',
        date: 'Available Now',
        time: 'Anytime',
        location: 'Online',
        type: 'feature',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600',
        featured: true
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
        description: 'Make a personal commitment to wellness and self-care. Join thousands of others in this journey.',
        date: 'Ongoing',
        time: 'Join Anytime',
        location: 'Community',
        type: 'campaign',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600',
        featured: true
    },
    {
        id: '3',
        title: 'Yoga for Wellness',
        description: 'Start your weekend with mindful movement.',
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
        description: 'Learn about stress management and self-care.',
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

// --- Data: Health Guides ---
const GUIDES: HealthGuide[] = [
    {
        id: 'diabetes-control',
        title: '5 Lifestyle Changes to Help Control Your Diabetes',
        category: 'Chronic Care',
        summary: 'Small daily habits that make a big difference in managing blood sugar levels effectively.',
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600',
        readTime: '5 min read',
        url: 'https://www.maxicare.com.ph/health-guides/5-lifestyle-changes-to-help-control-your-diabetes/',
        date: 'Feb 10, 2026',
        author: 'Dr. Sarah Smith'
    },
    {
        id: 'gallstones',
        title: 'Cholelithiasis: How to Avoid Gallstones',
        category: 'Prevention',
        summary: 'Understanding the risk factors and dietary changes to keep your gallbladder healthy.',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600', // Known working URL
        readTime: '4 min read',
        url: 'https://www.maxicare.com.ph/health-guides/cholelithiasis-how-to-avoid-gallstones/',
        date: 'Jan 28, 2026',
        author: 'Medical Team'
    },
    {
        id: 'kidney-stones',
        title: 'How Can You Prevent Kidney Stones? 3 Practical Ways',
        category: 'Kidney Health',
        summary: 'Hydration and diet tips to prevent painful kidney stones before they start.',
        imageUrl: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=600',
        readTime: '3 min read',
        url: 'https://www.maxicare.com.ph/health-guides/how-can-you-prevent-kidney-stones-check-out-these-3-practical-ways/',
        date: 'Jan 15, 2026',
        author: 'Nutrition Dept'
    },
    {
        id: 'prostate-cancer',
        title: 'Prostate Cancer: What You Need To Know',
        category: 'Men\'s Health',
        summary: 'Early detection signs and improved treatment options for prostate health.',
        imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600',
        readTime: '6 min read',
        url: 'https://www.maxicare.com.ph/health-guides/prostate-cancer-what-you-need-to-know/'
    },
    {
        id: 'chronic-kidney',
        title: 'Chronic Kidney Disease: What You Need To Know',
        category: 'Kidney Health',
        summary: 'Managing CKD through lifestyle, diet, and regular monitoring.',
        imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600',
        readTime: '7 min read',
        url: 'https://www.maxicare.com.ph/health-guides/chronic-kidney-disease-what-you-need-to-know/'
    },
    {
        id: 'cholesterol-myths',
        title: '14 Cholesterol Myths Busted',
        category: 'Heart Health',
        summary: 'Separating fact from fiction when it comes to dietary cholesterol and heart health.',
        imageUrl: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600',
        readTime: '5 min read',
        url: 'https://www.maxicare.com.ph/health-guides/14-cholesterol-myths-busted/'
    },
    {
        id: 'heart-disease',
        title: '5 Healthy Living Habits to Prevent Heart Disease',
        category: 'Heart Health',
        summary: 'Actionable steps to strengthen your heart and reduce cardiovascular risk.',
        imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600',
        readTime: '4 min read',
        url: 'https://www.maxicare.com.ph/health-guides/5-healthy-living-habits-to-prevent-heart-disease/'
    },
    {
        id: 'thyroid-cancer',
        title: 'Thyroid Cancer: What You Need to Know',
        category: 'Cancer Care',
        summary: 'Symbols, types, and treatment journeys for thyroid conditions.',
        imageUrl: 'https://images.unsplash.com/photo-1579684453423-f84349ca60df?w=600',
        readTime: '5 min read',
        url: 'https://www.maxicare.com.ph/health-guides/thyroid-cancer-what-you-need-to-know/'
    }
];

// --- Types ---
type TabType = 'all' | 'features' | 'events' | 'guides' | 'activities';

export const News: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<TabType>('all');

    const { tenant } = useTheme();
    const isMaxicare = tenant.id === 'maxicare';

    // Default to 'guides' if specified in state, otherwise 'features'
    useEffect(() => {
        if (location.state?.tab === 'guides' && isMaxicare) {
            setActiveTab('guides');
        } else if (location.state?.tab) {
            setActiveTab(location.state.tab as TabType);
        }
    }, [location.state, isMaxicare]);

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
            navigate('/visits', { state: { focus: 'teleconsult' } });
        } else if (
            item.type === 'campaign' ||
            item.type === 'feature' ||
            ['crush-2026', 'wellness-webinar', 'family-health-fair', 'love-diabetes'].includes(item.id)
        ) {
            navigate(`/news/${item.id}`);
        } else {
            navigate(`/events/${item.id}`);
        }
    };

    const handleGuideClick = (guide: HealthGuide) => {
        // Navigate to the separate Guide page
        navigate(`/guides/${guide.id}`);
    };

    // Featured items for Hero (first 3)
    const featuredItems = isMaxicare
        ? [
            {
                id: 'crush-2026',
                title: 'Lock In to Crush 2026!',
                description: 'Join our annual fitness challenge to start the year strong. Sign up today!',
                date: 'Mar 1, 2026',
                time: 'Kickoff: 8:00 AM',
                location: 'City Sports Club',
                type: 'campaign' as const,
                image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
                featured: true
            },
            {
                id: 'wellness-webinar',
                title: 'Summer Wellness Webinar',
                description: 'Expert tips on staying hydrated and active during the summer heat.',
                date: 'Apr 10, 2026',
                time: '2:00 PM',
                location: 'Online',
                type: 'event' as const,
                image: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=600',
                featured: true
            },
            {
                id: 'family-health-fair',
                title: 'Family Health Fair',
                description: 'Free screenings, games, and prizes for the whole family.',
                date: 'May 20, 2026',
                time: '10:00 AM - 5:00 PM',
                location: 'Central Park',
                type: 'event' as const,
                image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600',
                featured: true
            }
        ]
        : COMMUNITY_ITEMS.filter(i => i.featured);

    // Inject proprietary Maxicare events if tenant is 'maxicare'
    const maxicareEvents: CommunityItem[] = [
        {
            id: 'love-diabetes',
            title: 'How to Say “I Love You” in a Diabetes-Friendly Way',
            description: 'Celebrate love without the sugar spike. Tips for a healthy Valentine\'s.',
            date: 'Feb 14, 2026',
            time: 'All Day',
            location: 'Online Guide',
            type: 'activity',
            image: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=600'
        },
        {
            id: 'crush-2026',
            title: 'Lock In to Crush 2026!',
            description: 'Join our annual fitness challenge to start the year strong.',
            date: 'Mar 1, 2026',
            time: 'Kickoff: 8:00 AM',
            location: 'City Sports Club',
            type: 'campaign',
            image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600'
        }
    ];

    const allItems = isMaxicare ? [...maxicareEvents, ...COMMUNITY_ITEMS] : COMMUNITY_ITEMS;

    // Filter items based on active tab
    const filteredItems = allItems.filter(item => {
        if (activeTab === 'all') return true;
        switch (activeTab) {
            case 'features':
                return item.type === 'feature'; // Only App Features
            case 'events':
                return item.type === 'event'; // Pure events
            case 'activities':
                return item.type === 'activity';
            default:
                return false;
        }
    });

    const TabButton = ({ id, label, icon: Icon }: { id: TabType, label: string, icon?: any }) => (
        <button
            className={`tab-pill-segment ${activeTab === id ? 'active' : ''}`}
            onClick={() => {
                setActiveTab(id);
            }}
        >
            {Icon && <Icon size={16} />}
            {label}
        </button>
    );

    // Simple Carousel State
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-advance carousel
    useEffect(() => {
        if (featuredItems.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide(curr => (curr + 1) % featuredItems.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [featuredItems.length]);

    return (
        <div className="community-container">
            <header className="page-header">
                <div className="flex items-center gap-3 mb-2">
                    <h2>News & Community</h2>
                </div>
            </header>

            {/* HERO / FEATURED SECTION - CAROUSEL */}
            {featuredItems.length > 0 && (
                <section className="hero-section group relative">
                    <div className="hero-slide" style={{ backgroundImage: `url(${featuredItems[currentSlide].image})`, transition: 'background-image 0.5s ease-in-out' }}>
                        <div className="hero-overlay">
                            <span className="hero-badge" style={{ backgroundColor: 'var(--color-primary)' }}>Featured</span>
                            <div className="hero-content">
                                <h2 className="animate-fade-in">{featuredItems[currentSlide].title}</h2>
                                <p className="animate-fade-in">{featuredItems[currentSlide].description}</p>
                                <button
                                    className="px-8 py-3 rounded-full font-bold text-base transition-all mt-4 transform hover:scale-105 active:scale-95 flex items-center gap-2 border-0"
                                    style={{
                                        backgroundColor: 'var(--color-primary)',
                                        color: 'white',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                        borderRadius: '100px' // Force pill shape
                                    }}
                                    onClick={() => handleCardClick(featuredItems[currentSlide])}
                                >
                                    Learn More <ChevronRight size={18} />
                                </button>
                            </div>

                            {/* Carousel Indicators */}
                            <div className="flex gap-2 justify-center mt-4 absolute bottom-4 left-0 right-0 z-10">
                                {featuredItems.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }}
                                        className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Carousel Controls (Arrows) - Always visible on desktop, high contrast */}
                    {featuredItems.length > 1 && (
                        <>
                            <button
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-md p-3 rounded-full text-white hover:bg-black/50 transition-all transform hover:scale-110 active:scale-95 z-20"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentSlide(curr => (curr - 1 + featuredItems.length) % featuredItems.length);
                                }}
                            >
                                <ChevronRight size={24} className="rotate-180" />
                            </button>
                            <button
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-md p-3 rounded-full text-white hover:bg-black/50 transition-all transform hover:scale-110 active:scale-95 z-20"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentSlide(curr => (curr + 1) % featuredItems.length);
                                }}
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}
                </section>
            )}

            {/* SEGMENTED TABS / FILTERS */}
            <div className="tabs-segmented-control mb-6">
                <TabButton id="all" label="All" />
                <TabButton id="features" label="App Features" icon={Sparkles} />
                <TabButton id="events" label="Events" icon={CalendarDays} />
                {isMaxicare && <TabButton id="guides" label="Health Guides" icon={BookOpen} />}
                <TabButton id="activities" label="Activities" icon={Activity} />
            </div>

            {/* TAB CONTENT */}
            {(activeTab === 'guides' || (activeTab === 'all' && isMaxicare)) && (
                // HEALTH GUIDES LIST (Show if tab is 'guides' OR 'all')
                <div style={{ animation: 'fadeIn 0.3s ease', marginBottom: '2rem' }}>
                    {activeTab === 'all' && isMaxicare && (
                        <h3 className="text-lg font-bold mb-3 text-slate-700 px-1">Health Guides</h3>
                    )}
                    <div className="events-list">
                        {GUIDES.map(guide => (
                            <div
                                key={guide.id}
                                className="event-card group cursor-pointer"
                                onClick={() => handleGuideClick(guide)}
                            >
                                <div
                                    className="event-thumb"
                                    style={{ backgroundImage: `url(${guide.imageUrl})` }}
                                >
                                </div>
                                <div className="event-content">
                                    <div className="event-header">
                                        <span className="type-pill feature" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                                            {guide.category}
                                        </span>
                                    </div>
                                    <h4>{guide.title}</h4>
                                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">{guide.summary}</p>
                                    <div className="event-details">
                                        <span><BookOpen size={14} /> {guide.readTime}</span>
                                        {guide.date && <span><CalendarDays size={14} /> {guide.date}</span>}
                                    </div>
                                    <div className="event-footer">
                                        <span className="spots" style={{ color: '#64748b', fontWeight: 500 }}>
                                            {guide.author}
                                        </span>
                                        <ChevronRight size={18} className="chevron" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {(activeTab !== 'guides') && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    {activeTab === 'all' && (
                        <h3 className="text-lg font-bold mb-3 text-slate-700 px-1">Latest Updates</h3>
                    )}

                    {filteredItems.length > 0 ? (
                        <div className="events-list">
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
                                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                                        <div className="event-details">
                                            <span><CalendarDays size={14} /> {item.date}</span>
                                            <span><Clock size={14} /> {item.time}</span>
                                        </div>
                                        <div className="event-footer">
                                            {item.spots ? (
                                                <span className="spots"><Users size={14} /> {item.spots} spots</span>
                                            ) : (
                                                <span className="spots"><MapPin size={14} /> {item.location}</span>
                                            )}
                                            <ChevronRight size={18} className="chevron" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <Sparkles size={48} className="mb-4 opacity-50" />
                            <p>No items found in this section.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
