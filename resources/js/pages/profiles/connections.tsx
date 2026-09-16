import { EmptyState } from '@/components/empty-state';
import { FlashMessage } from '@/components/flash-message';
import { Pagination } from '@/components/pagination';
import { SocialAvatar } from '@/components/social/avatar';
import { FollowButton } from '@/components/social/follow-button';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { ConnectionSummary, ConnectionsPageProps, ProfileConnectionList } from '@/types/profiles';
import { Head, Link } from '@inertiajs/react';
import { LockKeyhole, UserPlus, UsersRound } from 'lucide-react';

function listUrl(username: string, list: ProfileConnectionList): string {
    return route('profiles.connections', { user: username, list });
}

function ConnectionRow({ connection }: { connection: ConnectionSummary }) {
    const { t } = useTranslation();
    const profileHref = route('profiles.show', connection.username);

    return (
        <article className="border-border bg-card flex items-center gap-3 rounded-2xl border p-3.5 sm:p-4">
            <Link href={profileHref} aria-label={t("View {name}'s profile", { name: connection.name })} className="shrink-0 rounded-full">
                <SocialAvatar name={connection.name} src={connection.avatar_url} className="size-12" />
            </Link>
            <div className="min-w-0 flex-1">
                <Link href={profileHref} className="group/name block rounded-lg">
                    <p className="group-hover/name:text-primary truncate text-sm font-semibold sm:text-base">{connection.name}</p>
                    <p className="text-muted-foreground truncate text-xs sm:text-sm">@{connection.username}</p>
                </Link>
                {connection.bio && <p className="text-muted-foreground mt-1 line-clamp-1 text-xs leading-5">{connection.bio}</p>}
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {connection.follows_you && (
                        <span className="bg-muted text-muted-foreground rounded-lg px-2 py-0.5 text-xs font-semibold">{t('Follows you')}</span>
                    )}
                    {connection.is_private && (
                        <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold">
                            <LockKeyhole className="size-3" aria-hidden="true" />
                            {t('Private')}
                        </span>
                    )}
                </div>
            </div>
            {!connection.is_viewer && (
                <FollowButton
                    id={connection.id}
                    name={connection.name}
                    is_following={connection.is_following}
                    follow_request_pending={connection.follow_request_pending}
                    is_private={connection.is_private}
                    only={['connections', 'flash']}
                />
            )}
        </article>
    );
}

export default function ShowConnections({ profile, filters, connections }: ConnectionsPageProps) {
    const { t } = useTranslation();
    const lists: Array<{ value: ProfileConnectionList; label: string }> = [
        { value: 'followers', label: t('Followers') },
        { value: 'following', label: t('Following') },
    ];
    const breadcrumbs: BreadcrumbItem[] = [
        { title: `@${profile.username}`, href: route('profiles.show', profile.username) },
        { title: lists.find((list) => list.value === filters.list)?.label ?? t('Followers'), href: listUrl(profile.username, filters.list) },
    ];
    const isFollowers = filters.list === 'followers';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${profile.name} (@${profile.username}) · ${isFollowers ? t('Followers') : t('Following')}`}>
                <meta
                    name="description"
                    content={t('See who {who} {action} on BlackFrame.', {
                        who: profile.is_self ? t('you') : profile.name,
                        action: isFollowers ? t('follows') : t('is followed by'),
                    })}
                />
            </Head>

            <main id="main-content" className="mx-auto w-full max-w-[760px] px-4 py-5 pb-28 sm:px-6 sm:py-8 md:pb-10" tabIndex={-1}>
                <FlashMessage />

                <section className="border-border bg-card rounded-2xl border p-5 sm:p-6">
                    <div className="flex items-center gap-4">
                        <SocialAvatar name={profile.name} src={profile.avatar_url} className="size-14 text-xl sm:size-16" />
                        <div className="min-w-0">
                            <h1 className="line-clamp-1 text-xl font-semibold tracking-[-0.02em] sm:text-2xl">{profile.name}</h1>
                            <p className="text-muted-foreground mt-0.5 flex items-center gap-2 truncate text-sm">
                                @{profile.username}
                                {profile.is_private && (
                                    <span className="inline-flex items-center gap-1">
                                        <LockKeyhole className="size-3.5" aria-label={t('Private profile')} />
                                        {t('Private')}
                                    </span>
                                )}
                            </p>
                        </div>
                        <Button asChild variant="outline" className="ml-auto min-h-11 shrink-0 rounded-xl px-4">
                            <Link href={route('profiles.show', profile.username)}>{t('View profile')}</Link>
                        </Button>
                    </div>

                    <nav
                        aria-label={t('Connection lists')}
                        className="border-border mt-5 flex gap-1 overflow-x-auto border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {lists.map((list) => {
                            const active = filters.list === list.value;
                            const listCount = list.value === 'followers' ? profile.counts.followers : profile.counts.following;

                            return (
                                <Link
                                    key={list.value}
                                    href={listUrl(profile.username, list.value)}
                                    preserveScroll
                                    only={['connections', 'filters']}
                                    aria-current={active ? 'page' : undefined}
                                    className={cn(
                                        'relative flex min-h-12 shrink-0 items-center gap-2 rounded-t-xl px-3 text-sm font-semibold transition-colors sm:px-4',
                                        active ? 'text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                    )}
                                >
                                    {list.label}
                                    <span className={cn('rounded-lg px-2 py-0.5 text-xs tabular-nums', active ? 'bg-primary/10' : 'bg-muted')}>
                                        {listCount}
                                    </span>
                                    {active && <span className="bg-primary absolute inset-x-4 bottom-0 h-0.5 rounded-full" aria-hidden="true" />}
                                </Link>
                            );
                        })}
                    </nav>
                </section>

                <div className="mt-7">
                    {!profile.can_view_connections ? (
                        <EmptyState icon={LockKeyhole} title={t('This profile is private')}>
                            {t('Send {name} a follow request to see who follows them and who they follow.', {
                                name: profile.name.split(' ')[0],
                            })}
                        </EmptyState>
                    ) : connections && connections.data.length > 0 ? (
                        <>
                            <section
                                className="space-y-3"
                                aria-busy="false"
                                aria-label={t('{list} of {name}', {
                                    list: isFollowers ? t('Followers') : t('Following'),
                                    name: profile.name,
                                })}
                            >
                                {connections.data.map((connection) => (
                                    <ConnectionRow key={connection.id} connection={connection} />
                                ))}
                            </section>
                            <Pagination resource={connections} ariaLabel={t('Connection pages')} />
                        </>
                    ) : isFollowers ? (
                        <EmptyState
                            icon={UsersRound}
                            title={profile.is_self ? t('No followers yet') : t('{name} has no followers yet', { name: profile.name })}
                        >
                            {profile.is_self
                                ? t('When someone follows you, they will appear here so you can find and connect with them.')
                                : t('Once people start following this profile, they will appear here.')}
                        </EmptyState>
                    ) : (
                        <EmptyState
                            icon={UserPlus}
                            title={
                                profile.is_self
                                    ? t('You are not following anyone yet')
                                    : t('{name} is not following anyone yet', { name: profile.name })
                            }
                            action={
                                profile.is_self ? (
                                    <Button asChild className="min-h-11 rounded-xl">
                                        <Link href={route('people.index')}>{t('Discover people')}</Link>
                                    </Button>
                                ) : undefined
                            }
                        >
                            {profile.is_self
                                ? t('Explore the BlackFrame community and follow people whose posts you want in your feed.')
                                : t('The people they follow will appear here.')}
                        </EmptyState>
                    )}
                </div>
            </main>
        </AppLayout>
    );
}
