# @oceanfresh/order — Order Domain

## Overview
The Order Domain is the canonical transaction engine of the OceanFresh platform. It manages the complete order lifecycle — creation, validation, state machine transitions, immutable snapshots, idempotency, payment handoff, cancellation, refunds, and audit trail. Built with Clean Architecture principles following the same engineering standards as Product, Category, Auth, and Cart domains.

## Architecture
- **Repository Pattern**: `IOrderRepository` → `FirestoreOrderRepository`
- **Service Layer**: `OrderService`, `OrderStateMachine`, `OrderValidationService`, `OrderSnapshotService`, `OrderPricingService`, `OrderNumberGenerator`, `OrderCancellationService`, `OrderHistoryService`
- **Dependency Injection**: Via `@oceanfresh/shared` container
- **Events**: `InMemoryEventBus` with 12 typed `OrderEventType`s
- **Queries**: TanStack Query hooks for React
- **Validation**: Zod schemas in `@oceanfresh/shared`

## Key Design Decisions
- **Orders are immutable business records** — never modified after creation
- **IdempotencyKey** prevents duplicate order creation from double-clicks/retries
- **15-state OrderStateMachine** with enforced transitions and terminal states
- **Immutable snapshots** at creation time — never reads current product/user data
- **CartCheckoutContext** consumed from Cart domain; never depends on Cart internals
- **IPaymentGateway** boundary interface — future Payment Domain owns implementation
- **Server-side validation** always wins — never trust client prices or totals

## Status
- [x] Architecture & types
- [x] Repository (Firestore)
- [x] Services (state machine, validation, snapshot, pricing, number gen, cancellation, history)
- [x] Events (InMemoryEventBus)
- [x] Queries (TanStack Query)
- [x] Hooks
- [x] Components
- [x] Tests
- [ ] Payment integration
