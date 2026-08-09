export class InvalidCredentialsError extends Error {
  public readonly code: string = 'INVALID_CREDENTIALS';

  constructor(message = 'Invalid email or password') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}
