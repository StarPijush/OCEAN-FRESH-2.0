import { createLogger, AuthEventType, AuthenticationState, type AuthSession } from '@oceanfresh/shared';
import { AuthStateMachine } from './auth-state-machine.js';
import type { SessionStore } from './session.store.js';
import type { EventBus } from '../events/index.js';
import { DeviceManager } from './device.manager.js';

const logger = createLogger('auth:session:manager');

export interface SessionConfig {
  idleTimeoutMs: number;
  absoluteTimeoutMs: number;
  refreshBeforeExpiryMs: number;
  maxConcurrentSessions: number;
}

const DEFAULT_CONFIG: SessionConfig = {
  idleTimeoutMs: 30 * 60 * 1000,
  absoluteTimeoutMs: 24 * 60 * 60 * 1000,
  refreshBeforeExpiryMs: 5 * 60 * 1000,
  maxConcurrentSessions: 5,
};

export class SessionManager {
  private stateMachine: AuthStateMachine;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private absoluteTimer: ReturnType<typeof setTimeout> | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private config: SessionConfig;
  private activityListeners: (() => void)[] = [];

  constructor(
    private readonly store: SessionStore,
    private readonly eventBus: EventBus,
    private readonly deviceManager: DeviceManager,
    config?: Partial<SessionConfig>,
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.stateMachine = new AuthStateMachine();
    this.setupActivityTracking();
  }

  get state(): AuthenticationState {
    return this.stateMachine.currentState;
  }

  getSession(): AuthSession | null {
    return this.store.getSession();
  }

  async startSession(session: AuthSession): Promise<void> {
    logger.info('startSession', { userId: session.userId });
    this.store.setSession(session);
    if (this.stateMachine.currentState === AuthenticationState.UNAUTHENTICATED) {
      this.stateMachine.transition(AuthenticationState.AUTHENTICATING);
    }
    this.stateMachine.transition(AuthenticationState.AUTHENTICATED);
    this.scheduleTimers();
    this.setupCrossTabSync();
  }

  async endSession(): Promise<void> {
    logger.info('endSession');
    this.store.clearSession();
    this.stateMachine.transition(AuthenticationState.UNAUTHENTICATED);
    this.clearTimers();
  }

  async refreshSession(): Promise<void> {
    logger.debug('refreshSession');
    const session = this.store.getSession();
    if (!session) return;
    const now = Date.now();
    session.lastActivityAt = now;
    session.tokenPair.accessTokenExpiresAt = now + 3600000;
    this.store.updateSession({ lastActivityAt: now });
    await this.eventBus.publish({
      type: AuthEventType.SESSION_REFRESHED,
      userId: session.userId,
      metadata: { source: 'SessionManager' },
    });
    this.scheduleRefreshTimer();
  }

  async validateSession(): Promise<boolean> {
    const session = this.store.getSession();
    if (!session) return false;
    const now = Date.now();
    if (session.isRevoked) {
      this.stateMachine.transition(AuthenticationState.SESSION_EXPIRED);
      return false;
    }
    if (now >= session.absoluteExpiresAt) {
      this.stateMachine.transition(AuthenticationState.SESSION_EXPIRED);
      return false;
    }
    if (now >= session.expiresAt) {
      await this.refreshSession();
    }
    return true;
  }

  async extendSession(): Promise<void> {
    logger.debug('extendSession');
    const session = this.store.getSession();
    if (!session) return;
    const now = Date.now();
    session.lastActivityAt = now;
    session.expiresAt = now + this.config.idleTimeoutMs;
    this.store.updateSession({ lastActivityAt: now, expiresAt: session.expiresAt });
    this.scheduleIdleTimer();
  }

  async handleSessionExpired(): Promise<void> {
    logger.info('handleSessionExpired');
    const session = this.store.getSession();
    if (session) {
      await this.eventBus.publish({
        type: AuthEventType.SESSION_EXPIRED,
        userId: session.userId,
        metadata: { source: 'SessionManager' },
      });
    }
    this.stateMachine.transition(AuthenticationState.SESSION_EXPIRED);
  }

  onStateTransition(callback: (state: AuthenticationState, prev: AuthenticationState) => void): () => void {
    return this.stateMachine.onTransition(callback);
  }

  private scheduleTimers(): void {
    this.scheduleIdleTimer();
    this.scheduleAbsoluteTimer();
    this.scheduleRefreshTimer();
  }

  private scheduleIdleTimer(): void {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => { this.handleSessionExpired(); }, this.config.idleTimeoutMs);
  }

  private scheduleAbsoluteTimer(): void {
    if (this.absoluteTimer) clearTimeout(this.absoluteTimer);
    this.absoluteTimer = setTimeout(() => { this.handleSessionExpired(); }, this.config.absoluteTimeoutMs);
  }

  private scheduleRefreshTimer(): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => { this.refreshSession(); }, this.config.refreshBeforeExpiryMs);
  }

  private clearTimers(): void {
    if (this.idleTimer) { clearTimeout(this.idleTimer); this.idleTimer = null; }
    if (this.absoluteTimer) { clearTimeout(this.absoluteTimer); this.absoluteTimer = null; }
    if (this.refreshTimer) { clearTimeout(this.refreshTimer); this.refreshTimer = null; }
  }

  private setupActivityTracking(): void {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    const handler = () => this.extendSession();
    for (const event of events) {
      window.addEventListener(event, handler);
    }
    this.activityListeners.push(() => {
      for (const event of events) {
        window.removeEventListener(event, handler);
      }
    });
  }

  private setupCrossTabSync(): void {
    try {
      const channel = new BroadcastChannel('oceanfresh:auth');
      channel.onmessage = (event) => {
        if (event.data?.type === 'LOGOUT') {
          this.endSession();
        }
      };
    } catch {
      logger.debug('BroadcastChannel not supported');
    }
  }

  destroy(): void {
    this.clearTimers();
    for (const cleanup of this.activityListeners) {
      cleanup();
    }
    this.activityListeners = [];
    this.store.clearSession();
  }
}
