import {
  type Category,
  type CategoryQuery,
  CategorySortField,
  CategoryStatus,
  type CreateCategoryInput,
  NotFoundError,
  type PaginatedResult,
  RepositoryError,
  type UpdateCategoryInput,
} from '@oceanfresh/shared';
import {
  objToSnakeCase,
  rowToCamelCase,
  stripId,
  type SupabaseOptions,
  type SupabaseQuery,
  supabaseService,
} from '@oceanfresh/supabase';

import type { ICategoryRepository } from './category.repository.js';

const TABLE = 'categories';

function toCategory(row: Record<string, unknown>): Category {
  return rowToCamelCase<Category>(row);
}

export class SupabaseCategoryRepository implements ICategoryRepository {
  async findById(id: string): Promise<Category | null> {
    try {
      const row = await supabaseService.get<Record<string, unknown>>(TABLE, id);
      if (!row) return null;
      const category = toCategory(row);
      if (category.isDeleted) return null;
      return category;
    } catch (err) {
      throw new RepositoryError('Failed to find category by ID', 'findById', TABLE, {
        id,
        error: err,
      });
    }
  }

  async findBySlug(slug: string): Promise<Category | null> {
    try {
      const docs = await supabaseService.query<Record<string, unknown>>(
        TABLE,
        [
          { field: 'slug', operator: 'eq', value: slug },
          { field: 'is_deleted', operator: 'eq', value: false },
        ],
        { limitCount: 1 },
      );
      const row = docs[0];
      return row ? toCategory(row) : null;
    } catch (err) {
      throw new RepositoryError('Failed to find category by slug', 'findBySlug', TABLE, {
        slug,
        error: err,
      });
    }
  }

  async findByIds(ids: string[]): Promise<Category[]> {
    if (ids.length === 0) return [];
    try {
      const results: Category[] = [];
      for (const id of ids) {
        const category = await this.findById(id);
        if (category) results.push(category);
      }
      return results;
    } catch (err) {
      throw new RepositoryError('Failed to find categories by IDs', 'findByIds', TABLE, {
        ids,
        error: err,
      });
    }
  }

  async findAll(query: CategoryQuery): Promise<PaginatedResult<Category>> {
    try {
      const constraints: SupabaseQuery[] = [
        { field: 'is_deleted', operator: 'eq', value: query.includeDeleted ?? false },
      ];
      if (query.parentId !== undefined)
        constraints.push({ field: 'parent_id', operator: 'eq', value: query.parentId });
      if (query.status) {
        if (Array.isArray(query.status)) {
          constraints.push({ field: 'status', operator: 'in', value: query.status });
        } else {
          constraints.push({ field: 'status', operator: 'eq', value: query.status });
        }
      }
      if (query.visibility && query.visibility !== 'all')
        constraints.push({ field: 'visibility', operator: 'eq', value: query.visibility });
      if (query.featured !== undefined)
        constraints.push({ field: 'featured', operator: 'eq', value: query.featured });
      if (query.level !== undefined)
        constraints.push({ field: 'level', operator: 'eq', value: query.level });

      const sortField =
        query.sort === CategorySortField.SORT_ORDER ? 'sort_order' : (query.sort ?? 'sort_order');

      const options: SupabaseOptions = {
        orderByField: sortField,
        orderDirection: query.sortDirection ?? 'asc',
        limitCount: query.limit ?? 20,
      };

      const rows = await supabaseService.query<Record<string, unknown>>(
        TABLE,
        constraints,
        options,
      );
      const items = rows.map(toCategory);

      return {
        items,
        total: items.length,
        hasMore: items.length === (query.limit ?? 20),
        lastDoc: items[items.length - 1]?.id ?? null,
      };
    } catch (err) {
      throw new RepositoryError('Failed to query categories', 'findAll', TABLE, {
        query,
        error: err,
      });
    }
  }

  async findRootCategories(): Promise<Category[]> {
    try {
      const rows = await supabaseService.query<Record<string, unknown>>(
        TABLE,
        [
          { field: 'parent_id', operator: 'eq', value: null },
          { field: 'is_deleted', operator: 'eq', value: false },
        ],
        { orderByField: 'sort_order', orderDirection: 'asc' },
      );
      return rows.map(toCategory);
    } catch (err) {
      throw new RepositoryError('Failed to find root categories', 'findRootCategories', TABLE, {
        error: err,
      });
    }
  }

