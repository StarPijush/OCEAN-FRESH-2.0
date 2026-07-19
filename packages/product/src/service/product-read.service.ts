import {
  createLogger,
  type PaginatedResult,
  type Product,
  type ProductQuery,
} from '@oceanfresh/shared';

import type { IProductRepository } from '../repository/index.js';

const logger = createLogger('product:service:read');

export class ProductReadService {
  constructor(private readonly repository: IProductRepository) {}

  async getById(id: string): Promise<Product | null> {
    logger.debug('getById', { id });
    return this.repository.findById(id);
  }

  async getBySlug(slug: string): Promise<Product | null> {
    logger.debug('getBySlug', { slug });
    return this.repository.findBySlug(slug);
  }

  async getByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];
    logger.debug('getByIds', { count: ids.length });
    return this.repository.findByIds(ids);
  }

  async query(query: ProductQuery): Promise<PaginatedResult<Product>> {
    logger.debug('query', { query });
    return this.repository.findAll(query);
  }

  async getFeatured(limit?: number): Promise<Product[]> {
    logger.debug('getFeatured', { limit });
    return this.repository.findFeatured(limit);
  }

  async getByCategory(
    categoryId: string,
    query?: Partial<ProductQuery>,
  ): Promise<PaginatedResult<Product>> {
    logger.debug('getByCategory', { categoryId });
    return this.repository.findByCategory(categoryId, query);
  }

  async search(term: string, query?: Partial<ProductQuery>): Promise<PaginatedResult<Product>> {
    logger.debug('search', { term });
    return this.repository.search(term, query);
  }

  async exists(id: string): Promise<boolean> {
    return this.repository.exists(id);
  }

  async existsBySlug(slug: string): Promise<boolean> {
    return this.repository.existsBySlug(slug);
  }

  async count(query?: Partial<ProductQuery>): Promise<number> {
    logger.debug('count', { query });
    return this.repository.count(query);
  }
}
