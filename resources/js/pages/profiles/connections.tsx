import { FlashMessage } from '@/components/flash-message';
import { SocialAvatar } from '@/components/social/avatar';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { ConnectionSummary, ConnectionsPageProps, ProfileConnectionList } from '@/types/profiles';
import { Head, Link, useForm } from '@inertiajs/react';
import { Check, Clock3, LoaderCircle, LockKeyhole, UserPlus, UsersRound } from 'lucide-react';
import { ReactNode } from 'react';

const lists: Array<{ value: ProfileConnectionList; label: string }> = [
    { value: 'followers', label: 'Followers' },
    { value: 'following', label: 'Following' },
];

function listUrl(username: string, list: ProfileConnectionList): string {
    return route('profiles.connections', { user: username, list });
}

function ConnectionAction({ connection }: { connection: ConnectionSummary }) {
    const form = useForm({});
    const options = { preserveScroll: true, only: ['connections', 'flash'] };

    const toggle = () => {
        if (connection.is_following || connection.follow_request_pending) {
            form.delete(route('people.follow.destroy', connection.id), options);
            return;
        }

        form.post(route('people.follow.store', connection.id), options);
    };

    return (
        <Button
            type="button"
            variant={connection.is_following || connection.follow_request_pending ? 'outline' : 'default'}
            onClick={toggle}
            disabled={form.processing}
            aria-label={`${connection.is_following ? 'Unfollow' : connection.follow_request_pending ? 'Cancel follow request to' : 'Follow'} ${connection.name}`}
            className="min-h-11 shrink-0 cursor-pointer rounded-xl px-4"
        >
            {form.processing ? (
                <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : connection.is_following ? (
                <Check aria-hidden="true" />
            ) : connection.follow_request_pending ? (
                <Clock3 aria-hidden="true" />
            ) : (
                <UserPlus aria-hidden="true" />
            )}
            {connection.is_following ? 'Following' : connection.follow_request_pending ? 'Requested' : connection.is_private ? 'Request' : 'Follow'}
        </Button>
    );
}

function ConnectionRow({ connection }: { connection: ConnectionSummary }) {
    const profileHref = route('profiles.show', connection.username);

    return (
        <article className="border-border bg-card flex items-center gap-3 rounded-2xl border p-3.5 sm:p-4">
            <Link href={profileHref} aria-label={`View ${connection.name}'s profile`} className="shrink-0 rounded-full">
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
                        <span className="bg-muted text-muted-foreground rounded-lg px-2 py-0.5 text-xs font-semibold">Follows you</span>
                    )}
                    {connection.is_private && (
                        <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold">
                            <LockKeyhole className="size-3" aria-hidden="true" />
                            Private
                        </span>
                    )}
                </div>
            </div>
            {!connection.is_viewer && <ConnectionAction connection={connection} />}
        </article>
    );
}

function ConnectionsEmpty({
    icon: Icon,
    title,
    children,
    action,
}: {
    icon: typeof UsersRound;
    title: string;
    children: ReactNode;
    action?: ReactNode;
}) {
    return (
        <section className="border-border bg-card rounded-[1.5rem] border border-dashed px-6 py-14 text-center">
            <span className="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-2xl">
                <Icon className="size-6" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-semibold">{title}</h2>
            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">{children}</p>
            {action && <div className="mt-6">{action}</div>}
        </section>
    );
}

export default function ShowConnections({ profile, filters, connections }: ConnectionsPageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: `@${profile.username}`, href: route('profiles.show', profile.username) },
        { title: lists.find((list) => list.value === filters.list)?.label ?? 'Followers', href: listUrl(profile.username, filters.list) },
    ];
    const isFollowers = filters.list === 'followers';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${profile.name} (@${profile.username}) · ${isFollowers ? 'Followers' : 'Following'}`}>
                <meta
                    name="description"
                    content={`See who ${profile.is_self ? 'you' : profile.name} ${isFollowers ? 'follows' : 'is followed by'} on BlackFrame.`}
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
                                        <LockKeyhole className="size-3.5" aria-label="Private profile" />
                                        Private
                                    </span>
                                )}
                            </p>
                        </div>
                        <Button asChild variant="outline" className="ml-auto min-h-11 shrink-0 rounded-xl px-4">
                            <Link href={route('profiles.show', profile.username)}>View profile</Link>
                        </Button>
                    </div>

                    <nav
                        aria-label="Connection lists"
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
                        <ConnectionsEmpty icon={LockKeyhole} title="This profile is private">
                            Send {profile.name.split(' ')[0]} a follow request to see who follows them and who they follow.
                        </ConnectionsEmpty>
                    ) : connections && connections.data.length > 0 ? (
                        <>
                            <section
                                className="space-y-3"
                                aria-busy="false"
                                aria-label={`${isFollowers ? 'Followers' : 'Following'} of ${profile.name}`}
                            >
                                {connections.data.map((connection) => (
                                    <ConnectionRow key={connection.id} connection={connection} />
                                ))}
                            </section>
                            {(connections.prev_page_url || connections.next_page_url) && (
                                <nav className="mt-7 flex items-center justify-between gap-4" aria-label="Connection pages">
                                    {connections.prev_page_url ? (
                                        <Button asChild variant="outline" className="min-h-11 rounded-xl">
                                            <Link href={connections.prev_page_url} preserveScroll>
                                                Newer
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button variant="outline" disabled className="min-h-11 rounded-xl">
                                            Newer
                                        </Button>
                                    )}
                                    <span className="text-muted-foreground text-xs tabular-nums">
                                        {connections.current_page} / {connections.last_page}
                                    </span>
                                    {connections.next_page_url ? (
                                        <Button asChild variant="outline" className="min-h-11 rounded-xl">
                                            <Link href={connections.next_page_url} preserveScroll>
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
                        </>
                    ) : isFollowers ? (
                        <ConnectionsEmpty icon={UsersRound} title={profile.is_self ? 'No followers yet' : `${profile.name} has no followers yet`}>
                            {profile.is_self
                                ? 'When someone follows you, they will appear here so you can find and connect with them.'
                                : 'Once people start following this profile, they will appear here.'}
                        </ConnectionsEmpty>
                    ) : (
                        <ConnectionsEmpty
                            icon={UserPlus}
                            title={profile.is_self ? 'You are not following anyone yet' : `${profile.name} is not following anyone yet`}
                            action={
                                profile.is_self ? (
                                    <Button asChild className="min-h-11 rounded-xl">
                                        <Link href={route('people.index')}>Discover people</Link>
                                    </Button>
                                ) : undefined
                            }
                        >
                            {profile.is_self
                                ? 'Explore the BlackFrame community and follow people whose posts you want in your feed.'
                                : 'The people they follow will appear here.'}
                        </ConnectionsEmpty>
                    )}
                </div>
            </main>
        </AppLayout>
    );
}
