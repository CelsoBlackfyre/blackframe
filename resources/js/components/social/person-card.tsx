import { SocialAvatar } from '@/components/social/avatar';
import { SubjectBadge } from '@/components/subjects/subject-badge';
import { Button } from '@/components/ui/button';
import { PersonSummary } from '@/types/people';
import { Link, useForm } from '@inertiajs/react';
import { ArrowUpRight, Check, Clock3, LibraryBig, LoaderCircle, LockKeyhole, Sparkles, UserPlus, UsersRound, X } from 'lucide-react';
import { useState } from 'react';

const numberFormatter = new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 });

function RelationshipAction({ person }: { person: PersonSummary }) {
    const form = useForm({});
    const [actionError, setActionError] = useState<string | null>(null);
    const options = {
        preserveScroll: true,
        preserveState: true,
        only: ['people', 'follow_requests', 'network', 'flash'],
        onError: () => setActionError('We could not update this connection. Please try again.'),
    };

    const toggleRelationship = () => {
        setActionError(null);

        if (person.is_following) {
            form.delete(route('people.follow.destroy', person.id), options);

            return;
        }

        form.post(route('people.follow.store', person.id), options);
    };

    if (person.incoming_follow_request) {
        return (
            <div className="flex shrink-0 flex-col gap-2">
                <Button
                    type="button"
                    onClick={() => form.patch(route('people.follow-requests.accept', person.id), options)}
                    disabled={form.processing}
                    aria-label={`Accept ${person.name}'s follow request`}
                    className="min-h-11 cursor-pointer rounded-xl px-4"
                >
                    {form.processing ? (
                        <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    ) : (
                        <Check aria-hidden="true" />
                    )}
                    Accept
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => form.delete(route('people.follow-requests.decline', person.id), options)}
                    disabled={form.processing}
                    aria-label={`Decline ${person.name}'s follow request`}
                    className="min-h-11 cursor-pointer rounded-xl px-4"
                >
                    <X aria-hidden="true" />
                    Decline
                </Button>
                {actionError && (
                    <p role="alert" className="text-destructive max-w-44 text-xs leading-5">
                        {actionError}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="shrink-0 text-right">
            <Button
                type="button"
                variant={person.is_following || person.follow_request_pending ? 'outline' : 'default'}
                onClick={toggleRelationship}
                disabled={form.processing}
                aria-label={`${person.is_following ? 'Unfollow' : person.follow_request_pending ? 'Cancel follow request to' : 'Follow'} ${person.name}`}
                className="min-h-11 min-w-[6.75rem] cursor-pointer rounded-xl px-4"
            >
                {form.processing ? (
                    <>
                        <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" strokeWidth={1.8} aria-hidden="true" />
                        <span className="sr-only">Updating connection</span>
                    </>
                ) : person.is_following ? (
                    <>
                        <Check className="size-4" strokeWidth={1.8} aria-hidden="true" />
                        Unfollow
                    </>
                ) : person.follow_request_pending ? (
                    <>
                        <Clock3 className="size-4" strokeWidth={1.8} aria-hidden="true" />
                        Requested
                    </>
                ) : (
                    <>
                        <UserPlus className="size-4" strokeWidth={1.8} aria-hidden="true" />
                        {person.is_private ? 'Request' : 'Follow'}
                    </>
                )}
            </Button>
            {actionError && (
                <p role="alert" className="text-destructive mt-2 max-w-44 text-xs leading-5">
                    {actionError}
                </p>
            )}
        </div>
    );
}

export function PersonCard({ person }: { person: PersonSummary }) {
    const relationshipLabel = person.is_following && person.follows_you ? 'Connected' : person.follows_you ? 'Follows you' : null;
    const profileHref = route('profiles.show', person.username);

    return (
        <article className="border-border bg-card hover:border-primary/30 flex h-full flex-col rounded-[1.25rem] border p-4 transition-colors sm:p-5">
            <div className="flex items-start gap-3">
                <Link href={profileHref} aria-label={`View ${person.name}'s profile`} className="shrink-0 rounded-full">
                    <SocialAvatar name={person.name} src={person.avatar_url} className="size-14" />
                </Link>
                <div className="min-w-0 flex-1 pt-0.5">
                    <Link href={profileHref} className="group/name block rounded-lg">
                        <h2 className="group-hover/name:text-primary truncate text-base font-semibold">{person.name}</h2>
                        <p className="text-muted-foreground truncate text-sm">@{person.username}</p>
                    </Link>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {relationshipLabel && (
                            <span className="bg-primary/10 text-primary rounded-lg px-2 py-1 text-xs font-semibold">{relationshipLabel}</span>
                        )}
                        {person.is_private && (
                            <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold">
                                <LockKeyhole className="size-3" aria-hidden="true" />
                                Private
                            </span>
                        )}
                    </div>
                </div>
                <RelationshipAction person={person} />
            </div>

            {person.bio && <p className="text-muted-foreground mt-4 line-clamp-2 text-sm leading-6">{person.bio}</p>}

            {person.shared_subjects.length > 0 ? (
                <div className="mt-5">
                    <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-semibold">
                        <Sparkles className="text-primary size-3.5" aria-hidden="true" />
                        You both like
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {person.shared_subjects.map((subject) => (
                            <SubjectBadge key={subject.id} subject={subject} />
                        ))}
                    </div>
                </div>
            ) : person.current_activity ? (
                <div className="bg-muted/55 mt-5 flex items-center gap-2.5 rounded-xl px-3 py-2.5">
                    <LibraryBig className="text-primary size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                    <p className="min-w-0 truncate text-sm">
                        <span className="text-muted-foreground">{person.current_activity.label}</span>{' '}
                        <span className="font-semibold">{person.current_activity.subject.name}</span>
                    </p>
                </div>
            ) : null}

            {person.recommendation_reason && <p className="text-muted-foreground mt-4 text-xs leading-5">{person.recommendation_reason}</p>}

            <div className="min-h-4 flex-1" aria-hidden="true" />
            <div className="border-border mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    {person.shared_titles_count > 0 && (
                        <div className="flex items-center gap-1.5">
                            <dd className="font-semibold tabular-nums">{person.shared_titles_count}</dd>
                            <dt className="text-muted-foreground">shared titles</dt>
                        </div>
                    )}
                    {person.mutual_connections_count > 0 && (
                        <div className="flex items-center gap-1.5">
                            <UsersRound className="text-muted-foreground size-3.5" aria-hidden="true" />
                            <dd className="font-semibold tabular-nums">{person.mutual_connections_count}</dd>
                            <dt className="text-muted-foreground">mutual</dt>
                        </div>
                    )}
                    {person.shared_titles_count === 0 && person.mutual_connections_count === 0 && (
                        <div className="flex items-baseline gap-1.5">
                            <dd className="font-semibold tabular-nums">{numberFormatter.format(person.followers_count)}</dd>
                            <dt className="text-muted-foreground">followers</dt>
                        </div>
                    )}
                </dl>
                <Link
                    href={profileHref}
                    className="text-primary inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-sm font-semibold hover:underline"
                >
                    View profile
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
            </div>
        </article>
    );
}
