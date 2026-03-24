import Sidebar from "@/components/layout/Sidebar";
import SidebarSkeleton from "@/components/ui/Loadingskeletons/SidebarSkeleton";
import { generateSEO } from "@/constants/seo";
import { Suspense } from "react";

export const metadata = generateSEO({
    title: "Newszone",
    description: "The Newszone blog - Your source for the latest news, insights, and stories.",
    image: "/logo.png",
    url: "/",
    type: "website",
});

export default async function AdminLayout({ children }) {
    return (
        <section className="flex">
            <Suspense fallback={<SidebarSkeleton />}>
                <Sidebar />
            </Suspense>
            <section className="flex-1 p-3">
                {children}
            </section>
        </section>
    );
}
