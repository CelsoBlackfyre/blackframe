import { FlashMessage } from '@/components/flash-message';
import { PageHeading } from '@/components/page-heading';
import { SocialAvatar } from '@/components/social/avatar';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { MatchCandidate, MatchDecision, MatchScoreWeight, MatchSummary, MatchView } from '@/types/matches';
import { useGSAP } from '@gsap/react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import gsap from 'gsap';
import {
    ArrowLeft,
    ArrowRight,
    BookHeart,
    Check,
    HeartHandshake,
    Info,
    LibraryBig,
    LoaderCircle,
    MessagesSquare,
    RotateCcw,
    Sparkles,
    Star,
    X,
} from 'lucide-react';
import { PointerEvent as ReactPointerEvent, useCallback, useRef, useState } from 'react';

gsap.registerPlugin(useGSAP);

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Shelf Match', href: '/matches' }];
const statusLabels: Record<string, string> = {
    current: 'In progress',
    completed: 'Completed',
    backlog: 'Backlog',
    paused: 'Paused',
    dropped: 'Dropped',
};

interface MatchPageProps {
    candidates: MatchCandidate[];
    filters: { view: MatchView };
    summary: MatchSummary;
    score_model: MatchScoreWeight[];
}

interface LastDecision {
    candidate: MatchCandidate;
    decision: MatchDecision;
}

function SharedShelf({ candidate, compact = false }: { candidate: MatchCandidate; compact?: boolean }) {
    const subjects = compact ? candidate.compatibility.shared_subjects.slice(0, 3) : candidate.compatibility.shared_subjects;

    return (
        <div className={cn('grid gap-2', compact ? 'grid-cols-3' : 'grid-cols-3 sm:grid-cols-5')}>
            {subjects.map((subject) => (
                <div key={subject.id} className="min-w-0">
                    <div className="bg-muted relative aspect-[4/5] overflow-hidden rounded-xl border border-white/10">
                        {subject.image_url ? (
                            <img
                                src={subject.image_url}
                                alt=""
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                            />
                        ) : (
                            <div className="text-muted-foreground flex h-full items-center justify-center">
                                <LibraryBig className="size-6" strokeWidth={1.5} aria-hidden="true" />
                            </div>
                        )}
                        {subject.both_favorite && (
                            <span className="bg-primary text-primary-foreground absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-lg shadow-sm">
                                <Star className="size-3.5 fill-current" strokeWidth={1.8} aria-hidden="true" />
                                <span className="sr-only">Favorite for both of you</span>
                            </span>
                        )}
                    </div>
                    <p className="mt-1.5 truncate text-xs font-semibold">{subject.name}</p>
                    {!compact && <p className="text-muted-foreground mt-0.5 truncate text-[0.6875rem]">{subject.type_label}</p>}
                </div>
            ))}
        </div>
    );
}

function CompatibilityScore({ score, size = 'large' }: { score: number; size?: 'large' | 'small' }) {
    return (
        <div
            className={cn(
                'bg-primary text-primary-foreground flex shrink-0 flex-col items-center justify-center rounded-2xl shadow-sm',
                size === 'large' ? 'size-20' : 'size-14 rounded-xl',
            )}
            aria-label={`${score} percent shelf compatibility`}
        >
            <strong className={cn('leading-none tabular-nums', size === 'large' ? 'text-2xl' : 'text-lg')}>{score}%</strong>
            <span className={cn('font-semibold', size === 'large' ? 'mt-1 text-[0.5625rem]' : 'text-[0.5rem]')}>match</span>
        </div>
    );
}

