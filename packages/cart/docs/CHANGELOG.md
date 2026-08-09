# Cart Domain Changelog

## v0.0.1 — Initial Implementation (2026-07-16)

### Added

- **CartStateMachine** with 8 states and 3 terminal states; enforced VALID_TRANSITIONS
- **CartPricingService** — subtotal, tax (default 5% GST), shipping (free above ₹500), discount (stub), grand total
- **CartValidationService** — validates products via `IProductCatalog`, checks stock, availability, price
- **CartMergeService** — guest→user merge with conflict resolution strategies
- **CartCheckoutFactory** — produces `CartCheckoutContext` for Order domain handoff
- **CartService** — facade orchestrating all services; getOrCreateCart with auto-merge
- **FirestoreCartRepository** — full CRUD, session lookup, merge with status updates
- **InMemoryEventBus** — typed CartEvent with 9 CartEventTypes
- **React Query hooks** — 4 queries, 7 mutations
- **React components** — 9 components (Summary, ItemCard, Drawer, Icon, etc.)
- **Zod schemas** — addToCart, updateItem, cartQuery

### Architecture Upgrades (per Review Addendum)

- `IProductCatalog` contract in Product domain → Cart depends on interface, not implementation
- Session ownership boundary — Cart never manages/creates `sessionId`
- `ProductSnapshot` stores frozen copy at add-time
- `CartCheckoutContext` handoff contract for future Order domain
- Updated dependency diagram and state machine diagram
