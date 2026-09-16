import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { FeedActivation } from '@/types/feed';
import { Link } from '@inertiajs/react';
import { Check, Circle, LibraryBig, SquarePen, UsersRound } from 'lucide-react';

export function FeedActivationPanel({ activation }: { activation: FeedActivation }) {
    const { t } = useTranslation();
    const steps = [
        {
            label: t('Add 5 culture titles'),
            detail: t('{count} of 5 on your Geek Shelf', { count: Math.min(activation.shelf_count, 5) }),
            complete: activation.shelf_count >= 5,
            href: route('shelf.index'),
            action: t('Build shelf'),
            icon: LibraryBig,
        },
        {
            label: t('Follow 3 people'),
            detail: t('{count} of 3 voices in your Home feed', { count: Math.min(activation.following_count, 3) }),
            complete: activation.following_count >= 3,
            href: route('people.index'),
            action: t('Discover'),
            icon: UsersRound,
        },
        {
            label: t('Share your first post'),
            detail: activation.published_posts_count > 0 ? t('Your profile has a voice') : t('Start with a photo, thought, or recommendation'),
            complete: activation.published_posts_count > 0,
            href: route('posts.create'),
            action: t('Create'),
            icon: SquarePen,
        },
    ];
    const completed = steps.filter((step) => step.complete).length;
    const nextStep = steps.find((step) => !step.complete);

    if (!nextStep) return null;

    return (
        <section className="border-border bg-card overflow-hidden rounded-[1.5rem] border" aria-labelledby="activation-heading">
            <div className="border-border flex flex-wrap items-start justify-between gap-4 border-b px-5 py-5 sm:px-6">
                <div>
                    <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">{t('Make Home yours')}</p>
                    <h2 id="activation-heading" className="mt-2 text-xl font-semibold tracking-[-0.02em]">
                        {t('Build your culture graph')}
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">{t('A useful Home starts with taste, people, and one thing worth sharing.')}</p>
                </div>
                <span className="bg-primary/10 text-primary rounded-xl px-3 py-2 text-sm font-semibold tabular-nums">
                    {t('{done}/3 complete', { done: completed })}
                </span>
            </div>

            <ol className="divide-border grid divide-y lg:grid-cols-3 lg:divide-x lg:divide-y-0">
                {steps.map((step) => {
                    const Icon = step.icon;

                    return (
                        <li key={step.label} className="flex min-w-0 flex-col p-5">
                            <div className="flex items-start gap-3">
                                <span
                                    className={
                                        step.complete
                                            ? 'bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-xl'
                                            : 'bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-xl'
                                    }
                                >
                                    {step.complete ? (
                                        <Check className="size-4" strokeWidth={2.2} aria-hidden="true" />
                                    ) : (
                                        <Icon className="size-4" strokeWidth={1.8} aria-hidden="true" />
                                    )}
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold">{step.label}</p>
                                    <p className="text-muted-foreground mt-1 text-xs leading-5">{step.detail}</p>
                                </div>
                            </div>
                            <div className="mt-4 flex min-h-11 items-center">
                                {step.complete ? (
                                    <span className="text-primary inline-flex items-center gap-2 text-xs font-semibold">
                                        <Circle className="size-2 fill-current" aria-hidden="true" />
                                        {t('Complete')}
                                    </span>
                                ) : (
                                    <Button
                                        asChild
                                        variant={step === nextStep ? 'default' : 'outline'}
                                        size="sm"
                                        className="min-h-10 rounded-xl px-4"
                                    >
                                        <Link href={step.href}>{step.action}</Link>
                                    </Button>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}
