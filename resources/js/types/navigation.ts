import type { InertiaLinkProps } from '@inertiajs/react';
import type { BootstrapIcon } from '@/components/bootstrap-icons';

export type BreadcrumbItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
};

export type NavItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: BootstrapIcon | null;
    isActive?: boolean;
};
