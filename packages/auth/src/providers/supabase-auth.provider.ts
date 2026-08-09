import {
  AccountStatus,
  AuthError,
  AuthProviderType,
  type AuthSession,
  createLogger,
  IdentityType,
  InvalidCredentialsError,
  type LoginInput,
  type UserIdentity,
} from '@oceanfresh/shared';
import { getClient, initSupabase } from '@oceanfresh/supabase';

import type { IAuthProvider } from './auth-provider.interface.js';

const logger = createLogger('auth:provider:supabase');

function mapSupabaseUser(user: {
  id: string;
  email?: string | null;
  phone?: string | null;
  user_metadata?: Record<string, unknown>;
  email_confirmed_at?: string | null;
  created_at?: string;
  last_sign_in_at?: string | null;
}): UserIdentity {
  return {
    id: user.id,
    email: user.email ?? null,
    phone: user.phone ?? null,
    displayName: (user.user_metadata?.display_name as string) ?? user.email ?? '',
    photoURL: (user.user_metadata?.avatar_url as string) ?? null,
    provider: AuthProviderType.EMAIL,
    identityType: IdentityType.USER,
    emailVerified: !!user.email_confirmed_at,
    accountStatus: AccountStatus.ACTIVE,
    isAnonymous: false,
    createdAt: user.created_at ? new Date(user.created_at) : new Date(),
    lastLoginAt: user.last_sign_in_at ? new Date(user.last_sign_in_at) : null,
  };
}

function mapSupabaseError(err: unknown): never {
  const code = (err as { code?: string })?.code ?? '';
  const message = (err as { message?: string })?.message ?? '';
  switch (code) {
    case 'invalid_credentials':
    case 'user_not_found':
      throw new InvalidCredentialsError('Invalid email or password');
    case 'email_exists':
    case 'user_already_exists':
      throw new Error('Email already in use');
    case 'too_many_requests':
      throw new Error('Too many attempts. Please try again later.');
    case 'user_disabled':
      throw new Error('Account has been disabled');
    case 'weak_password':
      throw new Error('Password is too weak');
    case 'invalid_email':
      throw new Error('Invalid email address');
    case 'otp_expired':
      throw new Error('OTP has expired');
    case 'same_password':
      throw new Error('New password must be different from current password');
    default:
      if (message.includes('Email not confirmed')) {
        throw new Error('Email not confirmed. Please check your inbox.');
      }
      throw new AuthError(`Authentication failed: ${code || message}`);
  }
}

function generateSessionId(): string {
  return crypto.randomUUID();
}

export class SupabaseAuthProvider implements IAuthProvider {
  async login(input: LoginInput): Promise<AuthSession> {
    logger.debug('login', { email: input.email });
    try {
      initSupabase();
      if (!input.email) throw new InvalidCredentialsError('Email is required');
      const { data, error } = await getClient().auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });
      if (error) throw error;
      if (!data.user) throw new AuthError('Login failed');

      const user = mapSupabaseUser(data.user);
      const idToken = data.session?.access_token ?? '';

