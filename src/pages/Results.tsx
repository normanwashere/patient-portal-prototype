import React, { useState, useEffect } from 'react';
import { FileText, Download, Search, Activity, Calendar, ClipboardList, Home, Clock, AlertCircle, CheckCircle, Droplet, FlaskConical, TestTube, HeartHandshake } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../theme/ThemeContext';
import { ResultCardSkeleton } from '../components/Skeleton';
import { BackButton } from '../components/Common/BackButton';
import type { DoctorRequest } from '../context/DataContext';
import './Results.css';

/* ── Status & priority badge helpers ── */
const REQUEST_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    Pending: { bg: '#fef3c7', color: '#92400e' },
    Scheduled: { bg: '#dbeafe', color: '#1e40af' },
    Completed: { bg: '#dcfce7', color: '#166534' },
};

const specimenIcon = (type: string) => {
    switch (type) {
        case 'Blood': return <Droplet size={11} />;
        case 'Urine': return <FlaskConical size={11} />;
        case 'Stool': return <TestTube size={11} />;
        default: return <TestTube size={11} />;
    }
};

const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
    Routine: { bg: '#f3f4f6', color: '#374151' },
    Urgent: { bg: '#fef3c7', color: '#92400e' },
    Stat: { bg: '#fee2e2', color: '#991b1b' },
};

export const Results: React.FC = () => {
    const { results, doctorRequests, bookFollowUp, addAppointment } = useData();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { tenant } = useTheme();
    const [filter, setFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);

    const homeCareEnabled = tenant.features.visits.homeCareEnabled ?? false;

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

    const isRequestsTab = filter === 'Requests';
    const filtered = filter === 'All' ? results : results.filter(r => r.type === filter);

    // Count pending requests for badge
    const pendingRequestCount = doctorRequests.filter(r => r.status === 'Pending').length;

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

    const handleBookHomeCare = (req: DoctorRequest) => {
        navigate('/visits/homecare', { state: { fromRequest: req } });
    };

    return (
        <div className="results-container">
            <header className="results-header">
                <div className="results-title-row">
                    <BackButton to="/health" />
                    <h2>Results & Reports</h2>
                </div>
                <div className="search-bar">
                    <Search size={18} color="#9ca3af" />
                    <input type="text" placeholder={isRequestsTab ? 'Search requests...' : 'Search results...'} />
                </div>
                <div className="filter-chips">
                    {['All', 'Laboratory', 'Radiology', 'Requests'].map(f => (
                        <button
                            key={f}
                            className={`chip ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f}
                            {f === 'Requests' && pendingRequestCount > 0 && (
                                <span className="chip-badge">{pendingRequestCount}</span>
                            )}
                        </button>
                    ))}
                </div>
            </header>

            {/* V3: UX Need - Skeleton Loading */}
            {isLoading ? (
                <div className="results-list">
                    <ResultCardSkeleton />
                    <ResultCardSkeleton />
                    <ResultCardSkeleton />
                </div>
            ) : isRequestsTab ? (
                /* ── Doctor Requests Tab ── */
                <>
                    <div className="results-list">
                        {doctorRequests.length === 0 ? (
                            <div className="empty-state">
                                <ClipboardList size={48} color="#e5e7eb" />
                                <p>No doctor requests found.</p>
                            </div>
                        ) : (
                            doctorRequests.map(req => {
                                const statusStyle = REQUEST_STATUS_COLORS[req.status] || REQUEST_STATUS_COLORS.Pending;
                                const priorityStyle = PRIORITY_COLORS[req.priority] || PRIORITY_COLORS.Routine;
                                const StatusIcon = req.status === 'Completed' ? CheckCircle : req.status === 'Scheduled' ? Calendar : Clock;

                                return (
                                    <div key={req.id} className="result-card request-card">
                                        <div className={`result-icon ${req.type.toLowerCase()}`}>
                                            <ClipboardList size={20} />
                                        </div>
                                        <div className="result-info">
                                            <div className="result-title-row">
                                                <h4>{req.title}</h4>
                                                <span
                                                    className="request-priority-badge"
                                                    style={{ background: priorityStyle.bg, color: priorityStyle.color }}
                                                >
                                                    {req.priority}
                                                </span>
                                            </div>
                                            <span className="result-meta">{req.date} • {req.doctor}</span>
                                            <div className="request-status-row">
                                                <span
                                                    className="request-status-badge"
                                                    style={{ background: statusStyle.bg, color: statusStyle.color }}
                                                >
                                                    <StatusIcon size={12} /> {req.status}
                                                </span>
                                                <span className="request-type-badge">{req.type}</span>
                                                {req.specimenType && (
                                                    <span className={`request-specimen-badge ${req.specimenType.toLowerCase()}`}>
                                                        {specimenIcon(req.specimenType)} {req.specimenType}
                                                    </span>
                                                )}
                                            </div>
                                            {req.notes && (
                                                <p className="request-notes">
                                                    <AlertCircle size={12} /> {req.notes}
                                                </p>
                                            )}
                                            {req.facility && (
                                                <p className="request-facility">{req.facility}</p>
                                            )}
                                            {/* Action buttons for pending requests */}
                                            {req.status === 'Pending' && (
                                                <div className="request-actions-row">
                                                    {req.homeCareEligible && req.type === 'Laboratory' && homeCareEnabled && (
                                                        <button
                                                            className="btn-homecare-action"
                                                            onClick={(e) => { e.stopPropagation(); handleBookHomeCare(req); }}
                                                        >
                                                            <HeartHandshake size={14} /> HomeCare
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn-procedure-action"
                                                        onClick={(e) => { e.stopPropagation(); navigate('/visits/book-procedure'); }}
                                                    >
                                                        <FlaskConical size={14} /> Book Procedure
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </>
            ) : (
                /* ── Results & Reports Tabs ── */
                <>
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
