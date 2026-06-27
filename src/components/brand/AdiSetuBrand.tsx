import * as React from 'react';

import { BRAND_PRIMARY, BRAND_SHADES } from '@/lib/theme';

/**
 * "Adi Setu" mark — two figures crossing a bridge under a rising sun.
 */
export function AdiSetuLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 96" className={className} role="img" aria-label="Adi Setu logo">
      {/* rising sun / rays */}
      <g stroke={BRAND_PRIMARY} strokeWidth="3.4" strokeLinecap="round">
        <path d="M60 30 V18 M60 30 M44 34 L36 26 M76 34 L84 26 M40 44 H28 M80 44 H92 M50 31 L45 21 M70 31 L75 21" />
      </g>
      <circle cx="60" cy="40" r="9" fill={BRAND_PRIMARY} />
      {/* two figures */}
      <g fill={BRAND_PRIMARY}>
        <circle cx="49" cy="40" r="4.2" />
        <path d="M49 45 l-5 13 h10 z" />
      </g>
      <g fill={BRAND_SHADES[400]}>
        <circle cx="71" cy="40" r="4.2" />
        <path d="M71 45 l-5 13 h10 z" />
      </g>
      {/* bridge arch + deck */}
      <path d="M16 84 Q60 52 104 84" fill="none" stroke={BRAND_SHADES[600]} strokeWidth="4" />
      <path d="M14 70 H106" stroke={BRAND_SHADES[600]} strokeWidth="5" strokeLinecap="round" />
      <g stroke={BRAND_SHADES[600]} strokeWidth="3">
        <path d="M26 70 V82 M42 70 V80 M60 70 V78 M78 70 V80 M94 70 V82" />
      </g>
    </svg>
  );
}

/**
 * Illustrative national-style emblem (generic, NOT the official State Emblem):
 * a grey ceremonial seal with a 24-spoke chakra. Labelled "(illustrative)".
 */
export function IllustrativeEmblem({ className }: { className?: string }) {
  const spokes = Array.from({ length: 24 }, (_, i) => (i * 360) / 24);
  return (
    <svg viewBox="0 0 80 80" className={className} role="img" aria-label="Illustrative government emblem">
      <circle cx="40" cy="40" r="38" fill="none" stroke="#6b7280" strokeWidth="2" />
      <g stroke="#6b7280" strokeWidth="1.6">
        {spokes.map((deg) => (
          <line
            key={deg}
            x1="40"
            y1="40"
            x2={40 + 22 * Math.cos((deg * Math.PI) / 180)}
            y2={40 + 22 * Math.sin((deg * Math.PI) / 180)}
          />
        ))}
      </g>
      <circle cx="40" cy="40" r="24" fill="none" stroke="#6b7280" strokeWidth="2" />
      <circle cx="40" cy="40" r="5" fill="#6b7280" />
      {/* abstract crowning forms */}
      <g fill="#6b7280">
        <path d="M28 16 q4 -8 12 -8 q8 0 12 8 q-12 -4 -24 0 z" />
      </g>
    </svg>
  );
}
