import { useMutation, useQueryClient } from '@tanstack/react-query';
import { slugify, type CreateCategoryInput, type UpdateCategoryInput, type Category } from '@oceanfresh/shared';
import { categoryKeys } from './category.query-keys.js';
import { getCategoryRepository } from '../repository/index.js';

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryInput & { createdBy: string }) =>
      getCategoryRepository().create({ ...data, slug: slugify(data.name), path: '', level: 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UpdateCategoryInput> & { updatedBy: string } }) =>
      getCategoryRepository().update(id, data),
    onSuccess: (category: Category) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(category.id) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => getCategoryRepository().softDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useRestoreCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => getCategoryRepository().restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useArchiveCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => getCategoryRepository().archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useMoveCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newParentId }: { id: string; newParentId: string | null }) =>
      getCategoryRepository().move(id, { parentId: newParentId, path: '', level: 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useBulkArchiveCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => getCategoryRepository().bulkArchive(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}
