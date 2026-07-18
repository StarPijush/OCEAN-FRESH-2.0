import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CartStateMachine } from '../service/cart-state-machine.js';
import { CartPricingService } from '../service/cart-pricing.service.js';
import { CartValidationService } from '../service/cart-validation.service.js';
import { CartMergeService } from '../service/cart-merge.service.js';
import { CartService } from '../service/cart.service.js';
import { CartCheckoutFactory } from '../service/cart-checkout-context.interface.js';
import { InMemoryEventBus } from '../events/in-memory-event-bus.js';
import {
  CartStatus,
  IllegalCartStateTransitionError,
  Quantity,
  CartSource,
  CartEventType,
} from '@oceanfresh/shared';

function createMockRepository() {
  return {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findBySessionId: vi.fn(),
    findByUserOrSession: vi.fn(),
    findAll: vi.fn(),
    exists: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    updateStatus: vi.fn(),
    updateTotals: vi.fn(),
    clearItems: vi.fn(),
    merge: vi.fn(),
    delete: vi.fn(),
  };
}

function createMockCatalog() {
  return {
    getProduct: vi.fn(),
    getProducts: vi.fn(),
    isAvailable: vi.fn(),
    getPrice: vi.fn(),
  };
}

function sampleCart(overrides = {}) {
  return {
    id: 'cart-1',
    userId: 'user-1',
    sessionId: null,
    source: CartSource.AUTHENTICATED,
    status: CartStatus.ACTIVE,
    items: [],
    totals: {
      subtotal: { amount: 0, currency: 'INR' },
      tax: { amount: 0, currency: 'INR' },
      shipping: { amount: 0, currency: 'INR' },
      discount: { amount: 0, currency: 'INR' },
      grandTotal: { amount: 0, currency: 'INR' },
    },
    expiresAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('CartStateMachine', () => {
  it('allows valid transition ACTIVE → VALIDATING', () => {
    expect(() => CartStateMachine.transition(CartStatus.ACTIVE, CartStatus.VALIDATING)).not.toThrow();
  });

  it('rejects invalid transition ACTIVE → CHECKED_OUT', () => {
    expect(() => CartStateMachine.transition(CartStatus.ACTIVE, CartStatus.CHECKED_OUT)).toThrow(IllegalCartStateTransitionError);
  });

  it('rejects transition from terminal state CHECKED_OUT', () => {
    expect(() => CartStateMachine.transition(CartStatus.CHECKED_OUT, CartStatus.ACTIVE)).toThrow(IllegalCartStateTransitionError);
  });

  it('allows EXPIRED → ACTIVE reactivation', () => {
    expect(() => CartStateMachine.transition(CartStatus.EXPIRED, CartStatus.ACTIVE)).not.toThrow();
  });

  it('allows ABANDONED → ACTIVE reactivation', () => {
    expect(() => CartStateMachine.transition(CartStatus.ABANDONED, CartStatus.ACTIVE)).not.toThrow();
  });

  it('identifies terminal states', () => {
    expect(CartStateMachine.isTerminal(CartStatus.CHECKED_OUT)).toBe(true);
    expect(CartStateMachine.isTerminal(CartStatus.EXPIRED)).toBe(true);
    expect(CartStateMachine.isTerminal(CartStatus.ACTIVE)).toBe(false);
  });

  it('canTransition returns false for invalid transitions', () => {
    expect(CartStateMachine.canTransition(CartStatus.ACTIVE, CartStatus.CHECKED_OUT)).toBe(false);
  });
});

describe('CartPricingService', () => {
  const pricing = new CartPricingService();

  it('calculates subtotal from items', () => {
    const items = [
      { subtotal: { amount: 100, currency: 'INR' } },
      { subtotal: { amount: 50, currency: 'INR' } },
    ] as any;
    expect(pricing.calculateSubtotal(items)).toEqual({ amount: 150, currency: 'INR' });
  });

  it('calculates tax as 5% of subtotal', () => {
    expect(pricing.calculateTax({ amount: 200, currency: 'INR' })).toEqual({ amount: 10, currency: 'INR' });
  });

  it('shipping is free above threshold', async () => {
    const shipping = await pricing.calculateShipping([], { amount: 500, currency: 'INR' });
    expect(shipping).toEqual({ amount: 0, currency: 'INR' });
  });

  it('shipping is 40 below threshold', async () => {
    const shipping = await pricing.calculateShipping([], { amount: 100, currency: 'INR' });
    expect(shipping).toEqual({ amount: 40, currency: 'INR' });
  });

  it('calculateTotals returns full breakdown', async () => {
    const items = [
      { subtotal: { amount: 300, currency: 'INR' }, quantity: Quantity.create(1) },
    ] as any;
    const totals = await pricing.calculateTotals(items);
    expect(totals.subtotal).toEqual({ amount: 300, currency: 'INR' });
    expect(totals.tax).toEqual({ amount: 15, currency: 'INR' });
    expect(totals.shipping).toEqual({ amount: 40, currency: 'INR' });
    expect(totals.discount).toEqual({ amount: 0, currency: 'INR' });
    expect(totals.grandTotal.amount).toBeCloseTo(355);
  });
});

describe('CartValidationService', () => {
  let catalog: ReturnType<typeof createMockCatalog>;
  let validator: CartValidationService;

  beforeEach(() => {
    catalog = createMockCatalog();
    validator = new CartValidationService(catalog as any);
  });

  it('returns valid for empty cart', async () => {
    const cart = sampleCart();
    const result = await validator.validateCart(cart);
    expect(result.valid).toBe(true);
  });

  it('detects missing products', async () => {
    catalog.getProducts.mockResolvedValue(new Map());
    const cart = sampleCart({
      items: [{
        id: 'item-1',
        productId: 'prod-1',
        quantity: Quantity.create(1),
        snapshot: { price: { amount: 100, currency: 'INR' } },
      }],
    });
    const result = await validator.validateCart(cart);
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe('PRODUCT_NOT_FOUND');
  });

  it('detects unavailable products', async () => {
    catalog.getProducts.mockResolvedValue(new Map([
      ['prod-1', { id: 'prod-1', name: 'Test', isAvailable: false, stock: 5, price: { amount: 100, currency: 'INR' } }],
    ]));
    const cart = sampleCart({
      items: [{
        id: 'item-1',
        productId: 'prod-1',
        quantity: Quantity.create(1),
        snapshot: { price: { amount: 100, currency: 'INR' } },
      }],
    });
    const result = await validator.validateCart(cart);
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe('PRODUCT_UNAVAILABLE');
  });

  it('detects insufficient stock', async () => {
    catalog.getProducts.mockResolvedValue(new Map([
      ['prod-1', { id: 'prod-1', name: 'Test', isAvailable: true, stock: 2, price: { amount: 100, currency: 'INR' } }],
    ]));
    const cart = sampleCart({
      items: [{
        id: 'item-1',
        productId: 'prod-1',
        quantity: Quantity.create(5),
        snapshot: { price: { amount: 100, currency: 'INR' } },
      }],
    });
    const result = await validator.validateCart(cart);
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe('INSUFFICIENT_STOCK');
  });

  it('detects price changes', async () => {
    catalog.getProducts.mockResolvedValue(new Map([
      ['prod-1', { id: 'prod-1', name: 'Test', isAvailable: true, stock: 10, price: { amount: 150, currency: 'INR' } }],
    ]));
    const cart = sampleCart({
      items: [{
        id: 'item-1',
        productId: 'prod-1',
        quantity: Quantity.create(1),
        snapshot: { price: { amount: 100, currency: 'INR' } },
      }],
    });
    const result = await validator.validateCart(cart);
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe('PRICE_CHANGED');
  });
});

describe('CartMergeService', () => {
  let repository: ReturnType<typeof createMockRepository>;
  let merger: CartMergeService;

  beforeEach(() => {
    repository = createMockRepository();
    merger = new CartMergeService(repository as any);
  });

  it('creates new cart when no guest or user cart exists', async () => {
    repository.findByUserId.mockResolvedValue(null);
    repository.findBySessionId.mockResolvedValue(null);
    repository.create.mockResolvedValue(sampleCart({ id: 'cart-new' }));

    const result = await merger.mergeGuestIntoUser('session-1', 'user-1');
    expect(result.id).toBe('cart-new');
  });

  it('adopts guest cart when no user cart exists', async () => {
    repository.findByUserId.mockResolvedValue(null);
    repository.findBySessionId.mockResolvedValue(sampleCart({ id: 'guest-cart' }));
    repository.merge.mockResolvedValue(sampleCart({ id: 'guest-cart' }));

    const result = await merger.mergeGuestIntoUser('session-1', 'user-1');
    expect(result.id).toBe('guest-cart');
  });

  it('returns existing user cart when no guest cart exists', async () => {
    repository.findByUserId.mockResolvedValue(sampleCart({ id: 'user-cart' }));
    repository.findBySessionId.mockResolvedValue(null);

    const result = await merger.mergeGuestIntoUser('session-1', 'user-1');
    expect(result.id).toBe('user-cart');
  });
});

describe('CartCheckoutFactory', () => {
  it('creates CartCheckoutContext from Cart', () => {
    const factory = new CartCheckoutFactory();
    const cart = sampleCart({
      items: [{
        id: 'item-1',
        productId: 'prod-1',
        quantity: Quantity.create(2),
        subtotal: { amount: 200, currency: 'INR' },
        snapshot: {
          productId: 'prod-1',
          name: 'Fish',
          price: { amount: 100, currency: 'INR' },
          thumbnail: '',
          image: '',
          sku: null,
          unit: 'kg' as any,
          variantSummary: null,
          capturedAt: new Date(),
        },
        addedAt: new Date(),
      }],
    });

    const ctx = factory.createCheckoutContext(cart);
    expect(ctx.cartId).toBe('cart-1');
    expect(ctx.items).toHaveLength(1);
    expect(ctx.items[0]!.quantity).toBe(2);
    expect(ctx.items[0]!.name).toBe('Fish');
    expect(ctx.currency).toBe('INR');
  });
});

describe('CartService', () => {
  let repository: ReturnType<typeof createMockRepository>;
  let catalog: ReturnType<typeof createMockCatalog>;
  let eventBus: InMemoryEventBus;
  let service: CartService;

  beforeEach(() => {
    repository = createMockRepository();
    catalog = createMockCatalog();
    eventBus = new InMemoryEventBus();
    service = new CartService(repository as any, catalog as any, eventBus);
  });

  it('getCart returns cart from repository', async () => {
    repository.findById.mockResolvedValue(sampleCart());
    const cart = await service.getCart('cart-1');
    expect(cart.id).toBe('cart-1');
  });

  it('getCart throws NotFoundError for missing cart', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.getCart('missing')).rejects.toThrow('Cart not found');
  });

  it('getOrCreateCart creates guest cart when no userId or sessionId', async () => {
    repository.create.mockResolvedValue(sampleCart({ id: 'new-cart', source: CartSource.GUEST }));
    const cart = await service.getOrCreateCart(null, null);
    expect(cart.id).toBe('new-cart');
  });

  it('updateStatus validates state machine', async () => {
    repository.findById.mockResolvedValue(sampleCart());
    repository.updateStatus.mockResolvedValue(sampleCart({ status: CartStatus.VALIDATING }));

    const cart = await service.updateStatus('cart-1', CartStatus.VALIDATING);
    expect(cart.status).toBe(CartStatus.VALIDATING);
  });

  it('updateStatus rejects invalid transition', async () => {
    repository.findById.mockResolvedValue(sampleCart());
    await expect(service.updateStatus('cart-1', CartStatus.CHECKED_OUT)).rejects.toThrow(IllegalCartStateTransitionError);
  });
});
