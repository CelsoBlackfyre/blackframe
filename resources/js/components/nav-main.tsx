import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { useTranslation } from '@/lib/i18n';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [], label = 'Navigation' }: { items: NavItem[]; label?: string }) {
    const page = usePage();
    const currentPath = page.url.split('?')[0];
    const cleanup = useMobileNavigation();
    const { t } = useTranslation();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel className="text-muted-foreground mb-2 text-xs font-medium">{t(label)}</SidebarGroupLabel>
            <SidebarMenu className="gap-1">
                {items.map((item) => {
                    const path = item.url.replace(/^https?:\/\/[^/]+/, '');
                    const active = path === currentPath || currentPath.startsWith(`${path}/`);

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={active}
                                size="lg"
                                tooltip={item.title}
                                className="h-11 gap-3.5 rounded-xl px-3 text-[15px] data-[active=true]:font-semibold"
                            >
                                <Link href={item.url} prefetch onClick={cleanup} aria-current={active ? 'page' : undefined}>
                                    {item.icon && <item.icon aria-hidden="true" strokeWidth={active ? 2 : 1.65} className="size-5!" />}
                                    <span className="group-data-[collapsible=icon]:sr-only">{item.title}</span>
                                    {!!item.badge && (
                                        <span className="bg-primary text-primary-foreground ml-auto min-w-5 rounded-full px-1.5 py-0.5 text-center text-[0.625rem] leading-4 font-semibold tabular-nums group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:top-0.5 group-data-[collapsible=icon]:right-0.5 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:min-w-4 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:py-0">
                                            {item.badge > 99 ? '99+' : item.badge}
                                            <span className="sr-only"> {t('unread messages')}</span>
                                        </span>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
