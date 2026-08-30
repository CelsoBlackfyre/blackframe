import { SocialAvatar } from '@/components/social/avatar';
import { Button } from '@/components/ui/button';
import { PersonSummary } from '@/types/people';
import { useForm } from '@inertiajs/react';
import { Check, LoaderCircle, UserPlus } from 'lucide-react';
import { useState } from 'react';

const numberFormatter = new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 });

function RelationshipAction({ person }: { person: PersonSummary }) {
    const form = useForm({});
    const [actionError, setActionError] = useState<string | null>(null);

    const toggleRelationship = () => {
        setActionError(null);

        const options = {
            preserveScroll: true,
            preserveState: true,
            only: ['people', 'network', 'flash'],
            onError: () => setActionError('We could not update this connection. Please try again.'),
        };

        if (person.is_following) {
            form.delete(route('people.follow.destroy', person.id), options);

            return;
        }

        form.post(route('people.follow.store', person.id), options);
    };

    return (
        <div className="shrink-0 text-right">
            <Button
                type="button"
                variant={person.is_following ? 'outline' : 'default'}
                onClick={toggleRelationship}
                disabled={form.processing}
                aria-label={`${person.is_following ? 'Unfollow' : 'Follow'} ${person.name}`}
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
                ) : (
                    <>
                        <UserPlus className="size-4" strokeWidth={1.8} aria-hidden="true" />
                        Follow
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

    return (
        <article className="border-border bg-card flex h-full flex-col rounded-2xl border p-4 sm:p-5">
            <div className="flex items-start gap-3">
                <SocialAvatar name={person.name} src={person.avatar_url} className="size-14 shrink-0" />
                <div className="min-w-0 flex-1 pt-0.5">
                    <h2 className="truncate text-base font-semibold">{person.name}</h2>
                    <p className="text-muted-foreground truncate text-sm">@{person.username}</p>
                    {relationshipLabel && (
                        <span className="bg-primary/10 text-primary mt-2 inline-flex rounded-lg px-2 py-1 text-xs font-semibold">
                            {relationshipLabel}
                        </span>
                    )}
                </div>
                <RelationshipAction person={person} />
            </div>

            {person.bio && <p className="text-muted-foreground mt-4 line-clamp-2 text-sm leading-6">{person.bio}</p>}

            <div className="min-h-4 flex-1" aria-hidden="true" />
            <dl className="border-border flex gap-5 border-t pt-4 text-sm">
                <div className="flex items-baseline gap-1.5">
                    <dd className="font-semibold tabular-nums">{numberFormatter.format(person.followers_count)}</dd>
                    <dt className="text-muted-foreground">followers</dt>
                </div>
                <div className="flex items-baseline gap-1.5">
                    <dd className="font-semibold tabular-nums">{numberFormatter.format(person.posts_count)}</dd>
                    <dt className="text-muted-foreground">posts</dt>
                </div>
            </dl>
        </article>
    );
}
