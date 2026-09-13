import AppLogo from '@/components/app-logo';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Button } from '@/components/ui/button';
import { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowRight, BookOpen, HeartHandshake, Images, LockKeyhole, MessageCircleMore, Plus } from 'lucide-react';

const interests = ['Films', 'Books', 'Games', 'Anime', 'Music', 'Comics', 'Your next obsession'];

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const destination = auth.user ? route('feed') : route('register');
    const action = auth.user ? 'Open BlackFrame' : 'Join BlackFrame';

    return (
        <div className="bg-background text-foreground min-h-dvh">
            <Head title="Find people through what you love">
                <meta
                    name="description"
                    content="Share your everyday, collect the stories that stay with you, and meet people through the culture you love. Find your people on BlackFrame."
                />
                <meta property="og:title" content="BlackFrame · A little more you." />
                <meta property="og:description" content="Your photos. Your shelf. Your people. A social space built around shared taste." />
                <link rel="preload" as="image" href="/images/campaign/culture-still-life.webp" type="image/webp" />
            </Head>
            <a
                href="#main-content"
                className="bg-primary text-primary-foreground fixed top-3 left-3 z-50 -translate-y-24 rounded-xl px-5 py-3 focus:translate-y-0"
            >
                Skip to content
            </a>
            <header className="border-border mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-4 border-b px-5 sm:px-8 lg:px-12">
                <Link href="/" aria-label="BlackFrame home" className="flex min-h-11 shrink-0 items-center gap-1">
                    <span className="flex sm:hidden">
                        <AppLogo compact />
                    </span>
                    <span className="hidden items-center gap-1 sm:flex">
                        <AppLogo />
                    </span>
                </Link>
                <nav aria-label="Main navigation" className="hidden items-center gap-8 text-sm font-medium lg:flex">
                    <a href="#how-it-connects" className="hover:text-primary py-3 transition-colors">
                        The experience
                    </a>
                    <a href="#your-people" className="hover:text-primary py-3 transition-colors">
                        Built for connection
                    </a>
                </nav>
                <div className="flex items-center gap-2">
                    <AppearanceToggleDropdown />
                    {!auth.user && (
                        <Button asChild variant="ghost" className="px-3">
                            <Link href={route('login')}>Log in</Link>
                        </Button>
                    )}
                    <Button asChild className="px-4 sm:px-5">
                        <Link href={destination}>
                            {action}
                            <ArrowRight aria-hidden="true" className="hidden sm:block" />
                        </Link>
                    </Button>
                </div>
            </header>
            <main id="main-content" tabIndex={-1}>
                <section className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-12 sm:px-8 lg:min-h-[620px] lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:px-12 lg:py-14">
                    <div className="max-w-xl">
                        <p className="text-primary mb-6 text-xs font-semibold tracking-[0.16em] uppercase">A social space for shared taste</p>
                        <h1 className="text-[clamp(3.7rem,6.3vw,6rem)] leading-[0.99] font-medium tracking-[-0.065em]">
                            A little more
                            <br />
                            <span className="text-primary">you.</span>
                        </h1>
                        <p className="text-muted-foreground mt-7 max-w-[380px] text-lg leading-7">
                            Share your everyday. Collect what you love. Find the people who get it.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Button asChild size="lg">
                                <Link href={destination}>
                                    {action}
                                    <ArrowRight aria-hidden="true" />
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="ghost" className="px-3 sm:px-7">
                                <a href="#how-it-connects">
                                    Take a look
                                    <ArrowDown aria-hidden="true" />
                                </a>
                            </Button>
                        </div>
                    </div>
                    <div className="relative">
                        <img
                            src="/images/campaign/culture-still-life.webp"
                            alt="An open photography book, vinyl record, headphones, and game controller arranged in the morning light."
                            width="1536"
                            height="1024"
                            fetchPriority="high"
                            className="aspect-[1.08] w-full rounded-[1.5rem] object-cover lg:aspect-[1.02]"
                        />
                    </div>
                </section>
                <div className="border-border border-y">
                    <div className="text-muted-foreground mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 py-5 text-sm font-medium sm:px-8 lg:px-12">
                        {interests.map((interest) => (
                            <span key={interest}>{interest}</span>
                        ))}
                    </div>
                </div>
                <section id="how-it-connects" className="mx-auto max-w-[1440px] scroll-mt-8 px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
                    <h2 className="max-w-xl text-4xl leading-[1.1] font-medium tracking-[-0.045em] sm:text-5xl">
                        Good things deserve
                        <br />a place to live.
                    </h2>
                    <p className="text-muted-foreground mt-5 max-w-lg text-base leading-7">
                        From the photo you took this morning to the story you can’t stop thinking about. Bring it all together.
                    </p>
                    <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-[1.25fr_0.75fr]">
                        <article className="bg-card border-border overflow-hidden rounded-2xl border md:row-span-2">
                            <img
                                src="/images/blackframe-hero.webp"
                                alt="Friends looking through printed photographs together outdoors."
                                width="1200"
                                height="800"
                                loading="lazy"
                                className="aspect-[16/10] w-full object-cover"
                            />
                            <div className="p-6 sm:p-8">
                                <Images className="text-primary size-6" strokeWidth={1.6} aria-hidden="true" />
                                <h3 className="mt-4 text-2xl font-medium tracking-tight">Everyday, through your eyes.</h3>
                                <p className="text-muted-foreground mt-3 max-w-md leading-7">
                                    Share photos in Home, start a thought in Pulse, and keep the conversation going in the comments.
                                </p>
                            </div>
                        </article>
                        <article className="bg-accent rounded-2xl p-6 sm:p-8">
                            <BookOpen className="text-primary size-6" strokeWidth={1.6} aria-hidden="true" />
                            <h3 className="mt-5 text-2xl font-medium tracking-tight">A shelf that says something.</h3>
                            <p className="text-muted-foreground mt-3 leading-7">
                                Keep your favorites, track what’s in progress, and make room for whatever comes next.
                            </p>
                            <div className="border-primary/20 mt-7 flex items-center gap-3 border-t pt-5 text-sm font-medium">
                                <Plus className="text-primary size-4" aria-hidden="true" />
                                Start with one title you love.
                            </div>
                        </article>
                        <article className="bg-secondary rounded-2xl p-6 sm:p-8">
                            <MessageCircleMore className="text-primary size-6" strokeWidth={1.6} aria-hidden="true" />
                            <h3 className="mt-5 text-2xl font-medium tracking-tight">Skip the small talk.</h3>
                            <p className="text-muted-foreground mt-3 leading-7">
                                Find a familiar favorite on someone else’s shelf. You already have something to talk about.
                            </p>
                        </article>
                    </div>
                </section>
                <section id="your-people" className="border-border scroll-mt-8 border-y">
                    <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:px-12 lg:py-24">
                        <div>
                            <p className="text-primary mb-5 text-xs font-semibold tracking-[0.16em] uppercase">Connection, with context</p>
                            <h2 className="max-w-md text-4xl leading-[1.1] font-medium tracking-[-0.045em] sm:text-5xl">
                                Your kind of people.
                                <br />
                                Your kind of pace.
                            </h2>
                            <p className="text-muted-foreground mt-5 max-w-md leading-7">
                                You choose what to share and who to connect with. Your taste opens the door.
                            </p>
                        </div>
                        <div className="space-y-8">
                            <div className="flex gap-5">
                                <HeartHandshake className="text-primary mt-1 size-6 shrink-0" strokeWidth={1.6} aria-hidden="true" />
                                <div>
                                    <h3 className="text-xl font-medium">Shared favorites. Real common ground.</h3>
                                    <p className="text-muted-foreground mt-2 leading-7">
                                        Shelf Match shows what you have in common and explains every part of your compatibility.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-5">
                                <LockKeyhole className="text-primary mt-1 size-6 shrink-0" strokeWidth={1.6} aria-hidden="true" />
                                <div>
                                    <h3 className="text-xl font-medium">A conversation takes two.</h3>
                                    <p className="text-muted-foreground mt-2 leading-7">
                                        Direct opens when you both choose Connect. Your interest stays private until it’s mutual.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
                    <div className="bg-accent rounded-2xl p-8 sm:p-12 lg:p-16">
                        <h2 className="max-w-2xl text-4xl leading-[1.1] font-medium tracking-[-0.045em] sm:text-5xl">
                            There’s a place
                            <br />
                            for your kind of curious.
                        </h2>
                        <p className="text-muted-foreground mt-5 max-w-md leading-7">Bring a favorite. Share a moment. See who you find.</p>
                        <Button asChild size="lg" className="mt-7">
                            <Link href={destination}>
                                {action}
                                <ArrowRight aria-hidden="true" />
                            </Link>
                        </Button>
                    </div>
                </section>
            </main>
            <footer className="border-border mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-6 border-t px-5 py-8 sm:px-8 lg:px-12">
                <Link href="/" className="flex items-center gap-1">
                    <AppLogo />
                </Link>
                <p className="text-muted-foreground text-sm">Share the frame. Keep the culture. Find your people.</p>
                {!auth.user && (
                    <Link href={route('login')} className="hover:text-primary py-3 text-sm font-medium">
                        Log in
                        <ArrowRight className="ml-2 inline size-4" aria-hidden="true" />
                    </Link>
                )}
            </footer>
        </div>
    );
}
