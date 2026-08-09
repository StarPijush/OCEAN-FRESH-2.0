import { Email } from '@oceanfresh/shared/domain';

import { PasswordValidator } from './password.validator.js';

export interface RegistrationValidationResult {
  valid: boolean;
  errors: string[];
}

export const RegistrationValidator = {
  validate(data: {
    email: string;
    password: string;
    displayName: string;
  }): RegistrationValidationResult {
    const errors: string[] = [];

    try {
      Email.create(data.email);
    } catch {
      errors.push('Invalid email format');
    }

    const passwordResult = PasswordValidator.validate(data.password);
    if (!passwordResult.valid) {
      errors.push(...passwordResult.reasons);
    }

    if (!data.displayName || data.displayName.trim().length === 0) {
      errors.push('Display name is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};
