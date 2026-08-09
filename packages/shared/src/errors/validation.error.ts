import { AppError } from './base.error.js';

export interface ValidationField {
  field: string;
  message: string;
  code: string;
}

export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR' as const;
  readonly statusCode = 400;
  readonly severity = 'warning' as const;

  constructor(
    message: string,
    public readonly fields?: ValidationField[],
    context?: Record<string, unknown>,
  ) {
    super(message, context);
  }
}
