/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#070a12',
          surface: '#0d1322',
          card: '#121a2e',
          border: 'rgba(56, 189, 248, 0.18)',
          glow: 'rgba(56, 189, 248, 0.4)'
        },
        neon: {
          cyan: '#38bdf8',
          purple: '#c084fc',
          amber: '#fbbf24',
          emerald: '#34d399',
          pink: '#f472b6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Aptos', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      }
    }
  },
  plugins: []
}

