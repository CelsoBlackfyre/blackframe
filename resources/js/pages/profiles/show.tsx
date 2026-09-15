import { EmptyState } from '@/components/empty-state';
import { FlashMessage } from '@/components/flash-message';
import { Pagination } from '@/components/pagination';
import { SocialAvatar } from '@/components/social/avatar';
import { FollowButton } from '@/components/social/follow-button';
import { PostCard } from '@/components/social/post-card';
import { PulsePostCard } from '@/components/social/pulse-post-card';
import { SubjectBadge } from '@/components/subjects/subject-badge';
import { SubjectGroupSection } from '@/components/subjects/subject-group-section';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { groupBySubjectGroup, sortBySubjectGroup, subjectGroupFor } from '@/lib/subject-groups';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { ProfileConnectionList, ProfilePageProps, ProfileShelfEntry, ProfileView } from '@/types/profiles';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    CalendarDays,
    Check,
    ExternalLink,
    Heart,
    LibraryBig,
    LoaderCircle,
    LockKeyhole,
    MessageCircleMore,
    Pencil,
    Sparkles,
    X,
} from 'lucide-react';

const tabs: Array<{ value: ProfileView; label: string }> = [
    { value: 'posts', label: 'Posts' },
    { value: 'pulse', label: 'Pulse' },
    { value: 'shelf', label: 'Shelf' },
    { value: 'about', label: 'About' },
];

function profileUrl(username: string, tab: ProfileView): string {
    return route('profiles.show', { user: username, ...(tab === 'posts' ? {} : { tab }) });
}

function connectionsUrl(username: string, list: ProfileConnectionList): string {
    return route('profiles.connections', { user: username, list });
}

function StatLink({ href, count, label }: { href: string; count: number; label: string }) {
    return (
        <Link
            href={href}
            className="group focus-visible:ring-ring focus-visible:ring-offset-background -my-1 flex flex-col rounded-lg py-1 pr-1 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
        >
            <span className="group-hover:text-primary group-focus-visible:text-primary text-lg font-semibold tabular-nums transition-colors">
                {count}
            </span>
            <span className="text-muted-foreground group-hover:text-foreground group-focus-visible:text-foreground text-xs transition-colors">
                {label}
            </span>
        </Link>
    );
}

function FollowProfileButton({ profile }: Pick<ProfilePageProps, 'profile'>) {
    const form = useForm({});

    if (profile.incoming_follow_request) {
        return (
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    onClick={() => form.patch(route('people.follow-requests.accept', profile.id), { preserveScroll: true })}
                    disabled={form.processing}
                    className="min-h-11 cursor-pointer rounded-xl px-4"
                >
                    {form.processing ? (
                        <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    ) : (
                        <Check aria-hidden="true" />
                    )}
                    Accept
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.delete(route('people.follow-requests.decline', profile.id), { preserveScroll: true })}
                    disabled={form.processing}
                    className="min-h-11 cursor-pointer rounded-xl px-4"
                >
                    <X aria-hidden="true" />
                    Decline
                </Button>
            </div>
        );
    }

    return (
        <FollowButton
            id={profile.id}
            name={profile.name}
            is_following={profile.is_following}
            follow_request_pending={profile.follow_request_pending}
            is_private={profile.is_private}
            only={['profile', 'posts', 'pulse', 'shelf', 'flash']}
            className="px-5"
        />
    );
}

function ShelfCard({ entry }: { entry: ProfileShelfEntry }) {
    const GroupIcon = subjectGroupFor(entry.subject.type).icon;

    return (
        <article className="border-border bg-card group overflow-hidden rounded-2xl border">
            <div className="bg-muted aspect-[4/3] overflow-hidden">
                {entry.subject.image_url ? (
                    <img
                        src={entry.subject.image_url}
                        alt=""
                        width="640"
                        height="480"
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
                    />
                ) : (
                    <div className="text-muted-foreground flex h-full items-center justify-center">
                        <LibraryBig className="size-8" strokeWidth={1.5} aria-hidden="true" />
                    </div>
                )}
            </div>
            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
                            <GroupIcon className="size-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                            {entry.subject.type_label}
                        </p>
                        <h3 className="mt-1 line-clamp-2 font-semibold">{entry.subject.name}</h3>
                    </div>
                    {entry.favorite && <Heart className="text-primary mt-0.5 size-4 shrink-0 fill-current" aria-label="Favorite" />}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="bg-primary/10 text-primary rounded-lg px-2.5 py-1 text-xs font-semibold">{entry.status_label}</span>
                    {entry.rating !== null && <span className="text-muted-foreground text-xs font-semibold">{entry.rating}/10</span>}
                </div>
                {entry.progress && <p className="text-muted-foreground mt-3 line-clamp-2 text-sm">{entry.progress}</p>}
            </div>
        </article>
    );
}

