import { container } from '@oceanfresh/shared';
import type { IProductRepository } from './product.repository.js';
import { SupabaseProductRepository } from './supabase-product.repository.js';

export const PRODUCT_REPOSITORY_TOKEN = 'IProductRepository';

export function registerProductRepository(): void {
  container.register<IProductRepository>(
    PRODUCT_REPOSITORY_TOKEN,
    () => new SupabaseProductRepository(),
    true,
  );
}

export function getProductRepository(): IProductRepository {
  return container.resolve<IProductRepository>(PRODUCT_REPOSITORY_TOKEN);
}
