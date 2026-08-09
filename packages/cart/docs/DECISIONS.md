# Architectural Decisions — Cart Domain

## ADR-001: IProductCatalog as a Boundary Contract

- **Context**: Cart needs product data (price, stock, availability) but must not depend on Product repository or Firestore
- **Decision**: Create `IProductCatalog` interface in Product domain with `ProductSummary` DTO
- **Consequence**: Cart depends on a thin, stable contract; Product domain owns the implementation

## ADR-002: ProductSnapshot for Temporal Accuracy

- **Context**: Cart items must reflect the product at time of addition for audit/historical integrity
- **Decision**: Every `CartItem` carries a `ProductSnapshot` frozen at add-time
- **Consequence**: Checkout still revalidates via `IProductCatalog`, but snapshot preserves original context

## ADR-003: CartStateMachine for Enforced Transitions

- **Context**: Cart status transitions must be predictable and auditable
- **Decision**: `CartStateMachine` with `VALID_TRANSITIONS` map; throws `IllegalCartStateTransitionError`
- **Consequence**: 8 states, 3 terminal; all transitions validated before persistence

## ADR-004: CartCheckoutContext as Order Handoff

- **Context**: Cart and Order are separate domains; Order should not depend on Cart internals
- **Decision**: Cart produces `CartCheckoutContext` at checkout — a plain data contract
- **Consequence**: Order domain consumes `CartCheckoutContext` read-only; Cart never imports Order

## ADR-005: Server-Side Price/Quantity Authority

- **Context**: Client could tamper with prices or quantities
- **Decision**: All privileged operations go through `ICartRepository`; `CartPricingService` recalculates server-side
- **Consequence**: Client-submitted price data is advisory only; server always wins

## ADR-006: Session Ownership Boundary

- **Context**: Session management is an infrastructure concern
- **Decision**: Cart accepts `sessionId` as opaque string; never creates or manages session identifiers
- **Consequence**: Session lifecycle is handled by the application/auth layer

## ADR-007: Future Coupon/Inventory Reservation (Deferred)

- **Context**: Coupon codes and inventory reservation are out of scope
- **Decision**: Design hooks in `CartPricingService` (discount stub) and `CartValidationService` but do not implement
- **Consequence**: These can be added later with no breaking changes
