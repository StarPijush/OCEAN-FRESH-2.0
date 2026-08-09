import { CompositeSpecification } from '@oceanfresh/shared/domain';

import type { Session } from '../entities/session.entity.js';

export class SessionExpiryRule extends CompositeSpecification<Session> {
  public readonly message = 'Session is not expired';

  isSatisfiedBy(candidate: Session): boolean {
    return !candidate.isExpired();
  }
}
