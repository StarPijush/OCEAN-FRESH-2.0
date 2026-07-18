import type { Order, Money } from '@oceanfresh/shared';

export interface IPaymentGateway {
  createPayment(order: Order): Promise<{
    transactionId: string;
    redirectUrl: string | null;
  }>;

  verifyPayment(transactionId: string): Promise<{
    success: boolean;
    gatewayResponse: Record<string, unknown>;
  }>;

  refund(transactionId: string, amount: Money): Promise<{
    success: boolean;
    refundId: string;
  }>;
}
