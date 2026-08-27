import { ProductStatus } from '@oceanfresh/shared';
import { supabaseService } from '@oceanfresh/supabase';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SupabaseProductRepository } from '../repository/supabase-product.repository.js';

vi.mock('@oceanfresh/supabase', async (importOriginal) => {
  const mod = await importOriginal<typeof supabaseService>();
  return {
    ...mod,
    supabaseService: {
      get: vi.fn(),
      query: vi.fn(),
      count: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      upsert: vi.fn(),
    },
  };
});

describe('SupabaseProductRepository — permission contract', () => {
  let repository: SupabaseProductRepository;

  beforeEach(() => {
    vi.resetAllMocks();
    repository = new SupabaseProductRepository();
  });

  it('findAll with ACTIVE status executes query without permission error', async () => {
    vi.mocked(supabaseService.query).mockResolvedValue([
      {
        id: 'test-id',
        name: 'Test Product',
        slug: 'test-product',
        description: 'Desc',
        price: 100,
        category_id: 'cat-1',
        status: ProductStatus.ACTIVE,
        featured: false,
        stock: 10,
        unit: 'KG',
        thumbnail: '',
        gallery: [],
        tags: [],
        search_keywords: [],
        seo: null,
        metadata: {},
        version: 1,
        sort_order: 0,
        warehouse_id: null,
        variants: null,
        min_order_quantity: 1,
        created_by: 'user-1',
        updated_by: null,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      },
    ] as Record<string, unknown>[]);
    vi.mocked(supabaseService.count).mockResolvedValue(1);

    const result = await repository.findAll({ status: ProductStatus.ACTIVE, limit: 10 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('Test Product');
    expect(supabaseService.query).toHaveBeenCalledWith(
      'products',
      expect.arrayContaining([
        expect.objectContaining({ field: 'is_deleted', operator: 'eq', value: false }),
        expect.objectContaining({ field: 'status', operator: 'eq', value: ProductStatus.ACTIVE }),
      ]),
      expect.any(Object),
    );
  });

  it('findBySlug filters is_deleted=false', async () => {
    vi.mocked(supabaseService.query).mockResolvedValue([
      { id: '1', name: 'Test', slug: 'test', is_deleted: false, status: ProductStatus.ACTIVE },
    ] as Record<string, unknown>[]);

    const result = await repository.findBySlug('test');

    expect(result).not.toBeNull();
    expect(supabaseService.query).toHaveBeenCalledWith(
      'products',
      expect.arrayContaining([
        expect.objectContaining({ field: 'slug', operator: 'eq', value: 'test' }),
        expect.objectContaining({ field: 'is_deleted', operator: 'eq', value: false }),
      ]),
      expect.objectContaining({ limitCount: 1 }),
    );
  });

  it('findById returns null for soft-deleted product', async () => {
    vi.mocked(supabaseService.get).mockResolvedValue({
      id: '1',
      name: 'Deleted',
      is_deleted: true,
      status: ProductStatus.ARCHIVED,
    } as Record<string, unknown>);

    const result = await repository.findById('1');
    expect(result).toBeNull();
  });
});
