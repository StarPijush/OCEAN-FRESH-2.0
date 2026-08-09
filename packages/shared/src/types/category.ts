import type { Timestamp } from './common.js';

export enum CategoryStatus {
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
  HIDDEN = 'HIDDEN',
  ARCHIVED = 'ARCHIVED',
}

export enum CategorySortField {
  NAME = 'name',
  SORT_ORDER = 'sortOrder',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  PRODUCT_COUNT = 'productCount',
  LEVEL = 'level',
}

export enum CategoryEventType {
  CREATED = 'category.created',
  UPDATED = 'category.updated',
  DELETED = 'category.deleted',
  RESTORED = 'category.restored',
  ARCHIVED = 'category.archived',
  MOVED = 'category.moved',
  FEATURED = 'category.featured',
  VISIBILITY_CHANGED = 'category.visibility_changed',
}

export interface CategorySeo {
  title: string;
  description: string;
  canonicalUrl: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  path: string;
  level: number;
  sortOrder: number;
  status: CategoryStatus;
  visibility: 'public' | 'private' | 'restricted';
  featured: boolean;
  thumbnail: string | null;
  banner: string | null;
  icon: string | null;
  seo: CategorySeo | null;
  metadata: Record<string, unknown>;
  productCount: number;
  createdBy: string;
  updatedBy: string | null;
  version: number;
  isDeleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  status?: CategoryStatus;
  visibility?: 'public' | 'private' | 'restricted';
  featured?: boolean;
  thumbnail?: string;
  banner?: string;
  icon?: string;
  seo?: CategorySeo;
  metadata?: Record<string, unknown>;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
}

export interface CategoryQuery {
  parentId?: string;
  status?: CategoryStatus | CategoryStatus[];
  visibility?: 'public' | 'private' | 'restricted' | 'all';
  featured?: boolean;
  level?: number;
  search?: string;
  sort?: CategorySortField;
  sortDirection?: 'asc' | 'desc';
  cursor?: string;
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
}
