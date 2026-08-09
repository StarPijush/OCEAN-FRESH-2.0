import { ValueObject } from '@oceanfresh/shared/domain';

export class LoginAttempt extends ValueObject {
  private constructor(
    private readonly _timestamp: Date,
    private readonly _success: boolean,
    private readonly _ipAddress: string,
  ) {
    super();
    if (!_ipAddress) throw new Error('IP address is required');
  }

  static create(timestamp: Date, success: boolean, ipAddress: string): LoginAttempt {
    return new LoginAttempt(timestamp, success, ipAddress);
  }

  get timestamp(): Date {
    return this._timestamp;
  }

  get success(): boolean {
    return this._success;
  }

  get ipAddress(): string {
    return this._ipAddress;
  }

  protected getEqualityComponents(): unknown[] {
    return [this._timestamp.getTime(), this._success, this._ipAddress];
  }
}
