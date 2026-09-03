import type { Timestamp } from './common.js';

export enum ProductUnit {
  GRAM = 'GRAM',
  KG = 'KG',
  PIECE = 'PIECE',
  DOZEN = 'DOZEN',
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  COMING_SOON = 'COMING_SOON',
  DISCONTINUED = 'DISCONTINUED',
  ARCHIVED = 'ARCHIVED',
  HIDDEN = 'HIDDEN',
  PREORDER = 'PREORDER',
}

export enum ProductSortField {
  NAME = 'name',
  PRICE = 'price',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  STOCK = 'stock',
  DISPLAY_ORDER = 'displayOrder',
}

export enum ProductEventType {
  CREATED = 'product.created',
  UPDATED = 'product.updated',
  DELETED = 'product.deleted',
  RESTORED = 'product.restored',
  ARCHIVED = 'product.archived',
  PRICE_CHANGED = 'product.price_changed',
  STOCK_CHANGED = 'product.stock_changed',
  STATUS_CHANGED = 'product.status_changed',
  IMAGE_UPLOADED = 'product.image_uploaded',
  CATEGORY_CHANGED = 'product.category_changed',
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

export interface ProductSeo {
  title: string;
  description: string;
  canonicalUrl: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  unit: ProductUnit;
  weight: number | null;
  weightUnit: 'g' | 'kg' | 'lb';
  images: string[];
  isDefault: boolean;
}

export interface ProductEvent {
  type: ProductEventType;
  productId: string;
  previousState: Partial<Product> | null;
  currentState: Partial<Product> | null;
  timestamp: number;
  correlationId: string;
  triggeredBy: string;
  metadata?: Record<string, unknown>;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  barcode: string | null;
  description: string;
  /**
   * Canonical price per 1 KG (₹ per 1000g). Single source.
   * DB column "price" stores pricePerKg. Customer mode GRAM|KG only
   * changes display/presets; internally lineTotal = pricePerKg*grams/1000
   * via calculatePriceFromKg. Admin UI shows "PRICE / KG".
   */
  price: number;
  compareAtPrice: number | null;
  categoryId: string;
  images: string[];
  thumbnail: string;
  gallery: string[];
  status: ProductStatus;
  featured: boolean;
  /** @deprecated — kept for DB compatibility (stock column). Use status ACTIVE vs OUT_OF_STOCK. */
  stock: number;
  weight: number | null;
  weightUnit: 'g' | 'kg' | 'lb';
  dimensions: ProductDimensions | null;
  /**
   * @deprecated — DORMANT for pricing. Price always from pricePerKg above.
   * Unit kept for row compatibility (GRAM/KG still valid mode, PIECE/DOZEN legacy).
   * New products default to KG; application no longer reads this as pricing basis.
   */
  unit: ProductUnit;
  tags: string[];
  searchKeywords: string[];
  seo: ProductSeo | null;
  metadata: Record<string, unknown>;
  version: number;
  sortOrder: number;
  warehouseId: string | null;
  variants: ProductVariant[] | null;
  /** @deprecated — kept for DB compatibility. Weight presets replace min order qty. */
  minOrderQuantity: number;
  createdBy: string;
  updatedBy: string | null;
  isDeleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
}

export interface CreateProductInput {
  id?: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  status?: ProductStatus;
  featured?: boolean;
  stock?: number;
  unit?: ProductUnit;
  tags?: string[];
  searchKeywords?: string[];
  weight?: number;
  weightUnit?: 'g' | 'kg' | 'lb';
  dimensions?: ProductDimensions;
  sku?: string;
  barcode?: string;
  thumbnail?: string;
  gallery?: string[];
  seo?: ProductSeo;
  metadata?: Record<string, unknown>;
  sortOrder?: number;
  warehouseId?: string;
  variants?: ProductVariant[];
  minOrderQuantity?: number;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}

export interface ProductQuery {
  categoryId?: string;
  status?: ProductStatus | ProductStatus[];
  featured?: boolean;
  availability?: 'in_stock' | 'out_of_stock' | 'all';
  search?: string;
  tags?: string[];
  priceMin?: number;
  priceMax?: number;
  createdBy?: string;
  warehouseId?: string;
  sort?: ProductSortField;
  sortDirection?: 'asc' | 'desc';
  cursor?: string;
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
}
