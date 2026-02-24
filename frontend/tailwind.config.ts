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
        primary: "#2C3E2E", // Forest Green
        secondary: "#F5F5F0", // Cream
        accent: "#D4AF37", // Gold
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        serif: ["var(--font-cinzel)"],
      },
    },
  },
  plugins: [],
};
export default config;
