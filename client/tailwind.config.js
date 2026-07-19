/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#004ac6',
          dark: '#003ba0',
          light: '#e6f0ff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 8px 30px rgb(0 0 0 / 0.04)',
        'premium-hover': '0 12px 40px rgb(0 0 0 / 0.08)',
      }
    },
  },
  plugins: [],
}
