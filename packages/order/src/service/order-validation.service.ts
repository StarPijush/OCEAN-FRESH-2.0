import type { CartCheckoutContext } from '@oceanfresh/cart';
import type { IProductCatalog } from '@oceanfresh/product';
import {
  type CreateOrderFromCheckoutInput,
  type Order,
  type OrderStatus,
  OrderValidationException,
  type OrderValidationResult,
} from '@oceanfresh/shared';

import { OrderStateMachine } from './order-state-machine.js';

export class OrderValidationService {
  constructor(private readonly catalog: IProductCatalog) {}

  async validateCheckoutContext(context: CartCheckoutContext): Promise<OrderValidationResult> {
    const errors: OrderValidationResult['errors'] = [];

    if (!context.items || context.items.length === 0) {
      errors.push({ code: 'EMPTY_ORDER', message: 'Order must contain at least one item' });
      return { valid: false, errors };
    }

    const productIds = context.items.map((item) => item.productId);
    const productMap = await this.catalog.getProducts(productIds);

    for (const item of context.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        errors.push({
          code: 'PRODUCT_NOT_FOUND',
          message: `Product ${item.productId} not found`,
          field: `items.${item.productId}`,
        });
        continue;
      }

      if (!product.isAvailable) {
        errors.push({
          code: 'PRODUCT_UNAVAILABLE',
          message: `Product "${product.name}" is not available`,
          field: `items.${item.productId}`,
        });
        continue;
      }

      if (product.stock < item.quantity) {
        errors.push({
          code: 'INSUFFICIENT_STOCK',
          message: `Insufficient stock for "${product.name}": ${product.stock} available, ${item.quantity} requested`,
          field: `items.${item.productId}`,
        });
        continue;
      }

      if (item.unitPrice.amount !== product.price.amount) {
        errors.push({
          code: 'PRICE_MISMATCH',
          message: `Price mismatch for "${product.name}": cart has ${item.unitPrice.amount}, actual is ${product.price.amount}`,
          field: `items.${item.productId}.price`,
        });
      }
    }

    return { valid: errors.length === 0, errors };
  }

  validateCreateOrderInput(input: CreateOrderFromCheckoutInput): OrderValidationResult {
    const errors: OrderValidationResult['errors'] = [];

    if (!input.idempotencyKey) {
      errors.push({ code: 'MISSING_IDEMPOTENCY_KEY', message: 'Idempotency key is required' });
    }

    if (!input.customer.name) {
      errors.push({
        code: 'MISSING_CUSTOMER_NAME',
        message: 'Customer name is required',
        field: 'customer.name',
      });
    }

    if (!input.customer.phone || !/^[0-9]{10}$/.test(input.customer.phone)) {
      errors.push({
        code: 'INVALID_PHONE',
        message: 'Valid 10-digit phone is required',
        field: 'customer.phone',
      });
    }

    if (!input.customer.pincode || !/^[0-9]{6}$/.test(input.customer.pincode)) {
      errors.push({
        code: 'INVALID_PINCODE',
        message: 'Valid 6-digit pincode is required',
        field: 'customer.pincode',
      });
    }

    if (!input.shipping.method) {
      errors.push({
        code: 'MISSING_SHIPPING_METHOD',
        message: 'Shipping method is required',
        field: 'shipping.method',
      });
    }

    return { valid: errors.length === 0, errors };
  }

  validateStatusTransition(order: Order, newStatus: OrderStatus): void {
    OrderStateMachine.transition(order.status, newStatus);
  }

  validateCancellation(order: Order): void {
    if (!OrderStateMachine.isCancellable(order.status)) {
      throw new OrderValidationException(
        `Order in status ${order.status} cannot be cancelled. Only pre-paid and non-delivered orders can be cancelled.`,
      );
    }
  }

  validateRefundRequest(order: Order): void {
    if (!OrderStateMachine.isRefundable(order.status)) {
      throw new OrderValidationException(
        `Order in status ${order.status} cannot request a refund. Only paid or delivered orders can be refunded.`,
      );
    }
  }
}
