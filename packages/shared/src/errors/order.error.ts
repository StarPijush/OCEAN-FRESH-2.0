import { AppError } from './base.error.js';
import type { OrderStatus } from '../types/order.js';

export class IllegalOrderStateTransitionError extends AppError {
  readonly code = 'ILLEGAL_ORDER_STATE_TRANSITION';
  readonly statusCode = 409;
  readonly severity = 'warning' as const;

  constructor(current: OrderStatus, target: OrderStatus) {
    super(`Cannot transition order from ${current} to ${target}`);
  }
}

export class DuplicateIdempotencyKeyError extends AppError {
  readonly code = 'DUPLICATE_IDEMPOTENCY_KEY';
  readonly statusCode = 409;
  readonly severity = 'warning' as const;

  constructor(key: string) {
    super(`Order with idempotency key "${key}" already exists`);
  }
}

export class OrderValidationException extends AppError {
  readonly code = 'ORDER_VALIDATION_ERROR';
  readonly statusCode = 400;
  readonly severity = 'error' as const;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
  }
}

export class OrderNotFoundError extends AppError {
  readonly code = 'ORDER_NOT_FOUND';
  readonly statusCode = 404;
  readonly severity = 'error' as const;

  constructor(orderId: string) {
    super(`Order not found: ${orderId}`);
  }
}
