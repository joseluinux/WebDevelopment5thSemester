import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // Content paths para escanear por Tailwind
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // Personalização do tema
    extend: {
      colors: {
        // Paleta UPX
        dark: "#0a0a0c", // rgba(10, 10, 12, 1)
        primary: "#6a8cf2", // rgba(106, 140, 242, 1) - Azul claro
        "primary-dark": "#5973bf", // rgba(89, 115, 191, 1) - Azul escuro
        "text-dark": "#2f393f", // rgba(47, 57, 63, 1) - Cinza escuro
        "light-blue": "#91cbd8", // rgba(145, 203, 216, 1) - Azul claro
      },
      backgroundImage: {
        "gradient-dark": "linear-gradient(135deg, #0a0a0c 0%, #2f393f 100%)",
        "gradient-primary": "linear-gradient(135deg, #6a8cf2 0%, #5973bf 100%)",
        "gradient-light": "linear-gradient(135deg, #91cbd8 0%, #6a8cf2 100%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(106, 140, 242, 0.3)",
        "glow-lg": "0 0 40px rgba(106, 140, 242, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
