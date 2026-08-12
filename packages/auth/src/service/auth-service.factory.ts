import { type AuthEventType, InMemoryEventBus } from '@oceanfresh/shared';

import type { AuthEvent } from '../events/index.js';
import { PermissionResolver } from '../permissions/index.js';
import { SupabaseAuthProvider } from '../providers/index.js';
import {
  DeviceManager,
  InMemorySessionStore,
  PersistentSessionStore,
  SessionManager,
} from '../session/index.js';
import { AuthService } from './auth.service.js';

export interface GetAuthServiceOptions {
  /**
   * Keep the app-level session mirror in localStorage (default: true).
   * Set to false for memory-only admin sessions: the SessionManager uses an
   * in-memory store and nothing is persisted to localStorage.
   */
  persistSession?: boolean;
}

// A single AuthService instance is shared by every consumer so login state
// (session store, rate limiters, event bus) survives across hook calls and
// page navigation within the SPA.
let authServiceInstance: AuthService | null = null;

export function getAuthService(options: GetAuthServiceOptions = {}): AuthService {
  if (!authServiceInstance) {
    const provider = new SupabaseAuthProvider();
    const eventBus = new InMemoryEventBus<AuthEvent, AuthEventType>();
    const store =
      options.persistSession === false ? new InMemorySessionStore() : new PersistentSessionStore();
    const deviceManager = new DeviceManager();
    const sessionManager = new SessionManager(store, eventBus, deviceManager);
    const resolver = new PermissionResolver();
    authServiceInstance = new AuthService(provider, sessionManager, eventBus, resolver);
  }
  return authServiceInstance;
}
