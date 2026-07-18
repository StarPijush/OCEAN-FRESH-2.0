import { createLogger, NotFoundError, ConcurrencyError, type Product, ProductStatus } from '@oceanfresh/shared';
import type { IProductRepository } from '../repository/index.js';
import type { EventBus } from '../events/index.js';
import { ProductEventType } from '../events/index.js';

const logger = createLogger('product:service:inventory');

export class ProductInventoryService {
  constructor(
    private readonly repository: IProductRepository,
    private readonly eventBus: EventBus,
  ) {}

  async adjustStock(id: string, quantity: number): Promise<Product> {
    logger.info('adjustStock', { id, quantity });

    const product = await this.repository.findById(id);
    if (!product) throw new NotFoundError('Product not found');

    const newStock = (product.stock ?? 0) + quantity;
    if (newStock < 0) {
      throw new ConcurrencyError('Insufficient stock', { productId: id, currentVersion: product.version });
    }

    const updated = await this.repository.update(id, {
      stock: newStock,
      updatedBy: 'inventory-service',
    });

    await this.eventBus.publish({
      type: ProductEventType.STOCK_CHANGED,
      productId: id,
      data: { ...updated, stock: newStock },
      metadata: { source: 'ProductInventoryService' },
    });

    return updated;
  }

  async setStock(id: string, quantity: number): Promise<Product> {
    logger.info('setStock', { id, quantity });
    if (quantity < 0) {
      throw new ConcurrencyError('Stock quantity cannot be negative', { productId: id });
    }

    const product = await this.repository.findById(id);
    if (!product) throw new NotFoundError('Product not found');

    const updated = await this.repository.update(id, {
      stock: quantity,
      updatedBy: 'inventory-service',
    });

    await this.eventBus.publish({
      type: ProductEventType.STOCK_CHANGED,
      productId: id,
      data: { ...updated, stock: quantity },
      metadata: { source: 'ProductInventoryService' },
    });

    return updated;
  }

  async getLowStock(threshold = 10): Promise<Product[]> {
    logger.debug('getLowStock', { threshold });
    return this.repository.getLowStock(threshold);
  }

  async isInStock(id: string): Promise<boolean> {
    const product = await this.repository.findById(id);
    if (!product) return false;
    return (product.stock ?? 0) > 0 && product.status === ProductStatus.ACTIVE;
  }

  async getStockLevel(id: string): Promise<number> {
    const product = await this.repository.findById(id);
    if (!product) throw new NotFoundError('Product not found');
    return product.stock ?? 0;
  }
}
