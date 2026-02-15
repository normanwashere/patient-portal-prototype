import React, { useState } from 'react';
import { Video, Building2, Calendar, Clock, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';

import { AddToCalendar } from '../components/AddToCalendar';
import './AppointmentHistory.css';

type AppointmentType = 'all' | 'teleconsult' | 'clinic';
// Use context Appointment type compatibility or map it
// Context has type: 'In-Person' | 'Teleconsult' usually.
// We'll map context types to local expected types for icons.



export const AppointmentHistory: React.FC = () => {
    const { appointments, cancelAppointment } = useData();
    const [filter, setFilter] = useState<AppointmentType>('all');
    const [selectedAppt, setSelectedAppt] = useState<any | null>(null);
    const location = useLocation();

    // Parse view param
    const searchParams = new URLSearchParams(location.search);
    const isPastRoute = location.pathname.includes('past-appointments');
    const viewMode = isPastRoute ? 'past' : (searchParams.get('view') || 'all'); // 'upcoming' | 'past' | 'all'

    // Map context data to display format if needed
    // Assuming context status matches 'Upcoming' | 'Completed' | 'Cancelled'
    // Context type: 'In-Person' -> 'clinic', 'Teleconsult' -> 'teleconsult'

    const getLocalType = (type: string): 'teleconsult' | 'clinic' => {
        return type.toLowerCase().includes('tele') ? 'teleconsult' : 'clinic';
    };

    const displayAppointments = appointments.map(apt => ({
        ...apt,
        localType: getLocalType(apt.type || 'clinic')
    }));

    const filteredInternal = displayAppointments.filter(apt =>
        filter === 'all' || apt.localType === filter
    );

    // Initial filter based on view param
    const showUpcoming = viewMode === 'all' || viewMode === 'upcoming';
    const showPast = viewMode === 'all' || viewMode === 'past';

    const upcomingAppointments = filteredInternal.filter(apt => apt.status === 'Upcoming');
    const pastAppointments = filteredInternal.filter(apt => apt.status !== 'Upcoming');

    const getTypeIcon = (type: 'teleconsult' | 'clinic') => {
        return type === 'teleconsult'
            ? <Video size={16} className="type-icon teleconsult" />
            : <Building2 size={16} className="type-icon clinic" />;
    };

    const getStatusBadge = (status: string) => {
        const normalized = status.toLowerCase();
        return <span className={`status-badge ${normalized}`}>{status}</span>;
    };

    const handleCancel = (id: string) => {
        // Removed confirm for smoother demo flow
        cancelAppointment(id);
        setSelectedAppt(null);
    };

    const handleReschedule = () => {
        alert('Rescheduling is not yet implemented. Please cancel and book a new appointment.');
    };

    return (
        <div className="appointment-history-container">
            <header className="page-header">

                <div className="header-text">
                    <h2>{viewMode === 'upcoming' ? 'Upcoming Appointments' : viewMode === 'past' ? 'Past Appointments' : 'Appointment History'}</h2>
                    <p className="page-subtitle">View your teleconsult and in-clinic appointments</p>
                </div>
            </header>


            {/* Filter Tabs - Hide if specific view? Maybe keep for filtering type */}
            {/* Only show "All" filter if NOT in past-appointments mode to prevent confusion? Or just allow type filtering. */}
            <div className="filter-tabs">
                <button
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All
                </button>
                <button
                    className={`filter-tab ${filter === 'teleconsult' ? 'active' : ''}`}
                    onClick={() => setFilter('teleconsult')}
                >
                    <Video size={14} /> Teleconsult
                </button>
                <button
                    className={`filter-tab ${filter === 'clinic' ? 'active' : ''}`}
                    onClick={() => setFilter('clinic')}
                >
                    <Building2 size={14} /> In-Clinic
                </button>
            </div>

            {/* Upcoming Section */}
            {showUpcoming && upcomingAppointments.length > 0 && (
                <section className="appointment-section">
                    <h3 className="section-title">Upcoming</h3>
                    <div className="appointment-list">
                        {upcomingAppointments.map(appt => (
                            <div
                                key={appt.id}
                                className="appointment-card upcoming"
                                onClick={() => setSelectedAppt(appt)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="card-left">
                                    {getTypeIcon(appt.localType)}
                                    <div className="card-info">
                                        <h4>{appt.doctor}</h4>
                                        <p className="specialty">{appt.specialty}</p>
                                        <div className="datetime">
                                            <span><Calendar size={12} /> {appt.date}</span>
                                            <span><Clock size={12} /> {appt.time}</span>
                                        </div>
                                        {/* @ts-ignore location property check */}
                                        {appt.location && <p className="location"><Building2 size={12} /> {appt.location}</p>}
                                    </div>
                                </div>
                                <div className="card-right">
                                    {getStatusBadge(appt.status)}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                                        <AddToCalendar
                                            event={{
                                                title: `${appt.type || 'Appointment'} with ${appt.doctor}`,
                                                description: `Specialty: ${appt.specialty}`,
                                                location: appt.location || 'Online',
                                                startTime: new Date(`${appt.date} ${appt.time}`),
                                                // Note: Simple Date parsing might fail on some browsers if format is specific. 
                                                // Ideally use a library or robust parser. 
                                                // For prototype with "Oct 25, 2023 10:00 AM", it usually works in modern browsers.
                                                endTime: new Date(new Date(`${appt.date} ${appt.time}`).getTime() + 60 * 60 * 1000)
                                            }}
                                            iconOnly
                                        />
                                    </div>
                                    <ChevronRight size={18} className="chevron" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Past Section */}
            {showPast && (
                <section className="appointment-section">
                    <h3 className="section-title">Past Appointments</h3>
                    {pastAppointments.length > 0 ? (
                        <div className="appointment-list">
                            {pastAppointments.map(apt => (
                                <div key={apt.id} className={`appointment-card ${apt.status.toLowerCase()}`}>
                                    <div className="card-left">
                                        {getTypeIcon(apt.localType)}
                                        <div className="card-info">
                                            <h4>{apt.doctor}</h4>
                                            <p className="specialty">{apt.specialty}</p>
                                            <div className="datetime">
                                                <span><Calendar size={12} /> {apt.date}</span>
                                                <span><Clock size={12} /> {apt.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-right">
                                        {getStatusBadge(apt.status)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-state">No past appointments found.</p>
                    )}
                </section>
            )}

            {showUpcoming && upcomingAppointments.length === 0 && viewMode === 'upcoming' && (
                <p className="empty-state">No upcoming appointments.</p>
            )}

            {/* Appointment Detail Modal (Simple Implementation) */}
            {selectedAppt && (
                <div className="modal-overlay" onClick={() => setSelectedAppt(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Appointment Details</h3>
                            <button onClick={() => setSelectedAppt(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <ChevronRight size={20} style={{ transform: 'rotate(90deg)' }} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ padding: '1rem 0' }}>
                            <p><strong>Doctor:</strong> {selectedAppt.doctor}</p>
                            <p><strong>Specialty:</strong> {selectedAppt.specialty}</p>
                            <p><strong>Date:</strong> {selectedAppt.date} at {selectedAppt.time}</p>
                            <p><strong>Type:</strong> {selectedAppt.type}</p>
                            <p><strong>Location:</strong> {selectedAppt.location || 'Online'}</p>
                            <p><strong>Status:</strong> {selectedAppt.status}</p>
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button className="btn-secondary" onClick={() => setSelectedAppt(null)}>Close</button>
                            {selectedAppt.status === 'Upcoming' && (
                                <>
                                    <button className="btn-secondary" onClick={handleReschedule}>Reschedule</button>
                                    <button className="btn-primary" style={{ background: '#ef4444', border: 'none' }} onClick={() => handleCancel(selectedAppt.id)}>Cancel Appointment</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
