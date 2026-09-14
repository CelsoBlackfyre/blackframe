import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CatalogCandidate, CatalogSearchResponse, SelectOption, SubjectType } from '@/types/subjects';
import { useForm } from '@inertiajs/react';
import { BookMarked, Check, ExternalLink, LoaderCircle, Search, Send, X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';

const typeOptions: SelectOption<SubjectType>[] = [
    { value: 'game', label: 'Game' },
    { value: 'movie', label: 'Movie' },
    { value: 'series', label: 'TV series' },
    { value: 'anime', label: 'Anime' },
    { value: 'manga', label: 'Manga' },
    { value: 'book', label: 'Book' },
    { value: 'comic', label: 'Comic' },
    { value: 'character', label: 'Character' },
    { value: 'franchise', label: 'Franchise' },
    { value: 'tabletop_game', label: 'Tabletop game' },
];

const sourceLinks: Record<string, string> = {
    'Open Library': 'https://openlibrary.org',
    TVmaze: 'https://www.tvmaze.com',
    Jikan: 'https://jikan.moe',
    Wikidata: 'https://www.wikidata.org',
    TMDB: 'https://www.themoviedb.org',
    RAWG: 'https://rawg.io',
};

interface SuggestionForm {
    [key: string]: string;
    name: string;
    type: SubjectType | '';
    source_url: string;
    notes: string;
}

interface SubjectPickerProps {
    id?: string;
    value: CatalogCandidate | null;
    onChange: (candidate: CatalogCandidate | null) => void;
    error?: string;
    allowClear?: boolean;
}

export function SubjectPicker({ id, value, onChange, error, allowClear = false }: SubjectPickerProps) {
    const generatedId = useId();
    const pickerId = id ?? `subject-picker-${generatedId}`;
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [type, setType] = useState<'all' | SubjectType>('all');
    const [results, setResults] = useState<CatalogCandidate[]>([]);
    const [sources, setSources] = useState<string[]>([]);
    const [unavailableSources, setUnavailableSources] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [showSuggestion, setShowSuggestion] = useState(false);
    const suggestion = useForm<SuggestionForm>({
        name: '',
        type: '',
        source_url: '',
        notes: '',
    });

    useEffect(() => {
        if (!open) return;

        const cleanQuery = query.trim();

        if (cleanQuery.length < 2) {
            setResults([]);
            setSources([]);
            setUnavailableSources([]);
            setLoading(false);
            setSearchError(null);

            return;
        }

        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            setLoading(true);
            setSearchError(null);

            try {
                const parameters = new URLSearchParams({ query: cleanQuery });

                if (type !== 'all') parameters.set('type', type);

                const response = await fetch(`${route('catalog.search')}?${parameters.toString()}`, {
                    credentials: 'same-origin',
                    headers: { Accept: 'application/json' },
                    signal: controller.signal,
                });

                if (!response.ok) throw new Error('Catalog search failed.');

                const payload = (await response.json()) as CatalogSearchResponse;
                setResults(payload.data);
                setSources(payload.meta.sources);
                setUnavailableSources(payload.meta.unavailable_sources);
            } catch (requestError) {
                if (requestError instanceof DOMException && requestError.name === 'AbortError') return;

                setResults([]);
                setSearchError('The catalog could not be reached. Try again or request the missing title.');
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, 350);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [open, query, type]);

    const selectCandidate = (candidate: CatalogCandidate) => {
        onChange(candidate);
        setOpen(false);
        setShowSuggestion(false);
    };

    const openSuggestion = () => {
        suggestion.setData({
            name: query.trim(),
            type: type === 'all' ? '' : type,
            source_url: '',
            notes: '',
        });
        suggestion.clearErrors();
        setShowSuggestion(true);
    };

    const submitSuggestion = () => {
        suggestion.post(route('catalog.suggestions.store'), {
            preserveScroll: true,
            onSuccess: () => {
                suggestion.reset();
                setShowSuggestion(false);
                setOpen(false);
            },
        });
    };

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <div className="flex items-stretch gap-2">
                    <DialogTrigger asChild>
                        <button
                            id={pickerId}
                            type="button"
                            aria-describedby={error ? `${pickerId}-error` : undefined}
                            className={cn(
                                'border-input bg-background focus-visible:ring-ring min-h-12 min-w-0 flex-1 cursor-pointer rounded-xl border px-3 py-2 text-left focus-visible:ring-2 focus-visible:outline-hidden',
                                error && 'border-destructive',
                            )}
                        >
                            {value ? (
                                <span className="flex min-w-0 items-center gap-3">
                                    {value.image_url ? (
                                        <img src={value.image_url} alt="" className="bg-muted size-10 shrink-0 rounded-lg object-cover" />
                                    ) : (
                                        <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                                            <BookMarked className="size-5" strokeWidth={1.8} aria-hidden="true" />
                                        </span>
                                    )}
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-semibold">{value.name}</span>
                                        <span className="text-muted-foreground block truncate text-xs">
                                            {value.type_label} · {value.source_label}
                                        </span>
                                    </span>
                                    <span className="text-primary flex size-7 shrink-0 items-center justify-center rounded-full" aria-hidden="true">
                                        <Check className="size-4" strokeWidth={2} />
                                    </span>
                                </span>
                            ) : (
                                <span className="text-muted-foreground flex items-center gap-2 text-sm">
                                    <Search className="size-4" strokeWidth={1.8} aria-hidden="true" />
                                    Search real catalogs
                                </span>
                            )}
                        </button>
                    </DialogTrigger>

                    {allowClear && value && (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-auto min-h-12 w-12 shrink-0 cursor-pointer rounded-xl"
                            onClick={() => onChange(null)}
                            aria-label={`Remove ${value.name}`}
                        >
                            <X className="size-4" aria-hidden="true" />
                        </Button>
                    )}
                </div>

                <DialogContent className="max-h-[90dvh] max-w-2xl min-w-0 overflow-x-hidden overflow-y-auto rounded-2xl p-0 sm:w-[calc(100%-2rem)]">
                    <DialogHeader className="border-border min-w-0 border-b px-5 py-5 pr-12 sm:px-6">
                        <DialogTitle>Find a title or fandom</DialogTitle>
                        <DialogDescription>Search trusted catalogs. BlackFrame only imports the result you choose.</DialogDescription>
                    </DialogHeader>

                    <div className="min-w-0 space-y-5 px-5 pb-6 sm:px-6">
                        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
                            <div className="space-y-2">
                                <Label htmlFor={`${pickerId}-search`}>Search</Label>
                                <div className="relative">
                                    <Search
                                        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                                        strokeWidth={1.8}
                                        aria-hidden="true"
                                    />
                                    <Input
                                        id={`${pickerId}-search`}
                                        type="search"
                                        value={query}
                                        onChange={(event) => {
                                            setQuery(event.target.value);
                                            setShowSuggestion(false);
                                        }}
                                        placeholder="Dune, One Piece, Baldur's Gate…"
                                        className="h-12 rounded-xl pl-10"
                                        autoComplete="off"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor={`${pickerId}-type`}>Category</Label>
                                <Select value={type} onValueChange={(nextType: 'all' | SubjectType) => setType(nextType)}>
                                    <SelectTrigger id={`${pickerId}-type`} className="h-12 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All categories</SelectItem>
                                        {typeOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div aria-live="polite" aria-busy={loading}>
                            {loading && (
                                <div className="text-muted-foreground flex min-h-40 items-center justify-center gap-2 text-sm">
                                    <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                                    Searching catalogs
                                </div>
                            )}

                            {!loading && searchError && (
                                <div className="border-destructive/30 bg-destructive/8 rounded-xl border px-4 py-4 text-sm">
                                    <p>{searchError}</p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="mt-3 min-h-11 cursor-pointer rounded-xl"
                                        onClick={openSuggestion}
                                    >
                                        Request a review
                                    </Button>
                                </div>
                            )}

                            {!loading && !searchError && query.trim().length < 2 && (
                                <div className="border-border bg-muted/35 flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed px-6 text-center">
                                    <Search className="text-primary size-6" strokeWidth={1.8} aria-hidden="true" />
                                    <p className="mt-3 text-sm font-semibold">Start with at least two characters</p>
                                    <p className="text-muted-foreground mt-1 max-w-sm text-xs leading-5">
                                        Results can include books, games, films, series, anime, manga, characters, and franchises.
                                    </p>
                                </div>
                            )}

                            {!loading && !searchError && query.trim().length >= 2 && results.length > 0 && (
                                <ul className="min-w-0 space-y-2" aria-label="Catalog results">
                                    {results.map((candidate) => (
                                        <li key={candidate.key} className="min-w-0">
                                            <button
                                                type="button"
                                                onClick={() => selectCandidate(candidate)}
                                                className="border-border hover:border-primary/50 hover:bg-primary/5 focus-visible:ring-ring flex min-h-20 w-full min-w-0 cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-hidden"
                                            >
                                                {candidate.image_url ? (
                                                    <img
                                                        src={candidate.image_url}
                                                        alt=""
                                                        loading="lazy"
                                                        className="bg-muted h-16 w-12 shrink-0 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <span className="bg-muted text-muted-foreground flex h-16 w-12 shrink-0 items-center justify-center rounded-lg">
                                                        <BookMarked className="size-5" strokeWidth={1.8} aria-hidden="true" />
                                                    </span>
                                                )}
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm font-semibold">{candidate.name}</span>
                                                    <span className="text-muted-foreground mt-0.5 block text-xs">
                                                        {candidate.type_label} · via {candidate.source_label}
                                                    </span>
                                                    {candidate.description && (
                                                        <span className="text-muted-foreground mt-1 line-clamp-2 block text-xs leading-5">
                                                            {candidate.description}
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="text-primary hidden shrink-0 text-xs font-semibold sm:inline">Choose</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {!loading && !searchError && query.trim().length >= 2 && results.length === 0 && (
                                <div className="border-border bg-muted/35 rounded-2xl border border-dashed px-6 py-8 text-center">
                                    <BookMarked className="text-primary mx-auto size-7" strokeWidth={1.8} aria-hidden="true" />
                                    <p className="mt-3 text-sm font-semibold">No reliable match yet</p>
                                    <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs leading-5">
                                        Try the exact title or choose a category. If it is still missing, send one review request.
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="mt-4 min-h-11 cursor-pointer rounded-xl"
                                        onClick={openSuggestion}
                                    >
                                        Request this title
                                    </Button>
                                </div>
                            )}
                        </div>

                        {!loading && results.length > 0 && !showSuggestion && (
                            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                                <p className="text-muted-foreground text-xs">Not seeing the right match?</p>
                                <Button type="button" variant="ghost" className="min-h-11 cursor-pointer rounded-xl" onClick={openSuggestion}>
                                    Request a missing title
                                </Button>
                            </div>
                        )}

                        {showSuggestion && (
                            <section
                                className="border-primary/20 bg-primary/5 rounded-2xl border p-4"
                                aria-labelledby={`${pickerId}-suggestion-heading`}
                            >
                                <div>
                                    <h3 id={`${pickerId}-suggestion-heading`} className="text-sm font-semibold">
                                        Request catalog review
                                    </h3>
                                    <p className="text-muted-foreground mt-1 text-xs leading-5">
                                        One request is shared across the community, so duplicate submissions stay out of the catalog.
                                    </p>
                                </div>

                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor={`${pickerId}-suggestion-name`}>Exact title</Label>
                                        <Input
                                            id={`${pickerId}-suggestion-name`}
                                            value={suggestion.data.name}
                                            onChange={(event) => suggestion.setData('name', event.target.value)}
                                            maxLength={160}
                                            className="h-11 rounded-xl"
                                        />
                                        <InputError message={suggestion.errors.name} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor={`${pickerId}-suggestion-type`}>Category</Label>
                                        <Select
                                            value={suggestion.data.type}
                                            onValueChange={(nextType: SubjectType) => suggestion.setData('type', nextType)}
                                        >
                                            <SelectTrigger id={`${pickerId}-suggestion-type`} className="h-11 rounded-xl">
                                                <SelectValue placeholder="Choose a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {typeOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={suggestion.errors.type} />
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <Label htmlFor={`${pickerId}-suggestion-url`}>Reference link</Label>
                                    <Input
                                        id={`${pickerId}-suggestion-url`}
                                        type="url"
                                        value={suggestion.data.source_url}
                                        onChange={(event) => suggestion.setData('source_url', event.target.value)}
                                        placeholder="Optional official page or database link"
                                        className="h-11 rounded-xl"
                                    />
                                    <InputError message={suggestion.errors.source_url} />
                                </div>

                                <div className="mt-4 space-y-2">
                                    <Label htmlFor={`${pickerId}-suggestion-notes`}>What should we know?</Label>
                                    <Textarea
                                        id={`${pickerId}-suggestion-notes`}
                                        value={suggestion.data.notes}
                                        onChange={(event) => suggestion.setData('notes', event.target.value)}
                                        maxLength={500}
                                        rows={3}
                                        placeholder="Optional context to distinguish it from similar titles"
                                        className="min-h-20 rounded-xl"
                                    />
                                    <InputError message={suggestion.errors.notes} />
                                </div>

                                <div className="mt-4 flex flex-wrap justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="min-h-11 cursor-pointer rounded-xl"
                                        onClick={() => setShowSuggestion(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        disabled={suggestion.processing}
                                        className="min-h-11 cursor-pointer rounded-xl"
                                        onClick={submitSuggestion}
                                    >
                                        {suggestion.processing ? (
                                            <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                                        ) : (
                                            <Send className="size-4" strokeWidth={1.8} aria-hidden="true" />
                                        )}
                                        {suggestion.processing ? 'Sending' : 'Send for review'}
                                    </Button>
                                </div>
                            </section>
                        )}

                        {sources.length > 0 && (
                            <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-2 border-t pt-4 text-xs">
                                <span>Catalog data:</span>
                                {sources.map((source) => (
                                    <a
                                        key={source}
                                        href={sourceLinks[source]}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="hover:text-foreground focus-visible:ring-ring inline-flex min-h-8 items-center gap-1 rounded-md focus-visible:ring-2 focus-visible:outline-hidden"
                                    >
                                        {source}
                                        <ExternalLink className="size-3" aria-hidden="true" />
                                    </a>
                                ))}
                                {unavailableSources.length > 0 && (
                                    <span className="w-full">Temporarily unavailable: {unavailableSources.join(', ')}.</span>
                                )}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <InputError id={`${pickerId}-error`} message={error} />
        </div>
    );
}
