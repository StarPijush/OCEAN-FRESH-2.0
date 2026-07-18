export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  slug: (slug: string) => [...productKeys.all, 'slug', slug] as const,
  featured: () => [...productKeys.all, 'featured'] as const,
  category: (categoryId: string) => [...productKeys.all, 'category', categoryId] as const,
  search: (term: string) => [...productKeys.all, 'search', term] as const,
  lowStock: () => [...productKeys.all, 'lowStock'] as const,
  inventory: () => [...productKeys.all, 'inventory'] as const,
};
