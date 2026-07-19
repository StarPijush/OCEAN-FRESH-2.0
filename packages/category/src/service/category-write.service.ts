import {
  type Category,
  ConcurrencyError,
  type CreateCategoryInput,
  createLogger,
  NotFoundError,
  slugify,
  type UpdateCategoryInput,
} from '@oceanfresh/shared';

import { CategoryEventType, type EventBus } from '../events/index.js';
import type { ICategoryRepository } from '../repository/index.js';

const logger = createLogger('category:service:write');
const MAX_DEPTH = 5;

export class CategoryWriteService {
  constructor(
    private readonly repository: ICategoryRepository,
    private readonly eventBus: EventBus,
  ) {}

  async create(data: CreateCategoryInput & { createdBy: string }): Promise<Category> {
    logger.info('create', { name: data.name });

    const slug = slugify(data.name);

    const slugExists = await this.repository.existsBySlug(slug);
    if (slugExists) {
      throw new ConcurrencyError(`Category with slug "${slug}" already exists`);
    }

    const { path, level } = await this.computePathAndLevel(data.parentId ?? null);

    const category = await this.repository.create({
      ...data,
      slug,
      path,
      level,
    });

    await this.eventBus.publish({
      type: CategoryEventType.CREATED,
      categoryId: category.id,
      data: category,
      metadata: { source: 'CategoryWriteService' },
    });

    return category;
  }

  async update(
    id: string,
    data: Partial<UpdateCategoryInput> & { updatedBy: string },
  ): Promise<Category> {
    logger.info('update', { id });

    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Category not found');

    if (data.name && data.name !== existing.name) {
      const newSlug = slugify(data.name);
      if (newSlug !== existing.slug) {
        const slugExists = await this.repository.existsBySlug(newSlug);
        if (slugExists) {
          throw new ConcurrencyError(`Category with slug "${newSlug}" already exists`);
        }
      }
    }

    const updated = await this.repository.update(id, data);

    await this.eventBus.publish({
      type: CategoryEventType.UPDATED,
      categoryId: id,
      data: updated,
      metadata: { source: 'CategoryWriteService' },
    });

    return updated;
  }

  async softDelete(id: string): Promise<void> {
    logger.info('softDelete', { id });

    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Category not found');

    if (existing.productCount > 0) {
      throw new ConcurrencyError(
        `Cannot delete category "${existing.name}": ${existing.productCount} product(s) still assigned`,
      );
    }

    await this.repository.softDelete(id);

    await this.eventBus.publish({
      type: CategoryEventType.DELETED,
      categoryId: id,
      metadata: { source: 'CategoryWriteService' },
    });
  }

  async restore(id: string): Promise<void> {
    logger.info('restore', { id });
    await this.repository.restore(id);

    await this.eventBus.publish({
      type: CategoryEventType.RESTORED,
      categoryId: id,
      metadata: { source: 'CategoryWriteService' },
    });
  }

  async archive(id: string): Promise<void> {
    logger.info('archive', { id });
    await this.repository.archive(id);

    await this.eventBus.publish({
      type: CategoryEventType.ARCHIVED,
      categoryId: id,
      metadata: { source: 'CategoryWriteService' },
    });
  }

  async move(id: string, newParentId: string | null): Promise<Category> {
    logger.info('move', { id, newParentId });

    const category = await this.repository.findById(id);
    if (!category) throw new NotFoundError('Category not found');

    if (newParentId === id) {
      throw new ConcurrencyError('Category cannot be its own parent');
    }

    if (newParentId) {
      const newParent = await this.repository.findById(newParentId);
      if (!newParent) throw new NotFoundError('New parent category not found');

      if (await this.isDescendant(newParentId, id)) {
        throw new ConcurrencyError('Cannot move category into one of its own descendants');
      }

      const proposedLevel = newParent.level + 1;
      if (proposedLevel > MAX_DEPTH) {
        throw new ConcurrencyError(`Maximum nesting depth (${MAX_DEPTH}) exceeded`);
      }

      const { path } = await this.computePathAndLevel(newParentId);
      const selfPath = path + '/' + id;

      await this.repository.move(id, {
        parentId: newParentId,
        path: selfPath,
        level: proposedLevel,
      });

      const descendants = await this.repository.findDescendants(id);
      for (const descendant of descendants) {
        const oldPrefix = category.path + '/';
        const newPrefix = selfPath + '/';
        const newDescPath = descendant.path.replace(oldPrefix, newPrefix);
        const newLevel = descendant.level + (proposedLevel - category.level);
        await this.repository.move(descendant.id, {
          parentId: descendant.parentId,
          path: newDescPath,
          level: newLevel,
        });
      }
    } else {
      const selfPath = id;
      await this.repository.move(id, { parentId: null, path: selfPath, level: 0 });

      const descendants = await this.repository.findDescendants(id);
      for (const descendant of descendants) {
        const oldPrefix = category.path + '/';
        const newDescPath = id + '/' + descendant.path.replace(oldPrefix, '');
        const newLevel = descendant.level - category.level;
        await this.repository.move(descendant.id, {
          parentId: descendant.parentId,
          path: newDescPath,
          level: newLevel,
        });
      }
    }

    const moved = await this.repository.findById(id);

    await this.eventBus.publish({
      type: CategoryEventType.MOVED,
      categoryId: id,
      data: moved ?? undefined,
      metadata: { source: 'CategoryWriteService', correlationId: `move-${id}` },
    });

    return moved as Category;
  }

  async bulkUpdate(ids: string[], data: Partial<UpdateCategoryInput>): Promise<void> {
    logger.info('bulkUpdate', { count: ids.length });
    await this.repository.bulkUpdate(ids, data);
  }

  async bulkArchive(ids: string[]): Promise<void> {
    logger.info('bulkArchive', { count: ids.length });
    await this.repository.bulkArchive(ids);
  }

  async refreshProductCount(id: string, count: number): Promise<void> {
    logger.debug('refreshProductCount', { id, count });
    await this.repository.refreshProductCount(id, count);
  }

  private async computePathAndLevel(
    parentId: string | null,
  ): Promise<{ path: string; level: number }> {
    if (!parentId) {
      return { path: '', level: 0 };
    }
    const parent = await this.repository.findById(parentId);
    if (!parent) {
      return { path: '', level: 0 };
    }
    const path = parent.path ? parent.path + '/' + parentId : parentId;
    const level = parent.level + 1;
    return { path, level };
  }

  private async isDescendant(categoryId: string, targetId: string): Promise<boolean> {
    const target = await this.repository.findById(targetId);
    if (!target) return false;
    const category = await this.repository.findById(categoryId);
    if (!category) return false;
    const targetPrefix = target.path ? target.path + '/' + targetId + '/' : targetId + '/';
    const directChildPath = target.path ? target.path + '/' + targetId : targetId;
    return category.path.startsWith(targetPrefix) || category.path === directChildPath;
  }
}
