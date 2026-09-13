import AppLogo from '@/components/app-logo';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SocialAvatar } from '@/components/social/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { MessagesSquare, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItem[] }) {
    const { auth, direct } = usePage<SharedData>().props;
    const [query, setQuery] = useState('');
    function search(event: FormEvent) {
        event.preventDefault();
        router.get(route('people.index'), query.trim() ? { query: query.trim() } : {});
    }
    return (
        <header className="border-border bg-background sticky top-0 z-20 h-[4.5rem] shrink-0 border-b">
            <div className="mx-auto flex h-full w-full max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
                <SidebarTrigger className="size-11 shrink-0 rounded-xl" />
                <Link href="/feed" className="flex items-center md:hidden" aria-label="BlackFrame home">
                    <AppLogo compact />
                </Link>
                <div className="hidden min-w-0 lg:block">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
                <form onSubmit={search} role="search" className="relative ml-auto hidden w-full max-w-[330px] sm:block">
                    <label htmlFor="global-search" className="sr-only">
                        Search people
                    </label>
                    <Search className="text-muted-foreground pointer-events-none absolute top-3.5 left-4 size-4" aria-hidden="true" />
                    <Input
                        id="global-search"
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        maxLength={80}
                        placeholder="Find your people"
                        className="bg-muted/70 border-transparent pr-14 pl-10"
                    />
                    <button
                        type="submit"
                        aria-label="Search BlackFrame"
                        className="hover:text-primary absolute inset-y-0 right-1 flex w-11 items-center justify-center rounded-lg"
                    >
                        <ArrowSearch />
                    </button>
                </form>
                <div className="ml-auto flex shrink-0 items-center gap-2 sm:ml-0">
                    <Button asChild variant="ghost" size="icon" className="sm:hidden">
                        <Link href={route('people.index')} aria-label="Search BlackFrame">
                            <Search className="size-5!" aria-hidden="true" />
                        </Link>
                    </Button>
                    <AppearanceToggleDropdown className="hidden sm:block" />
                    <Button asChild variant="ghost" size="icon" className="relative hidden md:inline-flex">
                        <Link
                            href={route('direct.index')}
                            aria-label={`Open Direct messages${direct.unread_count ? `, ${direct.unread_count} unread` : ''}`}
                        >
                            <MessagesSquare className="size-5!" strokeWidth={1.8} aria-hidden="true" />
                            {direct.unread_count > 0 && (
                                <span className="bg-primary text-primary-foreground absolute top-0 right-0 min-w-4 rounded-full px-1 text-center text-[10px] leading-4 font-semibold">
                                    {direct.unread_count > 9 ? '9+' : direct.unread_count}
                                </span>
                            )}
                        </Link>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                aria-label="Open account menu"
                                className="hover:bg-muted flex size-11 items-center justify-center rounded-xl"
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
function ArrowSearch() {
    return (
        <span className="text-muted-foreground text-lg" aria-hidden="true">
            ↵
        </span>
    );
}
