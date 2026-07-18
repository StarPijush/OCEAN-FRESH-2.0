export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  slug: (slug: string) => [...categoryKeys.all, 'slug', slug] as const,
  tree: () => [...categoryKeys.all, 'tree'] as const,
  children: (parentId: string) => [...categoryKeys.all, 'children', parentId] as const,
  featured: () => [...categoryKeys.all, 'featured'] as const,
  breadcrumb: (id: string) => [...categoryKeys.all, 'breadcrumb', id] as const,
  search: (term: string) => [...categoryKeys.all, 'search', term] as const,
  roots: () => [...categoryKeys.all, 'roots'] as const,
};
