import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FirebaseAuthProvider } from '../providers/firebase-auth.provider.js';

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
  })),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((_auth, cb) => {
    cb(null);
    return vi.fn();
  }),
  sendPasswordResetEmail: vi.fn(),
  verifyBeforeUpdateEmail: vi.fn(),
  reauthenticateWithCredential: vi.fn(),
  EmailAuthProvider: { credential: vi.fn() },
  deleteUser: vi.fn(),
  updateProfile: vi.fn(),
  GoogleAuthProvider: vi.fn(() => ({})),
  signInWithPopup: vi.fn(),
  linkWithPopup: vi.fn(),
  unlink: vi.fn(),
}));

describe('FirebaseAuthProvider', () => {
  let provider: FirebaseAuthProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new FirebaseAuthProvider();
  });

  it('is defined', () => {
    expect(provider).toBeDefined();
  });

  it('login fails with invalid credentials', async () => {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const authError = new Error('auth/invalid-credential');
    (authError as Record<string, unknown>).code = 'auth/invalid-credential';
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue(authError);

    await expect(provider.login({ email: 'bad@b.com', password: 'wrong' })).rejects.toThrow(
      'Invalid email or password',
    );
  });

  it('register creates user via Firebase auth', async () => {
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    const mockCredential = {
      user: {
        uid: '1',
        email: 'a@b.com',
        displayName: null,
        photoURL: null,
        phoneNumber: null,
        emailVerified: false,
        isAnonymous: false,
        metadata: { creationTime: '2024-01-01', lastSignInTime: '2024-01-01' },
        reload: vi.fn(),
        getIdToken: vi.fn(),
        getIdTokenResult: vi.fn(),
      },
    };
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue(
      mockCredential as unknown as Record<string, unknown>,
    );
    vi.mocked(updateProfile).mockResolvedValue(undefined);

    const result = await provider.register('a@b.com', 'pass123', 'Test User');

    expect(result).toBeDefined();
    expect(result.email).toBe('a@b.com');
    expect(updateProfile).toHaveBeenCalled();
  });

  it('logout calls Firebase signOut', async () => {
    const { signOut } = await import('firebase/auth');
    vi.mocked(signOut).mockResolvedValue(undefined);

    await provider.logout();

    expect(signOut).toHaveBeenCalled();
  });

  it('getCurrentUser returns null when no user', async () => {
    const result = await provider.getCurrentUser();
    expect(result).toBeNull();
  });
});
