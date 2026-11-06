import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      screens: {
        xs: "475px",
      },
      colors: {
        ink: "#121212",
        "ink-soft": "rgba(18,18,18,0.75)",
        // Brand palette taken from the original logo (token name kept as "mint"
        // so existing classes keep working): blush cream + logo brown.
        mint: {
          DEFAULT: "#f3e6da",
          dark: "#e6d2c0",
          deep: "#4a2c1f",
        },
        cream: "#fbf3e6",
        sand: "#efe1cb",
        // Silk-saree magenta from the brand video
        wine: "#7a1648",
        silk: { DEFAULT: "#8e1b55", deep: "#5e0f37" },
        // Section backgrounds: "filled" tints alternate with "empty" ivory (like the reference)
        ivory: "#fffbf5",
        petal: "#f5e0cf",
        goldwash: "#f6e8cc",
        blush: "#f3dfe2",
        gold: {
          light: "#f6d884",
          DEFAULT: "#c79a3b",
          dark: "#8a6410",
        },
      },
      fontFamily: {
        serif: ["var(--font-libre)", "Libre Baskerville", "serif"],
        sans: ["var(--font-dmsans)", "DM Sans", "sans-serif"],
        tamil: ["var(--font-tamil)", "Noto Serif Tamil", "serif"],
      },
      boxShadow: {
        card: "0 10px 30px -12px rgba(18,18,18,0.18)",
        soft: "0 2px 14px rgba(18,18,18,0.06)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 22s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
