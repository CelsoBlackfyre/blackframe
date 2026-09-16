import { SubjectBadge } from '@/components/subjects/subject-badge';
import { useTranslation } from '@/lib/i18n';
import { PulsePost } from '@/types/pulse';
import { Link } from '@inertiajs/react';
import { SocialAvatar } from './avatar';
import { PostEngagement } from './post-engagement';

export function PulsePostCard({ post }: { post: PulsePost }) {
    const { t } = useTranslation();

    return (
        <article className="border-border bg-card rounded-2xl border p-5 sm:p-6">
            <header className="flex items-center gap-3">
                <Link
                    href={route('profiles.show', post.author.username)}
                    aria-label={t("View {name}'s profile", { name: post.author.name })}
                    className="rounded-full"
                >
                    <SocialAvatar name={post.author.name} src={post.author.avatar_url} />
                </Link>
                <div className="min-w-0 flex-1">
                    <Link
                        href={route('profiles.show', post.author.username)}
                        className="hover:text-primary block truncate rounded text-sm font-semibold"
                    >
                        {post.author.name}
                    </Link>
                    <p className="text-muted-foreground mt-0.5 truncate text-xs">@{post.author.username}</p>
                </div>
                <span className="text-muted-foreground text-xs">{post.published_at}</span>
            </header>
            <p className="mt-5 text-base leading-7 whitespace-pre-wrap sm:text-lg sm:leading-8">{post.body}</p>
            {post.subjects.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2" aria-label={t('Topics in this post')}>
                    {post.subjects.map((subject) => (
                        <SubjectBadge key={subject.id} subject={subject} />
                    ))}
                </div>
            )}
            <div className="border-border mt-5 border-t pt-3">
                <PostEngagement post={post} />
            </div>
        </article>
    );
}
