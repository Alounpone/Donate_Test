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
        background: "var(--background)",
        foreground: "var(--foreground)",
        bcel: {
          red: "#D32F2F",
          darkRed: "#9A0007",
          gold: "#FFB800",
          blue: "#003366",
        },
      },
      animation: {
        "pop-in": "popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        "glow-pulse": "glowPulse 2s infinite alternate",
        "float": "float 3s ease-in-out infinite",
        "slide-up": "slideUp 0.4s ease-out forwards",
      },
      keyframes: {
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.6) translateY(40px)" },
          "70%": { transform: "scale(1.05) translateY(-5px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        glowPulse: {
          "0%": { boxShadow: "0 0 15px rgba(234, 179, 8, 0.4), 0 0 30px rgba(59, 130, 246, 0.3)" },
          "100%": { boxShadow: "0 0 35px rgba(234, 179, 8, 0.8), 0 0 60px rgba(168, 85, 247, 0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
