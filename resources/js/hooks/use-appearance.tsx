import { useEffect, useState } from 'react';

export type Appearance = 'light';

const applyTheme = (): void => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
};

export function initializeTheme(): void {
    try {
        localStorage.setItem('appearance', 'light');
    } catch {
        // localStorage may be unavailable in private browsing
    }

    applyTheme();
}

export function useAppearance() {
    const [appearance] = useState<Appearance>('light');

    useEffect(() => {
        applyTheme();
    }, []);

    const updateAppearance = (): void => {
        applyTheme();
    };

    return { appearance, updateAppearance };
}
