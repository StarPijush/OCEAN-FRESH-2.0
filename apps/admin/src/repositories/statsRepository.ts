import { orderRepository } from './supabase-order.repository';
import { productRepository } from './supabase-product.repository';
import type { ChartDay, DashboardStats, OrderData } from './types';

export const statsRepository = {
  async getStats(): Promise<DashboardStats> {
    const [orders, products] = await Promise.all([
      orderRepository.getAll(),
      productRepository.getAll(),
    ]);

    const todayTs = new Date().setHours(0, 0, 0, 0);
    const sum = (arr: OrderData[]) => arr.reduce((a, o) => a + (o.total || 0), 0);
    const todayOrders = orders.filter((o) => o.ts >= todayTs);

    const chart: ChartDay[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(todayTs - i * 86400000);
      const s = day.getTime();
      const e = s + 86400000;
      const d = orders.filter((o) => o.ts >= s && o.ts < e);
      chart.push({
        label: day.toLocaleDateString('en-IN', { weekday: 'short' }),
        sales: d.length,
        income: sum(d),
      });
    }

    const weekIncome = chart.reduce((a, d) => a + d.income, 0);

    const productSales: Record<string, number> = {};
    for (const o of orders) {
      for (const it of o.items || []) {
        productSales[it.name] = (productSales[it.name] || 0) + it.qty;
      }
    }
    const topProducts = Object.entries(productSales)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return {
      todaySales: todayOrders.length,
      todayIncome: sum(todayOrders),
      weekIncome,
      totalOrders: orders.length,
      totalIncome: sum(orders),
      pendingOrders: orders.filter((o) => o.status === 'pending').length,
      totalProducts: products.length,
      availableProducts: products.filter((p) => p.available).length,
      chart,
      recentOrders: orders.slice(0, 5),
      topProducts,
    };
  },
};
