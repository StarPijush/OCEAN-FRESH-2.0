import { OrderStatus, IllegalOrderStateTransitionError } from '@oceanfresh/shared';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.DRAFT]: [OrderStatus.VALIDATING],
  [OrderStatus.VALIDATING]: [OrderStatus.DRAFT, OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED],
  [OrderStatus.PENDING_PAYMENT]: [OrderStatus.PAYMENT_FAILED, OrderStatus.PAID],
  [OrderStatus.PAYMENT_FAILED]: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [OrderStatus.CONFIRMED, OrderStatus.REFUND_REQUESTED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.PACKED, OrderStatus.CANCELLED],
  [OrderStatus.PACKED]: [OrderStatus.SHIPPED],
  [OrderStatus.SHIPPED]: [OrderStatus.OUT_FOR_DELIVERY],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [OrderStatus.REFUND_REQUESTED],
  [OrderStatus.CANCELLED]: [OrderStatus.REFUND_REQUESTED],
  [OrderStatus.REFUND_REQUESTED]: [OrderStatus.REFUNDED],
  [OrderStatus.REFUNDED]: [],
  [OrderStatus.ARCHIVED]: [],
};

export class OrderStateMachine {
  static canTransition(from: OrderStatus, to: OrderStatus): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }

  static transition(from: OrderStatus, to: OrderStatus): void {
    if (!this.canTransition(from, to)) {
      throw new IllegalOrderStateTransitionError(from, to);
    }
  }

  static isTerminal(status: OrderStatus): boolean {
    return [OrderStatus.REFUNDED, OrderStatus.ARCHIVED].includes(status);
  }

  static isActive(status: OrderStatus): boolean {
    return !this.isTerminal(status);
  }

  static isPaid(status: OrderStatus): boolean {
    return [
      OrderStatus.PAID,
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
      OrderStatus.PACKED,
      OrderStatus.SHIPPED,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.DELIVERED,
    ].includes(status);
  }

  static isCancellable(status: OrderStatus): boolean {
    return [
      OrderStatus.VALIDATING,
      OrderStatus.PENDING_PAYMENT,
      OrderStatus.PAYMENT_FAILED,
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
    ].includes(status);
  }

  static isRefundable(status: OrderStatus): boolean {
    return [
      OrderStatus.PAID,
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED,
    ].includes(status);
  }

  static getValidTransitions(from: OrderStatus): OrderStatus[] {
    return [...(VALID_TRANSITIONS[from] ?? [])];
  }
}
