/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          hover: "var(--color-secondary-hover)",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "#1F1F1F",
        },
        background: "var(--color-bg-main)",
        section: "var(--color-bg-section)",
        card: {
          DEFAULT: "var(--color-bg-card)",
          foreground: "var(--color-text-primary)",
        },
        foreground: "var(--color-text-primary)",
        muted: {
          DEFAULT: "var(--color-hover)",
          foreground: "var(--color-text-muted)",
        },
        border: "var(--color-border)",
        input: "var(--color-input)",
        ring: "var(--color-primary)",
        "cat-pizza": "#FFB347",
        "cat-biryani": "#FF6F3C",
        "cat-desserts": "#F78FB3",
        "cat-healthy": "#6BCB77",
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
        "gradient-cta": "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
      },
    },
  },
  plugins: [],
};
  