import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { TenantConfig } from '../types/tenant';
import { tenants, defaultTenant } from './tenantConfig';

interface ThemeContextType {
    tenant: TenantConfig;
    setTenantId: (id: string) => void;
    availableTenants: TenantConfig[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tenantId, setTenantId] = useState<string>(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('tenant') || 'metroGeneral';
    });

    const tenant = tenants[tenantId] || defaultTenant;
    const availableTenants = Object.values(tenants);

    // Apply CSS variables whenever tenant changes
    useEffect(() => {
        const root = document.documentElement;
        const colors = tenant.colors;

        root.style.setProperty('--color-primary', colors.primary);
        root.style.setProperty('--color-secondary', colors.secondary);
        root.style.setProperty('--color-background', colors.background);
        root.style.setProperty('--color-surface', colors.surface);
        root.style.setProperty('--color-text', colors.text);
        root.style.setProperty('--color-text-muted', colors.textMuted);
        root.style.setProperty('--color-border', colors.border);

        // Set document title/icon if real (for prototype we just swap colors)
        // root.style.setProperty('--font-family', tenant.fontFamily || 'Inter, sans-serif');

    }, [tenant]);

    return (
        <ThemeContext.Provider value={{ tenant, setTenantId, availableTenants }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
