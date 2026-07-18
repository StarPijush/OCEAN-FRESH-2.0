import type { Cart, CartItem, CartTotals } from '@oceanfresh/shared';

export interface CartCheckoutItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: { amount: number; currency: string };
  subtotal: { amount: number; currency: string };
  snapshot: CartItem['snapshot'];
}

export interface CartCheckoutContext {
  cartId: string;
  userId: string | null;
  sessionId: string | null;
  items: CartCheckoutItem[];
  totals: CartTotals;
  currency: string;
  createdAt: Date;
}

export interface ICartCheckoutFactory {
  createCheckoutContext(cart: Cart): CartCheckoutContext;
}

export class CartCheckoutFactory implements ICartCheckoutFactory {
  createCheckoutContext(cart: Cart): CartCheckoutContext {
    return {
      cartId: cart.id,
      userId: cart.userId,
      sessionId: cart.sessionId,
      items: cart.items.map((item) => ({
        productId: item.productId,
        name: item.snapshot.name,
        quantity: item.quantity.value,
        unitPrice: item.snapshot.price,
        subtotal: item.subtotal,
        snapshot: item.snapshot,
      })),
      totals: cart.totals,
      currency: cart.totals.grandTotal.currency,
      createdAt: new Date(),
    };
  }
}
