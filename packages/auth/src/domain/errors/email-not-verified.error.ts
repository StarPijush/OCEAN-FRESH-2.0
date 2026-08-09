export class EmailNotVerifiedError extends Error {
  public readonly code: string = 'EMAIL_NOT_VERIFIED';

  constructor(message = 'Email is not verified') {
    super(message);
    this.name = 'EmailNotVerifiedError';
  }
}
