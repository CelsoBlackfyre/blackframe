import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SelectOption, ShelfEntry, ShelfStatus } from '@/types/subjects';
import { useForm } from '@inertiajs/react';
import { Heart, LoaderCircle, Save, Trash2 } from 'lucide-react';
import { FormEvent } from 'react';

interface ShelfEntryForm {
    [key: string]: string | boolean;
    status: ShelfStatus;
    favorite: boolean;
    rating: string;
    progress: string;
}

export function ShelfEntryCard({ entry, statusOptions }: { entry: ShelfEntry; statusOptions: SelectOption<ShelfStatus>[] }) {
    const form = useForm<ShelfEntryForm>({
        status: entry.status,
        favorite: entry.favorite,
        rating: entry.rating ?? '',
        progress: entry.progress ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.patch(route('shelf.update', entry.id), {
            preserveScroll: true,
            only: ['entries', 'stats', 'flash'],
        });
    };

    const remove = () => {
        if (!window.confirm(`Remove ${entry.subject.name} from your Geek Shelf?`)) {
            return;
        }

        form.delete(route('shelf.destroy', entry.id), {
            preserveScroll: true,
            only: ['entries', 'stats', 'flash'],
        });
    };

    return (
        <article className="border-border bg-card overflow-hidden rounded-2xl border">
            <div className="grid sm:grid-cols-[132px_minmax(0,1fr)]">
                <div className="bg-muted aspect-[16/9] overflow-hidden sm:aspect-auto sm:min-h-full">
                    {entry.subject.image_url ? (
                        <img src={entry.subject.image_url} alt="" width="640" height="800" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full min-h-28 items-center justify-center px-4 text-center">
                            <span className="text-muted-foreground text-sm">No artwork</span>
                        </div>
                    )}
                </div>

                <form onSubmit={submit} className="min-w-0 p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-muted-foreground text-xs font-medium">{entry.subject.type_label}</p>
                            <h3 className="mt-0.5 text-base font-semibold [overflow-wrap:anywhere]">{entry.subject.name}</h3>
                            {entry.subject.parent && <p className="text-muted-foreground mt-1 text-xs">Part of {entry.subject.parent}</p>}
                        </div>
                        <span className="border-primary/20 bg-primary/8 rounded-full border px-2.5 py-1 text-xs font-semibold">
                            {entry.status_label}
                        </span>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor={`status-${entry.id}`}>Status</Label>
                            <Select value={form.data.status} onValueChange={(value: ShelfStatus) => form.setData('status', value)}>
                                <SelectTrigger id={`status-${entry.id}`} className="h-11 rounded-xl">
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

                        <div className="space-y-2">
                            <Label htmlFor={`rating-${entry.id}`}>Rating</Label>
                            <Input
                                id={`rating-${entry.id}`}
                                type="number"
                                inputMode="decimal"
                                min="1"
                                max="10"
                                step="0.1"
                                value={form.data.rating}
                                onChange={(event) => form.setData('rating', event.target.value)}
                                placeholder="1–10"
                                className="h-11 rounded-xl"
                                aria-describedby={`rating-error-${entry.id}`}
                            />
                            <InputError id={`rating-error-${entry.id}`} message={form.errors.rating} />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor={`progress-${entry.id}`}>Progress</Label>
                            <Input
                                id={`progress-${entry.id}`}
                                value={form.data.progress}
                                onChange={(event) => form.setData('progress', event.target.value)}
                                maxLength={120}
                                placeholder="Season, chapter, playtime, or milestone"
                                className="h-11 rounded-xl"
                                aria-describedby={`progress-error-${entry.id}`}
                            />
                            <InputError id={`progress-error-${entry.id}`} message={form.errors.progress} />
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                        <div className="flex min-h-11 items-center gap-2">
                            <Checkbox
                                id={`favorite-${entry.id}`}
                                checked={form.data.favorite}
                                onCheckedChange={(checked) => form.setData('favorite', checked === true)}
                            />
                            <Label htmlFor={`favorite-${entry.id}`} className="flex cursor-pointer items-center gap-1.5">
                                <Heart className="text-primary size-4" strokeWidth={1.8} aria-hidden="true" />
                                Favorite
                            </Label>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={remove}
                                disabled={form.processing}
                                className="text-destructive hover:text-destructive min-h-11 cursor-pointer rounded-xl"
                            >
                                <Trash2 className="size-4" strokeWidth={1.8} aria-hidden="true" />
                                Remove
                            </Button>
                            <Button type="submit" disabled={form.processing} className="min-h-11 cursor-pointer rounded-xl">
                                {form.processing ? (
                                    <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                                ) : (
                                    <Save className="size-4" strokeWidth={1.8} aria-hidden="true" />
                                )}
                                {form.processing ? 'Saving' : 'Save'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </article>
    );
}
