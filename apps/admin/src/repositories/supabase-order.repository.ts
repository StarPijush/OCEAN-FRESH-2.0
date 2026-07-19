import { supabaseService } from '@oceanfresh/supabase';

import type { OrderData } from './types';

const TABLE = 'orders';
const TABLE_ITEMS = 'order_items';

export const orderRepository = {
  async getAll(): Promise<OrderData[]> {
    const rows = await supabaseService.query<Record<string, unknown>>(TABLE, []);
    const orders: OrderData[] = [];

    for (const row of rows) {
      const items = await supabaseService.query<Record<string, unknown>>(TABLE_ITEMS, [
        { field: 'order_id', operator: 'eq', value: row.id },
      ]);

      orders.push({
        id: row.id as string,
        name: ((row.customer_snapshot as Record<string, unknown>)?.name as string) ?? '',
        phone: ((row.customer_snapshot as Record<string, unknown>)?.phone as string) ?? '',
        address: ((row.customer_snapshot as Record<string, unknown>)?.address as string) ?? '',
        items: items.map((i) => ({
          name: ((i.snapshot as Record<string, unknown>)?.name as string) ?? '',
          qty: (i.quantity as number) ?? 0,
          price: (i.unit_price_amount as number) ?? 0,
          sub: (i.subtotal_amount as number) ?? 0,
        })),
        total:
          (((row.totals as Record<string, unknown>)?.grandTotal as Record<string, unknown>)
            ?.amount as number) ?? 0,
        status: (row.status as OrderData['status']) ?? 'pending',
        ts: row.created_at ? new Date(row.created_at as string).getTime() : 0,
      });
    }

    return orders.sort((a, b) => b.ts - a.ts);
  },

  async updateStatus(id: string, status: OrderData['status']): Promise<void> {
    await supabaseService.update(TABLE, id, { status });
  },
};
