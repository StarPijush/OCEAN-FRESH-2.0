import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(999, 'Quantity must not exceed 999'),
  variantId: z.string().optional(),
});

export const updateCartItemSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(999, 'Quantity must not exceed 999'),
});

export const cartQuerySchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  status: z.string().optional(),
  source: z.string().optional(),
});
