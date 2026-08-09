import type { DomainEvent } from '@oceanfresh/shared/domain';

export class AccountLockedEvent implements DomainEvent {
  public readonly eventName = 'auth.account.locked';
  public readonly occurredOn: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly lockedUntil: Date,
  ) {
    this.occurredOn = new Date();
  }
}
