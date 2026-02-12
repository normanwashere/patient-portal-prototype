import React from 'react';
import { useTheme } from '../theme/ThemeContext';
import { Settings } from 'lucide-react';

export const TenantSwitcher: React.FC = () => {
    const { tenant, setTenantId, availableTenants } = useTheme();

    return (
        <div style={{
            position: 'fixed',
            bottom: '1rem',
            right: '1rem',
            zIndex: 9999,
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'white',
            fontSize: '0.8rem'
        }}>
            <Settings size={16} />
            <select
                value={tenant.id}
                onChange={(e) => setTenantId(e.target.value)}
                style={{
                    background: 'transparent',
                    color: 'white',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    padding: '2px 4px',
                    cursor: 'pointer'
                }}
            >
                {availableTenants.map((t) => (
                    <option key={t.id} value={t.id} style={{ color: 'black' }}>
                        {t.name}
                    </option>
                ))}
            </select>
        </div>
    );
};
