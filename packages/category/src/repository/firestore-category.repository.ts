import { firestoreService, type FirestoreQuery, type FirestoreOptions } from '@oceanfresh/firebase';
import { Timestamp } from 'firebase/firestore';
import {
  slugify,
  NotFoundError,
  RepositoryError,
  ConcurrencyError,
  createLogger,
  type Category,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type CategoryQuery,
  type PaginatedResult,
  CategoryStatus,
  CategorySortField,
} from '@oceanfresh/shared';
import type { ICategoryRepository } from './category.repository.js';

const logger = createLogger('category:repository');

const COLLECTION = 'categories';
const MAX_DEPTH = 5;

function docToCategory(id: string, data: Record<string, unknown>): Category {
  return { id, ...data } as unknown as Category;
}

function serializeCategoryData(data: Record<string, unknown>): Record<string, unknown> {
  const { id: _id, ...rest } = data;
  return rest;
}

export class FirestoreCategoryRepository implements ICategoryRepository {
  async findById(id: string): Promise<Category | null> {
    try {
      const doc = await firestoreService.get<Record<string, unknown> & { id: string }>(COLLECTION, id);
      if (!doc) return null;
      const category = docToCategory(doc.id, doc);
      if (category.isDeleted) return null;
      return category;
    } catch (err) {
      throw new RepositoryError('Failed to find category by ID', 'findById', COLLECTION, { id, error: err });
    }
  }

  async findBySlug(slug: string): Promise<Category | null> {
    try {
      const docs = await firestoreService.query<Record<string, unknown> & { id: string }>(COLLECTION, [
        { field: 'slug', operator: '==', value: slug },
        { field: 'isDeleted', operator: '==', value: false },
      ], { limitCount: 1 });
      const doc = docs[0];
      return doc ? docToCategory(doc.id, doc) : null;
    } catch (err) {
      throw new RepositoryError('Failed to find category by slug', 'findBySlug', COLLECTION, { slug, error: err });
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
      throw new RepositoryError('Failed to find categories by IDs', 'findByIds', COLLECTION, { ids, error: err });
    }
  }

  async findAll(query: CategoryQuery): Promise<PaginatedResult<Category>> {
    try {
      const constraints: FirestoreQuery[] = [{ field: 'isDeleted', operator: '==', value: query.includeDeleted ?? false }];
      if (query.parentId !== undefined) constraints.push({ field: 'parentId', operator: '==', value: query.parentId });
      if (query.status) {
        if (Array.isArray(query.status)) {
          constraints.push({ field: 'status', operator: 'in', value: query.status });
        } else {
          constraints.push({ field: 'status', operator: '==', value: query.status });
        }
      }
      if (query.visibility && query.visibility !== 'all') constraints.push({ field: 'visibility', operator: '==', value: query.visibility });
      if (query.featured !== undefined) constraints.push({ field: 'featured', operator: '==', value: query.featured });
      if (query.level !== undefined) constraints.push({ field: 'level', operator: '==', value: query.level });

      const options: FirestoreOptions = {
        orderByField: query.sort ?? CategorySortField.SORT_ORDER,
        orderDirection: query.sortDirection ?? 'asc',
        limitCount: query.limit ?? 20,
      };

      const docs = await firestoreService.query<Record<string, unknown> & { id: string }>(COLLECTION, constraints, options);
      const items = docs.map((d) => docToCategory(d.id, d));

      return {
        items,
        total: items.length,
        hasMore: items.length === (query.limit ?? 20),
        lastDoc: items.length > 0 && items[items.length - 1] ? items[items.length - 1]!.id : null,
      };
    } catch (err) {
      throw new RepositoryError('Failed to query categories', 'findAll', COLLECTION, { query, error: err });
    }
  }

  async findRootCategories(): Promise<Category[]> {
    try {
      const docs = await firestoreService.query<Record<string, unknown> & { id: string }>(COLLECTION, [
        { field: 'parentId', operator: '==', value: null },
        { field: 'isDeleted', operator: '==', value: false },
      ], { orderByField: 'sortOrder', orderDirection: 'asc' });
      return docs.map((d) => docToCategory(d.id, d));
    } catch (err) {
      throw new RepositoryError('Failed to find root categories', 'findRootCategories', COLLECTION, { error: err });
    }
  }

