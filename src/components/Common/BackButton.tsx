import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import './BackButton.css';

interface BackButtonProps {
    to?: string;
    className?: string;
    onClick?: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({ to, className = '', onClick }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onClick) {
            onClick();
        } else if (to) {
            navigate(to);
        } else {
            navigate(-1);
        }
    };

    return (
        <button className={`back-btn-standard ${className}`} onClick={handleBack} aria-label="Go back">
            <ChevronLeft size={24} />
        </button>
    );
};
