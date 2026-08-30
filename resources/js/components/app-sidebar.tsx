import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { HeartHandshake, House, LibraryBig, MessageCircleMore, MessagesSquare, Palette, SquarePlus, UserRound, UsersRound } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { direct } = usePage<SharedData>().props;
    const mainNavItems: NavItem[] = [
        { title: 'Home', url: '/feed', icon: House },
        { title: 'Pulse', url: '/pulse', icon: MessageCircleMore },
        { title: 'People', url: '/people', icon: UsersRound },
        { title: 'Shelf Match', url: '/matches', icon: HeartHandshake },
        { title: 'Direct', url: '/direct', icon: MessagesSquare, badge: direct.unread_count },
        { title: 'Create', url: '/posts/create', icon: SquarePlus },
        { title: 'Geek Shelf', url: '/shelf', icon: LibraryBig },
        { title: 'Profile', url: '/settings/profile', icon: UserRound },
        { title: 'Appearance', url: '/settings/appearance', icon: Palette },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/feed" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
