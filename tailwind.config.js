/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: "class",
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx,html}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
