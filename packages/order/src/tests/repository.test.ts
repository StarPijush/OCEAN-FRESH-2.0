import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@oceanfresh/firebase', () => {
  const mockDoc = vi.fn();
  return {
    firestoreService: {
      getDb: vi.fn(() => ({
        collection: vi.fn(() => ({ doc: mockDoc })),
      })),
      get: vi.fn(),
      query: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    Timestamp: null as unknown as {
      new (): unknown;
      now(): unknown;
      fromMillis(ms: number): unknown;
    },
  };
});

vi.mock('firebase/firestore', () => {
  class MockTimestamp {
    seconds: number;
    nanoseconds: number;
    constructor(seconds: number, nanoseconds: number) {
      this.seconds = seconds;
      this.nanoseconds = nanoseconds;
    }
    static now() {
      return new MockTimestamp(1000, 0);
    }
    static fromMillis(ms: number) {
      return new MockTimestamp(Math.floor(ms / 1000), 0);
    }
  }
  return {
    Timestamp: MockTimestamp,
    runTransaction: vi.fn(),
    doc: vi.fn(),
  };
});

import { firestoreService } from '@oceanfresh/firebase';
import { type Order, OrderSource, OrderStatus } from '@oceanfresh/shared';

import { FirestoreOrderRepository } from '../repository/firestore-order.repository.js';

describe('FirestoreOrderRepository', () => {
  let repo: FirestoreOrderRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new FirestoreOrderRepository();
  });

  it('findById returns null when document not found', async () => {
    vi.mocked(firestoreService.get).mockResolvedValue(null);
    const result = await repo.findById('missing');
    expect(result).toBeNull();
  });

  it('findById returns order when document exists', async () => {
    vi.mocked(firestoreService.get).mockResolvedValue({
      id: 'order-1',
      orderNumber: 'OF-2026-000001',
      status: OrderStatus.DRAFT,
    });
    const result = await repo.findById('order-1');
    expect(result).not.toBeNull();
    expect((result as Order).id).toBe('order-1');
  });

  it('findByOrderNumber returns order', async () => {
    vi.mocked(firestoreService.query).mockResolvedValue([
      { id: 'order-1', orderNumber: 'OF-2026-000001', status: OrderStatus.DRAFT },
    ]);
    const result = await repo.findByOrderNumber('OF-2026-000001');
    expect(result).not.toBeNull();
    expect((result as Order).id).toBe('order-1');
  });

  it('findByIdempotencyKey returns order', async () => {
    vi.mocked(firestoreService.query).mockResolvedValue([
      { id: 'order-1', idempotencyKey: 'ik-1', status: OrderStatus.DRAFT },
    ]);
    const result = await repo.findByIdempotencyKey('ik-1');
    expect(result).not.toBeNull();
    expect((result as Order).id).toBe('order-1');
  });

  it('findByIdempotencyKey returns null when no match', async () => {
    vi.mocked(firestoreService.query).mockResolvedValue([]);
    const result = await repo.findByIdempotencyKey('ik-missing');
    expect(result).toBeNull();
  });

  it('create persists a new order', async () => {
    vi.mocked(firestoreService.add).mockResolvedValue({ id: 'new-order' });
    const orderData = {
      id: '',
      orderNumber: 'OF-2026-000001',
      idempotencyKey: 'ik-1',
      source: OrderSource.CHECKOUT,
      status: OrderStatus.DRAFT,
      items: [],
      totals: {
        subtotal: { amount: 0, currency: 'INR' },
        discount: { amount: 0, currency: 'INR' },
        shipping: { amount: 0, currency: 'INR' },
        tax: { amount: 0, currency: 'INR' },
        grandTotal: { amount: 0, currency: 'INR' },
      },
      customerSnapshot: {
        name: 'Test',
        email: null,
        phone: '9876543210',
        address: 'Addr',
        city: 'City',
        state: 'State',
        pincode: '123456',
      },
      shippingSnapshot: {
        address: 'Addr',
        city: 'City',
        state: 'State',
        pincode: '123456',
        method: 'standard',
        amount: { amount: 0, currency: 'INR' },
      },
      billingSnapshot: {
        address: 'Addr',
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
    };
    const result = await repo.create(orderData);
    expect(result.id).toBe('new-order');
    expect(result.orderNumber).toBe('OF-2026-000001');
  });

  it('delete throws for missing order', async () => {
    vi.mocked(firestoreService.get).mockResolvedValue(null);
    await expect(repo.delete('missing')).rejects.toThrow();
  });
});
