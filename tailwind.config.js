/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#93C572",
        secondary: "#87CEEB", 
        cancel: "#FF6B6B",
        customText: "#11181C",
        customBg: "#FFFFFF",
        customDarkText: "#ECEDEE",
        customDarkBg: "#151718",
      }
    }
  },
  plugins: []
};