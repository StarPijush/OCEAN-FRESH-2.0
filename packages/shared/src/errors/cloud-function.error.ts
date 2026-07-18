import { AppError } from './base.error.js';

export class CloudFunctionError extends AppError {
  readonly code = 'CLOUD_FUNCTION_ERROR';
  readonly statusCode = 500;
  readonly severity = 'error' as const;

  constructor(message: string, public readonly functionName: string, context?: Record<string, unknown>) {
    super(message, context);
  }
}
