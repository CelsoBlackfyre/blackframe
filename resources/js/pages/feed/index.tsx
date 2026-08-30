import { FlashMessage } from '@/components/flash-message';
import { CreatorSuggestions } from '@/components/social/creator-suggestions';
import { PostCard } from '@/components/social/post-card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { CreatorSuggestion, FeedPost, Paginated } from '@/types/feed';
import { Head, Link } from '@inertiajs/react';
import { Images } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Home', href: '/feed' }];

interface FeedPageProps {
    posts: Paginated<FeedPost>;
    suggestions: CreatorSuggestion[];
}

export default function Feed({ posts, suggestions }: FeedPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home feed" />
            <div className="mx-auto grid w-full max-w-[1080px] grid-cols-1 gap-8 px-4 py-5 pb-28 sm:px-6 sm:py-8 md:pb-10 xl:grid-cols-[minmax(0,640px)_300px] xl:gap-10">
                <main id="main-content" className="min-w-0 space-y-5" tabIndex={-1}>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">Your feed</h1>
                        <p className="text-muted-foreground text-sm">Recent posts from people you follow.</p>
                    </div>

                    <FlashMessage />

                    <CreatorSuggestions suggestions={suggestions} compact />

                    {posts.data.length > 0 ? (
                        <div className="space-y-6">
                            {posts.data.map((post, index) => (
                                <PostCard key={post.id} post={post} eager={index === 0} />
                            ))}
                        </div>
                    ) : (
                        <section className="border-border bg-card rounded-2xl border border-dashed px-6 py-16 text-center">
                            <Images className="text-primary mx-auto size-8" strokeWidth={1.7} aria-hidden="true" />
                            <h2 className="mt-4 text-lg font-semibold">Your feed is ready for new voices</h2>
                            <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm leading-6">
                                Follow a suggested creator and their latest published posts will appear here.
                            </p>
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

                <CreatorSuggestions suggestions={suggestions} />
            </div>
        </AppLayout>
    );
}
