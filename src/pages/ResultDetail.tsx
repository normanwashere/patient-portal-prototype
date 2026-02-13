import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Share2, TrendingUp, TrendingDown, Minus, Calendar, User, MapPin, AlertTriangle, FileText } from 'lucide-react';
import { BackButton } from '../components/Common/BackButton';
import { useData } from '../context/DataContext';
import './ResultDetail.css';

interface LabValue {
    name: string;
    value: number;
    unit: string;
    refLow: number;
    refHigh: number;
    trend: string;
    flag?: string;
}

// Default lab values (fallback when matched result has no structured values)
const DEFAULT_VALUES: LabValue[] = [
    { name: 'Hemoglobin', value: 14.2, unit: 'g/dL', refLow: 12.0, refHigh: 16.0, trend: 'stable' },
    { name: 'Hematocrit', value: 42.5, unit: '%', refLow: 36.0, refHigh: 48.0, trend: 'up' },
    { name: 'Red Blood Cells', value: 4.8, unit: 'M/uL', refLow: 4.0, refHigh: 5.5, trend: 'stable' },
    { name: 'White Blood Cells', value: 11.2, unit: 'K/uL', refLow: 4.5, refHigh: 11.0, trend: 'up', flag: 'high' as const },
    { name: 'Platelets', value: 245, unit: 'K/uL', refLow: 150, refHigh: 400, trend: 'stable' },
    { name: 'MCV', value: 88.5, unit: 'fL', refLow: 80, refHigh: 100, trend: 'stable' },
    { name: 'MCH', value: 29.6, unit: 'pg', refLow: 27, refHigh: 33, trend: 'stable' },
    { name: 'MCHC', value: 33.4, unit: 'g/dL', refLow: 32, refHigh: 36, trend: 'down' },
];

export const ResultDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { results } = useData();

    // Try to find the result from context by matching id
    const matched = results.find((r: any) => r.id === id);

    const result: {
        id: string; testName: string; category: string; date: string;
        provider: string; doctor: string; status: string; isCritical: boolean;
        values: LabValue[];
    } = matched
        ? {
            id: matched.id,
            testName: matched.title ?? 'Lab Result',
            category: matched.type ?? 'Laboratory',
            date: matched.date ?? '',
            provider: 'MediLab Diagnostics',
            doctor: matched.doctor ?? 'Unknown',
            status: 'Final',
            isCritical: !!matched.isCritical,
            values: (matched as any).values ?? DEFAULT_VALUES,
        }
        : {
            id: id ?? '1',
            testName: 'Complete Blood Count (CBC)',
            category: 'Laboratory',
            date: 'February 10, 2024',
            provider: 'MediLab Diagnostics',
            doctor: 'Dr. Jen Diaz',
            status: 'Final',
            isCritical: false,
            values: DEFAULT_VALUES,
        };

    if (!matched && results.length > 0) {
        // Result not found in data
        return (
            <div className="result-detail-container">
                <header className="page-header">
                    <BackButton to="/results" />
                    <div className="header-text" style={{ flex: 1 }}>
                        <h2>Result Not Found</h2>
                    </div>
                </header>
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                    <FileText size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
                    <p style={{ marginBottom: 16 }}>The requested result could not be found.</p>
                    <button
                        onClick={() => navigate('/results')}
                        style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Back to Results
                    </button>
                </div>
            </div>
        );
    }

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <TrendingUp size={14} />;
            case 'down': return <TrendingDown size={14} />;
            default: return <Minus size={14} />;
        }
    };

    const getValueStatus = (value: number, low: number, high: number) => {
        if (value < low) return 'low';
        if (value > high) return 'high';
        return 'normal';
    };

    const getBarPosition = (value: number, low: number, high: number) => {
        const range = high - low;
        const padding = range * 0.3;
        const min = low - padding;
        const max = high + padding;
        const totalRange = max - min;
        return ((value - min) / totalRange) * 100;
    };

    const getNormalRange = (low: number, high: number) => {
        const range = high - low;
        const padding = range * 0.3;
        const min = low - padding;
        const max = high + padding;
        const totalRange = max - min;
        const leftPos = ((low - min) / totalRange) * 100;
        const width = ((high - low) / totalRange) * 100;
        return { left: `${leftPos}% `, width: `${width}% ` };
    };

    return (
        <div className="result-detail-container">
            <header className="page-header">
                <BackButton />
                <div className="header-text" style={{ flex: 1 }}>
                    <h2 style={{ lineHeight: '1.2' }}>Laboratory Results</h2>
                    <p className="page-subtitle" style={{ margin: 0 }}>Reference #{id?.slice(-8).toUpperCase()}</p>
                </div>
                <div className="header-actions">
                    <button className="btn-action">
                        <Share2 size={18} />
                    </button>
                    <button className="btn-action primary">
                        <Download size={18} />
                    </button>
                </div>
            </header>

            {/* Test Info Card */}
            <div className="test-info-card">
                <div className="test-header">
                    <h1>{result.testName}</h1>
                    <span className="test-category">{result.category}</span>
                </div>
                <div className="test-meta">
                    <div className="meta-item">
                        <Calendar size={14} />
                        <span>{result.date}</span>
                    </div>
                    <div className="meta-item">
                        <MapPin size={14} />
                        <span>{result.provider}</span>
                    </div>
                    <div className="meta-item">
                        <User size={14} />
                        <span>Ordered by {result.doctor}</span>
                    </div>
                </div>
            </div>

            {/* Results Table */}
            <div className="results-section">
                <h3>Test Results</h3>
                <div className="results-table">
                    {result.values.map((v, i) => (
                        <div key={i} className={`result - row ${v.flag || ''} `}>
                            <div className="result-name">
                                <span>{v.name}</span>
                                {v.flag && (
                                    <span className={`flag - badge ${v.flag} `}>
                                        <AlertTriangle size={10} />
                                        {v.flag.toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="result-value-section">
                                <div className="result-value">
                                    <span className={`value ${getValueStatus(v.value, v.refLow, v.refHigh)} `}>
                                        {v.value}
                                    </span>
                                    <span className="unit">{v.unit}</span>
                                    <span className={`trend ${v.trend} `}>
                                        {getTrendIcon(v.trend)}
                                    </span>
                                </div>
                                <div className="range-bar">
                                    <div
                                        className="normal-zone"
                                        style={getNormalRange(v.refLow, v.refHigh)}
                                    />
                                    <div
                                        className={`value - marker ${getValueStatus(v.value, v.refLow, v.refHigh)} `}
                                        style={{ left: `${Math.min(Math.max(getBarPosition(v.value, v.refLow, v.refHigh), 5), 95)}% ` }}
                                    />
                                </div>
                                <div className="ref-range">
                                    <span>Ref: {v.refLow} - {v.refHigh} {v.unit}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Interpretation Note */}
            <div className="interpretation-card">
                <h4>Note from Lab</h4>
                <p>
                    Slightly elevated WBC count may indicate a minor infection or stress response.
                    If symptoms persist, follow up with your physician. All other values are within
                    normal limits.
                </p>
            </div>
        </div>
    );
};
