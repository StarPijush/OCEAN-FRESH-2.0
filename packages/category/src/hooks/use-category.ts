import type { CategoryQuery } from '@oceanfresh/shared';

import {
  useCategory,
  useCategoryBySlug,
  useCategoryChildren,
  useCategorySearch,
  useCategoryTree,
  useRootCategories,
} from '../queries/index.js';

export function useGetCategory(id: string | undefined) {
  return useCategory(id);
}

export function useGetCategoryBySlug(slug: string | undefined) {
  return useCategoryBySlug(slug);
}

export function useSearchCategories(term: string, query?: Partial<CategoryQuery>) {
  return useCategorySearch(term, query);
}

export function useGetCategoryTree() {
  return useCategoryTree();
}

export function useGetCategoryChildren(parentId: string | undefined) {
  return useCategoryChildren(parentId);
}

export function useGetRootCategories() {
  return useRootCategories();
}

export type { CategoryQuery } from '@oceanfresh/shared';
