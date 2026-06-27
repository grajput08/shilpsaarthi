import type { CraftCategory } from '@/lib/domain';

/** Public assets under /public/images — used when storage URLs are missing or fail. */
export const DASHBOARD_STATIC_IMAGES = {
  artisan: ['/images/artisan-1.jpg', '/images/artisan-2.jpg'] as const,
  craft: {
    textile: '/images/craft-weaving.jpg',
    painting: '/images/craft-painting.jpg',
    metal_craft: '/images/craft-metal.jpg',
    cane_bamboo: '/images/craft-bamboo.jpg',
    pottery: '/images/craft-pottery.jpg',
  } as Partial<Record<CraftCategory, string>>,
  defaultCraft: '/images/hero.jpg',
  empty: '/images/empty-state.png',
} as const;

function hashIndex(seed: string, mod: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return mod ? h % mod : 0;
}

export function artisanAvatarFallback(artisanId: string) {
  return DASHBOARD_STATIC_IMAGES.artisan[hashIndex(artisanId, DASHBOARD_STATIC_IMAGES.artisan.length)];
}

export function craftImageFallback(craft: string | null | undefined, seed = 'default') {
  const mapped = craft ? DASHBOARD_STATIC_IMAGES.craft[craft as CraftCategory] : undefined;
  if (mapped) return mapped;
  const pool = Object.values(DASHBOARD_STATIC_IMAGES.craft);
  return pool[hashIndex(seed, pool.length)] ?? DASHBOARD_STATIC_IMAGES.defaultCraft;
}

export function productImageFallback(craft: string | null | undefined, productId: string) {
  return craftImageFallback(craft, productId);
}

export function visitPhotoFallback(craft: string | null | undefined, visitId: string) {
  return craftImageFallback(craft, visitId);
}
