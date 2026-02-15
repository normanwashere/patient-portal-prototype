import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CalendarDays, User } from 'lucide-react';
import { ActionHub } from '../components/Community/ActionHub';
import { DetailHeader } from '../components/Community/DetailHeader';
import './EventDetail.css'; // Reuse Event styles for consistent typography

// Mock Data for News Articles
const NEWS_ARTICLES: Record<string, {
    title: string;
    date: string;
    author: string;
    category: string;
    image: string;
    content: React.ReactNode;
}> = {
    'crush-2026': {
        title: 'Lock In to Crush 2026!',
        date: 'January 10, 2026',
        author: 'Maxicare Wellness Team',
        category: 'Wellness Campaign',
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200',
        content: (
            <>
                <p className="lead-paragraph">
                    Start your year with power and purpose! The "Crush 2026" campaign is Maxicare's biggest wellness initiative yet, designed to help you smash your fitness goals.
                </p>
                <h3>What is Crush 2026?</h3>
                <p>
                    It's more than just a fitness challenge. It's a holistic program that combines physical activity, mental resilience, and nutritional guidance to transform your health.
                    Whether you want to run your first 5K, lose weight, or simply feel more energetic, this program is for you.
                </p>
                <h3>Program Highlights</h3>
                <ul>
                    <li><strong>Weekly Challenges:</strong> Earn points by completing daily steps and workout goals.</li>
                    <li><strong>Expert Coaching:</strong> Get access to exclusive webinars with top fitness trainers.</li>
                    <li><strong>Community Support:</strong> Join our tribe of thousands of Maxicare members cheering you on.</li>
                    <li><strong>Amazing Rewards:</strong> Top performers win gadgets, staycations, and health packages.</li>
                </ul>
                <h3>How to Join</h3>
                <p>
                    Registration is free for all Maxicare members! simply click the "Join Now" button in your Rewards section or visit any Maxicare Primary Care Clinic to sign up.
                    Let's make 2026 your healthiest year yet!
                </p>
            </>
        )
    },
    'mymaxicare-portal': {
        title: 'Achieve the Freedom to Take Charge of Your Health',
        date: 'February 1, 2026',
        author: 'Digital Team',
        category: 'App Feature',
        image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200',
        content: (
            <>
                <p className="lead-paragraph">
                    Manage your healthcare anytime, anywhere with the new MyMaxicare Portal.
                </p>
                <p>
                    We've redesigned your experience from the ground up. Now, booking appointments, viewing lab results, and checking your coverage is faster and more intuitive than ever.
                </p>
                <h3>Key Features</h3>
                <ul>
                    <li><strong>Instant Booking:</strong> Schedule consultations with top doctors in seconds.</li>
                    <li><strong>Digital Lab Results:</strong> Access your medical records securely from your phone.</li>
                    <li><strong>Real-time Benefits:</strong> Check your HMO coverage and balance instantly.</li>
                </ul>
            </>
        )
    },
    'wellness-webinar': {
        title: 'Summer Wellness Webinar',
        date: 'March 15, 2026',
        author: 'Dr. Emily Chen',
        category: 'Health Education',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
        content: (
            <>
                <p className="lead-paragraph">
                    Beat the heat and stay healthy! Join our experts for a deep dive into summer wellness.
                </p>

                <p>
                    As temperatures rise, so do the risks of dehydration and heat-related illnesses. In this exclusive webinar, Dr. Emily Chen will share practical tips on how to stay cool, hydrated, and active during the summer months.
                </p>
                <h3>What You'll Learn</h3>
                <ul>
                    <li><strong>Hydration Hacks:</strong> How much water do you really need?</li>
                    <li><strong>Sun Safety:</strong> Choosing the right sunscreen and protective gear.</li>
                    <li><strong>Summer Diet:</strong> Foods that keep you cool and energized.</li>
                </ul>

                <p>
                    Don't miss out on this opportunity to ask questions directly to our medical team. Registration is open now!
                </p>
            </>
        )
    },
    'family-health-fair': {
        title: 'Family Health Fair 2026',
        date: 'April 5, 2026',
        author: 'Community Outreach',
        category: 'Community Event',
        image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200',
        content: (
            <>
                <p className="lead-paragraph">
                    A day of fun, fitness, and free health screenings for the whole family!
                </p>

                <p>
                    Bring the kids, grandparents, and friends to Central Park for Maxicare's annual Family Health Fair. We're turning health check-ups into a celebration of wellness.
                </p>
                <h3>Event Activities</h3>
                <ul>
                    <li><strong>Free Screenings:</strong> Blood pressure, BMI, and vision checks.</li>
                    <li><strong>Kids Zone:</strong> Games, face painting, and healthy snack workshops.</li>
                    <li><strong>Fitness Demos:</strong> Zumba, Yoga, and Tai Chi sessions for all ages.</li>
                    <li><strong>Raffle Prizes:</strong> Win gym memberships, wearables, and more!</li>
                </ul>
                <p>
                    Admission is free for all Maxicare members. See you there!
                </p>
            </>
        )
    },
    'love-diabetes': {
        title: 'How to Say "I Love You" in a Diabetes-Friendly Way',
        date: 'February 14, 2026',
        author: 'Nutrition Dept',
        category: 'Health Tips',
        image: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=1200',
        content: (
            <>
                <p className="lead-paragraph">
                    This Valentine's Day, show your love with heart-healthy choices that don't spike blood sugar.
                </p>

                <p>
                    Chocolates and sweets are traditional gifts, but for loved ones managing diabetes, they can be tricky. Here are some thoughtful, diabetes-friendly ways to celebrate.
                </p>
                <h3>Sweet Alternatives</h3>
                <ul>
                    <li><strong>Dark Chocolate:</strong> Opt for 70% cocoa or higher for antioxidants with less sugar.</li>
                    <li><strong>Fruit Bouquets:</strong> A colorful, delicious layout of fresh berries and melon.</li>
                    <li><strong>Sugar-Free Treats:</strong> Explore artisanal sugar-free desserts that taste just as good.</li>
                </ul>
                <h3>Date Night Ideas</h3>
                <p>
                    Instead of a heavy dinner, why not try a cooking class together? Or take a romantic sunset walk. Active dates are a great way to bond and stay healthy.
                </p>
            </>
        )
    }
};

