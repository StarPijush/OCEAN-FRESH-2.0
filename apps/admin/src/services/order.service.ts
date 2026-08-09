import { getOrderRepository } from '@oceanfresh/order/repository';
import { OrderStatus } from '@oceanfresh/shared';

import type { OrderData } from '../types.js';
import { toOrderData } from '../utils/order-data.js';

export const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.DRAFT]: 'Draft',
  [OrderStatus.VALIDATING]: 'Pending Confirmation',
  [OrderStatus.PENDING_PAYMENT]: 'Payment Pending',
  [OrderStatus.PAYMENT_FAILED]: 'Payment Failed',
  [OrderStatus.PAID]: 'Paid',
  [OrderStatus.CONFIRMED]: 'Confirmed',
  [OrderStatus.PROCESSING]: 'Preparing',
  [OrderStatus.PACKED]: 'Packed',
  [OrderStatus.SHIPPED]: 'Shipped',
  [OrderStatus.OUT_FOR_DELIVERY]: 'Out for Delivery',
  [OrderStatus.DELIVERED]: 'Delivered',
  [OrderStatus.CANCELLED]: 'Cancelled',
  [OrderStatus.REFUND_REQUESTED]: 'Refund Requested',
  [OrderStatus.REFUNDED]: 'Refunded',
  [OrderStatus.ARCHIVED]: 'Archived',
};

export const PENDING_STATUSES = new Set<OrderStatus>([
  OrderStatus.VALIDATING,
  OrderStatus.CONFIRMED,
]);

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  [OrderStatus.VALIDATING]: OrderStatus.CONFIRMED,
  [OrderStatus.CONFIRMED]: OrderStatus.PROCESSING,
  [OrderStatus.PROCESSING]: OrderStatus.OUT_FOR_DELIVERY,
  [OrderStatus.OUT_FOR_DELIVERY]: OrderStatus.DELIVERED,
};

const TERMINAL_STATUSES = new Set<OrderStatus>([
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
  OrderStatus.ARCHIVED,
  OrderStatus.REFUNDED,
  OrderStatus.REFUND_REQUESTED,
]);

export function getNextStatus(status: OrderStatus): OrderStatus | null {
  return NEXT_STATUS[status] ?? null;
}

export function isCancellable(status: OrderStatus): boolean {
  return !TERMINAL_STATUSES.has(status);
}

async function getAllOrders(): Promise<OrderData[]> {
  const repo = getOrderRepository();
  const result = await repo.findAll({ limit: 200 });
  return result.items.map(toOrderData);
}

export const orderService = {
  async getAll(): Promise<OrderData[]> {
    return getAllOrders();
  },

  async updateStatus(id: string, status: OrderStatus): Promise<{ pendingCount: number }> {
    const repo = getOrderRepository();
    await repo.updateStatus(id, status, 'admin');
    const pendingCount = await repo.count({ status: [...PENDING_STATUSES] });
    return { pendingCount };
  },
};
