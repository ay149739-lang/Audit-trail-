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
        premiumDark: {
          bg: '#141414',
          card: '#1F1F1F',
          panel: '#262626',
          border: '#333333',
          borderSubtle: '#2A2A2A',
          gold: '#E5A93C',
          goldHover: '#D49A2A',
          teal: '#3A8B88',
          textMain: '#F5F5F0',
          textMuted: '#9E9E98',
          textLight: '#70706A',
          success: '#3F8F6B',
          warning: '#E5A93C',
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
