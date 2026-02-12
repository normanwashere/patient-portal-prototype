import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CalendarDays,
    ChevronRight,
    TestTube,
    Pill,
    CreditCard,
    Heart,
    Syringe
} from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { useData } from '../context/DataContext';
import { useBadges } from '../hooks/useBadges';
import { BannerCarousel } from '../components/BannerCarousel';
import { CheckInCard } from '../components/CheckInCard';
import { HospitalWidget } from '../components/HospitalWidget/HospitalWidget';
import {
    METRO_GENERAL_BRANCHES,
    MERALCO_WELLNESS_BRANCHES,
    HEALTH_FIRST_BRANCHES,
    type Branch
} from '../data/mockBranches';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { tenant } = useTheme();
    const {
        joinQueue,
        leaveQueue
    } = useData();

    const {
        newLabsCount,
        newMedsCount
    } = useBadges();


    const getTopBranches = (branches: Branch[]) => {
        const hospitals = branches.filter(b => b.type === 'hospital').slice(0, 2);
        const clinics = branches.filter(b => b.type === 'clinic').slice(0, 2);
        return [...hospitals, ...clinics];
    };

    return (
        <div className="dashboard-container container">

            {/* Banner Section */}
            <section className="marketing-banner-section">
                <BannerCarousel />
            </section>

            {/* Visit Context Widget (Dynamic) */}
            <section className="queue-section">
                <CheckInCard
                    onCheckIn={() => joinQueue()}
                    onLeaveQueue={() => leaveQueue()}
                />
            </section>

            {/* Quick Actions - Compact Grid */}
            <section className="action-center">
                <h3 className="section-title">Quick Actions</h3>
                <div className="quick-actions-grid">
                    {/* 1. Book Appointment */}
                    <button className="quick-action-btn" onClick={() => navigate('/visits')}>
                        <CalendarDays size={20} />
                        <span>Book Appointment</span>
                    </button>

                    {/* 2. Lab Results */}
                    <button className="quick-action-btn" onClick={() => navigate('/results')}>
                        <div className="icon-badge-box">
                            <TestTube size={20} />
                            {newLabsCount > 0 && <span className="btn-badge">{newLabsCount}</span>}
                        </div>
                        <span>Lab Results</span>
                    </button>

                    {/* 3. Medications */}
                    <button className="quick-action-btn" onClick={() => navigate('/medications')}>
                        <div className="icon-badge-box">
                            <Pill size={20} />
                            {newMedsCount > 0 && <span className="btn-badge">{newMedsCount}</span>}
                        </div>
                        <span>Medications</span>
                    </button>

                    {/* 4. Billing */}
                    <button className="quick-action-btn" onClick={() => navigate('/billing')}>
                        <CreditCard size={20} />
                        <span>Billing</span>
                    </button>

                    {/* 5. Benefits (HMO) */}
                    {tenant.features.loa && (
                        <button className="quick-action-btn" onClick={() => navigate('/benefits')}>
                            <Heart size={20} />
                            <span>HMO Benefits</span>
                        </button>
                    )}

                    {/* 6. Vaccines */}
                    <button className="quick-action-btn" onClick={() => navigate('/immunization')}>
                        <Syringe size={20} />
                        <span>Vaccines</span>
                    </button>
                </div>
            </section>

            {/* Find Hospitals */}
            <section className="hospitals-section">
                <div className="section-header-row">
                    <h3 className="section-title">Find Hospitals and Clinics</h3>
                    <button className="view-all-link" onClick={() => navigate('/branches')}>
                        View all <ChevronRight size={16} />
                    </button>
                </div>

                <div className="hospitals-grid">
                    {(() => {
                        let branches: Branch[] = [];
                        if (tenant.id === 'metroGeneral') {
                            branches = METRO_GENERAL_BRANCHES;
                        } else if (tenant.id === 'meralcoWellness') {
                            branches = MERALCO_WELLNESS_BRANCHES;
                        } else if (tenant.id === 'healthFirst') {
                            branches = HEALTH_FIRST_BRANCHES;
                        }

                        const displayBranches = getTopBranches(branches);

                        return displayBranches.map(branch => (
                            <HospitalWidget key={branch.id} branch={branch} />
                        ));
                    })()}
                </div>
            </section>
        </div>
    );
};
