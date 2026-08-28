import { describe, expect, it, vi } from 'vitest';

import { withTimeout } from '../hooks/withTimeout.js';

describe('withTimeout', () => {
  it('resolves normally when promise resolves before timeout', async () => {
    const promise = Promise.resolve('ok');
    await expect(withTimeout(promise, 100, 'test.resolve')).resolves.toBe('ok');
  });

  it('rejects normally when original promise rejects before timeout', async () => {
    const error = new Error('original failure');
    const promise = Promise.reject(error);
    await expect(withTimeout(promise, 100, 'test.reject')).rejects.toBe(error);
  });

  it('rejects with TimeoutError when promise never resolves', async () => {
    vi.useFakeTimers();
    const never = new Promise<string>(() => {});
    const timed = withTimeout(never, 50, 'test.timeout');
    const expectation = expect(timed).rejects.toMatchObject({ name: 'TimeoutError' });
    await vi.advanceTimersByTimeAsync(60);
    await expectation;
    vi.useRealTimers();
  });

  it('clears timer after successful resolution', async () => {
    vi.useFakeTimers();
    const spyClear = vi.spyOn(global, 'clearTimeout');
    const promise = Promise.resolve(42);
    await withTimeout(promise, 1000, 'test.cleanup');
    // allow finally microtask to run
    await Promise.resolve();
    expect(spyClear).toHaveBeenCalled();
    spyClear.mockRestore();
    vi.useRealTimers();
  });

  it('clears timer after rejection', async () => {
    vi.useFakeTimers();
    const spyClear = vi.spyOn(global, 'clearTimeout');
    const promise = Promise.reject(new Error('fail'));
    await expect(withTimeout(promise, 1000, 'test.cleanup-reject')).rejects.toThrow('fail');
    expect(spyClear).toHaveBeenCalled();
    spyClear.mockRestore();
    vi.useRealTimers();
  });

  it('preserves label in timeout message', async () => {
    vi.useFakeTimers();
    const never = new Promise<void>(() => {});
    const timed = withTimeout(never, 20, 'auth.getUser');
    const expectation = expect(timed).rejects.toThrow('auth.getUser timed out after 20ms');
    await vi.advanceTimersByTimeAsync(30);
    await expectation;
    vi.useRealTimers();
  });
});
