import type { DomainEvent } from '@oceanfresh/shared/domain';

export class UserRegisteredEvent implements DomainEvent {
  public readonly eventName = 'auth.user.registered';
  public readonly occurredOn: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly timestamp: Date,
  ) {
    this.occurredOn = timestamp;
  }
}
