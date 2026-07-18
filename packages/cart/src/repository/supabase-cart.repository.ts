import { supabaseService, type SupabaseQuery, rowToCamelCase, objToSnakeCase, stripId } from '@oceanfresh/supabase';
import {
  createLogger,
  NotFoundError,
  RepositoryError,
  CartStatus,
  CartSource,
  type Cart,
  type CartItem,
  type CartQuery,
  type Money,
} from '@oceanfresh/shared';
import type { ICartRepository } from './cart.repository.js';

const logger = createLogger('cart:repository:supabase');

const TABLE = 'carts';
const TABLE_ITEMS = 'cart_items';

function toCart(row: Record<string, unknown>, items: Record<string, unknown>[]): Cart {
  const camel = rowToCamelCase<Record<string, unknown>>(row);
  return {
    id: camel.id,
    userId: camel.userId,
    sessionId: camel.sessionId,
    source: camel.source,
    status: camel.status,
    items: items.map((i: Record<string, unknown>) => {
      const ci = rowToCamelCase<Record<string, unknown>>(i);
      return {
        id: ci.id,
        productId: ci.productId,
        snapshot: ci.snapshot,
        quantity: ci.quantity,
        subtotal: { amount: ci.subtotalAmount, currency: ci.subtotalCurrency },
        addedAt: ci.addedAt,
      };
    }) as unknown as CartItem[],
    totals: camel.totals,
    expiresAt: camel.expiresAt,
    createdAt: camel.createdAt,
    updatedAt: camel.updatedAt,
  } as Cart;
}

export class SupabaseCartRepository implements ICartRepository {
  async findById(id: string): Promise<Cart | null> {
    try {
      const row = await supabaseService.get<Record<string, unknown>>(TABLE, id);
      if (!row) return null;
      const items = await supabaseService.query<Record<string, unknown>>(TABLE_ITEMS, [
        { field: 'cart_id', operator: 'eq', value: id },
      ]);
      return toCart(row, items);
    } catch (err) {
      throw new RepositoryError('Failed to find cart by ID', 'findById', TABLE, { id, error: err });
    }
  }

  async findByUserId(userId: string): Promise<Cart | null> {
    try {
      const results = await supabaseService.query<Record<string, unknown>>(TABLE, [
        { field: 'user_id', operator: 'eq', value: userId },
        { field: 'status', operator: 'in', value: [CartStatus.ACTIVE, CartStatus.READY_FOR_CHECKOUT] },
      ]);
      const active = results.find((r) => r.status === CartStatus.ACTIVE || r.status === CartStatus.READY_FOR_CHECKOUT);
      if (!active) return null;
      return this.findById(active.id as string);
    } catch (err) {
      throw new RepositoryError('Failed to find cart by user ID', 'findByUserId', TABLE, { userId, error: err });
    }
  }

  async findBySessionId(sessionId: string): Promise<Cart | null> {
    try {
      const results = await supabaseService.query<Record<string, unknown>>(TABLE, [
        { field: 'session_id', operator: 'eq', value: sessionId },
      ]);
      if (results.length === 0) return null;
      return this.findById(results[0]!.id as string);
    } catch (err) {
      throw new RepositoryError('Failed to find cart by session ID', 'findBySessionId', TABLE, { sessionId, error: err });
    }
  }

  async findByUserOrSession(userId: string | null, sessionId: string | null): Promise<Cart | null> {
    if (userId) {
      const cart = await this.findByUserId(userId);
      if (cart) return cart;
    }
    if (sessionId) {
      return this.findBySessionId(sessionId);
    }
    return null;
  }

  async findAll(query: CartQuery): Promise<Cart[]> {
    try {
      const constraints: SupabaseQuery[] = [];
      if (query.userId) constraints.push({ field: 'user_id', operator: 'eq', value: query.userId });
      if (query.sessionId) constraints.push({ field: 'session_id', operator: 'eq', value: query.sessionId });
      if (query.status) constraints.push({ field: 'status', operator: 'eq', value: query.status });
      if (query.source) constraints.push({ field: 'source', operator: 'eq', value: query.source });
      const rows = await supabaseService.query<Record<string, unknown>>(TABLE, constraints);
      const carts: Cart[] = [];
      for (const row of rows) {
        const cart = await this.findById(row.id as string);
        if (cart) carts.push(cart);
      }
      return carts;
    } catch (err) {
      throw new RepositoryError('Failed to query carts', 'findAll', TABLE, { query, error: err });
    }
  }

  async exists(id: string): Promise<boolean> {
    const cart = await this.findById(id);
    return cart !== null;
  }

  async count(query?: Partial<CartQuery>): Promise<number> {
    try {
      const constraints: SupabaseQuery[] = [];
      if (query?.userId) constraints.push({ field: 'user_id', operator: 'eq', value: query.userId });
      if (query?.status) constraints.push({ field: 'status', operator: 'eq', value: query.status });
      const rows = await supabaseService.query<Record<string, unknown>>(TABLE, constraints);
      return rows.length;
    } catch (err) {
      throw new RepositoryError('Failed to count carts', 'count', TABLE, { query, error: err });
    }
  }

  async create(data: { userId: string | null; sessionId: string | null; source: CartSource }): Promise<Cart> {
    try {
      const now = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
      const totals = { subtotal: { amount: 0, currency: 'INR' }, tax: { amount: 0, currency: 'INR' }, shipping: { amount: 0, currency: 'INR' }, discount: { amount: 0, currency: 'INR' }, grandTotal: { amount: 0, currency: 'INR' } };
      const docData = {
        userId: data.userId ?? null,
        sessionId: data.sessionId ?? null,
        source: data.source,
        status: CartStatus.ACTIVE,
        totals,
        expiresAt,
        createdAt: now,
        updatedAt: now,
      };
      const snakeData = objToSnakeCase(docData);
      const result = await supabaseService.add<Record<string, unknown>>(TABLE, snakeData);
      return toCart({ ...snakeData, id: result.id }, []);
    } catch (err) {
      throw new RepositoryError('Failed to create cart', 'create', TABLE, { userId: data.userId, error: err });
    }
  }

