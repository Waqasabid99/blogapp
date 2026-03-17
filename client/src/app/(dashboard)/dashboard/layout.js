import { Inter, Source_Serif_4 } from "next/font/google";
import Sidebar from "@/components/layout/Sidebar";

export const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
});

export const serif = Source_Serif_4({
    subsets: ["latin"],
    variable: "--font-serif",
});

export const metadata = {
    title: "Newszone",
    description: "The newzone blog",
};

export default async function AdminLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} ${serif.variable} antialiased`}>
                <main className="max-w-screen flex">
                    <aside className="w-64">
                        <Sidebar />
                    </aside>
                    <section className="flex-1 p-5">
                        {children}
                    </section>
                </main>
            </body>
        </html>
    );
}
