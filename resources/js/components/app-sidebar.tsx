import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { HeartHandshake, House, LibraryBig, MessageCircleMore, MessagesSquare, SquarePlus, UserRound, UsersRound } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const cleanup = useMobileNavigation();
    const { auth, direct } = usePage<SharedData>().props;
    const mainNavItems: NavItem[] = [
        { title: 'Home', url: '/feed', icon: House },
        { title: 'Pulse', url: '/pulse', icon: MessageCircleMore },
        { title: 'Discover', url: '/people', icon: UsersRound },
        { title: 'Matches', url: '/matches', icon: HeartHandshake },
        { title: 'Direct', url: '/direct', icon: MessagesSquare, badge: direct.unread_count },
    ];
    const cultureNavItems: NavItem[] = [
        { title: 'Geek Shelf', url: '/shelf', icon: LibraryBig },
        { title: 'Profile', url: route('profiles.show', auth.user.username), icon: UserRound },
    ];

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader className="px-4 py-3 group-data-[collapsible=icon]:px-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/feed" prefetch onClick={cleanup}>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-3 px-3 group-data-[collapsible=icon]:px-2">
                <NavMain items={mainNavItems} label="Explore" />
                <NavMain items={cultureNavItems} label="Your collection" />
                <SidebarGroup className="px-2 py-3">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                size="lg"
                                tooltip="Create"
                                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                            >
                                <Link href={route('posts.create')} prefetch onClick={cleanup}>
                                    <SquarePlus />
                                    <span>Create</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-border border-t px-4 py-4 group-data-[collapsible=icon]:px-2">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
