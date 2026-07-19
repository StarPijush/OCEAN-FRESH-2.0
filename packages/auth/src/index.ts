export {
  AuthStatus,
  LoginForm,
  PasswordStrength,
  Protected,
  RegisterForm,
  SessionExpiredDialog,
  UserAvatar,
} from './components/index.js';
export type { EventBus, InMemoryEventBus } from './events/index.js';
export { AuthGuard, FeatureGate, PermissionGate, RoleGate } from './guards/index.js';
export type { AuthFormOptions } from './hooks/index.js';
export { useAuthForm, useLoginAction, useLogoutAction, useRegisterAction } from './hooks/index.js';
export type { PermissionResolver } from './permissions/index.js';
export type { SupabaseAuthProvider } from './providers/index.js';
export type { IAuthProvider } from './providers/index.js';
export {
  authKeys,
  useAuthState,
  useCurrentUser,
  useDeleteAccount,
  useIsAuthenticated,
  useLogin,
  useLogout,
  usePermissions,
  useRefreshSession,
  useRegister,
  useRequirePermission,
  useResetPassword,
  useRole,
  useSession,
  useVerifyEmail,
} from './queries/index.js';
export type { IAuthRepository } from './repository/index.js';
export type {
  AuthorizationService,
  AuthService,
  ICloudFunctionsRepository,
  TokenService,
} from './service/index.js';
export type {
  AuthStateMachine,
  DeviceManager,
  InMemorySessionStore,
  SessionManager,
} from './session/index.js';
