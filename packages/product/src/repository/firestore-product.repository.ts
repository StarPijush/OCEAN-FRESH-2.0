import { type FirestoreOptions, type FirestoreQuery, firestoreService } from '@oceanfresh/firebase';
import {
  type CreateProductInput,
  NotFoundError,
  type PaginatedResult,
  type Product,
  type ProductQuery,
  ProductSortField,
  ProductStatus,
  RepositoryError,
  slugify,
  type UpdateProductInput,
} from '@oceanfresh/shared';
import { Timestamp } from 'firebase/firestore';

import type { IProductRepository } from './product.repository.js';

const COLLECTION = 'products';

function docToProduct(id: string, data: Record<string, unknown>): Product {
  return { id, ...data } as unknown as Product;
}

function serializeProductData(data: Record<string, unknown>): Record<string, unknown> {
  const result = { ...data };
  delete result.id;
  return result;
}

export class FirestoreProductRepository implements IProductRepository {
  async findById(id: string): Promise<Product | null> {
    try {
      const doc = await firestoreService.get<Record<string, unknown> & { id: string }>(
        COLLECTION,
        id,
      );
      if (!doc) return null;
      const product = docToProduct(doc.id, doc);
      if (product.isDeleted) return null;
      return product;
    } catch (err) {
      throw new RepositoryError('Failed to find product by ID', 'findById', COLLECTION, {
        id,
        error: err,
      });
    }
  }

