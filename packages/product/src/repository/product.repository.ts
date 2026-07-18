import type { Product, CreateProductInput, UpdateProductInput, ProductQuery, PaginatedResult } from '@oceanfresh/shared';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findByIds(ids: string[]): Promise<Product[]>;
  findAll(query: ProductQuery): Promise<PaginatedResult<Product>>;
  findFeatured(limit?: number): Promise<Product[]>;
  findByCategory(categoryId: string, query?: Partial<ProductQuery>): Promise<PaginatedResult<Product>>;
  findByStatus(status: string, query?: Partial<ProductQuery>): Promise<PaginatedResult<Product>>;
  search(term: string, query?: Partial<ProductQuery>): Promise<PaginatedResult<Product>>;
  exists(id: string): Promise<boolean>;
  existsBySlug(slug: string): Promise<boolean>;
  count(query?: Partial<ProductQuery>): Promise<number>;
  create(data: CreateProductInput & { createdBy: string; slug: string }): Promise<Product>;
  update(id: string, data: Partial<UpdateProductInput> & { updatedBy: string }): Promise<Product>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  archive(id: string): Promise<void>;
  duplicate(id: string): Promise<Product>;
  bulkUpdate(ids: string[], data: Partial<UpdateProductInput>): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
  bulkArchive(ids: string[]): Promise<void>;
  getLowStock(threshold: number): Promise<Product[]>;
}
