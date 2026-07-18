import { AppError } from './base.error.js';

export class RateLimitError extends AppError {
  readonly code = 'RATE_LIMITED';
  readonly statusCode = 429;
  readonly severity = 'warning' as const;

  constructor(public readonly retryAfterSeconds: number, context?: Record<string, unknown>) {
    super(`Too many requests. Please try again after ${retryAfterSeconds} seconds.`, context);
  }
}
