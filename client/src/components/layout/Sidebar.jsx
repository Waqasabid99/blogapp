"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    FileText,
    Tags,
    FolderOpen,
    MessageSquare,
    Users,
    Settings,
    LogOut,
    Menu,
    X
} from "lucide-react";
import useAuthStore from "@/store/authStore";

const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, permissions, logout } = useAuthStore();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    const navItems = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: `/dashboard/${user?.role}/${user?.id}`,
            requiredPermissions: ["dashboard.view"],
        },
        {
            label: "Posts",
            icon: FileText,
            href: `/dashboard/${user?.role}/${user?.id}/posts`,
            requiredPermissions: [
                "post.create",
                "post.update",
                "post.delete",
                "post.publish",
                "post.approve",
                "post.reject",
                "post.view_drafts"
            ],
        },
        {
            label: "Categories",
            icon: FolderOpen,
            href: `/dashboard/${user?.role}/${user?.id}/categories`,
            requiredPermissions: [
                "category.create",
                "category.update",
                "category.delete"
            ],
        },
        {
            label: "Tags",
            icon: Tags,
            href: `/dashboard/${user?.role}/${user?.id}/tags`,
            requiredPermissions: [
                "tag.create",
                "tag.update",
                "tag.delete"
            ],
        },
        {
            label: "Comments",
            icon: MessageSquare,
            href: `/dashboard/${user?.role}/${user?.id}/comments`,
            requiredPermissions: [
                "comment.moderate",
                "comment.approve",
                "comment.reject",
                "comment.spam"
            ],
        },
        {
            label: "Users",
            icon: Users,
            href: `/dashboard/${user?.role}/${user?.id}/users`,
            requiredPermissions: [
                "user.view",
                "user.create",
                "user.update",
                "user.delete"
            ],
        },
    ];

    // Helper function to check if user has at least one of the required permissions
    const hasPermission = (requiredPerms) => {
        if (!requiredPerms || requiredPerms.length === 0) return true;
        if (!permissions) return false;
        return requiredPerms.some((perm) => permissions.includes(perm));
    };

    const visibleItems = navItems.filter((item) =>
        hasPermission(item.requiredPermissions)
    );

    // If no permissions match, don't render the sidebar (e.g. for a normal user)
    if (visibleItems.length === 0) {
        return null;
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-screen bg-(--bg-primary) border-r border-(--border-light)">
            <nav className="flex-1 py-4">
                <ul className="space-y-1 px-3">
                    {visibleItems.map((item) => {
                        const Icon = item.icon;
                        // Dashboard should only be active if exact match
                        const isDashboardLink = item.href === `/dashboard/${user?.role}/${user?.id}`;
                        const isActive = isDashboardLink
                            ? pathname === item.href
                            : pathname.startsWith(item.href);

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? "bg-(--brand-primary-light) text-(--brand-primary)"
                                        : "text-(--text-secondary) hover:bg-(--bg-tertiary) hover:text-(--text-primary)"
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User info & Logout at bottom */}
            {/* <div className="p-4 border-t border-(--border-light) flex flex-col gap-2">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors w-full text-left cursor-pointer"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div> */}
        </div>
    );

    return (
        <>
            {/* Mobile Toggle Button (hidden on lg) */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed bottom-4 right-4 z-40 p-3 bg-(--brand-primary) text-white rounded-full shadow-lg"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`fixed top-0 left-0 bottom-0 w-64 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <SidebarContent />
            </aside>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 h-screen shrink-0 sticky top-0">
                <div className="w-full h-full">
                    <SidebarContent />
                </div>
            </aside>
        </>
    );
};

export default Sidebar;