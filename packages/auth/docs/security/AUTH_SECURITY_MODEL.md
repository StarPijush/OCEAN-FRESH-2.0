# Auth Security Model

## Threat Model

| Threat | Mitigation |
|---|---|
| Credential stuffing | Rate limiting (5 attempts/15min), exponential backoff |
| Session hijacking | Device fingerprinting, risk scoring, session rotation |
| Token theft | Short-lived access tokens, refresh token rotation, absolute timeout 24h |
| Privilege escalation | RBAC with DENY overrides, Cloud Functions for sensitive ops |
| Account takeover | MFA (TOTP, SMS, Email OTP, Passkeys, Recovery Codes) |
| Replay attacks | JWT with iat, exp, jti claims |
| Cross-tab session theft | BroadcastChannel sync, activity tracking |

## Authentication Flow

1. User submits credentials → Firebase Auth validates
2. On success → Session created with device fingerprint
3. If MFA required → Challenge created, MFA_REQUIRED state
4. On MFA success → AUTHENTICATED state, session activated
5. Idle > 30min → SESSION_EXPIRED
6. Absolute > 24h → Forced re-authentication

## Authorization Model

- **RBAC core**: 6 roles with permission matrix
- **ABAC extension**: Custom claims for attribute-based conditions
- **Deny overrides**: Explicit DENY takes precedence over ALLOW
- **Temporary elevation**: Time-bound permission grants with audit trail
- **Impersonation**: Super-admin impersonation with full audit
- **Service accounts**: Machine-to-machine authentication with scoped permissions

## Audit Events

All privileged operations emit AuthEvents:
- LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT
- REGISTER_SUCCESS, REGISTER_FAILED
- ACCOUNT_LOCKED, ACCOUNT_UNLOCKED, ACCOUNT_DISABLED, ACCOUNT_ENABLED, ACCOUNT_DELETED
- PASSWORD_RESET, PASSWORD_CHANGED
- EMAIL_VERIFIED, EMAIL_CHANGED
- ROLE_ASSIGNED, ROLE_REVOKED
- PERMISSION_GRANTED, PERMISSION_REVOKED, PERMISSION_DENIED
- MFA_ENROLLED, MFA_UNENROLLED, MFA_VERIFIED, MFA_FAILED
- SESSION_CREATED, SESSION_REVOKED, SESSION_EXPIRED
- USER_IMPERSONATED, TEMP_ELEVATION_GRANTED, TEMP_ELEVATION_EXPIRED
- RATE_LIMIT_TRIGGERED

## Error Handling

15 error classes with machine-readable codes:
- Authentication: InvalidCredentialsError, MfaRequiredError, MfaFailedError, ReauthenticationRequiredError
- Account state: AccountLockedError, AccountDisabledError, EmailNotVerifiedError
- Token: TokenExpiredError, TokenRevokedError
- Rate limiting: TooManyAttemptsError
- Authorization: IllegalStateTransitionError, ProviderNotSupportedError
- Conflict: EmailAlreadyExistsError

## Rate Limiting

- Login: 5 attempts per 15 minutes per email/IP
- Password reset: 3 attempts per hour
- MFA verification: 5 attempts per 10 minutes
- API endpoints: Graduated tiers (burst/steady-state)
