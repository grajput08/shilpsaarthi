import type { CraftCategory } from '@/lib/domain';
import { craftImageFallback } from '@/lib/dashboard-images';

const DEMO_PRODUCTS: Partial<Record<CraftCategory, { name: string; description: string }>> = {
  textile: {
    name: 'Handwoven cotton stole',
    description: 'Traditional loom-woven cotton with tribal motifs, natural dyes.',
  },
  painting: {
    name: 'Warli wall art panel',
    description: 'Natural pigment painting on canvas depicting village life.',
  },
  jewellery: {
    name: 'Silver tribal necklace',
    description: 'Handcrafted necklace with traditional beadwork.',
  },
  metal_craft: {
    name: 'Brass tribal figurine',
    description: 'Hand-cast decorative brass piece with etched patterns.',
  },
  cane_bamboo: {
    name: 'Bamboo fruit basket',
    description: 'Handwoven bamboo basket for daily household use.',
  },
  pottery: {
    name: 'Terracotta diya set',
    description: 'Hand-thrown clay diyas finished with natural slip.',
  },
  wood_craft: {
    name: 'Carved wooden bowl',
    description: 'Locally sourced wood carved and polished by hand.',
  },
  natural_products: {
    name: 'Herbal soap bundle',
    description: 'Forest-gathered herbs blended into handmade soaps.',
  },
  tribal_food: {
    name: 'Millet flour pack',
    description: 'Stone-ground tribal millet flour, unprocessed and organic.',
  },
  other: {
    name: 'Handcrafted sample product',
    description: 'A representative sample of tribal artisan work.',
  },
};

export function demoProductForCraft(craft: CraftCategory | '') {
  if (craft && DEMO_PRODUCTS[craft]) {
    return DEMO_PRODUCTS[craft]!;
  }
  return {
    name: 'Handcrafted sample product',
    description: 'A representative sample of tribal artisan work for demo registration.',
  };
}

export function demoProductImagePath(craft: CraftCategory | '') {
  return craftImageFallback(craft || null, 'registration-demo');
}

export async function loadDemoProductImage(craft: CraftCategory | ''): Promise<string> {
  const path = demoProductImagePath(craft);
  const res = await fetch(path);
  if (!res.ok) throw new Error('Could not load demo image');
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
