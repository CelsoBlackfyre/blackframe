import { WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ConnectionStatus() {
    const [offline, setOffline] = useState(false);
    useEffect(() => {
        const update = () => setOffline(!navigator.onLine);
        update();
        window.addEventListener('online', update);
        window.addEventListener('offline', update);
        return () => {
            window.removeEventListener('online', update);
            window.removeEventListener('offline', update);
        };
    }, []);
    return offline ? (
        <div role="status" className="bg-accent text-accent-foreground flex items-center justify-center gap-2 px-4 py-3 text-sm">
            <WifiOff className="size-4 shrink-0" aria-hidden="true" />
            You’re offline. Reconnect before posting or saving changes.
        </div>
    ) : null;
}
