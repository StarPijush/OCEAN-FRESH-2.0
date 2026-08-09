import type { DomainEvent } from '@oceanfresh/shared/domain';

export class MfaDisabledEvent implements DomainEvent {
  public readonly eventName = 'auth.mfa.disabled';
  public readonly occurredOn: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly timestamp: Date,
  ) {
    this.occurredOn = timestamp;
  }
}
