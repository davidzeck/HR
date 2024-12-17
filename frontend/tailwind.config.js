/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          dark: '#1a1a1a',
          light: '#2c3e50'
        }
      }
    },
  },
  plugins: [],
} 