import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Images, MessageCircleMore } from 'lucide-react';

export function FeedTabs({ active }: { active: 'home' | 'pulse' }) {
    return (
        <nav className="border-border flex items-center gap-6 border-b" aria-label="Timeline views">
            {[
                { id: 'home', label: 'Home', href: route('feed'), icon: Images },
                { id: 'pulse', label: 'Pulse', href: route('pulse'), icon: MessageCircleMore },
            ].map((tab) => (
                <Link
                    key={tab.id}
                    href={tab.href}
                    prefetch
                    aria-current={active === tab.id ? 'page' : undefined}
                    className={cn(
                        'relative -mb-px flex min-h-12 items-center gap-2 border-b-2 px-1 text-sm font-semibold transition-colors',
                        active === tab.id ? 'border-primary text-foreground' : 'text-muted-foreground hover:text-foreground border-transparent',
                    )}
                >
                    <tab.icon className="size-4" strokeWidth={1.8} aria-hidden="true" />
                    {tab.label}
                </Link>
            ))}
            <span className="text-muted-foreground ml-auto text-xs">Latest from your circle</span>
        </nav>
    );
}
