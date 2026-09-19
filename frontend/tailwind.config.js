/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        industrial: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          850: '#141e33',
          900: '#0f172a',
          950: '#070b14',
        },
        brand: {
          blue: '#3b82f6',
          cobalt: '#2563eb',
          cyan: '#0284c7',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#ef4444',
          indigo: '#6366f1',
          slate: '#475569'
        }
      }
    },
  },
  plugins: [],
}
