/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#10b981", // Emerald accent
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#6366f1", // Indigo accent
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        /* Sombras mucho más intensas y expansivas para garantizar un efecto 3D altísimo */
        sm: "0 4px 12px -2px rgba(0, 0, 0, 0.12), 0 2px 8px -2px rgba(0, 0, 0, 0.08)",
        DEFAULT: "0 8px 24px -4px rgba(0, 0, 0, 0.15), 0 4px 12px -3px rgba(0, 0, 0, 0.10)",
        md: "0 12px 36px -6px rgba(0, 0, 0, 0.20), 0 6px 16px -4px rgba(0, 0, 0, 0.12)",
        lg: "0 24px 48px -8px rgba(0, 0, 0, 0.25), 0 10px 20px -6px rgba(0, 0, 0, 0.15)",
        xl: "0 32px 64px -10px rgba(0, 0, 0, 0.30), 0 16px 32px -8px rgba(0, 0, 0, 0.15)",
      },
    },
  },
  plugins: [],
}
