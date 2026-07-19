import {
  AccountStatus,
  AuthEventType,
  AuthProviderType,
  type AuthSession,
  IdentityType,
  Permission,
  Role,
  type UserIdentity,
} from '@oceanfresh/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../service/auth.service.js';
import { AuthorizationService } from '../service/authorization.service.js';
import { TokenService } from '../service/token.service.js';

const mockUser: UserIdentity = {
  id: 'user-1',
  email: 'a@b.com',
  phone: null,
  displayName: 'Test',
  photoURL: null,
  provider: AuthProviderType.EMAIL,
  identityType: IdentityType.USER,
  emailVerified: true,
  accountStatus: AccountStatus.ACTIVE,
  isAnonymous: false,
  createdAt: new Date(),
  lastLoginAt: null,
};

const mockSession: AuthSession = {
  id: 's1',
  userId: 'user-1',
  tokenPair: {
    accessToken: 'at',
    refreshToken: 'rt',
    idToken: 'it',
    accessTokenExpiresAt: 0,
    refreshTokenExpiresAt: 0,
  },
  device: {
    id: 'd1',
    name: '',
    type: 'desktop',
    os: '',
    browser: '',
    ipHash: '',
    isTrusted: false,
    riskScore: 0,
    lastLoginAt: 0,
  },
  metadata: { authMethod: 'password', mfaUsed: false },
  startedAt: Date.now(),
  lastActivityAt: Date.now(),
  expiresAt: Date.now() + 3600000,
  absoluteExpiresAt: Date.now() + 86400000,
  isRememberMe: false,
  isRevoked: false,
};

function createMockProvider() {
  return {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    observeAuthState: vi.fn(),
    sendPasswordReset: vi.fn(),
    verifyEmail: vi.fn(),
    deleteAccount: vi.fn(),
    reauthenticate: vi.fn(),
    getCustomClaims: vi.fn(),
    getIdToken: vi.fn(),
    refreshToken: vi.fn(),
    linkProvider: vi.fn(),
    unlinkProvider: vi.fn(),
  };
}

function createMockSessionManager() {
  return {
    startSession: vi.fn(),
    getSession: vi.fn(),
    endSession: vi.fn(),
    validateSession: vi.fn(),
    extendSession: vi.fn(),
    refreshSession: vi.fn(),
    state: 'UNAUTHENTICATED',
    onStateTransition: vi.fn(),
    destroy: vi.fn(),
  };
}

function createMockEventBus() {
  return { publish: vi.fn(), subscribe: vi.fn(), clear: vi.fn() };
}

function createMockResolver() {
  return {
    hasPermission: vi.fn(),
    getEffectivePermissions: vi.fn(),
    isAtLeastRole: vi.fn(),
    rbacHasPermission: vi.fn(),
    registerABACEngine: vi.fn(),
    getRoleLevel: vi.fn(),
  };
}

describe('AuthService', () => {
  let provider: ReturnType<typeof createMockProvider>;
  let sessionManager: ReturnType<typeof createMockSessionManager>;
  let eventBus: ReturnType<typeof createMockEventBus>;
  let resolver: ReturnType<typeof createMockResolver>;
  let service: AuthService;

  beforeEach(() => {
    provider = createMockProvider();
    sessionManager = createMockSessionManager();
    eventBus = createMockEventBus();
    resolver = createMockResolver();
    service = new AuthService(provider, sessionManager, eventBus, resolver);
  });

  it('login delegates to provider and publishes event', async () => {
    provider.login.mockResolvedValue(mockSession);
    eventBus.publish.mockResolvedValue(undefined);

    const result = await service.login({
      email: 'a@b.com',
      password: 'pass123',
      rememberMe: false,
    });

    expect(provider.login).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'pass123',
      rememberMe: false,
    });
    expect(sessionManager.startSession).toHaveBeenCalledWith(mockSession);
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: AuthEventType.LOGGED_IN }),
    );
    expect(result).toBeDefined();
  });

  it('register delegates to provider and publishes event', async () => {
    provider.register.mockResolvedValue(mockUser);
    eventBus.publish.mockResolvedValue(undefined);

    const result = await service.register('a@b.com', 'pass123', 'Test');

    expect(provider.register).toHaveBeenCalledWith('a@b.com', 'pass123', 'Test');
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: AuthEventType.REGISTERED }),
    );
    expect(result).toBeDefined();
  });

  it('logout delegates to provider and publishes event', async () => {
    provider.getCurrentUser.mockResolvedValue(mockUser);
    provider.logout.mockResolvedValue(undefined);
    sessionManager.endSession.mockResolvedValue(undefined);
    eventBus.publish.mockResolvedValue(undefined);

    await service.logout();

    expect(provider.logout).toHaveBeenCalled();
    expect(sessionManager.endSession).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: AuthEventType.LOGGED_OUT }),
    );
  });

  it('resetPassword calls sendPasswordReset', async () => {
    provider.sendPasswordReset.mockResolvedValue(undefined);
    eventBus.publish.mockResolvedValue(undefined);

    await service.resetPassword('a@b.com');

    expect(provider.sendPasswordReset).toHaveBeenCalledWith('a@b.com');
  });

  it('verifyEmail delegates to provider', async () => {
    provider.verifyEmail.mockResolvedValue(undefined);
    provider.getCurrentUser.mockResolvedValue(mockUser);
    eventBus.publish.mockResolvedValue(undefined);

    await service.verifyEmail();

    expect(provider.verifyEmail).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: AuthEventType.EMAIL_VERIFIED }),
    );
  });

  it('deleteAccount delegates and ends session', async () => {
    provider.deleteAccount.mockResolvedValue(undefined);
    provider.getCurrentUser.mockResolvedValue(mockUser);
    sessionManager.endSession.mockResolvedValue(undefined);
    eventBus.publish.mockResolvedValue(undefined);

    await service.deleteAccount();

    expect(provider.deleteAccount).toHaveBeenCalled();
    expect(sessionManager.endSession).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: AuthEventType.ACCOUNT_DELETED }),
    );
  });
});

