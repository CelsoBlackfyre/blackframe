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
    useSidebar,
} from '@/components/ui/sidebar';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { HeartHandshake, House, LibraryBig, MessageCircleMore, MessagesSquare, SquarePlus, UserRound, UsersRound } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const cleanup = useMobileNavigation();
    const { state } = useSidebar();
    const { auth, direct } = usePage<SharedData>().props;
    const mainNavItems: NavItem[] = [
        { title: 'Home', url: route('feed'), icon: House },
        { title: 'Pulse', url: route('pulse'), icon: MessageCircleMore },
        { title: 'Discover', url: route('people.index'), icon: UsersRound },
        { title: 'Matches', url: route('matches.index'), icon: HeartHandshake },
        { title: 'Direct', url: route('direct.index'), icon: MessagesSquare, badge: direct.unread_count },
    ];
    const cultureNavItems: NavItem[] = [
        { title: 'Geek Shelf', url: route('shelf.index'), icon: LibraryBig },
        { title: 'Profile', url: route('profiles.show', auth.user.username), icon: UserRound },
    ];

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader className="px-4 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild tooltip="BlackFrame" aria-label="BlackFrame">
                            <Link href={route('feed')} prefetch onClick={cleanup}>
                                <AppLogo compact={state === 'collapsed'} />
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
                                    <SquarePlus className="size-5!" aria-hidden="true" />
                                    <span className="group-data-[collapsible=icon]:sr-only">Create</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-border border-t px-4 py-4">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
