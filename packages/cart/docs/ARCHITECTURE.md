# Cart Domain Architecture

## Layer Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Components Layer                          │
│  CartSummary  CartItemCard  CartDrawer  AddToCartButton     │
│  CartIcon  CheckoutButton  CartErrorBoundary  CartLoading   │
│  CartEmpty                                                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ uses
┌──────────────────────────▼──────────────────────────────────┐
│                      Hooks Layer                             │
│  useCart  useGetActiveCart  useCartForm                      │
└──────────────────────────┬──────────────────────────────────┘
                           │ uses
┌──────────────────────────▼──────────────────────────────────┐
│                    Queries Layer                              │
│  cartKeys  useCart  useCartByUser  useCartBySession          │
│  useCartByUserOrSession                                      │
│  Mutations: useCreateCart  useAddCartItem  useUpdateCartItem │
│  useRemoveCartItem  useClearCart  useMergeCart  useDeleteCart│
└──────────────────────────┬──────────────────────────────────┘
                           │ calls
┌──────────────────────────▼──────────────────────────────────┐
│                    Service Layer                              │
│  CartService (facade)                                        │
│  CartPricingService  CartValidationService  CartMergeService │
│  CartStateMachine  CartCheckoutFactory                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ depends on
             ┌─────────────┼─────────────┐
             │             │             │
┌────────────▼──┐  ┌───────▼──────┐  ┌──▼───────────┐
│Repository     │  │EventBus     │  │IProductCatalog│
│(Firestore)    │  │(InMemory)   │  │(Product       │
│               │  │             │  │ Domain)       │
└───────────────┘  └─────────────┘  └───────────────┘
```

## Dependency Rules
1. Components → Hooks → Queries → Services → Repository
2. Services never reference components, hooks, or queries
3. Repository is the only layer that touches Firestore
4. Service layer depends on `IProductCatalog` (Product domain), not Product repositories
5. Cart never imports Order domain — only exports `CartCheckoutContext` for Order to consume

## State Machine

```
                    ┌─────────┐
                    │ ACTIVE  │◄────────────────────────────┐
                    └────┬────┘                             │
                         │                                  │
                    ┌────▼────┐                        ┌────┴────┐
              ┌────►│VALIDATE │────►┐                  │ABANDONED│
              │     └─────────┘    │                  └─────────┘
              │                    │                        ▲
         ┌────┴────┐         ┌────▼────────┐               │
         │ EXPIRED │         │READY_FOR_   │               │
         └─────────┘         │CHECKOUT     │               │
                             └────┬────────┘               │
                                  │                   ┌────┴────┐
                             ┌────▼────────┐           │ ARCHIVED│
                             │CHECKOUT_    │           └─────────┘
                             │STARTED      │                 ▲
                             └────┬────────┘                 │
                                  │                    ┌────┴────┐
                             ┌────▼────────┐            │CHECKED_ │
                             │  CHECKED_   │            │  OUT    │
                             │  OUT        │            └─────────┘
                             └─────────────┘
```

## Terminal States
- `checked_out` — final, no further transitions
- `expired` — session TTL reached, can reactivate
- `abandoned` — inactivity timeout, can reactivate
- `archived` — manually archived, can reactivate
