import { randomUUID } from 'crypto';

import { Session, SessionStatus } from '../entities/session.entity.js';
import { DeviceInfo, type DeviceInfoData } from '../value-objects/device-info.js';
import { RefreshToken } from '../value-objects/refresh-token.js';
import { SessionToken } from '../value-objects/session-token.js';

export interface CreateSessionData {
  userId: string;
  deviceInfo: DeviceInfoData;
  expiresInMinutes?: number;
}

export const SessionFactory = {
  create(data: CreateSessionData): Session {
    const expiresInMinutes = data.expiresInMinutes ?? 60;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInMinutes * 60 * 1000);

    return new Session({
      id: randomUUID(),
      userId: data.userId,
      token: SessionToken.generate(),
      refreshToken: RefreshToken.generate(),
      deviceInfo: DeviceInfo.create(data.deviceInfo),
      expiresAt,
      lastActivityAt: now,
      status: SessionStatus.ACTIVE,
    });
  },
};