      return {
        id: generateSessionId(),
        userId: user.id,
        tokenPair: {
          accessToken: idToken,
          refreshToken: data.session?.refresh_token ?? '',
          idToken,
          accessTokenExpiresAt: Date.now() + (data.session?.expires_in ?? 3600) * 1000,
          refreshTokenExpiresAt: Date.now() + 2592000000,
        },
        device: {
          id: '',
          name: 'Unknown',
          type: 'unknown',
          os: '',
          browser: '',
          ipHash: '',
          isTrusted: false,
          riskScore: 0,
          lastLoginAt: Date.now(),
        },
        metadata: { authMethod: 'email', mfaUsed: false },
        startedAt: Date.now(),
        lastActivityAt: Date.now(),
        expiresAt: Date.now() + 3600000,
        absoluteExpiresAt: Date.now() + 86400000,
        isRememberMe: input.rememberMe ?? false,
        isRevoked: false,
      };
    } catch (err) {
      mapSupabaseError(err);
    }
  }

  async register(email: string, password: string, displayName: string): Promise<UserIdentity> {
    logger.debug('register', { email });
    try {
      initSupabase();
      const { data, error } = await getClient().auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (error) throw error;
      if (!data.user) throw new AuthError('Registration failed');
      return mapSupabaseUser(data.user);
    } catch (err) {
      mapSupabaseError(err);
    }
  }

  async logout(): Promise<void> {
    logger.debug('logout');
    initSupabase();
    const { error } = await getClient().auth.signOut();
    if (error) throw new AuthError('Logout failed');
  }

  async getCurrentUser(): Promise<UserIdentity | null> {
    initSupabase();
    const {
      data: { user },
    } = await getClient().auth.getUser();
    if (!user) return null;
    return mapSupabaseUser(user);
  }

  observeAuthState(callback: (user: UserIdentity | null) => void): () => void {
    initSupabase();
    const {
      data: { subscription },
    } = getClient().auth.onAuthStateChange((_event, session) => {
      callback(session?.user ? mapSupabaseUser(session.user) : null);
    });
    return () => subscription.unsubscribe();
  }

  async getIdToken(_forceRefresh = false): Promise<string> {
    initSupabase();
    const {
      data: { session },
    } = await getClient().auth.getSession();
    if (!session) throw new AuthError('No authenticated user');
    return session.access_token;
  }

  async getCustomClaims(): Promise<Record<string, unknown>> {
    const token = await this.getIdToken();
    const payload = JSON.parse(atob(token.split('.')[1] as string));
    return payload as Record<string, unknown>;
  }

  async reauthenticate(password: string): Promise<void> {
    initSupabase();
    const {
      data: { user },
    } = await getClient().auth.getUser();
    if (!user?.email) throw new AuthError('Cannot reauthenticate');
    const { error } = await getClient().auth.signInWithPassword({
      email: user.email,
      password,
    });
    if (error) throw new AuthError('Reauthentication failed');
  }

  async sendPasswordReset(email: string): Promise<void> {
    initSupabase();
    const { error } = await getClient().auth.resetPasswordForEmail(email);
    if (error) throw new AuthError('Failed to send password reset email');
  }

  async updatePassword(newPassword: string): Promise<void> {
    initSupabase();
    const { error } = await getClient().auth.updateUser({ password: newPassword });
    if (error) throw new AuthError('Failed to update password');
  }

  async verifyEmail(): Promise<void> {
    initSupabase();
    const {
      data: { user },
    } = await getClient().auth.getUser();
    if (!user?.email) throw new AuthError('No email to verify');
    const { error } = await getClient().auth.resend({
      type: 'signup',
      email: user.email,
    });
    if (error) throw new AuthError('Failed to send verification email');
  }

  async linkProvider(provider: string): Promise<void> {
    initSupabase();
    const { error } = await getClient().auth.linkIdentity({ provider: provider as 'google' });
    if (error) throw new AuthError('Failed to link provider');
  }

  async unlinkProvider(providerId: string): Promise<void> {
    initSupabase();
    const {
      data: { user },
    } = await getClient().auth.getUser();
    if (!user) throw new AuthError('No authenticated user');
    const identities = user.identities ?? [];
    const identity = identities.find(
      (i: { provider?: string; id?: string }) => i.provider === providerId || i.id === providerId,
    );
    if (!identity) throw new AuthError('Provider not linked');
    const { error } = await getClient().auth.unlinkIdentity(identity);
    if (error) throw new AuthError('Failed to unlink provider');
  }

  async refreshToken(): Promise<string> {
    initSupabase();
    const { data, error } = await getClient().auth.refreshSession();
    if (error || !data.session) throw new AuthError('Failed to refresh token');
    return data.session.access_token;
  }
}
