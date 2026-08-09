import { type Order, OrderSource, OrderStatus } from '@oceanfresh/shared';
import { supabaseService } from '@oceanfresh/supabase';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SupabaseOrderRepository } from '../repository/supabase-order.repository.js';

vi.mock('@oceanfresh/supabase', async (importOriginal) => {
  const mod = await importOriginal<typeof supabaseService>();
  return {
    ...mod,
    supabaseService: {
      get: vi.fn(),
      query: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      upsert: vi.fn(),
      count: vi.fn(),
      rpc: vi.fn(),
    },
  };
});

describe('SupabaseOrderRepository', () => {
  let repo: SupabaseOrderRepository;

  beforeEach(() => {
    vi.resetAllMocks();
    repo = new SupabaseOrderRepository();
  });

  it('findById returns null when document not found', async () => {
    vi.mocked(supabaseService.get).mockResolvedValue(null);
    const result = await repo.findById('missing');
    expect(result).toBeNull();
  });

  it('findById returns order when document exists', async () => {
    vi.mocked(supabaseService.get).mockResolvedValue({
      id: 'order-1',
      order_number: 'OF-2026-000001',
      status: OrderStatus.DRAFT,
    });
    vi.mocked(supabaseService.query).mockResolvedValue([]);
    const result = await repo.findById('order-1');
    expect(result).not.toBeNull();
    expect((result as Order).id).toBe('order-1');
  });

  it('findByOrderNumber returns order', async () => {
    vi.mocked(supabaseService.query).mockResolvedValue([
      { id: 'order-1', order_number: 'OF-2026-000001', status: OrderStatus.DRAFT },
    ]);
    vi.mocked(supabaseService.get).mockResolvedValue({
      id: 'order-1',
      order_number: 'OF-2026-000001',
      status: OrderStatus.DRAFT,
    });
    const result = await repo.findByOrderNumber('OF-2026-000001');
    expect(result).not.toBeNull();
    expect((result as Order).id).toBe('order-1');
  });

  it('findByIdempotencyKey returns order', async () => {
    vi.mocked(supabaseService.query).mockResolvedValue([
      { id: 'order-1', idempotency_key: 'ik-1', status: OrderStatus.DRAFT },
    ]);
    vi.mocked(supabaseService.get).mockResolvedValue({
      id: 'order-1',
      idempotency_key: 'ik-1',
      status: OrderStatus.DRAFT,
    });
    const result = await repo.findByIdempotencyKey('ik-1');
    expect(result).not.toBeNull();
    expect((result as Order).id).toBe('order-1');
  });

  it('findByIdempotencyKey returns null when no match', async () => {
    vi.mocked(supabaseService.query).mockResolvedValue([]);
    const result = await repo.findByIdempotencyKey('ik-missing');
    expect(result).toBeNull();
  });

  it('create persists a new order', async () => {
    vi.mocked(supabaseService.add).mockResolvedValue({ id: 'new-order' });
    vi.mocked(supabaseService.get).mockResolvedValue({
      id: 'new-order',
      order_number: 'OF-2026-000001',
      status: OrderStatus.DRAFT,
    });
    vi.mocked(supabaseService.query).mockResolvedValue([]);
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

  it('create routes guest orders through place_cod_order RPC', async () => {
    vi.mocked(supabaseService.rpc).mockResolvedValue({
      order: { id: 'guest-1', order_number: 'OF-2026-000099', status: OrderStatus.VALIDATING },
      items: [
        {
          id: 'item-1',
          order_id: 'guest-1',
          product_id: 'product-1',
          snapshot: {
            productId: 'product-1',
            name: 'Rohu',
            sku: null,
            thumbnail: '',
            image: '',
            price: { amount: 250, currency: 'INR' },
            currency: 'INR',
            unit: 'KG',
            variantSummary: null,
          },
          quantity: 2,
          unit_price_amount: 250,
          unit_price_currency: 'INR',
          subtotal_amount: 500,
          subtotal_currency: 'INR',
        },
      ],
      timeline: [
        {
          order_id: 'guest-1',
          status: OrderStatus.VALIDATING,
          changed_by: 'customer',
          note: 'Order placed (Cash on Delivery)',
        },
      ],
    } as never);

    const orderData = {
      id: 'guest-1',
      orderNumber: 'OF-2026-000099',
      idempotencyKey: 'cod-guest-1',
      source: OrderSource.CHECKOUT,
      status: OrderStatus.VALIDATING,
      items: [
        {
          id: 'item-1',
          productId: 'product-1',
          snapshot: {
            productId: 'product-1',
            name: 'Rohu',
            sku: null,
            thumbnail: '',
            image: '',
            price: { amount: 250, currency: 'INR' },
            currency: 'INR',
            unit: 'KG',
            variantSummary: null,
          },
          quantity: 2,
          unitPrice: { amount: 250, currency: 'INR' },
          subtotal: { amount: 500, currency: 'INR' },
        },
      ],
      totals: {
        subtotal: { amount: 500, currency: 'INR' },
        discount: { amount: 0, currency: 'INR' },
        shipping: { amount: 0, currency: 'INR' },
        tax: { amount: 0, currency: 'INR' },
        grandTotal: { amount: 500, currency: 'INR' },
      },
      customerSnapshot: {
        name: 'Guest',
        email: null,
        phone: '9876543210',
        address: 'Addr',
        city: '',
        state: '',
        pincode: '',
      },
      shippingSnapshot: {
        address: 'Addr',
        city: '',
        state: '',
        pincode: '',
        method: 'delivery',
        amount: { amount: 0, currency: 'INR' },
      },
      billingSnapshot: {
        address: 'Addr',
        city: '',
        state: '',
        pincode: '',
        gstin: null,
      },
      payment: {
        method: 'COD',
        transactionId: null,
        paidAmount: null,
        paidAt: null,
        gatewayResponse: null,
      },
      timeline: [
        {
          status: OrderStatus.VALIDATING,
          timestamp: new Date(),
          changedBy: 'customer',
          note: 'Order placed (Cash on Delivery)',
        },
      ],
      notes: '',
      cartId: null,
      userId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as Order;

    const result = await repo.create(orderData);

    expect(supabaseService.rpc).toHaveBeenCalledWith('place_cod_order', expect.anything());
    const rpcCall = vi.mocked(supabaseService.rpc).mock.calls[0]?.[1] as {
      payload: Record<string, unknown>;
    };
    expect(rpcCall.payload.order.idempotency_key).toBe('cod-guest-1');
    expect(rpcCall.payload.order.user_id).toBeUndefined();
    expect(rpcCall.payload.items).toHaveLength(1);
    expect(result.id).toBe('guest-1');
    expect(result.items?.[0]?.quantity).toBe(2);
  });

  it('create surfaces RPC failures as RepositoryError', async () => {
    vi.mocked(supabaseService.rpc).mockRejectedValue(new Error('boom'));

    await expect(
      repo.create({
        id: 'g',
        orderNumber: 'OF-X',
        idempotencyKey: 'ik-x',
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
          name: 'G',
          email: null,
          phone: '1',
          address: 'A',
          city: '',
          state: '',
          pincode: '',
        },
        shippingSnapshot: {
          address: 'A',
          city: '',
          state: '',
          pincode: '',
          method: 'delivery',
          amount: { amount: 0, currency: 'INR' },
        },
        billingSnapshot: {
          address: 'A',
          city: '',
          state: '',
          pincode: '',
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
        cartId: null,
        userId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).rejects.toThrow('Failed to create order');
  });

  it('delete throws for missing order', async () => {
    vi.mocked(supabaseService.get).mockResolvedValue(null);
    await expect(repo.delete('missing')).rejects.toThrow();
  });

  describe('batched queries (N+1 elimination)', () => {
    const orderRows: Record<string, unknown>[] = [
      { id: 'o1', order_number: 'OF-1', status: OrderStatus.VALIDATING, user_id: 'u1' },
      { id: 'o2', order_number: 'OF-2', status: OrderStatus.CONFIRMED, user_id: 'u1' },
      { id: 'o3', order_number: 'OF-3', status: OrderStatus.VALIDATING, user_id: 'u2' },
    ];
    const itemRows = [
      {
        id: 'i1',
        order_id: 'o1',
        product_id: 'p1',
        quantity: 2,
        unit_price_amount: 100,
        unit_price_currency: 'INR',
        subtotal_amount: 200,
        subtotal_currency: 'INR',
      },
      {
        id: 'i2',
        order_id: 'o1',
        product_id: 'p2',
        quantity: 1,
        unit_price_amount: 50,
        unit_price_currency: 'INR',
        subtotal_amount: 50,
        subtotal_currency: 'INR',
      },
      {
        id: 'i3',
        order_id: 'o2',
        product_id: 'p1',
        quantity: 3,
        unit_price_amount: 100,
        unit_price_currency: 'INR',
        subtotal_amount: 300,
        subtotal_currency: 'INR',
      },
    ];
    const timelineRows = [
      {
        id: 't1',
        order_id: 'o1',
        status: OrderStatus.VALIDATING,
        changed_by: 'customer',
        note: null,
        created_at: new Date().toISOString(),
      },
      {
        id: 't2',
        order_id: 'o2',
        status: OrderStatus.CONFIRMED,
        changed_by: 'admin',
        note: null,
        created_at: new Date().toISOString(),
      },
    ];

    function mockBatches(orderRowsOverride: Record<string, unknown>[] = orderRows) {
      vi.mocked(supabaseService.count).mockResolvedValue(orderRowsOverride.length);
      vi.mocked(supabaseService.query)
        .mockResolvedValueOnce(orderRowsOverride)
        .mockResolvedValueOnce(itemRows)
        .mockResolvedValueOnce(timelineRows);
    }

    it('findAll hydrates every order with only TWO child queries (no per-order findById)', async () => {
      mockBatches();

      const result = await repo.findAll({ limit: 100, sort: 'createdAt', sortDirection: 'desc' });

      expect(result.items).toHaveLength(3);
      expect(result.items[0]?.items).toHaveLength(2);
      expect(result.items[1]?.items).toHaveLength(1);
      expect(result.items[0]?.timeline).toHaveLength(1);
      expect(result.items[2]?.items).toHaveLength(0);
      expect(supabaseService.get).not.toHaveBeenCalled();
      expect(supabaseService.query).toHaveBeenCalledWith('order_items', [
        { field: 'order_id', operator: 'in', value: ['o1', 'o2', 'o3'] },
      ]);
      expect(supabaseService.query).toHaveBeenCalledWith(
        'order_timeline_entries',
        [{ field: 'order_id', operator: 'in', value: ['o1', 'o2', 'o3'] }],
        { orderByField: 'created_at', orderDirection: 'asc' },
      );
      expect(supabaseService.query).toHaveBeenCalledTimes(3);
    });

    it('findAll returns empty without issuing child queries when no orders', async () => {
      vi.mocked(supabaseService.count).mockResolvedValue(0);
      vi.mocked(supabaseService.query).mockResolvedValueOnce([]);

      const result = await repo.findAll({ limit: 100 });

      expect(result.items).toHaveLength(0);
      expect(supabaseService.query).toHaveBeenCalledTimes(1);
    });

    it('findByUserId hydrates with batched child queries', async () => {
      mockBatches(orderRows.filter((o) => o.user_id === 'u1'));

      const result = await repo.findByUserId('u1');

      expect(result).toHaveLength(2);
      expect(supabaseService.get).not.toHaveBeenCalled();
      expect(supabaseService.query).toHaveBeenCalledWith('order_items', [
        { field: 'order_id', operator: 'in', value: ['o1', 'o2'] },
      ]);
    });

    it('findByStatus hydrates with batched child queries', async () => {
      mockBatches(orderRows.filter((o) => o.status === OrderStatus.VALIDATING));

      const result = await repo.findByStatus(OrderStatus.VALIDATING);

      expect(result).toHaveLength(2);
      expect(supabaseService.get).not.toHaveBeenCalled();
      expect(supabaseService.query).toHaveBeenCalledTimes(3);
    });

    it('findAll handles 500 orders in 3 child-batched queries without per-order round trips', async () => {
      const big = Array.from({ length: 500 }, (_, i) => ({
        id: `o${i}`,
        order_number: `OF-${i}`,
        status: OrderStatus.VALIDATING,
      }));
      mockBatches(big);

      const result = await repo.findAll({ limit: 500 });

      expect(result.items).toHaveLength(500);
      expect(supabaseService.query).toHaveBeenCalledTimes(3);
      expect(supabaseService.get).not.toHaveBeenCalled();
    });
  });
});
