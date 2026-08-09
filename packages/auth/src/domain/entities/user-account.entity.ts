import { AggregateRoot, type Email } from '@oceanfresh/shared/domain';

import { AccountLockedEvent } from '../events/account-locked.event.js';
import { AccountUnlockedEvent } from '../events/account-unlocked.event.js';

export enum UserAccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  LOCKED = 'LOCKED',
  DELETED = 'DELETED',
}

export interface UserAccountData {
  id: string;
  email: Email;
  displayName: string;
  mfaEnabled: boolean;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  lastLoginAt: Date | null;
  roles: string[];
  permissions: string[];
  status: UserAccountStatus;
}

export class UserAccount extends AggregateRoot<string> {
  private _email: Email;
  private _displayName: string;
  private _mfaEnabled: boolean;
  private _failedLoginAttempts: number;
  private _lockedUntil: Date | null;
  private _lastLoginAt: Date | null;
  private _roles: string[];
  private _permissions: string[];
  private _status: UserAccountStatus;

  constructor(data: UserAccountData) {
    super(data.id);
    this._email = data.email;
    this._displayName = data.displayName;
    this._mfaEnabled = data.mfaEnabled;
    this._failedLoginAttempts = data.failedLoginAttempts;
    this._lockedUntil = data.lockedUntil;
    this._lastLoginAt = data.lastLoginAt;
    this._roles = [...data.roles];
    this._permissions = [...data.permissions];
    this._status = data.status;
  }

  get email(): Email {
    return this._email;
  }

  get displayName(): string {
    return this._displayName;
  }

  get mfaEnabled(): boolean {
    return this._mfaEnabled;
  }

  get failedLoginAttempts(): number {
    return this._failedLoginAttempts;
  }

  get lockedUntil(): Date | null {
    return this._lockedUntil;
  }

  get lastLoginAt(): Date | null {
    return this._lastLoginAt;
  }

  get roles(): string[] {
    return [...this._roles];
  }

  get permissions(): string[] {
    return [...this._permissions];
  }

  get status(): UserAccountStatus {
    return this._status;
  }

  lock(until: Date): void {
    this._status = UserAccountStatus.LOCKED;
    this._lockedUntil = until;
    this.addDomainEvent(new AccountLockedEvent(this._id, until));
  }

  unlock(): void {
    this._status = UserAccountStatus.ACTIVE;
    this._lockedUntil = null;
    this._failedLoginAttempts = 0;
    this.addDomainEvent(new AccountUnlockedEvent(this._id));
  }

  incrementFailedAttempts(): void {
    this._failedLoginAttempts += 1;
  }

  resetFailedAttempts(): void {
    this._failedLoginAttempts = 0;
  }

  isLocked(): boolean {
    if (this._status !== UserAccountStatus.LOCKED) {
      return false;
    }
    if (this._lockedUntil && new Date() >= this._lockedUntil) {
      return false;
    }
    return true;
  }

  enableMfa(): void {
    this._mfaEnabled = true;
  }

  disableMfa(): void {
    this._mfaEnabled = false;
  }

  toJSON(): UserAccountData {
    return {
      id: this._id,
      email: this._email,
      displayName: this._displayName,
      mfaEnabled: this._mfaEnabled,
      failedLoginAttempts: this._failedLoginAttempts,
      lockedUntil: this._lockedUntil,
      lastLoginAt: this._lastLoginAt,
      roles: [...this._roles],
      permissions: [...this._permissions],
      status: this._status,
    };
  }
}
