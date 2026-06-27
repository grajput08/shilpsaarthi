import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Saffron (primary) — Government of India tricolour saffron #FF671F
        brand: {
          50: '#fff4ec',
          100: '#ffe3d2',
          200: '#ffc2a3',
          300: '#ff9d6b',
          400: '#ff8347',
          500: '#ff7a33',
          600: '#ff671f',
          700: '#e2540f',
          800: '#bb4310',
          900: '#963814',
        },
        // India green #0F7A06
        india: {
          50: '#e9f7e8',
          100: '#caebc6',
          200: '#9bd994',
          300: '#63c258',
          400: '#2fa324',
          500: '#138a09',
          600: '#0f7a06',
          700: '#0c6305',
          800: '#0c4f08',
          900: '#0a410a',
        },
        saffron: '#FF671F',
        indiagreen: '#0F7A06',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
