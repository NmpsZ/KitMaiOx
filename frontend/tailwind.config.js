/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        accent: "#E4572E",
        "accent-dark": "#B83A1B",
        "accent-soft": "#FFF0EA",
        "accent-glow": "rgba(228, 87, 46, 0.18)",
        obsidian: "#FFF9F3",
        "obsidian-card": "#FFFFFF",
        "obsidian-border": "#F0E3D7",
        "obsidian-hover": "#FFF4EC",
        "herb-soft": "#EDF8E8",
        "herb-text": "#2F6B24",
        "herb-border": "#CFEAC6",
        "honey-soft": "#FFF5D9",
        "honey-text": "#7A4A00",
        "honey-border": "#F3DB9C",
        "mint-soft": "#E8F7F0",
        "mint-text": "#256A53",
        "mint-border": "#BCE7D6"
      },
      boxShadow: {
        glow: "0 14px 32px rgba(228, 87, 46, 0.18)",
        premium: "0 18px 45px rgba(91, 57, 38, 0.11)",
        glass: "0 10px 30px rgba(91, 57, 38, 0.08)"
      }
    }
  },
  plugins: []
};
