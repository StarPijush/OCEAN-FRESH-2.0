import { LogLevel, type Logger, type LogEntry, type LogMetadata, type ErrorInfo } from '../interface.js';

declare const gtag: ((cmd: string, ...args: unknown[]) => void) | undefined;
declare const Sentry:
  | {
      captureException: (err: unknown, opts?: { level?: string; extra?: Record<string, unknown> }) => void;
    }
  | undefined;

export class ProductionLogger implements Logger {
  private readonly module: string;

  constructor(module = 'app') {
    this.module = module;
  }

  child(module: string): Logger {
    return new ProductionLogger(`${this.module}:${module}`);
  }

  private createEntry(level: LogLevel, message: string, error?: unknown, meta?: LogMetadata): LogEntry {
    const errInfo: ErrorInfo | null = error
      ? {
          name: (error as Error).name,
          message: (error as Error).message,
          code: (error as { code?: string })?.code,
        }
      : null;

    return {
      level,
      message,
      timestamp: Date.now(),
      correlationId: (meta?.correlationId as string | undefined) ?? crypto.randomUUID(),
      module: this.module,
      error: errInfo,
      metadata: meta,
    };
  }

  debug(_message: string, _meta?: LogMetadata): void {
  }

  info(message: string, meta?: LogMetadata): void {
    const entry = this.createEntry(LogLevel.INFO, message, undefined, meta);
    if (typeof gtag !== 'undefined') {
      gtag('event', 'log_info', { ...entry });
    }
  }

  warn(message: string, meta?: LogMetadata): void {
    const entry = this.createEntry(LogLevel.WARN, message, undefined, meta);
    if (typeof gtag !== 'undefined') {
      gtag('event', 'log_warn', { ...entry });
    }
  }

  error(message: string, error?: unknown, meta?: LogMetadata): void {
    const entry = this.createEntry(LogLevel.ERROR, message, error, meta);
    if (typeof Sentry !== 'undefined') {
      Sentry.captureException(error ?? new Error(message), {
        extra: { ...meta, correlationId: entry.correlationId },
      });
    }
  }

  critical(message: string, error?: unknown, meta?: LogMetadata): void {
    const entry = this.createEntry(LogLevel.CRITICAL, message, error, meta);
    if (typeof Sentry !== 'undefined') {
      Sentry.captureException(error ?? new Error(message), {
        level: 'fatal',
        extra: { ...meta, correlationId: entry.correlationId },
      });
    }
  }
}
