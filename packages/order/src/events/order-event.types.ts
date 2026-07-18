import type { OrderEventType, Order } from '@oceanfresh/shared';

export interface OrderEvent {
  type: OrderEventType;
  orderId: string;
  order?: Order;
  metadata?: {
    version?: number;
    timestamp?: Date;
    correlationId?: string;
    source?: string;
  };
}

export interface EventBus {
  publish(event: OrderEvent): Promise<void>;
  subscribe(eventType: OrderEventType, handler: (event: OrderEvent) => void): () => void;
  clear(): void;
}

export { OrderEventType } from '@oceanfresh/shared';
