import { createLogger, TokenExpiredError, TokenRevokedError } from '@oceanfresh/shared';
import type { IAuthProvider } from '../providers/index.js';
import type { SessionManager } from '../session/index.js';

const logger = createLogger('auth:service:token');

export class TokenService {
  private refreshPromise: Promise<string> | null = null;

  constructor(
    private readonly authProvider: IAuthProvider,
    private readonly sessionManager: SessionManager,
  ) {}

  async getAccessToken(forceRefresh = false): Promise<string> {
    const session = this.sessionManager.getSession();
    const token = session?.tokenPair.accessToken;

    if (!token) {
      throw new TokenRevokedError('No access token available');
    }

    if (forceRefresh || this.isTokenExpired(token)) {
      return this.refreshAccessToken();
    }

    return token;
  }

  async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.doRefresh();
    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload?.exp) return true;
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  getTokenExpiry(token: string): number | null {
    try {
      const payload = this.decodeToken(token);
      return payload?.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  getTokenRefreshCountdown(): number | null {
    const session = this.sessionManager.getSession();
    if (!session) return null;
    const exp = session.tokenPair.accessTokenExpiresAt;
    const refreshBuffer = 300000;
    return Math.max(0, exp - Date.now() - refreshBuffer);
  }

  private async doRefresh(): Promise<string> {
    logger.debug('refreshing access token');
    const newToken = await this.authProvider.refreshToken();
    const session = this.sessionManager.getSession();
    if (session) {
      session.tokenPair.accessToken = newToken;
      session.tokenPair.accessTokenExpiresAt = Date.now() + 3600000;
      this.sessionManager.startSession(session);
    }
    return newToken;
  }

  private decodeToken(token: string): { exp?: number; sub?: string; [key: string]: unknown } | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1]!;
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}
