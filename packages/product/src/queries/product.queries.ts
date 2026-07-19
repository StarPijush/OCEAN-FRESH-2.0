import type { PaginatedResult, Product, ProductQuery } from '@oceanfresh/shared';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { getProductRepository } from '../repository/index.js';
import { productKeys } from './product.query-keys.js';

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: productKeys.detail(id ?? ''),
    queryFn: () => getProductRepository().findById(id ?? ''),
    enabled: !!id,
  });
}

export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: productKeys.slug(slug ?? ''),
    queryFn: () => getProductRepository().findBySlug(slug ?? ''),
    enabled: !!slug,
  });
}

export function useProducts(query: ProductQuery) {
  return useQuery({
    queryKey: productKeys.list(query as unknown as Record<string, unknown>),
    queryFn: () => getProductRepository().findAll(query),
  });
}

export function useInfiniteProducts(query: Omit<ProductQuery, 'limit'> & { limit?: number }) {
  return useInfiniteQuery({
    queryKey: productKeys.list(query as unknown as Record<string, unknown>),
    queryFn: async ({ pageParam }) => {
      const result = await getProductRepository().findAll({
        ...query,
        limit: query.limit ?? 20,
        startAfter: pageParam as string | undefined,
      } as ProductQuery);
      return result;
    },
    getNextPageParam: (lastPage: PaginatedResult<Product>) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,
    initialPageParam: undefined as string | undefined,
  });
}

export function useFeaturedProducts(limit = 10) {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: () => getProductRepository().findFeatured(limit),
  });
}

export function useCategoryProducts(categoryId: string, query?: Partial<ProductQuery>) {
  return useQuery({
    queryKey: productKeys.category(categoryId),
    queryFn: () => getProductRepository().findByCategory(categoryId, query),
  });
}

export function useProductSearch(term: string, query?: Partial<ProductQuery>) {
  return useQuery({
    queryKey: productKeys.search(term),
    queryFn: () => getProductRepository().search(term, query),
    enabled: term.length >= 2,
  });
}

export function useLowStockProducts(threshold = 10) {
  return useQuery({
    queryKey: productKeys.lowStock(),
    queryFn: () => getProductRepository().getLowStock(threshold),
  });
}
