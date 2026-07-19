import { AuthEventType } from '@oceanfresh/shared';
import { describe, expect, it, vi } from 'vitest';

import { InMemoryEventBus } from '../events/in-memory-event-bus.js';

describe('InMemoryEventBus (Auth)', () => {
  it('publishes event to subscribed handlers', async () => {
    const bus = new InMemoryEventBus();
    const handler = vi.fn();

    bus.subscribe(AuthEventType.LOGGED_IN, handler);
    await bus.publish({ type: AuthEventType.LOGGED_IN, userId: '1' });

    expect(handler).toHaveBeenCalledWith({ type: AuthEventType.LOGGED_IN, userId: '1' });
  });

  it('does not call handlers for unsubscribed event types', async () => {
    const bus = new InMemoryEventBus();
    const handler = vi.fn();

    bus.subscribe(AuthEventType.LOGGED_IN, handler);
    await bus.publish({ type: AuthEventType.LOGGED_OUT, userId: '1' });

    expect(handler).not.toHaveBeenCalled();
  });

  it('unsubscribes handlers', async () => {
    const bus = new InMemoryEventBus();
    const handler = vi.fn();

    const unsubscribe = bus.subscribe(AuthEventType.LOGGED_IN, handler);
    unsubscribe();
    await bus.publish({ type: AuthEventType.LOGGED_IN, userId: '1' });

    expect(handler).not.toHaveBeenCalled();
  });

  it('supports multiple handlers for the same event type', async () => {
    const bus = new InMemoryEventBus();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    bus.subscribe(AuthEventType.LOGGED_IN, handler1);
    bus.subscribe(AuthEventType.LOGGED_IN, handler2);
    await bus.publish({ type: AuthEventType.LOGGED_IN, userId: '1' });

    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).toHaveBeenCalledOnce();
  });

  it('clears all handlers', async () => {
    const bus = new InMemoryEventBus();
    const handler = vi.fn();

    bus.subscribe(AuthEventType.LOGGED_IN, handler);
    bus.clear();
    await bus.publish({ type: AuthEventType.LOGGED_IN, userId: '1' });

    expect(handler).not.toHaveBeenCalled();
  });

  it('continues publishing even if one handler throws', async () => {
    const bus = new InMemoryEventBus();
    const throwingHandler = vi.fn().mockRejectedValue(new Error('Handler error'));
    const normalHandler = vi.fn();

    bus.subscribe(AuthEventType.LOGGED_IN, throwingHandler);
    bus.subscribe(AuthEventType.LOGGED_IN, normalHandler);

    await expect(bus.publish({ type: AuthEventType.LOGGED_IN, userId: '1' })).rejects.toThrow();
    expect(normalHandler).toHaveBeenCalled();
  });
});
