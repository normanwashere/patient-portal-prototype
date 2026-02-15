import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../theme/ThemeContext';
import '../pages/DashboardCarousel.css';

interface Banner {
    id: number;
    badge: string;
    title: string;
    desc: string;
    btn: string;
    image: string;
    action: () => void;
}

export const BannerCarousel: React.FC = () => {
    const navigate = useNavigate();
    const { tenant } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    // Default banners
    const defaultBanners: Banner[] = useMemo(() => [
        {
            id: 1,
            badge: "New Feature",
            title: "Teleconsult 24/7",
            desc: "Consult top specialists from the comfort of your home.",
            btn: "Try Now",
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop",
            action: () => navigate('/visits', { state: { highlight: 'teleconsult-now' } })
        },
        {
            id: 2,
            badge: "Upcoming Event",
            title: "Flu Vaccine Drive",
            desc: "Feb 15 • Main Lobby • 20% off for members.",
            btn: "Learn More",
            image: "https://images.unsplash.com/photo-1633613286991-611fe299c4be?q=80&w=2070&auto=format&fit=crop",
            action: () => navigate('/community')
        },
        {
            id: 3,
            badge: "Join Movement",
            title: "\"I Am Well\" Campaign",
            desc: "Make a personal commitment to wellness and self-care.",
            btn: "Join Now",
            image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop",
            action: () => navigate('/community')
        },
        {
            id: 4,
            badge: "Activity",
            title: "Yoga for Wellness",
            desc: "Every Sat 6 AM • Rooftop Garden • Free for members.",
            btn: "See Activities",
            image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2070&auto=format&fit=crop",
            action: () => navigate('/community')
        }
    ], [navigate]);

    // Maxicare-specific banners (from maxicare.com.ph announcements)
    const maxicareBanners: Banner[] = useMemo(() => [
        {
            id: 1,
            badge: "24/7 Service",
            title: "Teleconsult with Video Call",
            desc: "Get access to expert medical care anytime, anywhere.",
            btn: "Call a Doctor",
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop",
            action: () => navigate('/visits', { state: { highlight: 'teleconsult-now' } })
        },
        {
            id: 2,
            badge: "PRIMA by MaxiHealth",
            title: "Live Your Best Life",
            desc: "Unlimited access to 41+ Primary Care Clinics nationwide. Open to all ages.",
            btn: "Learn More",
            image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop",
            action: () => navigate('/community')
        },
        {
            id: 3,
            badge: "New Product",
            title: "Maxicare LifesavER",
            desc: "Emergency care up to ₱50,000 with outpatient coverage and life insurance.",
            btn: "Get Protected",
            image: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=2070&auto=format&fit=crop",
            action: () => navigate('/community')
        },
        {
            id: 4,
            badge: "HomeCare",
            title: "Lab Tests at Home",
            desc: "Get your needed laboratory tests done in the comfort and safety of your home.",
            btn: "Book HomeCare",
            image: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=2070&auto=format&fit=crop",
            action: () => navigate('/community')
        }
    ], [navigate]);

    const banners = tenant.id === 'maxicare' ? maxicareBanners : defaultBanners;

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

