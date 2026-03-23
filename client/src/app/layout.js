import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import "./styles/ucStyles.css";
import Navbar from "@/components/layout/Navbar";
import { getAllCategories } from "@/actions/category.action";
import { Providers } from "./providers";
import { ToastContainer } from "react-toastify";
import CheckAuth from "@/constants/CheckAuth";
import Footer from "@/components/layout/Footer";
import BackToTop from "@/components/ui/BackToTop";
import { generateSEO } from "@/constants/seo";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
});


export const metadata = generateSEO({
  title: {
    template: "%s | Newszone",
    default: "Newszone",
  },
  description: "The newzone blog - Your source for the latest news and insights",
});

export default async function RootLayout({ children }) {
  const categories = await getAllCategories();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${serif.variable} antialiased`}>
        <Providers>
          <CheckAuth>
            <div className="flex flex-col justify-between">
              <Navbar categories={categories?.data} />
              <ToastContainer />
              {children}
              <BackToTop />
              <Footer categories={categories?.data} />
            </div>
          </CheckAuth>
        </Providers>
      </body>
    </html>
  );
}