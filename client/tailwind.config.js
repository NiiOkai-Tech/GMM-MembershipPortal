// File: tailwind.config.js
// Configuration file for Tailwind CSS.
const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: {
          50: "#e6f4eb",
          100: "#cce9d7",
          200: "#b3ddc3",
          300: "#99d2af",
          400: "#80c69b",
          500: "#009146", // The specified brand color
          600: "#007a3b",
          700: "#00632f",
          800: "#004c23",
          900: "#003517",
        },
        // You can add secondary and other colors here
      },
    },
  },
  plugins: [],
};
