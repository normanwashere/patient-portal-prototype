import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Clock, Navigation, Calendar, Stethoscope, Activity, Users } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';
import { type Branch } from '../../data/mockBranches';
// Reusing styles from Branches.css (or we could extract them to a separate file)
// Since this is a prototype, simple reuse via class names is fine.
// But ideally, we should move the css.
// Let's import the css for now so it works even if used on Dashboard
// Note: Dashboard doesn't import Branches.css, so we should probably move the CSS 
// or import it here. Let's create a dedicated CSS or just rely on global if imported.
// Actually, let's create a dedicated CSS file for this component to be clean.
import './BranchCard.css';

export const BranchCard: React.FC<{ branch: Branch; isHighlighted?: boolean }> = ({ branch, isHighlighted }) => {
    const navigate = useNavigate();
    const { tenant } = useTheme();
    const v = tenant.features.visits;

    return (
        <div className={`branch-card ${isHighlighted ? 'highlighted' : ''}`}>
            {isHighlighted && <div className="highlight-indicator">Selected Location</div>}

            <div className="branch-content">
                <div className="branch-header">
                    <div className="branch-type-badge" data-type={branch.type}>{branch.type}</div>
                    <span className="branch-distance">
                        <Navigation size={12} /> {branch.distance}
                    </span>
                </div>

                <h4 className="branch-name">{branch.name}</h4>

                <div className="branch-details">
                    <div className="detail-row">
                        <MapPin size={14} />
                        <span>{branch.address}</span>
                    </div>
                    <div className="detail-row">
                        <Phone size={14} />
                        <span>{branch.phone}</span>
                    </div>
                    <div className="detail-row">
                        <Clock size={14} />
                        <span>{branch.hours}</span>
                    </div>
                </div>

                {branch.specializations && branch.specializations.length > 0 && (
                    <div className="branch-specializations">
                        {branch.specializations.map(spec => (
                            <span key={spec} className="specialization-tag">{spec}</span>
                        ))}
                    </div>
                )}

                {branch.doctors && branch.doctors.length > 0 && (
                    <div className="branch-doctors">
                        <div className="doctors-header">
                            <Users size={12} />
                            <span>Available Doctors ({branch.doctors.length})</span>
                        </div>
                        <div className="doctors-list">
                            {branch.doctors.slice(0, 3).map(doc => (
                                <div key={doc.name} className="doctor-mini-item">
                                    <span className="doc-name">{doc.name}</span>
                                    <span className="doc-title">{doc.title}</span>
                                </div>
                            ))}
                            {branch.doctors.length > 3 && (
                                <span className="more-doctors">+{branch.doctors.length - 3} more</span>
                            )}
                        </div>
                    </div>
                )}

                <div className="branch-services">
                    {branch.services.map(service => (
                        <span key={service} className="service-tag">{service}</span>
                    ))}
                </div>
            </div>

            <div className="branch-footer">
                <div className="branch-actions-grid">
                    {v.clinicF2fSchedulingEnabled && (
                        <button
                            className="branch-action-btn primary"
                            onClick={() => navigate('/appointments/book', { state: { locationId: branch.id } })}
                        >
                            <Calendar size={14} />
                            <span>Book Visit</span>
                        </button>
                    )}
                    {v.clinicLabFulfillmentEnabled && (
                        <button
                            className="branch-action-btn secondary"
                            onClick={() => navigate('/appointments/book', { state: { type: 'procedure', locationId: branch.id } })}
                        >
                            <Activity size={14} />
                            <span>Book Procedure</span>
                        </button>
                    )}
                    {v.teleconsultLaterEnabled && (
                        <button
                            className="branch-action-btn ghost"
                            onClick={() => navigate('/appointments/book', { state: { type: 'teleconsult' } })}
                        >
                            <Stethoscope size={14} />
                            <span>Consult Later</span>
                        </button>
                    )}
                    <button className="branch-action-btn ghost">
                        <MapPin size={14} />
                        <span>Directions</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
