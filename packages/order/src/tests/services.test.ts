import type { IProductCatalog } from '@oceanfresh/product';
import {
  IllegalOrderStateTransitionError,
  type Order,
  OrderSource,
  OrderStatus,
  type ProductUnit,
} from '@oceanfresh/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InMemoryEventBus } from '../events/in-memory-event-bus.js';
import type { IOrderRepository } from '../repository/index.js';
import { OrderService } from '../service/order.service.js';
import type { OrderCancellationService } from '../service/order-cancellation.service.js';
import type { OrderHistoryService } from '../service/order-history.service.js';
import type { OrderNumberGenerator } from '../service/order-number-generator.js';
import { OrderPricingService } from '../service/order-pricing.service.js';
import { OrderSnapshotService } from '../service/order-snapshot.service.js';
import { OrderStateMachine } from '../service/order-state-machine.js';
import { OrderValidationService } from '../service/order-validation.service.js';

function createMockRepository(): IOrderRepository {
  return {
    findById: vi.fn(),
    findByOrderNumber: vi.fn(),
    findByIdempotencyKey: vi.fn(),
    findByUserId: vi.fn(),
    findAll: vi.fn(),
    findByStatus: vi.fn(),
    exists: vi.fn(),
    existsByOrderNumber: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
    appendTimeline: vi.fn(),
    updatePayment: vi.fn(),
    archive: vi.fn(),
    delete: vi.fn(),
  };
}

function createMockCatalog(): IProductCatalog {
  return {
    getProduct: vi.fn(),
    getProducts: vi.fn(),
    isAvailable: vi.fn(),
    getPrice: vi.fn(),
  };
}

