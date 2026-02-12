import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { ArrowLeft } from 'lucide-react';
import { IntakeForm } from '../../components/IntakeForm';
import '../../components/Layout.css';
import './TeleconsultIntake.css';

export const TeleconsultIntake: React.FC = () => {
    const navigate = useNavigate();
    const { joinQueue } = useData();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (_data: { complaint: string; duration: string }) => {
        setIsSubmitting(true);

        // Join queue
        // Note: The original request implies navigating to the flow of "Consult Now".
        // If ConsultNow checks queue status, we should ensure queue is joined. 
        // Currently joinQueue() in DataContext just sets a flag or adds to queue.
        joinQueue();

        setIsSubmitting(false);
        navigate('/visits/consult-now');
    };

    return (
        <div className="intake-page">
            <header className="intake-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h2>Consultation Details</h2>
            </header>

            <div className="intake-content">
                <p className="intake-description">
                    Please provide some details about your condition to help the doctor prepare for your consultation.
                </p>

                <IntakeForm
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    submitLabel="Join Queue"
                />
            </div>
        </div>
    );
};
