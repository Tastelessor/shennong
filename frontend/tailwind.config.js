/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 定义一些中医风格的颜色
        'tcm-primary': '#4a6741', // 草药绿
        'tcm-secondary': '#8c4b37', // 赭石红
        'tcm-cream': '#fdfbf7', // 米纸色
      }
    },
  },
  plugins: [],
}