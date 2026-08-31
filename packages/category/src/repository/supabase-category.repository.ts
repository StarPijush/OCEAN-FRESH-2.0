import { type Category, RepositoryError } from '@oceanfresh/shared';
import { rowToCamelCase, supabaseService } from '@oceanfresh/supabase';

import type { CategoryFilter, ICategoryRepository } from './category.repository.js';

const TABLE = 'categories';

function toCategory(row: Record<string, unknown>): Category {
  const camel = rowToCamelCase<Record<string, unknown>>(row);
  return {
    ...camel,
    createdAt: camel.createdAt ? new Date(camel.createdAt as string) : new Date(),
    updatedAt: camel.updatedAt ? new Date(camel.updatedAt as string) : new Date(),
    deletedAt: camel.deletedAt ? new Date(camel.deletedAt as string) : null,
  } as unknown as Category;
}

export class SupabaseCategoryRepository implements ICategoryRepository {
  async findAll(filter: CategoryFilter = {}): Promise<Category[]> {
    try {
      const constraints: { field: string; operator: 'eq'; value: unknown }[] = [];
      if (filter.status) {
        constraints.push({ field: 'status', operator: 'eq', value: filter.status });
      }
      if (!filter.includeDeleted) {
        constraints.push({ field: 'is_deleted', operator: 'eq', value: false });
      }
      const rows = await supabaseService.query<Record<string, unknown>>(TABLE, constraints, {
        orderByField: 'sort_order',
        orderDirection: 'asc',
      });
      return rows.map((row) => toCategory(row));
    } catch (err) {
      throw new RepositoryError('Failed to query categories', 'findAll', TABLE, {
        filter,
        error: err,
      });
    }
  }

  async findById(id: string): Promise<Category | null> {
    try {
      const row = await supabaseService.get<Record<string, unknown>>(TABLE, id);
      if (!row) return null;
      return toCategory(row);
    } catch (err) {
      throw new RepositoryError('Failed to find category by id', 'findById', TABLE, {
        id,
        error: err,
      });
    }
  }

  async findBySlug(slug: string): Promise<Category | null> {
    try {
      const rows = await supabaseService.query<Record<string, unknown>>(TABLE, [
        { field: 'slug', operator: 'eq', value: slug },
        { field: 'is_deleted', operator: 'eq', value: false },
      ]);
      if (rows.length === 0) return null;
      return toCategory(rows[0] as Record<string, unknown>);
    } catch (err) {
      throw new RepositoryError('Failed to find category by slug', 'findBySlug', TABLE, {
        slug,
        error: err,
      });
    }
  }
}
