import { CompositeSpecification } from '@oceanfresh/shared/domain';

const PASSWORD_MAX_AGE_DAYS = 90;

export interface PasswordExpiryCandidate {
  passwordChangedAt: Date;
}

export class PasswordExpiryRule extends CompositeSpecification<PasswordExpiryCandidate> {
  public readonly message = 'Password must be changed within 90 days';

  isSatisfiedBy(candidate: PasswordExpiryCandidate): boolean {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - PASSWORD_MAX_AGE_DAYS);
    return candidate.passwordChangedAt > cutoff;
  }
}
