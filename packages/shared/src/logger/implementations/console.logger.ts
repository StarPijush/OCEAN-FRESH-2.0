import type { Logger, LogMetadata } from '../interface.js';

export class ConsoleLogger implements Logger {
  private readonly module: string;

  constructor(module = 'app') {
    this.module = module;
  }

  child(module: string): Logger {
    return new ConsoleLogger(`${this.module}:${module}`);
  }

  debug(message: string, meta?: LogMetadata): void {
    // eslint-disable-next-line no-console
    console.debug(`[${this.module}]`, message, meta ?? '');
  }

  info(message: string, meta?: LogMetadata): void {
    // eslint-disable-next-line no-console
    console.info(`[${this.module}]`, message, meta ?? '');
  }

  warn(message: string, meta?: LogMetadata): void {
    console.warn(`[${this.module}]`, message, meta ?? '');
  }

  error(message: string, error?: unknown, meta?: LogMetadata): void {
    console.error(`[${this.module}]`, message, error, meta ?? '');
  }

  critical(message: string, error?: unknown, meta?: LogMetadata): void {
    console.error(`[CRITICAL][${this.module}]`, message, error, meta ?? '');
  }
}
