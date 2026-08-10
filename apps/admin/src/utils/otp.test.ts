import { describe, expect, it } from 'vitest';

import { joinOtpSegments, maskEmail, sanitizeOtpInput } from './otp';

describe('sanitizeOtpInput', () => {
  it('keeps only digits', () => {
    expect(sanitizeOtpInput('12a3-4@5')).toBe('12345');
  });

  it('caps at the OTP length', () => {
    expect(sanitizeOtpInput('123456789')).toBe('123456');
    expect(sanitizeOtpInput('123456789', 8)).toBe('12345678');
  });
});

describe('joinOtpSegments', () => {
  it('joins segments into one code', () => {
    expect(joinOtpSegments(['1', '2', '3', '4', '5', '6'])).toBe('123456');
  });

  it('caps the joined result', () => {
    expect(joinOtpSegments(['123456', '789'], 6)).toBe('123456');
  });
});

describe('maskEmail', () => {
  it('masks the middle of the local part', () => {
    expect(maskEmail('jo@gmail.com')).toBe('jo***@gmail.com');
  });

  it('leaves short local parts untouched', () => {
    expect(maskEmail('j@gmail.com')).toBe('j@gmail.com');
  });

  it('trims whitespace', () => {
    expect(maskEmail('  admin@freshcatch.in ')).toBe('ad***@freshcatch.in');
  });
});
