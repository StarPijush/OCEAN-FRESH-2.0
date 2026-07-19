import type { LoginInput } from '@oceanfresh/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { InMemoryEventBus } from '../events/index.js';
import { PermissionResolver } from '../permissions/index.js';
import { SupabaseAuthProvider } from '../providers/index.js';
import { AuthService } from '../service/index.js';
import { DeviceManager, InMemorySessionStore, SessionManager } from '../session/index.js';
import { authKeys } from './auth.query-keys.js';

function createAuthService(): AuthService {
  const provider = new SupabaseAuthProvider();
  const eventBus = new InMemoryEventBus();
  const store = new InMemorySessionStore();
  const deviceManager = new DeviceManager();
  const sessionManager = new SessionManager(store, eventBus, deviceManager);
  const resolver = new PermissionResolver();
  return new AuthService(provider, sessionManager, eventBus, resolver);
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => createAuthService().login(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      email,
      password,
      displayName,
    }: {
      email: string;
      password: string;
      displayName: string;
    }) => createAuthService().register(email, password, displayName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createAuthService().logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (email: string) => createAuthService().resetPassword(email),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: () => createAuthService().verifyEmail(),
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createAuthService().deleteAccount(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useRefreshSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createAuthService().login({ email: '', password: '' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}
