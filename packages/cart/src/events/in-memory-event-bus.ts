import { createLogger, CartEventType } from '@oceanfresh/shared';
import type { EventBus, CartEvent } from './cart-event.types.js';

const logger = createLogger('cart:events');

type Handler = (event: CartEvent) => void;

export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, Set<Handler>>();
  private isPublishing = false;

  async publish(event: CartEvent): Promise<void> {
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
        logger.error(`Event handler failed for ${type}`, { error: err, cartId: event.cartId });
      }
    }

    this.isPublishing = false;

    if (errors.length > 0) {
      throw new AggregateError(errors, `Failed to publish event ${type}: ${errors.length} handler(s) failed`);
    }
  }

  subscribe(eventType: CartEventType, handler: Handler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  clear(): void {
    this.handlers.clear();
  }
}
