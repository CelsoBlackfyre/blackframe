import { useTranslation } from '@/lib/i18n';
import { SubjectGroup } from '@/lib/subject-groups';
import { cn } from '@/lib/utils';
import { ReactNode, useId } from 'react';

export function SubjectGroupSection({
    group,
    count,
    children,
    headingLevel = 'h3',
    className,
}: {
    group: SubjectGroup;
    count: number;
    children: ReactNode;
    headingLevel?: 'h2' | 'h3';
    className?: string;
}) {
    const { t } = useTranslation();
    const headingId = useId();
    const Heading = headingLevel;

    return (
        <section className={cn('min-w-0', className)} aria-labelledby={headingId}>
            <div className="flex items-center gap-2">
                <group.icon className="text-primary size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                <Heading id={headingId} className="text-sm font-semibold">
                    {t(group.label)}
                </Heading>
                <span className="text-muted-foreground text-xs tabular-nums">
                    {count}
                    <span className="sr-only"> {t('title|titles', { count })}</span>
                </span>
            </div>
            <div className="mt-3">{children}</div>
        </section>
    );
}
