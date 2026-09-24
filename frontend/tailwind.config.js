/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f7f6f2",
        ink: "#1c2430",
        "ink-soft": "#545f6e",
        line: "#d8d5cc",
        accent: "#2f6f4e",
        "accent-soft": "#e4efe8",
        danger: "#a5432f",
      },
      fontFamily: {
        serif: ["Source Serif 4", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