  async findChildren(parentId: string): Promise<Category[]> {
    try {
      const rows = await supabaseService.query<Record<string, unknown>>(
        TABLE,
        [
          { field: 'parent_id', operator: 'eq', value: parentId },
          { field: 'is_deleted', operator: 'eq', value: false },
        ],
        { orderByField: 'sort_order', orderDirection: 'asc' },
      );
      return rows.map(toCategory);
    } catch (err) {
      throw new RepositoryError('Failed to find children', 'findChildren', TABLE, {
        parentId,
        error: err,
      });
    }
  }

  async findDescendants(categoryId: string): Promise<Category[]> {
    try {
      const category = await this.findById(categoryId);
      if (!category) return [];

      const prefix = category.path + '/';
      const rows = await supabaseService.query<Record<string, unknown>>(TABLE, [
        { field: 'path', operator: 'gte', value: prefix },
        { field: 'path', operator: 'lt', value: prefix + '~' },
        { field: 'is_deleted', operator: 'eq', value: false },
      ]);
      return rows.map(toCategory);
    } catch (err) {
      throw new RepositoryError('Failed to find descendants', 'findDescendants', TABLE, {
        categoryId,
        error: err,
      });
    }
  }

  async findAncestors(categoryId: string): Promise<Category[]> {
    try {
      const category = await this.findById(categoryId);
      if (!category || !category.path) return [];

      const pathIds = category.path.split('/').filter(Boolean);
      const ancestors: Category[] = [];
      for (const id of pathIds) {
        const ancestor = await this.findById(id);
        if (ancestor) ancestors.push(ancestor);
      }
      return ancestors;
    } catch (err) {
      throw new RepositoryError('Failed to find ancestors', 'findAncestors', TABLE, {
        categoryId,
        error: err,
      });
    }
  }

  async findFeatured(limit = 10): Promise<Category[]> {
    try {
      const rows = await supabaseService.query<Record<string, unknown>>(
        TABLE,
        [
          { field: 'featured', operator: 'eq', value: true },
          { field: 'is_deleted', operator: 'eq', value: false },
        ],
        { orderByField: 'sort_order', orderDirection: 'asc', limitCount: limit },
      );
      return rows.map(toCategory);
    } catch (err) {
      throw new RepositoryError('Failed to find featured categories', 'findFeatured', TABLE, {
        limit,
        error: err,
      });
    }
  }

  async findVisible(query?: Partial<CategoryQuery>): Promise<PaginatedResult<Category>> {
    return this.findAll({
      ...query,
      status: CategoryStatus.ACTIVE,
      visibility: 'public',
      includeDeleted: false,
    } as CategoryQuery);
  }

  async findTree(): Promise<Category[]> {
    try {
      const result = await this.findAll({ includeDeleted: false, limit: 1000 } as CategoryQuery);
      return result.items;
    } catch (err) {
      throw new RepositoryError('Failed to find category tree', 'findTree', TABLE, { error: err });
    }
  }

  async search(term: string, query?: Partial<CategoryQuery>): Promise<PaginatedResult<Category>> {
    try {
      const lower = term.toLowerCase();
      const rows = await supabaseService.query<Record<string, unknown>>(
        TABLE,
        [{ field: 'is_deleted', operator: 'eq', value: false }],
        {
          orderByField: 'name',
          orderDirection: 'asc',
          limitCount: query?.limit ?? 20,
        },
      );
      const items = rows.map(toCategory).filter((c) => c.name.toLowerCase().includes(lower));

      return {
        items,
        total: items.length,
        hasMore: items.length === (query?.limit ?? 20),
        lastDoc: items[items.length - 1]?.id ?? null,
      };
    } catch (err) {
      throw new RepositoryError('Failed to search categories', 'search', TABLE, {
        term,
        error: err,
      });
    }
  }

  async exists(id: string): Promise<boolean> {
    const category = await this.findById(id);
    return category !== null;
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const category = await this.findBySlug(slug);
    return category !== null;
  }

  async count(query?: Partial<CategoryQuery>): Promise<number> {
    try {
      const constraints: SupabaseQuery[] = [{ field: 'is_deleted', operator: 'eq', value: false }];
      if (query?.status) {
        if (Array.isArray(query.status)) {
          constraints.push({ field: 'status', operator: 'in', value: query.status });
        } else {
          constraints.push({ field: 'status', operator: 'eq', value: query.status });
        }
      }
      if (query?.parentId !== undefined)
        constraints.push({ field: 'parent_id', operator: 'eq', value: query.parentId });
      const rows = await supabaseService.query<Record<string, unknown>>(TABLE, constraints);
      return rows.length;
    } catch (err) {
      throw new RepositoryError('Failed to count categories', 'count', TABLE, {
        query,
        error: err,
      });
    }
  }

