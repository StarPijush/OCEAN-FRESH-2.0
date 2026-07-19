import type { Product, ProductEventType } from '@oceanfresh/shared';

export interface ProductEvent {
  type: ProductEventType;
  productId: string;
  data?: Partial<Product>;
  metadata?: {
    version?: number;
    timestamp?: Date;
    correlationId?: string;
    source?: string;
  };
}

export interface EventBus {
  publish(event: ProductEvent): Promise<void>;
  subscribe(eventType: ProductEventType, handler: (event: ProductEvent) => void): () => void;
  clear(): void;
}

export { ProductEventType } from '@oceanfresh/shared';
