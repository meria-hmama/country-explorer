/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // week 5 redesign: blue -> pink 🌸
        // (500 and up are dark enough for white text and for text on white)
        brand: {
          50: "#fdf2f8",
          100: "#fce7f3",
          200: "#fbcfe8",
          300: "#f9a8d4",
          400: "#f472b6",
          500: "#db2777",
          600: "#be185d",
          700: "#9d174d",
        },
        lilac: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          500: "#9333ea",
          600: "#7e22ce",
        },
      },
      fontFamily: {
        sans: ["var(--font-quicksand)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
