import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { House, MessageCircleMore, MessagesSquare, SquarePlus, UsersRound } from 'lucide-react';

export function MobileNav() {
    const { t } = useTranslation();
    const page = usePage<SharedData>();
    const items = [
        { id: 'feed', label: t('Home'), href: route('feed'), icon: House },
        { id: 'pulse', label: 'Pulse', href: route('pulse'), icon: MessageCircleMore },
        { id: 'create', label: t('Create'), href: route('posts.create'), icon: SquarePlus },
        { id: 'people', label: t('Discover'), href: route('people.index'), icon: UsersRound },
        { id: 'direct', label: 'Direct', href: route('direct.index'), icon: MessagesSquare },
    ];

    return (
        <nav
            aria-label={t('Primary navigation')}
            className="border-border bg-background/95 fixed inset-x-0 bottom-0 z-30 border-t px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden"
        >
            <div className="mx-auto grid max-w-lg grid-cols-5 gap-1 sm:gap-2">
                {items.map((item) => {
                    const active = page.url.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                                'focus-visible:outline-ring flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[0.6875rem] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
                                active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                        >
                            <span className="relative">
                                <item.icon className="size-5" strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
                                {item.id === 'direct' && page.props.direct.unread_count > 0 && (
                                    <span className="border-background bg-primary text-primary-foreground absolute -top-2 -right-2 min-w-4 rounded-full border px-1 text-center text-[0.625rem] leading-4 font-semibold tabular-nums">
                                        {page.props.direct.unread_count > 9 ? '9+' : page.props.direct.unread_count}
                                        <span className="sr-only"> {t('unread messages')}</span>
                                    </span>
                                )}
                            </span>
                            {item.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
