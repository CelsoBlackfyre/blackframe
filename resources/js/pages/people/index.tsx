import { FlashMessage } from '@/components/flash-message';
import { PersonCard } from '@/components/social/person-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Paginated } from '@/types/feed';
import { PeopleFilters, PeopleNetwork, PeopleView, PersonSummary } from '@/types/people';
import { Head, Link, router } from '@inertiajs/react';
import { LoaderCircle, Search, UsersRound, X } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'People', href: '/people' }];

interface PeoplePageProps {
    people: Paginated<PersonSummary>;
    filters: PeopleFilters;
    network: PeopleNetwork;
}

const tabs: Array<{ value: PeopleView; label: string }> = [
    { value: 'discover', label: 'Discover' },
    { value: 'followers', label: 'Followers' },
    { value: 'following', label: 'Following' },
];

function peopleUrl(view: PeopleView, query: string): string {
    return route('people.index', {
        view,
        ...(query.trim() ? { query: query.trim() } : {}),
    });
}

function EmptyPeople({ view, query, onClear }: { view: PeopleView; query: string; onClear: () => void }) {
    const hasQuery = query.trim() !== '';

    const content = hasQuery
        ? {
              title: `No ${view === 'discover' ? 'people' : view} match your search`,
              description: 'Try another name or username, or clear the search to see the complete list.',
          }
        : view === 'followers'
          ? {
                title: 'No followers yet',
                description: 'When someone follows you, they will appear here so you can find and connect with them.',
            }
          : view === 'following'
            ? {
                  title: 'You are not following anyone yet',
                  description: 'Explore the BlackFrame community and follow people whose posts you want in your feed.',
              }
            : {
                  title: 'No other people are here yet',
                  description: 'New BlackFrame members will appear here as the community grows.',
              };

    return (
        <section className="border-border bg-card rounded-2xl border border-dashed px-6 py-16 text-center">
            <UsersRound className="text-primary mx-auto size-9" strokeWidth={1.7} aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold">{content.title}</h2>
            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">{content.description}</p>
            {hasQuery ? (
                <Button type="button" variant="outline" onClick={onClear} className="mt-5 min-h-11 cursor-pointer rounded-xl">
                    Clear search
                </Button>
            ) : view === 'following' ? (
                <Button asChild className="mt-5 min-h-11 rounded-xl">
                    <Link href={peopleUrl('discover', '')}>Discover people</Link>
                </Button>
            ) : null}
        </section>
    );
}

