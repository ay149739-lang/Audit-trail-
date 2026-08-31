/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { 
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6', // Teal accent
          600: '#0d9488',
          700: '#0f766e',
        },
        alert: {
          500: '#f59e0b', // Amber alert
          600: '#d97706',
        },
        darkBg: '#0b0f19',
        darkCard: '#111827',
        darkBorder: '#1f2937',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        pulseSubtle: 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
