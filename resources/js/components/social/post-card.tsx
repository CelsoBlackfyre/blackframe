import { SubjectBadge } from '@/components/subjects/subject-badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FeedPost } from '@/types/feed';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, ImageOff, MapPin } from 'lucide-react';
import { useState } from 'react';
import { SocialAvatar } from './avatar';
import { PostEngagement } from './post-engagement';

export function PostCard({ post, eager = false }: { post: FeedPost; eager?: boolean }) {
    const [activeImage, setActiveImage] = useState(0);
    const [expanded, setExpanded] = useState(false);
    const [failedImage, setFailedImage] = useState<string | null>(null);
    const image = post.media[activeImage];
    const caption = post.caption ?? '';
    return (
        <article className="border-border bg-card overflow-hidden rounded-2xl border">
            <header className="flex items-center gap-3 px-4 py-4 sm:px-5">
                <Link href={route('profiles.show', post.author.username)} aria-label={`View ${post.author.name}'s profile`} className="rounded-full">
                    <SocialAvatar name={post.author.name} src={post.author.avatar_url} />
                </Link>
                <div className="min-w-0 flex-1">
                    <Link
                        href={route('profiles.show', post.author.username)}
                        className="hover:text-primary block truncate rounded text-sm font-semibold"
                    >
                        {post.author.name}
                    </Link>
                    <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
                        {post.location ? (
                            <>
                                <MapPin className="size-3 shrink-0" aria-hidden="true" />
                                <span className="truncate">{post.location}</span>
                            </>
                        ) : (
                            `@${post.author.username}`
                        )}
                    </p>
                </div>
                <span className="text-muted-foreground shrink-0 text-xs">{post.published_at}</span>
            </header>
            <div className="bg-muted relative aspect-[4/3] overflow-hidden sm:aspect-[1.18]">
                {image && failedImage !== image.url ? (
                    <Dialog>
                        <DialogTrigger asChild>
                            <button
                                type="button"
                                className="absolute inset-0 h-full w-full cursor-zoom-in"
                                aria-label={`View photo by ${post.author.name}`}
                            >
                                <img
                                    src={image.url}
                                    alt={image.alt_text}
                                    width={image.width ?? 1200}
                                    height={image.height ?? 1500}
                                    loading={eager ? 'eager' : 'lazy'}
                                    fetchPriority={eager ? 'high' : 'auto'}
                                    onError={() => setFailedImage(image.url)}
                                    className="h-full w-full object-cover"
                                />
                            </button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[94dvh] max-w-[min(94vw,1100px)] p-3 pt-12">
                            <DialogHeader className="sr-only">
                                <DialogTitle>Photo by {post.author.name}</DialogTitle>
                                <DialogDescription>{image.alt_text}</DialogDescription>
                            </DialogHeader>
                            <img
                                src={image.url}
                                alt={image.alt_text}
                                width={image.width ?? 1200}
                                height={image.height ?? 1500}
                                className="max-h-[80dvh] w-full rounded-lg object-contain"
                            />
                        </DialogContent>
                    </Dialog>
                ) : (
                    <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
                        <ImageOff className="size-7" strokeWidth={1.5} aria-hidden="true" />
                        <p className="text-sm">This photo is unavailable.</p>
                    </div>
                )}
                {post.media.length > 1 && (
                    <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between gap-3">
                        <Button
                            variant="secondary"
                            size="icon"
                            aria-label="Previous photo"
                            disabled={activeImage === 0}
                            onClick={() => setActiveImage((index) => index - 1)}
                        >
                            <ArrowLeft aria-hidden="true" />
                        </Button>
                        <span className="bg-card text-foreground rounded-full px-3 py-1.5 text-xs font-semibold tabular-nums" role="status">
                            {activeImage + 1} / {post.media.length}
                        </span>
                        <Button
                            variant="secondary"
                            size="icon"
                            aria-label="Next photo"
                            disabled={activeImage === post.media.length - 1}
                            onClick={() => setActiveImage((index) => index + 1)}
                        >
                            <ArrowRight aria-hidden="true" />
                        </Button>
                    </div>
                )}
            </div>
            <div className="space-y-3 p-4 sm:px-5">
                <PostEngagement post={post} />
                {caption && (
                    <div>
                        <p className="text-[15px] leading-6 whitespace-pre-wrap">
                            <Link href={route('profiles.show', post.author.username)} className="hover:text-primary mr-2 rounded font-semibold">
                                {post.author.username}
                            </Link>
                            {!expanded && caption.length > 240 ? `${caption.slice(0, 240)}…` : caption}
                        </p>
                        {caption.length > 240 && (
                            <button
                                onClick={() => setExpanded((value) => !value)}
                                aria-expanded={expanded}
                                className="text-muted-foreground hover:text-primary min-h-11 text-sm font-medium"
                            >
                                {expanded ? 'Show less' : 'Read more'}
                            </button>
                        )}
                    </div>
                )}
                {post.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-2" aria-label="Topics in this post">
                        {post.subjects.map((subject) => (
                            <SubjectBadge key={subject.id} subject={subject} />
                        ))}
                    </div>
                )}
                {post.comments.length > 0 && (
                    <div className="border-border space-y-2 border-t pt-3">
                        {post.comments.map((comment) => (
                            <p key={comment.id} className="text-muted-foreground text-sm leading-6">
                                <Link
                                    href={route('profiles.show', comment.author.username)}
                                    className="text-foreground hover:text-primary mr-2 rounded font-medium"
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
