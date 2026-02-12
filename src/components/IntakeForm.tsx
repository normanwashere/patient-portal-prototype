import React, { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';
import './IntakeForm.css';

interface IntakeFormProps {
    onSubmit: (data: { complaint: string; duration: string; files?: File[] }) => void;
    isSubmitting?: boolean;
    initialData?: { complaint: string; duration: string };
    submitLabel?: string;
}

export const IntakeForm: React.FC<IntakeFormProps> = ({
    onSubmit,
    isSubmitting = false,
    initialData = { complaint: '', duration: '' },
    submitLabel = 'Join Queue'
}) => {
    const [complaint, setComplaint] = useState(initialData.complaint);
    const [duration, setDuration] = useState(initialData.duration);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ complaint, duration });
    };

    return (
        <form onSubmit={handleSubmit} className="intake-form">
            <div className="form-group">
                <label htmlFor="complaint">Chief Complaint / Reason for Visit *</label>
                <textarea
                    id="complaint"
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    placeholder="E.g., I have a severe headache and fever..."
                    required
                    rows={5}
                    className="form-control"
                />
            </div>

            <div className="form-group">
                <label htmlFor="duration">How long have you had these symptoms?</label>
                <input
                    type="text"
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="E.g., 2 days"
                    className="form-control"
                />
            </div>

            <div className="form-group">
                <label>Attachments (Optional)</label>
                <div className="file-upload-zone">
                    <Paperclip size={18} />
                    <span>Attach photos or documents</span>
                </div>
            </div>

            <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : submitLabel}
                    {!isSubmitting && <Send size={18} />}
                </button>
            </div>
        </form>
    );
};
