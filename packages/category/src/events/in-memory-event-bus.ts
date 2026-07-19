import { type CategoryEventType, createLogger } from '@oceanfresh/shared';

import type { CategoryEvent, EventBus } from './category-event.types.js';

const logger = createLogger('category:events');

type Handler = (event: CategoryEvent) => void;

export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, Set<Handler>>();
  private isPublishing = false;

  async publish(event: CategoryEvent): Promise<void> {
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
        logger.error(`Event handler failed for ${type}`, {
          error: err,
          categoryId: event.categoryId,
        });
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

  subscribe(eventType: CategoryEventType, handler: Handler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.add(handler);
    }

    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  clear(): void {
    this.handlers.clear();
  }
}
