"use client";
import "./globals.css";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Providers } from "./providers";
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <head>
        <title>System Exception | Newszone</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="We encountered a critical error while trying to load the application. Our engineering team has been notified of this incident." />
        <meta name="keywords" content="system exception, error, newszone" />
        <meta name="author" content="Newszone" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="Newszone" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="Newszone" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="Newszone" />
      </head>
      <Providers>
        <body className={`bg-(--bg-primary) text-(--text-primary) min-h-screen flex items-center justify-center font-sans antialiased m-0`}>
          <div className="max-w-2xl w-full mx-auto p-8 flex flex-col items-center text-center">

            {/* Glowing Error Icon */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-(--brand-primary) blur-xl opacity-20 rounded-full animate-pulse"></div>
              <div className="relative w-24 h-24 bg-(--bg-secondary) border border-(--border-medium) text-(--text-primary) rounded-full flex items-center justify-center">
                <AlertCircle size={48} strokeWidth={1.5} />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight">System Exception</h1>

            <p className="text-(--text-secondary) text-lg md:text-xl mb-12 max-w-xl leading-relaxed">
              We encountered a critical error while trying to load the application. Our engineering team has been notified of this incident.
            </p>

            <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto justify-center gap-4 mb-16">
              <button
                onClick={() => reset()}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-(--brand-primary) hover:bg-(--brand-primary-hover) text-(--text-white) px-8 py-3.5 rounded-lg font-medium transition-all active:scale-95 shadow-lg shadow-(--brand-primary)/20"
              >
                <RefreshCcw size={18} />
                Attempt Recovery
              </button>

              <a
                href="/"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-(--bg-dark) hover:bg-(--bg-secondary) text-(--text-white) px-8 py-3.5 rounded-lg font-medium transition-all border border-(--border-medium) active:scale-95"
              >
                <Home size={18} />
                Return Home
              </a>
            </div>

            {/* Development Stack Trace */}
            {process.env.NODE_ENV === 'development' && (
              <div className="w-full text-left bg-(--bg-dark) rounded-xl overflow-hidden border border-(--border-medium)">
                <div className="bg-(--bg-secondary) px-6 py-3 border-b border-(--border-medium) flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-(--brand-primary)"></div>
                  <p className="font-mono text-xs text-(--text-secondary) font-semibold uppercase tracking-wider">Development Details</p>
                </div>
                <div className="p-6 overflow-auto max-h-[350px]">
                  <p className="font-mono text-sm text-(--text-secondary) font-bold mb-2 wrap-break-word">
                    {error?.message || "Unknown error occurred"}
                  </p>
                  {error?.digest && (
                    <p className="font-mono text-xs text-(--text-secondary) mt-2 border-t border-(--border-medium) pt-2">
                      Digest ID: {error.digest}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </body>
      </Providers>
    </html>
  );
}