import {
  AuthenticationState,
  type AuthSession,
  IllegalStateTransitionError,
} from '@oceanfresh/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthStateMachine } from '../session/auth-state-machine.js';
import { DeviceManager } from '../session/device.manager.js';
import { SessionManager } from '../session/session.manager.js';
import { InMemorySessionStore } from '../session/session.store.js';

const mockSession: AuthSession = {
  id: 's1',
  userId: 'u1',
  tokenPair: {
    accessToken: 'at',
    refreshToken: 'rt',
    idToken: 'it',
    accessTokenExpiresAt: Date.now() + 3600000,
    refreshTokenExpiresAt: Date.now() + 2592000000,
  },
  device: {
    id: 'd1',
    name: 'Desktop',
    type: 'desktop',
    os: 'Windows',
    browser: 'Chrome',
    ipHash: '',
    isTrusted: false,
    riskScore: 0,
    lastLoginAt: Date.now(),
  },
  metadata: { authMethod: 'password', mfaUsed: false },
  startedAt: Date.now(),
  lastActivityAt: Date.now(),
  expiresAt: Date.now() + 3600000,
  absoluteExpiresAt: Date.now() + 86400000,
  isRememberMe: false,
  isRevoked: false,
};

describe('AuthStateMachine', () => {
  let machine: AuthStateMachine;

  beforeEach(() => {
    machine = new AuthStateMachine();
  });

  it('starts in UNAUTHENTICATED state', () => {
    expect(machine.currentState).toBe(AuthenticationState.UNAUTHENTICATED);
  });

  it('transitions from UNAUTHENTICATED to AUTHENTICATING', () => {
    machine.transition(AuthenticationState.AUTHENTICATING);
    expect(machine.currentState).toBe(AuthenticationState.AUTHENTICATING);
  });

  it('transitions from AUTHENTICATING to AUTHENTICATED', () => {
    machine.transition(AuthenticationState.AUTHENTICATING);
    machine.transition(AuthenticationState.AUTHENTICATED);
    expect(machine.currentState).toBe(AuthenticationState.AUTHENTICATED);
  });

  it('transitions from AUTHENTICATED to SESSION_EXPIRED', () => {
    machine.transition(AuthenticationState.AUTHENTICATING);
    machine.transition(AuthenticationState.AUTHENTICATED);
    machine.transition(AuthenticationState.SESSION_EXPIRED);
    expect(machine.currentState).toBe(AuthenticationState.SESSION_EXPIRED);
  });

  it('throws on invalid transition', () => {
    expect(() => machine.transition(AuthenticationState.AUTHENTICATED)).toThrow(
      IllegalStateTransitionError,
    );
  });

  it('calls onTransition listener', () => {
    const listener = vi.fn();
    machine.onTransition(listener);
    machine.transition(AuthenticationState.AUTHENTICATING);
    expect(listener).toHaveBeenCalledWith(
      AuthenticationState.AUTHENTICATING,
      AuthenticationState.UNAUTHENTICATED,
    );
  });

  it('canTransitionTo returns true for valid transitions', () => {
    expect(machine.canTransitionTo(AuthenticationState.AUTHENTICATING)).toBe(true);
  });

  it('canTransitionTo returns false for invalid transitions', () => {
    expect(machine.canTransitionTo(AuthenticationState.AUTHENTICATED)).toBe(false);
  });

  it('isAuthenticated returns true only when authenticated', () => {
    expect(machine.isAuthenticated()).toBe(false);
    machine.transition(AuthenticationState.AUTHENTICATING);
    machine.transition(AuthenticationState.AUTHENTICATED);
    expect(machine.isAuthenticated()).toBe(true);
  });

  it('requiresMfa returns true when mfa_required', () => {
    expect(machine.requiresMfa()).toBe(false);
    machine.transition(AuthenticationState.AUTHENTICATING);
    machine.transition(AuthenticationState.MFA_REQUIRED);
    expect(machine.requiresMfa()).toBe(true);
  });

  it('requiresReauth returns true when reauth_required', () => {
    machine.transition(AuthenticationState.AUTHENTICATING);
    machine.transition(AuthenticationState.AUTHENTICATED);
    machine.transition(AuthenticationState.REAUTH_REQUIRED);
    expect(machine.requiresReauth()).toBe(true);
  });
});

describe('InMemorySessionStore', () => {
  let store: InMemorySessionStore;

  beforeEach(() => {
    store = new InMemorySessionStore();
  });

  it('starts with null session', () => {
    expect(store.getSession()).toBeNull();
  });

  it('stores and retrieves session', () => {
    store.setSession(mockSession);
    expect(store.getSession()).toBe(mockSession);
  });

  it('updates session fields', () => {
    store.setSession(mockSession);
    store.updateSession({ isRevoked: true });
    expect((store.getSession() as AuthSession).isRevoked).toBe(true);
  });

  it('clears session', () => {
    store.setSession(mockSession);
    store.clearSession();
    expect(store.getSession()).toBeNull();
  });

  it('returns access token', () => {
    store.setSession(mockSession);
    expect(store.getAccessToken()).toBe('at');
  });

  it('returns null access token when no session', () => {
    expect(store.getAccessToken()).toBeNull();
  });

  it('returns refresh token', () => {
    store.setSession(mockSession);
    expect(store.getRefreshToken()).toBe('rt');
  });

  it('returns null refresh token when no session', () => {
    expect(store.getRefreshToken()).toBeNull();
  });
});

