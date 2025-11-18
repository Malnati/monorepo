// app/ui/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "rgb(40 167 69 / var(--tw-bg-opacity, 1))",
        "background-light": "#f6f8f6",
        "background-dark": "#102210",
        "green-accent": "rgb(40 167 69 / var(--tw-bg-opacity, 1))",
        "dark-gray": "#343a40",
        "light-gray": "#f8f9fa",
        "card-light": "#f8f9fa",
        "card-dark": "#343a40",
        "text-light-primary": "#343a40",
        "text-dark-primary": "#f8f9fa",
        "text-light-secondary": "rgb(40 167 69 / var(--tw-text-opacity, 1))",
        "text-dark-secondary": "rgb(40 167 69 / var(--tw-text-opacity, 1))",
        "chip-light": "#f8f9fa",
        "chip-dark": "#343a40",
        "chip-text-light": "#343a40",
        "chip-text-dark": "#f8f9fa",
        "marker-default": "#28a745",
        "marker-selected": "#1e7e34",
        "marker-hover": "#218838",
        "feedback-error": "#dc2626",
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
