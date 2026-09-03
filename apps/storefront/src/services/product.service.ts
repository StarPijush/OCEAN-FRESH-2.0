import { getProductRepository } from '@oceanfresh/product/repository';
import { type Product, ProductStatus, ProductUnit } from '@oceanfresh/shared';

export interface ProductVM {
  id: string;
  name: string;
  sub: string;
  emoji: string;
  /** Canonical price per 1 KG (₹ per 1000g). DB column price. */
  pricePerKg: number;
  /** Alias for pricePerKg kept for back-compat */
  price: number;
  category: string;
  tag: string;
  available: boolean;
  image: string | null;
  /** Dormant: customer mode now controls GRAM|KG, not product unit */
  unit: ProductUnit;
  status: ProductStatus;
}

const PRODUCT_EMOJI_MAP: Record<string, string> = {
  Rohu: '\u{1F41F}',
  Katla: '\u{1F420}',
  'Tiger Prawns': '\u{1F990}',
  Prawns: '\u{1F990}',
  Pomfret: '\u{1F421}',
  Surmai: '\u{1F41F}',
  'King Fish': '\u{1F41F}',
  Bombil: '\u{1F41F}',
  'Bombay Duck': '\u{1F41F}',
  Crab: '\u{1F980}',
  'Mud Crab': '\u{1F980}',
  'Live Blue Crab': '\u{1F980}',
  'Mangrove Crab': '\u{1F980}',
  Bangda: '\u{1F41F}',
  'Indian Mackerel': '\u{1F41F}',
  Rawas: '\u{1F41F}',
  'Indian Salmon': '\u{1F41F}',
  Hilsa: '\u{1F420}',
  'River Shad': '\u{1F420}',
};

function getEmoji(name: string): string {
  return PRODUCT_EMOJI_MAP[name] ?? '\u{1F41F}';
}

function toViewModel(row: Product): ProductVM {
  const unit = ProductUnit.KG;
  const pricePerKg = Number(row.price);
  return {
    id: row.id,
    name: row.name,
    sub: row.description ?? '',
    emoji: getEmoji(row.name),
    pricePerKg,
    price: pricePerKg,
    category: row.categoryId ?? '',
    tag: row.status ?? 'Fresh',
    available: row.status === ProductStatus.ACTIVE,
    image: row.thumbnail ?? null,
    unit,
    status: row.status as ProductStatus,
  };
}

let cached: ProductVM[] | null = null;

async function loadCache(): Promise<ProductVM[]> {
  if (cached) return cached;
  const repo = getProductRepository();
  const result = await repo.findAll({ status: ProductStatus.ACTIVE, limit: 100 });
  cached = result.items.map(toViewModel);
  return cached;
}

export const productService = {
  async getAll(): Promise<ProductVM[]> {
    return loadCache();
  },

  async getFeatured(limit = 6): Promise<ProductVM[]> {
    const all = await loadCache();
    return all.filter((p) => p.available).slice(0, limit);
  },

  async search(query: string): Promise<ProductVM[]> {
    const all = await loadCache();
    const q = query.toLowerCase();
    return all.filter((p) => p.name.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q));
  },

  async getById(id: string): Promise<ProductVM | null> {
    const repo = getProductRepository();
    const row = await repo.findById(id);
    return row ? toViewModel(row) : null;
  },

  async getByCategory(category: string): Promise<ProductVM[]> {
    const all = await loadCache();
    return all.filter((p) => p.category === category && p.available);
  },
};
