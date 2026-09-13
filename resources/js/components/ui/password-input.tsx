import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useState, type ComponentProps } from 'react';

export const PasswordInput = forwardRef<HTMLInputElement, ComponentProps<'input'>>(({ className, disabled, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    return (
        <div className="relative">
            <Input {...props} ref={ref} disabled={disabled} type={visible ? 'text' : 'password'} className={cn('pr-12', className)} />
            <button
                type="button"
                disabled={disabled}
                aria-label={visible ? 'Hide password' : 'Show password'}
                aria-pressed={visible}
                onClick={() => setVisible((value) => !value)}
                className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-xl disabled:opacity-50"
            >
                {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
            </button>
        </div>
    );
});
PasswordInput.displayName = 'PasswordInput';
