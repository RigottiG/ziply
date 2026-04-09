/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#0a0a0a',
          panel: '#0f0f0f',
          border: '#222222',
          'border-light': '#333333',
          green: '#00ff41',
          'green-dim': '#00cc33',
          text: '#b0b0b0',
          muted: '#666666',
          dim: '#333333',
          error: '#ff4141',
        },
      },
      fontFamily: {
        mono: ['SF Mono', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
