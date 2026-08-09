import type { DomainEvent } from '@oceanfresh/shared/domain';

export class UserLoggedOutEvent implements DomainEvent {
  public readonly eventName = 'auth.user.logged_out';
  public readonly occurredOn: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly timestamp: Date,
  ) {
    this.occurredOn = timestamp;
  }
}
