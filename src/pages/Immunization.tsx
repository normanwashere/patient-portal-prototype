import React, { useState } from 'react';
import { Syringe, Calendar, CheckCircle, Clock, AlertTriangle, ChevronRight, Baby, User } from 'lucide-react';
import { BackButton } from '../components/Common/BackButton';
import './Immunization.css';

interface Vaccine {
    id: string;
    name: string;
    date?: string;
    dueDate?: string;
    status: 'Completed' | 'Due' | 'Overdue' | 'Upcoming';
    dose: string;
    provider?: string;
}

interface FamilyMember {
    id: string;
    name: string;
    relationship: string;
    age: string;
    vaccines: Vaccine[];
}

export const Immunization: React.FC = () => {
    const [selectedMember, setSelectedMember] = useState<string>('1');

    const familyMembers: FamilyMember[] = [
        {
            id: '1',
            name: 'Juan Dela Cruz Jr.',
            relationship: 'Child',
            age: '2 years old',
            vaccines: [
                { id: 'v1', name: 'BCG', date: 'Jan 15, 2022', status: 'Completed', dose: 'Single Dose', provider: 'City Health Center' },
                { id: 'v2', name: 'Hepatitis B', date: 'Jan 15, 2022', status: 'Completed', dose: '1st Dose', provider: 'City Health Center' },
                { id: 'v3', name: 'Pentavalent (DPT-HepB-Hib)', date: 'Mar 15, 2022', status: 'Completed', dose: '3rd Dose', provider: 'City Health Center' },
                { id: 'v4', name: 'Oral Polio Vaccine', date: 'Mar 15, 2022', status: 'Completed', dose: '3rd Dose', provider: 'City Health Center' },
                { id: 'v5', name: 'Measles, Mumps, Rubella', date: 'Jan 15, 2023', status: 'Completed', dose: '1st Dose', provider: 'MediLink Clinic' },
                { id: 'v6', name: 'MMR Booster', dueDate: 'Jan 15, 2024', status: 'Overdue', dose: '2nd Dose' },
                { id: 'v7', name: 'Varicella', dueDate: 'Mar 15, 2024', status: 'Due', dose: '1st Dose' },
            ]
        },
        {
            id: '2',
            name: 'Maria Dela Cruz',
            relationship: 'Self',
            age: '32 years old',
            vaccines: [
                { id: 'v10', name: 'COVID-19 (Pfizer)', date: 'May 10, 2021', status: 'Completed', dose: '2nd Dose', provider: 'SM Mall Vaccination Site' },
                { id: 'v11', name: 'COVID-19 Booster', date: 'Dec 15, 2021', status: 'Completed', dose: 'Booster', provider: 'MediLink Clinic' },
                { id: 'v12', name: 'Flu Vaccine 2024', dueDate: 'Feb 2024', status: 'Due', dose: 'Annual' },
            ]
        },
    ];

    const currentMember = familyMembers.find(m => m.id === selectedMember)!;
    const completed = currentMember.vaccines.filter(v => v.status === 'Completed');
    const pending = currentMember.vaccines.filter(v => v.status !== 'Completed');

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed': return <CheckCircle size={16} />;
            case 'Due': return <Clock size={16} />;
            case 'Overdue': return <AlertTriangle size={16} />;
            default: return <Clock size={16} />;
        }
    };

    return (
        <div className="immunization-container">
            <header className="page-header">
                <BackButton />
                <div className="header-text">
                    <h2>Immunization Records</h2>
                    <p className="page-subtitle">Track your vaccinations and wellness history</p>
                </div>
            </header>

            {/* Family Member Selector */}
            <div className="member-selector">
                {familyMembers.map(member => (
                    <button
                        key={member.id}
                        className={`member-card ${selectedMember === member.id ? 'active' : ''}`}
                        onClick={() => setSelectedMember(member.id)}
                    >
                        <div className="member-avatar">
                            {member.relationship === 'Child' ? <Baby size={20} /> : <User size={20} />}
                        </div>
                        <div className="member-info">
                            <span className="member-name">{member.name}</span>
                            <span className="member-meta">{member.relationship} • {member.age}</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Pending Vaccines Section */}
            {pending.length > 0 && (
                <div className="vaccine-section">
                    <h3>
                        <AlertTriangle size={18} className="section-icon warning" />
                        Action Required
                    </h3>
                    <div className="vaccine-list">
                        {pending.map(vax => (
                            <div key={vax.id} className={`vaccine-card ${vax.status.toLowerCase()}`}>
                                <div className="vaccine-icon">
                                    <Syringe size={20} />
                                </div>
                                <div className="vaccine-info">
                                    <h4>{vax.name}</h4>
                                    <span className="vaccine-dose">{vax.dose}</span>
                                    <span className="vaccine-due">
                                        <Calendar size={12} /> Due: {vax.dueDate}
                                    </span>
                                </div>
                                <div className="vaccine-status">
                                    <span className={`status-badge ${vax.status.toLowerCase()}`}>
                                        {getStatusIcon(vax.status)}
                                        {vax.status}
                                    </span>
                                    <button className="btn-schedule">
                                        Schedule <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Completed Vaccines Section */}
            <div className="vaccine-section">
                <h3>
                    <CheckCircle size={18} className="section-icon success" />
                    Completed ({completed.length})
                </h3>
                <div className="vaccine-list">
                    {completed.map(vax => (
                        <div key={vax.id} className="vaccine-card completed">
                            <div className="vaccine-icon">
                                <Syringe size={20} />
                            </div>
                            <div className="vaccine-info">
                                <h4>{vax.name}</h4>
                                <span className="vaccine-dose">{vax.dose}</span>
                                <span className="vaccine-date">
                                    <Calendar size={12} /> {vax.date} • {vax.provider}
                                </span>
                            </div>
                            <div className="vaccine-check">
                                <CheckCircle size={20} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
