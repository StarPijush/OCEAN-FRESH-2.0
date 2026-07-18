# @oceanfresh/cart — Cart Domain

## Overview
The Cart Domain manages shopping cart lifecycle — creation, item management, pricing, validation, guest-to-user merge, checkout preparation, and state machine transitions. It is built with Clean Architecture principles and follows the same engineering standards as the Product, Category, and Auth domains.

## Architecture
- **Repository Pattern**: `ICartRepository` → `FirestoreCartRepository`
- **Service Layer**: `CartService`, `CartPricingService`, `CartValidationService`, `CartMergeService`, `CartStateMachine`
- **Dependency Injection**: Via `@oceanfresh/shared` container
- **Events**: `InMemoryEventBus` with typed `CartEvent` + `CartEventType`
- **Queries**: TanStack Query hooks for React
- **Validation**: Zod schemas in `@oceanfresh/shared`

## Key Design Decisions
- `sessionId` is opaque — Cart never creates or manages session identifiers
- `CartStateMachine` enforces 8 states with 3 terminal states
- `ProductSnapshot` frozen at add-time for audit accuracy
- `CartCheckoutContext` is the official handoff to the future Order domain
- All privileged operations go through `ICartRepository` — never trust client prices/quatities

## Status
- [x] Architecture & types
- [x] Repository (Firestore)
- [x] Services (state machine, pricing, validation, merge, checkout)
- [x] Events (InMemoryEventBus)
- [x] Queries (TanStack Query)
- [x] Hooks
- [x] Components
- [ ] Tests
- [ ] Order integration
