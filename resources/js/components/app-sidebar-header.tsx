import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { HeartHandshake, MessagesSquare, Search } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const page = usePage<SharedData>();
    const peopleActive = page.url.startsWith('/people');
    const matchesActive = page.url.startsWith('/matches');
    const directActive = page.url.startsWith('/direct');

    return (
        <header className="border-sidebar-border/60 bg-background/90 sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b px-4 backdrop-blur transition-[width,height] ease-linear md:px-5">
            <Link href="/feed" className="flex items-center md:hidden" aria-label="BlackFrame home">
                <AppLogo compact />
            </Link>
            <Link
                href="/people"
                aria-current={peopleActive ? 'page' : undefined}
                className={cn(
                    'ml-auto flex min-h-11 items-center gap-2 rounded-xl px-2.5 text-sm font-semibold transition-colors md:hidden',
                    peopleActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
            >
                <Search className="size-5" strokeWidth={peopleActive ? 2.2 : 1.8} aria-hidden="true" />
                People
            </Link>
            <Link
                href="/matches"
                aria-current={matchesActive ? 'page' : undefined}
                className={cn(
                    'flex min-h-11 items-center gap-2 rounded-xl px-2.5 text-sm font-semibold transition-colors md:hidden',
                    matchesActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
            >
                <HeartHandshake className="size-5" strokeWidth={matchesActive ? 2.2 : 1.8} aria-hidden="true" />
                Match
            </Link>
            <Link
                href="/direct"
                aria-current={directActive ? 'page' : undefined}
                className={cn(
                    'relative flex min-h-11 items-center gap-2 rounded-xl px-2.5 text-sm font-semibold transition-colors md:hidden',
                    directActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
            >
                <MessagesSquare className="size-5" strokeWidth={directActive ? 2.2 : 1.8} aria-hidden="true" />
                Direct
                {page.props.direct.unread_count > 0 && (
                    <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 min-w-5 rounded-full px-1 text-center text-[0.625rem] leading-5 font-semibold tabular-nums">
                        {page.props.direct.unread_count > 99 ? '99+' : page.props.direct.unread_count}
                        <span className="sr-only"> unread messages</span>
                    </span>
                )}
            </Link>
            <div className="hidden items-center gap-2 md:flex">
                <SidebarTrigger className="-ml-1 size-10 cursor-pointer" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
        </header>
    );
}
