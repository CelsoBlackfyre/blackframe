import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher?: typeof Pusher;
    }
}

export interface ReverbConfig {
    key: string | null;
    host: string;
    port: number;
    scheme: string;
}

let echo: Echo<'reverb'> | null = null;

/**
 * Connect to Reverb once per page load. When no app key is shared (broadcasting
 * disabled or not configured) the app keeps working without realtime updates.
 */
export function initEcho(config: ReverbConfig | undefined): Echo<'reverb'> | null {
    if (echo || !config?.key) {
        return echo;
    }

    window.Pusher = Pusher;

    echo = new Echo({
        broadcaster: 'reverb',
        key: config.key,
        wsHost: config.host,
        wsPort: config.port,
        wssPort: config.port,
        forceTLS: config.scheme === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: '/broadcasting/auth',
    });

    return echo;
}

export function getEcho(): Echo<'reverb'> | null {
    return echo;
}
