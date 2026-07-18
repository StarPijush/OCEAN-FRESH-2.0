# Architecture Decisions

## ADR-001: Auth as a separate domain package

**Context**: All business domains depend on auth. Auth must NOT depend on any business domain.

**Decision**: Auth lives in `packages/auth/` with no dependencies on product, category, order, etc. Only depends on `@oceanfresh/shared` and `@oceanfresh/firebase`.

## ADR-002: Cloud Functions for privileged operations

**Context**: Role assignment, user disable/enable, and audit log queries are privileged operations that must never execute on the client.

**Decision**: Abstract `ICloudFunctionsRepository` interface with two implementations — `callFunction()` on client side, Firebase Admin SDK on server side.

## ADR-003: State machine over boolean flags

**Context**: Auth state is complex — unauth, authenticating, mfa_required, authenticated, reauth_required, session_expired, email_unverified, rate_limited, error.

**Decision**: `AuthStateMachine` class with explicit `VALID_TRANSITIONS` map; invalid transitions throw `IllegalStateTransitionError`.

## ADR-004: Permission enum over strings

**Context**: 40+ permissions referenced across all domains; strings invite typos and break at runtime.

**Decision**: `Permission` string enum in `@oceanfresh/shared` so all domains type-check permission usage.

## ADR-005: MFA as stubs only

**Context**: MFA is architecturally designed but not implemented in Sprint 3.

**Decision**: `IMfaProvider` interface + types exist; implementations return "not implemented" errors until a dedicated MFA sprint.

## ADR-006: InMemoryEventBus over Firestore for events

**Context**: Events are in-process cross-layer communication (service → audit, session, etc.), not cross-service.

**Decision**: Synchronous InMemoryEventBus with subscribe/publish pattern; no event sourcing/persistence for now.
