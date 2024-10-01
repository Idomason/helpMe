/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        helpMe: {
          50: "#f9f5ff",
          100: "#f2e8ff",
          200: "#e7d5ff",
          300: "#d4b3ff",
          400: "#b983fd",
          500: "#9f54f8",
          600: "#8931ec",
          700: "#7421cf",
          800: "#6420aa",
          900: "#521b88",
          950: "#360665",
        },
      },
    },
  },
  plugins: [],
};
