import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0D0E11",
        surface: "#111318",
        "surface-container-lowest": "#0C0E13",
        "surface-container-low": "#14161B",
        "surface-container": "#1A1D24",
        "surface-container-high": "#232730",
        "surface-container-highest": "#2E3440",
        outline: "#938E9E",
        "outline-variant": "#343844",
        primary: {
          DEFAULT: "#7C66DC",
          hover: "#6C55CF",
          active: "#5B44BE",
          light: "#CABEFF",
          muted: "rgba(124, 102, 220, 0.15)",
        },
        secondary: {
          DEFAULT: "#10B981",
          hover: "#059669",
          muted: "rgba(16, 185, 129, 0.15)",
          container: "#064E3B",
        },
        warning: {
          DEFAULT: "#F59E0B",
          hover: "#D97706",
          muted: "rgba(245, 158, 11, 0.15)",
          container: "#78350F",
        },
        danger: {
          DEFAULT: "#EF4444",
          hover: "#DC2626",
          muted: "rgba(239, 68, 68, 0.15)",
          container: "#7F1D1D",
        },
        "on-surface": "#F3F4F6",
        "on-surface-variant": "#9CA3AF",
        "on-surface-muted": "#6B7280",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
