import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Paginated } from '@/types/feed';
import { Link } from '@inertiajs/react';

interface PaginationProps {
    resource: Paginated<unknown>;
    previousLabel?: string;
    nextLabel?: string;
    ariaLabel?: string;
    className?: string;
    preserveState?: boolean;
}

export function Pagination({ resource, previousLabel, nextLabel, ariaLabel, className = 'mt-7', preserveState = false }: PaginationProps) {
    const { t } = useTranslation();
    const previous = previousLabel ?? t('Newer');
    const next = nextLabel ?? t('Older');
    const label = ariaLabel ?? t('Pages');

    if (!resource.prev_page_url && !resource.next_page_url) {
        return null;
    }

    return (
        <nav className={cn('flex items-center justify-between gap-4', className)} aria-label={label}>
            {resource.prev_page_url ? (
                <Button asChild variant="outline" className="min-h-11 rounded-xl">
                    <Link href={resource.prev_page_url} preserveScroll preserveState={preserveState || undefined}>
                        {previous}
                    </Link>
                </Button>
            ) : (
                <Button variant="outline" disabled className="min-h-11 rounded-xl">
                    {previous}
                </Button>
            )}
            <span className="text-muted-foreground text-xs tabular-nums">
                {t('Page {current} of {total}', { current: resource.current_page, total: resource.last_page })}
            </span>
            {resource.next_page_url ? (
                <Button asChild variant="outline" className="min-h-11 rounded-xl">
                    <Link href={resource.next_page_url} preserveScroll preserveState={preserveState || undefined}>
                        {next}
                    </Link>
                </Button>
            ) : (
                <Button variant="outline" disabled className="min-h-11 rounded-xl">
                    {next}
                </Button>
            )}
        </nav>
    );
}
