# Cart Domain TODO

## High Priority

- [ ] Write unit tests for CartStateMachine (all valid + invalid transitions)
- [ ] Write unit tests for CartPricingService (subtotal, tax, shipping, discount, grand total)
- [ ] Write unit tests for CartValidationService (mocked IProductCatalog)
- [ ] Write unit tests for CartMergeService (guest→user, conflict resolution)
- [ ] Write unit tests for FirestoreCartRepository (mocked firestoreService)
- [ ] Write integration tests for CartService (orchestration)
- [ ] Write component tests (CartSummary, CartItemCard, AddToCartButton, CartDrawer)

## Medium Priority

- [ ] Add coupon/discount support to CartPricingService
- [ ] Add inventory reservation stubs to CartValidationService
- [ ] Add cart expiry cron/cleanup job
- [ ] Add abandoned cart recovery logic
- [ ] Add cart analytics events (abandoned, recovered, conversion)

## Low Priority

- [ ] Add cart import/export for admin
- [ ] Add multi-currency support
- [ ] Add cart notes/gift message support
- [ ] Add cart sharing (wishlist-like)

## Integration

- [ ] Integrate with Order domain (consume CartCheckoutContext)
- [ ] Migrate legacy Zustand cart store references
- [ ] Remove old cart types from shared package