  async create(
    data: CreateCategoryInput & { createdBy: string; slug: string; path: string; level: number },
  ): Promise<Category> {
    try {
      const now = new Date().toISOString();
      const docData = {
        ...data,
        description: data.description ?? '',
        thumbnail: data.thumbnail ?? null,
        banner: data.banner ?? null,
        icon: data.icon ?? null,
        seo: data.seo ?? null,
        metadata: data.metadata ?? {},
        visibility: data.visibility ?? 'public',
        featured: data.featured ?? false,
        productCount: 0,
        version: 1,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };
      const snakeData = objToSnakeCase(docData as unknown as Record<string, unknown>);
      const result = await supabaseService.add<Record<string, unknown>>(TABLE, snakeData);
      return toCategory({ ...snakeData, id: result.id });
    } catch (err) {
      throw new RepositoryError('Failed to create category', 'create', TABLE, {
        name: data.name,
        error: err,
      });
    }
  }

  async update(
    id: string,
    data: Partial<UpdateCategoryInput> & { updatedBy: string },
  ): Promise<Category> {
    try {
      const existing = await this.findById(id);
      if (!existing) throw new NotFoundError('Category not found');

      const snakeData = stripId(objToSnakeCase(data as unknown as Record<string, unknown>));
      await supabaseService.update(TABLE, id, snakeData);

      const updated = await this.findById(id);
      if (!updated) throw new NotFoundError('Category not found after update');
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to update category', 'update', TABLE, { id, error: err });
    }
  }

  async move(
    id: string,
    data: { parentId: string | null; path: string; level: number },
  ): Promise<Category> {
    try {
      await supabaseService.update(TABLE, id, {
        parent_id: data.parentId,
        path: data.path,
        level: data.level,
      });

      const updated = await this.findById(id);
      if (!updated) throw new NotFoundError('Category not found after move');
      return updated;
    } catch (err) {
      throw new RepositoryError('Failed to move category', 'move', TABLE, {
        id,
        newParentId: data.parentId,
        error: err,
      });
    }
  }

  async softDelete(id: string): Promise<void> {
    try {
      const existing = await this.findById(id);
      if (!existing) throw new NotFoundError('Category not found');
      await supabaseService.update(TABLE, id, {
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        status: CategoryStatus.ARCHIVED,
      });
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to soft-delete category', 'softDelete', TABLE, {
        id,
        error: err,
      });
    }
  }

  async restore(id: string): Promise<void> {
    try {
      const existing = await this.findById(id);
      if (!existing) throw new NotFoundError('Category not found');
      await supabaseService.update(TABLE, id, {
        is_deleted: false,
        deleted_at: null,
        status: CategoryStatus.DRAFT,
      });
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to restore category', 'restore', TABLE, { id, error: err });
    }
  }

  async archive(id: string): Promise<void> {
    try {
      const existing = await this.findById(id);
      if (!existing) throw new NotFoundError('Category not found');
      await supabaseService.update(TABLE, id, { status: CategoryStatus.ARCHIVED });
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to archive category', 'archive', TABLE, { id, error: err });
    }
  }

  async bulkUpdate(ids: string[], data: Partial<UpdateCategoryInput>): Promise<void> {
    try {
      const snakeData = stripId(objToSnakeCase(data as unknown as Record<string, unknown>));
      for (const id of ids) {
        await supabaseService.update(TABLE, id, snakeData);
      }
    } catch (err) {
      throw new RepositoryError('Failed to bulk update categories', 'bulkUpdate', TABLE, {
        ids,
        error: err,
      });
    }
  }

  async bulkArchive(ids: string[]): Promise<void> {
    try {
      for (const id of ids) {
        await supabaseService.update(TABLE, id, { status: CategoryStatus.ARCHIVED });
      }
    } catch (err) {
      throw new RepositoryError('Failed to bulk archive categories', 'bulkArchive', TABLE, {
        ids,
        error: err,
      });
    }
  }

  async refreshProductCount(id: string, count: number): Promise<void> {
    try {
      await supabaseService.update(TABLE, id, { product_count: count });
    } catch (err) {
      throw new RepositoryError('Failed to refresh product count', 'refreshProductCount', TABLE, {
        id,
        count,
        error: err,
      });
    }
  }
}
