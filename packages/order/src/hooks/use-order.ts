import { useOrder as useOrderQuery, useOrders, useCustomerOrders, useRecentOrders } from '../queries/index.js';
import type { OrderQuery } from '@oceanfresh/shared';

export function useGetOrder(orderId: string | undefined) {
  return useOrderQuery(orderId);
}

export function useGetOrders(query: OrderQuery) {
  return useOrders(query);
}

export function useGetCustomerOrders(userId: string | undefined) {
  return useCustomerOrders(userId);
}

export function useGetRecentOrders(limit?: number) {
  return useRecentOrders(limit);
}

export type { Order } from '@oceanfresh/shared';
