import { z } from 'zod';
import { CategoryStatus, CategorySortField } from '../types/category.js';

export const categorySeoSchema = z.object({
  title: z.string().max(200),
  description: z.string().max(500),
  canonicalUrl: z.string().url(),
}).nullable().optional();

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  description: z.string().max(1000).default(''),
  parentId: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
  status: z.nativeEnum(CategoryStatus).default(CategoryStatus.DRAFT),
  visibility: z.enum(['public', 'private', 'restricted']).default('public'),
  featured: z.boolean().default(false),
  thumbnail: z.string().nullable().optional(),
  banner: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  seo: categorySeoSchema,
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().min(1),
});

export const categoryQuerySchema = z.object({
  parentId: z.string().optional(),
  status: z.union([z.nativeEnum(CategoryStatus), z.array(z.nativeEnum(CategoryStatus))]).optional(),
  visibility: z.enum(['public', 'private', 'restricted', 'all']).optional(),
  featured: z.boolean().optional(),
  level: z.number().int().min(0).optional(),
  search: z.string().max(200).optional(),
  sort: z.nativeEnum(CategorySortField).optional(),
  sortDirection: z.enum(['asc', 'desc']).default('asc'),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  includeDeleted: z.boolean().default(false),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryQueryInput = z.infer<typeof categoryQuerySchema>;
