/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#FF4405',
        'primarySupport': '#FFF4ED',
        'secondary': '#344054',
        'secondarySupport': '#475467',
      },
      fontFamily: {
        'Inter': ['Inter', 'sans-serif'],
        'DMSans': ['DM Sans', 'sans-serif'],
        'Plus': ['Plus Jakarta Sans', "sans-serif"],
        'Poppins': ['Poppins', 'sans-serif'],
        "sans": ['Inter', 'sans-serif'],
        'Montserrat': ['Montserrat Alternates', 'sans-serif']
      },
      backgroundColor: {
        'card': 'linear-gradient(90deg, #2870EA 10.79%, #1B4AEF 87.08%)'
      },
      boxShadow: {
        'button': '0px 1px 2px rgba(16, 24, 40, 0.05)',
        'chat': ' 0px 0.3px 0.9px rgba(0, 0, 0, 0.12), 0px 1.6px 3.6px rgba(0, 0, 0, 0.16)',
        'input': 'rgba(149, 157, 165, 0.2) 0px 8px 24px'
      },
    },
  },
  plugins: [],
}