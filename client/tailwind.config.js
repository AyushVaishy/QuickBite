/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover:   "var(--color-primary-hover)",
          foreground: "#ffffff",
          soft:    "var(--color-primary-soft)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          hover:   "var(--color-secondary-hover)",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          hover:   "var(--color-accent-hover)",
          foreground: "#1F1F1F",
        },
        background: "var(--color-bg-main)",
        section:    "var(--color-bg-section)",
        card: {
          DEFAULT:    "var(--color-bg-card)",
          foreground: "var(--color-text-primary)",
        },
        foreground: "var(--color-text-primary)",
        muted: {
          DEFAULT:    "var(--color-hover-bg)",
          foreground: "var(--color-text-muted)",
        },
        border: "var(--color-border)",
        input:  "var(--color-input-bg)",
        ring:   "var(--color-primary)",
        // Category colors
        "cat-pizza":    "#FFB347",
        "cat-biryani":  "#FF6F3C",
        "cat-desserts": "#F78FB3",
        "cat-healthy":  "#6BCB77",
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
        "gradient-cta":  "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
        "gradient-card-glow": "linear-gradient(135deg, var(--color-primary-soft), transparent)",
        "radial-hero": "radial-gradient(ellipse at top right, var(--color-primary-soft), transparent 55%)",
      },
      boxShadow: {
        glow:       "0 0 20px -4px var(--shadow-soft)",
        "glow-md":  "0 0 32px -6px var(--shadow-soft)",
        soft:       "0 4px 20px -4px var(--shadow-card)",
        "card-lift":"0 8px 32px -8px var(--shadow-card)",
      },
      fontFamily: {
        sans:    ["Manrope", "system-ui", "sans-serif"],
        display: ["Sora", "Manrope", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl:   "0.75rem",
        "2xl":"1rem",
        "3xl":"1.5rem",
      },
      animation: {
        "fade-in":  "fadeIn 0.25s ease both",
        "slide-up": "slideUp 0.3s ease both",
        "scale-in": "scaleIn 0.2s ease both",
      },
      keyframes: {
        fadeIn:  { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        scaleIn: { from: { opacity: "0", transform: "scale(0.95)" },     to: { opacity: "1", transform: "scale(1)" } },
      },
    },
  },
  plugins: [],
};