export default function ShowProfile({ profile, filters, posts, pulse, shelf }: ProfilePageProps) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: `@${profile.username}`, href: profileUrl(profile.username, 'posts') }];
    const tabCount = (tab: ProfileView): number | null => {
        if (tab === 'posts') return profile.counts.visual_posts;
        if (tab === 'pulse') return profile.counts.pulse_posts;
        if (tab === 'shelf') return profile.counts.shelf;
        return null;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${profile.name} (@${profile.username})`}>
                <meta name="description" content={profile.bio ?? `See ${profile.name}'s posts and culture on BlackFrame.`} />
            </Head>

            <main id="main-content" className="mx-auto w-full max-w-[1200px] px-4 py-5 pb-28 sm:px-6 sm:py-8 md:pb-10" tabIndex={-1}>
                <FlashMessage />

                <section className="border-border bg-card overflow-hidden rounded-2xl border">
                    <div className="bg-accent relative h-28 border-b sm:h-36">
                        {profile.banner_url ? (
                            <img src={profile.banner_url} alt={`${profile.name}'s profile banner`} className="h-full w-full object-cover" />
                        ) : (
                            <div aria-hidden="true" />
                        )}
                    </div>
                    <div className="px-5 pb-6 sm:px-8 sm:pb-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                            <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-end sm:gap-5">
                                <SocialAvatar
                                    name={profile.name}
                                    src={profile.avatar_url}
                                    className="border-card -mt-12 size-24 border-4 text-2xl shadow-sm sm:-mt-14 sm:size-28"
                                />
                                <div className="min-w-0 pb-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="line-clamp-2 text-2xl leading-tight font-semibold tracking-[-0.03em] sm:text-4xl">
                                            {profile.name}
                                        </h1>
                                        {profile.is_private && <LockKeyhole className="text-muted-foreground size-4" aria-label="Private profile" />}
                                    </div>
                                    <p className="text-muted-foreground mt-0.5 truncate text-sm sm:text-base">@{profile.username}</p>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2 sm:pb-1">
                                {profile.follows_you && !profile.is_self && (
                                    <span className="bg-muted text-muted-foreground rounded-lg px-2.5 py-1.5 text-xs font-semibold">Follows you</span>
                                )}
                                {profile.is_self ? (
                                    <Button asChild variant="outline" className="min-h-11 rounded-xl px-5">
                                        <Link href={route('profile.edit')}>
                                            <Pencil aria-hidden="true" />
                                            Edit profile
                                        </Link>
                                    </Button>
                                ) : (
                                    <FollowProfileButton profile={profile} />
                                )}
                            </div>
                        </div>

                        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                            <div className="min-w-0">
                                {profile.bio && <p className="max-w-2xl text-[15px] leading-6">{profile.bio}</p>}
                                <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                    <span className="inline-flex items-center gap-1.5">
                                        <CalendarDays className="size-4" strokeWidth={1.8} aria-hidden="true" />
                                        Joined {profile.joined_at}
                                    </span>
                                    {profile.website && (
                                        <a
                                            href={profile.website}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-primary inline-flex min-h-11 items-center gap-1.5 font-semibold hover:underline"
                                        >
                                            {profile.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                            <ExternalLink className="size-3.5" aria-hidden="true" />
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm sm:gap-x-8">
                                <StatLink href={profileUrl(profile.username, 'posts')} count={profile.counts.posts} label="Posts" />
                                <StatLink href={connectionsUrl(profile.username, 'followers')} count={profile.counts.followers} label="Followers" />
                                <StatLink href={connectionsUrl(profile.username, 'following')} count={profile.counts.following} label="Following" />
                                <StatLink href={profileUrl(profile.username, 'shelf')} count={profile.counts.shelf} label="On shelf" />
                            </div>
                        </div>

                        {profile.can_view_content && (profile.current_activity || profile.shared_subjects.length > 0) && (
                            <div className="border-border mt-6 grid gap-4 border-t pt-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                                {profile.current_activity && (
                                    <div className="bg-muted/55 flex items-center gap-3 rounded-2xl p-3.5">
                                        {profile.current_activity.subject.image_url ? (
                                            <img
                                                src={profile.current_activity.subject.image_url}
                                                alt=""
                                                className="size-12 shrink-0 rounded-xl object-cover"
                                            />
                                        ) : (
                                            <span className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-xl">
                                                <LibraryBig className="size-5" aria-hidden="true" />
                                            </span>
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-muted-foreground text-xs font-semibold">Now</p>
                                            <p className="truncate text-sm font-semibold">
                                                {profile.current_activity.label} {profile.current_activity.subject.name}
                                            </p>
                                            {profile.current_activity.progress && (
                                                <p className="text-muted-foreground truncate text-xs">{profile.current_activity.progress}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {profile.shared_subjects.length > 0 && (
                                    <div className="min-w-0">
                                        <p className="text-muted-foreground mb-2 text-xs font-semibold">
                                            {profile.is_self ? 'Your culture' : 'Culture you share'}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {sortBySubjectGroup(profile.shared_subjects, (subject) => subject.type).map((subject) => (
                                                <SubjectBadge key={subject.id} subject={subject} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                <nav
                    aria-label="Profile views"
                    className="border-border mt-7 flex gap-1 overflow-x-auto border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    {tabs.map((tab) => {
                        const active = filters.tab === tab.value;
                        const count = tabCount(tab.value);

                        return (
                            <Link
                                key={tab.value}
                                href={profileUrl(profile.username, tab.value)}
                                preserveScroll
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
                                {active && <span className="bg-primary absolute inset-x-4 bottom-0 h-0.5 rounded-full" aria-hidden="true" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-7">
                    {!profile.can_view_content ? (
                        <EmptyState icon={LockKeyhole} title="This profile is private">
                            Send {profile.name.split(' ')[0]} a follow request to see their posts, Pulse updates, and Geek Shelf after approval.
                        </EmptyState>
                    ) : filters.tab === 'posts' && posts ? (
                        posts.data.length > 0 ? (
                            <>
                                <section className="grid gap-6 xl:grid-cols-2" aria-label={`${profile.name}'s visual posts`}>
                                    {posts.data.map((post, index) => (
                                        <PostCard key={post.id} post={post} eager={index === 0} />
                                    ))}
                                </section>
                                <Pagination resource={posts} ariaLabel="Profile content pages" />
                            </>
                        ) : (
                            <EmptyState
                                icon={Sparkles}
                                title={profile.is_self ? 'Your visual story starts here' : 'No visual posts yet'}
                                action={
                                    profile.is_self ? (
                                        <Button asChild className="min-h-11 rounded-xl">
                                            <Link href={route('posts.create')}>Create a post</Link>
                                        </Button>
                                    ) : undefined
                                }
                            >
                                {profile.is_self
                                    ? 'Share an image connected to the culture you care about.'
                                    : `${profile.name} has not published a visual post yet.`}
                            </EmptyState>
                        )
                    ) : filters.tab === 'pulse' && pulse ? (
                        pulse.data.length > 0 ? (
                            <>
                                <section className="mx-auto max-w-[780px] space-y-4" aria-label={`${profile.name}'s Pulse posts`}>
                                    {pulse.data.map((post) => (
                                        <PulsePostCard key={post.id} post={post} />
                                    ))}
                                </section>
                                <Pagination resource={pulse} ariaLabel="Profile content pages" />
                            </>
                        ) : (
                            <EmptyState icon={MessageCircleMore} title={profile.is_self ? 'Say what is on your mind' : 'No Pulse posts yet'}>
                                Short thoughts, questions, and recommendations will appear here.
                            </EmptyState>
                        )
                    ) : filters.tab === 'shelf' && shelf ? (
                        shelf.data.length > 0 ? (
                            <>
                                <div className="space-y-8" role="region" aria-label={`${profile.name}'s Geek Shelf`}>
                                    {groupBySubjectGroup(shelf.data, (entry) => entry.subject.type).map(({ group, items }) => (
                                        <SubjectGroupSection key={group.id} group={group} count={items.length} headingLevel="h2">
                                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                                {items.map((entry) => (
                                                    <ShelfCard key={entry.id} entry={entry} />
                                                ))}
                                            </div>
                                        </SubjectGroupSection>
                                    ))}
                                </div>
                                <Pagination resource={shelf} ariaLabel="Profile content pages" />
                            </>
                        ) : (
                            <EmptyState
                                icon={LibraryBig}
                                title={profile.is_self ? 'Build your culture shelf' : 'This shelf is waiting'}
                                action={
                                    profile.is_self ? (
                                        <Button asChild className="min-h-11 rounded-xl">
                                            <Link href={route('shelf.index')}>Open Geek Shelf</Link>
                                        </Button>
                                    ) : undefined
                                }
                            >
                                Books, games, films, series, and fandoms added to the Geek Shelf will shape this profile.
                            </EmptyState>
                        )
                    ) : (
                        <section className="border-border bg-card grid gap-6 rounded-[1.5rem] border p-6 sm:p-8 lg:grid-cols-2">
                            <div>
                                <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">About</p>
                                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">{profile.name}</h2>
                                <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-6">
                                    {profile.bio ?? `${profile.name} has not added a bio yet.`}
                                </p>
                            </div>
                            <dl className="bg-muted/55 grid grid-cols-2 gap-4 rounded-2xl p-5">
                                <div>
                                    <dt className="text-muted-foreground text-xs">Member since</dt>
                                    <dd className="mt-1 font-semibold">{profile.joined_at}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground text-xs">Culture titles</dt>
                                    <dd className="mt-1 font-semibold tabular-nums">{profile.counts.shelf}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground text-xs">Visual posts</dt>
                                    <dd className="mt-1 font-semibold tabular-nums">{profile.counts.visual_posts}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground text-xs">Pulse posts</dt>
                                    <dd className="mt-1 font-semibold tabular-nums">{profile.counts.pulse_posts}</dd>
                                </div>
                            </dl>
                        </section>
                    )}
                </div>
            </main>
        </AppLayout>
    );
}
