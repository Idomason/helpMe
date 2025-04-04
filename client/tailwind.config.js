/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
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
      animation: {
        shimmer: "shimmer 8s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
