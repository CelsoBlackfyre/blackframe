import { FlashMessage } from '@/components/flash-message';
import { PageHeading } from '@/components/page-heading';
import { Pagination } from '@/components/pagination';
import { CreatorSuggestions } from '@/components/social/creator-suggestions';
import { FeedActivationPanel } from '@/components/social/feed-activation-panel';
import { FeedComposer } from '@/components/social/feed-composer';
import { FeedContextRail } from '@/components/social/feed-context-rail';
import { FeedTabs } from '@/components/social/feed-tabs';
import { PostCard } from '@/components/social/post-card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/lib/i18n';
import { BreadcrumbItem } from '@/types';
import { CreatorSuggestion, FeedActivation, FeedPost, FeedShelfEntry, Paginated } from '@/types/feed';
import { Head, Link } from '@inertiajs/react';
import { Images, SquarePen, UsersRound } from 'lucide-react';

interface FeedPageProps {
    posts: Paginated<FeedPost>;
    suggestions: CreatorSuggestion[];
    current_shelf: FeedShelfEntry[];
    activation: FeedActivation;
}

export default function Feed({ posts, suggestions, current_shelf: currentShelf, activation }: FeedPageProps) {
    const { t } = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [{ title: t('Home'), href: route('feed') }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Home feed')} />
            <div className="mx-auto grid w-full max-w-[1100px] grid-cols-1 gap-8 px-4 py-5 pb-28 sm:px-6 sm:py-8 md:pb-10 xl:grid-cols-[minmax(0,640px)_280px] xl:gap-8">
                <main id="main-content" className="min-w-0 space-y-5" tabIndex={-1}>
                    <PageHeading title={t('Your daily frame.')} description={t('A little inspiration from the people you follow.')} />
                    <FlashMessage />
                    <FeedComposer />
                    <FeedTabs active="home" />

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
                            <h2 className="mt-5 text-xl font-semibold">{t('Your circle starts here.')}</h2>
                            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">
                                {t('Find a few people you connect with. Their photos will make this place your own.')}
                            </p>
                            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                                <Button asChild className="min-h-11 rounded-xl px-5">
                                    <Link href={route('people.index')}>
                                        <UsersRound aria-hidden="true" />
                                        {t('Discover people')}
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="min-h-11 rounded-xl px-5">
                                    <Link href={route('posts.create')}>
                                        <SquarePen aria-hidden="true" />
                                        {t('Create a post')}
                                    </Link>
                                </Button>
                            </div>
                        </section>
                    )}

                    <Pagination
                        resource={posts}
                        previousLabel={t('Newer posts')}
                        nextLabel={t('Older posts')}
                        ariaLabel={t('Feed pages')}
                        className="pt-2"
                    />
                </main>

                <FeedContextRail suggestions={suggestions} currentShelf={currentShelf} />
            </div>
        </AppLayout>
    );
}
