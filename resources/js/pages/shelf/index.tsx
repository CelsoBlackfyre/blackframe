import { FlashMessage } from '@/components/flash-message';
import InputError from '@/components/input-error';
import { PageHeading } from '@/components/page-heading';
import { ShelfEntryCard } from '@/components/shelf/shelf-entry-card';
import { SubjectGroupSection } from '@/components/subjects/subject-group-section';
import { SubjectPicker } from '@/components/subjects/subject-picker';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/lib/i18n';
import { groupBySubjectGroup } from '@/lib/subject-groups';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { CatalogCandidate, SelectOption, ShelfEntry, ShelfStatus } from '@/types/subjects';
import { Head, useForm } from '@inertiajs/react';
import { BookOpen, CircleCheckBig, Heart, LibraryBig, LoaderCircle, Plus, Search, X } from 'lucide-react';
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

export default function GeekShelf({ entries, statusOptions, stats }: ShelfPageProps) {
    const { t } = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [{ title: t('Geek Shelf'), href: route('shelf.index') }];
    const [adding, setAdding] = useState(false);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('recent');
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

    const filteredEntries = entries
        .filter((entry) => {
            const matchesStatus = shelfFilter === 'all' || (shelfFilter === 'favorites' ? entry.favorite : entry.status === shelfFilter);
            return matchesStatus && entry.subject.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase());
        })
        .sort((a, b) =>
            sort === 'title' ? a.subject.name.localeCompare(b.subject.name) : sort === 'rating' ? (b.rating ?? 0) - (a.rating ?? 0) : 0,
        );

    const groupedEntries = groupBySubjectGroup(filteredEntries, (entry) => entry.subject.type);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(route('shelf.store'), {
            preserveScroll: true,
            only: ['entries', 'stats', 'flash'],
            onSuccess: () => {
                form.reset();
                setSelectedSubject(null);
                setAdding(false);
                setShelfFilter('all');
                setSearch('');
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
        { value: 'all', label: t('All {count}', { count: stats.total }) },
        { value: 'current', label: t('In progress {count}', { count: stats.current }) },
        { value: 'completed', label: t('Completed {count}', { count: stats.completed }) },
        { value: 'backlog', label: t('Backlog {count}', { count: stats.backlog }) },
        { value: 'favorites', label: t('Favorites {count}', { count: stats.favorites }) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Geek Shelf')} />
            <main id="main-content" className="mx-auto w-full max-w-[1180px] px-4 py-5 pb-28 sm:px-6 sm:py-8 md:pb-10" tabIndex={-1}>
                <PageHeading
                    title={t('Geek Shelf')}
                    description={t('The stories, worlds, and favorites that make you, you.')}
                    action={
                        <Button onClick={() => setAdding(true)}>
                            <Plus aria-hidden="true" />
                            {t('Add a title')}
                        </Button>
                    }
                />

                <div className="mt-6">
                    <FlashMessage />
                </div>

                <section className="border-border mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-y py-6 sm:grid-cols-4" aria-label={t('Shelf summary')}>
                    {[
                        { label: t('On your shelf'), value: stats.total, icon: LibraryBig },
                        { label: t('In progress'), value: stats.current, icon: BookOpen },
                        { label: t('Completed'), value: stats.completed, icon: CircleCheckBig },
                        { label: t('Favorites'), value: stats.favorites, icon: Heart },
                    ].map((stat) => (
                        <div key={stat.label} className="flex items-center gap-4">
                            <stat.icon className="text-primary size-5" strokeWidth={1.8} aria-hidden="true" />
                            <div>
                                <p className="text-2xl font-semibold tabular-nums">{stat.value}</p>
                                <p className="text-muted-foreground mt-0.5 text-sm">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </section>

                <div className="mt-8">
                    <section className="min-w-0" aria-labelledby="collection-heading">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <h2 id="collection-heading" className="text-xl font-semibold">
                                    {t('Your collection')}
                                </h2>
                                <p className="text-muted-foreground mt-1 text-sm" role="status">
                                    {t('{count} title|{count} titles in this view', { count: filteredEntries.length })}
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                            <div className="relative min-w-0 flex-1">
                                <Label htmlFor="shelf-search" className="sr-only">
                                    {t('Search your shelf')}
                                </Label>
                                <Search className="text-muted-foreground pointer-events-none absolute top-3.5 left-3.5 size-4" aria-hidden="true" />
                                <Input
                                    id="shelf-search"
                                    type="search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder={t('Find a title in your collection')}
                                    className="pl-10"
                                />
                            </div>
                            <div className="sm:w-48">
                                <Label htmlFor="shelf-sort" className="sr-only">
                                    {t('Sort your shelf')}
                                </Label>
                                <Select value={sort} onValueChange={setSort}>
                                    <SelectTrigger id="shelf-sort" className="h-11 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="recent">{t('Recently updated')}</SelectItem>
                                        <SelectItem value="title">{t('Title: A to Z')}</SelectItem>
                                        <SelectItem value="rating">{t('Highest rated')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div role="group" aria-label={t('Filter shelf entries')} className="mt-4 flex flex-wrap gap-2">
                            {shelfFilters.map((filter) => (
                                <button
                                    key={filter.value}
                                    type="button"
                                    onClick={() => setShelfFilter(filter.value)}
                                    aria-pressed={shelfFilter === filter.value}
                                    className={cn(
                                        'focus-visible:ring-ring min-h-11 cursor-pointer rounded-xl border px-4 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-hidden',
                                        shelfFilter === filter.value
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border bg-card text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        {groupedEntries.length > 0 ? (
                            <div className="mt-6 space-y-8">
                                {groupedEntries.map(({ group, items }) => (
                                    <SubjectGroupSection key={group.id} group={group} count={items.length}>
                                        <div className="grid gap-4 2xl:grid-cols-2">
                                            {items.map((entry) => (
                                                <ShelfEntryCard key={entry.id} entry={entry} statusOptions={statusOptions} />
                                            ))}
                                        </div>
                                    </SubjectGroupSection>
                                ))}
                            </div>
                        ) : (
                            <div className="border-border bg-card mt-5 rounded-2xl border border-dashed px-6 py-14 text-center">
                                <LibraryBig className="text-primary mx-auto size-8" strokeWidth={1.7} aria-hidden="true" />
                                <h3 className="mt-4 text-lg font-semibold">
                                    {search ? t('No titles match “{search}”', { search }) : t('Nothing in this view yet')}
                                </h3>
                                <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm leading-6">
                                    {search
                                        ? t('Try a different title or clear your filters.')
                                        : t('Add a title you love and start making this collection your own.')}
                                </p>
                                <Button
                                    className="mt-5"
                                    variant="outline"
                                    onClick={() => {
                                        if (search || shelfFilter !== 'all') {
                                            setSearch('');
                                            setShelfFilter('all');
                                        } else setAdding(true);
                                    }}
                                >
                                    {search || shelfFilter !== 'all' ? (
                                        <>
                                            <X aria-hidden="true" />
                                            {t('Clear filters')}
                                        </>
                                    ) : (
                                        <>
                                            <Plus aria-hidden="true" />
                                            {t('Add a title')}
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </section>

                    <Dialog
                        open={adding}
                        onOpenChange={(value) => {
                            if (!form.processing) setAdding(value);
                        }}
                    >
                        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="text-2xl">{t('Make room for a favorite.')}</DialogTitle>
                                <DialogDescription>{t('Find a title, choose a status, and make it part of your story.')}</DialogDescription>
                            </DialogHeader>
                            <form id="add-to-shelf" onSubmit={submit}>
                                {Object.keys(form.errors).length > 0 && (
                                    <div role="alert" className="border-destructive/30 bg-destructive/8 mt-5 rounded-xl border px-3 py-2 text-sm">
                                        {t('Check the highlighted shelf details.')}
                                    </div>
                                )}

                                <div className="mt-5 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="subject_id">{t('Title or fandom')}</Label>
                                        <SubjectPicker
                                            id="subject_id"
                                            value={selectedSubject}
                                            onChange={chooseSubject}
                                            error={form.errors.subject_id ?? form.errors.subject_reference}
                                        />
                                        <p className="text-muted-foreground text-xs leading-5">
                                            {t('Search books, games, films, series, and more.')}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="new-status">{t('Status')}</Label>
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

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="new-rating">{t('Rating')}</Label>
                                            <Input
                                                id="new-rating"
                                                type="number"
                                                inputMode="decimal"
                                                min="1"
                                                max="10"
                                                step="0.1"
                                                value={form.data.rating}
                                                onChange={(event) => form.setData('rating', event.target.value)}
                                                placeholder={t('Optional · 1 to 10')}
                                                className="h-11 rounded-xl"
                                                aria-describedby="new-rating-error"
                                            />
                                            <InputError id="new-rating-error" message={form.errors.rating} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="new-progress">{t('Progress')}</Label>
                                            <Input
                                                id="new-progress"
                                                value={form.data.progress}
                                                onChange={(event) => form.setData('progress', event.target.value)}
                                                maxLength={120}
                                                placeholder={t('Optional milestone')}
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
                                            {t('Mark as a favorite')}
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
                                    {form.processing ? t('Adding') : t('Add to shelf')}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </main>
        </AppLayout>
    );
}
