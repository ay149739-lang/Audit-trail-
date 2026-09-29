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
        // Elevation ramp. Values live in CSS variables (see index.css) so the
        // same utility reads correctly in both light and dark mode.
        'elev-1': 'var(--elev-1)',
        'elev-2': 'var(--elev-2)',
        'elev-3': 'var(--elev-3)',
        'inset-top': 'inset 0 1px 0 0 rgb(255 255 255 / 0.04)',
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
      transitionTimingFunction: {
        // Decisive entrance / gentle exit. Used by the stagger primitive.
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-back': 'cubic-bezier(0.21, 1.02, 0.73, 1)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          from: { opacity: '0', transform: 'translateY(-6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.975)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-10px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(10px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        // Slow breathing halo used to mark the live/current node in the ledger rail.
        haloPulse: {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '0.08', transform: 'scale(1.9)' },
        },
        // Sweeps a soft sheen across a surface (live event stream, KPI accents).
        sheen: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(220%)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 180ms linear both',
        fadeUp: 'fadeUp 420ms cubic-bezier(0.16, 1, 0.3, 1) both',
        fadeDown: 'fadeDown 220ms cubic-bezier(0.16, 1, 0.3, 1) both',
        scaleIn: 'scaleIn 220ms cubic-bezier(0.21, 1.02, 0.73, 1) both',
        slideInLeft: 'slideInLeft 320ms cubic-bezier(0.16, 1, 0.3, 1) both',
        slideInRight: 'slideInRight 320ms cubic-bezier(0.16, 1, 0.3, 1) both',
        haloPulse: 'haloPulse 2.6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        sheen: 'sheen 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}
