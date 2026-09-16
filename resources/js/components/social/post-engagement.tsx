import InputError from '@/components/input-error';
import { SocialAvatar } from '@/components/social/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { FeedAuthor, Paginated } from '@/types/feed';
import { Link, useForm } from '@inertiajs/react';
import { Heart, MessageCircle, Send, Trash2 } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';

interface ThreadComment {
    id: number;
    body: string;
    published_at: string;
    can_delete: boolean;
    author: Omit<FeedAuthor, 'id'>;
}

function CommentRow({ comment, postId, onRemoved }: { comment: ThreadComment; postId: number; onRemoved: () => void }) {
    const { t } = useTranslation();
    const form = useForm({});
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState('');
    return (
        <article className="flex gap-3 py-4">
            <SocialAvatar name={comment.author.name} src={comment.author.avatar_url} className="size-9" />
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <Link href={route('profiles.show', comment.author.username)} className="hover:text-primary text-sm font-semibold">
                        {comment.author.name}
                    </Link>
                    <span className="text-muted-foreground text-xs">{comment.published_at}</span>
                </div>
                <p className="mt-1 text-sm leading-6 whitespace-pre-wrap">{comment.body}</p>
                {error && (
                    <p role="alert" className="text-destructive mt-2 text-sm">
                        {error}
                    </p>
                )}
                {confirming && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-muted-foreground text-xs">{t('Delete this comment?')}</span>
                        <Button
                            size="sm"
                            variant="destructive"
                            disabled={form.processing}
                            onClick={() =>
                                form.delete(route('posts.comments.destroy', [postId, comment.id]), {
                                    preserveScroll: true,
                                    only: ['posts', 'pulse'],
                                    onSuccess: onRemoved,
                                    onError: () => setError(t('Couldn’t delete this comment. Please try again.')),
                                })
                            }
                        >
                            {form.processing ? t('Deleting…') : t('Delete')}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={form.processing}>
                            {t('Cancel')}
                        </Button>
                    </div>
                )}
            </div>
            {comment.can_delete && !confirming && (
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('Delete comment by {name}', { name: comment.author.name })}
                    onClick={() => setConfirming(true)}
                    className="text-muted-foreground shrink-0"
                >
                    <Trash2 aria-hidden="true" />
                </Button>
            )}
        </article>
    );
}

