/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#FFF7ED',
          border: '#FCEAE1',
          primary: '#EA580C',
          primaryDark: '#C2410C',
          heading: '#0F172A',
          muted: '#64748B',
        },
      },
    },
  },
  plugins: [],
}