function CandidateCard({
    candidate,
    cardRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    disabled,
}: {
    candidate: MatchCandidate;
    cardRef: React.RefObject<HTMLElement | null>;
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
    disabled: boolean;
}) {
    const relationship = candidate.is_following && candidate.follows_you ? 'Already connected' : candidate.follows_you ? 'Follows you' : null;

    return (
        <article
            ref={cardRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            aria-label={`Compatibility card for ${candidate.name}`}
            aria-disabled={disabled}
            className="group border-border bg-card relative z-20 [touch-action:pan-y] overflow-hidden rounded-2xl border shadow-[0_8px_30px_rgba(19,16,18,0.07)] select-none dark:shadow-none"
        >
            <div className="grid md:grid-cols-[0.88fr_1.12fr]">
                <div className="relative min-h-72 overflow-hidden bg-neutral-950 md:min-h-[27rem]">
                    {candidate.avatar_url ? (
                        <img
                            src={candidate.avatar_url}
                            alt={`${candidate.name}'s profile photo`}
                            draggable={false}
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full min-h-72 items-center justify-center p-10">
                            <SocialAvatar name={candidate.name} className="size-32 border-white/15 text-3xl" />
                        </div>
                    )}
                    <div className="absolute top-4 left-4 flex items-center gap-2 rounded-xl bg-black/65 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm">
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        Drag to pass
                    </div>
                    <div className="absolute top-4 right-4 flex items-center gap-2 rounded-xl bg-black/65 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm">
                        Connect
                        <ArrowRight className="size-4" aria-hidden="true" />
                    </div>
                </div>

                <div className="flex min-w-0 flex-col p-5 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <Link href={route('profiles.show', candidate.username)} className="hover:text-primary block rounded-lg">
                                <h2 className="truncate text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">{candidate.name}</h2>
                                <p className="text-muted-foreground mt-1 truncate text-sm">@{candidate.username}</p>
                            </Link>
                            {relationship && <p className="text-primary mt-2 text-xs font-semibold">{relationship}</p>}
                        </div>
                        <CompatibilityScore score={candidate.compatibility.score} />
                    </div>

                    <p className="text-muted-foreground mt-5 line-clamp-3 text-sm leading-6">
                        {candidate.bio || 'Explore the titles and favorites you have in common.'}
                    </p>

                    <dl className="mt-6 grid grid-cols-3 gap-2">
                        <div className="bg-muted rounded-xl p-3">
                            <dd className="text-lg font-semibold tabular-nums">{candidate.compatibility.shared_count}</dd>
                            <dt className="text-muted-foreground text-[0.6875rem] leading-4">shared titles</dt>
                        </div>
                        <div className="bg-muted rounded-xl p-3">
                            <dd className="text-lg font-semibold tabular-nums">{candidate.compatibility.shared_favorites_count}</dd>
                            <dt className="text-muted-foreground text-[0.6875rem] leading-4">both favorites</dt>
                        </div>
                        <div className="bg-muted rounded-xl p-3">
                            <dd className="text-lg font-semibold tabular-nums">{candidate.compatibility.same_status_count}</dd>
                            <dt className="text-muted-foreground text-[0.6875rem] leading-4">same status</dt>
                        </div>
                    </dl>

                    <div className="mt-6 flex flex-wrap gap-2">
                        {candidate.compatibility.type_affinities.map((type) => (
                            <span key={type} className="border-border bg-background rounded-lg border px-2.5 py-1.5 text-xs font-semibold">
                                {type}
                            </span>
                        ))}
                    </div>

                    <div className="mt-auto pt-6">
                        <p className="mb-3 text-xs font-semibold">On both shelves</p>
                        <SharedShelf candidate={candidate} />
                    </div>
                </div>
            </div>
        </article>
    );
}

function CompatibilityRail({ candidate, scoreModel }: { candidate: MatchCandidate; scoreModel: MatchScoreWeight[] }) {
    const topShared = candidate.compatibility.shared_subjects[0];

    return (
        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start" aria-label="How this match was calculated">
            <section className="border-border bg-card rounded-2xl border p-5">
                <div className="flex items-center gap-3">
                    <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
                        <Info className="size-5" strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <div>
                        <h2 className="font-semibold">Why this score</h2>
                        <p className="text-muted-foreground text-xs">Shelf signals only</p>
                    </div>
                </div>
                <div className="mt-5 space-y-3">
                    {scoreModel.map((item) => (
                        <div key={item.label} className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className="font-semibold tabular-nums">{item.weight}%</span>
                        </div>
                    ))}
                </div>
                <p className="text-muted-foreground border-border mt-5 border-t pt-4 text-xs leading-5">
                    BlackFrame compares overlap, favorites, status, and ratings. Profile text and follower count never change the score.
                </p>
            </section>

            {topShared && (
                <section className="bg-accent text-accent-foreground rounded-2xl p-5">
                    <BookHeart className="text-primary size-6" strokeWidth={1.8} aria-hidden="true" />
                    <h2 className="mt-4 text-lg font-semibold">Start with {topShared.name}</h2>
                    <p className="mt-2 text-sm leading-6 text-neutral-300 dark:text-neutral-600">
                        You marked it {statusLabels[topShared.viewer_status].toLowerCase()}. {candidate.name.split(' ')[0]} marked it{' '}
                        {statusLabels[topShared.candidate_status].toLowerCase()}.
                    </p>
                </section>
            )}
        </aside>
    );
}

function MatchDeck({ candidates, scoreModel }: { candidates: MatchCandidate[]; scoreModel: MatchScoreWeight[] }) {
    const current = candidates[0];
    const cardRef = useRef<HTMLElement>(null);
    const drag = useRef<{ pointerId: number; startX: number; currentX: number } | null>(null);
    const [processing, setProcessing] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [lastDecision, setLastDecision] = useState<LastDecision | null>(null);

    useGSAP(
        () => {
            if (!cardRef.current) return;

            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            gsap.set(cardRef.current, { clearProps: 'transform,opacity' });

            if (!reduceMotion) {
                gsap.fromTo(
                    cardRef.current,
                    { y: 18, opacity: 0.4, scale: 0.985 },
                    { y: 0, opacity: 1, scale: 1, duration: 0.42, ease: 'power2.out' },
                );
            }
        },
        { dependencies: [current?.id] },
    );

    const submitDecision = useCallback(
        (decision: MatchDecision) => {
            if (!current || processing) return;

            setProcessing(true);
            setActionError(null);

            const submit = () => {
                router.post(
                    route('matches.decisions.store', current.id),
                    { decision },
                    {
                        preserveScroll: true,
                        only: ['candidates', 'summary', 'flash'],
                        onSuccess: () => setLastDecision({ candidate: current, decision }),
                        onError: () => {
                            setActionError('We could not save that choice. Please try again.');
                            if (cardRef.current) gsap.to(cardRef.current, { x: 0, rotation: 0, opacity: 1, duration: 0.24 });
                        },
                        onFinish: () => setProcessing(false),
                    },
                );
            };

            if (!cardRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                submit();
                return;
            }

            gsap.to(cardRef.current, {
                x: decision === 'connect' ? window.innerWidth * 0.72 : window.innerWidth * -0.72,
                rotation: decision === 'connect' ? 8 : -8,
                opacity: 0,
                duration: 0.28,
                ease: 'power2.in',
                onComplete: submit,
            });
        },
        [current, processing],
    );

    const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
        if (processing || event.button !== 0) return;
        drag.current = { pointerId: event.pointerId, startX: event.clientX, currentX: 0 };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
        if (!drag.current || drag.current.pointerId !== event.pointerId || !cardRef.current) return;
        const distance = Math.max(-160, Math.min(160, event.clientX - drag.current.startX));
        drag.current.currentX = distance;
        gsap.set(cardRef.current, { x: distance, rotation: distance / 24 });
    };

    const handlePointerUp = (event: ReactPointerEvent<HTMLElement>) => {
        if (!drag.current || drag.current.pointerId !== event.pointerId) return;
        const distance = drag.current.currentX;
        drag.current = null;

        if (Math.abs(distance) >= 100) {
            submitDecision(distance > 0 ? 'connect' : 'pass');
            return;
        }

        if (cardRef.current) gsap.to(cardRef.current, { x: 0, rotation: 0, duration: 0.26, ease: 'power2.out' });
    };

    const undo = () => {
        if (!lastDecision || processing) return;
        setProcessing(true);
        setActionError(null);
        router.delete(route('matches.decisions.destroy', lastDecision.candidate.id), {
            preserveScroll: true,
            only: ['candidates', 'summary', 'flash'],
            onSuccess: () => setLastDecision(null),
            onError: () => setActionError('We could not undo that choice. Please try again.'),
            onFinish: () => setProcessing(false),
        });
    };

    if (!current) {
        return (
            <EmptyMatches
                icon={Check}
                title="You are caught up"
                description="You have reviewed every compatible shelf nearby. Add more titles or return later as the community grows."
                action={{ label: 'Grow your shelf', href: '/shelf' }}
            />
        );
    }

    return (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
            <div className="min-w-0">
                <div className="relative pb-4 sm:px-3">
                    {candidates
                        .slice(1, 3)
                        .reverse()
                        .map((candidate, index) => (
                            <div
                                key={candidate.id}
                                aria-hidden="true"
                                className="border-border bg-card absolute inset-x-5 top-0 h-full rounded-2xl border shadow-sm sm:inset-x-10"
                                style={{ transform: `translateY(${(index + 1) * 10}px) scale(${1 - (index + 1) * 0.025})`, zIndex: index + 1 }}
                            />
                        ))}
                    <CandidateCard
                        candidate={current}
                        cardRef={cardRef}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        disabled={processing}
                    />
                </div>

                <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => submitDecision('pass')}
                        disabled={processing}
                        className="min-h-13 w-full cursor-pointer rounded-2xl px-7 text-base sm:w-auto"
                    >
                        {processing ? (
                            <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                        ) : (
                            <X aria-hidden="true" />
                        )}
                        Pass
                    </Button>
                    <Button
                        type="button"
                        onClick={() => submitDecision('connect')}
                        disabled={processing}
                        className="min-h-13 w-full cursor-pointer rounded-2xl px-8 text-base shadow-sm sm:w-auto"
                    >
                        {processing ? (
                            <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                        ) : (
                            <HeartHandshake aria-hidden="true" />
                        )}
                        Connect
                    </Button>
                </div>

                <div className="mt-3 min-h-10 text-center" aria-live="polite">
                    {lastDecision && (
                        <button
                            type="button"
                            onClick={undo}
                            disabled={processing}
                            className="text-muted-foreground hover:text-foreground inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors"
                        >
                            <RotateCcw className="size-4" strokeWidth={1.8} aria-hidden="true" />
                            Undo {lastDecision.decision} for {lastDecision.candidate.name}
                        </button>
                    )}
                    {actionError && <p className="text-destructive mt-2 text-sm">{actionError}</p>}
                </div>
            </div>

            <CompatibilityRail candidate={current} scoreModel={scoreModel} />
        </div>
    );
}

