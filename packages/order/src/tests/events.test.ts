import { describe, it, expect, vi } from 'vitest';
import { InMemoryEventBus } from '../events/in-memory-event-bus.js';
import { OrderEventType } from '@oceanfresh/shared';

describe('InMemoryEventBus', () => {
  it('publishes event to subscribed handlers', async () => {
    const bus = new InMemoryEventBus();
    const handler = vi.fn();

    bus.subscribe(OrderEventType.CREATED, handler);
    await bus.publish({ type: OrderEventType.CREATED, orderId: '1' });

    expect(handler).toHaveBeenCalledWith({
      type: OrderEventType.CREATED,
      orderId: '1',
    });
  });

  it('does not call handlers for unsubscribed event types', async () => {
    const bus = new InMemoryEventBus();
    const handler = vi.fn();

    bus.subscribe(OrderEventType.CREATED, handler);
    await bus.publish({ type: OrderEventType.DELIVERED, orderId: '1' });

    expect(handler).not.toHaveBeenCalled();
  });

  it('unsubscribes handlers', async () => {
    const bus = new InMemoryEventBus();
    const handler = vi.fn();

    const unsubscribe = bus.subscribe(OrderEventType.CREATED, handler);
    unsubscribe();
    await bus.publish({ type: OrderEventType.CREATED, orderId: '1' });

    expect(handler).not.toHaveBeenCalled();
  });

  it('supports multiple handlers for the same event type', async () => {
    const bus = new InMemoryEventBus();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    bus.subscribe(OrderEventType.CREATED, handler1);
    bus.subscribe(OrderEventType.CREATED, handler2);
    await bus.publish({ type: OrderEventType.CREATED, orderId: '1' });

    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).toHaveBeenCalledOnce();
  });

  it('clears all handlers', async () => {
    const bus = new InMemoryEventBus();
    const handler = vi.fn();

    bus.subscribe(OrderEventType.CREATED, handler);
    bus.clear();
    await bus.publish({ type: OrderEventType.CREATED, orderId: '1' });

    expect(handler).not.toHaveBeenCalled();
  });
});
