import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';

export function FlashMessage() {
    const { flash } = usePage<SharedData>().props;

    if (!flash?.success) {
        return null;
    }

    return (
        <div role="status" className="border-primary/25 bg-primary/8 text-foreground flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm">
            <CheckCircle2 className="text-primary mt-0.5 size-5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
            <p className="leading-5">{flash.success}</p>
        </div>
    );
}
