import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FirestoreProductRepository } from '../repository/firestore-product.repository.js';
import { firestoreService } from '@oceanfresh/firebase';
import { ProductStatus } from '@oceanfresh/shared';

vi.mock('@oceanfresh/firebase', () => ({
  firestoreService: {
    get: vi.fn(),
    query: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
  },
}));

describe('FirestoreProductRepository', () => {
  let repository: FirestoreProductRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new FirestoreProductRepository();
  });

  describe('findById', () => {
    it('returns product when found', async () => {
      const mockDoc = { id: '1', name: 'Test Product', isDeleted: false, status: ProductStatus.ACTIVE };
      vi.mocked(firestoreService.get).mockResolvedValue(mockDoc as any);

      const result = await repository.findById('1');
      expect(result).toBeDefined();
      expect(result!.name).toBe('Test Product');
      expect(firestoreService.get).toHaveBeenCalledWith('products', '1');
    });

    it('returns null when not found', async () => {
      vi.mocked(firestoreService.get).mockResolvedValue(null);

      const result = await repository.findById('nonexistent');
      expect(result).toBeNull();
    });

    it('returns null when product is soft-deleted', async () => {
      const mockDoc = { id: '1', name: 'Deleted Product', isDeleted: true, status: ProductStatus.ARCHIVED };
      vi.mocked(firestoreService.get).mockResolvedValue(mockDoc as any);

      const result = await repository.findById('1');
      expect(result).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('returns product when found by slug', async () => {
      vi.mocked(firestoreService.query).mockResolvedValue([
        { id: '1', name: 'Test Product', slug: 'test-product', isDeleted: false, status: ProductStatus.ACTIVE },
      ] as any[]);

      const result = await repository.findBySlug('test-product');
      expect(result).toBeDefined();
      expect(result!.slug).toBe('test-product');
    });

    it('returns null when slug not found', async () => {
      vi.mocked(firestoreService.query).mockResolvedValue([]);

      const result = await repository.findBySlug('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates a product and returns it', async () => {
      vi.mocked(firestoreService.add).mockResolvedValue({ id: 'new-id' } as any);

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
      expect(firestoreService.add).toHaveBeenCalledOnce();
    });
  });

  describe('softDelete', () => {
    it('soft deletes a product', async () => {
      vi.mocked(firestoreService.get).mockResolvedValue({
        id: '1', name: 'Test', isDeleted: false, status: ProductStatus.ACTIVE,
      } as any);
      vi.mocked(firestoreService.update).mockResolvedValue();

      await repository.softDelete('1');
      expect(firestoreService.update).toHaveBeenCalledWith(
        'products',
        '1',
        expect.objectContaining({ isDeleted: true, status: ProductStatus.ARCHIVED }),
      );
    });
  });

  describe('findFeatured', () => {
    it('returns featured products', async () => {
      vi.mocked(firestoreService.query).mockResolvedValue([
        { id: '1', name: 'Featured 1', featured: true, isDeleted: false },
        { id: '2', name: 'Featured 2', featured: true, isDeleted: false },
      ] as any[]);

      const result = await repository.findFeatured(2);
      expect(result).toHaveLength(2);
    });
  });

  describe('getLowStock', () => {
    it('returns products below threshold', async () => {
      vi.mocked(firestoreService.query).mockResolvedValue([
        { id: '1', name: 'Low Stock', stock: 3, isDeleted: false },
      ] as any[]);

      const result = await repository.getLowStock(10);
      expect(result).toHaveLength(1);
      expect(result[0]?.stock).toBe(3);
    });
  });

  describe('exists', () => {
    it('returns true when product exists', async () => {
      vi.mocked(firestoreService.get).mockResolvedValue({
        id: '1', name: 'Test', isDeleted: false, status: ProductStatus.ACTIVE,
      } as any);

      expect(await repository.exists('1')).toBe(true);
    });

    it('returns false when product does not exist', async () => {
      vi.mocked(firestoreService.get).mockResolvedValue(null);
      expect(await repository.exists('1')).toBe(false);
    });
  });
});
