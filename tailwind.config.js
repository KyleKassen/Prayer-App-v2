/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5', // Indigo 600
        surface: '#F8FAFC', // Slate 50
        'surface-highlight': '#FFFFFF',
      },
    },
  },
  plugins: [],
}
