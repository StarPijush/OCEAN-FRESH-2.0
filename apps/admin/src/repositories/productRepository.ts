import { rtdbGet, rtdbList, rtdbPush, rtdbRemove, rtdbUpdate } from './rtdb';
import type { ProductData, ProductInput } from './types';

export const productRepository = {
  async getAll(): Promise<ProductData[]> {
    return rtdbList<ProductData>('products');
  },

  async getById(id: string): Promise<ProductData | null> {
    return rtdbGet<ProductData>(`products/${id}`);
  },

  async create(data: ProductInput): Promise<string> {
    return rtdbPush('products', data);
  },

  async update(id: string, data: Partial<ProductInput>): Promise<void> {
    await rtdbUpdate(`products/${id}`, data as Record<string, unknown>);
  },

  async remove(id: string): Promise<void> {
    await rtdbRemove(`products/${id}`);
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
