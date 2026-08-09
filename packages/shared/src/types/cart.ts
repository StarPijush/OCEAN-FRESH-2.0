export enum CartStatus {
  ACTIVE = 'ACTIVE',
  VALIDATING = 'VALIDATING',
  READY_FOR_CHECKOUT = 'READY_FOR_CHECKOUT',
  CHECKOUT_STARTED = 'CHECKOUT_STARTED',
  CHECKED_OUT = 'CHECKED_OUT',
  ARCHIVED = 'ARCHIVED',
  EXPIRED = 'EXPIRED',
  ABANDONED = 'ABANDONED',
}

export enum CartSource {
  GUEST = 'GUEST',
  AUTHENTICATED = 'AUTHENTICATED',
}

export enum CartEventType {
  ITEM_ADDED = 'cart:item_added',
  ITEM_REMOVED = 'cart:item_removed',
  QUANTITY_UPDATED = 'cart:quantity_updated',
  CART_CLEARED = 'cart:cleared',
  CART_MERGED = 'cart:merged',
  CART_EXPIRED = 'cart:expired',
  CHECKOUT_STARTED = 'cart:checkout_started',
  CART_VALIDATED = 'cart:validated',
  PRICE_RECALCULATED = 'cart:price_recalculated',
}

import type { ProductUnit } from './product.js';

export interface Money {
  amount: number;
  currency: string;
}

export class Quantity {
  private constructor(public readonly value: number) {
    if (!Number.isInteger(value)) throw new Error('Quantity must be an integer');
    if (value < 1) throw new Error('Quantity must be at least 1');
    if (value > 999) throw new Error('Quantity must not exceed 999');
  }

  static create(value: number): Quantity {
    return new Quantity(value);
  }

  static isValid(value: number): boolean {
    return Number.isInteger(value) && value >= 1 && value <= 999;
  }

  increment(): Quantity {
    return new Quantity(this.value + 1);
  }

  decrement(): Quantity {
    return new Quantity(this.value - 1);
  }

  add(other: Quantity): Quantity {
    return new Quantity(this.value + other.value);
  }
}

export interface ProductSnapshot {
  productId: string;
  name: string;
  sku: string | null;
  thumbnail: string;
  image: string;
  price: Money;
  currency: string;
  unit: ProductUnit;
  variantSummary: string | null;
  capturedAt: Date;
}

export interface CartItem {
  id: string;
  productId: string;
  snapshot: ProductSnapshot;
  quantity: Quantity;
  subtotal: Money;
  addedAt: Date;
}

export interface CartTotals {
  subtotal: Money;
  tax: Money;
  shipping: Money;
  discount: Money;
  grandTotal: Money;
}

export interface CartSummary {
  totalItems: number;
  uniqueItems: number;
  subtotal: Money;
  estimatedTax: Money;
  estimatedShipping: Money;
}

export interface Cart {
  id: string;
  userId: string | null;
  sessionId: string | null;
  source: CartSource;
  status: CartStatus;
  items: CartItem[];
  totals: CartTotals;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartValidationError {
  code: string;
  message: string;
  itemId?: string;
  productId?: string;
}

export interface CartValidationResult {
  valid: boolean;
  errors: CartValidationError[];
}

export interface AddToCartInput {
  productId: string;
  quantity: number;
  variantId?: string;
}

export interface UpdateCartItemInput {
  itemId: string;
  quantity: number;
}

export interface CartQuery {
  userId?: string;
  sessionId?: string;
  status?: CartStatus;
  source?: CartSource;
}
