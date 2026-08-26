/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f0ff',
          100: '#ece3ff',
          200: '#d5c4ff',
          300: '#b898ff',
          400: '#9a6aff',
          500: '#673de6',
          600: '#5a35cc',
          700: '#4d2db3',
          800: '#3d248f',
          900: '#2d1b6b',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgba(0,0,0,0.04), 0 1px 6px -1px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
