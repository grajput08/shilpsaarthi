import * as React from 'react';

import { BRAND_PRIMARY } from '@/lib/theme';

/** Default ShilpSaarthi / Adi Setu mark — connected nodes forming a bridge. */
export function AdiSetuLogo({ className }: { className?: string }) {
  const stroke = className?.includes('text-') ? 'currentColor' : BRAND_PRIMARY;

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} role="img" aria-label="ShilpSaarthi logo">
      <path
        d="M12 6C13.1046 6 14 5.10457 14 4C14 2.89543 13.1046 2 12 2C10.8954 2 10 2.89543 10 4C10 5.10457 10.8954 6 12 6Z"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 12C7.10457 12 8 11.1046 8 10C8 8.89543 7.10457 8 6 8C4.89543 8 4 8.89543 4 10C4 11.1046 4.89543 12 6 12Z"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 12C19.1046 12 20 11.1046 20 10C20 8.89543 19.1046 8 18 8C16.8954 8 16 8.89543 16 10C16 11.1046 16.8954 12 18 12Z"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 22C13.1046 22 14 21.1046 14 20C14 18.8954 13.1046 18 12 18C10.8954 18 10 18.8954 10 20C10 21.1046 10.8954 22 12 22Z"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 6V18" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 12L12 15L18 12" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 15V18" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10L12 6L18 10" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
