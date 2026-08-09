export interface PasswordStrengthResult {
  valid: boolean;
  reasons: string[];
  score: number;
}

const MIN_LENGTH = 8;
const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const DIGIT_REGEX = /\d/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>_\-`~;'[\]\\/]/;

export const PasswordValidator = {
  validate(password: string): PasswordStrengthResult {
    const reasons: string[] = [];

    if (!password || password.length < MIN_LENGTH) {
      reasons.push(`Password must be at least ${MIN_LENGTH} characters`);
    }
    if (!UPPERCASE_REGEX.test(password)) {
      reasons.push('Password must contain an uppercase letter');
    }
    if (!LOWERCASE_REGEX.test(password)) {
      reasons.push('Password must contain a lowercase letter');
    }
    if (!DIGIT_REGEX.test(password)) {
      reasons.push('Password must contain a digit');
    }
    if (!SPECIAL_CHAR_REGEX.test(password)) {
      reasons.push('Password must contain a special character');
    }

    const passedChecks = 5 - reasons.length;
    const score = Math.round((passedChecks / 5) * 100);

    return {
      valid: reasons.length === 0,
      reasons,
      score,
    };
  },
};