  async addItem(cartId: string, item: CartItem): Promise<Cart> {
    try {
      const existing = await this.findById(cartId);
      if (!existing) throw new NotFoundError('Cart not found');

      const itemSnake = {
        cart_id: cartId,
        product_id: item.productId,
        snapshot: item.snapshot,
        quantity: item.quantity.value,
        subtotal_amount: item.subtotal.amount,
        subtotal_currency: item.subtotal.currency,
        added_at: item.addedAt instanceof Date ? item.addedAt.toISOString() : new Date().toISOString(),
      };
      await supabaseService.add(TABLE_ITEMS, itemSnake);

      const updated = await this.findById(cartId);
      if (!updated) throw new NotFoundError('Cart not found after add');
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to add item to cart', 'addItem', TABLE, { cartId, productId: item.productId, error: err });
    }
  }

  async updateItem(cartId: string, itemId: string, quantity: number, subtotal: { amount: number; currency: string }): Promise<Cart> {
    try {
      const existing = await this.findById(cartId);
      if (!existing) throw new NotFoundError('Cart not found');

      await supabaseService.update(TABLE_ITEMS, itemId, {
        quantity,
        subtotal_amount: subtotal.amount,
        subtotal_currency: subtotal.currency,
      });

      const updated = await this.findById(cartId);
      if (!updated) throw new NotFoundError('Cart not found after update');
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to update cart item', 'updateItem', TABLE, { cartId, itemId, error: err });
    }
  }

  async removeItem(cartId: string, itemId: string): Promise<Cart> {
    try {
      const existing = await this.findById(cartId);
      if (!existing) throw new NotFoundError('Cart not found');

      await supabaseService.remove(TABLE_ITEMS, itemId);

      const updated = await this.findById(cartId);
      if (!updated) throw new NotFoundError('Cart not found after remove');
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to remove item from cart', 'removeItem', TABLE, { cartId, itemId, error: err });
    }
  }

  async updateStatus(cartId: string, status: CartStatus): Promise<Cart> {
    try {
      await supabaseService.update(TABLE, cartId, { status });
      const updated = await this.findById(cartId);
      if (!updated) throw new NotFoundError('Cart not found after status update');
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to update cart status', 'updateStatus', TABLE, { cartId, status, error: err });
    }
  }

  async updateTotals(cartId: string, totals: Cart['totals']): Promise<Cart> {
    try {
      await supabaseService.update(TABLE, cartId, { totals: totals as unknown as Record<string, unknown> });
      const updated = await this.findById(cartId);
      if (!updated) throw new NotFoundError('Cart not found after totals update');
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to update cart totals', 'updateTotals', TABLE, { cartId, error: err });
    }
  }

  async clearItems(cartId: string): Promise<Cart> {
    try {
      const existing = await this.findById(cartId);
      if (!existing) throw new NotFoundError('Cart not found');

      const items = await supabaseService.query<Record<string, unknown>>(TABLE_ITEMS, [
        { field: 'cart_id', operator: 'eq', value: cartId },
      ]);
      for (const item of items) {
        await supabaseService.remove(TABLE_ITEMS, item.id as string);
      }

      await supabaseService.update(TABLE, cartId, {
        totals: { subtotal: { amount: 0, currency: 'INR' }, tax: { amount: 0, currency: 'INR' }, shipping: { amount: 0, currency: 'INR' }, discount: { amount: 0, currency: 'INR' }, grandTotal: { amount: 0, currency: 'INR' } },
      });

      const updated = await this.findById(cartId);
      if (!updated) throw new NotFoundError('Cart not found after clear');
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to clear cart items', 'clearItems', TABLE, { cartId, error: err });
    }
  }

  async merge(destinationId: string, sourceId: string): Promise<Cart> {
    try {
      const destination = await this.findById(destinationId);
      if (!destination) throw new NotFoundError('Destination cart not found');

      const source = await this.findById(sourceId);
      if (!source) throw new NotFoundError('Source cart not found');

      const existingProductIds = new Set(destination.items.map((i: CartItem) => i.productId));

      const sourceItems = await supabaseService.query<Record<string, unknown>>(TABLE_ITEMS, [
        { field: 'cart_id', operator: 'eq', value: sourceId },
      ]);

      for (const item of sourceItems) {
        const ci = rowToCamelCase<Record<string, unknown>>(item);
        if (!existingProductIds.has(ci.productId as string)) {
          await supabaseService.update(TABLE_ITEMS, ci.id as string, { cart_id: destinationId });
        }
      }

      await supabaseService.update(TABLE, destinationId, {
        user_id: destination.userId ?? source.userId,
        source: CartSource.AUTHENTICATED,
      });
      await supabaseService.update(TABLE, sourceId, { status: CartStatus.ARCHIVED });

      const updated = await this.findById(destinationId);
      if (!updated) throw new NotFoundError('Cart not found after merge');
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to merge carts', 'merge', TABLE, { destinationId, sourceId, error: err });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const existing = await this.findById(id);
      if (!existing) throw new NotFoundError('Cart not found');
      await supabaseService.remove(TABLE, id);
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to delete cart', 'delete', TABLE, { id, error: err });
    }
  }
}
