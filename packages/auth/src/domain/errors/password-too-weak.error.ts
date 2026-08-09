export class PasswordTooWeakError extends Error {
  public readonly code: string = 'PASSWORD_TOO_WEAK';

  constructor(
    public readonly reasons: string[],
    message?: string,
  ) {
    super(message ?? `Password is too weak: ${reasons.join(', ')}`);
    this.name = 'PasswordTooWeakError';
  }
}
