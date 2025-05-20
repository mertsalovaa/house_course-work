/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: '#05503C',
        light: '#DEECDF',
        accent: '#6FA6FF',
        additional: '#5A8661',
        warning: '#FBC02D',
        error: '#E53835',
        success: '#2E7D31',
        lighter: '#E6F0E6',
        'light-green': '#BDDAD2'
      }
    },
  },
  plugins: [],
}
