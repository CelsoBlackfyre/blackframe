import { SubjectBadge } from '@/components/subjects/subject-badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FeedPost } from '@/types/feed';
import { Link, useForm } from '@inertiajs/react';
import { Heart, LoaderCircle, MessageCircle } from 'lucide-react';
import { SocialAvatar } from './avatar';

interface PostCardProps {
    post: FeedPost;
    eager?: boolean;
}

export function PostCard({ post, eager = false }: PostCardProps) {
    const likeForm = useForm({});
    const image = post.media[0];

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
        <article className="border-border bg-card text-card-foreground overflow-hidden rounded-2xl border shadow-[0_10px_35px_rgba(30,20,24,0.06)] dark:shadow-none">
            <header className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                <Link href={route('profiles.show', post.author.username)} aria-label={`View ${post.author.name}'s profile`} className="rounded-full">
                    <SocialAvatar name={post.author.name} src={post.author.avatar_url} />
                </Link>
                <div className="min-w-0 flex-1">
                    <Link
                        href={route('profiles.show', post.author.username)}
                        className="hover:text-primary block truncate rounded text-sm font-semibold"
                    >
                        {post.author.username}
                    </Link>
                    <p className="text-muted-foreground truncate text-xs">{[post.location, post.published_at].filter(Boolean).join(' | ')}</p>
                </div>
            </header>

            {image ? (
                <div className="bg-muted aspect-[4/5] overflow-hidden">
                    <img
                        src={image.url}
                        alt={image.alt_text}
                        width={image.width ?? 1200}
                        height={image.height ?? 1500}
                        loading={eager ? 'eager' : 'lazy'}
                        fetchPriority={eager ? 'high' : 'auto'}
                        className="h-full w-full object-cover"
                    />
                </div>
            ) : (
                <div className="bg-muted text-muted-foreground flex aspect-[4/3] items-center justify-center px-8 text-center text-sm">
                    This post has no available media.
                </div>
            )}

            <div className="space-y-3 px-4 py-4 sm:px-5">
                <div className="flex items-center gap-2" aria-label="Post engagement">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={toggleLike}
                        disabled={likeForm.processing}
                        aria-label={post.liked_by_viewer ? 'Unlike this post' : 'Like this post'}
                        aria-pressed={post.liked_by_viewer}
                        className={cn(
                            'active:bg-muted size-11 cursor-pointer rounded-xl transition-colors',
                            post.liked_by_viewer && 'text-primary hover:text-primary',
                        )}
                    >
                        {likeForm.processing ? (
                            <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                        ) : (
                            <Heart className={cn('size-5', post.liked_by_viewer && 'fill-current')} strokeWidth={1.8} aria-hidden="true" />
                        )}
                    </Button>
                    <span className="min-w-8 text-sm font-semibold tabular-nums">{post.likes_count.toLocaleString()}</span>
                    <div className="text-muted-foreground ml-2 flex min-h-11 items-center gap-2" aria-label={`${post.comments_count} comments`}>
                        <MessageCircle className="size-5" strokeWidth={1.8} aria-hidden="true" />
                        <span className="text-sm font-medium tabular-nums">{post.comments_count.toLocaleString()}</span>
                    </div>
                </div>

                {post.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-2" aria-label="Topics in this post">
                        {post.subjects.map((subject) => (
                            <SubjectBadge key={subject.id} subject={subject} />
                        ))}
                    </div>
                )}

                {post.caption && (
                    <p className="text-[15px] leading-6">
                        <Link href={route('profiles.show', post.author.username)} className="hover:text-primary mr-2 rounded font-semibold">
                            {post.author.username}
                        </Link>
                        {post.caption}
                    </p>
                )}

                {post.comments.length > 0 && (
                    <div className="border-border/70 space-y-1.5 border-t pt-3">
                        {post.comments.map((comment) => (
                            <p key={comment.id} className="text-muted-foreground text-sm leading-5">
                                <Link
                                    href={route('profiles.show', comment.author.username)}
                                    className="text-foreground hover:text-primary mr-2 rounded font-semibold"
                                >
                                    {comment.author.username}
                                </Link>
                                {comment.body}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}
