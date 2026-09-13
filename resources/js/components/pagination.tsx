import { Button } from '@/components/ui/button';
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

export function Pagination({
    resource,
    previousLabel = 'Newer',
    nextLabel = 'Older',
    ariaLabel = 'Pages',
    className = 'mt-7',
    preserveState = false,
}: PaginationProps) {
    if (!resource.prev_page_url && !resource.next_page_url) {
        return null;
    }

    return (
        <nav className={cn('flex items-center justify-between gap-4', className)} aria-label={ariaLabel}>
            {resource.prev_page_url ? (
                <Button asChild variant="outline" className="min-h-11 rounded-xl">
                    <Link href={resource.prev_page_url} preserveScroll preserveState={preserveState || undefined}>
                        {previousLabel}
                    </Link>
                </Button>
            ) : (
                <Button variant="outline" disabled className="min-h-11 rounded-xl">
                    {previousLabel}
                </Button>
            )}
            <span className="text-muted-foreground text-xs tabular-nums">
                Page {resource.current_page} of {resource.last_page}
            </span>
            {resource.next_page_url ? (
                <Button asChild variant="outline" className="min-h-11 rounded-xl">
                    <Link href={resource.next_page_url} preserveScroll preserveState={preserveState || undefined}>
                        {nextLabel}
                    </Link>
                </Button>
            ) : (
                <Button variant="outline" disabled className="min-h-11 rounded-xl">
                    {nextLabel}
                </Button>
            )}
        </nav>
    );
}
