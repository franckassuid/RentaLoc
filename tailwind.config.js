/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        green: {
          traffic: '#22c55e',
        },
        yellow: {
          traffic: '#eab308',
        },
        red: {
          traffic: '#ef4444',
        },
      },
    },
  },
  plugins: [],
}
