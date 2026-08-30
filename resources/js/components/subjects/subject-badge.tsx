import { cn } from '@/lib/utils';
import { SubjectSummary } from '@/types/subjects';
import { Tag } from 'lucide-react';

type BadgeSubject = Pick<SubjectSummary, 'name' | 'type_label'>;

export function SubjectBadge({ subject, className }: { subject: BadgeSubject; className?: string }) {
    return (
        <span
            className={cn(
                'border-primary/20 bg-primary/8 text-foreground inline-flex min-h-7 max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                className,
            )}
        >
            <Tag className="text-primary size-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
            <span className="truncate">{subject.name}</span>
            <span className="text-muted-foreground shrink-0">· {subject.type_label}</span>
        </span>
    );
}