  async findChildren(parentId: string): Promise<Category[]> {
    try {
      const docs = await firestoreService.query<Record<string, unknown> & { id: string }>(COLLECTION, [
        { field: 'parentId', operator: '==', value: parentId },
        { field: 'isDeleted', operator: '==', value: false },
      ], { orderByField: 'sortOrder', orderDirection: 'asc' });
      return docs.map((d) => docToCategory(d.id, d));
    } catch (err) {
      throw new RepositoryError('Failed to find children', 'findChildren', COLLECTION, { parentId, error: err });
    }
  }

  async findDescendants(categoryId: string): Promise<Category[]> {
    try {
      const category = await this.findById(categoryId);
      if (!category) return [];

      const prefix = category.path + '/';
      const docs = await firestoreService.query<Record<string, unknown> & { id: string }>(COLLECTION, [
        { field: 'path', operator: '>=', value: prefix },
        { field: 'path', operator: '<', value: prefix + '~' },
        { field: 'isDeleted', operator: '==', value: false },
      ]);
      return docs.map((d) => docToCategory(d.id, d));
    } catch (err) {
      throw new RepositoryError('Failed to find descendants', 'findDescendants', COLLECTION, { categoryId, error: err });
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
      throw new RepositoryError('Failed to find ancestors', 'findAncestors', COLLECTION, { categoryId, error: err });
    }
  }

  async findFeatured(limit = 10): Promise<Category[]> {
    try {
      const docs = await firestoreService.query<Record<string, unknown> & { id: string }>(COLLECTION, [
        { field: 'featured', operator: '==', value: true },
        { field: 'isDeleted', operator: '==', value: false },
      ], { orderByField: 'sortOrder', orderDirection: 'asc', limitCount: limit });
      return docs.map((d) => docToCategory(d.id, d));
    } catch (err) {
      throw new RepositoryError('Failed to find featured categories', 'findFeatured', COLLECTION, { limit, error: err });
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
      throw new RepositoryError('Failed to find category tree', 'findTree', COLLECTION, { error: err });
    }
  }

  async search(term: string, query?: Partial<CategoryQuery>): Promise<PaginatedResult<Category>> {
    try {
      const lower = term.toLowerCase();
      const docs = await firestoreService.query<Record<string, unknown> & { id: string }>(COLLECTION, [
        { field: 'isDeleted', operator: '==', value: false },
        { field: 'name', operator: '>=', value: lower },
        { field: 'name', operator: '<=', value: lower + '\uf8ff' },
      ], {
        orderByField: 'name',
        orderDirection: 'asc',
        limitCount: query?.limit ?? 20,
      });
      const items = docs.map((d) => docToCategory(d.id, d));
      return {
        items,
        total: items.length,
        hasMore: items.length === (query?.limit ?? 20),
        lastDoc: items.length > 0 && items[items.length - 1] ? items[items.length - 1]!.id : null,
      };
    } catch (err) {
      throw new RepositoryError('Failed to search categories', 'search', COLLECTION, { term, error: err });
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
      const constraints: FirestoreQuery[] = [{ field: 'isDeleted', operator: '==', value: false }];
      if (query?.status) {
        if (Array.isArray(query.status)) {
          constraints.push({ field: 'status', operator: 'in', value: query.status });
        } else {
          constraints.push({ field: 'status', operator: '==', value: query.status });
        }
      }
      if (query?.parentId !== undefined) constraints.push({ field: 'parentId', operator: '==', value: query.parentId });
      const docs = await firestoreService.query<Record<string, unknown>>(COLLECTION, constraints, {});
      return docs.length;
    } catch (err) {
      throw new RepositoryError('Failed to count categories', 'count', COLLECTION, { query, error: err });
    }
  }

