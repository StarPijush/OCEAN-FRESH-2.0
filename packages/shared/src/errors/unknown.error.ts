import { AppError } from './base.error.js';

export class UnknownError extends AppError {
  readonly code = 'UNKNOWN_ERROR';
  readonly statusCode = 500;
  readonly severity = 'error' as const;
}
