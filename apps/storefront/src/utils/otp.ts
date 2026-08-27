/** Keeps only digits and caps at length — for 6-digit OTP. */
export function sanitizeOtpInput(value: string, length = 6): string {
  return value.replace(/\D/g, '').slice(0, length);
}

/** Joins segments into final OTP string. */
export function joinOtpSegments(segments: string[], length = 6): string {
  return segments.join('').slice(0, length);
}

/** Masks email for confirmation screens: jo***@example.com */
export function maskEmail(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.indexOf('@');
  if (at <= 1) return trimmed;
  return `${trimmed.slice(0, 2)}${'*'.repeat(3)}${trimmed.slice(at)}`;
}