  async findBySlug(slug: string): Promise<Product | null> {
    try {
      const results = await firestoreService.query<Record<string, unknown> & { id: string }>(
        COLLECTION,
        [
          { field: 'slug', operator: '==', value: slug },
          { field: 'isDeleted', operator: '==', value: false },
        ],
        { limitCount: 1 },
      );
      const doc = results[0];
      return doc ? docToProduct(doc.id, doc) : null;
    } catch (err) {
      throw new RepositoryError('Failed to find product by slug', 'findBySlug', COLLECTION, {
        slug,
        error: err,
      });
    }
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];
    try {
      const results: Product[] = [];
      for (const id of ids) {
        const product = await this.findById(id);
        if (product) results.push(product);
      }
      return results;
    } catch (err) {
      throw new RepositoryError('Failed to find products by IDs', 'findByIds', COLLECTION, {
        ids,
        error: err,
      });
    }
  }

  async findAll(query: ProductQuery): Promise<PaginatedResult<Product>> {
    try {
      const constraints: FirestoreQuery[] = [
        { field: 'isDeleted', operator: '==', value: query.includeDeleted ?? false },
      ];
      if (query.categoryId)
        constraints.push({ field: 'categoryId', operator: '==', value: query.categoryId });
      if (query.status) {
        if (Array.isArray(query.status)) {
          constraints.push({ field: 'status', operator: 'in', value: query.status });
        } else {
          constraints.push({ field: 'status', operator: '==', value: query.status });
        }
      }
      if (query.featured !== undefined)
        constraints.push({ field: 'featured', operator: '==', value: query.featured });
      if (query.warehouseId)
        constraints.push({ field: 'warehouseId', operator: '==', value: query.warehouseId });
      if (query.createdBy)
        constraints.push({ field: 'createdBy', operator: '==', value: query.createdBy });
      if (query.priceMin !== undefined)
        constraints.push({ field: 'price', operator: '>=', value: query.priceMin });
      if (query.priceMax !== undefined)
        constraints.push({ field: 'price', operator: '<=', value: query.priceMax });

      const options: FirestoreOptions = {
        orderByField: query.sort ?? ProductSortField.NAME,
        orderDirection: query.sortDirection ?? 'asc',
        limitCount: query.limit ?? 20,
      };

      const docs = await firestoreService.query<Record<string, unknown> & { id: string }>(
        COLLECTION,
        constraints,
        options,
      );
      const items = docs.map((d) => docToProduct(d.id, d));

      return {
        items,
        total: items.length,
        hasMore: items.length === (query.limit ?? 20),
        lastDoc: items.length > 0 ? (items[items.length - 1]?.id ?? null) : null,
      };
    } catch (err) {
      throw new RepositoryError('Failed to query products', 'findAll', COLLECTION, {
        query,
        error: err,
      });
    }
  }

  async findFeatured(limit = 10): Promise<Product[]> {
    try {
      const docs = await firestoreService.query<Record<string, unknown> & { id: string }>(
        COLLECTION,
        [
          { field: 'featured', operator: '==', value: true },
          { field: 'isDeleted', operator: '==', value: false },
        ],
        { orderByField: 'sortOrder', orderDirection: 'asc', limitCount: limit },
      );
      return docs.map((d) => docToProduct(d.id, d));
    } catch (err) {
      throw new RepositoryError('Failed to find featured products', 'findFeatured', COLLECTION, {
        limit,
        error: err,
      });
    }
  }

  async findByCategory(
    categoryId: string,
    query?: Partial<ProductQuery>,
  ): Promise<PaginatedResult<Product>> {
    return this.findAll({ ...query, categoryId } as ProductQuery);
  }

  async findByStatus(
    status: string,
    query?: Partial<ProductQuery>,
  ): Promise<PaginatedResult<Product>> {
    return this.findAll({ ...query, status: status as ProductStatus } as ProductQuery);
  }

  async search(term: string, query?: Partial<ProductQuery>): Promise<PaginatedResult<Product>> {
    try {
      const lower = term.toLowerCase();
      const constraints: FirestoreQuery[] = [
        { field: 'isDeleted', operator: '==', value: false },
        { field: 'searchKeywords', operator: 'array-contains', value: lower },
      ];
      if (query?.categoryId)
        constraints.push({ field: 'categoryId', operator: '==', value: query.categoryId });
      if (query?.status) constraints.push({ field: 'status', operator: '==', value: query.status });
      if (query?.featured !== undefined)
        constraints.push({ field: 'featured', operator: '==', value: query.featured });

      const options: FirestoreOptions = {
        orderByField: query?.sort ?? ProductSortField.NAME,
        orderDirection: query?.sortDirection ?? 'asc',
        limitCount: query?.limit ?? 20,
      };

      const docs = await firestoreService.query<Record<string, unknown> & { id: string }>(
        COLLECTION,
        constraints,
        options,
      );
      const items = docs.map((d) => docToProduct(d.id, d));

      return {
        items,
        total: items.length,
        hasMore: items.length === (query?.limit ?? 20),
        lastDoc: items.length > 0 ? (items[items.length - 1]?.id ?? null) : null,
      };
    } catch (err) {
      throw new RepositoryError('Failed to search products', 'search', COLLECTION, {
        term,
        error: err,
      });
    }
  }

  async exists(id: string): Promise<boolean> {
    const product = await this.findById(id);
    return product !== null;
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const product = await this.findBySlug(slug);
    return product !== null;
  }

  async count(query?: Partial<ProductQuery>): Promise<number> {
    try {
      const constraints: FirestoreQuery[] = [{ field: 'isDeleted', operator: '==', value: false }];
      if (query?.categoryId)
        constraints.push({ field: 'categoryId', operator: '==', value: query.categoryId });
      if (query?.status) {
        if (Array.isArray(query.status)) {
          constraints.push({ field: 'status', operator: 'in', value: query.status });
        } else {
          constraints.push({ field: 'status', operator: '==', value: query.status });
        }
      }
      const docs = await firestoreService.query<Record<string, unknown> & { id: string }>(
        COLLECTION,
        constraints,
        {},
      );
      return docs.length;
    } catch (err) {
      throw new RepositoryError('Failed to count products', 'count', COLLECTION, {
        query,
        error: err,
      });
    }
  }

  async create(data: CreateProductInput & { createdBy: string; slug: string }): Promise<Product> {
    try {
      const now = Timestamp.now();
      const docData = {
        ...data,
        thumbnail: '',
        gallery: [],
        variants: data.variants ?? null,
        metadata: data.metadata ?? {},
        version: 1,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };
      const result = await firestoreService.add<Record<string, unknown>>(
        COLLECTION,
        docData as unknown as Record<string, unknown>,
      );
      return docToProduct(result.id as string, { ...docData, id: result.id });
    } catch (err) {
      throw new RepositoryError('Failed to create product', 'create', COLLECTION, {
        name: data.name,
        error: err,
      });
    }
  }

  async update(
    id: string,
    data: Partial<UpdateProductInput> & { updatedBy: string },
  ): Promise<Product> {
    try {
      const existing = await this.findById(id);
      if (!existing) throw new NotFoundError('Product not found');

      const serialized = serializeProductData(data as unknown as Record<string, unknown>);
      await firestoreService.update(COLLECTION, id, serialized);

      const updated = await this.findById(id);
      if (!updated) throw new NotFoundError('Product not found after update');
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to update product', 'update', COLLECTION, {
        id,
        error: err,
      });
    }
  }

  async softDelete(id: string): Promise<void> {
    try {
      const existing = await this.findById(id);
      if (!existing) throw new NotFoundError('Product not found');
      await firestoreService.update(COLLECTION, id, {
        isDeleted: true,
        deletedAt: Timestamp.now(),
        status: ProductStatus.ARCHIVED,
      } as unknown as Record<string, unknown>);
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to soft-delete product', 'softDelete', COLLECTION, {
        id,
        error: err,
      });
    }
  }

  async restore(id: string): Promise<void> {
    try {
      const existing = await this.findById(id);
      if (!existing) throw new NotFoundError('Product not found');
      await firestoreService.update(COLLECTION, id, {
        isDeleted: false,
        deletedAt: null,
        status: ProductStatus.DRAFT,
      } as unknown as Record<string, unknown>);
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to restore product', 'restore', COLLECTION, {
        id,
        error: err,
      });
    }
  }

  async archive(id: string): Promise<void> {
    try {
      const existing = await this.findById(id);
      if (!existing) throw new NotFoundError('Product not found');
      await firestoreService.update(COLLECTION, id, {
        status: ProductStatus.ARCHIVED,
      } as unknown as Record<string, unknown>);
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to archive product', 'archive', COLLECTION, {
        id,
        error: err,
      });
    }
  }

  async duplicate(id: string): Promise<Product> {
    try {
      const existing = await this.findById(id);
      if (!existing) throw new NotFoundError('Product not found');

      const rest = { ...existing } as Record<string, unknown>;
      delete rest.id;
      delete rest.createdAt;
      delete rest.updatedAt;
      delete rest.deletedAt;
      delete rest.version;
      const newSlug = await this.generateUniqueSlug(rest.name as string);
      const now = Timestamp.now();
      const docData = {
        ...rest,
        slug: newSlug,
        status: ProductStatus.DRAFT,
        version: 1,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };
      const result = await firestoreService.add<Record<string, unknown>>(
        COLLECTION,
        docData as unknown as Record<string, unknown>,
      );
      return docToProduct(result.id as string, { ...docData, id: result.id });
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to duplicate product', 'duplicate', COLLECTION, {
        id,
        error: err,
      });
    }
  }

  async bulkUpdate(ids: string[], data: Partial<UpdateProductInput>): Promise<void> {
    try {
      const serialized = serializeProductData(data as unknown as Record<string, unknown>);
      for (const id of ids) {
        await firestoreService.update(COLLECTION, id, serialized);
      }
    } catch (err) {
      throw new RepositoryError('Failed to bulk update products', 'bulkUpdate', COLLECTION, {
        ids,
        error: err,
      });
    }
  }

  async bulkDelete(ids: string[]): Promise<void> {
    try {
      for (const id of ids) {
        await firestoreService.update(COLLECTION, id, {
          isDeleted: true,
          deletedAt: Timestamp.now(),
          status: ProductStatus.ARCHIVED,
        } as unknown as Record<string, unknown>);
      }
    } catch (err) {
      throw new RepositoryError('Failed to bulk delete products', 'bulkDelete', COLLECTION, {
        ids,
        error: err,
      });
    }
  }

  async bulkArchive(ids: string[]): Promise<void> {
    try {
      for (const id of ids) {
        await firestoreService.update(COLLECTION, id, {
          status: ProductStatus.ARCHIVED,
        } as unknown as Record<string, unknown>);
      }
    } catch (err) {
      throw new RepositoryError('Failed to bulk archive products', 'bulkArchive', COLLECTION, {
        ids,
        error: err,
      });
    }
  }

  async getLowStock(threshold: number): Promise<Product[]> {
    try {
      const docs = await firestoreService.query<Record<string, unknown> & { id: string }>(
        COLLECTION,
        [
          { field: 'isDeleted', operator: '==', value: false },
          { field: 'stock', operator: '<=', value: threshold },
        ],
        { orderByField: 'stock', orderDirection: 'asc' },
      );
      return docs.map((d) => docToProduct(d.id, d));
    } catch (err) {
      throw new RepositoryError('Failed to get low stock products', 'getLowStock', COLLECTION, {
        threshold,
        error: err,
      });
    }
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = slugify(name);
    let slug = base;
    let counter = 1;
    while (await this.existsBySlug(slug)) {
      slug = `${base}-${counter}`;
      counter++;
    }
    return slug;
  }
}
