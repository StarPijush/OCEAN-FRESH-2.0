# Order Domain Changelog

## v0.0.1 — Initial Implementation (2026-07-16)

### Added

- **OrderStateMachine** with 15 states, 2 terminal (REFUNDED, ARCHIVED); enforced VALID_TRANSITIONS
- **OrderNumberGenerator** — produces `OF-{year}-{6-digit}` format via atomic Firestore counter
- **OrderValidationService** — validates checkout context, creation input, status transitions, cancellation rules, refund rules
- **OrderSnapshotService** — creates immutable product, customer, shipping, billing snapshots
- **OrderPricingService** — server-side total calculation (never trusts client)
- **OrderCancellationService** — cancellation with pre-paid validation, refund request/complete flow
- **OrderHistoryService** — appends timeline entries for status changes
- **IPaymentGateway** — boundary interface for future Payment Domain
- **OrderService** — facade orchestrating all services; idempotent createFromCheckout
- **FirestoreOrderRepository** — full CRUD, idempotency key lookup, order number search, status/payment/timeline updates
- **InMemoryEventBus** — typed OrderEvent with 12 OrderEventTypes
- **React Query hooks** — 6 queries, 4 mutations
- **React components** — 9 components (StatusBadge, Card, Summary, Item, Timeline, Totals, Empty, Loading, ErrorBoundary)
- **Zod schemas** — createOrderFromCheckout, orderQuery

### Architecture Decisions

- Client-provided IdempotencyKey prevents duplicate orders
- PAID → REFUND_REQUESTED → REFUNDED path (no direct cancellation of paid orders)
- Dedicated `OrderNumberGenerator` service with Firestore atomic counter
- Legacy order types replaced entirely with 15-state model
