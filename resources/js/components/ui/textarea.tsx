import { cn } from '@/lib/utils';
import * as React from 'react';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(({ className, ...props }, ref) => {
    return (
        <textarea
            ref={ref}
            className={cn(
                'border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-28 w-full rounded-xl border px-3 py-3 text-base leading-6 ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        />
    );
});

Textarea.displayName = 'Textarea';

export { Textarea };
