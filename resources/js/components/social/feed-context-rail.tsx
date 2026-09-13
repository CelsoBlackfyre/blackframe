import { Button } from '@/components/ui/button';
import { SharedData } from '@/types';
import { CreatorSuggestion, FeedShelfEntry } from '@/types/feed';
import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, BookOpen, HeartHandshake, LibraryBig } from 'lucide-react';
import { SocialAvatar } from './avatar';
import { CreatorSuggestions } from './creator-suggestions';

export function FeedContextRail({ suggestions, currentShelf }: { suggestions: CreatorSuggestion[]; currentShelf: FeedShelfEntry[] }) {
    const { auth } = usePage<SharedData>().props;
    return (
        <aside className="sticky top-24 hidden space-y-7 self-start xl:block" aria-label="Your BlackFrame context">
            <div className="flex items-center gap-3 py-2">
                <SocialAvatar name={auth.user.name} src={auth.user.avatar_url} className="size-12" />
                <div className="min-w-0 flex-1">
                    <Link href={route('profiles.show', auth.user.username)} className="hover:text-primary truncate text-sm font-semibold">
                        {auth.user.name}
                    </Link>
                    <p className="text-muted-foreground mt-0.5 text-xs">@{auth.user.username}</p>
                </div>
                <Link
                    href={route('profile.edit')}
                    aria-label="Edit your profile"
                    className="text-muted-foreground hover:text-primary flex size-11 items-center justify-center rounded-xl"
                >
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
            </div>
            <section className="border-border border-y py-6" aria-labelledby="current-culture-heading">
                <div className="flex items-center justify-between gap-3">
                    <h2 id="current-culture-heading" className="text-base font-semibold">
                        On your radar
                    </h2>
                    <BookOpen className="text-primary size-4" strokeWidth={1.8} aria-hidden="true" />
                </div>
                <p className="text-muted-foreground mt-1 text-xs">A few worlds you’re in right now.</p>
                {currentShelf.length > 0 ? (
                    <div className="mt-5 space-y-4">
                        {currentShelf.map((entry) => (
                            <Link href={route('shelf.index')} key={entry.id} className="group flex min-w-0 items-center gap-3 rounded-lg">
                                {entry.subject.image_url ? (
                                    <img
                                        src={entry.subject.image_url}
                                        alt=""
                                        width="48"
                                        height="64"
                                        loading="lazy"
                                        className="h-16 w-12 shrink-0 rounded-md object-cover"
                                    />
                                ) : (
                                    <span className="bg-muted text-muted-foreground flex h-16 w-12 shrink-0 items-center justify-center rounded-md">
                                        <LibraryBig className="size-5" aria-hidden="true" />
                                    </span>
                                )}
                                <div className="min-w-0">
                                    <p className="group-hover:text-primary text-sm font-medium">{entry.subject.name}</p>
                                    <p className="text-muted-foreground mt-1 text-xs leading-5">
                                        {entry.status_label}
                                        {entry.progress ? ` · ${entry.progress}` : ''}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground mt-4 text-sm leading-6">
                        What are you reading, watching, or playing? Give it a home on your shelf.
                    </p>
                )}
                <Button asChild variant="ghost" className="mt-4 w-full justify-between px-0 hover:bg-transparent">
                    <Link href={route('shelf.index')}>
                        Open Geek Shelf
                        <ArrowUpRight aria-hidden="true" />
                    </Link>
                </Button>
            </section>
            <CreatorSuggestions suggestions={suggestions} />
            <Link href={route('matches.index')} className="bg-accent group block rounded-2xl p-5">
                <HeartHandshake className="text-primary size-6" strokeWidth={1.6} aria-hidden="true" />
                <h2 className="mt-4 font-semibold">A favorite in common.</h2>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                    See who shares your taste. Your next connection could start with a single title.
                </p>
                <span className="text-primary mt-4 flex items-center justify-between text-sm font-semibold">
                    Explore your matches
                    <ArrowUpRight
                        className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none"
                        aria-hidden="true"
                    />
                </span>
            </Link>
            <p className="text-muted-foreground text-xs leading-5">
                BlackFrame
                <br />A little more you.
            </p>
        </aside>
    );
}
