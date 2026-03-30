/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#00c896',
          red:   '#ff4d6a',
          blue:  '#4d9fff',
          bg:    '#0a0d14',
          bg2:   '#111520',
          bg3:   '#161b28',
          bg4:   '#1c2235',
        },
      },
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
