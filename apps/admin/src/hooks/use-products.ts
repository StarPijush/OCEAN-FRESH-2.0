import { getCategoryRepository } from '@oceanfresh/category/repository';
import { getProductRepository } from '@oceanfresh/product/repository';
import type {
  Category,
  CreateProductInput,
  PaginatedResult,
  Product,
  ProductQuery,
  ProductStatus,
  UpdateProductInput,
} from '@oceanfresh/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const PRODUCTS_KEY = ['products'] as const;
export const CATEGORIES_KEY = ['categories'] as const;

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: (): Promise<Category[]> => getCategoryRepository().findAll(),
  });
}

export interface UseProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  categoryId?: string;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { page = 1, limit = 50, search = '', status, categoryId } = options;
  const query = useQuery({
    queryKey: [...PRODUCTS_KEY, { page, limit, search, status, categoryId }],
    queryFn: async (): Promise<PaginatedResult<Product>> => {
      const query: ProductQuery = { page, limit };
      if (status && status !== 'ALL') query.status = status as ProductStatus;
      if (categoryId && categoryId !== 'all') query.categoryId = categoryId;
      // Behavior reused from storefront ProductSearch: client-side case-insensitive filter on name/sub
      const result = await getProductRepository().findAll(query);
      const q = search.trim().toLowerCase();
      if (!q) return result;
      const filtered = result.items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q) ||
          String(p.price).toLowerCase().includes(q),
      );
      return { ...result, items: filtered, total: filtered.length, hasMore: false };
    },
  });
  return query;
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getProductRepository().softDelete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}

export function useToggleFeatured() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: Product) =>
      getProductRepository().update(product.id, {
        featured: !product.featured,
        updatedBy: 'admin',
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}

export function useSetProductStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; status: ProductStatus; updatedBy: string }) =>
      getProductRepository().update(input.id, { status: input.status, updatedBy: input.updatedBy }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateProductInput & { createdBy: string }) =>
      getProductRepository().create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      data: Partial<UpdateProductInput> & { updatedBy: string };
    }) => getProductRepository().update(input.id, input.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}
