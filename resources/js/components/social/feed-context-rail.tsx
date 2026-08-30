import { Button } from '@/components/ui/button';
import { CreatorSuggestion, FeedShelfEntry } from '@/types/feed';
import { Link } from '@inertiajs/react';
import { ArrowUpRight, LibraryBig } from 'lucide-react';
import { CreatorSuggestions } from './creator-suggestions';

export function FeedContextRail({ suggestions, currentShelf }: { suggestions: CreatorSuggestion[]; currentShelf: FeedShelfEntry[] }) {
    return (
        <aside className="sticky top-24 hidden space-y-5 self-start xl:block" aria-label="Your BlackFrame context">
            <section className="border-border bg-card rounded-2xl border p-5" aria-labelledby="current-culture-heading">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-primary text-xs font-semibold tracking-[0.13em] uppercase">Your culture</p>
                        <h2 id="current-culture-heading" className="mt-2 text-base font-semibold">
                            In progress now
                        </h2>
                    </div>
                    <LibraryBig className="text-primary size-5" strokeWidth={1.8} aria-hidden="true" />
                </div>

                {currentShelf.length > 0 ? (
                    <div className="mt-4 space-y-3">
                        {currentShelf.map((entry) => (
                            <div key={entry.id} className="flex min-w-0 items-center gap-3">
                                {entry.subject.image_url ? (
                                    <img src={entry.subject.image_url} alt="" loading="lazy" className="size-11 shrink-0 rounded-xl object-cover" />
                                ) : (
                                    <span className="bg-muted text-muted-foreground flex size-11 shrink-0 items-center justify-center rounded-xl">
                                        <LibraryBig className="size-4" aria-hidden="true" />
                                    </span>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold">{entry.subject.name}</p>
                                    <p className="text-muted-foreground truncate text-xs">
                                        {entry.status_label}
                                        {entry.progress ? ` · ${entry.progress}` : ''}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground mt-4 text-sm leading-6">Add what you are playing, watching, or reading to shape Home.</p>
                )}

                <Button asChild variant="ghost" className="mt-4 min-h-11 w-full justify-between rounded-xl px-3">
                    <Link href={route('shelf.index')}>
                        Open Geek Shelf
                        <ArrowUpRight aria-hidden="true" />
                    </Link>
                </Button>
            </section>

            <CreatorSuggestions suggestions={suggestions} />
        </aside>
    );
}
