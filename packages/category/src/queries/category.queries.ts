import type { Category, CategoryQuery, PaginatedResult } from '@oceanfresh/shared';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { getCategoryRepository } from '../repository/index.js';
import { categoryKeys } from './category.query-keys.js';

export function useCategory(id: string | undefined) {
  return useQuery({
    queryKey: categoryKeys.detail(id as string),
    queryFn: () => getCategoryRepository().findById(id as string),
    enabled: !!id,
  });
}

export function useCategoryBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: categoryKeys.slug(slug as string),
    queryFn: () => getCategoryRepository().findBySlug(slug as string),
    enabled: !!slug,
  });
}

export function useCategories(query: CategoryQuery) {
  return useQuery({
    queryKey: categoryKeys.list(query as unknown as Record<string, unknown>),
    queryFn: () => getCategoryRepository().findAll(query),
  });
}

export function useInfiniteCategories(query: Omit<CategoryQuery, 'limit'> & { limit?: number }) {
  return useInfiniteQuery({
    queryKey: categoryKeys.list(query as unknown as Record<string, unknown>),
    queryFn: async ({ pageParam }) => {
      const result = await getCategoryRepository().findAll({
        ...query,
        limit: query.limit ?? 20,
        startAfter: pageParam as string | undefined,
      } as CategoryQuery);
      return result;
    },
    getNextPageParam: (lastPage: PaginatedResult<Category>) =>
      lastPage.hasMore ? (lastPage.lastDoc as string | undefined) : undefined,
    initialPageParam: undefined as string | undefined,
  });
}

export function useCategoryTree() {
  return useQuery({
    queryKey: categoryKeys.tree(),
    queryFn: () => getCategoryRepository().findTree(),
  });
}

export function useCategoryChildren(parentId: string | undefined) {
  return useQuery({
    queryKey: categoryKeys.children(parentId as string),
    queryFn: () => getCategoryRepository().findChildren(parentId as string),
    enabled: !!parentId,
  });
}

export function useCategoryBreadcrumb(id: string | undefined) {
  return useQuery({
    queryKey: categoryKeys.breadcrumb(id as string),
    queryFn: () => getCategoryRepository().findAncestors(id as string),
    enabled: !!id,
  });
}

export function useFeaturedCategories(limit = 10) {
  return useQuery({
    queryKey: categoryKeys.featured(),
    queryFn: () => getCategoryRepository().findFeatured(limit),
  });
}

export function useCategorySearch(term: string, query?: Partial<CategoryQuery>) {
  return useQuery({
    queryKey: categoryKeys.search(term),
    queryFn: () => getCategoryRepository().search(term, query),
    enabled: term.length >= 2,
  });
}

export function useRootCategories() {
  return useQuery({
    queryKey: categoryKeys.roots(),
    queryFn: () => getCategoryRepository().findRootCategories(),
  });
}
