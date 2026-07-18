# Order Domain TODO

## High Priority
- [x] Domain analysis and architectural decisions
- [x] Domain model (types, errors, schemas)
- [x] Order state machine (15 states)
- [x] Repository (interface + Firestore)
- [x] Services (validation, snapshot, pricing, number gen, cancellation, history, facade)
- [x] Events (InMemoryEventBus, 12 OrderEventTypes)
- [x] Queries (6 hooks) + Mutations (4 hooks)
- [x] Hooks (thin wrappers)
- [x] Components (9 reusable)
- [x] Tests (events, services, repository, components)
- [x] Documentation (6 files)

## Medium Priority
- [ ] Add coupon/discount support to OrderPricingService
- [ ] Add Firestore composite indexes for order queries
- [ ] Add Cloud Functions for order expiry/abandonment
- [ ] Add order export (CSV/PDF) support
- [ ] Add order notes/tracking support
- [ ] Add partial refund support

## Integration
- [ ] Integrate with Payment Domain (IPaymentGateway implementation)
- [ ] Integrate with Cart Domain's checkout flow (consume CartCheckoutContext)
- [ ] Integrate with Inventory reservation (deduct stock on order creation)
- [ ] Integrate with Notification Domain (order confirmation emails/SMS)
- [ ] Wire `registerOrderRepository()` in app bootstrap

## Low Priority
- [ ] Add multi-currency support
- [ ] Add order split/partial fulfillment
- [ ] Add order scheduling (pre-order, subscription)
- [ ] Add admin order editing (with audit trail)
