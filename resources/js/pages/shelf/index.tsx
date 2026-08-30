import { FlashMessage } from '@/components/flash-message';
import InputError from '@/components/input-error';
import { ShelfEntryCard } from '@/components/shelf/shelf-entry-card';
import { SubjectPicker } from '@/components/subjects/subject-picker';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { CatalogCandidate, SelectOption, ShelfEntry, ShelfStatus } from '@/types/subjects';
import { Head, useForm } from '@inertiajs/react';
import { BookOpen, CircleCheckBig, Heart, LibraryBig, LoaderCircle, Plus } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface ShelfPageProps {
    entries: ShelfEntry[];
    statusOptions: SelectOption<ShelfStatus>[];
    stats: {
        total: number;
        current: number;
        completed: number;
        backlog: number;
        favorites: number;
    };
}

interface AddShelfEntryForm {
    [key: string]: string | boolean;
    subject_id: string;
    subject_reference: string;
    status: ShelfStatus;
    favorite: boolean;
    rating: string;
    progress: string;
}

type ShelfFilter = 'all' | 'favorites' | ShelfStatus;

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Geek Shelf', href: '/shelf' }];

export default function GeekShelf({ entries, statusOptions, stats }: ShelfPageProps) {
    const [shelfFilter, setShelfFilter] = useState<ShelfFilter>('all');
    const [selectedSubject, setSelectedSubject] = useState<CatalogCandidate | null>(null);
    const form = useForm<AddShelfEntryForm>({
        subject_id: '',
        subject_reference: '',
        status: 'current',
        favorite: false,
        rating: '',
        progress: '',
    });

    const filteredEntries = entries.filter((entry) => {
        if (shelfFilter === 'all') return true;
        if (shelfFilter === 'favorites') return entry.favorite;

        return entry.status === shelfFilter;
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(route('shelf.store'), {
            preserveScroll: true,
            only: ['entries', 'stats', 'flash'],
            onSuccess: () => {
                form.reset();
                setSelectedSubject(null);
            },
        });
    };

    const chooseSubject = (subject: CatalogCandidate | null) => {
        setSelectedSubject(subject);
        form.setData('subject_id', subject?.subject_id ? String(subject.subject_id) : '');
        form.setData('subject_reference', subject?.reference ?? '');
        form.clearErrors('subject_id', 'subject_reference');
    };

    const shelfFilters: SelectOption<ShelfFilter>[] = [
        { value: 'all', label: `All ${stats.total}` },
        { value: 'current', label: `In progress ${stats.current}` },
        { value: 'completed', label: `Completed ${stats.completed}` },
        { value: 'backlog', label: `Backlog ${stats.backlog}` },
        { value: 'favorites', label: `Favorites ${stats.favorites}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Geek Shelf" />
            <main id="main-content" className="mx-auto w-full max-w-[1180px] px-4 py-5 pb-28 sm:px-6 sm:py-8 md:pb-10" tabIndex={-1}>
                <header className="max-w-2xl">
                    <p className="text-primary text-sm font-semibold">Your geek identity</p>
                    <h1 className="mt-1 text-3xl font-semibold tracking-tight text-balance">Geek Shelf</h1>
                    <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-6 sm:text-base">
                        Keep games, stories, characters, and worlds together—then attach them directly to what you share.
                    </p>
                </header>

                <div className="mt-6">
                    <FlashMessage />
                </div>

                <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Shelf summary">
                    {[
                        { label: 'On your shelf', value: stats.total, icon: LibraryBig },
                        { label: 'In progress', value: stats.current, icon: BookOpen },
                        { label: 'Completed', value: stats.completed, icon: CircleCheckBig },
                        { label: 'Favorites', value: stats.favorites, icon: Heart },
                    ].map((stat) => (
                        <div key={stat.label} className="border-border bg-card rounded-2xl border p-4 sm:p-5">
                            <stat.icon className="text-primary size-5" strokeWidth={1.8} aria-hidden="true" />
                            <p className="mt-4 text-2xl font-semibold tabular-nums">{stat.value}</p>
                            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">{stat.label}</p>
                        </div>
                    ))}
                </section>

                <div className="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <section className="order-2 min-w-0 xl:order-1" aria-labelledby="collection-heading">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <h2 id="collection-heading" className="text-xl font-semibold">
                                    Your collection
                                </h2>
                                <p className="text-muted-foreground mt-1 text-sm">Update progress, ratings, and favorites whenever they change.</p>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2" aria-label="Filter shelf entries">
                            {shelfFilters.map((filter) => (
                                <button
                                    key={filter.value}
                                    type="button"
                                    onClick={() => setShelfFilter(filter.value)}
                                    aria-pressed={shelfFilter === filter.value}
                                    className={cn(
                                        'focus-visible:ring-ring min-h-11 cursor-pointer rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-hidden',
                                        shelfFilter === filter.value
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border bg-card text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        {filteredEntries.length > 0 ? (
                            <div className="mt-5 space-y-4">
                                {filteredEntries.map((entry) => (
                                    <ShelfEntryCard key={entry.id} entry={entry} statusOptions={statusOptions} />
                                ))}
                            </div>
                        ) : (
                            <div className="border-border bg-card mt-5 rounded-2xl border border-dashed px-6 py-14 text-center">
                                <LibraryBig className="text-primary mx-auto size-8" strokeWidth={1.7} aria-hidden="true" />
                                <h3 className="mt-4 text-lg font-semibold">Nothing in this view yet</h3>
                                <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm leading-6">
                                    Choose something from the catalog and give it a status to start building this part of your shelf.
                                </p>
                            </div>
                        )}
                    </section>

                    <aside className="order-1 xl:sticky xl:top-24 xl:order-2" aria-labelledby="add-heading">
                        <form id="add-to-shelf" onSubmit={submit} className="border-border bg-card rounded-2xl border p-5 sm:p-6">
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                                    <Plus className="size-5" strokeWidth={1.8} aria-hidden="true" />
                                </div>
                                <div>
                                    <h2 id="add-heading" className="font-semibold">
                                        Add to your shelf
                                    </h2>
                                    <p className="text-muted-foreground mt-1 text-xs leading-5">
                                        Search real catalogs, then record where you are with it.
                                    </p>
                                </div>
                            </div>

                            {Object.keys(form.errors).length > 0 && (
                                <div role="alert" className="border-destructive/30 bg-destructive/8 mt-5 rounded-xl border px-3 py-2 text-sm">
                                    Check the highlighted shelf details.
                                </div>
                            )}

                            <div className="mt-5 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="subject_id">Title or fandom</Label>
                                    <SubjectPicker
                                        id="subject_id"
                                        value={selectedSubject}
                                        onChange={chooseSubject}
                                        error={form.errors.subject_id ?? form.errors.subject_reference}
                                    />
                                    <p className="text-muted-foreground text-xs leading-5">
                                        Searches BlackFrame, Open Library, TVmaze, Jikan, Wikidata, and optional TMDB results.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="new-status">Status</Label>
                                    <Select value={form.data.status} onValueChange={(value: ShelfStatus) => form.setData('status', value)}>
                                        <SelectTrigger id="new-status" className="h-11 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={form.errors.status} />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-rating">Rating</Label>
                                        <Input
                                            id="new-rating"
                                            type="number"
                                            inputMode="decimal"
                                            min="1"
                                            max="10"
                                            step="0.1"
                                            value={form.data.rating}
                                            onChange={(event) => form.setData('rating', event.target.value)}
                                            placeholder="Optional · 1–10"
                                            className="h-11 rounded-xl"
                                            aria-describedby="new-rating-error"
                                        />
                                        <InputError id="new-rating-error" message={form.errors.rating} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="new-progress">Progress</Label>
                                        <Input
                                            id="new-progress"
                                            value={form.data.progress}
                                            onChange={(event) => form.setData('progress', event.target.value)}
                                            maxLength={120}
                                            placeholder="Optional milestone"
                                            className="h-11 rounded-xl"
                                            aria-describedby="new-progress-error"
                                        />
                                        <InputError id="new-progress-error" message={form.errors.progress} />
                                    </div>
                                </div>

                                <div className="flex min-h-11 items-center gap-2">
                                    <Checkbox
                                        id="new-favorite"
                                        checked={form.data.favorite}
                                        onCheckedChange={(checked) => form.setData('favorite', checked === true)}
                                    />
                                    <Label htmlFor="new-favorite" className="cursor-pointer">
                                        Mark as a favorite
                                    </Label>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={form.processing || !selectedSubject}
                                className="mt-5 min-h-11 w-full cursor-pointer rounded-xl"
                            >
                                {form.processing ? (
                                    <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                                ) : (
                                    <Plus className="size-4" strokeWidth={1.8} aria-hidden="true" />
                                )}
                                {form.processing ? 'Adding' : 'Add to shelf'}
                            </Button>
                        </form>
                    </aside>
                </div>
            </main>
        </AppLayout>
    );
}
