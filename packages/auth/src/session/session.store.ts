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
