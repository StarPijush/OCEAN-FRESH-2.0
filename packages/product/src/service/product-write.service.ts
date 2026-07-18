import { slugify, createLogger, NotFoundError, type Product, type CreateProductInput, type UpdateProductInput } from '@oceanfresh/shared';
import type { IProductRepository } from '../repository/index.js';
import type { EventBus } from '../events/index.js';
import { ProductEventType } from '../events/index.js';

const logger = createLogger('product:service:write');

export class ProductWriteService {
  constructor(
    private readonly repository: IProductRepository,
    private readonly eventBus: EventBus,
  ) {}

  async create(data: CreateProductInput & { createdBy: string }): Promise<Product> {
    logger.info('create', { name: data.name });

    const slug = slugify(data.name);

    const slugExists = await this.repository.existsBySlug(slug);
    if (slugExists) {
      throw new NotFoundError(`Product with slug "${slug}" already exists`);
    }

    const product = await this.repository.create({ ...data, slug });

    await this.eventBus.publish({
      type: ProductEventType.CREATED,
      productId: product.id,
      data: product,
      metadata: { source: 'ProductWriteService' },
    });

    return product;
  }

  async update(id: string, data: Partial<UpdateProductInput> & { updatedBy: string }): Promise<Product> {
    logger.info('update', { id });

    const product = await this.repository.update(id, data);

    await this.eventBus.publish({
      type: ProductEventType.UPDATED,
      productId: id,
      data: product,
      metadata: { source: 'ProductWriteService' },
    });

    return product;
  }

  async softDelete(id: string): Promise<void> {
    logger.info('softDelete', { id });
    await this.repository.softDelete(id);

    await this.eventBus.publish({
      type: ProductEventType.DELETED,
      productId: id,
      metadata: { source: 'ProductWriteService' },
    });
  }

  async restore(id: string): Promise<void> {
    logger.info('restore', { id });
    await this.repository.restore(id);

    await this.eventBus.publish({
      type: ProductEventType.RESTORED,
      productId: id,
      metadata: { source: 'ProductWriteService' },
    });
  }

  async archive(id: string): Promise<void> {
    logger.info('archive', { id });
    await this.repository.archive(id);

    await this.eventBus.publish({
      type: ProductEventType.ARCHIVED,
      productId: id,
      metadata: { source: 'ProductWriteService' },
    });
  }

  async duplicate(id: string): Promise<Product> {
    logger.info('duplicate', { id });
    return this.repository.duplicate(id);
  }

  async bulkUpdate(ids: string[], data: Partial<UpdateProductInput>): Promise<void> {
    logger.info('bulkUpdate', { count: ids.length });
    await this.repository.bulkUpdate(ids, data);
  }

  async bulkDelete(ids: string[]): Promise<void> {
    logger.info('bulkDelete', { count: ids.length });
    await this.repository.bulkDelete(ids);
  }

  async bulkArchive(ids: string[]): Promise<void> {
    logger.info('bulkArchive', { count: ids.length });
    await this.repository.bulkArchive(ids);
  }
}
