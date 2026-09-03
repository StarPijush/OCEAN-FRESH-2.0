import { getOrderRepository } from '@oceanfresh/order/repository';
import { getProductRepository } from '@oceanfresh/product/repository';
import type { Order, Product } from '@oceanfresh/shared';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  type AnalyticsChartData,
  type ChartRange,
  computeDashboardStats,
  type DashboardStats,
  getChartData,
} from '../services/dashboard-stats';

function useDashboardStatsBase() {
  const query = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async (): Promise<{ orders: Order[]; products: Product[] }> => {
      const [orders, products] = await Promise.all([
        getOrderRepository().findAll({ limit: 500 }),
        getProductRepository().findAll({ limit: 500 }),
      ]);
      return { orders: orders.items, products: products.items };
    },
  });

  return {
    data: query.data ? computeDashboardStats(query.data.orders, query.data.products) : undefined,
    rawOrders: query.data?.orders ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error instanceof Error ? query.error : null,
    refetch: () => void query.refetch(),
  };
}

export function useDashboardStats(
  range: ChartRange = 'week',
  metric: 'income' | 'sales' = 'income',
): {
  data: DashboardStats | undefined;
  chartData: AnalyticsChartData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const base = useDashboardStatsBase();

  const chartData = useMemo(() => {
    if (!base.data) return undefined;
    return getChartData(base.rawOrders, range, metric, new Date());
  }, [base.data, base.rawOrders, range, metric]);

  return {
    data: base.data,
    chartData,
    isLoading: base.isLoading,
    isError: base.isError,
    error: base.error,
    refetch: base.refetch,
  };
}
