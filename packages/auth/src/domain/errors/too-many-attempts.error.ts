export class TooManyAttemptsError extends Error {
  public readonly code: string = 'TOO_MANY_ATTEMPTS';

  constructor(message = 'Too many attempts. Please try again later') {
    super(message);
    this.name = 'TooManyAttemptsError';
  }
}
