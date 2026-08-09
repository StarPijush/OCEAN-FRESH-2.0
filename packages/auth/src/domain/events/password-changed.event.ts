import type { DomainEvent } from '@oceanfresh/shared/domain';

export class PasswordChangedEvent implements DomainEvent {
  public readonly eventName = 'auth.password.changed';
  public readonly occurredOn: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly timestamp: Date,
  ) {
    this.occurredOn = timestamp;
  }
}
