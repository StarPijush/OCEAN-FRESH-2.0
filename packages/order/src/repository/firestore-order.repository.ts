import { firestoreService } from '@oceanfresh/firebase';
import {
  NotFoundError,
  type Order,
  type OrderQuery,
  OrderStatus,
  type OrderTimelineEntry,
  type PaginatedResult,
  type PaymentSummary,
  RepositoryError,
} from '@oceanfresh/shared';
import { Timestamp } from 'firebase/firestore';

import type { IOrderRepository } from './order.repository.js';

const COLLECTION = 'orders';

function docToOrder(id: string, data: Record<string, unknown>): Order {
  return { id, ...data } as unknown as Order;
}

export class FirestoreOrderRepository implements IOrderRepository {
  async findById(id: string): Promise<Order | null> {
    try {
      const doc = await firestoreService.get<Record<string, unknown> & { id: string }>(
        COLLECTION,
        id,
      );
      if (!doc) return null;
      return docToOrder(doc.id, doc);
    } catch (err) {
      throw new RepositoryError('Failed to find order by ID', 'findById', COLLECTION, {
        id,
        error: err,
      });
    }
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    try {
      const results = await firestoreService.query<Record<string, unknown> & { id: string }>(
        COLLECTION,
        [{ field: 'orderNumber', operator: '==', value: orderNumber }],
      );
      if (results.length === 0) return null;
      const first = results[0] as Record<string, unknown> & { id: string };
      return docToOrder(first.id, first);
    } catch (err) {
      throw new RepositoryError('Failed to find order by number', 'findByOrderNumber', COLLECTION, {
        orderNumber,
        error: err,
      });
    }
  }

  async findByIdempotencyKey(key: string): Promise<Order | null> {
    try {
      const results = await firestoreService.query<Record<string, unknown> & { id: string }>(
        COLLECTION,
        [{ field: 'idempotencyKey', operator: '==', value: key }],
      );
      if (results.length === 0) return null;
      const first = results[0] as Record<string, unknown> & { id: string };
      return docToOrder(first.id, first);
    } catch (err) {
      throw new RepositoryError(
        'Failed to find order by idempotency key',
        'findByIdempotencyKey',
        COLLECTION,
        { key, error: err },
      );
    }
  }

  async findByUserId(userId: string): Promise<Order[]> {
    try {
      const docs = await firestoreService.query<Record<string, unknown> & { id: string }>(
        COLLECTION,
        [{ field: 'userId', operator: '==', value: userId }],
      );
      return docs.map((d) => docToOrder(d.id, d));
    } catch (err) {
      throw new RepositoryError('Failed to find orders by user', 'findByUserId', COLLECTION, {
        userId,
        error: err,
      });
    }
  }

  async findAll(query: OrderQuery): Promise<PaginatedResult<Order>> {
    try {
      const constraints: { field: string; operator: string; value: unknown }[] = [];
      if (query.userId) constraints.push({ field: 'userId', operator: '==', value: query.userId });
      if (query.orderNumber)
        constraints.push({ field: 'orderNumber', operator: '==', value: query.orderNumber });
      if (query.status) {
        if (Array.isArray(query.status)) {
          constraints.push({ field: 'status', operator: 'in', value: query.status });
        } else {
          constraints.push({ field: 'status', operator: '==', value: query.status });
        }
      }
      if (query.dateFrom)
        constraints.push({ field: 'createdAt', operator: '>=', value: query.dateFrom });
      if (query.dateTo)
        constraints.push({ field: 'createdAt', operator: '<=', value: query.dateTo });

      const options: Record<string, unknown> = {};
      if (query.sort) options.orderByField = query.sort;
      if (query.sortDirection) options.orderDirection = query.sortDirection;
      if (query.limit) options.limitCount = query.limit;
      if (query.cursor) options.startAfter = query.cursor;

      const docs = await firestoreService.query<Record<string, unknown> & { id: string }>(
        COLLECTION,
        constraints,
        options,
      );
      const items = docs.map((d) => docToOrder(d.id, d));

      return {
        items,
        total: items.length,
        hasMore: items.length === (query.limit ?? 20),
        lastDoc:
          items.length > 0 && items[items.length - 1]
            ? (items[items.length - 1] as Order).id
            : null,
      };
    } catch (err) {
      throw new RepositoryError('Failed to query orders', 'findAll', COLLECTION, {
        query,
        error: err,
      });
    }
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    try {
      const docs = await firestoreService.query<Record<string, unknown> & { id: string }>(
        COLLECTION,
        [{ field: 'status', operator: '==', value: status }],
      );
      return docs.map((d) => docToOrder(d.id, d));
    } catch (err) {
      throw new RepositoryError('Failed to find orders by status', 'findByStatus', COLLECTION, {
        status,
        error: err,
      });
    }
  }

