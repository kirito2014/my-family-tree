/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#80ec13',
        'primary-hover': '#6dd10d',
        'background-light': '#f7f8f6',
        'background-dark': '#192210',
        'cream-white': '#fcfdfa',
        'forest-dark': '#141811',
        'sage-text': '#758961',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'pattern': "radial-gradient(#80ec13 0.5px, transparent 0.5px), radial-gradient(#80ec13 0.5px, #f7f8f6 0.5px)",
      },
    },
  },
  plugins: [],
}