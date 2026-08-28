/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#edf8ff',
          100: '#d6effe',
          200: '#aee0fc',
          300: '#7ccdfa',
          400: '#3fb4f8',
          500: '#1ba7f8',
          600: '#18a6fc',
          700: '#0e92e6',
          800: '#1077bd',
          900: '#10618f',
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
