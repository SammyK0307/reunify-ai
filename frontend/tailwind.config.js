/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Syne'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        display: ["'Clash Display'", "'Syne'", "sans-serif"],
      },
      colors: {
        ink: "#0A0A0F",
        surface: "#111118",
        panel: "#1A1A24",
        border: "#2A2A3A",
        accent: "#4F8EF7",
        "accent-glow": "#4F8EF780",
        success: "#22C55E",
        warn: "#F59E0B",
        danger: "#EF4444",
        muted: "#6B7280",
        text: "#E8E8F0",
        "text-dim": "#9090A8",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "scan": "scan 2s linear infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(16px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        scan: { from: { top: "0%" }, to: { top: "100%" } },
      },
    },
  },
  plugins: [],
}
