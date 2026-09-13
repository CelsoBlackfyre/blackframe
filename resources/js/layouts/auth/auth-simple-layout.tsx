import AppLogo from '@/components/app-logo';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="bg-background grid min-h-dvh lg:grid-cols-2">
            <aside className="bg-muted relative hidden overflow-hidden lg:block" aria-label="Welcome to BlackFrame">
                <img
                    src="/images/campaign/culture-still-life.webp"
                    alt="Photography, music, and games collected together in the morning light."
                    width="1536"
                    height="1024"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/10 to-transparent" />
                <div className="absolute right-12 bottom-14 left-12 max-w-lg text-neutral-50">
                    <h2 className="text-6xl leading-[1.02] font-medium tracking-[-0.055em]">
                        Your photos.
                        <br />
                        Your shelf.
                        <br />
                        Your people.
                    </h2>
                    <p className="mt-6 max-w-sm text-base leading-7 text-neutral-200">A little space for everything that makes you, you.</p>
                </div>
            </aside>
            <div className="flex min-h-dvh flex-col px-6 sm:px-12 xl:px-20">
                <header className="flex h-24 shrink-0 items-center justify-between">
                    <Link href={route('home')} className="flex items-center gap-1" aria-label="BlackFrame home">
                        <AppLogo />
                    </Link>
                    <AppearanceToggleDropdown />
                </header>
                <main className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
                    <div className="mb-8">
                        <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{title}</h1>
                        <p className="text-muted-foreground mt-3 text-base leading-6">{description}</p>
                    </div>
                    {children}
                </main>
                <footer className="text-muted-foreground mx-auto flex w-full max-w-[400px] items-center justify-between gap-4 py-7 text-xs">
                    <Link href={route('home')} className="hover:text-foreground flex min-h-11 items-center gap-2 text-sm">
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        Back to BlackFrame
                    </Link>
                    <span>Made for shared taste.</span>
                </footer>
            </div>
        </div>
    );
}
