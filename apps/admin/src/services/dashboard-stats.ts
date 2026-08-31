import { type Order, OrderStatus, type Product, ProductStatus } from '@oceanfresh/shared';

export interface RevenueDay {
  label: string;
  value: number;
}

export interface ChartDay {
  label: string;
  sales: number;
  income: number;
}

export interface TopProduct {
  name: string;
  qty: number;
}

export interface DashboardStats {
  /** Orders created today. */
  todaySales: number;
  /** Revenue from today's paid orders. */
  todayIncome: number;
  /** Revenue from the last 7 days (paid orders). */
  weekIncome: number;
  /** Orders awaiting action — matches the Orders "Pending" tab and sidebar badge. */
  pendingOrders: number;
  totalOrders: number;
  totalIncome: number;
  totalProducts: number;
  availableProducts: number;
  outOfStock: number;
  lowStock: number;
  avgOrderValue: number;
  chart: ChartDay[];
  topProducts: TopProduct[];
  recentOrders: Order[];
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

function orderRevenue(order: Order): number {
  return order.totals?.grandTotal?.amount ?? 0;
}

function orderDayLabel(ts: number): string {
  return new Date(ts).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
  });
}

function toDateSafe(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value as string);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function orderCreatedAtMs(order: Order): number {
  const d = toDateSafe((order as unknown as Record<string, unknown>).createdAt);
  return d ? d.getTime() : NaN;
}

export function computeDashboardStats(
  orders: Order[],
  products: Product[],
  today = new Date(),
): DashboardStats {
  const activeProducts = products.filter((p) => p.status === ProductStatus.ACTIVE);
  const paidOrders = orders.filter((o) => PAID_STATUSES.has(o.status));
  const totalIncome = paidOrders.reduce((sum, o) => sum + orderRevenue(o), 0);
  const pendingOrders = orders.filter((o) => PENDING_STATUSES.has(o.status)).length;

  const todayStart = startOfDay(today);

  const chart: ChartDay[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const dayStart = todayStart - i * DAY_MS;
    const dayEnd = dayStart + DAY_MS;
    const dayOrders = orders.filter((o) => {
      const ts = orderCreatedAtMs(o);
      return Number.isFinite(ts) && ts >= dayStart && ts < dayEnd;
    });
    chart.push({
      label: orderDayLabel(dayStart),
      sales: dayOrders.length,
      income: dayOrders
        .filter((o) => PAID_STATUSES.has(o.status))
        .reduce((sum, o) => sum + orderRevenue(o), 0),
    });
  }

  const weekIncome = chart.reduce((sum, d) => sum + d.income, 0);
  const todayOrders = orders.filter((o) => {
    const ts = orderCreatedAtMs(o);
    return Number.isFinite(ts) && ts >= todayStart;
  });

  const productSales: Record<string, number> = {};
  for (const o of orders) {
    for (const it of o.items ?? []) {
      const name = it.snapshot?.name ?? 'Unknown';
      productSales[name] = (productSales[name] ?? 0) + it.quantity;
    }
  }
  const topProducts: TopProduct[] = Object.entries(productSales)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return {
    todaySales: todayOrders.length,
    todayIncome: todayOrders
      .filter((o) => PAID_STATUSES.has(o.status))
      .reduce((sum, o) => sum + orderRevenue(o), 0),
    weekIncome,
    pendingOrders,
    totalOrders: orders.length,
    totalIncome,
    totalProducts: products.length,
    availableProducts: activeProducts.length,
    outOfStock: products.filter(
      (p) => p.status === ProductStatus.OUT_OF_STOCK || (p.stock ?? 0) === 0,
    ).length,
    lowStock: products.filter(
      (p) => p.status === ProductStatus.ACTIVE && (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5,
    ).length,
    avgOrderValue: paidOrders.length > 0 ? totalIncome / paidOrders.length : 0,
    chart,
    topProducts,
    recentOrders: orders.slice(0, 5),
  };
}
