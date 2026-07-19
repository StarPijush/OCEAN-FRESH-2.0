import type { Category, CategoryEventType } from '@oceanfresh/shared';

export interface CategoryEvent {
  type: CategoryEventType;
  categoryId: string;
  data?: Partial<Category>;
  metadata?: {
    version?: number;
    timestamp?: Date;
    correlationId?: string;
    source?: string;
  };
}

export interface EventBus {
  publish(event: CategoryEvent): Promise<void>;
  subscribe(eventType: CategoryEventType, handler: (event: CategoryEvent) => void): () => void;
  clear(): void;
}

export { CategoryEventType } from '@oceanfresh/shared';
