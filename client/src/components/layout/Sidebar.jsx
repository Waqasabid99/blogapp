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
            href: "/dashboard",
            requiredPermissions: ["admin.dashboard"],
        },
        {
            label: "Posts",
            icon: FileText,
            href: "/dashboard/posts",
            requiredPermissions: [
                "post.create",
                "post.update",
                "post.delete",
                "post.publish",
                "post.approve",
                "post.reject",
            ],
        },
        {
            label: "Categories",
            icon: FolderOpen,
            href: "/dashboard/categories",
            requiredPermissions: ["category.manage"],
        },
        {
            label: "Tags",
            icon: Tags,
            href: "/dashboard/tags",
            requiredPermissions: ["tag.manage"],
        },
        {
            label: "Comments",
            icon: MessageSquare,
            href: "/dashboard/comments",
            requiredPermissions: ["comment.moderate"],
        },
        {
            label: "Users",
            icon: Users,
            href: "/dashboard/users",
            requiredPermissions: ["user.manage"],
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
        <div className="flex flex-col h-full bg-(--bg-primary) border-r border-(--border-light)">
            <div className="p-6 border-b border-(--border-light) flex items-center justify-between">
                <Link href="/" className="heading-3 text-(--brand-primary) italic">
                    NEWZONE
                </Link>
                <button
                    className="lg:hidden p-1 rounded-md hover:bg-(--bg-tertiary)"
                    onClick={() => setMobileOpen(false)}
                >
                    <X className="w-5 h-5 text-(--text-primary)" />
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-3">
                    {visibleItems.map((item) => {
                        const Icon = item.icon;
                        // Exact match or sub-route
                        const isActive =
                            pathname === item.href ||
                            (pathname.startsWith(item.href + "/") && item.href !== "/dashboard");

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
            <div className="p-4 border-t border-(--border-light) flex flex-col gap-2">
                <div className="px-3 py-2 mb-2 bg-(--bg-tertiary) rounded-lg border border-(--border-light)">
                    <p className="text-sm font-semibold text-(--text-primary) truncate">
                        {user?.name || "Account"}
                    </p>
                    <p className="text-xs text-(--text-muted) truncate">
                        {user?.email}
                    </p>
                </div>

                <Link
                    href="/dashboard/settings"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/dashboard/settings"
                            ? "bg-(--brand-primary-light) text-(--brand-primary)"
                            : "text-(--text-secondary) hover:bg-(--bg-tertiary) hover:text-(--text-primary)"
                        }`}
                >
                    <Settings className="w-5 h-5" />
                    Settings
                </Link>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors w-full text-left cursor-pointer"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
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
