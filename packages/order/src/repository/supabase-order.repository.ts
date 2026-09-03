import {
  NotFoundError,
  type Order,
  type OrderQuery,
  OrderStatus,
  type OrderTimelineEntry,
  type PaginatedResult,
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
  const camel = rowToCamelCase<Record<string, unknown>>(row);
  return {
    ...camel,
    createdAt: camel.createdAt ? new Date(camel.createdAt as string) : new Date(),
    updatedAt: camel.updatedAt ? new Date(camel.updatedAt as string) : new Date(),
  } as Order;
}

function toItems(rows: Record<string, unknown>[]): Order['items'] {
  return rows.map((i: Record<string, unknown>) => {
    const camel = rowToCamelCase<Record<string, unknown>>(i);
    // Back-compat: if weight columns are null, derive from quantity/snapshot
    const weightGrams = (camel as Record<string, unknown>).weightGrams as number | undefined;
    const weightDisplay = (camel as Record<string, unknown>).weightDisplay as string | undefined;
    const productUnit = (camel as Record<string, unknown>).productUnit as string | undefined;
    return {
      id: camel.id,
      productId: camel.productId,
      snapshot: camel.snapshot,
      quantity: camel.quantity,
      unitPrice: { amount: camel.unitPriceAmount, currency: camel.unitPriceCurrency },
      subtotal: { amount: camel.subtotalAmount, currency: camel.subtotalCurrency },
      weightGrams: weightGrams != null ? Number(weightGrams) : undefined,
      weightDisplay: weightDisplay ?? undefined,
      productUnit: productUnit ?? undefined,
    };
  }) as unknown as Order['items'];
}

function toTimeline(rows: Record<string, unknown>[]): OrderTimelineEntry[] {
  return rows.map((t: Record<string, unknown>) => {
    const camel = rowToCamelCase<Record<string, unknown>>(t);
    return {
      ...camel,
      timestamp: camel.timestamp ? new Date(camel.timestamp as string) : new Date(),
    } as OrderTimelineEntry;
  });
}

/**
 * Hydrates a batch of order rows with their items and timeline entries using
 * only TWO extra queries (order_items WHERE order_id IN (...) and
 * order_timeline_entries WHERE order_id IN (...)), grouped in memory.
 *
 * This eliminates the previous N+1 pattern (2 extra queries PER order), which
 * turned findAll({limit:500}) into ~1,501 database round trips.
 */
