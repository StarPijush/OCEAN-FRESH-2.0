import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  verifyBeforeUpdateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  unlink,
  type User,
} from 'firebase/auth';
import { createLogger, AuthProviderType, AccountStatus, IdentityType, InvalidCredentialsError, AuthError, type UserIdentity, type LoginInput, type AuthSession } from '@oceanfresh/shared';
import type { IAuthProvider } from './auth-provider.interface.js';

const logger = createLogger('auth:provider:firebase');

function mapFirebaseUser(user: User): UserIdentity {
  return {
    id: user.uid,
    email: user.email,
    phone: user.phoneNumber,
    displayName: user.displayName ?? '',
    photoURL: user.photoURL,
    provider: AuthProviderType.EMAIL,
    identityType: IdentityType.USER,
    emailVerified: user.emailVerified,
    accountStatus: AccountStatus.ACTIVE,
    isAnonymous: user.isAnonymous,
    createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date(),
    lastLoginAt: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime) : null,
  };
}

function mapFirebaseError(err: unknown): never {
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      throw new InvalidCredentialsError('Invalid email or password');
    case 'auth/email-already-in-use':
      throw new Error('Email already in use');
    case 'auth/too-many-requests':
      throw new Error('Too many attempts. Please try again later.');
    case 'auth/user-disabled':
      throw new Error('Account has been disabled');
    case 'auth/weak-password':
      throw new Error('Password is too weak');
    case 'auth/invalid-email':
      throw new Error('Invalid email address');
    case 'auth/operation-not-allowed':
      throw new Error('Operation not allowed');
    default:
      throw new AuthError(`Authentication failed: ${code}`);
  }
}

function generateSessionId(): string {
  return crypto.randomUUID();
}

export class FirebaseAuthProvider implements IAuthProvider {
  private auth = getAuth();

  async login(input: LoginInput): Promise<AuthSession> {
    logger.debug('login', { email: input.email });
    try {
      if (!input.email) throw new InvalidCredentialsError('Email is required');
      const credential = await signInWithEmailAndPassword(this.auth, input.email, input.password);
      const user = mapFirebaseUser(credential.user);
      const idToken = await credential.user.getIdToken();
      return {
        id: generateSessionId(),
        userId: user.id,
        tokenPair: {
          accessToken: idToken,
          refreshToken: '',
          idToken,
          accessTokenExpiresAt: Date.now() + 3600000,
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
      mapFirebaseError(err);
    }
  }

  async register(email: string, password: string, displayName: string): Promise<UserIdentity> {
    logger.debug('register', { email });
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      await updateProfile(credential.user, { displayName });
      return mapFirebaseUser(credential.user);
    } catch (err) {
      mapFirebaseError(err);
    }
  }

  async logout(): Promise<void> {
    logger.debug('logout');
    await signOut(this.auth);
  }

  async getCurrentUser(): Promise<UserIdentity | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    await user.reload();
    return mapFirebaseUser(user);
  }

  observeAuthState(callback: (user: UserIdentity | null) => void): () => void {
    return onAuthStateChanged(this.auth, (user) => {
      callback(user ? mapFirebaseUser(user) : null);
    });
  }

  async getIdToken(forceRefresh = false): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) throw new AuthError('No authenticated user');
    return user.getIdToken(forceRefresh);
  }

  async getCustomClaims(): Promise<Record<string, unknown>> {
    const user = this.auth.currentUser;
    if (!user) throw new AuthError('No authenticated user');
    const idTokenResult = await user.getIdTokenResult();
    return idTokenResult.claims;
  }

  async reauthenticate(password: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user?.email) throw new AuthError('Cannot reauthenticate');
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  }

  async deleteAccount(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new AuthError('No authenticated user');
    await deleteUser(user);
  }

  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }

  async verifyEmail(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new AuthError('No authenticated user');
    if (user.email) {
      await verifyBeforeUpdateEmail(user, user.email);
    }
  }

  async linkProvider(provider: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new AuthError('No authenticated user');
    if (provider === 'google') {
      const googleProvider = new GoogleAuthProvider();
      await linkWithPopup(user, googleProvider);
    }
  }

  async unlinkProvider(providerId: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new AuthError('No authenticated user');
    await unlink(user, providerId);
  }

  async refreshToken(): Promise<string> {
    return this.getIdToken(true);
  }
}
