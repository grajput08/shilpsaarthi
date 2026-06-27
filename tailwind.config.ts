import type { Config } from 'tailwindcss';
import { BRAND_SHADES, INDIA_GREEN_SHADES, SAFFRON_SHADES } from './src/lib/theme';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { ...BRAND_SHADES },
        india: { ...INDIA_GREEN_SHADES },
        saffron: { ...SAFFRON_SHADES },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Soft, transparent, layered — reads on any surface, never heavy.
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -12px rgba(15, 23, 42, 0.10)',
        pop: '0 4px 12px -2px rgba(15, 23, 42, 0.10), 0 12px 32px -8px rgba(15, 23, 42, 0.14)',
      },
    },
  },
  plugins: [],
};

export default config;
