import type { Category, CategoryStatus } from '@oceanfresh/shared';

export interface CategoryFilter {
  status?: CategoryStatus;
  /** When true, soft-deleted categories are also returned. */
  includeDeleted?: boolean;
}

export interface ICategoryRepository {
  findAll(filter?: CategoryFilter): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
}
