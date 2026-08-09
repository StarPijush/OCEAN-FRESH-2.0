// Entities
export type { SessionData } from './entities/session.entity.js';
export { Session, SessionStatus } from './entities/session.entity.js';
export type { UserAccountData } from './entities/user-account.entity.js';
export { UserAccount, UserAccountStatus } from './entities/user-account.entity.js';

// Value Objects
export type { DeviceInfoData } from './value-objects/device-info.js';
export { DeviceInfo } from './value-objects/device-info.js';
export { LoginAttempt } from './value-objects/login-attempt.js';
export { MfaCode } from './value-objects/mfa-code.js';
export { RefreshToken } from './value-objects/refresh-token.js';
export { SessionToken } from './value-objects/session-token.js';

// Errors
export { AccountLockedError } from './errors/account-locked.error.js';
export { EmailNotVerifiedError } from './errors/email-not-verified.error.js';
export { InvalidCredentialsError } from './errors/invalid-credentials.error.js';
export { MfaCodeExpiredError } from './errors/mfa-code-expired.error.js';
export { PasswordTooWeakError } from './errors/password-too-weak.error.js';
export { SessionExpiredError } from './errors/session-expired.error.js';
export { TooManyAttemptsError } from './errors/too-many-attempts.error.js';

// Events
export { AccountLockedEvent } from './events/account-locked.event.js';
export { AccountUnlockedEvent } from './events/account-unlocked.event.js';
export { MfaDisabledEvent } from './events/mfa-disabled.event.js';
export { MfaEnabledEvent } from './events/mfa-enabled.event.js';
export { PasswordChangedEvent } from './events/password-changed.event.js';
export { UserLoggedInEvent } from './events/user-logged-in.event.js';
export { UserLoggedOutEvent } from './events/user-logged-out.event.js';
export { UserRegisteredEvent } from './events/user-registered.event.js';

// Commands
export type { ChangePasswordCommand } from './commands/change-password.command.js';
export type { LoginCommand } from './commands/login.command.js';
export type { LogoutCommand } from './commands/logout.command.js';
export type { RegisterCommand } from './commands/register.command.js';
export type { SetupMfaCommand } from './commands/setup-mfa.command.js';
export type { VerifyMfaCommand } from './commands/verify-mfa.command.js';

// Queries
export type { GetActiveSessionsQuery } from './queries/get-active-sessions.query.js';
export type { GetLoginHistoryQuery } from './queries/get-login-history.query.js';
export type { GetMfaStatusQuery } from './queries/get-mfa-status.query.js';

// Rules
export { AccountLockoutRule } from './rules/account-lockout.rule.js';
export { MfaRequiredRule } from './rules/mfa-required.rule.js';
export type { PasswordExpiryCandidate } from './rules/password-expiry.rule.js';
export { PasswordExpiryRule } from './rules/password-expiry.rule.js';
export { SessionExpiryRule } from './rules/session-expiry.rule.js';

// Services
export { AuthenticationService } from './services/authentication.service.js';
export { MfaService } from './services/mfa.service.js';
export { SessionManagementService } from './services/session-management.service.js';

// Factories
export type { CreateSessionData } from './factories/session.factory.js';
export { SessionFactory } from './factories/session.factory.js';
export type {
  CreateUserAccountResult,
  RegisterCommandData,
} from './factories/user-account.factory.js';
export { UserAccountFactory } from './factories/user-account.factory.js';

// Validation
export type { PasswordStrengthResult } from './validation/password.validator.js';
export { PasswordValidator } from './validation/password.validator.js';
export type { RegistrationValidationResult } from './validation/registration.validator.js';
export { RegistrationValidator } from './validation/registration.validator.js';
