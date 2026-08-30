import { Breadcrumbs } from '@/components/breadcrumbs';
import { SocialAvatar } from '@/components/social/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { MessagesSquare, Search, SquarePlus } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { auth, direct } = usePage<SharedData>().props;

    return (
        <header className="border-sidebar-border/70 bg-background/92 sticky top-0 z-20 h-[4.5rem] shrink-0 border-b backdrop-blur-lg">
            <div className="mx-auto flex h-full w-full max-w-[1600px] items-center gap-2 px-4 sm:px-5 lg:px-7">
                <Link href="/feed" className="flex items-center md:hidden" aria-label="BlackFrame home">
                    <AppLogo compact />
                </Link>

                <div className="hidden min-w-0 items-center gap-2 md:flex">
                    <SidebarTrigger className="-ml-1 size-10 cursor-pointer rounded-xl" />
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>

                <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
                    <Button asChild variant="ghost" className="min-h-11 rounded-xl px-3 sm:px-4">
                        <Link href={route('people.index')} aria-label="Search BlackFrame">
                            <Search className="size-5" strokeWidth={1.8} aria-hidden="true" />
                            <span className="hidden sm:inline">Search</span>
                        </Link>
                    </Button>

                    <Button asChild className="hidden min-h-11 rounded-xl px-4 md:inline-flex">
                        <Link href={route('posts.create')}>
                            <SquarePlus className="size-4" strokeWidth={1.9} aria-hidden="true" />
                            Create
                        </Link>
                    </Button>

                    <Button asChild variant="ghost" size="icon" className="relative hidden size-11 rounded-xl md:inline-flex">
                        <Link href={route('direct.index')} aria-label="Open Direct messages">
                            <MessagesSquare className="size-5" strokeWidth={1.8} aria-hidden="true" />
                            {direct.unread_count > 0 && (
                                <span className="border-background bg-primary absolute top-1 right-1 min-w-4 rounded-full border px-1 text-center text-[0.5625rem] leading-3.5 font-semibold text-white tabular-nums">
                                    {direct.unread_count > 9 ? '9+' : direct.unread_count}
                                    <span className="sr-only"> unread messages</span>
                                </span>
                            )}
                        </Link>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                aria-label="Open account menu"
                                className="hover:bg-muted focus-visible:ring-ring flex size-11 cursor-pointer items-center justify-center rounded-xl transition-colors focus-visible:ring-2 focus-visible:outline-none"
                            >
                                <SocialAvatar name={auth.user.name} src={auth.user.avatar_url} className="size-8" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64 rounded-xl p-1.5" align="end" sideOffset={8}>
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
