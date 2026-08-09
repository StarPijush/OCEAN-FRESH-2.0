import type { DomainEvent } from '@oceanfresh/shared/domain';

export class AccountUnlockedEvent implements DomainEvent {
  public readonly eventName = 'auth.account.unlocked';
  public readonly occurredOn: Date;

  constructor(public readonly aggregateId: string) {
    this.occurredOn = new Date();
  }
}
