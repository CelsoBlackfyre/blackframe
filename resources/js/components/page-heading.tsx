import { ReactNode } from 'react';

export function PageHeading({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
    return (
        <header className="flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-2xl">
                <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-[2.5rem] sm:leading-tight">{title}</h1>
                <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-6 sm:text-base">{description}</p>
            </div>
            {action}
        </header>
    );
}
