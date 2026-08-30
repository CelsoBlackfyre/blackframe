import { Button } from '@/components/ui/button';
import { CreatorSuggestion } from '@/types/feed';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { SocialAvatar } from './avatar';

function FollowButton({ creatorId }: { creatorId: number }) {
    const form = useForm({});

    return (
        <Button
            type="button"
            size="sm"
            onClick={() =>
                form.post(route('people.follow.store', creatorId), {
                    preserveScroll: true,
                    only: ['posts', 'suggestions', 'flash'],
                })
            }
            disabled={form.processing}
            className="h-10 min-w-20 cursor-pointer rounded-xl px-4"
        >
            {form.processing ? (
                <>
                    <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    <span className="sr-only">Following creator</span>
                </>
            ) : (
                'Follow'
            )}
        </Button>
    );
}

export function CreatorSuggestions({ suggestions, compact = false }: { suggestions: CreatorSuggestion[]; compact?: boolean }) {
    if (suggestions.length === 0) {
        return null;
    }

    if (compact) {
        return (
            <section aria-labelledby="suggestions-mobile-heading" className="space-y-3 xl:hidden">
                <div className="flex items-center justify-between">
                    <h2 id="suggestions-mobile-heading" className="text-sm font-semibold">
                        People to discover
                    </h2>
                    <span className="text-muted-foreground text-xs">Suggestions</span>
                </div>
                <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {suggestions.map((creator) => (
                        <div
                            key={creator.id}
                            className="border-border bg-card flex min-w-[220px] snap-start items-center gap-3 rounded-2xl border p-3"
                        >
                            <SocialAvatar name={creator.name} src={creator.avatar_url} />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">{creator.username}</p>
                                <p className="text-muted-foreground truncate text-xs">{creator.name}</p>
                            </div>
                            <FollowButton creatorId={creator.id} />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <aside className="sticky top-24 hidden self-start xl:block" aria-labelledby="suggestions-heading">
            <div className="border-border bg-card rounded-2xl border p-5">
                <h2 id="suggestions-heading" className="text-base font-semibold">
                    People to discover
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">Bring more perspectives into your feed.</p>
                <div className="mt-5 space-y-4">
                    {suggestions.map((creator) => (
                        <div key={creator.id} className="flex items-center gap-3">
                            <SocialAvatar name={creator.name} src={creator.avatar_url} />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">{creator.username}</p>
                                <p className="text-muted-foreground truncate text-xs">
                                    {creator.posts_count} {creator.posts_count === 1 ? 'post' : 'posts'}
                                </p>
                            </div>
                            <FollowButton creatorId={creator.id} />
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}
