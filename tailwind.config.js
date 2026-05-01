/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:   '#FF6B35',
        secondary: '#F7C59F',
        accent:    '#EFEFD0',
        dark:      '#004E89',
        bold:      '#1A936F',
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body:    ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}