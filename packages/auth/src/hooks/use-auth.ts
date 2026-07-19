import {
  useAuthState,
  useCurrentUser,
  useIsAuthenticated,
  useLogin,
  useLogout,
  usePermissions,
  useRegister,
  useRole,
  useSession,
} from '../queries/index.js';

export { useAuthState, useCurrentUser, useIsAuthenticated, usePermissions, useRole, useSession };

export function useLoginAction() {
  return useLogin();
}

export function useRegisterAction() {
  return useRegister();
}

export function useLogoutAction() {
  return useLogout();
}
