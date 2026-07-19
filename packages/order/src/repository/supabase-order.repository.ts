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
import {
  objToSnakeCase,
  rowToCamelCase,
  type SupabaseOptions,
  type SupabaseQuery,
  supabaseService,
} from '@oceanfresh/supabase';

import type { IOrderRepository } from './order.repository.js';

const TABLE = 'orders';
const TABLE_ITEMS = 'order_items';
const TABLE_TIMELINE = 'order_timeline_entries';

function toOrder(row: Record<string, unknown>): Order {
  return rowToCamelCase<Order>(row);
}

export class SupabaseOrderRepository implements IOrderRepository {
  async findById(id: string): Promise<Order | null> {
    try {
      const row = await supabaseService.get<Record<string, unknown>>(TABLE, id);
      if (!row) return null;
      const order = toOrder(row);

      const items = await supabaseService.query<Record<string, unknown>>(TABLE_ITEMS, [
        { field: 'order_id', operator: 'eq', value: id },
      ]);
      const timeline = await supabaseService.query<Record<string, unknown>>(
        TABLE_TIMELINE,
        [{ field: 'order_id', operator: 'eq', value: id }],
        { orderByField: 'created_at', orderDirection: 'asc' },
      );

      order.items = items.map((i: Record<string, unknown>) => {
        const camel = rowToCamelCase<Record<string, unknown>>(i);
        return {
          id: camel.id,
          productId: camel.productId,
          snapshot: camel.snapshot,
          quantity: camel.quantity,
          unitPrice: { amount: camel.unitPriceAmount, currency: camel.unitPriceCurrency },
          subtotal: { amount: camel.subtotalAmount, currency: camel.subtotalCurrency },
        };
      }) as unknown as Order['items'];

      order.timeline = timeline.map((t: Record<string, unknown>) =>
        rowToCamelCase<OrderTimelineEntry>(t),
      );

      return order;
    } catch (err) {
      throw new RepositoryError('Failed to find order by ID', 'findById', TABLE, {
        id,
        error: err,
      });
    }
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    try {
      const results = await supabaseService.query<Record<string, unknown>>(TABLE, [
        { field: 'order_number', operator: 'eq', value: orderNumber },
      ]);
      if (results.length === 0) return null;
      return this.findById((results[0] as Record<string, unknown>).id as string);
    } catch (err) {
      throw new RepositoryError('Failed to find order by number', 'findByOrderNumber', TABLE, {
        orderNumber,
        error: err,
      });
    }
  }

  async findByIdempotencyKey(key: string): Promise<Order | null> {
    try {
      const results = await supabaseService.query<Record<string, unknown>>(TABLE, [
        { field: 'idempotency_key', operator: 'eq', value: key },
      ]);
      if (results.length === 0) return null;
      return this.findById((results[0] as Record<string, unknown>).id as string);
    } catch (err) {
      throw new RepositoryError(
        'Failed to find order by idempotency key',
        'findByIdempotencyKey',
        TABLE,
        { key, error: err },
      );
    }
  }

  async findByUserId(userId: string): Promise<Order[]> {
    try {
      const rows = await supabaseService.query<Record<string, unknown>>(TABLE, [
        { field: 'user_id', operator: 'eq', value: userId },
      ]);
      const orders: Order[] = [];
      for (const row of rows) {
        const order = await this.findById(row.id as string);
        if (order) orders.push(order);
      }
      return orders;
    } catch (err) {
      throw new RepositoryError('Failed to find orders by user', 'findByUserId', TABLE, {
        userId,
        error: err,
      });
    }
  }

