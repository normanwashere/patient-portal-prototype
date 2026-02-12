import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
    variant?: 'text' | 'avatar' | 'card';
    width?: string;
    height?: string;
    count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    variant = 'text',
    width,
    height,
    count = 1
}) => {
    const baseClass = `skeleton skeleton-${variant}`;
    const style = { width, height };

    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={baseClass} style={style} />
            ))}
        </>
    );
};

// Pre-built skeleton patterns for common layouts
export const ResultCardSkeleton: React.FC = () => (
    <div className="result-card skeleton-card">
        <div className="skeleton skeleton-avatar" />
        <div className="result-info" style={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height="1.1rem" />
            <Skeleton variant="text" width="40%" height="0.8rem" />
        </div>
        <div className="skeleton skeleton-avatar" style={{ width: 32, height: 32 }} />
    </div>
);

export const QueueCardSkeleton: React.FC = () => (
    <div className="skeleton-queue-card">
        <Skeleton variant="text" width="100px" height="1rem" />
        <Skeleton variant="text" width="80px" height="3rem" />
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Skeleton variant="text" width="60px" height="2rem" />
            <Skeleton variant="text" width="60px" height="2rem" />
            <Skeleton variant="text" width="60px" height="2rem" />
        </div>
    </div>
);
