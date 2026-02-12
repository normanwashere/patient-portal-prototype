import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation } from 'lucide-react';
import { type Branch } from '../../data/mockBranches';
import './HospitalWidget.css';

interface HospitalWidgetProps {
    branch: Branch;
}

export const HospitalWidget: React.FC<HospitalWidgetProps> = ({ branch }) => {
    const navigate = useNavigate();

    return (
        <div
            className="hospital-widget"
            onClick={() => navigate('/branches', { state: { highlightId: branch.id } })}
        >
            <div className="widget-header">
                <div className={`widget-badge ${branch.type}`}>
                    {branch.type}
                </div>
                <div className="widget-distance">
                    <Navigation size={10} strokeWidth={3} />
                    <span>{branch.distance}</span>
                </div>
            </div>

            <div className="widget-body">
                <h4 className="widget-name">{branch.name}</h4>
                <div className="widget-location">
                    <MapPin size={12} />
                    <span>{branch.address.split(',')[0]}</span>
                </div>
            </div>
        </div>
    );
};
