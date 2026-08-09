import {
  objToSnakeCase,
  rowsToCamelCase,
  rowToCamelCase,
  stripId,
  type SupabaseOptions,
  type SupabaseQuery,
  supabaseService,
} from '@oceanfresh/supabase';

import { NotFoundError } from '../errors/not-found.error.js';
import { RepositoryError } from '../errors/repository.error.js';
import type { PaginatedResult } from '../types/common.js';
import { type ICacheStrategy, NullCacheStrategy } from './cache-strategy.js';

export interface PaginationInput {
  page?: number;
  limit?: number;
}

export type SortDirection = 'asc' | 'desc';

export interface SortInput {
  field: string;
  direction?: SortDirection;
}

export interface FilterInput {
  field: string;
  operator: SupabaseQuery['operator'];
  value: unknown;
}

export abstract class BaseRepository<T extends { id: string }> {
  protected abstract readonly tableName: string;
  protected abstract readonly allowedSortFields: string[];
  protected abstract readonly defaultSort: SortInput;
  protected readonly cacheStrategy: ICacheStrategy = new NullCacheStrategy();

  protected abstract toEntity(row: Record<string, unknown>): T;

  protected toSnake(data: Partial<T>): Record<string, unknown> {
    return objToSnakeCase(data as unknown as Record<string, unknown>);
  }

  protected toCamel(row: Record<string, unknown>): T {
    return rowToCamelCase<T>(row);
  }

  protected rowsToCamel(rows: Record<string, unknown>[]): T[] {
    return rowsToCamelCase<T>(rows);
  }

  protected generateCacheKey(method: string, args: Record<string, unknown>): string | null {
    void method;
    void args;
    return null;
  }

  protected getCacheTTL(method: string): number {
    void method;
    return 0;
  }

  async findById(id: string): Promise<T | null> {
    const cacheKey = this.generateCacheKey('findById', { id });
    if (cacheKey) {
      const cached = await this.cacheStrategy.get<T>(cacheKey);
      if (cached !== null) return cached;
    }

    try {
      const row = await supabaseService.get<Record<string, unknown>>(this.tableName, id);
      if (!row) return null;
      const entity = this.toEntity(row);
      if (cacheKey) {
        const ttl = this.getCacheTTL('findById');
        if (ttl > 0) void this.cacheStrategy.set(cacheKey, entity, ttl);
      }
      return entity;
    } catch (err) {
      throw new RepositoryError('Failed to find by ID', 'findById', this.tableName, {
        id,
        error: err,
      });
    }
  }

  async exists(id: string): Promise<boolean> {
    const entity = await this.findById(id);
    return entity !== null;
  }

  async count(filters: FilterInput[]): Promise<number> {
    try {
      const queries: SupabaseQuery[] = filters.map((f) => ({
        field: f.field,
        operator: f.operator,
        value: f.value,
      }));
      return supabaseService.count(this.tableName, queries);
    } catch (err) {
      throw new RepositoryError('Failed to count', 'count', this.tableName, {
        filters,
        error: err,
      });
    }
  }

  async save(data: Partial<T>): Promise<T> {
    try {
      const snakeData = this.toSnake(data);
      const row = await supabaseService.add<Record<string, unknown>>(this.tableName, snakeData);
      const entity = this.toCamel(row);
      void this.cacheStrategy.invalidate(`${this.tableName}:*`);
      return entity;
    } catch (err) {
      throw new RepositoryError('Failed to save', 'save', this.tableName, { data, error: err });
    }
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      const existing = await this.findById(id);
      if (!existing) throw new NotFoundError(`Entity not found in ${this.tableName}`);

      const snakeData = stripId(this.toSnake(data));
      await supabaseService.update(this.tableName, id, snakeData);

      const updated = await this.findById(id);
      if (!updated) throw new NotFoundError(`Entity not found after update in ${this.tableName}`);
      void this.cacheStrategy.invalidate(`${this.tableName}:*`);
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to update', 'update', this.tableName, { id, error: err });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const existing = await this.findById(id);
      if (!existing) throw new NotFoundError(`Entity not found in ${this.tableName}`);
      await supabaseService.remove(this.tableName, id);
      void this.cacheStrategy.invalidate(`${this.tableName}:*`);
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to delete', 'delete', this.tableName, { id, error: err });
    }
  }

  protected buildSort(sort?: SortInput): SupabaseOptions {
    const field = sort?.field ?? this.defaultSort.field;
    const direction = sort?.direction ?? this.defaultSort.direction ?? 'asc';

    if (!this.allowedSortFields.includes(field)) {
      return {
        orderByField: this.defaultSort.field,
        orderDirection: this.defaultSort.direction ?? 'asc',
      };
    }

    return {
      orderByField: field,
      orderDirection: direction,
    };
  }

  protected async paginatedQuery(
    filters: FilterInput[],
    sort?: SortInput,
    pagination?: PaginationInput,
  ): Promise<PaginatedResult<T>> {
    try {
      const queries: SupabaseQuery[] = filters.map((f) => ({
        field: f.field,
        operator: f.operator,
        value: f.value,
      }));

      const total = await supabaseService.count(this.tableName, queries);

      const page = pagination?.page ?? 1;
      const limit = pagination?.limit ?? 20;
      const offset = (page - 1) * limit;

      const sortOptions = this.buildSort(sort);
      const options: SupabaseOptions = {
        ...sortOptions,
        limitCount: limit,
        offset,
      };

      const rows = await supabaseService.query<Record<string, unknown>>(
        this.tableName,
        queries,
        options,
      );
      const items = rows.map((r) => this.toEntity(r));

      return {
        items,
        total,
        hasMore: offset + limit < total,
        lastDoc: items.length > 0 ? (items[items.length - 1]?.id ?? null) : null,
      };
    } catch (err) {
      throw new RepositoryError('Failed to paginated query', 'paginatedQuery', this.tableName, {
        filters,
        sort,
        pagination,
        error: err,
      });
    }
  }
}
