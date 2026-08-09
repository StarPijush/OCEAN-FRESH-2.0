# Architectural Decisions — Order Domain

## ADR-001: Orders Are Immutable Business Records

- **Context**: Once an order is created, it must preserve business history forever
- **Decision**: Orders are never edited after creation. All mutable data is captured in immutable snapshots at creation time
- **Consequence**: Order items, prices, customer details, and totals are frozen. Changes are recorded via timeline entries

## ADR-002: Client-Provided IdempotencyKey

- **Context**: Double-clicks, retries, and payment gateway callbacks can cause duplicate order creation
- **Decision**: Every order creation request includes an IdempotencyKey. The OrderService checks for existing orders with the same key before creating
- **Consequence**: Idempotency is owned by the Order Domain. If the same checkout request is submitted multiple times, the existing order is returned instead of creating a duplicate

## ADR-003: Immutable Snapshots at Creation Time

- **Context**: Product prices, customer addresses, and shipping costs change over time. Orders must reflect what was true at purchase time
- **Decision**: All mutable business data is snapshotted at order creation: product (name, price, SKU, image), customer (name, phone, address), shipping (method, cost, address), billing (address, GSTIN)
- **Consequence**: The Order Domain never reads current product prices, stock, or user addresses after creation. Snapshots are the single source of truth for historical accuracy

## ADR-004: 15-State OrderStateMachine

- **Context**: The order lifecycle involves distinct phases: validation, payment, fulfillment, delivery, cancellation, refund
- **Decision**: 15 explicit states with enforced VALID_TRANSITIONS map. All transitions validated before persistence
- **Consequence**: Illegal transitions throw `IllegalOrderStateTransitionError`. PAID → CANCELLED is forbidden; must go through PAID → REFUND_REQUESTED → REFUNDED

## ADR-005: Payment Boundary via IPaymentGateway Interface

- **Context**: The Order Domain must not depend on payment implementation (Razorpay, etc.)
- **Decision**: Define `IPaymentGateway` interface with `createPayment`, `verifyPayment`, `refund`. Future Payment Domain implements it
- **Consequence**: Order depends only on the interface. Payment can be swapped without changes to Order

## ADR-006: Server-Side Total Calculation

- **Context**: Client could tamper with prices or totals
- **Decision**: All privileged operations go through `IOrderRepository`. `OrderPricingService` recalculates totals server-side
- **Consequence**: Client-submitted price data is advisory only; server always wins

## ADR-007: CartCheckoutContext as Order Input Contract

- **Context**: Cart and Order are separate domains; Order should not depend on Cart implementation
- **Decision**: Order consumes `CartCheckoutContext` — a plain data contract produced by the Cart domain at checkout
- **Consequence**: Order never imports Cart repositories or internals. CartCheckoutContext is the official handoff boundary

## ADR-008: Order Number Format: OF-{year}-{6-digit}

- **Context**: Order numbers must be unique, sortable, human-readable, and never reused
- **Decision**: Format `OF-2026-000001`, generated via atomic Firestore counter document per year
- **Consequence**: Year-prefix enables chronological sorting. Atomic transaction prevents duplicates. 6-digit sequence supports 999,999 orders per year
