export class AccountLockedError extends Error {
  public readonly code: string = 'ACCOUNT_LOCKED';

  constructor(
    public readonly lockedUntil: Date,
    message?: string,
  ) {
    super(message ?? `Account locked until ${lockedUntil.toISOString()}`);
    this.name = 'AccountLockedError';
  }
}
