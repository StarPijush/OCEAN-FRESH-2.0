import { z } from 'zod';

export const deliveryChargeSchema = z.object({
  amount: z.number().min(0, 'Delivery charge cannot be negative'),
  freeAbove: z.number().min(0).default(0),
});

export const whatsappSettingsSchema = z.object({
  number: z.string().regex(/^[0-9]{10,15}$/, 'Invalid WhatsApp number'),
});

export const shopInfoSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().min(1).max(500),
  phone: z.string().regex(/^[0-9]{10}$/),
});

export const serviceablePincodesSchema = z.object({
  pincodes: z.array(z.string().regex(/^[0-9]{6}$/)).min(1),
});
