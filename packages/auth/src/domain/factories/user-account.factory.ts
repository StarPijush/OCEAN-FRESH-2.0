import { Email } from '@oceanfresh/shared/domain';

import { UserAccount, UserAccountStatus } from '../entities/user-account.entity.js';
import { PasswordTooWeakError } from '../errors/password-too-weak.error.js';
import { PasswordValidator } from '../validation/password.validator.js';
import { RegistrationValidator } from '../validation/registration.validator.js';

export interface RegisterCommandData {
  email: string;
  password: string;
  displayName: string;
}

export interface CreateUserAccountResult {
  success: boolean;
  account?: UserAccount;
  errors: string[];
}

export const UserAccountFactory = {
  fromRegistration(data: RegisterCommandData): CreateUserAccountResult {
    const validation = RegistrationValidator.validate(data);
    if (!validation.valid) {
      const passwordResult = PasswordValidator.validate(data.password);
      if (!passwordResult.valid) {
        throw new PasswordTooWeakError(passwordResult.reasons);
      }
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const email = Email.create(data.email);

    const account = new UserAccount({
      id: crypto.randomUUID(),
      email,
      displayName: data.displayName.trim(),
      mfaEnabled: false,
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: null,
      roles: [],
      permissions: [],
      status: UserAccountStatus.ACTIVE,
    });

    return {
      success: true,
      account,
      errors: [],
    };
  },
};
