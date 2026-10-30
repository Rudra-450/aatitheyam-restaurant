/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#b89485',
          600: '#9b7364',
          700: '#7d5648',
          800: '#644439',
          900: '#4c332b',
          950: '#2b1a15',
        },
        gold: {
          400: '#eab308',
          500: '#ca8a04',
          600: '#a16207',
        },
        luxury: {
          dark: '#0f1015',
          surface: '#181a20',
          card: '#1f222b',
          border: '#2e3340',
          text: '#f3f4f6',
          muted: '#9ca3af',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