async function hydrateRows(rows: Record<string, unknown>[]): Promise<Order[]> {
  if (rows.length === 0) return [];

  const ids = rows.map((row) => String(row.id));

  const [itemRows, timelineRows] = await Promise.all([
    supabaseService.query<Record<string, unknown>>(TABLE_ITEMS, [
      { field: 'order_id', operator: 'in', value: ids },
    ]),
    supabaseService.query<Record<string, unknown>>(
      TABLE_TIMELINE,
      [{ field: 'order_id', operator: 'in', value: ids }],
      { orderByField: 'created_at', orderDirection: 'asc' },
    ),
  ]);

  const itemsByOrder = new Map<string, Record<string, unknown>[]>();
  for (const item of itemRows) {
    const orderId = String(item.order_id);
    const list = itemsByOrder.get(orderId);
    if (list) list.push(item);
    else itemsByOrder.set(orderId, [item]);
  }

  const timelineByOrder = new Map<string, Record<string, unknown>[]>();
  for (const entry of timelineRows) {
    const orderId = String(entry.order_id);
    const list = timelineByOrder.get(orderId);
    if (list) list.push(entry);
    else timelineByOrder.set(orderId, [entry]);
  }

  return rows.map((row) => {
    const order = toOrder(row);
    order.items = toItems(itemsByOrder.get(order.id) ?? []);
    order.timeline = toTimeline(timelineByOrder.get(order.id) ?? []);
    return order;
  });
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

      order.items = toItems(items);
      order.timeline = toTimeline(timeline);

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
      return hydrateRows(rows);
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

      const total = await supabaseService.count(TABLE, constraints);

      const sortField =
        query.sort === 'createdAt'
          ? 'created_at'
          : query.sort === 'updatedAt'
            ? 'updated_at'
            : query.sort === 'orderNumber'
              ? 'order_number'
              : query.sort === 'grandTotal'
                ? 'grand_total'
                : 'created_at';

      const limit = query.limit ?? 20;
      const page = query.page ?? 1;
      const offset = (page - 1) * limit;

      const options: SupabaseOptions = {
        orderByField: sortField,
        orderDirection: query.sortDirection ?? 'desc',
        limitCount: limit,
        offset,
      };

      const rows = await supabaseService.query<Record<string, unknown>>(
        TABLE,
        constraints,
        options,
      );
      const items = await hydrateRows(rows);

      return {
        items,
        total,
        hasMore: offset + limit < total,
        lastDoc: items.length > 0 ? (items[items.length - 1]?.id ?? null) : null,
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
      return hydrateRows(rows);
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
      return supabaseService.count(TABLE, constraints);
    } catch (err) {
      throw new RepositoryError('Failed to count orders', 'count', TABLE, { query, error: err });
    }
  }

  async create(data: Order): Promise<Order> {
    try {
      if (!data.userId) {
        return await this.createGuestOrder(data);
      }

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
        const weightGrams = (item as unknown as Record<string, unknown>).weightGrams as
          number | undefined;
        const weightDisplay = (item as unknown as Record<string, unknown>).weightDisplay as
          string | undefined;
        const productUnit = (item as unknown as Record<string, unknown>).productUnit as
          string | undefined;
        const itemSnake = {
          order_id: orderId,
          product_id: item.productId,
          snapshot: item.snapshot,
          quantity: item.quantity,
          unit_price_amount: item.unitPrice.amount,
          unit_price_currency: item.unitPrice.currency,
          subtotal_amount: item.subtotal.amount,
          subtotal_currency: item.subtotal.currency,
          weight_grams: weightGrams ?? item.quantity,
          weight_display: weightDisplay ?? String(item.quantity),
          product_unit:
            productUnit ?? (item.snapshot as unknown as Record<string, unknown>)?.unit ?? null,
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

  private async createGuestOrder(data: Order): Promise<Order> {
    const { items, timeline, ...orderFields } = data;
    const orderPayload = objToSnakeCase(orderFields as unknown as Record<string, unknown>);
    delete orderPayload.user_id;

    const payload = {
      order: orderPayload,
      items: items.map((item) => {
        const wg = (item as unknown as Record<string, unknown>).weightGrams as number | undefined;
        const wd = (item as unknown as Record<string, unknown>).weightDisplay as string | undefined;
        const pu = (item as unknown as Record<string, unknown>).productUnit as string | undefined;
        return {
          id: item.id,
          product_id: item.productId,
          snapshot: item.snapshot,
          quantity: item.quantity,
          unit_price_amount: item.unitPrice.amount,
          unit_price_currency: item.unitPrice.currency,
          subtotal_amount: item.subtotal.amount,
          subtotal_currency: item.subtotal.currency,
          weight_grams: wg ?? item.quantity,
          weight_display: wd ?? String(item.quantity),
          product_unit: pu ?? (item.snapshot as unknown as Record<string, unknown>)?.unit ?? null,
        };
      }),
      timeline: timeline.map((entry) => ({
        status: entry.status,
        changed_by: entry.changedBy,
        note: entry.note,
      })),
    };

    const result = await supabaseService.rpc<{
      order: Record<string, unknown>;
      items: Record<string, unknown>[];
      timeline: Record<string, unknown>[];
    }>('place_cod_order', { payload });

    const order = toOrder(result.order);
    order.items = toItems(result.items);
    order.timeline = toTimeline(result.timeline);
    return order;
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
