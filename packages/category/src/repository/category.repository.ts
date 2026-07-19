import type {
  Category,
  CategoryQuery,
  CreateCategoryInput,
  PaginatedResult,
  UpdateCategoryInput,
} from '@oceanfresh/shared';

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  findByIds(ids: string[]): Promise<Category[]>;
  findAll(query: CategoryQuery): Promise<PaginatedResult<Category>>;
  findRootCategories(): Promise<Category[]>;
  findChildren(parentId: string): Promise<Category[]>;
  findDescendants(categoryId: string): Promise<Category[]>;
  findAncestors(categoryId: string): Promise<Category[]>;
  findFeatured(limit?: number): Promise<Category[]>;
  findVisible(query?: Partial<CategoryQuery>): Promise<PaginatedResult<Category>>;
  findTree(): Promise<Category[]>;
  search(term: string, query?: Partial<CategoryQuery>): Promise<PaginatedResult<Category>>;
  exists(id: string): Promise<boolean>;
  existsBySlug(slug: string): Promise<boolean>;
  count(query?: Partial<CategoryQuery>): Promise<number>;
  create(
    data: CreateCategoryInput & { createdBy: string; slug: string; path: string; level: number },
  ): Promise<Category>;
  update(id: string, data: Partial<UpdateCategoryInput> & { updatedBy: string }): Promise<Category>;
  move(
    id: string,
    data: { parentId: string | null; path: string; level: number },
  ): Promise<Category>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  archive(id: string): Promise<void>;
  bulkUpdate(ids: string[], data: Partial<UpdateCategoryInput>): Promise<void>;
  bulkArchive(ids: string[]): Promise<void>;
  refreshProductCount(id: string, count: number): Promise<void>;
}
