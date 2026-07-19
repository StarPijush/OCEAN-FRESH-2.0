import {
  AuthEventType,
  AuthProviderType,
  type AuthSession,
  createLogger,
  type LoginInput,
  TooManyAttemptsError,
  type UserIdentity,
} from '@oceanfresh/shared';

import type { EventBus } from '../events/index.js';
import type { PermissionResolver } from '../permissions/index.js';
import type { IAuthProvider } from '../providers/index.js';
import type { SessionManager } from '../session/index.js';

const logger = createLogger('auth:service:auth');

export class AuthService {
  private loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

  constructor(
    private readonly authProvider: IAuthProvider,
    private readonly sessionManager: SessionManager,
    private readonly eventBus: EventBus,
    private readonly permissionResolver: PermissionResolver,
  ) {}

  async login(input: LoginInput): Promise<AuthSession> {
    logger.info('login', { email: input.email });

    this.checkRateLimit(input.email ?? input.phone ?? 'unknown');

    try {
      const session = await this.authProvider.login(input);

      this.loginAttempts.delete(input.email ?? input.phone ?? '');

      await this.eventBus.publish({
        type: AuthEventType.LOGGED_IN,
        userId: session.userId,
        data: { method: 'email', rememberMe: input.rememberMe },
        metadata: { source: 'AuthService' },
      });

      await this.sessionManager.startSession(session);

      return session;
    } catch (err) {
      this.recordFailedAttempt(input.email ?? input.phone ?? 'unknown');
      await this.eventBus.publish({
        type: AuthEventType.LOGIN_FAILED,
        userId: '',
        data: { email: input.email, error: (err as Error).message },
        metadata: { source: 'AuthService' },
      });
      throw err;
    }
  }

  async register(email: string, password: string, displayName: string): Promise<UserIdentity> {
    logger.info('register', { email });
    const user = await this.authProvider.register(email, password, displayName);
    await this.eventBus.publish({
      type: AuthEventType.REGISTERED,
      userId: user.id,
      data: { email, provider: AuthProviderType.EMAIL },
      metadata: { source: 'AuthService' },
    });
    return user;
  }

  async logout(): Promise<void> {
    logger.info('logout');
    const session = this.sessionManager.getSession();
    const userId = session?.userId ?? '';
    await this.authProvider.logout();
    await this.sessionManager.endSession();
    await this.eventBus.publish({
      type: AuthEventType.LOGGED_OUT,
      userId,
      metadata: { source: 'AuthService' },
    });
  }

  async resetPassword(email: string): Promise<void> {
    logger.info('resetPassword', { email });
    await this.authProvider.sendPasswordReset(email);
    await this.eventBus.publish({
      type: AuthEventType.PASSWORD_RESET_REQUESTED,
      userId: '',
      data: { email },
      metadata: { source: 'AuthService' },
    });
  }

  async verifyEmail(): Promise<void> {
    logger.info('verifyEmail');
    await this.authProvider.verifyEmail();
    const user = await this.authProvider.getCurrentUser();
    await this.eventBus.publish({
      type: AuthEventType.EMAIL_VERIFIED,
      userId: user?.id ?? '',
      metadata: { source: 'AuthService' },
    });
  }

  async deleteAccount(): Promise<void> {
    logger.info('deleteAccount');
    const user = await this.authProvider.getCurrentUser();
    await this.authProvider.deleteAccount();
    await this.sessionManager.endSession();
    await this.eventBus.publish({
      type: AuthEventType.ACCOUNT_DELETED,
      userId: user?.id ?? '',
      metadata: { source: 'AuthService' },
    });
  }

  async reauthenticate(password: string): Promise<void> {
    logger.debug('reauthenticate');
    await this.authProvider.reauthenticate(password);
    const user = await this.authProvider.getCurrentUser();
    await this.eventBus.publish({
      type: AuthEventType.REAUTH_COMPLETED,
      userId: user?.id ?? '',
      metadata: { source: 'AuthService' },
    });
  }

  async getCurrentUser(): Promise<UserIdentity | null> {
    return this.authProvider.getCurrentUser();
  }

  private checkRateLimit(identifier: string): void {
    const record = this.loginAttempts.get(identifier);
    if (record) {
      const elapsed = Date.now() - record.lastAttempt;
      if (record.count >= 5 && elapsed < 900000) {
        throw new TooManyAttemptsError(Math.ceil((900000 - elapsed) / 1000));
      }
      if (elapsed >= 900000) {
        this.loginAttempts.delete(identifier);
      }
    }
  }

  private recordFailedAttempt(identifier: string): void {
    const record = this.loginAttempts.get(identifier) ?? { count: 0, lastAttempt: 0 };
    record.count++;
    record.lastAttempt = Date.now();
    this.loginAttempts.set(identifier, record);
  }
}
