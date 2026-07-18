import { useQuery } from '@tanstack/react-query';
import type { OrderQuery } from '@oceanfresh/shared';
import { orderKeys } from './order.query-keys.js';
import { getOrderRepository } from '../repository/index.js';

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(id!),
    queryFn: () => getOrderRepository().findById(id!),
    enabled: !!id,
  });
}

export function useOrderByNumber(orderNumber: string | undefined) {
  return useQuery({
    queryKey: orderKeys.orderNumber(orderNumber!),
    queryFn: () => getOrderRepository().findByOrderNumber(orderNumber!),
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
    queryKey: orderKeys.user(userId!),
    queryFn: () => getOrderRepository().findByUserId(userId!),
    enabled: !!userId,
  });
}

export function useOrderStatus(status: string | undefined) {
  return useQuery({
    queryKey: orderKeys.status(status!),
    queryFn: () => getOrderRepository().findByStatus(status as any),
    enabled: !!status,
  });
}

export function useRecentOrders(limit = 10) {
  return useQuery({
    queryKey: [...orderKeys.recent(), { limit }],
    queryFn: () => getOrderRepository().findAll({ limit } as OrderQuery),
  });
}
