export {
  AuthGuard,
  RoleGate,
  PermissionGate,
  FeatureGate,
} from './guards/index.js';

export {
  authKeys,
  useCurrentUser,
  useAuthState,
  useSession,
  usePermissions,
  useRole,
  useIsAuthenticated,
  useRequirePermission,
  useLogin,
  useRegister,
  useLogout,
  useResetPassword,
  useVerifyEmail,
  useDeleteAccount,
  useRefreshSession,
} from './queries/index.js';

export {
  useLoginAction,
  useRegisterAction,
  useLogoutAction,
  useAuthForm,
} from './hooks/index.js';
export type { AuthFormOptions } from './hooks/index.js';

export {
  Protected,
  AuthStatus,
  UserAvatar,
  LoginForm,
  RegisterForm,
  PasswordStrength,
  SessionExpiredDialog,
} from './components/index.js';

export type { SupabaseAuthProvider } from './providers/index.js';
export type { IAuthProvider } from './providers/index.js';

export type {
  IAuthRepository,
} from './repository/index.js';

export type {
  AuthStateMachine,
  InMemorySessionStore,
  DeviceManager,
  SessionManager,
} from './session/index.js';

export type {
  ICloudFunctionsRepository,
  AuthService,
  AuthorizationService,
  TokenService,
} from './service/index.js';

export type {
  InMemoryEventBus,
  EventBus,
} from './events/index.js';

export type {
  PermissionResolver,
} from './permissions/index.js';
