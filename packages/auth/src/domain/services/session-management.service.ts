import { randomUUID } from 'crypto';

import { Session, SessionStatus } from '../entities/session.entity.js';
import { SessionExpiredError } from '../errors/session-expired.error.js';
import { SessionExpiryRule } from '../rules/session-expiry.rule.js';
import { DeviceInfo, type DeviceInfoData } from '../value-objects/device-info.js';
import { RefreshToken } from '../value-objects/refresh-token.js';
import { SessionToken } from '../value-objects/session-token.js';

export class SessionManagementService {
  private readonly SESSION_DURATION_MINUTES = 60;
  private readonly REFRESH_DURATION_MINUTES = 1440;

  createSession(userId: string, deviceInfoData: DeviceInfoData): Session {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.SESSION_DURATION_MINUTES * 60 * 1000);

    return new Session({
      id: randomUUID(),
      userId,
      token: SessionToken.generate(),
      refreshToken: RefreshToken.generate(),
      deviceInfo: DeviceInfo.create(deviceInfoData),
      expiresAt,
      lastActivityAt: now,
      status: SessionStatus.ACTIVE,
    });
  }

  refreshSession(_refreshToken: RefreshToken): Session {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.SESSION_DURATION_MINUTES * 60 * 1000);

    return new Session({
      id: randomUUID(),
      userId: '',
      token: SessionToken.generate(),
      refreshToken: RefreshToken.generate(),
      deviceInfo: DeviceInfo.create({ userAgent: '', ipAddress: '', deviceType: '' }),
      expiresAt,
      lastActivityAt: now,
      status: SessionStatus.ACTIVE,
    });
  }

  revokeSession(_token: SessionToken): void {}

  validateSession(session: Session): Session {
    const expiryRule = new SessionExpiryRule();
    if (!expiryRule.isSatisfiedBy(session)) {
      throw new SessionExpiredError();
    }
    return session;
  }
}
