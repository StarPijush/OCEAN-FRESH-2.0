import { createLogger } from '../logger/index.js';
import type { EventBus } from './event-bus.js';

type Handler<T> = (event: T) => void;

export class InMemoryEventBus<
  TEvent extends { type: string },
  TEventType extends string = TEvent['type'],
> implements EventBus<TEvent, TEventType> {
  private handlers = new Map<string, Set<Handler<TEvent>>>();
  private isPublishing = false;

  constructor(private readonly loggerName: string = 'events') {}

  private get logger() {
    return createLogger(this.loggerName);
  }

  async publish(event: TEvent): Promise<void> {
    const type = event.type;
    const handlers = this.handlers.get(type);
    if (!handlers || handlers.size === 0) return;

    this.isPublishing = true;
    const errors: Error[] = [];

    for (const handler of handlers) {
      try {
        await Promise.resolve(handler(event));
      } catch (err) {
        errors.push(err as Error);
        this.logger.error(`Event handler failed for ${type}`, { error: err });
      }
    }

    this.isPublishing = false;

    if (errors.length > 0) {
      throw new AggregateError(
        errors,
        `Failed to publish event ${type}: ${errors.length} handler(s) failed`,
      );
    }
  }

  subscribe(eventType: TEventType, handler: Handler<TEvent>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    (this.handlers.get(eventType) as Set<Handler<TEvent>>).add(handler);
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  clear(): void {
    this.handlers.clear();
  }
}