  async findAll(query: OrderQuery): Promise<PaginatedResult<Order>> {
    try {
      const constraints: SupabaseQuery[] = [];
      if (query.userId) constraints.push({ field: 'user_id', operator: 'eq', value: query.userId });
      if (query.orderNumber)
        constraints.push({ field: 'order_number', operator: 'eq', value: query.orderNumber });
      if (query.status) {
        if (Array.isArray(query.status)) {
          constraints.push({ field: 'status', operator: 'in', value: query.status });
        } else {
          constraints.push({ field: 'status', operator: 'eq', value: query.status });
        }
      }

      const options: SupabaseOptions = {};
      if (query.sort)
        options.orderByField =
          query.sort === 'createdAt'
            ? 'created_at'
            : query.sort === 'updatedAt'
              ? 'updated_at'
              : query.sort === 'orderNumber'
                ? 'order_number'
                : query.sort === 'grandTotal'
                  ? 'grand_total'
                  : query.sort;
      if (query.sortDirection) options.orderDirection = query.sortDirection;
      if (query.limit) options.limitCount = query.limit;

      const rows = await supabaseService.query<Record<string, unknown>>(
        TABLE,
        constraints,
        options,
      );
      const items: Order[] = [];
      for (const row of rows) {
        const order = await this.findById(row.id as string);
        if (order) items.push(order);
      }

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
      throw new RepositoryError('Failed to query orders', 'findAll', TABLE, { query, error: err });
    }
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    try {
      const rows = await supabaseService.query<Record<string, unknown>>(TABLE, [
        { field: 'status', operator: 'eq', value: status },
      ]);
      const orders: Order[] = [];
      for (const row of rows) {
        const order = await this.findById(row.id as string);
        if (order) orders.push(order);
      }
      return orders;
    } catch (err) {
      throw new RepositoryError('Failed to find orders by status', 'findByStatus', TABLE, {
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
      const constraints: SupabaseQuery[] = [];
      if (query?.userId)
        constraints.push({ field: 'user_id', operator: 'eq', value: query.userId });
      if (query?.status) {
        if (Array.isArray(query.status)) {
          constraints.push({ field: 'status', operator: 'in', value: query.status });
        } else {
          constraints.push({ field: 'status', operator: 'eq', value: query.status });
        }
      }
      const rows = await supabaseService.query<Record<string, unknown>>(TABLE, constraints);
      return rows.length;
    } catch (err) {
      throw new RepositoryError('Failed to count orders', 'count', TABLE, { query, error: err });
    }
  }

  async create(data: Order): Promise<Order> {
    try {
      const now = new Date().toISOString();
      const { items, timeline, ...orderFields } = data;
      const orderData = {
        ...orderFields,
        createdAt: now,
        updatedAt: now,
      };
      const snakeOrder = objToSnakeCase(orderData as unknown as Record<string, unknown>);
      const result = await supabaseService.add<Record<string, unknown>>(TABLE, snakeOrder);
      const orderId = result.id as string;

      for (const item of items) {
        const itemSnake = {
          order_id: orderId,
          product_id: item.productId,
          snapshot: item.snapshot,
          quantity: item.quantity,
          unit_price_amount: item.unitPrice.amount,
          unit_price_currency: item.unitPrice.currency,
          subtotal_amount: item.subtotal.amount,
          subtotal_currency: item.subtotal.currency,
          created_at: now,
        };
        await supabaseService.add(TABLE_ITEMS, itemSnake);
      }

      for (const entry of timeline) {
        const entrySnake = {
          order_id: orderId,
          status: entry.status,
          changed_by: entry.changedBy,
          note: entry.note,
          created_at: entry.timestamp instanceof Date ? entry.timestamp.toISOString() : now,
        };
        await supabaseService.add(TABLE_TIMELINE, entrySnake);
      }

      const created = await this.findById(orderId);
      if (!created) throw new NotFoundError('Order not found after creation');
      return created;
    } catch (err) {
      throw new RepositoryError('Failed to create order', 'create', TABLE, {
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

      await supabaseService.update(TABLE, id, { status });

      const entry = {
        order_id: id,
        status,
        changed_by: changedBy,
        note: note ?? null,
        created_at: new Date().toISOString(),
      };
      await supabaseService.add(TABLE_TIMELINE, entry);

      const updated = await this.findById(id);
      if (!updated) throw new NotFoundError('Order not found after status update');
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to update order status', 'updateStatus', TABLE, {
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

      await supabaseService.add(TABLE_TIMELINE, {
        order_id: id,
        status: entry.status,
        changed_by: entry.changedBy,
        note: entry.note,
        created_at:
          entry.timestamp instanceof Date
            ? entry.timestamp.toISOString()
            : new Date().toISOString(),
      });

      const updated = await this.findById(id);
      if (!updated) throw new NotFoundError('Order not found after timeline append');
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to append order timeline', 'appendTimeline', TABLE, {
        id,
        error: err,
      });
    }
  }

  async updatePayment(id: string, payment: PaymentSummary): Promise<Order> {
    try {
      const existing = await this.findById(id);
      if (!existing) throw new NotFoundError('Order not found');

      await supabaseService.update(TABLE, id, {
        payment: payment as unknown as Record<string, unknown>,
      });

      const updated = await this.findById(id);
      if (!updated) throw new NotFoundError('Order not found after payment update');
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to update order payment', 'updatePayment', TABLE, {
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
      await supabaseService.remove(TABLE, id);
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new RepositoryError('Failed to delete order', 'delete', TABLE, { id, error: err });
    }
  }
}
