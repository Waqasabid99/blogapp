"use client";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";

const SidebarSkeleton = () => {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const SidebarContent = () => (
        <div className="flex flex-col h-screen bg-(--bg-primary) border-r border-(--border-light)">
            <nav className="flex-1 py-4">
                <ul className="space-y-1 px-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <li key={i}>
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors">
                                <div className="w-5 h-5 bg-(--bg-tertiary) animate-pulse"></div>
                                <div className="w-24 h-5 bg-(--bg-tertiary) animate-pulse"></div>
                            </div>
                        </li>
                    ))}
                </ul>
            </nav>
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

export default SidebarSkeleton;