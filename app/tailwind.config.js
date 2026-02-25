/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "sage": {
          50: "#f6f9f4",
          100: "#eef3e9",
          200: "#dde7d3",
          300: "#c3d5b5",
          400: "#a8bf8f",
          500: "#7fa66e",
          600: "#648655",
          700: "#4f6a43",
          800: "#3e5334",
          900: "#2d3c25",
        }
      }
    },
  },
  plugins: [],
}
