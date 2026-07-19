import { IllegalOrderStateTransitionError, OrderStatus } from '@oceanfresh/shared';

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

export const OrderStateMachine = {
  canTransition(from: OrderStatus, to: OrderStatus): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
  },

  transition(from: OrderStatus, to: OrderStatus): void {
    if (!OrderStateMachine.canTransition(from, to)) {
      throw new IllegalOrderStateTransitionError(from, to);
    }
  },

  isTerminal(status: OrderStatus): boolean {
    return [OrderStatus.REFUNDED, OrderStatus.ARCHIVED].includes(status);
  },

  isActive(status: OrderStatus): boolean {
    return !OrderStateMachine.isTerminal(status);
  },

  isPaid(status: OrderStatus): boolean {
    return [
      OrderStatus.PAID,
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
      OrderStatus.PACKED,
      OrderStatus.SHIPPED,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.DELIVERED,
    ].includes(status);
  },

  isCancellable(status: OrderStatus): boolean {
    return [
      OrderStatus.VALIDATING,
      OrderStatus.PENDING_PAYMENT,
      OrderStatus.PAYMENT_FAILED,
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
    ].includes(status);
  },

  isRefundable(status: OrderStatus): boolean {
    return [OrderStatus.PAID, OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(status);
  },

  getValidTransitions(from: OrderStatus): OrderStatus[] {
    return [...(VALID_TRANSITIONS[from] ?? [])];
  },
};
