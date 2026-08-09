import { Email } from '@oceanfresh/shared/domain';

import type { Session } from '../entities/session.entity.js';
import { UserAccount, UserAccountStatus } from '../entities/user-account.entity.js';
import { AccountLockedError } from '../errors/account-locked.error.js';
import { InvalidCredentialsError } from '../errors/invalid-credentials.error.js';
import type { DeviceInfoData } from '../value-objects/device-info.js';
import type { SessionManagementService } from './session-management.service.js';

// NOTE: Credential verification is delegated to Supabase Auth (see
// SupabaseAuthProvider). This domain scaffold only manages account lifecycle
// state and NEVER stores or compares passwords.

export class AuthenticationService {
  constructor(private readonly sessionManagementService: SessionManagementService) {}

  login(
    account: UserAccount,
    deviceInfoData: DeviceInfoData,
  ): { account: UserAccount; session: Session } {
    if (account.status === UserAccountStatus.DELETED) {
      throw new InvalidCredentialsError();
    }

    if (account.isLocked()) {
      throw new AccountLockedError(account.lockedUntil as Date);
    }

    account.resetFailedAttempts();

    const session = this.sessionManagementService.createSession(account.id, deviceInfoData);

    account['_lastLoginAt'] = new Date();

    return { account, session };
  }

  register(email: string, displayName: string): UserAccount {
    const emailVo = Email.create(email);

    return new UserAccount({
      id: crypto.randomUUID(),
      email: emailVo,
      displayName,
      mfaEnabled: false,
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: null,
      roles: [],
      permissions: [],
      status: UserAccountStatus.ACTIVE,
    });
  }

  logout(session: Session): void {
    session.revoke();
  }
}
