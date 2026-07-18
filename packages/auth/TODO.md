# TODO

## Sprint 3 (Current)
- [x] Shared types (auth.ts, permission.ts, validators, errors)
- [x] Auth package scaffolding (package.json, tsconfig, vitest.config)
- [x] Providers layer (IAuthProvider, FirebaseAuthProvider, factory)
- [x] Repository layer (IAuthRepository, FirestoreAuthRepository, factory)
- [x] Events layer (InMemoryEventBus, types)
- [x] Permissions layer (permission-matrix, PermissionResolver, policies)
- [x] Session layer (AuthStateMachine, InMemorySessionStore, DeviceManager, SessionManager)
- [x] MFA stubs (IMfaProvider, types)
- [x] Services layer (AuthService, AuthorizationService, TokenService, AppCheckService, CloudFunctionsRepository)
- [x] Guards (AuthGuard, RoleGate, PermissionGate, FeatureGate)
- [x] Queries (TanStack Query hooks + mutations)
- [x] Hooks (useAuth, useAuthForm)
- [x] Components (Protected, AuthStatus, UserAvatar, LoginForm, RegisterForm, PasswordStrength, SessionExpiredDialog)
- [x] Tests (events, session, permissions, services, providers, guards, components, mfa, hooks)
- [x] Documentation (ARCHITECTURE, CHANGELOG, DECISIONS, SECURITY_MODEL, TODO)

## Sprint 4+ (Future)
- [ ] MFA implementation (TOTP, SMS, Email OTP, Passkeys)
- [ ] Recovery Codes implementation
- [ ] Trusted Devices with remember-me
- [ ] OAuth provider integrations (Google, Apple, Facebook)
- [ ] Phone authentication via Firebase
- [ ] Admin user management UI
- [ ] Audit log viewer
- [ ] Session management UI (view/revoke sessions)
- [ ] Rate limit configuration UI
- [ ] Integration with Order domain
- [ ] Integration with Checkout domain
- [ ] E2E tests with Cypress
