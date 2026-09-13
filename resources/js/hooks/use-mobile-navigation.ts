import { useCallback } from 'react';

export function useMobileNavigation() {
    const cleanup = useCallback(() => {
        window.dispatchEvent(new Event('mobile-navigation'));
    }, []);

    return cleanup;
}
