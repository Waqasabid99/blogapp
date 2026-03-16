import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { getAllCategories } from "@/actions/category.action";
import { Providers } from "./providers";
import { ToastContainer } from "react-toastify";
import CheckAuth from "@/constants/CheckAuth";

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

export default async function RootLayout({ children }) {
  const { data: categories } = await getAllCategories();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${serif.variable} antialiased`}>
        <Providers>
          <CheckAuth>
            <Navbar categories={categories} />
            <ToastContainer />
            {children}
          </CheckAuth>
        </Providers>
      </body>
    </html>
  );
}
