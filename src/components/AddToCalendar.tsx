import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface AddToCalendarProps {
    event: {
        title: string;
        description: string;
        location: string;
        startTime: Date;
        endTime: Date;
    };
    iconOnly?: boolean;
}

export const AddToCalendar: React.FC<AddToCalendarProps> = ({ event, iconOnly = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatDate(event.startTime)}/${formatDate(event.endTime)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;

    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&startdt=${event.startTime.toISOString()}&enddt=${event.endTime.toISOString()}`;

    const downloadIcs = () => {
        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatDate(event.startTime)}
DTEND:${formatDate(event.endTime)}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', 'appointment.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsOpen(false);
    };

    return (
        <div className="add-to-calendar" ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="calendar-btn"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'transparent',
                    border: '1px solid #e2e8f0',
                    padding: '0.4rem 0.6rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    color: '#475569',
                    transition: 'all 0.2s'
                }}
            >
                <Calendar size={16} />
                {!iconOnly && <span>Add to Calendar</span>}
                {!iconOnly && <ChevronDown size={14} />}
            </button>

            {isOpen && (
                <div className="calendar-dropdown" style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    zIndex: 50,
                    minWidth: '160px',
                    overflow: 'hidden'
                }}>
                    <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="dropdown-item" style={dropdownItemStyle}>Google Calendar</a>
                    <a href={outlookUrl} target="_blank" rel="noopener noreferrer" className="dropdown-item" style={dropdownItemStyle}>Outlook.com</a>
                    <button onClick={downloadIcs} className="dropdown-item" style={{ ...dropdownItemStyle, width: '100%', textAlign: 'left', background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 'inherit' }}>Apple/iCal</button>
                    {/* Add Yahoo or Office365 if needed */}
                </div>
            )}
        </div>
    );
};

const dropdownItemStyle: React.CSSProperties = {
    display: 'block',
    padding: '0.6rem 1rem',
    color: '#334155',
    textDecoration: 'none',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'background 0.2s'
};
