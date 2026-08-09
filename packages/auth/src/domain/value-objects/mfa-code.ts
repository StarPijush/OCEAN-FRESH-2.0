import { ValueObject } from '@oceanfresh/shared/domain';

const MFA_CODE_LENGTH = 6;
const MFA_CODE_REGEX = /^\d{6}$/;

export class MfaCode extends ValueObject {
  private constructor(
    private readonly _code: string,
    private readonly _expiresAt: Date,
  ) {
    super();
    if (!MFA_CODE_REGEX.test(_code)) {
      throw new Error(`MFA code must be exactly ${MFA_CODE_LENGTH} digits`);
    }
    if (_expiresAt <= new Date()) {
      throw new Error('MFA code expiry must be in the future');
    }
  }

  static create(code: string, expiresAt: Date): MfaCode {
    return new MfaCode(code, expiresAt);
  }

  get code(): string {
    return this._code;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  isExpired(): boolean {
    return new Date() >= this._expiresAt;
  }

  protected getEqualityComponents(): unknown[] {
    return [this._code, this._expiresAt.getTime()];
  }
}
