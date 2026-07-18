export enum AuthenticationState {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  AUTHENTICATING = 'AUTHENTICATING',
  MFA_REQUIRED = 'MFA_REQUIRED',
  AUTHENTICATED = 'AUTHENTICATED',
  EMAIL_UNVERIFIED = 'EMAIL_UNVERIFIED',
  REAUTH_REQUIRED = 'REAUTH_REQUIRED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  ACCOUNT_DELETED = 'ACCOUNT_DELETED',
}

export enum AccountStatus {
  PENDING_VERIFICATION = 'pending_verification',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  LOCKED = 'locked',
  DISABLED = 'disabled',
  DELETED = 'deleted',
  BANNED = 'banned',
}

export enum AuthProviderType {
  EMAIL = 'email',
  GOOGLE = 'google',
  PHONE = 'phone',
  ANONYMOUS = 'anonymous',
  APPLE = 'apple',
  MICROSOFT = 'microsoft',
  GITHUB = 'github',
  FACEBOOK = 'facebook',
  PASSKEYS = 'passkeys',
  WEBAUTHN = 'webauthn',
  SAML = 'saml',
  OIDC = 'oidc',
}

export enum IdentityType {
  USER = 'user',
  SERVICE_ACCOUNT = 'service_account',
  MACHINE = 'machine',
}

export interface UserIdentity {
  id: string;
  email: string | null;
  phone: string | null;
  displayName: string;
  photoURL: string | null;
  provider: AuthProviderType;
  identityType: IdentityType;
  emailVerified: boolean;
  accountStatus: AccountStatus;
  isAnonymous: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
}

export interface LoginInput {
  email?: string;
  phone?: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
}

export interface ResetPasswordInput {
  email: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  tokenPair: TokenPair;
  device: DeviceInfo;
  metadata: SessionMetadata;
  startedAt: number;
  lastActivityAt: number;
  expiresAt: number;
  absoluteExpiresAt: number;
  isRememberMe: boolean;
  isRevoked: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  os: string;
  browser: string;
  ipHash: string;
  isTrusted: boolean;
  riskScore: number;
  lastLoginAt: number;
}

export interface SessionMetadata {
  authMethod: string;
  mfaUsed: boolean;
}

export interface MfaFactor {
  id: string;
  type: MfaFactorType;
  enrolledAt: Date;
  name: string;
}

export enum MfaFactorType {
  TOTP = 'totp',
  SMS = 'sms',
  EMAIL_OTP = 'email_otp',
  PASSKEYS = 'passkeys',
  WEBAUTHN = 'webauthn',
  RECOVERY_CODE = 'recovery_code',
}

export interface TemporaryPermission {
  permission: string;
  grantedBy: string;
  expiresAt: number;
  reason: string;
}

export interface DelegatedPermission {
  permission: string;
  delegatedBy: string;
  delegatedTo: string;
  resourceScope?: string;
  expiresAt: number;
}

export interface RoleElevation {
  userId: string;
  elevatedTo: string;
  originalRole: string;
  expiresAt: number;
  reason: string;
  approvedBy: string;
}

export interface Impersonation {
  id: string;
  impersonatorId: string;
  targetUserId: string;
  startedAt: number;
  expiresAt: number;
  reason: string;
}

export interface ServiceAccount {
  id: string;
  name: string;
  permissions: string[];
  allowedIPs: string[];
  apiKeyHash: string;
  expiresAt: number;
}

export interface AuthEvent {
  type: AuthEventType;
  userId: string;
  data?: Record<string, unknown>;
  metadata?: {
    source?: string;
    correlationId?: string;
    timestamp?: Date;
  };
}

export enum AuthEventType {
  LOGGED_IN = 'auth:logged_in',
  LOGGED_OUT = 'auth:logged_out',
  LOGIN_FAILED = 'auth:login_failed',
  REGISTERED = 'auth:registered',
  PASSWORD_RESET_REQUESTED = 'auth:password_reset_requested',
  PASSWORD_CHANGED = 'auth:password_changed',
  EMAIL_VERIFIED = 'auth:email_verified',
  SESSION_EXPIRED = 'auth:session_expired',
  SESSION_REFRESHED = 'auth:session_refreshed',
  SESSION_REVOKED = 'auth:session_revoked',
  ROLE_CHANGED = 'auth:role_changed',
  PERMISSION_CHANGED = 'auth:permission_changed',
  ACCOUNT_DELETED = 'auth:account_deleted',
  ACCOUNT_DISABLED = 'auth:account_disabled',
  ACCOUNT_LOCKED = 'auth:account_locked',
  ACCOUNT_SUSPENDED = 'auth:account_suspended',
  REAUTH_REQUIRED = 'auth:reauth_required',
  REAUTH_COMPLETED = 'auth:reauth_completed',
  MFA_ENROLLED = 'auth:mfa_enrolled',
  MFA_UNENROLLED = 'auth:mfa_unenrolled',
  MFA_CHALLENGE_PASSED = 'auth:mfa_challenge_passed',
  MFA_CHALLENGE_FAILED = 'auth:mfa_challenge_failed',
  SUSPICIOUS_LOGIN = 'auth:suspicious_login',
  APP_CHECK_FAILED = 'auth:app_check_failed',
  TOKEN_REFRESH_FAILED = 'auth:token_refresh_failed',
  DEVICE_TRUSTED = 'auth:device_trusted',
  DEVICE_REVOKED = 'auth:device_revoked',
  ELEVATION_GRANTED = 'auth:elevation_granted',
  ELEVATION_EXPIRED = 'auth:elevation_expired',
  IMPERSONATION_STARTED = 'auth:impersonation_started',
  IMPERSONATION_ENDED = 'auth:impersonation_ended',
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
  ACCOUNT_BANNED = 'ACCOUNT_BANNED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',
  MFA_REQUIRED = 'MFA_REQUIRED',
  MFA_FAILED = 'MFA_FAILED',
  REAUTHENTICATION_REQUIRED = 'REAUTHENTICATION_REQUIRED',
  ILLEGAL_STATE_TRANSITION = 'ILLEGAL_STATE_TRANSITION',
  PROVIDER_NOT_SUPPORTED = 'PROVIDER_NOT_SUPPORTED',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
}
