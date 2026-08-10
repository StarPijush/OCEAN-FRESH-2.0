import { type Order, OrderStatus, type Product, ProductStatus } from '@oceanfresh/shared';

export interface RevenueDay {
  label: string;
  value: number;
}

export interface DashboardStats {
  revenueTotal: number;
  ordersCount: number;
  pendingCount: number;
  productsOnline: number;
  outOfStock: number;
  lowStock: number;
  avgOrderValue: number;
  revenueByDay: RevenueDay[];
}

/** Statuses whose payment is captured — counted toward revenue. */
export const PAID_STATUSES: ReadonlySet<OrderStatus> = new Set<OrderStatus>([
  OrderStatus.PAID,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.PACKED,
  OrderStatus.SHIPPED,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
]);

/** Statuses awaiting action — counted on the pending tile. */
export const PENDING_STATUSES: ReadonlySet<OrderStatus> = new Set<OrderStatus>([
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.PAYMENT_FAILED,
  OrderStatus.VALIDATING,
]);

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function computeDashboardStats(
  orders: Order[],
  products: Product[],
  today = new Date(),
): DashboardStats {
  const activeProducts = products.filter((p) => p.status === ProductStatus.ACTIVE);
  const paidOrders = orders.filter((o) => PAID_STATUSES.has(o.status));
  const revenueTotal = paidOrders.reduce((sum, o) => sum + (o.totals?.grandTotal?.amount ?? 0), 0);
  const pendingCount = orders.filter((o) => PENDING_STATUSES.has(o.status)).length;

  const todayStart = startOfDay(today);
  const revenueByDay: RevenueDay[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const dayStart = todayStart - i * DAY_MS;
    const dayEnd = dayStart + DAY_MS;
    const value = paidOrders
      .filter((o) => {
        const ts = new Date(o.createdAt).getTime();
        return ts >= dayStart && ts < dayEnd;
      })
      .reduce((sum, o) => sum + (o.totals?.grandTotal?.amount ?? 0), 0);
    revenueByDay.push({
      label: new Date(dayStart).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
      }),
      value,
    });
  }

  return {
    revenueTotal,
    ordersCount: orders.length,
    pendingCount,
    productsOnline: activeProducts.length,
    outOfStock: products.filter(
      (p) => p.status === ProductStatus.OUT_OF_STOCK || (p.stock ?? 0) === 0,
    ).length,
    lowStock: products.filter(
      (p) => p.status === ProductStatus.ACTIVE && (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5,
    ).length,
    avgOrderValue: paidOrders.length > 0 ? revenueTotal / paidOrders.length : 0,
    revenueByDay,
  };
}
