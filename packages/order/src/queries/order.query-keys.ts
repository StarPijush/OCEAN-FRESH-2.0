export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  orderNumber: (num: string) => [...orderKeys.all, 'orderNumber', num] as const,
  user: (userId: string) => [...orderKeys.all, 'user', userId] as const,
  status: (status: string) => [...orderKeys.all, 'status', status] as const,
  recent: () => [...orderKeys.all, 'recent'] as const,
};
