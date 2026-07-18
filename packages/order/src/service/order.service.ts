import {
  createLogger,
  OrderStatus,
  OrderSource,
  OrderEventType,
  DuplicateIdempotencyKeyError,
  OrderNotFoundError,
  type Order,
  type OrderItem,
  type OrderTotals,
  type PaymentSummary,
  type CreateOrderFromCheckoutInput,
} from '@oceanfresh/shared';
import type { CartCheckoutContext } from '@oceanfresh/cart';
import type { IOrderRepository } from '../repository/index.js';
import type { EventBus } from '../events/index.js';
import { OrderStateMachine } from './order-state-machine.js';
import { OrderNumberGenerator } from './order-number-generator.js';
import { OrderValidationService } from './order-validation.service.js';
import { OrderSnapshotService } from './order-snapshot.service.js';
import { OrderPricingService } from './order-pricing.service.js';
import { OrderCancellationService } from './order-cancellation.service.js';
import { OrderHistoryService } from './order-history.service.js';

const logger = createLogger('order:service');

export class OrderService {
  constructor(
    private readonly repository: IOrderRepository,
    private readonly validator: OrderValidationService,
    private readonly snapshotService: OrderSnapshotService,
    private readonly numberGen: OrderNumberGenerator,
    private readonly pricing: OrderPricingService,
    private readonly cancellation: OrderCancellationService,
    private readonly history: OrderHistoryService,
    private readonly eventBus: EventBus,
  ) {}

  async createFromCheckout(
    context: CartCheckoutContext,
    input: CreateOrderFromCheckoutInput,
  ): Promise<Order> {
    logger.info('Creating order from checkout', { cartId: context.cartId, idempotencyKey: input.idempotencyKey });

    // 1. Idempotency check
    const existing = await this.repository.findByIdempotencyKey(input.idempotencyKey);
    if (existing) {
      logger.info('Returning existing order for idempotency key', { idempotencyKey: input.idempotencyKey, orderId: existing.id });
      return existing;
    }

    // 2. Validate checkout context (product availability, stock, prices)
    const validationResult = await this.validator.validateCheckoutContext(context);
    if (!validationResult.valid) {
      throw validationResult;
    }

    // 3. Validate creation input (customer, shipping, billing)
    const inputValidation = this.validator.validateCreateOrderInput(input);
    if (!inputValidation.valid) {
      throw inputValidation;
    }

    // 4. Generate order number
    const orderNumber = await this.numberGen.generateNumber();

    // 5. Create immutable snapshots
    const productSnapshots = this.snapshotService.createProductSnapshot(context);
    const customerSnapshot = this.snapshotService.createCustomerSnapshot(input.customer);
    const shippingSnapshot = this.snapshotService.createShippingSnapshot(input.shipping);
    const billingSnapshot = this.snapshotService.createBillingSnapshot(input.billing);

    // 6. Calculate server-side totals
    const totals: OrderTotals = await this.pricing.calculateTotals(context);

    // 7. Build order items from snapshots
    const items: OrderItem[] = context.items.map((ci, index) => ({
      id: crypto.randomUUID(),
      productId: ci.productId,
      snapshot: productSnapshots[index]!,
      quantity: ci.quantity,
      unitPrice: ci.unitPrice,
      subtotal: ci.subtotal,
    }));

    // 8. Build order
    const now = new Date();
    const order: Order = {
      id: '',
      orderNumber,
      idempotencyKey: input.idempotencyKey,
      source: OrderSource.CHECKOUT,
      status: OrderStatus.DRAFT,
      items,
      totals,
      customerSnapshot,
      shippingSnapshot,
      billingSnapshot,
      payment: {
        method: null,
        transactionId: null,
        paidAmount: null,
        paidAt: null,
        gatewayResponse: null,
      } as PaymentSummary,
      timeline: [],
      notes: input.notes ?? '',
      cartId: context.cartId,
      userId: input.userId,
      createdAt: now,
      updatedAt: now,
    };

    // 9. Persist
    const created = await this.repository.create(order);

    // 10. Transition to VALIDATING
    OrderStateMachine.transition(OrderStatus.DRAFT, OrderStatus.VALIDATING);
    const validated = await this.repository.updateStatus(created.id, OrderStatus.VALIDATING, 'system', 'Order created and validated');

    // 11. Publish event
    await this.eventBus.publish({
      type: OrderEventType.CREATED,
      orderId: validated.id,
      order: validated,
      metadata: { source: 'OrderService', timestamp: now },
    });

    return validated;
  }

  async getOrder(orderId: string): Promise<Order> {
    const order = await this.repository.findById(orderId);
    if (!order) throw new OrderNotFoundError(orderId);
    return order;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order> {
    const order = await this.repository.findByOrderNumber(orderNumber);
    if (!order) throw new Error(`Order not found: ${orderNumber}`);
    return order;
  }

  async updateStatus(orderId: string, newStatus: OrderStatus, changedBy: string, note?: string): Promise<Order> {
    const order = await this.getOrder(orderId);

    // Validate via state machine
    OrderStateMachine.transition(order.status, newStatus);

    // Update status in repository (also appends timeline)
    const updated = await this.repository.updateStatus(orderId, newStatus, changedBy, note);

    // Determine event type
    let eventType = OrderEventType.CONFIRMED;
    if (newStatus === OrderStatus.PACKED) eventType = OrderEventType.PACKED;
    if (newStatus === OrderStatus.SHIPPED) eventType = OrderEventType.SHIPPED;
    if (newStatus === OrderStatus.DELIVERED) eventType = OrderEventType.DELIVERED;
    if (newStatus === OrderStatus.CANCELLED) eventType = OrderEventType.CANCELLED;
    if (newStatus === OrderStatus.PAYMENT_FAILED) eventType = OrderEventType.PAYMENT_FAILED;

    await this.eventBus.publish({
      type: eventType,
      orderId: updated.id,
      order: updated,
      metadata: { source: 'OrderService' },
    });

    return updated;
  }

  async cancelOrder(orderId: string, reason: string, changedBy: string): Promise<Order> {
    const order = await this.getOrder(orderId);
    return this.cancellation.cancel(order, reason, changedBy);
  }

  async requestRefund(orderId: string, reason: string): Promise<Order> {
    const order = await this.getOrder(orderId);
    return this.cancellation.requestRefund(order, reason);
  }

  async completeRefund(orderId: string, changedBy: string): Promise<Order> {
    return this.cancellation.completeRefund(orderId, changedBy);
  }

  async updatePayment(orderId: string, payment: PaymentSummary): Promise<Order> {
    const order = await this.getOrder(orderId);
    const updated = await this.repository.updatePayment(orderId, payment);

    await this.eventBus.publish({
      type: OrderEventType.PAYMENT_SUCCEEDED,
      orderId,
      order: updated,
      metadata: { source: 'OrderService' },
    });

    return updated;
  }

  async archiveOrder(orderId: string): Promise<Order> {
    const order = await this.getOrder(orderId);
    OrderStateMachine.transition(order.status, OrderStatus.ARCHIVED);
    const updated = await this.repository.archive(orderId);
    return updated;
  }
}
