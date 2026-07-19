import type { OrderQuery, OrderStatus } from '@oceanfresh/shared';
import { useQuery } from '@tanstack/react-query';

import { getOrderRepository } from '../repository/index.js';
import { orderKeys } from './order.query-keys.js';

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(id as string),
    queryFn: () => getOrderRepository().findById(id as string),
    enabled: !!id,
  });
}

export function useOrderByNumber(orderNumber: string | undefined) {
  return useQuery({
    queryKey: orderKeys.orderNumber(orderNumber as string),
    queryFn: () => getOrderRepository().findByOrderNumber(orderNumber as string),
    enabled: !!orderNumber,
  });
}

export function useOrders(query: OrderQuery) {
  return useQuery({
    queryKey: orderKeys.list(query as unknown as Record<string, unknown>),
    queryFn: () => getOrderRepository().findAll(query),
  });
}

export function useCustomerOrders(userId: string | undefined) {
  return useQuery({
    queryKey: orderKeys.user(userId as string),
    queryFn: () => getOrderRepository().findByUserId(userId as string),
    enabled: !!userId,
  });
}

export function useOrderStatus(status: string | undefined) {
  return useQuery({
    queryKey: orderKeys.status(status as string),
    queryFn: () => getOrderRepository().findByStatus(status as OrderStatus),
    enabled: !!status,
  });
}

export function useRecentOrders(limit = 10) {
  return useQuery({
    queryKey: [...orderKeys.recent(), { limit }],
    queryFn: () => getOrderRepository().findAll({ limit } as OrderQuery),
  });
}
