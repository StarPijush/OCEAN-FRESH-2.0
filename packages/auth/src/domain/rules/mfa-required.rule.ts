import { CompositeSpecification } from '@oceanfresh/shared/domain';

import type { UserAccount } from '../entities/user-account.entity.js';

export class MfaRequiredRule extends CompositeSpecification<UserAccount> {
  public readonly message = 'MFA is required for admin users';

  isSatisfiedBy(candidate: UserAccount): boolean {
    return candidate.roles.includes('admin');
  }
}