function Comments({ postId, count }: { postId: number; count: number }) {
    const { t, intlLocale } = useTranslation();
    const [open, setOpen] = useState(false);
    const [comments, setComments] = useState<ThreadComment[]>([]);
    const [nextPage, setNextPage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [announcement, setAnnouncement] = useState('');
    const controller = useRef<AbortController | null>(null);
    const form = useForm({ body: '' });

    const load = useCallback(
        async (url?: string, append = false) => {
            controller.current?.abort();
            const request = new AbortController();
            controller.current = request;
            setLoading(true);
            setError('');
            try {
                const response = await fetch(url ?? route('posts.comments.index', postId), {
                    headers: { Accept: 'application/json' },
                    signal: request.signal,
                });
                if (!response.ok) throw new Error('Unable to load comments');
                const result: Paginated<ThreadComment> = await response.json();
                if (request.signal.aborted) return;
                setComments((previous) =>
                    append ? [...previous, ...result.data.filter((item) => !previous.some((old) => old.id === item.id))] : result.data,
                );
                setNextPage(result.next_page_url);
            } catch {
                if (!request.signal.aborted) setError(t('Comments couldn’t load. Check your connection and try again.'));
            } finally {
                if (!request.signal.aborted) setLoading(false);
            }
        },
        [postId, t],
    );

    useEffect(() => {
        if (open) void load();
        return () => controller.current?.abort();
    }, [open, load]);

    function submit(event: FormEvent) {
        event.preventDefault();
        form.post(route('posts.comments.store', postId), {
            preserveScroll: true,
            only: ['posts', 'pulse'],
            onSuccess: () => {
                form.reset();
                setAnnouncement(t('Comment posted.'));
                void load();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="text-muted-foreground gap-2 px-3" aria-label={t('Open comments ({count})', { count })}>
                    <MessageCircle className="size-5!" strokeWidth={1.8} aria-hidden="true" />
                    <span className="text-sm tabular-nums">{count.toLocaleString(intlLocale)}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="flex max-h-[85dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
                <DialogHeader className="border-border border-b p-6 pr-12">
                    <DialogTitle className="text-xl">{t('Keep the conversation going')}</DialogTitle>
                    <DialogDescription>{t('Share a thought, ask a question, or find common ground.')}</DialogDescription>
                </DialogHeader>
                <div className="min-h-24 min-w-0 flex-1 overflow-y-auto px-6" aria-busy={loading}>
                    {loading && comments.length === 0 ? (
                        <div className="space-y-5 py-6" role="status">
                            <span className="sr-only">{t('Loading comments')}</span>
                            {[1, 2, 3].map((id) => (
                                <div key={id} className="flex gap-3">
                                    <Skeleton className="size-9 shrink-0 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-3 w-28" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : comments.length === 0 && !error ? (
                        <div className="py-10 text-center">
                            <MessageCircle className="text-primary mx-auto size-7" strokeWidth={1.5} aria-hidden="true" />
                            <p className="mt-3 font-medium">{t('Be the first to say something.')}</p>
                            <p className="text-muted-foreground mt-1 text-sm">{t('Good conversations start with a little curiosity.')}</p>
                        </div>
                    ) : (
                        <div className="divide-border divide-y">
                            {comments.map((comment) => (
                                <CommentRow
                                    key={comment.id}
                                    comment={comment}
                                    postId={postId}
                                    onRemoved={() => {
                                        setAnnouncement(t('Comment deleted.'));
                                        void load();
                                    }}
                                />
                            ))}
                        </div>
                    )}
                    {error && (
                        <div role="alert" className="py-5">
                            <p className="text-destructive text-sm">{error}</p>
                            <Button variant="outline" className="mt-3" onClick={() => void load()}>
                                {t('Try again')}
                            </Button>
                        </div>
                    )}
                    {nextPage && !error && (
                        <Button variant="ghost" disabled={loading} className="my-3 w-full" onClick={() => void load(nextPage, true)}>
                            {loading ? t('Loading…') : t('Earlier comments')}
                        </Button>
                    )}
                </div>
                <form onSubmit={submit} className="border-border border-t p-5 sm:p-6">
                    <Label htmlFor={`comment-${postId}`}>{t('Your comment')}</Label>
                    <Textarea
                        id={`comment-${postId}`}
                        value={form.data.body}
                        onChange={(event) => form.setData('body', event.target.value)}
                        maxLength={1000}
                        required
                        placeholder={t('Add to the conversation…')}
                        className="mt-2 min-h-24 resize-y"
                        aria-invalid={!!form.errors.body}
                        aria-describedby={`comment-error-${postId}`}
                    />
                    <InputError id={`comment-error-${postId}`} message={form.errors.body} className="mt-2" />
                    <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-muted-foreground text-xs tabular-nums">{form.data.body.length} / 1,000</span>
                        <Button type="submit" disabled={form.processing || !form.data.body.trim()}>
                            <Send aria-hidden="true" />
                            {form.processing ? t('Posting…') : t('Post comment')}
                        </Button>
                    </div>
                    <p role="status" className="sr-only">
                        {announcement}
                    </p>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function PostEngagement({
    post,
}: {
    post: { id: number; liked_by_viewer: boolean; likes_count: number; comments_count: number; can_delete: boolean };
}) {
    const { t, intlLocale } = useTranslation();
    const form = useForm({});
    const deleteForm = useForm({});
    const [error, setError] = useState('');
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    function toggleLike() {
        setError('');
        const options = {
            preserveScroll: true,
            preserveState: true,
            only: ['posts', 'pulse'],
            onError: () => setError(t('Your like couldn’t be updated. Please try again.')),
        };
        if (post.liked_by_viewer) form.delete(route('posts.likes.destroy', post.id), options);
        else form.post(route('posts.likes.store', post.id), options);
    }
    function deletePost() {
        setError('');
        deleteForm.delete(route('posts.destroy', post.id), {
            preserveScroll: true,
            only: ['posts', 'pulse', 'flash'],
            onError: () => setError(t('Your post couldn’t be deleted. Please try again.')),
        });
    }
    return (
        <div>
            <div role="group" aria-label={t('Post engagement')} className="-ml-2 flex items-center gap-2">
                <Button
                    variant="ghost"
                    onClick={toggleLike}
                    disabled={form.processing}
                    aria-label={post.liked_by_viewer ? t('Unlike this post') : t('Like this post')}
                    aria-pressed={post.liked_by_viewer}
                    className={cn('gap-2 px-3', post.liked_by_viewer ? 'text-primary hover:text-primary' : 'text-muted-foreground')}
                >
                    <Heart className={cn('size-5!', post.liked_by_viewer && 'fill-current')} strokeWidth={1.8} aria-hidden="true" />
                    <span className="text-sm tabular-nums">{post.likes_count.toLocaleString(intlLocale)}</span>
                </Button>
                <Comments postId={post.id} count={post.comments_count} />
                {post.can_delete && !confirmingDelete && (
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t('Delete this post')}
                        onClick={() => setConfirmingDelete(true)}
                        className="text-muted-foreground hover:text-destructive ml-auto shrink-0"
                    >
                        <Trash2 className="size-5!" strokeWidth={1.8} aria-hidden="true" />
                    </Button>
                )}
            </div>
            {confirmingDelete && (
                <div
                    role="alert"
                    className="border-destructive/30 bg-destructive/5 mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3.5 py-3"
                >
                    <p className="text-sm font-medium">{t('Delete this post? This can’t be undone.')}</p>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="destructive" onClick={deletePost} disabled={deleteForm.processing}>
                            {deleteForm.processing ? t('Deleting…') : t('Delete post')}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setConfirmingDelete(false)} disabled={deleteForm.processing}>
                            {t('Keep post')}
                        </Button>
                    </div>
                </div>
            )}
            {error && (
                <p role="alert" className="text-destructive mt-2 text-sm">
                    {error}
                </p>
            )}
        </div>
    );
}
