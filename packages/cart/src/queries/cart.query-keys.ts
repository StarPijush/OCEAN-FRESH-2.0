export const cartKeys = {
  all: ['carts'] as const,
  lists: () => [...cartKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...cartKeys.lists(), filters] as const,
  details: () => [...cartKeys.all, 'detail'] as const,
  detail: (id: string) => [...cartKeys.details(), id] as const,
  user: (userId: string) => [...cartKeys.all, 'user', userId] as const,
  session: (sessionId: string) => [...cartKeys.all, 'session', sessionId] as const,
  checkout: (cartId: string) => [...cartKeys.all, 'checkout', cartId] as const,
  summary: (cartId: string) => [...cartKeys.all, 'summary', cartId] as const,
};
