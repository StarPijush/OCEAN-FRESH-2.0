import { AppError } from './base.error.js';

export class ConcurrencyError extends AppError {
  readonly code = 'CONCURRENCY_ERROR';
  readonly statusCode = 409;
  readonly severity = 'warning' as const;
}
