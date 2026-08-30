import { Button } from '@/components/ui/button';
import { FeedActivation } from '@/types/feed';
import { Link } from '@inertiajs/react';
import { Check, Circle, LibraryBig, SquarePen, UsersRound } from 'lucide-react';

export function FeedActivationPanel({ activation }: { activation: FeedActivation }) {
    const steps = [
        {
            label: 'Add 5 culture titles',
            detail: `${Math.min(activation.shelf_count, 5)} of 5 on your Geek Shelf`,
            complete: activation.shelf_count >= 5,
            href: route('shelf.index'),
            action: 'Build shelf',
            icon: LibraryBig,
        },
        {
            label: 'Follow 3 people',
            detail: `${Math.min(activation.following_count, 3)} of 3 voices in your Home feed`,
            complete: activation.following_count >= 3,
            href: route('people.index'),
            action: 'Discover',
            icon: UsersRound,
        },
        {
            label: 'Share your first post',
            detail: activation.published_posts_count > 0 ? 'Your profile has a voice' : 'Start with a photo, thought, or recommendation',
            complete: activation.published_posts_count > 0,
            href: route('posts.create'),
            action: 'Create',
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
                    <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">Make Home yours</p>
                    <h2 id="activation-heading" className="mt-2 text-xl font-semibold tracking-[-0.02em]">
                        Build your culture graph
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">A useful Home starts with taste, people, and one thing worth sharing.</p>
                </div>
                <span className="bg-primary/10 text-primary rounded-xl px-3 py-2 text-sm font-semibold tabular-nums">{completed}/3 complete</span>
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
                                        Complete
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
