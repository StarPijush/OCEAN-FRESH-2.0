import { useQuery } from '@tanstack/react-query';
import { type Permission, AuthenticationState } from '@oceanfresh/shared';
import { authKeys } from './auth.query-keys.js';
import { getAuthRepository } from '../repository/index.js';
import { SupabaseAuthProvider } from '../providers/index.js';

const authProvider = new SupabaseAuthProvider();

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => authProvider.getCurrentUser(),
  });
}

export function useAuthState() {
  return useQuery({
    queryKey: authKeys.state(),
    queryFn: async () => {
      const user = await authProvider.getCurrentUser();
      if (!user) return AuthenticationState.UNAUTHENTICATED;
      if (!user.emailVerified) return AuthenticationState.EMAIL_UNVERIFIED;
      return AuthenticationState.AUTHENTICATED;
    },
  });
}

export function useSession() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: () => getAuthRepository().findSessionsByUserId('current'),
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: authKeys.permissions(),
    queryFn: async () => {
      const user = await authProvider.getCurrentUser();
      if (!user) return [];
      const claims = await authProvider.getCustomClaims();
      return (claims.permissions as string[]) ?? [];
    },
  });
}

export function useRole() {
  return useQuery({
    queryKey: authKeys.role(),
    queryFn: async () => {
      const claims = await authProvider.getCustomClaims();
      return (claims.role as string) ?? null;
    },
  });
}

export function useIsAuthenticated() {
  return useQuery({
    queryKey: authKeys.state(),
    queryFn: async () => {
      const user = await authProvider.getCurrentUser();
      return user !== null;
    },
  });
}

export function useRequirePermission(permissions: Permission[], requireAll = true) {
  return useQuery({
    queryKey: authKeys.permissions(),
    queryFn: async () => {
      const userPerms = await authProvider.getCustomClaims();
      const userPermissionSet = new Set((userPerms.permissions as string[]) ?? []);
      if (requireAll) {
        return permissions.every((p) => userPermissionSet.has(p));
      }
      return permissions.some((p) => userPermissionSet.has(p));
    },
  });
}
