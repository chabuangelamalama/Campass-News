/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17181C",
        paper: "#FFF8F3",
        magenta: { DEFAULT: "#E31C5F", dark: "#B8134B" },
        gold: "#F2A93B",
        lilac: "#EDE6F9",
        newsgrey: "#6B6B76",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Work Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};