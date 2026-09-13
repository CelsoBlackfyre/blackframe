import { SocialAvatar } from '@/components/social/avatar';
import { Button } from '@/components/ui/button';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ImagePlus, MessageCircleMore } from 'lucide-react';

export function FeedComposer({ format = 'image' }: { format?: 'image' | 'text' }) {
    const { auth } = usePage<SharedData>().props;
    return (
        <section className="border-border bg-card rounded-2xl border p-4" aria-label="Create a post">
            <div className="flex items-center gap-3">
                <Link href={route('profiles.show', auth.user.username)} aria-label="Your profile" className="shrink-0 rounded-full">
                    <SocialAvatar name={auth.user.name} src={auth.user.avatar_url} />
                </Link>
                <Link
                    href={route('posts.create', { type: format })}
                    className="text-muted-foreground hover:text-foreground flex min-h-12 min-w-0 flex-1 items-center rounded-xl px-2 text-base transition-colors"
                >
                    What’s inspiring you, {auth.user.name.split(' ')[0]}?
                </Link>
                <div className="flex shrink-0 items-center gap-2">
                    <Button asChild variant="ghost" className="px-3">
                        <Link href={route('posts.create', { type: 'image' })}>
                            <ImagePlus className="text-primary" aria-hidden="true" />
                            <span className="sr-only sm:not-sr-only">Photo</span>
                        </Link>
                    </Button>
                    <Button asChild variant="secondary" className="px-3">
                        <Link href={route('posts.create', { type: 'text' })}>
                            <MessageCircleMore aria-hidden="true" />
                            <span className="sr-only sm:not-sr-only">Text</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
