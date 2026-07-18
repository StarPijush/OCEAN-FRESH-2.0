import { firestoreService } from '@oceanfresh/firebase';
import { Timestamp } from 'firebase/firestore';
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

const logger = createLogger('cart:repository');

const COLLECTION = 'carts';

function docToCart(id: string, data: Record<string, unknown>): Cart {
  return { id, ...data } as unknown as Cart;
}

export class FirestoreCartRepository implements ICartRepository {
  async findById(id: string): Promise<Cart | null> {
    try {
      const doc = await firestoreService.get<Record<string, unknown> & { id: string }>(COLLECTION, id);
      if (!doc) return null;
      return docToCart(doc.id, doc);
    } catch (err) {
      throw new RepositoryError('Failed to find cart by ID', 'findById', COLLECTION, { id, error: err });
    }
  }

  async findByUserId(userId: string): Promise<Cart | null> {
    try {
      const results = await firestoreService.query<Record<string, unknown> & { id: string }>(COLLECTION, [
        { field: 'userId', operator: '==', value: userId },
        { field: 'status', operator: 'in', value: [CartStatus.ACTIVE, CartStatus.READY_FOR_CHECKOUT] },
      ]);
      const active = results.find((r) => r.status === CartStatus.ACTIVE || r.status === CartStatus.READY_FOR_CHECKOUT);
      if (!active) return null;
      return docToCart(active.id, active);
    } catch (err) {
      throw new RepositoryError('Failed to find cart by user ID', 'findByUserId', COLLECTION, { userId, error: err });
    }
  }

  async findBySessionId(sessionId: string): Promise<Cart | null> {
    try {
      const results = await firestoreService.query<Record<string, unknown> & { id: string }>(COLLECTION, [
        { field: 'sessionId', operator: '==', value: sessionId },
      ]);
      if (results.length === 0) return null;
      return docToCart(results[0]!.id, results[0]!);
    } catch (err) {
      throw new RepositoryError('Failed to find cart by session ID', 'findBySessionId', COLLECTION, { sessionId, error: err });
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
      const constraints: { field: string; operator: string; value: unknown }[] = [];
      if (query.userId) constraints.push({ field: 'userId', operator: '==', value: query.userId });
      if (query.sessionId) constraints.push({ field: 'sessionId', operator: '==', value: query.sessionId });
      if (query.status) constraints.push({ field: 'status', operator: '==', value: query.status });
      if (query.source) constraints.push({ field: 'source', operator: '==', value: query.source });
      const docs = await firestoreService.query<Record<string, unknown> & { id: string }>(COLLECTION, constraints);
      return docs.map((d) => docToCart(d.id, d));
    } catch (err) {
      throw new RepositoryError('Failed to query carts', 'findAll', COLLECTION, { query, error: err });
    }
  }

  async exists(id: string): Promise<boolean> {
    const cart = await this.findById(id);
    return cart !== null;
  }

  async count(query?: Partial<CartQuery>): Promise<number> {
    try {
      const constraints: { field: string; operator: string; value: unknown }[] = [];
      if (query?.userId) constraints.push({ field: 'userId', operator: '==', value: query.userId });
      if (query?.status) constraints.push({ field: 'status', operator: '==', value: query.status });
      const docs = await firestoreService.query<Record<string, unknown> & { id: string }>(COLLECTION, constraints);
      return docs.length;
    } catch (err) {
      throw new RepositoryError('Failed to count carts', 'count', COLLECTION, { query, error: err });
    }
  }

  async create(data: { userId: string | null; sessionId: string | null; source: CartSource }): Promise<Cart> {
    try {
      const now = Timestamp.now();
      const expiresAt = new Timestamp(now.seconds + 7 * 86400, now.nanoseconds);
      const docData = {
        userId: data.userId ?? null,
        sessionId: data.sessionId ?? null,
        source: data.source,
        status: CartStatus.ACTIVE,
        items: [],
        totals: { subtotal: { amount: 0, currency: 'INR' }, tax: { amount: 0, currency: 'INR' }, shipping: { amount: 0, currency: 'INR' }, discount: { amount: 0, currency: 'INR' }, grandTotal: { amount: 0, currency: 'INR' } },
        expiresAt,
        createdAt: now,
        updatedAt: now,
      };
      const result = await firestoreService.add<Record<string, unknown>>(COLLECTION, docData as unknown as Record<string, unknown>);
      return docToCart(result.id as string, { ...docData, id: result.id });
    } catch (err) {
      throw new RepositoryError('Failed to create cart', 'create', COLLECTION, { userId: data.userId, error: err });
    }
  }

