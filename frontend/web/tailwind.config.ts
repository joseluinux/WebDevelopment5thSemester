import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Obsidian Palette
        obsidian: {
          bg: "#141315", // background — nível mais profundo
          surface: "#1C1B1D", // surface_container_low — canvas principal
          card: "#201F21", // surface_container — cards/módulos
          elevated: "#2B292C", // surface_container_high — cards elevados
          popover: "#3A393B", // surface_bright — popovers/modals
          highest: "#4A484B", // surface_container_highest — glassmorphism base
        },
        accent: {
          DEFAULT: "#6A8CF2", // primary_container — neon blue principal
          light: "#B4C5FF", // primary — versão clara para gradientes
          muted: "#3D5299", // accent mais escuro para hover
        },
        on: {
          surface: "#E6E1E5", // on_surface — texto principal
          muted: "#938F99", // on_surface_variant — texto secundário
          accent: "#FFFFFF", // on_primary
        },
        status: {
          success: "#4ADE80",
          warning: "#FBBF24",
          error: "#F87171",
          info: "#60A5FA",
        },
        // ── HTML Reference Design System (Material You / Obsidian) ──
        background: "#141315",
        surface: "#141315",
        "surface-dim": "#141315",
        "surface-bright": "#3a393b",
        "surface-container-lowest": "#0f0e10",
        "surface-container-low": "#1c1b1d",
        "surface-container": "#201f21",
        "surface-container-high": "#2b292c",
        "surface-container-highest": "#363436",
        "surface-variant": "#363436",
        "surface-tint": "#b4c5ff",
        primary: "#b4c5ff",
        "primary-container": "#6a8cf2",
        "primary-fixed": "#dbe1ff",
        "primary-fixed-dim": "#b4c5ff",
        "on-primary": "#002979",
        "on-primary-container": "#00246b",
        "on-primary-fixed": "#00174c",
        "on-primary-fixed-variant": "#103fa2",
        "inverse-primary": "#3358bb",
        secondary: "#b9c5f2",
        "secondary-container": "#39456b",
        "secondary-fixed": "#dbe1ff",
        "secondary-fixed-dim": "#b9c5f2",
        "on-secondary": "#232f53",
        "on-secondary-container": "#a8b4e0",
        "on-secondary-fixed": "#0c193d",
        "on-secondary-fixed-variant": "#39456b",
        tertiary: "#ffba49",
        "tertiary-container": "#c38400",
        "tertiary-fixed": "#ffddb1",
        "tertiary-fixed-dim": "#ffba49",
        "on-tertiary": "#442b00",
        "on-tertiary-container": "#3b2500",
        "on-tertiary-fixed": "#291800",
        "on-tertiary-fixed-variant": "#624000",
        error: "#ffb4ab",
        "error-container": "#93000a",
        "on-error": "#690005",
        "on-error-container": "#ffdad6",
        "on-surface": "#e6e1e4",
        "on-surface-variant": "#c4c6d5",
        "on-background": "#e6e1e4",
        outline: "#8e909e",
        "outline-variant": "#434652",
        "inverse-surface": "#e6e1e4",
        "inverse-on-surface": "#313032",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
        headline: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
        label: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      fontSize: {
        "display-lg": [
          "3.5rem",
          { lineHeight: "1.1", letterSpacing: "-0.02em" },
        ],
        "display-md": [
          "2.5rem",
          { lineHeight: "1.15", letterSpacing: "-0.015em" },
        ],
        "display-sm": [
          "1.875rem",
          { lineHeight: "1.2", letterSpacing: "-0.01em" },
        ],
      },
      backgroundImage: {
        "accent-gradient": "linear-gradient(135deg, #B4C5FF 0%, #6A8CF2 100%)",
        "obsidian-gradient":
          "linear-gradient(180deg, #141315 0%, #1C1B1D 100%)",
        "card-gradient": "linear-gradient(135deg, #201F21 0%, #2B292C 100%)",
      },
      boxShadow: {
        obsidian: "0 4px 24px rgba(0, 0, 0, 0.6)",
        "accent-glow": "0 0 20px rgba(106, 140, 242, 0.25)",
        card: "0 2px 12px rgba(0, 0, 0, 0.4)",
      },
      backdropBlur: {
        glass: "20px",
      },
      borderRadius: {
        card: "12px",
        modal: "16px",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        shimmer: "shimmer 2s infinite linear",
      },
    },
  },
  plugins: [],
};

export default config;
