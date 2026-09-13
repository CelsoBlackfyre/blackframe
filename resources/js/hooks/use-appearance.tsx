import { useSyncExternalStore } from 'react';

export type Appearance = 'light' | 'dark' | 'system';
let appearance: Appearance = 'system';
let initialized = false;
const listeners = new Set<() => void>();
const validAppearance = (value: string | null): Appearance => (value === 'light' || value === 'dark' ? value : 'system');

function applyTheme() {
    if (typeof window === 'undefined') return;
    const dark = appearance === 'dark' || (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
}

export function initializeTheme() {
    if (typeof window === 'undefined' || initialized) return;
    initialized = true;
    try {
        appearance = validAppearance(localStorage.getItem('appearance'));
    } catch {
        /* Storage may be unavailable in private browsing. */
    }
    applyTheme();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
    window.addEventListener('storage', (event) => {
        if (event.key !== 'appearance' && event.key !== null) return;
        appearance = validAppearance(event.newValue);
        applyTheme();
        listeners.forEach((listener) => listener());
    });
}

function updateAppearance(mode: Appearance) {
    appearance = mode;
    try {
        localStorage.setItem('appearance', mode);
    } catch {
        /* The selected theme still works for this session. */
    }
    applyTheme();
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function useAppearance() {
    const current = useSyncExternalStore(
        subscribe,
        () => appearance,
        () => 'system' as Appearance,
    );
    return { appearance: current, updateAppearance };
}
