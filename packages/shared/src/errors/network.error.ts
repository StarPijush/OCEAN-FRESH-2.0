import { AppError } from './base.error.js';

export class NetworkError extends AppError {
  readonly code = 'NETWORK_ERROR';
  readonly statusCode = 0;
  readonly severity = 'error' as const;
}
