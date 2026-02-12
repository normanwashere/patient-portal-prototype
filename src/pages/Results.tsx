import React, { useState, useEffect } from 'react';
import { FileText, Download, Search, Activity, Calendar } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { ResultCardSkeleton } from '../components/Skeleton';
import { BackButton } from '../components/Common/BackButton';
import './Results.css';

export const Results: React.FC = () => {
    const { results, bookFollowUp, addAppointment } = useData();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);

    // V3: UX Need - Simulate loading state
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    // Auto-mark notifications as read
    const { notifications, markAsRead } = useData();
    useEffect(() => {
        const unread = notifications.filter(n => !n.read && (n.link === '/results' || n.title.toLowerCase().includes('result') || n.title.toLowerCase().includes('lab')));
        unread.forEach(n => markAsRead(n.id));
    }, [notifications, markAsRead]);

    const filtered = filter === 'All' ? results : results.filter(r => r.type === filter);

    const handleBookFollowUp = (result: any) => {
        bookFollowUp(result.id);
        addAppointment({
            doctor: result.doctor,
            specialty: 'Follow-up',
            date: 'Oct 28, 2023',
            time: '09:00 AM'
        });
        showToast(`Follow-up appointment booked with ${result.doctor}`, 'success');
        navigate('/appointments');
    };

    return (
        <div className="results-container">
            <header className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                    <BackButton to="/dashboard" />
                    <div style={{ flex: 1 }}>
                        <h2>Results & Reports</h2>
                    </div>
                </div>
                <div className="search-bar" style={{ marginTop: '1rem' }}>
                    <Search size={18} color="#9ca3af" />
                    <input type="text" placeholder="Search results..." />
                </div>
            </header>

            {/* Filters */}
            <div className="filter-chips">
                {['All', 'Laboratory', 'Radiology'].map(f => (
                    <button
                        key={f}
                        className={`chip ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* V3: UX Need - Skeleton Loading */}
            {isLoading ? (
                <div className="results-list">
                    <ResultCardSkeleton />
                    <ResultCardSkeleton />
                    <ResultCardSkeleton />
                </div>
            ) : (
                <>
                    {/* Results List */}
                    <div className="results-list">
                        {filtered.map(res => (
                            <div
                                key={res.id}
                                className="result-card"
                                onClick={() => navigate(`/results/${res.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className={`result-icon ${res.type.toLowerCase()}`}>
                                    <Activity size={20} />
                                </div>
                                <div className="result-info">
                                    <div className="result-title-row">
                                        <h4>{res.title}</h4>
                                        {res.isCritical && <span className="badge-critical">Critical</span>}
                                    </div>
                                    <span className="result-meta">{res.date} • {res.doctor}</span>

                                    {res.isCritical && !res.hasFollowUp && (
                                        <button
                                            className="btn-critical-action"
                                            onClick={(e) => { e.stopPropagation(); handleBookFollowUp(res); }}
                                        >
                                            <Calendar size={14} /> Book Follow-up
                                        </button>
                                    )}
                                    {res.hasFollowUp && (
                                        <span className="status-booked">Follow-up Booked</span>
                                    )}
                                </div>
                                <button className="btn-icon" onClick={(e) => e.stopPropagation()}>
                                    <Download size={20} color="var(--color-primary)" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="empty-state">
                            <FileText size={48} color="#e5e7eb" />
                            <p>No results found.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
