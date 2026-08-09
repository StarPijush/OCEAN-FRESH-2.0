export class MfaCodeExpiredError extends Error {
  public readonly code: string = 'MFA_CODE_EXPIRED';

  constructor(message = 'MFA code has expired') {
    super(message);
    this.name = 'MfaCodeExpiredError';
  }
}
