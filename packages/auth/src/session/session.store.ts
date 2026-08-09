import type { AuthSession } from '@oceanfresh/shared';

export interface SessionStore {
  getSession(): AuthSession | null;
  setSession(session: AuthSession): void;
  updateSession(data: Partial<AuthSession>): void;
  clearSession(): void;
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
}

export class InMemorySessionStore implements SessionStore {
  private session: AuthSession | null = null;

  getSession(): AuthSession | null {
    return this.session;
  }

  setSession(session: AuthSession): void {
    this.session = session;
  }

  updateSession(data: Partial<AuthSession>): void {
    if (this.session) {
      this.session = { ...this.session, ...data };
    }
  }

  clearSession(): void {
    this.session = null;
  }

  getAccessToken(): string | null {
    return this.session?.tokenPair.accessToken ?? null;
  }

  getRefreshToken(): string | null {
    return this.session?.tokenPair.refreshToken ?? null;
  }
}

const STORAGE_KEY = 'oceanfresh.auth.session';

/**
 * Session store persisted in localStorage so the mapped AuthSession survives
 * page reloads. The actual Supabase session is still managed by supabase-js
 * (its own storage + automatic token refresh); this store mirrors it for the
 * package's session manager.
 */
export class PersistentSessionStore implements SessionStore {
  private session: AuthSession | null = null;
  private hydrated = false;

  private hydrate(): void {
    if (this.hydrated || typeof window === 'undefined') return;
    this.hydrated = true;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) this.session = JSON.parse(raw) as AuthSession;
    } catch {
      this.session = null;
    }
  }

  private persist(): void {
    if (typeof window === 'undefined') return;
    try {
      if (this.session === null) {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.session));
      }
    } catch {
      // Storage unavailable (private mode / quota) — session lives in memory.
    }
  }

  getSession(): AuthSession | null {
    this.hydrate();
    return this.session;
  }

  setSession(session: AuthSession): void {
    this.hydrate();
    this.session = session;
    this.persist();
  }

  updateSession(data: Partial<AuthSession>): void {
    this.hydrate();
    if (this.session) {
      this.session = { ...this.session, ...data };
      this.persist();
    }
  }

  clearSession(): void {
    this.hydrate();
    this.session = null;
    this.persist();
  }

  getAccessToken(): string | null {
    return this.getSession()?.tokenPair.accessToken ?? null;
  }

  getRefreshToken(): string | null {
    return this.getSession()?.tokenPair.refreshToken ?? null;
  }
}
