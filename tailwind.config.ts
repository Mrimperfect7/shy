import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50:  "#FFFEF9",
          100: "#FAF7F2",
          200: "#F5F0E8",
          300: "#EDE5D8",
          400: "#E0D5C4",
        },
        forest: {
          50:  "#EEF3EC",
          100: "#D2E1CE",
          200: "#9DBA97",
          300: "#6A9964",
          400: "#4A6741",
          500: "#2D4A28",
          600: "#1E3219",
          700: "#111D0F",
        },
        earth: {
          100: "#EDD8C8",
          200: "#D4AA8A",
          300: "#B8854F",
          400: "#6B4C35",
          500: "#4A3224",
        },
        bronze: {
          100: "#F0E4C8",
          200: "#D4B878",
          300: "#B8924A",
          400: "#8C6D35",
          500: "#5C4520",
        },
        charcoal: {
          50:  "#F5F5F5",
          100: "#E5E5E5",
          200: "#C5C5C5",
          300: "#A0A0A0",
          400: "#6B6B6B",
          500: "#404040",
          600: "#2C2C2C",
          700: "#1A1A1A",
          800: "#0D0D0D",
        },
      },
      fontFamily: {
        serif:  ["var(--font-cormorant)", "Cormorant Garamond", "Georgia", "serif"],
        sans:   ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display:["var(--font-cormorant)", "Cormorant Garamond", "Georgia", "serif"],
      },
      fontSize: {
        "display-2xl": ["clamp(3rem,8vw,7rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-xl":  ["clamp(2.5rem,6vw,5rem)", { lineHeight: "1.08", letterSpacing: "-0.02em" }],
        "display-lg":  ["clamp(2rem,4vw,3.5rem)", { lineHeight: "1.1",  letterSpacing: "-0.015em" }],
        "display-md":  ["clamp(1.5rem,3vw,2.5rem)", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "display-sm":  ["clamp(1.25rem,2.5vw,2rem)", { lineHeight: "1.25" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
        "34": "8.5rem",
        "38": "9.5rem",
        "42": "10.5rem",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        "soft":    "0 2px 16px rgba(44,44,44,0.06)",
        "medium":  "0 4px 32px rgba(44,44,44,0.10)",
        "strong":  "0 8px 48px rgba(44,44,44,0.16)",
        "product": "0 12px 60px rgba(44,44,44,0.12)",
        "bronze":  "0 4px 24px rgba(184,146,74,0.20)",
      },
      transitionTimingFunction: {
        "expo-out": "cubic-bezier(0.16, 1, 0.3, 1)",
        "expo-in":  "cubic-bezier(0.7, 0, 0.84, 0)",
        "smooth":   "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      animation: {
        "fade-up":     "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in":     "fadeIn 0.4s ease both",
        "slide-right": "slideRight 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "slide-left":  "slideLeft 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "scale-in":    "scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) both",
        "shimmer":     "shimmer 1.5s infinite",
        "marquee":     "marquee 60s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideRight: {
          "0%":   { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideLeft: {
          "0%":   { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
