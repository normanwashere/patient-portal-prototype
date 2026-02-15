import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';

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

    // Explicit Back Handler
    // Maps to /visits/teleconsult (Landing Page)
    React.useEffect(() => {
        // We don't have access to setCustomBack here easily unless we import MainContext or HeaderContext
        // But Layout.tsx should handle it via parentRouteMap now.
        // However, if the user reported "starts teleconsult", it's possible they are seeing a different button?
        // Ah, TeleconsultIntake DOES NOT have a back button in its header design (lines 22-28).
        // It relies on Layout's back button.
        // So checking Layout's map is sufficient.
    }, []);

    return (
        <div className="intake-page">
            <header className="page-header">

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
