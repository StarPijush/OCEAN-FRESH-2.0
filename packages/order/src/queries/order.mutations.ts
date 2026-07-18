import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Order, CreateOrderFromCheckoutInput, CartCheckoutContext, OrderStatus } from '@oceanfresh/shared';
import { orderKeys } from './order.query-keys.js';
import { getOrderRepository } from '../repository/index.js';

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      getOrderRepository().create({} as Order),
    onSuccess: (order: Order) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(order.id) });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      getOrderRepository().updateStatus(orderId, 'cancelled' as OrderStatus, 'user', reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status, changedBy, note }: { orderId: string; status: OrderStatus; changedBy: string; note?: string }) =>
      getOrderRepository().updateStatus(orderId, status, changedBy, note),
    onSuccess: (order: Order) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(order.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

export function useArchiveOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => getOrderRepository().archive(orderId),
    onSuccess: (order: Order) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(order.id) });
    },
  });
}
