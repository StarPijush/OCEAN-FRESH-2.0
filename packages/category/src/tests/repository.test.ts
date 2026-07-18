import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FirestoreCategoryRepository } from '../repository/firestore-category.repository.js';
import { firestoreService } from '@oceanfresh/firebase';
import { CategoryStatus } from '@oceanfresh/shared';

vi.mock('@oceanfresh/firebase', () => ({
  firestoreService: {
    get: vi.fn(),
    query: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
  },
}));

describe('FirestoreCategoryRepository', () => {
  let repository: FirestoreCategoryRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new FirestoreCategoryRepository();
  });

  describe('findById', () => {
    it('returns category when found', async () => {
      const mockDoc = { id: '1', name: 'Seafood', isDeleted: false, status: CategoryStatus.ACTIVE };
      vi.mocked(firestoreService.get).mockResolvedValue(mockDoc as any);

      const result = await repository.findById('1');
      expect(result).toBeDefined();
      expect(result!.name).toBe('Seafood');
      expect(firestoreService.get).toHaveBeenCalledWith('categories', '1');
    });

    it('returns null when not found', async () => {
      vi.mocked(firestoreService.get).mockResolvedValue(null);
      const result = await repository.findById('nonexistent');
      expect(result).toBeNull();
    });

    it('returns null when category is soft-deleted', async () => {
      const mockDoc = { id: '1', name: 'Deleted', isDeleted: true, status: CategoryStatus.ARCHIVED };
      vi.mocked(firestoreService.get).mockResolvedValue(mockDoc as any);

      const result = await repository.findById('1');
      expect(result).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('returns category when found by slug', async () => {
      vi.mocked(firestoreService.query).mockResolvedValue([
        { id: '1', name: 'Seafood', slug: 'seafood', isDeleted: false, status: CategoryStatus.ACTIVE },
      ] as any[]);

      const result = await repository.findBySlug('seafood');
      expect(result).toBeDefined();
      expect(result!.slug).toBe('seafood');
    });

    it('returns null when slug not found', async () => {
      vi.mocked(firestoreService.query).mockResolvedValue([]);
      const result = await repository.findBySlug('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('findRootCategories', () => {
    it('returns categories with null parentId', async () => {
      vi.mocked(firestoreService.query).mockResolvedValue([
        { id: '1', name: 'Root 1', parentId: null, isDeleted: false },
        { id: '2', name: 'Root 2', parentId: null, isDeleted: false },
      ] as any[]);

      const result = await repository.findRootCategories();
      expect(result).toHaveLength(2);
    });
  });

  describe('findChildren', () => {
    it('returns direct children of a parent', async () => {
      vi.mocked(firestoreService.query).mockResolvedValue([
        { id: '2', name: 'Child', parentId: '1', isDeleted: false },
      ] as any[]);

      const result = await repository.findChildren('1');
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Child');
    });
  });

  describe('create', () => {
    it('creates a category and returns it', async () => {
      vi.mocked(firestoreService.add).mockResolvedValue({ id: 'new-id' } as any);

      const result = await repository.create({
        name: 'Fresh Fish',
        slug: 'fresh-fish',
        path: '',
        level: 0,
        createdBy: 'user-1',
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('Fresh Fish');
      expect(firestoreService.add).toHaveBeenCalledOnce();
    });
  });

  describe('softDelete', () => {
    it('soft deletes a category', async () => {
      vi.mocked(firestoreService.get).mockResolvedValue({
        id: '1', name: 'Test', isDeleted: false, status: CategoryStatus.ACTIVE,
      } as any);
      vi.mocked(firestoreService.update).mockResolvedValue();

      await repository.softDelete('1');
      expect(firestoreService.update).toHaveBeenCalledWith(
        'categories',
        '1',
        expect.objectContaining({ isDeleted: true, status: CategoryStatus.ARCHIVED }),
      );
    });
  });

  describe('findFeatured', () => {
    it('returns featured categories', async () => {
      vi.mocked(firestoreService.query).mockResolvedValue([
        { id: '1', name: 'Featured', featured: true, isDeleted: false },
      ] as any[]);

      const result = await repository.findFeatured(5);
      expect(result).toHaveLength(1);
    });
  });

  describe('exists', () => {
    it('returns true when category exists', async () => {
      vi.mocked(firestoreService.get).mockResolvedValue({
        id: '1', name: 'Test', isDeleted: false, status: CategoryStatus.ACTIVE,
      } as any);
      expect(await repository.exists('1')).toBe(true);
    });

    it('returns false when category does not exist', async () => {
      vi.mocked(firestoreService.get).mockResolvedValue(null);
      expect(await repository.exists('1')).toBe(false);
    });
  });

  describe('findDescendants', () => {
    it('returns descendants by path prefix', async () => {
      vi.mocked(firestoreService.get).mockResolvedValue({
        id: '1', name: 'Parent', path: '', isDeleted: false,
      } as any);
      vi.mocked(firestoreService.query).mockResolvedValue([
        { id: '2', name: 'Child', path: '1/2', isDeleted: false },
        { id: '3', name: 'Grandchild', path: '1/2/3', isDeleted: false },
      ] as any[]);

      const result = await repository.findDescendants('1');
      expect(result).toHaveLength(2);
    });
  });

  describe('move', () => {
    it('updates path and level', async () => {
      vi.mocked(firestoreService.update).mockResolvedValue();
      vi.mocked(firestoreService.get).mockResolvedValue({
        id: '2', name: 'Moved', parentId: '1', path: '1/2', level: 1,
      } as any);

      const result = await repository.move('2', { parentId: '1', path: '1/2', level: 1 });
      expect(result).toBeDefined();
      expect(result.path).toBe('1/2');
    });
  });
});
