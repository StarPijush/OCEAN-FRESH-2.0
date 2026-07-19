import { supabaseService } from '@oceanfresh/supabase';

import type { ProductData, ProductInput } from './types';

const TABLE = 'products';

export const productRepository = {
  async getAll(): Promise<ProductData[]> {
    const rows = await supabaseService.query<Record<string, unknown>>(TABLE, []);
    return rows.map((r) => ({
      id: r.id as string,
      name: r.name as string,
      sub: (r.description as string) || undefined,
      price: Number(r.price),
      category: (r.category_id as string) || undefined,
      available: (r.stock as number) > 0,
      featured: (r.featured as boolean) || undefined,
      image: (r.thumbnail as string) || undefined,
      emoji: undefined,
      updated_at: r.updated_at ? new Date(r.updated_at as string).getTime() : undefined,
    }));
  },

  async getById(id: string): Promise<ProductData | null> {
    const row = await supabaseService.get<Record<string, unknown>>(TABLE, id);
    if (!row) return null;
    return {
      id: row.id as string,
      name: row.name as string,
      sub: (row.description as string) || undefined,
      price: Number(row.price),
      category: (row.category_id as string) || undefined,
      available: (row.stock as number) > 0,
      featured: (row.featured as boolean) || undefined,
      image: (row.thumbnail as string) || undefined,
    };
  },

  async create(data: ProductInput): Promise<string> {
    const now = new Date().toISOString();
    const snakeData = {
      name: data.name,
      description: data.sub ?? '',
      price: data.price,
      category_id: data.category ?? null,
      stock: data.available ? 999 : 0,
      featured: data.featured ?? false,
      thumbnail: data.image ?? '',
      status: 'active',
      slug: data.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      is_deleted: false,
      created_by: 'admin',
      created_at: now,
      updated_at: now,
    };
    const result = await supabaseService.add<Record<string, unknown>>(TABLE, snakeData);
    return result.id as string;
  },

  async update(id: string, data: Partial<ProductInput>): Promise<void> {
    const snakeData: Record<string, unknown> = {};
    if (data.name !== undefined) snakeData.name = data.name;
    if (data.sub !== undefined) snakeData.description = data.sub;
    if (data.price !== undefined) snakeData.price = data.price;
    if (data.category !== undefined) snakeData.category_id = data.category;
    if (data.available !== undefined) snakeData.stock = data.available ? 999 : 0;
    if (data.featured !== undefined) snakeData.featured = data.featured;
    if (data.image !== undefined) snakeData.thumbnail = data.image;
    await supabaseService.update(TABLE, id, snakeData);
  },

  async remove(id: string): Promise<void> {
    await supabaseService.update(TABLE, id, {
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    });
  },

  async toggleAvailable(id: string): Promise<void> {
    const p = await productRepository.getById(id);
    if (p) {
      await productRepository.update(id, { available: !p.available });
    }
  },

  async toggleFeatured(id: string): Promise<void> {
    const p = await productRepository.getById(id);
    if (p) {
      await productRepository.update(id, { featured: !p.featured });
    }
  },
};
