/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1B4D6B',
          deep: '#133A52',
          light: '#2A6A8F',
          soft: '#E8EEF2',
        },
        cream: {
          DEFAULT: '#F0EDE6',
          warm: '#F7F5F0',
          deep: '#E8E4DA',
        },
        gold: {
          DEFAULT: '#C4985A',
          light: '#D4B07A',
          soft: '#EFE4D0',
        },
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
