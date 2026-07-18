import type { AuthEventType } from '@oceanfresh/shared';

export interface AuthEvent {
  type: AuthEventType;
  userId: string;
  data?: Record<string, unknown>;
  metadata?: {
    version?: number;
    timestamp?: Date;
    correlationId?: string;
    source?: string;
  };
}

export interface EventBus {
  publish(event: AuthEvent): Promise<void>;
  subscribe(eventType: AuthEventType, handler: (event: AuthEvent) => void): () => void;
  clear(): void;
}

export { AuthEventType } from '@oceanfresh/shared';