  async exists(id: string): Promise<boolean> {
    const order = await this.findById(id);
    return order !== null;
  }

  async existsByOrderNumber(orderNumber: string): Promise<boolean> {
    const order = await this.findByOrderNumber(orderNumber);
    return order !== null;
  }

  async count(query?: Partial<OrderQuery>): Promise<number> {
    try {
      const constraints: { field: string; operator: string; value: unknown }[] = [];
      if (query?.userId) constraints.push({ field: 'userId', operator: '==', value: query.userId });
      if (query?.status) {
        if (Array.isArray(query.status)) {
          constraints.push({ field: 'status', operator: 'in', value: query.status });
        } else {
          constraints.push({ field: 'status', operator: '==', value: query.status });
        }
      }
      const docs = await firestoreService.query<Record<string, unknown> & { id: string }>(
        COLLECTION,
        constraints,
      );
      return docs.length;
    } catch (err) {
      throw new RepositoryError('Failed to count orders', 'count', COLLECTION, {
        query,
        error: err,
      });
    }
  }

  async create(data: Order): Promise<Order> {
    try {
      const now = Timestamp.now();
      const docData = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      const result = await firestoreService.add<Record<string, unknown>>(
        COLLECTION,
        docData as unknown as Record<string, unknown>,
      );
      return docToOrder(result.id as string, { ...docData, id: result.id });
    } catch (err) {
      throw new RepositoryError('Failed to create order', 'create', COLLECTION, {
        orderNumber: data.orderNumber,
        error: err,
      });
    }
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    changedBy: string,
    note?: string,
  ): Promise<Order> {
    try {
      const existing = await this.findById(id);
      if (!existing) throw new NotFoundError('Order not found');

      const entry: OrderTimelineEntry = {
        status,
        timestamp: new Date(),
        changedBy,
        note: note ?? null,
      };

      const timeline = [...(existing.timeline ?? []), entry];

      await firestoreService.update(COLLECTION, id, {
        status,
        timeline,
        updatedAt: Timestamp.now(),
      } as unknown as Record<string, unknown>);

      const updated = await this.findById(id);
      if (!updated) throw new NotFoundError('Order not found after status update');
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to update order status', 'updateStatus', COLLECTION, {
        id,
        status,
        error: err,
      });
    }
  }

  async appendTimeline(id: string, entry: OrderTimelineEntry): Promise<Order> {
    try {
      const existing = await this.findById(id);
      if (!existing) throw new NotFoundError('Order not found');

      const timeline = [...(existing.timeline ?? []), entry];

      await firestoreService.update(COLLECTION, id, {
        timeline,
        updatedAt: Timestamp.now(),
      } as unknown as Record<string, unknown>);

      const updated = await this.findById(id);
      if (!updated) throw new NotFoundError('Order not found after timeline append');
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to append order timeline', 'appendTimeline', COLLECTION, {
        id,
        error: err,
      });
    }
  }

  async updatePayment(id: string, payment: PaymentSummary): Promise<Order> {
    try {
      const existing = await this.findById(id);
      if (!existing) throw new NotFoundError('Order not found');

      await firestoreService.update(COLLECTION, id, {
        payment,
        updatedAt: Timestamp.now(),
      } as unknown as Record<string, unknown>);

      const updated = await this.findById(id);
      if (!updated) throw new NotFoundError('Order not found after payment update');
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to update order payment', 'updatePayment', COLLECTION, {
        id,
        error: err,
      });
    }
  }

  async archive(id: string): Promise<Order> {
    return this.updateStatus(id, OrderStatus.ARCHIVED, 'system', 'Order archived');
  }

  async delete(id: string): Promise<void> {
    try {
      const existing = await this.findById(id);
      if (!existing) throw new NotFoundError('Order not found');
      await firestoreService.delete(COLLECTION, id);
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to delete order', 'delete', COLLECTION, { id, error: err });
    }
  }
}
