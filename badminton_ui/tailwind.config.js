/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors: {
            primary: '#DFFF00', // Neon Lime
            background: '#0D0D0D', // Dark Background
            surface: '#1A1A1A', // Slightly lighter for cards
        },
        fontFamily: {
            sans: ['Inter', 'sans-serif'], // Assuming Inter, will need to import it
        }
    },
  },
  plugins: [],
}