function EmptyMatches({
    icon: Icon,
    title,
    description,
    action,
}: {
    icon: typeof Sparkles;
    title: string;
    description: string;
    action: { label: string; href: string };
}) {
    return (
        <section className="border-border bg-card rounded-2xl border border-dashed px-6 py-16 text-center sm:py-20">
            <span className="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-2xl">
                <Icon className="size-6" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-semibold">{title}</h2>
            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">{description}</p>
            <Button asChild className="mt-6 min-h-11 rounded-xl px-5">
                <Link href={action.href}>{action.label}</Link>
            </Button>
        </section>
    );
}

function Connections({ candidates }: { candidates: MatchCandidate[] }) {
    if (candidates.length === 0) {
        return (
            <EmptyMatches
                icon={HeartHandshake}
                title="No mutual matches yet"
                description="A connection appears here only after both people choose Connect. Your outgoing choices stay private until then."
                action={{ label: 'Find shelf matches', href: '/matches?view=discover' }}
            />
        );
    }

    return (
        <section className="grid gap-4 lg:grid-cols-2" aria-label="Mutual shelf matches">
            {candidates.map((candidate) => (
                <article key={candidate.id} className="border-border bg-card flex flex-col rounded-2xl border p-5">
                    <div className="flex items-start gap-4">
                        <Link href={route('profiles.show', candidate.username)} className="shrink-0 rounded-full">
                            <SocialAvatar name={candidate.name} src={candidate.avatar_url} className="size-16" />
                        </Link>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <Link href={route('profiles.show', candidate.username)} className="hover:text-primary block rounded">
                                        <h2 className="truncate text-lg font-semibold">{candidate.name}</h2>
                                        <p className="text-muted-foreground truncate text-sm">@{candidate.username}</p>
                                    </Link>
                                </div>
                                <CompatibilityScore score={candidate.compatibility.score} size="small" />
                            </div>
                        </div>
                    </div>
                    {candidate.bio && <p className="text-muted-foreground mt-4 line-clamp-2 text-sm leading-6">{candidate.bio}</p>}
                    <div className="mt-5">
                        <SharedShelf candidate={candidate} compact />
                    </div>
                    <p className="text-primary mt-5 inline-flex items-center gap-2 text-sm font-semibold">
                        <HeartHandshake className="size-4" strokeWidth={1.8} aria-hidden="true" />
                        You both chose Connect
                    </p>
                    <MessageMatchButton candidate={candidate} />
                </article>
            ))}
        </section>
    );
}

