import { SubjectBadge } from '@/components/subjects/subject-badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PulsePost } from '@/types/pulse';
import { useForm } from '@inertiajs/react';
import { Heart, LoaderCircle, MessageCircle } from 'lucide-react';
import { SocialAvatar } from './avatar';

export function PulsePostCard({ post }: { post: PulsePost }) {
    const likeForm = useForm({});

    const toggleLike = () => {
        const options = {
            preserveScroll: true,
            preserveState: true,
            only: ['posts'],
        };

        if (post.liked_by_viewer) {
            likeForm.delete(route('posts.likes.destroy', post.id), options);
            return;
        }

        likeForm.post(route('posts.likes.store', post.id), options);
    };

    return (
        <article className="border-border bg-card rounded-2xl border px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex items-start gap-3">
                <SocialAvatar name={post.author.name} src={post.author.avatar_url} />
                <div className="min-w-0 flex-1">
                    <header className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <p className="font-semibold">{post.author.name}</p>
                        <p className="text-muted-foreground text-sm">@{post.author.username}</p>
                        {post.published_at && <p className="text-muted-foreground text-sm">{post.published_at}</p>}
                    </header>

                    {post.subjects.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2" aria-label="Topics in this post">
                            {post.subjects.map((subject) => (
                                <SubjectBadge key={subject.id} subject={subject} />
                            ))}
                        </div>
                    )}

                    <p className="mt-2 text-[15px] leading-6 [overflow-wrap:anywhere] whitespace-pre-wrap sm:text-base">{post.body}</p>

                    <div className="mt-3 flex items-center gap-3" aria-label="Post engagement">
                        <div className="flex items-center gap-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={toggleLike}
                                disabled={likeForm.processing}
                                aria-label={post.liked_by_viewer ? 'Unlike this post' : 'Like this post'}
                                aria-pressed={post.liked_by_viewer}
                                className={cn(
                                    'size-11 cursor-pointer rounded-xl transition-colors',
                                    post.liked_by_viewer && 'text-primary hover:text-primary',
                                )}
                            >
                                {likeForm.processing ? (
                                    <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                                ) : (
                                    <Heart className={cn('size-5', post.liked_by_viewer && 'fill-current')} strokeWidth={1.8} aria-hidden="true" />
                                )}
                            </Button>
                            <span className="text-muted-foreground min-w-6 text-sm font-medium tabular-nums">
                                {post.likes_count.toLocaleString()}
                            </span>
                        </div>

                        <div className="text-muted-foreground flex min-h-11 items-center gap-2" aria-label={`${post.comments_count} replies`}>
                            <MessageCircle className="size-5" strokeWidth={1.8} aria-hidden="true" />
                            <span className="text-sm font-medium tabular-nums">{post.comments_count.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
