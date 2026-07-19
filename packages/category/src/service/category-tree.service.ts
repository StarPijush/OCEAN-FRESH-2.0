import { type Category, createLogger } from '@oceanfresh/shared';

import type { ICategoryRepository } from '../repository/index.js';

const logger = createLogger('category:service:tree');

export interface NestedCategory extends Category {
  children: NestedCategory[];
}

export class CategoryTreeService {
  constructor(private readonly repository: ICategoryRepository) {}

  async getTree(): Promise<NestedCategory[]> {
    logger.debug('getTree');
    const categories = await this.repository.findTree();
    return this.buildNestedTree(categories);
  }

  async getBreadcrumb(categoryId: string): Promise<Category[]> {
    logger.debug('getBreadcrumb', { categoryId });
    return this.repository.findAncestors(categoryId);
  }

  async getPath(categoryId: string): Promise<string> {
    const category = await this.repository.findById(categoryId);
    return category?.path ?? '';
  }

  async isDescendantOf(categoryId: string, ancestorId: string): Promise<boolean> {
    const ancestors = await this.repository.findAncestors(categoryId);
    return ancestors.some((a) => a.id === ancestorId);
  }

  async findRoots(): Promise<Category[]> {
    logger.debug('findRoots');
    return this.repository.findRootCategories();
  }

  buildNestedTree(categories: Category[]): NestedCategory[] {
    const map = new Map<string, NestedCategory>();
    const roots: NestedCategory[] = [];

    for (const cat of categories) {
      const item: NestedCategory = { ...cat, children: [] };
      map.set(cat.id, item);
    }

    for (const cat of map.values()) {
      if (cat.parentId && map.has(cat.parentId)) {
        map.get(cat.parentId)?.children.push(cat);
      } else if (!cat.parentId) {
        roots.push(cat);
      }
    }

    return roots;
  }
}
