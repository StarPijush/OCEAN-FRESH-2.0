import type { ProductQuery } from '@oceanfresh/shared';

import { useProduct, useProductBySlug, useProductSearch } from '../queries/index.js';

export function useGetProduct(id: string | undefined) {
  return useProduct(id);
}

export function useGetProductBySlug(slug: string | undefined) {
  return useProductBySlug(slug);
}

export function useSearchProducts(term: string, query?: Partial<ProductQuery>) {
  return useProductSearch(term, query);
}

export type { ProductQuery } from '@oceanfresh/shared';
