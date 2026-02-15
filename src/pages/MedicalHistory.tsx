import React, { useState } from 'react';
import { FileText, Calendar, User, Download, Search } from 'lucide-react';
// BackButton handled by Layout.tsx
import './MedicalHistory.css';

type RecordType = 'all' | 'consultation' | 'procedure' | 'admission';

interface MedicalRecord {
    id: string;
    type: 'consultation' | 'procedure' | 'admission';
    title: string;
    date: string;
    doctor: string;
    facility: string;
    summary: string;
}

const MOCK_RECORDS: MedicalRecord[] = [
    { id: '1', type: 'consultation', title: 'General Consultation', date: 'Jan 28, 2026', doctor: 'Dr. Jen Diaz', facility: 'Main Wellness Center', summary: 'Routine checkup. BP 120/80. No significant findings.' },
    { id: '2', type: 'procedure', title: 'Chest X-Ray', date: 'Jan 15, 2026', doctor: 'Dr. Jose Reyes', facility: 'Radiology Dept.', summary: 'Chest radiograph performed. Clear lung fields, normal heart size.' },
    { id: '3', type: 'consultation', title: 'Cardiology Follow-up', date: 'Dec 20, 2025', doctor: 'Dr. Jose Reyes', facility: 'Cardiology Clinic', summary: 'ECG normal. Continue current medications.' },
    { id: '4', type: 'admission', title: 'Outpatient Surgery', date: 'Nov 10, 2025', doctor: 'Dr. Rosa Lim', facility: 'Day Surgery Center', summary: 'Minor procedure completed successfully. Discharged same day.' },
    { id: '5', type: 'consultation', title: 'Dermatology Consult', date: 'Oct 05, 2025', doctor: 'Dr. Ana Cruz', facility: 'Derma Clinic', summary: 'Skin assessment. Prescribed topical treatment.' },
];

export const MedicalHistory: React.FC = () => {
    const [filter, setFilter] = useState<RecordType>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRecords = MOCK_RECORDS.filter(record => {
        const matchesFilter = filter === 'all' || record.type === filter;
        const matchesSearch = searchQuery === '' ||
            record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.doctor.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            consultation: 'Consult',
            procedure: 'Procedure',
            admission: 'Admission'
        };
        return labels[type] || type;
    };

    return (
        <div className="medical-history-container">
            <header className="page-header">
                <div className="header-text">
                    <h2>Medical History</h2>
                    <p className="page-subtitle">Detailed records of your past visits and conditions</p>
                </div>
            </header>

            {/* Search Bar & Filter */}
            <div>
                <div className="search-bar" style={{ marginBottom: '1rem' }}>
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search records..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Filter Chips */}
            <div className="filter-chips">
                {(['all', 'consultation', 'procedure', 'admission'] as RecordType[]).map(type => (
                    <button
                        key={type}
                        className={`filter-chip ${filter === type ? 'active' : ''}`}
                        onClick={() => setFilter(type)}
                    >
                        {type === 'all' ? 'All Records' : getTypeLabel(type)}
                    </button>
                ))}
            </div>

            {/* Records List */}
            <div className="records-list">
                {filteredRecords.length > 0 ? (
                    filteredRecords.map(record => (
                        <div key={record.id} className="record-card">
                            <div className="record-header">
                                <div className="record-title-row">
                                    <FileText size={16} className="record-icon" />
                                    <h4>{record.title}</h4>
                                </div>
                                <span className={`type-badge ${record.type}`}>{getTypeLabel(record.type)}</span>
                            </div>
                            <p className="record-summary">{record.summary}</p>
                            <div className="record-meta">
                                <span><Calendar size={12} /> {record.date}</span>
                                <span><User size={12} /> {record.doctor}</span>
                            </div>
                            <div className="record-footer">
                                <span className="facility">{record.facility}</span>
                                <button className="download-btn">
                                    <Download size={14} /> View
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="empty-state">No records found.</p>
                )}
            </div>
        </div>
    );
};
