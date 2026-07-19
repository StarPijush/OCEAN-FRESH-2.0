import {
  createLogger,
  type Order,
  type OrderStatus,
  type OrderTimelineEntry,
} from '@oceanfresh/shared';

import type { IOrderRepository } from '../repository/index.js';

const logger = createLogger('order:history');

export class OrderHistoryService {
  constructor(private readonly repository: IOrderRepository) {}

  async recordStatusChange(
    order: Order,
    newStatus: OrderStatus,
    changedBy: string,
    note: string | null = null,
  ): Promise<Order> {
    const entry: OrderTimelineEntry = {
      status: newStatus,
      timestamp: new Date(),
      changedBy,
      note,
    };

    logger.info('Recording status change', {
      orderId: order.id,
      from: order.status,
      to: newStatus,
      changedBy,
    });

    return this.repository.appendTimeline(order.id, entry);
  }
}
