import { FlashMessage } from '@/components/flash-message';
import { SocialAvatar } from '@/components/social/avatar';
import { PulsePostCard } from '@/components/social/pulse-post-card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { PulsePosts } from '@/types/pulse';
import { Head, Link, usePage } from '@inertiajs/react';
import { MessageCircleMore, SquarePen } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Pulse', href: '/pulse' }];

export default function Pulse({ posts }: { posts: PulsePosts }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pulse" />
            <div className="mx-auto grid w-full max-w-[1000px] grid-cols-1 gap-8 px-4 py-5 pb-28 sm:px-6 sm:py-8 md:pb-10 lg:grid-cols-[minmax(0,640px)_280px] lg:gap-10">
                <main id="main-content" className="min-w-0 space-y-5" tabIndex={-1}>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">Pulse</h1>
                        <p className="text-muted-foreground text-sm">Short updates and conversations from people you follow.</p>
                    </div>

                    <FlashMessage />

                    <section className="border-border bg-card flex items-center gap-3 rounded-2xl border p-4" aria-label="Create a Pulse post">
                        <SocialAvatar name={auth.user.name} src={auth.user.avatar_url} />
                        <p className="text-muted-foreground min-w-0 flex-1 truncate text-sm">What is on your mind, {auth.user.name.split(' ')[0]}?</p>
                        <Button asChild className="min-h-11 cursor-pointer rounded-xl px-4">
                            <Link href={route('posts.create')}>
                                <SquarePen className="size-4" strokeWidth={1.8} aria-hidden="true" />
                                Create
                            </Link>
                        </Button>
                    </section>

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
                                <Link href={route('posts.create')}>Create</Link>
                            </Button>
                        </section>
                    )}

                    {(posts.prev_page_url || posts.next_page_url) && (
                        <nav className="flex items-center justify-between gap-3 pt-2" aria-label="Pulse pages">
                            {posts.prev_page_url ? (
                                <Button asChild variant="outline" className="min-h-11 rounded-xl">
                                    <Link href={posts.prev_page_url} preserveScroll>
                                        Newer
                                    </Link>
                                </Button>
                            ) : (
                                <Button variant="outline" disabled className="min-h-11 rounded-xl">
                                    Newer
                                </Button>
                            )}
                            <p className="text-muted-foreground text-xs tabular-nums">
                                {posts.current_page} / {posts.last_page}
                            </p>
                            {posts.next_page_url ? (
                                <Button asChild variant="outline" className="min-h-11 rounded-xl">
                                    <Link href={posts.next_page_url} preserveScroll>
                                        Older
                                    </Link>
                                </Button>
                            ) : (
                                <Button variant="outline" disabled className="min-h-11 rounded-xl">
                                    Older
                                </Button>
                            )}
                        </nav>
                    )}
                </main>

                <aside className="sticky top-24 hidden self-start lg:block" aria-labelledby="pulse-about-heading">
                    <div className="border-border bg-card rounded-2xl border p-5">
                        <MessageCircleMore className="text-primary size-6" strokeWidth={1.8} aria-hidden="true" />
                        <h2 id="pulse-about-heading" className="mt-4 font-semibold">
                            One graph, another view
                        </h2>
                        <p className="text-muted-foreground mt-2 text-sm leading-6">
                            Pulse uses the same identity, follows, likes, and moderation foundation as your visual Home feed.
                        </p>
                    </div>
                </aside>
            </div>
        </AppLayout>
    );
}
