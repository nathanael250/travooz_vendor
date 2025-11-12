/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Primary brand color - vibrant green from logo
          DEFAULT: '#3CAF54', // Primary brand color
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#3CAF54', // Primary brand color
          500: '#2d8f42',
          600: '#1f6f31',
          700: '#165224',
          800: '#0e3517',
          900: '#06180a',
        },
      },
    },
  },
  plugins: [],
};

