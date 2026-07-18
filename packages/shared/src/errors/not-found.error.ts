import { AppError } from './base.error.js';

export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;
  readonly severity = 'warning' as const;
}
