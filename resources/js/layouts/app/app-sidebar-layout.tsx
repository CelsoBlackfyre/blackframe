import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { ConnectionStatus } from '@/components/connection-status';
import { MobileNav } from '@/components/social/mobile-nav';
import { type BreadcrumbItem } from '@/types';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: { children: React.ReactNode; breadcrumbs?: BreadcrumbItem[] }) {
    return (
        <AppShell variant="sidebar">
            <a
                href="#main-content"
                className="bg-primary text-primary-foreground fixed top-3 left-3 z-50 -translate-y-24 rounded-xl px-5 py-3 font-semibold focus:translate-y-0"
            >
                Skip to content
            </a>
            <AppSidebar />
            <AppContent variant="sidebar" className="min-w-0">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <ConnectionStatus />
                {children}
                <MobileNav />
            </AppContent>
        </AppShell>
    );
}
