const config = {
  theme: {
    darkMode: "class",
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        serif: ["var(--font-serif)", "Source Serif 4", "serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#FF6A00",
          hover: "#E65F00",
        },

        editorial: {
          bg: "#FFFFFF",
          surface: "#F7F7F7",
          subtle: "#EFEFEF",
        },

        text: {
          primary: "#111111",
          secondary: "#555555",
          muted: "#8A8A8A",
        },

        border: {
          light: "#E5E5E5",
          medium: "#D6D6D6",
        }

      }
    }
  }
}

export default config