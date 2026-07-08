/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#2d7dd2",
        "secondary": "#34a853",
        "background-light": "#f6f7f8",
        "background-dark": "#121920",
      },
      fontFamily: {
        "display": ["Space Grotesk"]
      },
    },
  },
  plugins: [],
}
