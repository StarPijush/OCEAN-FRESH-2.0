import { describe, it, expect } from 'vitest';
import { createProductSchema, createOrderFromCheckoutSchema, loginSchema } from '../validators/index.js';

describe('validators', () => {
  describe('createProductSchema', () => {
    it('should validate a valid product', () => {
      const result = createProductSchema.safeParse({
        name: 'Fresh Salmon',
        price: 500,
        categoryId: 'cat-1',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const result = createProductSchema.safeParse({
        name: '',
        price: 500,
        categoryId: 'cat-1',
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative price', () => {
      const result = createProductSchema.safeParse({
        name: 'Test',
        price: -10,
        categoryId: 'cat-1',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createOrderFromCheckoutSchema', () => {
    const validOrder = {
      cartId: 'cart-1',
      idempotencyKey: 'key-1',
      userId: null,
      customer: {
        name: 'Test User',
        email: null,
        phone: '9876543210',
        address: '123 Street',
        city: 'Jhargram',
        state: 'West Bengal',
        pincode: '721507',
      },
      shipping: {
        address: '123 Street',
        city: 'Jhargram',
        state: 'West Bengal',
        pincode: '721507',
        method: 'standard',
        amount: { amount: 0, currency: 'INR' },
      },
      billing: {
        address: '123 Street',
        city: 'Jhargram',
        state: 'West Bengal',
        pincode: '721507',
        gstin: null,
      },
    };

    it('should validate valid order', () => {
      const result = createOrderFromCheckoutSchema.safeParse(validOrder);
      expect(result.success).toBe(true);
    });

    it('should reject missing cartId', () => {
      const result = createOrderFromCheckoutSchema.safeParse({ ...validOrder, cartId: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate email login', () => {
      const result = loginSchema.safeParse({ email: 'a@b.com', password: 'secret123' });
      expect(result.success).toBe(true);
    });

    it('should reject short password', () => {
      const result = loginSchema.safeParse({ email: 'a@b.com', password: '123' });
      expect(result.success).toBe(false);
    });
  });
});
