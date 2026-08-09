import type { AuthEventType, EventBus as GenericEventBus } from '@oceanfresh/shared';

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

export type EventBus = GenericEventBus<AuthEvent, AuthEventType>;

export { AuthEventType } from '@oceanfresh/shared';
