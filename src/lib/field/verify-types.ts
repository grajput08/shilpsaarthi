import type { CraftCategory } from '@/lib/domain';

/** Common sub-categories keyed by primary craft. */
export const CRAFT_SUBCATEGORIES: Partial<Record<CraftCategory, string[]>> = {
  painting: ['Gond painting', 'Warli painting', 'Pithora', 'Madhubani', 'Other'],
  textile: ['Handloom weaving', 'Block print', 'Embroidery', 'Other'],
  metal_craft: ['Bell metal', 'Dhokra', 'Silver filigree', 'Other'],
  cane_bamboo: ['Basketry', 'Furniture', 'Other'],
  pottery: ['Terracotta', 'Black pottery', 'Other'],
  wood_craft: ['Carving', 'Lacquerware', 'Other'],
  jewellery: ['Beadwork', 'Silver', 'Other'],
  natural_products: ['Honey', 'Herbal', 'Other'],
  tribal_food: ['Preserved foods', 'Spices', 'Other'],
  other: ['Other'],
};

export const LEARNED_FROM_OPTIONS = ['Family tradition', 'Govt training', 'NGO', 'Self-taught', 'Other'] as const;

/** Primary craft chips shown on the craft step (subset for quick tap). */
export const CRAFT_CHIP_CATEGORIES: CraftCategory[] = [
  'textile',
  'painting',
  'metal_craft',
  'cane_bamboo',
  'pottery',
  'wood_craft',
  'jewellery',
  'other',
];

export interface CraftProfileState {
  sub_category: string;
  experience_years: string;
  monthly_capacity: string;
  learned_from: string;
  group_name: string;
  craft_demonstrated: boolean;
  craft_matches: boolean;
}

export interface ProductDraft {
  id: string;
  dbId?: string;
  name: string;
  category: CraftCategory | '';
  description: string;
  materials: string;
  dimensions: string;
  price_min: string;
  price_max: string;
  monthly_capacity: string;
  buyers: string;
  packaging_available: boolean | null;
  can_ship: boolean;
  photo_paths: string[];
}

export function parseOptionalInt(value: string): number | null {
  const digits = value.replace(/\D/g, '');
  if (!digits) return null;
  const n = parseInt(digits, 10);
  return Number.isNaN(n) ? null : n;
}

export function emptyCraftProfile(): CraftProfileState {
  return {
    sub_category: '',
    experience_years: '',
    monthly_capacity: '',
    learned_from: '',
    group_name: '',
    craft_demonstrated: false,
    craft_matches: false,
  };
}

export function emptyProduct(): ProductDraft {
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now()}`,
    name: '',
    category: '',
    description: '',
    materials: '',
    dimensions: '',
    price_min: '',
    price_max: '',
    monthly_capacity: '',
    buyers: '',
    packaging_available: null,
    can_ship: false,
    photo_paths: [],
  };
}

export function productDraftToPayload(p: ProductDraft) {
  return {
    id: p.dbId,
    name: p.name.trim(),
    category: p.category || null,
    description: p.description.trim() || null,
    materials: p.materials.trim() || null,
    dimensions: p.dimensions.trim() || null,
    price_min: p.price_min ? parseFloat(p.price_min) : null,
    price_max: p.price_max ? parseFloat(p.price_max) : null,
    monthly_capacity: parseOptionalInt(p.monthly_capacity),
    buyers: p.buyers
      .split(/[,·]/)
      .map((s) => s.trim())
      .filter(Boolean),
    packaging_available: p.packaging_available,
    can_ship: p.can_ship,
    photo_paths: p.photo_paths,
  };
}

export function craftProfileToPayload(c: CraftProfileState) {
  return {
    sub_category: c.sub_category.trim() || null,
    experience_years: parseOptionalInt(c.experience_years),
    learned_from: c.learned_from || null,
    works_in_group: c.group_name.trim().length > 0 ? true : null,
    group_name: c.group_name.trim() || null,
    monthly_capacity: parseOptionalInt(c.monthly_capacity),
  };
}