  async addItem(cartId: string, item: CartItem): Promise<Cart> {
    try {
      const existing = await this.findById(cartId);
      if (!existing) throw new NotFoundError('Cart not found');

      const serializedItem = {
        id: item.id,
        productId: item.productId,
        snapshot: item.snapshot,
        quantity: item.quantity.value,
        subtotal: item.subtotal,
        addedAt: item.addedAt,
      };
      const items = [...(existing.items as unknown as Record<string, unknown>[]), serializedItem as unknown as Record<string, unknown>];
      await firestoreService.update(COLLECTION, cartId, { items, updatedAt: Timestamp.now() });

      const updated = await this.findById(cartId);
      if (!updated) throw new NotFoundError('Cart not found after add');
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to add item to cart', 'addItem', COLLECTION, { cartId, productId: item.productId, error: err });
    }
  }

  async updateItem(cartId: string, itemId: string, quantity: number, subtotal: { amount: number; currency: string }): Promise<Cart> {
    try {
      const existing = await this.findById(cartId);
      if (!existing) throw new NotFoundError('Cart not found');

      const items = (existing.items as unknown as Record<string, unknown>[]).map((item: Record<string, unknown>) => {
        if (item.id === itemId) {
          return { ...item, quantity, subtotal };
        }
        return item;
      });
      await firestoreService.update(COLLECTION, cartId, { items, updatedAt: Timestamp.now() });

      const updated = await this.findById(cartId);
      if (!updated) throw new NotFoundError('Cart not found after update');
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to update cart item', 'updateItem', COLLECTION, { cartId, itemId, error: err });
    }
  }

  async removeItem(cartId: string, itemId: string): Promise<Cart> {
    try {
      const existing = await this.findById(cartId);
      if (!existing) throw new NotFoundError('Cart not found');

      const items = (existing.items as unknown as Record<string, unknown>[]).filter((item: Record<string, unknown>) => item.id !== itemId);
      await firestoreService.update(COLLECTION, cartId, { items, updatedAt: Timestamp.now() });

      const updated = await this.findById(cartId);
      if (!updated) throw new NotFoundError('Cart not found after remove');
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to remove item from cart', 'removeItem', COLLECTION, { cartId, itemId, error: err });
    }
  }

  async updateStatus(cartId: string, status: CartStatus): Promise<Cart> {
    try {
      await firestoreService.update(COLLECTION, cartId, { status, updatedAt: Timestamp.now() });
      const updated = await this.findById(cartId);
      if (!updated) throw new NotFoundError('Cart not found after status update');
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to update cart status', 'updateStatus', COLLECTION, { cartId, status, error: err });
    }
  }

  async updateTotals(cartId: string, totals: Cart['totals']): Promise<Cart> {
    try {
      await firestoreService.update(COLLECTION, cartId, { totals, updatedAt: Timestamp.now() });
      const updated = await this.findById(cartId);
      if (!updated) throw new NotFoundError('Cart not found after totals update');
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to update cart totals', 'updateTotals', COLLECTION, { cartId, error: err });
    }
  }

  async clearItems(cartId: string): Promise<Cart> {
    try {
      const existing = await this.findById(cartId);
      if (!existing) throw new NotFoundError('Cart not found');

      await firestoreService.update(COLLECTION, cartId, {
        items: [],
        totals: { subtotal: { amount: 0, currency: 'INR' }, tax: { amount: 0, currency: 'INR' }, shipping: { amount: 0, currency: 'INR' }, discount: { amount: 0, currency: 'INR' }, grandTotal: { amount: 0, currency: 'INR' } },
        updatedAt: Timestamp.now(),
      });

      const updated = await this.findById(cartId);
      if (!updated) throw new NotFoundError('Cart not found after clear');
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to clear cart items', 'clearItems', COLLECTION, { cartId, error: err });
    }
  }

  async merge(destinationId: string, sourceId: string): Promise<Cart> {
    try {
      const destination = await this.findById(destinationId);
      if (!destination) throw new NotFoundError('Destination cart not found');

      const source = await this.findById(sourceId);
      if (!source) throw new NotFoundError('Source cart not found');

      const mergedItems = [...(destination.items as unknown as Record<string, unknown>[])];
      const existingProductIds = new Set((destination.items as unknown as Record<string, unknown>[]).map((i: Record<string, unknown>) => i.productId as string));

      for (const item of source.items as unknown as Record<string, unknown>[]) {
        if (!existingProductIds.has(item.productId as string)) {
          mergedItems.push(item);
        }
      }

      await firestoreService.update(COLLECTION, destinationId, {
        items: mergedItems,
        userId: destination.userId ?? source.userId,
        source: CartSource.AUTHENTICATED,
        updatedAt: Timestamp.now(),
      });
      await firestoreService.update(COLLECTION, sourceId, {
        status: CartStatus.MERGED,
        updatedAt: Timestamp.now(),
      });

      const updated = await this.findById(destinationId);
      if (!updated) throw new NotFoundError('Cart not found after merge');
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to merge carts', 'merge', COLLECTION, { destinationId, sourceId, error: err });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const existing = await this.findById(id);
      if (!existing) throw new NotFoundError('Cart not found');
      await firestoreService.delete(COLLECTION, id);
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to delete cart', 'delete', COLLECTION, { id, error: err });
    }
  }
}
