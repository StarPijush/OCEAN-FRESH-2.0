import { useMutation, useQueryClient } from '@tanstack/react-query';
import { slugify, type CreateProductInput, type UpdateProductInput, type Product } from '@oceanfresh/shared';
import { productKeys } from './product.query-keys.js';
import { getProductRepository } from '../repository/index.js';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductInput & { createdBy: string }) =>
      getProductRepository().create({ ...data, slug: slugify(data.name) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UpdateProductInput> & { updatedBy: string } }) =>
      getProductRepository().update(id, data),
    onSuccess: (product: Product) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(product.id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => getProductRepository().softDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useRestoreProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => getProductRepository().restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useDuplicateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => getProductRepository().duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useBulkUpdateProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, data }: { ids: string[]; data: Partial<UpdateProductInput> }) =>
      getProductRepository().bulkUpdate(ids, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useBulkDeleteProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => getProductRepository().bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
