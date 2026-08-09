import { MfaCodeExpiredError } from '../errors/mfa-code-expired.error.js';
import { MfaCode } from '../value-objects/mfa-code.js';

export class MfaService {
  private readonly CODE_EXPIRY_MINUTES = 5;

  generateCode(): MfaCode {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + this.CODE_EXPIRY_MINUTES * 60 * 1000);
    return MfaCode.create(code, expiresAt);
  }

  verifyCode(code: MfaCode, input: string): boolean {
    if (code.isExpired()) {
      throw new MfaCodeExpiredError();
    }
    return code.code === input;
  }
}
