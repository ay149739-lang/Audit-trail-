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
        industrial: {
          bg: '#F4F3EF',
          card: '#FFFFFF',
          panel: '#FAF9F5',
          border: '#DDDCD6',
          borderSubtle: '#EAE9E4',
          textMain: '#252525',
          textMuted: '#6B6B66',
          textLight: '#9E9E98',
          accent: '#E56B2F',
          accentHover: '#D45A1E',
          accentSecondary: '#D9A441',
          success: '#3F8F6B',
          warning: '#D9A441',
          danger: '#C94A4A',
        },
      },
      fontFamily: {
        sans: ['Hanken Grotesk', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
