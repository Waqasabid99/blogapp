import Sidebar from "@/components/layout/Sidebar";

export const metadata = {
    title: "Newszone",
    description: "The newzone blog",
};

export default async function AdminLayout({ children }) {
    return (
        <section className="flex">
            <Sidebar />
            <section className="flex-1 p-3">
                {children}
            </section>
        </section>
    );
}
