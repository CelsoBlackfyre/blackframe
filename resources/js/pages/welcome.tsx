import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SharedData } from '@/types';
import { useGSAP } from '@gsap/react';
import { Head, Link, usePage } from '@inertiajs/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, BookHeart, HeartHandshake, Images, LibraryBig, Sparkles, UsersRound } from 'lucide-react';
import { useRef, useState } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const chapters = [
    {
        title: 'Share the frame',
        description: 'Photos, thoughts, and everyday scenes stay at the center of the experience.',
        image: '/images/blackframe-hero.webp',
        imageAlt: 'Friends looking through photographs together on a rooftop.',
        icon: Images,
    },
    {
        title: 'Build your shelf',
        description: 'Keep the books, games, films, series, and worlds that shaped your taste in one living collection.',
        image: '/images/campaign/blackframe-collections.png',
        imageAlt: 'Friends discussing photographs and collections in a creative studio.',
        icon: LibraryBig,
    },
    {
        title: 'Find your people',
        description: 'Meet people through transparent compatibility based on what you both chose to keep.',
        image: '/images/campaign/blackframe-collections.png',
        imageAlt: 'A group of friends sharing items from their personal collections.',
        icon: HeartHandshake,
    },
];

function AccountActions({ authenticated, dark = false }: { authenticated: boolean; dark?: boolean }) {
    if (authenticated) {
        return (
            <Button asChild className="min-h-11 rounded-xl px-5">
                <Link href={route('matches.index')}>
                    Open Shelf Match
                    <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
            </Button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className={cn('min-h-11 rounded-xl px-4', dark && 'text-white hover:bg-white/10 hover:text-white')}>
                <Link href={route('login')}>Log in</Link>
            </Button>
            <Button asChild className="min-h-11 rounded-xl px-5">
                <Link href={route('register')}>Join BlackFrame</Link>
            </Button>
        </div>
    );
}

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const root = useRef<HTMLDivElement>(null);
    const [activeChapter, setActiveChapter] = useState(1);

    useGSAP(
        () => {
            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (reduceMotion) return;

            gsap.from('[data-hero-copy] > *', {
                y: 24,
                opacity: 0,
                duration: 0.75,
                stagger: 0.1,
                ease: 'power3.out',
            });
            gsap.fromTo('[data-hero-image]', { scale: 1.08, opacity: 0.55 }, { scale: 1, opacity: 1, duration: 1.1, ease: 'power2.out' });

            gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
                gsap.from(element, {
                    y: 28,
                    opacity: 0,
                    duration: 0.65,
                    ease: 'power2.out',
                    scrollTrigger: { trigger: element, start: 'top 84%', once: true },
                });
            });

            gsap.fromTo(
                '[data-statement]',
                { opacity: 0.25, y: 32 },
                {
                    opacity: 1,
                    y: 0,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '[data-statement-section]',
                        start: 'top 80%',
                        end: 'center 45%',
                        scrub: 0.8,
                    },
                },
            );
        },
        { scope: root },
    );

    return (
        <div ref={root} className="bg-background text-foreground min-h-dvh overflow-x-hidden">
            <Head title="Find people through what you love">
                <meta
                    name="description"
                    content="BlackFrame is a social space for sharing life, building your cultural shelf, and meeting people through the stories, worlds, and games you both love."
                />
                <link rel="preload" as="image" href="/images/campaign/blackframe-collections.png" type="image/png" />
            </Head>

            <div className="bg-neutral-950 text-white">
                <header className="relative z-20 mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
                    <Link href="/" aria-label="BlackFrame home" className="flex items-center">
                        <AppLogo />
                    </Link>
                    <nav aria-label="Account">
                        <AccountActions authenticated={Boolean(auth.user)} dark />
                    </nav>
                </header>

                <main>
                    <section className="relative mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-[1440px] flex-col gap-6 px-4 pb-8 sm:px-6 lg:block lg:px-10 lg:pb-10">
                        <div
                            data-hero-copy
                            className="relative z-10 max-w-4xl py-14 lg:absolute lg:top-1/2 lg:left-10 lg:w-[72%] lg:-translate-y-1/2 lg:py-0"
                        >
                            <h1 className="max-w-[870px] text-[clamp(3.4rem,6.6vw,5.4rem)] leading-[0.91] font-semibold tracking-[-0.06em] text-balance">
                                Your taste already knows your people.
                            </h1>
                            <p className="mt-7 max-w-xl text-base leading-7 text-neutral-300 sm:text-lg">
                                Share what moves you, keep the culture that shaped you, and discover people through the shelves you have in common.
                            </p>
                            <div className="mt-9 flex flex-wrap gap-3">
                                <Button asChild size="lg" className="min-h-12 rounded-xl px-6 text-base">
                                    <Link href={auth.user ? route('matches.index') : route('register')}>
                                        {auth.user ? 'Find shelf matches' : 'Create your shelf'}
                                        <ArrowRight className="size-4" aria-hidden="true" />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="min-h-12 rounded-xl border-white/20 bg-transparent px-6 text-base text-white hover:bg-white/10 hover:text-white"
                                >
                                    <a href="#how-it-connects">See how it connects</a>
                                </Button>
                            </div>
                        </div>

                        <div className="relative min-h-[55svh] overflow-hidden rounded-[1.75rem] border border-white/10 bg-neutral-900 lg:absolute lg:inset-x-10 lg:top-4 lg:bottom-10 lg:min-h-0 lg:rounded-[2rem]">
                            <img
                                data-hero-image
                                src="/images/campaign/blackframe-collections.png"
                                alt="Friends discussing photographs and personal collections in a creative studio."
                                width="1664"
                                height="935"
                                fetchPriority="high"
                                className="absolute inset-0 h-full w-full object-cover object-center"
                            />
                            <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between gap-4 rounded-2xl bg-black/72 p-4 backdrop-blur-md sm:right-6 sm:bottom-6 sm:left-6 sm:p-5 lg:left-auto lg:w-[45%]">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold sm:text-base">Culture is better when it is shared.</p>
                                    <p className="mt-1 hidden text-sm text-neutral-300 sm:block">
                                        Books, games, films, fandoms, and everything between.
                                    </p>
                                </div>
                                <Sparkles className="text-primary size-6 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                            </div>
                        </div>
                    </section>

                    <section id="how-it-connects" className="bg-background text-foreground scroll-mt-20 px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
                        <div className="mx-auto max-w-[1240px]">
                            <div data-reveal className="grid items-end gap-5 md:grid-cols-[1fr_auto]">
                                <h2 className="max-w-3xl text-4xl leading-[0.98] font-semibold tracking-[-0.045em] text-balance sm:text-5xl lg:text-6xl">
                                    One social space. Three ways in.
                                </h2>
                                <p className="text-muted-foreground max-w-sm text-sm leading-6 sm:text-base">
                                    BlackFrame connects everyday expression with the culture people carry with them.
                                </p>
                            </div>

                            <div data-reveal className="mt-12 flex min-h-[34rem] flex-col gap-3 lg:h-[36rem] lg:flex-row">
                                {chapters.map((chapter, index) => {
                                    const active = activeChapter === index;
                                    const Icon = chapter.icon;

                                    return (
                                        <button
                                            key={chapter.title}
                                            type="button"
                                            onClick={() => setActiveChapter(index)}
                                            aria-expanded={active}
                                            className={cn(
                                                'group border-border relative min-h-40 cursor-pointer overflow-hidden rounded-2xl border text-left transition-[flex] duration-500 ease-out focus-visible:outline-offset-4 motion-reduce:transition-none lg:min-h-0',
                                                active ? 'flex-[5]' : 'flex-1',
                                            )}
                                        >
                                            <img
                                                src={chapter.image}
                                                alt={active ? chapter.imageAlt : ''}
                                                loading="lazy"
                                                className={cn(
                                                    'absolute inset-0 h-full w-full object-cover transition duration-500 motion-reduce:transition-none',
                                                    index === 2 && 'object-right',
                                                    active ? 'scale-100 opacity-100' : 'scale-[1.04] opacity-60 grayscale-[35%]',
                                                )}
                                            />
                                            <span className="absolute inset-0 bg-black/45" aria-hidden="true" />
                                            <span className="absolute inset-x-0 bottom-0 z-10 p-5 text-white sm:p-6">
                                                <span className="flex items-center gap-3">
                                                    <span className="bg-primary flex size-10 items-center justify-center rounded-xl text-white">
                                                        <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
                                                    </span>
                                                    <strong className="text-lg font-semibold sm:text-xl">{chapter.title}</strong>
                                                </span>
                                                <span
                                                    className={cn(
                                                        'mt-3 block max-w-lg text-sm leading-6 text-neutral-200 transition-opacity duration-300',
                                                        active ? 'opacity-100' : 'lg:opacity-0',
                                                    )}
                                                >
                                                    {chapter.description}
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    <section className="bg-neutral-100 px-4 py-20 text-neutral-950 sm:px-6 lg:px-10 lg:py-28 dark:bg-neutral-900 dark:text-white">
                        <div className="mx-auto max-w-[1240px]">
                            <div data-reveal className="grid grid-flow-dense grid-cols-1 gap-4 lg:grid-cols-12">
                                <article className="bg-primary text-primary-foreground flex min-h-80 flex-col rounded-2xl p-6 sm:p-8 lg:col-span-7">
                                    <LibraryBig className="size-7" strokeWidth={1.7} aria-hidden="true" />
                                    <div className="mt-auto">
                                        <p className="max-w-xl text-3xl leading-tight font-semibold tracking-[-0.035em] sm:text-4xl">
                                            Your shelf is a living map of your taste.
                                        </p>
                                        <p className="mt-4 max-w-lg text-sm leading-6 opacity-85 sm:text-base">
                                            Search real catalog sources, add a status, mark favorites, and rate only when you want to.
                                        </p>
                                    </div>
                                </article>

                                <article className="flex min-h-80 flex-col rounded-2xl border border-neutral-300 bg-white p-6 sm:p-8 lg:col-span-5 dark:border-neutral-700 dark:bg-neutral-950">
                                    <BookHeart className="text-primary size-7" strokeWidth={1.7} aria-hidden="true" />
                                    <div className="mt-auto">
                                        <p className="text-6xl font-semibold tracking-[-0.06em] tabular-nums">55%</p>
                                        <h3 className="mt-4 text-xl font-semibold">Collection overlap leads the score.</h3>
                                        <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                                            Favorites, shelf status, and rating closeness complete the picture. Every signal is visible.
                                        </p>
                                    </div>
                                </article>

                                <article className="flex min-h-80 flex-col rounded-2xl border border-neutral-300 bg-white p-6 sm:p-8 lg:col-span-5 dark:border-neutral-700 dark:bg-neutral-950">
                                    <UsersRound className="text-primary size-7" strokeWidth={1.7} aria-hidden="true" />
                                    <div className="mt-auto">
                                        <h3 className="text-2xl font-semibold tracking-[-0.025em]">Interest stays private.</h3>
                                        <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                                            Choosing Connect does not manufacture a relationship. A match appears only after the other person
                                            independently connects too.
                                        </p>
                                    </div>
                                </article>

                                <article className="relative min-h-80 overflow-hidden rounded-2xl bg-neutral-950 lg:col-span-7">
                                    <img
                                        src="/images/campaign/blackframe-collections.png"
                                        alt="Friends sharing photography and media collections."
                                        loading="lazy"
                                        className="absolute inset-0 h-full w-full object-cover object-right opacity-75"
                                    />
                                    <div className="absolute right-5 bottom-5 left-5 rounded-xl bg-black/72 p-5 text-white backdrop-blur-md sm:right-7 sm:bottom-7 sm:left-7">
                                        <HeartHandshake className="text-primary size-6" strokeWidth={1.8} aria-hidden="true" />
                                        <p className="mt-3 max-w-xl text-2xl font-semibold tracking-[-0.025em]">
                                            Start with a shared world. Let the conversation become its own.
                                        </p>
                                    </div>
                                </article>
                            </div>
                        </div>
                    </section>

                    <section data-statement-section className="bg-neutral-950 px-4 py-24 text-white sm:px-6 lg:px-10 lg:py-36">
                        <div className="mx-auto max-w-[1240px]">
                            <p
                                data-statement
                                className="max-w-5xl text-4xl leading-[1.02] font-semibold tracking-[-0.05em] text-balance sm:text-5xl lg:text-7xl"
                            >
                                Social discovery feels different when the first question is not “how popular are you?” but “what stayed with you?”
                            </p>
                        </div>
                    </section>

                    <section className="bg-primary text-primary-foreground px-4 py-20 sm:px-6 lg:px-10 lg:py-24">
                        <div data-reveal className="mx-auto flex max-w-[1240px] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h2 className="max-w-3xl text-4xl leading-none font-semibold tracking-[-0.045em] text-balance sm:text-5xl lg:text-6xl">
                                    Put something you love on the shelf.
                                </h2>
                                <p className="mt-5 max-w-xl text-base leading-7 opacity-85">
                                    One title is enough to begin. Every thoughtful addition makes discovery more useful.
                                </p>
                            </div>
                            <Button asChild size="lg" variant="secondary" className="min-h-13 shrink-0 rounded-xl px-7 text-base text-neutral-950">
                                <Link href={auth.user ? route('shelf.index') : route('register')}>
                                    {auth.user ? 'Open your shelf' : 'Start on BlackFrame'}
                                    <ArrowRight className="size-4" aria-hidden="true" />
                                </Link>
                            </Button>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-white/10 bg-neutral-950 px-4 py-8 text-white sm:px-6 lg:px-10">
                    <div className="mx-auto flex max-w-[1240px] flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <Link href="/" className="flex items-center">
                            <AppLogo />
                        </Link>
                        <p className="text-neutral-400">Share the frame. Keep the culture. Find your people.</p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
