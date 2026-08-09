export class SessionExpiredError extends Error {
  public readonly code: string = 'SESSION_EXPIRED';

  constructor(message = 'Session has expired') {
    super(message);
    this.name = 'SessionExpiredError';
  }
}
