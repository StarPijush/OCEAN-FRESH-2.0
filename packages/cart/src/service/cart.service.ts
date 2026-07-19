import type { IProductCatalog } from '@oceanfresh/product';
import {
  type AddToCartInput,
  type Cart,
  CartEventType,
  type CartItem,
  CartSource,
  CartStatus,
  type Money,
  NotFoundError,
  type ProductSnapshot,
  Quantity,
} from '@oceanfresh/shared';

import type { EventBus } from '../events/index.js';
import type { ICartRepository } from '../repository/index.js';
import {
  type CartCheckoutContext,
  CartCheckoutFactory,
} from './cart-checkout-context.interface.js';
import { CartMergeService } from './cart-merge.service.js';
import { CartPricingService } from './cart-pricing.service.js';
import { CartStateMachine } from './cart-state-machine.js';
import { CartValidationService } from './cart-validation.service.js';

export class CartService {
  constructor(
    private readonly repository: ICartRepository,
    private readonly catalog: IProductCatalog,
    private readonly eventBus: EventBus,
    private readonly pricing: CartPricingService = new CartPricingService(),
    private readonly validator: CartValidationService = new CartValidationService(catalog),
    private readonly merger: CartMergeService = new CartMergeService(repository),
    private readonly checkoutFactory: CartCheckoutFactory = new CartCheckoutFactory(),
  ) {}

  async getCart(cartId: string): Promise<Cart> {
    const cart = await this.repository.findById(cartId);
    if (!cart) throw new NotFoundError('Cart not found');
    return cart;
  }

  async getOrCreateCart(userId: string | null, sessionId: string | null): Promise<Cart> {
    if (!userId && !sessionId) {
      return this.repository.create({ userId: null, sessionId: null, source: CartSource.GUEST });
    }

    if (userId && sessionId) {
      const merged = await this.merger.mergeGuestIntoUser(sessionId, userId);
      return merged;
    }

    const existing = await this.repository.findByUserOrSession(userId, sessionId);
    if (existing) return existing;

    return this.repository.create({
      userId,
      sessionId,
      source: userId ? CartSource.AUTHENTICATED : CartSource.GUEST,
    });
  }

  async addItem(
    cartId: string,
    input: AddToCartInput,
    userId?: string | null,
    sessionId?: string | null,
  ): Promise<Cart> {
    let cart = await this.getOrCreateCart(userId ?? null, sessionId ?? null);
    cartId = cart.id;

    const validationError = await this.validator.validateItem(input.productId, input.quantity);
    if (validationError) {
      throw validationError;
    }

    const product = await this.catalog.getProduct(input.productId);
    if (!product) throw new NotFoundError('Product not found');

    const snapshot: ProductSnapshot = {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      thumbnail: product.thumbnail,
      image: product.image,
      price: product.price,
      currency: product.price.currency,
      unit: product.unit,
      variantSummary: product.variantSummary,
      capturedAt: new Date(),
    };

    const existingItem = cart.items.find((item) => item.productId === input.productId);
    if (existingItem) {
      const newQty = existingItem.quantity.add(Quantity.create(input.quantity));
      const subtotal: Money = {
        amount: Math.round(newQty.value * product.price.amount * 100) / 100,
        currency: product.price.currency,
      };
      cart = await this.repository.updateItem(cartId, existingItem.id, newQty.value, subtotal);
    } else {
      const qty = Quantity.create(input.quantity);
      const subtotal: Money = {
        amount: Math.round(qty.value * product.price.amount * 100) / 100,
        currency: product.price.currency,
      };
      const newItem: CartItem = {
        id: crypto.randomUUID(),
        productId: input.productId,
        snapshot,
        quantity: qty,
        subtotal,
        addedAt: new Date(),
      };
      cart = await this.repository.addItem(cartId, newItem);
    }

    cart = await this.recaculateTotals(cart);
    await this.eventBus.publish({
      type: CartEventType.ITEM_ADDED,
      cartId: cart.id,
      cart,
      metadata: { source: 'CartService' },
    });

    return cart;
  }

