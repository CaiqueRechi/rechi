import { Link, usePage } from '@inertiajs/react';
import {
    Columns3,
    Gauge,
    KeyRound,
    LayoutGrid,
    Package,
    ReceiptText,
    Settings2,
    ShieldCheck,
    UserPlus,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

const footerNavItems: NavItem[] = [];

const navigationIcons = {
    'dashboard.view': Gauge,
    'kanban.view': Columns3,
    'access_management.view': ShieldCheck,
    'users.create': UserPlus,
    'commercial_products.view': Package,
    'admin_orders.view': ReceiptText,
    'integration_settings.view': KeyRound,
    'upload_settings.view': Settings2,
} as const;

export function AppSidebar() {
    const { access } = usePage().props;
    const mainNavItems: NavItem[] =
        access?.navigation.map((item) => ({
            title: item.label,
            href: item.href,
            icon:
                navigationIcons[
                    item.permission as keyof typeof navigationIcons
                ] ?? LayoutGrid,
        })) ?? [];
    const homeHref = mainNavItems[0]?.href ?? '/no-access';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={homeHref} prefetch>
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
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
