/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          950: '#090d16',
          900: '#0f172a', // Primary background
          850: '#131e33',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
          100: '#f1f5f9',
        },
        lime: {
          accent: '#bdf200',
          glow: '#ccff00',
          dark: '#65a30d',
        },
        gold: {
          accent: '#eab308',
          metallic: '#d4af37',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        industrial: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      boxShadow: {
        'lime-glow': '0 0 15px rgba(189, 242, 0, 0.35)',
        'gold-glow': '0 0 15px rgba(234, 179, 8, 0.35)',
        'industrial': '0 4px 20px -2px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(51, 65, 85, 0.5)'
      }
    },
  },
  plugins: [],
}
