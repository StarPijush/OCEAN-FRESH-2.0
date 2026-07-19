import { ConcurrencyError, ProductEventType, ProductStatus } from '@oceanfresh/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InMemoryEventBus } from '../events/in-memory-event-bus.js';
import { ProductInventoryService } from '../service/product-inventory.service.js';
import { ProductReadService } from '../service/product-read.service.js';
import { ProductWriteService } from '../service/product-write.service.js';

function createMockRepository() {
  return {
    findById: vi.fn(),
    findBySlug: vi.fn(),
    findByIds: vi.fn(),
    findAll: vi.fn(),
    findFeatured: vi.fn(),
    findByCategory: vi.fn(),
    findByStatus: vi.fn(),
    search: vi.fn(),
    exists: vi.fn(),
    existsBySlug: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    restore: vi.fn(),
    archive: vi.fn(),
    duplicate: vi.fn(),
    bulkUpdate: vi.fn(),
    bulkDelete: vi.fn(),
    bulkArchive: vi.fn(),
    getLowStock: vi.fn(),
  };
}

describe('ProductReadService', () => {
  let repository: ReturnType<typeof createMockRepository>;
  let service: ProductReadService;

  beforeEach(() => {
    repository = createMockRepository();
    service = new ProductReadService(repository as unknown as Record<string, unknown>);
  });

  it('getById returns product for existing id', async () => {
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
    const result = await service.query({ status: ProductStatus.ACTIVE } as Record<string, unknown>);
    expect(result.items).toEqual([]);
  });
});

describe('ProductWriteService', () => {
  let repository: ReturnType<typeof createMockRepository>;
  let eventBus: InMemoryEventBus;
  let service: ProductWriteService;

  beforeEach(() => {
    repository = createMockRepository();
    eventBus = new InMemoryEventBus();
    service = new ProductWriteService(repository as unknown as Record<string, unknown>, eventBus);
  });

  it('create creates and publishes event', async () => {
    repository.existsBySlug.mockResolvedValue(false);
    repository.create.mockResolvedValue({ id: '1', name: 'New', slug: 'new' });

    const handler = vi.fn();
    eventBus.subscribe(ProductEventType.CREATED, handler);

    const result = await service.create({
      name: 'New',
      description: 'A new product',
      price: 100,
      categoryId: 'cat-1',
      createdBy: 'user-1',
    });

    expect(result.name).toBe('New');
    expect(repository.create).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });

  it('update updates and publishes event', async () => {
    repository.update.mockResolvedValue({ id: '1', name: 'Updated' });

    const handler = vi.fn();
    eventBus.subscribe(ProductEventType.UPDATED, handler);

    const result = await service.update('1', { name: 'Updated', updatedBy: 'user-1' });
    expect(result.name).toBe('Updated');
    expect(handler).toHaveBeenCalled();
  });

  it('softDelete publishes event', async () => {
    repository.softDelete.mockResolvedValue(undefined);

    const handler = vi.fn();
    eventBus.subscribe(ProductEventType.DELETED, handler);

    await service.softDelete('1');
    expect(handler).toHaveBeenCalled();
  });
});

describe('ProductInventoryService', () => {
  let repository: ReturnType<typeof createMockRepository>;
  let eventBus: InMemoryEventBus;
  let service: ProductInventoryService;

  beforeEach(() => {
    repository = createMockRepository();
    eventBus = new InMemoryEventBus();
    service = new ProductInventoryService(
      repository as unknown as Record<string, unknown>,
      eventBus,
    );
  });

  it('adjustStock increases stock', async () => {
    repository.findById.mockResolvedValue({ id: '1', stock: 10, version: 1 });
    repository.update.mockResolvedValue({ id: '1', stock: 15 });

    const result = await service.adjustStock('1', 5);
    expect(result.stock).toBe(15);
  });

  it('adjustStock decreases stock', async () => {
    repository.findById.mockResolvedValue({ id: '1', stock: 10, version: 1 });
    repository.update.mockResolvedValue({ id: '1', stock: 7 });

    const result = await service.adjustStock('1', -3);
    expect(result.stock).toBe(7);
  });

  it('adjustStock throws on insufficient stock', async () => {
    repository.findById.mockResolvedValue({ id: '1', stock: 2, version: 1 });

    await expect(service.adjustStock('1', -5)).rejects.toThrow(ConcurrencyError);
  });

  it('setStock sets stock to exact value', async () => {
    repository.findById.mockResolvedValue({ id: '1', stock: 10, version: 1 });
    repository.update.mockResolvedValue({ id: '1', stock: 50 });

    const result = await service.setStock('1', 50);
    expect(result.stock).toBe(50);
  });

  it('setStock throws on negative value', async () => {
    await expect(service.setStock('1', -1)).rejects.toThrow(ConcurrencyError);
  });

  it('getLowStock returns low stock products', async () => {
    repository.getLowStock.mockResolvedValue([{ id: '1', stock: 3 }]);
    const result = await service.getLowStock(10);
    expect(result).toHaveLength(1);
  });

  it('isInStock returns true when stock > 0 and active', async () => {
    repository.findById.mockResolvedValue({ id: '1', stock: 10, status: ProductStatus.ACTIVE });
    expect(await service.isInStock('1')).toBe(true);
  });

  it('getStockLevel returns stock count', async () => {
    repository.findById.mockResolvedValue({ id: '1', stock: 42 });
    expect(await service.getStockLevel('1')).toBe(42);
  });
});
