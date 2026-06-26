import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf6ed',
          100: '#f9e7cc',
          200: '#f1cd97',
          300: '#e8ad5d',
          400: '#e09236',
          500: '#c9761f',
          600: '#a85b18',
          700: '#874518',
          800: '#6f3818',
          900: '#5d3017',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
