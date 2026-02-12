import React from 'react';
import { ChevronRight } from 'lucide-react';
import './ServiceCard.css';

interface ServiceCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick?: () => void;
    /** Optional specific color theme (e.g., 'primary', 'secondary', 'blue', 'green') */
    colorTheme?: 'primary' | 'secondary' | 'blue' | 'green' | 'purple' | 'orange';
    /** Optional background image for the header bar */
    backgroundImage?: string;
    actionLabel?: string;
    /** Optional secondary actions to render instead of the default footer */
    actions?: {
        label: string;
        onClick: (e: React.MouseEvent) => void;
        variant?: 'primary' | 'secondary' | 'outline';
    }[];
    badge?: number;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
    title,
    description,
    icon,
    onClick,
    colorTheme = 'primary',
    backgroundImage,
    actionLabel = 'View',
    actions,
    badge
}) => {
    return (
        <div className={`service-card theme-${colorTheme}`} onClick={onClick} role="button" tabIndex={0} style={{ position: 'relative' }}>

            <div
                className="service-card-header"
                style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
            >
                <div className="service-icon-wrapper">
                    {icon}
                </div>
                <div className="header-overlay"></div>
            </div>

            <div className="service-card-body">
                <h3 className="service-title">{title}</h3>
                <p className="service-description">{description}</p>

                {actions ? (
                    <div className="service-actions-row">
                        {actions.map((action, idx) => (
                            <button
                                key={idx}
                                className={`service-action-btn ${action.variant || 'primary'}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    action.onClick(e);
                                }}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="service-footer">
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <span className="action-text">{actionLabel}</span>
                            {badge !== undefined && badge > 0 && (
                                <div className="service-card-badge-footer">
                                    {badge}
                                </div>
                            )}
                        </div>
                        <div className="action-icon-circle">
                            <ChevronRight size={16} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
