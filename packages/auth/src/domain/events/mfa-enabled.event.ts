import type { DomainEvent } from '@oceanfresh/shared/domain';

export class MfaEnabledEvent implements DomainEvent {
  public readonly eventName = 'auth.mfa.enabled';
  public readonly occurredOn: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly timestamp: Date,
  ) {
    this.occurredOn = timestamp;
  }
}
