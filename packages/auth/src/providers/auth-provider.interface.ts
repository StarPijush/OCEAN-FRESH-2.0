import type { AuthSession, LoginInput, UserIdentity } from '@oceanfresh/shared';

export interface IAuthProvider {
  login(input: LoginInput): Promise<AuthSession>;
  register(email: string, password: string, displayName: string): Promise<UserIdentity>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<UserIdentity | null>;
  observeAuthState(callback: (user: UserIdentity | null) => void): () => void;
  getIdToken(forceRefresh?: boolean): Promise<string>;
  getCustomClaims(): Promise<Record<string, unknown>>;
  reauthenticate(password: string): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
  verifyEmail(): Promise<void>;
  linkProvider(provider: string): Promise<void>;
  unlinkProvider(providerId: string): Promise<void>;
  refreshToken(): Promise<string>;
}
