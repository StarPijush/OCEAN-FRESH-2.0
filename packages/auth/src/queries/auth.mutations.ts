import type { LoginInput } from '@oceanfresh/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { SupabaseAuthProvider } from '../providers/index.js';
import { getAuthService } from '../service/index.js';
import { authKeys } from './auth.query-keys.js';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => getAuthService().login(input),
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
    }) => getAuthService().register(email, password, displayName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => getAuthService().logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (email: string) => getAuthService().resetPassword(email),
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (newPassword: string) => getAuthService().updatePassword(newPassword),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: () => getAuthService().verifyEmail(),
  });
}

export function useRefreshSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const provider = new SupabaseAuthProvider();
      await provider.refreshToken();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}
