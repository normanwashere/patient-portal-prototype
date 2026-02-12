import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages/DashboardCarousel.css';

export const BannerCarousel: React.FC = () => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    // Dynamic banners: Events, Features, Campaigns
    const banners = [
        {
            id: 1,
            badge: "New Feature",
            title: "Teleconsult 24/7",
            desc: "Consult top specialists from the comfort of your home.",
            btn: "Try Now",
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop",
            action: () => navigate('/visits/teleconsult')
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

