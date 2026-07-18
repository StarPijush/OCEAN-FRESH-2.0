import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@oceanfresh/firebase', () => ({
  firestoreService: {
    get: vi.fn(),
    query: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('firebase/firestore', () => {
  class MockTimestamp {
    seconds: number;
    nanoseconds: number;
    constructor(seconds: number, nanoseconds: number) {
      this.seconds = seconds;
      this.nanoseconds = nanoseconds;
    }
    static now() { return new MockTimestamp(1000, 0); }
    static fromMillis(ms: number) { return new MockTimestamp(Math.floor(ms / 1000), 0); }
  }
  return { Timestamp: MockTimestamp };
});

import { firestoreService } from '@oceanfresh/firebase';
import { FirestoreCartRepository } from '../repository/firestore-cart.repository.js';
import { CartStatus, CartSource, NotFoundError } from '@oceanfresh/shared';

describe('FirestoreCartRepository', () => {
  let repo: FirestoreCartRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new FirestoreCartRepository();
  });

  it('findById returns null when document not found', async () => {
    (firestoreService.get as any).mockResolvedValue(null);
    const result = await repo.findById('missing');
    expect(result).toBeNull();
  });

  it('findById returns cart when document exists', async () => {
    (firestoreService.get as any).mockResolvedValue({ id: 'cart-1', userId: 'user-1', status: CartStatus.ACTIVE });
    const result = await repo.findById('cart-1');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('cart-1');
  });

  it('findBySessionId returns cart', async () => {
    (firestoreService.query as any).mockResolvedValue([{ id: 'cart-1', sessionId: 'sess-1', status: CartStatus.ACTIVE }]);
    const result = await repo.findBySessionId('sess-1');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('cart-1');
  });

  it('findBySessionId returns null when no results', async () => {
    (firestoreService.query as any).mockResolvedValue([]);
    const result = await repo.findBySessionId('sess-1');
    expect(result).toBeNull();
  });

  it('findByUserOrSession tries userId first', async () => {
    (firestoreService.query as any).mockResolvedValue([{ id: 'cart-1', userId: 'user-1', status: CartStatus.ACTIVE }]);
    const result = await repo.findByUserOrSession('user-1', 'sess-1');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('cart-1');
  });

  it('create persists a new cart', async () => {
    (firestoreService.add as any).mockResolvedValue({ id: 'new-cart' });
    const result = await repo.create({ userId: 'user-1', sessionId: null, source: CartSource.AUTHENTICATED });
    expect(result.id).toBe('new-cart');
    expect(result.status).toBe(CartStatus.ACTIVE);
    expect(result.source).toBe(CartSource.AUTHENTICATED);
  });

  it('clearItems removes all items', async () => {
    (firestoreService.get as any).mockResolvedValueOnce({ id: 'cart-1', items: [{ id: 'item-1', productId: 'p1' }] as any });
    (firestoreService.update as any).mockResolvedValue(undefined);
    (firestoreService.get as any).mockResolvedValueOnce({ id: 'cart-1', items: [] } as any);

    const result = await repo.clearItems('cart-1');
    expect(result.items).toEqual([]);
  });

  it('delete throws NotFoundError for missing cart', async () => {
    (firestoreService.get as any).mockResolvedValue(null);
    await expect(repo.delete('missing')).rejects.toThrow();
  });
});
