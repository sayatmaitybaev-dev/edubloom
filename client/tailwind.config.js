/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pink: {
          50:  '#fff0f6',
          100: '#ffe0ee',
          200: '#ffc2d9',
          300: '#ff94bf',
          400: '#ff5c9d',
          500: '#f72585',
          600: '#d91a6e',
          700: '#b31259',
          800: '#920f49',
          900: '#7a0f3e',
        },
        rose: {
          50:  '#fff1f2',
          100: '#ffe4e6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
