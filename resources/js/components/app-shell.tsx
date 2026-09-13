import { SidebarProvider } from '@/components/ui/sidebar';
import { useState } from 'react';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const [isOpen, setIsOpen] = useState(() => {
        if (typeof window === 'undefined') return true;
        try {
            return localStorage.getItem('sidebar') !== 'false';
        } catch {
            return true;
        }
    });

    const handleSidebarChange = (open: boolean) => {
        setIsOpen(open);

        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('sidebar', String(open));
            } catch {
                /* Keep the selection in memory when storage is unavailable. */
            }
        }
    };

    if (variant === 'header') {
        return <div className="flex min-h-dvh w-full flex-col">{children}</div>;
    }

    return (
        <SidebarProvider defaultOpen={isOpen} open={isOpen} onOpenChange={handleSidebarChange}>
            {children}
        </SidebarProvider>
    );
}
