import { Entity } from './entity.js';

export abstract class AggregateRoot<TId = string> extends Entity<TId> {
  private _domainEvents: DomainEvent[] = [];

  public addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public clearDomainEvents(): void {
    this._domainEvents = [];
  }

  public pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this.clearDomainEvents();
    return events;
  }

  public hasDomainEvents(): boolean {
    return this._domainEvents.length > 0;
  }
}

export interface DomainEvent {
  readonly eventName: string;
  readonly aggregateId: string;
  readonly occurredOn: Date;
}
