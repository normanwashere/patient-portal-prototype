import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

import { getTenantBranches } from '../data/mockBranches';
import { BranchCard } from '../components/BranchCard/BranchCard';
import './Branches.css';

export const Branches: React.FC = () => {
    const { tenant } = useTheme();
    const location = useLocation();
    const highlightId = location.state?.highlightId;
    const branchRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    useEffect(() => {
        if (highlightId && branchRefs.current[highlightId]) {
            branchRefs.current[highlightId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [highlightId]);

    // Select branches based on tenant
    const branches = getTenantBranches(tenant.id, tenant.name);

    const hospitals = branches.filter(b => b.type === 'hospital' || b.type === 'lying-in');
    const clinics = branches.filter(b => b.type === 'clinic');

    return (
        <div className="branches-container container">
            <header className="page-header-standard">

                <h2 className="title-standard">Our Locations</h2>
                <p className="subtitle-standard">{tenant.tagline || 'Find a branch near you'}</p>
            </header>

            {/* Hospitals / Main Facilities */}
            {hospitals.length > 0 && (
                <section className="branch-section">
                    <h3 className="section-label">
                        {tenant.id === 'meralcoWellness' ? 'Wellness Centers' : 'Hospitals'}
                    </h3>
                    <div className="branches-list">
                        {hospitals.map(branch => (
                            <div key={branch.id} ref={(el) => { branchRefs.current[branch.id] = el; }}>
                                <BranchCard
                                    branch={branch}
                                    isHighlighted={highlightId === branch.id}
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Clinics */}
            {clinics.length > 0 && (
                <section className="branch-section">
                    <h3 className="section-label">Clinics</h3>
                    <div className="branches-list">
                        {clinics.map(branch => (
                            <div key={branch.id} ref={(el) => { branchRefs.current[branch.id] = el; }}>
                                <BranchCard
                                    branch={branch}
                                    isHighlighted={highlightId === branch.id}
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {branches.length === 0 && (
                <div className="empty-state">
                    <MapPin size={48} />
                    <h3>Single Location</h3>
                    <p>This facility operates from a single location.</p>
                </div>
            )}
        </div>
    );
};