export const NewsDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const article = id ? NEWS_ARTICLES[id] : null;

    // Use header context to handle back navigation if needed, 
    // but typically we render our own back button in the content or let Layout handle it.
    // For this page, we'll rely on the standard layout back button mapping (News -> parent).

    if (!article) {
        return (
            <div className="p-8 text-center">
                <h2>Article not found</h2>
                <button className="text-primary mt-4 underline" onClick={() => navigate('/news')}>
                    Back to News
                </button>
            </div>
        );
    }

    return (
        <div className="event-detail-container news-detail">
            {/* Reuse event-detail-container for shared basic styling */}
            <DetailHeader
                onShare={() => {
                    // Share logic
                    if (navigator.share) {
                        navigator.share({
                            title: article.title,
                            url: window.location.href,
                        });
                    }
                }}
            />

            {/* Hero Image Section */}
            <div className="detail-hero-section">
                <img src={article.image} alt={article.title} className="hero-bg-image" />
                <div className="hero-overlay-gradient"></div>
                <span className="event-type-badge">{article.category}</span>
            </div>

            <div className="detail-content detail-content-sheet">
                <div className="detail-layout-grid">
                    {/* LEFT COLUMN: Main Content */}
                    <div className="detail-main-column">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                            <span className="flex items-center gap-1"><CalendarDays size={14} /> {article.date}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><User size={14} /> {article.author}</span>
                        </div>

                        <h1 className="text-2xl font-bold mb-6 text-slate-800">{article.title}</h1>

                        <div className="article-body rich-text">
                            {article.content}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Action Hub (Sidebar) */}
                    <div className="detail-side-column">
                        <ActionHub
                            type={article.category === 'App Feature' ? 'feature' : 'article'}
                            category={article.category}
                            data={{
                                id: id || '',
                                title: article.title,
                                date: article.date,
                                // Map feature routes or external links here
                                route: article.category === 'App Feature' ? '/visits' : undefined, // Example mapping
                                externalLink: 'https://maxicare.com.ph' // Example
                            }}
                        />
                    </div>
                </div>

                {/* Mobile Sticky CTA (Hidden on Desktop) */}
                <div className="detail-cta">
                    {article.category === 'App Feature' ? (
                        <button className="btn-register" onClick={() => navigate('/visits')}>
                            Try Feature
                        </button>
                    ) : (
                        <button className="btn-register btn-secondary" onClick={() => {
                            // Share logic
                        }}>
                            Share Article
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
