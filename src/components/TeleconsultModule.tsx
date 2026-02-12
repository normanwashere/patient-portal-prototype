import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Calendar, Zap, Clock, ChevronRight } from 'lucide-react';
import './TeleconsultModule.css';

interface TeleconsultModuleProps {
    consultNowEnabled: boolean;
    consultLaterEnabled: boolean;
}

export const TeleconsultModule: React.FC<TeleconsultModuleProps> = ({
    consultNowEnabled,
    consultLaterEnabled,
}) => {
    const navigate = useNavigate();

    // If neither option is enabled, don't render
    if (!consultNowEnabled && !consultLaterEnabled) {
        return null;
    }

    return (
        <section className="teleconsult-module">
            <div className="module-header">
                <div className="module-icon teleconsult">
                    <Video size={24} />
                </div>
                <div className="module-title">
                    <h3>Teleconsult</h3>
                    <p>Consult with a doctor from anywhere</p>
                </div>
            </div>

            <div className="module-actions">
                {/* Consult Now (if enabled) */}
                {consultNowEnabled && (
                    <button
                        className="action-btn primary"
                        onClick={() => navigate('/visits/consult-now')}
                    >
                        <div className="action-icon">
                            <Zap size={20} />
                        </div>
                        <div className="action-text">
                            <span className="action-title">Consult Now</span>
                            <span className="action-desc">Connect immediately</span>
                        </div>
                        <ChevronRight size={18} className="chevron" />
                    </button>
                )}

                {/* Consult Later (if enabled) */}
                {consultLaterEnabled && (
                    <button
                        className="action-btn secondary"
                        onClick={() => navigate('/visits/consult-later')}
                    >
                        <div className="action-icon">
                            <Calendar size={20} />
                        </div>
                        <div className="action-text">
                            <span className="action-title">Schedule Teleconsult</span>
                            <span className="action-desc">Book for later</span>
                        </div>
                        <ChevronRight size={18} className="chevron" />
                    </button>
                )}
            </div>

            {/* Info chip */}
            <div className="module-info">
                <Clock size={12} />
                <span>Average wait time: 5-10 mins</span>
            </div>
        </section>
    );
};
