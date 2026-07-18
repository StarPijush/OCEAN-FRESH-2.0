import type { Category, CategoryQuery, PaginatedResult } from '@oceanfresh/shared';
import type { ICategoryRepository } from '../repository/index.js';
import { createLogger } from '@oceanfresh/shared';

const logger = createLogger('category:service:read');

export class CategoryReadService {
  constructor(private readonly repository: ICategoryRepository) {}

  async getById(id: string): Promise<Category | null> {
    logger.debug('getById', { id });
    return this.repository.findById(id);
  }

  async getBySlug(slug: string): Promise<Category | null> {
    logger.debug('getBySlug', { slug });
    return this.repository.findBySlug(slug);
  }

  async getByIds(ids: string[]): Promise<Category[]> {
    if (ids.length === 0) return [];
    logger.debug('getByIds', { count: ids.length });
    return this.repository.findByIds(ids);
  }

  async query(query: CategoryQuery): Promise<PaginatedResult<Category>> {
    logger.debug('query', { query });
    return this.repository.findAll(query);
  }

  async getRootCategories(): Promise<Category[]> {
    logger.debug('getRootCategories');
    return this.repository.findRootCategories();
  }

  async getChildren(parentId: string): Promise<Category[]> {
    logger.debug('getChildren', { parentId });
    return this.repository.findChildren(parentId);
  }

  async getDescendants(categoryId: string): Promise<Category[]> {
    logger.debug('getDescendants', { categoryId });
    return this.repository.findDescendants(categoryId);
  }

  async getAncestors(categoryId: string): Promise<Category[]> {
    logger.debug('getAncestors', { categoryId });
    return this.repository.findAncestors(categoryId);
  }

  async getFeatured(limit?: number): Promise<Category[]> {
    logger.debug('getFeatured', { limit });
    return this.repository.findFeatured(limit);
  }

  async getTree(): Promise<Category[]> {
    logger.debug('getTree');
    return this.repository.findTree();
  }

  async search(term: string, query?: Partial<CategoryQuery>): Promise<PaginatedResult<Category>> {
    logger.debug('search', { term });
    return this.repository.search(term, query);
  }

  async exists(id: string): Promise<boolean> {
    return this.repository.exists(id);
  }

  async existsBySlug(slug: string): Promise<boolean> {
    return this.repository.existsBySlug(slug);
  }

  async count(query?: Partial<CategoryQuery>): Promise<number> {
    logger.debug('count', { query });
    return this.repository.count(query);
  }
}
