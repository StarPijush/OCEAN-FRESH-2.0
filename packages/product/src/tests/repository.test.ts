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
      add: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      upsert: vi.fn(),
    },
  };
});

describe('SupabaseProductRepository', () => {
  let repository: SupabaseProductRepository;

  beforeEach(() => {
    vi.resetAllMocks();
    repository = new SupabaseProductRepository();
  });

  describe('findById', () => {
    it('returns product when found', async () => {
      const mockDoc = {
        id: '1',
        name: 'Test Product',
        is_deleted: false,
        status: ProductStatus.ACTIVE,
      };
      vi.mocked(supabaseService.get).mockResolvedValue(mockDoc as Record<string, unknown>);

      const result = await repository.findById('1');
      expect(result).toBeDefined();
      expect(result?.name).toBe('Test Product');
      expect(supabaseService.get).toHaveBeenCalledWith('products', '1');
    });

    it('returns null when not found', async () => {
      vi.mocked(supabaseService.get).mockResolvedValue(null);

      const result = await repository.findById('nonexistent');
      expect(result).toBeNull();
    });

    it('returns null when product is soft-deleted', async () => {
      const mockDoc = {
        id: '1',
        name: 'Deleted Product',
        is_deleted: true,
        status: ProductStatus.ARCHIVED,
      };
      vi.mocked(supabaseService.get).mockResolvedValue(mockDoc as Record<string, unknown>);

      const result = await repository.findById('1');
      expect(result).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('returns product when found by slug', async () => {
      vi.mocked(supabaseService.query).mockResolvedValue([
        {
          id: '1',
          name: 'Test Product',
          slug: 'test-product',
          is_deleted: false,
          status: ProductStatus.ACTIVE,
        },
      ] as Record<string, unknown>[]);

      const result = await repository.findBySlug('test-product');
      expect(result).toBeDefined();
      expect(result?.slug).toBe('test-product');
    });

    it('returns null when slug not found', async () => {
      vi.mocked(supabaseService.query).mockResolvedValue([]);

      const result = await repository.findBySlug('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates a product and returns it', async () => {
      vi.mocked(supabaseService.add).mockResolvedValue({ id: 'new-id' } as Record<string, unknown>);

      const result = await repository.create({
        name: 'New Product',
        description: 'A new product',
        price: 100,
        categoryId: 'cat-1',
        createdBy: 'user-1',
        slug: 'new-product',
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('New Product');
      expect(supabaseService.add).toHaveBeenCalledOnce();
    });

    it('create without thumbnail uses empty string and empty gallery', async () => {
      vi.mocked(supabaseService.add).mockResolvedValue({ id: 'new-id' } as Record<string, unknown>);

      await repository.create({
        name: 'No Image Product',
        description: '',
        price: 50,
        categoryId: 'cat-1',
        createdBy: 'user-1',
        slug: 'no-image-product',
      });

      expect(supabaseService.add).toHaveBeenCalledWith(
        'products',
        expect.objectContaining({ thumbnail: '', gallery: [] }),
      );
    });

    it('create with thumbnail preserves the caller-provided image', async () => {
      vi.mocked(supabaseService.add).mockResolvedValue({ id: 'new-id' } as Record<string, unknown>);

      const thumbnail =
        'https://example.supabase.co/storage/v1/object/public/products/a/thumb.webp';
      await repository.create({
        name: 'With Thumb',
        description: '',
        price: 50,
        categoryId: 'cat-1',
        createdBy: 'user-1',
        slug: 'with-thumb',
        thumbnail,
      });

      expect(supabaseService.add).toHaveBeenCalledWith(
        'products',
        expect.objectContaining({ thumbnail, gallery: [] }),
      );
    });

    it('create with gallery preserves every gallery URL', async () => {
      vi.mocked(supabaseService.add).mockResolvedValue({ id: 'new-id' } as Record<string, unknown>);

      const gallery = ['https://example.supabase.co/storage/v1/object/public/products/a/1.webp'];
      await repository.create({
        name: 'Gallery Product',
        description: '',
        price: 50,
        categoryId: 'cat-1',
        createdBy: 'user-1',
        slug: 'gallery-product',
        gallery,
      });

      expect(supabaseService.add).toHaveBeenCalledWith(
        'products',
        expect.objectContaining({ thumbnail: '', gallery }),
      );
    });

    it('create with both thumbnail and gallery preserves both', async () => {
      vi.mocked(supabaseService.add).mockResolvedValue({ id: 'new-id' } as Record<string, unknown>);

      const thumbnail = 'https://example.supabase.co/storage/v1/object/public/products/a/t.webp';
      const gallery = ['https://example.supabase.co/storage/v1/object/public/products/a/g1.webp'];
      await repository.create({
        name: 'Full Media',
        description: '',
        price: 50,
        categoryId: 'cat-1',
        createdBy: 'user-1',
        slug: 'full-media',
        thumbnail,
        gallery,
      });

      expect(supabaseService.add).toHaveBeenCalledWith(
        'products',
        expect.objectContaining({ thumbnail, gallery }),
      );
    });

    it('create generates a unique slug when slug is omitted', async () => {
      vi.mocked(supabaseService.query).mockResolvedValueOnce([]); // existsBySlug -> no match
      vi.mocked(supabaseService.add).mockResolvedValue({ id: 'new-id' } as Record<string, unknown>);

      await repository.create({
        name: 'Slugged Product',
        description: '',
        price: 50,
        categoryId: 'cat-1',
        createdBy: 'user-1',
      });

      expect(supabaseService.add).toHaveBeenCalledWith(
        'products',
        expect.objectContaining({ slug: 'slugged-product' }),
      );
    });

    it('create preserves a caller-provided id', async () => {
      vi.mocked(supabaseService.add).mockResolvedValue({ id: 'pregen-id' } as Record<
        string,
        unknown
      >);

      await repository.create({
        id: 'pregen-id',
        name: 'Pre-gen',
        description: '',
        price: 50,
        categoryId: 'cat-1',
        createdBy: 'user-1',
        slug: 'pre-gen',
      });

      expect(supabaseService.add).toHaveBeenCalledWith(
        'products',
        expect.objectContaining({ id: 'pregen-id' }),
      );
    });
  });

  describe('update image metadata', () => {
    it('updates thumbnail without touching other columns', async () => {
      vi.mocked(supabaseService.get).mockResolvedValue({
        id: '1',
        name: 'Product 1',
        is_deleted: false,
        status: ProductStatus.ACTIVE,
      } as Record<string, unknown>);
      vi.mocked(supabaseService.update).mockResolvedValue();
      vi.mocked(supabaseService.get).mockResolvedValue({
        id: '1',
        name: 'Product 1',
        is_deleted: false,
        status: ProductStatus.ACTIVE,
        thumbnail: 'https://example.supabase.co/storage/v1/object/public/products/1/t.webp',
      } as Record<string, unknown>);

      const updated = await repository.update('1', {
        thumbnail: 'https://example.supabase.co/storage/v1/object/public/products/1/t.webp',
        updatedBy: 'admin',
      });

      expect(supabaseService.update).toHaveBeenCalledWith(
        'products',
        '1',
        expect.objectContaining({
          thumbnail: 'https://example.supabase.co/storage/v1/object/public/products/1/t.webp',
        }),
      );
      expect(updated.thumbnail).toBe(
        'https://example.supabase.co/storage/v1/object/public/products/1/t.webp',
      );
      expect(supabaseService.update).not.toHaveBeenCalledWith(
        'products',
        '1',
        expect.objectContaining({ id: '1' }),
      );
    });
  });

  describe('softDelete', () => {
    it('soft deletes a product', async () => {
      vi.mocked(supabaseService.get).mockResolvedValue({
        id: '1',
        name: 'Test',
        is_deleted: false,
        status: ProductStatus.ACTIVE,
      } as Record<string, unknown>);
      vi.mocked(supabaseService.update).mockResolvedValue();

      await repository.softDelete('1');
      expect(supabaseService.update).toHaveBeenCalledWith(
        'products',
        '1',
        expect.objectContaining({ is_deleted: true, status: ProductStatus.ARCHIVED }),
      );
    });
  });

  describe('findFeatured', () => {
    it('returns featured products', async () => {
      vi.mocked(supabaseService.query).mockResolvedValue([
        { id: '1', name: 'Featured 1', featured: true, is_deleted: false },
        { id: '2', name: 'Featured 2', featured: true, is_deleted: false },
      ] as Record<string, unknown>[]);

      const result = await repository.findFeatured(2);
      expect(result).toHaveLength(2);
    });
  });

  describe('getLowStock', () => {
    it('returns products below threshold', async () => {
      vi.mocked(supabaseService.query).mockResolvedValue([
        { id: '1', name: 'Low Stock', stock: 3, is_deleted: false },
      ] as Record<string, unknown>[]);

      const result = await repository.getLowStock(10);
      expect(result).toHaveLength(1);
      expect(result[0]?.stock).toBe(3);
    });
  });

  describe('exists', () => {
    it('returns true when product exists', async () => {
      vi.mocked(supabaseService.get).mockResolvedValue({
        id: '1',
        name: 'Test',
        is_deleted: false,
        status: ProductStatus.ACTIVE,
      } as Record<string, unknown>);

      expect(await repository.exists('1')).toBe(true);
    });

    it('returns false when product does not exist', async () => {
      vi.mocked(supabaseService.get).mockResolvedValue(null);
      expect(await repository.exists('1')).toBe(false);
    });
  });
});
