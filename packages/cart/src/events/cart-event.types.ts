import type { CartEventType, Cart, CartItem } from '@oceanfresh/shared';

export interface CartEvent {
  type: CartEventType;
  cartId: string;
  cart?: Cart;
  item?: CartItem;
  metadata?: {
    version?: number;
    timestamp?: Date;
    correlationId?: string;
    source?: string;
  };
}

export interface EventBus {
  publish(event: CartEvent): Promise<void>;
  subscribe(eventType: CartEventType, handler: (event: CartEvent) => void): () => void;
  clear(): void;
}

export { CartEventType } from '@oceanfresh/shared';
