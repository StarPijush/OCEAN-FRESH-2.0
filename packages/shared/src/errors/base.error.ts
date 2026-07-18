export type ErrorSeverity = 'critical' | 'error' | 'warning' | 'info';

export type ErrorPayload = {
  code: string;
  message: string;
  correlationId: string;
  severity: ErrorSeverity;
};

export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  abstract readonly severity: ErrorSeverity;

  public readonly timestamp: number;
  public readonly correlationId: string;
  public readonly context: Record<string, unknown>;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = Date.now();
    this.correlationId = crypto.randomUUID();
    this.context = context ?? {};
  }

  toJSON(): ErrorPayload {
    return {
      code: this.code,
      message: this.message,
      correlationId: this.correlationId,
      severity: this.severity,
    };
  }
}
