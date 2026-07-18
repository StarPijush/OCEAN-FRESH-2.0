import { useCurrentUser, useAuthState, useSession, usePermissions, useRole, useIsAuthenticated, useLogin, useRegister, useLogout } from '../queries/index.js';

export { useCurrentUser, useAuthState, useSession, usePermissions, useRole, useIsAuthenticated };

export function useLoginAction() {
  return useLogin();
}

export function useRegisterAction() {
  return useRegister();
}

export function useLogoutAction() {
  return useLogout();
}
