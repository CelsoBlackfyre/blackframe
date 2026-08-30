import { FlashMessage } from '@/components/flash-message';
import { SocialAvatar } from '@/components/social/avatar';
import { CreatorSuggestions } from '@/components/social/creator-suggestions';
import { FeedActivationPanel } from '@/components/social/feed-activation-panel';
import { FeedContextRail } from '@/components/social/feed-context-rail';
import { PostCard } from '@/components/social/post-card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { CreatorSuggestion, FeedActivation, FeedPost, FeedShelfEntry, Paginated } from '@/types/feed';
import { Head, Link, usePage } from '@inertiajs/react';
import { ImagePlus, Images, SquarePen, UsersRound } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Home', href: '/feed' }];

interface FeedPageProps {
    posts: Paginated<FeedPost>;
    suggestions: CreatorSuggestion[];
    current_shelf: FeedShelfEntry[];
    activation: FeedActivation;
}

export default function Feed({ posts, suggestions, current_shelf: currentShelf, activation }: FeedPageProps) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home feed" />
            <div className="mx-auto grid w-full max-w-[1220px] grid-cols-1 gap-8 px-4 py-5 pb-28 sm:px-6 sm:py-8 md:pb-10 xl:grid-cols-[minmax(0,780px)_320px] xl:gap-10">
                <main id="main-content" className="min-w-0 space-y-5" tabIndex={-1}>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Home</h1>
                        <p className="text-muted-foreground text-sm sm:text-base">People you follow, shaped by the culture you keep.</p>
                    </div>

                    <FlashMessage />

                    <section className="border-border bg-card flex items-center gap-3 rounded-2xl border p-3.5 sm:p-4" aria-label="Create a post">
                        <Link href={route('profiles.show', auth.user.username)} className="shrink-0 rounded-full">
                            <SocialAvatar name={auth.user.name} src={auth.user.avatar_url} />
                        </Link>
                        <Link
                            href={route('posts.create')}
                            className="bg-muted text-muted-foreground hover:bg-secondary min-w-0 flex-1 rounded-xl px-4 py-3 text-sm transition-colors"
                        >
                            Share what is moving you, {auth.user.name.split(' ')[0]}…
                        </Link>
                        <div className="hidden items-center gap-1 sm:flex">
                            <Button asChild variant="ghost" className="min-h-11 rounded-xl px-3">
                                <Link href={route('posts.create')}>
                                    <ImagePlus className="size-4" aria-hidden="true" />
                                    Photo
                                </Link>
                            </Button>
                            <Button asChild variant="ghost" className="min-h-11 rounded-xl px-3">
                                <Link href={route('posts.create')}>
                                    <SquarePen className="size-4" aria-hidden="true" />
                                    Text
                                </Link>
                            </Button>
                        </div>
                    </section>

                    <FeedActivationPanel activation={activation} />

                    <CreatorSuggestions suggestions={suggestions} compact />

                    {posts.data.length > 0 ? (
                        <div className="space-y-6">
                            {posts.data.map((post, index) => (
                                <PostCard key={post.id} post={post} eager={index === 0} />
                            ))}
                        </div>
                    ) : (
                        <section className="border-border bg-card rounded-[1.5rem] border border-dashed px-6 py-14 text-center">
                            <Images className="text-primary mx-auto size-9" strokeWidth={1.7} aria-hidden="true" />
                            <h2 className="mt-5 text-xl font-semibold">Your Home is gathering its first stories</h2>
                            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">
                                Follow people who share your culture, or publish the first visual post in your network.
                            </p>
                            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                                <Button asChild className="min-h-11 rounded-xl px-5">
                                    <Link href={route('people.index')}>
                                        <UsersRound aria-hidden="true" />
                                        Discover people
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="min-h-11 rounded-xl px-5">
                                    <Link href={route('posts.create')}>
                                        <SquarePen aria-hidden="true" />
                                        Create a post
                                    </Link>
                                </Button>
                            </div>
                        </section>
                    )}

                    {(posts.prev_page_url || posts.next_page_url) && (
                        <nav className="flex items-center justify-between gap-4 pt-2" aria-label="Feed pages">
                            {posts.prev_page_url ? (
                                <Button asChild variant="outline" className="min-h-11 rounded-xl">
                                    <Link href={posts.prev_page_url} preserveScroll>
                                        Newer posts
                                    </Link>
                                </Button>
                            ) : (
                                <Button variant="outline" disabled className="min-h-11 rounded-xl">
                                    Newer posts
                                </Button>
                            )}
                            <p className="text-muted-foreground text-xs">
                                Page {posts.current_page} of {posts.last_page}
                            </p>
                            {posts.next_page_url ? (
                                <Button asChild variant="outline" className="min-h-11 rounded-xl">
                                    <Link href={posts.next_page_url} preserveScroll>
                                        Older posts
                                    </Link>
                                </Button>
                            ) : (
                                <Button variant="outline" disabled className="min-h-11 rounded-xl">
                                    Older posts
                                </Button>
                            )}
                        </nav>
                    )}
                </main>

                <FeedContextRail suggestions={suggestions} currentShelf={currentShelf} />
            </div>
        </AppLayout>
    );
}
