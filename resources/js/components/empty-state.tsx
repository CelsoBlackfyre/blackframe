import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    children: ReactNode;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({ icon: Icon, title, children, action, className }: EmptyStateProps) {
    return (
        <section className={cn('border-border bg-card rounded-[1.5rem] border border-dashed px-6 py-14 text-center', className)}>
            <span className="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-2xl">
                <Icon className="size-6" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-semibold">{title}</h2>
            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">{children}</p>
            {action && <div className="mt-6">{action}</div>}
        </section>
    );
}
