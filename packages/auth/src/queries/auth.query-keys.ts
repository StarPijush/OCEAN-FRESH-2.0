export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  permissions: () => [...authKeys.all, 'permissions'] as const,
  role: () => [...authKeys.all, 'role'] as const,
  state: () => [...authKeys.all, 'state'] as const,
  feature: (feature: string) => [...authKeys.all, 'feature', feature] as const,
};
