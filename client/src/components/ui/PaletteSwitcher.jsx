"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { usePalette } from "@/app/providers"

const PALETTES = [
  { id: "orange", label: "Orange", color: "#ff6a00" },
  { id: "navy",   label: "Navy",   color: "#1a3a6b" },
  { id: "charcoal", label: "Charcoal", color: "#14161a" },
  { id: "green",  label: "Green",  color: "#2d6a4f" },
]

export default function PaletteSwitcher() {
  const { palette, setPalette } = usePalette()
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  const active = useMemo(() => {
    return PALETTES.find((p) => p.id === palette) ?? PALETTES[0]
  }, [palette])

  const otherPalettes = useMemo(() => {
    return PALETTES.filter((p) => p.id !== active.id)
  }, [active.id])

  useEffect(() => {
    function onPointerDown(e) {
      if (!wrapperRef.current) return
      if (wrapperRef.current.contains(e.target)) return
      setOpen(false)
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("touchstart", onPointerDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("touchstart", onPointerDown)
    }
  }, [])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <div ref={wrapperRef} className="relative flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Palette switcher"
        aria-haspopup="menu"
        aria-expanded={open}
        title={`Theme: ${active.label}`}
        style={{
          backgroundColor: active.color,
          borderColor: open ? "var(--text-primary)" : "transparent",
        }}
        className={`w-7 h-7 rounded-full border-2 transition-all duration-200
          hover:opacity-100 opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary) cursor-pointer
          focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-primary)
          ${open ? "scale-110" : "scale-100"}`}
      />

      {open && (
        <div
          role="menu"
          aria-label="Select theme palette"
          className="absolute right-0 top-full mt-2 z-50 w-44 rounded-md border border-(--border-light) shadow-md overflow-hidden bg-(--bg-primary)"
        >
          <div className="py-1">
            {otherPalettes.map((p) => (
              <button
                type="button"
                key={p.id}
                role="menuitem"
                onClick={() => {
                  setPalette(p.id)
                  setOpen(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-(--text-primary)
                  hover:bg-(--bg-secondary) transition-colors"
              >
                <span
                  aria-hidden="true"
                  className="w-4 h-4 rounded border border-(--border-medium) shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
