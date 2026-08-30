import { SocialAvatar } from '@/components/social/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { DirectActiveConversation, DirectConversationSummary, DirectMessage } from '@/types/direct';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, BookHeart, Inbox, LoaderCircle, MessageSquareText, Search, Send, Sparkles } from 'lucide-react';
import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Direct', href: '/direct' }];

interface DirectPageProps {
    conversations: DirectConversationSummary[];
    active: DirectActiveConversation | null;
}

function formatInboxTime(value: string): string {
    const date = new Date(value);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
        return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date);
    }

    const daysAgo = Math.floor((now.getTime() - date.getTime()) / 86_400_000);

    if (daysAgo < 7) {
        return new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date);
    }

    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
}

function formatMessageTime(value: string): string {
    return new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}

function EmptyInbox() {
    return (
        <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
                <Inbox className="size-6" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-lg font-semibold">Your Direct inbox is quiet</h2>
            <p className="text-muted-foreground mt-2 max-w-xs text-sm leading-6">
                Private conversations unlock when you and another person both choose Connect in Shelf Match.
            </p>
            <Button asChild className="mt-6 min-h-11 rounded-xl px-5">
                <Link href="/matches?view=connections">View Shelf Matches</Link>
            </Button>
        </div>
    );
}

function EmptySelection() {
    return (
        <div className="flex h-full min-h-96 flex-col items-center justify-center px-8 text-center">
            <span className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-2xl">
                <MessageSquareText className="size-7" strokeWidth={1.7} aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-semibold">Choose a conversation</h2>
            <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-6">
                Direct is where mutual Shelf Matches can move from shared taste to a private conversation.
            </p>
        </div>
    );
}