export default function People({ people, filters, network }: PeoplePageProps) {
    const [searchQuery, setSearchQuery] = useState(filters.query);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const debounceTimer = useRef<number | null>(null);
    const searchInput = useRef<HTMLInputElement>(null);

    const visitSearch = useCallback(
        (query: string) => {
            setSearchError(null);
            router.get(
                peopleUrl(filters.view, query),
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                    only: ['people', 'filters'],
                    onStart: () => setIsSearching(true),
                    onFinish: () => setIsSearching(false),
                    onError: () => setSearchError('Search could not be completed. Check your connection and try again.'),
                },
            );
        },
        [filters.view],
    );

    useEffect(() => {
        const nextQuery = searchQuery.trim();

        if (nextQuery === filters.query) {
            return;
        }

        debounceTimer.current = window.setTimeout(() => visitSearch(nextQuery), 350);

        return () => {
            if (debounceTimer.current !== null) {
                window.clearTimeout(debounceTimer.current);
            }
        };
    }, [filters.query, searchQuery, visitSearch]);

    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (debounceTimer.current !== null) {
            window.clearTimeout(debounceTimer.current);
        }

        visitSearch(searchQuery.trim());
    };

    const clearSearch = () => {
        setSearchQuery('');
        searchInput.current?.focus();
    };

    const resultLabel = `${people.total} ${people.total === 1 ? 'person' : 'people'}`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="People" />
            <main id="main-content" className="mx-auto w-full max-w-[1040px] px-4 py-5 pb-28 sm:px-6 sm:py-8 md:pb-10" tabIndex={-1}>
                <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-2xl">
                        <div className="bg-primary/10 text-primary mb-4 flex size-11 items-center justify-center rounded-2xl">
                            <UsersRound className="size-6" strokeWidth={1.8} aria-hidden="true" />
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Find your people</h1>
                        <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-6 sm:text-base">
                            Discover new perspectives, search your network, and decide whose stories belong in your feed.
                        </p>
                    </div>
                    <dl className="border-border bg-card flex shrink-0 gap-5 rounded-2xl border px-5 py-4">
                        <div>
                            <dd className="text-lg font-semibold tabular-nums">{network.followers_count}</dd>
                            <dt className="text-muted-foreground text-xs">Followers</dt>
                        </div>
                        <div className="border-border border-l pl-5">
                            <dd className="text-lg font-semibold tabular-nums">{network.following_count}</dd>
                            <dt className="text-muted-foreground text-xs">Following</dt>
                        </div>
                    </dl>
                </header>

                <div className="mt-6">
                    <FlashMessage />
                </div>

                <section className="border-border bg-card mt-6 rounded-2xl border p-4 sm:p-5" aria-labelledby="people-search-label">
                    <form onSubmit={submitSearch} role="search">
                        <label id="people-search-label" htmlFor="people-search" className="text-sm font-semibold">
                            Search people
                        </label>
                        <p id="people-search-help" className="text-muted-foreground mt-1 text-sm">
                            Search by display name or username. Results update as you type.
                        </p>
                        <div className="relative mt-3">
                            <Search
                                className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2"
                                strokeWidth={1.8}
                                aria-hidden="true"
                            />
                            <Input
                                ref={searchInput}
                                id="people-search"
                                type="search"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Name or @username"
                                maxLength={80}
                                autoComplete="off"
                                aria-describedby={`people-search-help people-search-status${searchError ? ' people-search-error' : ''}`}
                                className="h-12 rounded-xl pr-12 pl-12 text-base md:text-base"
                            />
                            {isSearching ? (
                                <LoaderCircle
                                    className="text-primary pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 animate-spin motion-reduce:animate-none"
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />
                            ) : searchQuery ? (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    aria-label="Clear people search"
                                    className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-1/2 right-2 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-xl transition-colors"
                                >
                                    <X className="size-5" strokeWidth={1.8} aria-hidden="true" />
                                </button>
                            ) : null}
                        </div>
                        <p id="people-search-status" role="status" aria-live="polite" className="text-muted-foreground mt-2 text-xs">
                            {isSearching ? 'Searching people…' : resultLabel}
                        </p>
                        {searchError && (
                            <p id="people-search-error" role="alert" className="text-destructive mt-2 text-sm">
                                {searchError}
                            </p>
                        )}
                    </form>
                </section>

                <nav
                    aria-label="People views"
                    className="border-border mt-6 flex gap-1 overflow-x-auto border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    {tabs.map((tab) => {
                        const active = filters.view === tab.value;
                        const count =
                            tab.value === 'followers' ? network.followers_count : tab.value === 'following' ? network.following_count : null;

                        return (
                            <Link
                                key={tab.value}
                                href={peopleUrl(tab.value, searchQuery)}
                                preserveScroll
                                preserveState
                                only={['people', 'filters']}
                                onClick={() => {
                                    if (debounceTimer.current !== null) {
                                        window.clearTimeout(debounceTimer.current);
                                    }
                                }}
                                onStart={() => {
                                    setSearchError(null);
                                    setIsSearching(true);
                                }}
                                onFinish={() => setIsSearching(false)}
                                onError={() => setSearchError('This people view could not be loaded. Please try again.')}
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    'relative flex min-h-12 shrink-0 items-center gap-2 rounded-t-xl px-3 text-sm font-semibold transition-colors sm:px-4',
                                    active ? 'text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )}
                            >
                                {tab.label}
                                {count !== null && (
                                    <span className={cn('rounded-lg px-2 py-0.5 text-xs tabular-nums', active ? 'bg-primary/10' : 'bg-muted')}>
                                        {count}
                                    </span>
                                )}
                                {active && <span className="bg-primary absolute inset-x-3 bottom-0 h-0.5 rounded-full" aria-hidden="true" />}
                            </Link>
                        );
                    })}
                </nav>

                <section aria-label={`${tabs.find((tab) => tab.value === filters.view)?.label} people`} aria-busy={isSearching} className="mt-6">
                    {people.data.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {people.data.map((person) => (
                                <PersonCard key={person.id} person={person} />
                            ))}
                        </div>
                    ) : (
                        <EmptyPeople view={filters.view} query={filters.query} onClear={clearSearch} />
                    )}
                </section>

                {(people.prev_page_url || people.next_page_url) && (
                    <nav className="mt-8 flex items-center justify-between gap-4" aria-label="People pages">
                        {people.prev_page_url ? (
                            <Button asChild variant="outline" className="min-h-11 rounded-xl">
                                <Link href={people.prev_page_url} preserveScroll preserveState>
                                    Previous
                                </Link>
                            </Button>
                        ) : (
                            <Button variant="outline" disabled className="min-h-11 rounded-xl">
                                Previous
                            </Button>
                        )}
                        <p className="text-muted-foreground text-xs tabular-nums">
                            Page {people.current_page} of {people.last_page}
                        </p>
                        {people.next_page_url ? (
                            <Button asChild variant="outline" className="min-h-11 rounded-xl">
                                <Link href={people.next_page_url} preserveScroll preserveState>
                                    Next
                                </Link>
                            </Button>
                        ) : (
                            <Button variant="outline" disabled className="min-h-11 rounded-xl">
                                Next
                            </Button>
                        )}
                    </nav>
                )}
            </main>
        </AppLayout>
    );
}
