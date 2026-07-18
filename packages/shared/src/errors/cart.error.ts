import { AppError } from './base.error.js';
import type { CartStatus } from '../types/cart.js';

export class IllegalCartStateTransitionError extends AppError {
  readonly code = 'ILLEGAL_CART_STATE_TRANSITION';
  readonly statusCode = 409;
  readonly severity = 'warning' as const;

  constructor(current: CartStatus, target: CartStatus) {
    super(`Cannot transition cart from ${current} to ${target}`);
  }
}
