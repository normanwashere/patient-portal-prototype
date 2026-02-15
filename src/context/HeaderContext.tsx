import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface HeaderContextType {
    customBack: (() => void) | null;
    setCustomBack: (handler: (() => void) | null) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const HeaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [customBack, setCustomBackState] = useState<(() => void) | null>(null);

    const setCustomBack = useCallback((handler: (() => void) | null) => {
        setCustomBackState(() => handler);
    }, []);

    return (
        <HeaderContext.Provider value={{ customBack, setCustomBack }}>
            {children}
        </HeaderContext.Provider>
    );
};

export const useHeader = () => {
    const context = useContext(HeaderContext);
    if (context === undefined) {
        throw new Error('useHeader must be used within a HeaderProvider');
    }
    return context;
};
