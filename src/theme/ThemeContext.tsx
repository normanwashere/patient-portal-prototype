import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { TenantConfig, TenantFeatures } from '../types/tenant';
import { tenants as defaultTenants, defaultTenant } from './tenantConfig';

const BUILTIN_IDS = ['metroGeneral', 'meralcoWellness', 'healthFirst', 'maxicare'];

interface ThemeContextType {
    tenant: TenantConfig;
    setTenantId: (id: string) => void;
    availableTenants: TenantConfig[];
    addTenant: (config: TenantConfig) => void;
    removeTenant: (id: string) => void;
    updateTenantFeatures: (features: TenantFeatures) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tenants, setTenants] = useState<Record<string, TenantConfig>>({ ...defaultTenants });
    const [tenantId, setTenantIdRaw] = useState<string>(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('tenant') || 'maxicare';
    });

    const tenant = tenants[tenantId] || defaultTenant;
    const availableTenants = Object.values(tenants);

    const setTenantId = useCallback((id: string) => {
        setTenantIdRaw(id);
    }, []);

    const addTenant = useCallback((config: TenantConfig) => {
        setTenants(prev => ({ ...prev, [config.id]: config }));
    }, []);

    const removeTenant = useCallback((id: string) => {
        if (BUILTIN_IDS.includes(id)) return;
        setTenants(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
        setTenantIdRaw(prev => prev === id ? 'maxicare' : prev);
    }, []);

    // Update features for the currently active tenant in real-time
    const updateTenantFeatures = useCallback((features: TenantFeatures) => {
        setTenants(prev => {
            const current = prev[tenantId];
            if (!current) return prev;
            return { ...prev, [tenantId]: { ...current, features } };
        });
    }, [tenantId]);

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

        // Generate org-tinted background shades from primary color
        // These allow gradients/backgrounds to subtly reflect the org's brand
        root.style.setProperty('--color-bg-tint-soft', `color-mix(in srgb, ${colors.primary} 3%, white)`);
        root.style.setProperty('--color-bg-tint', `color-mix(in srgb, ${colors.primary} 5%, white)`);
        root.style.setProperty('--color-bg-tint-medium', `color-mix(in srgb, ${colors.primary} 8%, white)`);
        root.style.setProperty('--color-bg-tint-strong', `color-mix(in srgb, ${colors.primary} 12%, white)`);
    }, [tenant]);

    return (
        <ThemeContext.Provider value={{ tenant, setTenantId, availableTenants, addTenant, removeTenant, updateTenantFeatures }}>
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
