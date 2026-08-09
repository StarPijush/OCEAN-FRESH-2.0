# Auth Domain Architecture

## Overview

The Auth domain provides Identity and Access Management (IAM) for OceanFresh. It is the foundational domain — all other domains depend on it, and it must NOT depend on any business domain.

## Layers

```
Components (guards, forms, status)
    ↓
Queries (TanStack Query hooks + mutations)
    ↓
Services (Auth, Authorization, Token, AppCheck)
    ↓
Providers (FirebaseAuth)  │  Repository (Firestore)
    ↓                      ↓
Session (state machine, device manager, session manager)
    ↓
Events (InMemoryEventBus)
```

### Guards (`src/guards/`)

- **AuthGuard** — Renders children only when authenticated
- **RoleGate** — Renders children based on role hierarchy
- **PermissionGate** — Renders children based on permission set
- **FeatureGate** — Feature flag wrapper

### Queries (`src/queries/`)

- TanStack Query hooks for `useCurrentUser`, `useAuthState`, `useSession`, `usePermissions`, `useRole`, `useIsAuthenticated`, `useRequirePermission`
- Mutations: `useLogin`, `useRegister`, `useLogout`, `useResetPassword`, `useVerifyEmail`, `useDeleteAccount`, `useRefreshSession`

### Hooks (`src/hooks/`)

- **useAuth** — Re-exports from queries for convenience
- **useAuthForm** — Provides Zod schema + default values based on form mode (login/register/resetPassword)

### Services (`src/service/`)

- **AuthService** — Login (with rate limiting), register, logout, resetPassword, verifyEmail, deleteAccount, reauthenticate; publishes AuthEvents
- **AuthorizationService** — hasPermission, requirePermission, assignRole, getEffectivePermissions, isAtLeastRole, requireRole
- **TokenService** — JWT decode, isTokenExpired, getTokenRefreshCountdown, concurrency-safe refresh
- **AppCheckService** — Firebase App Check with ReCaptchaV3Provider
- **ICloudFunctionsRepository** — Abstract interface for privileged operations (assignRole, updateClaims, disableUser, enableUser, deleteUser, revokeSessions, getAuditLogs); implemented by FirebaseCloudFunctionsRepository

### Providers (`src/providers/`)

- **IAuthProvider** — Interface with 13 methods
- **FirebaseAuthProvider** — Full Firebase modular SDK implementation
- **provider.factory.ts** — Factory pattern for DI

### Repository (`src/repository/`)

- **IAuthRepository** — Interface with 13 methods for sessions, devices, audit logs, users CRUD
- **FirestoreAuthRepository** — Firestore implementation using collections `auth_sessions`, `auth_devices`, `auditLogs`, `users`
- **auth.repository.factory.ts** — DI registration with container.register/resolve

### Session (`src/session/`)

- **AuthStateMachine** — 9-state finite state machine with enforced transitions (IllegalStateTransitionError)
- **InMemorySessionStore** — In-memory session CRUD
- **DeviceManager** — SHA-256 fingerprinting, risk score (0-100), device type/OS/browser detection
- **SessionManager** — Idle timer (30min), absolute timer (24h), refresh (5min before), cross-tab sync (BroadcastChannel)

### Events (`src/events/`)

- **InMemoryEventBus** — Subscribe/publish/unsubscribe/clear with AggregateError on handler failures

### Permissions (`src/permissions/`)

- **PermissionMatrix** — 6 roles (GUEST/CUSTOMER/MODERATOR/ADMIN/SUPER_ADMIN/SYSTEM) with 40+ permissions
- **PermissionResolver** — hasPermission, getEffectivePermissions, isAtLeastRole with ABAC extension points
- **Authorization Policies** — 15 policy functions (canReadProducts, canManageUsers, canImpersonate, etc.)

### MFA (`src/mfa/`)

- **IMfaProvider** — Interface stub for TOTP, SMS, Email OTP, Passkeys, Recovery Codes, Trusted Devices
- **MfaEnrollment / MfaChallenge** types

## States

- **AuthenticationState**: unauthenticated, authenticating, mfa_required, authenticated, reauth_required, session_expired, email_unverified, rate_limited, error
- **AccountStatus**: pending_verification, active, suspended, locked, disabled, deleted, banned

## Security

See [docs/security/AUTH_SECURITY_MODEL.md](docs/security/AUTH_SECURITY_MODEL.md)
