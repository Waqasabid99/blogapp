"use client"

import { ThemeProvider } from "next-themes"
import { createContext, useContext, useEffect, useState } from "react"

// ── Palette Context ──────────────────────────────────────────
const PaletteContext = createContext(null)

export function usePalette() {
  const ctx = useContext(PaletteContext)
  if (!ctx) throw new Error("usePalette must be used inside Providers")
  return ctx
}

// ── Combined Provider ────────────────────────────────────────
export function Providers({ children }) {
  const [palette, setPaletteState] = useState("orange") // "orange" | "green" | "navy" | "charcoal"

  // On mount, read saved palette from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("palette")
    if (saved) setPaletteState(saved)
  }, [])

  // Apply data-theme to <html> whenever palette changes
  useEffect(() => {
    const html = document.documentElement
    if (palette === "orange") {
      html.removeAttribute("data-theme")   // orange is the :root default
    } else {
      html.setAttribute("data-theme", palette)
    }
  }, [palette])

  const setPalette = (p) => {
    setPaletteState(p)
    localStorage.setItem("palette", p)
  }

  return (
    <PaletteContext.Provider value={{ palette, setPalette }}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        storageKey="theme-store"
      >
        {children}
      </ThemeProvider>
    </PaletteContext.Provider>
  )
}