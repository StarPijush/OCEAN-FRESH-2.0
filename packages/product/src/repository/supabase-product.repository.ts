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
import {
  objToSnakeCase,
  rowToCamelCase,
  stripId,
  type SupabaseOptions,
  type SupabaseQuery,
  supabaseService,
} from '@oceanfresh/supabase';

import type { IProductRepository } from './product.repository.js';

const TABLE = 'products';

function toProduct(row: Record<string, unknown>): Product {
  return rowToCamelCase<Product>(row);
}

export class SupabaseProductRepository implements IProductRepository {
  async findById(id: string): Promise<Product | null> {
    try {
      const row = await supabaseService.get<Record<string, unknown>>(TABLE, id);
      if (!row) return null;
      const product = toProduct(row);
      if (product.isDeleted) return null;
      return product;
    } catch (err) {
      throw new RepositoryError('Failed to find product by ID', 'findById', TABLE, {
        id,
        error: err,
      });
    }
  }

  async findBySlug(slug: string): Promise<Product | null> {
    try {
      const results = await supabaseService.query<Record<string, unknown>>(
        TABLE,
        [
          { field: 'slug', operator: 'eq', value: slug },
          { field: 'is_deleted', operator: 'eq', value: false },
        ],
        { limitCount: 1 },
      );
      const row = results[0];
      return row ? toProduct(row) : null;
    } catch (err) {
      throw new RepositoryError('Failed to find product by slug', 'findBySlug', TABLE, {
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
      throw new RepositoryError('Failed to find products by IDs', 'findByIds', TABLE, {
        ids,
        error: err,
      });
    }
  }

  async findAll(query: ProductQuery): Promise<PaginatedResult<Product>> {
    try {
      const constraints: SupabaseQuery[] = [
        { field: 'is_deleted', operator: 'eq', value: query.includeDeleted ?? false },
      ];
      if (query.categoryId)
        constraints.push({ field: 'category_id', operator: 'eq', value: query.categoryId });
      if (query.status) {
        if (Array.isArray(query.status)) {
          constraints.push({ field: 'status', operator: 'in', value: query.status });
        } else {
          constraints.push({ field: 'status', operator: 'eq', value: query.status });
        }
      }
      if (query.featured !== undefined)
        constraints.push({ field: 'featured', operator: 'eq', value: query.featured });
      if (query.warehouseId)
        constraints.push({ field: 'warehouse_id', operator: 'eq', value: query.warehouseId });
      if (query.createdBy)
        constraints.push({ field: 'created_by', operator: 'eq', value: query.createdBy });
      if (query.priceMin !== undefined)
        constraints.push({ field: 'price', operator: 'gte', value: query.priceMin });
      if (query.priceMax !== undefined)
        constraints.push({ field: 'price', operator: 'lte', value: query.priceMax });

      const sortField =
        query.sort === ProductSortField.CREATED_AT
          ? 'created_at'
          : query.sort === ProductSortField.UPDATED_AT
            ? 'updated_at'
            : query.sort === ProductSortField.DISPLAY_ORDER
              ? 'sort_order'
              : (query.sort ?? 'name');
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
      const items = rows.map(toProduct);

      return {
        items,
        total: items.length,
        hasMore: items.length === (query.limit ?? 20),
        lastDoc: items.length > 0 ? (items[items.length - 1]?.id ?? null) : null,
      };
    } catch (err) {
      throw new RepositoryError('Failed to query products', 'findAll', TABLE, {
        query,
        error: err,
      });
    }
  }

  async findFeatured(limit = 10): Promise<Product[]> {
    try {
      const rows = await supabaseService.query<Record<string, unknown>>(
        TABLE,
        [
          { field: 'featured', operator: 'eq', value: true },
          { field: 'is_deleted', operator: 'eq', value: false },
        ],
        { orderByField: 'sort_order', orderDirection: 'asc', limitCount: limit },
      );
      return rows.map(toProduct);
    } catch (err) {
      throw new RepositoryError('Failed to find featured products', 'findFeatured', TABLE, {
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
      const constraints: SupabaseQuery[] = [{ field: 'is_deleted', operator: 'eq', value: false }];
      if (query?.categoryId)
        constraints.push({ field: 'category_id', operator: 'eq', value: query.categoryId });
      if (query?.status) constraints.push({ field: 'status', operator: 'eq', value: query.status });
      if (query?.featured !== undefined)
        constraints.push({ field: 'featured', operator: 'eq', value: query.featured });

      const options: SupabaseOptions = {
        orderByField: query?.sort ?? 'name',
        orderDirection: query?.sortDirection ?? 'asc',
        limitCount: query?.limit ?? 20,
      };

      const rows = await supabaseService.query<Record<string, unknown>>(
        TABLE,
        constraints,
        options,
      );
      const items = rows.map(toProduct).filter((p) => {
        const kw = p.searchKeywords ?? [];
        return Array.isArray(kw) && kw.some((k: string) => k.toLowerCase().includes(lower));
      });

      return {
        items,
        total: items.length,
        hasMore: items.length === (query?.limit ?? 20),
        lastDoc: items.length > 0 ? (items[items.length - 1]?.id ?? null) : null,
      };
    } catch (err) {
      throw new RepositoryError('Failed to search products', 'search', TABLE, { term, error: err });
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
      const constraints: SupabaseQuery[] = [{ field: 'is_deleted', operator: 'eq', value: false }];
      if (query?.categoryId)
        constraints.push({ field: 'category_id', operator: 'eq', value: query.categoryId });
      if (query?.status) {
        if (Array.isArray(query.status)) {
          constraints.push({ field: 'status', operator: 'in', value: query.status });
        } else {
          constraints.push({ field: 'status', operator: 'eq', value: query.status });
        }
      }
      const rows = await supabaseService.query<Record<string, unknown>>(TABLE, constraints);
      return rows.length;
    } catch (err) {
      throw new RepositoryError('Failed to count products', 'count', TABLE, { query, error: err });
    }
  }

  async create(data: CreateProductInput & { createdBy: string; slug: string }): Promise<Product> {
    try {
      const now = new Date().toISOString();
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
      const snakeData = objToSnakeCase(docData as unknown as Record<string, unknown>);
      const result = await supabaseService.add<Record<string, unknown>>(TABLE, snakeData);
      return toProduct({ ...snakeData, id: result.id });
    } catch (err) {
      throw new RepositoryError('Failed to create product', 'create', TABLE, {
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

      const snakeData = stripId(objToSnakeCase(data as unknown as Record<string, unknown>));
      await supabaseService.update(TABLE, id, snakeData);

      const updated = await this.findById(id);
      if (!updated) throw new NotFoundError('Product not found after update');
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to update product', 'update', TABLE, { id, error: err });
    }
  }

  async softDelete(id: string): Promise<void> {
    try {
      const existing = await this.findById(id);
      if (!existing) throw new NotFoundError('Product not found');
      await supabaseService.update(TABLE, id, {
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        status: ProductStatus.ARCHIVED,
      });
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to soft-delete product', 'softDelete', TABLE, {
        id,
        error: err,
      });
    }
  }

  async restore(id: string): Promise<void> {
    try {
      const existing = await this.findById(id);
      if (!existing) throw new NotFoundError('Product not found');
      await supabaseService.update(TABLE, id, {
        is_deleted: false,
        deleted_at: null,
        status: ProductStatus.DRAFT,
      });
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to restore product', 'restore', TABLE, { id, error: err });
    }
  }

  async archive(id: string): Promise<void> {
    try {
      const existing = await this.findById(id);
      if (!existing) throw new NotFoundError('Product not found');
      await supabaseService.update(TABLE, id, { status: ProductStatus.ARCHIVED });
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to archive product', 'archive', TABLE, { id, error: err });
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
      const now = new Date().toISOString();
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
      const snakeData = objToSnakeCase(docData as unknown as Record<string, unknown>);
      const result = await supabaseService.add<Record<string, unknown>>(TABLE, snakeData);
      return toProduct({ ...snakeData, id: result.id });
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to duplicate product', 'duplicate', TABLE, {
        id,
        error: err,
      });
    }
  }

  async bulkUpdate(ids: string[], data: Partial<UpdateProductInput>): Promise<void> {
    try {
      const snakeData = stripId(objToSnakeCase(data as unknown as Record<string, unknown>));
      for (const id of ids) {
        await supabaseService.update(TABLE, id, snakeData);
      }
    } catch (err) {
      throw new RepositoryError('Failed to bulk update products', 'bulkUpdate', TABLE, {
        ids,
        error: err,
      });
    }
  }

  async bulkDelete(ids: string[]): Promise<void> {
    try {
      for (const id of ids) {
        await supabaseService.update(TABLE, id, {
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          status: ProductStatus.ARCHIVED,
        });
      }
    } catch (err) {
      throw new RepositoryError('Failed to bulk delete products', 'bulkDelete', TABLE, {
        ids,
        error: err,
      });
    }
  }

  async bulkArchive(ids: string[]): Promise<void> {
    try {
      for (const id of ids) {
        await supabaseService.update(TABLE, id, { status: ProductStatus.ARCHIVED });
      }
    } catch (err) {
      throw new RepositoryError('Failed to bulk archive products', 'bulkArchive', TABLE, {
        ids,
        error: err,
      });
    }
  }

  async getLowStock(threshold: number): Promise<Product[]> {
    try {
      const rows = await supabaseService.query<Record<string, unknown>>(
        TABLE,
        [
          { field: 'is_deleted', operator: 'eq', value: false },
          { field: 'stock', operator: 'lte', value: threshold },
        ],
        { orderByField: 'stock', orderDirection: 'asc' },
      );
      return rows.map(toProduct);
    } catch (err) {
      throw new RepositoryError('Failed to get low stock products', 'getLowStock', TABLE, {
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
