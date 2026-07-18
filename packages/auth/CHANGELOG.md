# Changelog

## [0.0.0] — 2026-07-16

### Added
- **Architecture**: Clean Architecture with 10 layers (guards, queries, hooks, components, services, providers, repository, session, events, permissions, mfa)
- **State Machine**: AuthStateMachine with 9 AuthenticationState values and enforced transitions
- **Permissions**: RBAC matrix with 6 roles (GUEST, CUSTOMER, MODERATOR, ADMIN, SUPER_ADMIN, SYSTEM) and 40+ Permission enums
- **Session Management**: Device fingerprinting (SHA-256), risk scoring, idle/absolute timers, cross-tab sync (BroadcastChannel)
- **Guards**: AuthGuard, RoleGate, PermissionGate, FeatureGate
- **Components**: Protected, AuthStatus, UserAvatar, LoginForm, RegisterForm, PasswordStrength, SessionExpiredDialog
- **Services**: AuthService (rate-limited login), AuthorizationService, TokenService (JWT), AppCheckService
- **Cloud Functions**: ICloudFunctionsRepository for privileged ops (assignRole, disableUser, etc.)
- **MFA Stubs**: TOTP, SMS, Email OTP, Passkeys, Recovery Codes, Trusted Devices
- **Events**: 40+ AuthEventType values, InMemoryEventBus
- **Errors**: 15 auth error classes with machine-readable codes
- **Security**: Security model documentation (threat model, auth flow, rate limiting, audit)
- **Tests**: 9 test files covering all layers (events, session, permissions, services, providers, guards, components, mfa, hooks)
