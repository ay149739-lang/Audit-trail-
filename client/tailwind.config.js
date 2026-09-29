/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        xs: '0 1px 2px 0 rgb(15 23 42 / 0.05)',
      },
      colors: {
        industrial: {
          bg: '#F7F7F4',
          card: '#FFFFFF',
          panel: '#F0EFEA',
          border: '#E2E0D8',
          borderSubtle: '#ECEAE3',
          textMain: '#18181B',
          textMuted: '#52525B',
          textLight: '#71717A',
          accent: '#C2410C',
          accentHover: '#9A3412',
          accentSecondary: '#B45309',
          success: '#047857',
          warning: '#B45309',
          danger: '#B91C1C',
          teal: '#0F766E',
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
