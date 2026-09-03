import { type Order, OrderStatus, type Product, ProductStatus } from '@oceanfresh/shared';
import { describe, expect, it } from 'vitest';

import { computeDashboardStats, PAID_STATUSES, PENDING_STATUSES } from './dashboard-stats';

const TODAY = new Date('2026-08-10T12:00:00Z');
const TODAY_MS = TODAY.getTime();

function makeOrder(partial: Record<string, unknown> = {}): Order {
  return {
    id: 'order-1',
    orderNumber: 'OF-1001',
    status: OrderStatus.PAID,
    createdAt: new Date(TODAY_MS - 60 * 1000).toISOString(),
    totals: { grandTotal: { amount: 200 } },
    items: [
      { id: 'item-1', quantity: 2, snapshot: { name: 'Rohu' } },
      { id: 'item-2', quantity: 1, snapshot: { name: 'Prawns' } },
    ],
    ...partial,
  } as unknown as Order;
}

function makeProduct(partial: Record<string, unknown> = {}): Product {
  return {
    id: 'p-1',
    name: 'Rohu',
    status: ProductStatus.ACTIVE,
    stock: 10,
    price: 200,
    ...partial,
  } as unknown as Product;
}

describe('PAID_STATUSES / PENDING_STATUSES', () => {
  it('excludes CANCELLED and DRAFT from both buckets', () => {
    expect(PAID_STATUSES.has(OrderStatus.CANCELLED)).toBe(false);
    expect(PENDING_STATUSES.has(OrderStatus.CANCELLED)).toBe(false);
    expect(PAID_STATUSES.has(OrderStatus.DELIVERED)).toBe(true);
    expect(PENDING_STATUSES.has(OrderStatus.VALIDATING)).toBe(true);
  });
});

describe('computeDashboardStats', () => {
  it('counts today sales and income from paid orders only', () => {
    const stats = computeDashboardStats(
      [
        makeOrder({ id: 'a', orderNumber: 'OF-1', status: OrderStatus.PAID }),
        makeOrder({
          id: 'b',
          orderNumber: 'OF-2',
          status: OrderStatus.CANCELLED,
          totals: { grandTotal: { amount: 999 } },
        }),
        makeOrder({ id: 'c', orderNumber: 'OF-3', status: OrderStatus.PENDING_PAYMENT }),
      ],
      [],
      TODAY,
    );

    expect(stats.todaySales).toBe(3);
    expect(stats.todayIncome).toBe(200);
    expect(stats.totalOrders).toBe(3);
    expect(stats.pendingOrders).toBe(1);
    expect(stats.totalIncome).toBe(200);
  });

  it('computes week income from the 7-day chart', () => {
    const order6DaysAgo = makeOrder({
      id: 'old',
      orderNumber: 'OF-0',
      status: OrderStatus.DELIVERED,
      createdAt: new Date(TODAY_MS - 6 * 24 * 60 * 60 * 1000).toISOString(),
    });
    const stats = computeDashboardStats([order6DaysAgo], [], TODAY);

    expect(stats.chart).toHaveLength(7);
    expect(stats.weekIncome).toBe(200);
    expect(stats.chart.reduce((sum, d) => sum + d.income, 0)).toBe(200);
  });

  it('excludes orders older than the 7-day window', () => {
    const ancient = makeOrder({
      id: 'ancient',
      orderNumber: 'OF-X',
      status: OrderStatus.DELIVERED,
      createdAt: new Date(TODAY_MS - 8 * 24 * 60 * 60 * 1000).toISOString(),
    });
    const stats = computeDashboardStats([ancient], [], TODAY);
    expect(stats.weekIncome).toBe(0);
    expect(stats.chart.reduce((sum, d) => sum + d.income, 0)).toBe(0);
  });

  it('aggregates top products by quantity', () => {
    const orderA = makeOrder({
      id: 'a',
      orderNumber: 'OF-1',
      items: [{ id: 'i1', quantity: 3, snapshot: { name: 'Rohu' } }],
    });
    const orderB = makeOrder({
      id: 'b',
      orderNumber: 'OF-2',
      items: [{ id: 'i2', quantity: 2, snapshot: { name: 'Rohu' } }],
    });
    const stats = computeDashboardStats([orderA, orderB], [], TODAY);

    expect(stats.topProducts).toEqual([{ name: 'Rohu', qty: 5 }]);
    expect(stats.recentOrders.map((o) => o.orderNumber)).toEqual(['OF-1', 'OF-2']);
  });

  it('derives product availability buckets', () => {
    const stats = computeDashboardStats(
      [],
      [
        makeProduct({ id: 'p1', name: 'A', status: ProductStatus.ACTIVE, stock: 10 }),
        makeProduct({ id: 'p2', name: 'B', status: ProductStatus.ACTIVE, stock: 0 }),
        makeProduct({ id: 'p3', name: 'C', status: ProductStatus.OUT_OF_STOCK }),
        makeProduct({ id: 'p4', name: 'D', status: ProductStatus.ACTIVE, stock: 3 }),
        makeProduct({ id: 'p5', name: 'E', status: ProductStatus.DRAFT, stock: 9 }),
      ],
      TODAY,
    );

    expect(stats.totalProducts).toBe(5);
    expect(stats.availableProducts).toBe(3);
    // Weight-based: availability is status-driven, stock ignored (deprecated)
    expect(stats.outOfStock).toBe(1);
    expect(stats.lowStock).toBe(0);
  });

  it('computes average order value over paid orders', () => {
    const stats = computeDashboardStats(
      [
        makeOrder({ id: 'a', orderNumber: 'OF-1', status: OrderStatus.PAID }),
        makeOrder({ id: 'b', orderNumber: 'OF-2', status: OrderStatus.DELIVERED }),
        makeOrder({ id: 'c', orderNumber: 'OF-3', status: OrderStatus.CANCELLED }),
      ],
      [],
      TODAY,
    );
    expect(stats.avgOrderValue).toBe(200);
  });

  it('returns zero revenue stats with no orders', () => {
    const stats = computeDashboardStats([], [], TODAY);
    expect(stats.totalIncome).toBe(0);
    expect(stats.avgOrderValue).toBe(0);
    expect(stats.chart).toHaveLength(7);
    expect(stats.topProducts).toEqual([]);
  });
});
