import { rtdbList, rtdbUpdate } from './rtdb';
import type { OrderData } from './types';

export const orderRepository = {
  async getAll(): Promise<OrderData[]> {
    const list = await rtdbList<OrderData>('orders');
    return list.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
  },

  async updateStatus(id: string, status: OrderData['status']): Promise<void> {
    await rtdbUpdate(`orders/${id}`, { status });
  },
};
