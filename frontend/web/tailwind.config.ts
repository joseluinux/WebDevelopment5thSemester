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
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
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
