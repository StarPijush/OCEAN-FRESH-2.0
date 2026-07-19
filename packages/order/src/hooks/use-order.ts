import type { OrderQuery } from '@oceanfresh/shared';

import {
  useCustomerOrders,
  useOrder as useOrderQuery,
  useOrders,
  useRecentOrders,
} from '../queries/index.js';

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
