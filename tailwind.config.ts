import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./icons/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "rgb(226, 232, 240)", // slate-200
        background: "rgb(248, 250, 252)", // slate-50
        foreground: "rgb(15, 23, 42)", // slate-900
        primary: {
          DEFAULT: "rgb(79, 70, 229)", // indigo-600
          hover: "rgb(67, 56, 202)", // indigo-700
          light: "rgb(238, 242, 255)", // indigo-50
        },
        secondary: {
          DEFAULT: "rgb(241, 245, 249)", // slate-100
          hover: "rgb(226, 232, 240)", // slate-200
          text: "rgb(30, 41, 59)", // slate-800
        },
        danger: {
          DEFAULT: "rgb(220, 38, 38)", // red-600 (strict standard red color)
          hover: "rgb(185, 28, 28)", // red-700
          light: "rgb(254, 242, 242)", // red-50
        },
        warning: {
          DEFAULT: "rgb(217, 119, 6)", // amber-600
          hover: "rgb(180, 83, 9)", // amber-700
          light: "rgb(254, 243, 199)", // amber-50
        },
        muted: {
          DEFAULT: "rgb(100, 116, 139)", // slate-500
          foreground: "rgb(71, 85, 105)", // slate-600
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      animation: {
        marquee: "marquee 20s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-33.33%)" },
        },
      },
    },
  },
  plugins: [],
}

export default config;
