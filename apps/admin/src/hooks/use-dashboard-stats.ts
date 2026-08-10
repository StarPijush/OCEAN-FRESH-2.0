import { getOrderRepository } from '@oceanfresh/order/repository';
import { getProductRepository } from '@oceanfresh/product/repository';
import { useQuery } from '@tanstack/react-query';

import { computeDashboardStats, type DashboardStats } from '../services/dashboard-stats';

export function useDashboardStats(): {
  data: DashboardStats | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const query = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const [orders, products] = await Promise.all([
        getOrderRepository().findAll({ limit: 200 }),
        getProductRepository().findAll({ limit: 100 }),
      ]);
      return computeDashboardStats(orders.items, products.items);
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error instanceof Error ? query.error : null,
    refetch: () => void query.refetch(),
  };
}
