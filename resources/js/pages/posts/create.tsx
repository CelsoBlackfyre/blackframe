import InputError from '@/components/input-error';
import { PageHeading } from '@/components/page-heading';
import { SocialAvatar } from '@/components/social/avatar';
import { SubjectBadge } from '@/components/subjects/subject-badge';
import { SubjectPicker } from '@/components/subjects/subject-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem, SharedData } from '@/types';
import { CatalogCandidate } from '@/types/subjects';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Image as ImageIcon, LoaderCircle, MessageCircleMore, Upload } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';

type PostFormat = 'image' | 'text';

interface PostFormData {
    [key: string]: string | File | null;
    type: PostFormat;
    caption: string;
    location: string;
    alt_text: string;
    media: File | null;
    subject_id: string;
    subject_reference: string;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Create', href: route('posts.create') }];

export default function CreatePost({ initialFormat = 'image' }: { initialFormat?: PostFormat }) {
    const { auth } = usePage<SharedData>().props;
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<CatalogCandidate | null>(null);
    const errorSummaryRef = useRef<HTMLDivElement>(null);
    const mediaInputRef = useRef<HTMLInputElement>(null);
    const form = useForm<PostFormData>({
        type: initialFormat,
        caption: '',
        location: '',
        alt_text: '',
        media: null,
        subject_id: '',
        subject_reference: '',
    });

    const isImage = form.data.type === 'image';
    const captionLimit = isImage ? 2200 : 500;
    useEffect(() => {
        if (!form.data.media) {
            setPreviewUrl(null);
            return;
        }

        const nextPreviewUrl = URL.createObjectURL(form.data.media);
        setPreviewUrl(nextPreviewUrl);

        return () => URL.revokeObjectURL(nextPreviewUrl);
    }, [form.data.media]);

    const hadErrors = useRef(false);

    useEffect(() => {
        const hasErrors = Object.keys(form.errors).length > 0;

        if (hasErrors && !hadErrors.current) {
            errorSummaryRef.current?.focus();
        }

        hadErrors.current = hasErrors;
    }, [form.errors]);

    const selectFormat = (format: PostFormat) => {
        form.setData('type', format);
        form.clearErrors();

        if (format === 'text') {
            form.setData('media', null);
            if (mediaInputRef.current) {
                mediaInputRef.current.value = '';
            }
            form.setData('alt_text', '');
            form.setData('location', '');
            form.setData('caption', form.data.caption.slice(0, 500));
        }
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(route('posts.store'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const chooseSubject = (subject: CatalogCandidate | null) => {
        setSelectedSubject(subject);
        form.setData('subject_id', subject?.subject_id ? String(subject.subject_id) : '');
        form.setData('subject_reference', subject?.reference ?? '');
        form.clearErrors('subject_id', 'subject_reference');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create" />
            <main id="main-content" className="mx-auto w-full max-w-[1040px] px-4 py-5 pb-28 sm:px-6 sm:py-8 md:pb-10" tabIndex={-1}>
                <div className="mb-8">
                    <PageHeading title="Make it a moment." description="Share a photo with Home or a thought with Pulse." />
                </div>

                <form onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] lg:gap-8">
                    <section
                        className="border-border bg-card order-2 overflow-hidden rounded-2xl border lg:order-1"
                        aria-labelledby="preview-heading"
                    >
                        <div className="border-border flex items-center justify-between border-b px-4 py-3">
                            <h2 id="preview-heading" className="text-sm font-semibold">
                                Preview
                            </h2>
                            <span className="text-muted-foreground text-xs">Your profile</span>
                        </div>

                        {isImage ? (
                            <div className="bg-muted relative flex aspect-[4/3] items-center justify-center overflow-hidden lg:aspect-[4/5]">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview of the selected upload." className="h-full w-full object-cover" />
                                ) : (
                                    <div className="text-muted-foreground flex max-w-xs flex-col items-center px-8 text-center">
                                        <ImageIcon className="size-8" strokeWidth={1.7} aria-hidden="true" />
                                        <p className="mt-3 text-sm leading-6">Your selected image will appear here before you publish.</p>
                                    </div>
                                )}
                                {selectedSubject && (
                                    <div className="absolute right-4 bottom-4 left-4">
                                        <SubjectBadge subject={selectedSubject} />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="min-h-72 p-5">
                                <div className="flex items-start gap-3">
                                    <SocialAvatar name={auth.user.name} src={auth.user.avatar_url} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap gap-x-2 text-sm">
                                            <span className="font-semibold">{auth.user.name}</span>
                                            <span className="text-muted-foreground">@{auth.user.username}</span>
                                        </div>
                                        {selectedSubject && <SubjectBadge subject={selectedSubject} className="mt-2" />}
                                        <p className="text-muted-foreground mt-2 text-[15px] leading-6 [overflow-wrap:anywhere] whitespace-pre-wrap">
                                            {form.data.caption || 'Your Pulse post preview will appear here.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="border-border bg-card order-1 rounded-2xl border p-4 sm:p-6 lg:order-2" aria-labelledby="composer-heading">
                        <div className="flex items-center gap-3">
                            <SocialAvatar name={auth.user.name} src={auth.user.avatar_url} />
                            <div className="min-w-0">
                                <h2 id="composer-heading" className="truncate text-sm font-semibold">
                                    {auth.user.name}
                                </h2>
                                <p className="text-muted-foreground truncate text-xs">Posting to your personal profile</p>
                            </div>
                        </div>

                        <fieldset className="mt-6">
                            <legend className="text-sm font-medium">Post format</legend>
                            <div className="bg-muted mt-2 grid grid-cols-2 gap-2 rounded-2xl p-1.5">
                                <button
                                    type="button"
                                    onClick={() => selectFormat('image')}
                                    aria-pressed={isImage}
                                    className={cn(
                                        'focus-visible:ring-ring flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-hidden',
                                        isImage ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    <ImageIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />
                                    Photo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => selectFormat('text')}
                                    aria-pressed={!isImage}
                                    className={cn(
                                        'focus-visible:ring-ring flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-hidden',
                                        !isImage ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    <MessageCircleMore className="size-4" strokeWidth={1.8} aria-hidden="true" />
                                    Text
                                </button>
                            </div>
                        </fieldset>

                        {Object.keys(form.errors).length > 0 && (
                            <div
                                ref={errorSummaryRef}
                                tabIndex={-1}
                                role="alert"
                                className="border-destructive/30 bg-destructive/8 mt-5 rounded-xl border px-4 py-3 focus:outline-hidden"
                            >
                                <p className="text-sm font-semibold">Check the highlighted fields before publishing.</p>
                            </div>
                        )}

                        <div className="mt-5 space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="subject_id">Topic</Label>
                                <SubjectPicker
                                    id="subject_id"
                                    value={selectedSubject}
                                    onChange={chooseSubject}
                                    allowClear
                                    error={form.errors.subject_id ?? form.errors.subject_reference}
                                />
                                <p id="subject-help" className="text-muted-foreground text-xs leading-5">
                                    Optional. Search trusted catalogs to connect this post to a game, story, character, or fandom.
                                </p>
                            </div>

                            {isImage && (
                                <div className="space-y-2">
                                    <Label htmlFor="media">Image</Label>
                                    <Input
                                        ref={mediaInputRef}
                                        id="media"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        required
                                        onChange={(event) => form.setData('media', event.target.files?.[0] ?? null)}
                                        aria-describedby="media-help media-error"
                                        aria-invalid={!!form.errors.media}
                                        className="h-12 cursor-pointer rounded-xl file:mr-3 file:cursor-pointer"
                                    />
                                    <p id="media-help" className="text-muted-foreground text-xs leading-5">
                                        JPG, PNG, or WebP up to 8 MB.
                                    </p>
                                    <InputError id="media-error" message={form.errors.media} />
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-4">
                                    <Label htmlFor="caption">{isImage ? 'Caption' : 'What is happening?'}</Label>
                                    <span id="caption-count" className="text-muted-foreground text-xs tabular-nums">
                                        {form.data.caption.length} / {captionLimit}
                                    </span>
                                </div>
                                <Textarea
                                    id="caption"
                                    value={form.data.caption}
                                    onChange={(event) => form.setData('caption', event.target.value)}
                                    maxLength={captionLimit}
                                    required={!isImage}
                                    rows={isImage ? 4 : 7}
                                    placeholder={isImage ? 'Write a caption' : 'Share a thought, question, or update'}
                                    aria-describedby="caption-count caption-error"
                                    aria-invalid={!!form.errors.caption}
                                    className={isImage ? 'min-h-28' : 'min-h-40'}
                                />
                                <InputError id="caption-error" message={form.errors.caption} />
                            </div>

                            {isImage && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="alt_text">Image description</Label>
                                        <Textarea
                                            id="alt_text"
                                            value={form.data.alt_text}
                                            onChange={(event) => form.setData('alt_text', event.target.value)}
                                            maxLength={300}
                                            required
                                            rows={3}
                                            placeholder="Describe the important visual details"
                                            aria-describedby="alt-help alt-error"
                                            aria-invalid={!!form.errors.alt_text}
                                            className="min-h-24"
                                        />
                                        <p id="alt-help" className="text-muted-foreground text-xs leading-5">
                                            This description helps people who cannot see the image.
                                        </p>
                                        <InputError id="alt-error" message={form.errors.alt_text} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            value={form.data.location}
                                            onChange={(event) => form.setData('location', event.target.value)}
                                            maxLength={120}
                                            placeholder="Optional"
                                            className="h-11 rounded-xl"
                                            aria-describedby="location-error"
                                            aria-invalid={!!form.errors.location}
                                        />
                                        <InputError id="location-error" message={form.errors.location} />
                                    </div>
                                </>
                            )}
                        </div>

                        {form.progress && (
                            <div className="mt-5" aria-live="polite">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium">Uploading</span>
                                    <span className="text-muted-foreground tabular-nums">{form.progress.percentage}%</span>
                                </div>
                                <div className="bg-muted mt-2 h-2 overflow-hidden rounded-full">
                                    <div
                                        className="bg-primary h-full rounded-full transition-[width]"
                                        style={{ width: `${form.progress.percentage}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t pt-5">
                            <Button asChild variant="ghost" className="min-h-11 cursor-pointer rounded-xl">
                                <Link href={isImage ? route('feed') : route('pulse')}>Cancel</Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing || (isImage ? !form.data.media || !form.data.alt_text.trim() : !form.data.caption.trim())}
                                className="min-h-11 min-w-28 cursor-pointer rounded-xl px-5"
                            >
                                {form.processing ? (
                                    <>
                                        <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                                        Publishing
                                    </>
                                ) : (
                                    <>
                                        <Upload className="size-4" strokeWidth={1.8} aria-hidden="true" />
                                        Publish
                                    </>
                                )}
                            </Button>
                        </div>
                    </section>
                </form>
            </main>
        </AppLayout>
    );
}
