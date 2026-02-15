import React, { useState, useEffect } from 'react';
import { Plus, CloudOff, CheckCircle } from 'lucide-react';

import './Forms.css';

// Aligned with LLD [012] Table: offline_form_submissions
interface FormSubmission {
    id: string; // UUID
    patient_id: string; // UUID
    form_template_id: string; // e.g., 'daily-symptoms-v1'
    form_data: any;
    submitted_at: number; // timestamp
    sync_status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
    retry_count: number;
    last_retry_at?: number;
    error_message?: string;
    created_at: number;
}

const FormStatusBadge = ({ status }: { status: string }) => {
    let style = { background: '#f3f4f6', color: '#1f2937' };
    if (status === 'PENDING') style = { background: '#fef3c7', color: '#92400e' };
    if (status === 'SYNCED') style = { background: '#d1fae5', color: '#065f46' };
    if (status === 'FAILED') style = { background: '#fee2e2', color: '#b91c1c' };

    return (
        <span style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            ...style
        }}>
            {status === 'PENDING' && <CloudOff size={12} />}
            {status === 'SYNCED' && <CheckCircle size={12} />}
            {status}
        </span>
    );
};

export const Forms: React.FC = () => {
    const [forms, setForms] = useState<FormSubmission[]>([]);
    const [view, setView] = useState<'list' | 'new'>('list');

    // Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem('mwell_forms_offline');
        if (saved) {
            try {
                setForms(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse offline forms", e);
            }
        } else {
            // Seed data for demo
            setForms([
                {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    patient_id: 'user-val',
                    form_template_id: 'symptom-log',
                    submitted_at: Date.now() - 86400000,
                    sync_status: 'SYNCED',
                    retry_count: 0,
                    created_at: Date.now() - 86400000,
                    form_data: { temp: 36.5, notes: 'Feeling okay' }
                }
            ]);
        }
    }, []);

    const saveForm = (submission: FormSubmission) => {
        const updated = [submission, ...forms];
        setForms(updated);
        localStorage.setItem('mwell_forms_offline', JSON.stringify(updated));
        setView('list');
    };

    return (
        <div style={{ padding: '1rem 0' }}>
            {view === 'list' ? (
                <>
                    <header className="page-header">

                        <div className="header-text" style={{ flex: 1 }}>
                            <h2>My Forms</h2>
                        </div>
                        <button className="btn-icon-primary" onClick={() => setView('new')}>
                            <Plus size={20} />
                        </button>
                    </header>

                    <div className="forms-list">
                        {forms.map(form => (
                            <div key={form.id} className="form-card">
                                <div className="form-header">
                                    <div>
                                        <h3>{form.form_template_id}</h3>
                                        <span className="form-date">Submitted: {new Date(form.submitted_at).toLocaleString()}</span>
                                    </div>
                                    <FormStatusBadge status={form.sync_status} />
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                                    ID: {form.id.slice(0, 8)}... | Retries: {form.retry_count}
                                </div>
                            </div>
                        ))}
                        {forms.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                                No forms found. Click + to add one.
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <NewForm onSave={saveForm} onCancel={() => setView('list')} />
            )}
        </div>
    );
};

const NewForm: React.FC<{ onSave: (f: FormSubmission) => void, onCancel: () => void }> = ({ onSave, onCancel }) => {
    const [temp, setTemp] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const isOffline = !navigator.onLine;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newSubmission: FormSubmission = {
            id: crypto.randomUUID(),
            patient_id: 'current-user-uuid',
            form_template_id: 'daily-symptom-log',
            form_data: { temp, symptoms },
            submitted_at: Date.now(),
            sync_status: isOffline ? 'PENDING' : 'SYNCED', // LLD Logic
            retry_count: 0,
            created_at: Date.now()
        };

        // Simulate network delay if online
        if (!isOffline) {
            // In a real app, this would be an API call
            setTimeout(() => onSave(newSubmission), 500);
        } else {
            onSave(newSubmission);
        }
    };

    return (
        <div className="new-form-container">
            <header className="forms-header">
                <button onClick={onCancel} className="icon-btn-plain">Cancel</button>
                <h2>New Entry</h2>
                <button onClick={handleSubmit} className="text-btn-primary">Save</button>
            </header>

            <form className="form-content" onSubmit={handleSubmit}>
                <div className="form-field">
                    <label>Temperature (°C)</label>
                    <input
                        type="number"
                        step="0.1"
                        placeholder="36.5"
                        value={temp}
                        onChange={e => setTemp(e.target.value)}
                        required
                    />
                </div>

                <div className="form-field">
                    <label>Symptoms / Notes</label>
                    <textarea
                        rows={4}
                        placeholder="Describe how you feel..."
                        value={symptoms}
                        onChange={e => setSymptoms(e.target.value)}
                    ></textarea>
                </div>

                <div className="offline-notice">
                    {isOffline && (
                        <div className="notice-box">
                            <CloudOff size={16} />
                            <span>You are offline. Form will be queued locally.</span>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};
