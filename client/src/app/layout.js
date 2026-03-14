import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata = {
  title: "Newzone",
  description: "The newzone blog",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${serif.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
