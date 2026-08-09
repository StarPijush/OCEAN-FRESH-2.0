import { Entity } from '@oceanfresh/shared/domain';

import type { DeviceInfo } from '../value-objects/device-info.js';
import type { RefreshToken } from '../value-objects/refresh-token.js';
import type { SessionToken } from '../value-objects/session-token.js';

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

export interface SessionData {
  id: string;
  userId: string;
  token: SessionToken;
  refreshToken: RefreshToken;
  deviceInfo: DeviceInfo;
  expiresAt: Date;
  lastActivityAt: Date;
  status: SessionStatus;
}

export class Session extends Entity<string> {
  private _userId: string;
  private _token: SessionToken;
  private _refreshToken: RefreshToken;
  private _deviceInfo: DeviceInfo;
  private _expiresAt: Date;
  private _lastActivityAt: Date;
  private _status: SessionStatus;

  constructor(data: SessionData) {
    super(data.id);
    this._userId = data.userId;
    this._token = data.token;
    this._refreshToken = data.refreshToken;
    this._deviceInfo = data.deviceInfo;
    this._expiresAt = data.expiresAt;
    this._lastActivityAt = data.lastActivityAt;
    this._status = data.status;
  }

  get userId(): string {
    return this._userId;
  }

  get token(): SessionToken {
    return this._token;
  }

  get refreshToken(): RefreshToken {
    return this._refreshToken;
  }

  get deviceInfo(): DeviceInfo {
    return this._deviceInfo;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get lastActivityAt(): Date {
    return this._lastActivityAt;
  }

  get status(): SessionStatus {
    return this._status;
  }

  isExpired(): boolean {
    return new Date() >= this._expiresAt;
  }

  isRevoked(): boolean {
    return this._status === SessionStatus.REVOKED;
  }

  revoke(): void {
    this._status = SessionStatus.REVOKED;
  }

  touch(): void {
    this._lastActivityAt = new Date();
  }

  toJSON(): SessionData {
    return {
      id: this._id,
      userId: this._userId,
      token: this._token,
      refreshToken: this._refreshToken,
      deviceInfo: this._deviceInfo,
      expiresAt: this._expiresAt,
      lastActivityAt: this._lastActivityAt,
      status: this._status,
    };
  }
}