function ConversationRow({ conversation, active }: { conversation: DirectConversationSummary; active: boolean }) {
    const preview = conversation.last_message
        ? `${conversation.last_message.is_mine ? 'You: ' : ''}${conversation.last_message.body}`
        : 'Start the conversation';

    return (
        <li>
            <Link
                href={route('direct.show', conversation.id)}
                preserveState
                aria-current={active ? 'page' : undefined}
                className={cn(
                    'focus-visible:ring-ring flex min-h-20 items-center gap-3 rounded-2xl px-3 py-3 transition-colors focus-visible:ring-2 focus-visible:outline-none',
                    active ? 'bg-primary/10' : 'hover:bg-muted',
                )}
            >
                <div className="relative shrink-0">
                    <SocialAvatar name={conversation.person.name} src={conversation.person.avatar_url} className="size-12" />
                    {conversation.unread_count > 0 && (
                        <span className="border-card bg-primary absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2" aria-hidden="true" />
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                        <p className={cn('truncate text-sm', conversation.unread_count > 0 ? 'font-bold' : 'font-semibold')}>
                            {conversation.person.name}
                        </p>
                        {conversation.last_message && (
                            <time
                                dateTime={conversation.last_message.created_at}
                                className={cn(
                                    'shrink-0 text-[0.6875rem] tabular-nums',
                                    conversation.unread_count > 0 ? 'text-primary font-semibold' : 'text-muted-foreground',
                                )}
                            >
                                {formatInboxTime(conversation.last_message.created_at)}
                            </time>
                        )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                        <p
                            className={cn(
                                'min-w-0 flex-1 truncate text-sm',
                                conversation.unread_count > 0 ? 'text-foreground font-semibold' : 'text-muted-foreground',
                            )}
                        >
                            {preview}
                        </p>
                        {conversation.unread_count > 0 && (
                            <span className="bg-primary text-primary-foreground min-w-5 shrink-0 rounded-full px-1.5 text-center text-[0.625rem] leading-5 font-semibold tabular-nums">
                                {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                                <span className="sr-only"> unread messages</span>
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </li>
    );
}

function InboxPane({ conversations, activeId }: { conversations: DirectConversationSummary[]; activeId?: number }) {
    const [query, setQuery] = useState('');
    const filtered = useMemo(() => {
        const normalized = query.trim().toLocaleLowerCase();

        if (!normalized) return conversations;

        return conversations.filter((conversation) =>
            `${conversation.person.name} ${conversation.person.username}`.toLocaleLowerCase().includes(normalized),
        );
    }, [conversations, query]);

    return (
        <section className={cn('flex min-h-0 flex-col', activeId ? 'hidden lg:flex' : 'flex')} aria-label="Direct inbox">
            <header className="border-border border-b px-4 py-5 sm:px-5">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-[-0.025em]">Direct</h1>
                        <p className="text-muted-foreground mt-1 text-xs">Private conversations from Shelf Match</p>
                    </div>
                    <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
                        <MessageSquareText className="size-5" strokeWidth={1.8} aria-hidden="true" />
                    </span>
                </div>
                {conversations.length > 0 && (
                    <div className="mt-5">
                        <Label htmlFor="conversation-search" className="text-xs font-semibold">
                            Search conversations
                        </Label>
                        <div className="relative mt-2">
                            <Search
                                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                                strokeWidth={1.8}
                                aria-hidden="true"
                            />
                            <Input
                                id="conversation-search"
                                type="search"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Name or username"
                                className="h-11 rounded-xl pl-10 text-base"
                            />
                        </div>
                    </div>
                )}
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-2">
                {conversations.length === 0 ? (
                    <EmptyInbox />
                ) : filtered.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <p className="font-semibold">No conversations found</p>
                        <p className="text-muted-foreground mt-1 text-sm">Try another name or username.</p>
                    </div>
                ) : (
                    <ul className="space-y-1">
                        {filtered.map((conversation) => (
                            <ConversationRow key={conversation.id} conversation={conversation} active={conversation.id === activeId} />
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}

function MessageBubble({ message }: { message: DirectMessage }) {
    return (
        <li
            className={cn('flex', message.is_mine ? 'justify-end' : 'justify-start')}
            aria-label={message.is_mine ? 'You said' : `${message.author.name} said`}
        >
            <div className={cn('max-w-[82%] sm:max-w-[72%]', message.is_mine ? 'items-end' : 'items-start')}>
                <div
                    className={cn(
                        'rounded-2xl px-4 py-2.5 text-sm leading-6 shadow-sm',
                        message.is_mine
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'border-border bg-background text-foreground rounded-bl-md border',
                    )}
                >
                    <p className="break-words whitespace-pre-wrap">{message.body}</p>
                </div>
                <time dateTime={message.created_at} className="text-muted-foreground mt-1 block px-1 text-[0.6875rem]">
                    {formatMessageTime(message.created_at)}
                </time>
            </div>
        </li>
    );
}

function ConversationPane({ active }: { active: DirectActiveConversation | null }) {
    const { data, setData, post, processing, errors, reset } = useForm({ body: '' });
    const messageEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    }, [active?.id, active?.messages.length]);

    if (!active) {
        return (
            <section className="bg-muted/25 hidden min-h-0 lg:block" aria-label="No conversation selected">
                <EmptySelection />
            </section>
        );
    }

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!data.body.trim() || processing) return;

        post(route('direct.messages.store', active.id), {
            preserveScroll: true,
            onSuccess: () => reset('body'),
        });
    };

    const handleComposerKeys = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
        }
    };

    return (
        <section className="flex min-h-0 min-w-0 flex-col" aria-label={`Conversation with ${active.person.name}`}>
            <header className="border-border flex min-h-20 items-center gap-3 border-b px-4 py-3 sm:px-5">
                <Button asChild variant="ghost" size="icon" className="-ml-2 size-11 rounded-xl lg:hidden">
                    <Link href="/direct" aria-label="Back to Direct inbox">
                        <ArrowLeft className="size-5" aria-hidden="true" />
                    </Link>
                </Button>
                <Link href={route('profiles.show', active.person.username)} className="shrink-0 rounded-full">
                    <SocialAvatar name={active.person.name} src={active.person.avatar_url} className="size-11" />
                </Link>
                <Link href={route('profiles.show', active.person.username)} className="hover:text-primary min-w-0 flex-1 rounded">
                    <h1 className="truncate font-semibold">{active.person.name}</h1>
                    <p className="text-muted-foreground truncate text-sm">@{active.person.username}</p>
                </Link>
                <span className="bg-primary/10 text-primary hidden items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold sm:flex">
                    <BookHeart className="size-4" strokeWidth={1.8} aria-hidden="true" />
                    Shelf Match
                </span>
            </header>

            {active.shared_subjects.length > 0 && (
                <div className="border-border bg-muted/35 border-b px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-2 overflow-x-auto">
                        <span className="text-muted-foreground shrink-0 text-xs font-semibold">You both shelved</span>
                        {active.shared_subjects.map((subject) => (
                            <span
                                key={subject.id}
                                className="border-border bg-card inline-flex shrink-0 items-center gap-2 rounded-lg border py-1 pr-2.5 pl-1 text-xs font-semibold"
                            >
                                {subject.image_url ? (
                                    <img src={subject.image_url} alt="" className="size-7 rounded-md object-cover" />
                                ) : (
                                    <span className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-md">
                                        <BookHeart className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
                                    </span>
                                )}
                                <span className="max-w-36 truncate">{subject.name}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-muted/25 min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6" role="log" aria-label="Messages" aria-live="polite">
                {active.messages.length === 0 ? (
                    <div className="flex min-h-full flex-col items-center justify-center py-10 text-center">
                        <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
                            <Sparkles className="size-6" strokeWidth={1.8} aria-hidden="true" />
                        </span>
                        <h2 className="mt-5 text-lg font-semibold">A shared shelf is a good opening</h2>
                        <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-6">
                            {active.shared_subjects[0]
                                ? `Try asking ${active.person.name.split(' ')[0]} what stayed with them about ${active.shared_subjects[0].name}.`
                                : `Say hello to ${active.person.name.split(' ')[0]} and start with the stories you both keep close.`}
                        </p>
                    </div>
                ) : (
                    <ol className="space-y-3">
                        {active.messages.map((message) => (
                            <MessageBubble key={message.id} message={message} />
                        ))}
                    </ol>
                )}
                <div ref={messageEndRef} aria-hidden="true" />
            </div>

            <form onSubmit={submit} className="border-border bg-card border-t p-3 sm:p-4">
                <Label htmlFor="direct-message" className="text-xs font-semibold">
                    Message {active.person.name}
                </Label>
                <div className="mt-2 flex items-end gap-2">
                    <Textarea
                        id="direct-message"
                        value={data.body}
                        onChange={(event) => setData('body', event.target.value)}
                        onKeyDown={handleComposerKeys}
                        maxLength={2000}
                        rows={2}
                        placeholder="Write a private message…"
                        disabled={processing}
                        className="max-h-36 min-h-12 resize-y"
                    />
                    <Button
                        type="submit"
                        disabled={processing || !data.body.trim()}
                        className="size-12 shrink-0 cursor-pointer rounded-xl p-0"
                        aria-label={processing ? 'Sending message' : 'Send message'}
                    >
                        {processing ? (
                            <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                        ) : (
                            <Send className="size-5" strokeWidth={1.9} aria-hidden="true" />
                        )}
                    </Button>
                </div>
                <div className="mt-1.5 flex min-h-5 items-start justify-between gap-3">
                    <p className="text-muted-foreground text-xs">Ctrl/⌘ + Enter to send</p>
                    <p className={cn('text-xs tabular-nums', data.body.length > 1900 ? 'text-destructive font-semibold' : 'text-muted-foreground')}>
                        {data.body.length}/2000
                    </p>
                </div>
                {errors.body && (
                    <p className="text-destructive mt-1 text-sm" role="alert">
                        {errors.body}
                    </p>
                )}
            </form>
        </section>
    );
}

export default function DirectIndex({ conversations, active }: DirectPageProps) {
    const activeId = active?.id;

    useEffect(() => {
        if (!activeId) return;

        const interval = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                router.reload({ only: ['conversations', 'active', 'direct'] });
            }
        }, 10_000);

        return () => window.clearInterval(interval);
    }, [activeId]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Direct">
                <meta name="description" content="Private conversations between mutual Shelf Matches on BlackFrame." />
            </Head>

            <main id="main-content" className="mx-auto w-full max-w-[1180px] px-3 py-4 pb-24 sm:px-5 md:pb-5" tabIndex={-1}>
                <div className="border-border bg-card grid h-[calc(100dvh-10.5rem)] min-h-[34rem] min-w-0 overflow-hidden rounded-[1.5rem] border shadow-sm md:h-[calc(100dvh-7rem)] lg:grid-cols-[22rem_minmax(0,1fr)]">
                    <InboxPane conversations={conversations} activeId={active?.id} />
                    <ConversationPane active={active} />
                </div>
            </main>
        </AppLayout>
    );
}
