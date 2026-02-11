/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Tailwind v4 handles dark mode differently via CSS @variant
  // but this config is kept for compatibility
  theme: {
    extend: {},
  },
  plugins: [],
}
