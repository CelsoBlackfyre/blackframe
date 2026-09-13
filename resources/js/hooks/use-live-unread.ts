import { getEcho } from '@/lib/echo';
import { SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

/**
 * Refresh the unread-message badge the moment a message arrives for the
 * signed-in user. The Direct page handles its own conversation updates.
 */
export function useLiveUnreadBadge(): void {
    const userId = usePage<SharedData>().props.auth.user?.id;

    useEffect(() => {
        const echo = getEcho();

        if (!echo || !userId) {
            return;
        }

        const channel = echo.private(`App.Models.User.${userId}`).listen('.MessageSent', () => {
            if (window.location.pathname.startsWith('/direct')) {
                return;
            }

            router.reload({ only: ['direct'] });
        });

        return () => {
            channel.stopListening('.MessageSent');
        };
    }, [userId]);
}