  async create(data: CreateCategoryInput & { createdBy: string; slug: string; path: string; level: number }): Promise<Category> {
    try {
      const now = Timestamp.now();
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
      const result = await firestoreService.add<Record<string, unknown>>(COLLECTION, docData as unknown as Record<string, unknown>);
      return docToCategory(result.id as string, { ...docData, id: result.id });
    } catch (err) {
      throw new RepositoryError('Failed to create category', 'create', COLLECTION, { name: data.name, error: err });
    }
  }

  async update(id: string, data: Partial<UpdateCategoryInput> & { updatedBy: string }): Promise<Category> {
    try {
      const existing = await this.findById(id);
      if (!existing) throw new NotFoundError('Category not found');

      const serialized = serializeCategoryData(data as unknown as Record<string, unknown>);
      await firestoreService.update(COLLECTION, id, serialized);

      const updated = await this.findById(id);
      if (!updated) throw new NotFoundError('Category not found after update');
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to update category', 'update', COLLECTION, { id, error: err });
    }
  }

  async move(id: string, data: { parentId: string | null; path: string; level: number }): Promise<Category> {
    try {
      await firestoreService.update(COLLECTION, id, {
        parentId: data.parentId,
        path: data.path,
        level: data.level,
        updatedAt: Timestamp.now(),
      } as unknown as Record<string, unknown>);

      const updated = await this.findById(id);
      if (!updated) throw new NotFoundError('Category not found after move');
      return updated;
    } catch (err) {
      throw new RepositoryError('Failed to move category', 'move', COLLECTION, { id, newParentId: data.parentId, error: err });
    }
  }

  async softDelete(id: string): Promise<void> {
    try {
      const existing = await this.findById(id);
      if (!existing) throw new NotFoundError('Category not found');
      await firestoreService.update(COLLECTION, id, {
        isDeleted: true,
        deletedAt: Timestamp.now(),
        status: CategoryStatus.ARCHIVED,
      } as unknown as Record<string, unknown>);
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to soft-delete category', 'softDelete', COLLECTION, { id, error: err });
    }
  }

  async restore(id: string): Promise<void> {
    try {
      const existing = await this.findById(id);
      if (!existing) throw new NotFoundError('Category not found');
      await firestoreService.update(COLLECTION, id, {
        isDeleted: false,
        deletedAt: null,
        status: CategoryStatus.DRAFT,
      } as unknown as Record<string, unknown>);
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to restore category', 'restore', COLLECTION, { id, error: err });
    }
  }

  async archive(id: string): Promise<void> {
    try {
      const existing = await this.findById(id);
      if (!existing) throw new NotFoundError('Category not found');
      await firestoreService.update(COLLECTION, id, {
        status: CategoryStatus.ARCHIVED,
      } as unknown as Record<string, unknown>);
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to archive category', 'archive', COLLECTION, { id, error: err });
    }
  }

  async bulkUpdate(ids: string[], data: Partial<UpdateCategoryInput>): Promise<void> {
    try {
      const serialized = serializeCategoryData(data as unknown as Record<string, unknown>);
      for (const id of ids) {
        await firestoreService.update(COLLECTION, id, serialized);
      }
    } catch (err) {
      throw new RepositoryError('Failed to bulk update categories', 'bulkUpdate', COLLECTION, { ids, error: err });
    }
  }

  async bulkArchive(ids: string[]): Promise<void> {
    try {
      for (const id of ids) {
        await firestoreService.update(COLLECTION, id, {
          status: CategoryStatus.ARCHIVED,
        } as unknown as Record<string, unknown>);
      }
    } catch (err) {
      throw new RepositoryError('Failed to bulk archive categories', 'bulkArchive', COLLECTION, { ids, error: err });
    }
  }

  async refreshProductCount(id: string, count: number): Promise<void> {
    try {
      await firestoreService.update(COLLECTION, id, {
        productCount: count,
      } as unknown as Record<string, unknown>);
    } catch (err) {
      throw new RepositoryError('Failed to refresh product count', 'refreshProductCount', COLLECTION, { id, count, error: err });
    }
  }
}
