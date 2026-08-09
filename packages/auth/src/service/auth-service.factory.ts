import { type AuthEventType, InMemoryEventBus } from '@oceanfresh/shared';

import type { AuthEvent } from '../events/index.js';
import { PermissionResolver } from '../permissions/index.js';
import { SupabaseAuthProvider } from '../providers/index.js';
import { DeviceManager, PersistentSessionStore, SessionManager } from '../session/index.js';
import { AuthService } from './auth.service.js';

// A single AuthService instance is shared by every consumer so login state
// (persistent session store, rate limiters, event bus) survives across hook
// calls and page navigation within the SPA.
let authServiceInstance: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    const provider = new SupabaseAuthProvider();
    const eventBus = new InMemoryEventBus<AuthEvent, AuthEventType>();
    const store = new PersistentSessionStore();
    const deviceManager = new DeviceManager();
    const sessionManager = new SessionManager(store, eventBus, deviceManager);
    const resolver = new PermissionResolver();
    authServiceInstance = new AuthService(provider, sessionManager, eventBus, resolver);
  }
  return authServiceInstance;
}
