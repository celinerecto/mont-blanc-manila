import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FFF8F0",
          surface: "#FFFDF9",
        },
        orange: {
          DEFAULT: "#E8621A",
          hover: "#C4873A",
          pale: "#FDE8CC",
        },
        espresso: "#2C1A0E",
        brown: {
          DEFAULT: "#5C3D2E",
          muted: "#A07850",
          border: "#EDD9C0",
        },
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        inter: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "vote-bounce": "voteBounce 0.4s ease-out",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        voteBounce: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.25)" },
          "70%": { transform: "scale(0.92)" },
          "100%": { transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
