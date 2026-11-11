import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      screens: { md: "821px" },
      colors: {
        wine: { DEFAULT: "#380713", deep: "#21040B", mid: "#4A0C1B" },
        gold: { DEFAULT: "#B89551", light: "#E3C78D", dark: "#8A6B33" },
        ivory: "#F5F0E7",
        marble: "#EAE3D6",
        walnut: "#6E4326",
        ink: "#090807",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: { label: "0.32em" },
      transitionTimingFunction: { palace: "cubic-bezier(0.22, 1, 0.36, 1)" },
    },
  },
  plugins: [],
};

export default config;
