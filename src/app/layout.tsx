import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ShilpSaarthi — Tribal Artisan CRM',
  description:
    'Identify, onboard, verify and manage tribal artisans — public registration, field verifier PWA, and admin CRM dashboard.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/icons/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icons/icon.svg', type: 'image/svg+xml' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#13448f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
