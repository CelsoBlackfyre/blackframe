import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { Check, Clock3, LoaderCircle, UserPlus } from 'lucide-react';
import { useState } from 'react';

interface FollowButtonProps {
    id: number;
    name: string;
    is_following: boolean;
    follow_request_pending: boolean;
    is_private?: boolean;
    only?: string[];
    preserveState?: boolean;
    className?: string;
}

export function FollowButton({
    id,
    name,
    is_following,
    follow_request_pending,
    is_private = false,
    only,
    preserveState = false,
    className,
}: FollowButtonProps) {
    const form = useForm({});
    const [actionError, setActionError] = useState<string | null>(null);

    const toggle = () => {
        setActionError(null);
        const options = {
            preserveScroll: true,
            preserveState: preserveState || undefined,
            ...(only ? { only } : {}),
            onError: () => setActionError('We could not update this connection. Please try again.'),
        };

        if (is_following || follow_request_pending) {
            form.delete(route('people.follow.destroy', id), options);
            return;
        }

        form.post(route('people.follow.store', id), options);
    };

    const label = is_following ? 'Following' : follow_request_pending ? 'Requested' : is_private ? 'Request' : 'Follow';

    return (
        <div className="shrink-0">
            <Button
                type="button"
                variant={is_following || follow_request_pending ? 'outline' : 'default'}
                onClick={toggle}
                disabled={form.processing}
                aria-label={`${is_following ? 'Unfollow' : follow_request_pending ? 'Cancel follow request to' : 'Follow'} ${name}`}
                className={cn('min-h-11 cursor-pointer rounded-xl px-4', className)}
            >
                {form.processing ? (
                    <>
                        <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                        <span className="sr-only">Updating connection</span>
                    </>
                ) : is_following ? (
                    <>
                        <Check aria-hidden="true" />
                        {label}
                    </>
                ) : follow_request_pending ? (
                    <>
                        <Clock3 aria-hidden="true" />
                        {label}
                    </>
                ) : (
                    <>
                        <UserPlus aria-hidden="true" />
                        {label}
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
