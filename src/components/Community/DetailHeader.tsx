import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2, Bookmark } from 'lucide-react';
import '../../pages/EventDetail.css'; // Ensure styles are available

interface DetailHeaderProps {
    title?: string;
    onShare?: () => void;
    onBookmark?: () => void;
    showBookmark?: boolean;
}

export const DetailHeader: React.FC<DetailHeaderProps> = ({
    title,
    onShare,
    onBookmark,
    showBookmark = false
}) => {
    const navigate = useNavigate();

    return (
        <header className="detail-header">
            <button className="btn-back" onClick={() => navigate(-1)} aria-label="Go back">
                <ChevronLeft size={24} />
            </button>

            <div className="header-title" style={{ flex: 1 }}>
                {/* Optional Title in Header for scroll interactions later */}
                {title && <span className="sr-only">{title}</span>}
            </div>

            <div className="header-actions flex gap-3">
                {showBookmark && (
                    <button className="btn-share" onClick={onBookmark} aria-label="Bookmark">
                        <Bookmark size={20} />
                    </button>
                )}
                <button className="btn-share" onClick={onShare} aria-label="Share">
                    <Share2 size={20} />
                </button>
            </div>
        </header>
    );
};
