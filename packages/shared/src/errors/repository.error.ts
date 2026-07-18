import { AppError } from './base.error.js';

export class RepositoryError extends AppError {
  readonly code = 'DATABASE_ERROR';
  readonly statusCode = 500;
  readonly severity = 'critical' as const;

  constructor(message: string, public readonly operation: string, public readonly collection: string, context?: Record<string, unknown>) {
    super(message, context);
  }
}
