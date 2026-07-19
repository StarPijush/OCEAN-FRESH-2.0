import type { Cart, CartItem, CartQuery, CartSource, CartStatus } from '@oceanfresh/shared';

export interface ICartRepository {
  findById(id: string): Promise<Cart | null>;
  findByUserId(userId: string): Promise<Cart | null>;
  findBySessionId(sessionId: string): Promise<Cart | null>;
  findByUserOrSession(userId: string | null, sessionId: string | null): Promise<Cart | null>;
  findAll(query: CartQuery): Promise<Cart[]>;
  exists(id: string): Promise<boolean>;
  count(query?: Partial<CartQuery>): Promise<number>;
  create(data: {
    userId: string | null;
    sessionId: string | null;
    source: CartSource;
  }): Promise<Cart>;
  addItem(cartId: string, item: CartItem): Promise<Cart>;
  updateItem(
    cartId: string,
    itemId: string,
    quantity: number,
    subtotal: { amount: number; currency: string },
  ): Promise<Cart>;
  removeItem(cartId: string, itemId: string): Promise<Cart>;
  updateStatus(cartId: string, status: CartStatus): Promise<Cart>;
  updateTotals(cartId: string, totals: Cart['totals']): Promise<Cart>;
  clearItems(cartId: string): Promise<Cart>;
  merge(destinationId: string, sourceId: string): Promise<Cart>;
  delete(id: string): Promise<void>;
}
