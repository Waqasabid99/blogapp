"use client";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body className="bg-[#0f0f0f] text-[#f5f5f5] min-h-screen flex items-center justify-center font-sans antialiased m-0">
        <div className="max-w-2xl w-full mx-auto p-8 flex flex-col items-center text-center">

          {/* Glowing Error Icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
            <div className="relative w-24 h-24 bg-red-950/30 border border-red-500/30 text-red-500 rounded-full flex items-center justify-center">
              <AlertCircle size={48} strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight">System Exception</h1>

          <p className="text-[#a1a1aa] text-lg md:text-xl mb-12 max-w-xl leading-relaxed">
            We encountered a critical error while trying to load the application. Our engineering team has been notified of this incident.
          </p>

          <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto justify-center gap-4 mb-16">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-[#ff6a00] hover:bg-[#e65f00] text-white px-8 py-3.5 rounded-lg font-medium transition-all active:scale-95 shadow-lg shadow-[#ff6a00]/20"
            >
              <RefreshCcw size={18} />
              Attempt Recovery
            </button>

            <a
              href="/"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white px-8 py-3.5 rounded-lg font-medium transition-all border border-[#3a3a3a] active:scale-95"
            >
              <Home size={18} />
              Return Home
            </a>
          </div>

          {/* Development Stack Trace */}
          {process.env.NODE_ENV === 'development' && (
            <div className="w-full text-left bg-[#000000] rounded-xl overflow-hidden border border-[#2a2a2a]">
              <div className="bg-[#1f1f1f] px-6 py-3 border-b border-[#2a2a2a] flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <p className="font-mono text-xs text-[#c7c7c7] font-semibold uppercase tracking-wider">Development Details</p>
              </div>
              <div className="p-6 overflow-auto max-h-[350px]">
                <p className="font-mono text-sm text-red-400 font-bold mb-2 wrap-break-word">
                  {error?.message || "Unknown error occurred"}
                </p>
                {error?.digest && (
                  <p className="font-mono text-xs text-[#8a8a8a] mt-2 border-t border-[#2a2a2a] pt-2">
                    Digest ID: {error.digest}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}