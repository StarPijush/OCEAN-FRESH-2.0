import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./apps/**/src/**/*.{ts,tsx}', './packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        ink: '#0d0d0d',
        cream: '#f5f0e8',
        sand: '#e8e0d0',
        deep: '#0a1628',
        marine: '#1a3a5c',
        aqua: '#4ab8c1',
        muted: '#8a8070',
        warn: '#c8513a',
        // Spark reference light system (OceanFresh mapped)
        canvas: '#F4F6F5',
        surface: '#FFFFFF',
        forestDark: '#071526',
        forestMedium: '#0d2035',
        textMain: '#0B130F',
        textMuted: '#6C7E75',
        borderLight: '#E9EFEF',
      },
      borderRadius: {
        button: '0.875rem',
        card: '1.125rem',
        'card-lg': '1.5rem',
        'card-xl': '1.125rem',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
