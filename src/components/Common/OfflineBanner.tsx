import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import './OfflineBanner.css';

export const OfflineBanner: React.FC = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="offline-banner">
            <WifiOff size={14} />
            <span>You are currently offline. Read-only mode active.</span>
        </div>
    );
};