describe('AuthorizationService', () => {
  let resolver: ReturnType<typeof createMockResolver>;
  let eventBus: ReturnType<typeof createMockEventBus>;
  let service: AuthorizationService;

  beforeEach(() => {
    resolver = createMockResolver();
    eventBus = createMockEventBus();
    const mockRepo = { findUserById: vi.fn() } as Record<string, unknown>;
    const mockFn = { assignRole: vi.fn() } as Record<string, unknown>;
    service = new AuthorizationService(resolver, mockRepo, mockFn, eventBus);
  });

  it('hasPermission delegates to resolver', async () => {
    resolver.hasPermission.mockResolvedValue(true);
    const result = await service.hasPermission(mockUser, Permission.USER_MANAGE);
    expect(result).toBe(true);
  });

  it('requirePermission returns true when allowed', async () => {
    resolver.hasPermission.mockResolvedValue(true);
    await expect(
      service.requirePermission(mockUser, Permission.USER_MANAGE),
    ).resolves.toBeUndefined();
  });

  it('requirePermission throws when denied', async () => {
    resolver.hasPermission.mockResolvedValue(false);
    await expect(service.requirePermission(mockUser, Permission.USER_MANAGE)).rejects.toThrow();
  });

  it('getEffectivePermissions delegates to resolver', async () => {
    resolver.getEffectivePermissions.mockReturnValue([Permission.PRODUCT_READ]);
    const perms = await service.getEffectivePermissions(mockUser);
    expect(perms).toEqual([Permission.PRODUCT_READ]);
  });

  it('isAtLeastRole delegates to resolver', async () => {
    resolver.isAtLeastRole.mockReturnValue(true);
    const result = await service.isAtLeastRole(mockUser, Role.MODERATOR);
    expect(result).toBe(true);
  });

  it('requireRole throws when insufficient', async () => {
    resolver.isAtLeastRole.mockReturnValue(false);
    await expect(service.requireRole(mockUser, Role.ADMIN)).rejects.toThrow();
  });
});

describe('TokenService', () => {
  let service: TokenService;
  let provider: ReturnType<typeof createMockProvider>;
  let sessionManager: ReturnType<typeof createMockSessionManager>;

  beforeEach(() => {
    provider = createMockProvider();
    sessionManager = createMockSessionManager();
    service = new TokenService(provider, sessionManager);
  });

  it('checks if token is expired', () => {
    const expired = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjEwMDAwMDAwMDB9';
    expect(service.isTokenExpired(expired)).toBe(true);
  });

  it('handles malformed tokens gracefully', () => {
    expect(service.isTokenExpired('invalid-token')).toBe(true);
  });

  it('handles empty token', () => {
    expect(service.isTokenExpired('')).toBe(true);
  });

  it('getTokenExpiry returns null for invalid token', () => {
    expect(service.getTokenExpiry('bad')).toBeNull();
  });
});
