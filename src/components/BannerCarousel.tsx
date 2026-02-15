import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages/DashboardCarousel.css';

export const BannerCarousel: React.FC = () => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    // Dynamic banners: Events, Features, Campaigns
    // Dynamic banners: Real Maxicare News & Updates
    const banners = [
        {
            id: 1,
            badge: "Health Tips",
            title: "Diabetes-Friendly Love",
            desc: "Celebrate love smartly with these heart-healthy tips.",
            btn: "Read Article",
            image: "https://images.unsplash.com/photo-1516616370751-86d6bd8b0651?q=80&w=2070&auto=format&fit=crop", // Couple/Healthy
            action: () => window.open('https://www.maxicare.com.ph/latest-announcements/how-to-say-i-love-you-in-a-diabetes-friendly-way/', '_blank')
        },
        {
            id: 2,
            badge: "Digital Services",
            title: "MyMaxicare Portal",
            desc: "Achieve the freedom to take charge of your health.",
            btn: "Learn More",
            image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1974&auto=format&fit=crop", // Mobile/Tech
            action: () => window.open('https://www.maxicare.com.ph/latest-announcements/achieve-the-freedom-to-be-in-charge-with-mymaxicare/', '_blank')
        },
        {
            id: 3,
            badge: "Awards",
            title: "Great Place to Work®",
            desc: "Proudly maintaining our certification as a top employer.",
            btn: "See News",
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop", // Team/Office
            action: () => window.open('https://www.maxicare.com.ph/latest-announcements/maxicare-group-consistently-maintains-great-place-to-work-certification/', '_blank')
        },
        {
            id: 4,
            badge: "Wellness",
            title: "Crush 2026 Goals",
            desc: "Start your fitness journey with Maxicare today!",
            btn: "Get Started",
            image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop", // Fitness
            action: () => navigate('/news/crush-2026')
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [banners.length]);

    const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
    const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > 50) setCurrentIndex(prev => (prev + 1) % banners.length);
        if (distance < -50) setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length);
        setTouchStart(0);
        setTouchEnd(0);
    };

    return (
        <div
            className="carousel-container"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div
                className="carousel-track"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {banners.map(banner => (
                    <div
                        key={banner.id}
                        className="carousel-slide"
                        style={{ backgroundImage: `url(${banner.image})` }}
                    >
                        <div className="banner-content">
                            <span className="banner-badge">{banner.badge}</span>
                            <h3>{banner.title}</h3>
                            <p>{banner.desc}</p>
                            <button className="banner-btn" onClick={banner.action}>{banner.btn}</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="carousel-indicators">
                {banners.map((_, idx) => (
                    <button
                        key={idx}
                        className={`indicator ${idx === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

