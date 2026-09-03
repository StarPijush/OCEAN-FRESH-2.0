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

export type ChartRange = 'week' | 'month';
export type ChartMetric = 'income' | 'sales';

export interface ChartDataPoint {
  label: string;
  sales: number;
  income: number;
  date: number;
  isCurrent?: boolean;
}

export interface AnalyticsChartData {
  range: ChartRange;
  metric: ChartMetric;
  data: ChartDataPoint[];
  maxValue: number;
  yAxisTicks: { value: number; label: string }[];
}

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

function niceNumber(value: number, round: boolean): number {
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / Math.pow(10, exponent);
  let niceFraction: number;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }
  return niceFraction * Math.pow(10, exponent);
}

function formatTickLabel(value: number, metric: ChartMetric): string {
  if (metric === 'sales') return String(Math.round(value));
  if (value < 1000) return `₹${Math.round(value)}`;
  if (value % 1000 === 0) return `₹${value / 1000}k`;
  return `₹${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
}

function generateYAxisTicks(
  maxValue: number,
  metric: ChartMetric,
): { value: number; label: string }[] {
  if (maxValue <= 0) {
    return [{ value: 0, label: metric === 'income' ? '₹0' : '0' }];
  }

  const targetSteps = 4;
  const rawStep = maxValue / targetSteps;
  const niceStep = niceNumber(rawStep, true);
  const niceMax = Math.ceil(maxValue / niceStep) * niceStep;
  const tickCount = Math.round(niceMax / niceStep);

  const ticks: { value: number; label: string }[] = [];
  for (let i = 0; i <= tickCount; i++) {
    const v = i * niceStep;
    ticks.push({ value: v, label: formatTickLabel(v, metric) });
  }

  ticks.reverse();
  if (ticks.length < 2) return ticks;
  // Limit to 5 ticks for readability on small heights
  if (ticks.length > 6) {
    // Thin out to max 5
    const step = Math.ceil(ticks.length / 5);
    return ticks.filter((_, idx) => idx % step === 0);
  }
  return ticks;
}

function computeWeekChart(orders: Order[], today: Date): ChartDataPoint[] {
  const todayStart = startOfDay(today);
  const data: ChartDataPoint[] = [];

  for (let i = 6; i >= 0; i -= 1) {
    const dayStart = todayStart - i * DAY_MS;
    const dayEnd = dayStart + DAY_MS;
    const dayOrders = orders.filter((o) => {
      const ts = orderCreatedAtMs(o);
      return Number.isFinite(ts) && ts >= dayStart && ts < dayEnd;
    });
    const paidDayOrders = dayOrders.filter((o) => PAID_STATUSES.has(o.status));
    data.push({
      label: orderDayLabel(dayStart),
      sales: dayOrders.length,
      income: paidDayOrders.reduce((sum, o) => sum + orderRevenue(o), 0),
      date: dayStart,
      isCurrent: i === 0,
    });
  }

  return data;
}

function computeMonthChart(orders: Order[], today: Date): ChartDataPoint[] {
  const todayStart = startOfDay(today);
  const data: ChartDataPoint[] = [];

  // Day-by-day for last 30 days (incl today) — compact monthly trends
  const days = 30;
  for (let i = days - 1; i >= 0; i -= 1) {
    const dayStart = todayStart - i * DAY_MS;
    const dayEnd = dayStart + DAY_MS;
    const dayOrders = orders.filter((o) => {
      const ts = orderCreatedAtMs(o);
      return Number.isFinite(ts) && ts >= dayStart && ts < dayEnd;
    });
    const paidDayOrders = dayOrders.filter((o) => PAID_STATUSES.has(o.status));
    // Label as day number + short month for first/last and current, else day number
    const d = new Date(dayStart);
    const label = d.toLocaleDateString('en-IN', { day: 'numeric' });
    data.push({
      label,
      sales: dayOrders.length,
      income: paidDayOrders.reduce((sum, o) => sum + orderRevenue(o), 0),
      date: dayStart,
      isCurrent: i === 0,
    });
  }

  return data;
}

export function getChartData(
  orders: Order[],
  range: ChartRange,
  metric: ChartMetric,
  today = new Date(),
): AnalyticsChartData {
  const data =
    range === 'week' ? computeWeekChart(orders, today) : computeMonthChart(orders, today);

  const values = data.map((d) => (metric === 'income' ? d.income : d.sales));
  const maxValue = Math.max(...values, 0);
  const yAxisTicks = generateYAxisTicks(maxValue, metric);

  return {
    range,
    metric,
    data,
    maxValue,
    yAxisTicks,
  };
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
    // Weight-based availability: OUT_OF_STOCK vs ACTIVE (stock kept for DB compat only)
    outOfStock: products.filter((p) => p.status === ProductStatus.OUT_OF_STOCK).length,
    lowStock: 0,
    avgOrderValue: paidOrders.length > 0 ? totalIncome / paidOrders.length : 0,
    chart,
    topProducts,
    recentOrders: orders.slice(0, 5),
  };
}
