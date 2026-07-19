import { CategoryEventType, type CategoryQuery, CategoryStatus } from '@oceanfresh/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InMemoryEventBus } from '../events/in-memory-event-bus.js';
import type { ICategoryRepository } from '../repository/index.js';
import { CategoryReadService } from '../service/category-read.service.js';
import { CategoryTreeService } from '../service/category-tree.service.js';
import { CategoryWriteService } from '../service/category-write.service.js';

function createMockRepository() {
  return {
    findById: vi.fn(),
    findBySlug: vi.fn(),
    findByIds: vi.fn(),
    findAll: vi.fn(),
    findRootCategories: vi.fn(),
    findChildren: vi.fn(),
    findDescendants: vi.fn(),
    findAncestors: vi.fn(),
    findFeatured: vi.fn(),
    findVisible: vi.fn(),
    findTree: vi.fn(),
    search: vi.fn(),
    exists: vi.fn(),
    existsBySlug: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    move: vi.fn(),
    softDelete: vi.fn(),
    restore: vi.fn(),
    archive: vi.fn(),
    bulkUpdate: vi.fn(),
    bulkArchive: vi.fn(),
    refreshProductCount: vi.fn(),
  };
}

describe('CategoryReadService', () => {
  let repository: ReturnType<typeof createMockRepository>;
  let service: CategoryReadService;

  beforeEach(() => {
    repository = createMockRepository();
    service = new CategoryReadService(repository as unknown as ICategoryRepository);
  });

  it('getById returns category for existing id', async () => {
    repository.findById.mockResolvedValue({ id: '1', name: 'Test' });
    const result = await service.getById('1');
    expect(result).toEqual({ id: '1', name: 'Test' });
  });

  it('getBySlug delegates to repository', async () => {
    repository.findBySlug.mockResolvedValue({ id: '1', slug: 'test' });
    expect(await service.getBySlug('test')).toEqual({ id: '1', slug: 'test' });
  });

  it('query delegates to repository', async () => {
    repository.findAll.mockResolvedValue({ items: [], total: 0, hasMore: false, lastDoc: null });
    const result = await service.query({
      status: CategoryStatus.ACTIVE,
    } as unknown as CategoryQuery);
    expect(result.items).toEqual([]);
  });

  it('getRootCategories delegates to repository', async () => {
    repository.findRootCategories.mockResolvedValue([{ id: '1', name: 'Root' }]);
    const result = await service.getRootCategories();
    expect(result).toHaveLength(1);
  });
});

describe('CategoryWriteService', () => {
  let repository: ReturnType<typeof createMockRepository>;
  let eventBus: InMemoryEventBus;
  let service: CategoryWriteService;

  beforeEach(() => {
    repository = createMockRepository();
    eventBus = new InMemoryEventBus();
    service = new CategoryWriteService(repository as unknown as ICategoryRepository, eventBus);
  });

  it('create creates and publishes event', async () => {
    repository.existsBySlug.mockResolvedValue(false);
    repository.findById.mockResolvedValue(null);
    repository.create.mockResolvedValue({ id: '1', name: 'New', slug: 'new', path: '', level: 0 });

    const handler = vi.fn();
    eventBus.subscribe(CategoryEventType.CREATED, handler);

    const result = await service.create({ name: 'New', createdBy: 'user-1' });

    expect(result.name).toBe('New');
    expect(repository.create).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });

  it('update updates and publishes event', async () => {
    repository.findById.mockResolvedValue({ id: '1', name: 'Old Name' });
    repository.update.mockResolvedValue({ id: '1', name: 'Updated' });

    const handler = vi.fn();
    eventBus.subscribe(CategoryEventType.UPDATED, handler);

    const result = await service.update('1', { name: 'Updated', updatedBy: 'user-1' });
    expect(result.name).toBe('Updated');
    expect(handler).toHaveBeenCalled();
  });

  it('softDelete throws when products assigned', async () => {
    repository.findById.mockResolvedValue({ id: '1', name: 'Test', productCount: 5 });

    await expect(service.softDelete('1')).rejects.toThrow();
  });

  it('softDelete publishes event when no products', async () => {
    repository.findById.mockResolvedValue({ id: '1', name: 'Test', productCount: 0 });
    repository.softDelete.mockResolvedValue(undefined);

    const handler = vi.fn();
    eventBus.subscribe(CategoryEventType.DELETED, handler);

    await service.softDelete('1');
    expect(handler).toHaveBeenCalled();
  });

  it('move prevents self-parent', async () => {
    repository.findById.mockResolvedValue({ id: '1', name: 'Test' });

    await expect(service.move('1', '1')).rejects.toThrow();
  });

  it('move prevents circular hierarchy', async () => {
    repository.findById.mockImplementation((id: string) => {
      if (id === '1')
        return Promise.resolve({
          id: '1',
          name: 'Parent',
          path: '',
          level: 0,
          productCount: 0,
        } as Record<string, unknown>);
      if (id === '2')
        return Promise.resolve({
          id: '2',
          name: 'Child',
          path: '1/2',
          level: 1,
          productCount: 0,
        } as Record<string, unknown>);
      return Promise.resolve(null);
    });
    repository.findDescendants.mockResolvedValue([
      { id: '3', path: '1/2/3' } as Record<string, unknown>,
    ]);

    await expect(service.move('1', '2')).rejects.toThrow();
  });

  it('restore publishes event', async () => {
    repository.restore.mockResolvedValue(undefined);

    const handler = vi.fn();
    eventBus.subscribe(CategoryEventType.RESTORED, handler);

    await service.restore('1');
    expect(handler).toHaveBeenCalled();
  });

  it('archive publishes event', async () => {
    repository.archive.mockResolvedValue(undefined);

    const handler = vi.fn();
    eventBus.subscribe(CategoryEventType.ARCHIVED, handler);

    await service.archive('1');
    expect(handler).toHaveBeenCalled();
  });
});

describe('CategoryTreeService', () => {
  let repository: ReturnType<typeof createMockRepository>;
  let service: CategoryTreeService;

  beforeEach(() => {
    repository = createMockRepository();
    service = new CategoryTreeService(repository as unknown as ICategoryRepository);
  });

  it('buildNestedTree converts flat list to nested', () => {
    const categories = [
      { id: '1', name: 'Root', parentId: null, level: 0, path: '' } as Record<string, unknown>,
      { id: '2', name: 'Child', parentId: '1', level: 1, path: '1/2' } as Record<string, unknown>,
      { id: '3', name: 'Grandchild', parentId: '2', level: 2, path: '1/2/3' } as Record<
        string,
        unknown
      >,
    ];

    const tree = service.buildNestedTree(categories);
    expect(tree).toHaveLength(1);
    expect(tree[0]?.children).toHaveLength(1);
    expect(tree[0]?.children[0]?.children).toHaveLength(1);
  });

  it('buildNestedTree handles multiple roots', () => {
    const categories = [
      { id: '1', name: 'Root A', parentId: null } as Record<string, unknown>,
      { id: '2', name: 'Root B', parentId: null } as Record<string, unknown>,
    ];

    const tree = service.buildNestedTree(categories);
    expect(tree).toHaveLength(2);
  });

  it('getBreadcrumb returns ancestors', async () => {
    repository.findAncestors.mockResolvedValue([{ id: '1', name: 'Root' }]);
    const result = await service.getBreadcrumb('2');
    expect(result).toHaveLength(1);
  });

  it('findRoots delegates to repository', async () => {
    repository.findRootCategories.mockResolvedValue([{ id: '1' }]);
    const result = await service.findRoots();
    expect(result).toHaveLength(1);
  });
});
