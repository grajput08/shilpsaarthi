import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ShilpSaarthi — Tribal Artisan CRM',
    short_name: 'ShilpSaarthi',
    description: 'Field verifier PWA and admin CRM for the tribal artisan programme.',
    start_url: '/field',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#a85b18',
    orientation: 'portrait',
    icons: [
      { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}
