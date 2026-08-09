import { AppError, type ErrorSeverity } from './base.error.js';

export class AuthError extends AppError {
  readonly code: string = 'AUTH_ERROR';
  readonly statusCode: number = 401;
  readonly severity: ErrorSeverity = 'warning';
}

export class AuthorizationError extends AppError {
  readonly code: string = 'FORBIDDEN';
  readonly statusCode = 403;
  readonly severity = 'error' as const;
}

export class SessionExpiredError extends AuthError {
  readonly code: string = 'SESSION_EXPIRED';
}

export class InvalidCredentialsError extends AuthError {
  readonly code = 'INVALID_CREDENTIALS' as const;
}

export class AccountLockedError extends AuthError {
  readonly code = 'ACCOUNT_LOCKED' as const;
  readonly statusCode = 423;
}

export class AccountDisabledError extends AuthError {
  readonly code = 'ACCOUNT_DISABLED' as const;
  readonly statusCode = 403;
}

export class EmailNotVerifiedError extends AuthError {
  readonly code = 'EMAIL_NOT_VERIFIED' as const;
  readonly statusCode = 403;
}

export class MfaRequiredError extends AuthError {
  readonly code = 'MFA_REQUIRED' as const;
  readonly statusCode = 401;

  constructor(
    public readonly mfaFactors: string[],
    context?: Record<string, unknown>,
  ) {
    super('Multi-factor authentication required', context);
  }
}

export class MfaFailedError extends AuthError {
  readonly code = 'MFA_FAILED' as const;
}

export class ReauthenticationRequiredError extends AuthError {
  readonly code = 'REAUTHENTICATION_REQUIRED' as const;
  readonly statusCode = 401;
}

export class TokenExpiredError extends AuthError {
  readonly code = 'TOKEN_EXPIRED' as const;
}

export class TokenRevokedError extends AuthError {
  readonly code = 'TOKEN_REVOKED' as const;
  readonly statusCode = 401;
}

export class TooManyAttemptsError extends AuthError {
  readonly code = 'TOO_MANY_ATTEMPTS' as const;
  readonly statusCode = 429;

  constructor(
    public readonly retryAfterSeconds: number,
    context?: Record<string, unknown>,
  ) {
    super(`Too many attempts. Try again after ${retryAfterSeconds} seconds.`, context);
  }
}

export class IllegalStateTransitionError extends AuthError {
  readonly code = 'ILLEGAL_STATE_TRANSITION' as const;
  readonly statusCode = 500;

  constructor(from: string, to: string, context?: Record<string, unknown>) {
    super(`Cannot transition from ${from} to ${to}`, context);
  }
}

export class ProviderNotSupportedError extends AuthError {
  readonly code = 'PROVIDER_NOT_SUPPORTED' as const;
  readonly statusCode = 400;

  constructor(provider: string, context?: Record<string, unknown>) {
    super(`Authentication provider "${provider}" is not supported`, context);
  }
}

export class EmailAlreadyExistsError extends AuthError {
  readonly code = 'EMAIL_ALREADY_EXISTS' as const;
  readonly statusCode = 409;
}
