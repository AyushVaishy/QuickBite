/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Neo-Theme Brand ────────────────────────────────────
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          foreground: "#ffffff",
          soft: "var(--color-primary-soft)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          hover: "var(--color-secondary-hover)",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          foreground: "#1A1A2E",
        },
        // ── Surfaces ───────────────────────────────────────────
        background: "var(--color-bg-main)",
        section: "var(--color-bg-section)",
        card: {
          DEFAULT: "var(--color-bg-card)",
          foreground: "var(--color-text-primary)",
        },
        // ── Text ───────────────────────────────────────────────
        foreground: "var(--color-text-primary)",
        muted: {
          DEFAULT: "var(--color-hover-bg)",
          foreground: "var(--color-text-muted)",
        },
        // ── UI chrome ──────────────────────────────────────────
        border: "var(--color-border)",
        input: "var(--color-input-bg)",
        ring: "var(--color-primary)",
        // ── Category accents ───────────────────────────────────
        "cat-pizza": "#FF8C00",
        "cat-biryani": "#E05C2A",
        "cat-desserts": "#E879A8",
        "cat-healthy": "#22C55E",
      },
      backgroundImage: {
        // Neo hero gradient: violet → amber
        "gradient-hero":
          "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
        // CTA gradient: violet → emerald
        "gradient-cta":
          "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
        // Subtle card glow
        "gradient-card-glow":
          "linear-gradient(135deg, var(--color-primary-soft), transparent)",
        // Dark purple radial for hero backgrounds
        "radial-hero":
          "radial-gradient(ellipse at top right, var(--color-primary-soft), transparent 55%)",
      },
      boxShadow: {
        glow: "0 0 20px -4px var(--color-primary-soft)",
        "glow-md": "0 0 32px -6px var(--color-primary-soft)",
        soft: "0 4px 20px -4px var(--shadow-soft)",
        "card-lift": "0 8px 32px -8px var(--shadow-soft)",
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        display: ["Sora", "Manrope", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      transitionDuration: {
        theme: "250ms",
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease both",
        "slide-up": "slideUp 0.3s ease both",
        "scale-in": "scaleIn 0.2s ease both",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
  