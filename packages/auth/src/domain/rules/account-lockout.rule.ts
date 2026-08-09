import { CompositeSpecification } from '@oceanfresh/shared/domain';

import type { UserAccount } from '../entities/user-account.entity.js';

const MAX_FAILED_ATTEMPTS = 5;

export class AccountLockoutRule extends CompositeSpecification<UserAccount> {
  public readonly message = 'Account locked after 5 failed attempts';

  isSatisfiedBy(candidate: UserAccount): boolean {
    return candidate.failedLoginAttempts >= MAX_FAILED_ATTEMPTS;
  }
}
