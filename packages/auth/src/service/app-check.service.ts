import { AuthEventType, createLogger } from '@oceanfresh/shared';

import type { EventBus } from '../events/index.js';

const logger = createLogger('auth:service:app-check');

export class AppCheckService {
  private initialized = false;

  constructor(private readonly eventBus: EventBus) {}

  async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      const { initializeAppCheck, ReCaptchaV3Provider } = await import('firebase/app-check');
      const { getApp } = await import('@oceanfresh/firebase');
      const app = getApp();
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider('6LcT0ZEqAAAAAArruCOC4BMURsLgnBGPuDq7AgcF'),
        isTokenAutoRefreshEnabled: true,
      });
      this.initialized = true;
      logger.info('App Check initialized');
    } catch (err) {
      logger.error('Failed to initialize App Check', err);
    }
  }

  async getAppCheckToken(): Promise<string | null> {
    try {
      const { getToken } = await import('firebase/app-check');
      const { getApp } = await import('@oceanfresh/firebase');
      const app = getApp();
      const tokenResult = await getToken(app, false);
      return tokenResult.token;
    } catch (err) {
      logger.error('Failed to get App Check token', err);
      await this.eventBus.publish({
        type: AuthEventType.APP_CHECK_FAILED,
        userId: '',
        data: { error: (err as Error).message },
        metadata: { source: 'AppCheckService' },
      });
      return null;
    }
  }
}
