/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
  ],
  corePlugins: {
    preflight: true,
  },
  important: true,
  theme: {
    extend: {},
  },
  plugins: [],
}