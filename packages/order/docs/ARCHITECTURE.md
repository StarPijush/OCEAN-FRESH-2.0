# Order Domain Architecture

## Layer Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Components Layer                          │
│  OrderStatusBadge  OrderCard  OrderSummary  OrderItem      │
│  OrderTimeline  OrderTotals  OrderEmpty  OrderLoading      │
│  OrderErrorBoundary                                         │
└──────────────────────────┬──────────────────────────────────┘
                           │ uses
┌──────────────────────────▼──────────────────────────────────┐
│                      Hooks Layer                             │
│  useGetOrder  useGetOrders  useGetCustomerOrders             │
│  useGetRecentOrders  useOrderForm                            │
└──────────────────────────┬──────────────────────────────────┘
                           │ uses
┌──────────────────────────▼──────────────────────────────────┐
│                    Queries Layer                              │
│  orderKeys  useOrder  useOrderByNumber  useOrders            │
│  useCustomerOrders  useOrderStatus  useRecentOrders          │
│  Mutations: useCreateOrder  useCancelOrder                   │
│  useUpdateOrderStatus  useArchiveOrder                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ calls
┌──────────────────────────▼──────────────────────────────────┐
│                    Service Layer                              │
│  OrderService (facade)                                       │
│  OrderStateMachine  OrderNumberGenerator                     │
│  OrderValidationService  OrderSnapshotService                │
│  OrderPricingService  OrderCancellationService               │
│  OrderHistoryService                                         │
└──────────────────────────┬──────────────────────────────────┘
                           │ depends on
              ┌─────────────┼─────────────┐
              │             │             │
┌────────────▼──┐  ┌───────▼──────┐  ┌──▼─────────────┐
│Repository     │  │EventBus     │  │IProductCatalog │
│(Firestore)    │  │(InMemory)   │  │(Product        │
│               │  │             │  │ Domain)        │
└───────────────┘  └─────────────└  └──┬─────────────┘
                                       │
                              ┌────────▼────────┐
                              │CartCheckoutContext│
                              │  (Cart Domain)   │
                              └─────────────────┘
```

## Dependency Rules

1. Components → Hooks → Queries → Services → Repository
2. Services never reference components, hooks, or queries
3. Repository is the only layer that touches Firestore
4. Order depends on `IProductCatalog` (Product domain) and `CartCheckoutContext` (Cart domain)
5. Order never imports Product repositories or Cart internals directly
6. IPaymentGateway is an interface only — Payment domain provides implementation
7. Never read current product/user data after order creation — use snapshots only

## State Machine Diagram

```
DRAFT ──► VALIDATING ──► PENDING_PAYMENT ──► PAID ──► CONFIRMED ──► PROCESSING
  ▲                       │    ▲               │                      │
  └──◄── DRAFT ◄──────────┘    │               │                      │
                               │        PAYMENT_FAILED                │
                               │               │                      │
                               └───────────────┘                      │
                                                                      ▼
                                                              PACKED ──► SHIPPED
                                                                          │
                                                                          ▼
                                                                  OUT_FOR_DELIVERY
                                                                          │
                                                                          ▼
                                                                  DELIVERED ──► REFUND_REQUESTED ◄── CANCELLED
                                                                                    │
                                                                                    ▼
                                                                            REFUNDED (terminal)
                                                                            ARCHIVED (terminal)
```

## Checkout Flow (createFromCheckout)

1. Receive `CartCheckoutContext` + `CreateOrderFromCheckoutInput`
2. **Idempotency check** via `repository.findByIdempotencyKey()`
3. Generate order number via `OrderNumberGenerator` (atomic Firestore counter)
4. Validate products via `IProductCatalog` (stock, availability, price)
5. Create immutable snapshots via `OrderSnapshotService`
6. Calculate totals server-side via `OrderPricingService`
7. Build `Order` with status `DRAFT`, persist via repository
8. Transition to `VALIDATING`, emit `OrderEventType.CREATED`
9. Return order

## Snapshot Design

- `OrderProductSnapshot` — frozen at creation time from CartCheckoutContext
- `OrderCustomerSnapshot` — frozen customer details at order time
- `OrderShippingSnapshot` — frozen shipping method and cost
- `OrderBillingSnapshot` — frozen billing address and GSTIN
- Never read current product prices, stock, or user addresses after order creation
