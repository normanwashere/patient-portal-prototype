import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, TestTube, Stethoscope, ChevronRight } from 'lucide-react';
import './ClinicVisitModule.css';

interface ClinicVisitModuleProps {
    f2fSchedulingEnabled: boolean;
    labFulfillmentEnabled: boolean;
}

export const ClinicVisitModule: React.FC<ClinicVisitModuleProps> = ({
    f2fSchedulingEnabled,
    labFulfillmentEnabled,
}) => {
    const navigate = useNavigate();

    // If no clinic options are enabled, don't render
    if (!f2fSchedulingEnabled && !labFulfillmentEnabled) {
        return null;
    }

    return (
        <section className="clinic-module">
            <div className="module-header">
                <div className="module-icon clinic">
                    <Building2 size={24} />
                </div>
                <div className="module-title">
                    <h3>In-Clinic Visit</h3>
                    <p>Visit our facility for in-person care</p>
                </div>
            </div>

            <div className="module-actions">
                {/* Face-to-Face Scheduling (if enabled) */}
                {f2fSchedulingEnabled && (
                    <button
                        className="action-btn primary"
                        onClick={() => navigate('/appointments/book')}
                    >
                        <div className="action-icon">
                            <Stethoscope size={20} />
                        </div>
                        <div className="action-text">
                            <span className="action-title">Book Appointment</span>
                            <span className="action-desc">Schedule a clinic visit</span>
                        </div>
                        <ChevronRight size={18} className="chevron" />
                    </button>
                )}

                {/* Lab Fulfillment (if enabled) */}
                {labFulfillmentEnabled && (
                    <button
                        className="action-btn secondary"
                        onClick={() => navigate('/results')}
                    >
                        <div className="action-icon">
                            <TestTube size={20} />
                        </div>
                        <div className="action-text">
                            <span className="action-title">Lab Requests</span>
                            <span className="action-desc">View pending lab orders</span>
                        </div>
                        <ChevronRight size={18} className="chevron" />
                    </button>
                )}
            </div>
        </section>
    );
};
