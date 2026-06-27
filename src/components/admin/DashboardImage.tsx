'use client';

import { useState } from 'react';

export default function DashboardImage({
  src,
  fallback,
  alt,
  className,
}: {
  src?: string | null;
  fallback: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const resolved = !src || failed ? fallback : src;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt}
      className={className}
      onError={() => {
        if (!failed) setFailed(true);
      }}
    />
  );
}