  async updateItemQuantity(cartId: string, itemId: string, quantity: number): Promise<Cart> {
    const cart = await this.getCart(cartId);

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundError('Cart item not found');

    const qty = Quantity.create(quantity);
    const product = await this.catalog.getProduct(item.productId);
    if (!product) throw new NotFoundError('Product not found');

    const subtotal: Money = {
      amount: Math.round(qty.value * product.price.amount * 100) / 100,
      currency: product.price.currency,
    };

    let updated = await this.repository.updateItem(cartId, itemId, qty.value, subtotal);
    updated = await this.recaculateTotals(updated);

    await this.eventBus.publish({
      type: CartEventType.QUANTITY_UPDATED,
      cartId: updated.id,
      cart: updated,
      metadata: { source: 'CartService' },
    });

    return updated;
  }

  async removeItem(cartId: string, itemId: string): Promise<Cart> {
    await this.getCart(cartId);
    let updated = await this.repository.removeItem(cartId, itemId);
    updated = await this.recaculateTotals(updated);

    await this.eventBus.publish({
      type: CartEventType.ITEM_REMOVED,
      cartId: updated.id,
      cart: updated,
      metadata: { source: 'CartService' },
    });

    return updated;
  }

  async clearCart(cartId: string): Promise<Cart> {
    await this.getCart(cartId);
    let updated = await this.repository.clearItems(cartId);
    updated = await this.recaculateTotals(updated);

    await this.eventBus.publish({
      type: CartEventType.CART_CLEARED,
      cartId: updated.id,
      cart: updated,
      metadata: { source: 'CartService' },
    });

    return updated;
  }

  async updateStatus(cartId: string, newStatus: CartStatus): Promise<Cart> {
    const cart = await this.getCart(cartId);
    CartStateMachine.transition(cart.status, newStatus);
    const updated = await this.repository.updateStatus(cartId, newStatus);

    if (newStatus === CartStatus.CHECKOUT_STARTED) {
      await this.eventBus.publish({
        type: CartEventType.CHECKOUT_STARTED,
        cartId: updated.id,
        cart: updated,
        metadata: { source: 'CartService' },
      });
    }

    return updated;
  }

  async prepareCheckout(cartId: string): Promise<CartCheckoutContext> {
    const cart = await this.getCart(cartId);

    const validation = await this.validator.validateCart(cart);
    if (!validation.valid) {
      throw validation;
    }

    CartStateMachine.transition(cart.status, CartStatus.VALIDATING);
    await this.repository.updateStatus(cartId, CartStatus.VALIDATING);

    const recalculated = await this.recaculateTotals(cart);
    // Revalidate prices after recalculation
    const revalidation = await this.validator.validateCart(recalculated);
    if (!revalidation.valid) {
      CartStateMachine.transition(CartStatus.VALIDATING, CartStatus.ACTIVE);
      await this.repository.updateStatus(cartId, CartStatus.ACTIVE);
      throw revalidation;
    }

    CartStateMachine.transition(CartStatus.VALIDATING, CartStatus.READY_FOR_CHECKOUT);
    const readyCart = await this.repository.updateStatus(cartId, CartStatus.READY_FOR_CHECKOUT);

    await this.eventBus.publish({
      type: CartEventType.CART_VALIDATED,
      cartId: readyCart.id,
      cart: readyCart,
      metadata: { source: 'CartService' },
    });

    return this.checkoutFactory.createCheckoutContext(readyCart);
  }

  async mergeCarts(userId: string, sessionId: string): Promise<Cart> {
    const merged = await this.merger.mergeGuestIntoUser(sessionId, userId);

    await this.eventBus.publish({
      type: CartEventType.CART_MERGED,
      cartId: merged.id,
      cart: merged,
      metadata: { source: 'CartService' },
    });

    return merged;
  }

  async deleteCart(cartId: string): Promise<void> {
    await this.repository.delete(cartId);
  }

  private async recaculateTotals(cart: Cart): Promise<Cart> {
    const totals = await this.pricing.calculateTotals(cart.items);

    await this.eventBus.publish({
      type: CartEventType.PRICE_RECALCULATED,
      cartId: cart.id,
      cart,
      metadata: { source: 'CartService' },
    });

    return this.repository.updateTotals(cart.id, totals);
  }
}
