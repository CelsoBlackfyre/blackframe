import { FlashMessage } from '@/components/flash-message';
import { PageHeading } from '@/components/page-heading';
import { Pagination } from '@/components/pagination';
import { FeedComposer } from '@/components/social/feed-composer';
import { FeedTabs } from '@/components/social/feed-tabs';
import { PulsePostCard } from '@/components/social/pulse-post-card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { PulsePosts } from '@/types/pulse';
import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, LibraryBig, MessageCircleMore } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Pulse', href: route('pulse') }];

export default function Pulse({ posts }: { posts: PulsePosts }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pulse" />
            <div className="mx-auto grid w-full max-w-[1100px] grid-cols-1 gap-8 px-4 py-5 pb-28 sm:px-6 sm:py-8 md:pb-10 xl:grid-cols-[minmax(0,640px)_280px] xl:gap-8">
                <main id="main-content" className="min-w-0 space-y-5" tabIndex={-1}>
                    <PageHeading title="Small thoughts. Big conversations." description="What’s on your mind, and what’s on theirs." />
                    <FlashMessage />
                    <FeedComposer format="text" />
                    <FeedTabs active="pulse" />

                    {posts.data.length > 0 ? (
                        <div className="space-y-4">
                            {posts.data.map((post) => (
                                <PulsePostCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <section className="border-border bg-card rounded-2xl border border-dashed px-6 py-16 text-center">
                            <MessageCircleMore className="text-primary mx-auto size-8" strokeWidth={1.7} aria-hidden="true" />
                            <h2 className="mt-4 text-lg font-semibold">Start the conversation</h2>
                            <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm leading-6">
                                Share the first short update in your network or follow more people from Home.
                            </p>
                            <Button asChild className="mt-5 min-h-11 rounded-xl">
                                <Link href={route('posts.create', { type: 'text' })}>Create</Link>
                            </Button>
                        </section>
                    )}

                    <Pagination resource={posts} ariaLabel="Pulse pages" className="pt-2" />
                </main>

                <aside className="sticky top-24 hidden self-start xl:block" aria-labelledby="pulse-about-heading">
                    <div className="border-border bg-card rounded-2xl border p-5">
                        <MessageCircleMore className="text-primary size-6" strokeWidth={1.8} aria-hidden="true" />
                        <h2 id="pulse-about-heading" className="mt-4 font-semibold">
                            Something worth talking about.
                        </h2>
                        <p className="text-muted-foreground mt-2 text-sm leading-6">
                            A book you finished. A film that surprised you. Share a thought and see where the conversation goes.
                        </p>
                    </div>
                    <Link
                        href={route('shelf.index')}
                        className="hover:bg-accent mt-5 flex items-center gap-3 rounded-xl p-3 text-sm font-medium transition-colors"
                    >
                        <LibraryBig className="text-primary size-5" aria-hidden="true" />
                        Find inspiration on your shelf
                        <ArrowUpRight className="ml-auto size-4 shrink-0" aria-hidden="true" />
                    </Link>
                </aside>
            </div>
        </AppLayout>
    );
}
