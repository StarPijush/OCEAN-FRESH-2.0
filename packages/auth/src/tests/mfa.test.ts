import { MfaFactorType } from '@oceanfresh/shared';
import { describe, expect, it } from 'vitest';

describe('MFA Architecture (stubs)', () => {
  it('defines MFA factor types', () => {
    expect(MfaFactorType.TOTP).toBe('totp');
    expect(MfaFactorType.SMS).toBe('sms');
    expect(MfaFactorType.EMAIL_OTP).toBe('email_otp');
    expect(MfaFactorType.PASSKEYS).toBe('passkeys');
    expect(MfaFactorType.WEBAUTHN).toBe('webauthn');
    expect(MfaFactorType.RECOVERY_CODE).toBe('recovery_code');
  });

  it('defines all 6 factor types', () => {
    const types = Object.values(MfaFactorType);
    expect(types).toHaveLength(6);
  });
});
