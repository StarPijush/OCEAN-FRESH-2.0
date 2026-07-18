import { z } from 'zod';

export const moneySchema = z.object({
  amount: z.number().nonnegative(),
  currency: z.string().min(1),
});

export const orderProductSnapshotSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1).max(200),
  sku: z.string().nullable(),
  thumbnail: z.string(),
  image: z.string(),
  price: moneySchema,
  currency: z.string().min(1),
  unit: z.string(),
  variantSummary: z.string().nullable(),
});

export const orderCustomerSnapshotSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email().nullable(),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  address: z.string().min(1, 'Address is required').max(1000),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Pincode must be 6 digits'),
});

export const orderShippingSnapshotSchema = z.object({
  address: z.string().min(1).max(1000),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  pincode: z.string().regex(/^[0-9]{6}$/),
  method: z.string().min(1),
  amount: moneySchema,
});

export const orderBillingSnapshotSchema = z.object({
  address: z.string().min(1).max(1000),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  pincode: z.string().regex(/^[0-9]{6}$/),
  gstin: z.string().nullable(),
});

export const createOrderFromCheckoutSchema = z.object({
  cartId: z.string().min(1, 'Cart ID is required'),
  idempotencyKey: z.string().min(1, 'Idempotency key is required').max(100),
  userId: z.string().nullable(),
  customer: orderCustomerSnapshotSchema,
  shipping: orderShippingSnapshotSchema,
  billing: orderBillingSnapshotSchema,
  notes: z.string().max(1000).optional(),
});

export const orderQuerySchema = z.object({
  status: z.union([z.string(), z.array(z.string())]).optional(),
  userId: z.string().optional(),
  orderNumber: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
  sort: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
});
