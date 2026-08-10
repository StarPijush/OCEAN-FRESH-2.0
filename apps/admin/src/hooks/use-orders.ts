import { getOrderRepository } from '@oceanfresh/order/repository';
import type { Order, OrderQuery, OrderStatus, PaginatedResult } from '@oceanfresh/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { PENDING_STATUSES } from '../services/dashboard-stats';

export const ORDERS_KEY = ['orders'] as const;
export const PENDING_ORDERS_KEY = ['orders', 'pending-count'] as const;

export interface UseOrdersOptions {
  page?: number;
  limit?: number;
  status?: OrderStatus | OrderStatus[] | 'ALL' | undefined;
}

export function useOrders(options: UseOrdersOptions = {}) {
  const { page = 1, limit = 50, status = 'ALL' } = options;
  const query: OrderQuery = { page, limit };
  if (status !== 'ALL') query.status = status as OrderStatus | OrderStatus[];
  return useQuery({
    queryKey: [...ORDERS_KEY, { page, limit, status }],
    queryFn: (): Promise<PaginatedResult<Order>> => getOrderRepository().findAll(query),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      status: OrderStatus;
      changedBy: string;
      note?: string;
    }) => getOrderRepository().updateStatus(input.id, input.status, input.changedBy, input.note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
      queryClient.invalidateQueries({ queryKey: PENDING_ORDERS_KEY });
    },
  });
}

/** Number of orders awaiting action — drives the sidebar badge. */
export function usePendingOrderCount() {
  return useQuery({
    queryKey: PENDING_ORDERS_KEY,
    queryFn: () => getOrderRepository().count({ status: [...PENDING_STATUSES] as OrderStatus[] }),
  });
}

export interface OrderCounts {
  total: number;
  pending: number;
}

/** Recent-order totals used for tab badges. */
export function useOrderCounts() {
  return useQuery({
    queryKey: [...ORDERS_KEY, 'counts'],
    queryFn: async (): Promise<OrderCounts> => {
      const [total, pending] = await Promise.all([
        getOrderRepository().count({}),
        getOrderRepository().count({ status: [...PENDING_STATUSES] as OrderStatus[] }),
      ]);
      return { total, pending };
    },
  });
}
