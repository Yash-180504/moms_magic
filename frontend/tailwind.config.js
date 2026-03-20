/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Playfair Display SC', 'Georgia', 'serif'],
        sans: ['Karla', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#EA580C',
          hover: '#C2410C',
          light: '#FFF7ED',
        },
        accent: {
          DEFAULT: '#2563EB',
          light: '#EFF6FF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#FDF4F0',
        },
        brand: {
          border: '#FCEAE1',
          text: '#0F172A',
          muted: '#64748B',
        },
      },
      borderRadius: {
        card: '1rem',
      },
    },
  },
  plugins: [],
};
