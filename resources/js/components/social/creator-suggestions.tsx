import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { CreatorSuggestion } from '@/types/feed';
import { Link, useForm } from '@inertiajs/react';
import { LoaderCircle, Sparkles } from 'lucide-react';
import { SocialAvatar } from './avatar';

function FollowButton({ creatorId }: { creatorId: number }) {
    const { t } = useTranslation();
    const form = useForm({});

    return (
        <Button
            type="button"
            size="sm"
            onClick={() =>
                form.post(route('people.follow.store', creatorId), {
                    preserveScroll: true,
                    only: ['posts', 'suggestions', 'activation', 'flash'],
                })
            }
            disabled={form.processing}
            variant="outline"
            className="h-11 min-w-20 cursor-pointer rounded-xl px-3"
        >
            {form.processing ? (
                <>
                    <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    <span className="sr-only">{t('Following creator')}</span>
                </>
            ) : (
                t('Follow')
            )}
        </Button>
    );
}

export function CreatorSuggestions({ suggestions, compact = false }: { suggestions: CreatorSuggestion[]; compact?: boolean }) {
    const { t } = useTranslation();
    if (suggestions.length === 0) {
        return null;
    }

    if (compact) {
        return (
            <section aria-labelledby="suggestions-mobile-heading" className="space-y-3 xl:hidden">
                <div className="flex items-center justify-between">
                    <h2 id="suggestions-mobile-heading" className="text-sm font-semibold">
                        {t('People to discover')}
                    </h2>
                    <span className="text-muted-foreground text-xs">{t('Suggestions')}</span>
                </div>
                <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {suggestions.map((creator) => (
                        <div
                            key={creator.id}
                            className="border-border bg-card flex min-w-[220px] snap-start items-center gap-3 rounded-2xl border p-3"
                        >
                            <Link href={route('profiles.show', creator.username)} className="rounded-full">
                                <SocialAvatar name={creator.name} src={creator.avatar_url} />
                            </Link>
                            <div className="min-w-0 flex-1">
                                <Link
                                    href={route('profiles.show', creator.username)}
                                    className="hover:text-primary block truncate rounded text-sm font-semibold"
                                >
                                    {creator.username}
                                </Link>
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
        <section aria-labelledby="suggestions-heading">
            <div className="py-1">
                <h2 id="suggestions-heading" className="text-base font-semibold">
                    {t('People to discover')}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">{t('A little common ground goes a long way.')}</p>
                <div className="mt-5 space-y-4">
                    {suggestions.map((creator) => (
                        <div key={creator.id} className="flex items-center gap-3">
                            <Link href={route('profiles.show', creator.username)} className="rounded-full">
                                <SocialAvatar name={creator.name} src={creator.avatar_url} />
                            </Link>
                            <div className="min-w-0 flex-1">
                                <Link
                                    href={route('profiles.show', creator.username)}
                                    className="hover:text-primary block truncate rounded text-sm font-semibold"
                                >
                                    {creator.username}
                                </Link>
                                <p className="text-muted-foreground truncate text-xs">
                                    {creator.shared_titles_count > 0
                                        ? t('{count} shared title|{count} shared titles', { count: creator.shared_titles_count })
                                        : t('{count} post|{count} posts', { count: creator.posts_count })}
                                </p>
                            </div>
                            <FollowButton creatorId={creator.id} />
                        </div>
                    ))}
                </div>
                {suggestions.some((creator) => creator.recommendation_reason) && (
                    <p className="text-muted-foreground mt-4 flex items-start gap-2 border-t pt-4 text-xs leading-5">
                        <Sparkles className="text-primary mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                        {t('Recommendations prioritize culture you share.')}
                    </p>
                )}
            </div>
        </section>
    );
}
