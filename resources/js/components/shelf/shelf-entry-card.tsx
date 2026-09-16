import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n';
import { subjectGroupFor } from '@/lib/subject-groups';
import { SelectOption, ShelfEntry, ShelfStatus } from '@/types/subjects';
import { useForm } from '@inertiajs/react';
import { ChevronDown, Heart, LoaderCircle, Save, Star, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface ShelfEntryForm {
    [key: string]: string | boolean;
    status: ShelfStatus;
    favorite: boolean;
    rating: string;
    progress: string;
}

export function ShelfEntryCard({ entry, statusOptions }: { entry: ShelfEntry; statusOptions: SelectOption<ShelfStatus>[] }) {
    const { t } = useTranslation();
    const [confirmingRemoval, setConfirmingRemoval] = useState(false);
    const GroupIcon = subjectGroupFor(entry.subject.type).icon;
    const form = useForm<ShelfEntryForm>({
        status: entry.status,
        favorite: entry.favorite,
        rating: entry.rating === null ? '' : String(entry.rating),
        progress: entry.progress ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.patch(route('shelf.update', entry.id), {
            preserveScroll: true,
            only: ['entries', 'stats', 'flash'],
            onSuccess: () => form.setDefaults(),
        });
    };

    const remove = () => {
        form.delete(route('shelf.destroy', entry.id), {
            preserveScroll: true,
            only: ['entries', 'stats', 'flash'],
        });
    };

    return (
        <article className="border-border bg-card overflow-hidden rounded-2xl border">
            <div className="grid sm:grid-cols-[clamp(11.5rem,30%,13rem)_minmax(0,1fr)]">
                <div className="bg-muted relative aspect-[4/3] overflow-hidden sm:aspect-auto sm:min-h-full">
                    {entry.subject.image_url ? (
                        <>
                            <img
                                src={entry.subject.image_url}
                                alt={t('{name} cover artwork', { name: entry.subject.name })}
                                width="640"
                                height="800"
                                loading="lazy"
                                className="h-full w-full object-cover object-center"
                            />
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-0 ring-1 ring-black/8 ring-inset dark:ring-white/8"
                            />
                        </>
                    ) : (
                        <div className="flex h-full min-h-28 items-center justify-center px-4 text-center">
                            <span className="text-muted-foreground text-sm">{t('No artwork')}</span>
                        </div>
                    )}
                </div>

                <form onSubmit={submit} className="min-w-0 p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                                <GroupIcon className="size-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                                {entry.subject.type_label}
                            </p>
                            <h4 className="mt-0.5 text-base font-semibold [overflow-wrap:anywhere]">{entry.subject.name}</h4>
                            {entry.subject.parent && (
                                <p className="text-muted-foreground mt-1 text-xs">{t('Part of {parent}', { parent: entry.subject.parent })}</p>
                            )}
                        </div>
                        <span className="border-primary/20 bg-primary/8 rounded-full border px-2.5 py-1 text-xs font-semibold">
                            {entry.status_label}
                        </span>
                    </div>

                    <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-3 text-sm">
                        {entry.rating && (
                            <span className="flex items-center gap-1.5">
                                <Star className="text-primary size-4" aria-hidden="true" />
                                <span className="text-foreground font-semibold">{entry.rating}</span> / 10
                            </span>
                        )}
                        {entry.favorite && (
                            <span className="text-primary flex items-center gap-1.5">
                                <Heart className="size-4 fill-current" aria-hidden="true" />
                                {t('Favorite')}
                            </span>
                        )}
                        {entry.progress && <span>{entry.progress}</span>}
                    </div>
                    <details className="group/edit mt-3">
                        <summary className="text-muted-foreground hover:text-foreground flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
                            {t('Update entry')} {form.isDirty && <span className="text-primary ml-auto text-xs">{t('Unsaved changes')}</span>}
                            <ChevronDown className="size-4 transition-transform group-open/edit:rotate-180" aria-hidden="true" />
                        </summary>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor={`status-${entry.id}`}>{t('Status')}</Label>
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
                                <Label htmlFor={`rating-${entry.id}`}>{t('Rating')}</Label>
                                <Input
                                    id={`rating-${entry.id}`}
                                    type="number"
                                    inputMode="decimal"
                                    min="1"
                                    max="10"
                                    step="0.1"
                                    value={form.data.rating}
                                    onChange={(event) => form.setData('rating', event.target.value)}
                                    placeholder={t('1 to 10')}
                                    className="h-11 rounded-xl"
                                    aria-describedby={`rating-error-${entry.id}`}
                                />
                                <InputError id={`rating-error-${entry.id}`} message={form.errors.rating} />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor={`progress-${entry.id}`}>{t('Progress')}</Label>
                                <Input
                                    id={`progress-${entry.id}`}
                                    value={form.data.progress}
                                    onChange={(event) => form.setData('progress', event.target.value)}
                                    maxLength={120}
                                    placeholder={t('Season, chapter, playtime, or milestone')}
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
                                    {t('Favorite')}
                                </Label>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setConfirmingRemoval(true)}
                                    disabled={form.processing}
                                    className="text-destructive hover:text-destructive min-h-11 cursor-pointer rounded-xl"
                                >
                                    <Trash2 className="size-4" strokeWidth={1.8} aria-hidden="true" />
                                    {t('Remove')}
                                </Button>
                                <Button type="submit" disabled={form.processing || !form.isDirty} className="min-h-11 cursor-pointer rounded-xl">
                                    {form.processing ? (
                                        <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                                    ) : (
                                        <Save className="size-4" strokeWidth={1.8} aria-hidden="true" />
                                    )}
                                    {form.processing ? t('Saving…') : form.recentlySuccessful ? t('Saved') : t('Save changes')}
                                </Button>
                            </div>
                        </div>
                        {confirmingRemoval && (
                            <div role="alert" className="border-destructive/30 bg-destructive/5 mt-4 rounded-xl border p-4">
                                <p className="text-sm font-medium">{t('Remove {name} from your shelf?', { name: entry.subject.name })}</p>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    {t('Your rating, progress, and favorite status will be removed. You can add the title again later.')}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <Button type="button" variant="destructive" disabled={form.processing} onClick={remove}>
                                        {t('Remove title')}
                                    </Button>
                                    <Button type="button" variant="outline" disabled={form.processing} onClick={() => setConfirmingRemoval(false)}>
                                        {t('Keep title')}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </details>
                </form>
            </div>
        </article>
    );
}
