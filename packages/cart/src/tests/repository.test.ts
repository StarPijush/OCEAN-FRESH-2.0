import { type Cart, CartSource, CartStatus } from '@oceanfresh/shared';
import { supabaseService } from '@oceanfresh/supabase';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SupabaseCartRepository } from '../repository/supabase-cart.repository.js';

vi.mock('@oceanfresh/supabase', async (importOriginal) => {
  const mod = await importOriginal<typeof supabaseService>();
  return {
    ...mod,
    supabaseService: {
      get: vi.fn(),
      query: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      upsert: vi.fn(),
    },
  };
});

describe('SupabaseCartRepository', () => {
  let repo: SupabaseCartRepository;

  beforeEach(() => {
    vi.resetAllMocks();
    repo = new SupabaseCartRepository();
  });

  it('findById returns null when document not found', async () => {
    vi.mocked(supabaseService.get).mockResolvedValue(null);
    const result = await repo.findById('missing');
    expect(result).toBeNull();
  });

  it('findById returns cart when document exists', async () => {
    vi.mocked(supabaseService.get).mockResolvedValue({
      id: 'cart-1',
      userId: 'user-1',
      status: CartStatus.ACTIVE,
    });
    vi.mocked(supabaseService.query).mockResolvedValue([]);
    const result = await repo.findById('cart-1');
    expect(result).not.toBeNull();
    expect((result as Cart).id).toBe('cart-1');
  });

  it('findBySessionId returns cart', async () => {
    vi.mocked(supabaseService.query).mockResolvedValue([
      { id: 'cart-1', sessionId: 'sess-1', status: CartStatus.ACTIVE },
    ]);
    vi.mocked(supabaseService.get).mockResolvedValue({
      id: 'cart-1',
      sessionId: 'sess-1',
      status: CartStatus.ACTIVE,
    });
    const result = await repo.findBySessionId('sess-1');
    expect(result).not.toBeNull();
    expect((result as Cart).id).toBe('cart-1');
  });

  it('findBySessionId returns null when no results', async () => {
    vi.mocked(supabaseService.query).mockResolvedValue([]);
    const result = await repo.findBySessionId('sess-1');
    expect(result).toBeNull();
  });

  it('findByUserOrSession tries userId first', async () => {
    vi.mocked(supabaseService.query).mockResolvedValue([
      { id: 'cart-1', userId: 'user-1', status: CartStatus.ACTIVE },
    ]);
    vi.mocked(supabaseService.get).mockResolvedValue({
      id: 'cart-1',
      userId: 'user-1',
      status: CartStatus.ACTIVE,
    });
    const result = await repo.findByUserOrSession('user-1', 'sess-1');
    expect(result).not.toBeNull();
    expect((result as Cart).id).toBe('cart-1');
  });

  it('create persists a new cart', async () => {
    vi.mocked(supabaseService.add).mockResolvedValue({ id: 'new-cart' });
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
    vi.mocked(supabaseService.get).mockResolvedValueOnce({
      id: 'cart-1',
      items: [{ id: 'item-1', productId: 'p1' }] as Array<Record<string, unknown>>,
    });
    vi.mocked(supabaseService.query).mockResolvedValue([]);
    vi.mocked(supabaseService.update).mockResolvedValue(undefined);
    vi.mocked(supabaseService.get).mockResolvedValueOnce({ id: 'cart-1', items: [] } as Record<
      string,
      unknown
    >);

    const result = await repo.clearItems('cart-1');
    expect(result.items).toEqual([]);
  });

  it('delete throws NotFoundError for missing cart', async () => {
    vi.mocked(supabaseService.get).mockResolvedValue(null);
    await expect(repo.delete('missing')).rejects.toThrow();
  });
});
