import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { BackButton } from '../../components/Common/BackButton';
import { IntakeForm } from '../../components/IntakeForm';
import './TeleconsultIntake.css';

export const TeleconsultIntake: React.FC = () => {
    const navigate = useNavigate();
    const { joinQueue } = useData();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (_data: { complaint: string; duration: string }) => {
        setIsSubmitting(true);
        joinQueue();
        setIsSubmitting(false);
        navigate('/visits/consult-now');
    };

    return (
        <div className="intake-page">
            <header className="page-header">
                <BackButton />
                <div className="header-text">
                    <h2>Consultation Details</h2>
                    <p className="page-subtitle">Provide details to help the doctor prepare for your consultation</p>
                </div>
            </header>

            <div className="intake-content">
                <IntakeForm
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    submitLabel="Join Queue"
                />
            </div>
        </div>
    );
};