function sampleOrder(overrides = {}): Order {
  return {
    id: 'order-1',
    orderNumber: 'OF-2026-000001',
    idempotencyKey: 'ik-1',
    source: OrderSource.CHECKOUT,
    status: OrderStatus.DRAFT,
    items: [],
    totals: {
      subtotal: { amount: 500, currency: 'INR' },
      discount: { amount: 0, currency: 'INR' },
      shipping: { amount: 40, currency: 'INR' },
      tax: { amount: 25, currency: 'INR' },
      grandTotal: { amount: 565, currency: 'INR' },
    },
    customerSnapshot: {
      name: 'Test User',
      email: null,
      phone: '9876543210',
      address: 'Test St',
      city: 'City',
      state: 'State',
      pincode: '123456',
    },
    shippingSnapshot: {
      address: 'Test St',
      city: 'City',
      state: 'State',
      pincode: '123456',
      method: 'standard',
      amount: { amount: 40, currency: 'INR' },
    },
    billingSnapshot: {
      address: 'Test St',
      city: 'City',
      state: 'State',
      pincode: '123456',
      gstin: null,
    },
    payment: {
      method: null,
      transactionId: null,
      paidAmount: null,
      paidAt: null,
      gatewayResponse: null,
    },
    timeline: [],
    notes: '',
    cartId: 'cart-1',
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function sampleCheckoutContext() {
  return {
    cartId: 'cart-1',
    userId: 'user-1',
    sessionId: null,
    items: [
      {
        productId: 'prod-1',
        name: 'Fish',
        quantity: 2,
        unitPrice: { amount: 250, currency: 'INR' },
        subtotal: { amount: 500, currency: 'INR' },
        snapshot: {
          productId: 'prod-1',
          name: 'Fish',
          sku: null,
          thumbnail: '',
          image: '',
          price: { amount: 250, currency: 'INR' },
          currency: 'INR',
          unit: 'kg' as ProductUnit,
          variantSummary: null,
          capturedAt: new Date(),
        },
      },
    ],
    totals: {
      subtotal: { amount: 500, currency: 'INR' },
      tax: { amount: 25, currency: 'INR' },
      shipping: { amount: 40, currency: 'INR' },
      discount: { amount: 0, currency: 'INR' },
      grandTotal: { amount: 565, currency: 'INR' },
    },
    currency: 'INR',
    createdAt: new Date(),
  };
}

describe('OrderStateMachine', () => {
  it('allows valid transition DRAFT → VALIDATING', () => {
    expect(() =>
      OrderStateMachine.transition(OrderStatus.DRAFT, OrderStatus.VALIDATING),
    ).not.toThrow();
  });

  it('rejects invalid transition DRAFT → DELIVERED', () => {
    expect(() => OrderStateMachine.transition(OrderStatus.DRAFT, OrderStatus.DELIVERED)).toThrow(
      IllegalOrderStateTransitionError,
    );
  });

  it('allows PAID → REFUND_REQUESTED (no direct CANCELLED)', () => {
    expect(OrderStateMachine.canTransition(OrderStatus.PAID, OrderStatus.CANCELLED)).toBe(false);
    expect(OrderStateMachine.canTransition(OrderStatus.PAID, OrderStatus.REFUND_REQUESTED)).toBe(
      true,
    );
  });

  it('rejects transition from terminal state REFUNDED', () => {
    expect(() => OrderStateMachine.transition(OrderStatus.REFUNDED, OrderStatus.DRAFT)).toThrow(
      IllegalOrderStateTransitionError,
    );
  });

  it('rejects transition from terminal state ARCHIVED', () => {
    expect(() => OrderStateMachine.transition(OrderStatus.ARCHIVED, OrderStatus.DRAFT)).toThrow(
      IllegalOrderStateTransitionError,
    );
  });

  it('identifies terminal states', () => {
    expect(OrderStateMachine.isTerminal(OrderStatus.REFUNDED)).toBe(true);
    expect(OrderStateMachine.isTerminal(OrderStatus.ARCHIVED)).toBe(true);
    expect(OrderStateMachine.isTerminal(OrderStatus.DRAFT)).toBe(false);
    expect(OrderStateMachine.isTerminal(OrderStatus.DELIVERED)).toBe(false);
  });

  it('identifies cancellable states', () => {
    expect(OrderStateMachine.isCancellable(OrderStatus.VALIDATING)).toBe(true);
    expect(OrderStateMachine.isCancellable(OrderStatus.CONFIRMED)).toBe(true);
    expect(OrderStateMachine.isCancellable(OrderStatus.DELIVERED)).toBe(false);
    expect(OrderStateMachine.isCancellable(OrderStatus.PAID)).toBe(false);
  });

  it('identifies refundable states', () => {
    expect(OrderStateMachine.isRefundable(OrderStatus.PAID)).toBe(true);
    expect(OrderStateMachine.isRefundable(OrderStatus.DELIVERED)).toBe(true);
    expect(OrderStateMachine.isRefundable(OrderStatus.CANCELLED)).toBe(true);
    expect(OrderStateMachine.isRefundable(OrderStatus.DRAFT)).toBe(false);
  });

  it('canTransition returns correct values', () => {
    expect(OrderStateMachine.canTransition(OrderStatus.DRAFT, OrderStatus.VALIDATING)).toBe(true);
    expect(OrderStateMachine.canTransition(OrderStatus.DRAFT, OrderStatus.CANCELLED)).toBe(false);
  });
});

describe('OrderPricingService', () => {
  let catalog: ReturnType<typeof createMockCatalog>;
  let pricing: OrderPricingService;

  beforeEach(() => {
    catalog = createMockCatalog();
    pricing = new OrderPricingService(catalog);
  });

  it('calculates totals from checkout context', async () => {
    const ctx = sampleCheckoutContext();
    const totals = await pricing.calculateTotals(ctx);
    expect(totals.subtotal).toEqual({ amount: 500, currency: 'INR' });
    expect(totals.tax).toEqual({ amount: 25, currency: 'INR' });
    expect(totals.shipping).toEqual({ amount: 40, currency: 'INR' });
  });
});

describe('OrderSnapshotService', () => {
  const snapshotService = new OrderSnapshotService();

  it('creates product snapshot from checkout context', () => {
    const ctx = sampleCheckoutContext();
    const snapshots = snapshotService.createProductSnapshot(ctx);
    expect(snapshots).toHaveLength(1);
    const snapshot = snapshots[0] as NonNullable<(typeof snapshots)[0]>;
    expect(snapshot.name).toBe('Fish');
    expect(snapshot.productId).toBe('prod-1');
  });

  it('creates customer snapshot', () => {
    const input = {
      name: 'Test',
      email: 'test@test.com',
      phone: '9876543210',
      address: 'Addr',
      city: 'City',
      state: 'State',
      pincode: '123456',
    };
    const snapshot = snapshotService.createCustomerSnapshot(input);
    expect(snapshot.name).toBe('Test');
    expect(snapshot.phone).toBe('9876543210');
  });

  it('creates shipping snapshot', () => {
    const input = {
      address: 'Addr',
      city: 'City',
      state: 'State',
      pincode: '123456',
      method: 'express',
      amount: { amount: 80, currency: 'INR' },
    };
    const snapshot = snapshotService.createShippingSnapshot(input);
    expect(snapshot.method).toBe('express');
    expect(snapshot.amount.amount).toBe(80);
  });

  it('creates billing snapshot', () => {
    const input = {
      address: 'Addr',
      city: 'City',
      state: 'State',
      pincode: '123456',
      gstin: 'GSTIN123',
    };
    const snapshot = snapshotService.createBillingSnapshot(input);
    expect(snapshot.gstin).toBe('GSTIN123');
  });
});

describe('OrderService', () => {
  let repository: ReturnType<typeof createMockRepository>;
  let catalog: ReturnType<typeof createMockCatalog>;
  let eventBus: InMemoryEventBus;
  let service: OrderService;

  beforeEach(() => {
    repository = createMockRepository();
    catalog = createMockCatalog();
    eventBus = new InMemoryEventBus();
    const validator = new OrderValidationService(catalog);
    const snapshotService = new OrderSnapshotService();
    const numberGen = {
      generateNumber: vi.fn().mockResolvedValue('OF-2026-000001'),
    } as OrderNumberGenerator;
    const pricing = new OrderPricingService(catalog);
    const history = { recordStatusChange: vi.fn() } as unknown as OrderHistoryService;
    const cancellation = {
      cancel: vi.fn(),
      requestRefund: vi.fn(),
      completeRefund: vi.fn(),
    } as unknown as OrderCancellationService;
    service = new OrderService(
      repository,
      validator,
      snapshotService,
      numberGen,
      pricing,
      cancellation,
      history,
      eventBus,
    );
  });

  it('getOrder returns order from repository', async () => {
    repository.findById.mockResolvedValue(sampleOrder());
    const order = await service.getOrder('order-1');
    expect(order.orderNumber).toBe('OF-2026-000001');
  });

  it('getOrder throws for missing order', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.getOrder('missing')).rejects.toThrow('Order not found');
  });

  it('createFromCheckout returns existing order for duplicate idempotency key', async () => {
    repository.findByIdempotencyKey.mockResolvedValue(sampleOrder({ id: 'existing-order' }));
    const ctx = sampleCheckoutContext();
    const input = {
      cartId: 'cart-1',
      idempotencyKey: 'dup-key',
      userId: 'user-1',
      customer: {
        name: 'Test',
        email: null,
        phone: '9876543210',
        address: 'Addr',
        city: 'City',
        state: 'State',
        pincode: '123456',
      },
      shipping: {
        address: 'Addr',
        city: 'City',
        state: 'State',
        pincode: '123456',
        method: 'standard',
        amount: { amount: 40, currency: 'INR' },
      },
      billing: { address: 'Addr', city: 'City', state: 'State', pincode: '123456', gstin: null },
    };
    const result = await service.createFromCheckout(ctx, input);
    expect(result.id).toBe('existing-order');
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('createFromCheckout creates new order', async () => {
    repository.findByIdempotencyKey.mockResolvedValue(null);
    repository.create.mockResolvedValue(sampleOrder({ id: 'new-order' }));
    repository.updateStatus.mockResolvedValue(
      sampleOrder({ id: 'new-order', status: OrderStatus.VALIDATING }),
    );
    catalog.getProducts.mockResolvedValue(
      new Map([
        [
          'prod-1',
          {
            id: 'prod-1',
            name: 'Fish',
            isAvailable: true,
            stock: 10,
            price: { amount: 250, currency: 'INR' },
          },
        ],
      ]),
    );

    const ctx = sampleCheckoutContext();
    const input = {
      cartId: 'cart-1',
      idempotencyKey: 'ik-new',
      userId: 'user-1',
      customer: {
        name: 'Test',
        email: null,
        phone: '9876543210',
        address: 'Addr',
        city: 'City',
        state: 'State',
        pincode: '123456',
      },
      shipping: {
        address: 'Addr',
        city: 'City',
        state: 'State',
        pincode: '123456',
        method: 'standard',
        amount: { amount: 40, currency: 'INR' },
      },
      billing: { address: 'Addr', city: 'City', state: 'State', pincode: '123456', gstin: null },
    };
    const result = await service.createFromCheckout(ctx, input);
    expect(result.status).toBe(OrderStatus.VALIDATING);
    expect(repository.create).toHaveBeenCalled();
  });

  it('updateStatus validates state machine', async () => {
    const order = sampleOrder({ status: OrderStatus.CONFIRMED });
    repository.findById.mockResolvedValue(order);
    repository.updateStatus.mockResolvedValue({ ...order, status: OrderStatus.PROCESSING });

    const result = await service.updateStatus('order-1', OrderStatus.PROCESSING, 'user');
    expect(result.status).toBe(OrderStatus.PROCESSING);
  });

  it('updateStatus rejects invalid transition', async () => {
    repository.findById.mockResolvedValue(sampleOrder());
    await expect(service.updateStatus('order-1', OrderStatus.DELIVERED, 'user')).rejects.toThrow(
      IllegalOrderStateTransitionError,
    );
  });
});
