import { z } from 'zod';

import { ProductSortField, ProductStatus, ProductUnit } from '../types/product.js';

export const productDimensionsSchema = z
  .object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
    unit: z.enum(['cm', 'in']),
  })
  .nullable()
  .optional();

export const productSeoSchema = z
  .object({
    title: z.string().max(200),
    description: z.string().max(500),
    canonicalUrl: z.string().url(),
  })
  .nullable()
  .optional();

export const productVariantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  sku: z.string().max(100),
  price: z.number().positive().max(100000),
  stock: z.number().int().min(0),
  unit: z.nativeEnum(ProductUnit),
  weight: z.number().positive().nullable(),
  weightUnit: z.enum(['g', 'kg', 'lb']),
  images: z.array(z.string()),
  isDefault: z.boolean(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  description: z.string().max(5000).default(''),
  price: z.number().positive('Price must be positive').max(100000),
  categoryId: z.string().min(1, 'Category is required'),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
  featured: z.boolean().default(false),
  stock: z.number().int().min(0).default(0),
  unit: z.nativeEnum(ProductUnit).default(ProductUnit.KG),
  tags: z.array(z.string()).default([]),
  searchKeywords: z.array(z.string()).default([]),
  weight: z.number().positive().nullable().optional(),
  weightUnit: z.enum(['g', 'kg', 'lb']).default('kg'),
  dimensions: productDimensionsSchema,
  sku: z.string().max(100).nullable().optional(),
  barcode: z.string().max(100).nullable().optional(),
  seo: productSeoSchema,
  metadata: z.record(z.string(), z.unknown()).default({}),
  sortOrder: z.number().int().default(0),
  warehouseId: z.string().nullable().optional(),
  variants: z.array(productVariantSchema).nullable().optional(),
  minOrderQuantity: z.number().int().min(1).default(1),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().min(1),
});

export const productQuerySchema = z.object({
  categoryId: z.string().optional(),
  status: z.union([z.nativeEnum(ProductStatus), z.array(z.nativeEnum(ProductStatus))]).optional(),
  featured: z.boolean().optional(),
  availability: z.enum(['in_stock', 'out_of_stock', 'all']).optional(),
  search: z.string().max(200).optional(),
  tags: z.array(z.string()).optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  createdBy: z.string().optional(),
  warehouseId: z.string().optional(),
  sort: z.nativeEnum(ProductSortField).optional(),
  sortDirection: z.enum(['asc', 'desc']).default('asc'),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  includeDeleted: z.boolean().default(false),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
