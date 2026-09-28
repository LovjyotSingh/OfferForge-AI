/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0B0A09',
          900: '#12100E',
          800: '#1A1714',
          700: '#26221D'
        },
        paper: '#F5F1EA',
        muted: '#A39E93',
        faint: '#6B665D',
        line: 'rgba(245, 241, 234, 0.08)',
        ember: {
          200: '#FFDDA8',
          300: '#FFC56B',
          400: '#FF9A3D',
          500: '#FF6B1A',
          600: '#E5480B',
          700: '#B83508'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace']
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' }
        },
        breathe: {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.08)' }
        },
        caret: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' }
        }
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        breathe: 'breathe 7s ease-in-out infinite',
        caret: 'caret 1s step-end infinite'
      }
    }
  },
  plugins: []
};
