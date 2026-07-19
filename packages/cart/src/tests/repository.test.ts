import { beforeEach, describe, expect, it, vi } from 'vitest';

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
    static now() {
      return new MockTimestamp(1000, 0);
    }
    static fromMillis(ms: number) {
      return new MockTimestamp(Math.floor(ms / 1000), 0);
    }
  }
  return { Timestamp: MockTimestamp };
});

import { firestoreService } from '@oceanfresh/firebase';
import { type Cart, CartSource, CartStatus } from '@oceanfresh/shared';

import { FirestoreCartRepository } from '../repository/firestore-cart.repository.js';

describe('FirestoreCartRepository', () => {
  let repo: FirestoreCartRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new FirestoreCartRepository();
  });

  it('findById returns null when document not found', async () => {
    vi.mocked(firestoreService.get).mockResolvedValue(null);
    const result = await repo.findById('missing');
    expect(result).toBeNull();
  });

  it('findById returns cart when document exists', async () => {
    vi.mocked(firestoreService.get).mockResolvedValue({
      id: 'cart-1',
      userId: 'user-1',
      status: CartStatus.ACTIVE,
    });
    const result = await repo.findById('cart-1');
    expect(result).not.toBeNull();
    expect((result as Cart).id).toBe('cart-1');
  });

  it('findBySessionId returns cart', async () => {
    vi.mocked(firestoreService.query).mockResolvedValue([
      { id: 'cart-1', sessionId: 'sess-1', status: CartStatus.ACTIVE },
    ]);
    const result = await repo.findBySessionId('sess-1');
    expect(result).not.toBeNull();
    expect((result as Cart).id).toBe('cart-1');
  });

  it('findBySessionId returns null when no results', async () => {
    vi.mocked(firestoreService.query).mockResolvedValue([]);
    const result = await repo.findBySessionId('sess-1');
    expect(result).toBeNull();
  });

  it('findByUserOrSession tries userId first', async () => {
    vi.mocked(firestoreService.query).mockResolvedValue([
      { id: 'cart-1', userId: 'user-1', status: CartStatus.ACTIVE },
    ]);
    const result = await repo.findByUserOrSession('user-1', 'sess-1');
    expect(result).not.toBeNull();
    expect((result as Cart).id).toBe('cart-1');
  });

  it('create persists a new cart', async () => {
    vi.mocked(firestoreService.add).mockResolvedValue({ id: 'new-cart' });
    const result = await repo.create({
      userId: 'user-1',
      sessionId: null,
      source: CartSource.AUTHENTICATED,
    });
    expect(result.id).toBe('new-cart');
    expect(result.status).toBe(CartStatus.ACTIVE);
    expect(result.source).toBe(CartSource.AUTHENTICATED);
  });

  it('clearItems removes all items', async () => {
    vi.mocked(firestoreService.get).mockResolvedValueOnce({
      id: 'cart-1',
      items: [{ id: 'item-1', productId: 'p1' }] as Array<Record<string, unknown>>,
    });
    vi.mocked(firestoreService.update).mockResolvedValue(undefined);
    vi.mocked(firestoreService.get).mockResolvedValueOnce({ id: 'cart-1', items: [] } as Record<
      string,
      unknown
    >);

    const result = await repo.clearItems('cart-1');
    expect(result.items).toEqual([]);
  });

  it('delete throws NotFoundError for missing cart', async () => {
    vi.mocked(firestoreService.get).mockResolvedValue(null);
    await expect(repo.delete('missing')).rejects.toThrow();
  });
});
