import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthService } from '../service/auth.service.js';
import type { SessionManager } from '../session/session.manager.js';

type AuthServiceWithSessionManager = AuthService & { sessionManager: SessionManager };

async function loadFactory() {
  vi.resetModules();
  const factory = await import('../service/auth-service.factory.js');
  const session = await import('../session/index.js');
  return {
    getAuthService: factory.getAuthService,
    InMemorySessionStore: session.InMemorySessionStore,
    PersistentSessionStore: session.PersistentSessionStore,
  };
}

function sessionStoreOf(service: AuthService): unknown {
  const manager = (service as unknown as AuthServiceWithSessionManager).sessionManager;
  return (manager as unknown as { store: unknown }).store;
}

describe('getAuthService session store selection', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('defaults to the persistent session store (localStorage mirror)', async () => {
    const { getAuthService, PersistentSessionStore } = await loadFactory();
    const service = getAuthService();
    expect(sessionStoreOf(service)).toBeInstanceOf(PersistentSessionStore);
  });

  it('uses the in-memory session store when persistSession is false', async () => {
    const { getAuthService, InMemorySessionStore } = await loadFactory();
    const service = getAuthService({ persistSession: false });
    expect(sessionStoreOf(service)).toBeInstanceOf(InMemorySessionStore);
  });
});
