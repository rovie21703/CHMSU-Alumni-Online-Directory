import { type Config } from 'ziggy-js';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User | null;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    formProtection: {
        honeypotField: string;
        formStartedAt: string;
    };
    ziggy: Config;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'staff';
    isAdmin: boolean;
    campusId: number | null;
    campusName?: string | null;
    avatar?: string;
    email_verified_at: string | null;
    created_at?: string;
    updated_at?: string;
}
