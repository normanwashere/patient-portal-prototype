import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Bell, CheckCircle, Info, AlertTriangle, CheckCheck } from 'lucide-react';

import './Notifications.css';

export const Notifications: React.FC = () => {
    const { notifications, markAsRead } = useData();
    const navigate = useNavigate();

    // Group notifications
    const newNotifications = notifications.filter(n => !n.read);
    const earlierNotifications = notifications.filter(n => n.read);

    const handleMarkAllRead = () => {
        // In a real app, this would be a batch API call
        newNotifications.forEach(n => markAsRead(n.id));
    };

    const handleNotificationClick = (n: any) => {
        markAsRead(n.id);
        if (n.link) {
            navigate(n.link);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={20} />;
            case 'warning': return <AlertTriangle size={20} />;
            case 'error': return <AlertTriangle size={20} />;
            default: return <Info size={20} />;
        }
    };

    const NotificationCard = ({ n }: { n: any }) => (
        <div
            className={`notification-card ${n.read ? 'read' : 'unread'}`}
            onClick={() => handleNotificationClick(n)}
        >
            <div className={`notif-icon-box ${n.type}`}>
                {getIcon(n.type)}
            </div>
            <div className="notif-content">
                <div className="notif-header">
                    <h4 className="notif-title">{n.title}</h4>
                    <span className="notif-time">{n.date}</span>
                </div>
                <p className="notif-message">{n.message}</p>
            </div>
        </div>
    );

    return (
        <div className="notifications-page">
            <header className="page-header">

                <div className="header-text">
                    <h2>Notifications</h2>
                    <p className="page-subtitle">Stay updated with your healthcare activity</p>
                    {newNotifications.length > 0 && (
                        <button className="btn-mark-read" onClick={handleMarkAllRead} style={{ marginTop: '0.5rem' }}>
                            <CheckCheck size={16} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'text-top' }} />
                            Mark all as read
                        </button>
                    )}
                </div>
            </header>

            {notifications.length === 0 ? (
                <div className="empty-state">
                    <Bell size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>No notifications yet.</p>
                </div>
            ) : (
                <>
                    {/* New Section */}
                    {newNotifications.length > 0 && (
                        <section className="notification-section">
                            <h3 className="section-title">New</h3>
                            <div className="notification-group">
                                {newNotifications.map(n => (
                                    <NotificationCard key={n.id} n={n} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Earlier Section */}
                    {earlierNotifications.length > 0 && (
                        <section className="notification-section">
                            <h3 className="section-title">Earlier</h3>
                            <div className="notification-group">
                                {earlierNotifications.map(n => (
                                    <NotificationCard key={n.id} n={n} />
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
};
