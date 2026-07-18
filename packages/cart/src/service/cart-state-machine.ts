import { CartStatus, IllegalCartStateTransitionError } from '@oceanfresh/shared';

const VALID_TRANSITIONS: Record<CartStatus, CartStatus[]> = {
  [CartStatus.ACTIVE]: [CartStatus.VALIDATING, CartStatus.EXPIRED, CartStatus.ABANDONED],
  [CartStatus.VALIDATING]: [CartStatus.ACTIVE, CartStatus.READY_FOR_CHECKOUT, CartStatus.ARCHIVED],
  [CartStatus.READY_FOR_CHECKOUT]: [CartStatus.CHECKOUT_STARTED, CartStatus.ACTIVE, CartStatus.ARCHIVED],
  [CartStatus.CHECKOUT_STARTED]: [CartStatus.CHECKED_OUT, CartStatus.ACTIVE, CartStatus.ARCHIVED],
  [CartStatus.CHECKED_OUT]: [],
  [CartStatus.ARCHIVED]: [CartStatus.ACTIVE],
  [CartStatus.EXPIRED]: [CartStatus.ACTIVE],
  [CartStatus.ABANDONED]: [CartStatus.ACTIVE],
};

export class CartStateMachine {
  static canTransition(from: CartStatus, to: CartStatus): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }

  static transition(from: CartStatus, to: CartStatus): void {
    if (!this.canTransition(from, to)) {
      throw new IllegalCartStateTransitionError(from, to);
    }
  }

  static isTerminal(status: CartStatus): boolean {
    return [CartStatus.CHECKED_OUT, CartStatus.ARCHIVED, CartStatus.EXPIRED].includes(status);
  }

  static isActive(status: CartStatus): boolean {
    return [CartStatus.ACTIVE, CartStatus.VALIDATING, CartStatus.READY_FOR_CHECKOUT, CartStatus.CHECKOUT_STARTED].includes(status);
  }

  static getValidTransitions(from: CartStatus): CartStatus[] {
    return [...(VALID_TRANSITIONS[from] ?? [])];
  }
}
