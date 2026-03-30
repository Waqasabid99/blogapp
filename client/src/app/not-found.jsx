"use client";
import Link from "next/link";
import { SearchX, Home, ArrowLeft } from "lucide-react";
import { Providers } from "./providers";

export default function NotFound() {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Page Not Found | Newszone</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="We couldn't find the page you're looking for. It might have been moved, deleted, or perhaps the URL is incorrect." />
        <meta name="keywords" content="page not found, error, newszone" />
        <meta name="author" content="Newszone" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      </head>
    <Providers>
    <div className="bg-(--bg-primary) min-h-[80vh] flex flex-col items-center justify-center px-6 text-center py-20">

      {/* Glowing 404 Icon */}
      <div className="relative mb-10 w-32 h-32 flex items-center justify-center mx-auto">
        <div className="absolute inset-0 bg-(--brand-primary) blur-2xl opacity-20 rounded-full animate-pulse"></div>
        <div className="relative w-full h-full bg-(--bg-secondary) border border-(--border-light) rounded-full flex items-center justify-center shadow-(--shadow-sm)">
          <SearchX size={56} className="text-(--brand-primary)" strokeWidth={1.5} />
        </div>
      </div>

      <h1 className="text-7xl md:text-9xl font-bold text-(--text-primary) tracking-tighter mb-4">
        404
      </h1>

      <h2 className="heading-2 text-(--text-primary) mb-6">
        Page Not Found
      </h2>

      <p className="text-body text-(--text-secondary) max-w-lg mx-auto mb-12 leading-relaxed">
        Oops! We couldn't find the page you're looking for. It might have been moved, deleted, or perhaps the URL is incorrect.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
        <button
          onClick={() => window.history.back()}
          className="btn btn-outline w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3"
        >
          <ArrowLeft size={18} />
          Go Back
        </button>

        <Link
          href="/"
          className="btn btn-primary w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3"
        >
          <Home size={18} />
          Back to Home
        </Link>
      </div>
    </div>
    </Providers>
    </html>
  );
}