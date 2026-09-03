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
        stitch: {
          bg: '#051424',
          surface: '#051424',
          lowest: '#010f1f',
          low: '#0d1c2d',
          base: '#122131',
          high: '#1c2b3c',
          highest: '#273647',
          primary: '#4d8eff',
          primaryHover: '#3b82f6',
          onPrimary: '#00285d',
          secondary: '#bcc7de',
          onSurface: '#d4e4fa',
          muted: '#8c909f',
          border: '#1c2b3c',
          borderVar: '#273647',
          success: '#10b981',
          error: '#ef4444',
          warning: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Hanken Grotesk', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}
