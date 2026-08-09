import { CategoryStatus } from '@oceanfresh/shared';
import { supabaseService } from '@oceanfresh/supabase';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SupabaseCategoryRepository } from '../repository/supabase-category.repository.js';

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

const categoryRow = {
  id: 'a0000000-0000-0000-0000-000000000001',
  name: 'Fresh Fish',
  slug: 'fresh-fish',
  status: CategoryStatus.ACTIVE,
  is_deleted: false,
  sort_order: 1,
};

describe('SupabaseCategoryRepository', () => {
  let repository: SupabaseCategoryRepository;

  beforeEach(() => {
    vi.resetAllMocks();
    repository = new SupabaseCategoryRepository();
  });

  describe('findAll', () => {
    it('returns active, non-deleted categories ordered by sort_order', async () => {
      vi.mocked(supabaseService.query).mockResolvedValue([categoryRow] as never);

      const categories = await repository.findAll();

      expect(categories).toHaveLength(1);
      expect(categories[0]?.slug).toBe('fresh-fish');
      expect(supabaseService.query).toHaveBeenCalledWith(
        'categories',
        [{ field: 'is_deleted', operator: 'eq', value: false }],
        { orderByField: 'sort_order', orderDirection: 'asc' },
      );
    });

    it('applies a status filter when provided', async () => {
      vi.mocked(supabaseService.query).mockResolvedValue([] as never);

      await repository.findAll({ status: CategoryStatus.ACTIVE });

      expect(supabaseService.query).toHaveBeenCalledWith(
        'categories',
        expect.arrayContaining([{ field: 'status', operator: 'eq', value: 'ACTIVE' }]),
        expect.anything(),
      );
    });

    it('wraps supabase errors in RepositoryError', async () => {
      vi.mocked(supabaseService.query).mockRejectedValue(new Error('boom'));

      await expect(repository.findAll()).rejects.toThrow('Failed to query categories');
    });
  });

  describe('findById', () => {
    it('returns a category when found', async () => {
      vi.mocked(supabaseService.get).mockResolvedValue(categoryRow as never);

      const category = await repository.findById(categoryRow.id);

      expect(category?.name).toBe('Fresh Fish');
      expect(supabaseService.get).toHaveBeenCalledWith('categories', categoryRow.id);
    });

    it('returns null when not found', async () => {
      vi.mocked(supabaseService.get).mockResolvedValue(null);

      await expect(repository.findById('missing')).resolves.toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('returns a category when found', async () => {
      vi.mocked(supabaseService.query).mockResolvedValue([categoryRow] as never);

      const category = await repository.findBySlug('fresh-fish');

      expect(category?.id).toBe(categoryRow.id);
      expect(supabaseService.query).toHaveBeenCalledWith(
        'categories',
        expect.arrayContaining([{ field: 'slug', operator: 'eq', value: 'fresh-fish' }]),
      );
    });

    it('returns null when no category matches', async () => {
      vi.mocked(supabaseService.query).mockResolvedValue([] as never);

      await expect(repository.findBySlug('nope')).resolves.toBeNull();
    });
  });
});
