import {
  createLogger,
  type Order,
  OrderEventType,
  OrderStatus,
  OrderValidationException,
} from '@oceanfresh/shared';

import type { EventBus } from '../events/index.js';
import type { IOrderRepository } from '../repository/index.js';
import type { OrderHistoryService } from './order-history.service.js';
import { OrderStateMachine } from './order-state-machine.js';
import type { IPaymentGateway } from './payment-gateway.interface.js';

const logger = createLogger('order:cancellation');

export class OrderCancellationService {
  constructor(
    private readonly repository: IOrderRepository,
    private readonly eventBus: EventBus,
    private readonly history: OrderHistoryService,
    private readonly paymentGateway?: IPaymentGateway,
  ) {}

  async cancel(order: Order, reason: string, changedBy: string): Promise<Order> {
    logger.info('Cancelling order', { orderId: order.id, reason, changedBy });

    if (!OrderStateMachine.isCancellable(order.status)) {
      throw new OrderValidationException(
        `Order in status ${order.status} cannot be cancelled. Only pre-paid and non-delivered orders can be cancelled.`,
      );
    }

    OrderStateMachine.transition(order.status, OrderStatus.CANCELLED);
    const updated = await this.repository.updateStatus(
      order.id,
      OrderStatus.CANCELLED,
      changedBy,
      reason,
    );

    await this.eventBus.publish({
      type: OrderEventType.CANCELLED,
      orderId: order.id,
      order: updated,
      metadata: { source: 'OrderCancellationService' },
    });

    return updated;
  }

  async requestRefund(order: Order, reason: string): Promise<Order> {
    logger.info('Requesting refund', { orderId: order.id, reason });

    if (!OrderStateMachine.isRefundable(order.status)) {
      throw new OrderValidationException(
        `Order in status ${order.status} cannot request a refund. Only paid, delivered, or cancelled orders can request refunds.`,
      );
    }

    OrderStateMachine.transition(order.status, OrderStatus.REFUND_REQUESTED);
    const updated = await this.repository.updateStatus(
      order.id,
      OrderStatus.REFUND_REQUESTED,
      'system',
      reason,
    );

    if (this.paymentGateway && order.payment.transactionId) {
      try {
        await this.paymentGateway.refund(order.payment.transactionId, order.totals.grandTotal);
      } catch (err) {
        logger.error('Refund initiation failed', { orderId: order.id, error: err });
      }
    }

    await this.eventBus.publish({
      type: OrderEventType.REFUND_REQUESTED,
      orderId: order.id,
      order: updated,
      metadata: { source: 'OrderCancellationService' },
    });

    return updated;
  }

  async completeRefund(orderId: string, changedBy: string): Promise<Order> {
    const order = await this.repository.findById(orderId);
    if (!order) throw new Error('Order not found');

    OrderStateMachine.transition(order.status, OrderStatus.REFUNDED);
    const updated = await this.repository.updateStatus(
      orderId,
      OrderStatus.REFUNDED,
      changedBy,
      'Refund completed',
    );

    await this.eventBus.publish({
      type: OrderEventType.REFUND_COMPLETED,
      orderId,
      order: updated,
      metadata: { source: 'OrderCancellationService' },
    });

    return updated;
  }
}