function MessageMatchButton({ candidate }: { candidate: MatchCandidate }) {
    const { post, processing, errors } = useForm<{ person: string }>({ person: '' });

    return (
        <div className="mt-4">
            <Button
                type="button"
                onClick={() => post(route('direct.start', candidate.id))}
                disabled={processing}
                className="min-h-11 w-full cursor-pointer rounded-xl"
            >
                {processing ? (
                    <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                ) : (
                    <MessagesSquare aria-hidden="true" />
                )}
                Message {candidate.name.split(' ')[0]}
            </Button>
            {errors.person && (
                <p className="text-destructive mt-2 text-sm" role="alert">
                    {errors.person}
                </p>
            )}
        </div>
    );
}

export default function Matches({ candidates, filters, summary, score_model: scoreModel }: MatchPageProps) {
    const tabs: Array<{ value: MatchView; label: string; count?: number }> = [
        { value: 'discover', label: 'Discover' },
        { value: 'connections', label: 'Connections', count: summary.connections_count },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Shelf Match">
                <meta
                    name="description"
                    content="Find people through transparent compatibility based on the titles, favorites, statuses, and ratings on your BlackFrame shelf."
                />
            </Head>

            <main id="main-content" className="mx-auto w-full max-w-[1180px] px-4 py-5 pb-28 sm:px-6 sm:py-8 md:pb-10" tabIndex={-1}>
                <PageHeading
                    title="A good place to connect."
                    description="Meet people through the stories and worlds you both chose to keep."
                    action={
                        <Link
                            href={route('shelf.index')}
                            className="bg-accent text-accent-foreground inline-flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium"
                        >
                            <LibraryBig className="size-5" aria-hidden="true" />
                            {summary.shelf_count} titles shaping your matches
                        </Link>
                    }
                />

                <div className="mt-6">
                    <FlashMessage />
                </div>

                <nav aria-label="Shelf Match views" className="border-border mt-6 flex gap-1 border-b">
                    {tabs.map((tab) => {
                        const active = filters.view === tab.value;
                        return (
                            <Link
                                key={tab.value}
                                href={route('matches.index', { view: tab.value })}
                                preserveScroll
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    'relative flex min-h-12 items-center gap-2 rounded-t-xl px-4 text-sm font-semibold transition-colors',
                                    active ? 'text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )}
                            >
                                {tab.label}
                                {tab.count !== undefined && (
                                    <span className={cn('rounded-lg px-2 py-0.5 text-xs tabular-nums', active ? 'bg-primary/10' : 'bg-muted')}>
                                        {tab.count}
                                    </span>
                                )}
                                {active && <span className="bg-primary absolute inset-x-4 bottom-0 h-0.5 rounded-full" aria-hidden="true" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-7">
                    {summary.shelf_count === 0 ? (
                        <EmptyMatches
                            icon={LibraryBig}
                            title="Your shelf starts the conversation"
                            description="Add at least one book, game, film, series, comic, or fandom. BlackFrame only recommends people after finding a real title you share."
                            action={{ label: 'Build my shelf', href: '/shelf' }}
                        />
                    ) : filters.view === 'connections' ? (
                        <Connections candidates={candidates} />
                    ) : (
                        <MatchDeck candidates={candidates} scoreModel={scoreModel} />
                    )}
                </div>
            </main>
        </AppLayout>
    );
}
