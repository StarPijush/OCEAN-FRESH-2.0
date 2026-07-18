export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4,
}

export interface ErrorInfo {
  name: string;
  message: string;
  stack?: string;
  code?: string;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  correlationId?: string;
  module?: string;
  action?: string;
  duration?: number;
  error: ErrorInfo | null;
  metadata?: LogMetadata;
}

export interface Logger {
  debug(message: string, meta?: LogMetadata): void;
  info(message: string, meta?: LogMetadata): void;
  warn(message: string, meta?: LogMetadata): void;
  error(message: string, error?: unknown, meta?: LogMetadata): void;
  critical(message: string, error?: unknown, meta?: LogMetadata): void;
  child(module: string): Logger;
}

export type LogMetadata = Record<string, unknown>;

export interface AuditAction {
  type: string;
  resource: string;
  resourceId: string;
  userId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditEntry {
  action: string;
  resource: string;
  resourceId: string;
  performedBy: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: TimestampValue;
}

export interface TimestampValue {
  seconds: number;
  nanoseconds: number;
}