describe('DeviceManager', () => {
  let manager: DeviceManager;

  beforeEach(() => {
    manager = new DeviceManager();
  });

  it('generates a fingerprint', async () => {
    const fp = await manager.fingerprint();
    expect(fp).toBeTruthy();
    expect(typeof fp).toBe('string');
  });

  it('returns device info', () => {
    const info = manager.getDeviceInfo();
    expect(info).toBeDefined();
    expect(info.type).toBeDefined();
  });

  it('calculates risk score', async () => {
    const device = manager.getDeviceInfo();
    const score = await manager.calculateRiskScore(device, [device]);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('SessionManager', () => {
  let store: InMemorySessionStore;
  let eventBus: {
    publish: ReturnType<typeof vi.fn>;
    subscribe: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };
  let deviceManager: DeviceManager;

  beforeEach(() => {
    store = new InMemorySessionStore();
    eventBus = { publish: vi.fn(), subscribe: vi.fn(), clear: vi.fn() };
    deviceManager = new DeviceManager();
  });

  it('starts with UNAUTHENTICATED state', () => {
    const manager = new SessionManager(store, eventBus, deviceManager);
    expect(manager.state).toBe(AuthenticationState.UNAUTHENTICATED);
  });

  it('starts session and transitions to AUTHENTICATED', () => {
    const manager = new SessionManager(store, eventBus, deviceManager);
    manager.startSession(mockSession);
    expect(store.getSession()).toBe(mockSession);
    expect(manager.state).toBe(AuthenticationState.AUTHENTICATED);
  });

  it('ends session and transitions to UNAUTHENTICATED', () => {
    const manager = new SessionManager(store, eventBus, deviceManager);
    manager.startSession(mockSession);
    manager.endSession();
    expect(store.getSession()).toBeNull();
    expect(manager.state).toBe(AuthenticationState.UNAUTHENTICATED);
  });

  it('returns session via getSession', () => {
    const manager = new SessionManager(store, eventBus, deviceManager);
    manager.startSession(mockSession);
    expect(manager.getSession()).toBe(mockSession);
  });

  it('validates active session', () => {
    const manager = new SessionManager(store, eventBus, deviceManager);
    manager.startSession(mockSession);
    expect(manager.validateSession()).resolves.toBe(true);
  });

  it('is idempotent for duplicate authenticated events', async () => {
    const manager = new SessionManager(store, eventBus, deviceManager);
    await manager.startSession(mockSession);
    await expect(manager.startSession(mockSession)).resolves.toBeUndefined();
    expect(manager.state).toBe(AuthenticationState.AUTHENTICATED);
    expect(store.getSession()).toBe(mockSession);
  });

  it('retains the latest session data on a duplicate startSession', async () => {
    const manager = new SessionManager(store, eventBus, deviceManager);
    await manager.startSession({
      ...mockSession,
      tokenPair: { ...mockSession.tokenPair, accessToken: 'at1' },
    });
    const refreshed = {
      ...mockSession,
      tokenPair: { ...mockSession.tokenPair, accessToken: 'at2' },
    };
    await expect(manager.startSession(refreshed)).resolves.toBeUndefined();
    expect(manager.state).toBe(AuthenticationState.AUTHENTICATED);
    expect(store.getSession()?.tokenPair.accessToken).toBe('at2');
  });

  it('supports token refresh while authenticated (startSession re-entry)', async () => {
    const manager = new SessionManager(store, eventBus, deviceManager);
    await manager.startSession(mockSession);
    expect(manager.state).toBe(AuthenticationState.AUTHENTICATED);
    const refreshed = {
      ...mockSession,
      tokenPair: { ...mockSession.tokenPair, accessToken: 'refreshed-token' },
    };
    await expect(manager.startSession(refreshed)).resolves.toBeUndefined();
    expect(manager.state).toBe(AuthenticationState.AUTHENTICATED);
    expect(store.getSession()?.tokenPair.accessToken).toBe('refreshed-token');
  });

  it('does not throw when ending session while already unauthenticated', async () => {
    const manager = new SessionManager(store, eventBus, deviceManager);
    await manager.startSession(mockSession);
    await manager.endSession();
    await expect(manager.endSession()).resolves.toBeUndefined();
    expect(manager.state).toBe(AuthenticationState.UNAUTHENTICATED);
    expect(store.getSession()).toBeNull();
  });

  it('re-authenticates after session expired without throwing', async () => {
    const manager = new SessionManager(store, eventBus, deviceManager);
    await manager.startSession(mockSession);
    const revoked = { ...mockSession, isRevoked: true };
    store.setSession(revoked);
    await expect(manager.validateSession()).resolves.toBe(false);
    expect(manager.state).toBe(AuthenticationState.SESSION_EXPIRED);
    await expect(manager.startSession(mockSession)).resolves.toBeUndefined();
    expect(manager.state).toBe(AuthenticationState.AUTHENTICATED);
  });

  it('handles session expiry idempotently', async () => {
    const manager = new SessionManager(store, eventBus, deviceManager);
    await manager.startSession(mockSession);
    await manager.handleSessionExpired();
    await expect(manager.handleSessionExpired()).resolves.toBeUndefined();
    expect(manager.state).toBe(AuthenticationState.SESSION_EXPIRED);
  });

  it('destroys and cleans up', () => {
    const manager = new SessionManager(store, eventBus, deviceManager);
    manager.startSession(mockSession);
    manager.destroy();
    expect(store.getSession()).toBeNull();
  });
});
